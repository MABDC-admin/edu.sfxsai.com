import assert from 'node:assert/strict';
import { buildAssessmentStudentOptions } from './assessment-editor.util.ts';

const options = buildAssessmentStudentOptions(
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
      studentType: 'Continuing',
      enrollmentStatus: 'Officially Enrolled',
      documentStatus: 'Complete',
      financeStatus: 'With Balance',
    },
    {
      id: 'student-3',
      lrn: 'LRN-3',
      firstName: 'Carlo',
      lastName: 'Lopez',
      gradeLevel: 'G9',
      studentType: 'Continuing',
      enrollmentStatus: 'Dropped Out',
      documentStatus: 'Complete',
      financeStatus: 'Frozen',
    },
    {
      id: 'student-4',
      lrn: 'LRN-4',
      firstName: 'Dina',
      lastName: 'Cruz',
      gradeLevel: 'G10',
      studentType: 'Continuing',
      enrollmentStatus: 'Transferred Out',
      documentStatus: 'Complete',
      financeStatus: 'Frozen',
    },
  ],
  [{ studentId: 'student-2', academicYearId: 'ay-1' }, { studentId: 'student-3', academicYearId: 'ay-1' }],
  'ay-1',
);

assert.equal(options.length, 2, 'deactivated learners should not appear in the edit assessment picker');
assert.equal(options[0].status, 'New assessment');
assert.equal(options[0].isAssessed, false);
assert.equal(options[1].status, 'Edit assessment');
assert.equal(options[1].isAssessed, true);
