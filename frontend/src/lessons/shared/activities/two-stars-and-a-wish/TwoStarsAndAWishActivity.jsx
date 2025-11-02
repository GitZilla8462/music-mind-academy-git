// File: /src/lessons/film-music-project/lesson1/activities/two-stars-and-a-wish/TwoStarsAndAWishActivity.jsx
// Main wrapper component for the reflection activity
// UPDATED: Modal in bottom right, no screen dimming, DAW fully visible

import React from 'react';
import MusicComposer from "../../../../pages/projects/film-music-score/composer/MusicComposer";
import ReflectionModal from './ReflectionModal';

const TwoStarsAndAWishActivity = ({ onComplete, viewMode = false }) => {
  // Load saved composition data
  const getCompositionData = () => {
    const saved = localStorage.getItem('school-beneath-composition');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading composition:', error);
        return null;
      }
    }
    return null;
  };

  const compositionData = getCompositionData();

  if (!compositionData && !viewMode) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <p className="text-xl mb-4">No composition found!</p>
          <p className="text-gray-400">Please complete your composition first.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-gray-900">
      {/* Composition fully visible - NO OVERLAY */}
      <div className="absolute inset-0">
        <MusicComposer
          tutorialMode={false}
          preselectedVideo={{
            id: 'school-beneath',
            title: 'The School Beneath',
            duration: compositionData?.videoDuration || 60,
            videoPath: '/lessons/videos/film-music-loop-project/SchoolMystery.mp4'
          }}
          filterLoopCategory="Mysterious"
          hideHeader={true}
          hideSubmitButton={true}
          isLessonMode={true}
          showToast={(msg, type) => console.log(msg, type)}
          initialPlacedLoops={compositionData?.placedLoops || []}
          readOnly={true}
        />
      </div>

      {/* Modal in bottom right corner with pointer events enabled */}
      <div className="absolute inset-0 pointer-events-none">
        <ReflectionModal 
          compositionData={compositionData}
          onComplete={onComplete}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default TwoStarsAndAWishActivity;