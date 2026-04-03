// File: research-board/ResearchBoard.jsx
// Persistent, collapsible panel showing ALL saved highlights and images across articles.
// Embeddable in any Unit 3 (Music Journalist) lesson as a side panel or full-screen view.

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Trash2, ChevronLeft, ChevronRight, Image, Highlighter, CheckCircle } from 'lucide-react';
import {
  getResearchBoard,
  removeHighlight as removeHighlightFromStorage,
  removeImage as removeImageFromStorage,
  updateHighlightSlideTag,
  updateImageSlideTag,
} from './researchBoardStorage';

const HIGHLIGHT_COLORS = {
  yellow: { color: '#fbbf24', label: 'Main Idea' },
  blue: { color: '#60a5fa', label: 'Vocabulary' },
  green: { color: '#34d399', label: 'Opinion' },
  gold: { color: '#f0b429', label: 'Starred' },
};

const SLIDE_OPTIONS = [
  { value: null, label: 'Untagged' },
  { value: 1, label: 'Slide 1' },
  { value: 2, label: 'Slide 2' },
  { value: 3, label: 'Slide 3' },
  { value: 4, label: 'Slide 4' },
];

const REQUIRED_HIGHLIGHTS = 8;
const REQUIRED_IMAGES = 2;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SlideTagDropdown({ value, onChange }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === '' ? null : Number(v));
      }}
      className="bg-white/10 text-white/70 text-[10px] rounded px-1.5 py-0.5 border border-white/10 focus:outline-none focus:border-[#f0b429]/50 cursor-pointer"
    >
      {SLIDE_OPTIONS.map((opt) => (
        <option key={opt.label} value={opt.value ?? ''} className="bg-[#1a2744] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function HighlightCard({ highlight, onDelete, onSlideTag, readOnly }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const colorInfo = HIGHLIGHT_COLORS[highlight.color] || HIGHLIGHT_COLORS.yellow;
  const needsTruncation = highlight.text.length > 100;
  const displayText = !expanded && needsTruncation
    ? highlight.text.slice(0, 100) + '...'
    : highlight.text;

  const handleDelete = () => {
    if (confirming) {
      onDelete(highlight.id);
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden group">
      <div className="flex">
        {/* Color strip */}
        <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: colorInfo.color }} />

        <div className="flex-1 p-2.5 min-w-0">
          {/* Highlighted text */}
          <p className="text-white/80 text-xs leading-relaxed">
            &ldquo;{displayText}&rdquo;
            {needsTruncation && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-1 text-[#f0b429]/70 hover:text-[#f0b429] text-[10px] font-semibold"
              >
                {expanded ? 'less' : 'more'}
              </button>
            )}
          </p>

          {/* Source info */}
          <p className="text-white/30 text-[10px] mt-1 truncate">
            {highlight.articleHeadline || 'Unknown article'}
            {highlight.sourceName ? ` \u2022 ${highlight.sourceName}` : ''}
          </p>

          {/* Controls row */}
          <div className="flex items-center gap-2 mt-1.5">
            {!readOnly && (
              <>
                <SlideTagDropdown
                  value={highlight.slideTag}
                  onChange={(tag) => onSlideTag(highlight.id, tag)}
                />
                <button
                  onClick={handleDelete}
                  className={`ml-auto flex-shrink-0 transition-colors ${
                    confirming
                      ? 'text-red-400'
                      : 'text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100'
                  }`}
                  title={confirming ? 'Click again to confirm' : 'Delete highlight'}
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
            {readOnly && highlight.slideTag && (
              <span className="text-[10px] text-[#f0b429]/60 font-semibold">
                Slide {highlight.slideTag}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageCard({ image, onDelete, onSlideTag, readOnly }) {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (confirming) {
      onDelete(image.id);
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden group">
      {/* Thumbnail */}
      <div className="w-full aspect-[4/3] bg-gray-800 overflow-hidden">
        <img
          src={image.thumbnailUrl || image.url}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-2">
        {/* Attribution */}
        {image.attribution && (
          <p className="text-white/30 text-[10px] truncate mb-1.5">{image.attribution}</p>
        )}

        {/* Controls */}
        {!readOnly && (
          <div className="flex items-center gap-2">
            <SlideTagDropdown
              value={image.slideTag}
              onChange={(tag) => onSlideTag(image.id, tag)}
            />
            <button
              onClick={handleDelete}
              className={`ml-auto flex-shrink-0 transition-colors ${
                confirming
                  ? 'text-red-400'
                  : 'text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100'
              }`}
              title={confirming ? 'Click again to confirm' : 'Delete image'}
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
        {readOnly && image.slideTag && (
          <span className="text-[10px] text-[#f0b429]/60 font-semibold">Slide {image.slideTag}</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const ResearchBoard = ({
  collapsed: collapsedProp = false,
  onToggle,
  onSlideTag,
  readOnly = false,
}) => {
  const [collapsed, setCollapsed] = useState(collapsedProp);
  const [board, setBoard] = useState(() => getResearchBoard());
  const [activeTab, setActiveTab] = useState('highlights');

  // Refresh board state whenever localStorage changes (cross-component sync)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'mma-research-board') {
        setBoard(getResearchBoard());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Also poll for changes from same-tab writes (storage event only fires cross-tab)
  useEffect(() => {
    const interval = setInterval(() => {
      setBoard(getResearchBoard());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Sync collapsed prop
  useEffect(() => {
    setCollapsed(collapsedProp);
  }, [collapsedProp]);

  const toggle = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    if (onToggle) onToggle(next);
  }, [collapsed, onToggle]);

  // Handlers
  const handleDeleteHighlight = useCallback((id) => {
    const updated = removeHighlightFromStorage(id);
    setBoard(updated);
  }, []);

  const handleDeleteImage = useCallback((id) => {
    const updated = removeImageFromStorage(id);
    setBoard(updated);
  }, []);

  const handleHighlightSlideTag = useCallback((id, tag) => {
    const updated = updateHighlightSlideTag(id, tag);
    setBoard(updated);
    if (onSlideTag) onSlideTag({ type: 'highlight', id, slideTag: tag });
  }, [onSlideTag]);

  const handleImageSlideTag = useCallback((id, tag) => {
    const updated = updateImageSlideTag(id, tag);
    setBoard(updated);
    if (onSlideTag) onSlideTag({ type: 'image', id, slideTag: tag });
  }, [onSlideTag]);

  // Progress calculations
  const hlCount = board.highlights.length;
  const imgCount = board.images.length;
  const hlProgress = Math.min(hlCount / REQUIRED_HIGHLIGHTS, 1);
  const imgProgress = Math.min(imgCount / REQUIRED_IMAGES, 1);
  const totalProgress = (hlProgress + imgProgress) / 2;
  const isReady = hlCount >= REQUIRED_HIGHLIGHTS && imgCount >= REQUIRED_IMAGES;

  // Group highlights by article
  const highlightsByArticle = {};
  for (const hl of board.highlights) {
    const key = hl.articleId || 'unknown';
    if (!highlightsByArticle[key]) {
      highlightsByArticle[key] = {
        headline: hl.articleHeadline || 'Unknown Article',
        highlights: [],
      };
    }
    highlightsByArticle[key].highlights.push(hl);
  }

  // ---- Collapsed state: thin toggle strip ----
  if (collapsed) {
    return (
      <button
        onClick={toggle}
        className="flex flex-col items-center gap-2 py-4 px-1.5 bg-[#1a2744] border-l border-white/10 hover:bg-white/5 transition-colors h-full"
        title="Open Research Board"
      >
        <ChevronLeft size={14} className="text-white/40" />
        <BookOpen size={16} className="text-[#f0b429]" />
        {hlCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#f0b429]/20 text-[#f0b429] text-[10px] font-bold flex items-center justify-center">
            {hlCount}
          </span>
        )}
      </button>
    );
  }

  // ---- Expanded state ----
  return (
    <div className="w-full flex-shrink-0 bg-[#1a2744] border-l border-white/10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#f0b429]" />
            <h2 className="text-white font-bold text-sm">Research Board</h2>
            <span className="text-white/40 text-[10px]">
              {hlCount}h / {imgCount}i
            </span>
          </div>
          <button
            onClick={toggle}
            className="text-white/40 hover:text-white transition-colors"
            title="Collapse"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-1">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalProgress * 100}%`,
                backgroundColor: isReady ? '#34d399' : '#f0b429',
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-white/40 text-[10px]">
              {hlCount}/{REQUIRED_HIGHLIGHTS} highlights, {imgCount}/{REQUIRED_IMAGES} images
            </span>
            {isReady && (
              <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-semibold">
                <CheckCircle size={10} />
                Ready
              </span>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => setActiveTab('highlights')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'highlights'
                ? 'bg-[#f0b429]/20 text-[#f0b429]'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            <Highlighter size={12} />
            Highlights
            {hlCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] flex items-center justify-center">
                {hlCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'images'
                ? 'bg-[#f0b429]/20 text-[#f0b429]'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            <Image size={12} />
            Images
            {imgCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] flex items-center justify-center">
                {imgCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {/* ---- Highlights Tab ---- */}
        {activeTab === 'highlights' && (
          <>
            {hlCount === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Highlighter size={20} className="text-white/20" />
                </div>
                <p className="text-white/40 text-sm mb-1">No highlights yet</p>
                <p className="text-white/25 text-xs leading-relaxed px-4">
                  Start reading articles and highlighting text to build your research board
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                {Object.entries(highlightsByArticle).map(([articleId, group]) => (
                  <div key={articleId}>
                    {/* Article section header */}
                    <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1.5 truncate">
                      {group.headline}
                    </p>
                    <div className="space-y-1.5">
                      {group.highlights.map((hl) => (
                        <HighlightCard
                          key={hl.id}
                          highlight={hl}
                          onDelete={handleDeleteHighlight}
                          onSlideTag={handleHighlightSlideTag}
                          readOnly={readOnly}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---- Images Tab ---- */}
        {activeTab === 'images' && (
          <>
            {imgCount === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Image size={20} className="text-white/20" />
                </div>
                <p className="text-white/40 text-sm mb-1">No images saved</p>
                <p className="text-white/25 text-xs leading-relaxed px-4">
                  Save images from the Image Library to use in your presentation
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {board.images.map((img) => (
                  <ImageCard
                    key={img.id}
                    image={img}
                    onDelete={handleDeleteImage}
                    onSlideTag={handleImageSlideTag}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResearchBoard;
