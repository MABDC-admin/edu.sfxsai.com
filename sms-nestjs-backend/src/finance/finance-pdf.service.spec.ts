import { FinancePdfService } from './finance-pdf.service';

const collectText = (value: any): string[] => {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string' || typeof value === 'number')
    return [String(value)];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (typeof value === 'object') {
    return Object.values(value).flatMap(collectText);
  }
  return [];
};

describe('FinancePdfService student ledger PDF definition', () => {
  const service = new FinancePdfService({ getLedger: jest.fn() } as any);

  it('builds the official A4 student ledger layout with real ledger fields', () => {
    const doc = service.buildStudentLedgerDocDefinition(
      {
        studentId: 'student-1',
        academicYear: { schoolYear: '2026-2027' },
        student: {
          id: 'student-1',
          studentNo: 'SFX-2026-2027-011',
          lrn: 'NO-LRN-2026-2027-L2-FAC86BBE4D',
          firstName: 'Aamir Quibel',
          lastName: 'Baliong',
          gradeLevel: 'NURSERY',
          section: 'SFXSAI',
          guardian: 'Carin Rodonia Quibel',
          contactNo: '09627101021',
        },
        grossAmount: 13500,
        discountAmount: 500,
        netAmount: 13000,
        paidAmount: 4000,
        balance: 9000,
        studentAssessmentLineItems: [
          {
            description: 'Tuition Fee',
            amount: 13500,
            createdAt: '2026-06-17T00:00:00.000Z',
          },
        ],
        payments: [
          {
            receiptNumber: 'OR-0001',
            method: 'Cash',
            remarks: 'Rene',
            amount: 4000,
            paymentDate: '2026-06-20T00:00:00.000Z',
          },
        ],
      },
      'ay-1',
      null,
      null,
      new Date('2026-06-20T00:00:00.000Z'),
    );

    const text = collectText(doc).join(' ');

    expect(doc.pageSize).toBe('A4');
    expect(doc.pageOrientation).toBe('portrait');
    expect(text).toContain('ST. FRANCIS XAVIER SMART ACADEMY INC.');
    expect(text).toContain('STUDENT LEDGER');
    expect(text).toContain('Learner Photo');
    expect(text).toContain('SY 2026-2027');
    expect(text).toContain('Aamir Quibel Baliong');
    expect(text).toContain('Nursery - SFXSAI');
    expect(text).toContain('Tuition Fee');
    expect(text).toContain('OR-0001');
    expect(text).toContain('Payment - Cash | Payee: Rene');
    expect(text).not.toContain('if any');
    expect(text).toContain('LATEST FINANCIAL REPORT');
    expect(text).toContain('Prepared by:');
    expect(text).toContain('Ms. Ivyann P. Dargantes');
    expect(text).toContain('₱ 13,500.00');
    expect(text).toContain('₱ 9,000.00');
  });

  it('builds the finance dashboard report with real assessment and payment mappings', () => {
    const doc = service.buildFinanceDashboardReportDocDefinition(
      [
        {
          academicYear: { schoolYear: '2026-2027' },
          netAmount: 13500,
          grossAmount: 13500,
          discountAmount: 0,
          balance: 9500,
          student: { firstName: 'Jayden Kris', lastName: 'Dargantes', gradeLevel: 'NURSERY' },
        },
        {
          academicYear: { schoolYear: '2026-2027' },
          netAmount: 10500,
          grossAmount: 12500,
          discountAmount: 2000,
          balance: 0,
          student: { firstName: 'Aamir Quibel', lastName: 'Baliong', gradeLevel: 'G1' },
        },
      ],
      [
        {
          amount: 2000,
          paymentDate: '2026-06-16T00:00:00.000Z',
          student: { firstName: 'Aamir Quibel', lastName: 'Baliong' },
        },
        {
          amount: 2000,
          paymentDate: '2026-06-17T00:00:00.000Z',
          student: { firstName: 'Jayden Kris', lastName: 'Dargantes' },
        },
      ],
      'ay-1',
      null,
      new Date('2026-06-20T00:00:00.000Z'),
    );

    const footer = typeof (doc as any).footer === 'function' ? (doc as any).footer() : null;
    const text = collectText([doc, footer]).join(' ');

    expect(doc.pageSize).toBe('A4');
    expect(text).toContain('ST. FRANCIS XAVIER SMART ACADEMY INC.');
    expect(text).toContain('Finance Overview Report');
    expect(text).toContain('SY 2026-2027');
    expect(text).toContain('TOTAL REVENUE');
    expect(text).toContain('₱ 4,000.00');
    expect(text).toContain('TOTAL ASSESSED');
    expect(text).toContain('₱ 24,000.00');
    expect(text).toContain('OPEN BALANCE');
    expect(text).toContain('₱ 9,500.00');
    expect(text).toContain('COLLECTION STATUS');
    expect(text).toContain('16.7%');
    expect(text).toContain('Dargantes');
    expect(text).toContain('Financial Alerts');
    expect(text).toContain('LATEST FINANCIAL REPORT');
    expect(text).toContain('Ms. Ivyann P. Dargantes');
  });

  it('renders the finance dashboard report as a PDF buffer', async () => {
    const pdfService = new FinancePdfService({
      listAssessments: jest.fn().mockResolvedValue([
        {
          academicYear: { schoolYear: '2026-2027' },
          netAmount: 24000,
          grossAmount: 26000,
          discountAmount: 2000,
          balance: 20000,
          student: { firstName: 'Jayden Kris', lastName: 'Dargantes', gradeLevel: 'NURSERY' },
        },
      ]),
      listPayments: jest.fn().mockResolvedValue([
        {
          amount: 4000,
          paymentDate: '2026-06-17T00:00:00.000Z',
          student: { firstName: 'Jayden Kris', lastName: 'Dargantes' },
        },
      ]),
      getLedger: jest.fn(),
    } as any);

    const buffer = await pdfService.generateFinanceDashboardReportPdf('ay-1');

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(buffer.length).toBeGreaterThan(1000);
  });
  it('renders the redesigned ledger as a PDF buffer', async () => {
    const getLedger = jest.fn().mockResolvedValue({
      studentId: 'student-1',
      academicYear: { schoolYear: '2026-2027' },
      student: {
        id: 'student-1',
        studentNo: 'SFX-2026-2027-011',
        firstName: 'Aamir Quibel',
        lastName: 'Baliong',
        gradeLevel: 'NURSERY',
      },
      grossAmount: 13500,
      discountAmount: 0,
      netAmount: 13500,
      paidAmount: 0,
      balance: 13500,
      studentAssessmentLineItems: [
        {
          description: 'Tuition Fee',
          amount: 13500,
          createdAt: '2026-06-17T00:00:00.000Z',
        },
      ],
      payments: [],
    });
    const pdfService = new FinancePdfService({ getLedger } as any);

    const buffer = await pdfService.generateStudentLedgerPdf(
      'student-1',
      'ay-1',
    );

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(buffer.length).toBeGreaterThan(1000);
  });
});
