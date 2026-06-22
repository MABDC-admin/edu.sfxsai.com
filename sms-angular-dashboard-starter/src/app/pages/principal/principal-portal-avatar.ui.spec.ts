import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const template = readFileSync(join(root, 'src/app/pages/principal/principal-portal.component.html'), 'utf8');
const component = readFileSync(join(root, 'src/app/pages/principal/principal-portal.component.ts'), 'utf8');
const styles = readFileSync(join(root, 'src/app/pages/principal/principal-portal.component.scss'), 'utf8');

assert.match(template, /class="principal-hero-avatar"/);
assert.match(template, /\*ngIf="currentUser\(\)\?\.avatarUrl; else principalHeroInitials"/);
assert.match(template, /\[src\]="currentUser\(\)\?\.avatarUrl"/);
assert.match(template, /principalInitials\(\)/);

assert.match(component, /AuthService/);
assert.match(component, /currentUser\s*=\s*signal<\{ avatarUrl\?: string; email\?: string \} \| null>/);
assert.match(component, /principalInitials\(\): string/);

assert.match(
  styles,
  /\.principal-hero-avatar\s*\{[\s\S]*?width:\s*clamp\(8\.125rem,\s*10\.4vw,\s*8\.75rem\);[\s\S]*?height:\s*clamp\(8\.125rem,\s*10\.4vw,\s*8\.75rem\);/,
);
assert.match(
  styles,
  /@media\s*\(max-width:\s*760px\)[\s\S]*?\.principal-hero-avatar\s*\{[\s\S]*?width:\s*7\.15rem;[\s\S]*?height:\s*7\.15rem;/,
);

console.log('principal portal hero avatar UI test passed');
