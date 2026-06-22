'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('Teacher');

  useEffect(() => {
    // Force light body styling for Teacher Dashboard
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.name) setUserName(data.name);
      })
      .catch(console.error);

    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const navItems = [
    { name: 'Dashboard & DLLs', href: '/teacher', icon: '📚' },
    { name: 'School Calendar', href: '/teacher/calendar', icon: '📅' },
    { name: 'Learner Support', href: '/teacher/support', icon: '🤝' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Top Navigation */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <img src="/logo.png" alt="SFXSAI" style={{ width: '40px', height: '40px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', letterSpacing: '-0.02em' }}>SFXSAI <span style={{ color: '#2563eb' }}>Teacher</span></span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link href={item.href} key={item.name} style={{ textDecoration: 'none' }}>
                    <div style={{ 
                      padding: '.5rem 1rem', 
                      borderRadius: '8px', 
                      fontWeight: isActive ? 700 : 600, 
                      color: isActive ? '#2563eb' : '#64748b', 
                      background: isActive ? '#eff6ff' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: '.5rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = '#f1f5f9'; }}
                    onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{item.icon}</span> {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.4rem .8rem', background: '#f8fafc', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '30px', height: '30px', background: '#2563eb', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.9rem' }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 600, fontSize: '.9rem', color: '#334155', paddingRight: '.5rem' }}>{userName}</span>
            </div>
            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '.5rem 1rem', borderRadius: '8px', fontWeight: 600, color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
              Log Out
            </button>
          </div>

        </div>
      </nav>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        {children}
      </main>
    </div>
  );
}
