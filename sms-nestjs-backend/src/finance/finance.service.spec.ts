import { BadRequestException, ConflictException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { createDrizzleMock } from '../test/drizzle-mock';
import * as schema from '../drizzle/schema';

describe('FinanceService academic-year-safe rules', () => {
  function createService() {
    const db = createDrizzleMock({
      query: {
        feeType: { findMany: jest.fn() },
        feeTemplate: { findMany: jest.fn(), findFirst: jest.fn() },
        feeTemplateLineItem: {},
        studentAssessment: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        payment: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        paymentReceiptAudit: {},
        student: {
          findFirst: jest.fn().mockResolvedValue({ id: 'student-1', enrollmentStatus: 'Officially Enrolled' }),
          update: jest.fn(),
        },
        academicYear: { findFirst: jest.fn() },
        studentAssessmentLineItem: {},
      },
    });

    return {
      db,
      service: new FinanceService({ db } as never),
    };
  }

  it('rejects discounts that exceed 100% total', async () => {
    const { service } = createService();

    await expect(
      service.saveAssessment({
        studentId: 'student-1',
        academicYearId: 'ay-1',
        regularDiscountPercent: 60,
        siblingDiscountPercent: 30,
        scholarshipDiscountPercent: 20,
        lineItems: [{ feeTypeId: 'tuition', description: 'Tuition', amount: 1000 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects assessment saves for dropped or transferred learners', async () => {
    const { db, service } = createService();
    (db.query.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'student-1',
      enrollmentStatus: 'Dropped Out',
    });
    (db.query.studentAssessment.findFirst as jest.Mock).mockResolvedValue(null);
    db.__queue.push('insert', { id: 'assessment-should-not-save' });
    db.__queue.push('insert', { id: 'line-should-not-save' });

    await expect(
      service.saveAssessment({
        studentId: 'student-1',
        academicYearId: 'ay-1',
        regularDiscountPercent: 0,
        siblingDiscountPercent: 0,
        scholarshipDiscountPercent: 0,
        lineItems: [{ feeTypeId: 'tuition', description: 'Tuition', amount: 1000 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects payment posting against frozen ledgers', async () => {
    const { db, service } = createService();
    (db.query.studentAssessment.findFirst as jest.Mock).mockResolvedValue({
      id: 'assessment-1',
      studentId: 'student-1',
      academicYearId: 'ay-1',
      netAmount: 1000,
      paidAmount: 0,
      balance: 1000,
      financeStatus: 'Frozen',
    });

    await expect(
      service.recordPayment({
        studentAssessmentId: 'assessment-1',
        studentId: 'student-1',
        academicYearId: 'ay-1',
        receiptNumber: 'OR-FROZEN',
        method: 'Cash',
        amount: 100,
        paymentDate: '2026-06-19',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('updates existing assessment and replaces line items for same learner and academic year', async () => {
    const { db, service } = createService();
    (db.query.studentAssessment.findFirst as jest.Mock).mockResolvedValue({
      id: 'assessment-1',
      paidAmount: 0,
      netAmount: 900,
    });
    db.__queue.pushMany('update', [
      {
        id: 'assessment-1',
        studentId: 'student-1',
        academicYearId: 'ay-1',
        netAmount: 900,
        paidAmount: 0,
        balance: 900,
      },
      { deleted: true },
    ]);
    db.__queue.push('insert', {
      id: 'line-item-1',
      studentAssessmentId: 'assessment-1',
    });

    const result = await service.saveAssessment({
      studentId: 'student-1',
      academicYearId: 'ay-1',
      regularDiscountPercent: 10,
      siblingDiscountPercent: 0,
      scholarshipDiscountPercent: 0,
      lineItems: [{ feeTypeId: 'tuition', description: 'Tuition', amount: 1000 }],
    });

    expect(result.id).toBe('assessment-1');
    expect(db.insert).toHaveBeenCalledWith(schema.studentAssessmentLineItem);
    expect(db.delete).toHaveBeenCalledWith(schema.studentAssessmentLineItem);
  });

  it('accepts partial payment and keeps balance due', async () => {
    const { db, service } = createService();
    (db.query.studentAssessment.findFirst as jest.Mock).mockResolvedValue({
      id: 'assessment-1',
      studentId: 'student-1',
      academicYearId: 'ay-1',
      netAmount: 1000,
      paidAmount: 0,
      balance: 1000,
      financeStatus: 'With Balance',
    });
    (db.query.payment.findFirst as jest.Mock).mockResolvedValue(null);
    db.__queue.pushMany('insert', [
      {
        id: 'payment-1',
        amount: 400,
        studentAssessmentId: 'assessment-1',
      },
    ]);
    db.__queue.pushMany('update', [
      {
        id: 'assessment-1',
        financeStatus: 'With Balance',
        paidAmount: 400,
        balance: 600,
      },
    ]);
    db.__queue.push('select', [{ id: 'ay-1', isActive: false }]);

    const result = await service.recordPayment({
      studentAssessmentId: 'assessment-1',
      studentId: 'student-1',
      academicYearId: 'ay-1',
      receiptNumber: 'OR-001',
      method: 'Cash',
      amount: 400,
      paymentDate: '2026-06-11',
    });

    expect(result.assessment.financeStatus).toBe('With Balance');
    expect(result.assessment.balance).toBe(600);
    expect(db.insert).toHaveBeenCalledWith(schema.payment);
    expect(db.update).toHaveBeenCalledWith(schema.studentAssessment);
  });

  it('clears balance on full payment and mirrors finance status only when AY is active', async () => {
    const { db, service } = createService();
    (db.query.academicYear.findFirst as jest.Mock).mockResolvedValue({ id: 'ay-1', isActive: true });
    (db.query.studentAssessment.findFirst as jest.Mock).mockResolvedValue({
      id: 'assessment-1',
      studentId: 'student-1',
      academicYearId: 'ay-1',
      netAmount: 1000,
      paidAmount: 400,
      balance: 600,
      financeStatus: 'With Balance',
    });
    (db.query.payment.findFirst as jest.Mock).mockResolvedValue(null);
    db.__queue.push('insert', {
      id: 'payment-2',
      amount: 600,
      studentAssessmentId: 'assessment-1',
    });
    db.__queue.push('update', {
      id: 'assessment-1',
      netAmount: 1000,
      paidAmount: 1000,
      balance: 0,
      financeStatus: 'Cleared',
    });
    db.__queue.push('update', {
      id: 'student-1',
      financeStatus: 'Cleared',
    });

    const result = await service.recordPayment({
      studentAssessmentId: 'assessment-1',
      studentId: 'student-1',
      academicYearId: 'ay-1',
      receiptNumber: 'OR-002',
      method: 'GCash',
      amount: 600,
      paymentDate: '2026-06-11',
    });

    expect(result.assessment.financeStatus).toBe('Cleared');
    expect(result.assessment.balance).toBe(0);
    expect(db.update).toHaveBeenCalledWith(schema.studentAssessment);
    expect(db.update).toHaveBeenCalledWith(schema.student);
  });

  it('blocks overpayment against remaining balance', async () => {
    const { db, service } = createService();
    (db.query.studentAssessment.findFirst as jest.Mock).mockResolvedValue({
      id: 'assessment-1',
      studentId: 'student-1',
      academicYearId: 'ay-1',
      netAmount: 1000,
      paidAmount: 0,
      balance: 600,
      financeStatus: 'With Balance',
    });

    await expect(
      service.recordPayment({
        studentAssessmentId: 'assessment-1',
        studentId: 'student-1',
        academicYearId: 'ay-1',
        receiptNumber: 'OR-003',
        method: 'Cash',
        amount: 601,
        paymentDate: '2026-06-11',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks cross-year payment posting', async () => {
    const { db, service } = createService();
    (db.query.studentAssessment.findFirst as jest.Mock).mockResolvedValue({
      id: 'assessment-1',
      studentId: 'student-1',
      academicYearId: 'ay-1',
      netAmount: 1000,
      paidAmount: 0,
      balance: 1000,
      financeStatus: 'With Balance',
    });

    await expect(
      service.recordPayment({
        studentAssessmentId: 'assessment-1',
        studentId: 'student-1',
        academicYearId: 'ay-2',
        receiptNumber: 'OR-004',
        method: 'Cash',
        amount: 100,
        paymentDate: '2026-06-11',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks duplicate receipt within a year', async () => {
    const { db, service } = createService();
    (db.query.studentAssessment.findFirst as jest.Mock).mockResolvedValue({
      id: 'assessment-1',
      studentId: 'student-1',
      academicYearId: 'ay-1',
      netAmount: 1000,
      paidAmount: 0,
      balance: 600,
      financeStatus: 'With Balance',
    });
    (db.query.payment.findFirst as jest.Mock).mockResolvedValue({
      id: 'payment-existing',
      receiptNumber: 'OR-001',
    });

    await expect(
      service.recordPayment({
        studentAssessmentId: 'assessment-1',
        studentId: 'student-1',
        academicYearId: 'ay-1',
        receiptNumber: 'OR-001',
        method: 'Cash',
        amount: 100,
        paymentDate: '2026-06-11',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('blocks hard deletion of fee types already used in assessments', async () => {
    const { db, service } = createService();
    db.__queue.push('select', [{ id: 'used-line-item' }]);

    await expect(service.deleteFeeType('fee-type-1')).rejects.toBeInstanceOf(ConflictException);
    expect(db.delete).not.toHaveBeenCalledWith(schema.feeType);
  });

  it('updates payment receipt and records an audit entry', async () => {
    const { db, service } = createService();
    (db.query.payment.findFirst as jest.Mock)
      .mockResolvedValueOnce({
        id: 'payment-1',
        academicYearId: 'ay-1',
        receiptNumber: 'OR-001',
      })
      .mockResolvedValueOnce(null);
    db.__queue.pushMany('insert', [{ id: 'audit-1' }]);
    db.__queue.push('update', {
      id: 'payment-1',
      receiptNumber: 'OR-001-A',
    });

    await service.updatePaymentReceipt({
      paymentId: 'payment-1',
      newReceiptNumber: 'OR-001-A',
      editedById: 'user-1',
    });

    expect(db.insert).toHaveBeenCalledWith(schema.paymentReceiptAudit);
    expect(db.update).toHaveBeenCalledWith(schema.payment);
    expect(db.insert).toHaveBeenCalledWith(schema.paymentReceiptAudit);
  });

  it('normalizes ledger assessment line items for the Angular student ledger', async () => {
    const { db, service } = createService();
    const lineItem = {
      id: 'line-1',
      feeTypeId: 'tuition',
      description: 'Tuition Fee',
      amount: 1000,
      feeType: { id: 'tuition', name: 'Tuition' },
    };
    (db.query.studentAssessment.findFirst as jest.Mock).mockResolvedValue({
      id: 'assessment-1',
      studentId: 'student-1',
      academicYearId: 'ay-1',
      financeStatus: 'With Balance',
      student: { id: 'student-1', enrollmentStatus: 'Officially Enrolled' },
      studentAssessmentLineItems: [lineItem],
      payments: [],
    });

    const result = await service.getLedger('student-1', 'ay-1') as any;

    expect(result.lineItems).toEqual([lineItem]);
  });
});


