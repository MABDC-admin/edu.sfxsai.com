import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const component = read('src/app/pages/registrar/student-masterlist/student-masterlist.component.ts');
const template = read('src/app/pages/registrar/student-masterlist/student-masterlist.component.html');
const styles = read('src/app/pages/registrar/student-masterlist/student-masterlist.component.scss');

assert.match(component, /FeeTemplate/, 'Student masterlist should track Finance fee templates.');
assert.match(component, /getFeeTemplates\(ay\.id\)/, 'Finance masterlist should load fee templates with students and assessments.');
assert.match(component, /openAssessmentModal\(student/, 'Component should expose an assessment modal opener.');
assert.match(component, /selectedAssessmentTemplateId/, 'Component should track selected assessment template.');
assert.match(component, /saveMasterlistAssessment\(\)/, 'Component should save an assessment from the modal.');
assert.match(component, /finance\.saveAssessment/, 'Assessment modal should use the existing Finance saveAssessment API.');
assert.match(component, /getFeeTemplateLineItems/, 'Assessment modal should use existing template line item mapping.');

assert.match(template, /class="finance-assess-button"/, 'Finance column should include an Assess button.');
assert.match(template, /\(click\)="openAssessmentModal\(student\)"/, 'Assess button should open the modal for the row learner.');
assert.match(template, /class="assessment-modal-backdrop"/, 'Assessment flow should render a modal dialog.');
assert.match(template, /Template fee selection/, 'Modal should clearly label template fee selection.');
assert.match(template, /\*ngFor="let template of assessmentTemplateOptions"/, 'Modal should list available templates.');
assert.match(template, /\(click\)="saveMasterlistAssessment\(\)"/, 'Modal should have a save action.');

assert.match(styles, /\.finance-assess-button/, 'Assess button should have dedicated styling.');
assert.match(styles, /\.assessment-modal-panel/, 'Assessment modal should have dedicated panel styling.');
assert.match(styles, /\.template-choice-card/, 'Template choices should be styled as cards.');

console.log('student masterlist assessment modal UI contract passed');
