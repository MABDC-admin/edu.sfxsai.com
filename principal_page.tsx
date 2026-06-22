'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DLL, User, GRADE_LEVELS, SUBJECTS } from '@/lib/types';

type PrincipalView = 'overview' | 'dlls' | 'teachers' | 'review';

export default function PrincipalDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; school: string } | null>(null);
  const [view, setView] = useState<PrincipalView>('overview');
  const [dlls, setDlls] = useState<DLL[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedDLL, setSelectedDLL] = useState<DLL | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: 'deped1234', role: 'teacher', grade_level: '', section: '', subject: '', school: '' });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.error) { router.push('/'); return; }
      setUser(d);
      setNewTeacher(f => ({ ...f, school: d.school }));
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const [dllRes, usersRes] = await Promise.all([
      fetch('/api/dlls'),
      fetch('/api/users'),
    ]);
    const [dllData, userData] = await Promise.all([dllRes.json(), usersRes.json()]);
    setDlls(Array.isArray(dllData) ? dllData : []);
    setTeachers(Array.isArray(userData) ? userData.filter((u: User) => u.role === 'teacher') : []);
    setLoading(false);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  async function reviewDLL(dllId: number, action: 'approve' | 'return') {
    const res = await fetch(`/api/dlls/${dllId}/review`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comment }),
    });
    const data = await res.json();
    if (res.ok) {
      setDlls(prev => prev.map(d => d.id === dllId ? data : d));
      setSelectedDLL(null);
      setComment('');
      alert(action === 'approve' ? '✅ DLL Approved!' : '⚠️ DLL Returned to teacher.');
    } else alert(data.error);
  }

  async function addTeacher() {
    const res = await fetch('/api/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTeacher),
    });
    const data = await res.json();
    if (res.ok) {
      setTeachers(prev => [...prev, data]);
      setShowAddTeacher(false);
      setNewTeacher(f => ({ ...f, name: '', email: '', grade_level: '', section: '', subject: '' }));
    } else alert(data.error);
  }

  const submitted = dlls.filter(d => d.status === 'submitted');
  const approved  = dlls.filter(d => d.status === 'approved');
  const returned  = dlls.filter(d => d.status === 'returned');
  const draft     = dlls.filter(d => d.status === 'draft');

  const filteredDLLs = dlls.filter(d =>
    (!filterStatus || d.status === filterStatus) &&
    (!filterTeacher || String(d.teacher_id) === filterTeacher)
  );

  const statusColors: Record<string, string> = { draft: '#94a3b8', submitted: '#3b82f6', approved: '#22c55e', returned: '#f97316' };

  const NavBtn = ({ v, label, icon }: { v: PrincipalView; label: string; icon: string }) => (
    <button onClick={() => setView(v)}
      style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.6rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: view === v ? 700 : 500, fontSize: '.875rem', background: view === v ? 'rgba(255,255,255,.2)' : 'transparent', color: '#fff', width: '100%', textAlign: 'left' }}>
      {icon} {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#003087', color: '#fff', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', boxShadow: '0 2px 12px rgba(0,0,0,.2)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🎓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.95rem' }}>Principal Dashboard</div>
            <div style={{ fontSize: '.72rem', opacity: .7 }}>{user?.school}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '.85rem', opacity: .85 }}>🏫 {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ fontSize: '.8rem', padding: '.35rem .8rem', background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '220px', background: '#00246b', padding: '1.5rem 1rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
          <NavBtn v="overview" label="Overview" icon="📊" />
          <NavBtn v="dlls" label="All DLLs" icon="📄" />
          <NavBtn v="review" label={`For Review ${submitted.length > 0 ? `(${submitted.length})` : ''}`} icon="🔍" />
          <NavBtn v="teachers" label="Teachers" icon="👩‍🏫" />
          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>Quick Stats</div>
            <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.7)', lineHeight: '1.8' }}>
              👩‍🏫 {teachers.length} teachers<br />
              📄 {dlls.length} total DLLs<br />
              🕐 {submitted.length} pending<br />
              ✅ {approved.length} approved
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

          {/* OVERVIEW */}
          {view === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>📊 School Overview</h2>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Total Teachers', value: teachers.length, icon: '👩‍🏫', color: '#6366f1' },
                  { label: 'Total DLLs', value: dlls.length, icon: '📄', color: '#0ea5e9' },
                  { label: 'Pending Review', value: submitted.length, icon: '🕐', color: '#f59e0b' },
                  { label: 'Approved', value: approved.length, icon: '✅', color: '#22c55e' },
                  { label: 'Returned', value: returned.length, icon: '⚠️', color: '#f97316' },
                  { label: 'Draft', value: draft.length, icon: '📝', color: '#94a3b8' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.08)', borderLeft: `4px solid ${s.color}` }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>{s.icon}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '.78rem', color: '#64748b', marginTop: '.2rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Pending submissions */}
              {submitted.length > 0 && (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#003087', marginBottom: '1rem' }}>🕐 Awaiting Your Review</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    {submitted.map(d => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{d.teacher_name} — {d.grade_level} {d.subject}</div>
                          <div style={{ fontSize: '.78rem', color: '#64748b' }}>Q{d.quarter} Week {d.week_number} · {d.section}</div>
                        </div>
                        <button className="btn btn-primary" style={{ fontSize: '.8rem', padding: '.35rem .8rem' }}
                          onClick={() => { setSelectedDLL(d); setView('review'); }}>
                          Review →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FOR REVIEW */}
          {view === 'review' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>🔍 DLLs for Review</h2>
              {selectedDLL ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#003087' }}>{selectedDLL.grade_level} — {selectedDLL.subject}</h3>
                      <p style={{ fontSize: '.85rem', color: '#64748b' }}>
                        Teacher: <strong>{selectedDLL.teacher_name}</strong> · Q{selectedDLL.quarter} Week {selectedDLL.week_number} · {selectedDLL.section}
                      </p>
                    </div>
                    <button className="btn btn-ghost" onClick={() => setSelectedDLL(null)}>← Back</button>
                  </div>

                  {/* Quick view of Monday content */}
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '.5rem' }}>Monday — Overview</p>
                    <p style={{ fontSize: '.875rem' }}><strong>Learning Objectives:</strong> {selectedDLL.content.monday?.learning_objectives || '—'}</p>
                    <p style={{ fontSize: '.875rem', marginTop: '.35rem' }}><strong>Topic / Content:</strong> {selectedDLL.content.monday?.topic_content || '—'}</p>
                    <p style={{ fontSize: '.875rem', marginTop: '.35rem' }}><strong>Review:</strong> {selectedDLL.content.monday?.review || '—'}</p>
                    <p style={{ fontSize: '.875rem', marginTop: '.35rem' }}><strong>Assessment:</strong> {selectedDLL.content.monday?.assessment_evaluation || '—'}</p>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label className="dll-label">Principal Comment / Feedback</label>
                    <textarea className="dll-input" rows={3} value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Add your feedback here (optional for approval)…" />
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem' }}>
                    <button className="btn btn-success" onClick={() => reviewDLL(selectedDLL.id, 'approve')}>✅ Approve DLL</button>
                    <button className="btn btn-warning" onClick={() => reviewDLL(selectedDLL.id, 'return')}>⚠️ Return to Teacher</button>
                  </div>
                </div>
              ) : submitted.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                  <p>All caught up! No DLLs pending review.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {submitted.map(d => (
                    <div key={d.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.95rem' }}>{d.teacher_name} — {d.grade_level} {d.subject}</div>
                        <div style={{ fontSize: '.78rem', color: '#64748b', marginTop: '.25rem' }}>Q{d.quarter} Week {d.week_number} · {d.section} · Submitted {d.submitted_at ? new Date(d.submitted_at).toLocaleDateString('en-PH') : '—'}</div>
                      </div>
                      <button className="btn btn-primary" style={{ fontSize: '.8rem' }} onClick={() => { setSelectedDLL(d); setComment(''); }}>Review →</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALL DLLs */}
          {view === 'dlls' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>📄 All DLLs</h2>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select className="dll-input" style={{ maxWidth: '160px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {['draft','submitted','approved','returned'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
                <select className="dll-input" style={{ maxWidth: '200px' }} value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
                  <option value="">All Teachers</option>
                  {teachers.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                </select>
              </div>
              <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
                  <thead>
                    <tr style={{ background: '#003087', color: '#fff' }}>
                      {['Teacher','Grade','Subject','Section','Quarter','Week','Status','Submitted'].map(h => (
                        <th key={h} style={{ padding: '.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '.78rem', letterSpacing: '.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDLLs.map((d, i) => (
                      <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '.65rem 1rem', fontWeight: 500 }}>{d.teacher_name}</td>
                        <td style={{ padding: '.65rem 1rem' }}>{d.grade_level}</td>
                        <td style={{ padding: '.65rem 1rem' }}>{d.subject}</td>
                        <td style={{ padding: '.65rem 1rem' }}>{d.section}</td>
                        <td style={{ padding: '.65rem 1rem' }}>Q{d.quarter}</td>
                        <td style={{ padding: '.65rem 1rem' }}>Week {d.week_number}</td>
                        <td style={{ padding: '.65rem 1rem' }}>
                          <span style={{ padding: '.2rem .6rem', borderRadius: '9999px', fontSize: '.72rem', fontWeight: 600, background: `${statusColors[d.status]}22`, color: statusColors[d.status], border: `1px solid ${statusColors[d.status]}44` }}>
                            {d.status}
                          </span>
                        </td>
                        <td style={{ padding: '.65rem 1rem', fontSize: '.78rem', color: '#94a3b8' }}>
                          {d.submitted_at ? new Date(d.submitted_at).toLocaleDateString('en-PH') : '—'}
                        </td>
                      </tr>
                    ))}
                    {filteredDLLs.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No DLLs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TEACHERS */}
          {view === 'teachers' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>👩‍🏫 Teachers</h2>
                <button className="btn btn-primary" onClick={() => setShowAddTeacher(true)}>+ Add Teacher</button>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {teachers.map(t => {
                  const tDLLs = dlls.filter(d => d.teacher_id === t.id);
                  const tApproved = tDLLs.filter(d => d.status === 'approved').length;
                  const tPending  = tDLLs.filter(d => d.status === 'submitted').length;
                  return (
                    <div key={t.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{t.name}</div>
                          <div style={{ fontSize: '.78rem', color: '#64748b' }}>{t.email}</div>
                          {t.grade_level && <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '.15rem' }}>{t.grade_level} · {t.subject}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }}>
                        <div><div style={{ fontWeight: 700, color: '#0ea5e9' }}>{tDLLs.length}</div><div style={{ fontSize: '.72rem', color: '#94a3b8' }}>Total DLLs</div></div>
                        <div><div style={{ fontWeight: 700, color: '#22c55e' }}>{tApproved}</div><div style={{ fontSize: '.72rem', color: '#94a3b8' }}>Approved</div></div>
                        <div><div style={{ fontWeight: 700, color: '#f59e0b' }}>{tPending}</div><div style={{ fontSize: '.72rem', color: '#94a3b8' }}>Pending</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddTeacher && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#003087', marginBottom: '1.5rem' }}>👩‍🏫 Add New Teacher</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[['name','Full Name','text','e.g. Maria Santos'],['email','Email','email','teacher@deped.edu.ph'],['password','Password','password','deped1234']].map(([f,l,t,p]) => (
                <div key={f}>
                  <label className="dll-label">{l}</label>
                  <input type={t} className="dll-input" value={(newTeacher as Record<string,string>)[f]} placeholder={p}
                    onChange={e => setNewTeacher(prev => ({ ...prev, [f]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="dll-label">Grade Level</label>
                <select className="dll-input" value={newTeacher.grade_level} onChange={e => setNewTeacher(f => ({ ...f, grade_level: e.target.value }))}>
                  <option value="">— Select —</option>
                  {GRADE_LEVELS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="dll-label">Section</label>
                <input className="dll-input" value={newTeacher.section} placeholder="e.g. Rizal" onChange={e => setNewTeacher(f => ({ ...f, section: e.target.value }))} />
              </div>
              <div>
                <label className="dll-label">Subject</label>
                <input className="dll-input" value={newTeacher.subject} placeholder="e.g. English" onChange={e => setNewTeacher(f => ({ ...f, subject: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={addTeacher}>Add Teacher</button>
              <button className="btn btn-ghost" onClick={() => setShowAddTeacher(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
