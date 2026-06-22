import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import {
  AttendanceRecord,
  AttendanceStatus,
  buildLearnerAttendanceInsights,
  buildAttendanceSummary,
  buildTeacherDashboardSummary,
  buildTeacherStudentInitials,
  calculateQuarterAverage,
  filterTeacherResources,
  GradeRecord,
  Quarter,
  ResourceType,
  TeacherClass,
  TeacherPortalState,
  TeacherScheduleEntry,
  TeacherStudent,
  TeacherScheduleWeekday,
  teacherStudentAvatarSource,
} from './teacher-portal.util';
import { getSubjectsForGradeLevel } from '../../shared/utils/curriculum.util';
import { TeacherPortalService } from './teacher-portal.service';
import { CalendarService } from '../../core/services/calendar.service';
import { RegistrarApiService } from '../../core/services/registrar-api.service';
import { CalendarEvent } from '../../core/models/registrar.models';
import { FloatingAiAssistantService } from '../../core/services/floating-ai-assistant.service';

type TeacherView =
  | 'dashboard'
  | 'profile'
  | 'classes'
  | 'attendance'
  | 'grades'
  | 'schedule'
  | 'resources'
  | 'dll'
  | 'announcements'
  | 'messages'
  | 'analytics'
  | 'profiles'
  | 'settings';

type ExpandedCalendarDay = {
  day: number | null;
  date?: string;
  status?: AttendanceStatus;
  reason?: string;
};

type ExpandedCalendarMonth = {
  name: string;
  calendarYear: number;
  days: ExpandedCalendarDay[];
  totals: Record<AttendanceStatus, number>;
};

@Component({
  selector: 'app-teacher-portal',
  standalone: true,
  imports: [DatePipe, FormsModule, NgClass, NgFor, NgIf, RouterLink],
  templateUrl: './teacher-portal.component.html',
  styleUrl: './teacher-portal.component.scss',
})
export class TeacherPortalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly teacherStore = inject(TeacherPortalService);
  private readonly calendarService = inject(CalendarService);
  private readonly registrarApi = inject(RegistrarApiService);
  private readonly floatingAi = inject(FloatingAiAssistantService);

  readonly state = signal<TeacherPortalState>(this.teacherStore.snapshot());
  readonly calendarEvents = signal<CalendarEvent[]>([]);
  readonly currentView = signal<TeacherView>('dashboard');
  readonly selectedClassId = signal('');
  readonly selectedAttendanceClassId = signal('');
  readonly selectedQuarter = signal<Quarter>('Q1');
  readonly expandedGradeStudentId = signal<string | null>(null);
  readonly gradeQuarterSelections = signal<Record<string, Quarter>>({});
  readonly attendanceDate = signal(new Date().toISOString().slice(0, 10));
  readonly selectedAttendanceStudentId = signal<string | null>(null);
  readonly isYearCalendarExpanded = signal(false);
  readonly attendanceViewMode = signal<'daily' | 'sf2'>('daily');
  readonly sf2SelectedMonth = signal<string>(new Date().toISOString().slice(0, 7));

  readonly academicProfile = signal<any>(null);
  readonly academicProfileInsights = signal<string | null>(null);
  readonly isAcademicProfileLoading = signal<boolean>(false);
  readonly scheduleDialogDay = signal<TeacherScheduleWeekday | null>(null);
  readonly editingScheduleEntryId = signal<string | null>(null);
  readonly aiInsights = signal<string>('');
  readonly resourceSearch = signal('');
  profileForm = { ...this.state().teacher };
  resourceForm = { title: '', type: 'PDF' as ResourceType, subject: '' };
  dllForm = { objectives: '', activities: '', materials: '', remarks: '' };
  announcementForm = { audience: 'All students', title: '', body: '' };
  messageForm: { thread: string; audience: 'Student' | 'Parent' | 'Admin'; message: string } = { thread: '', audience: 'Admin', message: '' };
  scheduleForm: { title: string; startTime: string } = { title: '', startTime: '08:00' };
  passwordForm = { current: '', next: '', confirm: '' };
  readonly toast = signal<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });

  readonly classRosterOptions = computed(() => {
    const classesBySection = new Map<string, TeacherClass>();
    for (const section of this.state().classes) {
      const key = [section.gradeLevel ?? '', section.sectionName || section.section].join('::').trim().toLowerCase();
      if (!classesBySection.has(key)) {
        classesBySection.set(key, section);
      }
    }
    return Array.from(classesBySection.values());
  });
  readonly selectedClass = computed(() =>
    this.classRosterOptions().find(section => section.id === this.selectedClassId()) ?? this.classRosterOptions()[0] ?? null,
  );
  readonly attendanceClasses = computed(() => this.classRosterOptions());
  readonly selectedAttendanceClass = computed(() =>
    this.attendanceClasses().find(section => section.id === this.selectedAttendanceClassId()) ?? this.attendanceClasses()[0] ?? null,
  );
  readonly selectedClassStudents = computed(() => this.studentsForClass(this.selectedClass()?.id));
  readonly gradeLearners = computed(() => {
    const learnersById = new Map<string, TeacherStudent>();
    for (const section of this.state().classes) {
      for (const studentId of section.studentIds) {
        const student = this.state().students.find(item => item.id === studentId);
        if (student && !learnersById.has(student.id)) {
          learnersById.set(student.id, student);
        }
      }
    }
    return Array.from(learnersById.values()).sort((first, second) => first.name.localeCompare(second.name));
  });
  readonly selectedAttendanceClassStudents = computed(() => this.studentsForClass(this.selectedAttendanceClass()?.id));
  readonly selectedAttendanceStudent = computed(() =>
    this.state().students.find(student => student.id === this.selectedAttendanceStudentId()) ?? null,
  );
  readonly selectedAttendanceInsights = computed(() => {
    const selectedDate = new Date(`${this.attendanceDate()}T00:00:00`);
    return buildLearnerAttendanceInsights(
      this.state().attendance,
      this.selectedAttendanceStudentId() ?? '',
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
    );
  });
  readonly expandedYearCalendar = computed<ExpandedCalendarMonth[]>(() => this.buildExpandedYearCalendar());

  readonly sf2Days = computed(() => {
    const monthStr = this.sf2SelectedMonth();
    if (!monthStr) return [];
    const [year, month] = monthStr.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month - 1, i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days.push(i);
      }
    }
    return days;
  });

  readonly sf2MatrixData = computed(() => {
    const students = this.selectedAttendanceClassStudents();
    const attendance = this.state().attendance;
    const days = this.sf2Days();
    const [year, month] = this.sf2SelectedMonth().split('-');

    const processStudents = (genderList: any[]) => {
      return genderList.map(student => {
        let absent = 0;
        let tardy = 0;
        const dailyRecord: Record<number, string> = {};
        
        days.forEach(day => {
          const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const record = attendance.find(a => a.studentId === student.id && a.date === dateStr);
          if (record) {
            if (record.status === 'Present') dailyRecord[day] = 'P';
            else if (record.status === 'Absent') { dailyRecord[day] = 'X'; absent++; }
            else if (record.status === 'Late') { dailyRecord[day] = 'L'; tardy++; }
            else if (record.status === 'Excused') { dailyRecord[day] = 'E'; absent++; }
          } else {
            dailyRecord[day] = '';
          }
        });

        return { ...student, dailyRecord, absent, tardy, remarks: '' };
      });
    };

    const males = processStudents(students.filter(s => s.gender?.toLowerCase() === 'male'));
    const females = processStudents(students.filter(s => s.gender?.toLowerCase() === 'female'));
    
    return { males, females };
  });

  readonly sf2DailyTotals = computed(() => {
    const matrix = this.sf2MatrixData();
    const days = this.sf2Days();
    
    const calculateTotals = (list: any[]) => {
      const daily: Record<number, number> = {};
      let totalAbsent = 0;
      let totalTardy = 0;
      days.forEach(day => {
        daily[day] = list.filter(s => s.dailyRecord[day] !== 'X' && s.dailyRecord[day] !== 'E').length;
      });
      list.forEach(s => { totalAbsent += s.absent; totalTardy += s.tardy; });
      return { daily, absent: totalAbsent, tardy: totalTardy };
    };

    const maleTotals = calculateTotals(matrix.males);
    const femaleTotals = calculateTotals(matrix.females);
    
    const combinedDaily: Record<number, number> = {};
    days.forEach(day => { combinedDaily[day] = (maleTotals.daily[day] || 0) + (femaleTotals.daily[day] || 0); });

    return {
      males: maleTotals,
      females: femaleTotals,
      combined: { daily: combinedDaily, absent: maleTotals.absent + femaleTotals.absent, tardy: maleTotals.tardy + femaleTotals.tardy }
    };
  });

  readonly hasClasses = computed(() => this.state().classes.length > 0);
  readonly teacherSubjects = computed(() => {
    const subjects = new Set<string>();
    for (const section of this.state().classes) {
      const subject = section.subject?.trim();
      if (subject) {
        subjects.add(subject);
      }
    }
    return Array.from(subjects).sort((first, second) => first.localeCompare(second));
  });
  readonly selectedClassSectionName = computed(() => this.selectedClass()?.section || 'No class selected');
  readonly selectedClassSubjectName = computed(() => this.selectedClass()?.subject || 'Class');
  readonly selectedAttendanceSectionName = computed(() => this.selectedAttendanceClass()?.section || 'No class selected');
  readonly teacherMeta = computed(() => {
    const p = this.state().teacher;
    return [
      p.department || 'Department not set',
      p.assignedGradeLevel || 'Grade not set',
      p.advisoryClass || 'No section assigned',
    ].filter(Boolean).join(' • ');
  });
  readonly teacherInitials = computed(() => this.buildTeacherInitials(this.state().teacher.name, this.state().teacher.email));
  readonly isSavingDll = signal(false);
  readonly showDllModal = signal(false);
  readonly bulkGradesDraft = signal<Record<string, { written: string, performance: string, exam: string }>>({});
  readonly isSavingGrades = signal(false);
  readonly hasUnsavedBulkGrades = computed(() => Object.keys(this.bulkGradesDraft()).length > 0);

  readonly dashboardSummary = computed(() =>
    buildTeacherDashboardSummary(this.state().classes, this.state().attendance, this.state().grades, this.attendanceDate()),
  );
  readonly attendanceSummary = computed(() => buildAttendanceSummary(this.state().attendance));
  readonly filteredResources = computed(() => filterTeacherResources(this.state().resources, this.resourceSearch()));

  readonly attendanceStatuses: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused'];
  readonly quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  readonly resourceTypes: ResourceType[] = ['PDF', 'Video', 'Document', 'Link'];
  readonly scheduleWeekdays: TeacherScheduleWeekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  readonly buildTeacherStudentInitials = buildTeacherStudentInitials;
  readonly learnerAvatarSource = teacherStudentAvatarSource;
  readonly monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  readonly schoolYearMonths = [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4];
  ngOnInit(): void {
    this.registrarApi.refreshAcademicYears();

    this.teacherStore.state$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(state => {
      this.state.set(state);
      this.profileForm = { ...state.teacher };
      if (!this.classRosterOptions().some(section => section.id === this.selectedClassId())) {
        this.selectedClassId.set(this.classRosterOptions()[0]?.id ?? '');
      }
      if (!this.attendanceClasses().some(section => section.id === this.selectedAttendanceClassId())) {
        this.selectedAttendanceClassId.set(this.attendanceClasses()[0]?.id ?? '');
      }
    });

    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.currentView.set((data['teacherView'] ?? 'dashboard') as TeacherView);
    });

    this.registrarApi.activeAcademicYear$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(ay => !!ay),
      switchMap(ay =>
        this.calendarService.getEvents(ay.id).pipe(
          catchError(() => of([] as CalendarEvent[])),
          switchMap(events =>
            events.length ? of(events) : this.calendarService.getEvents().pipe(catchError(() => of([] as CalendarEvent[]))),
          ),
        ),
      ),
    ).subscribe(events => this.calendarEvents.set(this.upcomingCalendarEvents(events)));
  }

  studentsForClass(classId?: string): TeacherStudent[] {
    const section = this.state().classes.find(item => item.id === classId);
    if (!section) {
      return [];
    }

    return section.studentIds
      .map(id => this.state().students.find(student => student.id === id))
      .filter((student): student is TeacherStudent => !!student);
  }

  scheduleLabel(schedule?: string): string {
    const value = schedule?.trim() ?? '';
    return value && value.toUpperCase() !== 'TBA' ? value : '';
  }

  scheduleDayLabel(schedule?: string): string {
    return this.scheduleLabel(schedule).split(' ')[0] ?? '';
  }

  classDetails(section: TeacherClass): string {
    return [this.scheduleLabel(section.schedule), section.room?.trim()]
      .filter(Boolean)
      .join(' • ');
  }

  attendanceFor(studentId: string): AttendanceStatus {
    return this.attendanceRecordFor(studentId)?.status ?? 'Present';
  }

  attendanceReasonFor(studentId: string): string {
    return this.attendanceRecordFor(studentId)?.reason ?? '';
  }

  attendanceRecordFor(studentId: string): AttendanceRecord | undefined {
    return this.state().attendance.find(record =>
      record.classId === this.selectedAttendanceClass()?.id &&
      record.studentId === studentId &&
      record.date === this.attendanceDate()
    );
  }

  setAttendance(studentId: string, status: AttendanceStatus, reason = this.attendanceReasonFor(studentId)) {
    const section = this.selectedAttendanceClass();
    if (!section) return;
    this.teacherStore.markAttendance(section.id, studentId, this.attendanceDate(), status, reason);
    this.showToast('success', 'Attendance updated.');
  }

  markAllPresent() {
    const section = this.selectedAttendanceClass();
    const students = this.selectedAttendanceClassStudents();
    if (!section || students.length === 0) return;

    const dateStr = this.attendanceDate();
    const currentAttendance = [...this.state().attendance];

    students.forEach(student => {
      const idx = currentAttendance.findIndex(a => a.classId === section.id && a.studentId === student.id && a.date === dateStr);
      if (idx >= 0) {
        currentAttendance[idx] = { ...currentAttendance[idx], status: 'Present' };
      } else {
        currentAttendance.push({
          id: `temp-${student.id}-${Date.now()}`,
          classId: section.id,
          studentId: student.id,
          date: dateStr,
          status: 'Present'
        });
      }
      this.teacherStore.markAttendance(section.id, student.id, dateStr, 'Present', '');
    });

    this.state.set({ ...this.state(), attendance: currentAttendance });
    this.showToast('success', 'All students marked as Present.');
  }

  async exportToSF2Excel() {
    this.showToast('success', 'Preparing SF2 Excel Export...');
    try {
      const response = await fetch('assets/sf2-template.xlsx');
      const arrayBuffer = await response.arrayBuffer();

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const sheet = workbook.worksheets[0];

      const section = this.selectedAttendanceClass();
      if (section) {
        sheet.getCell('E5').value = '101234'; // Fake School ID
        sheet.getCell('J5').value = '2026-2027'; // School Year
        sheet.getCell('T5').value = this.monthNames[Number(this.sf2SelectedMonth().split('-')[1]) - 1] + ' ' + this.sf2SelectedMonth().split('-')[0];
        sheet.getCell('E7').value = 'SFXSAI'; // School Name
        sheet.getCell('W7').value = section.gradeLevel; // Grade Level
        sheet.getCell('AA7').value = section.section; // Section
      }

      const data = this.sf2MatrixData();
      const totals = this.sf2DailyTotals();
      const days = this.sf2Days();

      // Days header starts at D10
      days.forEach((day, index) => {
        const col = 4 + index; // D is 4
        sheet.getCell(10, col).value = day;
      });
      let maleTotalRow = 35;
      let femaleTotalRow = 61;
      let combinedTotalRow = 62;

      sheet.eachRow((row, rowNum) => {
        const val = row.getCell(1).value?.toString() || '';
        if (val.includes('MALE') && val.includes('TOTAL')) maleTotalRow = rowNum;
        if (val.includes('FEMALE') && val.includes('TOTAL')) femaleTotalRow = rowNum;
        if (val.toLowerCase().includes('combined') && val.toLowerCase().includes('total')) combinedTotalRow = rowNum;
      });

      let currentRow = 11;

      // Males
      data.males.forEach(student => {
        if (currentRow < maleTotalRow) {
          sheet.getCell(currentRow, 1).value = student.name;
          days.forEach((day, index) => {
            sheet.getCell(currentRow, 4 + index).value = student.dailyRecord[day] || '';
          });
          sheet.getCell(currentRow, 29).value = student.absent;
          sheet.getCell(currentRow, 30).value = student.tardy;
          currentRow++;
        }
      });

      // Male Totals
      currentRow = maleTotalRow;
      sheet.getCell(currentRow, 1).value = 'MALE | TOTAL Per Day';
      days.forEach((day, index) => {
        sheet.getCell(currentRow, 4 + index).value = totals.males.daily[day] || 0;
      });
      sheet.getCell(currentRow, 29).value = totals.males.absent;
      sheet.getCell(currentRow, 30).value = totals.males.tardy;

      // Females
      currentRow = maleTotalRow + 1;
      data.females.forEach(student => {
        if (currentRow < femaleTotalRow) {
          sheet.getCell(currentRow, 1).value = student.name;
          days.forEach((day, index) => {
            sheet.getCell(currentRow, 4 + index).value = student.dailyRecord[day] || '';
          });
          sheet.getCell(currentRow, 29).value = student.absent;
          sheet.getCell(currentRow, 30).value = student.tardy;
          currentRow++;
        }
      });

      // Female Totals
      currentRow = femaleTotalRow;
      sheet.getCell(currentRow, 1).value = 'FEMALE | TOTAL Per Day';
      days.forEach((day, index) => {
        sheet.getCell(currentRow, 4 + index).value = totals.females.daily[day] || 0;
      });
      sheet.getCell(currentRow, 29).value = totals.females.absent;
      sheet.getCell(currentRow, 30).value = totals.females.tardy;

      // Combined Totals
      currentRow = combinedTotalRow;
      sheet.getCell(currentRow, 1).value = 'Combined TOTAL PER DAY';
      days.forEach((day, index) => {
        sheet.getCell(currentRow, 4 + index).value = totals.combined.daily[day] || 0;
      });
      sheet.getCell(currentRow, 29).value = totals.combined.absent;
      sheet.getCell(currentRow, 30).value = totals.combined.tardy;

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `SF2_${section?.section || 'Class'}_${this.sf2SelectedMonth()}.xlsx`);
    } catch (err) {
      console.error(err);
      this.showToast('error', 'Failed to generate Excel file.');
    }
  }

  updateAttendanceReason(studentId: string, reason: string) {
    const status = this.attendanceFor(studentId);
    if (status !== 'Absent' && status !== 'Excused') {
      return;
    }

    this.setAttendance(studentId, status, reason);
  }

  openAttendanceDialog(student: TeacherStudent) {
    this.selectedAttendanceStudentId.set(student.id);
  }

  closeAttendanceDialog() {
    this.isYearCalendarExpanded.set(false);
    this.selectedAttendanceStudentId.set(null);
  }

  attendanceCalendarDayClass(day: ExpandedCalendarDay): string {
    return day.day ? '' : 'bg-transparent';
  }

  attendanceCalendarDayBackground(day: ExpandedCalendarDay): string {
    if (!day.day) {
      return 'transparent';
    }

    return day.status ? {
      Present: '#d1fae5',
      Late: '#fef3c7',
      Excused: '#e0f2fe',
      Absent: '#fee2e2',
    }[day.status] : '';
  }

  attendanceCalendarDayTextColor(day: ExpandedCalendarDay): string {
    if (!day.day) {
      return 'transparent';
    }

    return day.status ? {
      Present: '#047857',
      Late: '#b45309',
      Excused: '#0369a1',
      Absent: '#b91c1c',
    }[day.status] : '';
  }

  attendanceCalendarDayTitle(day: ExpandedCalendarDay): string {
    if (!day.date || !day.status) {
      return '';
    }

    return [day.date, day.status, day.reason].filter(Boolean).join(' - ');
  }

  private buildExpandedYearCalendar(): ExpandedCalendarMonth[] {
    const selectedStudentId = this.selectedAttendanceStudentId();
    const selectedDate = new Date(`${this.attendanceDate()}T00:00:00`);
    const schoolYearStart = this.schoolYearStartFor(selectedDate);
    const recordsByDate = new Map<string, AttendanceRecord>();

    for (const record of this.state().attendance) {
      if (record.studentId !== selectedStudentId) {
        continue;
      }

      const recordDate = new Date(`${record.date}T00:00:00`);
      if (recordDate < new Date(schoolYearStart, 5, 1) || recordDate > new Date(schoolYearStart + 1, 4, 31)) {
        continue;
      }

      const existing = recordsByDate.get(record.date);
      if (!existing || this.attendanceStatusPriority(record.status) > this.attendanceStatusPriority(existing.status)) {
        recordsByDate.set(record.date, record);
      }
    }

    return this.schoolYearMonths.map((monthIndex) => {
      const calendarYear = monthIndex >= 5 ? schoolYearStart : schoolYearStart + 1;
      const firstDay = new Date(calendarYear, monthIndex, 1).getDay();
      const daysInMonth = new Date(calendarYear, monthIndex + 1, 0).getDate();
      const totals: Record<AttendanceStatus, number> = { Present: 0, Late: 0, Absent: 0, Excused: 0 };
      const days: ExpandedCalendarDay[] = Array.from({ length: firstDay }, () => ({ day: null }));

      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${calendarYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = recordsByDate.get(date);
        if (record) {
          totals[record.status] += 1;
        }

        days.push({
          day,
          date,
          status: record?.status,
          reason: record?.reason,
        });
      }

      return { name: this.monthNames[monthIndex], calendarYear, days, totals };
    });
  }

  schoolYearLabel(dateValue = this.attendanceDate()): string {
    const start = this.schoolYearStartFor(new Date(`${dateValue}T00:00:00`));
    return `${start}-${start + 1}`;
  }

  
  eventTypeIcon(eventType: string | null | undefined): string {
    const normalized = String(eventType || '').toLowerCase();
    if (normalized.includes('holiday')) return 'celebration';
    if (normalized.includes('meeting')) return 'groups';
    if (normalized.includes('exam')) return 'school';
    return 'event';
  }

  eventToneClass(eventType: string | null | undefined): string {
    const normalized = String(eventType || '').toLowerCase();
    if (normalized.includes('holiday')) return 'event-tone-holiday';
    if (normalized.includes('meeting')) return 'event-tone-meeting';
    if (normalized.includes('exam')) return 'event-tone-exam';
    return 'event-tone-other';
  }

  private upcomingCalendarEvents(events: CalendarEvent[]): CalendarEvent[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [...(events ?? [])]
      .filter(event => new Date(event.eventDate).getTime() >= today.getTime())
      .sort((first, second) => new Date(first.eventDate).getTime() - new Date(second.eventDate).getTime())
      .slice(0, 5);
  }

  private buildTeacherInitials(name: string, email: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return email.trim().slice(0, 2).toUpperCase() || 'TP';
  }

  private schoolYearStartFor(date: Date): number {
    const year = date.getFullYear();
    return date.getMonth() >= 5 ? year : year - 1;
  }

  private attendanceStatusPriority(status: AttendanceStatus): number {
    return { Present: 1, Late: 2, Excused: 3, Absent: 4 }[status];
  }

  gradeFor(studentId: string): GradeRecord | undefined {
    const section = this.selectedClass();
    return this.state().grades.find(grade => grade.classId === section?.id && grade.studentId === studentId && grade.quarter === this.selectedQuarter());
  }

  gradeValue(studentId: string, key: 'written' | 'performance' | 'exam'): number | null {
    return this.gradeFor(studentId)?.[key] ?? null;
  }

  toggleGradeLearner(studentId: string): void {
    this.expandedGradeStudentId.update(current => (current === studentId ? null : studentId));
  }

  gradeSubjectsForStudent(studentId: string): TeacherClass[] {
    return this.state().classes
      .filter(section => section.studentIds.includes(studentId))
      .sort((first, second) => first.subject.localeCompare(second.subject));
  }

  gradeLearnerSummaryAverage(studentId: string): number | null {
    const subjectAverages = this.gradeSubjectsForStudent(studentId)
      .map(subject => this.averageForClassStudent(subject.id, studentId))
      .filter((average): average is number => average !== null);

    if (!subjectAverages.length) {
      return null;
    }

    return Math.round(subjectAverages.reduce((total, average) => total + average, 0) / subjectAverages.length);
  }

  gradeSubjectQuarter(studentId: string, classId: string): Quarter {
    return this.gradeQuarterSelections()[this.gradeSubjectQuarterKey(studentId, classId)] ?? this.selectedQuarter();
  }

  setGradeSubjectQuarter(studentId: string, classId: string, quarter: Quarter): void {
    const key = this.gradeSubjectQuarterKey(studentId, classId);
    this.gradeQuarterSelections.update(current => ({ ...current, [key]: quarter }));
  }

  gradeForClass(studentId: string, classId: string, quarter = this.gradeSubjectQuarter(studentId, classId)): GradeRecord | undefined {
    return this.state().grades.find(grade => grade.classId === classId && grade.studentId === studentId && grade.quarter === quarter);
  }

  gradeValueForClass(classId: string, studentId: string, key: 'written' | 'performance' | 'exam', quarter = this.gradeSubjectQuarter(studentId, classId)): number | null {
    return this.gradeForClass(studentId, classId, quarter)?.[key] ?? null;
  }

  averageForClassStudent(classId: string, studentId: string, quarter = this.gradeSubjectQuarter(studentId, classId)): number | null {
    const grade = this.gradeForClass(studentId, classId, quarter);
    return grade ? calculateQuarterAverage(grade) : null;
  }

  updateGradeForClass(classId: string, studentId: string, key: 'written' | 'performance' | 'exam', value: string, quarter = this.gradeSubjectQuarter(studentId, classId)): void {
    const section = this.state().classes.find(item => item.id === classId);
    if (!section) return;

    const current = this.gradeForClass(studentId, classId, quarter);
    const nextValue = value === '' ? null : Math.max(0, Math.min(100, Number(value)));
    this.teacherStore.upsertGrade(
      classId,
      studentId,
      quarter,
      key === 'written' ? nextValue : current?.written ?? null,
      key === 'performance' ? nextValue : current?.performance ?? null,
      key === 'exam' ? nextValue : current?.exam ?? null,
    );
  }

  getDraftGrade(classId: string, studentId: string, quarter: Quarter, key: 'written' | 'performance' | 'exam'): string | null {
    const draftKey = `${classId}_${studentId}_${quarter}`;
    const draft = this.bulkGradesDraft()[draftKey];
    if (draft && draft[key] !== undefined && draft[key] !== '') return draft[key];
    
    // fallback to existing grade in state
    const existing = this.gradeValueForClass(classId, studentId, key, quarter);
    return existing !== null ? String(existing) : null;
  }

  updateDraftGrade(classId: string, studentId: string, quarter: Quarter, key: 'written' | 'performance' | 'exam', value: string) {
    const draftKey = `${classId}_${studentId}_${quarter}`;
    this.bulkGradesDraft.update(drafts => {
      const current = drafts[draftKey] || { written: '', performance: '', exam: '' };
      return { ...drafts, [draftKey]: { ...current, [key]: value } };
    });
  }

  saveBulkGrades() {
    const drafts = this.bulkGradesDraft();
    const gradesToSave = [];
    
    for (const [key, values] of Object.entries(drafts)) {
      const [classId, studentId, quarter] = key.split('_') as [string, string, Quarter];
      
      const existingWritten = this.gradeValueForClass(classId, studentId, 'written', quarter);
      const existingPerf = this.gradeValueForClass(classId, studentId, 'performance', quarter);
      const existingExam = this.gradeValueForClass(classId, studentId, 'exam', quarter);

      gradesToSave.push({
        classId,
        studentId,
        quarter,
        written: values.written !== '' ? Number(values.written) : existingWritten,
        performance: values.performance !== '' ? Number(values.performance) : existingPerf,
        exam: values.exam !== '' ? Number(values.exam) : existingExam,
      });
    }

    if (gradesToSave.length === 0) return;

    this.isSavingGrades.set(true);
    this.teacherStore.upsertGradesBulk(gradesToSave).subscribe({
      next: () => {
        this.bulkGradesDraft.set({});
        this.isSavingGrades.set(false);
        this.showToast('success', 'All grades saved successfully.');
      },
      error: () => {
        this.isSavingGrades.set(false);
        this.showToast('error', 'Failed to save grades.');
      }
    });
  }

  updateGrade(studentId: string, key: 'written' | 'performance' | 'exam', value: string) {
    const section = this.selectedClass();
    if (!section) return;

    const current = this.gradeFor(studentId);
    const nextValue = value === '' ? null : Math.max(0, Math.min(100, Number(value)));
    this.teacherStore.upsertGrade(
      section.id,
      studentId,
      this.selectedQuarter(),
      key === 'written' ? nextValue : current?.written ?? null,
      key === 'performance' ? nextValue : current?.performance ?? null,
      key === 'exam' ? nextValue : current?.exam ?? null,
    );
  }

  private gradeSubjectQuarterKey(studentId: string, classId: string): string {
    return `${studentId}::${classId}`;
  }

  viewAcademicProfile(student: any) {
    this.academicProfile.set(null);
    this.academicProfileInsights.set(null);
    this.isAcademicProfileLoading.set(true);
    this.selectedAttendanceStudentId.set(null); // close attendance dialog

    this.teacherStore.getStudentAcademicProfile(student.id).subscribe({
      next: (response) => {
        const pStudent = response.student || {};
        const pGrades = response.grades || [];
        const subjects = getSubjectsForGradeLevel(pStudent.gradeLevel || student.gradeLevel);

        const mappedGrades = subjects.map(subject => {
          // Find if the teacher has uploaded a grade for this specific subject (by class subject matching)
          const recordQ1 = pGrades.find((g: any) => g.quarter === 'Q1');
          const recordQ2 = pGrades.find((g: any) => g.quarter === 'Q2');
          const recordQ3 = pGrades.find((g: any) => g.quarter === 'Q3');
          const recordQ4 = pGrades.find((g: any) => g.quarter === 'Q4');

          // If the teacher has entered grades for their own subject, show them, else empty.
          // For a real app, this would merge from all teachers.
          const isMySubject = pGrades.length > 0; // Simple mock: if there are any grades, assume they are for the first subject, or we just map it.
          // Better: just mock the other subjects to '-' or 85+ and put the actual grades for the teacher's subject if we can determine it. 
          
          return {
            subject,
            q1: isMySubject ? (recordQ1?.written || recordQ1?.exam || recordQ1?.performance || null) : null,
            q2: isMySubject ? (recordQ2?.written || recordQ2?.exam || recordQ2?.performance || null) : null,
            q3: isMySubject ? (recordQ3?.written || recordQ3?.exam || recordQ3?.performance || null) : null,
            q4: isMySubject ? (recordQ4?.written || recordQ4?.exam || recordQ4?.performance || null) : null,
            finalGrade: null
          };
        });

        const mappedProfile = {
          firstName: pStudent.firstName || student.name.split(' ')[0],
          lastName: pStudent.lastName || student.name.split(' ').slice(1).join(' '),
          lrn: pStudent.studentNo || student.studentNo,
          gender: pStudent.gender || student.gender || 'Not specified',
          gradeLevel: pStudent.gradeLevel || student.gradeLevel || 'Unknown',
          section: pStudent.academicRecords?.[0]?.section || 'Unknown',
          enrollmentStatus: pStudent.enrollmentStatus || 'Enrolled',
          adviser: pStudent.academicRecords?.[0]?.adviser || 'Not assigned',
          contactNo: pStudent.contactNo || pStudent.guardian || 'N/A',
          photoUrl: pStudent.photoUrl || student.photoUrl,
          grades: mappedGrades,
          coreValues: pStudent.coreValues || []
        };

        this.academicProfile.set(mappedProfile);
        this.isAcademicProfileLoading.set(false);
      },
      error: () => {
        this.isAcademicProfileLoading.set(false);
      }
    });
  }

  askDefaultAi(profile: any) {
    this.closeAcademicProfile();
    this.floatingAi.open();
    this.floatingAi.sendToolCommand('learner.record', profile.id, `${profile.firstName} ${profile.lastName}`);
  }

  trackByStudentId(index: number, student: any): string {
    return student.id;
  }

  closeAcademicProfile() {
    this.academicProfile.set(null);
    this.academicProfileInsights.set(null);
  }

  averageFor(studentId: string): number | null {
    const grade = this.gradeFor(studentId);
    return grade ? calculateQuarterAverage(grade) : null;
  }

  saveProfile() {
    const form = this.profileForm;
    if (!form.name.trim() || !form.email.trim()) {
      this.showToast('error', 'Name and email are required.');
      return;
    }

    this.teacherStore.updateTeacherProfile(form);
    this.showToast('success', 'Profile settings saved.');
  }

  addResource() {
    const form = this.resourceForm;
    const section = this.selectedClass();
    if (!section || !form.title.trim() || !form.subject.trim()) {
      this.showToast('error', section ? 'Resource title and subject are required.' : 'Assign a class before adding resources.');
      return;
    }

    this.teacherStore.addResource(section.id, form.title, form.type, form.subject);
    this.resourceForm = { title: '', type: 'PDF', subject: '' };
    this.showToast('success', 'Resource added.');
  }

  addDll() {
    const form = this.dllForm;
    const section = this.selectedClass();
    if (!section || !form.objectives.trim() || !form.activities.trim()) {
      this.showToast('error', section ? 'Objectives and activities are required.' : 'Assign a class before saving a DLL.');
      return;
    }

    this.isSavingDll.set(true);
    this.teacherStore.addDll({ classId: section.id, date: this.attendanceDate(), ...form }).subscribe({
      next: () => {
        this.dllForm = { objectives: '', activities: '', materials: '', remarks: '' };
        this.isSavingDll.set(false);
        this.showToast('success', 'Daily Lesson Log saved.');
      },
      error: () => {
        this.isSavingDll.set(false);
        this.showToast('error', 'Failed to save Daily Lesson Log. Please try again.');
      }
    });
  }

  addAnnouncement() {
    const form = this.announcementForm;
    if (!form.title.trim() || !form.body.trim()) {
      this.showToast('error', 'Announcement title and message are required.');
      return;
    }

    this.teacherStore.addAnnouncement(form.audience, form.title, form.body);
    this.announcementForm = { audience: 'All students', title: '', body: '' };
    this.showToast('success', 'Announcement posted.');
  }

  sendMessage() {
    const form = this.messageForm;
    if (!form.thread.trim() || !form.message.trim()) {
      this.showToast('error', 'Recipient and message are required.');
      return;
    }

    this.teacherStore.sendMessage(form.thread, form.audience, form.message);
    this.messageForm = { ...form, message: '' };
    this.showToast('success', 'Message sent.');
  }

  scheduleEntriesFor(day: TeacherScheduleWeekday): TeacherScheduleEntry[] {
    return this.state().scheduleEntries
      .filter(entry => entry.weekday === day)
      .sort((first, second) => first.startTime.localeCompare(second.startTime) || first.title.localeCompare(second.title));
  }

  openScheduleDialog(day: TeacherScheduleWeekday) {
    this.editingScheduleEntryId.set(null);
    this.scheduleDialogDay.set(day);
    this.scheduleForm = { title: this.teacherSubjects()[0] ?? '', startTime: '08:00' };
  }

  editScheduleEntry(entry: TeacherScheduleEntry) {
    this.editingScheduleEntryId.set(entry.id);
    this.scheduleDialogDay.set(entry.weekday);
    this.scheduleForm = { title: entry.title, startTime: entry.startTime };
  }

  closeScheduleDialog() {
    this.scheduleDialogDay.set(null);
    this.editingScheduleEntryId.set(null);
    this.scheduleForm = { title: this.teacherSubjects()[0] ?? '', startTime: '08:00' };
  }

  addScheduleEntry() {
    const day = this.scheduleDialogDay();
    const title = this.scheduleForm.title.trim();
    const startTime = this.scheduleForm.startTime;

    if (!day || !title || !startTime) {
      this.showToast('error', 'Subject and start time are required.');
      return;
    }

    if (!this.teacherSubjects().includes(title)) {
      this.showToast('error', 'Select a subject assigned in the system.');
      return;
    }

    const editingId = this.editingScheduleEntryId();
    if (editingId) {
      this.teacherStore.updateScheduleEntry(editingId, { weekday: day, title, startTime });
      this.showToast('success', 'Schedule entry updated.');
    } else {
      this.teacherStore.addScheduleEntry(day, title, startTime);
      this.showToast('success', 'Schedule entry added.');
    }

    this.closeScheduleDialog();
  }

  deleteScheduleEntry(entry: TeacherScheduleEntry) {
    this.teacherStore.deleteScheduleEntry(entry.id);
    this.showToast('success', 'Schedule entry removed.');
  }

  scheduleTimeLabel(time: string): string {
    const [hourText, minute = '00'] = time.split(':');
    const hour = Number(hourText);
    if (!Number.isFinite(hour)) {
      return time;
    }

    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  }

  scheduleSubjectIcon(subject: string): string {
    const key = subject.toLowerCase();
    if (key.includes('science')) return 'science';
    if (key.includes('math') || key.includes('number')) return 'calculate';
    if (key.includes('language') || key.includes('literacy') || key.includes('english')) return 'menu_book';
    if (key.includes('physical') || key.includes('motor')) return 'directions_run';
    if (key.includes('socio') || key.includes('social')) return 'diversity_3';
    if (key.includes('values') || key.includes('gmrc')) return 'favorite';
    if (key.includes('creative') || key.includes('aesthetic')) return 'palette';
    if (key.includes('cognitive')) return 'psychology';
    return 'auto_stories';
  }

  scheduleSubjectTone(subject: string): string {
    const key = subject.toLowerCase();
    if (key.includes('science')) return 'violet';
    if (key.includes('math') || key.includes('number')) return 'amber';
    if (key.includes('physical') || key.includes('motor')) return 'blue';
    if (key.includes('creative') || key.includes('aesthetic')) return 'rose';
    return 'emerald';
  }

  scheduleSubjectDescription(subject: string): string {
    const key = subject.toLowerCase();
    if (key.includes('science')) return 'Explore. Discover. Learn.';
    if (key.includes('math') || key.includes('number')) return 'Numbers. Logic. Success.';
    if (key.includes('language') || key.includes('literacy') || key.includes('english')) return 'Language & Literature';
    if (key.includes('physical') || key.includes('motor')) return 'Movement. Health. Coordination.';
    if (key.includes('socio') || key.includes('social')) return 'Confidence. Care. Community.';
    if (key.includes('values') || key.includes('gmrc')) return 'Character. Respect. Kindness.';
    if (key.includes('creative') || key.includes('aesthetic')) return 'Create. Imagine. Express.';
    if (key.includes('cognitive')) return 'Think. Solve. Grow.';
    return 'Assigned system subject';
  }

  changePassword() {
    const form = this.passwordForm;
    if (!form.current || !form.next || form.next !== form.confirm) {
      this.showToast('error', 'Password fields are incomplete or do not match.');
      return;
    }

    this.passwordForm = { current: '', next: '', confirm: '' };
    this.showToast('success', 'Password change request validated.');
  }

  classCompletionPercent(section: TeacherClass): number {
    const completed = section.studentIds.filter(studentId => this.averageForStudentInClass(section.id, studentId) !== null).length;
    return section.studentIds.length ? Math.round((completed / section.studentIds.length) * 100) : 0;
  }

  averageForStudentInClass(classId: string, studentId: string): number | null {
    const grade = this.state().grades.find(item => item.classId === classId && item.studentId === studentId && item.quarter === this.selectedQuarter());
    return grade ? calculateQuarterAverage(grade) : null;
  }

  private showToast(type: 'success' | 'error', message: string) {
    this.toast.set({ show: true, type, message });
    window.setTimeout(() => this.toast.set({ ...this.toast(), show: false }), 2500);
  }
}

