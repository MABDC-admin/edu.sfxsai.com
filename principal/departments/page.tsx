'use client';
import { useState, useEffect } from 'react';

type Department = {
  id: number;
  name: string;
  head_name: string;
  coordinator_name: string;
  faculty_count: number;
  performance_score: number;
};

type DeptStats = {
  total_faculty: number;
  avg_score: number;
  total_departments: number;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DeptStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Premium light background
    document.body.style.backgroundColor = '#f8fafc';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      setDepartments(data.departments || []);
      setStats(data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading Department Management...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ color: '#2563eb' }}>🏢</span> Department Management
        </h2>
        <button style={{ padding: '.7rem 1.5rem', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', boxShadow: '0 4px 14px 0 rgba(30,58,138,0.3)', transition: 'transform 0.2s' }}>
          + Add Department
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { title: 'Total Departments', value: stats.total_departments, icon: '📂' },
            { title: 'Total Faculty', value: stats.total_faculty, icon: '👥' },
            { title: 'Avg Performance', value: `${Number(stats.avg_score).toFixed(1)}%`, icon: '📈' }
          ].map((kpi, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#2563eb' }}></div>
              <div style={{ fontSize: '2.5rem', width: '60px', height: '60px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>{kpi.icon}</div>
              <div>
                <div style={{ color: '#64748b', fontSize: '.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{kpi.title}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginTop: '.2rem' }}>{kpi.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid of Departments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {departments.map(dept => (
          <div key={dept.id} style={{ background: '#fff', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a8a', lineHeight: 1.2, paddingRight: '1rem' }}>{dept.name}</h3>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '.25rem .75rem', borderRadius: '9999px', fontSize: '.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <span style={{ color: '#2563eb' }}>👥</span> {dept.faculty_count} Faculty
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🧑‍🏫</div>
                <div>
                  <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Department Head</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{dept.head_name}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📋</div>
                <div>
                  <div style={{ fontSize: '.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Subject Coordinator</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{dept.coordinator_name}</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                <span style={{ fontSize: '.85rem', fontWeight: 700, color: '#475569' }}>Performance Score</span>
                <span style={{ fontSize: '.85rem', fontWeight: 800, color: dept.performance_score >= 90 ? '#16a34a' : '#2563eb' }}>{dept.performance_score}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${dept.performance_score}%`, height: '100%', background: dept.performance_score >= 90 ? '#22c55e' : '#3b82f6', borderRadius: '9999px' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
