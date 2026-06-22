'use client';
import { useState } from 'react';

export default function TeacherSupportPage() {
  const [formData, setFormData] = useState({
    student_name: '',
    grade_level: 'Grade 7',
    support_type: 'Counseling',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ ...formData, student_name: '', notes: '' });
      } else {
        alert('Failed to submit ticket');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
            <span style={{ color: '#818cf8' }}>🤝</span> Learner Support
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: 600 }}>
            Request intervention or counseling for your students.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        
        {/* Form Container */}
        <div style={{ flex: '1.5', background: '#fff', borderRadius: '24px', padding: '3rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          
          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '.25rem' }}>Ticket Submitted Successfully!</h4>
                <p style={{ fontSize: '.9rem' }}>The Principal and Guidance Counselor have been notified.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.9rem', fontWeight: 700, color: '#334155', marginBottom: '.5rem' }}>Student Name</label>
                <input 
                  type="text" required
                  value={formData.student_name}
                  onChange={e => setFormData(f => ({ ...f, student_name: e.target.value }))}
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc' }}
                  onFocus={e => e.target.style.borderColor = '#818cf8'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.9rem', fontWeight: 700, color: '#334155', marginBottom: '.5rem' }}>Grade Level</label>
                <select 
                  value={formData.grade_level}
                  onChange={e => setFormData(f => ({ ...f, grade_level: e.target.value }))}
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc', appearance: 'none', cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#818cf8'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option>Grade 7</option>
                  <option>Grade 8</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.9rem', fontWeight: 700, color: '#334155', marginBottom: '.5rem' }}>Support Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {['Counseling', 'Intervention Plan', 'General Support'].map(type => (
                  <div key={type} 
                    onClick={() => setFormData(f => ({ ...f, support_type: type }))}
                    style={{ 
                      padding: '1rem', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '.95rem', transition: 'all 0.2s',
                      background: formData.support_type === type ? '#eef2ff' : '#f8fafc',
                      color: formData.support_type === type ? '#4f46e5' : '#64748b',
                      border: formData.support_type === type ? '2px solid #818cf8' : '2px solid #e2e8f0'
                    }}>
                    {type}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.9rem', fontWeight: 700, color: '#334155', marginBottom: '.5rem' }}>Observation / Notes</label>
              <textarea 
                required
                value={formData.notes}
                onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc', minHeight: '150px', resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = '#818cf8'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                placeholder="Describe the student's situation or academic challenges here..."
              />
            </div>

            <button 
              type="submit" disabled={submitting}
              style={{ padding: '1.2rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1.1rem', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 14px 0 rgba(79,70,229,0.3)', marginTop: '1rem' }}
              onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
              onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
            >
              {submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
            </button>
          </form>
        </div>

        {/* Info Sidebar */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #c7d2fe' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3730a3', marginBottom: '1rem', lineHeight: 1.2 }}>How the support process works</h3>
            <p style={{ color: '#4338ca', fontSize: '.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              When you submit a ticket, it immediately appears on the Principal's Support Dashboard under the "Open" column. The guidance counselor will review it and schedule a session if necessary.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>🛋️</span>
                <span style={{ fontWeight: 700, color: '#3730a3', fontSize: '.9rem' }}>Counseling for emotional support</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>📈</span>
                <span style={{ fontWeight: 700, color: '#3730a3', fontSize: '.9rem' }}>Intervention for academic gaps</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
