import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { displayGradeLevel, gradeLevelMatches, normalizeGradeLevel } from '../../core/data/grade-levels';
import { CalendarEvent } from '../../core/models/registrar.models';
import { CalendarService } from '../../core/services/calendar.service';
import {
  buildExecutiveSummary,
  buildGradeEnrollment,
  findAtRiskStudents,
  PrincipalClassSection,
  sortTeachersByWorkload,
  subjectPerformance,
} from './principal-portal.util';
import { PrincipalPortalService, PrincipalPortalState } from './principal-portal.service';

type PrincipalView =
  | 'dashboard'
  | 'teachers'
  | 'students'
  | 'classes'
  | 'performance'
  | 'attendance'
  | 'alerts'
  | 'reports';

type PrincipalModule = {
  label: string;
  route: string;
  icon: string;
};

@Component({
  selector: 'app-principal-portal',
  standalone: true,
  imports: [DatePipe, FormsModule, NgClass, NgFor, NgIf, RouterLink],
  templateUrl: './principal-portal.component.html',
  styleUrl: './principal-portal.component.scss',
})
export class PrincipalPortalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly store = inject(PrincipalPortalService);
  private readonly authService = inject(AuthService);
  private readonly calendarService = inject(CalendarService);

  readonly state = signal<PrincipalPortalState>(this.store.snapshot());
  readonly calendarEvents = signal<CalendarEvent[]>([]);
  readonly loadState = signal({ loading: false, error: '' });
  readonly currentView = signal<PrincipalView>('dashboard');
  readonly gradeFilter = signal('All');
  readonly subjectFilter = signal('All');
  readonly currentUser = signal<{ avatarUrl?: string; email?: string } | null>(null);
  readonly toast = signal<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: '',
  });

  readonly modules: PrincipalModule[] = [
    { label: 'Enrollment', route: 'enrollment', icon: 'assignment_turned_in' },
    { label: 'Student Masterlist', route: 'student-masterlist', icon: 'groups' },
    { label: 'Learner Profile', route: 'learner-profile', icon: 'account_circle' },
    { label: 'Document Verification', route: 'documents', icon: 'folder_open' },
    { label: 'Academic Records', route: 'academic-records', icon: 'history_edu' },
    { label: 'Alerts', route: 'alerts', icon: 'notification_important' },
  ];

  readonly summary = computed(() =>
    buildExecutiveSummary(this.state().students, this.state().teachers, this.state().classes),
  );
  readonly gradeEnrollment = computed(() => buildGradeEnrollment(this.state().students));
  readonly atRiskStudents = computed(() => findAtRiskStudents(this.filteredStudents()));
  readonly teacherWorkload = computed(() => sortTeachersByWorkload(this.state().teachers));
  readonly maxTeacherLoad = computed(() => this.teacherWorkload()[0]?.classesHandled ?? 0);
  readonly subjectLeaders = computed(() => subjectPerformance(this.filteredSubjects()));
  readonly topPerformers = computed(() => [...this.filteredStudents()].sort((a, b) => b.average - a.average).slice(0, 4));
  readonly gradeLevels = computed(() => [
    'All',
    ...Array.from(new Set(this.state().students.map(student => normalizeGradeLevel(student.gradeLevel)))),
  ]);
  readonly subjects = computed(() => ['All', ...Array.from(new Set(this.state().subjects.map(subject => subject.subject)))]);
  readonly academicYearLabel = computed(() => {
    const year = this.state().academicYear;
    return year?.code || year?.label || year?.schoolYear || 'School Year';
  });
  readonly displayGradeLevel = displayGradeLevel;
  private loadedCalendarAcademicYearId = '';
  readonly filteredStudents = computed(() => {
    const grade = this.gradeFilter();
    return grade === 'All'
      ? this.state().students
      : this.state().students.filter(student => gradeLevelMatches(student.gradeLevel, grade));
  });
  readonly filteredSubjects = computed(() => {
    const subject = this.subjectFilter();
    return subject === 'All' ? this.state().subjects : this.state().subjects.filter(item => item.subject === subject);
  });

  ngOnInit(): void {
    this.store.state$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(state => {
      this.state.set(state);
      const academicYearId = state.academicYear?.id ?? '';
      if (academicYearId && academicYearId !== this.loadedCalendarAcademicYearId) {
        this.loadedCalendarAcademicYearId = academicYearId;
        this.calendarService.getEvents(academicYearId).pipe(
          catchError(() => of([] as CalendarEvent[])),
          switchMap(events =>
            events.length ? of(events) : this.calendarService.getEvents().pipe(catchError(() => of([] as CalendarEvent[]))),
          ),
          takeUntilDestroyed(this.destroyRef),
        ).subscribe(events => {
          this.calendarEvents.set(this.upcomingCalendarEvents(events));
        });
      }
    });

    this.store.loadState$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(loadState => {
      this.loadState.set(loadState);
    });

    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(auth => {
      this.currentUser.set(auth?.user ?? null);
    });

    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      const routeView = typeof data['principalView'] === 'string' ? (data['principalView'] as string) : 'dashboard';
      this.currentView.set(this.isSupportedView(routeView) ? (routeView as PrincipalView) : 'dashboard');
    });

    this.store.load();
  }

  principalName(): string {
    return this.state().principal.name || this.currentUser()?.email || 'Principal';
  }

  percent(value: number): string {
    return `${Math.max(4, Math.min(100, value))}%`;
  }

  principalInitials(): string {
    const source = this.principalName();
    const letters = source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
    return letters || 'P';
  }

  sectionEnrollmentWidth(value: number): number {
    return Math.min(value * 10, 100);
  }

  sectionSubjectChips(section: PrincipalClassSection): string[] {
    return this.normalizedSectionSubjects(section).slice(0, 4);
  }

  hiddenSubjectCount(section: PrincipalClassSection): number {
    return Math.max(0, this.normalizedSectionSubjects(section).length - 4);
  }

  alertClass(severity: string): string {
    return severity.toLowerCase();
  }

  retryLoad() {
    this.store.load();
  }

  exportReport(type: string) {
    this.showToast('success', `${type} export prepared from live leadership data.`);
  }

  private isSupportedView(value: string): value is PrincipalView {
    return ['dashboard', 'teachers', 'students', 'classes', 'performance', 'attendance', 'alerts', 'reports'].includes(value);
  }

  private upcomingCalendarEvents(events: CalendarEvent[]): CalendarEvent[] {
    return [...(events ?? [])].sort(
      (first, second) => new Date(first.eventDate).getTime() - new Date(second.eventDate).getTime(),
    ).slice(0, 5);
  }

  private normalizedSectionSubjects(section: PrincipalClassSection): string[] {
    const rawSubjects = String(section.subject || '')
      .split(/[,;|/]+/)
      .map(subject => subject.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    const seen = new Set<string>();
    const ignored = new Set(['all subjects', 'general', 'unassigned']);

    return rawSubjects.filter(subject => {
      const key = subject.toLowerCase();
      if (seen.has(key) || ignored.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private showToast(type: 'success' | 'error', message: string) {
    this.toast.set({ show: true, type, message });
    window.setTimeout(() => this.toast.set({ ...this.toast(), show: false }), 2500);
  }
}
