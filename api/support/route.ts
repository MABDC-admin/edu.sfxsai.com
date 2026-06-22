import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM learner_support_tickets
      ORDER BY 
        CASE status 
          WHEN 'Open' THEN 1 
          WHEN 'In Progress' THEN 2 
          WHEN 'Resolved' THEN 3 
          ELSE 4 
        END,
        created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_name, grade_level, support_type, notes } = body;

    if (!student_name || !grade_level || !support_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(`
      INSERT INTO learner_support_tickets (student_name, grade_level, support_type, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [student_name, grade_level, support_type, notes]);

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const result = await query(`
      UPDATE learner_support_tickets 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
