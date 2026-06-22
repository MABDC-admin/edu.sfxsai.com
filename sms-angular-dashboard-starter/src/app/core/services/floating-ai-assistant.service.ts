import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type AiAssistantRole = 'user' | 'assistant';
export type AiAssistantModelSlot = 'default' | 'comparison';

export interface AiAssistantMessage {
  id: string;
  role: AiAssistantRole;
  content: string;
  backendContent?: string;
  modelSlot?: AiAssistantModelSlot;
  modelLabel?: string;
  dualGroupId?: string;
  createdAt: string;
}

export interface AiAssistantSession {
  id: string;
  title: string;
  messages: AiAssistantMessage[];
  createdAt: string;
  updatedAt: string;
}

interface BackendAiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeneratedAiImage {
  url: string;
  alt: string;
}

export interface GenerateAiImageResult {
  model: string;
  prompt: string;
  images: GeneratedAiImage[];
}

@Injectable({
  providedIn: 'root',
})
export class FloatingAiAssistantService {
  private readonly auth = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/ai/chat/stream`;
  private readonly imageGenerationApiUrl = `${environment.apiUrl}/ai/image`;
  private readonly storageKey = 'sfxsai-ai-assistant-sessions-v1';
  private readonly maxHistoryMessages = 6;
  private readonly maxHistoryContentLength = 800;
  private abortControllers: AbortController[] = [];
  private readonly messagesSignal = signal<AiAssistantMessage[]>([]);
  private readonly sessionsSignal = signal<AiAssistantSession[]>([]);
  private readonly activeSessionIdSignal = signal('');
  private readonly isOpenSignal = signal(false);
  private readonly isLoadingSignal = signal(false);
  private readonly activeWorkspaceTabSignal = signal('AI Assistant');
  private readonly errorSignal = signal('');

  readonly messages = this.messagesSignal.asReadonly();
  readonly sessions = this.sessionsSignal.asReadonly();
  readonly activeSessionId = this.activeSessionIdSignal.asReadonly();
  readonly isOpen = this.isOpenSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly activeWorkspaceTab = this.activeWorkspaceTabSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly canSend = computed(() => !this.isLoadingSignal());
  readonly activeSession = computed(() => this.sessionsSignal().find(session => session.id === this.activeSessionIdSignal()) || null);

  readonly workspaceTabs = ['AI Assistant', 'Quipper', 'Phoenix', 'Image Generation'];
  readonly resourceUrls: Record<string, string> = {
    Quipper: '/quipper/',
  };
  readonly phoenixApiBaseUrl = '';

  constructor() {
    this.restoreSessions();
  }

  open(): void {
    this.isOpenSignal.set(true);
  }

  close(): void {
    this.isOpenSignal.set(false);
  }

  toggle(): void {
    this.isOpenSignal.update(value => !value);
  }

  setWorkspaceTab(tab: string): void {
    if (this.workspaceTabs.includes(tab)) {
      this.activeWorkspaceTabSignal.set(tab);
    }
  }

  startNewChat(): void {
    this.stopResponse();
    const session = this.createSession();
    this.sessionsSignal.update(sessions => [session, ...sessions]);
    this.activeSessionIdSignal.set(session.id);
    this.messagesSignal.set(session.messages);
    this.errorSignal.set('');
    this.persistSessions();
  }

  openSession(sessionId: string): void {
    const session = this.sessionsSignal().find(item => item.id === sessionId);
    if (!session) {
      return;
    }
    this.stopResponse();
    this.activeSessionIdSignal.set(session.id);
    this.messagesSignal.set(session.messages);
    this.errorSignal.set('');
  }

  renameSession(sessionId: string, title: string): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    this.sessionsSignal.update(sessions => sessions.map(session => (
      session.id === sessionId ? { ...session, title: trimmed, updatedAt: new Date().toISOString() } : session
    )));
    this.persistSessions();
  }

  deleteSession(sessionId: string): void {
    const remaining = this.sessionsSignal().filter(session => session.id !== sessionId);
    this.sessionsSignal.set(remaining);
    if (this.activeSessionIdSignal() === sessionId) {
      const next = remaining[0] || this.createSession();
      if (!remaining.length) {
        this.sessionsSignal.set([next]);
      }
      this.activeSessionIdSignal.set(next.id);
      this.messagesSignal.set(next.messages);
    }
    this.persistSessions();
  }

  stopResponse(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers = [];
    this.isLoadingSignal.set(false);
  }

  async sendMessage(content: string, options: { backendContent?: string } = {}): Promise<void> {
    const trimmed = content.trim();
    if (!trimmed || this.isLoadingSignal()) {
      return;
    }

    const userMessage = this.createMessage('user', trimmed, options.backendContent);
    const assistantMessage = this.createMessage('assistant', '', undefined, { modelSlot: 'default', modelLabel: 'Default Model' });
    this.messagesSignal.update(messages => [...messages, userMessage, assistantMessage]);
    this.syncActiveSession();
    this.errorSignal.set('');
    this.isLoadingSignal.set(true);

    const controller = new AbortController();
    this.abortControllers = [controller];
    const history = this.prepareMessageHistory(assistantMessage.id);

    try {
      await this.streamAssistantMessage(assistantMessage.id, history, controller, 'default');
    } catch (error) {
      this.handleAssistantStreamError(assistantMessage.id, error);
    } finally {
      this.isLoadingSignal.set(false);
      this.abortControllers = [];
      this.syncActiveSession();
    }
  }

  async sendDualMessage(content: string, options: { backendContent?: string } = {}): Promise<void> {
    const trimmed = content.trim();
    if (!trimmed || this.isLoadingSignal()) {
      return;
    }

    const dualGroupId = this.createId();
    const userMessage = this.createMessage('user', trimmed, options.backendContent);
    const defaultMessage = this.createMessage('assistant', '', undefined, {
      modelSlot: 'default',
      modelLabel: 'Default Model',
      dualGroupId,
    });
    const comparisonMessage = this.createMessage('assistant', '', undefined, {
      modelSlot: 'comparison',
      modelLabel: 'Gemini Flash Lite',
      dualGroupId,
    });

    this.messagesSignal.update(messages => [...messages, userMessage, defaultMessage, comparisonMessage]);
    this.syncActiveSession();
    this.errorSignal.set('');
    this.isLoadingSignal.set(true);

    const defaultController = new AbortController();
    const comparisonController = new AbortController();
    this.abortControllers = [defaultController, comparisonController];
    const history = this.prepareMessageHistory([defaultMessage.id, comparisonMessage.id]);

    await Promise.allSettled([
      this.streamAssistantMessage(defaultMessage.id, history, defaultController, 'default').catch(error => this.handleAssistantStreamError(defaultMessage.id, error)),
      this.streamAssistantMessage(comparisonMessage.id, history, comparisonController, 'comparison').catch(error => this.handleAssistantStreamError(comparisonMessage.id, error)),
    ]);

    this.isLoadingSignal.set(false);
    this.abortControllers = [];
    this.syncActiveSession();
  }
  sendToolCommand(tool: string, studentId: string, studentName: string): Promise<void> {
    const normalizedTool = tool === 'finance.billing' ? 'finance.billing' : 'learner.record';
    const label = normalizedTool === 'finance.billing'
      ? `Assess billing for ${studentName}`
      : `Fetch records for ${studentName}`;
    return this.sendMessage(label, {
      backendContent: `AI_TOOL ${normalizedTool} studentId=${studentId}`,
    });
  }

  regenerateLastResponse(): Promise<void> {
    const lastUserMessage = [...this.messagesSignal()].reverse().find(message => message.role === 'user');
    if (!lastUserMessage || this.isLoadingSignal()) {
      return Promise.resolve();
    }
    return this.sendMessage('Regenerate the previous answer', {
      backendContent: lastUserMessage.backendContent || lastUserMessage.content,
    });
  }

  continueLastResponse(): Promise<void> {
    if (this.isLoadingSignal()) {
      return Promise.resolve();
    }
    return this.sendMessage('Continue the previous response with the same structure and level of detail.');
  }

  async generateImage(prompt: string, options: { aspectRatio?: string; imageSize?: string } = {}): Promise<GenerateAiImageResult> {
    const response = await fetch(this.imageGenerationApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.auth.getToken() || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        aspectRatio: options.aspectRatio || '1:1',
        imageSize: options.imageSize || '1K',
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed with status ${response.status}`);
    }

    return response.json();
  }

  private prepareMessageHistory(excludedMessageIds: string | string[]): BackendAiMessage[] {
    const excluded = Array.isArray(excludedMessageIds) ? excludedMessageIds : [excludedMessageIds];
    return this.messagesSignal()
      .filter(message => message.id !== 'welcome' && !excluded.includes(message.id))
      .slice(-this.maxHistoryMessages)
      .map(message => ({
        role: message.role,
        content: this.truncateHistoryContent(message.backendContent || message.content),
      }));
  }

  private truncateHistoryContent(content: string): string {
    const value = `${content || ''}`.trim();
    if (value.length <= this.maxHistoryContentLength) {
      return value;
    }
    return `${value.slice(0, this.maxHistoryContentLength).trimEnd()}\n\n[Previous message truncated for faster AI response.]`;
  }

  private async streamAssistantMessage(
    assistantMessageId: string,
    history: BackendAiMessage[],
    controller: AbortController,
    modelSlot: AiAssistantModelSlot,
  ): Promise<void> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.auth.getToken() || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: history, modelSlot }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`AI stream failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        this.appendToLastAssistantMessage(assistantMessageId, chunk);
      }
    }

    const completed = this.messagesSignal().find(message => message.id === assistantMessageId);
    if (!completed?.content.trim()) {
      this.appendToLastAssistantMessage(assistantMessageId, 'No response returned.');
    }
  }

  private handleAssistantStreamError(messageId: string, error: unknown): void {
    if (error instanceof DOMException && error.name === 'AbortError') {
      this.appendToLastAssistantMessage(messageId, '\n\n_Response stopped by user._');
      return;
    }
    const fallback = 'AI assistant is temporarily unavailable. Please try again or contact the administrator if this continues.';
    this.errorSignal.set(fallback);
    this.appendToLastAssistantMessage(messageId, fallback);
  }

  private appendToLastAssistantMessage(messageId: string, chunk: string): void {
    this.messagesSignal.update(messages => messages.map(message => (
      message.id === messageId ? { ...message, content: `${message.content}${chunk}` } : message
    )));
  }

  downloadResponsePdf(message: AiAssistantMessage): void {
    const printable = window.open('', '_blank');
    if (!printable) {
      return;
    }

    printable.document.write(`<!doctype html><html><head><title>AI Response</title><style>body{font-family:Arial,sans-serif;padding:32px;line-height:1.55;color:#111827;}pre{white-space:pre-wrap;font-family:inherit;}h1{font-size:20px;}</style></head><body><h1>SFXSAI AI Response</h1><pre>${this.escapeHtml(message.content)}</pre><script>window.onload=()=>{window.focus();window.print();};</script></body></html>`);
    printable.document.close();
  }

  private createMessage(
    role: AiAssistantRole,
    content: string,
    backendContent?: string,
    metadata: Partial<Pick<AiAssistantMessage, 'modelSlot' | 'modelLabel' | 'dualGroupId'>> = {},
  ): AiAssistantMessage {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role,
      content,
      backendContent,
      ...metadata,
      createdAt: new Date().toISOString(),
    };
  }

  private createSession(): AiAssistantSession {
    const now = new Date().toISOString();
    return {
      id: this.createId(),
      title: 'New chat',
      messages: [this.createWelcomeMessage()],
      createdAt: now,
      updatedAt: now,
    };
  }

  private createWelcomeMessage(): AiAssistantMessage {
    return {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Hello! I am your SFXSAI AI Assistant.**\n\nI'm here to help you streamline your daily tasks and enhance school operations. Feel free to ask me for assistance with:\n\n📚 **Lesson Planning:** Create engaging lesson plans and activities.\n📋 **Registrar Workflows:** Manage student records and academic processes.\n💰 **Finance Explanations:** Understand financial reports and tuition structures.\n📊 **Reports & Letters:** Draft professional communications and data summaries.\n🏫 **School Operations:** Get guidance on daily administrative tasks.\n\n*How can I assist you today?*`,
      createdAt: new Date().toISOString(),
    };
  }

  private createId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private syncActiveSession(): void {
    const sessionId = this.activeSessionIdSignal();
    if (!sessionId) {
      return;
    }
    const messages = this.messagesSignal();
    this.sessionsSignal.update(sessions => sessions.map(session => {
      if (session.id !== sessionId) {
        return session;
      }
      return {
        ...session,
        title: this.createSessionTitle(session.title, messages),
        messages,
        updatedAt: new Date().toISOString(),
      };
    }));
    this.persistSessions();
  }

  private createSessionTitle(currentTitle: string, messages: AiAssistantMessage[]): string {
    if (currentTitle && currentTitle !== 'New chat') {
      return currentTitle;
    }
    const firstUserMessage = messages.find(message => message.role === 'user')?.content.trim();
    return firstUserMessage ? firstUserMessage.slice(0, 48) : 'New chat';
  }

  private restoreSessions(): void {
    const sessions = this.readStoredSessions();
    const restored = sessions.length ? sessions : [this.createSession()];
    this.sessionsSignal.set(restored);
    this.activeSessionIdSignal.set(restored[0].id);
    this.messagesSignal.set(restored[0].messages);
    this.persistSessions();
  }

  private readStoredSessions(): AiAssistantSession[] {
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(session => session?.id && Array.isArray(session?.messages)).slice(0, 40);
    } catch {
      return [];
    }
  }

  private persistSessions(): void {
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.sessionsSignal().slice(0, 40)));
    } catch {
      this.loggerNoop();
    }
  }

  private loggerNoop(): void {}

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}


