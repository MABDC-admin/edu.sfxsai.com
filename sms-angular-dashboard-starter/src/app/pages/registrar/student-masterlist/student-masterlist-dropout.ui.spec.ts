import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/pages/registrar/student-masterlist/student-masterlist.component.ts', 'utf8');
const template = readFileSync('src/app/pages/registrar/student-masterlist/student-masterlist.component.html', 'utf8');
const styles = readFileSync('src/app/pages/registrar/student-masterlist/student-masterlist.component.scss', 'utf8');
const apiService = readFileSync('src/app/core/services/registrar-api.service.ts', 'utf8');

assert.ok(component.includes("selectedStatusFilter: MasterlistStatusFilter = 'Active'"), 'Student Masterlist should default to active learners.');
assert.ok(component.includes('statusFilters: Array<{ value: MasterlistStatusFilter; label: string }>'), 'Student Masterlist should expose status filter options.');
assert.match(component, /isDisabledLearner\(student: StudentRecord\): boolean/, 'Student Masterlist should identify disabled learners.');
assert.match(component, /openDisableLearnerModal\(student: StudentRecord\)/, 'Student Masterlist should open a disable learner confirmation modal.');
assert.match(component, /confirmDisableLearner\(\)/, 'Student Masterlist should confirm a disable transition.');
assert.match(component, /disablePayload/, 'Student Masterlist should collect movement type, date, reason, and remarks.');

assert.match(apiService, /disableLearner\(id: string, payload:/, 'Registrar API should expose a dedicated disable endpoint.');
assert.match(apiService, /\/students\/\$\{id\}\/disable/, 'Registrar API should call the backend disable route.');

assert.match(template, /\[\(ngModel\)\]="selectedStatusFilter"/, 'Masterlist should render a status filter.');
assert.match(template, /\(click\)="openDisableLearnerModal\(student\)"/, 'Rows should expose a Disable Learner action.');
assert.match(template, /Confirm Disable/, 'Disable modal should have a clear confirmation action.');
assert.match(component, /'Dropped Out'/, 'Dropped-out status should be available in the UI filters.');
assert.match(template, /Transfer Out/, 'Transfer-out option should be visible in the UI.');
assert.match(template, /dropout-modal-panel/, 'Disable modal should use the dedicated modal panel class.');
assert.match(styles, /\.dropped-learner-row/, 'Disabled learner rows should have muted styling.');
assert.match(styles, /\.dropout-modal-panel/, 'Disable modal should have dedicated styling.');

console.log('student masterlist dropout UI test passed');


const dashboardData = readFileSync('src/app/core/data/dashboard.mock.ts', 'utf8');
assert.match(dashboardData, /queryParams:\s*\{\s*status:\s*'Dropped Out',\s*grade:\s*'All'\s*\}/, 'Dropout widget should clear the default Nursery grade filter.');
assert.match(component, /const grade = params\.get\('grade'\)/, 'Masterlist should read grade query params from dashboard widgets.');
assert.match(component, /this\.selectedGrade = 'All'/, 'Dropped-out dashboard links should show all grades by default.');
