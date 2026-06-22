import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const service = readFileSync('src/app/core/services/floating-chat.service.ts', 'utf8');
const util = readFileSync('src/app/core/services/floating-chat.util.ts', 'utf8');
const template = readFileSync('src/app/shared/components/floating-chat/floating-chat.component.html', 'utf8');
const nginx = readFileSync('nginx.conf', 'utf8');

assert.match(
  service,
  /staff-contacts/,
  'Floating chat service should load staff contacts for admin and teacher chat.',
);

assert.match(
  service,
  /conversations\/\$\{recipientId\}/,
  'Floating chat service should load a recipient-scoped conversation.',
);

assert.match(
  service,
  /recipientUserId/,
  'Floating chat service should send the selected recipient user id with messages.',
);

assert.match(
  service,
  /unread-count/,
  'Floating chat service should poll backend unread counts.',
);

assert.match(
  service,
  /resolveSocketEndpoint/,
  'Floating chat service should resolve the Socket.IO endpoint separately from REST API URLs.',
);

assert.match(
  service,
  /path:\s*socketEndpoint\.path/,
  'Floating chat service should connect Socket.IO through the deployed /api/socket.io proxy path.',
);

assert.doesNotMatch(
  service,
  /io\(environment\.apiUrl/,
  'Floating chat service should not connect to /socket.io by treating the REST API path as a Socket.IO namespace.',
);

assert.match(
  nginx,
  /proxy_set_header\s+Upgrade\s+\$http_upgrade/,
  'Nginx should forward websocket Upgrade headers for Socket.IO.',
);

assert.match(
  nginx,
  /proxy_set_header\s+Connection\s+["']upgrade["']/,
  'Nginx should keep websocket connections upgraded for Socket.IO.',
);

assert.match(
  service,
  /test-broadcast/,
  'Floating chat service should expose the admin test broadcast endpoint.',
);

assert.match(
  service,
  /conversations\/\$\{conversationId\}\/read/,
  'Floating chat service should mark opened conversations as read.',
);

assert.match(
  template,
  /chat-contact-select/,
  'Floating chat UI should use a compact dropdown for staff contact selection.',
);

assert.match(
  template,
  /ngModelChange\)="chat\.selectRecipient\(\$event\)"/,
  'Floating chat dropdown changes should select the active staff recipient.',
);

assert.match(
  template,
  /<select[\s\S]*selectedRecipientId/,
  'Floating chat UI should bind the dropdown to the selected recipient id.',
);

assert.match(
  template,
  /contact\.unreadCount/,
  'Floating chat UI should still expose unread counts in the dropdown labels or summary.',
);

assert.match(
  template,
  /chat-unread-receivers/,
  'Floating chat receiver dropdown should show a visible unread sender badge list.',
);

assert.match(
  template,
  /unreadContacts\(\)/,
  'Floating chat unread sender badge list should render only contacts with unread messages.',
);

assert.match(
  service,
  /focusUnreadConversation/,
  'Floating chat should focus the first unread direct conversation when opened from a notification.',
);

assert.match(
  service,
  /contact\.unreadCount/,
  'Floating chat unread conversation focus should use staff contact unread counts.',
);

assert.match(
  util,
  /avatarUrl\?:\s*string/,
  'Floating chat staff contacts should expose avatarUrl from the backend.',
);

assert.match(
  template,
  /selected\.avatarUrl/,
  'Floating chat selected-contact summary should render the selected staff avatar when uploaded.',
);

assert.match(
  template,
  /chat\.selectedContact\(\)\?\.avatarUrl/,
  'Floating chat header should render the active staff avatar when a direct chat is selected.',
);

assert.doesNotMatch(
  template,
  /chat-contact-list/,
  'Floating chat UI should not render the old tall contact list.',
);

assert.doesNotMatch(
  template,
  /SFXSAI Support Desk/,
  'Floating chat UI should not show the generic SFXSAI Support Desk receiver.',
);

assert.match(
  template,
  /sendTestToAll/,
  'Floating chat UI should expose the admin test broadcast action.',
);

const styles = readFileSync('src/app/shared/components/floating-chat/floating-chat.component.scss', 'utf8');

assert.match(
  styles,
  /\.chat-recipient\s*\{[\s\S]*?background:[\s\S]*?#fef3c7/,
  'Floating chat receiver section should use a yellow treatment.',
);

assert.match(
  styles,
  /overflow-y:\s*auto/,
  'Floating chat messages should use a vertical scrollbar when content overflows.',
);

assert.match(
  styles,
  /\.chat-avatar\s+img/,
  'Floating chat should crop uploaded header avatars inside the chat avatar holder.',
);

assert.match(
  styles,
  /\.contact-avatar\s+img/,
  'Floating chat should crop uploaded contact avatars inside the selected-contact holder.',
);

const topbar = readFileSync('src/app/layout/topbar/topbar.component.html', 'utf8');
const topbarComponent = readFileSync('src/app/layout/topbar/topbar.component.ts', 'utf8');

assert.match(
  topbarComponent,
  /chat\.unreadCount/,
  'Topbar notification bell should include unread chat messages in its badge.',
);

assert.match(
  topbar,
  /notificationCount\(\)/,
  'Topbar notification bell badge should render the combined notification count.',
);
