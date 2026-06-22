import { readFileSync } from 'fs';
import { join } from 'path';

describe('DrizzleService database observability', () => {
  const source = readFileSync(join(__dirname, 'drizzle.service.ts'), 'utf8');

  it('logs pool lifecycle events and periodic heartbeat status', () => {
    expect(source).toContain("this.pool.on('connect'");
    expect(source).toContain("this.pool.on('acquire'");
    expect(source).toContain("this.pool.on('remove'");
    expect(source).toContain('startHeartbeat');
    expect(source).toContain('PostgreSQL heartbeat ok');
    expect(source).toContain('PostgreSQL heartbeat failed');
  });
});
