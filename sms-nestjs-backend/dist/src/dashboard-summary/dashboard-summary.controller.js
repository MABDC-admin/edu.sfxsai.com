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
exports.DashboardSummaryController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../auth/roles.decorator");
const dashboard_summary_service_1 = require("./dashboard-summary.service");
let DashboardSummaryController = class DashboardSummaryController {
    service;
    constructor(service) {
        this.service = service;
    }
    getOverview(academicYearId, req) {
        return this.service.getOverview(academicYearId, req.user?.role);
    }
};
exports.DashboardSummaryController = DashboardSummaryController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Query)('academicYearId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DashboardSummaryController.prototype, "getOverview", null);
exports.DashboardSummaryController = DashboardSummaryController = __decorate([
    (0, common_1.Controller)('dashboard-summary'),
    (0, roles_decorator_1.Roles)('ADMIN', 'REGISTRAR', 'FINANCE', 'PRINCIPAL'),
    __metadata("design:paramtypes", [dashboard_summary_service_1.DashboardSummaryService])
], DashboardSummaryController);
//# sourceMappingURL=dashboard-summary.controller.js.map