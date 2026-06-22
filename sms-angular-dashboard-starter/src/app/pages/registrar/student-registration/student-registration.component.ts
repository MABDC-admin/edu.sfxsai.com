import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { requiredDocumentChecklist, studentTypes } from '../../../core/data/registrar.mock';
import { gradeLevelOptions, gradeLevelMatches } from '../../../core/data/grade-levels';
import { RegistrarApiService } from '../../../core/services/registrar-api.service';
import { Router } from '@angular/router';
import { SectionRecord } from '../../../core/models/registrar.models';

@Component({
  selector: 'app-student-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, NgFor],
  templateUrl: './student-registration.component.html',
  styleUrl: './student-registration.component.scss'
})
export class StudentRegistrationComponent implements OnInit {
  private api = inject(RegistrarApiService);
  private router = inject(Router);

  readonly gradeLevels = gradeLevelOptions;
  readonly studentTypes = studentTypes;
  readonly requiredDocuments = requiredDocumentChecklist;
  sections: SectionRecord[] = [];

  draft = {
    studentNo: 'Auto-generated',
    lrn: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    birthdate: '',
    gender: '',
    motherTongue: '',
    dialect: '',
    gradeLevel: 'G7',
    section: 'SFXSAI',
    studentType: 'New',
    guardianName: '',
    guardianRelation: '',
    guardianContact: '',
    fatherName: '',
    fatherContact: '',
    email: '',
    address: '',
    previousSchool: '',
    remarks: ''
  };

  isSubmitting = false;

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
    }, 4000);
  }

  ngOnInit() {
    this.loadSections();
  }

  get availableSectionsForSelectedGrade() {
    return this.sections.filter(section => gradeLevelMatches(section.gradeLevel, this.draft.gradeLevel));
  }

  get calculatedAge(): number | string {
    if (!this.draft.birthdate) return '';
    const birthDate = new Date(this.draft.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  fillTestData() {
    this.draft = {
      ...this.draft,
      lrn: `109${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      firstName: 'Juan',
      middleName: 'Gomez',
      lastName: 'Dela Cruz',
      suffix: '',
      birthdate: '2012-06-14',
      gender: 'Male',
      motherTongue: 'Cebuano',
      dialect: 'English, Tagalog, Cebuano',
      gradeLevel: 'G7',
      section: 'SFXSAI',
      studentType: 'New',
      guardianName: 'Maria Dela Cruz',
      guardianRelation: 'Mother',
      guardianContact: '09171234567',
      fatherName: 'Jose Dela Cruz',
      fatherContact: '09181234567',
      email: 'maria@example.com',
      address: '123 Main St., Brgy. 1, Manila',
      previousSchool: 'Manila Elementary School',
      remarks: 'Test automation data'
    };
  }

  onSubmit() {
    if (!this.draft.firstName || !this.draft.lastName) {
      this.showToast('Incomplete Fields', 'Please fill out required fields: First Name, Last Name', 'warning');
      return;
    }

    this.isSubmitting = true;

    // 1. Save to Student database
    let activeAyId: string | undefined;
    this.api.activeAcademicYear$.subscribe(ay => {
      if (ay) activeAyId = ay.id;
    }).unsubscribe();

    const payload = {
      lrn: this.draft.lrn,
      firstName: this.draft.firstName,
      middleName: this.draft.middleName,
      lastName: this.draft.lastName,
      suffix: this.draft.suffix,
      birthdate: this.draft.birthdate ? new Date(this.draft.birthdate).toISOString() : undefined,
      gender: this.draft.gender,
      motherTongue: this.draft.motherTongue,
      dialect: this.draft.dialect,
      gradeLevel: this.draft.gradeLevel,
      section: this.draft.section,
      studentType: this.draft.studentType,
      guardian: this.draft.guardianName,
      contactNo: this.draft.guardianContact,
      fatherName: this.draft.fatherName,
      fatherContact: this.draft.fatherContact,
      address: this.draft.address,
      enrollmentStatus: 'Pending',
      documentStatus: 'Incomplete',
      financeStatus: 'Pending',
      academicYearId: activeAyId
    };

    this.api.registerStudent(payload).subscribe({
      next: (student: any) => {
        // 2. Spawn an Enrollment Application
        const fullName = `${this.draft.firstName} ${this.draft.lastName}`;
        const appPayload = {
          studentName: fullName,
          gradeLevel: this.draft.gradeLevel,
          section: this.draft.section,
          studentType: this.draft.studentType,
          status: 'Pending',
          documentStatus: 'Incomplete',
          financeStatus: 'Pending',
          academicYearId: activeAyId
        };

        this.api.createEnrollmentApplication(appPayload).subscribe({
          next: () => {
            this.showToast('Registration Submitted', 'Enrollment application was submitted for registrar review.', 'success');
            setTimeout(() => this.router.navigate(['/registrar/enrollment']), 1200);
          },
          error: (err: any) => {
            console.error('Failed to create application', err);
            this.showToast('Submission Error', 'Learner was saved, but enrollment submission failed. Please retry from the enrollment queue.', 'error');
            this.isSubmitting = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to register student', err);
        this.showToast('Registration Error', 'Failed to register student. Is the LRN already used?', 'error');
        this.isSubmitting = false;
      }
    });
  }

  private loadSections() {
    let activeAyId: string | undefined;
    this.api.activeAcademicYear$.subscribe(ay => {
      if (ay) activeAyId = ay.id;
    }).unsubscribe();

    this.api.getSections(activeAyId).subscribe({
      next: sections => {
        this.sections = sections;
        this.ensureSelectedSection();
      },
      error: () => {
        this.sections = [];
        this.draft.section = 'SFXSAI';
      }
    });
  }

  onGradeLevelChange() {
    this.ensureSelectedSection();
  }

  private ensureSelectedSection() {
    const matchingSections = this.availableSectionsForSelectedGrade;
    if (!matchingSections.length) {
      this.draft.section = 'SFXSAI';
      return;
    }

    if (!matchingSections.some(section => section.sectionName === this.draft.section)) {
      this.draft.section = matchingSections[0].sectionName;
    }
  }
}
