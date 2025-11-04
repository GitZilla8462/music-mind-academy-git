// File: /src/lessons/film-music-project/lesson1/activities/two-stars-and-a-wish/TwoStarsAndAWishActivity.jsx
// Main wrapper component for the reflection activity
// UPDATED: Uses ReflectionModal as floating overlay instead of sidebar

import React, { useState } from 'react';
import MusicComposer from "../../../../pages/projects/film-music-score/composer/MusicComposer";
import ReflectionModal from './ReflectionModal';
import NameThatLoopActivity from '../NameThatLoopActivity';

const TwoStarsAndAWishActivity = ({ onComplete, viewMode = false, isSessionMode = false }) => {
  const [showBonus, setShowBonus] = useState(false);
  const [isDAWReady, setIsDAWReady] = useState(false);
  
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

  // Handle reflection complete
  const handleReflectionComplete = () => {
    console.log('🎉 Reflection complete!', { isSessionMode, showBonus });
    
    // In session mode, show bonus activity option
    if (isSessionMode) {
      setShowBonus(true);
    } else {
      // In normal mode, just call onComplete to advance
      onComplete();
    }
  };

  // If bonus is showing, render the bonus activity
  if (showBonus) {
    return (
      <div className="h-screen w-full flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header with option to go back */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">🎮 Bonus Activity: Name That Loop!</h2>
            <p className="text-blue-100">Play the listening game with a partner</p>
          </div>
          <button
            onClick={() => setShowBonus(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            ← Back to Reflection
          </button>
        </div>
        
        {/* Bonus Activity */}
        <div className="flex-1 overflow-hidden">
          <NameThatLoopActivity 
            onComplete={() => {
              console.log('Bonus activity complete');
              onComplete(); // Still marks reflection as complete
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 relative">
      {/* Loading Overlay - Show while DAW initializes */}
      {!isDAWReady && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-white text-xl mb-4">Loading Reflection Activity...</div>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <div className="text-gray-400 text-sm mt-4">Preparing your composition</div>
          </div>
        </div>
      )}

      {/* Main DAW Area - Full Screen */}
      <div className="flex-1 flex flex-col min-h-0">
        <MusicComposer
          onDAWReadyCallback={() => {
            console.log('✅ DAW ready for reflection activity');
            setIsDAWReady(true);
          }}
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
          assignmentPanelContent={null}
        />
      </div>

      {/* Floating Reflection Modal - Only show when DAW is ready */}
      {isDAWReady && (
        <ReflectionModal
          compositionData={compositionData}
          onComplete={handleReflectionComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      )}
    </div>
  );
};

export default TwoStarsAndAWishActivity;