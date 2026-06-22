import assert from 'node:assert/strict';
import { countLearnersNeedingAssessment } from './finance-notification.util.ts';

const count = countLearnersNeedingAssessment(
  [
    {
      id: 'student-1',
      lrn: 'LRN-1',
      firstName: 'Ana',
      lastName: 'Santos',
      gradeLevel: 'G7',
      studentType: 'New',
      enrollmentStatus: 'Officially Enrolled',
      documentStatus: 'Complete',
      financeStatus: 'Unassessed',
    },
    {
      id: 'student-2',
      lrn: 'LRN-2',
      firstName: 'Ben',
      lastName: 'Reyes',
      gradeLevel: 'G8',
      studentType: 'New',
      enrollmentStatus: 'Officially Enrolled',
      documentStatus: 'Complete',
      financeStatus: 'Cleared',
    },
    {
      id: 'student-3',
      lrn: 'LRN-3',
      firstName: 'Lia',
      lastName: 'Cruz',
      gradeLevel: 'G9',
      studentType: 'Continuing',
      enrollmentStatus: 'Dropped Out',
      documentStatus: 'Complete',
      financeStatus: 'Frozen',
    },
  ],
  [
    {
      studentId: 'student-2',
      academicYearId: 'ay-2026',
    },
    {
      studentId: 'student-old',
      academicYearId: 'ay-2025',
    },
  ],
  'ay-2026',
);

assert.equal(count, 1);

