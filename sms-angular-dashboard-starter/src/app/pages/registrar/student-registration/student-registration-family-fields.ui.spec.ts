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

assert.match(template, /name="fatherName"/, 'Registration form should collect father name.');
assert.match(template, /name="fatherContact"/, 'Registration form should collect father contact number.');
assert.match(component, /fatherName:\s*''/, 'Registration draft should track father name.');
assert.match(component, /fatherContact:\s*''/, 'Registration draft should track father contact number.');
assert.match(component, /fatherName:\s*this\.draft\.fatherName/, 'Student create payload should save father name.');
assert.match(component, /fatherContact:\s*this\.draft\.fatherContact/, 'Student create payload should save father contact number.');

console.log('student registration family fields UI test passed');
