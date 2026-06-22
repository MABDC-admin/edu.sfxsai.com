'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Force reset body styles
    document.body.style.backgroundColor = '#fff';
    document.body.style.margin = '0';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      router.push(data.role === 'principal' ? '/principal' : '/teacher');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Left Side - Hero / Brand */}
      <div style={{ flex: '1.2', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '4rem', color: '#fff', justifyContent: 'center' }}>
        {/* Abstract Background Shapes */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(2fbbf24,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>
        
        {/* Floating Glass Panels */}
        <div style={{ position: 'absolute', top: '15%', right: '15%', width: '150px', height: '200px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(15deg)' }}></div>
        <div style={{ position: 'absolute', bottom: '25%', left: '15%', width: '250px', height: '150px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(-10deg)' }}></div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.1)', padding: '.75rem 1.5rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎓</span>
            <span style={{ fontWeight: 700, letterSpacing: '.1em', fontSize: '.9rem' }}>SFXSAI PORTAL</span>
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Empowering <br /> <span style={{ color: '#fbbf24' }}>Education.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '480px' }}>
            Welcome to the St. Francis Xavier School of Arts and Innovation unified digital campus.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '.5rem' }}>Welcome back</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Please enter your credentials to continue.</p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', color: '#dc2626', fontSize: '.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.9rem', fontWeight: 700, color: '#334155', marginBottom: '.5rem' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '1.1rem 1.25rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1.05rem', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc', color: '#0f172a' }}
                placeholder="teacher@sfxsai.edu.ph"
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                required
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                <label style={{ fontSize: '.9rem', fontWeight: 700, color: '#334155' }}>Password</label>
                <a href="#" style={{ fontSize: '.85rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '1.1rem 1.25rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1.05rem', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc', color: '#0f172a' }}
                placeholder="••••••••"
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              style={{ width: '100%', padding: '1.1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '.5rem', transition: 'background 0.2s, transform 0.1s', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
              onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '.85rem', color: '#64748b', fontWeight: 600, marginBottom: '.75rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Demo Accounts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f1f5f9', padding: '.75rem 1rem', borderRadius: '8px', fontSize: '.9rem' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>Principal</span>
                <span style={{ color: '#0f172a', fontFamily: 'monospace' }}>principal@deped.edu.ph</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f1f5f9', padding: '.75rem 1rem', borderRadius: '8px', fontSize: '.9rem' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>Teacher</span>
                <span style={{ color: '#0f172a', fontFamily: 'monospace' }}>maria@deped.edu.ph</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '.8rem', color: '#94a3b8', marginTop: '.25rem' }}>
                Password: <code style={{ color: '#64748b' }}>deped1234</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
