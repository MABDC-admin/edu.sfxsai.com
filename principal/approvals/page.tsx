'use client';
import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Common interfaces
interface BaseApproval {
  id: number;
  teacher_id: number;
  teacher_name: string;
  status: string;
  submitted_at: string;
  comments?: string;
  [key: string]: any; // Allow specific fields per type
}

const statusColors: Record<string, string> = { 
  draft: '#94a3b8', 
  submitted: '#3b82f6', 
  approved: '#22c55e', 
  returned: '#f97316' 
};

const viewToApiMap: Record<string, string> = {
  'DLL approvals': '/api/dlls',
  'Examination approvals': '/api/approvals/examinations',
  'Grade approvals': '/api/approvals/grades',
  'Academic event approvals': '/api/approvals/events',
  'Curriculum revisions': '/api/approvals/curriculum',
  'Intervention plans': '/api/approvals/interventions',
};

function ApprovalsContent() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view') || 'DLL approvals';
  
  const [data, setData] = useState<BaseApproval[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedItem, setSelectedItem] = useState<BaseApproval | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewParam]);

  useEffect(() => {
    document.body.style.backgroundColor = '#0d1f17'; // Very dark green
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  async function loadData() {
    setLoading(true);
    setSelectedItem(null);
    const apiUrl = viewToApiMap[viewParam];
    
    if (!apiUrl) {
      setData([]);
      setLoading(false);
      return;
    }

    const [dataRes, usersRes] = await Promise.all([
      fetch(apiUrl),
      fetch('/api/users'),
    ]);
    const [fetchedData, userData] = await Promise.all([dataRes.json(), usersRes.json()]);
    
    setData(Array.isArray(fetchedData) ? fetchedData : []);
    setTeachers(Array.isArray(userData) ? userData.filter((u: User) => u.role === 'teacher') : []);
    setLoading(false);
  }

  async function reviewItem(itemId: number, action: 'approve' | 'return') {
    const isDll = viewParam === 'DLL approvals';
    const apiUrl = isDll ? `/api/dlls/${itemId}/review` : viewToApiMap[viewParam];
    
    const body = isDll ? { action, comment } : { id: itemId, action, comments: comment };

    const res = await fetch(apiUrl, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const resData = await res.json();
    if (res.ok) {
      setData(prev => prev.map(d => d.id === itemId ? resData : d));
      setSelectedItem(null);
      setComment('');
      alert(action === 'approve' ? '✅ Approved successfully!' : '⚠️ Returned to teacher.');
    } else alert(resData.error || 'Something went wrong');
  }

  const filteredData = data.filter(d =>
    (!filterStatus || d.status === filterStatus) &&
    (!filterTeacher || String(d.teacher_id) === filterTeacher)
  );

  const pendingData = data.filter(d => d.status === 'submitted');

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading {viewParam}...</div>;

  // Render Table Headers based on View
  const getTableHeaders = () => {
    switch (viewParam) {
      case 'DLL approvals': return ['Teacher','Grade','Subject','Quarter','Week','Status','Submitted'];
      case 'Examination approvals': return ['Teacher','Grade','Subject','Exam Type','Status','Submitted'];
      case 'Grade approvals': return ['Teacher','Grade','Subject','Quarter','Status','Submitted'];
      case 'Academic event approvals': return ['Teacher','Event Name','Date','Budget','Status','Submitted'];
      case 'Curriculum revisions': return ['Teacher','Subject','Status','Submitted'];
      case 'Intervention plans': return ['Teacher','Student Name','Duration','Status','Submitted'];
      default: return [];
    }
  };

  const renderTableRow = (d: any, i: number) => {
    const bg = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent';
    let pillClass = 'bio-pill bio-pill-blue';
    if (d.status === 'approved') pillClass = 'bio-pill bio-pill-green';
    if (d.status === 'returned') pillClass = 'bio-pill bio-pill-yellow';
    if (d.status === 'draft') pillClass = 'bio-pill text-gray-400 border border-gray-600';

    const statusBadge = (
      <span className={pillClass}>
        {d.status}
      </span>
    );
    const dateStr = d.submitted_at ? new Date(d.submitted_at).toLocaleDateString('en-PH') : '—';

    switch (viewParam) {
      case 'DLL approvals':
        return (
          <tr key={d.id} style={{ background: bg, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--green-pale)' }}>{d.teacher_name}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>{d.grade_level}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>{d.subject}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>Q{d.quarter}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>Week {d.week_number}</td>
            <td style={{ padding: '1rem' }}>{statusBadge}</td>
            <td style={{ padding: '1rem', fontSize: '.85rem', color: '#888' }}>{dateStr}</td>
          </tr>
        );
      case 'Examination approvals':
        return (
          <tr key={d.id} style={{ background: bg, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--green-pale)' }}>{d.teacher_name}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>{d.grade_level}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>{d.subject}</td>
            <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--blue)' }}>{d.exam_type}</td>
            <td style={{ padding: '1rem' }}>{statusBadge}</td>
            <td style={{ padding: '1rem', fontSize: '.85rem', color: '#888' }}>{dateStr}</td>
          </tr>
        );
      case 'Grade approvals':
        return (
          <tr key={d.id} style={{ background: bg, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--green-pale)' }}>{d.teacher_name}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>{d.grade_level}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>{d.subject}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>Q{d.quarter}</td>
            <td style={{ padding: '1rem' }}>{statusBadge}</td>
            <td style={{ padding: '1rem', fontSize: '.85rem', color: '#888' }}>{dateStr}</td>
          </tr>
        );
      case 'Academic event approvals':
        return (
          <tr key={d.id} style={{ background: bg, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--green-pale)' }}>{d.teacher_name}</td>
            <td style={{ padding: '1rem', fontWeight: 600, color: '#ccc' }}>{d.event_name}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>{new Date(d.event_date).toLocaleDateString()}</td>
            <td style={{ padding: '1rem', color: 'var(--green-light)', fontWeight: 600 }}>₱{d.budget_required}</td>
            <td style={{ padding: '1rem' }}>{statusBadge}</td>
            <td style={{ padding: '1rem', fontSize: '.85rem', color: '#888' }}>{dateStr}</td>
          </tr>
        );
      case 'Curriculum revisions':
        return (
          <tr key={d.id} style={{ background: bg, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--green-pale)' }}>{d.teacher_name}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>{d.subject}</td>
            <td style={{ padding: '1rem' }}>{statusBadge}</td>
            <td style={{ padding: '1rem', fontSize: '.85rem', color: '#888' }}>{dateStr}</td>
          </tr>
        );
      case 'Intervention plans':
        return (
          <tr key={d.id} style={{ background: bg, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--green-pale)' }}>{d.teacher_name}</td>
            <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--blue)' }}>{d.student_name}</td>
            <td style={{ padding: '1rem', color: '#ccc' }}>{d.duration_weeks} Weeks</td>
            <td style={{ padding: '1rem' }}>{statusBadge}</td>
            <td style={{ padding: '1rem', fontSize: '.85rem', color: '#888' }}>{dateStr}</td>
          </tr>
        );
      default: return null;
    }
  };

  const renderDetails = () => {
    if (!selectedItem) return null;
    const d = selectedItem as any;
    
    return (
      <div className="glass-card mb-8">
        <p className="text-[11px] tracking-[3px] uppercase text-[var(--green-light)] mb-4">Submission Details</p>
        <div style={{ display: 'grid', gap: '.75rem' }}>
          {viewParam === 'DLL approvals' && (
            <>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Learning Objectives:</strong> {d.content?.monday?.learning_objectives || '—'}</p>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Topic / Content:</strong> {d.content?.monday?.topic_content || '—'}</p>
            </>
          )}
          {viewParam === 'Examination approvals' && (
            <>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Type:</strong> {d.exam_type}</p>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Attachment:</strong> <a href={d.file_url} className="text-[var(--blue)] hover:underline">View Document</a></p>
            </>
          )}
          {viewParam === 'Grade approvals' && (
            <>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Quarter:</strong> Q{d.quarter}</p>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Grade Sheet:</strong> <a href={d.file_url} className="text-[var(--blue)] hover:underline">View Document</a></p>
            </>
          )}
          {viewParam === 'Academic event approvals' && (
            <>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Event Name:</strong> {d.event_name}</p>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Description:</strong> {d.description}</p>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Budget Requested:</strong> ₱{d.budget_required}</p>
            </>
          )}
          {viewParam === 'Curriculum revisions' && (
            <>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Proposed Changes:</strong> {d.proposed_changes}</p>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Rationale:</strong> {d.rationale}</p>
            </>
          )}
          {viewParam === 'Intervention plans' && (
            <>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Student:</strong> {d.student_name}</p>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Target Goals:</strong> {d.target_goals}</p>
              <p className="text-sm text-gray-300"><strong className="text-[var(--green-pale)] mr-2">Duration:</strong> {d.duration_weeks} Weeks</p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ color: '#f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8f9fa', letterSpacing: '-0.02em' }}>
          <span style={{ color: 'var(--green-light)' }}>✅</span> Approval Center
        </h2>
        <div className="bio-pill bio-pill-blue text-[13px] px-4 py-2">
          Current View: {viewParam}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {selectedItem ? (
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h3 className="bg-bio-gradient text-3xl font-black mb-2">
                  {viewParam} Review
                </h3>
                <p style={{ fontSize: '.95rem', color: '#adb5bd' }}>
                  Submitted by: <strong style={{ color: '#fff' }}>{selectedItem.teacher_name}</strong>
                </p>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ padding: '.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff' }}>← Back to List</button>
            </div>

            {renderDetails()}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '.9rem', color: '#ccc', marginBottom: '.5rem' }}>Principal Comment / Feedback</label>
              <textarea 
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '.95rem', minHeight: '100px', resize: 'vertical', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add your feedback here (optional for approval)…" 
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => reviewItem(selectedItem.id, 'approve')} className="bio-pill bio-pill-green text-[15px] px-6 py-3 cursor-pointer">✅ Approve</button>
              <button onClick={() => reviewItem(selectedItem.id, 'return')} className="bio-pill bio-pill-yellow text-[15px] px-6 py-3 cursor-pointer">⚠️ Return</button>
            </div>
          </div>
        ) : (
          <>
            {pendingData.length > 0 && (
              <div className="glass-card" style={{ borderColor: 'var(--yellow)' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--yellow)', marginBottom: '1.25rem' }}>🕐 Action Required: Pending Reviews</h3>
                <div style={{ display: 'grid', gap: '.75rem' }}>
                  {pendingData.map((d: any) => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(249,199,79,0.1)', borderRadius: '12px', border: '1px solid rgba(249,199,79,0.3)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8f9fa' }}>{d.teacher_name}</div>
                        <div style={{ fontSize: '.85rem', color: '#ccc', marginTop: '.25rem' }}>{d.subject || d.event_name || d.student_name}</div>
                      </div>
                      <button onClick={() => { setSelectedItem(d); setComment(''); }} className="bio-pill bio-pill-yellow text-sm px-4 py-2 cursor-pointer">
                        Review →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card">
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', marginBottom: '1.25rem' }}>📄 All Submissions</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <select style={{ padding: '.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '.9rem', minWidth: '160px', background: '#0d1f17', color: '#fff' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {['draft','submitted','approved','returned'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
                <select style={{ padding: '.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '.9rem', minWidth: '200px', background: '#0d1f17', color: '#fff' }} value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
                  <option value="">All Teachers</option>
                  {teachers.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                </select>
              </div>
              
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--green-mid)', color: '#fff', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                      {getTableHeaders().map(h => (
                        <th key={h} style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((d, i) => renderTableRow(d, i))}
                    {filteredData.length === 0 && (
                      <tr><td colSpan={10} style={{ padding: '3rem', textAlign: 'center', color: '#adb5bd', fontSize: '1rem' }}>No submissions found matching filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: '#64748b' }}>Loading Approval Center...</div>}>
      <ApprovalsContent />
    </Suspense>
  );
}
