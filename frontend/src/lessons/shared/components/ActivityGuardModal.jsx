/**
 * ActivityGuardModal - Warning shown when student hits browser back button during an activity
 */

import React from 'react';

const ActivityGuardModal = ({ onDismiss }) => (
  <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-700">
      <div className="text-5xl mb-4">&#9888;&#65039;</div>
      <h2 className="text-2xl font-bold text-white mb-2">Hang on!</h2>
      <p className="text-lg text-gray-300 mb-6">Your activity is still in progress. Don't worry, your work is safe.</p>
      <button
        onClick={onDismiss}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-all"
      >
        Keep Working
      </button>
    </div>
  </div>
);

export default ActivityGuardModal;
