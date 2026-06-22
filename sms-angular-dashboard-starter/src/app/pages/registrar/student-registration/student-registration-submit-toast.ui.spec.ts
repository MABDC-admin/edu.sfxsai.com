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

assert.match(template, /Toast Notification/, 'Student registration should render a toast notification.');
assert.match(component, /showToast\('Registration Submitted'/, 'Successful submit should show a submitted toast.');
assert.match(component, /setTimeout\(\(\) => this\.router\.navigate\(\['\/registrar\/enrollment'\]\), 1200\)/, 'Navigation should wait so the success toast is visible.');
assert.doesNotMatch(component, /router\.navigate\(\['\/registrar-finance\/enrollment'\]\)/, 'Submit should navigate to the real Registrar enrollment route.');
assert.match(component, /showToast\('Submission Error'/, 'Enrollment application failure should show an error toast.');

console.log('student registration submit toast UI test passed');
