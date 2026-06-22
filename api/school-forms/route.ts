import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        sf.id,
        sf.teacher_id,
        u.name as teacher_name,
        sf.section_name,
        sf.grade_level,
        sf.sf1_status,
        sf.sf2_status,
        sf.sf4_status,
        sf.sf9_status,
        sf.updated_at
      FROM school_forms sf
      JOIN users u ON sf.teacher_id = u.id
      ORDER BY sf.updated_at DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching school forms:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, field, status } = body;

    if (!id || !field || !status) {
      return NextResponse.json({ error: 'Missing required fields (id, field, status)' }, { status: 400 });
    }

    const validFields = ['sf1_status', 'sf2_status', 'sf4_status', 'sf9_status'];
    if (!validFields.includes(field)) {
      return NextResponse.json({ error: 'Invalid field name' }, { status: 400 });
    }

    const result = await query(`
      UPDATE school_forms 
      SET ${field} = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'School form record not found' }, { status: 404 });
    }

    // Return the joined data again so UI updates correctly
    const updated = await query(`
      SELECT 
        sf.id, sf.teacher_id, u.name as teacher_name, sf.section_name, sf.grade_level, 
        sf.sf1_status, sf.sf2_status, sf.sf4_status, sf.sf9_status, sf.updated_at
      FROM school_forms sf JOIN users u ON sf.teacher_id = u.id WHERE sf.id = $1
    `, [id]);

    return NextResponse.json(updated.rows[0]);
  } catch (error: any) {
    console.error('Error updating school form:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
