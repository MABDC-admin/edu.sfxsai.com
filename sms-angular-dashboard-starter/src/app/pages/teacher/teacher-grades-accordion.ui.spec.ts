import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/pages/teacher/teacher-portal.component.ts', 'utf8');
const template = readFileSync('src/app/pages/teacher/teacher-portal.component.html', 'utf8');
const styles = [
  readFileSync('src/app/pages/teacher/teacher-portal.component.scss', 'utf8'),
  readFileSync('src/styles.scss', 'utf8'),
].join('\n');
const gradesSection = template.match(/<section \*ngIf="currentView\(\) === 'grades'"[\s\S]*?<section \*ngIf="currentView\(\) === 'schedule'"/)?.[0] ?? '';

assert.match(
  component,
  /expandedGradeStudentId/,
  'Teacher grades should track which learner accordion is expanded.',
);

assert.match(
  component,
  /gradeLearners/,
  'Teacher grades should render unique learners instead of only one selected subject roster.',
);

assert.match(
  component,
  /gradeSubjectsForStudent/,
  'Teacher grades should derive subject rows for each expanded learner.',
);

assert.match(
  component,
  /gradeLearnerSummaryAverage/,
  'Teacher grades should calculate learner card summary averages without optional template class ids.',
);

assert.match(
  component,
  /updateGradeForClass/,
  'Teacher grades should save scores against the selected learner subject class.',
);

assert.match(
  gradesSection,
  /gradebook-learner-list/,
  'Teacher grades UI should render a learner-first accordion list.',
);

assert.match(
  gradesSection,
  /grade-learner-card/,
  'Teacher grades UI should use learner cards instead of a wide table.',
);

assert.match(
  gradesSection,
  /grade-subject-details/,
  'Expanded learner cards should show subject details.',
);

assert.match(
  gradesSection,
  /grade-subject-row/,
  'Expanded learner details should include a row for each assigned subject.',
);

assert.match(
  gradesSection,
  /gradeSubjectQuarter\(student\.id,\s*subject\.id\)/,
  'Each learner subject row should use its own quarter selection.',
);

assert.doesNotMatch(
  gradesSection,
  /gradeSubjectsForStudent\(student\.id\)\[0\]\?\.id/,
  'Teacher grades template should not pass a possibly undefined class id into average helpers.',
);

assert.doesNotMatch(
  gradesSection,
  /<table[\s\S]*Written[\s\S]*Performance[\s\S]*Exam/,
  'Teacher grades should not keep the old wide written/performance/exam table.',
);

assert.match(
  styles,
  /\.gradebook-learner-list/,
  'Teacher grades accordion should have dedicated layout styles.',
);

assert.match(
  styles,
  /\.grade-learner-card/,
  'Teacher grades learner cards should have dedicated card styles.',
);

assert.match(
  styles,
  /\.grade-subject-row/,
  'Teacher grades subject details should have dedicated row styles.',
);
