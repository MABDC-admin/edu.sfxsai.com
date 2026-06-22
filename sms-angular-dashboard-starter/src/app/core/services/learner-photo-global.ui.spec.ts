import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const storageUtilPath = join(root, 'src/app/core/services/storage-url.util.ts');
assert.ok(existsSync(storageUtilPath), 'Expected shared storage URL utility for learner and staff photos.');
const storageUtil = read('src/app/core/services/storage-url.util.ts');
assert.match(storageUtil, /export function normalizeStorageUrl/, 'Expected normalizeStorageUrl export.');
assert.match(storageUtil, /startsWith\('\/storage\/'\)/, 'Expected /storage URLs to be normalized.');
assert.match(storageUtil, /startsWith\('\/api\/'\)/, 'Expected /api storage URLs to remain usable.');

const models = read('src/app/core/models/registrar.models.ts');
assert.match(models, /photoUrl\?:\s*string/, 'StudentRecord should expose optional learner photo URL.');

const registrarApi = read('src/app/core/services/registrar-api.service.ts');
assert.match(registrarApi, /normalizeStorageUrl/, 'Registrar API should import shared storage URL normalizer.');
assert.match(registrarApi, /normalizeStudentRecord/, 'Registrar API should normalize every fetched student record.');
assert.match(registrarApi, /photoUrl:\s*normalizeStorageUrl\(student\.photoUrl\)/, 'Fetched learner photoUrl should be normalized at API boundary.');

const teacherUtil = read('src/app/pages/teacher/teacher-portal.util.ts');
assert.match(teacherUtil, /normalizeStorageUrl/, 'Teacher learner avatar helper should normalize stored photo URLs.');
assert.match(teacherUtil, /const uploadedPhoto\s*=\s*normalizeStorageUrl\(student\.photoUrl\)/, 'Teacher helper should use normalized learner photo URL before fallback assets.');

const learnerProfileTemplate = read('src/app/pages/registrar/learner-profile/learner-profile.component.html');
assert.match(learnerProfileTemplate, /learnerPhotoUrl\(learner\)/, 'Learner profile hub cards should render normalized photo URLs.');
assert.match(learnerProfileTemplate, /learnerPhotoUrl\(student\)/, 'Learner profile detail and edit surfaces should render normalized photo URLs.');
assert.doesNotMatch(learnerProfileTemplate, /\[src\]="(?:\$any\(learner\)|student)\.photoUrl"/, 'Templates should not bind raw photoUrl directly.');

const studentPortalTemplate = read('src/app/pages/student/student-portal.component.html');
const studentPortalTs = read('src/app/pages/student/student-portal.component.ts');
assert.match(studentPortalTs, /normalizeStorageUrl/, 'Learner portal should normalize profile photo URL.');
assert.match(studentPortalTemplate, /learnerPhotoUrl\(\)/, 'Learner portal hero should render learner photo before initials.');
assert.match(studentPortalTemplate, /<img[\s\S]*\[src\]="learnerPhotoUrl\(\)"/, 'Learner portal hero should include an image element.');

const masterlistTemplate = read('src/app/pages/registrar/student-masterlist/student-masterlist.component.html');
assert.match(masterlistTemplate, /learnerPhotoUrl\(student\)/, 'Student masterlist should render learner photo avatars.');
assert.match(masterlistTemplate, /<img[\s\S]*\[src\]="learnerPhotoUrl\(student\)"/, 'Student masterlist avatar should use an image when available.');

const billingAssessmentTemplate = read('src/app/pages/finance/billing-assessment/billing-assessment.component.html');
assert.match(billingAssessmentTemplate, /learnerPhotoUrl\(student\)/, 'Finance assessment learner checklist should render learner photo avatars.');
assert.match(billingAssessmentTemplate, /<img[\s\S]*\[src\]="learnerPhotoUrl\(student\)"/, 'Finance assessment should use learner photo image when available.');

const billingSummaryUtil = read('src/app/pages/finance/billing-summary/billing-summary.util.ts');
const billingSummaryTemplate = read('src/app/pages/finance/billing-summary/billing-summary.component.html');
assert.match(billingSummaryUtil, /photoUrl:\s*normalizeStorageUrl\(student\?\.photoUrl\)/, 'Billing summary rows should carry normalized learner photo URLs.');
assert.match(billingSummaryTemplate, /row\.photoUrl/, 'Billing summary list should render learner photo when present.');

const paymentsTemplate = read('src/app/pages/finance/payments/payments.component.html');
assert.match(paymentsTemplate, /assessmentLearnerPhotoUrl\(selectedAssessment\)/, 'Finance payment snapshot should render selected learner photo when present.');

console.log('global learner photo wiring contract passed');
