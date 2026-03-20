import React from 'react';

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
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  if (diffWeek < 5) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`;
  return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
}

const ArticleCard = ({ article, onClick }) => {
  const genre = article.genres?.[0] || '';
  const genreColor = GENRE_COLORS[genre.toLowerCase()] || '#6b7280';

  return (
    <button
      onClick={() => onClick(article)}
      className="group w-full text-left bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#f0b429]/50"
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] bg-gray-800 overflow-hidden">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${genreColor}20` }}
          >
            <span className="text-5xl opacity-60">&#x1F4F0;</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Headline */}
        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#f0b429] transition-colors">
          {article.generated_headline}
        </h3>

        {/* Source + Genre + Time */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source badge */}
          {article.source_name && (
            <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-white/10 text-white/70 rounded-full truncate max-w-[120px]">
              {article.source_name}
            </span>
          )}

          {/* Genre tag */}
          {genre && (
            <span
              className="inline-block px-2 py-0.5 text-[11px] font-bold rounded-full capitalize"
              style={{
                backgroundColor: `${genreColor}25`,
                color: genreColor,
              }}
            >
              {genre}
            </span>
          )}
        </div>

        {/* Time ago */}
        <p className="text-white/40 text-xs">
          {timeAgo(article.generated_at || article.published_at)}
        </p>
      </div>
    </button>
  );
};

export { GENRE_COLORS, timeAgo };
export default ArticleCard;
