import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const template = readFileSync(
  new URL('./enrollment.component.html', import.meta.url),
  'utf8',
);

assert.match(
  template,
  /review-landscape-modal/,
  'Enrollment review modal should use a dedicated landscape modal class.',
);
assert.match(
  template,
  /max-w-5xl/,
  'Enrollment review modal should be wide enough for a landscape review layout.',
);
assert.match(
  template,
  /review-landscape-grid/,
  'Enrollment review modal body should split review details into a landscape grid.',
);
assert.match(
  template,
  /Birth Date/,
  'Enrollment review modal should show learner birth date.',
);
assert.match(
  template,
  /selectedStudent\.motherTongue/,
  'Enrollment review modal should show learner mother tongue.',
);
assert.match(
  template,
  /selectedStudent\.dialect/,
  'Enrollment review modal should show learner dialect.',
);
assert.match(
  template,
  /selectedStudent\.motherContact/,
  'Enrollment review modal should show mother contact.',
);
assert.match(
  template,
  /selectedStudent\.fatherName/,
  'Enrollment review modal should show father name.',
);
assert.match(
  template,
  /selectedStudent\.fatherContact/,
  'Enrollment review modal should show father contact.',
);
assert.match(
  template,
  /selectedStudent\.previousSchool/,
  'Enrollment review modal should show previous school.',
);
assert.doesNotMatch(
  template,
  /relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all/,
  'Enrollment review modal should no longer use the narrow portrait max-width.',
);

console.log('enrollment review modal landscape UI test passed');
