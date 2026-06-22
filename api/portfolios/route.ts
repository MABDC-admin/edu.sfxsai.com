import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM learner_portfolios
      ORDER BY date_added DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching learner portfolios:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_name, grade_level, item_type, title, description } = body;

    if (!student_name || !grade_level || !item_type || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(`
      INSERT INTO learner_portfolios (student_name, grade_level, item_type, title, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [student_name, grade_level, item_type, title, description]);

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating learner portfolio item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
