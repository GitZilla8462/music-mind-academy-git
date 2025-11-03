// File: /src/components/JoinPageCompositions.jsx
// Component to display saved compositions on the join page

import React, { useState, useEffect } from 'react';
import { Music, Sparkles, Clock, Share2, Trash2, Eye } from 'lucide-react';
import { getAllCompositions, deleteComposition } from '../lessons/film-music-project/lesson1/compositionServerUtils';

const JoinPageCompositions = () => {
  const [compositions, setCompositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    loadCompositions();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadCompositions, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadCompositions = async () => {
    try {
      const comps = await getAllCompositions();
      // Sort by timestamp, newest first
      comps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setCompositions(comps);
    } catch (error) {
      console.error('Error loading compositions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shareCode) => {
    if (window.confirm('Are you sure you want to delete this composition?')) {
      await deleteComposition(shareCode);
      await loadCompositions();
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

  const handleViewComposition = (comp) => {
    // Store composition temporarily for viewing
    const viewKey = comp.activityType === 'sound-effects' ? 'view-sound-effects' : 'view-school-beneath';
    localStorage.setItem(viewKey, JSON.stringify(comp.composition));
    
    // Navigate to viewer page
    window.open(`/view-composition/${comp.shareCode}?type=${comp.activityType}`, '_blank');
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

  const getActivityIcon = (activityType) => {
    if (activityType === 'sound-effects') {
      return <Sparkles className="text-purple-400" size={20} />;
    }
    return <Music className="text-blue-400" size={20} />;
  };

  const getActivityTitle = (activityType) => {
    if (activityType === 'sound-effects') {
      return 'Sound Effects Activity';
    }
    return 'School Beneath Composition';
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (compositions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <Music className="mx-auto mb-3 text-gray-600" size={48} />
        <p className="text-gray-400">No saved compositions yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Compositions will appear here after students submit their work
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-700">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Music size={24} className="text-blue-400" />
          Saved Compositions
        </h3>
        <p className="text-sm text-gray-300">
          View and share student work from the Film Music Project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {compositions.map((comp) => (
          <div
            key={comp.shareCode}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActivityIcon(comp.activityType)}
                  <span className="font-semibold text-white text-sm">
                    {comp.studentName}
                  </span>
                </div>
                <Clock size={14} className="text-blue-200" />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Activity</p>
                <p className="text-sm font-medium text-white">
                  {getActivityTitle(comp.activityType)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Loops</p>
                  <p className="text-lg font-bold text-blue-400">
                    {comp.composition.placedLoops?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p className="text-xs font-medium text-gray-300">
                    {formatDate(comp.timestamp)}
                  </p>
                </div>
              </div>

              {/* Share Code */}
              <div className="bg-gray-900 rounded p-2">
                <p className="text-xs text-gray-400 mb-1">Share Code</p>
                <code className="text-xs text-green-400 font-mono">
                  {comp.shareCode}
                </code>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyShareCode(comp.shareUrl, comp.shareCode)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Share2 size={14} />
                  {copiedCode === comp.shareCode ? 'Copied!' : 'Share'}
                </button>
                <button
                  onClick={() => handleViewComposition(comp)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Eye size={14} />
                  View
                </button>
                <button
                  onClick={() => handleDelete(comp.shareCode)}
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
      {selectedComp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-3">
                {getActivityIcon(selectedComp.activityType)}
                <div>
                  <h3 className="font-bold text-white">
                    {selectedComp.studentName}
                  </h3>
                  <p className="text-sm text-blue-100">
                    {getActivityTitle(selectedComp.activityType)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedComp(null)}
                className="text-white hover:bg-white/20 rounded p-2 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Total Loops</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {selectedComp.composition.placedLoops?.length || 0}
                  </p>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Submitted</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(selectedComp.timestamp)}
                  </p>
                </div>
              </div>

              {/* Loop Details */}
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Placed Loops ({selectedComp.composition.placedLoops?.length || 0})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedComp.composition.placedLoops?.map((loop, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 rounded p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {loop.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Track {loop.trackIndex + 1} • {loop.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Start</p>
                        <p className="text-sm font-mono text-blue-400">
                          {loop.startTime.toFixed(1)}s
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share Code */}
              <div className="bg-gray-800 rounded p-4">
                <p className="text-sm text-gray-400 mb-2">Share URL</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedComp.shareUrl}
                    readOnly
                    className="flex-1 bg-gray-900 text-white px-3 py-2 rounded text-sm font-mono"
                  />
                  <button
                    onClick={() => handleCopyShareCode(selectedComp.shareUrl, selectedComp.shareCode)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    {copiedCode === selectedComp.shareCode ? 'Copied!' : 'Copy'}
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

export default JoinPageCompositions;