// File: /src/lessons/shared/components/TransitionOverlay.jsx
// Brief modal overlay shown to students when teacher advances the lesson
// Appears on top of their current work with semi-transparent background

import React from 'react';

const TransitionOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-12 shadow-2xl text-center">
        <div className="text-8xl mb-6">⏳</div>
        <h1 className="text-4xl font-bold text-white mb-3">Moving On...</h1>
        <p className="text-xl text-gray-400">Your teacher is changing the activity</p>
      </div>
    </div>
  );
};

export default TransitionOverlay;
