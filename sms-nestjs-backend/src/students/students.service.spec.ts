import { BadRequestException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { createDrizzleMock } from '../test/drizzle-mock';
import * as schema from '../drizzle/schema';

describe('StudentsService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function createService() {
    const db = createDrizzleMock({
      query: {
        student: {
          findFirst: jest.fn(),
        },
        section: {
          findFirst: jest.fn(),
        },
        user: {
          findFirst: jest.fn(),
        },
      },
    });
    return {
      db,
      service: new StudentsService({ db } as never),
    };
  }

  it('does not return password hashes when reading a learner profile', async () => {
    const { db, service } = createService();
    (db.query.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'student-1',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      users: [
        {
          id: 'user-1',
          email: 'juan@example.com',
          password: 'hashed-secret',
          role: 'STUDENT',
        },
      ],
      studentFees: [],
      studentSiblings: [],
    });

    const result = await service.findOne('student-1');

    expect(result?.user).toEqual({
      id: 'user-1',
      email: 'juan@example.com',
      role: 'STUDENT',
    });
    expect(result?.user).not.toHaveProperty('password');
    expect(result?.fees).toEqual([]);
    expect(result?.siblings).toEqual([]);
  });

  it('creates a learner account when status changes to Officially Enrolled', async () => {
    const { db, service } = createService();
    (db.query.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'student-1',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      enrollmentStatus: 'Pending',
      users: [],
    });
    (db.query.user.findFirst as jest.Mock).mockResolvedValue(null);

    db.__queue.push('insert', {
      id: 'user-new',
      email: 'juandelacruz@sfxsai.com',
      role: 'STUDENT',
      studentId: 'student-1',
    });
    db.__queue.push('update', {
      id: 'student-1',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      enrollmentStatus: 'Officially Enrolled',
    });

    const updated = await service.update('student-1', {
      enrollmentStatus: 'Officially Enrolled',
    });

    expect(updated.user).toBeNull();
    expect(db.query.user.findFirst).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalledWith(schema.user);
  });

  it('officially enrolls a learner and auto-assigns the matching SFXSAI section', async () => {
    const { db, service } = createService();
    (db.query.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'student-auto',
      firstName: 'Auto',
      lastName: 'Assigned',
      gradeLevel: 'Grade 5',
      section: null,
      academicYearId: 'ay-2026',
      enrollmentStatus: 'Pending Review',
      users: [],
    });
    (db.query.section.findFirst as jest.Mock).mockResolvedValue({
      id: 'section-g5',
      gradeLevel: 'G5',
      sectionName: 'SFXSAI',
      enrolled: 3,
      capacity: 30,
      availableSlots: 27,
      academicYearId: 'ay-2026',
    });
    (db.query.user.findFirst as jest.Mock).mockResolvedValue(null);

    db.__queue.push('insert', {
      id: 'user-auto',
      email: 'autoassigned@sfxsai.com',
      role: 'STUDENT',
      studentId: 'student-auto',
    });
    db.__queue.push('update', {
      id: 'student-auto',
      gradeLevel: 'G5',
      section: 'SFXSAI',
      enrollmentStatus: 'Officially Enrolled',
      documentStatus: 'Complete',
    });
    db.__queue.push('update', {
      id: 'section-g5',
      enrolled: 4,
      availableSlots: 26,
    });

    const approved = await service.approveEnrollment('student-auto', { campus: 'SFXSAI' });

    expect(approved.enrollmentStatus).toBe('Officially Enrolled');
    expect(approved.documentStatus).toBe('Complete');
    expect(approved.gradeLevel).toBe('G5');
    expect(approved.section).toBe('SFXSAI');
    expect(db.query.section.findFirst).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalledWith(schema.student);
    expect(db.update).toHaveBeenCalledWith(schema.section);
    expect(db.insert).toHaveBeenCalledWith(schema.user);
  });

  it('officially enrolls without changing section when no target section has capacity', async () => {
    const { db, service } = createService();
    (db.query.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'student-no-section',
      firstName: 'No',
      lastName: 'Section',
      gradeLevel: 'Nursery',
      section: null,
      academicYearId: 'ay-2026',
      enrollmentStatus: 'Pending Review',
      users: [{ id: 'user-existing', role: 'STUDENT', studentId: 'student-no-section' }],
    });
    (db.query.section.findFirst as jest.Mock).mockResolvedValue(null);

    db.__queue.push('update', {
      id: 'student-no-section',
      gradeLevel: 'Nursery',
      section: null,
      enrollmentStatus: 'Officially Enrolled',
      documentStatus: 'Complete',
    });

    const approved = await service.approveEnrollment('student-no-section', { campus: 'SFXSAI' });

    expect(approved.enrollmentStatus).toBe('Officially Enrolled');
    expect(approved.documentStatus).toBe('Complete');
    expect(approved.section).toBeNull();
    expect(db.query.section.findFirst).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalledWith(schema.student);
    expect(db.update).not.toHaveBeenCalledWith(schema.section);
    expect(db.insert).not.toHaveBeenCalledWith(schema.user);
  });

  it('does not create a learner account when status remains non-official', async () => {
    const { db, service } = createService();
    (db.query.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'student-1',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      enrollmentStatus: 'Pending',
      users: [],
    });
    db.__queue.push('update', {
      id: 'student-1',
      enrollmentStatus: 'Pending',
    });

    const updated = await service.update('student-1', {
      enrollmentStatus: 'Pending',
    });

    expect(updated.enrollmentStatus).toBe('Pending');
    expect(db.query.user.findFirst).not.toHaveBeenCalled();
  });

  it('requires a first name and last name before creating', async () => {
    const { service } = createService();

    await expect(service.create({ firstName: '', lastName: '' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('removes a student account with Drizzle delete returning rows', async () => {
    const { db, service } = createService();
    db.__queue.push('delete', {
      id: 'student-1',
      firstName: 'Juan',
    });

    const deleted = await service.remove('student-1');

    expect(deleted).toEqual([{ id: 'student-1', firstName: 'Juan' }]);
    expect(db.delete).toHaveBeenCalledWith(schema.student);
  });

  it('stores a student sibling row via insert', async () => {
    const { db, service } = createService();
    db.__queue.push('insert', {
      id: 'sibling-1',
      studentId: 'student-1',
      fullName: 'Ana Dela Cruz',
    });

    const created = await service.addStudentSibling('student-1', {
      fullName: 'Ana Dela Cruz',
      relation: 'Sister',
    });

    expect(created).toEqual([{
      id: 'sibling-1',
      studentId: 'student-1',
      fullName: 'Ana Dela Cruz',
    }]);
    expect(db.insert).toHaveBeenCalledWith(schema.studentSibling);
  });

  it('resets student credentials using a hashed password', async () => {
    const { db, service } = createService();
    (db.query.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'juan@example.com',
      studentId: 'student-1',
    });

    db.__queue.push('update', {
      id: 'user-1',
      email: 'juan@example.com',
      role: 'STUDENT',
      studentId: 'student-1',
    });

    await service.resetPassword('student-1');

    expect(db.update).toHaveBeenCalledWith(schema.user);
  });
  it('marks a learner as transferred out, removes learner account access, and records movement history', async () => {
    const { db, service } = createService();
    (db.query.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'student-2',
      studentNo: 'STU-2026-002',
      lrn: '987654321012',
      firstName: 'Maria',
      middleName: 'Santos',
      lastName: 'Reyes',
      gradeLevel: 'Grade 8',
      section: 'SFXSAI',
      academicYearId: 'ay-2026',
      enrollmentStatus: 'Officially Enrolled',
      users: [{ id: 'user-2', role: 'STUDENT', studentId: 'student-2' }],
    });
    db.__queue.push('delete', { id: 'user-2' });
    db.__queue.push('insert', {
      id: 'movement-2',
      studentName: 'Maria Santos Reyes',
      movementType: 'Transfer Out',
      from: 'Grade 8 - SFXSAI',
      to: 'Transferred Out',
      status: 'Completed',
      requestedBy: 'Registrar',
      academicYearId: 'ay-2026',
    });
    db.__queue.push('update', {
      id: 'student-2',
      enrollmentStatus: 'Transferred Out',
      section: null,
      adviser: null,
    });

    const transferred = await service.disableStudent('student-2', {
      movementType: 'Transfer Out',
      effectiveDate: '2026-06-19T00:00:00.000Z',
      reason: 'Transferred to another school',
      remarks: 'Receiving school requested documents.',
      requestedBy: 'Registrar',
    });

    expect(transferred.enrollmentStatus).toBe('Transferred Out');
    expect(db.delete).toHaveBeenCalledWith(schema.user);
    expect(db.insert).toHaveBeenCalledWith(schema.learnerMovement);
    expect(db.update).toHaveBeenCalledWith(schema.student);
  });
  it('freezes current-year finance assessment when a learner is deactivated', async () => {
    const { db, service } = createService();
    (db.query.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'student-freeze',
      studentNo: 'STU-2026-099',
      lrn: '121430999999',
      firstName: 'Frozen',
      middleName: '',
      lastName: 'Learner',
      gradeLevel: 'G8',
      section: 'SFXSAI',
      academicYearId: 'ay-2026',
      enrollmentStatus: 'Officially Enrolled',
      users: [],
    });
    db.__queue.push('insert', { id: 'movement-freeze' });
    db.__queue.push('update', { id: 'student-freeze', enrollmentStatus: 'Dropped Out', financeStatus: 'Frozen' });
    db.__queue.push('update', { id: 'assessment-freeze', financeStatus: 'Frozen' });

    const dropped = await service.dropoutStudent('student-freeze', {
      effectiveDate: '2026-06-19T00:00:00.000Z',
      reason: 'Parent request',
      requestedBy: 'Registrar',
    });

    expect(dropped.financeStatus).toBe('Frozen');
    expect(db.update).toHaveBeenCalledWith(schema.student);
    expect(db.update).toHaveBeenCalledWith(schema.studentAssessment);
  });
  it('marks a learner as dropped out, removes learner account access, and records movement history', async () => {
    const { db, service } = createService();
    (db.query.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'student-1',
      studentNo: 'STU-2026-001',
      lrn: '123456789012',
      firstName: 'Juan',
      middleName: 'Reyes',
      lastName: 'Dela Cruz',
      gradeLevel: 'Grade 7',
      section: 'SFXSAI',
      academicYearId: 'ay-2026',
      enrollmentStatus: 'Officially Enrolled',
      users: [{ id: 'user-1', role: 'STUDENT', studentId: 'student-1' }],
    });
    db.__queue.push('delete', { id: 'user-1' });
    db.__queue.push('insert', {
      id: 'movement-1',
      studentName: 'Juan Reyes Dela Cruz',
      movementType: 'Dropout',
      from: 'Grade 7 - SFXSAI',
      to: 'Dropped Out',
      status: 'Completed',
      requestedBy: 'Registrar',
      academicYearId: 'ay-2026',
    });
    db.__queue.push('update', {
      id: 'student-1',
      enrollmentStatus: 'Dropped Out',
      section: null,
      adviser: null,
    });

    const dropped = await service.dropoutStudent('student-1', {
      effectiveDate: '2026-06-19T00:00:00.000Z',
      reason: 'Transferred to another school',
      remarks: 'Parent submitted written request.',
      requestedBy: 'Registrar',
    });

    expect(dropped.enrollmentStatus).toBe('Dropped Out');
    expect(db.delete).toHaveBeenCalledWith(schema.user);
    expect(db.insert).toHaveBeenCalledWith(schema.learnerMovement);
    expect(db.update).toHaveBeenCalledWith(schema.student);
  });
  it('moves a learner to another grade and section with movement history', async () => {
    const { db, service } = createService();
    (db.query.student.findFirst as jest.Mock).mockResolvedValue({
      id: 'student-3',
      studentNo: 'STU-2026-003',
      lrn: '121430170018',
      firstName: 'Ana',
      middleName: 'Mae',
      lastName: 'Santos',
      gradeLevel: 'Grade 7',
      section: 'SFXSAI',
      academicYearId: 'ay-2026',
      enrollmentStatus: 'Officially Enrolled',
      users: [{ id: 'user-3', role: 'STUDENT', studentId: 'student-3' }],
    });
    db.__queue.push('insert', {
      id: 'movement-3',
      studentName: 'Ana Mae Santos',
      movementType: 'Promotion',
      from: 'Grade 7 - SFXSAI',
      to: 'G8 - SFXSAI',
      status: 'Completed',
      requestedBy: 'Registrar',
      academicYearId: 'ay-2026',
    });
    db.__queue.push('update', {
      id: 'student-3',
      gradeLevel: 'G8',
      section: 'SFXSAI',
      academicYearId: 'ay-2026',
    });

    const moved = await service.moveGradeSection('student-3', {
      gradeLevel: 'Grade 8',
      section: 'SFXSAI',
      movementType: 'Promotion',
      effectiveDate: '2026-06-19T00:00:00.000Z',
      reason: 'Promoted after records review',
      requestedBy: 'Registrar',
    });

    expect(moved.gradeLevel).toBe('G8');
    expect(moved.section).toBe('SFXSAI');
    expect(db.insert).toHaveBeenCalledWith(schema.learnerMovement);
    expect(db.update).toHaveBeenCalledWith(schema.student);
  });
});


