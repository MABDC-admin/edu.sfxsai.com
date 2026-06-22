import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const dashboardData = readFileSync('src/app/core/data/dashboard.mock.ts', 'utf8');
const statModel = readFileSync('src/app/core/models/dashboard.models.ts', 'utf8');
const statCardTs = readFileSync('src/app/shared/components/stat-card/stat-card.component.ts', 'utf8');
const statCardTemplate = readFileSync('src/app/shared/components/stat-card/stat-card.component.html', 'utf8');
const enrollmentComponent = readFileSync('src/app/pages/registrar/enrollment/enrollment.component.ts', 'utf8');

assert.match(statModel, /route\?:\s*string/, 'StatCard should support an optional route target.');
assert.match(statModel, /queryParams\?:\s*Record<string,\s*string>/, 'StatCard should support optional query params.');
assert.match(dashboardData, /title:\s*'Pending Enrollments'[\s\S]*route:\s*'..\/enrollment'[\s\S]*queryParams:\s*\{\s*status:\s*'Pending'\s*\}/, 'Pending Enrollments stat should link to the pending enrollment queue.');
assert.match(statCardTs, /RouterLink/, 'Stat card component should import RouterLink for clickable stats.');
assert.match(statCardTemplate, /\[routerLink\]="stat\.route"/, 'Stat card should render route-bound cards as router links.');
assert.match(statCardTemplate, /\[queryParams\]="stat\.queryParams"/, 'Stat card should pass query params to the router link.');
assert.match(enrollmentComponent, /ActivatedRoute/, 'Enrollment component should read route query params.');
assert.match(enrollmentComponent, /params\.get\('status'\)/, 'Enrollment component should initialize the queue filter from the status query param.');

console.log('pending enrollment stat link UI test passed');
