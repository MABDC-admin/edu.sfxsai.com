'use client';
import { useState, useEffect, ReactNode } from 'react';

interface PresentationViewProps {
  slides: ReactNode[];
  onClose?: () => void;
}

export default function PresentationView({ slides, onClose }: PresentationViewProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [animating, setAnimating] = useState(false);

  const total = slides.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') changeSlide(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') changeSlide(-1);
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [current]);

  const changeSlide = (step: number) => {
    if (animating) return;
    const next = current + step;
    if (next < 0 || next >= total) return;
    
    setDirection(step > 0 ? 'forward' : 'backward');
    setAnimating(true);
    
    setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 400); // Wait for exit animation
  };

  const goTo = (index: number) => {
    if (animating || index === current || index < 0 || index >= total) return;
    setDirection(index > current ? 'forward' : 'backward');
    setAnimating(true);
    
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-bio-dark overflow-hidden flex flex-col font-sans">
      
      {/* Progress Bar */}
      <div 
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[var(--green-light)] to-[var(--yellow)] z-50 transition-all duration-500 shadow-[0_0_8px_var(--green-light)]"
        style={{ width: `${((current + 1) / total) * 100}%` }}
      />

      {/* Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Slide Content container */}
      <div className="relative flex-1 w-full h-full">
        {slides.map((slide, index) => {
          // Determine visibility and animation classes
          let classes = "absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500 overflow-y-auto ";
          
          if (index === current && !animating) {
            classes += "opacity-100 translate-x-0 pointer-events-auto ";
          } else if (index === current && animating) {
             // Entering
             classes += direction === 'forward' ? "opacity-0 translate-x-16 pointer-events-none " : "opacity-0 -translate-x-16 pointer-events-none ";
          } else if (animating && index === (direction === 'forward' ? current - 1 : current + 1)) {
             // Exiting
             classes += direction === 'forward' ? "opacity-0 -translate-x-16 pointer-events-none " : "opacity-0 translate-x-16 pointer-events-none ";
          } else {
            classes += "opacity-0 translate-x-16 pointer-events-none hidden";
          }

          return (
            <div key={index} className={classes}>
              {slide}
            </div>
          );
        })}
      </div>

      {/* Nav Dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
        {slides.map((_, i) => (
          <div 
            key={i}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${i === current ? 'bg-[var(--green-light)] scale-150' : 'bg-white/25 hover:bg-white/50'}`}
          />
        ))}
      </div>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
        <button 
          onClick={() => changeSlide(-1)}
          disabled={current === 0}
          className="border-2 border-[var(--green-light)] text-[var(--green-light)] px-5 py-1.5 rounded-full text-sm font-semibold hover:bg-[var(--green-light)] hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--green-light)] disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        
        <span className="text-gray-400 text-sm min-w-[60px] text-center font-medium">
          {current + 1} / {total}
        </span>
        
        <button 
          onClick={() => changeSlide(1)}
          disabled={current === total - 1}
          className="border-2 border-[var(--green-light)] text-[var(--green-light)] px-5 py-1.5 rounded-full text-sm font-semibold hover:bg-[var(--green-light)] hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--green-light)] disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

    </div>
  );
}
