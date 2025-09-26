import React from 'react';

const LoadingStates = ({
  vexflowLoaded,
  useCanvasFallback,
  loadingError,
  exerciseComplete
}) => {
  return (
    <>
      {/* Loading status */}
      {!vexflowLoaded && !useCanvasFallback && (
        <div className="text-center mb-4">
          <div className="text-blue-600">Loading VexFlow...</div>
        </div>
      )}

      {/* Error message */}
      {loadingError && useCanvasFallback && (
        <div className="text-center mb-4">
          <div className="text-orange-600 text-sm">
            Using fallback renderer (VexFlow CDN unavailable)
          </div>
        </div>
      )}

      {/* Instructions at the very top */}
      {!exerciseComplete && (vexflowLoaded || useCanvasFallback) && (
        <div className="text-center mb-1">
          <h3 className="text-lg font-semibold text-gray-800">
            Identify the solfege syllable for the highlighted note.
          </h3>
        </div>
      )}
    </>
  );
};

export default LoadingStates;