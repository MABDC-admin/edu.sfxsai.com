import type { StudentAssessment } from '../models/finance.models';
import type { StudentRecord } from '../models/registrar.models';

const DEACTIVATED_ENROLLMENT_STATUSES = new Set(['Dropped Out', 'Transferred Out']);
export const FROZEN_FINANCE_STATUS = 'Frozen';

export function isDeactivatedLearnerStatus(status?: string | null): boolean {
  return DEACTIVATED_ENROLLMENT_STATUSES.has(String(status || '').trim());
}

export function isFinanceAssessmentEligible(
  student: Pick<StudentRecord, 'id' | 'enrollmentStatus' | 'financeStatus'>,
): boolean {
  return !!student.id
    && !isDeactivatedLearnerStatus(student.enrollmentStatus)
    && student.financeStatus !== FROZEN_FINANCE_STATUS;
}

export function isFrozenFinanceAssessment(
  assessment?: Pick<StudentAssessment, 'financeStatus' | 'student'> | null,
): boolean {
  return !!assessment
    && (
      assessment.financeStatus === FROZEN_FINANCE_STATUS
      || isDeactivatedLearnerStatus(assessment.student?.enrollmentStatus)
      || assessment.student?.financeStatus === FROZEN_FINANCE_STATUS
    );
}
