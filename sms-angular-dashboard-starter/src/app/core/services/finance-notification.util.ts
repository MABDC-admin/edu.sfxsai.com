import type { StudentAssessment } from '../models/finance.models';
import type { StudentRecord } from '../models/registrar.models';

const DEACTIVATED_ENROLLMENT_STATUSES = new Set(['Dropped Out', 'Transferred Out']);
const FROZEN_FINANCE_STATUS = 'Frozen';

function isFinanceAssessmentEligible(student: StudentRecord): boolean {
  return !!student.id
    && !DEACTIVATED_ENROLLMENT_STATUSES.has(String(student.enrollmentStatus || '').trim())
    && student.financeStatus !== FROZEN_FINANCE_STATUS;
}

export function countLearnersNeedingAssessment(
  students: StudentRecord[],
  assessments: Pick<StudentAssessment, 'studentId' | 'academicYearId'>[],
  academicYearId?: string,
) {
  if (!academicYearId) return 0;

  const assessedStudentIds = new Set(
    assessments
      .filter((assessment) => assessment.academicYearId === academicYearId)
      .map((assessment) => assessment.studentId),
  );

  return students.filter((student) => isFinanceAssessmentEligible(student) && !assessedStudentIds.has(student.id as string)).length;
}


