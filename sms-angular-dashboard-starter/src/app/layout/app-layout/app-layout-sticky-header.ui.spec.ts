import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const layoutTemplate = readFileSync('src/app/layout/app-layout/app-layout.component.html', 'utf8');
const sidebarTemplate = readFileSync('src/app/layout/sidebar/sidebar.component.html', 'utf8');
const sidebarStyles = readFileSync('src/app/layout/sidebar/sidebar.component.scss', 'utf8');

assert.match(
  layoutTemplate,
  /<main class="[^"]*\bpt-20\b[^"]*\blg:pt-28\b[^"]*"/,
  'App content should reserve vertical space for fixed mobile and desktop headers.',
);

assert.match(
  sidebarTemplate,
  /<div class="[^"]*\bfixed\b[^"]*\binset-x-0\b[^"]*\btop-0\b[^"]*\blg:hidden\b/,
  'Mobile portal header should remain fixed while scrolling.',
);

assert.match(
  sidebarStyles,
  /\.sidebar-link\.active[\s\S]*?background-image:\s*var\(--sms-theme-gradient\)\s*!important;/,
  'Sidebar active route should follow the selected portal theme.',
);

assert.match(
  sidebarStyles,
  /\.sidebar-link:hover[\s\S]*?var\(--sms-theme-soft\)/,
  'Sidebar hover state should follow the selected portal theme.',
);
