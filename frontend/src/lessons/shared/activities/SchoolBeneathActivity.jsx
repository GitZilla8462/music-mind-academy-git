// File: SchoolBeneathActivity.jsx
// File: SchoolBeneathActivity.jsx
// SIMPLIFIED VERSION - All loops + sound effects from start, no submit button, reflection modal on teacher command
// âœ… UPDATED: Added "View My Reflection & Composition" functionality

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { saveCompositionToServer, loadAutoSavedComposition } from '../../film-music-project/lesson1/compositionServerUtils';
import { useAutoSave, AutoSaveIndicator } from '../../../hooks/useAutoSave.jsx';
import ReflectionModal from './two-stars-and-a-wish/ReflectionModal';
import NameThatLoopActivity from './layer-detective/NameThatLoopActivity';
import { useSession } from '../../../context/SessionContext';
import { saveStudentWork, loadStudentWork } from '../../../utils/studentWorkStorage';
import { getDatabase, ref, onValue } from 'firebase/database';

const SCHOOL_BENEATH_DEADLINE = 30 * 60 * 1000; // 30 minutes

// CHROMEBOOK FIX: Detect Chromebook for custom cursor
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS')
);

// Check if we're in passive mode (iframe preview) - defer MusicComposer loading for performance
const isPassiveMode = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('passive') === 'true';
};

const SchoolBeneathActivity = ({
  onComplete,
  viewMode = false,
  lessonStartTime,
  isSessionMode = false,
  // Customizable props for different compositions
  title = 'The School Beneath',
  videoPath = '/lessons/videos/film-music-loop-project/SchoolMystery.mp4',
  storageKey = 'school-beneath'
}) => {
  const navigate = useNavigate();

  // Session mode detection
  const { getCurrentStage, sessionCode } = useSession();
  const currentStage = isSessionMode ? getCurrentStage() : null;
  const isReflectionStage = currentStage === 'reflection' || currentStage === 'reflection-activity';

  // Track last save command timestamp to detect new commands
  const lastSaveCommandRef = useRef(null);
  const componentMountTimeRef = useRef(Date.now());
  const [teacherSaveToast, setTeacherSaveToast] = useState(false);
  
  // Reflection flow states
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionCompleted, setReflectionCompleted] = useState(false);
  const [viewingReflection, setViewingReflection] = useState(false); // âœ… NEW: For viewing completed reflection
  const [showBonusGame, setShowBonusGame] = useState(false);
  
  // Student ID
  const [studentId, setStudentId] = useState('');
  
  // Initialize student ID
  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
    console.log('ðŸ” Student ID:', id);
  }, []);
  
  // âœ… NEW: Check if reflection is already completed on mount
  useEffect(() => {
    const savedReflection = localStorage.getItem(`${storageKey}-reflection`);
    if (savedReflection) {
      try {
        const data = JSON.parse(savedReflection);
        if (data.submittedAt) {
          setReflectionCompleted(true);
          console.log('âœ… Found completed reflection on mount');
        }
      } catch (error) {
        console.error('Error loading reflection:', error);
      }
    }
  }, [storageKey]);
  
  // Composition state
  const [placedLoops, setPlacedLoops] = useState([]);
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [saveMessage, setSaveMessage] = useState(null);
  const timerRef = useRef(null);
  const autoAdvanceCalledRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const isSavingRef = useRef(false);
  
  // ============================================================================
  // AUTO-SAVE
  // ============================================================================
  
  const compositionData = {
    placedLoops,
    videoDuration,
    timestamp: Date.now()
  };
  
  const { lastSaved, isSaving, hasSavedWork, loadSavedWork } = useAutoSave(
    studentId,
    storageKey,
    compositionData,
    5000
  );

  // ✅ MANUAL SAVE HANDLER - Saves to localStorage for viewing on join page
  const handleManualSave = (silent = false) => {
    // Prevent duplicate saves
    if (isSavingRef.current) {
      console.log('⏸️ Save already in progress, skipping duplicate');
      return;
    }

    if (!studentId) {
      if (!silent) {
        setSaveMessage({ type: 'error', text: '❌ Cannot save: Missing student ID' });
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

    // Use saveStudentWork for Join page compatibility
    saveStudentWork(storageKey, {
      title: title,
      emoji: storageKey === 'adventure-composition' ? '🏔️' : '🏫',
      viewRoute: storageKey === 'adventure-composition'
        ? '/lessons/film-music-project/lesson1?view=saved&activity=adventure'
        : '/lessons/film-music-project/lesson1?view=saved',
      subtitle: `${placedLoops.length} loops`,
      category: 'Film Music Project',
      data: {
        placedLoops,
        videoDuration,
        videoTitle: title,
        videoPath: videoPath,
        timestamp: Date.now()
      }
    }, studentId);

    console.log('💾 Manual save complete:', storageKey);

    if (!silent) {
      setSaveMessage({ type: 'success', text: '✅ Composition saved! View it anytime from the Join page.' });
      setTimeout(() => setSaveMessage(null), 4000);
    }

    // Reset saving flag after a short delay
    setTimeout(() => {
      isSavingRef.current = false;
    }, 500);
  };

  // ✅ SILENT AUTO-SAVE - Saves to same location as manual save every 30 seconds
  useEffect(() => {
    if (!studentId || viewMode) return;

    const autoSaveInterval = setInterval(() => {
      if (placedLoops.length > 0) {
        handleManualSave(true); // silent save
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [studentId, placedLoops, viewMode, title, videoPath, videoDuration]);

  // Listen for teacher's save command from Firebase
  useEffect(() => {
    // Don't set up listener until we have studentId ready
    if (!sessionCode || !isSessionMode || viewMode || !studentId) return;

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}/saveCommand`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const saveCommand = snapshot.val();

      // Skip if no command
      if (!saveCommand) return;

      // Only process save commands that were issued AFTER this component mounted
      if (saveCommand <= componentMountTimeRef.current) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }

      // Only trigger if this is a new command (timestamp changed)
      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('💾 Teacher save command received!');

        // Trigger save
        if (placedLoops.length > 0) {
          handleManualSave(true); // Silent save

          // Show toast notification
          setTeacherSaveToast(true);
          setTimeout(() => setTeacherSaveToast(false), 4000);
        }
      }
    });

    return () => unsubscribe();
  }, [sessionCode, isSessionMode, viewMode, placedLoops, studentId]);

  // ✅ Auto-save on unmount (when student leaves the activity)
  // This ensures work is saved even if teacher triggers save while student is on another activity
  useEffect(() => {
    return () => {
      if (isSessionMode && !viewMode && placedLoops.length > 0 && studentId) {
        console.log('💾 Auto-saving composition on unmount...');
        // Direct save logic since handleManualSave might be stale
        const savedData = {
          placedLoops,
          videoDuration,
          title,
          videoPath,
          savedAt: new Date().toISOString()
        };
        const key = `mma-saved-${storageKey}-${studentId}`;
        localStorage.setItem(key, JSON.stringify(savedData));
      }
    };
  }, [isSessionMode, viewMode, placedLoops, studentId, videoDuration, title, videoPath, storageKey]);

  // Load saved work on mount ONLY - includes manual saves and view mode (from Join page)
  // NOTE: We only load placedLoops here, NOT videoDuration - let video detection effect handle duration
  useEffect(() => {
    if (!studentId) return;

    // Skip if already loaded this session
    if (hasLoadedRef.current) {
      console.log('⏭️ Already loaded this session, skipping');
      return;
    }

    console.log('🎬 Initial load - checking for saved work', { viewMode, storageKey, studentId });

    // First try to load from new mma-saved format (Join page compatible)
    const savedWork = loadStudentWork(storageKey, studentId);
    if (savedWork && savedWork.data && savedWork.data.placedLoops && savedWork.data.placedLoops.length > 0) {
      setPlacedLoops(savedWork.data.placedLoops);
      // DON'T set videoDuration from saved data - let video detection effect always re-detect
      console.log('✅ Loaded from saved work:', savedWork.data.placedLoops.length, 'loops');
      hasLoadedRef.current = true;
      return;
    }

    // Fallback to auto-save - directly check localStorage instead of relying on hasSavedWork state
    // (hasSavedWork state may not be set yet when this effect first runs)
    const autoSaved = loadAutoSavedComposition(storageKey, studentId);
    if (autoSaved && autoSaved.composition && autoSaved.composition.placedLoops && autoSaved.composition.placedLoops.length > 0) {
      setPlacedLoops(autoSaved.composition.placedLoops);
      // DON'T set videoDuration from saved data - let video detection effect always re-detect
      console.log('✅ Auto-loaded previous work:', autoSaved.composition.placedLoops.length, 'loops');
      hasLoadedRef.current = true;
      return;
    }

    console.log('ℹ️ No saved work found');
    hasLoadedRef.current = true;
  }, [studentId, viewMode, storageKey]);
  
  // ============================================================================
  // REFLECTION DETECTION
  // ============================================================================
  
  useEffect(() => {
    console.log('ðŸ” Reflection Check:', {
      isReflectionStage,
      reflectionCompleted,
      studentId,
      showReflection,
      viewingReflection
    });
    
    // Show reflection when teacher advances to reflection stage
    // Only show if:
    // - Not already showing the reflection modal
    // - Not already completed (submitted) the reflection
    // - Not viewing the bonus game
    // - Have a valid student ID
    if (isReflectionStage && !showReflection && !viewingReflection && !reflectionCompleted && !showBonusGame && studentId) {
      console.log('âœ… Showing reflection modal');
      setShowReflection(true);
    }
  }, [isReflectionStage, reflectionCompleted, studentId, showReflection, viewingReflection, showBonusGame]);
  
  // ============================================================================
  // âœ… NEW: REFLECTION VIEW HANDLERS
  // ============================================================================
  
  const handleViewReflection = () => {
    console.log('ðŸ‘€ Opening reflection in view mode');
    setViewingReflection(true);
    setShowReflection(true);
  };
  
  const handleCloseReflectionView = () => {
    console.log('âŒ Closing reflection view');
    setViewingReflection(false);
    setShowReflection(false);
  };
  
  // ============================================================================
  // TIMER (self-guided mode only)
  // ============================================================================
  
  useEffect(() => {
    if (!lessonStartTime || viewMode || isSessionMode) return;

    const calculateRemaining = () => {
      const elapsed = Date.now() - lessonStartTime;
      return Math.max(0, SCHOOL_BENEATH_DEADLINE - elapsed);
    };

    setTimeRemaining(calculateRemaining());

    timerRef.current = setInterval(() => {
      const newRemaining = calculateRemaining();
      setTimeRemaining(newRemaining);

      if (newRemaining <= 0 && !autoAdvanceCalledRef.current) {
        autoAdvanceCalledRef.current = true;
        clearInterval(timerRef.current);
        
        if (onComplete) {
          setTimeout(() => onComplete(), 2000);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lessonStartTime, viewMode, isSessionMode, onComplete]);
  
  // ============================================================================
  // VIDEO DURATION DETECTION
  // ============================================================================

  // Track if we've already detected duration this session
  const durationDetectedRef = useRef(false);

  useEffect(() => {
    // Skip if we already detected duration this session
    if (durationDetectedRef.current) {
      return;
    }

    console.log('🎬 Detecting video duration from:', videoPath);

    const videoElement = document.createElement('video');
    videoElement.src = videoPath;
    videoElement.preload = 'metadata';

    const handleMetadata = () => {
      const duration = videoElement.duration;
      if (duration && duration > 0) {
        console.log('[OK] Video duration detected:', duration);
        setVideoDuration(duration);
        durationDetectedRef.current = true;
      }
      setIsLoadingVideo(false);
      videoElement.removeEventListener('loadedmetadata', handleMetadata);
      videoElement.src = '';
    };

    const handleError = () => {
      // Guard: if we already detected duration, ignore spurious errors
      // (setting videoElement.src = '' in handleMetadata triggers an error)
      if (durationDetectedRef.current) {
        return;
      }
      console.warn('Video metadata error, using fallback 60s');
      setVideoDuration(60);
      durationDetectedRef.current = true;
      setIsLoadingVideo(false);
      videoElement.removeEventListener('error', handleError);
    };

    videoElement.addEventListener('loadedmetadata', handleMetadata);
    videoElement.addEventListener('error', handleError);

    const timeout = setTimeout(() => {
      if (!durationDetectedRef.current) {
        console.warn('Video metadata timeout, using fallback 60s');
        setVideoDuration(60);
        durationDetectedRef.current = true;
        setIsLoadingVideo(false);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      videoElement.removeEventListener('loadedmetadata', handleMetadata);
      videoElement.removeEventListener('error', handleError);
      videoElement.src = '';
    };
  }, [videoPath]);
  
  // ============================================================================
  // LOOP HANDLERS
  // ============================================================================
  
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
      endTime: startTime + loopData.duration,  // âœ… CRITICAL: Required for rendering and audio scheduling
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

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // ============================================================================
  // LOADING STATE - Skip if in reflection mode (modal can show while loading)
  // ============================================================================

  if (isLoadingVideo && !viewMode && !isReflectionStage) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }
  
  // ============================================================================
  // BONUS GAME
  // ============================================================================
  
  // ============================================================================
  // BONUS GAME - Now renders as overlay to prevent composition from unmounting
  // ============================================================================
  
  // BONUS GAME moved to overlay at bottom of component

  // ============================================================================
  // MAIN ACTIVITY
  // ============================================================================

  return (
    <div className={`h-full flex flex-col bg-gray-900 relative ${isChromebook ? 'chromebook-hide-cursor' : ''}`}>{/* Added relative for overlay positioning */}
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Teacher Save Toast - shown when teacher saves all */}
      {teacherSaveToast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3"
          style={{ animation: 'slideDown 0.3s ease-out' }}
        >
          <span className="text-2xl">✅</span>
          <div>
            <div className="font-bold">Work Saved!</div>
            <div className="text-sm opacity-90">Find it on your Join page</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <h2 className="text-sm font-bold">
            {title} - Composition
          </h2>
          
          <div className="flex items-center gap-4">
            {/* ✅ SAVE BUTTON */}
            {studentId && placedLoops.length > 0 && !viewMode && (
              <button
                onClick={() => handleManualSave()}
                className="px-4 py-1.5 text-sm rounded bg-green-600 hover:bg-green-700 font-bold transition-colors"
              >
                💾 Save
              </button>
            )}

            {/* View reflection button (shows reflection modal over current composition) */}
            {reflectionCompleted && !showReflection && (
              <button
                onClick={handleViewReflection}
                className="px-3 py-1.5 text-sm rounded bg-yellow-600 hover:bg-yellow-700 font-semibold transition-colors flex items-center gap-1"
              >
                â­ View Reflection & Composition
              </button>
            )}
            
            {/* Loop count */}
            <div className="text-xs text-gray-400">
              {placedLoops.length} loops
            </div>
            
            {/* Timer (self-guided mode) */}
            {lessonStartTime && !isSessionMode && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Time:</span>
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
            )}
            
            {/* View mode back button */}
            {viewMode && (
              <button
                onClick={() => navigate('/join')}
                className="px-4 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-700"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DAW */}
      <div className="flex-1 min-h-0">
        <MusicComposer
          key={showBonusGame ? 'bonus-active' : 'composition-active'}  // âœ… Only change when switching views, not on every loop
          onLoopDropCallback={handleLoopPlaced}
          onLoopDeleteCallback={handleLoopDeleted}
          onLoopUpdateCallback={handleLoopUpdated}
          tutorialMode={false}
          preselectedVideo={{
            id: storageKey,
            title: title,
            duration: videoDuration,
            videoPath: videoPath
          }}
          // ALL LOOPS AVAILABLE - Students can filter themselves
          restrictToCategory={null}
          lockedMood={null}
          showSoundEffects={true}  // Checkbox appears (unchecked by default)
          hideHeader={true}
          hideSubmitButton={true}
          isLessonMode={true}
          showToast={(msg, type) => console.log(msg, type)}
          initialPlacedLoops={placedLoops}  // âœ… Always pass current loops
          readOnly={viewMode || showReflection}
          assignmentPanelContent={null}
        />
      </div>

      {/* âœ… UPDATED: Reflection Modal - handles both first-time and viewing */}
      {showReflection && (
        <ReflectionModal
          compositionData={{
            placedLoops,
            videoDuration,
            timestamp: Date.now()
          }}
          onComplete={() => {
            console.log('Reflection onComplete - viewingReflection:', viewingReflection);
            
            // Always close modal and go to bonus game
            setReflectionCompleted(true);
            setShowReflection(false);
            setViewingReflection(false);
            setShowBonusGame(true);
          }}
          viewMode={viewingReflection}
          isSessionMode={isSessionMode}
        />
      )}
      
      {/* Bonus game as overlay - keeps composition mounted underneath */}
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
              Back to Composition
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
    </div>
  );
};

export default SchoolBeneathActivity;