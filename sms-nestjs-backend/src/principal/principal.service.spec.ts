import { BadRequestException } from '@nestjs/common';
import { createDrizzleMock } from '../test/drizzle-mock';
import { PrincipalService } from './principal.service';

describe('PrincipalService', () => {
  function createService() {
    const db = createDrizzleMock({
      query: {
        academicYear: { findFirst: jest.fn() },
        student: { findMany: jest.fn() },
        section: { findMany: jest.fn() },
        user: { findMany: jest.fn() },
        teacherClassAssignment: { findMany: jest.fn() },
        teacherAttendanceRecord: { findMany: jest.fn() },
        teacherGradeRecord: { findMany: jest.fn() },
        academicRecord: { findMany: jest.fn() },
        calendarEvent: { findMany: jest.fn() },
      },
    });
    return { db, service: new PrincipalService({ db } as never) };
  }

  it('requires an academic year id', async () => {
    const { service } = createService();

    await expect(service.getOverview('')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires an existing academic year', async () => {
    const { db, service } = createService();
    (db.query.academicYear.findFirst as jest.Mock).mockResolvedValue(undefined);

    await expect(service.getOverview('missing-ay')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns live principal overview data and generated alerts', async () => {
    const { db, service } = createService();
    (db.query.academicYear.findFirst as jest.Mock).mockResolvedValue({
      id: 'ay-1',
      code: 'SY2026-2027',
      isActive: true,
    });
    (db.query.student.findMany as jest.Mock).mockResolvedValue([
      { id: 's1', firstName: 'Aamir', middleName: '', lastName: 'Baliong', gradeLevel: 'Nursery', section: 'NURSERY', enrollmentStatus: 'Enrolled' },
      { id: 's2', firstName: 'Risk', middleName: '', lastName: 'Learner', gradeLevel: 'Grade 1', section: 'G1', enrollmentStatus: 'Pending' },
    ]);
    (db.query.section.findMany as jest.Mock).mockResolvedValue([
      { id: 'sec-1', gradeLevel: 'Nursery', sectionName: 'NURSERY', adviser: 'Jianne Briones', capacity: 11, enrolled: 11, academicYearId: 'ay-1' },
    ]);
    (db.query.user.findMany as jest.Mock).mockResolvedValue([
      {
        id: 't1',
        email: 'jbriones.13579@gmail.com',
        role: 'TEACHER',
        teacherProfiles: [{ name: 'Jianne Briones', department: 'Nursery', accountStatus: 'Active', totalClassesHandled: 1 }],
      },
    ]);
    (db.query.teacherClassAssignment.findMany as jest.Mock).mockResolvedValue([
      { id: 'class-1', teacherUserId: 't1', academicYearId: 'ay-1', sectionId: 'sec-1', sectionName: 'NURSERY', subject: 'Reading', room: 'Room 1' },
    ]);
    (db.query.teacherAttendanceRecord.findMany as jest.Mock).mockResolvedValue([
      { id: 'att-1', classId: 'class-1', studentId: 's1', status: 'present', date: '2026-06-01' },
      { id: 'att-2', classId: 'class-1', studentId: 's2', status: 'absent', date: '2026-06-01' },
      { id: 'att-other', classId: 'other-class', studentId: 's2', status: 'absent', date: '2026-06-01' },
    ]);
    (db.query.teacherGradeRecord.findMany as jest.Mock).mockResolvedValue([
      { id: 'g1', classId: 'class-1', studentId: 's1', quarter: 'Q1', written: 90, performance: 92, exam: 91 },
      { id: 'g2', classId: 'class-1', studentId: 's2', quarter: 'Q1', written: 70, performance: 72, exam: 71 },
      { id: 'g-other', classId: 'other-class', studentId: 's2', quarter: 'Q1', written: 10, performance: 10, exam: 10 },
    ]);
    (db.query.academicRecord.findMany as jest.Mock).mockResolvedValue([]);
    (db.query.calendarEvent.findMany as jest.Mock).mockResolvedValue([
      { id: 'cal-1', title: 'Foundation Day', eventType: 'Holiday', eventDate: '2026-06-20T00:00:00.000Z', academicYearId: 'ay-1' },
      { id: 'cal-shared', title: 'Shared', eventType: 'Event', eventDate: '2026-06-21T00:00:00.000Z', academicYearId: null },
      { id: 'cal-other', title: 'Other Year', eventType: 'Event', eventDate: '2026-06-22T00:00:00.000Z', academicYearId: 'ay-2' },
    ]);

    const overview = await service.getOverview('ay-1', {
      id: 'p1',
      email: 'principal@sfxsai.com',
      name: 'Principal User',
    });

    expect(overview.academicYear.id).toBe('ay-1');
    expect(overview.principalProfile.email).toBe('principal@sfxsai.com');
    expect(overview.students).toHaveLength(2);
    expect(overview.sections).toHaveLength(1);
    expect(overview.teachers).toHaveLength(1);
    expect((overview as any).teacherClassAssignments).toBeUndefined();
    expect(overview.attendanceRecords.map((record: any) => record.id)).toEqual(['att-1', 'att-2']);
    expect(overview.gradeRecords.map((record: any) => record.id)).toEqual(['g1', 'g2']);
    expect(overview.calendarEvents.map((event: any) => event.id)).toEqual(['cal-1', 'cal-shared']);
    expect(overview.alerts.some((alert: any) => alert.title.includes('attendance'))).toBe(true);
    expect(overview.alerts.some((alert: any) => alert.title.includes('academic intervention'))).toBe(true);
    expect(overview.alerts.some((alert: any) => alert.title.includes('at capacity'))).toBe(true);
  });
});
