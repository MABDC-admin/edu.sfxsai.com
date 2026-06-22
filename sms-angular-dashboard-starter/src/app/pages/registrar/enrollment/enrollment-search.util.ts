import type { EnrollmentApplication } from '../../../core/models/registrar.models';

export type EnrollmentQueueFilter = 'All' | 'Pending' | 'Enrolled';

const pendingStatuses = new Set(['Pending', 'Pending Review', 'Review', 'For Review']);
const enrolledStatuses = new Set(['Officially Enrolled', 'Enrolled', 'Registrar Cleared']);

export function filterEnrollmentApplications(
  applications: EnrollmentApplication[],
  query: string,
  statusFilter: EnrollmentQueueFilter = 'All',
): EnrollmentApplication[] {
  const normalizedQuery = query.trim().toLowerCase();
  const byStatus = applications.filter((application) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Pending') return pendingStatuses.has(application.status);
    return enrolledStatuses.has(application.status);
  });

  if (!normalizedQuery) return byStatus;

  return byStatus.filter((application) => {
    const searchableText = [
      application.applicationNo,
      application.studentName,
      application.gradeLevel,
      application.studentType,
      application.status,
      application.documentStatus,
      application.financeStatus,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
