import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dashboardData = readFileSync('src/app/core/data/dashboard.mock.ts', 'utf8');
const metricsUtil = readFileSync('src/app/pages/dashboard/registrar-dashboard-metrics.util.ts', 'utf8');
const dashboardComponent = readFileSync('src/app/pages/dashboard/dashboard.component.ts', 'utf8');

assert.doesNotMatch(
  dashboardData,
  /title:\s*'Document Verification',[\s\S]*?helper:\s*'Incomplete files'/,
  'Registrar dashboard stat should no longer use the Document Verification widget.',
);
assert.match(dashboardData, /title:\s*'Drop Out'/, 'Registrar dashboard should include a Drop Out stat widget.');
assert.match(dashboardData, /icon:\s*'person_off'/, 'Drop Out widget should use a disabled learner icon.');
assert.match(dashboardData, /route:\s*'\.\.\/student-masterlist'/, 'Drop Out widget should link to Student Masterlist.');
assert.match(dashboardData, /queryParams:\s*\{\s*status:\s*'Dropped Out',\s*grade:\s*'All'\s*\}/, 'Drop Out widget should open all dropped-out learners across grade levels.');
assert.match(metricsUtil, /droppedOut:\s*number/, 'Registrar metrics should expose dropped-out count.');
assert.match(metricsUtil, /Dropped Out/, 'Registrar metrics should count dropped-out learners.');
assert.match(dashboardComponent, /registrarMetrics\.droppedOut/, 'Dashboard component should bind the Drop Out stat to dropped-out count.');

console.log('dashboard dropout widget UI test passed');