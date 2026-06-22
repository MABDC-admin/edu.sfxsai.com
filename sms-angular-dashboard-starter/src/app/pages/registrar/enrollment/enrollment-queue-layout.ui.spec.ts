import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/pages/registrar/enrollment/enrollment.component.ts', 'utf8');
const template = readFileSync('src/app/pages/registrar/enrollment/enrollment.component.html', 'utf8');

assert.doesNotMatch(template, /Enrollment Flow/, 'Enrollment Flow side widget should be removed.');
assert.doesNotMatch(template, /xl:grid-cols-\[1fr_20rem\]/, 'Enrollment Queue should no longer reserve a side column.');
assert.match(component, /selectedQueueFilter:\s*EnrollmentQueueFilter\s*=\s*'All'/, 'Enrollment Queue should track a selected status filter.');
assert.match(component, /queueFilters:\s*EnrollmentQueueFilter\[\]\s*=\s*\['All', 'Pending', 'Enrolled'\]/, 'Enrollment Queue should expose All, Pending, and Enrolled filters.');
assert.match(template, /\*ngFor="let filter of queueFilters"/, 'Enrollment Queue should render filter controls.');
assert.match(template, /\(click\)="selectedQueueFilter = filter"/, 'Enrollment Queue filter controls should update the selected filter.');
assert.match(template, /queueFilterCount\(filter\)/, 'Enrollment Queue filters should show counts.');

console.log('enrollment queue layout UI test passed');
