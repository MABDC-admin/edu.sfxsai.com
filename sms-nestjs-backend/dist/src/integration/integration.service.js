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
exports.IntegrationService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema = __importStar(require("../drizzle/schema"));
let IntegrationService = class IntegrationService {
    drizzle;
    constructor(drizzle) {
        this.drizzle = drizzle;
    }
    requireAcademicYear(academicYearId) {
        if (!academicYearId) {
            throw new common_1.BadRequestException('academicYearId is required.');
        }
        return academicYearId;
    }
    log(input) {
        return this.drizzle.db.insert(schema.integrationLog).values({
            id: crypto.randomUUID(),
            action: input.action,
            sourceModule: input.sourceModule,
            targetModule: input.targetModule,
            studentId: input.studentId ?? null,
            academicYearId: input.academicYearId ?? null,
            status: input.status,
            message: input.message ?? null,
            performedById: input.performedById ?? null,
        });
    }
    async getStudentFinanceProfile(studentId, academicYearId, performedById) {
        this.requireAcademicYear(academicYearId);
        const action = 'READ_STUDENT_FINANCE_PROFILE';
        const student = await this.drizzle.db.query.student.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.student.id, studentId),
            columns: {
                id: true,
                studentNo: true,
                lrn: true,
                firstName: true,
                middleName: true,
                lastName: true,
                gradeLevel: true,
                section: true,
                adviser: true,
                enrollmentStatus: true,
                documentStatus: true,
                financeStatus: true,
                academicYearId: true,
            },
        });
        if (!student) {
            await this.log({
                action,
                sourceModule: 'REGISTRAR',
                targetModule: 'FINANCE',
                studentId,
                academicYearId,
                status: 'ERROR',
                message: 'Student was not found.',
                performedById,
            });
            throw new common_1.NotFoundException('Student was not found.');
        }
        const [academicYear, academicRecords, assessment] = await Promise.all([
            this.drizzle.db.query.academicYear.findFirst({
                where: (0, drizzle_orm_1.eq)(schema.academicYear.id, academicYearId),
            }),
            this.drizzle.db.query.academicRecord.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.academicRecord.academicYearId, academicYearId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema.academicRecord.studentName, `%${student.lastName}%`), (0, drizzle_orm_1.eq)(schema.academicRecord.studentId, student.id))),
                orderBy: [(0, drizzle_orm_1.desc)(schema.academicRecord.schoolYear)],
            }),
            this.drizzle.db.query.studentAssessment.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.studentAssessment.studentId, studentId), (0, drizzle_orm_1.eq)(schema.studentAssessment.academicYearId, academicYearId)),
                with: {
                    studentAssessmentLineItems: {
                        with: {
                            feeType: true,
                        },
                    },
                    payments: {
                        orderBy: [(0, drizzle_orm_1.desc)(schema.payment.paymentDate)],
                    },
                },
            }),
        ]);
        await this.log({
            action,
            sourceModule: 'REGISTRAR',
            targetModule: 'FINANCE',
            studentId,
            academicYearId,
            status: 'SUCCESS',
            message: 'Integrated student finance profile read.',
            performedById,
        });
        return {
            student,
            academicYear,
            academicRecords,
            finance: {
                assessment,
                clearanceStatus: assessment?.financeStatus ?? student.financeStatus,
            },
        };
    }
    async getFinanceClearance(academicYearId, performedById) {
        this.requireAcademicYear(academicYearId);
        const assessments = await this.drizzle.db.query.studentAssessment.findMany({
            where: (0, drizzle_orm_1.eq)(schema.studentAssessment.academicYearId, academicYearId),
            with: {
                student: {
                    columns: {
                        id: true,
                        studentNo: true,
                        lrn: true,
                        firstName: true,
                        lastName: true,
                        gradeLevel: true,
                        section: true,
                    },
                },
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema.studentAssessment.updatedAt)],
        });
        await this.log({
            action: 'READ_FINANCE_CLEARANCE',
            sourceModule: 'FINANCE',
            targetModule: 'REGISTRAR',
            academicYearId,
            status: 'SUCCESS',
            message: `Returned ${assessments.length} clearance rows.`,
            performedById,
        });
        return assessments.map((assessment) => ({
            studentId: assessment.studentId,
            student: assessment.student,
            academicYearId: assessment.academicYearId,
            financeStatus: assessment.financeStatus,
            netAmount: assessment.netAmount,
            paidAmount: assessment.paidAmount,
            balance: assessment.balance,
            updatedAt: assessment.updatedAt,
        }));
    }
    async syncStudentFinanceStatus(studentId, academicYearId, performedById) {
        this.requireAcademicYear(academicYearId);
        const assessment = await this.drizzle.db.query.studentAssessment.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.studentAssessment.studentId, studentId), (0, drizzle_orm_1.eq)(schema.studentAssessment.academicYearId, academicYearId)),
        });
        if (!assessment) {
            await this.log({
                action: 'SYNC_STUDENT_FINANCE_STATUS',
                sourceModule: 'FINANCE',
                targetModule: 'REGISTRAR',
                studentId,
                academicYearId,
                status: 'ERROR',
                message: 'Assessment was not found.',
                performedById,
            });
            throw new common_1.NotFoundException('Assessment was not found.');
        }
        const academicYear = await this.drizzle.db.query.academicYear.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.academicYear.id, academicYearId),
        });
        if (!academicYear?.isActive) {
            await this.log({
                action: 'SYNC_STUDENT_FINANCE_STATUS',
                sourceModule: 'FINANCE',
                targetModule: 'REGISTRAR',
                studentId,
                academicYearId,
                status: 'SUCCESS',
                message: 'Skipped mirror because academic year is not active.',
                performedById,
            });
            return assessment;
        }
        const [updated] = await this.drizzle.db
            .update(schema.student)
            .set({ financeStatus: assessment.financeStatus })
            .where((0, drizzle_orm_1.eq)(schema.student.id, studentId))
            .returning();
        await this.log({
            action: 'SYNC_STUDENT_FINANCE_STATUS',
            sourceModule: 'FINANCE',
            targetModule: 'REGISTRAR',
            studentId,
            academicYearId,
            status: 'SUCCESS',
            message: `Mirrored active-year finance status: ${assessment.financeStatus}.`,
            performedById,
        });
        if (!updated) {
            throw new common_1.NotFoundException('Student was not found.');
        }
        return updated;
    }
    getDataMap() {
        return {
            keys: ['studentId', 'academicYearId'],
            registrarToFinance: [
                { registrarField: 'Student.id', financeField: 'StudentAssessment.studentId' },
                {
                    registrarField: 'Student.academicYearId',
                    financeField: 'StudentAssessment.academicYearId',
                },
                { registrarField: 'Student.gradeLevel', financeField: 'FeeTemplate.gradeLevel' },
                {
                    registrarField: 'Student.financeStatus',
                    financeField: 'Active-year mirror of StudentAssessment.financeStatus',
                },
            ],
            financeToRegistrar: [
                {
                    financeField: 'StudentAssessment.financeStatus',
                    registrarField: 'Student.financeStatus for active year only',
                },
                { financeField: 'Payment.amount', registrarField: 'Read-only ledger visibility' },
                { financeField: 'StudentAssessment.balance', registrarField: 'Read-only clearance visibility' },
            ],
            roles: {
                FINANCE: ['read learner summary', 'write finance data', 'sync active-year finance status'],
                REGISTRAR: ['read finance profile', 'read clearance list'],
                ADMIN: ['all integration endpoints'],
            },
        };
    }
};
exports.IntegrationService = IntegrationService;
exports.IntegrationService = IntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService])
], IntegrationService);
//# sourceMappingURL=integration.service.js.map