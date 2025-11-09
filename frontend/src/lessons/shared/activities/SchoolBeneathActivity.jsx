// File: /src/lessons/film-music-project/lesson1/activities/SchoolBeneathActivity.jsx
// ENHANCED VERSION with Auto-Save, Reflection Modal Integration, and Name That Loop Game
// UPDATED: Simplified requirements (Instrumentation + Layering only, removed Structure)
// UPDATED: Removed composition tips section for cleaner interface
// FIXED: Reflection modal appears on top of composition when teacher unlocks reflection
// FIXED: Name That Loop game integration with back to reflection functionality
// FIXED: Requirements checking uses loop.name instead of loop.instrument
// FIXED: Title changed from "School Beneath the Sea" to "School Beneath"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Minimize2, Maximize2 } from 'lucide-react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { saveComposition, saveBonusComposition } from '../../film-music-project/lesson1/lessonStorageUtils';
import { saveCompositionToServer } from '../../film-music-project/lesson1/compositionServerUtils';
import { useAutoSave, AutoSaveIndicator } from '../../../hooks/useAutoSave.jsx';
import { useSession } from '../../../context/SessionContext';
import ReflectionModal from './two-stars-and-a-wish/ReflectionModal';
import NameThatLoopActivity from './NameThatLoopActivity';
import SoundEffectsActivity from './SoundEffectsActivity';

const SCHOOL_BENEATH_DEADLINE = 30 * 60 * 1000; // 30 minutes in milliseconds

const SchoolBeneathActivity = ({ 
  onComplete, 
  viewMode = false, 
  viewBonusMode = false, 
  lessonStartTime,
  isSessionMode = false
}) => {
  const navigate = useNavigate();
  const { sessionCode } = useSession();
  
  console.log('🎬 SchoolBeneathActivity props:', { isSessionMode, viewMode, sessionCode });
  
  // Generate or retrieve anonymous student ID
  const [studentId, setStudentId] = useState('');
  
  // Initialize student ID on mount
  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      // Generate random ID: "Student-" + random number
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
    console.log('🆔 Student ID:', id);
  }, []);
  
  const [requirements, setRequirements] = useState({
    instrumentation: false,
    layering: false,
    structure: false
  });
  const [placedLoops, setPlacedLoops] = useState([]);
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(!isSessionMode);
  
  console.log('🔧 Initial isLoadingVideo state:', !isSessionMode, 'isSessionMode:', isSessionMode);
  
  // 🚨 CRITICAL: Update loading state when session mode changes
  useEffect(() => {
    console.log('🔄 useEffect checking session mode:', isSessionMode);
    if (isSessionMode) {
      console.log('🎬 Session mode detected, setting isLoadingVideo to false');
      setIsLoadingVideo(false);
    }
  }, [isSessionMode]);
  
  const [isExplorationMode, setIsExplorationMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const autoAdvanceCalledRef = useRef(false);
  const [isMinimizedModal, setIsMinimizedModal] = useState(false);
  
  // Modal states for the two-modal flow
  const [showAhaMomentModal, setShowAhaMomentModal] = useState(false);
  const [showSubmitSuccessModal, setShowSubmitSuccessModal] = useState(false);
  const [submitCountdown, setSubmitCountdown] = useState(5);
  const hasAnnouncedAhaRef = useRef(false);
  const hasAnnouncedSubmitRef = useRef(false);
  
  // NEW: Reflection modal and Name That Loop states
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showNameThatLoop, setShowNameThatLoop] = useState(false);
  
  // NEW: State to show Sound Effects activity after submission
  const [showSoundEffects, setShowSoundEffects] = useState(false);
  
  // ============================================================================
  // AUTO-SAVE INTEGRATION
  // ============================================================================
  
  // 🚨 CRITICAL: Don't include timestamp here - it causes infinite re-renders
  // Add timestamp only when actually saving
  const compositionData = {
    placedLoops,
    requirements,
    videoDuration
  };
  
  // Add auto-save hook - only active when student has ID and not in view mode
  const { lastSaved, isSaving, hasSavedWork, loadSavedWork, saveNow } = useAutoSave(
    studentId,
    isExplorationMode ? 'school-beneath-bonus' : 'school-beneath',
    compositionData,
    5000 // Auto-save every 5 seconds
  );
  
  // Auto-load saved work on mount (after studentId is set) - NO CONFIRMATION NEEDED
  useEffect(() => {
    if (!studentId || viewMode) return;
    
    // Silently load saved work if it exists
    if (hasSavedWork) {
      const saved = loadSavedWork();
      if (saved && saved.placedLoops && saved.placedLoops.length > 0) {
        setPlacedLoops(saved.placedLoops || []);
        setRequirements(saved.requirements || requirements);
        setVideoDuration(saved.videoDuration || 60);
        console.log('✅ Auto-loaded previous work from auto-save:', saved.placedLoops.length, 'loops');
      }
    }
  }, [studentId, hasSavedWork, viewMode, loadSavedWork]);
  
  // ============================================================================
  // SESSION STAGE LISTENER - REFLECTION MODAL
  // ============================================================================
  
  useEffect(() => {
    if (!isSessionMode || !sessionCode || viewMode) {
      return;
    }

    console.log('👂 Listening for reflection stage in session:', sessionCode);

    const db = getDatabase();
    const stageRef = ref(db, `sessions/${sessionCode}/currentStage`);

    const unsubscribe = onValue(stageRef, (snapshot) => {
      const stage = snapshot.val();
      console.log('📍 Stage changed to:', stage);
      
      if (stage === 'reflection') {
        console.log('🎭 Opening reflection modal on top of composition');
        setShowReflectionModal(true);
      }
    });

    return () => {
      console.log('🧹 Cleaning up stage listener');
      unsubscribe();
    };
  }, [isSessionMode, sessionCode, viewMode]);
  
  // ============================================================================
  // TEACHER FINALIZE LISTENER
  // ============================================================================
  
  // Use refs to get current values without causing re-renders
  const placedLoopsRef = useRef(placedLoops);
  const requirementsRef = useRef(requirements);
  const videoDurationRef = useRef(videoDuration);
  
  useEffect(() => {
    placedLoopsRef.current = placedLoops;
    requirementsRef.current = requirements;
    videoDurationRef.current = videoDuration;
  }, [placedLoops, requirements, videoDuration]);
  
  useEffect(() => {
    if (!isSessionMode || !sessionCode || !studentId || viewMode) {
      console.log('🚫 Finalize listener not active:', { isSessionMode, sessionCode, studentId, viewMode });
      return;
    }

    console.log('👂 Finalize listener active for student:', studentId, 'in session:', sessionCode);

    const db = getDatabase();
    const finalizeRef = ref(db, `sessions/${sessionCode}/finalizeWork`);

    const unsubscribe = onValue(finalizeRef, async (snapshot) => {
      const shouldFinalize = snapshot.val();
      
      if (shouldFinalize === true) {
        console.log('💾 Teacher requested finalization - saving work...');
        
        // Force immediate save to localStorage using the hook's saveNow
        saveNow();
        
        // Save to Firebase using current ref values
        try {
          const saveData = {
            placedLoops: placedLoopsRef.current,
            requirements: requirementsRef.current,
            videoDuration: videoDurationRef.current,
            studentName: studentId,
            timestamp: Date.now() // ✅ Add timestamp only when actually saving
          };
          
          const result = await saveCompositionToServer(
            saveData,
            'school-beneath'
          );
          
          console.log('✅ Composition saved to Firebase:', result.shareCode);
          
          // Mark this student as finalized
          const finalizedRef = ref(db, `sessions/${sessionCode}/studentsFinalized/${studentId}`);
          await set(finalizedRef, {
            savedAt: Date.now(),
            shareCode: result.shareCode
          });
          
          console.log('✅ Marked as finalized in Firebase');
          
        } catch (error) {
          console.error('❌ Finalization save failed:', error);
          
          // Still mark as finalized even if Firebase save fails (localStorage saved)
          const finalizedRef = ref(db, `sessions/${sessionCode}/studentsFinalized/${studentId}`);
          await set(finalizedRef, {
            savedAt: Date.now(),
            localOnly: true
          });
        }
      }
    });

    return () => {
      console.log('🧹 Cleaning up finalize listener');
      unsubscribe();
    };
  }, [isSessionMode, sessionCode, studentId, viewMode, saveNow]);
  
  // ============================================================================
  // TIMER
  // ============================================================================
  
  // Start timer when component mounts in session mode
  useEffect(() => {
    if (!isSessionMode || !lessonStartTime || viewMode) {
      console.log('⏱️ Timer not starting:', { isSessionMode, lessonStartTime, viewMode });
      return;
    }

    console.log('⏱️ Starting timer...');
    const now = Date.now();
    const elapsed = now - lessonStartTime;
    const remaining = Math.max(0, SCHOOL_BENEATH_DEADLINE - elapsed);
    
    setTimeRemaining(remaining);
    console.log(`⏱️ Time remaining: ${Math.floor(remaining / 1000)}s`);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(0, prev - 1000);
        
        // Log every 30 seconds
        if (newTime % 30000 === 0) {
          console.log(`⏱️ Time remaining: ${Math.floor(newTime / 1000)}s`);
        }
        
        if (newTime === 0 && !autoAdvanceCalledRef.current) {
          console.log('⏰ TIME UP! Auto-advancing...');
          autoAdvanceCalledRef.current = true;
          
          // Force save before advancing
          saveNow();
          
          setTimeout(() => {
            if (onComplete) {
              console.log('📞 Calling onComplete()');
              onComplete();
            }
          }, 1000);
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        console.log('🧹 Cleaning up timer');
        clearInterval(timerRef.current);
      }
    };
  }, [isSessionMode, lessonStartTime, onComplete, viewMode, saveNow]);
  
  // Format time remaining for display
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // ============================================================================
  // REQUIREMENT CHECKING - FIXED
  // ============================================================================
  
  const checkRequirements = useCallback((loops) => {
    console.log('🔍 Checking requirements with loops:', loops);
    
    // Debug: Log the first loop's properties to see what we're working with
    if (loops.length > 0) {
      console.log('  🔬 Sample loop structure:', {
        name: loops[0].name,
        startTime: loops[0].startTime,
        endTime: loops[0].endTime,
        allKeys: Object.keys(loops[0])
      });
    }
    
    // ✅ FIXED: Instrumentation - at least 5 different loop names (instruments)
    const uniqueLoopNames = new Set(
      loops.map(loop => loop.name || 'unknown')
    );
    const hasInstrumentation = uniqueLoopNames.size >= 5;
    console.log('  Instrumentation (5+ different loops):', hasInstrumentation, 'Unique loops:', Array.from(uniqueLoopNames));

    // ✅ FIXED: Layering - at least 3 loops playing at the same time
    // Find the maximum number of loops playing simultaneously at any point in time
    let maxSimultaneous = 0;
    
    if (loops.length >= 3) {
      // Create a timeline of all start and end times
      const events = [];
      loops.forEach(loop => {
        // Skip loops without valid time data
        if (typeof loop.startTime === 'number' && typeof loop.endTime === 'number') {
          events.push({ time: loop.startTime, type: 'start', loopName: loop.name });
          events.push({ time: loop.endTime, type: 'end', loopName: loop.name });
        }
      });
      
      // Sort events by time, with 'start' events before 'end' events at the same time
      events.sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        // At same time, 'start' comes before 'end'
        if (a.type === 'start' && b.type === 'end') return -1;
        if (a.type === 'end' && b.type === 'start') return 1;
        return 0;
      });
      
      console.log('  📊 Event timeline:', events);
      
      // Count simultaneous loops at each event
      let currentCount = 0;
      const activeLoops = [];
      
      events.forEach(event => {
        if (event.type === 'start') {
          currentCount++;
          activeLoops.push(event.loopName);
          console.log(`    ▶️ ${(event.time || 0).toFixed(2)}s: ${event.loopName} starts (count: ${currentCount}) [${activeLoops.join(', ')}]`);
          maxSimultaneous = Math.max(maxSimultaneous, currentCount);
        } else {
          currentCount--;
          const index = activeLoops.indexOf(event.loopName);
          if (index > -1) activeLoops.splice(index, 1);
          console.log(`    ⏹️ ${(event.time || 0).toFixed(2)}s: ${event.loopName} ends (count: ${currentCount}) [${activeLoops.join(', ')}]`);
        }
      });
      
      console.log('  📈 Max simultaneous loops found:', maxSimultaneous);
    }
    
    const hasLayering = maxSimultaneous >= 3;
    console.log('  Layering (3+ simultaneous):', hasLayering, 'Max simultaneous:', maxSimultaneous);

    // ✅ Structure requirement removed (always true now)
    const hasStructure = true;
    console.log('  Structure (removed):', hasStructure);

    const newRequirements = {
      instrumentation: hasInstrumentation,
      layering: hasLayering,
      structure: hasStructure
    };
    
    setRequirements(newRequirements);
    
    // Check if all requirements met for the first time
    const allMet = hasInstrumentation && hasLayering;
    const wasAllMet = requirements.instrumentation && requirements.layering;
    
    console.log('  All requirements met:', allMet, 'Was met before:', wasAllMet);
    
    if (allMet && !wasAllMet && !hasAnnouncedAhaRef.current && !viewMode && !isSessionMode) {
      console.log('🎉 ALL REQUIREMENTS MET FOR FIRST TIME!');
      hasAnnouncedAhaRef.current = true;
      
      // Show aha moment modal
      setShowAhaMomentModal(true);
      
      // Voice announcement
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          "Congratulations! You've completed all requirements. Your composition is ready to submit."
        );
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    }
    
    return newRequirements;
  }, [viewMode, isSessionMode]); // Don't include requirements - causes infinite loop
  
  // ============================================================================
  // REQUIREMENTS AUTO-CHECK - Runs after checkRequirements is defined
  // ============================================================================
  
  useEffect(() => {
    if (viewMode || placedLoops.length === 0) return;
    
    console.log('🔍 Auto-checking requirements with', placedLoops.length, 'loops');
    checkRequirements(placedLoops);
  }, [placedLoops, viewMode, checkRequirements]);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    console.log('🎵 Loop placed:', loopData, 'at trackIndex:', trackIndex, 'startTime:', startTime);
    
    // Create the loop object with proper timing properties
    const newLoop = {
      id: `${loopData.id}-${Date.now()}`,
      originalId: loopData.id,
      name: loopData.name,
      file: loopData.file,
      duration: loopData.duration,
      category: loopData.category,
      mood: loopData.mood,
      type: loopData.type,
      color: loopData.color,
      trackIndex,
      startTime,                              // ✅ Now properly set!
      endTime: startTime + loopData.duration, // ✅ Now properly set!
      volume: 1,
      muted: false
    };
    
    const newLoops = [...placedLoops, newLoop];
    setPlacedLoops(newLoops);
    checkRequirements(newLoops);
  };

  const handleLoopDeleted = (loopId) => {
    console.log('🗑️ Loop deleted:', loopId);
    const newLoops = placedLoops.filter(loop => loop.id !== loopId);
    setPlacedLoops(newLoops);
    checkRequirements(newLoops);
  };

  const handleLoopUpdated = (updatedLoop) => {
    console.log('✏️ Loop updated:', updatedLoop);
    const newLoops = placedLoops.map(loop =>
      loop.id === updatedLoop.id ? updatedLoop : loop
    );
    setPlacedLoops(newLoops);
    checkRequirements(newLoops);
  };
  
  // Handle submission - saves composition and enters exploration mode
  const handleSubmitActivity = () => {
    console.log('💾 Submitting composition...');
    
    hasSubmittedRef.current = true;
    
    // Save composition data
    const compositionWithRequirements = {
      ...compositionData,
      requirements,
      completedAt: new Date().toISOString()
    };
    
    saveComposition(placedLoops, requirements, videoDuration);
    
    console.log('✅ Composition saved');
    
    // Show success modal
    setShowAhaMomentModal(false);
    setShowSubmitSuccessModal(true);
    
    // Voice announcement
    if ('speechSynthesis' in window && !hasAnnouncedSubmitRef.current) {
      hasAnnouncedSubmitRef.current = true;
      const utterance = new SpeechSynthesisUtterance(
        "Excellent work! Your composition has been saved. All loops are now unlocked for exploration."
      );
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
    
    // Countdown for modal
    let countdown = 5;
    setSubmitCountdown(countdown);
    const countdownInterval = setInterval(() => {
      countdown--;
      setSubmitCountdown(countdown);
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        setShowSubmitSuccessModal(false);
        setIsExplorationMode(true);
        console.log('🎉 Entering exploration mode!');
      }
    }, 1000);
  };
  
  // Handle reflection completion
  const handleReflectionComplete = () => {
    console.log('✅ Reflection complete');
    setShowReflectionModal(false);
    // Don't call onComplete - teacher controls advancement
  };
  
  // Handle bonus activity (Name That Loop)
  const handlePlayNameThatLoop = () => {
    console.log('🎮 Starting Name That Loop game');
    setShowReflectionModal(false);
    setShowNameThatLoop(true);
  };
  
  const handleBackToReflection = () => {
    console.log('◀️ Returning to reflection');
    setShowNameThatLoop(false);
    setShowReflectionModal(true);
  };

  // Left panel content
  const assignmentPanelContent = !viewMode && !isExplorationMode ? (
    <div className="h-full bg-gray-800 text-white p-2 flex flex-col gap-2 overflow-y-auto">
      {/* Title - BIG */}
      <div className="text-center">
        <h3 className="font-bold text-base mb-1">🎬 School Beneath</h3>
        <p className="text-xs text-gray-300">Create a mysterious underwater atmosphere</p>
      </div>

      {/* Requirements Checklist - SIMPLIFIED: Only Instrumentation and Layering */}
      <div className="bg-gray-700/50 rounded p-2">
        <p className="text-[10px] font-semibold mb-1.5 text-blue-300">Requirements:</p>
        <div className="space-y-1 text-[10px]">
          <div className={`flex items-start gap-1.5 ${requirements.instrumentation ? 'text-green-400' : 'text-gray-300'}`}>
            <span className="text-base leading-none">{requirements.instrumentation ? '✓' : '○'}</span>
            <span className="leading-tight">
              <strong>Instrumentation:</strong> Use 5+ different instruments
            </span>
          </div>
          <div className={`flex items-start gap-1.5 ${requirements.layering ? 'text-green-400' : 'text-gray-300'}`}>
            <span className="text-base leading-none">{requirements.layering ? '✓' : '○'}</span>
            <span className="leading-tight">
              <strong>Layering:</strong> Have 3+ loops playing at the same time
            </span>
          </div>
        </div>
      </div>
      
      {/* Auto-save indicator at bottom */}
      <div className="mt-auto">
        <AutoSaveIndicator 
          lastSaved={lastSaved}
          isSaving={isSaving}
        />
      </div>
    </div>
  ) : !viewMode && isExplorationMode ? (
    <div className="h-full bg-gray-800 text-white p-2 flex flex-col gap-2 overflow-y-auto">
      {/* Title - BIG */}
      <div className="text-center">
        <h3 className="font-bold text-base mb-1 flex items-center justify-center gap-1">
          <span>🎉</span>
          <span>Exploration Mode</span>
        </h3>
        <p className="text-xs text-gray-300">All loops unlocked! Experiment freely</p>
      </div>

      {/* Status Box */}
      <div className="bg-green-900/30 rounded p-2 text-center">
        <p className="text-green-400 font-semibold text-xs">✓ Assignment Complete!</p>
        <p className="text-[9px] text-green-200 mt-1">Your work is saved. Explore until the reflection activity starts.</p>
      </div>

      {/* Exploration Tips */}
      <div className="bg-purple-900/30 rounded p-2 text-[9px] text-purple-200">
        <p className="font-semibold mb-1">🎵 Try These Experiments:</p>
        <ul className="space-y-0.5 ml-3 list-disc">
          <li>Add scary loops for a horror feel</li>
          <li>Try heroic loops for an adventure theme</li>
          <li>Mix upbeat loops for a different mood</li>
          <li>Compare how different moods change the story</li>
        </ul>
      </div>
      
      {/* Auto-save indicator at bottom */}
      <div className="mt-auto">
        <AutoSaveIndicator 
          lastSaved={lastSaved}
          isSaving={isSaving}
        />
      </div>
    </div>
  ) : null;

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="h-full w-full bg-gray-900">
      <MusicComposer
        preselectedVideo={{
          src: "/lessons/videos/film-music-loop-project/SchoolMystery.mp4",
          title: "School Beneath",
          duration: 60
        }}
        onLoopDropCallback={handleLoopPlaced}
        onLoopDeleteCallback={handleLoopDeleted}
        onLoopUpdateCallback={handleLoopUpdated}
        placedLoops={placedLoops}
        onVideoDurationDetected={setVideoDuration}
        assignmentPanelContent={assignmentPanelContent}
        disableSaving={viewMode}
        allowLoopDeletion={!viewMode}
        allowLoopEditing={!viewMode}
        isExplorationMode={isExplorationMode}
        viewMode={viewMode}
        showSoundEffects={false}
        hideHeader={true}
      />

      {/* Aha Moment Modal - Submit Button */}
      {showAhaMomentModal && !isMinimizedModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsMinimizedModal(true)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <Minimize2 size={20} />
            </button>
            
            <div className="text-center">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-2xl font-bold text-white mb-3">Great Work!</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                You've completed all the requirements! Your mysterious underwater score is ready.
              </p>
              
              <button
                onClick={() => {
                  setShowAhaMomentModal(false);
                  handleSubmitActivity();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold text-lg transition-colors shadow-lg"
              >
                Submit & Unlock All Loops 🎉
              </button>
              
              <p className="text-xs text-blue-200 mt-4">
                After submitting, you'll have bonus time to experiment with all loops!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Aha Modal */}
      {showAhaMomentModal && isMinimizedModal && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsMinimizedModal(false)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <span className="text-xl">💡</span>
            <span className="font-semibold">Ready to Submit</span>
            <Maximize2 size={16} />
          </button>
        </div>
      )}

      {/* Submit Success Modal with Countdown */}
      {showSubmitSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-900 to-blue-900 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
            <div className="text-7xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold text-white mb-4">Submission Complete!</h3>
            <p className="text-green-100 text-lg mb-6 leading-relaxed">
              Your composition has been saved to the main menu.
            </p>
            
            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <p className="text-white font-semibold mb-2">🎵 Bonus Time!</p>
              <p className="text-blue-200 text-sm">
                All loops are now unlocked. Experiment with different moods until the reflection activity begins.
              </p>
            </div>

            <div className="text-white/70 text-sm">
              Closing in {submitCountdown} seconds...
            </div>
          </div>
        </div>
      )}

      {/* Reflection Modal - Appears when teacher unlocks reflection */}
      {showReflectionModal && (
        <ReflectionModal
          compositionData={{ placedLoops, requirements, videoDuration }}
          onComplete={handleReflectionComplete}
          viewMode={false}
          isSessionMode={isSessionMode}
        />
      )}

      {/* Name That Loop Game - Full screen overlay */}
      {showNameThatLoop && (
        <div className="fixed inset-0 z-[60] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <NameThatLoopActivity 
            onComplete={() => {
              console.log('🎮 Name That Loop complete');
              setShowNameThatLoop(false);
            }}
            onBackToReflection={handleBackToReflection}
          />
        </div>
      )}
    </div>
  );
};

export default SchoolBeneathActivity;