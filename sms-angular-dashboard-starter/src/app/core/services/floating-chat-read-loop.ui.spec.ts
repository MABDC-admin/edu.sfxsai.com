import { readFileSync } from 'fs';
import assert from 'node:assert/strict';

const source = readFileSync('src/app/core/services/floating-chat.service.ts', 'utf8');
const loadRemoteConversation = source.match(/private loadRemoteConversation\(\): void \{[\s\S]*?\n  \}/)?.[0] ?? '';

assert.ok(loadRemoteConversation, 'FloatingChatService should keep loadRemoteConversation as a private method.');
assert.equal(
  /if\s*\(\s*this\.isOpenSignal\(\)\s*\)\s*\{[\s\S]*?markCurrentConversationRead/.test(loadRemoteConversation),
  false,
  'Loading a remote conversation must not unconditionally mark it read whenever chat is open, or socket chat-updated events can create a request loop.',
);
assert.match(
  source,
  /readConversationIds\s*=\s*new Set<string>\(\)/,
  'FloatingChatService should remember conversations already marked read during the current open session.',
);
assert.match(
  source,
  /readRequestsInFlight\s*=\s*new Set<string>\(\)/,
  'FloatingChatService should prevent duplicate read requests while a read patch is in flight.',
);
assert.match(
  source,
  /shouldMarkReadAfterConversationLoad\s*=\s*false/,
  'FloatingChatService should queue one read mark when opening/selecting before the conversation id is loaded.',
);

console.log('floating chat read-loop regression test passed');
