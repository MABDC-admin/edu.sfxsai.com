import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const routeFile = readFileSync(join(root, 'src/app/app.routes.ts'), 'utf8');
const sidebarData = readFileSync(join(root, 'src/app/core/data/dashboard.mock.ts'), 'utf8');
const topbarTemplate = readFileSync(join(root, 'src/app/layout/topbar/topbar.component.html'), 'utf8');
const topbarComponent = readFileSync(join(root, 'src/app/layout/topbar/topbar.component.ts'), 'utf8');
const componentDir = join(root, 'src/app/pages/registrar/registrar-profile');

assert.equal(existsSync(join(componentDir, 'registrar-profile.component.ts')), true, 'Registrar profile component should exist.');
assert.equal(existsSync(join(componentDir, 'registrar-profile.component.html')), true, 'Registrar profile template should exist.');
assert.equal(existsSync(join(componentDir, 'registrar-profile.component.scss')), true, 'Registrar profile styles should exist.');

const component = readFileSync(join(componentDir, 'registrar-profile.component.ts'), 'utf8');
const template = readFileSync(join(componentDir, 'registrar-profile.component.html'), 'utf8');

assert.match(routeFile, /RegistrarProfileComponent/, 'Registrar profile should be imported in routes.');
assert.match(routeFile, /path:\s*'registrar\/profile'[\s\S]*roles:\s*\['REGISTRAR'\]/, 'Registrar profile route should be registrar-only.');
assert.match(sidebarData, /label:\s*'Registrar'[\s\S]*\{\s*label:\s*'Profile'[\s\S]*route:\s*'profile'/, 'Registrar sidebar should expose a Profile nav button.');
assert.match(topbarTemplate, /routerLink="\/\{\{ profileRoute\(\) \}\}"|\[routerLink\]="profileRoute\(\)"/, 'Topbar should include a profile navigation button.');
assert.match(topbarComponent, /profileRoute\(\):\s*string\s*\|\s*null/, 'Topbar should resolve the profile route.');
assert.match(component, /AuthService/, 'Registrar profile should use AuthService current user state.');
assert.match(component, /saveProfileName/, 'Registrar profile should expose a saveProfileName action.');
assert.match(component, /updateCurrentUser\(\{\s*name:/, 'Registrar profile should persist changed name into current user storage.');
assert.match(template, /Registrar Profile/, 'Template should identify the registrar profile page.');
assert.match(template, /\[\(ngModel\)\]="profileName"/, 'Template should bind editable registrar name field.');

console.log('registrar profile UI test passed');
