import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/pages/registrar/learner-profile/learner-profile.component.ts', 'utf8');
const template = readFileSync('src/app/pages/registrar/learner-profile/learner-profile.component.html', 'utf8');
const apiService = readFileSync('src/app/core/services/registrar-api.service.ts', 'utf8');
const backendController = readFileSync('../sms-nestjs-backend/src/students/students.controller.ts', 'utf8');
const backendService = readFileSync('../sms-nestjs-backend/src/students/students.service.ts', 'utf8');

assert.match(component, /readonly gradeLevels = gradeLevelOptions/, 'Learner profile should expose the canonical grade options.');
assert.match(component, /readonly movementTypes = \[/, 'Move modal should expose movement type choices.');
assert.match(component, /get selectedMoveSections\(\)/, 'Move modal should filter target sections from selected grade.');
assert.match(component, /moveLearnerGradeSection\(id, \{/, 'Save should use the auditable grade-section move API.');
assert.doesNotMatch(component, /updateStudent\(id, \{ section: sectionName \}\)/, 'Move action should not silently patch only the section.');

assert.match(template, /Move Grade \/ Section/, 'Registrar action and modal should say Move Grade / Section.');
assert.match(template, /New Grade/, 'Move modal should include a new grade selector.');
assert.match(template, /Movement Type/, 'Move modal should include movement type.');
assert.match(template, /Reason/, 'Move modal should require a reason.');
assert.match(template, /selectedMoveSections/, 'Move modal should show sections for the selected target grade.');

assert.match(apiService, /moveLearnerGradeSection\(id: string, payload:/, 'Registrar API should expose moveLearnerGradeSection.');
assert.match(apiService, /\/students\/\$\{id\}\/move-grade-section/, 'Registrar API should call the dedicated move endpoint.');

assert.match(backendController, /@Patch\(':id\/move-grade-section'\)/, 'Backend controller should expose move-grade-section.');
assert.match(backendService, /moveGradeSection\(id: string, data: Record<string, unknown>\)/, 'Backend service should implement the move workflow.');
assert.match(backendService, /schema\.learnerMovement/, 'Backend move workflow should write movement history.');

console.log('learner profile move grade-section UI/API test passed');