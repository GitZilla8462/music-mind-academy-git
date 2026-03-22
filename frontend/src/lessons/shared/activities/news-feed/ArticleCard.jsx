import React from 'react';
import { GENRE_PLACEHOLDERS, DEFAULT_PLACEHOLDER } from './NewsHub';

const GENRE_COLORS = {
  'hip-hop': '#8b5cf6',
  'pop': '#ec4899',
  'rock': '#ef4444',
  'classical': '#f59e0b',
  'jazz': '#3b82f6',
  'latin': '#10b981',
  'country': '#f97316',
  'world': '#14b8a6',
  'industry': '#6b7280',
};

function timeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  return `${diffMonth}mo ago`;
}

const ArticleCard = ({ article, onClick }) => {
  const genre = article.genres?.[0] || '';
  const genreColor = GENRE_COLORS[genre.toLowerCase()] || '#6b7280';
  const placeholder = GENRE_PLACEHOLDERS?.[genre.toLowerCase()] || DEFAULT_PLACEHOLDER;

  return (
    <button
      onClick={() => onClick(article)}
      className="group w-full text-left bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden transition-all duration-150 hover:bg-white/[0.04] hover:border-white/[0.12] focus:outline-none focus:ring-1 focus:ring-white/20"
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-gray-900 overflow-hidden">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: placeholder.bg }}
          >
            <span className="text-4xl opacity-25 select-none">{placeholder.icon}</span>
          </div>
        )}
        {/* Genre indicator — small bar at bottom */}
        {genre && (
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ backgroundColor: genreColor }}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Headline */}
        <h3 className="text-white/90 font-semibold text-sm leading-snug line-clamp-2 mb-2.5 group-hover:text-white transition-colors">
          {article.generated_headline}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/35">
          {article.source_name && (
            <>
              <span className="font-medium text-white/45">{article.source_name}</span>
              <span>&middot;</span>
            </>
          )}
          <span>{timeAgo(article.generated_at || article.published_at)}</span>
          {genre && (
            <>
              <span>&middot;</span>
              <span className="capitalize" style={{ color: `${genreColor}99` }}>{genre}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
};

export { GENRE_COLORS, timeAgo };
export default ArticleCard;
