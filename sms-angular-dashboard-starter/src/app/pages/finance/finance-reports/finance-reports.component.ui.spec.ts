import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const componentDir = join(root, 'src/app/pages/finance/finance-reports');
const routeFile = readFileSync(join(root, 'src/app/app.routes.ts'), 'utf8');
const sidebarData = readFileSync(join(root, 'src/app/core/data/dashboard.mock.ts'), 'utf8');

assert.equal(existsSync(join(componentDir, 'finance-reports.component.ts')), true, 'Finance reports component should exist');
assert.equal(existsSync(join(componentDir, 'finance-reports.component.html')), true, 'Finance reports template should exist');
assert.equal(existsSync(join(componentDir, 'finance-reports.component.scss')), true, 'Finance reports styles should exist');

const component = readFileSync(join(componentDir, 'finance-reports.component.ts'), 'utf8');
const template = readFileSync(join(componentDir, 'finance-reports.component.html'), 'utf8');

assert.match(routeFile, /FinanceReportsComponent/, 'Finance reports should be imported in routes');
assert.match(routeFile, /path:\s*':portal\/reports'[\s\S]*roles:\s*\['FINANCE'\]/, 'Reports route should be finance-only');
assert.match(sidebarData, /\{\s*label:\s*'Reports'[\s\S]*route:\s*'reports'/, 'Finance sidebar should expose Reports');

assert.match(component, /FinanceApiService/, 'Reports should inspect finance API data');
assert.match(component, /RegistrarApiService/, 'Reports should use active academic year context');
assert.match(component, /financeReportCards/, 'Reports should define report cards from finance modules');
assert.match(component, /collectionSummary/, 'Reports should include collection summary calculations');
assert.match(component, /billingStatusSummary/, 'Reports should include billing and assessment status calculations');

[
  'Collection Summary',
  'Billing & Assessment Status',
  'Accounts Receivable',
  'Student Ledger Export',
  'Payment History',
  'Discount & Scholarship Summary',
  'Finance Clearance List',
].forEach((label) => assert.match(template, new RegExp(label), `Reports template should include ${label}`));

assert.match(template, /app-finance-pdf-export-button/, 'Reports should support PDF export using existing finance export pattern');
