// File: SchoolBeneathActivity.jsx
// SIMPLIFIED VERSION - All loops + sound effects from start, no submit button, reflection modal on teacher command
// ✅ UPDATED: Added "View My Reflection & Composition" functionality

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { saveCompositionToServer } from '../../film-music-project/lesson1/compositionServerUtils';
import { useAutoSave, AutoSaveIndicator } from '../../../hooks/useAutoSave.jsx';
import ReflectionModal from './two-stars-and-a-wish/ReflectionModal';
import NameThatLoopActivity from './NameThatLoopActivity';
import { useSession } from '../../../context/SessionContext';

const SCHOOL_BENEATH_DEADLINE = 30 * 60 * 1000; // 30 minutes

const SchoolBeneathActivity = ({ 
  onComplete, 
  viewMode = false, 
  lessonStartTime,
  isSessionMode = false
}) => {
  const navigate = useNavigate();
  
  // Session mode detection
  const { getCurrentStage } = useSession();
  const currentStage = isSessionMode ? getCurrentStage() : null;
  const isReflectionStage = currentStage === 'reflection';
  
  // Reflection flow states
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionCompleted, setReflectionCompleted] = useState(false);
  const [viewingReflection, setViewingReflection] = useState(false); // ✅ NEW: For viewing completed reflection
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
    console.log('🔍 Student ID:', id);
  }, []);
  
  // ✅ NEW: Check if reflection is already completed on mount
  useEffect(() => {
    const savedReflection = localStorage.getItem('school-beneath-reflection');
    if (savedReflection) {
      try {
        const data = JSON.parse(savedReflection);
        if (data.submittedAt) {
          setReflectionCompleted(true);
          console.log('✅ Found completed reflection on mount');
        }
      } catch (error) {
        console.error('Error loading reflection:', error);
      }
    }
  }, []);
  
  // Composition state
  const [placedLoops, setPlacedLoops] = useState([]);
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef(null);
  const autoAdvanceCalledRef = useRef(false);
  
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
    'school-beneath',
    compositionData,
    5000
  );
  
  // Load saved work on mount
  useEffect(() => {
    if (!studentId || viewMode) return;
    
    if (hasSavedWork) {
      const saved = loadSavedWork();
      if (saved && saved.placedLoops) {
        const shouldLoad = window.confirm(
          "Continue where you left off?\n\nOK = load previous work\nCancel = start fresh"
        );
        
        if (shouldLoad) {
          setPlacedLoops(saved.placedLoops || []);
          setVideoDuration(saved.videoDuration || 60);
          console.log('✅ Loaded previous work');
        }
      }
    }
  }, [studentId, hasSavedWork, viewMode]);
  
  // ============================================================================
  // REFLECTION DETECTION
  // ============================================================================
  
  useEffect(() => {
    console.log('🔍 Reflection Check:', {
      isReflectionStage,
      reflectionCompleted,
      studentId,
      showReflection,
      viewingReflection
    });
    
    // Show reflection when teacher advances to reflection stage
    // Only show if not already showing (prevents infinite loop)
    if (isReflectionStage && !showReflection && !viewingReflection && studentId) {
      console.log('✅ Showing reflection modal');
      setShowReflection(true);
      
      // If already completed, set viewing mode
      if (reflectionCompleted) {
        setViewingReflection(true);
      }
    }
  }, [isReflectionStage, reflectionCompleted, studentId, showReflection, viewingReflection]);
  
  // ============================================================================
  // ✅ NEW: REFLECTION VIEW HANDLERS
  // ============================================================================
  
  const handleViewReflection = () => {
    console.log('👀 Opening reflection in view mode');
    setViewingReflection(true);
    setShowReflection(true);
  };
  
  const handleCloseReflectionView = () => {
    console.log('❌ Closing reflection view');
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
  
  useEffect(() => {
    if (viewMode) return;

    const videoPath = '/lessons/videos/film-music-loop-project/SchoolMystery.mp4';
    const videoElement = document.createElement('video');
    videoElement.src = videoPath;
    videoElement.preload = 'metadata';
    
    const handleMetadata = () => {
      setVideoDuration(videoElement.duration);
      setIsLoadingVideo(false);
      console.log('Video duration:', videoElement.duration);
      videoElement.removeEventListener('loadedmetadata', handleMetadata);
      videoElement.src = '';
    };
    
    const handleError = () => {
      setVideoDuration(60);
      setIsLoadingVideo(false);
      console.warn('Video error, using fallback 60s');
      videoElement.removeEventListener('error', handleError);
    };
    
    videoElement.addEventListener('loadedmetadata', handleMetadata);
    videoElement.addEventListener('error', handleError);
    
    const timeout = setTimeout(() => {
      if (videoDuration === null) {
        setVideoDuration(60);
        setIsLoadingVideo(false);
      }
    }, 5000);
    
    return () => {
      clearTimeout(timeout);
      videoElement.removeEventListener('loadedmetadata', handleMetadata);
      videoElement.removeEventListener('error', handleError);
      videoElement.src = '';
    };
  }, [viewMode]);
  
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
      endTime: startTime + loopData.duration,  // ✅ CRITICAL: Required for rendering and audio scheduling
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
  // LOADING STATE
  // ============================================================================
  
  if (isLoadingVideo && !viewMode) {
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
  
  if (showBonusGame) {
    return (
      <div className="h-screen w-full flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Bonus: Name That Loop!</h2>
            <p className="text-blue-100">Play the listening game with a partner</p>
          </div>
          
          {/* ✅ SOLUTION 1: Simple back button - view reflection from composition page */}
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
    );
  }
  
  // ============================================================================
  // MAIN ACTIVITY
  // ============================================================================
  
  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <h2 className="text-sm font-bold">
            The School Beneath - Composition
          </h2>
          
          <div className="flex items-center gap-4">
            {/* ✅ View reflection button (shows reflection modal over current composition) */}
            {reflectionCompleted && !showReflection && (
              <button
                onClick={handleViewReflection}
                className="px-3 py-1.5 text-sm rounded bg-yellow-600 hover:bg-yellow-700 font-semibold transition-colors flex items-center gap-1"
              >
                ⭐ View Reflection & Composition
              </button>
            )}
            
            {/* Auto-save indicator */}
            {studentId && !viewMode && (
              <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
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
                onClick={() => navigate('/')}
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
          key={showBonusGame ? 'bonus-active' : 'composition-active'}  // ✅ Only change when switching views, not on every loop
          onLoopDropCallback={handleLoopPlaced}
          onLoopDeleteCallback={handleLoopDeleted}
          onLoopUpdateCallback={handleLoopUpdated}
          tutorialMode={false}
          preselectedVideo={{
            id: 'school-beneath',
            title: 'The School Beneath',
            duration: videoDuration,
            videoPath: '/lessons/videos/film-music-loop-project/SchoolMystery.mp4'
          }}
          // ALL LOOPS AVAILABLE - Students can filter themselves
          restrictToCategory={null}
          lockedMood={null}
          showSoundEffects={true}  // Checkbox appears (unchecked by default)
          hideHeader={true}
          hideSubmitButton={true}
          isLessonMode={true}
          showToast={(msg, type) => console.log(msg, type)}
          initialPlacedLoops={placedLoops}  // ✅ Always pass current loops
          readOnly={viewMode || showReflection}
          assignmentPanelContent={null}
        />
      </div>

      {/* ✅ UPDATED: Reflection Modal - handles both first-time and viewing */}
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
          viewMode={viewingReflection}  // ✅ Pass viewMode when viewing (not first time)
          isSessionMode={isSessionMode}
        />
      )}
    </div>
  );
};

export default SchoolBeneathActivity;