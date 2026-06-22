import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync(new URL('./dashboard.component.ts', import.meta.url), 'utf8');
const template = readFileSync(new URL('./dashboard.component.html', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./dashboard.component.scss', import.meta.url), 'utf8');

assert.match(template, /registrar-events-panel/, 'Dashboard events widget should use the reference panel shell.');
assert.match(template, /Stay ahead of important dates and never miss a thing\./, 'Events widget should include the reference subtitle.');
assert.match(template, /registrar-event-card/, 'Events should render as large reference-style cards.');
assert.match(template, /registrar-event-icon/, 'Each event card should include a large event-type icon block.');
assert.match(template, /registrar-event-date/, 'Each event card should include a dedicated right-side date block.');
assert.match(template, /eventTypeIcon\(event\.eventType\)/, 'Template should map event types to visual icons.');
assert.match(template, /eventToneClass\(event\.eventType\)/, 'Template should map event types to tone classes.');
assert.match(component, /eventTypeIcon\(eventType: string \| null \| undefined\): string/, 'Dashboard component should provide event icon mapping.');
assert.match(component, /eventToneClass\(eventType: string \| null \| undefined\): string/, 'Dashboard component should provide event tone mapping.');
assert.match(styles, /\.registrar-events-panel/, 'Reference panel styling should be defined.');
assert.match(styles, /\.registrar-event-card/, 'Reference event card styling should be defined.');
assert.match(styles, /\.registrar-event-card\.event-tone-holiday/, 'Holiday tone should be styled.');
assert.match(styles, /\.registrar-event-card\.event-tone-meeting/, 'Meeting tone should be styled.');
assert.match(styles, /\.registrar-event-card\.event-tone-exam/, 'Exam tone should be styled.');

console.log('dashboard events reference design UI test passed');
