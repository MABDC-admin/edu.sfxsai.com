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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const roles_decorator_1 = require("../auth/roles.decorator");
const storage_service_1 = require("./storage.service");
const tempUploadDir = process.env.STORAGE_TMP_DIR || (0, path_1.join)(process.cwd(), 'storage', '.tmp');
function apiOrigin(req) {
    return `${req.protocol}://${req.get('host')}`;
}
let StorageController = class StorageController {
    storageService;
    constructor(storageService) {
        this.storageService = storageService;
    }
    uploadGeneric(file, body, req) {
        return this.storageService.storeFile({
            file,
            ownerType: body.ownerType,
            ownerId: body.ownerId,
            category: body.category || 'other',
            uploadedById: req.user?.userId,
            apiOrigin: apiOrigin(req),
        });
    }
    uploadStudentDocument(studentId, file, req) {
        return this.storageService.storeFile({
            file,
            ownerType: 'student',
            ownerId: studentId,
            category: 'document',
            uploadedById: req.user?.userId,
            apiOrigin: apiOrigin(req),
        });
    }
    uploadStudentPhoto(studentId, file, req) {
        return this.storageService.storeFile({
            file,
            ownerType: 'student',
            ownerId: studentId,
            category: 'photo',
            uploadedById: req.user?.userId,
            apiOrigin: apiOrigin(req),
        });
    }
    uploadStaffAvatar(file, req) {
        return this.storageService.storeFile({
            file,
            ownerType: 'staff',
            ownerId: req.user?.userId,
            category: 'avatar',
            uploadedById: req.user?.userId,
            apiOrigin: apiOrigin(req),
        });
    }
    listFiles(ownerType, ownerId, category) {
        return this.storageService.listFiles({ ownerType, ownerId, category });
    }
    deleteFile(id) {
        return this.storageService.deleteFile(id);
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                (0, fs_1.mkdirSync)(tempUploadDir, { recursive: true });
                cb(null, tempUploadDir);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "uploadGeneric", null);
__decorate([
    (0, common_1.Post)('students/:studentId/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                (0, fs_1.mkdirSync)(tempUploadDir, { recursive: true });
                cb(null, tempUploadDir);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "uploadStudentDocument", null);
__decorate([
    (0, common_1.Post)('students/:studentId/photo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 5 * 1024 * 1024 },
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                (0, fs_1.mkdirSync)(tempUploadDir, { recursive: true });
                cb(null, tempUploadDir);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "uploadStudentPhoto", null);
__decorate([
    (0, common_1.Post)('staff/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 5 * 1024 * 1024 },
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                (0, fs_1.mkdirSync)(tempUploadDir, { recursive: true });
                cb(null, tempUploadDir);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "uploadStaffAvatar", null);
__decorate([
    (0, common_1.Get)('files'),
    __param(0, (0, common_1.Query)('ownerType')),
    __param(1, (0, common_1.Query)('ownerId')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Delete)('files/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "deleteFile", null);
exports.StorageController = StorageController = __decorate([
    (0, roles_decorator_1.Roles)('REGISTRAR', 'PRINCIPAL', 'FINANCE', 'TEACHER', 'STUDENT', 'ADMIN'),
    (0, common_1.Controller)('storage'),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map