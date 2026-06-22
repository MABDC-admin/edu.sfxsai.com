import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(import.meta.dirname, 'principal-portal.util.ts'), 'utf8');

assert.match(
  source,
  /const activeStudents = students\.filter\(student => student\.status === 'Active'\)/,
  'Principal executive summary should count active learners, not pending or dropped enrollment rows.',
);
assert.match(source, /totalStudents:\s*activeStudents\.length/);
assert.match(source, /attendanceRate:\s*average\(activeStudents\.map/);
assert.match(source, /averagePerformance:\s*average\(activeStudents\.map/);
assert.match(
  source,
  /students\.filter\(student => student\.status === 'Active'\)\.reduce/,
  'Principal grade enrollment should only include active learners.',
);

console.log('principal active student count UI test passed');
