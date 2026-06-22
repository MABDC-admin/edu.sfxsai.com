import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const component = readFileSync(join(import.meta.dirname, 'student-portal.component.ts'), 'utf8');
const template = readFileSync(join(import.meta.dirname, 'student-portal.component.html'), 'utf8');
const styles = readFileSync(join(import.meta.dirname, 'student-portal.component.scss'), 'utf8');

assert.match(component, /CalendarService/);
assert.match(component, /RegistrarApiService/);
assert.match(component, /calendarEvents\s*=\s*signal<CalendarEvent\[\]>/);
assert.match(component, /refreshAcademicYears\(\)/);
assert.match(component, /activeAcademicYear\$/);
assert.match(component, /calendarService\.getEvents\(ay\.id\)/);
assert.match(component, /events\.length \? of\(events\) : this\.calendarService\.getEvents\(\)/);

assert.match(template, /School Calendar/);
assert.match(template, /routerLink="\/student\/calendar"/);
assert.match(template, /\*ngFor="let event of calendarEvents\(\)"/);
assert.match(template, /eventIcon\(event\.eventType\)/);
assert.match(template, /eventTone\(event\.eventType\)/);

assert.match(styles, /\.learner-calendar-card/);
assert.match(styles, /\.learner-event-item/);
assert.match(styles, /\.learner-event-item\.holiday/);

console.log('student dashboard events widget UI test passed');
