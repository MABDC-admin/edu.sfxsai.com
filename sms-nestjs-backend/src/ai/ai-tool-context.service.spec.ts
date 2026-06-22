import { AiToolContextService } from './ai-tool-context.service';

describe('AI tool context service', () => {
  const service = new AiToolContextService({} as any);

  it('detects learner record lookup prompts', () => {
    expect(service.detectIntent('fetch Aadam records')).toBe('learner_record');
    expect(service.extractLearnerName('fetch Aadam records', 'learner_record')).toBe('Aadam');
  });

  it('treats a finance user fetch-name prompt as a finance learner lookup', async () => {
    const lookup = new AiToolContextService({
      db: {
        query: {
          academicYear: { findFirst: jest.fn().mockResolvedValue({ id: 'ay-1' }) },
        },
      },
    } as any);
    jest.spyOn(lookup as any, 'findLearners').mockResolvedValue([
      {
        id: 'student-precilda',
        studentNo: 'S-070',
        lrn: 'LRN-070',
        firstName: 'Kawhai Eurus',
        middleName: null,
        lastName: 'Precilda',
        suffix: null,
        gradeLevel: 'Grade 2',
        section: 'Faith',
      },
    ]);

    const result = await lookup.resolve(
      { role: 'FINANCE' },
      [{ role: 'user', content: 'fetch Precilda' }],
    );

    expect(result?.directResponse).toContain('Learner Search');
    expect(result?.directResponse).toContain('data-ai-tool="finance.billing"');
    expect(result?.directResponse).toContain('student-precilda');
  });

  it('does not turn finance general help questions into learner searches', async () => {
    const lookup = new AiToolContextService({ db: { query: {} } } as any);

    await expect(lookup.resolve(
      { role: 'FINANCE' },
      [{ role: 'user', content: 'how to find needle' }],
    )).resolves.toBeNull();

    await expect(lookup.resolve(
      { role: 'FINANCE' },
      [{ role: 'user', content: 'how to find a receipt in finance' }],
    )).resolves.toBeNull();
  });

  it('detects finance billing assessment prompts and extracts only the learner name', () => {
    expect(service.detectIntent('assess Aadam billing')).toBe('billing_assessment');
    expect(service.extractLearnerName('assess Aadam billing regarding what grade he is', 'billing_assessment')).toBe('Aadam');
  });

  it('returns access denied as a direct response without calling the model', async () => {
    const lookup = new AiToolContextService({ db: { query: {} } } as any);

    const result = await lookup.resolve(
      { role: 'TEACHER' },
      [{ role: 'user', content: 'fetch Aamir records' }],
    );

    expect(result?.intent).toBe('learner_record');
    expect(result?.content).toContain('Access denied');
    expect(result?.directResponse).toContain('Access Denied');
    expect(result?.directResponse).toContain('ADMIN, REGISTRAR, PRINCIPAL');
  });

  it('resolves grade and nursery masterlist prompts from the database for finance users', async () => {
    const studentRows = [
      {
        id: 'student-1',
        studentNo: 'S-001',
        lrn: 'LRN-001',
        firstName: 'Maria',
        middleName: null,
        lastName: 'Santos',
        suffix: null,
        gradeLevel: 'Nursery',
        section: 'A',
        enrollmentStatus: 'Officially Enrolled',
        financeStatus: 'With Balance',
      },
    ];
    const lookup = new AiToolContextService({
      db: {
        query: {
          academicYear: { findFirst: jest.fn().mockResolvedValue({ id: 'ay-1', code: 'SY2026-2027' }) },
          student: { findMany: jest.fn().mockResolvedValue(studentRows) },
        },
      },
    } as any);

    const result = await lookup.resolve(
      { role: 'FINANCE' },
      [{ role: 'user', content: 'show nursery masterlist' }],
    );

    expect(result?.intent).toBe('student_masterlist');
    expect(result?.content).toContain('Student masterlist fetched from the school database');
    expect(result?.content).toContain('Nursery');
    expect(result?.content).toContain('Maria');
  });

  it('extracts Grade 7 from learner list prompts', () => {
    expect(service.detectIntent('show learners in grade 7')).toBe('student_masterlist');
    expect(service.extractMasterlistGrade('show learners in grade 7')).toBe('Grade 7');
  });

  it('asks the user to click a learner when a partial name is not an exact match', async () => {
    const lookup = new AiToolContextService({
      db: {
        query: {
          academicYear: { findFirst: jest.fn().mockResolvedValue({ id: 'ay-1' }) },
        },
      },
    } as any);
    jest.spyOn(lookup as any, 'findLearners').mockResolvedValue([
      {
        id: 'student-1',
        studentNo: 'S-001',
        lrn: 'LRN-001',
        firstName: 'Aadam',
        middleName: null,
        lastName: 'Reyes',
        suffix: null,
        gradeLevel: 'Grade 3',
        section: 'St. Luke',
      },
    ]);

    const result = await lookup.resolve(
      { role: 'REGISTRAR' },
      [{ role: 'user', content: 'fetch Aadam records' }],
    );

    expect(result?.directResponse).toContain('Learner Search');
    expect(result?.directResponse).toContain('data-ai-tool="learner.record"');
    expect(result?.directResponse).toContain('data-student-id="student-1"');
  });

  it('renders surname-only registrar learner search results with clickable learner names', async () => {
    const lookup = new AiToolContextService({
      db: {
        query: {
          academicYear: { findFirst: jest.fn().mockResolvedValue({ id: 'ay-1', code: 'SY2026-2027' }) },
        },
      },
    } as any);
    jest.spyOn(lookup as any, 'findLearners').mockResolvedValue([
      {
        id: 'student-dargantes-1',
        studentNo: 'S-014',
        lrn: 'LRN-014',
        firstName: 'Jayden Kris',
        middleName: 'Galindez',
        lastName: 'Dargantes',
        suffix: null,
        gradeLevel: 'Grade 3',
        section: 'SFXSAI',
      },
      {
        id: 'student-dargantes-2',
        studentNo: 'S-020',
        lrn: 'LRN-020',
        firstName: 'Ford Luigi',
        middleName: null,
        lastName: 'Dargantes Torrion',
        suffix: null,
        gradeLevel: 'Grade 7',
        section: 'SFXSAI',
      },
    ]);

    const result = await lookup.resolve(
      { role: 'REGISTRAR' },
      [{ role: 'user', content: 'dargantes' }],
    );

    expect(result?.intent).toBe('learner_record');
    expect(result?.directResponse).toContain('Learner Search');
    expect(result?.directResponse).toContain('ai-learner-result-name');
    expect(result?.directResponse).toContain('data-ai-tool="learner.record"');
    expect(result?.directResponse).toContain('data-student-id="student-dargantes-1"');
    expect(result?.directResponse).toContain('Jayden Kris Galindez Dargantes');
  });

  it('fetches by exact student id when the user clicks a learner action', async () => {
    const lookup = new AiToolContextService({ db: { query: {} } } as any);
    jest.spyOn(lookup as any, 'buildLearnerRecordContext').mockResolvedValue({
      intent: 'learner_record',
      content: 'exact learner context',
    });

    const result = await lookup.resolve(
      { role: 'REGISTRAR' },
      [{ role: 'user', content: 'AI_TOOL learner.record studentId=student-1' }],
    );

    expect((lookup as any).buildLearnerRecordContext).toHaveBeenCalledWith('student-1');
    expect(result?.content).toBe('exact learner context');
  });
  it('returns a deterministic no-billing response instead of asking the model to infer charges', async () => {
    const lookup = new AiToolContextService({
      db: {
        query: {
          student: {
            findFirst: jest.fn().mockResolvedValue({
              id: 'student-rhix',
              studentNo: 'STU-2026-088',
              lrn: '121430170018',
              firstName: 'Rhix Jhoi Rhoval',
              middleName: null,
              lastName: 'Corpez Sab-a',
              gradeLevel: 'Grade 9',
              section: 'SFXSAI',
              enrollmentStatus: 'Officially Enrolled',
              financeStatus: 'Unassessed',
              academicYearId: 'ay-1',
            }),
          },
          studentAssessment: {
            findFirst: jest.fn().mockResolvedValue(null),
          },
        },
      },
    } as any);

    const result = await lookup.resolve(
      { role: 'FINANCE' },
      [{ role: 'user', content: 'AI_TOOL finance.billing studentId=student-rhix' }],
    );

    expect(result?.directResponse).toContain('No Billing Assessment Found');
    expect(result?.directResponse).toContain('STU-2026-088');
    expect(result?.directResponse).toContain('No official charges, payments, or balance are recorded');
    expect(result?.directResponse).not.toContain('18,000');
    expect(result?.directResponse).not.toContain('23,500');
  });

  it('renders learner records from database fields and marks missing guardian details as not recorded', async () => {
    const lookup = new AiToolContextService({
      db: {
        query: {
          student: {
            findFirst: jest.fn().mockResolvedValue({
              id: 'student-rhix',
              studentNo: 'STU-2026-087',
              lrn: '121430160007',
              firstName: 'Rhix Naphets Rhoval',
              middleName: null,
              lastName: 'Corpez Sab-a',
              suffix: null,
              birthdate: '2011-01-08T00:00:00.000Z',
              gender: 'Male',
              motherTongue: 'Cebuano',
              dialect: 'English, Tagalog, Cebuano',
              gradeLevel: 'Grade 10',
              section: 'SFXSAI',
              adviser: null,
              studentType: 'Transferee',
              enrollmentStatus: 'Officially Enrolled',
              documentStatus: 'Complete',
              financeStatus: 'Unassessed',
              guardian: 'Corpez, Jocelyn, Mejia',
              contactNo: '09934279232',
              address: 'Brgy. Conalum, Inopacan, Leyte',
              motherName: 'Corpez, Jocelyn, Mejia',
              motherContact: '09934279232',
              fatherName: 'Sab-a, Stephan, Dadula',
              fatherContact: null,
              phAddress: 'Brgy. Conalum, Inopacan, Leyte',
              uaeAddress: null,
              previousSchool: 'Tahud National High School',
              academicYearId: 'ay-1',
            }),
          },
          academicRecord: { findMany: jest.fn().mockResolvedValue([]) },
          studentCoreValues: { findMany: jest.fn().mockResolvedValue([]) },
          studentHealthProfile: { findMany: jest.fn().mockResolvedValue([]) },
        },
      },
    } as any);

    const result = await lookup.resolve(
      { role: 'REGISTRAR' },
      [{ role: 'user', content: 'AI_TOOL learner.record studentId=student-rhix' }],
    );

    expect(result?.directResponse).toContain('Official Learner Record');
    expect(result?.directResponse).toContain('Mother tongue');
    expect(result?.directResponse).toContain('Cebuano');
    expect(result?.directResponse).toContain('Father contact');
    expect(result?.directResponse).toContain('Not recorded');
    expect(result?.directResponse).not.toContain('09123456789');
    expect(result?.directResponse).not.toContain('09876543210');
  });
});
