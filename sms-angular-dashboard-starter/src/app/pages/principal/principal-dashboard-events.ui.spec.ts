import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const component = readFileSync(join(import.meta.dirname, 'principal-portal.component.ts'), 'utf8');
const template = readFileSync(join(import.meta.dirname, 'principal-portal.component.html'), 'utf8');

assert.match(component, /CalendarService/);
assert.match(component, /CalendarEvent/);
assert.match(component, /calendarEvents\s*=\s*signal<CalendarEvent\[\]>/);
assert.match(component, /calendarService\.getEvents\(academicYearId\)\.pipe\(/);
assert.match(component, /switchMap\(events =>\s*events\.length \? of\(events\) : this\.calendarService\.getEvents\(\)\.pipe\(catchError/);
assert.match(component, /upcomingCalendarEvents\(events\)/);

assert.match(template, /Upcoming Events & Holidays/);
assert.match(template, /routerLink="\/principal\/calendar"/);
assert.match(template, /\*ngFor="let event of calendarEvents\(\)\.slice\(0, 5\)"/);
assert.match(template, /\[style\.background\]="event\.color \|\| '#3b82f6'"/);
assert.match(template, /event\.eventDate \| date:'MMM d'/);
assert.match(template, /No upcoming events scheduled\./);
assert.doesNotMatch(template, /<p class="eyebrow">School Calendar<\/p>\s*<h2>Upcoming Events<\/h2>/);
assert.doesNotMatch(template, /\*ngFor="let item of state\(\)\.calendar"/);

console.log('principal dashboard events widget UI test passed');
