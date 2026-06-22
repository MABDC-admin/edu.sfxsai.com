import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const componentDir = join(root, 'src/app/pages/finance/finance-profile');
const routeFile = readFileSync(join(root, 'src/app/app.routes.ts'), 'utf8');
const sidebarData = readFileSync(join(root, 'src/app/core/data/dashboard.mock.ts'), 'utf8');

assert.equal(existsSync(join(componentDir, 'finance-profile.component.ts')), true, 'Finance profile component should exist');
assert.equal(existsSync(join(componentDir, 'finance-profile.component.html')), true, 'Finance profile template should exist');
assert.equal(existsSync(join(componentDir, 'finance-profile.component.scss')), true, 'Finance profile styles should exist');

const component = readFileSync(join(componentDir, 'finance-profile.component.ts'), 'utf8');
const template = readFileSync(join(componentDir, 'finance-profile.component.html'), 'utf8');

assert.match(routeFile, /FinanceProfileComponent/, 'Finance profile should be imported in routes');
assert.match(routeFile, /path:\s*':portal\/profile'[\s\S]*roles:\s*\['FINANCE'\]/, 'Profile route should be finance-only');
assert.match(sidebarData, /\{\s*label:\s*'Profile'[\s\S]*route:\s*'profile'/, 'Finance sidebar should expose Profile');

assert.match(component, /AuthService/, 'Profile should use AuthService current user state');
assert.match(component, /saveProfileName/, 'Profile should expose a saveProfileName action');
assert.match(component, /updateCurrentUser\(\{\s*name:/, 'Profile should persist changed name into current user storage');

assert.match(template, /Finance Profile/, 'Template should identify the finance profile page');
assert.match(template, /\[\(ngModel\)\]="profileName"/, 'Template should bind editable name field');
assert.match(template, /Save Name/, 'Template should include a save-name action');
assert.match(template, /readonly/, 'Email and role metadata should be read-only');
