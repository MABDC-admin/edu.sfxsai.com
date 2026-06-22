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
exports.IntegrationController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../auth/roles.decorator");
const integration_service_1 = require("./integration.service");
let IntegrationController = class IntegrationController {
    integrationService;
    constructor(integrationService) {
        this.integrationService = integrationService;
    }
    userId(req) {
        return req.user?.sub ?? req.user?.userId ?? req.user?.id;
    }
    getStudentFinanceProfile(studentId, academicYearId, req) {
        return this.integrationService.getStudentFinanceProfile(studentId, academicYearId, this.userId(req));
    }
    getFinanceClearance(academicYearId, req) {
        return this.integrationService.getFinanceClearance(academicYearId, this.userId(req));
    }
    syncStudentFinanceStatus(studentId, academicYearId, req) {
        return this.integrationService.syncStudentFinanceStatus(studentId, academicYearId, this.userId(req));
    }
    getDataMap() {
        return this.integrationService.getDataMap();
    }
};
exports.IntegrationController = IntegrationController;
__decorate([
    (0, common_1.Get)('students/:studentId/finance-profile'),
    (0, roles_decorator_1.Roles)('REGISTRAR', 'FINANCE'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "getStudentFinanceProfile", null);
__decorate([
    (0, common_1.Get)('finance/clearance'),
    (0, roles_decorator_1.Roles)('REGISTRAR', 'FINANCE'),
    __param(0, (0, common_1.Query)('academicYearId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "getFinanceClearance", null);
__decorate([
    (0, common_1.Post)('finance/sync-student/:studentId'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "syncStudentFinanceStatus", null);
__decorate([
    (0, common_1.Get)('data-map'),
    (0, roles_decorator_1.Roles)('REGISTRAR', 'FINANCE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IntegrationController.prototype, "getDataMap", null);
exports.IntegrationController = IntegrationController = __decorate([
    (0, common_1.Controller)('integration'),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService])
], IntegrationController);
//# sourceMappingURL=integration.controller.js.map