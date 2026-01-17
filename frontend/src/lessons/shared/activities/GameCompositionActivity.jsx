// File: GameCompositionActivity.jsx
// Video Game Montage Composition - Lesson 5 (Game On! - Melody & Contour)
// Based on SportsCompositionActivity pattern
// Features: Video selection, DAW with Melody Maker + Beat Maker, auto-save, Join page integration
// SEAMLESS CURSOR: Uses chromebook-hide-cursor for seamless custom cursor across entire activity

import React, { useState, useEffect, useRef } from 'react';

// Detect Chromebook for seamless cursor
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS')
);
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { useAutoSave } from '../../../hooks/useAutoSave.jsx';
import TwoStarsAndAWishActivity from './two-stars-and-a-wish/TwoStarsAndAWishActivity';
import { useTimerSound } from '../hooks/useTimerSound';
import { useSession } from '../../../context/SessionContext';
import { saveStudentWork, loadStudentWork, getStudentId } from '../../../utils/studentWorkStorage';
import { getDatabase, ref, onValue } from 'firebase/database';

// Storage keys for Lesson 5
const GAME_SELECTION_KEY = 'lesson5-game-selection';
const SAVED_MELODIES_KEY = 'lesson5-student-melodies';

// Load saved melodies from StudentMelodyMakerActivity (as array for DAW)
const loadSavedMelodies = () => {
  try {
    const saved = localStorage.getItem(SAVED_MELODIES_KEY);
    if (saved) {
      const melodies = JSON.parse(saved);
      // Ensure it's an array and mark for re-rendering
      if (Array.isArray(melodies)) {
        return melodies.map(m => ({
          ...m,
          file: null,
          needsRender: true,
          loaded: false,
          accessible: false
        }));
      }
    }
    return [];
  } catch {
    return [];
  }
};

// Save/load game selection
const saveGameSelection = (gameId, gameTitle) => {
  const selection = { gameId, gameTitle, selectedAt: new Date().toISOString() };
  localStorage.setItem(GAME_SELECTION_KEY, JSON.stringify(selection));
  return selection;
};

const getGameSelection = () => {
  try {
    const data = localStorage.getItem(GAME_SELECTION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const GAME_COMPOSITION_DEADLINE = 12 * 60 * 1000; // 12 minutes

// Video game options - paths relative to public folder
const GAME_VIDEOS = [
  {
    id: 'grow-a-garden',
    title: 'Grow A Garden',
    thumbnail: '/lessons/film-music-project/grow-a-garden-thumb.png',
    videoPath: '/lessons/film-music-project/GrowAGarden.mp4',
    description: 'Cozy Roblox farming game with relaxing vibes',
    emoji: '🌻',
    suggestedMood: 'Upbeat'
  },
  {
    id: 'minecraft',
    title: 'Minecraft Gameplay',
    thumbnail: '/lessons/film-music-project/minecraft-thumb.png',
    videoPath: '/lessons/film-music-project/MinecraftGameplay.mp4',
    description: 'Building and exploring in the blocky world',
    emoji: '⛏️',
    suggestedMood: 'Mysterious'
  },
  {
    id: 'unpacking',
    title: 'Unpacking',
    thumbnail: '/lessons/film-music-project/unpacking-thumb.png',
    videoPath: '/lessons/film-music-project/Unpacking.mp4',
    description: 'Relaxing puzzle game about unpacking boxes',
    emoji: '📦',
    suggestedMood: 'Peaceful'
  }
];

// Helper function to detect video duration
const detectVideoDuration = async (videoPath) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    const timeout = setTimeout(() => {
      video.src = '';
      reject(new Error('Video duration detection timeout'));
    }, 10000);

    video.addEventListener('loadedmetadata', () => {
      clearTimeout(timeout);
      const duration = video.duration;
      console.log(`✅ Detected duration for ${videoPath}: ${duration}s`);
      video.src = '';
      resolve(duration);
    });

    video.addEventListener('error', (e) => {
      clearTimeout(timeout);
      video.src = '';
      reject(new Error(`Video load error: ${e.message || 'Unknown error'}`));
    });

    video.src = videoPath;
  });
};

// Helper to format duration for display
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};


const GameCompositionActivity = ({
  onComplete,
  viewMode = false,
  lessonStartTime,
  isSessionMode = false
}) => {
  const navigate = useNavigate();

  // Session mode detection
  const { getCurrentStage, sessionCode } = useSession();
  const currentStage = isSessionMode ? getCurrentStage() : null;

  // Track save command from teacher
  const lastSaveCommandRef = useRef(null);
  const componentMountTimeRef = useRef(Date.now());
  const isReflectionStage = currentStage === 'reflection' || currentStage === 'reflection-activity';

  // Video selection state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoSelection, setShowVideoSelection] = useState(() => {
    const saved = getGameSelection();
    return !saved;
  });
  const [previewingVideo, setPreviewingVideo] = useState(null);

  // Track detected durations for all videos
  const [videoDurations, setVideoDurations] = useState({});
  const [detectingDurations, setDetectingDurations] = useState(false);

  // Reflection flow states
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionCompleted, setReflectionCompleted] = useState(false);
  const [viewingReflection, setViewingReflection] = useState(false);

  // Student ID
  const [studentId, setStudentId] = useState('');

  // Composition state
  const [placedLoops, setPlacedLoops] = useState([]);
  const [resetKey, setResetKey] = useState(0); // Used to force DAW remount on reset
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [saveMessage, setSaveMessage] = useState(null);
  const [teacherSaveToast, setTeacherSaveToast] = useState(false);
  const timerRef = useRef(null);
  const autoAdvanceCalledRef = useRef(false);
  const isSavingRef = useRef(false);

  // Timer sound hook (plays chime when timer ends)
  const { isMuted, toggleMute, playTimerEndSound } = useTimerSound();

  // Custom melodies from StudentMelodyMakerActivity (passed to DAW as initialCustomLoops)
  const [savedStudentMelodies, setSavedStudentMelodies] = useState(() => loadSavedMelodies());

  // Use ref so it resets on page refresh
  const hasLoadedRef = useRef(false);

  // Refs for current values (used by Firebase listener and unmount save)
  const placedLoopsRef = useRef(placedLoops);
  const studentIdRef = useRef(studentId);
  const selectedVideoRef = useRef(selectedVideo);

  // Keep refs in sync with state
  useEffect(() => {
    placedLoopsRef.current = placedLoops;
  }, [placedLoops]);

  useEffect(() => {
    studentIdRef.current = studentId;
  }, [studentId]);

  useEffect(() => {
    selectedVideoRef.current = selectedVideo;
  }, [selectedVideo]);

  // Initialize student ID
  useEffect(() => {
    const id = getStudentId();
    setStudentId(id);
    console.log('🎮 Student ID:', id);
  }, []);

  // Detect video durations on mount
  useEffect(() => {
    const detectAllDurations = async () => {
      console.log('🎬 Starting video duration detection for all game videos...');
      setDetectingDurations(true);

      const durations = {};

      for (const video of GAME_VIDEOS) {
        try {
          const duration = await detectVideoDuration(video.videoPath);
          durations[video.id] = duration;
        } catch (error) {
          console.error(`❌ Failed to detect duration for ${video.id}:`, error);
        }
      }

      console.log('✅ All video durations detected:', durations);
      setVideoDurations(durations);
      setDetectingDurations(false);
    };

    detectAllDurations();
  }, []);

  // Check if reflection is already completed on mount
  useEffect(() => {
    const savedReflection = localStorage.getItem('game-reflection');
    if (savedReflection) {
      try {
        const data = JSON.parse(savedReflection);
        if (data.submittedAt) {
          setReflectionCompleted(true);
          console.log('✅ Found completed game reflection on mount');
        }
      } catch (error) {
        console.error('Error loading reflection:', error);
      }
    }
  }, []);

  // Reflection detection - shows modal when teacher advances to reflection stage
  // Only show reflection modal if:
  // - We're in reflection stage
  // - Modal isn't already showing
  // - Not already completed (submitted) the reflection
  // - Have a valid student ID
  useEffect(() => {
    if (isReflectionStage && !showReflection && !viewingReflection && !reflectionCompleted && studentId) {
      console.log('✅ Showing reflection modal');
      setShowReflection(true);

      if (reflectionCompleted) {
        setViewingReflection(true);
      }
    }
  }, [isReflectionStage, reflectionCompleted, studentId, showReflection, viewingReflection]);

  // Load previously selected video on mount - WITH detected duration
  useEffect(() => {
    const savedVideoSelection = getGameSelection();
    console.log('🎬 Loading saved video selection:', savedVideoSelection);

    if (savedVideoSelection) {
      const videoTemplate = GAME_VIDEOS.find(v => v.id === savedVideoSelection.gameId);
      console.log('🎬 Found video template:', videoTemplate);

      if (videoTemplate) {
        if (videoDurations[videoTemplate.id]) {
          const video = {
            ...videoTemplate,
            duration: videoDurations[videoTemplate.id]
          };
          setSelectedVideo(video);
          setVideoDuration(video.duration);
          setShowVideoSelection(false);
          setIsLoadingVideo(false);
          console.log('✅ Loaded saved video with detected duration:', video.title, 'Duration:', video.duration, 's');
        } else {
          console.log('⏳ Waiting for duration detection to complete...');
          setIsLoadingVideo(true);
        }
      } else {
        console.warn('⚠️ Saved video not found for ID:', savedVideoSelection.gameId, '- showing selection screen');
        setShowVideoSelection(true);
        setIsLoadingVideo(false);
      }
    } else {
      console.log('ℹ️ No saved video selection found');
      setIsLoadingVideo(false);
    }
  }, [videoDurations]);

  // AUTO-SAVE
  const compositionData = {
    placedLoops,
    videoDuration,
    videoId: selectedVideo?.id,
    timestamp: Date.now()
  };

  const { hasSavedWork, loadSavedWork } = useAutoSave(
    studentId,
    'game-composition',
    compositionData,
    5000
  );

  // Silent auto-save every 30 seconds
  useEffect(() => {
    if (!studentId || !selectedVideo || viewMode) return;

    const autoSaveInterval = setInterval(() => {
      if (placedLoops.length > 0) {
        handleManualSave(true); // silent save
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [studentId, selectedVideo, placedLoops, viewMode]);

  // Listen for teacher's save command from Firebase
  useEffect(() => {
    // Don't set up listener until we have studentId ready
    if (!sessionCode || !isSessionMode || viewMode || !studentId) return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${sessionCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();

      if (!saveCommand) return;

      // Only process save commands that were issued AFTER this component mounted
      if (saveCommand <= componentMountTimeRef.current) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }

      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('💾 Teacher save command received for game composition!');

        // Use state values (effect will recreate with fresh values when these change)
        if (placedLoops.length > 0 && selectedVideo) {
          handleManualSave(true); // Silent save

          // Show toast notification
          setTeacherSaveToast(true);
          setTimeout(() => setTeacherSaveToast(false), 3000);
        } else {
          console.log('⚠️ Teacher save command received but nothing to save:', {
            hasLoops: placedLoops.length > 0,
            hasStudentId: !!studentId,
            hasVideo: !!selectedVideo
          });
        }
      }
    });

    return () => unsubscribe();
  }, [sessionCode, isSessionMode, viewMode, studentId, placedLoops, selectedVideo]);

  // Safety net: Save on unmount
  useEffect(() => {
    if (!isSessionMode || viewMode) return;

    return () => {
      if (placedLoopsRef.current.length > 0 && studentIdRef.current && selectedVideoRef.current) {
        console.log('💾 Saving on unmount (safety net)...');
        const videoToSave = selectedVideoRef.current;
        const loopsToSave = placedLoopsRef.current;

        const compositionToSave = {
          videoId: videoToSave.id,
          videoTitle: videoToSave.title,
          videoDuration: videoToSave.duration,
          placedLoops: loopsToSave,
          savedAt: new Date().toISOString()
        };

        saveStudentWork('game-composition', {
          title: videoToSave.title,
          emoji: videoToSave.emoji || '🎮',
          viewRoute: '/lessons/film-music-project/lesson5?view=saved',
          subtitle: `${loopsToSave.length} loops • ${formatDuration(videoToSave.duration)}`,
          category: 'Film Music Project',
          data: compositionToSave
        }, studentIdRef.current);
        console.log('💾 Unmount save complete for student:', studentIdRef.current);
      }
    };
  }, [isSessionMode, viewMode]);

  // Load saved work on mount
  useEffect(() => {
    if (!studentId || !selectedVideo) return;

    if (hasLoadedRef.current) {
      console.log('⏭️ Already loaded this session, skipping');
      return;
    }

    console.log('🎬 Initial load - checking for saved work');

    const savedWork = loadStudentWork('game-composition');

    if (savedWork && savedWork.data) {
      console.log('📂 Found saved work:', savedWork);

      if (savedWork.data.placedLoops && savedWork.data.placedLoops.length > 0) {
        if (savedWork.data.videoId === selectedVideo.id) {
          setPlacedLoops(savedWork.data.placedLoops);
          setVideoDuration(savedWork.data.videoDuration || selectedVideo.duration);
          console.log('✅ Loaded:', savedWork.data.placedLoops.length, 'loops for', selectedVideo.title);
          hasLoadedRef.current = true;
          return;
        } else {
          console.log('⚠️ Saved video mismatch - saved:', savedWork.data.videoId, 'current:', selectedVideo.id);
        }
      }
    }

    // Fallback to auto-save
    if (hasSavedWork) {
      const saved = loadSavedWork();
      if (saved && saved.placedLoops && saved.placedLoops.length > 0) {
        if (!saved.videoId || saved.videoId === selectedVideo.id) {
          setPlacedLoops(saved.placedLoops || []);
          setVideoDuration(saved.videoDuration || selectedVideo.duration);
          console.log('✅ Auto-loaded previous work:', saved.placedLoops.length, 'loops');
          hasLoadedRef.current = true;
          return;
        }
      }
    }

    console.log('ℹ️ No saved work found for this video');
    hasLoadedRef.current = true;
  }, [studentId, hasSavedWork, loadSavedWork, selectedVideo]);

  // Manual save handler
  const handleManualSave = (silent = false) => {
    if (isSavingRef.current) {
      console.log('⏸️ Save already in progress, skipping duplicate');
      return;
    }

    if (!studentId || !selectedVideo) {
      if (!silent) {
        setSaveMessage({ type: 'error', text: '❌ Cannot save: Missing student ID or video selection' });
        setTimeout(() => setSaveMessage(null), 3000);
      }
      return;
    }

    if (placedLoops.length === 0) {
      if (!silent) {
        setSaveMessage({ type: 'error', text: '❌ Cannot save: No loops placed yet' });
        setTimeout(() => setSaveMessage(null), 3000);
      }
      return;
    }

    isSavingRef.current = true;

    saveStudentWork('game-composition', {
      title: selectedVideo.title,
      emoji: selectedVideo.emoji,
      viewRoute: '/lessons/film-music-project/lesson5?view=saved',
      subtitle: `${placedLoops.length} loops • ${formatDuration(videoDuration)}`,
      category: 'Film Music Project',
      data: {
        placedLoops,
        videoDuration,
        videoId: selectedVideo.id,
        videoTitle: selectedVideo.title,
        videoPath: selectedVideo.videoPath,
        videoEmoji: selectedVideo.emoji,
        timestamp: Date.now()
      }
    }, studentId);

    console.log('💾 Saved game composition for student:', studentId);

    if (!silent) {
      setSaveMessage({ type: 'success', text: '✅ Saved! View anytime from the Join page.' });
      setTimeout(() => setSaveMessage(null), 4000);
    }

    setTimeout(() => {
      isSavingRef.current = false;
    }, 500);
  };

  // Timer (self-guided mode only)
  useEffect(() => {
    if (!lessonStartTime || viewMode || isSessionMode) return;

    const calculateRemaining = () => {
      const elapsed = Date.now() - lessonStartTime;
      return Math.max(0, GAME_COMPOSITION_DEADLINE - elapsed);
    };

    setTimeRemaining(calculateRemaining());

    timerRef.current = setInterval(() => {
      const newRemaining = calculateRemaining();
      setTimeRemaining(newRemaining);

      if (newRemaining <= 0 && !autoAdvanceCalledRef.current) {
        autoAdvanceCalledRef.current = true;
        clearInterval(timerRef.current);

        // Play timer end sound
        playTimerEndSound();

        if (onComplete) {
          setTimeout(() => onComplete(), 2000);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lessonStartTime, onComplete, viewMode, isSessionMode, playTimerEndSound]);

  const formatTime = (ms) => {
    if (!ms || ms < 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Video selection handlers
  const handleVideoSelect = (video) => {
    console.log('🎬 Video selected:', video.title);

    const detectedDuration = videoDurations[video.id];

    if (!detectedDuration) {
      console.error('❌ Duration not available for video:', video.id);
      alert('Video duration not loaded yet. Please wait a moment and try again.');
      return;
    }

    const videoWithDuration = {
      ...video,
      duration: detectedDuration
    };

    setSelectedVideo(videoWithDuration);
    setVideoDuration(detectedDuration);
    setShowVideoSelection(false);
    saveGameSelection(video.id, video.title);

    console.log('✅ Video selected with detected duration:', videoWithDuration.title, 'Duration:', detectedDuration, 's');
  };

  const handlePreviewVideo = (video) => {
    console.log('🎬 Previewing video:', video.title);
    setPreviewingVideo(video);
  };

  const handleClosePreview = () => {
    setPreviewingVideo(null);
  };

  const handleConfirmVideo = () => {
    if (previewingVideo) {
      handleVideoSelect(previewingVideo);
      setPreviewingVideo(null);
    }
  };

  const handleChangeVideo = () => {
    const confirmChange = window.confirm(
      'Change video? Your loops will stay on the timeline and play with the new video you select.'
    );

    if (confirmChange) {
      console.log('🔄 Showing video selection (keeping current composition loaded)');
      setShowVideoSelection(true);
    }
  };

  // Composition event handlers
  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    const newLoop = {
      id: `${loopData.id}-${Date.now()}`,
      originalId: loopData.id,
      name: loopData.name,
      file: loopData.file,
      duration: loopData.duration,
      category: loopData.category,
      mood: loopData.mood,
      color: loopData.color,
      trackIndex: trackIndex,
      startTime: startTime,
      endTime: startTime + loopData.duration,
      volume: 1.0
    };

    setPlacedLoops(prev => [...prev, newLoop]);
  };

  const handleLoopDeleted = (loopId) => {
    setPlacedLoops(prev => prev.filter(loop => loop.id !== loopId));
  };

  const handleLoopUpdated = (loopId, updates) => {
    setPlacedLoops(prev => prev.map(loop =>
      loop.id === loopId ? { ...loop, ...updates } : loop
    ));
  };

  // Video preview fullscreen
  if (previewingVideo) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Preview: {previewingVideo.title}
          </h2>
          <button
            onClick={handleClosePreview}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            ✕ Close Preview
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <video
            src={previewingVideo.videoPath}
            controls
            autoPlay
            className="max-w-full max-h-full"
            style={{ maxHeight: 'calc(100vh - 180px)' }}
          >
            <source src={previewingVideo.videoPath} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="bg-gray-900 p-6 flex items-center justify-center gap-4">
          <button
            onClick={handleClosePreview}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-lg transition-colors"
          >
            ← Back to Selection
          </button>
          <button
            onClick={handleConfirmVideo}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-bold text-lg shadow-lg transition-all"
          >
            ✓ Compose with {previewingVideo.title}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if ((isLoadingVideo || (!selectedVideo && !showVideoSelection) || detectingDurations) && !viewMode && !isReflectionStage) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>{detectingDurations ? 'Detecting video durations...' : 'Loading video...'}</p>
        </div>
      </div>
    );
  }

  // Main activity
  return (
    <div className={`h-full flex flex-col bg-gray-900 relative ${isChromebook ? 'chromebook-hide-cursor' : ''}`}>
      {/* Save Message Toast */}
      {saveMessage && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg shadow-xl font-bold text-white transition-all duration-300 ${
            saveMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
          style={{ animation: 'fadeIn 0.3s ease-in' }}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Teacher Save Toast */}
      {teacherSaveToast && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg shadow-xl font-bold text-white bg-blue-600"
          style={{ animation: 'fadeIn 0.3s ease-in' }}
        >
          ✅ Your work has been saved!
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold">
              {selectedVideo?.emoji} {selectedVideo?.title} - Composition
              {selectedVideo?.duration && (
                <span className="text-xs text-gray-400 ml-2">
                  ({formatDuration(selectedVideo.duration)})
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {studentId && selectedVideo && placedLoops.length > 0 && (
              <>
                <button
                  onClick={() => handleManualSave()}
                  className="px-4 py-1.5 text-sm rounded bg-green-600 hover:bg-green-700 font-bold transition-colors"
                >
                  💾 Save
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to start over? This will clear all your loops and cannot be undone.')) {
                      setPlacedLoops([]);
                      setResetKey(prev => prev + 1); // Force DAW remount
                    }
                  }}
                  className="px-4 py-1.5 text-sm rounded bg-red-600 hover:bg-red-700 font-bold transition-colors"
                >
                  🔄 Reset
                </button>
              </>
            )}

            <div className="text-xs text-gray-400">
              {placedLoops.length} loops
            </div>

            {lessonStartTime && !isSessionMode && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Time:</span>
                <span className="font-mono">{formatTime(timeRemaining)}</span>
                <button
                  onClick={toggleMute}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                  title={isMuted ? 'Unmute timer sound' : 'Mute timer sound'}
                >
                  {isMuted ? '🔇' : '🔔'}
                </button>
              </div>
            )}

            {viewMode && (
              <button
                onClick={() => navigate('/')}
                className="px-4 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {selectedVideo ? (
          <MusicComposer
            key={`game-composer-${selectedVideo?.id || 'none'}-${resetKey}`}
            onLoopDropCallback={handleLoopPlaced}
            onLoopDeleteCallback={handleLoopDeleted}
            onLoopUpdateCallback={handleLoopUpdated}
            tutorialMode={false}
            preselectedVideo={{
              id: selectedVideo.id,
              title: selectedVideo.title,
              duration: selectedVideo.duration,
              videoPath: selectedVideo.videoPath
            }}
            restrictToCategory={null}
            lockedMood={null}
            showSoundEffects={true}
            showCreatorTools={true}
            hideHeader={true}
            hideSubmitButton={true}
            isLessonMode={true}
            showToast={(msg, type) => console.log(msg, type)}
            initialPlacedLoops={placedLoops}
            initialCustomLoops={savedStudentMelodies}
            readOnly={viewMode || showReflection}
            assignmentPanelContent={null}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
      </div>

      {/* Reflection Modal */}
      {showReflection && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center">
          <TwoStarsAndAWishActivity
            activityType="melody-spotlight"
            compositionData={{
              placedLoops,
              videoDuration,
              videoId: selectedVideo?.id,
              videoTitle: selectedVideo?.title
            }}
            onComplete={() => {
              setReflectionCompleted(true);
              setShowReflection(false);
              setViewingReflection(false);
              localStorage.setItem('game-reflection', JSON.stringify({ submittedAt: new Date().toISOString() }));
            }}
            viewMode={viewingReflection}
            isSessionMode={isSessionMode}
          />
        </div>
      )}

      {/* Video Selection Overlay */}
      {showVideoSelection && !viewMode && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6 overflow-y-auto restore-cursor">
          <div className="max-w-5xl w-full my-4">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-white mb-3">
                🎮 Choose Your Video Game
              </h1>
              <p className="text-xl text-purple-200">
                Pick a video to score with your melody and loops!
              </p>
              {detectingDurations && (
                <p className="text-sm text-yellow-300 mt-2">
                  ⏳ Detecting video durations...
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {GAME_VIDEOS.map((video) => {
                const duration = videoDurations[video.id];
                const durationDisplay = duration
                  ? formatDuration(duration)
                  : '...';

                return (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="relative h-40 bg-gray-900 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-7xl">
                        {video.emoji}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      {video.suggestedMood && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                          {video.suggestedMood}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>⏱️ {durationDisplay}</span>
                      </div>

                      <button
                        onClick={() => handlePreviewVideo(video)}
                        disabled={!duration}
                        className={`w-full py-2.5 rounded-lg font-bold transition-all shadow-lg text-base ${
                          duration
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {duration ? '👁️ Watch Preview' : '⏳ Loading...'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCompositionActivity;
