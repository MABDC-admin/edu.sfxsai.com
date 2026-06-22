'use client';
import { useState, useEffect } from 'react';
import PresentationView from '@/components/PresentationView';

type PortfolioItem = {
  id: number;
  student_name: string;
  grade_level: string;
  item_type: string;
  title: string;
  description: string;
  date_added: string;
};

export default function LearnerPortfoliosPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    // Inject dark mode for this page specifically
    document.body.style.backgroundColor = '#020617'; // Very dark navy/black
    return () => {
      document.body.style.backgroundColor = ''; // Revert on unmount
    };
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolios');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const categories = ['All', 'Certificate', 'Research Output', 'Achievement Record'];
  const filteredItems = filter === 'All' ? items : items.filter(i => i.item_type === filter);

  const getIconForType = (type: string) => {
    if (type === 'Certificate') return '📜';
    if (type === 'Research Output') return '🔬';
    return '🏆';
  };

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Loading Portfolio Gallery...</div>;

  // Build the slides for the PresentationView
  const renderSlides = (item: PortfolioItem) => [
    // Slide 1: Title
    <div key="1" className="text-center w-full max-w-4xl">
      <div className="text-[12px] tracking-[3px] uppercase text-[var(--green-light)] mb-4 animate-[fadeUp_0.8s_ease_both]">Learner Portfolio Showcase</div>
      <h1 className="text-5xl md:text-7xl font-black mb-6 bg-bio-gradient animate-[fadeUp_1s_ease_both]">
        {item.title}
      </h1>
      <h2 className="text-xl md:text-2xl text-[var(--gray)] italic animate-[fadeUp_1s_0.3s_ease_both]">
        A presentation of excellence by {item.student_name}
      </h2>
      <div className="mt-12 flex gap-10 justify-center flex-wrap animate-[fadeUp_1s_0.6s_ease_both]">
        <div className="text-center">
          <div className="text-4xl font-black text-[var(--green-light)]">{item.grade_level}</div>
          <div className="text-xs text-[var(--gray)] tracking-widest uppercase mt-1">Grade Level</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-black text-[var(--green-light)]">{getIconForType(item.item_type)}</div>
          <div className="text-xs text-[var(--gray)] tracking-widest uppercase mt-1">Category</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-black text-[var(--green-light)]">{new Date(item.date_added).getFullYear()}</div>
          <div className="text-xs text-[var(--gray)] tracking-widest uppercase mt-1">Year</div>
        </div>
      </div>
    </div>,

    // Slide 2: Details
    <div key="2" className="w-full max-w-5xl">
      <div className="text-[11px] tracking-[3px] uppercase text-[var(--green-light)] mb-2">Project Overview</div>
      <h2 className="text-4xl md:text-5xl font-black bg-bio-gradient mb-8">Executive Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card">
          <div className="text-3xl mb-4">📝</div>
          <h3 className="text-lg font-bold text-[var(--green-pale)] mb-2">Description</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
        </div>
        <div className="glass-card">
          <div className="text-3xl mb-4">🏆</div>
          <h3 className="text-lg font-bold text-[var(--green-pale)] mb-2">Achievement Impact</h3>
          <p className="text-sm text-gray-300 leading-relaxed">This {item.item_type.toLowerCase()} demonstrates exceptional dedication to academic excellence and reflects highly on the core values of SFXSAI. It has been officially archived in the permanent learner record.</p>
        </div>
      </div>
    </div>,

    // Slide 3: Evidence/Media
    <div key="3" className="w-full max-w-4xl text-center">
      <div className="text-[11px] tracking-[3px] uppercase text-[var(--green-light)] mb-2">Evidence & Artifacts</div>
      <h2 className="text-4xl md:text-5xl font-black bg-bio-gradient mb-12">Supporting Documents</h2>
      
      <div className="glass-card max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[300px] border-dashed border-2 border-white/20">
        <div className="text-6xl mb-6">📎</div>
        <h3 className="text-xl font-bold text-[var(--green-pale)] mb-4">Attached Evidence File</h3>
        <span className="bio-pill bio-pill-blue mb-4">Authenticated Record</span>
        <button className="mt-4 border-2 border-[var(--green-light)] text-[var(--green-light)] px-6 py-2 rounded-full text-sm font-semibold hover:bg-[var(--green-light)] hover:text-black transition-all">
          View Original Document
        </button>
      </div>
    </div>
  ];

  return (
    <div style={{ color: '#f8fafc' }}>
      
      {/* Presentation Overlay */}
      {selectedItem && (
        <PresentationView 
          slides={renderSlides(selectedItem)} 
          onClose={() => setSelectedItem(null)} 
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ color: '#fbbf24' }}>🎨</span> Learner Portfolios
        </h2>
        <button style={{ padding: '.6rem 1.25rem', background: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '.95rem', boxShadow: '0 4px 14px 0 rgba(251,191,36,0.2)' }}>
          + Add Entry
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(51,65,85,0.5)', paddingBottom: '1rem' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setFilter(cat)}
            style={{ 
              padding: '.6rem 1.5rem', 
              background: filter === cat ? 'rgba(251,191,36,0.1)' : 'transparent', 
              color: filter === cat ? '#fbbf24' : '#94a3b8', 
              border: filter === cat ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent', 
              borderRadius: '9999px', 
              fontWeight: 700, 
              cursor: 'pointer', 
              transition: 'all 0.2s',
              fontSize: '.9rem'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {filteredItems.map((item, i) => (
          <div key={item.id} 
          onClick={() => setSelectedItem(item)}
          style={{ 
            background: 'linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)', 
            borderRadius: '20px', 
            padding: '2rem', 
            border: '1px solid rgba(51,65,85,0.8)', 
            position: 'relative', 
            overflow: 'hidden',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.7)';
            e.currentTarget.style.border = '1px solid rgba(251,191,36,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)';
            e.currentTarget.style.border = '1px solid rgba(51,65,85,0.8)';
          }}
          >
            {/* Subtle glow effect top right */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(251,191,36,0.05)', filter: 'blur(40px)', borderRadius: '50%' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{getIconForType(item.item_type)}</div>
              <div style={{ fontSize: '.75rem', fontWeight: 700, padding: '.3rem .8rem', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', borderRadius: '9999px', border: '1px solid rgba(251,191,36,0.2)' }}>
                {item.item_type}
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '.5rem', lineHeight: 1.3 }}>{item.title}</h3>
            <p style={{ fontSize: '.9rem', color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.description}
            </p>

            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(51,65,85,0.5)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#cbd5e1' }}>{item.student_name}</div>
                <div style={{ fontSize: '.75rem', color: '#64748b' }}>{item.grade_level}</div>
              </div>
              <div style={{ fontSize: '.75rem', color: '#475569', fontWeight: 600 }}>
                {new Date(item.date_added).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'rgba(30,41,59,0.3)', borderRadius: '20px', border: '1px dashed rgba(100,116,139,0.5)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <div style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 600 }}>No portfolio entries found in this category.</div>
          </div>
        )}
      </div>
    </div>
  );
}

