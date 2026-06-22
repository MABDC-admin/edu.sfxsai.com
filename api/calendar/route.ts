import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM calendar_events
      ORDER BY event_date ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, event_date, category } = body;

    if (!title || !event_date || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(`
      INSERT INTO calendar_events (title, description, event_date, category)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, description, event_date, category]);

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
