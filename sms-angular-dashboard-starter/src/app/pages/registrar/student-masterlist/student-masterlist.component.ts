import { Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OnInit, inject, DestroyRef } from '@angular/core';
import { switchMap, filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RegistrarApiService } from '../../../core/services/registrar-api.service';
import { StudentRecord } from '../../../core/models/registrar.models';
import { replaceStudentInList } from './student-masterlist-realtime.util';
import { DEFAULT_LEARNER_GRADE_FILTER, displayGradeLevel, gradeLevelMatches, gradeLevelOptions } from '../../../core/data/grade-levels';

type MasterlistStatusFilter = 'Active' | 'Pending' | 'Disabled' | 'Dropped Out' | 'Transferred Out' | 'All';
type DisableMovementType = 'Dropout' | 'Transfer Out';

@Component({
  selector: 'app-student-masterlist',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, RouterLink],
  templateUrl: './student-masterlist.component.html',
  styleUrl: './student-masterlist.component.scss'
})
export class StudentMasterlistComponent implements OnInit {
  private api = inject(RegistrarApiService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  students: StudentRecord[] = [];
  selectedGrade: string = DEFAULT_LEARNER_GRADE_FILTER;
  selectedStatusFilter: MasterlistStatusFilter = 'Active';
  statusFilters: Array<{ value: MasterlistStatusFilter; label: string }> = [
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Disabled', label: 'Disabled' },
    { value: 'Dropped Out', label: 'Dropped Out' },
    { value: 'Transferred Out', label: 'Transferred Out' },
    { value: 'All', label: 'All' },
  ];
  grades = [{ value: 'All', label: 'All grade levels' }, ...gradeLevelOptions];
  readonly displayGradeLevel = displayGradeLevel;
  selectedDisableStudent: StudentRecord | null = null;
  disablePayload = this.createDisablePayload();
  disableError = '';
  disablingStudentId = '';

  get filteredStudents(): StudentRecord[] {
    return this.students.filter((student) => {
      const gradeMatches = this.selectedGrade === 'All' || gradeLevelMatches(student.gradeLevel, this.selectedGrade);
      return gradeMatches && this.statusMatches(student);
    });
  }

  ngOnInit() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const status = params.get('status');
        const grade = params.get('grade');
        if (this.isStatusFilter(status)) {
          this.selectedStatusFilter = status;
          if ((status === 'Dropped Out' || status === 'Transferred Out' || status === 'Disabled') && !grade) {
            this.selectedGrade = 'All';
          }
        }
        if (this.isGradeFilter(grade)) {
          this.selectedGrade = grade;
        }
      });

    this.api.activeAcademicYear$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(ay => !!ay),
      switchMap(ay => this.api.getStudents(ay.id))
    ).subscribe({
      next: (data) => this.students = data,
      error: (err) => console.error('Failed to load data', err)
    });

    this.api.studentUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updatedStudent) => {
        this.students = replaceStudentInList(this.students, updatedStudent);
      });
  }

  statusClass(status: string): string {
    if (status.includes('Dropped') || status.includes('Transferred')) {
      return 'bg-slate-200 text-slate-600';
    }
    if (status.includes('Officially') || status.includes('Approved') || status.includes('Cleared') || status.includes('Complete')) {
      return 'bg-emerald-50 text-emerald-700';
    }
    if (status.includes('Review') || status.includes('Assessment') || status.includes('Partially')) {
      return 'bg-blue-50 text-blue-700';
    }
    if (status.includes('Missing') || status.includes('Incomplete') || status.includes('Balance')) {
      return 'bg-amber-50 text-amber-700';
    }
    return 'bg-slate-100 text-slate-700';
  }

  isDroppedOut(student: StudentRecord): boolean {
    return student.enrollmentStatus === 'Dropped Out';
  }

  isDisabledLearner(student: StudentRecord): boolean {
    return student.enrollmentStatus === 'Dropped Out' || student.enrollmentStatus === 'Transferred Out';
  }

  openDisableLearnerModal(student: StudentRecord) {
    if (this.isDisabledLearner(student)) return;
    this.selectedDisableStudent = student;
    this.disablePayload = this.createDisablePayload();
    this.disableError = '';
  }

  closeDisableLearnerModal() {
    if (this.disablingStudentId) return;
    this.selectedDisableStudent = null;
    this.disableError = '';
  }

  confirmDisableLearner() {
    const student = this.selectedDisableStudent;
    if (!student?.id || this.disablingStudentId) return;
    if (!this.disablePayload.reason.trim()) {
      this.disableError = 'Choose a dropout or transfer reason before confirming.';
      return;
    }

    this.disablingStudentId = student.id;
    this.disableError = '';
    this.api.disableLearner(student.id, {
      movementType: this.disablePayload.movementType,
      effectiveDate: this.disablePayload.effectiveDate,
      reason: this.disablePayload.reason.trim(),
      remarks: this.disablePayload.remarks.trim(),
      requestedBy: 'Registrar',
    }).subscribe({
      next: (updated) => {
        this.students = replaceStudentInList(this.students, updated);
        this.selectedStatusFilter = updated.enrollmentStatus === 'Transferred Out' ? 'Transferred Out' : 'Dropped Out';
        this.selectedDisableStudent = null;
        this.disablingStudentId = '';
      },
      error: () => {
        this.disableError = 'Learner disable update failed. Please try again.';
        this.disablingStudentId = '';
      },
    });
  }

  trackStudent(_: number, item: StudentRecord): string {
    return item.id || '';
  }

  private createDisablePayload(): {
    movementType: 'Dropout' | 'Transfer Out';
    effectiveDate: string;
    reason: string;
    remarks: string;
  } {
    return {
      movementType: 'Dropout',
      effectiveDate: new Date().toISOString().slice(0, 10),
      reason: '',
      remarks: '',
    };
  }

  private statusMatches(student: StudentRecord): boolean {
    if (this.selectedStatusFilter === 'All') return true;
    if (this.selectedStatusFilter === 'Disabled') return this.isDisabledLearner(student);
    if (this.selectedStatusFilter === 'Dropped Out') return student.enrollmentStatus === 'Dropped Out';
    if (this.selectedStatusFilter === 'Transferred Out') return student.enrollmentStatus === 'Transferred Out';
    if (this.selectedStatusFilter === 'Pending') {
      return ['Pending', 'Pending Review', 'Review'].includes(student.enrollmentStatus);
    }
    return !this.isDisabledLearner(student);
  }

  private isGradeFilter(value: string | null): value is string {
    return value === 'All' || gradeLevelOptions.some(option => option.value === value);
  }

  private isStatusFilter(value: string | null): value is MasterlistStatusFilter {
    return value === 'Active' || value === 'Pending' || value === 'Disabled' || value === 'Dropped Out' || value === 'Transferred Out' || value === 'All';
  }
}
