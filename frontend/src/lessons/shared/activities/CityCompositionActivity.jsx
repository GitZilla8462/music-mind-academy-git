// File: CityCompositionActivity.jsx
// City Soundscape Composition - Matches SportsCompositionActivity structure
// Uses MusicComposer component with city video selection
// ✅ UPDATED: Added SAVE button to manually save composition to localStorage
// ✅ FIXED: Changed sessionStorage to useRef to allow reload on refresh
// ✅ UPDATED: Changed bonus activity from Layer Detective to Loop Lab
// SEAMLESS CURSOR: Uses chromebook-hide-cursor for seamless custom cursor across entire activity

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Detect Chromebook for seamless cursor
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS')
);
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { useAutoSave } from '../../../hooks/useAutoSave.jsx';
import CityReflectionModal from './two-stars-and-a-wish/CityReflectionModal';
import { useTimerSound } from '../hooks/useTimerSound';
import LoopLab from './loop-lab/LoopLabActivity';
import { useSession } from '../../../context/SessionContext';
import { saveSelectedVideo, getSelectedVideo } from '../../film-music-project/lesson2/lesson2StorageUtils';

const CITY_COMPOSITION_DEADLINE = 10 * 60 * 1000; // 10 minutes

// City video options - durations will be detected dynamically
const CITY_VIDEOS = [
  {
    id: 'nyc',
    title: 'New York City',
    subtitle: 'The City That Never Sleeps',
    videoPath: '/lessons/film-music-project/lesson2/NYCMontage.mp4',
    emoji: '🗽'
  },
  {
    id: 'paris',
    title: 'Paris',
    subtitle: 'The City of Light',
    videoPath: '/lessons/film-music-project/lesson2/ParisMontage.mp4',
    emoji: '🗼'
  },
  {
    id: 'madrid',
    title: 'Madrid',
    subtitle: 'The Heart of Spain',
    videoPath: '/lessons/film-music-project/lesson2/MadridMontage.mp4',
    emoji: '🏛️'
  },
  {
    id: 'tokyo',
    title: 'Tokyo',
    subtitle: 'The City of the Future',
    videoPath: '/lessons/film-music-project/lesson2/TokyoMontage.mp4',
    emoji: '🏯'
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
      console.log(`✅ Detected duration for ${videoPath}: ${duration}s (${Math.floor(duration/60)}:${Math.floor(duration%60).toString().padStart(2, '0')})`);
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

const CityCompositionActivity = ({ 
  onComplete, 
  viewMode = false, 
  lessonStartTime,
  isSessionMode = false
}) => {
  const navigate = useNavigate();
  
  // Session mode detection
  const { getCurrentStage, sessionCode } = useSession();
  const currentStage = isSessionMode ? getCurrentStage() : null;
  const isReflectionStage = currentStage === 'reflection' || currentStage === 'reflection-activity';
  
  // Video selection state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoSelection, setShowVideoSelection] = useState(() => {
    const saved = getSelectedVideo();
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
  const [showBonusGame, setShowBonusGame] = useState(false);
  
  // Student ID
  const [studentId, setStudentId] = useState('');
  
  // Composition state
  const [placedLoops, setPlacedLoops] = useState([]);
  const [resetKey, setResetKey] = useState(0); // Used to force DAW remount on reset
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [saveMessage, setSaveMessage] = useState(null);
  const timerRef = useRef(null);
  const autoAdvanceCalledRef = useRef(false);

  // Timer sound hook (plays chime when timer ends)
  const { isMuted, toggleMute, playTimerEndSound } = useTimerSound();

  // ✅ FIXED: Use ref instead of sessionStorage so it resets on page refresh
  const hasLoadedRef = useRef(false);
  const isSavingRef = useRef(false);

  // Track save command from teacher
  const lastSaveCommandRef = useRef(null);
  const componentMountTimeRef = useRef(Date.now());

  // Teacher save toast
  const [teacherSaveToast, setTeacherSaveToast] = useState(false);

  // Initialize student ID
  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
    console.log('🏙️ Student ID:', id);
  }, []);
  
  // Detect video durations on mount
  useEffect(() => {
    const detectAllDurations = async () => {
      console.log('🎬 Starting video duration detection for all city videos...');
      setDetectingDurations(true);
      
      const durations = {};
      
      for (const video of CITY_VIDEOS) {
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
    const savedReflection = localStorage.getItem('city-reflection');
    if (savedReflection) {
      try {
        const data = JSON.parse(savedReflection);
        if (data.submittedAt) {
          setReflectionCompleted(true);
          console.log('✅ Found completed city reflection on mount');
        }
      } catch (error) {
        console.error('Error loading reflection:', error);
      }
    }
  }, []);
  
  // REFLECTION DETECTION - Shows modal when teacher advances to reflection stage
  useEffect(() => {
    console.log('🏙️ Reflection Check:', {
      isReflectionStage,
      reflectionCompleted,
      studentId,
      showReflection,
      viewingReflection
    });
    
    // Only show reflection modal if:
    // - We're in reflection stage
    // - Modal isn't already showing
    // - Not already completed (submitted) the reflection
    // - Not viewing the bonus game
    // - Have a valid student ID
    if (isReflectionStage && !showReflection && !viewingReflection && !reflectionCompleted && !showBonusGame && studentId) {
      console.log('✅ Showing reflection modal');
      setShowReflection(true);
      
      if (reflectionCompleted) {
        setViewingReflection(true);
      }
    }
  }, [isReflectionStage, reflectionCompleted, studentId, showReflection, viewingReflection]);
  
  // Load previously selected video on mount - WITH detected duration
  useEffect(() => {
    const savedVideoSelection = getSelectedVideo();
    console.log('🎬 Loading saved video selection:', savedVideoSelection);
    
    if (savedVideoSelection) {
      const videoTemplate = CITY_VIDEOS.find(v => v.id === savedVideoSelection.videoId);
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
        console.error('❌ Video not found for ID:', savedVideoSelection.videoId);
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
    'city-composition',
    compositionData,
    5000
  );
  
  // ✅ SILENT AUTO-SAVE - Saves to same location as manual save every 30 seconds
  useEffect(() => {
    if (!studentId || !selectedVideo || viewMode) return;
    
    const autoSaveInterval = setInterval(() => {
      if (placedLoops.length > 0) {
        handleManualSave(true); // silent save
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [studentId, selectedVideo, placedLoops, viewMode]);

  // ✅ Auto-save on unmount (when student leaves the activity)
  // This ensures work is saved even if teacher triggers save while student is on another activity
  useEffect(() => {
    return () => {
      if (isSessionMode && !viewMode && placedLoops.length > 0 && studentId && selectedVideo) {
        console.log('💾 Auto-saving city composition on unmount...');
        const savedData = {
          placedLoops,
          videoDuration,
          requirements: { minLoops: 5, completed: placedLoops.length >= 5 },
          videoId: selectedVideo.id,
          videoTitle: selectedVideo.title,
          videoPath: selectedVideo.videoPath,
          savedAt: new Date().toISOString()
        };
        const key = `mma-saved-city-soundscapes-${studentId}`;
        localStorage.setItem(key, JSON.stringify(savedData));
      }
    };
  }, [isSessionMode, viewMode, placedLoops, studentId, selectedVideo, videoDuration]);

  // ✅ Listen for teacher's save command from Firebase
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
        console.log('💾 Teacher save command received for city composition!');

        if (placedLoops.length > 0 && selectedVideo) {
          handleManualSave(true); // Silent save

          // Show toast notification
          setTeacherSaveToast(true);
          setTimeout(() => setTeacherSaveToast(false), 3000);
        }
      }
    });

    return () => unsubscribe();
  }, [sessionCode, isSessionMode, viewMode, studentId, placedLoops, selectedVideo]);

  // Load saved work on mount ONLY - includes manual saves
  // ✅ FIXED: Use ref instead of sessionStorage so refresh reloads saved work
  useEffect(() => {
    if (!studentId || !selectedVideo) return;
    
    // Skip if already loaded this session (ref resets on refresh, allowing reload)
    if (hasLoadedRef.current) {
      console.log('⏭️ Already loaded this session, skipping');
      return;
    }
    
    console.log('🎬 Initial load - checking for saved work');
    
    // First try to load from manual save (has video metadata)
    const manualSaveKey = `city-composition-${studentId}`;
    const manualSave = localStorage.getItem(manualSaveKey);
    
    if (manualSave) {
      try {
        const data = JSON.parse(manualSave);
        console.log('📂 Found manual save:', data);
        
        if (data.composition && data.composition.placedLoops && data.composition.placedLoops.length > 0) {
          // Make sure loops match the current video
          if (data.composition.videoId === selectedVideo.id) {
            setPlacedLoops(data.composition.placedLoops);
            setVideoDuration(data.composition.videoDuration || selectedVideo.duration);
            console.log('✅ Loaded from manual save:', data.composition.placedLoops.length, 'loops for', selectedVideo.title);
            hasLoadedRef.current = true;
            return;
          } else {
            console.log('⚠️ Saved video mismatch - saved:', data.composition.videoId, 'current:', selectedVideo.id);
          }
        }
      } catch (error) {
        console.error('Error loading manual save:', error);
      }
    }
    
    // Fallback to auto-save
    if (hasSavedWork) {
      const saved = loadSavedWork();
      if (saved && saved.placedLoops && saved.placedLoops.length > 0) {
        // Check if video matches
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
  
  // REFLECTION VIEW HANDLERS
  const handleViewReflection = () => {
    console.log('👀 Opening city reflection in view mode');
    setViewingReflection(true);
    setShowReflection(true);
  };
  
  // ✅ MANUAL SAVE HANDLER - Saves to localStorage for viewing on join page
  const handleManualSave = (silent = false) => {
    // Prevent duplicate saves
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
    
    // Set saving flag
    isSavingRef.current = true;
    
    const saveKey = `city-composition-${studentId}`;
    const saveData = {
      composition: {
        placedLoops,
        videoDuration,
        videoId: selectedVideo.id,
        videoTitle: selectedVideo.title,
        videoPath: selectedVideo.videoPath,
        videoEmoji: selectedVideo.emoji,
        timestamp: Date.now()
      },
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(saveKey, JSON.stringify(saveData));
    console.log('💾 Manual save complete:', saveKey, saveData);
    
    if (!silent) {
      console.log('🔔 About to show toast message, silent =', silent);
      setSaveMessage({ type: 'success', text: '✅ Composition saved! View it anytime from the Join page.' });
      setTimeout(() => setSaveMessage(null), 4000);
    }
    
    // Reset saving flag after a short delay
    setTimeout(() => {
      isSavingRef.current = false;
    }, 500);
  };
  
  // TIMER (self-guided mode only)
  useEffect(() => {
    if (!lessonStartTime || viewMode || isSessionMode) return;

    const calculateRemaining = () => {
      const elapsed = Date.now() - lessonStartTime;
      return Math.max(0, CITY_COMPOSITION_DEADLINE - elapsed);
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
  
  // VIDEO SELECTION HANDLERS
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
    saveSelectedVideo(video.id, video.title);
    
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
  
  // COMPOSITION EVENT HANDLERS - ✅ FIXED to update state
  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    console.log(`🎵 Loop placed: ${loopData.name} on track ${trackIndex} at ${startTime}s`);
    
    // Create new loop object
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
    
    // Update state
    setPlacedLoops(prev => [...prev, newLoop]);
    console.log(`✅ Added "${loopData.name}" to state - new total: ${placedLoops.length + 1}`);
  };
  
  const handleLoopDeleted = (loopId) => {
    console.log(`🗑️ Loop deleted: ${loopId}`);
    setPlacedLoops(prev => prev.filter(loop => loop.id !== loopId));
    console.log(`✅ Removed loop from state - new total: ${placedLoops.length - 1}`);
  };
  
  const handleLoopUpdated = (loopId, updates) => {
    console.log(`✏️ Loop updated: ${loopId}`, updates);
    setPlacedLoops(prev => prev.map(loop =>
      loop.id === loopId ? { ...loop, ...updates } : loop
    ));
    console.log(`✅ Updated loop in state`);
  };
  
  // VIDEO PREVIEW FULLSCREEN
  if (previewingVideo) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
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
  
  // LOADING STATE - Skip if in reflection mode (modal can show while loading)
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
  
  // MAIN ACTIVITY
  return (
    <div className={`h-full flex flex-col bg-gray-900 relative ${isChromebook ? 'chromebook-hide-cursor' : ''}`}>
      {/* Save Message Toast */}
      {saveMessage && console.log('🎨 RENDERING TOAST:', saveMessage.text)}
      {saveMessage && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg shadow-xl font-bold text-white transition-all duration-300 ${
            saveMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
          style={{
            animation: 'fadeIn 0.3s ease-in'
          }}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Teacher Save Command Toast */}
      {teacherSaveToast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg shadow-xl font-bold text-white bg-blue-600 animate-pulse">
          💾 Your teacher saved your composition!
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
              {selectedVideo?.emoji} {selectedVideo?.title} - City Soundscape
              {selectedVideo?.duration && (
                <span className="text-xs text-gray-400 ml-2">
                  ({Math.floor(selectedVideo.duration / 60)}:{Math.floor(selectedVideo.duration % 60).toString().padStart(2, '0')})
                </span>
              )}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* ✅ SAVE BUTTON - Top Right - Now works in session mode and view mode */}
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
            
            {reflectionCompleted && !showReflection && (
              <button
                onClick={handleViewReflection}
                className="px-3 py-1.5 text-sm rounded bg-yellow-600 hover:bg-yellow-700 font-semibold transition-colors flex items-center gap-1"
              >
                ⭐ View Reflection & Composition
              </button>
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
                onClick={() => {
                  // Auto-save silently before leaving if there are loops
                  if (placedLoops.length > 0 && studentId && selectedVideo) {
                    handleManualSave(true);
                  }
                  navigate('/');
                }}
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
            key={`city-composer-${selectedVideo?.id || 'none'}-${resetKey}`}
            compositionKey={`city-composition-${selectedVideo?.id}`}
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
            hideHeader={true}
            hideSubmitButton={true}
            isLessonMode={true}
            showToast={(msg, type) => console.log(msg, type)}
            initialPlacedLoops={placedLoops}
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

      {showReflection && (
        <CityReflectionModal
          compositionData={{
            placedLoops,
            videoDuration,
            videoId: selectedVideo?.id,
            videoTitle: selectedVideo?.title,
            timestamp: Date.now()
          }}
          onComplete={() => {
            console.log('City reflection onComplete - viewingReflection:', viewingReflection);
            setReflectionCompleted(true);
            setShowReflection(false);
            setViewingReflection(false);
            setShowBonusGame(true);
          }}
          viewMode={viewingReflection}
          isSessionMode={isSessionMode}
        />
      )}
      
      {/* Bonus game as overlay */}
      {/* data-cursor-handled tells MusicComposer's CustomCursor to hide */}
      {/* restore-cursor overrides chromebook-hide-cursor from parent to show native cursor */}
      {showBonusGame && (
        <div className="absolute inset-0 z-50 flex flex-col bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 restore-cursor" data-cursor-handled="true">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">🎧 Bonus: Loop Lab Partner Game!</h2>
              <p className="text-cyan-100">Play with a partner - one hears, one builds!</p>
            </div>
            
            <button
              onClick={() => setShowBonusGame(false)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              ← Back to Composition
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <LoopLab 
              onComplete={() => {
                console.log('Loop Lab complete');
              }}
            />
          </div>
        </div>
      )}
      
      {/* Video selection as overlay - ✅ OPTIMIZED FOR 1366x768 */}
      {showVideoSelection && !viewMode && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 overflow-y-auto restore-cursor">
          <div className="max-w-6xl w-full my-4">
            <div className="text-center mb-5">
              <h1 className="text-3xl font-bold text-white mb-2">
                🏙️ Choose Your City
              </h1>
              <p className="text-lg text-blue-200">
                Select a city to compose music for
              </p>
              {detectingDurations && (
                <p className="text-sm text-yellow-300 mt-2">
                  ⏳ Detecting video durations...
                </p>
              )}
            </div>
            
            {/* ✅ CHANGED: 4 columns with smaller gap and compact cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {CITY_VIDEOS.map((video) => {
                const duration = videoDurations[video.id];
                const durationDisplay = duration 
                  ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`
                  : '...';
                
                return (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    {/* ✅ CHANGED: Reduced height and emoji size */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        {video.emoji}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    
                    {/* ✅ CHANGED: Reduced padding and font sizes */}
                    <div className="p-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{video.subtitle}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>⏱️ {durationDisplay}</span>
                      </div>
                      
                      {/* ✅ CHANGED: Reduced button padding and font size */}
                      <button
                        onClick={() => handlePreviewVideo(video)}
                        disabled={!duration}
                        className={`w-full py-2 rounded-lg font-bold transition-all shadow-lg text-sm ${
                          duration
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
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

export default CityCompositionActivity;