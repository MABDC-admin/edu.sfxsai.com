import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const styles = readFileSync(new URL('./dashboard.component.scss', import.meta.url), 'utf8');

assert.match(styles, /\.registrar-events-panel\s*\{[\s\S]*?min-height:\s*120px;/, 'Events panel should be decreased by roughly 50 percent.');
assert.match(styles, /\.registrar-events-panel\s*\{[\s\S]*?gap:\s*\.35rem;/, 'Events panel should use ultra-dense vertical spacing.');
assert.match(styles, /\.registrar-events-panel\s*\{[\s\S]*?padding:\s*\.5rem;/, 'Events panel should use very compact padding.');
assert.match(styles, /\.registrar-events-title h3\s*\{[\s\S]*?font-size:\s*\.95rem;/, 'Events title should be compact.');
assert.match(styles, /\.registrar-events-title p\s*\{[\s\S]*?display:\s*none;/, 'Events subtitle should be hidden to reduce height.');
assert.match(styles, /\.registrar-events-title > \.material-icons,[\s\S]*?width:\s*1\.9rem;/, 'Header icon should be reduced.');
assert.match(styles, /\.registrar-events-full-view\s*\{[\s\S]*?min-height:\s*1\.75rem;/, 'Full View button should be compact.');
assert.match(styles, /\.registrar-event-card\s*\{[\s\S]*?min-height:\s*2\.45rem;/, 'Event rows should be reduced by roughly 50 percent.');
assert.match(styles, /\.registrar-event-card\s*\{[\s\S]*?grid-template-columns:\s*2\.8rem minmax\(0, 1fr\) 4\.1rem;/, 'Event rows should use tiny icon and date columns.');
assert.match(styles, /\.registrar-event-icon\s*\{[\s\S]*?width:\s*1\.55rem;/, 'Event icon block should be reduced by roughly 50 percent.');
assert.match(styles, /\.registrar-event-content\s*\{[\s\S]*?padding:\s*\.25rem \.45rem;/, 'Event content should use tiny padding.');
assert.match(styles, /\.registrar-event-content h4\s*\{[\s\S]*?font-size:\s*\.72rem;/, 'Event title should be small.');
assert.match(styles, /\.registrar-event-pill\s*\{[\s\S]*?display:\s*none;/, 'Event type pill should be hidden to reduce row height.');
assert.match(styles, /\.registrar-event-date \.material-icons\s*\{[\s\S]*?display:\s*none;/, 'Event date icon should be hidden to reduce row height.');
assert.match(styles, /\.registrar-event-date strong\s*\{[\s\S]*?font-size:\s*\.62rem;/, 'Event date text should be compact.');

console.log('dashboard events compact UI test passed');