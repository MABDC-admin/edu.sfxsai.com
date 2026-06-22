"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardSummaryModule = void 0;
const common_1 = require("@nestjs/common");
const dashboard_summary_controller_1 = require("./dashboard-summary.controller");
const dashboard_summary_service_1 = require("./dashboard-summary.service");
const drizzle_module_1 = require("../drizzle/drizzle.module");
let DashboardSummaryModule = class DashboardSummaryModule {
};
exports.DashboardSummaryModule = DashboardSummaryModule;
exports.DashboardSummaryModule = DashboardSummaryModule = __decorate([
    (0, common_1.Module)({
        imports: [drizzle_module_1.DrizzleModule],
        controllers: [dashboard_summary_controller_1.DashboardSummaryController],
        providers: [dashboard_summary_service_1.DashboardSummaryService],
    })
], DashboardSummaryModule);
//# sourceMappingURL=dashboard-summary.module.js.map