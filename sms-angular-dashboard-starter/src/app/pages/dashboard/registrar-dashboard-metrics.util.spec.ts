import assert from 'node:assert/strict';
import { buildRegistrarDashboardMetrics } from './registrar-dashboard-metrics.util.ts';

const metrics = buildRegistrarDashboardMetrics([
  { enrollmentStatus: 'Officially Enrolled', documentStatus: 'Complete', gradeLevel: 'Nursery', enrollmentSubmittedAt: '2026-06-01T00:00:00.000Z' },
  { enrollmentStatus: 'Registrar Cleared', documentStatus: 'Cleared', gradeLevel: 'Grade 1', enrollmentSubmittedAt: '2026-06-02T00:00:00.000Z' },
  { enrollmentStatus: 'Pending Review', documentStatus: 'Pending', gradeLevel: 'Nursery', enrollmentSubmittedAt: '2026-06-03T00:00:00.000Z' },
  { enrollmentStatus: 'Pending', documentStatus: 'Incomplete', gradeLevel: 'Grade 2', enrollmentSubmittedAt: '2026-06-04T00:00:00.000Z' },
  { enrollmentStatus: 'Review', documentStatus: 'Complete', gradeLevel: 'Grade 2', enrollmentSubmittedAt: '2026-06-05T00:00:00.000Z' },
  { enrollmentStatus: 'Dropped Out', documentStatus: 'Complete', gradeLevel: 'Grade 3', enrollmentSubmittedAt: '2026-06-06T00:00:00.000Z' },
] as any[]);

assert.equal(metrics.totalStudents, 2);
assert.equal(metrics.officiallyEnrolled, 2);
assert.equal(metrics.pendingEnrollments, 3);
assert.equal(metrics.incompleteDocs, 1);
assert.equal(metrics.droppedOut, 1);
assert.deepEqual(
  metrics.gradeLevelStats.map(item => ({ grade: item.grade, count: item.count })),
  [
    { grade: 'Grade 1', count: 1 },
    { grade: 'Nursery', count: 1 },
  ],
);
assert.equal(metrics.enrollmentTrend.find(item => item.month === 'Jun')?.count, 2);
