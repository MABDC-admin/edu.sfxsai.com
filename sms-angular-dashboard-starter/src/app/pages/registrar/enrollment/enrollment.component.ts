import { Component } from '@angular/core';
import { NgClass, NgFor, AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { registrarKpis } from '../../../core/data/registrar.mock';
import { EnrollmentApplication, RegistrarKpi, StudentRecord } from '../../../core/models/registrar.models';
import { RegistrarApiService } from '../../../core/services/registrar-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { OnInit, inject, DestroyRef } from '@angular/core';
import { filter, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { buildEnrollmentListFromStudents } from './enrollment-list.util';
import { shouldBlockEnrollmentReview } from './enrollment-review.util';
import { EnrollmentQueueFilter, filterEnrollmentApplications } from './enrollment-search.util';
import { FormsModule } from '@angular/forms';
import { GlobalSearchService } from '../../../core/services/global-search.service';
import { displayGradeLevel } from '../../../core/data/grade-levels';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [NgFor, NgClass, AsyncPipe, DatePipe, NgIf, FormsModule],
  templateUrl: './enrollment.component.html',
  styleUrl: './enrollment.component.scss'
})
export class EnrollmentComponent implements OnInit {
  api = inject(RegistrarApiService);
  private readonly authService = inject(AuthService);
  private readonly globalSearch = inject(GlobalSearchService);
  private readonly route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  kpis: RegistrarKpi[] = [];
  applications: EnrollmentApplication[] = [];
  students: StudentRecord[] = [];
  selectedAppForReview: EnrollmentApplication | null = null;
  selectedStudent: StudentRecord | null = null;
  isLoadingStudent = false;
  isApproving = false;
  deletingEnrollmentId = '';
  blockedReviewNotice: { applicationId: string; title: string; message: string } | null = null;
  searchQuery = '';
  selectedQueueFilter: EnrollmentQueueFilter = 'All';
  readonly queueFilters: EnrollmentQueueFilter[] = ['All', 'Pending', 'Enrolled'];
  readonly displayGradeLevel = displayGradeLevel;

  requiredDocuments = [
    'PSA Birth Certificate (Original)',
    'SF9 / Form 138 (Original Report Card)',
    'SF10 / Form 137 (Permanent Record)',
    'Certificate of Good Moral Character',
    '2x2 ID Pictures (2 pcs)',
    'Medical Certificate'
  ];

  toast = {
    show: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  };

  showToast(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    this.toast.title = title;
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;
    setTimeout(() => {
      this.toast.show = false;
    }, 3000);
  }

  constructor() {
    // Deep copy the mock KPIs so we can mutate them
    this.kpis = JSON.parse(JSON.stringify(registrarKpis));
  }

  ngOnInit() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const status = params.get('status');
      this.selectedQueueFilter = this.isQueueFilter(status) ? status : 'All';
    });

    this.api.getAcademicYears().pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((years) => {
        const activeYear = years.find(year => year.isActive) || years[0];
        if (activeYear) this.api.setActiveAcademicYear(activeYear);
        return this.api.getStudents(activeYear?.id);
      })
    ).subscribe({
      next: (data) => this.loadEnrollmentStudents(data),
      error: (err) => console.error('Failed to load data', err)
    });

    this.api.activeAcademicYear$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(ay => !!ay),
      switchMap(ay => this.api.getStudents(ay.id))
    ).subscribe({
      next: (data) => this.loadEnrollmentStudents(data),
      error: (err) => console.error('Failed to load data', err)
    });

    this.globalSearch.query$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(query => {
      this.searchQuery = query;
    });
  }

  private loadEnrollmentStudents(data: StudentRecord[]) {
    this.students = data;
    this.applications = buildEnrollmentListFromStudents(data);

    const total = this.applications.filter(a => a.status === 'Officially Enrolled' || a.status === 'Registrar Cleared').length;
    const pending = this.applications.filter(a => a.status === 'Pending' || a.status === 'Pending Review' || a.status === 'Review').length;
    const cleared = this.applications.filter(a => a.financeStatus === 'Cleared').length;
    const enrolled = this.applications.filter(a => a.status === 'Officially Enrolled').length;

    this.kpis[0].value = total.toString();
    this.kpis[1].value = pending.toString();
    this.kpis[2].value = cleared.toString();
    this.kpis[3].value = enrolled.toString();
  }

  toneClass(tone: RegistrarKpi['tone']): string {
    const classes: Record<RegistrarKpi['tone'], string> = {
      green: 'bg-emerald-50 text-emerald-600',
      blue: 'bg-blue-50 text-blue-600',
      amber: 'bg-amber-50 text-amber-600',
      rose: 'bg-rose-50 text-rose-600',
      violet: 'bg-violet-50 text-violet-600',
      slate: 'bg-slate-100 text-slate-600',
      cyan: 'bg-cyan-50 text-cyan-600'
    };
    return classes[tone];
  }

  statusClass(status: string): string {
    if (status.includes('Officially') || status.includes('Approved') || status.includes('Complete') || status.includes('Cleared')) {
      return 'bg-emerald-50 text-emerald-700';
    }
    if (status.includes('Review') || status.includes('Assessment') || status.includes('Partially')) {
      return 'bg-blue-50 text-blue-700';
    }
    if (status.includes('Missing') || status.includes('Incomplete') || status.includes('Unassessed')) {
      return 'bg-amber-50 text-amber-700';
    }
    return 'bg-slate-100 text-slate-700';
  }

  trackApplication(_: number, item: EnrollmentApplication): string {
    return item.id;
  }

  get filteredApplications(): EnrollmentApplication[] {
    return filterEnrollmentApplications(this.applications, this.searchQuery, this.selectedQueueFilter);
  }

  queueFilterCount(filterValue: EnrollmentQueueFilter): number {
    return filterEnrollmentApplications(this.applications, '', filterValue).length;
  }

  private isQueueFilter(value: string | null): value is EnrollmentQueueFilter {
    return !!value && (this.queueFilters as readonly string[]).includes(value);
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'ADMIN';
  }

  onSearchQueryChange(query: string) {
    this.globalSearch.setQuery(query);
  }

  reviewApplication(app: EnrollmentApplication) {
    if (shouldBlockEnrollmentReview(app.status)) {
      this.showBlockedReviewNotice(app.id, 'Already Enrolled', 'This learner is already Officially Enrolled.');
      return;
    }

    if (app.status === 'For Finance Assessment') {
      this.showToast('Awaiting Finance', 'This learner is waiting for Finance Assessment.', 'warning');
      return;
    }

    this.selectedAppForReview = app;
    this.blockedReviewNotice = null;
    this.selectedStudent = null;
    this.isLoadingStudent = true;

    this.selectedStudent = this.students.find(s => s.id === app.id) || null;
    this.isLoadingStudent = false;
  }

  showBlockedReviewNotice(applicationId: string, title: string, message: string) {
    this.blockedReviewNotice = { applicationId, title, message };
    setTimeout(() => {
      if (this.blockedReviewNotice?.applicationId === applicationId) {
        this.blockedReviewNotice = null;
      }
    }, 3500);
  }

  closeModal() {
    this.selectedAppForReview = null;
    this.selectedStudent = null;
  }

  deleteEnrollment(app: EnrollmentApplication) {
    if (!this.isAdmin() || this.deletingEnrollmentId) {
      return;
    }

    const confirmed = window.confirm(`Delete enrollment for ${app.studentName}? This removes the pending learner record from the enrollment queue.`);
    if (!confirmed) {
      return;
    }

    this.deletingEnrollmentId = app.id;
    this.api.deleteStudent(app.id).subscribe({
      next: () => {
        this.loadEnrollmentStudents(this.students.filter(student => student.id !== app.id));
        this.deletingEnrollmentId = '';
        this.showToast('Deleted', `${app.studentName} enrollment was removed.`, 'success');
      },
      error: (err) => {
        console.error('Failed to delete enrollment', err);
        this.deletingEnrollmentId = '';
        this.showToast('Error', 'Failed to delete enrollment.', 'error');
      },
    });
  }

  approveApplication() {
    if (!this.selectedAppForReview) return;
    this.isApproving = true;

    if (!this.selectedStudent?.id) {
      this.isApproving = false;
      this.showToast('Error', 'Learner record was not found in the masterlist.', 'error');
      return;
    }

    this.api.approveEnrollment(this.selectedStudent.id, { campus: 'SFXSAI' }).subscribe({
      next: (updatedStudent) => {
        // Local Realtime UI update
        if (this.selectedAppForReview) {
          const index = this.applications.findIndex(a => a.id === this.selectedAppForReview!.id);
          if (index !== -1) {
            this.applications[index].status = 'Officially Enrolled';
            this.applications[index].documentStatus = 'Complete';
            this.applications[index].section = updatedStudent.section || this.applications[index].section;
            
            // Recalculate KPIs directly
            const pending = this.applications.filter(a => a.status === 'Pending' || a.status === 'Pending Review' || a.status === 'Review').length;
            const enrolled = this.applications.filter(a => a.status === 'Officially Enrolled').length;
            this.kpis[1].value = pending.toString();
            this.kpis[3].value = enrolled.toString();
          }
        }

        this.students = this.students.map(student =>
          student.id === updatedStudent.id ? { ...student, ...updatedStudent } : student,
        );
        this.closeModal();
        this.isApproving = false;
        const section = updatedStudent.section;
        const toastMessage = section
          ? `Auto-assigned to ${section}. Application successfully enrolled.`
          : 'Application successfully enrolled. No available section was found for automatic assignment.';
        this.showToast(
          'Success',
          toastMessage,
          section ? 'success' : 'warning'
        );
      },
      error: (err) => {
        console.error('Failed to review application', err);
        this.isApproving = false;
        this.showToast('Error', 'Failed to review application.', 'error');
      }
    });
  }
}
