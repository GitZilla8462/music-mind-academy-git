// File: /src/components/JoinPageReflections.jsx
// Component to display saved student reflections on the join page

import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Clock, Share2, Trash2, Eye } from 'lucide-react';
import { getAllReflections, deleteReflection } from '../lessons/film-music-project/lesson1/reflectionServerUtils';

const JoinPageReflections = () => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    loadReflections();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadReflections, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadReflections = async () => {
    try {
      const refs = await getAllReflections();
      // Sort by timestamp, newest first
      refs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setReflections(refs);
    } catch (error) {
      console.error('Error loading reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shareCode) => {
    if (window.confirm('Are you sure you want to delete this reflection?')) {
      await deleteReflection(shareCode);
      await loadReflections();
    }
  };

  const handleCopyShareCode = async (shareUrl, shareCode) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedCode(shareCode);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getReviewTypeLabel = (reflection) => {
    if (reflection.reflection.reviewType === 'self') {
      return 'Self-Reflection';
    } else {
      return `Feedback for ${reflection.reflection.partnerName}`;
    }
  };

  const getReviewTypeColor = (reflection) => {
    if (reflection.reflection.reviewType === 'self') {
      return 'from-blue-600 to-cyan-600';
    } else {
      return 'from-purple-600 to-pink-600';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <Star className="mx-auto mb-3 text-gray-600" size={48} />
        <p className="text-gray-400">No saved reflections yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Reflections will appear here after students complete the Two Stars and a Wish activity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4 border border-purple-700">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Star size={24} className="text-yellow-400" />
          Student Reflections
        </h3>
        <p className="text-sm text-gray-300">
          View student reflections from the Two Stars and a Wish activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reflections.map((reflection) => (
          <div
            key={reflection.shareCode}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${getReviewTypeColor(reflection)} p-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-300" />
                  <span className="font-semibold text-white text-sm">
                    {reflection.studentName}
                  </span>
                </div>
                <Clock size={14} className="text-blue-200" />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Type</p>
                <p className="text-sm font-medium text-white">
                  {getReviewTypeLabel(reflection)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Activity</p>
                  <p className="text-xs font-medium text-purple-400">
                    2 Stars & Wish
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p className="text-xs font-medium text-gray-300">
                    {formatDate(reflection.timestamp)}
                  </p>
                </div>
              </div>

              {/* Share Code */}
              <div className="bg-gray-900 rounded p-2">
                <p className="text-xs text-gray-400 mb-1">Share Code</p>
                <code className="text-xs text-green-400 font-mono">
                  {reflection.shareCode}
                </code>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyShareCode(reflection.shareUrl, reflection.shareCode)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Share2 size={14} />
                  {copiedCode === reflection.shareCode ? 'Copied!' : 'Share'}
                </button>
                <button
                  onClick={() => setSelectedReflection(reflection)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Eye size={14} />
                  View
                </button>
                <button
                  onClick={() => handleDelete(reflection.shareCode)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedReflection && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className={`bg-gradient-to-r ${getReviewTypeColor(selectedReflection)} p-4 flex items-center justify-between sticky top-0`}>
              <div className="flex items-center gap-3">
                <Star className="text-yellow-300" size={24} />
                <div>
                  <h3 className="font-bold text-white">
                    {selectedReflection.studentName}'s Reflection
                  </h3>
                  <p className="text-sm text-blue-100">
                    {getReviewTypeLabel(selectedReflection)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReflection(null)}
                className="text-white hover:bg-white/20 rounded p-2 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Review Type</p>
                  <p className="text-sm font-medium text-white">
                    {getReviewTypeLabel(selectedReflection)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Submitted</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(selectedReflection.timestamp)}
                  </p>
                </div>
              </div>

              {/* Reflection Content */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="text-yellow-400" size={20} />
                    <h4 className="font-bold text-white">STAR 1: Using the DAW</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedReflection.reflection.star1}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="text-yellow-400" size={20} />
                    <h4 className="font-bold text-white">STAR 2: Loop Timing & Music Sound</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedReflection.reflection.star2}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-purple-400" size={20} />
                    <h4 className="font-bold text-white">WISH: What to Try Next</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedReflection.reflection.wish}
                  </p>
                </div>
              </div>

              {/* Share Code */}
              <div className="bg-gray-800 rounded p-4">
                <p className="text-sm text-gray-400 mb-2">Share URL</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedReflection.shareUrl}
                    readOnly
                    className="flex-1 bg-gray-900 text-white px-3 py-2 rounded text-sm font-mono"
                  />
                  <button
                    onClick={() => handleCopyShareCode(selectedReflection.shareUrl, selectedReflection.shareCode)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    {copiedCode === selectedReflection.shareCode ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinPageReflections;