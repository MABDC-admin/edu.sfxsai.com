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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_util_1 = require("./storage.util");
let StorageService = class StorageService {
    prisma;
    storageRoot = process.env.STORAGE_DIR || (0, path_1.join)(process.cwd(), 'storage');
    constructor(prisma) {
        this.prisma = prisma;
    }
    async storeFile(input) {
        if (!input.file) {
            throw new common_1.BadRequestException('Upload file is required.');
        }
        if (!(0, storage_util_1.isAllowedStorageMimeType)(input.file.mimetype)) {
            await (0, promises_1.rm)(input.file.path, { force: true });
            throw new common_1.BadRequestException('Only PDF and image uploads are allowed.');
        }
        const ownerType = (0, storage_util_1.normalizeStorageToken)(input.ownerType);
        const category = (0, storage_util_1.normalizeStorageToken)(input.category);
        const ownerId = input.ownerId ? (0, storage_util_1.normalizeStorageToken)(input.ownerId) : 'shared';
        const id = (0, crypto_1.randomUUID)();
        const storedName = (0, storage_util_1.buildStoredFileName)(input.file.originalname, id);
        const relativePath = (0, path_1.join)(ownerType, ownerId, category, storedName).replace(/\\/g, '/');
        const finalPath = (0, path_1.join)(this.storageRoot, relativePath);
        await (0, promises_1.mkdir)((0, path_1.dirname)(finalPath), { recursive: true });
        await (0, promises_1.rename)(input.file.path, finalPath);
        const record = await this.prisma.storedFile.create({
            data: {
                id,
                ownerType,
                ownerId: input.ownerId || null,
                category,
                originalName: input.file.originalname,
                storedName,
                mimeType: input.file.mimetype,
                size: input.file.size,
                relativePath,
                publicUrl: (0, storage_util_1.toPublicStorageUrl)(input.apiOrigin, relativePath),
                uploadedById: input.uploadedById || null,
            },
        });
        await this.applyOwnerSideEffect(record);
        return record;
    }
    listFiles(filters) {
        return this.prisma.storedFile.findMany({
            where: {
                ownerType: filters.ownerType
                    ? (0, storage_util_1.normalizeStorageToken)(filters.ownerType)
                    : undefined,
                ownerId: filters.ownerId || undefined,
                category: filters.category
                    ? (0, storage_util_1.normalizeStorageToken)(filters.category)
                    : undefined,
            },
            orderBy: { uploadedAt: 'desc' },
        });
    }
    async deleteFile(id) {
        const file = await this.prisma.storedFile.findUnique({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException('Stored file not found.');
        }
        await this.prisma.storedFile.delete({ where: { id } });
        await (0, promises_1.rm)((0, path_1.join)(this.storageRoot, file.relativePath), { force: true });
        return { deleted: true };
    }
    async applyOwnerSideEffect(file) {
        if (file.ownerType === 'staff' && file.category === 'avatar' && file.ownerId) {
            await this.prisma.user.update({
                where: { id: file.ownerId },
                data: { avatarUrl: file.publicUrl, avatarFileId: file.id },
            });
        }
        if (file.ownerType === 'student' && file.category === 'photo' && file.ownerId) {
            await this.prisma.student.update({
                where: { id: file.ownerId },
                data: { photoUrl: file.publicUrl, photoFileId: file.id },
            });
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StorageService);
//# sourceMappingURL=storage.service.js.map