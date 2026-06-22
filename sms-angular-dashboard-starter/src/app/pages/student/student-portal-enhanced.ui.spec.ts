import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const template = readFileSync(join(root, 'src/app/pages/student/student-portal.component.html'), 'utf8');
const styles = readFileSync(join(root, 'src/app/pages/student/student-portal.component.scss'), 'utf8');
const component = readFileSync(join(root, 'src/app/pages/student/student-portal.component.ts'), 'utf8');

assert.match(template, /learner-hero-avatar/);
assert.match(template, /learner-focus-board/);
assert.match(template, /Learning Command Center/);
assert.match(template, /learner-action-card/);
assert.match(template, /learner-class-card/);
assert.match(template, /learner-workbench/);
assert.match(template, /Quarter Snapshot/);

assert.match(component, /readonly learnerInitials = computed/);
assert.match(component, /readonly nextAssignment = computed/);

assert.match(styles, /\.learner-action-card/);
assert.match(styles, /\.learner-class-card/);
assert.match(styles, /\.learner-hero-avatar\s*\{[\s\S]*?width:\s*clamp\(8\.125rem,\s*10\.4vw,\s*8\.75rem\);[\s\S]*?height:\s*clamp\(8\.125rem,\s*10\.4vw,\s*8\.75rem\);/);
assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.learner-hero-avatar\s*\{[\s\S]*?width:\s*7\.15rem;[\s\S]*?height:\s*7\.15rem;/);
assert.match(styles, /@keyframes learner-card-rise/);
assert.match(styles, /transform: translateY\(-4px\)/);
