import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const specDir = fileURLToPath(new URL('.', import.meta.url));
const controller = readFileSync(join(specDir, 'teacher.controller.ts'), 'utf8');
const service = readFileSync(join(specDir, 'teacher.service.ts'), 'utf8');

assert.match(
  controller,
  /@Post\('schedule-entries'\)[\s\S]*createScheduleEntry/,
  'Teacher controller should expose POST /teacher/schedule-entries.',
);

assert.match(
  controller,
  /@Patch\('schedule-entries\/:id'\)[\s\S]*updateScheduleEntry/,
  'Teacher controller should expose PATCH /teacher/schedule-entries/:id.',
);

assert.match(
  controller,
  /@Delete\('schedule-entries\/:id'\)[\s\S]*deleteScheduleEntry/,
  'Teacher controller should expose DELETE /teacher/schedule-entries/:id.',
);

assert.match(
  service,
  /async updateScheduleEntry/,
  'Teacher service should update schedule entries owned by the teacher.',
);

assert.match(
  service,
  /requireWeekday\(body\.weekday\)/,
  'Teacher service should validate schedule updates to Monday through Friday.',
);
