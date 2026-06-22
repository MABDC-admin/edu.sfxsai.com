'use client';
import { useState, useEffect } from 'react';

type CalendarEvent = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  category: 'MABDC' | 'SFXSAI';
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_date: '', category: 'MABDC' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addEvent() {
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      const data = await res.json();
      if (res.ok) {
        setEvents(prev => [...prev, data].sort((a,b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()));
        setShowAddEvent(false);
        setNewEvent({ title: '', description: '', event_date: '', category: 'MABDC' });
      } else alert(data.error);
    } catch (e) {
      console.error(e);
    }
  }

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eDate = new Date(e.event_date);
      return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year;
    });
  };

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date(new Date().setHours(0,0,0,0))).slice(0, 10);

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading School Calendar...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
          📅 School Calendar
        </h2>
        <button onClick={() => setShowAddEvent(true)} style={{ padding: '.6rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem', boxShadow: '0 2px 4px rgba(59,130,246,.3)' }}>
          + Add Event
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Calendar Grid Area */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a' }}>{monthNames[month]} {year}</h3>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button onClick={() => changeMonth(-1)} style={{ padding: '.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569' }}>← Prev</button>
              <button onClick={() => setCurrentDate(new Date())} style={{ padding: '.5rem 1rem', background: '#eff6ff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#1d4ed8' }}>Today</button>
              <button onClick={() => changeMonth(1)} style={{ padding: '.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569' }}>Next →</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ background: '#f8fafc', padding: '1rem', textAlign: 'center', fontWeight: 700, fontSize: '.85rem', color: '#64748b', textTransform: 'uppercase' }}>{d}</div>
            ))}
            
            {blanks.map(b => <div key={`blank-${b}`} style={{ background: '#fff', minHeight: '120px' }} />)}
            
            {days.map(d => {
              const dayEvents = getEventsForDay(d);
              const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              
              return (
                <div key={d} style={{ background: isToday ? '#eff6ff' : '#fff', minHeight: '120px', padding: '.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '.9rem', color: isToday ? '#1d4ed8' : '#334155', marginBottom: '.5rem', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: isToday ? '#bfdbfe' : 'transparent' }}>
                    {d}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                    {dayEvents.map(e => (
                      <div key={e.id} style={{ fontSize: '.75rem', padding: '.25rem .5rem', borderRadius: '4px', background: e.category === 'MABDC' ? '#f0fdf4' : '#fff7ed', color: e.category === 'MABDC' ? '#166534' : '#9a3412', borderLeft: `3px solid ${e.category === 'MABDC' ? '#22c55e' : '#f97316'}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.title}>
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar / Upcoming Events */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,.05)', border: '1px solid #e2e8f0', alignSelf: 'start' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', marginBottom: '1.5rem' }}>Upcoming Events</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingEvents.map(e => (
              <div key={e.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '4px', borderRadius: '4px', background: e.category === 'MABDC' ? '#22c55e' : '#f97316', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#1e293b' }}>{e.title}</div>
                  <div style={{ fontSize: '.8rem', color: '#64748b', marginTop: '.2rem' }}>{new Date(e.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  {e.description && <div style={{ fontSize: '.85rem', color: '#475569', marginTop: '.5rem', lineHeight: 1.4 }}>{e.description}</div>}
                  <div style={{ marginTop: '.5rem', display: 'inline-block', padding: '.15rem .5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '.7rem', fontWeight: 700, color: '#64748b' }}>{e.category}</div>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && <div style={{ color: '#94a3b8', fontSize: '.9rem', textAlign: 'center', padding: '2rem 0' }}>No upcoming events scheduled.</div>}
          </div>
        </div>

      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', marginBottom: '2rem' }}>📅 Add New Event</h3>
            
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '.9rem', color: '#334155', marginBottom: '.4rem' }}>Event Title</label>
                <input style={{ width: '100%', padding: '.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '.95rem' }} value={newEvent.title} onChange={e => setNewEvent(f => ({...f, title: e.target.value}))} placeholder="e.g. Science Fair" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '.9rem', color: '#334155', marginBottom: '.4rem' }}>Date</label>
                  <input type="date" style={{ width: '100%', padding: '.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '.95rem' }} value={newEvent.event_date} onChange={e => setNewEvent(f => ({...f, event_date: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '.9rem', color: '#334155', marginBottom: '.4rem' }}>Category</label>
                  <select style={{ width: '100%', padding: '.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '.95rem', background: '#fff' }} value={newEvent.category} onChange={e => setNewEvent(f => ({...f, category: e.target.value as 'MABDC'|'SFXSAI'}))}>
                    <option value="MABDC">MABDC</option>
                    <option value="SFXSAI">SFXSAI</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '.9rem', color: '#334155', marginBottom: '.4rem' }}>Description (Optional)</label>
                <textarea style={{ width: '100%', padding: '.8rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '.95rem', minHeight: '80px', resize: 'vertical' }} value={newEvent.description} onChange={e => setNewEvent(f => ({...f, description: e.target.value}))} placeholder="Event details..." />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button onClick={addEvent} style={{ flex: 1, padding: '.8rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 4px rgba(59,130,246,.3)' }}>Save Event</button>
              <button onClick={() => setShowAddEvent(false)} style={{ flex: 1, padding: '.8rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
