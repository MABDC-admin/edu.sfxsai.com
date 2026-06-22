import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/pages/teacher/teacher-portal.component.ts', 'utf8');
const template = readFileSync('src/app/pages/teacher/teacher-portal.component.html', 'utf8');
const service = readFileSync('src/app/pages/teacher/teacher-portal.service.ts', 'utf8');
const styles = readFileSync('src/styles.scss', 'utf8');
const scheduleSection = template.match(/<section \*ngIf="currentView\(\) === 'schedule'"[\s\S]*?<\/section>/)?.[0] ?? '';

for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
  assert.match(component, new RegExp(`['"]${day}['"]`), `Teacher schedule builder should include ${day}.`);
}

assert.match(
  component,
  /scheduleDialogDay/,
  'Teacher schedule module should track the active day dialog.',
);

assert.match(
  component,
  /addScheduleEntry/,
  'Teacher schedule module should save new title and time schedule entries.',
);

assert.match(
  component,
  /editScheduleEntry/,
  'Teacher schedule module should support editing existing schedule entries.',
);

assert.match(
  service,
  /schedule-entries/,
  'Teacher portal service should persist schedule entries through the teacher API.',
);

assert.match(
  service,
  /updateScheduleEntry/,
  'Teacher portal service should send schedule entry updates through the teacher API.',
);

assert.match(
  template,
  /schedule-entry-dialog/,
  'Teacher schedule UI should render a dialog for adding weekday time slots.',
);

assert.match(
  template,
  /scheduleEntriesFor\(day\)/,
  'Teacher schedule UI should render multiple entries for each weekday.',
);

assert.match(
  component,
  /teacherSubjects/,
  'Teacher schedule builder should derive subject choices from assigned teacher classes.',
);

assert.match(
  template,
  /let subject of teacherSubjects\(\)/,
  'Teacher schedule dialog should render a subject picker from assigned teacher subjects.',
);

assert.match(
  scheduleSection,
  /class-day-board/,
  'Teacher schedule UI should use the large class day board layout from the approved reference.',
);

assert.match(
  scheduleSection,
  /schedule-day-add/,
  'Teacher schedule UI should render a large square add button for each class day.',
);

assert.match(
  scheduleSection,
  /schedule-lesson-card/,
  'Teacher schedule UI should render each entry as a large lesson card.',
);

assert.match(
  styles,
  /minmax\(min\(100%,\s*18\.5rem\),\s*1fr\)/,
  'Teacher schedule should use compact columns so Monday through Friday fit on desktop.',
);

assert.match(
  styles,
  /align-items:\s*start/,
  'Teacher schedule empty day boards should keep their natural compact height instead of stretching to the tallest day.',
);

assert.match(
  styles,
  /max-height:\s*calc\(100vh - 18rem\)/,
  'Teacher schedule day boards should cap their height so busy days fit in the viewport.',
);

assert.match(
  styles,
  /overflow-y:\s*auto/,
  'Teacher schedule day boards should scroll internally when a day has many subjects.',
);

assert.match(
  styles,
  /min-height:\s*4\.85rem/,
  'Teacher schedule lesson cards should stay compact enough for a weekly dashboard.',
);

assert.match(
  styles,
  /width:\s*2\.15rem/,
  'Teacher schedule action buttons should be compact inside the fitted weekly board.',
);

assert.match(
  styles,
  /-webkit-line-clamp:\s*2/,
  'Teacher schedule subject titles should wrap to two lines instead of clipping immediately.',
);

assert.doesNotMatch(
  styles,
  /min-height:\s*(10\.2rem|6\.4rem)/,
  'Teacher schedule should not keep oversized lesson and empty card heights.',
);

assert.match(
  scheduleSection,
  /schedule-time-block/,
  'Teacher schedule lesson cards should include a dedicated left time block.',
);

assert.match(
  scheduleSection,
  /schedule-subject-icon/,
  'Teacher schedule lesson cards should include a subject icon holder.',
);

assert.match(
  template,
  /scheduleSubjectIcon\(entry\.title\)/,
  'Teacher schedule cards should derive subject icons from the system subject title.',
);

assert.match(
  template,
  /scheduleSubjectDescription\(entry\.title\)/,
  'Teacher schedule cards should derive subject descriptions from the system subject title.',
);

assert.match(
  component,
  /teacherSubjects\(\)\.includes\(title\)/,
  'Teacher schedule saves should only accept subjects from assigned system subjects.',
);

assert.doesNotMatch(
  template,
  /name="scheduleTitle"[^>]*placeholder="e\.g\./,
  'Teacher schedule dialog should not use a blank free-text subject input.',
);

assert.doesNotMatch(
  template,
  /scheduleForm\.title && !teacherSubjects\(\)\.includes\(scheduleForm\.title\)/,
  'Teacher schedule dialog should not keep non-system subject titles as selectable options.',
);

assert.doesNotMatch(
  scheduleSection,
  /state\(\)\.classes/,
  'Teacher schedule UI should not render class assignment mocks as the editable timetable.',
);
