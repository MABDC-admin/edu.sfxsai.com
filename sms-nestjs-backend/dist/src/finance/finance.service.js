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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema = __importStar(require("../drizzle/schema"));
const DEACTIVATED_ENROLLMENT_STATUSES = new Set(['Dropped Out', 'Transferred Out']);
const FROZEN_FINANCE_STATUS = 'Frozen';
let FinanceService = class FinanceService {
    drizzle;
    constructor(drizzle) {
        this.drizzle = drizzle;
    }
    normalizePercent(value) {
        return Number(value ?? 0);
    }
    validateAcademicYear(academicYearId) {
        if (!academicYearId) {
            throw new common_1.BadRequestException('academicYearId is required.');
        }
        return academicYearId;
    }
    isFrozenStudent(student) {
        return !!student
            && (DEACTIVATED_ENROLLMENT_STATUSES.has(String(student.enrollmentStatus || '').trim())
                || student.financeStatus === FROZEN_FINANCE_STATUS);
    }
    withFrozenStatus(assessment) {
        const record = assessment;
        if (!record || !this.isFrozenStudent(record.student)) {
            return assessment;
        }
        return {
            ...record,
            financeStatus: FROZEN_FINANCE_STATUS,
        };
    }
    normalizeAssessmentResponse(assessment) {
        const record = assessment;
        if (!record) {
            return assessment;
        }
        return {
            ...record,
            lineItems: record.lineItems ?? record.studentAssessmentLineItems ?? [],
        };
    }
    async assertStudentCanReceiveFinance(studentId) {
        const student = await this.drizzle.db.query.student.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.student.id, studentId),
        });
        if (!student) {
            throw new common_1.BadRequestException('Student was not found.');
        }
        if (this.isFrozenStudent(student)) {
            throw new common_1.BadRequestException('Deactivated learners have frozen finance ledgers and cannot be assessed or paid.');
        }
        return student;
    }
    validateDiscounts(input) {
        const regular = this.normalizePercent(input.regularDiscountPercent);
        const sibling = this.normalizePercent(input.siblingDiscountPercent);
        const scholarship = this.normalizePercent(input.scholarshipDiscountPercent);
        const total = regular + sibling + scholarship;
        if ([regular, sibling, scholarship].some((value) => value < 0)) {
            throw new common_1.BadRequestException('Discount percentages cannot be negative.');
        }
        if (total > 100) {
            throw new common_1.BadRequestException('Total discount cannot exceed 100%.');
        }
        return { regular, sibling, scholarship, total };
    }
    computeAssessment(input) {
        const discounts = this.validateDiscounts(input);
        const grossAmount = input.lineItems.reduce((sum, item) => {
            if (item.amount < 0) {
                throw new common_1.BadRequestException('Line item amounts cannot be negative.');
            }
            return sum + Number(item.amount);
        }, 0);
        const discountAmount = grossAmount * (discounts.total / 100);
        const netAmount = grossAmount - discountAmount;
        return {
            ...discounts,
            grossAmount,
            discountAmount,
            netAmount,
        };
    }
    async listFeeTypes() {
        return this.drizzle.db.query.feeType.findMany({
            orderBy: [(0, drizzle_orm_1.asc)(schema.feeType.name)],
        });
    }
    async createFeeType(input) {
        const now = new Date().toISOString();
        const [created] = await this.drizzle.db.insert(schema.feeType).values({
            id: crypto.randomUUID(),
            name: input.name.trim(),
            description: input.description?.trim() || null,
            updatedAt: now,
        }).returning();
        return created;
    }
    async updateFeeType(id, input) {
        const [updated] = await this.drizzle.db
            .update(schema.feeType)
            .set({
            ...(input.name !== undefined ? { name: input.name.trim() } : {}),
            ...(input.description !== undefined
                ? { description: input.description.trim() || null }
                : {}),
            ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        })
            .where((0, drizzle_orm_1.eq)(schema.feeType.id, id))
            .returning();
        return updated;
    }
    async deactivateFeeType(id) {
        const [updated] = await this.drizzle.db
            .update(schema.feeType)
            .set({ isActive: false })
            .where((0, drizzle_orm_1.eq)(schema.feeType.id, id))
            .returning();
        return updated;
    }
    async deleteFeeType(id) {
        const [used] = await this.drizzle.db
            .select({ id: schema.studentAssessmentLineItem.id })
            .from(schema.studentAssessmentLineItem)
            .where((0, drizzle_orm_1.eq)(schema.studentAssessmentLineItem.feeTypeId, id))
            .limit(1);
        if (used?.id) {
            throw new common_1.ConflictException('Fee type is already used in an assessment. Deactivate it instead.');
        }
        const [deleted] = await this.drizzle.db
            .delete(schema.feeType)
            .where((0, drizzle_orm_1.eq)(schema.feeType.id, id))
            .returning();
        return deleted;
    }
    async listFeeTemplates(academicYearId) {
        this.validateAcademicYear(academicYearId);
        return this.drizzle.db.query.feeTemplate.findMany({
            where: (0, drizzle_orm_1.eq)(schema.feeTemplate.academicYearId, academicYearId),
            with: {
                feeTemplateLineItems: {
                    with: { feeType: true },
                    orderBy: [(0, drizzle_orm_1.asc)(schema.feeTemplateLineItem.sortOrder)],
                },
            },
            orderBy: [(0, drizzle_orm_1.asc)(schema.feeTemplate.gradeLevel), (0, drizzle_orm_1.asc)(schema.feeTemplate.name)],
        });
    }
    async createFeeTemplate(input) {
        this.validateAcademicYear(input.academicYearId);
        const now = new Date().toISOString();
        const [template] = await this.drizzle.db
            .insert(schema.feeTemplate)
            .values({
            id: crypto.randomUUID(),
            academicYearId: input.academicYearId,
            gradeLevel: input.gradeLevel,
            name: input.name,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        })
            .returning();
        if (input.lineItems.length) {
            await this.drizzle.db.insert(schema.feeTemplateLineItem).values(input.lineItems.map((item, index) => ({
                id: crypto.randomUUID(),
                feeTypeId: item.feeTypeId,
                feeTemplateId: template.id,
                description: item.description,
                amount: Number(item.amount),
                sortOrder: index,
            })));
        }
        return this.drizzle.db.query.feeTemplate.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.feeTemplate.id, template.id),
            with: {
                feeTemplateLineItems: {
                    with: { feeType: true },
                    orderBy: [(0, drizzle_orm_1.asc)(schema.feeTemplateLineItem.sortOrder)],
                },
            },
        });
    }
    async deactivateFeeTemplate(id) {
        const [updated] = await this.drizzle.db
            .update(schema.feeTemplate)
            .set({ isActive: false })
            .where((0, drizzle_orm_1.eq)(schema.feeTemplate.id, id))
            .returning();
        return updated;
    }
    async deleteFeeTemplate(id) {
        const [used] = await this.drizzle.db
            .select({ id: schema.studentAssessment.id })
            .from(schema.studentAssessment)
            .where((0, drizzle_orm_1.eq)(schema.studentAssessment.feeTemplateId, id))
            .limit(1);
        if (used?.id) {
            throw new common_1.ConflictException('Fee template is already used in an assessment. Deactivate it instead.');
        }
        const [deleted] = await this.drizzle.db
            .delete(schema.feeTemplate)
            .where((0, drizzle_orm_1.eq)(schema.feeTemplate.id, id))
            .returning();
        return deleted;
    }
    async saveAssessment(input) {
        this.validateAcademicYear(input.academicYearId);
        if (!input.studentId) {
            throw new common_1.BadRequestException('studentId is required.');
        }
        if (!input.lineItems.length) {
            throw new common_1.BadRequestException('At least one line item is required.');
        }
        await this.assertStudentCanReceiveFinance(input.studentId);
        const computed = this.computeAssessment(input);
        const existing = await this.drizzle.db.query.studentAssessment.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.studentAssessment.studentId, input.studentId), (0, drizzle_orm_1.eq)(schema.studentAssessment.academicYearId, input.academicYearId)),
        });
        const paidAmount = Number(existing?.paidAmount ?? 0);
        if (paidAmount > computed.netAmount) {
            throw new common_1.BadRequestException('Updated assessment net amount cannot be lower than already paid amount.');
        }
        const balance = computed.netAmount - paidAmount;
        const financeStatus = balance === 0 ? 'Cleared' : 'With Balance';
        const now = new Date().toISOString();
        const assessmentData = {
            studentId: input.studentId,
            academicYearId: input.academicYearId,
            feeTemplateId: input.feeTemplateId ?? null,
            regularDiscountPercent: computed.regular,
            siblingDiscountPercent: computed.sibling,
            scholarshipDiscountPercent: computed.scholarship,
            grossAmount: computed.grossAmount,
            discountAmount: computed.discountAmount,
            netAmount: computed.netAmount,
            paidAmount,
            balance,
            financeStatus,
            updatedAt: now,
            updatedById: input.userId ?? null,
        };
        let assessment;
        if (existing) {
            [assessment] = await this.drizzle.db
                .update(schema.studentAssessment)
                .set(assessmentData)
                .where((0, drizzle_orm_1.eq)(schema.studentAssessment.id, existing.id))
                .returning();
            await this.drizzle.db
                .delete(schema.studentAssessmentLineItem)
                .where((0, drizzle_orm_1.eq)(schema.studentAssessmentLineItem.studentAssessmentId, existing.id));
        }
        else {
            [assessment] = await this.drizzle.db
                .insert(schema.studentAssessment)
                .values({
                ...assessmentData,
                id: crypto.randomUUID(),
                createdAt: now,
                createdById: input.userId ?? null,
            })
                .returning();
        }
        await this.drizzle.db.insert(schema.studentAssessmentLineItem).values(input.lineItems.map((item) => ({
            id: crypto.randomUUID(),
            studentAssessmentId: assessment.id,
            feeTypeId: item.feeTypeId,
            description: item.description,
            amount: Number(item.amount),
            sourceFeeTemplateLineItemId: item.sourceFeeTemplateLineItemId ?? null,
        })));
        return assessment;
    }
    async listAssessments(academicYearId) {
        this.validateAcademicYear(academicYearId);
        const assessments = await this.drizzle.db.query.studentAssessment.findMany({
            where: (0, drizzle_orm_1.eq)(schema.studentAssessment.academicYearId, academicYearId),
            with: {
                student: true,
                studentAssessmentLineItems: { with: { feeType: true } },
                payments: {
                    orderBy: [(0, drizzle_orm_1.desc)(schema.payment.paymentDate)],
                },
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema.studentAssessment.updatedAt)],
        });
        return assessments.map((assessment) => this.withFrozenStatus(this.normalizeAssessmentResponse(assessment)));
    }
    async getStudentAssessment(studentId, academicYearId) {
        this.validateAcademicYear(academicYearId);
        const assessment = await this.drizzle.db.query.studentAssessment.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.studentAssessment.studentId, studentId), (0, drizzle_orm_1.eq)(schema.studentAssessment.academicYearId, academicYearId)),
            with: {
                student: true,
                studentAssessmentLineItems: {
                    with: { feeType: true },
                },
                payments: {
                    orderBy: [(0, drizzle_orm_1.desc)(schema.payment.paymentDate)],
                },
            },
        });
        return this.withFrozenStatus(this.normalizeAssessmentResponse(assessment));
    }
    async recordPayment(input) {
        this.validateAcademicYear(input.academicYearId);
        if (!input.receiptNumber?.trim()) {
            throw new common_1.BadRequestException('Receipt/reference number is required.');
        }
        if (input.amount <= 0) {
            throw new common_1.BadRequestException('Payment amount must be greater than zero.');
        }
        const assessment = await this.drizzle.db.query.studentAssessment.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.studentAssessment.id, input.studentAssessmentId),
        });
        if (!assessment) {
            throw new common_1.NotFoundException('Student assessment was not found.');
        }
        if (assessment.academicYearId !== input.academicYearId) {
            throw new common_1.BadRequestException('Payment academic year must match assessment academic year.');
        }
        if (assessment.studentId !== input.studentId) {
            throw new common_1.BadRequestException('Payment student must match assessment student.');
        }
        if (assessment.financeStatus === FROZEN_FINANCE_STATUS) {
            throw new common_1.BadRequestException('This learner ledger is frozen because the learner is deactivated.');
        }
        await this.assertStudentCanReceiveFinance(input.studentId);
        if (input.amount > Number(assessment.balance)) {
            throw new common_1.BadRequestException('Payment amount cannot exceed remaining balance.');
        }
        const duplicateReceipt = await this.drizzle.db.query.payment.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.payment.academicYearId, input.academicYearId), (0, drizzle_orm_1.eq)(schema.payment.receiptNumber, input.receiptNumber.trim())),
        });
        if (duplicateReceipt) {
            throw new common_1.ConflictException('Receipt/reference number already exists in this academic year.');
        }
        const [payment] = await this.drizzle.db
            .insert(schema.payment)
            .values({
            id: crypto.randomUUID(),
            studentAssessmentId: input.studentAssessmentId,
            studentId: input.studentId,
            academicYearId: input.academicYearId,
            receiptNumber: input.receiptNumber.trim(),
            method: input.method,
            amount: Number(input.amount),
            paymentDate: input.paymentDate,
            remarks: input.remarks ?? null,
            encodedById: input.encodedById ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
            .returning();
        const paidAmount = Number(assessment.paidAmount) + Number(input.amount);
        const balance = Number(assessment.netAmount) - paidAmount;
        const [updatedAssessment] = await this.drizzle.db
            .update(schema.studentAssessment)
            .set({
            paidAmount,
            balance,
            financeStatus: balance === 0 ? 'Cleared' : 'With Balance',
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema.studentAssessment.id, assessment.id))
            .returning();
        const academicYear = await this.drizzle.db.query.academicYear.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.academicYear.id, input.academicYearId),
        });
        if (academicYear?.isActive) {
            await this.drizzle.db.update(schema.student).set({
                financeStatus: updatedAssessment.financeStatus,
            }).where((0, drizzle_orm_1.eq)(schema.student.id, input.studentId));
        }
        return { payment, assessment: updatedAssessment };
    }
    async listPayments(academicYearId) {
        this.validateAcademicYear(academicYearId);
        return this.drizzle.db.query.payment.findMany({
            where: (0, drizzle_orm_1.eq)(schema.payment.academicYearId, academicYearId),
            with: {
                student: true,
                studentAssessment: true,
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema.payment.paymentDate)],
        });
    }
    async updatePaymentReceipt(input) {
        if (!input.newReceiptNumber?.trim()) {
            throw new common_1.BadRequestException('Receipt/reference number is required.');
        }
        const payment = await this.drizzle.db.query.payment.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.payment.id, input.paymentId),
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment was not found.');
        }
        const newReceiptNumber = input.newReceiptNumber.trim();
        const duplicateReceipt = await this.drizzle.db.query.payment.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.payment.academicYearId, payment.academicYearId), (0, drizzle_orm_1.eq)(schema.payment.receiptNumber, newReceiptNumber), (0, drizzle_orm_1.ne)(schema.payment.id, payment.id)),
        });
        if (duplicateReceipt) {
            throw new common_1.ConflictException('Receipt/reference number already exists in this academic year.');
        }
        await this.drizzle.db.insert(schema.paymentReceiptAudit).values({
            id: crypto.randomUUID(),
            paymentId: input.paymentId,
            oldReceiptNumber: payment.receiptNumber,
            newReceiptNumber,
            editedById: input.editedById ?? null,
            editedAt: new Date().toISOString(),
        });
        const [updated] = await this.drizzle.db
            .update(schema.payment)
            .set({
            receiptNumber: newReceiptNumber,
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema.payment.id, input.paymentId))
            .returning();
        return updated;
    }
    async getLedger(studentId, academicYearId) {
        const assessment = await this.getStudentAssessment(studentId, academicYearId);
        if (!assessment) {
            return null;
        }
        return assessment;
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map