'use client';
import { useState, useEffect } from 'react';

type SupportTicket = {
  id: number;
  student_name: string;
  grade_level: string;
  support_type: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  notes: string;
  created_at: string;
};

export default function LearnerSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inject pastel background for this page
    document.body.style.backgroundColor = '#fdfbf7'; // Warm white
    return () => {
      document.body.style.backgroundColor = ''; // Revert
    };
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/support');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, newStatus: string) {
    try {
      // Optimistic update
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
      
      const res = await fetch('/api/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (!res.ok) {
        alert('Failed to update status');
        loadData();
      }
    } catch (e) {
      console.error(e);
      loadData();
    }
  }

  const columns: ('Open' | 'In Progress' | 'Resolved')[] = ['Open', 'In Progress', 'Resolved'];
  
  const columnStyles = {
    'Open': { bg: '#fff0f0', border: '#ffcaca', header: '#b91c1c' },
    'In Progress': { bg: '#f0f9ff', border: '#bae6fd', header: '#0369a1' },
    'Resolved': { bg: '#f0fdf4', border: '#bbf7d0', header: '#15803d' }
  };

  const getIconForType = (type: string) => {
    if (type === 'Counseling') return '🛋️';
    if (type === 'Intervention Plan') return '📈';
    return '💬';
  };

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading Support Tickets...</div>;

  return (
    <div style={{ color: '#334155' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#334155', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ color: '#818cf8' }}>🤝</span> Learner Support
        </h2>
        <button style={{ padding: '.7rem 1.5rem', background: '#818cf8', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', boxShadow: '0 4px 14px 0 rgba(129,140,248,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          + New Support Ticket
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {columns.map(status => {
          const colTickets = tickets.filter(t => t.status === status);
          const style = columnStyles[status];
          
          return (
            <div key={status} style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', border: `1px solid ${style.border}`, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: `2px dashed ${style.border}` }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: style.header, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {status}
                </h3>
                <span style={{ background: style.bg, color: style.header, padding: '.2rem .6rem', borderRadius: '9999px', fontSize: '.8rem', fontWeight: 800 }}>
                  {colTickets.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {colTickets.map(ticket => (
                  <div key={ticket.id} style={{ background: style.bg, borderRadius: '16px', padding: '1.25rem', border: `1px solid ${style.border}`, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'grab' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 15px -3px ${style.border}`; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem' }}>
                      <div style={{ fontSize: '1.2rem', padding: '.4rem', background: '#fff', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {getIconForType(ticket.support_type)}
                      </div>
                      <select 
                        value={ticket.status} 
                        onChange={(e) => updateStatus(ticket.id, e.target.value)}
                        style={{ appearance: 'none', background: '#fff', border: `1px solid ${style.border}`, borderRadius: '8px', padding: '.3rem .6rem', fontSize: '.75rem', fontWeight: 700, color: style.header, cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="Open">Move to Open</option>
                        <option value="In Progress">Move to In Progress</option>
                        <option value="Resolved">Move to Resolved</option>
                      </select>
                    </div>
                    
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '.2rem' }}>{ticket.student_name}</h4>
                    <div style={{ fontSize: '.8rem', color: '#64748b', fontWeight: 600, marginBottom: '.8rem' }}>{ticket.grade_level} • {ticket.support_type}</div>
                    
                    <p style={{ fontSize: '.85rem', color: '#475569', lineHeight: 1.5, background: 'rgba(255,255,255,0.5)', padding: '.75rem', borderRadius: '8px' }}>
                      {ticket.notes}
                    </p>
                    
                    <div style={{ marginTop: '1rem', fontSize: '.7rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>
                      Opened: {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                {colTickets.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '.9rem', fontWeight: 600, border: `2px dashed ${style.border}`, borderRadius: '16px' }}>
                    No tickets in this column.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
