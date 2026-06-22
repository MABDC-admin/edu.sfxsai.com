import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync(
  new URL('./student-registration.component.ts', import.meta.url),
  'utf8',
);
const template = readFileSync(
  new URL('./student-registration.component.html', import.meta.url),
  'utf8',
);
const model = readFileSync(
  new URL('../../../core/models/registrar.models.ts', import.meta.url),
  'utf8',
);
const profileTemplate = readFileSync(
  new URL('../learner-profile/learner-profile.component.html', import.meta.url),
  'utf8',
);
const profileComponent = readFileSync(
  new URL('../learner-profile/learner-profile.component.ts', import.meta.url),
  'utf8',
);

assert.match(model, /motherTongue\?:\s*string/, 'Student model should include motherTongue.');
assert.match(model, /dialect\?:\s*string/, 'Student model should include dialect.');
assert.match(template, /name="motherTongue"/, 'Registration form should collect mother tongue.');
assert.match(template, /name="dialect"/, 'Registration form should collect dialect.');
assert.match(component, /motherTongue:\s*this\.draft\.motherTongue/, 'Student create payload should save mother tongue.');
assert.match(component, /dialect:\s*this\.draft\.dialect/, 'Student create payload should save dialect.');
assert.match(profileTemplate, /Mother tongue/, 'Learner profile should display mother tongue.');
assert.match(profileTemplate, /student\.motherTongue/, 'Learner profile should bind motherTongue.');
assert.match(profileTemplate, /student\.dialect/, 'Learner profile should bind dialect.');
assert.match(profileComponent, /motherTongue:\s*this\.student\.motherTongue/, 'Learner profile edit form should load mother tongue.');
assert.match(profileComponent, /dialect:\s*this\.student\.dialect/, 'Learner profile edit form should load dialect.');

console.log('student registration language fields UI test passed');
