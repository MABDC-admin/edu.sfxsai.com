import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/pages/registrar/student-masterlist/student-masterlist.component.ts', 'utf8');
const template = readFileSync('src/app/pages/registrar/student-masterlist/student-masterlist.component.html', 'utf8');
const apiService = readFileSync('src/app/core/services/registrar-api.service.ts', 'utf8');
const backendController = readFileSync('../sms-nestjs-backend/src/students/students.controller.ts', 'utf8');
const backendService = readFileSync('../sms-nestjs-backend/src/students/students.service.ts', 'utf8');

assert.match(component, /type MasterlistStatusFilter = 'Active' \| 'Pending' \| 'Disabled' \| 'Dropped Out' \| 'Transferred Out' \| 'All'/, 'Masterlist should expose a Disabled status group with dropout and transfer statuses.');
assert.match(component, /selectedStatusFilter: MasterlistStatusFilter = 'Active'/, 'Masterlist should default to active learners.');
assert.match(component, /isDisabledLearner\(student: StudentRecord\): boolean/, 'Masterlist should identify disabled learners.');
assert.match(component, /openDisableLearnerModal\(student: StudentRecord\)/, 'Rows should open a disable learner modal.');
assert.match(component, /confirmDisableLearner\(\)/, 'Masterlist should confirm a disable learner transition.');
assert.match(component, /disablePayload/, 'Masterlist should collect disable movement type, date, reason, and remarks.');
assert.match(component, /movementType:\s*'Dropout' \| 'Transfer Out'/, 'Disable payload should support dropout or transfer-out movement types.');

assert.match(apiService, /disableLearner\(id: string, payload:/, 'Registrar API should expose a disable learner endpoint.');
assert.match(apiService, /\/students\/\$\{id\}\/disable/, 'Registrar API should call the backend disable route.');

assert.match(backendController, /@Patch\(':id\/disable'\)/, 'Backend should expose a disable learner route.');
assert.match(backendService, /disableStudent\(id: string, data: Record<string, unknown>\)/, 'Backend service should implement generic learner disable.');
assert.match(backendService, /Transferred Out/, 'Backend should support transferred-out learner status.');

assert.match(template, /aria-label="Disable learner"/, 'Row action should remain accessible with an aria label.');
assert.match(template, /title="Disable learner"/, 'Row action should expose a tooltip title.');
assert.match(template, />thumb_down<\//, 'Row action should use a thumb_down icon.');
assert.doesNotMatch(template, />\s*Disable Learner\s*</, 'Row action should not show Disable Learner as visible text.');
assert.match(template, /Transfer Out/, 'Disable modal should include Transfer Out option.');
assert.match(template, /Confirm Disable/, 'Disable modal should have a clear confirmation button.');
assert.doesNotMatch(template, /openDropoutModal\(student\)/, 'Rows should no longer expose only a dropout-specific action.');

console.log('student masterlist disable learner UI/API test passed');
