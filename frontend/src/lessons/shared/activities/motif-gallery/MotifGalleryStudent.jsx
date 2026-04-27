// Motif Gallery — Student View (Simplified)
// Students just watch the main screen while teacher showcases volunteer motifs.
// No voting needed.

import React from 'react';
import { Monitor } from 'lucide-react';

const MotifGalleryStudent = ({ onComplete, isSessionMode = true }) => {
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
      <div className="text-center">
        <Monitor className="w-24 h-24 mb-6 mx-auto animate-pulse text-purple-300" />
        <h1 className="text-4xl font-bold text-white mb-4">Motif Gallery</h1>
        <p className="text-xl text-purple-200">Watch the main screen!</p>
        <p className="text-lg text-purple-300 mt-2">Your teacher is showcasing student motifs</p>
      </div>
    </div>
  );
};

export default MotifGalleryStudent;
