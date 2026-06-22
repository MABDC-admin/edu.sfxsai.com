import { DrizzleService } from '../drizzle/drizzle.service';
import { ChatGateway } from './chat.gateway';
export interface ChatUser {
    userId: string;
    email: string;
    role: string;
}
export interface SendChatMessageDto {
    body: string;
    recipientUserId?: string;
}
export declare class ChatService {
    private readonly drizzle;
    private readonly chatGateway;
    constructor(drizzle: DrizzleService, chatGateway: ChatGateway);
    getStaffContacts(user: ChatUser): Promise<{
        id: string;
        email: string;
        role: string;
        avatarUrl: string;
        displayName: string;
        assignedGradeLevel: string;
        advisoryClass: string;
        accountStatus: string;
        unreadCount: number;
    }[]>;
    getMyConversation(user: ChatUser): Promise<{
        messages: unknown[];
        id: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        subject: string;
        ownerUserId: string;
        chatMessages?: unknown[] | null;
    } | null | undefined>;
    getUnreadCount(user: ChatUser): Promise<{
        unreadCount: number;
    }>;
    markConversationRead(user: ChatUser, conversationId: string): Promise<{
        updatedCount: number;
    }>;
    sendTestMessageToAllUsers(user: ChatUser): Promise<{
        body: string;
        recipientCount: number;
        messageCount: number;
    }>;
    getConversationWithRecipient(user: ChatUser, recipientUserId: string): Promise<{
        messages: unknown[];
        id: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        subject: string;
        ownerUserId: string;
        chatMessages?: unknown[] | null;
    } | null | undefined>;
    sendMessage(user: ChatUser, dto: SendChatMessageDto): Promise<{
        id: string;
        createdAt: string;
        conversationId: string;
        senderUserId: string | null;
        senderName: string;
        senderRole: string;
        body: string;
        source: string;
        readAt: string | null;
    }>;
    private getVisibleConversationIds;
    private findOpenConversationByOwner;
    private findOpenConversationBySubject;
    private createSupportConversation;
    private createDirectConversation;
    private findOrCreateSupportConversation;
    private countUnreadDirectMessagesFrom;
    private resolveStaffRecipient;
    private isStaffChatRole;
    private directSubject;
    private conversationOwnerUserId;
    private sortedParticipantIds;
    private toPublicConversation;
    private toNumber;
}
