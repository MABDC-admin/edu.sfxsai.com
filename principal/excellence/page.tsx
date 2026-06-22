'use client';
import { useState, useEffect } from 'react';

type AcademicAward = {
  id: number;
  student_name: string;
  grade_level: string;
  award_type: string;
  award_title: string;
  date_awarded: string;
};

export default function AcademicExcellencePage() {
  const [awards, setAwards] = useState<AcademicAward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inject dark mode for this page specifically
    document.body.style.backgroundColor = '#0b1120'; // Deep navy
    return () => {
      document.body.style.backgroundColor = ''; // Revert on unmount
    };
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/excellence');
      const data = await res.json();
      setAwards(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const honorRollCount = awards.filter(a => a.award_type === 'Honor Roll').length;
  const scholarCount = awards.filter(a => a.award_type === 'Scholarship').length;
  const competitionCount = awards.filter(a => a.award_type === 'Competition').length;

  if (loading) return <div style={{ padding: '2rem', color: '#94a3b8' }}>Loading Academic Excellence Data...</div>;

  return (
    <div style={{ color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ color: '#fbbf24' }}>🏆</span> Academic Excellence
        </h2>
        <button style={{ padding: '.6rem 1.25rem', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', boxShadow: '0 4px 14px 0 rgba(251,191,36,0.39)' }}>
          + Record Achievement
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { title: 'Honor Roll Students', value: honorRollCount, icon: '⭐', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
          { title: 'Active Scholars', value: scholarCount, icon: '🎓', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)' },
          { title: 'Competition Medals', value: competitionCount, icon: '🏅', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' }
        ].map((kpi, i) => (
          <div key={i} style={{ background: '#1e293b', border: `1px solid ${kpi.border}`, borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: kpi.bg, filter: 'blur(40px)', borderRadius: '50%' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
              <div style={{ fontSize: '2rem', width: '50px', height: '50px', background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>{kpi.icon}</div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{kpi.title}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginTop: '.2rem' }}>{kpi.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Leaderboard Table */}
        <div style={{ background: '#1e293b', borderRadius: '16px', padding: '2rem', border: '1px solid #334155' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span style={{ color: '#fbbf24' }}>👑</span> Top Achievers Leaderboard
          </h3>
          
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15,23,42,0.6)', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '.8rem', textTransform: 'uppercase' }}>Rank</th>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '.8rem', textTransform: 'uppercase' }}>Student</th>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '.8rem', textTransform: 'uppercase' }}>Grade</th>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '.8rem', textTransform: 'uppercase' }}>Latest Distinction</th>
                </tr>
              </thead>
              <tbody>
                {awards.slice(0, 5).map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(51,65,85,0.5)', background: i % 2 === 0 ? 'transparent' : 'rgba(15,23,42,0.3)' }}>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 800, color: i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#b45309' : '#64748b' }}>
                      #{i + 1}
                    </td>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: '#f8fafc' }}>{a.student_name}</td>
                    <td style={{ padding: '1.25rem 1rem', color: '#94a3b8' }}>{a.grade_level}</td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span style={{ display: 'inline-block', padding: '.25rem .75rem', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', borderRadius: '9999px', fontSize: '.75rem', fontWeight: 700, border: '1px solid rgba(251,191,36,0.2)' }}>
                        {a.award_title}
                      </span>
                    </td>
                  </tr>
                ))}
                {awards.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No data found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Achievements Timeline */}
        <div style={{ background: '#1e293b', borderRadius: '16px', padding: '2rem', border: '1px solid #334155' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc', marginBottom: '1.5rem' }}>Recent Records</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {awards.slice(0, 5).map(a => (
              <div key={a.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24', marginTop: '6px', flexShrink: 0, boxShadow: '0 0 10px rgba(251,191,36,0.5)' }}></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#f8fafc' }}>{a.award_title}</div>
                  <div style={{ fontSize: '.85rem', color: '#94a3b8', marginTop: '.2rem' }}><strong style={{ color: '#cbd5e1' }}>{a.student_name}</strong> • {a.grade_level}</div>
                  <div style={{ fontSize: '.75rem', color: '#64748b', marginTop: '.4rem' }}>{new Date(a.date_awarded).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
