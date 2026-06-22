'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSubjectsForGrade, DLL } from '@/lib/types';

type View = 'quarters' | 'subjects' | 'weeks';

const QUARTER_LABELS = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];

function thisMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

  const SkeuoFolder = ({ variant, qLabel, title, count, isActive, onClick }: any) => {
    return (
      <div
        onClick={onClick}
        style={{
          background: isActive ? '#eff6ff' : '#ffffff',
          border: isActive ? '2px solid #3b82f6' : '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem',
          cursor: 'pointer',
          boxShadow: isActive ? '0 10px 25px -5px rgba(59,130,246,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '.75rem',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isActive ? '0 10px 25px -5px rgba(59,130,246,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)';
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: isActive ? '#3b82f6' : '#cbd5e1' }}></div>
        <div style={{ fontSize: '.8rem', fontWeight: 800, color: isActive ? '#2563eb' : '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          {qLabel}
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
          {title}
        </div>
        <div style={{ fontSize: '.85rem', color: '#475569', fontWeight: 600 }}>
          {variant === 'quarter' ? 'View Subjects →' : 'View DLLs →'}
        </div>
      </div>
    );
  };
// ── HEADER ────────────────────────────────────────────────────────────
const AppHeader: React.FC<{ name?: string; gradeLevel?: string; onLogout: () => void }> = ({ name, gradeLevel, onLogout }) => (
  <div style={{
    background: '#003087',
    color: '#fff',
    padding: '0 1.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    boxShadow: '0 2px 16px rgba(0,0,0,.25)',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
      <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,.3)' }} />
      <div>
        <div style={{ fontWeight: 800, fontSize: '.95rem', letterSpacing: '-.01em', lineHeight: 1.15 }}>M.A BRAIN DEVELOPMENT CENTER</div>
        <div style={{ fontSize: '.68rem', color: '#FFD700', fontWeight: 600, letterSpacing: '.03em' }}>Abu Dhabi, UAE</div>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '.85rem', opacity: .9, fontWeight: 600 }}>👤 {name}</div>
        {gradeLevel && (
          <div style={{ fontSize: '.7rem', color: '#FFD700', fontWeight: 600 }}>{gradeLevel}</div>
        )}
      </div>
      <button
        onClick={onLogout}
        style={{
          fontSize: '.8rem', padding: '.35rem .9rem',
          background: 'rgba(255,255,255,.12)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,.25)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 600,
        }}
      >Logout</button>
    </div>
  </div>
);

// ── BREADCRUMB ────────────────────────────────────────────────────────
interface BreadcrumbProps {
  view: View; quarter: number; subject: string;
  setView: (v: View) => void;
}
const Breadcrumb: React.FC<BreadcrumbProps> = ({ view, quarter, subject, setView }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '.4rem',
    padding: '.75rem 1.75rem',
    background: 'rgba(255,255,255,.55)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(200,180,140,.3)',
    fontSize: '.84rem',
  }}>
    <span className="breadcrumb-item" onClick={() => setView('quarters')}>🗂 My DLLs</span>
    {view !== 'quarters' && (
      <><span style={{ color: '#c4a97a' }}>/</span>
        <span className="breadcrumb-item" onClick={() => setView('subjects')}>{QUARTER_LABELS[quarter]}</span></>
    )}
    {view === 'weeks' && (
      <><span style={{ color: '#c4a97a' }}>/</span>
        <span style={{ color: '#1a0800', fontWeight: 700 }}>{subject}</span></>
    )}
  </div>
);

// ── STATUS BADGE ──────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
);

// ── MAIN ──────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; school: string; grade_level?: string } | null>(null);
  const [view, setView] = useState<View>('quarters');
  const [quarter, setQuarter] = useState(0);
  const [subject, setSubject] = useState('');
  const [dlls, setDlls] = useState<DLL[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    section: '',
    subject: '',
    week_number: 1,
    week_of: thisMonday(),
  });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.error) router.push('/'); else setUser(d);
    });
  }, [router]);

  const loadDLLs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams({
      quarter: String(quarter + 1),
      grade: user.grade_level || '',
      subject,
    });
    const res = await fetch('/api/dlls?' + params);
    const data = await res.json();
    setDlls(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [quarter, subject, user]);

  useEffect(() => { if (view === 'weeks') loadDLLs(); }, [view, loadDLLs]);

  const openNewModal = () => {
    setNewForm({
      section: '',
      subject,
      week_number: (dlls.length + 1) <= 10 ? dlls.length + 1 : 1,
      week_of: thisMonday(),
    });
    setShowNew(true);
  };

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  async function createDLL() {
    if (!newForm.week_of) return alert('Please select the week start date.');
    if (!user?.grade_level) return alert('Your account has no grade level assigned. Contact the principal.');
    setCreating(true);
    const res = await fetch('/api/dlls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quarter: quarter + 1,
        week_number: newForm.week_number,
        week_of: newForm.week_of,
        grade_level: user.grade_level,
        section: newForm.section,
        subject: newForm.subject || subject,
      }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) { setShowNew(false); router.push(`/teacher/dll/${data.id}`); }
    else alert(data.error || 'Failed to create DLL');
  }

  const currentYear = new Date().getFullYear();
  const isCurrentQuarter = (q: number) => {
    const month = new Date().getMonth() + 1;
    const qMap = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
    return qMap[month - 1] === q + 1;
  };

  const pageWrapper = (content: React.ReactNode) => (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ede5d3 0%, #e2d5bc 100%)' }}>
      <AppHeader name={user?.name} gradeLevel={user?.grade_level} onLogout={handleLogout} />
      {view !== 'quarters' && (
        <Breadcrumb view={view} quarter={quarter} subject={subject} setView={setView} />
      )}
      <div style={{ padding: '2rem 1.75rem', maxWidth: '1800px', margin: '0 auto' }}>
        {content}
      </div>

      {/* CREATE DLL MODAL */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '2rem', width: '100%', maxWidth: '480px', margin: '1rem', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#003087', marginBottom: '.3rem' }}>📝 Create New Weekly DLL</h3>
            <p style={{ fontSize: '.82rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              Q{quarter + 1} · {user?.grade_level} · {subject}
            </p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label className="dll-label">Section Name <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                <input className="dll-input" value={newForm.section}
                  onChange={e => setNewForm(f => ({ ...f, section: e.target.value }))}
                  placeholder="e.g. Section A, Rizal" autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="dll-label">Week Number</label>
                  <select className="dll-input" value={newForm.week_number}
                    onChange={e => setNewForm(f => ({ ...f, week_number: Number(e.target.value) }))}>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="dll-label">Grade Level</label>
                  <input className="dll-input" value={user?.grade_level || ''} disabled
                    style={{ background: '#f8fafc', color: '#64748b' }} />
                </div>
              </div>
              <div>
                <label className="dll-label">Week Start Date (Monday)</label>
                <input type="date" className="dll-input" value={newForm.week_of}
                  onChange={e => setNewForm(f => ({ ...f, week_of: e.target.value }))} />
                <p style={{ fontSize: '.74rem', color: '#94a3b8', marginTop: '.3rem' }}>Covers Mon–Fri of this week.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.75rem' }}>
              <button onClick={createDLL} disabled={creating}
                style={{ flex: 1, background: '#003087', color: '#fff', border: 'none', borderRadius: '10px', padding: '.65rem 1rem', fontWeight: 700, fontSize: '.9rem', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? .7 : 1, fontFamily: 'inherit' }}>
                {creating ? '⏳ Creating…' : '✅ Create DLL'}
              </button>
              <button onClick={() => setShowNew(false)} disabled={creating}
                style={{ padding: '.65rem 1.2rem', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── QUARTER VIEW ──────────────────────────────────────────────────
  if (view === 'quarters') return pageWrapper(
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '.05em', textTransform: 'uppercase', margin: 0 }}>
          📂 My DLL Folders — {currentYear}
        </h2>
        {user?.grade_level && (
          <p style={{ fontSize: '.9rem', color: '#64748b', marginTop: '.3rem' }}>
            Assigned Grade: <strong>{user.grade_level}</strong>
          </p>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
        {[0, 1, 2, 3].map(q => (
          <SkeuoFolder
            key={q}
            variant="quarter"
            qLabel={`Q ${q + 1}`}
            title={`Quarter ${q + 1}`}
            count={0}
            isActive={isCurrentQuarter(q)}
            onClick={() => { setQuarter(q); setView('subjects'); }}
          />
        ))}
      </div>
    </>
  );

  // ── SUBJECT VIEW ──────────────────────────────────────────────────
  if (view === 'subjects') return pageWrapper(
    <>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '1.75rem' }}>
        📂 {QUARTER_LABELS[quarter]} — Select Subject
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
        {getSubjectsForGrade(user?.grade_level ?? '').map(s => (
          <SkeuoFolder
            key={s}
            variant="subject"
            qLabel={`Q${quarter + 1} · ${user?.grade_level || 'Grade'}`}
            title={s}
            count={0}
            onClick={() => { setSubject(s); setView('weeks'); }}
          />
        ))}
      </div>
    </>
  );

  // ── WEEKS VIEW ────────────────────────────────────────────────────
  return pageWrapper(
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '.05em', textTransform: 'uppercase', margin: 0 }}>
            {subject} — {user?.grade_level}, Q{quarter + 1}
          </h2>
          <p style={{ fontSize: '.9rem', color: '#64748b', margin: '.2rem 0 0' }}>
            {loading ? 'Loading…' : `${dlls.length} DLL${dlls.length !== 1 ? 's' : ''} created`}
          </p>
        </div>
        <button onClick={openNewModal}
          style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', padding: '.75rem 1.25rem', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '.4rem', boxShadow: '0 4px 14px 0 rgba(37,99,235,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <span style={{ fontSize: '1.1rem' }}>+</span> Create Week DLL
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#a07040' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>⏳</div>
          Loading your DLLs…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
          {dlls.sort((a, b) => a.week_number - b.week_number).map(dll => (
            <div key={dll.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', position: 'relative', minHeight: '130px', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              onClick={() => router.push(`/teacher/dll/${dll.id}`)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(0,0,0,0.1)';
                e.currentTarget.style.border = '1px solid #3b82f6';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                e.currentTarget.style.border = '1px solid #e2e8f0';
              }}
            >
              <div style={{
                position: 'absolute', top: '-.75rem', left: '1.5rem',
                background: '#2563eb', color: '#fff',
                fontSize: '.75rem', fontWeight: 800,
                padding: '.25rem .75rem', borderRadius: '99px', letterSpacing: '.05em', boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
              }}>WEEK {dll.week_number}</div>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: '.2rem' }}>
                  {new Date(dll.week_of).toLocaleDateString('en-AE', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div style={{ fontSize: '.85rem', color: '#64748b', marginBottom: '1rem' }}>
                  {dll.section ? `Section: ${dll.section}` : dll.subject}
                </div>
                <StatusBadge status={dll.status} />
              </div>
            </div>
          ))}

          {/* Add new card */}
          <div
            onClick={openNewModal}
            style={{
              border: '2px dashed #cbd5e1', borderRadius: '16px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              cursor: 'pointer', color: '#94a3b8', background: '#f8fafc',
              minHeight: '130px', transition: 'all .2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2563eb'; (e.currentTarget as HTMLDivElement).style.color = '#2563eb'; (e.currentTarget as HTMLDivElement).style.background = '#eff6ff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#cbd5e1'; (e.currentTarget as HTMLDivElement).style.color = '#94a3b8'; (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'; }}
          >
            <span style={{ fontSize: '1.8rem' }}>➕</span>
            <span style={{ fontSize: '.82rem', fontWeight: 700 }}>New Week DLL</span>
          </div>
        </div>
      )}

      {!loading && dlls.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#a07040' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#7a5a3a', marginBottom: '.4rem' }}>No DLLs yet for {subject}</div>
          <div style={{ fontSize: '.85rem', marginBottom: '1.25rem' }}>Click <strong>+ Create Week DLL</strong> to get started.</div>
        </div>
      )}
    </>
  );
}
