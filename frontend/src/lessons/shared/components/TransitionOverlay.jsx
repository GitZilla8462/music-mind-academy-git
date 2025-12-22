// File: /src/lessons/shared/components/TransitionOverlay.jsx
// Modal overlay shown to students when teacher moves on from an activity
// Appears on top of their current work with semi-transparent background

import React from 'react';

const TransitionOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 rounded-2xl p-12 shadow-2xl text-center border-2 border-green-500">
        <div className="text-8xl mb-6">⏳</div>
        <h1 className="text-4xl font-bold text-white mb-3">Moving On...</h1>
        <p className="text-xl text-green-200">Your work has been saved to the Join page</p>
      </div>
    </div>
  );
};

export default TransitionOverlay;
