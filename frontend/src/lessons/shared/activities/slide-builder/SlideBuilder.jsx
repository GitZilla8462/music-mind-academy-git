// File: slide-builder/SlideBuilder.jsx
// Capstone slide builder for Music Journalist presentations (Unit 3).
// Students build a 4-slide presentation using research from their Research Board.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Save,
  Check,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  PanelRightOpen,
  PanelRightClose,
  Plus,
  Trash2,
} from 'lucide-react';
import ResearchBoard from '../research-board/ResearchBoard';
import {
  getResearchBoard,
  getHighlightsForSlide,
  getImagesForSlide,
} from '../research-board/researchBoardStorage';
import { saveStudentWork, loadStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'mma-slide-builder-data';
const ACTIVITY_ID = 'mj-slide-builder';
const LESSON_ID = 'mj-lesson4';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

const SLIDE_CONFIGS = [
  {
    number: 1,
    defaultTitle: 'Introduce Your Topic',
    prompt: 'Who or what is your topic? Give your audience the essential background.',
  },
  {
    number: 2,
    defaultTitle: 'Why It Matters',
    prompt: 'Why is this artist or topic significant in music history or culture?',
  },
  {
    number: 3,
    defaultTitle: 'What You Found Most Interesting',
    prompt: "What surprised you? What's the detail your audience won't know?",
  },
  {
    number: 4,
    defaultTitle: 'Your Take',
    prompt: 'In your opinion, why should people your age care about this topic?',
  },
];

const CHAR_WARN = 400;
const CHAR_LIMIT = 500;
const MIN_BULLETS = 1;
const MAX_BULLETS = 5;

function createEmptySlide() {
  return { headline: '', bullets: [''], imageUrl: null, imageAttribution: '' };
}

function createDefaultSlides() {
  return SLIDE_CONFIGS.map(() => createEmptySlide());
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTotalChars(slide) {
  const headlineChars = (slide.headline || '').length;
  const bulletChars = slide.bullets.reduce((sum, b) => sum + (b || '').length, 0);
  return headlineChars + bulletChars;
}

function isSlideComplete(slide) {
  const hasBullets = slide.bullets.filter((b) => b.trim().length > 0).length >= 2;
  const hasHeadline = (slide.headline || '').trim().length > 0;
  return hasBullets && hasHeadline;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Image Picker Modal
// ---------------------------------------------------------------------------

function ImagePickerModal({ images, onSelect, onClose }) {
  if (!images || images.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
        <div
          className="bg-[#1a2744] rounded-xl p-6 max-w-md w-full mx-4 border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Choose an Image</h3>
            <button onClick={onClose} className="text-white/40 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="text-center py-8">
            <ImageIcon size={40} className="mx-auto text-white/20 mb-3" />
            <p className="text-white/50 text-sm">No images saved yet</p>
            <p className="text-white/30 text-xs mt-1">
              Save images from the Image Library to your Research Board first
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#1a2744] rounded-xl p-6 max-w-lg w-full mx-4 border border-white/10 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-white font-bold text-lg">Choose an Image</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => onSelect(img)}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-[#f0b429]/50 transition-colors group"
            >
              <div className="aspect-[4/3] bg-gray-800 overflow-hidden">
                <img
                  src={img.thumbnailUrl || img.url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              {img.attribution && (
                <p className="text-white/30 text-[10px] p-1.5 truncate">{img.attribution}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slide Canvas
// ---------------------------------------------------------------------------

function SlideCanvas({ slide, slideIndex, config, onChange, onImagePick, onRemoveImage, readOnly }) {
  const totalChars = getTotalChars(slide);
  const charColor =
    totalChars >= CHAR_LIMIT ? 'text-red-400' : totalChars >= CHAR_WARN ? 'text-amber-400' : 'text-white/30';

  const handleHeadlineChange = (value) => {
    onChange({ ...slide, headline: value });
  };

  const handleBulletChange = (idx, value) => {
    const updated = [...slide.bullets];
    updated[idx] = value;
    onChange({ ...slide, bullets: updated });
  };

  const handleBulletKeyDown = (idx, e) => {
    if (readOnly) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (slide.bullets.length < MAX_BULLETS) {
        const updated = [...slide.bullets];
        updated.splice(idx + 1, 0, '');
        onChange({ ...slide, bullets: updated });
        // Focus new bullet on next render
        setTimeout(() => {
          const next = document.querySelector(`[data-bullet="${slideIndex}-${idx + 1}"]`);
          if (next) next.focus();
        }, 50);
      }
    }

    if (e.key === 'Backspace' && slide.bullets[idx] === '' && slide.bullets.length > MIN_BULLETS) {
      e.preventDefault();
      const updated = [...slide.bullets];
      updated.splice(idx, 1);
      onChange({ ...slide, bullets: updated });
      // Focus previous bullet
      setTimeout(() => {
        const prev = document.querySelector(`[data-bullet="${slideIndex}-${Math.max(0, idx - 1)}"]`);
        if (prev) prev.focus();
      }, 50);
    }
  };

  const handleAddBullet = () => {
    if (slide.bullets.length < MAX_BULLETS) {
      onChange({ ...slide, bullets: [...slide.bullets, ''] });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6">
      {/* Slide header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#f0b429] font-bold text-xs uppercase tracking-wider">
            Slide {config.number}
          </span>
          {isSlideComplete(slide) && <CheckCircle size={14} className="text-emerald-400" />}
        </div>
        <p className="text-white/40 text-xs">{config.prompt}</p>
      </div>

      {/* Slide editing area */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex-1 flex flex-col gap-4">
        {/* Headline */}
        <div>
          <input
            type="text"
            value={slide.headline}
            onChange={(e) => handleHeadlineChange(e.target.value)}
            placeholder={config.defaultTitle}
            disabled={readOnly}
            className="w-full bg-transparent text-white font-bold text-lg border-b border-white/10 pb-2 focus:outline-none focus:border-[#f0b429]/50 placeholder:text-white/20 disabled:opacity-60"
          />
        </div>

        {/* Bullet points */}
        <div className="flex-1 flex flex-col gap-1.5">
          {slide.bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-2 group">
              <span className="text-[#f0b429]/40 mt-1.5 text-sm select-none flex-shrink-0">
                {'\u2022'}
              </span>
              <input
                type="text"
                data-bullet={`${slideIndex}-${idx}`}
                value={bullet}
                onChange={(e) => handleBulletChange(idx, e.target.value)}
                onKeyDown={(e) => handleBulletKeyDown(idx, e)}
                placeholder={idx === 0 ? 'Type your first point...' : 'Add another point...'}
                disabled={readOnly}
                className="flex-1 bg-transparent text-white/90 text-sm border-b border-transparent focus:border-white/10 py-1 focus:outline-none placeholder:text-white/15 disabled:opacity-60"
              />
              {!readOnly && slide.bullets.length > MIN_BULLETS && (
                <button
                  onClick={() => {
                    const updated = [...slide.bullets];
                    updated.splice(idx, 1);
                    onChange({ ...slide, bullets: updated });
                  }}
                  className="text-white/0 group-hover:text-white/20 hover:!text-red-400 transition-colors mt-1.5 flex-shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          {!readOnly && slide.bullets.length < MAX_BULLETS && (
            <button
              onClick={handleAddBullet}
              className="flex items-center gap-1.5 text-white/20 hover:text-white/40 text-xs mt-1 transition-colors self-start"
            >
              <Plus size={12} />
              Add bullet
            </button>
          )}
        </div>

        {/* Image slot */}
        <div>
          {slide.imageUrl ? (
            <div className="relative group rounded-lg overflow-hidden border border-white/10">
              <img
                src={slide.imageUrl}
                alt=""
                className="w-full max-h-48 object-cover"
                loading="lazy"
              />
              {!readOnly && (
                <button
                  onClick={onRemoveImage}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              )}
              {slide.imageAttribution && (
                <p className="text-white/30 text-[10px] px-2 py-1 bg-black/40">{slide.imageAttribution}</p>
              )}
            </div>
          ) : (
            <button
              onClick={readOnly ? undefined : onImagePick}
              disabled={readOnly}
              className="w-full py-6 border border-dashed border-white/10 rounded-lg flex flex-col items-center gap-2 text-white/20 hover:text-white/40 hover:border-white/20 transition-colors disabled:cursor-not-allowed"
            >
              <ImageIcon size={24} />
              <span className="text-xs">Click to add image</span>
            </button>
          )}
        </div>

        {/* Character count */}
        <div className="flex justify-end">
          <span className={`text-[10px] ${charColor}`}>
            {totalChars} / {CHAR_LIMIT} chars
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Completion Checklist
// ---------------------------------------------------------------------------

function CompletionChecklist({ slides }) {
  const allBullets = slides.every(
    (s) => s.bullets.filter((b) => b.trim().length > 0).length >= 2
  );
  const allHeadlines = slides.every((s) => (s.headline || '').trim().length > 0);
  const imageCount = slides.filter((s) => s.imageUrl).length;
  const enoughImages = imageCount >= 2;
  const allComplete = allBullets && allHeadlines && enoughImages;

  const items = [
    { label: 'All 4 slides have at least 2 bullet points', done: allBullets },
    { label: `At least 2 slides have an image (${imageCount}/2)`, done: enoughImages },
    { label: 'Headline filled in for all slides', done: allHeadlines },
  ];

  return (
    <div className="flex-shrink-0 border-t border-white/10 px-4 py-3 bg-[#111c33]">
      <div className="flex items-center gap-4 flex-wrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            {item.done ? (
              <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle size={13} className="text-white/20 flex-shrink-0" />
            )}
            <span className={item.done ? 'text-emerald-400/80' : 'text-white/40'}>
              {item.label}
            </span>
          </div>
        ))}
        {allComplete && (
          <div className="flex items-center gap-1.5 ml-auto bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
            <Award size={14} />
            Presentation Ready!
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Research Panel (right side) — wraps ResearchBoard with slide-specific extras
// ---------------------------------------------------------------------------

function ResearchPanel({
  collapsed,
  onToggle,
  activeSlideNumber,
  onUseHighlight,
  onUseImage,
  readOnly,
}) {
  const [board, setBoard] = useState(() => getResearchBoard());

  // Poll for updates from same-tab writes
  useEffect(() => {
    const interval = setInterval(() => {
      setBoard(getResearchBoard());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Listen for cross-tab storage events
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'mma-research-board') setBoard(getResearchBoard());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (collapsed) {
    return (
      <button
        onClick={() => onToggle(false)}
        className="flex flex-col items-center gap-2 py-4 px-1.5 bg-[#1a2744] border-l border-white/10 hover:bg-white/5 transition-colors h-full"
        title="Open Research Board"
      >
        <PanelRightOpen size={14} className="text-white/40" />
        <span className="text-[#f0b429] text-[10px] font-bold [writing-mode:vertical-rl]">Research</span>
      </button>
    );
  }

  // Split highlights: tagged for this slide first, then untagged
  const taggedHighlights = board.highlights.filter((h) => h.slideTag === activeSlideNumber);
  const untaggedHighlights = board.highlights.filter((h) => !h.slideTag);
  const allImages = board.images;

  return (
    <div className="w-[300px] flex-shrink-0 bg-[#1a2744] border-l border-white/10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-sm">Research Board</h3>
          <button
            onClick={() => onToggle(true)}
            className="text-white/40 hover:text-white transition-colors"
            title="Collapse"
          >
            <PanelRightClose size={16} />
          </button>
        </div>
        <p className="text-white/30 text-[10px]">
          Showing research for Slide {activeSlideNumber}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
        {/* Tagged highlights for this slide */}
        {taggedHighlights.length > 0 && (
          <div>
            <p className="text-[#f0b429]/70 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Tagged for Slide {activeSlideNumber}
            </p>
            <div className="space-y-1.5">
              {taggedHighlights.map((hl) => (
                <HighlightUseCard
                  key={hl.id}
                  highlight={hl}
                  onUse={() => onUseHighlight(hl.text)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>
        )}

        {/* Untagged highlights */}
        {untaggedHighlights.length > 0 && (
          <div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Untagged Highlights
            </p>
            <div className="space-y-1.5">
              {untaggedHighlights.map((hl) => (
                <HighlightUseCard
                  key={hl.id}
                  highlight={hl}
                  onUse={() => onUseHighlight(hl.text)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>
        )}

        {taggedHighlights.length === 0 && untaggedHighlights.length === 0 && (
          <div className="text-center py-6">
            <p className="text-white/30 text-xs">No highlights saved yet</p>
          </div>
        )}

        {/* Images */}
        {allImages.length > 0 && (
          <div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Saved Images
            </p>
            <div className="grid grid-cols-2 gap-2">
              {allImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => !readOnly && onUseImage(img)}
                  disabled={readOnly}
                  className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-[#f0b429]/50 transition-colors disabled:cursor-not-allowed"
                >
                  <div className="aspect-[4/3] bg-gray-800 overflow-hidden">
                    <img
                      src={img.thumbnailUrl || img.url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {img.attribution && (
                    <p className="text-white/30 text-[9px] p-1 truncate">{img.attribution}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HighlightUseCard({ highlight, onUse, readOnly }) {
  const HIGHLIGHT_COLORS = {
    yellow: '#fbbf24',
    blue: '#60a5fa',
    green: '#34d399',
    gold: '#f0b429',
  };
  const color = HIGHLIGHT_COLORS[highlight.color] || HIGHLIGHT_COLORS.yellow;
  const text =
    highlight.text.length > 120 ? highlight.text.slice(0, 120) + '...' : highlight.text;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 p-2 min-w-0">
          <p className="text-white/70 text-[11px] leading-relaxed">&ldquo;{text}&rdquo;</p>
          <p className="text-white/25 text-[9px] mt-0.5 truncate">
            {highlight.articleHeadline || 'Unknown article'}
          </p>
          {!readOnly && (
            <button
              onClick={onUse}
              className="mt-1 text-[10px] text-[#f0b429]/70 hover:text-[#f0b429] font-semibold transition-colors"
            >
              Use in slide
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const SlideBuilder = ({ onComplete, viewMode = false, isSessionMode = false }) => {
  const [slides, setSlides] = useState(createDefaultSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | { time: string }
  const [loaded, setLoaded] = useState(false);

  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  // ---- Load saved data on mount ----
  useEffect(() => {
    // Try localStorage first
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.slides && parsed.slides.length === 4) {
          setSlides(parsed.slides);
          if (parsed.lastSaved) {
            setSaveStatus({ time: formatTime(parsed.lastSaved) });
          }
          setLoaded(true);
          return;
        }
      }
    } catch { /* ignore */ }

    // Firebase fallback
    const saved = loadStudentWork(ACTIVITY_ID);
    if (saved?.data?.slides && saved.data.slides.length === 4) {
      setSlides(saved.data.slides);
      if (saved.lastSaved) {
        setSaveStatus({ time: formatTime(saved.lastSaved) });
      }
    }
    setLoaded(true);
  }, []);

  // ---- Save function ----
  const doSave = useCallback(() => {
    const current = slidesRef.current;
    const now = new Date().toISOString();

    // Save to localStorage
    const localData = { slides: current, lastSaved: now };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));

    // Save via studentWorkStorage (handles Firebase sync)
    const auth = getClassAuthInfo();
    saveStudentWork(ACTIVITY_ID, {
      title: 'Slide Presentation',
      emoji: '\uD83D\uDCCA',
      viewRoute: null,
      category: 'Music Journalist',
      type: 'slide-builder',
      lessonId: LESSON_ID,
      data: { slides: current, lastSaved: now },
    }, null, auth);

    setSaveStatus({ time: formatTime(now) });
  }, []);

  // ---- Auto-save interval ----
  useEffect(() => {
    if (viewMode || !loaded) return;
    const interval = setInterval(() => {
      doSave();
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [doSave, viewMode, loaded]);

  // ---- Save on blur ----
  const handleBlur = useCallback(() => {
    if (viewMode) return;
    doSave();
  }, [doSave, viewMode]);

  // ---- Explicit save ----
  const handleExplicitSave = useCallback(() => {
    setSaveStatus('saving');
    // Small delay so "Saving..." is visible
    setTimeout(() => {
      doSave();
    }, 300);
  }, [doSave]);

  // ---- Slide change handler ----
  const handleSlideChange = useCallback(
    (updatedSlide) => {
      setSlides((prev) => {
        const next = [...prev];
        next[activeSlide] = updatedSlide;
        return next;
      });
    },
    [activeSlide]
  );

  // ---- Use highlight text in next empty bullet ----
  const handleUseHighlight = useCallback(
    (text) => {
      setSlides((prev) => {
        const next = [...prev];
        const slide = { ...next[activeSlide], bullets: [...next[activeSlide].bullets] };

        // Find first empty bullet
        const emptyIdx = slide.bullets.findIndex((b) => b.trim() === '');
        if (emptyIdx !== -1) {
          slide.bullets[emptyIdx] = text;
        } else if (slide.bullets.length < MAX_BULLETS) {
          slide.bullets.push(text);
        } else {
          // All full, replace last one
          slide.bullets[slide.bullets.length - 1] = text;
        }

        next[activeSlide] = slide;
        return next;
      });
    },
    [activeSlide]
  );

  // ---- Use image from research board ----
  const handleUseImage = useCallback(
    (img) => {
      setSlides((prev) => {
        const next = [...prev];
        next[activeSlide] = {
          ...next[activeSlide],
          imageUrl: img.url || img.thumbnailUrl,
          imageAttribution: img.attribution || '',
        };
        return next;
      });
    },
    [activeSlide]
  );

  // ---- Image picker from slide canvas ----
  const handleImagePick = useCallback(() => {
    setShowImagePicker(true);
  }, []);

  const handleImagePickerSelect = useCallback(
    (img) => {
      handleUseImage(img);
      setShowImagePicker(false);
    },
    [handleUseImage]
  );

  const handleRemoveImage = useCallback(() => {
    setSlides((prev) => {
      const next = [...prev];
      next[activeSlide] = { ...next[activeSlide], imageUrl: null, imageAttribution: '' };
      return next;
    });
  }, [activeSlide]);

  // ---- Get all images from research board for picker ----
  const allImages = getResearchBoard().images;

  // ---- Active config ----
  const activeConfig = SLIDE_CONFIGS[activeSlide];

  return (
    <div className="h-screen flex flex-col bg-[#0f1829]" onBlur={handleBlur}>
      {/* Top bar */}
      <div className="flex-shrink-0 bg-[#1a2744] border-b border-white/10 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-bold text-sm">Slide Builder</h1>
          <span className="text-white/30 text-xs">Music Journalist Capstone</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          {saveStatus && (
            <span className="text-white/30 text-[11px]">
              {saveStatus === 'saving' ? 'Saving...' : `Saved ${saveStatus.time}`}
            </span>
          )}

          {/* Save button */}
          {!viewMode && (
            <button
              onClick={handleExplicitSave}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Save size={13} />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Slide tab bar */}
      <div className="flex-shrink-0 bg-[#111c33] border-b border-white/10 px-4 flex items-center gap-1">
        {SLIDE_CONFIGS.map((cfg, i) => {
          const isActive = i === activeSlide;
          const complete = isSlideComplete(slides[i]);
          return (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                isActive
                  ? 'text-[#f0b429] border-[#f0b429]'
                  : 'text-white/40 border-transparent hover:text-white/60 hover:border-white/10'
              }`}
            >
              Slide {cfg.number}
              {complete && <Check size={12} className="text-emerald-400" />}
            </button>
          );
        })}

        {/* Slide navigation arrows */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setActiveSlide((prev) => Math.max(0, prev - 1))}
            disabled={activeSlide === 0}
            className="text-white/30 hover:text-white/60 disabled:text-white/10 transition-colors p-1"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setActiveSlide((prev) => Math.min(3, prev + 1))}
            disabled={activeSlide === 3}
            className="text-white/30 hover:text-white/60 disabled:text-white/10 transition-colors p-1"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main content: slide canvas + research panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide canvas */}
        <SlideCanvas
          slide={slides[activeSlide]}
          slideIndex={activeSlide}
          config={activeConfig}
          onChange={handleSlideChange}
          onImagePick={handleImagePick}
          onRemoveImage={handleRemoveImage}
          readOnly={viewMode}
        />

        {/* Research panel */}
        <ResearchPanel
          collapsed={panelCollapsed}
          onToggle={(collapsed) => setPanelCollapsed(collapsed)}
          activeSlideNumber={activeSlide + 1}
          onUseHighlight={handleUseHighlight}
          onUseImage={handleUseImage}
          readOnly={viewMode}
        />
      </div>

      {/* Completion checklist */}
      <CompletionChecklist slides={slides} />

      {/* Image picker modal */}
      {showImagePicker && (
        <ImagePickerModal
          images={allImages}
          onSelect={handleImagePickerSelect}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
};

export default SlideBuilder;
