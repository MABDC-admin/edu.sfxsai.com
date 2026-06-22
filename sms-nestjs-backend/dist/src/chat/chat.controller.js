"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../auth/roles.decorator");
const chat_service_1 = require("./chat.service");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    getMyConversation(req) {
        return this.chatService.getMyConversation(req.user);
    }
    getStaffContacts(req) {
        return this.chatService.getStaffContacts(req.user);
    }
    getConversationWithRecipient(req, recipientUserId) {
        return this.chatService.getConversationWithRecipient(req.user, recipientUserId);
    }
    getUnreadCount(req) {
        return this.chatService.getUnreadCount(req.user);
    }
    markConversationRead(req, conversationId) {
        return this.chatService.markConversationRead(req.user, conversationId);
    }
    sendTestMessageToAllUsers(req) {
        return this.chatService.sendTestMessageToAllUsers(req.user);
    }
    sendMessage(req, body) {
        return this.chatService.sendMessage(req.user, body);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('my-conversation'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getMyConversation", null);
__decorate([
    (0, common_1.Get)('staff-contacts'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getStaffContacts", null);
__decorate([
    (0, common_1.Get)('conversations/:recipientUserId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('recipientUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getConversationWithRecipient", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)('conversations/:conversationId/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "markConversationRead", null);
__decorate([
    (0, common_1.Post)('test-broadcast'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "sendTestMessageToAllUsers", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "sendMessage", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, roles_decorator_1.Roles)('ADMIN', 'REGISTRAR', 'FINANCE', 'PRINCIPAL', 'TEACHER', 'STUDENT'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map