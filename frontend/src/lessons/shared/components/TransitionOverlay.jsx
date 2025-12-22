// File: /src/lessons/shared/components/TransitionOverlay.jsx
// Brief overlay shown to students when teacher advances the lesson

import React from 'react';

const TransitionOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 animate-fadeIn">
      <div className="text-8xl mb-6">⏳</div>
      <h1 className="text-4xl font-bold text-white mb-3">Moving On...</h1>
      <p className="text-xl text-gray-400">Your teacher is changing the activity</p>
    </div>
  );
};

export default TransitionOverlay;
