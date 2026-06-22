'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; school: string } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.error) { router.push('/'); return; }
      setUser(d);
    });
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const navItems = [
    {
      title: 'School Calendar',
      path: '/principal/calendar',
      subnav: ['MABDC', 'SFXSAI']
    },
    {
      title: 'Approval Center',
      path: '/principal/approvals',
      subnav: ['DLL approvals', 'Examination approvals', 'Grade approvals', 'Academic event approvals', 'Curriculum revisions', 'Intervention plans']
    },
    {
      title: 'Department Management',
      path: '/principal/departments',
      subnav: ['Department Heads', 'Subject Coordinators', 'Faculty Assignment', 'Department Performance', 'Department Development Plans', 'Department Meetings']
    },
    {
      title: 'Academic Excellence',
      path: '/principal/excellence',
      subnav: ['Honor Students', 'Academic Awards', 'Scholarship Monitoring', 'Competition Participants', 'Research Competitions', 'Talent Development']
    },
    {
      title: 'Learner Support',
      path: '/principal/support',
      subnav: []
    },
    {
      title: 'Learner Portfolios',
      path: '/principal/portfolios',
      subnav: ['Academic Portfolio', 'Achievement Records', 'Certificates', 'Competitions', 'Research Outputs']
    },
    {
      title: 'School Forms',
      path: '/principal/school-forms',
      subnav: []
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{ background: '#003087', color: '#fff', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* Logo / Brand */}
            <Link href="/principal" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🎓</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>Principal Dashboard</div>
                <div style={{ fontSize: '.72rem', opacity: .8 }}>{user?.school || 'Loading...'}</div>
              </div>
            </Link>

            {/* Top Navigation */}
            <nav style={{ display: 'flex', gap: '.5rem', alignItems: 'center', height: '100%' }}>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                return (
                  <div 
                    key={item.title} 
                    style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={() => setActiveDropdown(item.title)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link 
                      href={item.path}
                      style={{
                        padding: '.5rem .8rem',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.8)',
                        background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '.85rem',
                        fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.3rem'
                      }}
                    >
                      {item.title}
                      {item.subnav.length > 0 && <span style={{ fontSize: '.6rem', opacity: .6 }}>▼</span>}
                    </Link>

                    {/* Dropdown Menu */}
                    {item.subnav.length > 0 && activeDropdown === item.title && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        background: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        padding: '.5rem',
                        minWidth: '220px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '.25rem'
                      }}>
                        {item.subnav.map(sub => (
                          <Link 
                            key={sub} 
                            href={`${item.path}?view=${encodeURIComponent(sub)}`}
                            style={{
                              padding: '.5rem .75rem',
                              color: '#334155',
                              textDecoration: 'none',
                              fontSize: '.85rem',
                              borderRadius: '4px',
                              display: 'block',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '.85rem', opacity: .9, fontWeight: 500 }}>🏫 {user?.name}</span>
            <button onClick={handleLogout} style={{ fontSize: '.8rem', padding: '.4rem 1rem', background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
