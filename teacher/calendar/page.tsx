'use client';
import { useState, useEffect } from 'react';

type CalendarEvent = {
  id: number;
  title: string;
  event_date: string;
  category: string;
  description: string;
};

export default function TeacherCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate grid for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleString('default', { month: 'long' });

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

  const categoryStyles: any = {
    'MABDC': { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
    'SFXSAI': { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' },
    'General': { bg: '#f3f4f6', text: '#4b5563', border: '#e5e7eb' },
  };

  const currentMonthEvents = events.filter(e => {
    const d = new Date(e.event_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
            <span style={{ color: '#2563eb' }}>📅</span> School Calendar
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 600 }}>
            {monthName} {year}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Main Calendar Grid */}
        <div style={{ flex: '3', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 800, fontSize: '.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {day}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', gridAutoRows: '120px' }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }} />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const dayEvents = currentMonthEvents.filter(e => new Date(e.event_date).getDate() === date);
              const isToday = date === today.getDate();

              return (
                <div key={date} style={{ 
                  background: isToday ? '#eff6ff' : '#fff', 
                  borderRadius: '12px', 
                  border: isToday ? '2px solid #3b82f6' : '1px solid #e2e8f0', 
                  padding: '.75rem',
                  display: 'flex', flexDirection: 'column', gap: '.5rem',
                  boxShadow: isToday ? '0 4px 12px rgba(59,130,246,0.15)' : 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: dayEvents.length > 0 ? 'pointer' : 'default'
                }}
                onMouseEnter={e => {
                  if (dayEvents.length > 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={e => {
                  if (dayEvents.length > 0) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isToday ? '0 4px 12px rgba(59,130,246,0.15)' : 'none';
                  }
                }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isToday ? '#1d4ed8' : '#334155' }}>
                    {date}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem', overflow: 'hidden' }}>
                    {dayEvents.map(evt => {
                      const st = categoryStyles[evt.category] || categoryStyles['General'];
                      return (
                        <div key={evt.id} style={{ 
                          background: st.bg, color: st.text, border: `1px solid ${st.border}`, 
                          fontSize: '.7rem', fontWeight: 700, padding: '.15rem .4rem', 
                          borderRadius: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                        }}>
                          {evt.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span>🔔</span> Upcoming Events
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {currentMonthEvents.slice(0, 5).map(evt => {
                 const st = categoryStyles[evt.category] || categoryStyles['General'];
                 return (
                  <div key={evt.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${st.text}` }}>
                    <div style={{ fontSize: '.8rem', color: st.text, fontWeight: 800, textTransform: 'uppercase', marginBottom: '.25rem' }}>{evt.category}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '.25rem' }}>{evt.title}</div>
                    <div style={{ fontSize: '.8rem', color: '#64748b', fontWeight: 600 }}>{new Date(evt.event_date).toLocaleDateString()}</div>
                  </div>
                 );
              })}
              {currentMonthEvents.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: '.9rem', fontStyle: 'italic' }}>No upcoming events this month.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
