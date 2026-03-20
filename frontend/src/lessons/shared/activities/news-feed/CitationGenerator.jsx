// File: news-feed/CitationGenerator.jsx
// Generates and displays MLA/APA citations for news articles.
// Collapsed by default; expands to show formatted citations with copy buttons.

import React, { useState, useCallback } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateMLA(dateStr) {
  if (!dateStr) return 'n.d.';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'n.d.';
  const months = [
    'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June',
    'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateAPA(dateStr) {
  if (!dateStr) return 'n.d.';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'n.d.';
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function getYear(dateStr) {
  if (!dateStr) return 'n.d.';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'n.d.';
  return d.getFullYear().toString();
}

function stripProtocol(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

// ---------------------------------------------------------------------------
// Citation builders
// ---------------------------------------------------------------------------

function buildMMAcitation(article, format) {
  const headline = article.generated_headline || 'Untitled';
  const date = article.generated_at || article.published_at;

  if (format === 'apa') {
    const year = getYear(date);
    return `MMA News Desk. (${year}). ${headline}. Music Mind Academy.`;
  }

  // MLA
  const mlaDate = formatDateMLA(date);
  return `MMA News Desk. \u201C${headline}.\u201D Music Mind Academy, ${mlaDate}, musicmindacademy.com.`;
}

function buildOriginalCitation(article, format) {
  const sourceName = article.source_name || 'Unknown Source';
  const headline = article.original_headline || article.generated_headline || 'Untitled';
  const date = article.published_at;
  const url = article.source_url || '';

  if (format === 'apa') {
    const year = getYear(date);
    const apaDate = date ? `${getYear(date)}, ${formatDateAPA(date)}` : 'n.d.';
    return `${sourceName}. (${apaDate}). ${headline}. ${sourceName}. ${url}`;
  }

  // MLA
  const mlaDate = formatDateMLA(date);
  const domain = stripProtocol(url);
  return `\u201C${headline}.\u201D ${sourceName}, ${mlaDate}, ${domain}.`;
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / insecure contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
      title={copied ? 'Copied!' : 'Copy citation'}
    >
      {copied ? (
        <>
          <Check size={10} className="text-emerald-400" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={10} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CitationGenerator({ article, format = 'mla' }) {
  const [expanded, setExpanded] = useState(false);

  if (!article) return null;

  const mmaCitation = buildMMAcitation(article, format);
  const originalCitation = buildOriginalCitation(article, format);

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        <span>{expanded ? 'Hide Citation' : 'Show Citation'}</span>
      </button>

      {expanded && (
        <div className="mt-2 border border-white/10 rounded-lg p-3 space-y-3 bg-white/[0.02]">
          {/* MMA citation */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider">
                {format.toUpperCase()} Citation
              </span>
              <CopyButton text={mmaCitation} />
            </div>
            <p className="text-white/50 text-xs leading-relaxed font-mono">
              {mmaCitation}
            </p>
          </div>

          {/* Original source */}
          {article.source_name && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-wider">
                  Original Source
                </span>
                <CopyButton text={originalCitation} />
              </div>
              <p className="text-white/50 text-xs leading-relaxed font-mono">
                {originalCitation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CitationGenerator;
