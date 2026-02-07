// Portfolio Detail Modal
// src/components/student/PortfolioDetailModal.jsx
// Shows full composition detail with timeline, reflection, and grade

import React from 'react';
import { X, Star, Award, MessageSquare } from 'lucide-react';
import StaticTimelinePreview from '../shared/StaticTimelinePreview';

const PortfolioDetailModal = ({ work, grade, isFeatured, onToggleFeatured, onClose }) => {
  if (!work) return null;

  const placedLoops = work.data?.placedLoops || work.data?.composition?.placedLoops || [];
  const duration = work.data?.compositionDuration || work.data?.composition?.compositionDuration || 60;
  const reflection = work.data?.reflection || work.data?.composition?.reflection || null;

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(typeof timestamp === 'number' ? timestamp : timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get unique instrument/category names from loops
  const instruments = [...new Set(placedLoops.map(l => l.category || l.instrument).filter(Boolean))];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{work.emoji || '🎵'}</span>
            <h2 className="text-lg font-semibold text-gray-900">{work.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFeatured(work.workId)}
              className={`p-2 rounded-lg transition-colors ${
                isFeatured
                  ? 'text-yellow-500 bg-yellow-50'
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
              }`}
              title={isFeatured ? 'Remove from portfolio' : 'Add to portfolio'}
            >
              <Star size={18} fill={isFeatured ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Timeline Preview */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Composition</p>
            <StaticTimelinePreview
              placedLoops={placedLoops}
              duration={duration}
              height={180}
              theme="light"
            />
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{placedLoops.length} loops</span>
              <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
              {instruments.length > 0 && (
                <span>{instruments.slice(0, 3).join(', ')}</span>
              )}
            </div>
          </div>

          {/* Reflection */}
          {reflection && (
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Reflection</p>
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-800 space-y-2">
                {reflection.star1 && (
                  <p><span className="text-yellow-500 mr-1">&#9733;</span> {reflection.star1}</p>
                )}
                {reflection.star2 && (
                  <p><span className="text-yellow-500 mr-1">&#9733;</span> {reflection.star2}</p>
                )}
                {reflection.wish && (
                  <p><span className="text-blue-500 mr-1">&#10024;</span> <em>I wish... {reflection.wish}</em></p>
                )}
                {reflection.vibe && (
                  <p className="text-gray-500 text-xs mt-1">Vibe: {reflection.vibe}</p>
                )}
              </div>
            </div>
          )}

          {/* Grade & Feedback */}
          {grade && (
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Teacher Feedback</p>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Award size={18} className="text-green-600" />
                  <span className="text-2xl font-bold text-green-700">{grade.grade}</span>
                  {grade.gradedAt && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {formatDate(grade.gradedAt)}
                    </span>
                  )}
                </div>
                {grade.feedback && (
                  <div className="flex items-start gap-2 mt-2">
                    <MessageSquare size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{grade.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            <p>Created {formatDate(work.createdAt)} · Last saved {formatDate(work.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetailModal;
