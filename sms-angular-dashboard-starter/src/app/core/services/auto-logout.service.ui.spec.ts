import { readFileSync } from 'fs';
import assert from 'node:assert/strict';

const service = readFileSync('src/app/core/services/auto-logout.service.ts', 'utf8');
const layout = readFileSync('src/app/layout/app-layout/app-layout.component.ts', 'utf8');

assert.match(service, /INACTIVITY_TIMEOUT_MS\s*=\s*30\s*\*\s*60\s*\*\s*1000/, 'Auto logout must wait 30 minutes.');
assert.match(service, /mousemove|mousedown|keydown|touchstart|scroll/, 'Auto logout must listen for user activity.');
assert.match(service, /auth\.logout\(\)/, 'Auto logout must clear the authenticated session.');
assert.match(layout, /AutoLogoutService/, 'Authenticated layout must instantiate the auto logout service.');

console.log('auto logout service wiring test passed');
