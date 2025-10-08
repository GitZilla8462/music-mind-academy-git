// composer/components/AudioInitModal.jsx - Audio engine initialization modal
import React from 'react';
import { Play } from 'lucide-react';

const AudioInitModal = ({ onInitialize }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
        <Play size={48} className="mx-auto mb-4 text-blue-400" />
        <h2 className="text-xl font-semibold mb-4">Initialize Audio Engine</h2>
        <p className="text-gray-300 mb-6">
          Click the button below to start the audio system. This is required for playing and previewing music loops.
        </p>
        <button
          onClick={onInitialize}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors"
        >
          Start Audio Engine
        </button>
        <p className="text-xs text-gray-400 mt-4">
          Note: Loops will only play when you start playback
        </p>
      </div>
    </div>
  );
};

export default AudioInitModal;