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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const jwt_secret_1 = require("../auth/jwt-secret");
let ChatGateway = class ChatGateway {
    jwtService;
    server;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token;
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: (0, jwt_secret_1.getJwtSecret)(),
            });
            const userId = payload.sub;
            if (!userId) {
                client.disconnect();
                return;
            }
            client.join(userId);
            if (['ADMIN', 'FINANCE', 'REGISTRAR', 'PRINCIPAL', 'TEACHER'].includes(payload.role)) {
                client.join('staff');
            }
        }
        catch (e) {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
    }
    notifyUser(userId) {
        if (this.server) {
            this.server.to(userId).emit('chat-updated');
        }
    }
    notifyStaff() {
        if (this.server) {
            this.server.to('staff').emit('chat-updated');
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map