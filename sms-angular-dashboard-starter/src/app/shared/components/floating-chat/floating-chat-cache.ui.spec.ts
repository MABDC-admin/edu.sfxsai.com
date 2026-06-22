import { readFileSync } from 'fs';
import assert from 'node:assert/strict';

const nginx = readFileSync('nginx.conf', 'utf8');

assert.match(
  nginx,
  /add_header\s+Cache-Control\s+"no-store,\s*no-cache,\s*must-revalidate"/,
  'Nginx should prevent stale Angular bundles from keeping an old floating chat UI.',
);

console.log('floating chat cache-control test passed');
