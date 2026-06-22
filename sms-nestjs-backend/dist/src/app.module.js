"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const roles_guard_1 = require("./auth/roles.guard");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const drizzle_module_1 = require("./drizzle/drizzle.module");
const students_module_1 = require("./students/students.module");
const enrollment_applications_module_1 = require("./enrollment-applications/enrollment-applications.module");
const sections_module_1 = require("./sections/sections.module");
const academic_years_module_1 = require("./academic-years/academic-years.module");
const document_requirements_module_1 = require("./document-requirements/document-requirements.module");
const academic_records_module_1 = require("./academic-records/academic-records.module");
const learner_movements_module_1 = require("./learner-movements/learner-movements.module");
const document_requests_module_1 = require("./document-requests/document-requests.module");
const deped_forms_module_1 = require("./deped-forms/deped-forms.module");
const id_qr_records_module_1 = require("./id-qr-records/id-qr-records.module");
const auth_module_1 = require("./auth/auth.module");
const finance_module_1 = require("./finance/finance.module");
const integration_module_1 = require("./integration/integration.module");
const storage_module_1 = require("./storage/storage.module");
const chat_module_1 = require("./chat/chat.module");
const teacher_module_1 = require("./teacher/teacher.module");
const calendar_events_module_1 = require("./calendar-events/calendar-events.module");
const dashboard_summary_module_1 = require("./dashboard-summary/dashboard-summary.module");
const principal_module_1 = require("./principal/principal.module");
const ai_module_1 = require("./ai/ai.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            drizzle_module_1.DrizzleModule,
            students_module_1.StudentsModule,
            enrollment_applications_module_1.EnrollmentApplicationsModule,
            sections_module_1.SectionsModule,
            academic_years_module_1.AcademicYearsModule,
            document_requirements_module_1.DocumentRequirementsModule,
            academic_records_module_1.AcademicRecordsModule,
            learner_movements_module_1.LearnerMovementsModule,
            document_requests_module_1.DocumentRequestsModule,
            deped_forms_module_1.DepedFormsModule,
            id_qr_records_module_1.IdQrRecordsModule,
            auth_module_1.AuthModule,
            finance_module_1.FinanceModule,
            integration_module_1.IntegrationModule,
            storage_module_1.StorageModule,
            chat_module_1.ChatModule,
            teacher_module_1.TeacherModule,
            calendar_events_module_1.CalendarEventsModule,
            dashboard_summary_module_1.DashboardSummaryModule,
            principal_module_1.PrincipalModule,
            ai_module_1.AiModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map