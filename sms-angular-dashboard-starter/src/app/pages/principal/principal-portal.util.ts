export type PrincipalStudentStatus = 'Active' | 'Pending' | 'Dropped';

export interface PrincipalTeacher {
  id: string;
  name: string;
  department: string;
  classesHandled: number;
  attendanceRate: number;
  performance: number;
  status: string;
}

import { normalizeGradeLevel } from '../../core/data/grade-levels';

export interface PrincipalStudent {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  average: number;
  attendanceRate: number;
  status: PrincipalStudentStatus;
}

export interface PrincipalClassSection {
  id: string;
  gradeLevel: string;
  section: string;
  adviser: string;
  subject: string;
  enrollment: number;
  average: number;
  attendanceRate: number;
}

export interface PrincipalSubjectMetric {
  subject: string;
  gradeLevel: string;
  quarter: string;
  average: number;
  passRate: number;
}

export interface PrincipalTrend {
  label: string;
  attendance: number;
  performance: number;
  enrollment: number;
}

export interface PrincipalAlert {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  detail: string;
  owner: string;
}

export interface PrincipalCalendarItem {
  id: string;
  date: string;
  title: string;
  type: string;
}

export interface PrincipalPortalState {
  principal: {
    name: string;
    email: string;
    title: string;
    phone: string;
    office: string;
  };
  academicYear: {
    id: string;
    code?: string;
    label?: string;
    schoolYear?: string;
  } | null;
  teachers: PrincipalTeacher[];
  students: PrincipalStudent[];
  classes: PrincipalClassSection[];
  subjects: PrincipalSubjectMetric[];
  trends: PrincipalTrend[];
  alerts: PrincipalAlert[];
  calendar: PrincipalCalendarItem[];
}

export interface PrincipalOverviewPayload {
  academicYear?: { id: string; schoolYear?: string; code?: string; label?: string };
  principalProfile?: { name?: string; email?: string; title?: string; office?: string; phone?: string };
  students?: any[];
  sections?: any[];
  teachers?: any[];
  attendanceRecords?: any[];
  gradeRecords?: any[];
  academicRecords?: any[];
  calendarEvents?: any[];
  alerts?: PrincipalAlert[];
}

export interface ExecutiveSummary {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
  averagePerformance: number;
  enrollmentStatus: {
    active: number;
    pending: number;
    dropped: number;
  };
}

function average(values: number[]): number {
  const usable = values.filter(value => Number.isFinite(value));
  if (!usable.length) {
    return 0;
  }

  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
}

function compactName(parts: Array<string | null | undefined>): string {
  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function gradeRecordAverage(record: any): number {
  return average([Number(record.written ?? 0), Number(record.performance ?? 0), Number(record.exam ?? 0)]);
}

function attendanceRate(records: any[]): number {
  if (!records.length) {
    return 0;
  }

  const presentLike = records.filter(record => !['absent', 'late', 'excused'].includes(String(record.status ?? '').toLowerCase())).length;
  return Math.round((presentLike / records.length) * 100);
}

function enrollmentStatus(status?: string): PrincipalStudentStatus {
  const normalized = String(status ?? '').toLowerCase();
  if (normalized.includes('drop')) {
    return 'Dropped';
  }
  if (normalized.includes('pending')) {
    return 'Pending';
  }
  return 'Active';
}

function groupBy<T>(items: T[], getKey: (item: T) => string | undefined | null): Map<string, T[]> {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    if (!key) {
      return groups;
    }
    groups.set(key, [...(groups.get(key) ?? []), item]);
    return groups;
  }, new Map<string, T[]>());
}

function formatEventDate(value: string | undefined): string {
  if (!value) {
    return 'No date';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function monthKey(value: string | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}

function buildLiveTrends(
  attendanceRecords: any[],
  gradeRecords: any[],
  enrollment: number,
): PrincipalTrend[] {
  const groups = new Map<string, { attendance: any[]; grades: any[] }>();

  attendanceRecords.forEach(record => {
    const key = monthKey(record.date);
    if (!key) {
      return;
    }
    const group = groups.get(key) ?? { attendance: [], grades: [] };
    group.attendance.push(record);
    groups.set(key, group);
  });

  gradeRecords.forEach(record => {
    const key = monthKey(record.updatedAt || record.createdAt || record.date);
    if (!key) {
      return;
    }
    const group = groups.get(key) ?? { attendance: [], grades: [] };
    group.grades.push(record);
    groups.set(key, group);
  });

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, group]) => ({
      label: monthLabel(key),
      attendance: attendanceRate(group.attendance),
      performance: average(group.grades.map(gradeRecordAverage)),
      enrollment,
    }));
}

export function buildExecutiveSummary(
  students: PrincipalStudent[],
  teachers: PrincipalTeacher[],
  classes: PrincipalClassSection[],
): ExecutiveSummary {
  const activeStudents = students.filter(student => student.status === 'Active');

  return {
    totalStudents: activeStudents.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    attendanceRate: average(activeStudents.map(student => student.attendanceRate)),
    averagePerformance: average(activeStudents.map(student => student.average)),
    enrollmentStatus: {
      active: students.filter(student => student.status === 'Active').length,
      pending: students.filter(student => student.status === 'Pending').length,
      dropped: students.filter(student => student.status === 'Dropped').length,
    },
  };
}

export function buildGradeEnrollment(students: PrincipalStudent[]): Array<{ gradeLevel: string; total: number }> {
  const counts = students.filter(student => student.status === 'Active').reduce<Record<string, number>>((acc, student) => {
    const gradeLevel = normalizeGradeLevel(student.gradeLevel);
    acc[gradeLevel] = (acc[gradeLevel] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([gradeLevel, total]) => ({ gradeLevel, total }))
    .sort((a, b) => a.gradeLevel.localeCompare(b.gradeLevel, undefined, { numeric: true }));
}

export function findAtRiskStudents(students: PrincipalStudent[]): PrincipalStudent[] {
  return students
    .filter(student => student.average < 75 || student.attendanceRate < 85)
    .sort((a, b) => (a.average + a.attendanceRate) - (b.average + b.attendanceRate));
}

export function sortTeachersByWorkload(teachers: PrincipalTeacher[]): PrincipalTeacher[] {
  return [...teachers].sort((a, b) => b.classesHandled - a.classesHandled || b.performance - a.performance);
}

export function subjectPerformance(subjects: PrincipalSubjectMetric[]): PrincipalSubjectMetric[] {
  return [...subjects].sort((a, b) => b.average - a.average || b.passRate - a.passRate);
}

export function mapPrincipalOverviewToState(payload: PrincipalOverviewPayload): PrincipalPortalState {
  const students = payload.students ?? [];
  const attendanceRecords = payload.attendanceRecords ?? [];
  const gradeRecords = payload.gradeRecords ?? [];
  const academicRecords = payload.academicRecords ?? [];
  const gradeRecordsByStudent = groupBy(gradeRecords, record => record.studentId);
  const attendanceByStudent = groupBy(attendanceRecords, record => record.studentId);

  const mappedStudents: PrincipalStudent[] = students.map(student => {
    const studentGrades = gradeRecordsByStudent.get(student.id) ?? [];
    const studentAttendance = attendanceByStudent.get(student.id) ?? [];

    return {
      id: student.id,
      name: compactName([student.firstName, student.middleName, student.lastName]) || student.name || student.email || 'Unnamed learner',
      gradeLevel: student.gradeLevel || 'Unassigned',
      section: student.section || 'Unassigned',
      average: average(studentGrades.map(gradeRecordAverage)),
      attendanceRate: attendanceRate(studentAttendance),
      status: enrollmentStatus(student.enrollmentStatus || student.status),
    };
  });

  const mappedTeachers: PrincipalTeacher[] = (payload.teachers ?? []).map(teacher => {
    const profile = teacher.teacherProfiles?.[0] ?? teacher.teacherProfile ?? {};
    const teacherGrades = gradeRecords.filter(record => record.teacherUserId === teacher.id);
    const teacherAttendance = attendanceRecords.filter(record => record.teacherUserId === teacher.id);

    return {
      id: teacher.id,
      name: profile.name || teacher.name || teacher.email || 'Unnamed teacher',
      department: profile.department || profile.assignedGradeLevel || 'General Faculty',
      classesHandled: Number(profile.totalClassesHandled ?? 0),
      attendanceRate: attendanceRate(teacherAttendance),
      performance: average(teacherGrades.map(gradeRecordAverage)),
      status: profile.accountStatus || 'Active',
    };
  });

  const mappedClasses: PrincipalClassSection[] = (payload.sections ?? []).map(section => {
    const sectionStudentIds = new Set(students.filter(student => student.section === section.sectionName).map(student => student.id));
    const sectionGrades = gradeRecords.filter(record => sectionStudentIds.has(record.studentId));
    const sectionAttendance = attendanceRecords.filter(record => sectionStudentIds.has(record.studentId));
    const liveEnrollment = sectionStudentIds.size;

    return {
      id: section.id,
      gradeLevel: section.gradeLevel || 'Unassigned',
      section: section.sectionName || section.name || 'Unassigned',
      adviser: section.adviser || section.adviserName || 'Unassigned',
      subject: compactName([section.subject, section.subjectName, section.subjectTitle]) || 'General',
      enrollment: Number(section.enrolled ?? liveEnrollment),
      average: average(sectionGrades.map(gradeRecordAverage)),
      attendanceRate: attendanceRate(sectionAttendance),
    };
  });

  const academicRecordsByGrade = groupBy(academicRecords, record => record.gradeLevel || 'Unassigned');
  const mappedSubjects: PrincipalSubjectMetric[] = [];
  const subjectGroups = new Map<string, { gradeLevel: string; subject: string; records: any[] }>();

  academicRecords.forEach(record => {
    const key = `${record.gradeLevel || 'Unassigned'}::${record.subject || record.subjectName || 'General Average'}`;
    const existing = subjectGroups.get(key) ?? {
      gradeLevel: record.gradeLevel || 'Unassigned',
      subject: record.subject || record.subjectName || 'General Average',
      records: [] as any[],
    };
    existing.records.push(record);
    subjectGroups.set(key, existing);
  });

  subjectGroups.forEach(group => {
    const averages = group.records
      .map(record => Number(record.generalAverage ?? gradeRecordAverage(record)))
      .filter(value => Number.isFinite(value));
    mappedSubjects.push({
      subject: group.subject,
      gradeLevel: group.gradeLevel,
      quarter: group.records[0]?.quarter || 'Latest',
      average: average(averages),
      passRate: averages.length ? Math.round((averages.filter(value => value >= 75).length / averages.length) * 100) : 0,
    });
  });

  const mappedCalendar: PrincipalCalendarItem[] = (payload.calendarEvents ?? []).map(event => ({
    id: event.id,
    date: formatEventDate(event.eventDate),
    title: event.title,
    type: event.eventType || 'Event',
  }));

  return {
    principal: {
      name: payload.principalProfile?.name || payload.principalProfile?.email || 'Principal',
      email: payload.principalProfile?.email || '',
      title: payload.principalProfile?.title || 'Principal',
      phone: payload.principalProfile?.phone || '',
      office: payload.principalProfile?.office || '',
    },
    academicYear: payload.academicYear ?? null,
    teachers: mappedTeachers,
    students: mappedStudents,
    classes: mappedClasses,
    subjects: mappedSubjects,
    trends: buildLiveTrends(attendanceRecords, gradeRecords, mappedStudents.length),
    alerts: payload.alerts ?? [],
    calendar: mappedCalendar,
  };
}
