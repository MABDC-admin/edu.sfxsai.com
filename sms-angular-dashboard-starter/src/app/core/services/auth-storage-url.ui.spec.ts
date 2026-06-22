import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const authService = readFileSync('src/app/core/services/auth.service.ts', 'utf8');

assert.match(
  authService,
  /normalizeStorageUrl/,
  'AuthService should normalize persisted storage URLs for existing browser sessions.',
);

assert.match(
  authService,
  /avatarUrl:\s*this\.normalizeStorageUrl\(user\.avatarUrl\)/,
  'AuthService should normalize avatarUrl loaded from localStorage.',
);

assert.match(
  authService,
  /avatarUrl:\s*this\.normalizeStorageUrl\(response\.user\.avatarUrl\)/,
  'AuthService should normalize avatarUrl returned by login.',
);

assert.match(
  authService,
  /new URL\(value\)/,
  'AuthService should parse absolute storage URLs instead of hard-coding a host.',
);

console.log('auth storage URL normalization test passed');
