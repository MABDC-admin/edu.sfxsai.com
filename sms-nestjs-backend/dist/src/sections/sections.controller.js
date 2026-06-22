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
exports.SectionsController = void 0;
const common_1 = require("@nestjs/common");
const sections_service_1 = require("./sections.service");
const roles_decorator_1 = require("../auth/roles.decorator");
let SectionsController = class SectionsController {
    sectionsService;
    constructor(sectionsService) {
        this.sectionsService = sectionsService;
    }
    create(createDto) {
        return this.sectionsService.create(createDto);
    }
    findAll(ayId) {
        return this.sectionsService.findAll(ayId);
    }
    getTeachers() {
        return this.sectionsService.getTeachers();
    }
    findOne(id) {
        return this.sectionsService.findOne(id);
    }
    update(id, updateDto) {
        return this.sectionsService.update(id, updateDto);
    }
    remove(id) {
        return this.sectionsService.remove(id);
    }
    batchAssign(id, body) {
        return this.sectionsService.batchAssign(id, body.studentIds);
    }
};
exports.SectionsController = SectionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('REGISTRAR'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('REGISTRAR', 'TEACHER'),
    __param(0, (0, common_1.Query)('ayId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('meta/teachers'),
    (0, roles_decorator_1.Roles)('REGISTRAR', 'TEACHER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SectionsController.prototype, "getTeachers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('REGISTRAR', 'TEACHER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('REGISTRAR'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SectionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('REGISTRAR'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, roles_decorator_1.Roles)('REGISTRAR'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SectionsController.prototype, "batchAssign", null);
exports.SectionsController = SectionsController = __decorate([
    (0, roles_decorator_1.Roles)('REGISTRAR', 'TEACHER'),
    (0, common_1.Controller)('sections'),
    __metadata("design:paramtypes", [sections_service_1.SectionsService])
], SectionsController);
//# sourceMappingURL=sections.controller.js.map