// File: SportsCompositionActivity.jsx
// Sports Highlight Reel Composition - Optimized for Chromebook screens (1366x768)
// FIXED: Removed hard-coded durations - now detects actual video lengths!
// UPDATED: Uses new studentWorkStorage system for Join page integration
// SEAMLESS CURSOR: Uses chromebook-hide-cursor for seamless custom cursor across entire activity

import React, { useState, useEffect, useRef } from 'react';

// Detect Chromebook for seamless cursor
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS') ||
  (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent))
);
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { useAutoSave } from '../../../hooks/useAutoSave.jsx';
import SportsReflectionModal from './two-stars-and-a-wish/SportsReflectionModal';
import { useTimerSound } from '../hooks/useTimerSound';
import NameThatLoopActivity from './layer-detective/NameThatLoopActivity';
import { useSession } from '../../../context/SessionContext';
import { saveSelectedVideo, getSelectedVideo } from '../../film-music-project/lesson4/lesson4StorageUtils';
import { saveStudentWork, loadStudentWork, getStudentId, clearAllCompositionSaves, getClassAuthInfo } from '../../../utils/studentWorkStorage';
import { loadStudentWork as loadFromFirebase } from '../../../firebase/studentWork';
import { getDatabase, ref, onValue } from 'firebase/database';

// Load saved beats from StudentBeatMakerActivity
const SAVED_BEATS_KEY = 'lesson4-student-beats';
const loadSavedBeats = () => {
  try {
    const saved = localStorage.getItem(SAVED_BEATS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const SPORTS_COMPOSITION_DEADLINE = 10 * 60 * 1000; // 10 minutes

// FIXED: Video options WITHOUT hard-coded durations
// Duration will be detected dynamically from the actual video files
const SPORTS_VIDEOS = [
  {
    id: 'soccer',
    title: 'Soccer Highlights',
    thumbnail: '/lessons/film-music-project/lesson4/soccer-thumb.png',
    videoPath: '/lessons/film-music-project/lesson4/SoccerHighlightReel.mp4',
    description: 'Exciting soccer goals, passes, and game action',
    emoji: '⚽'
  },
  {
    id: 'basketball',
    title: 'Basketball Highlights',
    thumbnail: '/lessons/film-music-project/lesson4/basketball-thumb.png',
    videoPath: '/lessons/film-music-project/lesson4/BasketballHighlightReel.mp4',
    description: 'High-energy basketball action with dunks and fast breaks',
    emoji: '🏀'
  },
  {
    id: 'skateboarding',
    title: 'Skateboarding Tricks',
    thumbnail: '/lessons/film-music-project/lesson4/skateboard-thumb.png',
    videoPath: '/lessons/film-music-project/lesson4/SkateboardHighlighReel.mp4',
    description: 'Street skateboarding with technical tricks and stunts',
    emoji: '🛹'
  }
];

// Helper function to detect video duration
// CHROMEBOOK MEMORY OPTIMIZATION: Properly clean up video elements and listeners
const detectVideoDuration = async (videoPath) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    // Store listeners so we can remove them
    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
      video.src = '';
      video.load(); // Force release of video resources
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Video duration detection timeout'));
    }, 10000);

    const onLoadedMetadata = () => {
      clearTimeout(timeout);
      const duration = video.duration;
      console.log(`✅ Detected duration for ${videoPath}: ${duration}s`);
      cleanup();
      resolve(duration);
    };

    const onError = (e) => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error(`Video load error: ${e.message || 'Unknown error'}`));
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('error', onError);
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


const SportsCompositionActivity = ({ 
  onComplete, 
  viewMode = false, 
  lessonStartTime,
  isSessionMode = false
}) => {
  const navigate = useNavigate();
  
  // Session mode detection
  const { getCurrentStage, sessionCode, leaveSession } = useSession();
  // For class-based sessions, sessionCode is null — use classCode from URL params
  const classCode = new URLSearchParams(window.location.search).get('classCode');
  const effectiveSessionCode = sessionCode || classCode;
  const currentStage = isSessionMode ? getCurrentStage() : null;

  // Track save command from teacher
  const lastSaveCommandRef = useRef(null);
  const componentMountTimeRef = useRef(Date.now());
  const isReflectionStage = currentStage === 'reflection' || currentStage === 'reflection-activity';
  
  // Video selection state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoSelection, setShowVideoSelection] = useState(() => {
    const saved = getSelectedVideo();
    return !saved;
  });
  const [previewingVideo, setPreviewingVideo] = useState(null);
  
  // NEW: Track detected durations for all videos
  const [videoDurations, setVideoDurations] = useState({});
  const [detectingDurations, setDetectingDurations] = useState(false);
  const [teacherSaveToast, setTeacherSaveToast] = useState(false);

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
  const [isLoadingWork, setIsLoadingWork] = useState(!!getClassAuthInfo());
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [saveMessage, setSaveMessage] = useState(null);
  const timerRef = useRef(null);
  const autoAdvanceCalledRef = useRef(false);
  const isSavingRef = useRef(false);

  // Timer sound hook (plays chime when timer ends)
  const { isMuted, toggleMute, playTimerEndSound } = useTimerSound();

  // Custom beats from StudentBeatMakerActivity
  const [savedStudentBeats, setSavedStudentBeats] = useState(() => loadSavedBeats());
  
  // ✅ FIXED: Use ref instead of sessionStorage so it resets on page refresh
  const hasLoadedRef = useRef(false);
  const isResettingRef = useRef(false); // Prevents unmount auto-save during reset
  
  // Initialize student ID using the new utility
  useEffect(() => {
    const id = getStudentId();
    setStudentId(id);
    console.log('🏀 Student ID:', id);
  }, []);
  
  // NEW: Detect video durations on mount
  useEffect(() => {
    const detectAllDurations = async () => {
      console.log('🎬 Starting video duration detection for all sports videos...');
      setDetectingDurations(true);
      
      const durations = {};
      
      for (const video of SPORTS_VIDEOS) {
        try {
          const duration = await detectVideoDuration(video.videoPath);
          durations[video.id] = duration;
        } catch (error) {
          console.error(`❌ Failed to detect duration for ${video.id}:`, error);
          durations[video.id] = 90;
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
    const savedReflection = localStorage.getItem('sports-reflection');
    if (savedReflection) {
      try {
        const data = JSON.parse(savedReflection);
        if (data.submittedAt) {
          setReflectionCompleted(true);
          console.log('✅ Found completed sports reflection on mount');
        }
      } catch (error) {
        console.error('Error loading reflection:', error);
      }
    }
  }, []);
  
  // ============================================================================
  // REFLECTION DETECTION - Shows modal when teacher advances to reflection stage
  // ============================================================================
  
  useEffect(() => {
    console.log('🏀 Reflection Check:', {
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
  }, [isReflectionStage, reflectionCompleted, studentId, showReflection, viewingReflection, showBonusGame]);
  
  // Load previously selected video on mount - WITH detected duration
  useEffect(() => {
    const savedVideoSelection = getSelectedVideo();
    console.log('🎬 Loading saved video selection:', savedVideoSelection);
    
    if (savedVideoSelection) {
      const videoTemplate = SPORTS_VIDEOS.find(v => v.id === savedVideoSelection.videoId);
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
        } else if (!detectingDurations) {
          // Detection finished but this video's duration is missing — use fallback
          console.warn('⚠️ Duration detection finished but missing for', videoTemplate.id, '— using fallback');
          const video = {
            ...videoTemplate,
            duration: 90
          };
          setSelectedVideo(video);
          setVideoDuration(90);
          setShowVideoSelection(false);
          setIsLoadingVideo(false);
        } else {
          console.log('⏳ Waiting for duration detection to complete...');
          setIsLoadingVideo(true);
        }
      } else {
        // Video ID not found (probably from a different lesson) - show selection screen
        console.warn('⚠️ Saved video not found for ID:', savedVideoSelection.videoId, '- showing selection screen');
        setShowVideoSelection(true);
        setIsLoadingVideo(false);
      }
    } else {
      console.log('ℹ️ No saved video selection found');
      setIsLoadingVideo(false);
    }
  }, [videoDurations, detectingDurations]);

  // AUTO-SAVE - Single composition that works with any video
  // NOTE: Don't include timestamp here - it changes every render and triggers re-renders
  const compositionData = {
    placedLoops,
    videoDuration,
    videoId: selectedVideo?.id
  };
  
  // Use single key for all videos - composition transfers between videos
  const { hasSavedWork, loadSavedWork } = useAutoSave(
    studentId,
    'sports-composition',
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
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [studentId, selectedVideo, placedLoops, viewMode]);

  // ✅ Listen for teacher's save command from Firebase
  // Uses refs to avoid stale closures — listener set up once, always reads latest state
  useEffect(() => {
    if (!effectiveSessionCode || !isSessionMode || viewMode || !studentId) return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${effectiveSessionCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();
      if (!saveCommand) return;

      if (saveCommand <= componentMountTimeRef.current) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }

      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('💾 Teacher save command received for sports composition!');

        const currentLoops = placedLoopsRef.current;
        const currentStudentId = studentIdRef.current;
        const currentVideo = selectedVideoRef.current;

        if (currentLoops.length > 0 && currentStudentId && currentVideo) {
          const authInfo = getClassAuthInfo();
          saveStudentWork('sports-composition', {
            title: currentVideo.title,
            emoji: currentVideo.emoji,
            viewRoute: '/lessons/film-music-project/lesson4?view=saved',
            subtitle: `${currentLoops.length} loops • ${formatDuration(currentVideo.duration)}`,
            category: 'Film Music Project',
            data: {
              placedLoops: currentLoops,
              videoDuration: currentVideo.duration,
              videoId: currentVideo.id,
              videoTitle: currentVideo.title,
              videoPath: currentVideo.videoPath,
              videoEmoji: currentVideo.emoji,
              timestamp: Date.now()
            }
          }, currentStudentId, authInfo);
          console.log('💾 Teacher-triggered save complete for sports composition');

          setTeacherSaveToast(true);
          setTimeout(() => setTeacherSaveToast(false), 3000);
        }
      }
    });

    return () => unsubscribe();
  }, [effectiveSessionCode, isSessionMode, viewMode, studentId]);

  // ✅ SAFETY NET: Save on unmount when leaving activity in session mode
  // This ensures data is saved even if Firebase saveCommand doesn't arrive in time
  const placedLoopsRef = useRef(placedLoops);
  const studentIdRef = useRef(studentId);
  const selectedVideoRef = useRef(selectedVideo);

  useEffect(() => {
    placedLoopsRef.current = placedLoops;
    studentIdRef.current = studentId;
    selectedVideoRef.current = selectedVideo;
  }, [placedLoops, studentId, selectedVideo]);

  // Safety net: Save on unmount (fires in ALL modes so Firebase stays in sync)
  useEffect(() => {
    if (viewMode) return;

    return () => {
      // Skip auto-save if reset was just triggered (prevents re-saving cleared work)
      if (isResettingRef.current) {
        console.log('⏭️ Skipping unmount auto-save - reset in progress');
        return;
      }
      // Save on unmount if we have loops
      if (placedLoopsRef.current.length > 0 && studentIdRef.current && selectedVideoRef.current) {
        console.log('💾 Saving on unmount (safety net)...');
        const videoToSave = selectedVideoRef.current;
        const loopsToSave = placedLoopsRef.current;
        const studentToSave = studentIdRef.current;

        // Create composition data for save
        const compositionToSave = {
          videoId: videoToSave.id,
          videoTitle: videoToSave.title,
          videoDuration: videoToSave.duration,
          placedLoops: loopsToSave,
          savedAt: new Date().toISOString()
        };

        // Save using the studentWorkStorage system
        // Signature: saveStudentWork(activityId, { title, emoji, viewRoute, subtitle, data }, studentId, authInfo)
        const authInfo = getClassAuthInfo();
        saveStudentWork('sports-composition', {
          title: videoToSave.title,
          emoji: videoToSave.emoji || '🏀',
          viewRoute: '/lessons/film-music-project/lesson4?view=saved',
          subtitle: `${loopsToSave.length} loops • ${Math.floor((videoToSave.duration || 90) / 60)}:${String(Math.floor((videoToSave.duration || 90) % 60)).padStart(2, '0')}`,
          data: compositionToSave
        }, studentToSave, authInfo);
        console.log('💾 Unmount save complete');
      }
    };
  }, [viewMode]);

  // Load saved work on mount - FIREBASE-FIRST for authenticated students
  useEffect(() => {
    if (!studentId || !selectedVideo) return;

    if (hasLoadedRef.current) {
      console.log('⏭️ Already loaded this session, skipping');
      return;
    }

    const loadWork = async () => {
      console.log('🎬 Initial load - checking for saved work');

      // Check if student is authenticated via PIN login
      const classAuth = getClassAuthInfo();

      if (classAuth && classAuth.uid) {
        console.log('🔐 Authenticated student detected, trying Firebase first...');
        try {
          const { parseActivityId } = await import('../../../utils/studentWorkStorage');
          const { lessonId, activityId: parsedActivityId } = parseActivityId('sports-composition');
          const firebaseWork = await loadFromFirebase(classAuth.uid, lessonId, parsedActivityId);

          if (firebaseWork && firebaseWork.data) {
            console.log('📂 Found saved work in Firebase:', firebaseWork);

            if (firebaseWork.data.placedLoops && firebaseWork.data.placedLoops.length > 0) {
              // If video doesn't match, switch to the saved video so we don't lose work
              // (shared Chromebooks can overwrite the global video selection key)
              let videoForLoad = selectedVideo;
              if (firebaseWork.data.videoId && firebaseWork.data.videoId !== selectedVideo.id) {
                const savedVideoTemplate = SPORTS_VIDEOS.find(v => v.id === firebaseWork.data.videoId);
                if (savedVideoTemplate) {
                  console.log('🔄 Switching to saved video:', savedVideoTemplate.title, '(was:', selectedVideo.title + ')');
                  const restoredVideo = { ...savedVideoTemplate, duration: firebaseWork.data.videoDuration || savedVideoTemplate.duration || 90 };
                  setSelectedVideo(restoredVideo);
                  setVideoDuration(restoredVideo.duration);
                  saveSelectedVideo(restoredVideo.id, restoredVideo.title);
                  videoForLoad = restoredVideo;
                } else {
                  console.log('⚠️ Firebase saved video not found in SPORTS_VIDEOS:', firebaseWork.data.videoId);
                }
              }

              localStorage.removeItem('composition-sports-composition');
              setPlacedLoops(firebaseWork.data.placedLoops);
              setVideoDuration(firebaseWork.data.videoDuration || videoForLoad.duration);
              console.log('✅ Loaded from Firebase:', firebaseWork.data.placedLoops.length, 'loops for', videoForLoad.title);
              hasLoadedRef.current = true;
              setIsLoadingWork(false);
              return;
            }
          }

          // Firebase had no data for this authenticated student — start fresh (don't fall back to localStorage)
          console.log('ℹ️ No Firebase data for authenticated student — starting fresh');
          hasLoadedRef.current = true;
          setIsLoadingWork(false);
          return;
        } catch (error) {
          console.error('❌ Firebase load failed, falling back to localStorage:', error);
          setIsLoadingWork(false);
          // Fall through to localStorage below
        }
      }

      // Non-authenticated students (or Firebase error fallback): use localStorage
      console.log('📦 Using localStorage for work loading');

      // Try to load from new system first
      const savedWork = loadStudentWork('sports-composition');

      if (savedWork && savedWork.data) {
        console.log('📂 Found saved work (new system):', savedWork);

        if (savedWork.data.placedLoops && savedWork.data.placedLoops.length > 0) {
          if (savedWork.data.videoId === selectedVideo.id) {
            setPlacedLoops(savedWork.data.placedLoops);
            setVideoDuration(savedWork.data.videoDuration || selectedVideo.duration);
            console.log('✅ Loaded from new system:', savedWork.data.placedLoops.length, 'loops for', selectedVideo.title);
            hasLoadedRef.current = true;
            return;
          } else {
            console.log('⚠️ Saved video mismatch - saved:', savedWork.data.videoId, 'current:', selectedVideo.id);
          }
        }
      }

      // Fallback: try old format for backwards compatibility
      const oldSaveKey = `sports-composition-${studentId}`;
      const oldSave = localStorage.getItem(oldSaveKey);

      if (oldSave) {
        try {
          const data = JSON.parse(oldSave);
          console.log('📂 Found old format save:', data);

          if (data.composition && data.composition.placedLoops && data.composition.placedLoops.length > 0) {
            if (data.composition.videoId === selectedVideo.id) {
              setPlacedLoops(data.composition.placedLoops);
              setVideoDuration(data.composition.videoDuration || selectedVideo.duration);
              console.log('✅ Loaded from old format:', data.composition.placedLoops.length, 'loops');
              hasLoadedRef.current = true;
              return;
            }
          }
        } catch (error) {
          console.error('Error loading old format save:', error);
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
    };

    loadWork();
  }, [studentId, hasSavedWork, loadSavedWork, selectedVideo]);
  
  // REFLECTION DETECTION
  useEffect(() => {
    console.log('🔍 Reflection Check:', {
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
      console.log('✅ Showing sports reflection modal');
      setShowReflection(true);

      if (reflectionCompleted) {
        setViewingReflection(true);
      }
    }
  }, [isReflectionStage, reflectionCompleted, studentId, showReflection, viewingReflection, showBonusGame]);
  
  // REFLECTION VIEW HANDLERS
  const handleViewReflection = () => {
    console.log('👀 Opening sports reflection in view mode');
    setViewingReflection(true);
    setShowReflection(true);
  };
  
  // ✅ MANUAL SAVE HANDLER - NOW USES NEW SYSTEM
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

    // ✅ NEW: Use saveStudentWork for automatic Join page integration
    const authInfo = getClassAuthInfo();
    saveStudentWork('sports-composition', {
      title: selectedVideo.title,
      emoji: selectedVideo.emoji,
      viewRoute: '/lessons/film-music-project/lesson4?view=saved',
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
    }, studentId, authInfo);
    
    console.log('💾 Saved using new studentWorkStorage system');
    
    if (!silent) {
      console.log('🔔 About to show toast message, silent =', silent);
      setSaveMessage({ type: 'success', text: '✅ Saved! View anytime from the Join page.' });
      setTimeout(() => setSaveMessage(null), 4000);
    }
    
    setTimeout(() => {
      isSavingRef.current = false;
    }, 500);
  };
  
  // TIMER (self-guided mode only)
  useEffect(() => {
    if (!lessonStartTime || viewMode || isSessionMode) return;

    const calculateRemaining = () => {
      const elapsed = Date.now() - lessonStartTime;
      return Math.max(0, SPORTS_COMPOSITION_DEADLINE - elapsed);
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
  
  // COMPOSITION EVENT HANDLERS
  // FIX: Receive full loop object from useLoopHandlers (not raw params)
  const handleLoopPlaced = (loop) => {
    setPlacedLoops(prev => [...prev, loop]);
  };
  
  const handleLoopDeleted = (loopId) => {
    setPlacedLoops(prev => prev.filter(loop => loop.id !== loopId));
  };
  
  // ✅ CHROMEBOOK OPTIMIZED: Removed verbose logging that fires on every drag update
  const handleLoopUpdated = (loopId, updates) => {
    setPlacedLoops(prev => prev.map(loop =>
      loop.id === loopId ? { ...loop, ...updates } : loop
    ));
  };
  
  // DEBUG: Commented out to prevent Chromebook performance issues (see throttling errors)
  // Uncomment only when debugging render issues
  // console.log('🎨 RENDER CHECK:', { previewingVideo: !!previewingVideo, isLoadingVideo, selectedVideo: !!selectedVideo, showVideoSelection, detectingDurations });

  // VIDEO PREVIEW FULLSCREEN
  if (previewingVideo) {
    console.log('🎨 EARLY RETURN: Video preview fullscreen');
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 flex items-center justify-between">
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
            playsInline
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
    console.log('🎨 EARLY RETURN: Loading state');
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>{detectingDurations ? 'Detecting video durations...' : 'Loading video...'}</p>
        </div>
      </div>
    );
  }

  // MAIN ACTIVITY
  return (
    <div className={`h-full flex flex-col bg-gray-900 relative ${isChromebook ? 'chromebook-hide-cursor' : ''}`}>
      {/* Teacher Save Modal */}
      {teacherSaveToast && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden text-center">
            <div className="bg-green-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Saving Your Work</h3>
            </div>
            <div className="p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-700 text-lg font-semibold">Your composition is being saved!</p>
              <p className="text-gray-500 text-sm mt-2">You can view it anytime from your dashboard.</p>
            </div>
          </div>
        </div>
      )}
      {/* Save Message Toast */}
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
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold">Composition</h2>
            {!viewMode && !showReflection && (
              <div className="flex items-center gap-1">
                {SPORTS_VIDEOS.map(video => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    disabled={selectedVideo?.id === video.id}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      selectedVideo?.id === video.id
                        ? 'bg-orange-600 text-white cursor-default'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    title={video.title}
                  >
                    {video.emoji} {video.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
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
                      // Set flag to prevent unmount auto-save from re-saving the old loops
                      isResettingRef.current = true;

                      // Clear state
                      setPlacedLoops([]);

                      // Clear ALL localStorage saves for this composition (handles all key patterns)
                      clearAllCompositionSaves('sports-composition', studentId);
                      // Also clear MusicComposer's internal save key (uses video ID as key)
                      if (selectedVideo?.id) {
                        clearAllCompositionSaves(selectedVideo.id, studentId);
                      }

                      // Reset the loaded flag so it doesn't try to reload
                      hasLoadedRef.current = false;

                      // Force DAW remount
                      setResetKey(prev => prev + 1);

                      // Clear the reset flag after remount completes
                      setTimeout(() => {
                        isResettingRef.current = false;
                      }, 100);

                      console.log('🔄 Composition reset - cleared state and localStorage');
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
            
            {isSessionMode && (
              <button
                onClick={() => {
                  if (window.confirm('Leave this session? Your saved work will still be available.')) {
                    leaveSession();
                    window.location.href = window.location.hostname === 'localhost'
                      ? 'http://localhost:5173/join'
                      : import.meta.env.VITE_SITE_MODE === 'edu'
                        ? 'https://musicroomtools.org/join'
                        : 'https://musicmindacademy.com/join';
                  }
                }}
                className="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                Exit Session
              </button>
            )}

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
          isLoadingWork ? (
            <div className="h-full flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading your composition...</p>
              </div>
            </div>
          ) : (
            <MusicComposer
              key={`sports-composer-${selectedVideo?.id || 'none'}-${resetKey}`}
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
              initialCustomLoops={savedStudentBeats}
              readOnly={viewMode || showReflection}
              assignmentPanelContent={null}
            />
          )
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
      </div>

      {showReflection && (
        <SportsReflectionModal
          compositionData={{
            placedLoops,
            videoDuration,
            videoId: selectedVideo?.id,
            videoTitle: selectedVideo?.title,
            timestamp: Date.now()
          }}
          onComplete={() => {
            console.log('Sports reflection onComplete - viewingReflection:', viewingReflection);
            setReflectionCompleted(true);
            setShowReflection(false);
            setViewingReflection(false);
            setShowBonusGame(true);
          }}
          viewMode={viewingReflection}
          isSessionMode={isSessionMode}
        />
      )}
      
      {/* data-cursor-handled tells MusicComposer's CustomCursor to hide */}
      {/* restore-cursor overrides chromebook-hide-cursor from parent to show native cursor */}
      {showBonusGame && (
        <div className="absolute inset-0 z-50 flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 restore-cursor" data-cursor-handled="true">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Bonus: Name That Loop!</h2>
              <p className="text-blue-100">Play the listening game with a partner</p>
            </div>
            
            <button
              onClick={() => setShowBonusGame(false)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              ← Back to Composition
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <NameThatLoopActivity 
              onComplete={() => {
                console.log('Bonus complete');
              }}
            />
          </div>
        </div>
      )}
      
      {showVideoSelection && !viewMode && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-6 overflow-y-auto restore-cursor">
          <div className="max-w-5xl w-full my-4">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-white mb-3">
                Choose Your Sports Video
              </h1>
              <p className="text-xl text-orange-200">
                Your loops will play with whichever video you choose!
              </p>
              {detectingDurations && (
                <p className="text-sm text-yellow-300 mt-2">
                  ⏳ Detecting video durations...
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SPORTS_VIDEOS.map((video) => {
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
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
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

export default SportsCompositionActivity;