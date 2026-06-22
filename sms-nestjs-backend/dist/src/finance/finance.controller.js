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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../auth/roles.decorator");
const finance_service_1 = require("./finance.service");
const finance_pdf_service_1 = require("./finance-pdf.service");
let FinanceController = class FinanceController {
    financeService;
    financePdfService;
    constructor(financeService, financePdfService) {
        this.financeService = financeService;
        this.financePdfService = financePdfService;
    }
    userId(req) {
        return req.user?.sub ?? req.user?.userId ?? req.user?.id;
    }
    listFeeTypes() {
        return this.financeService.listFeeTypes();
    }
    createFeeType(body) {
        return this.financeService.createFeeType(body);
    }
    updateFeeType(id, body) {
        return this.financeService.updateFeeType(id, body);
    }
    deleteFeeType(id) {
        return this.financeService.deleteFeeType(id);
    }
    deactivateFeeType(id) {
        return this.financeService.deactivateFeeType(id);
    }
    listFeeTemplates(academicYearId) {
        return this.financeService.listFeeTemplates(academicYearId);
    }
    createFeeTemplate(body) {
        return this.financeService.createFeeTemplate(body);
    }
    deleteFeeTemplate(id) {
        return this.financeService.deleteFeeTemplate(id);
    }
    deactivateFeeTemplate(id) {
        return this.financeService.deactivateFeeTemplate(id);
    }
    listAssessments(academicYearId) {
        return this.financeService.listAssessments(academicYearId);
    }
    getStudentAssessment(studentId, academicYearId) {
        return this.financeService.getStudentAssessment(studentId, academicYearId);
    }
    saveAssessment(body, req) {
        return this.financeService.saveAssessment({
            ...body,
            userId: this.userId(req),
        });
    }
    listPayments(academicYearId) {
        return this.financeService.listPayments(academicYearId);
    }
    recordPayment(body, req) {
        return this.financeService.recordPayment({
            ...body,
            encodedById: this.userId(req),
        });
    }
    updatePaymentReceipt(id, body, req) {
        return this.financeService.updatePaymentReceipt({
            paymentId: id,
            newReceiptNumber: body.receiptNumber,
            editedById: this.userId(req),
        });
    }
    async getDashboardReportPdf(academicYearId, res) {
        try {
            const pdfBuffer = await this.financePdfService.generateFinanceDashboardReportPdf(academicYearId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Finance_Overview_Report_${academicYearId}.pdf`);
            res.send(pdfBuffer);
        }
        catch (err) {
            console.error('Error generating finance dashboard report PDF:', err);
            if (!res.headersSent) {
                res
                    .status(500)
                    .send('ERROR: ' +
                    (err.message || err.toString() || 'Unknown Error') +
                    (err.stack ? '\n' + err.stack : ''));
            }
        }
    }
    getLedger(studentId, academicYearId) {
        return this.financeService.getLedger(studentId, academicYearId);
    }
    async getLedgerPdf(studentId, academicYearId, res) {
        try {
            console.log(`Generating PDF for student ${studentId}, AY: ${academicYearId}...`);
            const pdfBuffer = await this.financePdfService.generateStudentLedgerPdf(studentId, academicYearId);
            console.log(`PDF buffer generated: ${pdfBuffer.length} bytes`);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Student_Ledger_${studentId}.pdf`);
            res.send(pdfBuffer);
            console.log('PDF response sent.');
        }
        catch (err) {
            console.error('Error generating PDF:', err);
            if (!res.headersSent) {
                res.status(500).send('ERROR: ' + (err.message || err.toString() || 'Unknown Error') + (err.stack ? '\n' + err.stack : ''));
            }
        }
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('fee-types'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "listFeeTypes", null);
__decorate([
    (0, common_1.Post)('fee-types'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createFeeType", null);
__decorate([
    (0, common_1.Patch)('fee-types/:id'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateFeeType", null);
__decorate([
    (0, common_1.Delete)('fee-types/:id'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "deleteFeeType", null);
__decorate([
    (0, common_1.Patch)('fee-types/:id/deactivate'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "deactivateFeeType", null);
__decorate([
    (0, common_1.Get)('fee-templates'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "listFeeTemplates", null);
__decorate([
    (0, common_1.Post)('fee-templates'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createFeeTemplate", null);
__decorate([
    (0, common_1.Delete)('fee-templates/:id'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "deleteFeeTemplate", null);
__decorate([
    (0, common_1.Patch)('fee-templates/:id/deactivate'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "deactivateFeeTemplate", null);
__decorate([
    (0, common_1.Get)('assessments'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "listAssessments", null);
__decorate([
    (0, common_1.Get)('assessments/student/:studentId'),
    (0, roles_decorator_1.Roles)('FINANCE', 'REGISTRAR'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getStudentAssessment", null);
__decorate([
    (0, common_1.Post)('assessments'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "saveAssessment", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "listPayments", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Patch)('payments/:id/receipt'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updatePaymentReceipt", null);
__decorate([
    (0, common_1.Get)('reports/dashboard/pdf'),
    (0, roles_decorator_1.Roles)('FINANCE'),
    __param(0, (0, common_1.Query)('academicYearId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getDashboardReportPdf", null);
__decorate([
    (0, common_1.Get)('ledger/student/:studentId'),
    (0, roles_decorator_1.Roles)('FINANCE', 'REGISTRAR'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getLedger", null);
__decorate([
    (0, common_1.Get)('ledger/student/:studentId/pdf'),
    (0, roles_decorator_1.Roles)('FINANCE', 'REGISTRAR'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getLedgerPdf", null);
exports.FinanceController = FinanceController = __decorate([
    (0, common_1.Controller)('finance'),
    __metadata("design:paramtypes", [finance_service_1.FinanceService,
        finance_pdf_service_1.FinancePdfService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map