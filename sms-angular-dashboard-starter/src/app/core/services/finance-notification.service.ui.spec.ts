import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const service = readFileSync('src/app/core/services/finance-notification.service.ts', 'utf8');

assert.match(
  service,
  /role\s*!==\s*'FINANCE'/,
  'Finance assessment queue polling must be gated to FINANCE users only.',
);

assert.match(
  service,
  /this\.assessmentQueueCount\.set\(0\);[\s\S]*?return;/,
  'Non-finance roles should clear the notification count without calling finance endpoints.',
);

assert.match(
  service,
  /forkJoin\(\{[\s\S]*?assessments:\s*this\.finance\.getAssessments\(academicYearId\)/,
  'Finance users should still fetch assessments when an academic year is active.',
);
