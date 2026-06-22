import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/pages/registrar/enrollment/enrollment.component.ts', 'utf8');
const template = readFileSync('src/app/pages/registrar/enrollment/enrollment.component.html', 'utf8');
const api = readFileSync('src/app/core/services/registrar-api.service.ts', 'utf8');

assert.match(component, /AuthService/, 'Enrollment component should read the active user role.');
assert.match(component, /isAdmin\(\): boolean/, 'Enrollment component should expose an Admin-only delete guard.');
assert.match(component, /deleteEnrollment\(app: EnrollmentApplication\)/, 'Enrollment component should implement enrollment deletion.');
assert.match(component, /deleteStudent\(app\.id\)/, 'Enrollment deletion should remove the queued student enrollment record.');
assert.match(api, /deleteStudent\(id: string\): Observable<any>/, 'Registrar API should expose student deletion.');
assert.match(template, /\*ngIf="isAdmin\(\)"/, 'Delete action should only render for Admin users.');
assert.match(template, /\(click\)="deleteEnrollment\(app\)"/, 'Delete action should call enrollment deletion.');
assert.match(template, /Deleting\.\.\.' : 'Delete'/, 'Delete action should be clearly labeled.');

console.log('enrollment admin delete UI test passed');
