import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../drizzle/schema';

type ToolIntent = 'learner_record' | 'billing_assessment' | 'student_masterlist';

interface AiToolUser {
  userId?: string;
  email?: string;
  role?: string;
}

interface AiToolContext {
  intent: ToolIntent;
  content: string;
  directResponse?: string;
}

const LEARNER_RECORD_ROLES = new Set(['ADMIN', 'REGISTRAR', 'PRINCIPAL']);
const BILLING_ASSESSMENT_ROLES = new Set(['ADMIN', 'FINANCE', 'PRINCIPAL']);
const STUDENT_MASTERLIST_ROLES = new Set(['ADMIN', 'REGISTRAR', 'FINANCE', 'PRINCIPAL']);

@Injectable()
export class AiToolContextService {
  constructor(private readonly drizzle: DrizzleService) {}

  async resolve(user: AiToolUser, messages: Array<{ role: string; content: string }>): Promise<AiToolContext | null> {
    const latestUserMessage = [...messages].reverse().find(message => message.role === 'user')?.content || '';
    const role = `${user.role || ''}`.toUpperCase();
    const command = this.parseToolCommand(latestUserMessage);
    const commandIntent = command?.tool === 'finance.billing' ? 'billing_assessment' : command?.tool === 'learner.record' ? 'learner_record' : null;
    if (commandIntent && command) {
      const allowedCommandRoles = commandIntent === 'billing_assessment' ? BILLING_ASSESSMENT_ROLES : LEARNER_RECORD_ROLES;
      if (!allowedCommandRoles.has(role)) {
        const directResponse = this.renderAccessDeniedResponse(role, allowedCommandRoles);
        return {
          intent: commandIntent,
          content: `AI TOOL RESULT: Access denied.
The signed-in role "${role || 'UNKNOWN'}" is not allowed to use the ${commandIntent} tool.
Tell the user that this request requires one of these roles: ${[...allowedCommandRoles].join(', ')}.`,
          directResponse,
        };
      }
      return commandIntent === 'billing_assessment'
        ? this.buildBillingContext(command.studentId)
        : this.buildLearnerRecordContext(command.studentId);
    }

    const intent = this.detectIntent(latestUserMessage) ?? this.detectRoleFallbackIntent(role, latestUserMessage);
    if (!intent) {
      return null;
    }

    const allowedRoles = this.allowedRolesForIntent(intent);
    if (!allowedRoles.has(role)) {
      const directResponse = this.renderAccessDeniedResponse(role, allowedRoles);
      return {
        intent,
        content: `AI TOOL RESULT: Access denied.
The signed-in role "${role || 'UNKNOWN'}" is not allowed to use the ${intent} tool.
Tell the user that this request requires one of these roles: ${[...allowedRoles].join(', ')}.`,
        directResponse,
      };
    }

    if (intent === 'student_masterlist') {
      const activeAcademicYear = await this.drizzle.db.query.academicYear.findFirst({
        where: eq(schema.academicYear.isActive, true),
      });
      return this.buildStudentMasterlistContext(
        this.extractMasterlistGrade(latestUserMessage),
        activeAcademicYear?.id,
        activeAcademicYear?.code,
      );
    }

    const learnerName = this.extractLearnerName(latestUserMessage, intent);
    if (!learnerName) {
      return {
        intent,
        content: `AI TOOL RESULT: Missing learner name.
Ask the user which learner to look up. Example: "fetch Aadam records" or "assess Aadam billing".`,
      };
    }

    const activeAcademicYear = await this.drizzle.db.query.academicYear.findFirst({
      where: eq(schema.academicYear.isActive, true),
    });
    const matches = await this.findLearners(learnerName, activeAcademicYear?.id);

    if (!matches.length) {
      return {
        intent,
        content: `AI TOOL RESULT: No learner found for "${learnerName}".
Ask the user to verify the spelling, LRN, or student number.`,
        directResponse: this.renderNoLearnerResponse(learnerName),
      };
    }

    const exactMatch = matches.find(student => this.isExactLearnerMatch(student, learnerName));
    if (!exactMatch || matches.length > 1) {
      return {
        intent,
        content: `AI TOOL RESULT: Learner selection required for "${learnerName}".
Do not guess. Ask the user to click the exact learner before continuing.`,
        directResponse: this.renderLearnerChoices(learnerName, intent, matches),
      };
    }

    return intent === 'billing_assessment'
      ? this.buildBillingContext(exactMatch.id, activeAcademicYear?.id)
      : this.buildLearnerRecordContext(exactMatch.id, activeAcademicYear?.id);
  }

  detectIntent(message: string): ToolIntent | null {
    if (this.isInstructionalQuestion(message)) {
      return null;
    }
    const text = message.toLowerCase();
    if (/\b(masterlist|class\s*list|learner\s*list|student\s*list)\b/.test(text)) {
      return 'student_masterlist';
    }
    if (/\b(show|list|display|get)\b/.test(text) && /\b(learners|students)\b/.test(text) && /\b(grade|nursery|kinder|kindergarten|prep)\b/.test(text)) {
      return 'student_masterlist';
    }
    if (/\b(assess|assessment|billing|bill|balance|ledger|tuition|payment|payments|finance)\b/.test(text)) {
      return 'billing_assessment';
    }
    if (/\b(fetch|show|get|find|view|open|summarize)\b/.test(text) && /\b(record|records|profile|learner|student|grades|attendance)\b/.test(text)) {
      return 'learner_record';
    }
    return null;
  }

  private detectRoleFallbackIntent(role: string, message: string): ToolIntent | null {
    if (this.isInstructionalQuestion(message)) {
      return null;
    }
    const text = message.toLowerCase();
    const explicitNamedLookup = /\b(fetch|show|get|find|view|open)\b/.test(text)
      && this.extractLooseLookupName(message).length >= 2;
    const bareLearnerLookup = this.looksLikeBareLearnerLookup(message)
      && (LEARNER_RECORD_ROLES.has(role) || role === 'FINANCE');
    if (!explicitNamedLookup && !bareLearnerLookup) {
      return null;
    }
    return role === 'FINANCE' ? 'billing_assessment' : 'learner_record';
  }

  private isInstructionalQuestion(message: string): boolean {
    return /^\s*(how\s+to|how\s+do\s+i|how\s+can\s+i|what\s+is|what\s+are|why\s+does|why\s+is|explain)\b/i.test(message);
  }

  private looksLikeBareLearnerLookup(message: string): boolean {
    const value = message.trim();
    if (!value || value.length < 2 || value.length > 80) {
      return false;
    }
    if (!/^[\p{L}\p{N} .,'-]+$/u.test(value)) {
      return false;
    }
    const words = value.split(/\s+/).filter(Boolean);
    if (words.length > 4) {
      return false;
    }
    const blocked = /\b(help|hello|hi|thanks|thank|dashboard|report|reports|event|holiday|calendar|attendance|schedule|class|classes|teacher|finance|billing|payment|masterlist|list|show|fetch|get|find|view|open)\b/i;
    return !blocked.test(value);
  }

  private allowedRolesForIntent(intent: ToolIntent): Set<string> {
    if (intent === 'billing_assessment') {
      return BILLING_ASSESSMENT_ROLES;
    }
    if (intent === 'student_masterlist') {
      return STUDENT_MASTERLIST_ROLES;
    }
    return LEARNER_RECORD_ROLES;
  }

  extractLearnerName(message: string, intent: ToolIntent): string {
    if (intent === 'student_masterlist') {
      return '';
    }
    const phrasePatterns = intent === 'billing_assessment'
      ? [
          /\bassess\s+(.+?)\s+billing\b/i,
          /\bbilling\s+(?:of|for|assessment\s+for)?\s*(.+?)(?:\s+regarding|\s+about|\s+please|$)/i,
          /\bbalance\s+(?:of|for)?\s*(.+?)(?:\s+regarding|\s+about|\s+please|$)/i,
        ]
      : [
          /\b(?:fetch|show|get|find|view|open|summarize)\s+(.+?)\s+(?:record|records|profile)\b/i,
          /\b(?:record|records|profile)\s+(?:of|for)?\s*(.+?)(?:\s+regarding|\s+about|\s+please|$)/i,
        ];

    for (const pattern of phrasePatterns) {
      const match = message.match(pattern)?.[1]?.trim();
      if (match) {
        return match.replace(/\s+/g, ' ');
      }
    }

    let value = message
      .replace(/[?!.]/g, ' ')
      .replace(/\b(please|can you|could you|kindly|show me|give me)\b/gi, ' ')
      .replace(/\b(fetch|show|get|find|view|open|summarize|assess|assessment|billing|bill|balance|ledger|tuition|payment|payments|finance|record|records|profile|learner|student|of|for|regarding|about)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (intent === 'billing_assessment') {
      value = value.replace(/\bfees?\b/gi, ' ').replace(/\s+/g, ' ').trim();
    }
    return value;
  }

  extractMasterlistGrade(message: string): string | undefined {
    const text = message.toLowerCase();
    const gradeMatch = text.match(/\bgrade\s*(\d{1,2})\b/);
    if (gradeMatch) {
      return `Grade ${Number(gradeMatch[1])}`;
    }
    const namedLevels = [
      'nursery',
      'kindergarten',
      'kinder',
      'prep',
    ];
    const match = namedLevels.find(level => new RegExp(`\\b${level}\\b`, 'i').test(message));
    if (!match) {
      return undefined;
    }
    return match === 'kinder' ? 'Kindergarten' : match.charAt(0).toUpperCase() + match.slice(1);
  }

  private extractLooseLookupName(message: string): string {
    return message
      .replace(/[?!.]/g, ' ')
      .replace(/\b(please|can you|could you|kindly|show me|give me)\b/gi, ' ')
      .replace(/\b(fetch|show|get|find|view|open|record|records|profile|learner|student|of|for)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private renderAccessDeniedResponse(role: string, allowedRoles: Set<string>): string {
    return `## Access Denied

Your current role **${role || 'UNKNOWN'}** cannot access this school-system record tool.

Required role: **${[...allowedRoles].join(', ')}**.

Ask an authorized registrar, finance, principal, or admin user to open the record if this is needed for official work.`;
  }

  private async findLearners(search: string, activeAcademicYearId?: string) {
    const pattern = `%${search.replace(/%/g, '\\%')}%`;
    const nameFilter = or(
      ilike(schema.student.firstName, pattern),
      ilike(schema.student.lastName, pattern),
      ilike(schema.student.lrn, pattern),
      ilike(schema.student.studentNo, pattern),
    );
    const where = activeAcademicYearId
      ? and(eq(schema.student.academicYearId, activeAcademicYearId), nameFilter)
      : nameFilter;

    const directMatches = await this.drizzle.db.query.student.findMany({
      where,
      columns: {
        id: true,
        studentNo: true,
        lrn: true,
        firstName: true,
        middleName: true,
        lastName: true,
        suffix: true,
        gradeLevel: true,
        section: true,
        adviser: true,
        enrollmentStatus: true,
        documentStatus: true,
        financeStatus: true,
        academicYearId: true,
      },
      limit: 6,
    });
    if (directMatches.length) {
      return directMatches;
    }

    const broadWhere = activeAcademicYearId ? eq(schema.student.academicYearId, activeAcademicYearId) : undefined;
    const broadMatches = await this.drizzle.db.query.student.findMany({
      where: broadWhere,
      columns: {
        id: true,
        studentNo: true,
        lrn: true,
        firstName: true,
        middleName: true,
        lastName: true,
        suffix: true,
        gradeLevel: true,
        section: true,
        adviser: true,
        enrollmentStatus: true,
        documentStatus: true,
        financeStatus: true,
        academicYearId: true,
      },
      limit: 250,
    });

    return broadMatches
      .map(student => ({ student, score: this.learnerMatchScore(student, search) }))
      .filter(match => match.score <= Math.max(3, Math.ceil(search.length * 0.35)))
      .sort((a, b) => a.score - b.score || this.fullName(a.student).localeCompare(this.fullName(b.student)))
      .slice(0, 6)
      .map(match => match.student);
  }

  private async buildLearnerRecordContext(studentId: string, academicYearId?: string): Promise<AiToolContext> {
    const [student, academicRecords, coreValues, healthProfiles] = await Promise.all([
      this.drizzle.db.query.student.findFirst({
        where: eq(schema.student.id, studentId),
        columns: {
          id: true,
          studentNo: true,
          lrn: true,
          firstName: true,
          middleName: true,
          lastName: true,
          suffix: true,
          birthdate: true,
          gender: true,
          gradeLevel: true,
          section: true,
          adviser: true,
          studentType: true,
          enrollmentStatus: true,
          documentStatus: true,
          financeStatus: true,
          guardian: true,
          contactNo: true,
          address: true,
          motherTongue: true,
          dialect: true,
          motherName: true,
          motherContact: true,
          fatherName: true,
          fatherContact: true,
          phAddress: true,
          uaeAddress: true,
          previousSchool: true,
          academicYearId: true,
        },
      }),
      this.drizzle.db.query.academicRecord.findMany({
        where: academicYearId
          ? and(eq(schema.academicRecord.studentId, studentId), eq(schema.academicRecord.academicYearId, academicYearId))
          : eq(schema.academicRecord.studentId, studentId),
        orderBy: [desc(schema.academicRecord.schoolYear)],
        limit: 6,
      }),
      this.drizzle.db.query.studentCoreValues.findMany({
        where: eq(schema.studentCoreValues.studentId, studentId),
        limit: 4,
      }).catch(() => []),
      this.drizzle.db.query.studentHealthProfile.findMany({
        where: eq(schema.studentHealthProfile.studentId, studentId),
        limit: 2,
      }).catch(() => []),
    ]);

    const payload = { student, academicRecords, coreValues, healthProfiles };

    return {
      intent: 'learner_record',
      content: `AI TOOL RESULT: Learner record context fetched from the school database.
Use only this context. Do not invent missing fields. Mention if a field is unavailable.

${JSON.stringify(payload, null, 2)}`,
      directResponse: this.renderLearnerRecordResponse(payload),
    };
  }

  private async buildBillingContext(studentId: string, academicYearId?: string): Promise<AiToolContext> {
    const [student, assessment] = await Promise.all([
      this.drizzle.db.query.student.findFirst({
        where: eq(schema.student.id, studentId),
        columns: {
          id: true,
          studentNo: true,
          lrn: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gradeLevel: true,
          section: true,
          enrollmentStatus: true,
          financeStatus: true,
          academicYearId: true,
        },
      }),
      this.drizzle.db.query.studentAssessment.findFirst({
        where: academicYearId
          ? and(eq(schema.studentAssessment.studentId, studentId), eq(schema.studentAssessment.academicYearId, academicYearId))
          : eq(schema.studentAssessment.studentId, studentId),
        with: {
          studentAssessmentLineItems: {
            with: { feeType: true },
          },
          payments: {
            orderBy: [desc(schema.payment.paymentDate)],
          },
        },
      }),
    ]);

    const payload = { student, assessment };

    return {
      intent: 'billing_assessment',
      content: `AI TOOL RESULT: Finance billing context fetched from the school database.
Use only the learner and ledger values below. Do not invent charges, payments, dates, discounts, balances, or receipt numbers.
If assessment is null, say there is no official billing assessment recorded in the school system.

${JSON.stringify(payload, null, 2)}`,
      directResponse: this.renderBillingAssessmentResponse(payload),
    };
  }

  private async buildStudentMasterlistContext(gradeLevel?: string, academicYearId?: string, academicYearCode?: string): Promise<AiToolContext> {
    const filters: SQL<unknown>[] = [];
    if (academicYearId) {
      filters.push(eq(schema.student.academicYearId, academicYearId));
    }
    if (gradeLevel) {
      filters.push(ilike(schema.student.gradeLevel, gradeLevel));
    }
    const where = filters.length ? and(...filters) : undefined;
    const students = await this.drizzle.db.query.student.findMany({
      where,
      columns: {
        id: true,
        studentNo: true,
        lrn: true,
        firstName: true,
        middleName: true,
        lastName: true,
        suffix: true,
        gradeLevel: true,
        section: true,
        enrollmentStatus: true,
        documentStatus: true,
        financeStatus: true,
        academicYearId: true,
      },
      orderBy: [asc(schema.student.gradeLevel), asc(schema.student.lastName), asc(schema.student.firstName)],
      limit: 300,
    });

    return {
      intent: 'student_masterlist',
      content: `AI TOOL RESULT: Student masterlist fetched from the school database.
Use only these records. Do not invent learners. Present a concise table first, then finance-relevant notes.
Academic year: ${academicYearCode || academicYearId || 'active academic year'}
Grade filter: ${gradeLevel || 'All grade levels'}
Record count: ${students.length}

${JSON.stringify({ gradeLevel: gradeLevel || null, academicYearId: academicYearId || null, students }, null, 2)}`,
    };
  }

  private renderLearnerRecordResponse(payload: { student: any; academicRecords: any[]; coreValues: any[]; healthProfiles: any[] }): string {
    const { student, academicRecords, coreValues, healthProfiles } = payload;
    if (!student) {
      return `## Learner Record Not Found\n\nNo learner record was found in the school database for the selected student.`;
    }

    const learnerRows: Array<[string, unknown]> = [
      ['Full name', this.fullName(student)],
      ['Student no.', student.studentNo],
      ['LRN', student.lrn],
      ['Grade level', student.gradeLevel],
      ['Section', student.section],
      ['Adviser', student.adviser],
      ['Student type', student.studentType],
      ['Enrollment status', student.enrollmentStatus],
      ['Document status', student.documentStatus],
      ['Finance status', student.financeStatus],
      ['Birth date', this.formatDate(student.birthdate)],
      ['Gender', student.gender],
      ['Mother tongue', student.motherTongue],
      ['Dialect', student.dialect],
      ['Guardian', student.guardian],
      ['Mobile number', student.contactNo],
      ['Mother name', student.motherName],
      ['Mother contact', student.motherContact],
      ['Father name', student.fatherName],
      ['Father contact', student.fatherContact],
      ['Current address', student.address],
      ['Philippine address', student.phAddress],
      ['UAE address', student.uaeAddress],
      ['Previous school', student.previousSchool],
    ];

    const learnerTable = this.renderKeyValueTable(learnerRows);
    const academicTable = academicRecords?.length
      ? this.renderMarkdownTable(
          ['School year', 'Grade', 'Section', 'General average', 'Status'],
          academicRecords.map(record => [
            record.schoolYear,
            record.gradeLevel,
            record.section,
            record.generalAverage ?? record.average ?? record.finalAverage,
            record.status,
          ]),
        )
      : 'No academic record rows are recorded in the school database for this lookup.';
    const coreValueCount = Array.isArray(coreValues) ? coreValues.length : 0;
    const healthProfileCount = Array.isArray(healthProfiles) ? healthProfiles.length : 0;

    return `## Official Learner Record\n\nSource: school database. Missing fields are shown as **Not recorded**.\n\n${learnerTable}\n\n## Academic Records\n\n${academicTable}\n\n## Additional Record Counts\n\n- Core values records: **${coreValueCount}**\n- Health profile records: **${healthProfileCount}**`;
  }

  private renderBillingAssessmentResponse(payload: { student: any; assessment: any }): string {
    const { student, assessment } = payload;
    if (!student) {
      return `## Learner Not Found\n\nNo learner record was found in the school database for the selected student.`;
    }

    const learnerSummary = this.renderKeyValueTable([
      ['Full name', this.fullName(student)],
      ['Student no.', student.studentNo],
      ['LRN', student.lrn],
      ['Grade level', student.gradeLevel],
      ['Section', student.section],
      ['Enrollment status', student.enrollmentStatus],
      ['Finance status', student.financeStatus],
    ]);

    if (!assessment) {
      return `## No Billing Assessment Found\n\nSource: school database.\n\n${learnerSummary}\n\nNo official charges, payments, or balance are recorded for this learner in the active billing assessment table. Finance must create or verify the assessment before any amount can be stated.`;
    }

    const lineItems = Array.isArray(assessment.studentAssessmentLineItems) ? assessment.studentAssessmentLineItems : [];
    const payments = Array.isArray(assessment.payments) ? assessment.payments : [];
    const totals = this.renderKeyValueTable([
      ['Gross amount', this.formatMoney(assessment.grossAmount)],
      ['Discount amount', this.formatMoney(assessment.discountAmount)],
      ['Net amount', this.formatMoney(assessment.netAmount)],
      ['Paid amount', this.formatMoney(assessment.paidAmount)],
      ['Balance', this.formatMoney(assessment.balance)],
      ['Finance status', assessment.financeStatus],
    ]);
    const chargesTable = lineItems.length
      ? this.renderMarkdownTable(
          ['Fee type', 'Description', 'Amount'],
          lineItems.map(item => [
            item.feeType?.name,
            item.description,
            this.formatMoney(item.amount),
          ]),
        )
      : 'No charge line items are recorded for this assessment.';
    const paymentsTable = payments.length
      ? this.renderMarkdownTable(
          ['Receipt', 'Date', 'Method', 'Amount', 'Remarks'],
          payments.map(payment => [
            payment.receiptNumber,
            this.formatDate(payment.paymentDate),
            payment.method,
            this.formatMoney(payment.amount),
            payment.remarks,
          ]),
        )
      : 'No payment rows are recorded for this assessment.';

    return `## Official Billing Assessment\n\nSource: school database. Only recorded ledger values are shown.\n\n${learnerSummary}\n\n## Ledger Totals\n\n${totals}\n\n## Charges\n\n${chargesTable}\n\n## Payments\n\n${paymentsTable}`;
  }

  private renderKeyValueTable(rows: Array<[string, unknown]>): string {
    return this.renderMarkdownTable(['Field', 'Value'], rows);
  }

  private renderMarkdownTable(headers: string[], rows: Array<unknown[]>): string {
    const header = `| ${headers.map(value => this.tableCell(value)).join(' | ')} |`;
    const separator = `| ${headers.map(() => '---').join(' | ')} |`;
    const body = rows.map(row => `| ${row.map(value => this.tableCell(value)).join(' | ')} |`).join('\n');
    return [header, separator, body].filter(Boolean).join('\n');
  }

  private tableCell(value: unknown): string {
    return this.escapeHtml(this.formatValue(value)).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return 'Not recorded';
    }
    return `${value}`;
  }

  private formatDate(value: unknown): string {
    const raw = this.formatValue(value);
    if (raw === 'Not recorded') {
      return raw;
    }
    return raw.slice(0, 10);
  }

  private formatMoney(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return 'Not recorded';
    }
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return this.formatValue(value);
    }
    return `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  private fullName(student: { firstName?: string | null; middleName?: string | null; lastName?: string | null; suffix?: string | null }) {
    return [student.firstName, student.middleName, student.lastName, student.suffix].filter(Boolean).join(' ');
  }

  private parseToolCommand(message: string): { tool: 'learner.record' | 'finance.billing'; studentId: string } | null {
    const match = message.match(/\bAI_TOOL\s+(learner\.record|finance\.billing)\s+studentId=([^\s]+)/i);
    if (!match) {
      return null;
    }
    return {
      tool: match[1].toLowerCase() as 'learner.record' | 'finance.billing',
      studentId: match[2],
    };
  }

  private isExactLearnerMatch(
    student: { studentNo?: string | null; lrn?: string | null; firstName?: string | null; middleName?: string | null; lastName?: string | null; suffix?: string | null },
    search: string,
  ): boolean {
    const needle = this.normalizeSearch(search);
    const exactValues = [
      student.studentNo,
      student.lrn,
      this.fullName(student),
      [student.firstName, student.lastName].filter(Boolean).join(' '),
    ].map(value => this.normalizeSearch(value || ''));
    return exactValues.some(value => value && value === needle);
  }

  private renderNoLearnerResponse(search: string): string {
    return `## Learner Not Found\n\nI could not find a learner matching **${this.escapeHtml(search)}** in the active school year.\n\n**Try typing:** full name, LRN, or student number.`;
  }

  private renderLearnerChoices(intentSearch: string, intent: ToolIntent, matches: Array<{
    id: string;
    studentNo?: string | null;
    lrn?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    suffix?: string | null;
    gradeLevel?: string | null;
    section?: string | null;
  }>): string {
    const primaryTool = intent === 'billing_assessment' ? 'finance.billing' : 'learner.record';
    const secondaryTool = intent === 'billing_assessment' ? 'learner.record' : 'finance.billing';
    const primaryLabel = intent === 'billing_assessment' ? 'Assess Billing' : 'Fetch Records';
    const secondaryLabel = intent === 'billing_assessment' ? 'Fetch Records' : 'Assess Billing';
    const cards = matches.map((student, index) => {
      const name = this.escapeHtml(this.fullName(student) || 'Unnamed learner');
      const meta = this.escapeHtml([student.gradeLevel, student.section].filter(Boolean).join(' - ') || 'No grade/section');
      const studentNo = this.escapeHtml(student.studentNo || 'No student no.');
      const lrn = this.escapeHtml(student.lrn || 'No LRN');
      const id = this.escapeHtml(student.id);
      return `<article class="ai-tool-card ai-learner-result-card">
  <span class="ai-learner-result-index">${index + 1}</span>
  <button type="button" class="ai-tool-chip ai-learner-result-name" data-ai-tool="${primaryTool}" data-student-id="${id}" data-student-name="${name}">${name}</button>
  <span>${meta}</span>
  <small>Student No: ${studentNo} | LRN: ${lrn}</small>
  <div class="ai-tool-actions">
    <button type="button" class="ai-tool-chip" data-ai-tool="${primaryTool}" data-student-id="${id}" data-student-name="${name}">${primaryLabel}</button>
    <button type="button" class="ai-tool-chip secondary" data-ai-tool="${secondaryTool}" data-student-id="${id}" data-student-name="${name}">${secondaryLabel}</button>
  </div>
</article>`;
    }).join('\n');

    return `## Learner Search: ${this.escapeHtml(intentSearch)}\n\nI found **${matches.length}** possible learner match${matches.length === 1 ? '' : 'es'} in the active school year. Click a learner name to fetch the correct school record.\n\n<div class="ai-tool-choice-list ai-learner-result-list">\n${cards}\n</div>`;
  }

  private learnerMatchScore(
    student: { studentNo?: string | null; lrn?: string | null; firstName?: string | null; middleName?: string | null; lastName?: string | null; suffix?: string | null },
    search: string,
  ): number {
    const needle = this.normalizeSearch(search);
    const values = [
      student.studentNo,
      student.lrn,
      student.firstName,
      student.lastName,
      [student.firstName, student.lastName].filter(Boolean).join(' '),
      this.fullName(student),
    ].map(value => this.normalizeSearch(value || '')).filter(Boolean);
    if (values.some(value => value === needle)) {
      return 0;
    }
    if (values.some(value => value.includes(needle) || needle.includes(value))) {
      return 1;
    }
    return Math.min(...values.map(value => this.levenshtein(value, needle)), 999);
  }

  private normalizeSearch(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  }

  private levenshtein(a: string, b: string): number {
    const rows = Array.from({ length: a.length + 1 }, (_, index) => [index]);
    for (let column = 1; column <= b.length; column += 1) {
      rows[0][column] = column;
    }
    for (let row = 1; row <= a.length; row += 1) {
      for (let column = 1; column <= b.length; column += 1) {
        rows[row][column] = a[row - 1] === b[column - 1]
          ? rows[row - 1][column - 1]
          : Math.min(rows[row - 1][column - 1], rows[row][column - 1], rows[row - 1][column]) + 1;
      }
    }
    return rows[a.length][b.length];
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

