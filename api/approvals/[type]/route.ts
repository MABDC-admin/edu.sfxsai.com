import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const tableMap: Record<string, string> = {
  'examinations': 'examinations',
  'grades': 'grade_submissions',
  'events': 'academic_events',
  'curriculum': 'curriculum_revisions',
  'interventions': 'intervention_plans'
};

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  try {
    const tableName = tableMap[params.type];
    if (!tableName) {
      return NextResponse.json({ error: 'Invalid approval type' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const teacher_id = searchParams.get('teacher_id');

    let sql = `
      SELECT t.*, u.name as teacher_name 
      FROM ${tableName} t
      JOIN users u ON t.teacher_id = u.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    
    if (status) {
      queryParams.push(status);
      sql += ` AND t.status = $${queryParams.length}`;
    }
    if (teacher_id) {
      queryParams.push(teacher_id);
      sql += ` AND t.teacher_id = $${queryParams.length}`;
    }

    sql += ` ORDER BY t.submitted_at DESC`;

    const result = await query(sql, queryParams);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error(`Error fetching ${params.type}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { type: string } }) {
  try {
    const tableName = tableMap[params.type];
    if (!tableName) {
      return NextResponse.json({ error: 'Invalid approval type' }, { status: 400 });
    }

    const body = await req.json();
    const { id, action, comments } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
    }

    const status = action === 'approve' ? 'approved' : 'returned';

    const result = await query(`
      UPDATE ${tableName} 
      SET status = $1, comments = $2 
      WHERE id = $3 
      RETURNING *
    `, [status, comments, id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const row = result.rows[0];
    // Attach teacher name manually or just return the row
    const userRes = await query(`SELECT name as teacher_name FROM users WHERE id = $1`, [row.teacher_id]);
    if (userRes.rows.length > 0) {
      row.teacher_name = userRes.rows[0].teacher_name;
    }

    return NextResponse.json(row);
  } catch (error: any) {
    console.error(`Error updating ${params.type}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
