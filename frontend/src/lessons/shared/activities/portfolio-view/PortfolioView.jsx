// File: portfolio-view/PortfolioView.jsx
// Unit 3 portfolio artifact viewer for Music Journalist presentations.
// Shows the complete portfolio: slides, research summary, reflections, feedback, game scores.

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Highlighter,
  MessageSquare,
  Trophy,
  Presentation,
  Star,
  ChevronDown,
  ChevronUp,
  BookOpen,
  X,
} from 'lucide-react';
import { saveStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import { getResearchBoard } from '../research-board/researchBoardStorage';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLIDE_STORAGE_KEY = 'mma-slide-builder-data';
const TOPIC_KEY = 'mma-research-topic';
const PEER_FEEDBACK_KEY = 'mma-peer-feedback-received';
const ACTIVITY_ID = 'mj-portfolio';
const LESSON_ID = 'mj-lesson5';

const REFLECTION_KEYS = [
  { key: 'music-journalist-lesson1-reflection', label: 'Lesson 1: News & Sources' },
  { key: 'music-journalist-lesson2-reflection', label: 'Lesson 2: Research & Analysis' },
  { key: 'music-journalist-lesson3-reflection', label: 'Lesson 3: Building Your Story' },
];

const GAME_SCORE_KEYS = [
  { key: 'music-journalist-lesson1-fact-opinion-score', label: 'Fact vs. Opinion' },
  { key: 'music-journalist-lesson2-source-eval-score', label: 'Source Evaluation' },
  { key: 'music-journalist-lesson3-headline-score', label: 'Headline Challenge' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function countArticlesRead() {
  // Count unique articles the student has opened (tracked per-article in localStorage)
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('mma-article-read-')) {
      count++;
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} className="text-[#f0b429]" />
      <h2 className="text-white font-bold text-sm">{title}</h2>
      {count != null && (
        <span className="text-white/30 text-xs ml-1">({count})</span>
      )}
    </div>
  );
}

function SlideThumbCard({ slide, index, onClick }) {
  const hasContent = (slide.headline || '').trim().length > 0 ||
    slide.bullets?.some(b => (b || '').trim().length > 0);

  return (
    <button
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-[#f0b429]/40 transition-colors text-left group"
    >
      {/* Image or placeholder */}
      <div className="aspect-[16/9] bg-[#111c33] relative overflow-hidden">
        {slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText size={24} className="text-white/10" />
          </div>
        )}
        <div className="absolute top-1.5 left-1.5 bg-black/60 text-[#f0b429] text-[10px] font-bold px-1.5 py-0.5 rounded">
          Slide {index + 1}
        </div>
      </div>

      {/* Text preview */}
      <div className="p-2.5">
        <p className="text-white/80 text-xs font-semibold truncate">
          {slide.headline || 'Untitled'}
        </p>
        {hasContent && slide.bullets?.[0] && (
          <p className="text-white/30 text-[10px] truncate mt-0.5">
            {slide.bullets[0]}
          </p>
        )}
      </div>
    </button>
  );
}

function ReflectionCard({ label, text }) {
  const [expanded, setExpanded] = useState(false);
  const preview = text.length > 120 ? text.slice(0, 120) + '...' : text;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[#f0b429]/70 text-[10px] font-bold uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-white/70 text-xs leading-relaxed">
            {expanded ? text : preview}
          </p>
        </div>
        {text.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 mt-0.5"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function FeedbackCard({ feedback }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        {Array.from({ length: feedback.stars || 0 }).map((_, i) => (
          <Star key={i} size={12} className="text-[#f0b429] fill-[#f0b429]" />
        ))}
      </div>
      {feedback.comment && (
        <p className="text-white/60 text-xs leading-relaxed">{feedback.comment}</p>
      )}
      {feedback.from && (
        <p className="text-white/25 text-[10px] mt-1.5">{feedback.from}</p>
      )}
    </div>
  );
}

function GameScoreCard({ label, score }) {
  const percentage = typeof score === 'object' ? score.percentage : score;
  const display = typeof percentage === 'number' ? `${Math.round(percentage)}%` : `${score}`;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
      <p className="text-[#f0b429] text-xl font-bold">{display}</p>
      <p className="text-white/40 text-[10px] mt-1">{label}</p>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
      <div className="bg-[#f0b429]/10 p-2 rounded-lg">
        <Icon size={16} className="text-[#f0b429]" />
      </div>
      <div>
        <p className="text-white font-bold text-lg leading-none">{value}</p>
        <p className="text-white/40 text-[10px] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide Viewer Modal (read-only)
// ---------------------------------------------------------------------------

function SlideViewerModal({ slides, initialSlide, onClose }) {
  const [current, setCurrent] = useState(initialSlide || 0);
  const slide = slides[current];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && current < slides.length - 1) setCurrent(c => c + 1);
      if (e.key === 'ArrowLeft' && current > 0) setCurrent(c => c - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, slides.length, onClose]);

  if (!slide) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#1a2744] rounded-xl border border-white/10 max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-[#f0b429] font-bold text-sm">
            Slide {current + 1} of {slides.length}
          </span>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Slide content */}
        <div className="p-6">
          {slide.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden border border-white/10">
              <img src={slide.imageUrl} alt="" className="w-full max-h-56 object-cover" loading="lazy" />
              {slide.imageAttribution && (
                <p className="text-white/30 text-[10px] px-2 py-1 bg-black/40">{slide.imageAttribution}</p>
              )}
            </div>
          )}
          <h3 className="text-white font-bold text-lg mb-3">
            {slide.headline || 'Untitled'}
          </h3>
          <ul className="space-y-1.5">
            {slide.bullets?.filter(b => (b || '').trim()).map((bullet, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#f0b429]/40 mt-0.5 flex-shrink-0">{'\u2022'}</span>
                <span className="text-white/70 text-sm">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="text-white/40 hover:text-white disabled:text-white/10 text-xs font-semibold transition-colors"
          >
            Previous
          </button>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? 'bg-[#f0b429]' : 'bg-white/15 hover:bg-white/30'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent(c => Math.min(slides.length - 1, c + 1))}
            disabled={current === slides.length - 1}
            className="text-white/40 hover:text-white disabled:text-white/10 text-xs font-semibold transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const PortfolioView = ({ onComplete, viewMode = false, isSessionMode = false }) => {
  const [topic, setTopic] = useState('');
  const [slides, setSlides] = useState([]);
  const [researchSummary, setResearchSummary] = useState({ highlights: 0, images: 0, articles: 0 });
  const [reflections, setReflections] = useState([]);
  const [peerFeedback, setPeerFeedback] = useState([]);
  const [gameScores, setGameScores] = useState([]);
  const [viewingSlide, setViewingSlide] = useState(null); // index or null
  const [showPresentation, setShowPresentation] = useState(false);
  const [PresentationMode, setPresentationMode] = useState(null);

  // Load all data on mount
  useEffect(() => {
    // Topic
    const savedTopic = localStorage.getItem(TOPIC_KEY) || '';
    setTopic(savedTopic);

    // Slides
    const slideData = loadJSON(SLIDE_STORAGE_KEY);
    if (slideData?.slides) {
      setSlides(slideData.slides);
    }

    // Research board summary
    const board = getResearchBoard();
    setResearchSummary({
      highlights: board.highlights?.length || 0,
      images: board.images?.length || 0,
      articles: countArticlesRead(),
    });

    // Reflections
    const loadedReflections = [];
    for (const { key, label } of REFLECTION_KEYS) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          const text = typeof parsed === 'string' ? parsed : parsed.text || parsed.reflection || '';
          if (text.trim()) {
            loadedReflections.push({ label, text: text.trim() });
          }
        } catch {
          // Maybe it's just a plain string
          if (val.trim()) {
            loadedReflections.push({ label, text: val.trim() });
          }
        }
      }
    }
    setReflections(loadedReflections);

    // Peer feedback
    const fbData = loadJSON(PEER_FEEDBACK_KEY);
    if (Array.isArray(fbData)) {
      setPeerFeedback(fbData);
    }

    // Game scores
    const loadedScores = [];
    for (const { key, label } of GAME_SCORE_KEYS) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          loadedScores.push({ label, score: parsed });
        } catch {
          if (val.trim()) {
            loadedScores.push({ label, score: val.trim() });
          }
        }
      }
    }
    setGameScores(loadedScores);

    // Save portfolio view status
    const auth = getClassAuthInfo();
    saveStudentWork(ACTIVITY_ID, {
      title: 'Music Journalist Portfolio',
      emoji: '\uD83D\uDCF0',
      viewRoute: null,
      category: 'Music Journalist',
      type: 'portfolio',
      lessonId: LESSON_ID,
      data: {
        topic: savedTopic,
        slideCount: slideData?.slides?.length || 0,
        highlightCount: board.highlights?.length || 0,
        reflectionCount: loadedReflections.length,
        viewedAt: new Date().toISOString(),
      },
    }, null, auth);
  }, []);

  // Lazy-load PresentationMode
  useEffect(() => {
    if (showPresentation && !PresentationMode) {
      import('../presentation-mode/PresentationMode').then((mod) => {
        setPresentationMode(() => mod.default);
      });
    }
  }, [showPresentation, PresentationMode]);

  // If showing full presentation mode
  if (showPresentation && PresentationMode) {
    return (
      <PresentationMode
        onComplete={() => setShowPresentation(false)}
        viewMode={true}
        isSessionMode={isSessionMode}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f1829]">
      {/* Header */}
      <div className="flex-shrink-0 bg-[#1a2744] border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">Music Journalist Portfolio</h1>
            {topic && (
              <p className="text-[#f0b429]/70 text-sm mt-0.5">
                Research Topic: {topic}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowPresentation(true)}
            className="flex items-center gap-2 bg-[#f0b429] hover:bg-[#e0a420] text-[#1a2744] font-bold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Presentation size={16} />
            View Presentation
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Slide Previews */}
        <section>
          <SectionHeader icon={FileText} title="Presentation Slides" count={slides.length} />
          {slides.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {slides.map((slide, i) => (
                <SlideThumbCard
                  key={i}
                  slide={slide}
                  index={i}
                  onClick={() => setViewingSlide(i)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <FileText size={28} className="mx-auto text-white/15 mb-2" />
              <p className="text-white/30 text-sm">No slides created yet</p>
            </div>
          )}
        </section>

        {/* Research Board Summary */}
        <section>
          <SectionHeader icon={BookOpen} title="Research Summary" />
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Highlighter} value={researchSummary.highlights} label="Highlights" />
            <StatCard icon={ImageIcon} value={researchSummary.images} label="Images Saved" />
            <StatCard icon={FileText} value={researchSummary.articles} label="Articles Read" />
          </div>
        </section>

        {/* Written Reflections */}
        {reflections.length > 0 && (
          <section>
            <SectionHeader icon={MessageSquare} title="Written Reflections" count={reflections.length} />
            <div className="space-y-2">
              {reflections.map((r, i) => (
                <ReflectionCard key={i} label={r.label} text={r.text} />
              ))}
            </div>
          </section>
        )}

        {/* Peer Feedback Received */}
        {peerFeedback.length > 0 && (
          <section>
            <SectionHeader icon={Star} title="Peer Feedback Received" count={peerFeedback.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {peerFeedback.map((fb, i) => (
                <FeedbackCard key={i} feedback={fb} />
              ))}
            </div>
          </section>
        )}

        {/* Game Scores */}
        {gameScores.length > 0 && (
          <section>
            <SectionHeader icon={Trophy} title="Game Scores" count={gameScores.length} />
            <div className="grid grid-cols-3 gap-3">
              {gameScores.map((gs, i) => (
                <GameScoreCard key={i} label={gs.label} score={gs.score} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Slide viewer modal */}
      {viewingSlide !== null && slides.length > 0 && (
        <SlideViewerModal
          slides={slides}
          initialSlide={viewingSlide}
          onClose={() => setViewingSlide(null)}
        />
      )}
    </div>
  );
};

export default PortfolioView;
