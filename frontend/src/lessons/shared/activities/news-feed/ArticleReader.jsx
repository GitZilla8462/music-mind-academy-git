import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ExternalLink, Star, ChevronRight, ChevronLeft, X, BookOpen } from 'lucide-react';
import { GenrePlaceholder } from './NewsHub';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MOCK_ARTICLE = {
  _id: 'mock-taylor-swift',
  generated_headline: 'Taylor Swift Breaks Streaming Records with New Album Release',
  source_name: 'Music Weekly',
  source_url: 'https://example.com/taylor-swift-streaming',
  image_url: null,
  image_credit: 'Photo by Music Weekly Staff',
  published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  genres: ['pop'],
  body_standard: `Taylor Swift has once again shattered streaming records with the release of her latest album. The album accumulated over 300 million streams in its first 24 hours, surpassing the previous record held by her own earlier release.

The album features 16 tracks that explore themes of resilience, growth, and self-discovery. Music critics have praised the production quality and lyrical depth, noting Swift's continued evolution as a songwriter.

"This album represents a new chapter," Swift said in a recent interview. "I wanted to push myself creatively and try things I've never done before." The album blends pop, folk, and electronic elements in ways that have surprised both fans and critics.

Streaming platforms reported that the album caused temporary slowdowns due to the massive number of simultaneous listeners. Spotify confirmed that Swift broke their single-day streaming record for any artist.

The album's success has also boosted ticket sales for Swift's upcoming world tour, which is already the highest-grossing concert tour in history. Economists have noted the significant economic impact of Swift's tours on local economies.

Industry analysts predict the album will dominate charts for several weeks. "Taylor Swift has proven once again that she is the most commercially successful artist of her generation," said Billboard chart analyst David Chen.`,
  body_simplified: `Taylor Swift released a new album that broke streaming records. It got over 300 million streams in just one day. That is more than any other album has ever gotten in one day.

The album has 16 songs about being strong and growing up. Music experts say the songs are really well made. They say Taylor keeps getting better at writing songs.

Taylor said she wanted to try new things with this album. She mixed pop, folk, and electronic music together. Fans and critics were surprised by the new sounds.

So many people listened at the same time that streaming apps like Spotify slowed down. Spotify said Taylor broke their record for most streams in one day.

Taylor is also going on a world tour. It is already making more money than any concert tour ever. When Taylor visits a city, local businesses make a lot more money too.

Experts think the album will be number one on the charts for a long time. They say Taylor is the most successful music artist of her generation.`,
  discussion_question: 'Why do you think Taylor Swift is able to break records with each new album? What does this tell us about the relationship between artists and their fans in the streaming era?',
};

const HIGHLIGHT_COLORS = {
  yellow: { color: '#fbbf24', label: 'Main Idea', bg: 'rgba(251, 191, 36, 0.3)' },
  blue: { color: '#60a5fa', label: 'Vocabulary', bg: 'rgba(96, 165, 250, 0.3)' },
  green: { color: '#34d399', label: 'Opinion', bg: 'rgba(52, 211, 153, 0.3)' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getHighlightsKey(articleId) {
  return `mma-highlights-${articleId}`;
}

function loadHighlights(articleId) {
  try {
    const raw = localStorage.getItem(getHighlightsKey(articleId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHighlightsToStorage(articleId, highlights) {
  localStorage.setItem(getHighlightsKey(articleId), JSON.stringify(highlights));
}

function getReadingLevelPref() {
  return localStorage.getItem('mma-reading-level-preference') || 'standard';
}

function setReadingLevelPref(level) {
  localStorage.setItem('mma-reading-level-preference', level);
}

// Render article text with highlights applied
function renderTextWithHighlights(text, highlights) {
  if (!highlights.length) return text;

  // Sort highlights by position in text (find each one's first occurrence)
  const positions = [];
  for (const hl of highlights) {
    let startIdx = 0;
    // Find all occurrences of this highlight text
    while (true) {
      const idx = text.indexOf(hl.text, startIdx);
      if (idx === -1) break;
      positions.push({ start: idx, end: idx + hl.text.length, color: hl.color, id: hl.id });
      startIdx = idx + hl.text.length;
    }
  }

  if (!positions.length) return text;

  // Sort by start position, longer matches first for ties
  positions.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  // Remove overlapping highlights (keep first)
  const filtered = [];
  let lastEnd = 0;
  for (const p of positions) {
    if (p.start >= lastEnd) {
      filtered.push(p);
      lastEnd = p.end;
    }
  }

  // Build React elements
  const elements = [];
  let cursor = 0;
  for (let i = 0; i < filtered.length; i++) {
    const p = filtered[i];
    if (cursor < p.start) {
      elements.push(text.slice(cursor, p.start));
    }
    const bgColor = HIGHLIGHT_COLORS[p.color]?.bg || 'rgba(251, 191, 36, 0.3)';
    elements.push(
      <span key={p.id + '-' + i} style={{ backgroundColor: bgColor, borderRadius: '2px', padding: '0 1px' }}>
        {text.slice(p.start, p.end)}
      </span>
    );
    cursor = p.end;
  }
  if (cursor < text.length) {
    elements.push(text.slice(cursor));
  }
  return elements;
}

const ArticleReader = ({ article: articleProp, articleId, onBack, onHighlight, showResearchBoard: showResearchBoardProp = false, embedded = false }) => {
  const [article, setArticle] = useState(articleProp || null);
  const [loading, setLoading] = useState(!articleProp && !!articleId);
  const [readingLevel, setReadingLevel] = useState(getReadingLevelPref);
  const [highlights, setHighlights] = useState([]);
  const [researchBoardOpen, setResearchBoardOpen] = useState(showResearchBoardProp);
  const [toolbar, setToolbar] = useState(null); // { x, y, text }
  const bodyRef = useRef(null);
  const toolbarRef = useRef(null);

  const effectiveId = article?._id || article?.id || articleId || 'unknown';

  // Fetch article if needed
  useEffect(() => {
    if (articleProp) {
      setArticle(articleProp);
      setLoading(false);
      return;
    }
    if (!articleId) return;

    let cancelled = false;
    setLoading(true);

    fetch(`${API_BASE}/api/news/article/${articleId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setArticle(data.article || data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticle({ ...MOCK_ARTICLE, _id: articleId });
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [articleProp, articleId]);

  // Load highlights from localStorage
  useEffect(() => {
    if (effectiveId && effectiveId !== 'unknown') {
      setHighlights(loadHighlights(effectiveId));
    }
  }, [effectiveId]);

  // Handle reading level toggle
  const handleReadingLevel = (level) => {
    setReadingLevel(level);
    setReadingLevelPref(level);
  };

  // Add a highlight
  const addHighlight = useCallback((text, color) => {
    const newHighlight = {
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      color,
      articleHeadline: article?.generated_headline || '',
      articleId: effectiveId,
      timestamp: new Date().toISOString(),
    };
    const updated = [...highlights, newHighlight];
    setHighlights(updated);
    saveHighlightsToStorage(effectiveId, updated);
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  }, [highlights, effectiveId, article]);

  // Save to research board (star)
  const saveToResearchBoard = useCallback((text) => {
    const newHighlight = {
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      color: 'yellow',
      articleHeadline: article?.generated_headline || '',
      articleId: effectiveId,
      timestamp: new Date().toISOString(),
      starred: true,
    };
    const updated = [...highlights, newHighlight];
    setHighlights(updated);
    saveHighlightsToStorage(effectiveId, updated);
    if (onHighlight) {
      onHighlight({ text, color: 'yellow', articleId: effectiveId });
    }
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  }, [highlights, effectiveId, article, onHighlight]);

  // Remove a highlight
  const removeHighlight = useCallback((id) => {
    const updated = highlights.filter(h => h.id !== id);
    setHighlights(updated);
    saveHighlightsToStorage(effectiveId, updated);
  }, [highlights, effectiveId]);

  // Handle text selection in article body
  useEffect(() => {
    const handleMouseUp = (e) => {
      // Ignore clicks on the toolbar itself
      if (toolbarRef.current && toolbarRef.current.contains(e.target)) return;

      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText && selectedText.length > 0 && bodyRef.current?.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setToolbar({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
          text: selectedText,
        });
      } else {
        // Small delay so toolbar button clicks can fire before we hide
        setTimeout(() => {
          setToolbar(null);
        }, 150);
      }
    };

    document.addEventListener('pointerup', handleMouseUp);
    return () => document.removeEventListener('pointerup', handleMouseUp);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={`${embedded ? '' : 'min-h-screen'} bg-[#0f1419] flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // No article state
  if (!article) {
    return (
      <div className={`${embedded ? '' : 'min-h-screen'} bg-[#0f1419] flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-white/40 text-base mb-4">Article not found</p>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-white/10 text-white/70 font-medium rounded-lg hover:bg-white/15 transition-colors text-sm">
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const bodyText = readingLevel === 'simplified' && article.body_simplified
    ? article.body_simplified
    : (article.body_standard || article.body_simplified || '');

  const paragraphs = bodyText.split(/\n\n|\n/).filter(p => p.trim());

  const articleGenre = article.genres?.[0] || '';

  const Wrapper = embedded ? React.Fragment : ({ children }) => (
    <div className="min-h-screen bg-[#0f1419]">{children}</div>
  );

  return (
    <Wrapper>
      {/* Header bar */}
      <div className="sticky top-0 z-30 bg-[#0f1419]/95 backdrop-blur-sm border-b border-white/[0.08] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={16} />
              <span className="text-sm hidden sm:inline">Back</span>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white/80 font-medium text-sm truncate">
              {article.generated_headline}
            </p>
          </div>
          {/* Research board toggle button */}
          {showResearchBoardProp && (
            <button
              onClick={() => setResearchBoardOpen(!researchBoardOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] text-white/50 rounded-lg text-xs font-medium hover:bg-white/[0.1] hover:text-white/70 transition-colors flex-shrink-0"
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Research</span>
              {highlights.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/20 text-white/80 text-[10px] font-bold flex items-center justify-center">
                  {highlights.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-5xl mx-auto flex">
        {/* Article content */}
        <div className={`flex-1 ${researchBoardOpen ? 'lg:pr-6' : ''} px-4 py-6`}>
          <div className="max-w-[640px] mx-auto">

            {/* Hero image */}
            <div className="mb-6">
              <div className="relative w-full aspect-[2/1] bg-gray-900 rounded-lg overflow-hidden">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GenrePlaceholder genre={articleGenre} size="featured" />
                )}
              </div>
              {article.image_credit && (
                <p className="text-white/25 text-xs mt-1.5">{article.image_credit}</p>
              )}
            </div>

            {/* Headline */}
            <h1 className="text-2xl font-bold text-white leading-tight mb-3">
              {article.generated_headline}
            </h1>

            {/* Meta line */}
            <div className="flex items-center gap-2 text-sm text-white/40 mb-5 flex-wrap">
              {article.source_name && (
                <>
                  {article.source_url ? (
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 hover:text-white/70 transition-colors flex items-center gap-1"
                    >
                      {article.source_name}
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-white/50">{article.source_name}</span>
                  )}
                </>
              )}
              {article.published_at && (
                <>
                  <span className="text-white/20">&middot;</span>
                  <span>{formatDate(article.published_at)}</span>
                </>
              )}
            </div>

            {/* Reading level toggle */}
            <div className="flex items-center gap-1 mb-6 p-0.5 bg-white/[0.04] rounded-lg w-fit">
              <button
                onClick={() => handleReadingLevel('standard')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  readingLevel === 'standard'
                    ? 'bg-white/[0.12] text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => handleReadingLevel('simplified')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  readingLevel === 'simplified'
                    ? 'bg-white/[0.12] text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Simplified
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06] mb-6" />

            {/* Article body */}
            <div ref={bodyRef} className="space-y-4 mb-8 select-text">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="text-[15px] leading-[1.75] text-white/80">
                  {renderTextWithHighlights(paragraph, highlights)}
                </p>
              ))}
            </div>

            {/* Discussion question */}
            {article.discussion_question && (
              <div className="border-t border-white/[0.06] pt-6 mb-8">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Discuss</p>
                <p className="text-white/70 text-[15px] leading-relaxed">{article.discussion_question}</p>
              </div>
            )}
          </div>
        </div>

        {/* Research Board panel */}
        {showResearchBoardProp && researchBoardOpen && (
          <div className="hidden lg:block w-72 flex-shrink-0 border-l border-white/[0.06] bg-[#0f1419] min-h-[calc(100vh-49px)]">
            <div className="sticky top-[49px] p-4 max-h-[calc(100vh-49px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-white/40" />
                  <h2 className="text-white/70 font-semibold text-sm">Research Board</h2>
                  {highlights.length > 0 && (
                    <span className="text-white/30 text-xs">({highlights.length})</span>
                  )}
                </div>
                <button
                  onClick={() => setResearchBoardOpen(false)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {highlights.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/25 text-sm">No highlights yet</p>
                  <p className="text-white/15 text-xs mt-1">Select text to highlight</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {highlights.map(hl => {
                    const colorInfo = HIGHLIGHT_COLORS[hl.color] || HIGHLIGHT_COLORS.yellow;
                    return (
                      <div key={hl.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 group">
                        <div className="flex items-start gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{ backgroundColor: colorInfo.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white/60 text-xs leading-relaxed line-clamp-3">
                              "{hl.text}"
                            </p>
                          </div>
                          <button
                            onClick={() => removeHighlight(hl.id)}
                            className="text-white/15 hover:text-red-400/70 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating annotation toolbar */}
      {toolbar && (
        <div
          ref={toolbarRef}
          className="fixed z-50 flex items-center gap-0.5 bg-[#1a1f25] border border-white/[0.12] rounded-lg shadow-2xl shadow-black/60 px-1.5 py-1"
          style={{
            left: `${Math.max(20, Math.min(toolbar.x - 90, window.innerWidth - 200))}px`,
            top: `${Math.max(10, toolbar.y - 44)}px`,
          }}
        >
          <button
            onClick={() => addHighlight(toolbar.text, 'yellow')}
            className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-white/[0.08] transition-colors"
            title="Main Idea"
          >
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
            <span className="text-white/50 text-[10px] hidden sm:inline">Idea</span>
          </button>

          <button
            onClick={() => addHighlight(toolbar.text, 'blue')}
            className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-white/[0.08] transition-colors"
            title="Vocabulary"
          >
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#60a5fa' }} />
            <span className="text-white/50 text-[10px] hidden sm:inline">Vocab</span>
          </button>

          <button
            onClick={() => addHighlight(toolbar.text, 'green')}
            className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-white/[0.08] transition-colors"
            title="Opinion"
          >
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#34d399' }} />
            <span className="text-white/50 text-[10px] hidden sm:inline">Opinion</span>
          </button>

          <div className="w-px h-4 bg-white/[0.1] mx-0.5" />

          <button
            onClick={() => saveToResearchBoard(toolbar.text)}
            className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-white/[0.08] transition-colors"
            title="Save to Research Board"
          >
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-white/50 text-[10px] hidden sm:inline">Save</span>
          </button>
        </div>
      )}
    </Wrapper>
  );
};

export default ArticleReader;
