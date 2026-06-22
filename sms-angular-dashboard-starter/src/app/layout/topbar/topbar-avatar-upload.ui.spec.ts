import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/layout/topbar/topbar.component.ts', 'utf8');
const template = readFileSync('src/app/layout/topbar/topbar.component.html', 'utf8');

assert.match(
  template,
  /accept="image\/png,image\/jpeg,image\/webp"/,
  'Avatar picker should only advertise supported image formats.',
);
assert.match(
  component,
  /SUPPORTED_AVATAR_MIME_TYPES/,
  'Avatar upload should validate MIME types before calling the API.',
);
assert.match(
  component,
  /MAX_AVATAR_UPLOAD_BYTES/,
  'Avatar upload should validate the 5 MB file size before calling the API.',
);
assert.match(
  component,
  /Use a PNG, JPG, or WEBP image under 5 MB\./,
  'Avatar upload failures should show an image-only requirement message.',
);
assert.doesNotMatch(
  component,
  /WEBP, or PDF under 5 MB/,
  'Avatar upload should not mention PDF because avatars are image-only.',
);
