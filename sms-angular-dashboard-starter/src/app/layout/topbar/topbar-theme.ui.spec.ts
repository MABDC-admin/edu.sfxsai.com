import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('src/app/layout/topbar/topbar.component.ts', 'utf8');
const template = readFileSync('src/app/layout/topbar/topbar.component.html', 'utf8');
const styles = readFileSync('src/app/layout/topbar/topbar.component.scss', 'utf8');
const globalStyles = readFileSync('src/styles.scss', 'utf8');

for (const theme of [
  'Emerald Blue',
  'Violet Indigo',
  'Teal Gold',
  'Rose Sky',
  'Slate Cyan',
  'Sunset Coral',
]) {
  assert.equal(component.includes(theme), true, `${theme} should be available as a portal color preset`);
}

assert.match(component, /themeStorageKey\s*=\s*'sfxsai\.portal\.theme\.v1'/, 'Theme choice should persist in localStorage.');
assert.match(component, /applyPortalTheme/, 'Topbar should apply theme CSS variables.');
assert.match(component, /--sms-theme-primary/, 'Theme application should set the shared primary CSS variable.');
assert.match(component, /--sms-theme-hero-gradient/, 'Theme application should set the shared hero gradient variable.');
assert.match(component, /onCustomThemeColorChange/, 'Topbar should support a custom color picker.');
assert.match(component, /buildCustomTheme/, 'Custom color picker should derive a complete theme.');

assert.match(template, /theme-picker-trigger/, 'Topbar should render the theme picker trigger.');
assert.match(template, /type="color"/, 'Topbar should render a native color picker input.');
assert.match(template, /\*ngFor="let theme of portalThemes"/, 'Topbar should render all theme presets.');
assert.match(template, /selectPortalTheme\(theme\.id\)/, 'Preset buttons should select a theme.');
assert.match(template, /onCustomThemeColorChange\(\$event\)/, 'Color input should apply a custom theme.');

assert.match(styles, /\.topbar-video-shell\s*\{[\s\S]*?position:\s*fixed;/, 'Desktop topbar should stay fixed while scrolling.');
assert.match(styles, /\.theme-picker-dropdown/, 'Theme picker dropdown should have dedicated styling.');
assert.match(styles, /var\(--sms-theme-border\)/, 'Theme picker styles should use shared theme variables.');

for (const variable of [
  '--sms-theme-primary',
  '--sms-theme-secondary',
  '--sms-theme-accent',
  '--sms-theme-soft',
  '--sms-theme-border',
  '--sms-theme-gradient',
  '--sms-theme-hero-gradient',
]) {
  assert.equal(globalStyles.includes(variable), true, `${variable} should be defined globally.`);
}

assert.match(
  globalStyles,
  /\.portal-hero-theme,[\s\S]*?\.bg-gradient-to-br\.from-violet-800\.to-indigo-900[\s\S]*?var\(--sms-theme-hero-gradient\)/,
  'Portal hero banners and legacy violet hero gradients should follow the selected theme.',
);

assert.match(
  globalStyles,
  /\.action-primary,[\s\S]*?background-image:\s*var\(--sms-theme-gradient\)\s*!important;/,
  'Shared primary actions should follow the selected theme.',
);
