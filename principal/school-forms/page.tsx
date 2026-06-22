'use client';
import { useState, useEffect } from 'react';

type SchoolFormRecord = {
  id: number;
  teacher_id: number;
  teacher_name: string;
  section_name: string;
  grade_level: string;
  sf1_status: 'pending' | 'submitted' | 'returned';
  sf2_status: 'pending' | 'submitted' | 'returned';
  sf4_status: 'pending' | 'submitted' | 'returned';
  sf9_status: 'pending' | 'submitted' | 'returned';
  updated_at: string;
};

export default function SchoolFormsPage() {
  const [records, setRecords] = useState<SchoolFormRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/school-forms');
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, field: string, newStatus: string) {
    try {
      // Optimistic UI update
      setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: newStatus } : r));
      
      const res = await fetch('/api/school-forms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, status: newStatus })
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Failed to update: ' + err.error);
        loadData(); // Revert on failure
      }
    } catch (e) {
      console.error(e);
      loadData();
    }
  }

  const statusColors = {
    pending: { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', icon: '⏳' },
    submitted: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', icon: '✅' },
    returned: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', icon: '⚠️' }
  };

  const renderBadge = (recordId: number, field: string, currentStatus: string) => {
    const style = statusColors[currentStatus as keyof typeof statusColors];
    return (
      <select 
        value={currentStatus}
        onChange={(e) => updateStatus(recordId, field, e.target.value)}
        style={{
          appearance: 'none',
          padding: '.4rem .8rem .4rem 2rem',
          borderRadius: '9999px',
          fontSize: '.75rem',
          fontWeight: 700,
          background: `${style.bg} url("data:image/svg+xml;utf8,<svg fill='${encodeURIComponent(style.color)}' height='16' viewBox='0 0 24 24' width='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>") no-repeat right 6px center`,
          color: style.color,
          border: `1px solid ${style.border}`,
          cursor: 'pointer',
          outline: 'none',
          textTransform: 'uppercase',
          position: 'relative'
        }}
      >
        <option value="pending">⏳ Pending</option>
        <option value="submitted">✅ Submitted</option>
        <option value="returned">⚠️ Returned</option>
      </select>
    );
  };

  const calculateProgress = (r: SchoolFormRecord) => {
    const fields = [r.sf1_status, r.sf2_status, r.sf4_status, r.sf9_status];
    const submitted = fields.filter(f => f === 'submitted').length;
    return (submitted / 4) * 100;
  };

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading School Forms Data...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
          📊 School Forms Monitoring
        </h2>
        <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '.9rem' }}>
          Total Sections: {records.length}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,.05)', border: '1px solid #e2e8f0' }}>
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#334155', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Adviser</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Section</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>SF1</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>SF2</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>SF4</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>SF9</th>
                <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em', width: '150px' }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'} onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f8fafc'}>
                  <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                    {r.teacher_name}
                  </td>
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: '#0ea5e9' }}>{r.grade_level}</span> - {r.section_name}
                  </td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                    {renderBadge(r.id, 'sf1_status', r.sf1_status)}
                  </td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                    {renderBadge(r.id, 'sf2_status', r.sf2_status)}
                  </td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                    {renderBadge(r.id, 'sf4_status', r.sf4_status)}
                  </td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                    {renderBadge(r.id, 'sf9_status', r.sf9_status)}
                  </td>
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${calculateProgress(r)}%`, background: calculateProgress(r) === 100 ? '#22c55e' : '#3b82f6', height: '100%', transition: 'width 0.3s ease, background 0.3s ease' }}></div>
                    </div>
                    <div style={{ fontSize: '.75rem', color: '#64748b', marginTop: '.4rem', fontWeight: 600 }}>{calculateProgress(r)}% Completed</div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '1rem' }}>No school forms found. Add sections and teachers to begin tracking.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
