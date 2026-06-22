import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const masterlistTs = read('src/app/pages/registrar/student-masterlist/student-masterlist.component.ts');
const masterlistTemplate = read('src/app/pages/registrar/student-masterlist/student-masterlist.component.html');
const masterlistStyles = read('src/app/pages/registrar/student-masterlist/student-masterlist.component.scss');
const paymentsTs = read('src/app/pages/finance/payments/payments.component.ts');

assert.match(masterlistTs, /hasCollectibleBalance\(student/, 'Masterlist should know when a learner has a collectible balance.');
assert.match(masterlistTs, /collectQueryParamsFor\(student/, 'Masterlist should create payment query params for Collect.');
assert.match(masterlistTemplate, /class="finance-collect-button"/, 'Finance column should render a Collect button.');
assert.match(masterlistTemplate, /\*ngIf="isFinancePortal && hasCollectibleBalance\(student\)"/, 'Collect should only show for finance learners with balances.');
assert.match(masterlistTemplate, /\[routerLink\]="\['\/finance\/payments'\]"/, 'Collect should route to Finance Payments.');
assert.match(masterlistTemplate, /\[queryParams\]="collectQueryParamsFor\(student\)"/, 'Collect should pass learner context to payments.');
assert.match(masterlistStyles, /:host-context\(\.finance-theme\)[\s\S]*\.finance-assess-button:hover/, 'Finance masterlist buttons should have yellow hover styling.');
assert.match(masterlistStyles, /:host-context\(\.finance-theme\)[\s\S]*\.finance-collect-button:hover/, 'Collect button should have yellow hover styling.');
assert.match(masterlistStyles, /#facc15|#fde047|#f59e0b/, 'Yellow hover palette should be present.');
assert.match(paymentsTs, /ActivatedRoute/, 'Payments should read route query params.');
assert.match(paymentsTs, /pendingStudentId/, 'Payments should keep requested learner id until assessments load.');
assert.match(paymentsTs, /applyPendingAssessmentSelection/, 'Payments should preselect assessment from Collect link.');

console.log('student masterlist collect action UI contract passed');
