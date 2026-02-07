// Portfolio Work Card
// src/components/student/PortfolioWorkCard.jsx
// Gallery card showing a composition with timeline preview and featured star

import React from 'react';
import { Star, Clock, CheckCircle } from 'lucide-react';
import StaticTimelinePreview from '../shared/StaticTimelinePreview';

const PortfolioWorkCard = ({ work, isFeatured, onToggleFeatured, onClick }) => {
  const placedLoops = work.data?.placedLoops || work.data?.composition?.placedLoops || [];
  const duration = work.data?.compositionDuration || work.data?.composition?.compositionDuration || 60;

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleFeatured(work.workId);
  };

  return (
    <div
      onClick={() => onClick(work)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
    >
      {/* Timeline Preview */}
      <div className="relative">
        <StaticTimelinePreview
          placedLoops={placedLoops}
          duration={duration}
          height={100}
          theme="light"
        />

        {/* Featured star button */}
        <button
          onClick={handleStarClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
            isFeatured
              ? 'bg-yellow-400 text-white shadow-sm'
              : 'bg-white/80 text-gray-400 hover:text-yellow-500 hover:bg-white shadow-sm'
          }`}
          title={isFeatured ? 'Remove from portfolio' : 'Add to portfolio'}
        >
          <Star size={14} fill={isFeatured ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Card content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{work.emoji || '🎵'}</span>
              <h3 className="font-medium text-gray-900 text-sm truncate">{work.title}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {placedLoops.length} loops · {formatDate(work.updatedAt || work.createdAt)}
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex-shrink-0">
            {work.status === 'submitted' ? (
              <Clock size={14} className="text-amber-500" />
            ) : work.status === 'graded' ? (
              <CheckCircle size={14} className="text-green-500" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioWorkCard;
