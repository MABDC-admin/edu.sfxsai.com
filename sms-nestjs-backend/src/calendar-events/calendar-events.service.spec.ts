import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('CalendarEventsService', () => {
  it('returns selected academic year events together with shared events', () => {
    const source = readFileSync(join(__dirname, 'calendar-events.service.ts'), 'utf8');

    expect(source).toMatch(/import \{[^}]*eq[^}]*isNull[^}]*or[^}]*\} from 'drizzle-orm'/);
    expect(source).toMatch(/or\(\s*eq\(schema\.calendarEvent\.academicYearId,\s*ayId\),\s*isNull\(schema\.calendarEvent\.academicYearId\),?\s*\)/);
  });
});
