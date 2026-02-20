// First-Time Tip Component
// Lightweight, dismissable info bar shown once per feature
// Uses localStorage to track which tips have been seen

import React, { useState, useEffect } from 'react';
import { X, Lightbulb, Play } from 'lucide-react';

const TIP_PREFIX = 'teacher-tip-seen-';

const FirstTimeTip = ({ tipId, message, videoId, onWatchVideo }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(`${TIP_PREFIX}${tipId}`);
    if (!seen) {
      setVisible(true);
    }
  }, [tipId]);

  const handleDismiss = () => {
    localStorage.setItem(`${TIP_PREFIX}${tipId}`, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3 mb-4">
      <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0" />
      <span className="text-sm text-blue-800 flex-1">{message}</span>
      {videoId && onWatchVideo && (
        <button
          onClick={() => {
            onWatchVideo(videoId);
            handleDismiss();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          <Play size={12} />
          Watch
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="text-blue-400 hover:text-blue-600 flex-shrink-0"
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Reset a specific tip (for testing)
export const resetTip = (tipId) => {
  localStorage.removeItem(`${TIP_PREFIX}${tipId}`);
};

// Reset all tips (for testing)
export const resetAllTips = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(TIP_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

export default FirstTimeTip;
