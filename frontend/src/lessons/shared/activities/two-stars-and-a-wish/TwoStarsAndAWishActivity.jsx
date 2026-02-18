// File: /src/lessons/film-music-project/lesson1/activities/two-stars-and-a-wish/TwoStarsAndAWishActivity.jsx
// Main wrapper component for the reflection activity
// UPDATED: Accepts compositionData prop for use as modal in other lessons
// When compositionData prop is provided, shows only ReflectionModal (DAW already visible behind)
// When no prop, loads from localStorage and shows full DAW + modal (standalone mode)

import React, { useState, useEffect } from 'react';
import MusicComposer from "../../../../pages/projects/film-music-score/composer/MusicComposer";
import ReflectionModal from './ReflectionModal';
import NameThatLoopActivity from '../layer-detective/NameThatLoopActivity';
import LoopLabActivity from '../loop-lab/LoopLabActivity';
import { loadStudentWork, getStudentId } from '../../../../utils/studentWorkStorage';

// Lesson-specific configuration for standalone mode
const LESSON_CONFIGS = {
  'school-beneath': {
    localStorageKeys: ['school-beneath-composition', 'school-beneath'],
    studentWorkKey: null,
    reflectionKey: 'school-beneath-reflection',
    video: {
      id: 'school-beneath',
      title: 'The School Beneath',
      videoPath: '/lessons/videos/film-music-loop-project/SchoolMystery.mp4'
    },
    filterLoopCategory: 'Mysterious'
  },
  'adventure-composition': {
    localStorageKeys: [],
    studentWorkKey: 'adventure-composition',
    reflectionKey: 'adventure-reflection',
    video: null,
    filterLoopCategory: null
  },
  'city-composition': {
    localStorageKeys: [],
    studentWorkKey: 'city-composition',
    reflectionKey: 'city-reflection',
    video: null,
    filterLoopCategory: null
  },
  'wildlife-composition': {
    localStorageKeys: [],
    studentWorkKey: 'wildlife-composition',
    reflectionKey: 'wildlife-reflection',
    video: null,
    filterLoopCategory: null
  },
  'sports-composition': {
    localStorageKeys: [],
    studentWorkKey: 'sports-composition',
    reflectionKey: 'sports-reflection',
    video: null,
    filterLoopCategory: null
  },
  'game-composition': {
    localStorageKeys: [],
    studentWorkKey: 'game-composition',
    reflectionKey: 'game-reflection',
    video: null,
    filterLoopCategory: null
  }
};

// Helper function to load composition data (pure function, no state updates)
const loadCompositionFromStorage = () => {
  // Try each lesson's storage keys in order
  for (const [lessonId, config] of Object.entries(LESSON_CONFIGS)) {
    // First try direct localStorage keys
    for (const key of config.localStorageKeys || []) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          console.log(`Found composition in localStorage: ${key}`);
          return {
            lessonType: lessonId,
            data: {
              placedLoops: data.placedLoops || [],
              requirements: data.requirements || {},
              videoDuration: data.videoDuration || 60,
              videoId: data.videoId || null,
              videoTitle: data.videoTitle || null,
              videoPath: data.videoPath || null
            }
          };
        } catch (error) {
          console.error(`Error loading composition from ${key}:`, error);
        }
      }
    }

    // Then try studentWorkStorage
    if (config.studentWorkKey) {
      const savedWork = loadStudentWork(config.studentWorkKey);
      if (savedWork && savedWork.data) {
        console.log(`Found composition in studentWorkStorage: ${config.studentWorkKey}`);
        const data = savedWork.data;
        return {
          lessonType: lessonId,
          data: {
            placedLoops: data.placedLoops || [],
            requirements: data.requirements || {},
            videoDuration: data.videoDuration || 60,
            videoId: data.videoId || null,
            videoTitle: data.videoTitle || null,
            videoPath: data.videoPath || null
          }
        };
      }
    }
  }
  return null;
};

const TwoStarsAndAWishActivity = ({
  onComplete,
  viewMode = false,
  isSessionMode = false,
  compositionData: propsCompositionData = null,  // Accept composition data as prop
  activityType = null,  // Optional activity type for different reflection contexts
  activityId = null  // Optional activity ID for Firebase save (e.g., 'll-lesson3-reflection')
}) => {
  const [showBonus, setShowBonus] = useState(false);
  const [isDAWReady, setIsDAWReady] = useState(false);
  const [reflectionCompleted, setReflectionCompleted] = useState(false);

  // Load composition data once on mount (use lazy initial state)
  const [storedComposition] = useState(() => {
    if (propsCompositionData) return null; // Don't load if props provided
    return loadCompositionFromStorage();
  });

  // Determine if we're in "modal mode" (compositionData passed as prop)
  // In modal mode, the DAW is already showing behind us, so we just show the reflection modal
  const isModalMode = propsCompositionData !== null;

  // Use prop data if provided, otherwise use stored data
  const compositionData = propsCompositionData || storedComposition?.data || null;
  const lessonType = storedComposition?.lessonType || 'school-beneath';

  // Check if reflection is already completed when component mounts
  useEffect(() => {
    // Check all possible reflection keys
    const reflectionKeys = ['school-beneath-reflection', 'game-reflection'];
    for (const key of reflectionKeys) {
      const savedReflection = localStorage.getItem(key);
      if (savedReflection) {
        try {
          const data = JSON.parse(savedReflection);
          if (data.submittedAt) {
            setReflectionCompleted(true);
            break;
          }
        } catch (error) {
          console.error('Error loading reflection status:', error);
        }
      }
    }
  }, []);

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
    
    // Mark reflection as completed
    setReflectionCompleted(true);
    
    // In session mode, show bonus activity option
    if (isSessionMode) {
      setShowBonus(true);
    } else {
      // In normal mode, just call onComplete to advance
      onComplete();
    }
  };

  // If bonus is showing, render the bonus activity
  // Lesson 5 (game-composition) uses Loop Lab, others use Name That Loop
  if (showBonus) {
    const isLesson5 = lessonType === 'game-composition';

    return (
      <div className="h-screen w-full flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header with option to go back */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isLesson5 ? '🎮 Bonus Activity: Loop Lab!' : '🎮 Bonus Activity: Name That Loop!'}
            </h2>
            <p className="text-blue-100">
              {isLesson5 ? 'Create and mix loops in the lab' : 'Play the listening game with a partner'}
            </p>
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
          {isLesson5 ? (
            <LoopLabActivity
              onComplete={() => {
                console.log('Loop Lab bonus activity complete');
                onComplete();
              }}
            />
          ) : (
            <NameThatLoopActivity
              onComplete={() => {
                console.log('Name That Loop bonus activity complete');
                onComplete();
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // MODAL MODE: When compositionData is passed as prop, DAW is already visible behind
  // Just render the ReflectionModal directly
  if (isModalMode) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <ReflectionModal
          compositionData={compositionData}
          onComplete={handleReflectionComplete}
          viewMode={reflectionCompleted ? true : viewMode}
          isSessionMode={isSessionMode}
          activityId={activityId}
        />
      </div>
    );
  }

  // Get the lesson config for the current lesson type
  const lessonConfig = LESSON_CONFIGS[lessonType] || LESSON_CONFIGS['school-beneath'];

  // Determine the video to use - either from config or from composition data
  const getVideoForReflection = () => {
    if (lessonConfig.video) {
      // Use predefined video from config (e.g., School Beneath)
      return {
        ...lessonConfig.video,
        duration: compositionData?.videoDuration || 60
      };
    } else if (compositionData?.videoId) {
      // Use video from composition data (e.g., Game Composition)
      // Map video IDs to paths for Lesson 5 game videos
      const gameVideoPaths = {
        'grow-a-garden': '/lessons/film-music-project/GrowAGarden.mp4',
        'minecraft': '/lessons/film-music-project/MinecraftGameplay.mp4',
        'unpacking': '/lessons/film-music-project/Unpacking.mp4'
      };
      return {
        id: compositionData.videoId,
        title: compositionData.videoTitle || 'Game Video',
        duration: compositionData.videoDuration || 60,
        videoPath: gameVideoPaths[compositionData.videoId] || compositionData.videoPath
      };
    }
    // Fallback
    return {
      id: 'school-beneath',
      title: 'The School Beneath',
      duration: 60,
      videoPath: '/lessons/videos/film-music-loop-project/SchoolMystery.mp4'
    };
  };

  const videoConfig = getVideoForReflection();

  // STANDALONE MODE: Render full DAW + reflection modal
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
          preselectedVideo={videoConfig}
          filterLoopCategory={lessonConfig.filterLoopCategory}
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
          viewMode={reflectionCompleted ? true : viewMode}
          isSessionMode={isSessionMode}
          activityId={activityId}
        />
      )}
    </div>
  );
};

export default TwoStarsAndAWishActivity;