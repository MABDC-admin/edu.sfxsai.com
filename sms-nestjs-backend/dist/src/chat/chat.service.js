"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema = __importStar(require("../drizzle/schema"));
const chat_gateway_1 = require("./chat.gateway");
let ChatService = class ChatService {
    drizzle;
    chatGateway;
    constructor(drizzle, chatGateway) {
        this.drizzle = drizzle;
        this.chatGateway = chatGateway;
    }
    async getStaffContacts(user) {
        if (this.isStaffChatRole(user.role)) {
            const contacts = await this.drizzle.db.query.user.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.ne)(schema.user.id, user.userId), (0, drizzle_orm_1.inArray)(schema.user.role, ['ADMIN', 'FINANCE', 'REGISTRAR', 'PRINCIPAL', 'TEACHER'])),
                with: { teacherProfiles: true },
                orderBy: [(0, drizzle_orm_1.asc)(schema.user.role), (0, drizzle_orm_1.asc)(schema.user.email)],
            });
            const activeContacts = contacts.filter((contact) => {
                const profile = contact.teacherProfiles?.[0];
                return !profile || profile.accountStatus !== 'Inactive';
            });
            return Promise.all(activeContacts.map(async (contact) => {
                const profile = contact.teacherProfiles?.[0];
                return {
                    id: contact.id,
                    email: contact.email,
                    role: contact.role,
                    avatarUrl: contact.avatarUrl || '',
                    displayName: profile?.name || contact.email,
                    assignedGradeLevel: profile?.assignedGradeLevel || '',
                    advisoryClass: profile?.advisoryClass || '',
                    accountStatus: profile?.accountStatus || 'Active',
                    unreadCount: await this.countUnreadDirectMessagesFrom(user.userId, contact.id),
                };
            }));
        }
        if (user.role === 'STUDENT') {
            const studentUser = await this.drizzle.db.query.user.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.user.id, user.userId),
                with: { student: true },
            });
            if (!studentUser?.student?.section) {
                return [];
            }
            const teacherAssignments = await this.drizzle.db.query.teacherClassAssignment.findMany({
                where: (0, drizzle_orm_1.eq)(schema.teacherClassAssignment.sectionName, studentUser.student.section),
                columns: { teacherUserId: true },
            });
            const teacherUserIds = [...new Set(teacherAssignments.map((record) => record.teacherUserId))];
            if (!teacherUserIds.length) {
                return [];
            }
            const contacts = await this.drizzle.db.query.user.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema.user.id, teacherUserIds), (0, drizzle_orm_1.eq)(schema.user.role, 'TEACHER')),
                with: { teacherProfiles: true },
                orderBy: [(0, drizzle_orm_1.asc)(schema.user.email)],
            });
            const activeContacts = contacts.filter((contact) => {
                const profile = contact.teacherProfiles?.[0];
                return !profile || profile.accountStatus !== 'Inactive';
            });
            return Promise.all(activeContacts.map(async (contact) => {
                const profile = contact.teacherProfiles?.[0];
                return {
                    id: contact.id,
                    email: contact.email,
                    role: contact.role,
                    avatarUrl: contact.avatarUrl || '',
                    displayName: profile?.name || contact.email,
                    assignedGradeLevel: profile?.assignedGradeLevel || '',
                    advisoryClass: profile?.advisoryClass || '',
                    accountStatus: profile?.accountStatus || 'Active',
                    unreadCount: await this.countUnreadDirectMessagesFrom(user.userId, contact.id),
                };
            }));
        }
        return [];
    }
    async getMyConversation(user) {
        const conversation = await this.findOpenConversationByOwner(user.userId);
        if (conversation) {
            return conversation;
        }
        return this.createSupportConversation(user.userId);
    }
    async getUnreadCount(user) {
        const conversationIds = await this.getVisibleConversationIds(user.userId);
        if (!conversationIds.length) {
            return { unreadCount: 0 };
        }
        const [{ count: unreadCount }] = await this.drizzle.db
            .select({ count: (0, drizzle_orm_1.count)(schema.chatMessage.id) })
            .from(schema.chatMessage)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema.chatMessage.conversationId, conversationIds), (0, drizzle_orm_1.isNull)(schema.chatMessage.readAt), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ne)(schema.chatMessage.senderUserId, user.userId), (0, drizzle_orm_1.isNull)(schema.chatMessage.senderUserId))));
        return { unreadCount: this.toNumber(unreadCount) };
    }
    async markConversationRead(user, conversationId) {
        const visibleConversationIds = await this.getVisibleConversationIds(user.userId);
        if (!visibleConversationIds.includes(conversationId)) {
            return { updatedCount: 0 };
        }
        const updated = await this.drizzle.db
            .update(schema.chatMessage)
            .set({ readAt: new Date().toISOString() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.chatMessage.conversationId, conversationId), (0, drizzle_orm_1.isNull)(schema.chatMessage.readAt), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ne)(schema.chatMessage.senderUserId, user.userId), (0, drizzle_orm_1.isNull)(schema.chatMessage.senderUserId))))
            .returning();
        if (updated.length > 0) {
            this.chatGateway.notifyUser(user.userId);
        }
        return { updatedCount: updated.length };
    }
    async sendTestMessageToAllUsers(user) {
        if (user.role !== 'ADMIN') {
            throw new common_1.BadRequestException('Only admin accounts can send test messages to all users.');
        }
        const users = await this.drizzle.db.query.user.findMany({
            columns: {
                id: true,
                email: true,
                role: true,
            },
            orderBy: [(0, drizzle_orm_1.asc)(schema.user.email)],
        });
        let messageCount = 0;
        for (const recipient of users) {
            const conversation = await this.findOrCreateSupportConversation(recipient.id);
            if (!conversation) {
                throw new common_1.BadRequestException('Conversation could not be created.');
            }
            const now = new Date().toISOString();
            await this.drizzle.db.insert(schema.chatMessage).values({
                id: crypto.randomUUID(),
                conversationId: conversation.id,
                senderUserId: null,
                senderName: 'SFXSAI Broadcast',
                senderRole: 'System',
                body: 'test',
                source: 'SYSTEM',
                createdAt: now,
            });
            messageCount += 1;
        }
        return { body: 'test', recipientCount: users.length, messageCount };
    }
    async getConversationWithRecipient(user, recipientUserId) {
        const recipient = await this.resolveStaffRecipient(user, recipientUserId);
        const subject = this.directSubject(user.userId, recipient.id);
        const conversation = await this.findOpenConversationBySubject(subject);
        if (conversation) {
            return conversation;
        }
        return this.createDirectConversation(subject, user.userId, recipient.id);
    }
    async sendMessage(user, dto) {
        const body = dto.body?.trim();
        if (!body) {
            throw new common_1.BadRequestException('Message body is required.');
        }
        const conversation = dto.recipientUserId
            ? await this.getConversationWithRecipient(user, dto.recipientUserId)
            : await this.getMyConversation(user);
        if (!conversation) {
            throw new common_1.BadRequestException('Conversation could not be created.');
        }
        const now = new Date().toISOString();
        const [message] = await this.drizzle.db
            .insert(schema.chatMessage)
            .values({
            id: crypto.randomUUID(),
            conversationId: conversation.id,
            senderUserId: user.userId,
            senderName: user.email,
            senderRole: user.role,
            body,
            source: 'USER',
            createdAt: now,
        })
            .returning();
        await this.drizzle.db
            .update(schema.chatConversation)
            .set({ status: 'OPEN', updatedAt: new Date().toISOString() })
            .where((0, drizzle_orm_1.eq)(schema.chatConversation.id, conversation.id));
        this.chatGateway.notifyUser(user.userId);
        let otherParticipantId;
        if (conversation.subject.startsWith('DIRECT:')) {
            const parts = conversation.subject.replace('DIRECT:', '').split(':');
            otherParticipantId = parts.find((id) => id !== user.userId);
        }
        if (otherParticipantId) {
            this.chatGateway.notifyUser(otherParticipantId);
        }
        else if (dto.recipientUserId) {
            this.chatGateway.notifyUser(dto.recipientUserId);
        }
        else {
            this.chatGateway.notifyStaff();
        }
        return message;
    }
    async getVisibleConversationIds(userId) {
        const rows = await this.drizzle.db
            .select({ id: schema.chatConversation.id })
            .from(schema.chatConversation)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.chatConversation.status, 'OPEN'), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema.chatConversation.ownerUserId, userId), (0, drizzle_orm_1.like)(schema.chatConversation.subject, `%${userId}%`))));
        return rows.map((row) => row.id);
    }
    async findOpenConversationByOwner(ownerUserId) {
        const conversation = await this.drizzle.db.query.chatConversation.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.chatConversation.ownerUserId, ownerUserId), (0, drizzle_orm_1.eq)(schema.chatConversation.status, 'OPEN')),
            with: {
                chatMessages: {
                    orderBy: [(0, drizzle_orm_1.asc)(schema.chatMessage.createdAt)],
                    limit: 80,
                },
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema.chatConversation.updatedAt)],
        });
        return this.toPublicConversation(conversation);
    }
    async findOpenConversationBySubject(subject) {
        const conversation = await this.drizzle.db.query.chatConversation.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.chatConversation.subject, subject), (0, drizzle_orm_1.eq)(schema.chatConversation.status, 'OPEN')),
            with: {
                chatMessages: {
                    orderBy: [(0, drizzle_orm_1.asc)(schema.chatMessage.createdAt)],
                    limit: 80,
                },
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema.chatConversation.updatedAt)],
        });
        return this.toPublicConversation(conversation);
    }
    async createSupportConversation(ownerUserId) {
        const now = new Date().toISOString();
        const [created] = await this.drizzle.db
            .insert(schema.chatConversation)
            .values({
            id: crypto.randomUUID(),
            ownerUserId,
            subject: 'SFXSAI Support Chat',
            status: 'OPEN',
            createdAt: now,
            updatedAt: now,
        })
            .returning();
        return this.toPublicConversation({ ...created, chatMessages: [] });
    }
    async createDirectConversation(subject, leftUserId, rightUserId) {
        const now = new Date().toISOString();
        const ownerUserId = this.conversationOwnerUserId(leftUserId, rightUserId);
        const [created] = await this.drizzle.db
            .insert(schema.chatConversation)
            .values({
            id: crypto.randomUUID(),
            ownerUserId,
            subject,
            status: 'OPEN',
            createdAt: now,
            updatedAt: now,
        })
            .returning();
        return this.toPublicConversation({ ...created, chatMessages: [] });
    }
    async findOrCreateSupportConversation(ownerUserId) {
        const conversation = await this.findOpenConversationByOwner(ownerUserId);
        if (conversation) {
            return conversation;
        }
        return this.createSupportConversation(ownerUserId);
    }
    async countUnreadDirectMessagesFrom(userId, senderUserId) {
        const subject = this.directSubject(userId, senderUserId);
        const rows = await this.drizzle.db
            .select({ id: schema.chatConversation.id })
            .from(schema.chatConversation)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.chatConversation.subject, subject), (0, drizzle_orm_1.eq)(schema.chatConversation.status, 'OPEN')));
        if (!rows.length) {
            return 0;
        }
        const [{ count: unreadCount }] = await this.drizzle.db
            .select({ count: (0, drizzle_orm_1.count)(schema.chatMessage.id) })
            .from(schema.chatMessage)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.chatMessage.senderUserId, senderUserId), (0, drizzle_orm_1.isNull)(schema.chatMessage.readAt), (0, drizzle_orm_1.inArray)(schema.chatMessage.conversationId, rows.map((row) => row.id))));
        return this.toNumber(unreadCount);
    }
    async resolveStaffRecipient(user, recipientUserId) {
        if (!recipientUserId || recipientUserId === user.userId) {
            throw new common_1.BadRequestException('Select another account to chat with.');
        }
        const recipient = await this.drizzle.db.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.id, recipientUserId),
            with: { teacherProfiles: true },
        });
        if (!recipient) {
            throw new common_1.BadRequestException('Recipient not found.');
        }
        if (this.isStaffChatRole(user.role)) {
        }
        else if (user.role === 'STUDENT') {
            const studentUser = await this.drizzle.db.query.user.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.user.id, user.userId),
                with: { student: true },
            });
            if (!studentUser?.student?.section) {
                throw new common_1.BadRequestException('You are not assigned to any section, so you cannot message teachers.');
            }
            const assignments = await this.drizzle.db.query.teacherClassAssignment.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherClassAssignment.sectionName, studentUser.student.section), (0, drizzle_orm_1.eq)(schema.teacherClassAssignment.teacherUserId, recipientUserId)),
            });
            if (!assignments.length) {
                throw new common_1.BadRequestException('You are only allowed to message your assigned teachers.');
            }
        }
        else {
            throw new common_1.BadRequestException('Your role is not allowed to use the chat system.');
        }
        const profile = recipient.teacherProfiles?.[0];
        if (recipient.role === 'TEACHER' && profile?.accountStatus === 'Inactive') {
            throw new common_1.BadRequestException('Selected teacher account is inactive.');
        }
        return recipient;
    }
    isStaffChatRole(role) {
        return ['ADMIN', 'FINANCE', 'REGISTRAR', 'PRINCIPAL', 'TEACHER'].includes(role);
    }
    directSubject(leftUserId, rightUserId) {
        return `DIRECT:${this.sortedParticipantIds(leftUserId, rightUserId).join(':')}`;
    }
    conversationOwnerUserId(leftUserId, rightUserId) {
        return this.sortedParticipantIds(leftUserId, rightUserId)[0];
    }
    sortedParticipantIds(leftUserId, rightUserId) {
        return [leftUserId, rightUserId].sort((left, right) => left.localeCompare(right));
    }
    toPublicConversation(row) {
        if (!row) {
            return row;
        }
        return {
            ...row,
            messages: row.chatMessages ?? [],
        };
    }
    toNumber(input) {
        if (typeof input === 'number')
            return input;
        if (typeof input === 'bigint')
            return Number(input);
        return Number(input || 0);
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_1.ChatGateway))),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService,
        chat_gateway_1.ChatGateway])
], ChatService);
//# sourceMappingURL=chat.service.js.map