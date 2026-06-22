"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardSummaryService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema = __importStar(require("../drizzle/schema"));
let DashboardSummaryService = class DashboardSummaryService {
    drizzle;
    constructor(drizzle) {
        this.drizzle = drizzle;
    }
    isCalendarEventVisibleToAcademicYear(event, academicYearId) {
        return !event.academicYearId || event.academicYearId === academicYearId;
    }
    async getOverview(academicYearId, role) {
        if (!academicYearId) {
            throw new common_1.BadRequestException('academicYearId is required.');
        }
        const includeFinance = role !== 'REGISTRAR';
        const includeRegistrarOperations = role === 'REGISTRAR';
        const academicYear = await this.drizzle.db.query.academicYear.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.academicYear.id, academicYearId),
        });
        if (!academicYear) {
            throw new common_1.BadRequestException('Academic year was not found.');
        }
        const [students, sections, documentRequests, calendarEvents, assessments, payments,] = await Promise.all([
            this.drizzle.db.query.student.findMany({
                where: (0, drizzle_orm_1.eq)(schema.student.academicYearId, academicYearId),
            }),
            includeRegistrarOperations
                ? this.drizzle.db.query.section.findMany({
                    where: (0, drizzle_orm_1.eq)(schema.section.academicYearId, academicYearId),
                })
                : Promise.resolve([]),
            includeRegistrarOperations
                ? this.drizzle.db.query.documentRequest.findMany({
                    where: (0, drizzle_orm_1.eq)(schema.documentRequest.academicYearId, academicYearId),
                })
                : Promise.resolve([]),
            this.drizzle.db.query.calendarEvent.findMany({
                orderBy: [(0, drizzle_orm_1.asc)(schema.calendarEvent.eventDate)],
            }),
            includeFinance
                ? this.drizzle.db.query.studentAssessment.findMany({
                    where: (0, drizzle_orm_1.eq)(schema.studentAssessment.academicYearId, academicYearId),
                    with: {
                        student: true,
                        studentAssessmentLineItems: {
                            with: { feeType: true },
                        },
                        payments: {
                            orderBy: [(0, drizzle_orm_1.desc)(schema.payment.paymentDate)],
                        },
                    },
                    orderBy: [(0, drizzle_orm_1.desc)(schema.studentAssessment.updatedAt)],
                })
                : Promise.resolve([]),
            includeFinance
                ? this.drizzle.db.query.payment.findMany({
                    where: (0, drizzle_orm_1.eq)(schema.payment.academicYearId, academicYearId),
                    with: {
                        student: true,
                        studentAssessment: true,
                    },
                    orderBy: [(0, drizzle_orm_1.desc)(schema.payment.paymentDate)],
                })
                : Promise.resolve([]),
        ]);
        return {
            academicYear,
            students,
            sections,
            documentRequests,
            calendarEvents: calendarEvents.filter(event => this.isCalendarEventVisibleToAcademicYear(event, academicYearId)),
            assessments,
            payments,
        };
    }
};
exports.DashboardSummaryService = DashboardSummaryService;
exports.DashboardSummaryService = DashboardSummaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService])
], DashboardSummaryService);
//# sourceMappingURL=dashboard-summary.service.js.map