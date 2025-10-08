// composer/components/ComposerHeader.jsx - Top header bar
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
    if (isDemo) return 'Film Music Composer (Demo)';
    if (isPractice) return 'Film Music Composer (Practice)';
    return 'Film Music Composer';
  };

  const getAudioStatus = () => {
    if (!audioReady) return 'Audio not ready';
    if (placedLoops.length === 0) return 'No loops placed';
    return `${placedLoops.length} loops ready`;
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {!tutorialMode && (
            <button
              onClick={onBack}
              className="flex items-center text-gray-300 hover:text-white mr-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold">
              {getModeLabel()}
            </h1>
            <p className="text-sm text-gray-400">
              {selectedVideo.title} • {Math.round(currentTime)}s / {Math.round(selectedVideo.duration)}s • {getAudioStatus()}
            </p>
          </div>
        </div>
        
        {!tutorialMode && (
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && !isDemo && !isPractice && (
              <span className="text-yellow-400 text-sm">● Unsaved</span>
            )}
            
            {!isDemo && !isPractice && (
              <button
                onClick={onToggleNotesPanel}
                className={`p-2 rounded transition-colors ${
                  showNotesPanel ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="Add notes"
              >
                <FileText size={16} />
              </button>
            )}

            <button
              onClick={onClearAll}
              disabled={placedLoops.length === 0}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 rounded transition-colors"
            >
              Clear All
            </button>

            {!hideSubmitButton && !isDemo && !isPractice && (
              <button
                onClick={onSubmit}
                disabled={isSubmitting || placedLoops.length === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 rounded transition-colors flex items-center"
              >
                <Save size={16} className="mr-2" />
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