import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM departments
      ORDER BY name ASC
    `);
    
    // Also fetch aggregate stats
    const statsResult = await query(`
      SELECT 
        SUM(faculty_count) as total_faculty,
        AVG(performance_score) as avg_score,
        COUNT(id) as total_departments
      FROM departments
    `);

    return NextResponse.json({
      departments: result.rows,
      stats: statsResult.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
