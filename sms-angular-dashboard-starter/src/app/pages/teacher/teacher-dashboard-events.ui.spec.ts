import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const component = readFileSync(join(import.meta.dirname, 'teacher-portal.component.ts'), 'utf8');
const template = readFileSync(join(import.meta.dirname, 'teacher-portal.component.html'), 'utf8');
const util = readFileSync(join(import.meta.dirname, 'teacher-portal.util.ts'), 'utf8');
const service = readFileSync(join(import.meta.dirname, 'teacher-portal.service.ts'), 'utf8');
const styles = readFileSync(join(import.meta.dirname, 'teacher-portal.component.scss'), 'utf8');

assert.match(component, /CalendarService/);
assert.match(component, /RegistrarApiService/);
assert.match(component, /calendarEvents\s*=\s*signal<CalendarEvent\[\]>/);
assert.match(component, /refreshAcademicYears\(\)/);
assert.match(component, /activeAcademicYear\$/);
assert.match(component, /teacherInitials\s*=\s*computed/);

assert.match(template, /class="teacher-hero-avatar/);
assert.match(template, /\[src\]="state\(\)\.teacher\.avatarUrl"/);
assert.match(template, /teacherInitials\(\)/);
assert.match(styles, /\.teacher-hero-avatar\s*\{[\s\S]*?width:\s*clamp\(8\.125rem,\s*10\.4vw,\s*8\.75rem\);[\s\S]*?height:\s*clamp\(8\.125rem,\s*10\.4vw,\s*8\.75rem\);/);
assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.teacher-hero-avatar\s*\{[\s\S]*?width:\s*7\.15rem;[\s\S]*?height:\s*7\.15rem;/);
assert.match(template, /Upcoming Events & Holidays/);
assert.match(template, /routerLink="\/teacher\/calendar"/);
assert.match(template, /\*ngFor="let event of calendarEvents\(\)"/);
assert.doesNotMatch(template, /<p class="eyebrow">Announcements<\/p>\s*<h2>Class Updates<\/h2>/);

assert.match(util, /avatarUrl\?: string/);
assert.match(service, /avatarUrl\?: string/);

console.log('teacher dashboard events and hero avatar UI test passed');
