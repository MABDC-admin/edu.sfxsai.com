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
exports.EnrollmentApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const enrollment_applications_service_1 = require("./enrollment-applications.service");
const roles_decorator_1 = require("../auth/roles.decorator");
let EnrollmentApplicationsController = class EnrollmentApplicationsController {
    enrollmentApplicationsService;
    constructor(enrollmentApplicationsService) {
        this.enrollmentApplicationsService = enrollmentApplicationsService;
    }
    create(createDto) {
        return this.enrollmentApplicationsService.create(createDto);
    }
    findAll(ayId) {
        return this.enrollmentApplicationsService.findAll(ayId);
    }
    findOne(id) {
        return this.enrollmentApplicationsService.findOne(id);
    }
    update(id, updateDto) {
        return this.enrollmentApplicationsService.update(id, updateDto);
    }
    remove(id) {
        return this.enrollmentApplicationsService.remove(id);
    }
};
exports.EnrollmentApplicationsController = EnrollmentApplicationsController;
__decorate([
    (0, roles_decorator_1.Roles)('REGISTRAR'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnrollmentApplicationsController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('REGISTRAR', 'PRINCIPAL'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('ayId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnrollmentApplicationsController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('REGISTRAR', 'PRINCIPAL'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnrollmentApplicationsController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('REGISTRAR'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentApplicationsController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('REGISTRAR', 'ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnrollmentApplicationsController.prototype, "remove", null);
exports.EnrollmentApplicationsController = EnrollmentApplicationsController = __decorate([
    (0, common_1.Controller)('enrollment-applications'),
    __metadata("design:paramtypes", [enrollment_applications_service_1.EnrollmentApplicationsService])
], EnrollmentApplicationsController);
//# sourceMappingURL=enrollment-applications.controller.js.map