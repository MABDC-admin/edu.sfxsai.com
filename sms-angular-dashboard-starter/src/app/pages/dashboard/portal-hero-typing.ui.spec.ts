import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const srcRoot = join(import.meta.dirname, '..', '..', '..');
const teacherTemplate = readFileSync(join(srcRoot, 'app/pages/teacher/teacher-portal.component.html'), 'utf8');
const studentTemplate = readFileSync(join(srcRoot, 'app/pages/student/student-portal.component.html'), 'utf8');
const principalTemplate = readFileSync(join(srcRoot, 'app/pages/principal/principal-portal.component.html'), 'utf8');
const adminDashboardTemplate = readFileSync(join(srcRoot, 'app/pages/dashboard/dashboard.component.html'), 'utf8');
const globalStyles = readFileSync(join(srcRoot, 'styles.scss'), 'utf8');

assert.match(teacherTemplate, /portal-hero-typing/);
assert.match(teacherTemplate, /teacher-hero-name-gold/);
assert.match(teacherTemplate, /Welcome back, <span class="teacher-hero-name-gold">\{\{ state\(\)\.teacher\.name \}\}<\/span>!/);
assert.match(globalStyles, /\.teacher-hero-name-gold\s*\{[^}]*color:\s*#facc15/);
assert.match(studentTemplate, /portal-hero-typing/);
assert.match(studentTemplate, /Welcome back, \{\{ state\(\)\.profile\.name \}\}!/);
assert.match(principalTemplate, /portal-hero-typing/);
assert.match(principalTemplate, /Welcome back, \{\{ principalName\(\) \}\}!/);
assert.match(adminDashboardTemplate, /dashboard-hero-typing/);
assert.match(adminDashboardTemplate, /Welcome back, <span class="capitalize">\{\{ role \? \(role \| lowercase\) : 'Admin' \}\}<\/span>!/);
assert.match(globalStyles, /\.portal-hero-typing-text\s*\{/);
assert.match(globalStyles, /animation:\s*portalHeroTyping/);
assert.match(globalStyles, /@keyframes portalHeroTyping/);
assert.match(globalStyles, /@keyframes portalHeroCaret/);

console.log('portal hero typing UI test passed');

