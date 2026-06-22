import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/pages/registrar/enrollment/enrollment.component.ts', 'utf8');
const api = readFileSync('src/app/core/services/registrar-api.service.ts', 'utf8');

assert.match(
  api,
  /approveEnrollment\(id: string, payload:/,
  'Registrar API should expose an approveEnrollment method.',
);

assert.match(
  api,
  /\/students\/\$\{id\}\/approve-enrollment/,
  'approveEnrollment should call the backend approval endpoint.',
);

assert.match(
  component,
  /approveEnrollment\(this\.selectedStudent\.id,/,
  'Enrollment approval should use the backend-owned approval workflow.',
);

assert.doesNotMatch(
  component,
  /updateStudent\(this\.selectedStudent\.id,\s*\{\s*enrollmentStatus:\s*payload\.status,\s*documentStatus:\s*payload\.documentStatus\s*\}/,
  'Enrollment approval should not directly patch only status and document fields.',
);

assert.match(
  component,
  /Auto-assigned to \$\{section\}/,
  'Enrollment approval should toast whether the learner was auto-assigned to a section.',
);

console.log('enrollment auto-section approval UI test passed');
