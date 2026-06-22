import assert from 'node:assert/strict';
import { filterEnrollmentApplications } from './enrollment-search.util.ts';

const applications = [
  {
    id: '1',
    applicationNo: 'SFX-2026-2027-001',
    studentName: 'Lee Brent Cubian',
    gradeLevel: 'Nursery',
    studentType: 'New',
    status: 'Officially Enrolled',
    documentStatus: 'Complete',
    financeStatus: 'Unassessed',
    submittedAt: '',
    reviewedBy: '',
    remarks: '',
  },
  {
    id: '2',
    applicationNo: 'SFX-2026-2027-002',
    studentName: 'Juan Dela Cruz',
    gradeLevel: 'G7',
    studentType: 'Continuing',
    status: 'Pending Review',
    documentStatus: 'Pending',
    financeStatus: 'Unassessed',
    submittedAt: '',
    reviewedBy: '',
    remarks: '',
  },
];

assert.equal(
  filterEnrollmentApplications(applications, '').length,
  2,
  'Blank enrollment search should keep all rows'
);

assert.deepEqual(
  filterEnrollmentApplications(applications, 'cubian').map(app => app.id),
  ['1'],
  'Enrollment search should match learner name'
);

assert.deepEqual(
  filterEnrollmentApplications(applications, '2027-002').map(app => app.id),
  ['2'],
  'Enrollment search should match application number'
);

assert.deepEqual(
  filterEnrollmentApplications(applications, 'pending').map(app => app.id),
  ['2'],
  'Enrollment search should match status and document status'
);

assert.deepEqual(
  filterEnrollmentApplications(applications, '', 'Enrolled').map(app => app.id),
  ['1'],
  'Enrolled filter should show officially enrolled applications'
);

assert.deepEqual(
  filterEnrollmentApplications(applications, '', 'Pending').map(app => app.id),
  ['2'],
  'Pending filter should show pending and review applications'
);

assert.deepEqual(
  filterEnrollmentApplications(applications, 'juan', 'Pending').map(app => app.id),
  ['2'],
  'Status filter should combine with search'
);
