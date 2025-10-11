// File: /src/pages/projects/film-music-score/composer/components/ComposerHeader.jsx
// Top header bar - COMPACT VERSION

import React from 'react';
import { ArrowLeft, Save, FileText } from 'lucide-react';

const ComposerHeader = ({
  tutorialMode,
  isDemo,
  isPractice,
  selectedVideo,
  currentTime,
  placedLoops,
  audioReady,
  hasUnsavedChanges,
  showNotesPanel,
  isSubmitting,
  hideSubmitButton,
  onBack,
  onToggleNotesPanel,
  onClearAll,
  onSubmit
}) => {
  
  const getModeLabel = () => {
    if (tutorialMode) return 'DAW Tutorial';
    if (isDemo) return 'Demo';
    if (isPractice) return 'Practice';
    return 'Composer';
  };

  const getAudioStatus = () => {
    if (!audioReady) return 'Not ready';
    if (placedLoops.length === 0) return 'No loops';
    return `${placedLoops.length} loops`;
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-3 py-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {!tutorialMode && (
            <button
              onClick={onBack}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span className="text-sm">Back</span>
            </button>
          )}
          
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-semibold text-white">
              {getModeLabel()}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">
              {selectedVideo.title}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">
              {Math.round(currentTime)}s/{Math.round(selectedVideo.duration)}s
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">
              {getAudioStatus()}
            </span>
          </div>
        </div>
        
        {!tutorialMode && (
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && !isDemo && !isPractice && (
              <span className="text-yellow-400 text-xs">● Unsaved</span>
            )}
            
            {!isDemo && !isPractice && (
              <button
                onClick={onToggleNotesPanel}
                className={`p-1.5 rounded transition-colors ${
                  showNotesPanel ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="Add notes"
              >
                <FileText size={14} />
              </button>
            )}

            <button
              onClick={onClearAll}
              disabled={placedLoops.length === 0}
              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 disabled:bg-gray-500 rounded transition-colors"
            >
              Clear
            </button>

            {!hideSubmitButton && !isDemo && !isPractice && (
              <button
                onClick={onSubmit}
                disabled={isSubmitting || placedLoops.length === 0}
                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-500 rounded transition-colors flex items-center"
              >
                <Save size={12} className="mr-1" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComposerHeader;