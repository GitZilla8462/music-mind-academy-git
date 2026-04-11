// File: presentation-mode/PresentationMode.jsx
// Full-screen presentation viewer for Music Journalist capstone
// Loads slides from SlideBuilder localStorage, shows speaker notes from Research Board

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { getHighlightsForSlide } from '../research-board/researchBoardStorage';
import { saveStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import SlideRenderer from '../press-kit-designer/layouts/SlideRenderer';
import { renderSlideObject, CANVAS_W, CANVAS_H } from '../press-kit-designer/components/SlideCanvas';
import { getPalette } from '../press-kit-designer/palettes';

const PRESS_KIT_STORAGE_KEY = 'mma-press-kit-data';
const SLIDE_STORAGE_KEY = 'mma-slide-builder-data';
const ACTIVITY_ID = 'mj-presentation';
const LESSON_ID = 'mj-lesson5';

const PresentationMode = ({ onComplete, viewMode = false, isSessionMode = false }) => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [finished, setFinished] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [isNewFormat, setIsNewFormat] = useState(false);
  const [pressKitGenre, setPressKitGenre] = useState('');
  const timerRef = useRef(null);

  // Load slide data on mount — prefer new press kit format, fall back to old
  useEffect(() => {
    try {
      // Try new press kit format first
      const pkRaw = localStorage.getItem(PRESS_KIT_STORAGE_KEY);
      if (pkRaw) {
        const parsed = JSON.parse(pkRaw);
        if (parsed.version === 2 && parsed.slides?.length > 0) {
          setSlides(parsed.slides);
          setIsNewFormat(true);
          // Load genre for SlideRenderer
          try {
            const adRaw = localStorage.getItem('mma-artist-discovery');
            if (adRaw) {
              const ad = JSON.parse(adRaw);
              if (ad.selected) {
                // Genre is in slide 1 fields or we read from artist data
                setPressKitGenre(parsed.slides[0]?.fields?.genre?.split(' / ')[0] || '');
              }
            }
          } catch { /* ignore */ }
          return;
        }
      }
      // Fall back to old slide builder format
      const raw = localStorage.getItem(SLIDE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.slides && parsed.slides.length > 0) {
          setSlides(parsed.slides);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Timer
  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [finished]);

  // Keyboard navigation
  const goNext = useCallback(() => {
    if (finished) return;
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((c) => c + 1);
      setFadeKey((k) => k + 1);
    } else {
      // Last slide — mark complete
      setFinished(true);
      clearInterval(timerRef.current);

      const auth = getClassAuthInfo();
      saveStudentWork(ACTIVITY_ID, {
        title: 'Presentation Complete',
        emoji: '\uD83C\uDFAC',
        viewRoute: null,
        category: 'Music Journalist',
        type: 'presentation',
        lessonId: LESSON_ID,
        data: {
          slideCount: slides.length,
          durationSeconds: elapsedSeconds,
          completedAt: new Date().toISOString(),
        },
      }, null, auth);
    }
  }, [currentSlide, slides.length, finished, elapsedSeconds]);

  const goPrev = useCallback(() => {
    if (finished) return;
    if (currentSlide > 0) {
      setCurrentSlide((c) => c - 1);
      setFadeKey((k) => k + 1);
    }
  }, [currentSlide, finished]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        setShowExitConfirm(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  // Format timer
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // No slides loaded
  if (slides.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0d1520] text-white">
        <BookOpen className="w-16 h-16 text-white/30 mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Slides Found</h1>
        <p className="text-white/50 mb-6">Build your slides in the Slide Builder first.</p>
        {onComplete && (
          <button
            onClick={() => onComplete(ACTIVITY_ID)}
            className="px-6 py-3 bg-[#f0b429] text-[#1a2744] rounded-xl font-bold text-lg hover:bg-[#f0b429]/90 active:scale-[0.98] transition-all"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  // Presentation complete screen
  if (finished) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0d1520] text-white">
        <div className="text-6xl mb-4">&#127881;</div>
        <h1 className="text-3xl font-bold mb-2">Presentation Complete!</h1>
        <p className="text-white/60 mb-1">
          {slides.length} slides in {formatTime(elapsedSeconds)}
        </p>
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              setFinished(false);
              setCurrentSlide(0);
              setElapsedSeconds(0);
              setFadeKey((k) => k + 1);
            }}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 active:scale-[0.98] transition-all"
          >
            Present Again
          </button>
          {onComplete && (
            <button
              onClick={() => onComplete(ACTIVITY_ID)}
              className="px-6 py-3 bg-[#f0b429] text-[#1a2744] rounded-xl font-bold text-lg hover:bg-[#f0b429]/90 active:scale-[0.98] transition-all"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];
  const slideNumber = currentSlide + 1;
  const highlights = getHighlightsForSlide(slideNumber);
  const filledBullets = (slide.bullets || []).filter((b) => b.trim().length > 0);

  return (
    <div className="h-screen flex flex-col bg-[#0d1520] text-white select-none relative">
      {/* Exit confirmation overlay */}
      {showExitConfirm && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-[#1a2744] rounded-2xl border border-white/20 p-8 max-w-sm text-center shadow-2xl">
            <h2 className="text-xl font-bold mb-3">Exit presentation?</h2>
            <p className="text-white/60 mb-6 text-sm">Your progress will not be saved.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-5 py-3 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 active:scale-[0.98] transition-all min-w-[100px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  if (onComplete) onComplete(ACTIVITY_ID);
                }}
                className="px-5 py-3 bg-red-600 rounded-xl font-semibold hover:bg-red-700 active:scale-[0.98] transition-all min-w-[100px]"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-[#111c33] border-b border-white/10">
        {/* Exit button */}
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 active:scale-[0.98] transition-all"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-medium">Exit</span>
        </button>

        {/* Slide counter */}
        <span className="text-white/50 text-sm font-medium">
          Slide {slideNumber} of {slides.length}
        </span>

        {/* Timer */}
        <div className="flex items-center gap-1.5 text-white/50">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono">{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Main slide area */}
      <div className="flex-1 flex items-center justify-center px-8 py-6 overflow-hidden">
        <div
          key={fadeKey}
          className="w-full max-w-4xl animate-fadeIn"
          style={{ animation: 'fadeIn 0.3s ease-in-out' }}
        >
          {isNewFormat ? (
            /* New Press Kit Designer format — free-form canvas objects */
            <div className="w-full relative overflow-hidden rounded-lg" style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}`, background: getPalette(slide.palette || 'genre', pressKitGenre).bg }}>
              {/* Background accent */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 30% 50%, ${getPalette(slide.palette || 'genre', pressKitGenre).accent}22 0%, transparent 70%)` }} />
              {/* Render all objects at presentation scale */}
              {(slide.objects || []).map(obj => {
                const containerEl = document.querySelector('.max-w-4xl');
                const presentScale = containerEl ? containerEl.offsetWidth / CANVAS_W : 1;
                return (
                  <div
                    key={obj.id}
                    style={{
                      position: 'absolute',
                      left: obj.x * presentScale,
                      top: obj.y * presentScale,
                      transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
                    }}
                  >
                    {renderSlideObject(obj, presentScale)}
                  </div>
                );
              })}
              {/* Fallback: if no objects, use SlideRenderer */}
              {(!slide.objects || slide.objects.length === 0) && (
                <SlideRenderer
                  slideNumber={slideNumber}
                  layout={slide.layout}
                  paletteId={slide.palette}
                  genre={pressKitGenre}
                  fields={slide.fields || {}}
                  image={slide.image}
                />
              )}
            </div>
          ) : (
            /* Old SlideBuilder format — headline + bullets */
            <>
              {slide.headline && (
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center leading-tight">
                  {slide.headline}
                </h1>
              )}

              <div className="flex gap-8 items-start">
                <div className={`flex-1 ${slide.imageUrl ? '' : 'max-w-3xl mx-auto'}`}>
                  {filledBullets.length > 0 && (
                    <ul className="space-y-4">
                      {filledBullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3 text-xl md:text-2xl text-white/90 leading-relaxed">
                          <span className="text-[#f0b429] mt-1.5 flex-shrink-0">&#x2022;</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {slide.imageUrl && (
                  <div className="flex-shrink-0 w-80">
                    <img
                      src={slide.imageUrl}
                      alt=""
                      className="w-full rounded-xl shadow-lg object-cover max-h-72"
                    />
                    {slide.imageAttribution && (
                      <p className="text-white/30 text-xs mt-1.5 text-center truncate">
                        {slide.imageAttribution}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <button
          onClick={goPrev}
          disabled={currentSlide === 0}
          className={`p-3 rounded-full transition-all ${
            currentSlide === 0
              ? 'text-white/10 cursor-not-allowed'
              : 'text-white/50 hover:text-white hover:bg-white/10 active:scale-[0.95]'
          }`}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <button
          onClick={goNext}
          className="p-3 rounded-full text-white/50 hover:text-white hover:bg-white/10 active:scale-[0.95] transition-all"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Speaker notes panel (collapsible) */}
      <div className={`flex-shrink-0 bg-[#111c33] border-t border-white/10 transition-all ${notesOpen ? 'max-h-48' : 'max-h-10'}`}>
        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="w-full flex items-center justify-between px-4 py-2 text-white/50 hover:text-white/70 transition-colors"
        >
          <span className="text-xs font-medium uppercase tracking-wide flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Speaker Notes ({highlights.length})
          </span>
          {notesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {notesOpen && (
          <div className="px-4 pb-3 overflow-y-auto max-h-36">
            {highlights.length === 0 ? (
              <p className="text-white/30 text-xs italic">No research highlights tagged for this slide.</p>
            ) : (
              <ul className="space-y-1.5">
                {highlights.map((hl) => (
                  <li key={hl.id} className="text-xs text-white/70 flex items-start gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: hl.color || '#f0b429' }}
                    />
                    <span>
                      {hl.text}
                      {hl.sourceName && (
                        <span className="text-white/30 ml-1">({hl.sourceName})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PresentationMode;
