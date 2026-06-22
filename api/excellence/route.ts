import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM academic_awards
      ORDER BY date_awarded DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching academic awards:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_name, grade_level, award_type, award_title, date_awarded } = body;

    if (!student_name || !grade_level || !award_type || !award_title || !date_awarded) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(`
      INSERT INTO academic_awards (student_name, grade_level, award_type, award_title, date_awarded)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [student_name, grade_level, award_type, award_title, date_awarded]);

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating academic award:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
