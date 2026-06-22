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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({});
    }
    async onModuleInit() {
        await this.withTransientRetry(() => this.$connect());
    }
    async withTransientRetry(operation, maxAttempts = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (!this.isTransientConnectionError(error) || attempt === maxAttempts) {
                    throw error;
                }
                await this.wait(120 * attempt);
            }
        }
        throw lastError;
    }
    isTransientConnectionError(error) {
        const code = error?.code;
        const message = String(error?.message ?? '');
        return (code === 'P1001' ||
            code === 'P1017' ||
            message.includes("Can't reach database server") ||
            message.includes('Server has closed the connection'));
    }
    wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map