import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal, DestroyRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { io, Socket } from 'socket.io-client';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BackendBroadcastResult,
  BackendChatConversation,
  BackendUnreadCount,
  FloatingChatMessage,
  FloatingChatStaffContact,
  buildChatMessage,
  mapBackendConversationToFloatingMessages,
  normalizeChatMessages,
  resolveSocketEndpoint,
} from './floating-chat.util';

@Injectable({
  providedIn: 'root',
})
export class FloatingChatService {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageKey = 'sfxsai-floating-chat-messages-v1';
  private readonly channelName = 'sfxsai-floating-chat';
  private readonly apiUrl = `${environment.apiUrl}/chat`;
  private readonly channel = this.createBroadcastChannel();
  private readonly messagesSignal = signal<FloatingChatMessage[]>(this.loadMessages());
  private readonly contactsSignal = signal<FloatingChatStaffContact[]>([]);
  private readonly selectedRecipientIdSignal = signal('');
  private readonly activeConversationIdSignal = signal('');
  private readonly unreadCountSignal = signal(0);
  private readonly isOpenSignal = signal(false);
  private socket: Socket | null = null;
  private readonly readConversationIds = new Set<string>();
  private readonly readRequestsInFlight = new Set<string>();
  private shouldMarkReadAfterConversationLoad = false;

  readonly messages = this.messagesSignal.asReadonly();
  readonly contacts = this.contactsSignal.asReadonly();
  readonly selectedRecipientId = this.selectedRecipientIdSignal.asReadonly();
  readonly activeConversationId = this.activeConversationIdSignal.asReadonly();
  readonly selectedContact = computed(() => {
    const selectedId = this.selectedRecipientIdSignal();
    return this.contactsSignal().find(contact => contact.id === selectedId) ?? null;
  });
  readonly chatTitle = computed(() => this.selectedContact()?.displayName ?? 'Live Chat');
  readonly chatSubtitle = computed(() => {
    const contact = this.selectedContact();
    if (!contact) {
      return 'Select a receiver';
    }

    return [contact.role, contact.assignedGradeLevel || contact.advisoryClass].filter(Boolean).join(' • ');
  });
  readonly isOpen = this.isOpenSignal.asReadonly();
  readonly unreadCount = this.unreadCountSignal.asReadonly();
  readonly hasUnread = computed(() => this.unreadCount() > 0);
  readonly unreadSenderName = computed(() => this.firstUnreadContact(this.contactsSignal())?.displayName ?? '');
  readonly canBroadcastTest = computed(() => this.currentUser().role === 'ADMIN');

  constructor() {
    this.channel?.addEventListener('message', event => {
      if (event.data?.type === 'messages-updated') {
        this.messagesSignal.set(this.loadMessages());
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', event => {
        if (event.key === this.storageKey) {
          this.messagesSignal.set(this.loadMessages());
        }
      });
    }

    if (this.messagesSignal().length === 0) {
      this.replaceMessages([
        buildChatMessage({
          body: 'Hi. This is SFXSAI live chat. Select a receiver and send a message.',
          senderName: 'SFXSAI Support',
          senderRole: 'Online',
          source: 'system',
        }),
      ]);
    }

    this.loadStaffContacts();
    this.loadRemoteConversation();
    this.refreshUnreadCount();
    
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(auth => {
      if (auth?.token) {
        if (!this.socket) {
          this.connectSocket();
        }
      } else {
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
      }
    });
  }

  toggle(): void {
    if (this.isOpenSignal()) {
      this.close();
      return;
    }

    this.open();
  }

  open(): void {
    this.readConversationIds.clear();
    this.readRequestsInFlight.clear();
    this.focusUnreadConversation();
    this.isOpenSignal.set(true);
    this.queueCurrentConversationRead();
  }

  close(): void {
    this.isOpenSignal.set(false);
    this.shouldMarkReadAfterConversationLoad = false;
  }

  selectRecipient(recipientId: string): void {
    if (recipientId === this.selectedRecipientIdSignal()) {
      return;
    }

    this.selectRecipientFromContacts(recipientId);
    if (this.isOpenSignal()) {
      this.queueCurrentConversationRead();
    }
  }

  sendMessage(body: string): void {
    const user = this.currentUser();
    const message = buildChatMessage({
      body,
      senderName: user.name,
      senderRole: user.role,
      source: 'local',
    });

    this.replaceMessages([...this.messagesSignal(), message]);
    const recipientUserId = this.selectedRecipientIdSignal();
    const payload = recipientUserId ? { body, recipientUserId } : { body };

    this.http.post(`${this.apiUrl}/messages`, payload).subscribe({
      next: () => {
        this.loadRemoteConversation();
        this.refreshUnreadCount();
      },
      error: () => {
        const notice = buildChatMessage({
          body: 'Message saved locally while the chat server is unavailable.',
          senderName: 'SFXSAI Support',
          senderRole: 'Offline',
          source: 'system',
        });
        this.replaceMessages([...this.messagesSignal(), notice]);
      },
    });
  }

  sendTestMessageToAllUsers() {
    return this.http.post<BackendBroadcastResult>(`${this.apiUrl}/test-broadcast`, {}).pipe();
  }

  refreshUnreadCount(): void {
    if (!this.authService.getToken()) {
      this.unreadCountSignal.set(0);
      return;
    }

    this.http.get<BackendUnreadCount>(`${this.apiUrl}/unread-count`).subscribe({
      next: result => {
        this.unreadCountSignal.set(result.unreadCount ?? 0);
        this.loadStaffContacts();
      },
      error: () => undefined,
    });
  }

  private replaceMessages(messages: FloatingChatMessage[]): void {
    const normalized = normalizeChatMessages(messages).slice(-80);
    this.messagesSignal.set(normalized);
    this.persistMessages(normalized);
    this.channel?.postMessage({ type: 'messages-updated' });
  }

  private markCurrentConversationRead(): void {
    const conversationId = this.activeConversationIdSignal();
    if (!conversationId || !this.authService.getToken()) {
      return;
    }

    if (this.readConversationIds.has(conversationId) || this.readRequestsInFlight.has(conversationId)) {
      return;
    }

    this.readRequestsInFlight.add(conversationId);

    this.http.patch(`${this.apiUrl}/conversations/${conversationId}/read`, {}).subscribe({
      next: () => {
        this.readConversationIds.add(conversationId);
        this.readRequestsInFlight.delete(conversationId);
        this.refreshUnreadCount();
        this.loadStaffContacts();
      },
      error: () => this.readRequestsInFlight.delete(conversationId),
    });
  }

  private queueCurrentConversationRead(): void {
    if (this.activeConversationIdSignal()) {
      window.setTimeout(() => this.markCurrentConversationRead(), 0);
      return;
    }

    this.shouldMarkReadAfterConversationLoad = true;
  }

  private loadStaffContacts(): void {
    if (!this.authService.getToken()) {
      return;
    }

    this.http.get<FloatingChatStaffContact[]>(`${this.apiUrl}/staff-contacts`).subscribe({
      next: contacts => {
        this.contactsSignal.set(contacts);
        if (!this.selectedRecipientIdSignal() && contacts.length > 0) {
          this.selectRecipientFromContacts(this.firstUnreadContact(contacts)?.id ?? contacts[0].id);
          return;
        }
        if (this.isOpenSignal() && this.unreadCountSignal() > 0) {
          this.focusUnreadConversation(contacts);
        }
      },
      error: () => this.contactsSignal.set([]),
    });
  }

  private focusUnreadConversation(contacts = this.contactsSignal()): void {
    const unreadContact = this.firstUnreadContact(contacts);
    if (!unreadContact || unreadContact.id === this.selectedRecipientIdSignal()) {
      return;
    }

    this.selectRecipientFromContacts(unreadContact.id);
  }

  private firstUnreadContact(contacts: FloatingChatStaffContact[]): FloatingChatStaffContact | null {
    return contacts.find(contact => Number(contact.unreadCount || 0) > 0) ?? null;
  }

  private selectRecipientFromContacts(recipientId: string): void {
    this.selectedRecipientIdSignal.set(recipientId);
    this.messagesSignal.set([]);
    this.activeConversationIdSignal.set('');
    this.loadRemoteConversation();
  }

  private loadMessages(): FloatingChatMessage[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? normalizeChatMessages(JSON.parse(stored) as FloatingChatMessage[]) : [];
    } catch {
      return [];
    }
  }

  private persistMessages(messages: FloatingChatMessage[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(messages));
  }

  private createBroadcastChannel(): BroadcastChannel | null {
    if (typeof BroadcastChannel === 'undefined') {
      return null;
    }

    return new BroadcastChannel(this.channelName);
  }

  private loadRemoteConversation(): void {
    if (!this.authService.getToken()) {
      return;
    }

    const recipientId = this.selectedRecipientIdSignal();
    const url = recipientId
      ? `${this.apiUrl}/conversations/${recipientId}`
      : `${this.apiUrl}/my-conversation`;

    this.http.get<BackendChatConversation>(url).subscribe({
      next: conversation => {
        this.activeConversationIdSignal.set(conversation.id);
        const user = this.currentUser();
        const mapped = mapBackendConversationToFloatingMessages(conversation, user.email);
        if (mapped.length > 0) {
          this.replaceMessages(mapped);
        }
        if (this.shouldMarkReadAfterConversationLoad) {
          this.shouldMarkReadAfterConversationLoad = false;
          window.setTimeout(() => this.markCurrentConversationRead(), 0);
        }
        if (!this.isOpenSignal()) {
          this.refreshUnreadCount();
        }
      },
      error: () => undefined,
    });
  }

  private connectSocket(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    const socketEndpoint = resolveSocketEndpoint(environment.apiUrl, window.location.origin);

    this.socket = io(socketEndpoint.url, {
      path: socketEndpoint.path,
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('chat-updated', () => {
      this.loadRemoteConversation();
      this.refreshUnreadCount();
      this.loadStaffContacts();
    });
  }

  private currentUser(): { name: string; email: string; role: string } {
    const rawUser = localStorage.getItem('user');

    if (rawUser) {
      try {
        const user = JSON.parse(rawUser) as { email?: string; name?: string; firstName?: string; lastName?: string; role?: string };
        const name = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ');
        return {
          name: name || user.email || 'SFXSAI User',
          email: user.email || '',
          role: user.role || 'User',
        };
      } catch {
        return { name: 'SFXSAI User', email: '', role: this.authService.getUserRole() || 'User' };
      }
    }

    return { name: 'SFXSAI User', email: '', role: this.authService.getUserRole() || 'User' };
  }
}
