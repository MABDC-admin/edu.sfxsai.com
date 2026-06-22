import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '../auth/roles.decorator';
import { FinanceService } from './finance.service';
import { FinancePdfService } from './finance-pdf.service';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    userId?: string;
    id?: string;
  };
}

@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly financePdfService: FinancePdfService,
  ) {}

  private userId(req: AuthenticatedRequest): string | undefined {
    return req.user?.sub ?? req.user?.userId ?? req.user?.id;
  }

  @Get('fee-types')
  @Roles('FINANCE')
  listFeeTypes() {
    return this.financeService.listFeeTypes();
  }

  @Post('fee-types')
  @Roles('FINANCE')
  createFeeType(@Body() body: { name: string; description?: string }) {
    return this.financeService.createFeeType(body);
  }

  @Patch('fee-types/:id')
  @Roles('FINANCE')
  updateFeeType(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; isActive?: boolean },
  ) {
    return this.financeService.updateFeeType(id, body);
  }

  @Delete('fee-types/:id')
  @Roles('FINANCE')
  deleteFeeType(@Param('id') id: string) {
    return this.financeService.deleteFeeType(id);
  }

  @Patch('fee-types/:id/deactivate')
  @Roles('FINANCE')
  deactivateFeeType(@Param('id') id: string) {
    return this.financeService.deactivateFeeType(id);
  }

  @Get('fee-templates')
  @Roles('FINANCE')
  listFeeTemplates(@Query('academicYearId') academicYearId: string) {
    return this.financeService.listFeeTemplates(academicYearId);
  }

  @Post('fee-templates')
  @Roles('FINANCE')
  createFeeTemplate(@Body() body: Parameters<FinanceService['createFeeTemplate']>[0]) {
    return this.financeService.createFeeTemplate(body);
  }

  @Delete('fee-templates/:id')
  @Roles('FINANCE')
  deleteFeeTemplate(@Param('id') id: string) {
    return this.financeService.deleteFeeTemplate(id);
  }

  @Patch('fee-templates/:id/deactivate')
  @Roles('FINANCE')
  deactivateFeeTemplate(@Param('id') id: string) {
    return this.financeService.deactivateFeeTemplate(id);
  }

  @Get('assessments')
  @Roles('FINANCE')
  listAssessments(@Query('academicYearId') academicYearId: string) {
    return this.financeService.listAssessments(academicYearId);
  }

  @Get('assessments/student/:studentId')
  @Roles('FINANCE', 'REGISTRAR')
  getStudentAssessment(
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.financeService.getStudentAssessment(studentId, academicYearId);
  }

  @Post('assessments')
  @Roles('FINANCE')
  saveAssessment(
    @Body() body: Parameters<FinanceService['saveAssessment']>[0],
    @Req() req: AuthenticatedRequest,
  ) {
    return this.financeService.saveAssessment({
      ...body,
      userId: this.userId(req),
    });
  }

  @Get('payments')
  @Roles('FINANCE')
  listPayments(@Query('academicYearId') academicYearId: string) {
    return this.financeService.listPayments(academicYearId);
  }

  @Post('payments')
  @Roles('FINANCE')
  recordPayment(
    @Body() body: Parameters<FinanceService['recordPayment']>[0],
    @Req() req: AuthenticatedRequest,
  ) {
    return this.financeService.recordPayment({
      ...body,
      encodedById: this.userId(req),
    });
  }

  @Patch('payments/:id/receipt')
  @Roles('FINANCE')
  updatePaymentReceipt(
    @Param('id') id: string,
    @Body() body: { receiptNumber: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.financeService.updatePaymentReceipt({
      paymentId: id,
      newReceiptNumber: body.receiptNumber,
      editedById: this.userId(req),
    });
  }


  @Get('reports/dashboard/pdf')
  @Roles('FINANCE')
  async getDashboardReportPdf(
    @Query('academicYearId') academicYearId: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.financePdfService.generateFinanceDashboardReportPdf(
        academicYearId,
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Finance_Overview_Report_${academicYearId}.pdf`,
      );
      res.send(pdfBuffer);
    } catch (err: any) {
      console.error('Error generating finance dashboard report PDF:', err);
      if (!res.headersSent) {
        res
          .status(500)
          .send(
            'ERROR: ' +
              (err.message || err.toString() || 'Unknown Error') +
              (err.stack ? '\n' + err.stack : ''),
          );
      }
    }
  }
  @Get('ledger/student/:studentId')
  @Roles('FINANCE', 'REGISTRAR')
  getLedger(
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.financeService.getLedger(studentId, academicYearId);
  }
  @Get('ledger/student/:studentId/pdf')
  @Roles('FINANCE', 'REGISTRAR')
  async getLedgerPdf(
    @Param('studentId') studentId: string,
    @Query('academicYearId') academicYearId: string,
    @Res() res: Response,
  ) {
    try {
      console.log(`Generating PDF for student ${studentId}, AY: ${academicYearId}...`);
      const pdfBuffer = await this.financePdfService.generateStudentLedgerPdf(
        studentId,
        academicYearId,
      );
      console.log(`PDF buffer generated: ${pdfBuffer.length} bytes`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Student_Ledger_${studentId}.pdf`,
      );
      res.send(pdfBuffer);
      console.log('PDF response sent.');
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      if (!res.headersSent) {
        res.status(500).send('ERROR: ' + (err.message || err.toString() || 'Unknown Error') + (err.stack ? '\n' + err.stack : ''));
      }
    }
  }
}
