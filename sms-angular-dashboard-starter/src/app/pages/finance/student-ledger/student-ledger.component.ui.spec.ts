import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const template = readFileSync(
  join(process.cwd(), 'src/app/pages/finance/student-ledger/student-ledger.component.html'),
  'utf8',
);

assert.match(template, /<th>Payee \/ Remarks<\/th>/, 'Student ledger payment history should show a payee or remarks column');
assert.match(template, /payment\.remarks/, 'Student ledger should render recorded payee remarks');
