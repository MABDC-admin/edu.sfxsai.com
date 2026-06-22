import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const template = readFileSync(new URL('./dashboard.component.html', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./dashboard.component.scss', import.meta.url), 'utf8');

assert.match(template, /class="[^"]*\bdashboard-hero-typing\b[^"]*"/, 'Hero greeting should use a typing animation wrapper.');
assert.match(template, /class="[^"]*\bdashboard-hero-typing-text\b[^"]*"/, 'Hero greeting text should be animated as a typing line.');
assert.match(styles, /\.dashboard-hero-typing-text\s*\{[\s\S]*?animation:\s*dashboardHeroTyping/, 'Typing text should use the looping typing animation.');
assert.match(styles, /\.dashboard-hero-typing-text::after\s*\{[\s\S]*?animation:\s*dashboardHeroCaret/, 'Typing line should render a blinking caret.');
assert.match(styles, /@keyframes dashboardHeroTyping/, 'Typing keyframes should be defined.');
assert.match(styles, /@keyframes dashboardHeroCaret/, 'Caret keyframes should be defined.');

console.log('dashboard hero typing UI test passed');
