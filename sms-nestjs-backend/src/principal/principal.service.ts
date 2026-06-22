import { BadRequestException, Injectable } from '@nestjs/common';
import { asc, eq, isNull, or } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../drizzle/schema';

type PrincipalUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

type PrincipalAlert = {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  detail: string;
  owner: string;
};

const ABSENT_LIKE_STATUSES = new Set(['absent', 'late', 'excused']);

function compactName(parts: Array<string | null | undefined>): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function learnerName(student: any): string {
  return compactName([student.firstName, student.middleName, student.lastName]) || student.name || 'Unnamed learner';
}

function average(values: number[]): number {
  const usable = values.filter(value => Number.isFinite(value));
  if (!usable.length) {
    return 0;
  }
  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
}

function gradeAverage(record: any): number {
  return average([Number(record.written ?? 0), Number(record.performance ?? 0), Number(record.exam ?? 0)]);
}

function attendanceRate(records: any[]): number {
  if (!records.length) {
    return 0;
  }

  const presentLike = records.filter(record => !ABSENT_LIKE_STATUSES.has(String(record.status ?? '').toLowerCase())).length;
  return Math.round((presentLike / records.length) * 100);
}

function calendarVisible(event: any, academicYearId: string): boolean {
  return !event.academicYearId || event.academicYearId === academicYearId;
}

function groupBy<T>(items: T[], getKey: (item: T) => string | null | undefined): Map<string, T[]> {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    if (!key) {
      return groups;
    }
    groups.set(key, [...(groups.get(key) ?? []), item]);
    return groups;
  }, new Map<string, T[]>());
}

@Injectable()
export class PrincipalService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getOverview(academicYearId: string, principal?: PrincipalUser) {
    if (!academicYearId) {
      throw new BadRequestException('academicYearId is required.');
    }

    const academicYear = await this.drizzle.db.query.academicYear.findFirst({
      where: eq(schema.academicYear.id, academicYearId),
    });
    if (!academicYear) {
      throw new BadRequestException('Academic year was not found.');
    }

    const [
      students,
      sections,
      teachers,
      teacherClassAssignments,
      attendanceRecords,
      gradeRecords,
      academicRecords,
      calendarEvents,
    ] = await Promise.all([
      this.drizzle.db.query.student.findMany({
        where: eq(schema.student.academicYearId, academicYearId),
      }),
      this.drizzle.db.query.section.findMany({
        where: eq(schema.section.academicYearId, academicYearId),
      }),
      this.drizzle.db.query.user.findMany({
        with: {
          teacherProfiles: true,
        },
      }),
      this.drizzle.db.query.teacherClassAssignment.findMany({
        where: or(
          eq(schema.teacherClassAssignment.academicYearId, academicYearId),
          isNull(schema.teacherClassAssignment.academicYearId),
        ),
        orderBy: [asc(schema.teacherClassAssignment.sectionName), asc(schema.teacherClassAssignment.subject)],
      }),
      this.drizzle.db.query.teacherAttendanceRecord.findMany({
        orderBy: [asc(schema.teacherAttendanceRecord.date)],
      }),
      this.drizzle.db.query.teacherGradeRecord.findMany({
        orderBy: [asc(schema.teacherGradeRecord.classId), asc(schema.teacherGradeRecord.studentId), asc(schema.teacherGradeRecord.quarter)],
      }),
      this.drizzle.db.query.academicRecord.findMany({
        where: eq(schema.academicRecord.academicYearId, academicYearId),
      }),
      this.drizzle.db.query.calendarEvent.findMany({
        orderBy: [asc(schema.calendarEvent.eventDate)],
      }),
    ]);

    const liveClassIds = new Set(teacherClassAssignments.map((assignment: any) => assignment.id));
    const scopedAttendance = attendanceRecords.filter((record: any) => liveClassIds.has(record.classId));
    const scopedGrades = gradeRecords.filter((record: any) => liveClassIds.has(record.classId));
    const principalTeachers = teachers.filter((user: any) => user.role === 'TEACHER' || user.teacherProfiles?.length);

    return {
      academicYear,
      principalProfile: {
        id: principal?.id ?? '',
        name: principal?.name ?? principal?.email ?? 'Principal',
        email: principal?.email ?? '',
        title: 'Principal',
      },
      students,
      sections,
      teachers: principalTeachers,
      attendanceRecords: scopedAttendance,
      gradeRecords: scopedGrades,
      academicRecords,
      calendarEvents: calendarEvents.filter((event: any) => calendarVisible(event, academicYearId)),
      alerts: this.buildAlerts(students, sections, principalTeachers, scopedAttendance, scopedGrades),
    };
  }

  private buildAlerts(
    students: any[],
    sections: any[],
    teachers: any[],
    attendance: any[],
    grades: any[],
  ): PrincipalAlert[] {
    const alerts: PrincipalAlert[] = [];
    const gradesByStudent = groupBy(grades, record => record.studentId);
    const attendanceByStudent = groupBy(attendance, record => record.studentId);

    students.forEach(student => {
      const studentGrades = gradesByStudent.get(student.id) ?? [];
      const studentAttendance = attendanceByStudent.get(student.id) ?? [];
      const studentAverage = average(studentGrades.map(gradeAverage));
      const studentAttendanceRate = attendanceRate(studentAttendance);

      if (studentGrades.length && studentAverage < 75) {
        alerts.push({
          id: `student-grade-${student.id}`,
          severity: 'High',
          title: `${learnerName(student)} academic intervention`,
          detail: `Learner average is ${studentAverage}.`,
          owner: student.section || 'Academic Office',
        });
      }

      if (studentAttendance.length && studentAttendanceRate < 85) {
        alerts.push({
          id: `student-attendance-${student.id}`,
          severity: 'Medium',
          title: `${learnerName(student)} attendance watch`,
          detail: `Attendance rate is ${studentAttendanceRate}%.`,
          owner: student.section || 'Academic Office',
        });
      }
    });

    sections.forEach(section => {
      const liveEnrollment = students.filter(student => student.section === section.sectionName).length;
      const enrolled = Number(section.enrolled ?? liveEnrollment);
      const capacity = Number(section.capacity ?? 0);
      if (capacity > 0 && enrolled >= capacity) {
        alerts.push({
          id: `section-capacity-${section.id}`,
          severity: 'Low',
          title: `${section.sectionName} at capacity`,
          detail: `${enrolled} of ${capacity} seats are occupied.`,
          owner: section.adviser || 'Registrar',
        });
      }
    });

    teachers.forEach(teacher => {
      const profile = teacher.teacherProfiles?.[0];
      const teacherName = profile?.name || teacher.name || teacher.email || 'Unnamed teacher';
      const status = String(profile?.accountStatus ?? 'Active');

      if (status.toLowerCase() !== 'active') {
        alerts.push({
          id: `teacher-status-${teacher.id}`,
          severity: 'Medium',
          title: `${teacherName} account review`,
          detail: `Teacher status is ${status}.`,
          owner: 'Principal Office',
        });
      }
    });

    return alerts.slice(0, 12);
  }
}
