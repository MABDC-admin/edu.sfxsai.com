import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const template = readFileSync(join(import.meta.dirname, 'teacher-portal.component.html'), 'utf8');
const styles = readFileSync(join(import.meta.dirname, 'teacher-portal.component.scss'), 'utf8');
const component = readFileSync(join(import.meta.dirname, 'teacher-portal.component.ts'), 'utf8');

const classesSection = template.match(/<section \*ngIf="currentView\(\) === 'classes'"[\s\S]*?<\/section>/)?.[0] ?? '';
const dossierModal = template.match(/<!-- Dossier Modal Overlay -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)?.[0] ?? '';

assert.ok(classesSection, 'Teacher Classes view should exist.');

assert.doesNotMatch(
  classesSection,
  /class="class-card"/,
  'Teacher Classes view should not render old subject summary class cards.',
);

assert.doesNotMatch(
  classesSection,
  /classCompletionPercent\(section\)/,
  'Teacher Classes view should not show subject grading completion cards.',
);

assert.match(
  classesSection,
  /classes-learner-grid/,
  'Teacher Classes view should render learners in a card grid.',
);

assert.match(
  classesSection,
  /class="[^"]*\bclasses-learner-card\b[^"]*"/,
  'Teacher Classes view should use colorful learner cards.',
);

assert.match(
  classesSection,
  /viewAcademicProfile\(student\)/,
  'Teacher Classes learner cards should open the personal profile modal.',
);

assert.match(
  component,
  /classRosterOptions/,
  'Teacher Classes view should use deduplicated class roster options instead of subject rows.',
);

assert.match(
  styles,
  /\.classes-learner-card\s*\{[\s\S]*?animation:/,
  'Teacher Classes learner cards should include a micro-animation.',
);

assert.match(
  styles,
  /\.classes-learner-card:hover\s*\{[\s\S]*?transform:/,
  'Teacher Classes learner cards should animate on hover.',
);

assert.doesNotMatch(
  dossierModal,
  /\bFees?\b|Billing|Finance/i,
  'Teacher personal profile modal should not include a Fees, Billing, or Finance tab.',
);

console.log('teacher classes roster UI test passed');
