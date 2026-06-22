import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/pages/registrar/student-masterlist/student-masterlist.component.ts', 'utf8');
const template = readFileSync('src/app/pages/registrar/student-masterlist/student-masterlist.component.html', 'utf8');
const routes = readFileSync('src/app/app.routes.ts', 'utf8');
const dashboardData = readFileSync('src/app/core/data/dashboard.mock.ts', 'utf8');

assert.match(routes, /roles:\s*\['REGISTRAR', 'PRINCIPAL', 'FINANCE'\]/, 'Finance users should be allowed to open the shared Student Masterlist route.');
assert.match(routes, /roles:\s*\['REGISTRAR', 'PRINCIPAL', 'TEACHER', 'ADMIN', 'FINANCE'\]/, 'Finance users should be allowed to search learner profile records.');
assert.match(dashboardData, /label:\s*'Student Masterlist'[\s\S]*route:\s*'student-masterlist'/, 'Finance sidebar should expose Student Masterlist navigation.');
assert.match(dashboardData, /label:\s*'Learner Profile'[\s\S]*route:\s*'learner-profile'/, 'Finance sidebar should expose Learner Profile navigation.');
assert.match(component, /finance\s*=\s*inject\(FinanceApiService\)/, 'Masterlist should inject FinanceApiService for balance visibility.');
assert.match(component, /assessmentBalanceByStudentId/, 'Masterlist should map assessment balances by student id.');
assert.match(component, /searchText\s*=\s*''/, 'Masterlist search input should have a backing model.');
assert.match(template, /\[\(ngModel\)\]="searchText"/, 'Masterlist search field should filter rows from user input.');
assert.match(template, /<th class="table-th">Balance<\/th>/, 'Masterlist should include a Balance column.');
assert.match(template, /\[routerLink\]="detailLinkFor\(student\)"/, 'Masterlist open action should respect the current portal route.');
assert.match(template, /\*ngIf="canUseDisableControls"/, 'Finance masterlist should not expose registrar-only disable controls.');

console.log('student masterlist finance access UI test passed');
