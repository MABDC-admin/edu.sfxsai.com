import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const masterlistComponent = readFileSync(
  'src/app/pages/registrar/student-masterlist/student-masterlist.component.ts',
  'utf8',
);
const masterlistTemplate = readFileSync(
  'src/app/pages/registrar/student-masterlist/student-masterlist.component.html',
  'utf8',
);
const learnerProfileComponent = readFileSync(
  'src/app/pages/registrar/learner-profile/learner-profile.component.ts',
  'utf8',
);
const gradeLevels = readFileSync('src/app/core/data/grade-levels.ts', 'utf8');

assert.match(
  gradeLevels,
  /DEFAULT_LEARNER_GRADE_FILTER\s*=\s*'Nursery'/,
  'The shared default learner grade filter should be Nursery.',
);

for (const source of [masterlistComponent, learnerProfileComponent]) {
  assert.match(
    source,
    /DEFAULT_LEARNER_GRADE_FILTER/,
    'Learner grade filters should use a named shared default.',
  );
  assert.match(
    source,
    /\{ value: 'All', label: 'All grade levels' \}/,
    'Users should still be able to switch back to all grade levels.',
  );
}

assert.match(
  masterlistComponent,
  /selectedGrade:\s*string\s*=\s*DEFAULT_LEARNER_GRADE_FILTER/,
  'Student Masterlist should open with Nursery selected.',
);
assert.match(
  masterlistComponent,
  /FormsModule/,
  'Student Masterlist should import FormsModule for the visible grade filter binding.',
);
assert.match(
  masterlistTemplate,
  /\[\(ngModel\)\]="selectedGrade"/,
  'Student Masterlist grade dropdown should display the active default filter.',
);
assert.match(
  learnerProfileComponent,
  /hubGrade\s*=\s*DEFAULT_LEARNER_GRADE_FILTER/,
  'Learner Profile hub should open with Nursery selected.',
);

console.log('learner default grade filter UI test passed');
