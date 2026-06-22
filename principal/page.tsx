'use client';
import { useState, useEffect } from 'react';
import { DLL, User } from '@/lib/types';
import Link from 'next/link';

export default function PrincipalOverview() {
  const [dlls, setDlls] = useState<DLL[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dllRes, usersRes] = await Promise.all([
        fetch('/api/dlls'),
        fetch('/api/users'),
      ]);
      const [dllData, userData] = await Promise.all([dllRes.json(), usersRes.json()]);
      setDlls(Array.isArray(dllData) ? dllData : []);
      setTeachers(Array.isArray(userData) ? userData.filter((u: User) => u.role === 'teacher') : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const submitted = dlls.filter(d => d.status === 'submitted');
  const approved  = dlls.filter(d => d.status === 'approved');
  const returned  = dlls.filter(d => d.status === 'returned');
  const draft     = dlls.filter(d => d.status === 'draft');

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading overview data...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
        📊 School Overview
      </h2>
      
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'Total Teachers', value: teachers.length, icon: '👩‍🏫', color: '#6366f1', link: '/principal/departments' },
          { label: 'Total DLLs', value: dlls.length, icon: '📄', color: '#0ea5e9', link: '/principal/approvals' },
          { label: 'Pending Review', value: submitted.length, icon: '🕐', color: '#f59e0b', link: '/principal/approvals' },
          { label: 'Approved', value: approved.length, icon: '✅', color: '#22c55e', link: '/principal/approvals' },
          { label: 'Returned', value: returned.length, icon: '⚠️', color: '#f97316', link: '/principal/approvals' },
          { label: 'Draft', value: draft.length, icon: '📝', color: '#94a3b8', link: '/principal/approvals' },
        ].map(s => (
          <Link href={s.link} key={s.label} style={{ textDecoration: 'none' }}>
            <div style={{ 
              background: '#fff', 
              borderRadius: '16px', 
              padding: '1.5rem', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,.05), 0 2px 4px -2px rgba(0,0,0,.05)', 
              borderTop: `4px solid ${s.color}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,.05)'; }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '.75rem' }}>{s.icon}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '.85rem', fontWeight: 600, color: '#64748b', marginTop: '.5rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Pending Submissions Widget */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>🕐 Recent Submissions</h3>
            <Link href="/principal/approvals" style={{ color: '#3b82f6', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          
          {submitted.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>
              No pending submissions.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {submitted.slice(0, 5).map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', color: '#1e293b' }}>{d.teacher_name}</div>
                    <div style={{ fontSize: '.78rem', color: '#64748b', marginTop: '.2rem' }}>{d.grade_level} {d.subject} · Q{d.quarter} Week {d.week_number}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Widget */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,.05)' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: '1.25rem' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'grid', gap: '.75rem' }}>
            {[
              { label: 'Review Pending DLLs', desc: `${submitted.length} awaiting approval`, link: '/principal/approvals', icon: '📝' },
              { label: 'Manage Department Heads', desc: 'Assign roles to faculty', link: '/principal/departments', icon: '🏢' },
              { label: 'View School Calendar', desc: 'Check upcoming SFXSAI events', link: '/principal/calendar', icon: '📅' },
              { label: 'Monitor School Forms', desc: 'Check SF1-SF10 completion', link: '/principal/school-forms', icon: '📊' },
            ].map(action => (
              <Link href={action.link} key={action.label} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', transition: 'border-color 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#93c5fd'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ fontSize: '1.5rem' }}>{action.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', color: '#1e293b' }}>{action.label}</div>
                    <div style={{ fontSize: '.78rem', color: '#64748b' }}>{action.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
