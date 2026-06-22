import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { NgFor, NgIf, LowerCasePipe, NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  registrarStats
} from '../../core/data/dashboard.mock';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { AuthService } from '../../core/services/auth.service';
import { RegistrarApiService } from '../../core/services/registrar-api.service';
import { FinanceApiService } from '../../core/services/finance-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { buildFinanceDashboard, FinanceDashboardModel, formatPeso } from './finance-dashboard.util';
import { shouldShowRegistrarOverview } from './dashboard-visibility.util';
import { buildUpcomingBirthdays, UpcomingBirthday } from './dashboard-birthdays.util';
import { buildRegistrarDashboardMetrics, RegistrarDashboardMetrics } from './registrar-dashboard-metrics.util';
import { displayGradeLevel } from '../../core/data/grade-levels';
import { CalendarService } from '../../core/services/calendar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, LowerCasePipe, NgClass, DatePipe, RouterLink, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  api = inject(RegistrarApiService);
  financeApi = inject(FinanceApiService);
  calendarService = inject(CalendarService);
  destroyRef = inject(DestroyRef);
  
  role: string | null = null;
  currentUser: any = null;
  activeAcademicYearCode = 'Selected School Year';
  activeAcademicYearId = '';

  registrarStats = [...registrarStats];
  registrarMetrics: RegistrarDashboardMetrics | null = null;
  financeDashboard: FinanceDashboardModel | null = null;
  upcomingBirthdays: UpcomingBirthday[] = [];
  calendarEvents: any[] = [];
  formatPeso = formatPeso;
  shouldShowRegistrarOverview = shouldShowRegistrarOverview;
  readonly displayGradeLevel = displayGradeLevel;

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

  downloadFinanceDashboardReportPdf() {
    if (!this.activeAcademicYearId) return;
    this.financeApi.downloadFinanceDashboardReportPdf(this.activeAcademicYearId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const safeYear = this.activeAcademicYearCode.replace(/[^a-z0-9-]+/gi, '-');
        anchor.href = url;
        anchor.download = `Finance_Overview_Report_${safeYear}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Failed to download finance dashboard report PDF', error),
    });
  }
  ngOnInit() {
    this.role = this.authService.getUserRole();
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(auth => {
      this.currentUser = auth?.user || null;
    });
    this.api.refreshAcademicYears();

    this.api.activeAcademicYear$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(ay => !!ay),
      switchMap(ay => {
        this.activeAcademicYearCode = ay.code;
        this.activeAcademicYearId = ay.id;
        // Update the helper text with the AY code
        this.registrarStats[3].helper = ay.code;
        
        return forkJoin({
          academicYear: of(ay),
          students: this.api.getStudents(ay.id).pipe(catchError(() => of([]))),
          assessments: this.role !== 'REGISTRAR' ? this.financeApi.getAssessments(ay.id).pipe(catchError(() => of([]))) : of([]),
          payments: this.role !== 'REGISTRAR' ? this.financeApi.getPayments(ay.id).pipe(catchError(() => of([]))) : of([]),
          sections: this.role === 'REGISTRAR' ? this.api.getSections(ay.id).pipe(catchError(() => of([]))) : of([]),
          documentRequests: this.role === 'REGISTRAR' ? this.api.getDocumentRequests(ay.id).pipe(catchError(() => of([]))) : of([]),
          calendarEvents: this.calendarService.getEvents(ay.id).pipe(catchError(() => of([])))
        });
      })
    ).subscribe(({ academicYear, students, assessments, payments, sections, documentRequests, calendarEvents }) => {
      this.calendarEvents = calendarEvents;
      const registrarMetrics = buildRegistrarDashboardMetrics(students, sections, documentRequests);
      
      // We attach it to the component so template can access the new fields
      this.registrarMetrics = registrarMetrics;

      // Update Registrar Stats
      this.registrarStats[0].value = registrarMetrics.totalStudents.toString();
      this.registrarStats[0].helper = `${registrarMetrics.totalStudents} this year`;
      
      this.registrarStats[1].value = registrarMetrics.pendingEnrollments.toString();
      
      this.registrarStats[2].value = registrarMetrics.droppedOut.toString();
      
      this.registrarStats[3].value = registrarMetrics.officiallyEnrolled.toString();

      if (this.role !== 'REGISTRAR') {
        this.financeDashboard = buildFinanceDashboard(assessments, payments, academicYear.code);
        this.upcomingBirthdays = buildUpcomingBirthdays(students);
      }
    });
  }
}
