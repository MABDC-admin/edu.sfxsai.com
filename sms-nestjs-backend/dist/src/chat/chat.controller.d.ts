import { ChatService } from './chat.service';
import type { SendChatMessageDto } from './chat.service';
interface AuthenticatedRequest {
    user: {
        userId: string;
        email: string;
        role: string;
    };
}
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMyConversation(req: AuthenticatedRequest): Promise<{
        messages: unknown[];
        id: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        subject: string;
        ownerUserId: string;
        chatMessages?: unknown[] | null;
    } | null | undefined>;
    getStaffContacts(req: AuthenticatedRequest): Promise<{
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
    getConversationWithRecipient(req: AuthenticatedRequest, recipientUserId: string): Promise<{
        messages: unknown[];
        id: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        subject: string;
        ownerUserId: string;
        chatMessages?: unknown[] | null;
    } | null | undefined>;
    getUnreadCount(req: AuthenticatedRequest): Promise<{
        unreadCount: number;
    }>;
    markConversationRead(req: AuthenticatedRequest, conversationId: string): Promise<{
        updatedCount: number;
    }>;
    sendTestMessageToAllUsers(req: AuthenticatedRequest): Promise<{
        body: string;
        recipientCount: number;
        messageCount: number;
    }>;
    sendMessage(req: AuthenticatedRequest, body: SendChatMessageDto): Promise<{
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
}
export {};
