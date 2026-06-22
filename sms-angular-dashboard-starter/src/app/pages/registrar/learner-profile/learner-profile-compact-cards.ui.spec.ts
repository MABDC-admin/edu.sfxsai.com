import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const styles = readFileSync(
  new URL('./learner-profile.component.scss', import.meta.url),
  'utf8',
);

assert.match(
  styles,
  /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/,
  'Learner profile card grid should fit more compact cards per row.',
);
assert.match(
  styles,
  /\.learner-card\s*\{[\s\S]*?gap:\s*8px;[\s\S]*?padding:\s*10px;/,
  'Learner cards should use compact spacing.',
);
assert.match(
  styles,
  /\.learner-avatar\s*\{[\s\S]*?width:\s*34px;[\s\S]*?height:\s*34px;/,
  'Learner card avatars should be reduced for the compact card layout.',
);
assert.match(
  styles,
  /\.learner-identity h3\s*\{[\s\S]*?font-size:\s*13px;/,
  'Learner card names should use compact typography.',
);
assert.match(
  styles,
  /\.learner-open\s*\{[\s\S]*?min-height:\s*28px;[\s\S]*?font-size:\s*10px;/,
  'Learner card action buttons should be compact.',
);

console.log('learner profile compact cards UI test passed');
