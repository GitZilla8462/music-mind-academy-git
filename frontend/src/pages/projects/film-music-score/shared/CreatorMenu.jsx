// File: CreatorMenu.jsx
// Overlay menu for accessing creative tools in the DAW
// Shows Beat Maker (enabled) and Melody Maker (coming soon)

import React from 'react';
import { Disc3, Music, X } from 'lucide-react';

const CreatorMenu = ({ isOpen, onClose, onOpenBeatMaker, onOpenMelodyMaker }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">Create Your Own</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Options */}
        <div className="space-y-2">
          {/* Beat Maker */}
          <button
            onClick={() => {
              onClose();
              onOpenBeatMaker();
            }}
            className="w-full flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
          >
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Disc3 size={20} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">Beat Maker</div>
              <div className="text-gray-400 text-sm">Create custom drum patterns</div>
            </div>
          </button>

          {/* Melody Maker - Coming Soon */}
          <button
            disabled
            className="w-full flex items-center gap-3 p-3 bg-gray-800 rounded-lg opacity-50 cursor-not-allowed"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Music size={20} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-gray-400 font-medium">Melody Maker</div>
              <div className="text-gray-500 text-sm">Coming Soon</div>
            </div>
          </button>
        </div>

        {/* Tip */}
        <p className="text-gray-500 text-xs mt-4 text-center">
          Create loops and add them to your project
        </p>
      </div>
    </div>
  );
};

// Button to open the Creator Menu (placed in top-left corner of video area)
export const CreatorMenuButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-3 left-3 flex items-center gap-1.5 bg-gray-800/90 hover:bg-gray-700 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors border border-gray-600 shadow-lg z-10"
      title="Create your own loops"
    >
      <Disc3 size={16} className="text-red-400" />
      <span>Create</span>
    </button>
  );
};

export default CreatorMenu;
