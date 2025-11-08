// File: /src/lessons/film-music-project/lesson1/activities/SchoolBeneathActivity.jsx
// ENHANCED VERSION with Auto-Save, Two-Modal Flow, Voice Announcements, and Teacher Finalize
// FIXED: Removed timestamp from compositionData to prevent infinite re-renders
// FIXED: Added useEffect to handle session mode loading
// DEBUG: Added logging to diagnose loading screen issue

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Minimize2, Maximize2 } from 'lucide-react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { saveComposition, saveBonusComposition } from '../../film-music-project/lesson1/lessonStorageUtils';
import { saveCompositionToServer } from '../../film-music-project/lesson1/compositionServerUtils';
import { useAutoSave, AutoSaveIndicator } from '../../../hooks/useAutoSave.jsx';
import { useSession } from '../../../context/SessionContext';
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
  
  const [saveMessage, setSaveMessage] = useState('');
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
  
  // State to show Sound Effects activity after submission
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
  
  // Check for saved work on mount (after studentId is set)
  useEffect(() => {
    if (!studentId || viewMode) return;
    
    // Check if there's saved work
    if (hasSavedWork) {
      const saved = loadSavedWork();
      if (saved && saved.placedLoops) {
        // Ask if they want to load it
        const shouldLoad = window.confirm(
          "You have saved work from before. Would you like to continue where you left off?\n\n" +
          "Click OK to load your previous work, or Cancel to start fresh."
        );
        
        if (shouldLoad) {
          setPlacedLoops(saved.placedLoops || []);
          setRequirements(saved.requirements || requirements);
          setVideoDuration(saved.videoDuration || 60);
          console.log('✅ Loaded previous work from auto-save');
        }
      }
    }
  }, [studentId, hasSavedWork, viewMode, loadSavedWork]);
  
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
      console.log('🔇 Finalize listener cleanup for student:', studentId);
      unsubscribe();
    };
    // 🚨 CRITICAL: Don't include saveNow in dependencies - it causes re-renders
    // We call it inside the listener, but don't need to re-subscribe when it changes
  }, [isSessionMode, sessionCode, studentId, viewMode]);
  
  // ============================================================================
  // WEB SPEECH API
  // ============================================================================
  
  const speakMessage = (message) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name === 'Samantha' || 
        voice.name === 'Google US English' ||
        voice.name === 'Google US English Female' ||
        (voice.lang === 'en-US' && voice.name.includes('Microsoft')) ||
        voice.lang.startsWith('en-US')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // ============================================================================
  // LOAD SAVED COMPOSITION (VIEW MODE)
  // ============================================================================
  
  useEffect(() => {
    if (viewMode) {
      const storageKey = viewBonusMode ? 'view-school-beneath-bonus' : 'view-school-beneath';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setPlacedLoops(data.placedLoops || []);
          setRequirements(data.requirements || requirements);
          setVideoDuration(data.videoDuration || 60);
          setIsLoadingVideo(false);
        } catch (e) {
          console.error('Failed to load saved composition:', e);
        }
      }
    }
  }, [viewMode, viewBonusMode]);

  // ============================================================================
  // VIDEO DURATION TRACKING
  // ============================================================================
  
  useEffect(() => {
    if (videoDuration !== null && videoDuration > 0) {
      console.log('Video duration detected:', videoDuration, 'seconds');
      setIsLoadingVideo(false);
    }
  }, [videoDuration]);

  // ============================================================================
  // REQUIREMENTS CHECKING
  // ============================================================================
  
  useEffect(() => {
    console.log('Checking requirements with loops:', placedLoops);
    
    // Count unique loop IDs (ignoring timestamps)
    const uniqueLoops = new Set(placedLoops.map(loop => loop.originalId || loop.id));
    const uniqueLoopCount = uniqueLoops.size;
    
    // Count unique start times (to check for layering)
    const uniqueStartTimes = new Set(placedLoops.map(loop => Math.floor(loop.startTime)));
    const hasLayering = uniqueStartTimes.size >= 2;
    
    // Check requirements
    const instrumentation = uniqueLoopCount >= 3;
    console.log('Instrumentation check:', instrumentation, 'Unique loops:', uniqueLoopCount);
    
    const layering = placedLoops.length >= 2 && hasLayering;
    console.log('Layering check:', layering, 'Unique start times:', uniqueStartTimes.size);
    
    const structure = placedLoops.length >= 2;
    console.log('Structure check:', structure);
    
    const newRequirements = {
      instrumentation,
      layering,
      structure
    };
    
    console.log('Requirements updated:', newRequirements);
    setRequirements(newRequirements);
  }, [placedLoops]);

  // ============================================================================
  // LOOP PLACEMENT HANDLERS
  // ============================================================================
  
  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    console.log('Loop placed callback received:', loopData, trackIndex, startTime);
    
    // Validate track index
    if (trackIndex < 0 || trackIndex >= 4) {
      console.error('Invalid track index:', trackIndex);
      return;
    }
    
    // Generate unique ID for this placement
    const placementId = `${loopData.id}-${Date.now()}`;
    
    const newLoop = {
      id: placementId,
      originalId: loopData.id,
      name: loopData.name,
      file: loopData.file,
      duration: loopData.duration,
      category: loopData.category,
      mood: loopData.mood,
      color: loopData.color,
      trackIndex: trackIndex,
      startTime: startTime,
      volume: 1.0
    };
    
    setPlacedLoops(prev => {
      const updated = [...prev, newLoop];
      console.log('Updated placedLoops:', updated);
      return updated;
    });
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
  // SAVE HANDLERS
  // ============================================================================
  
  // Manual save (uses old localStorage + Firebase)
  const handleSaveProgress = async () => {
    const saveData = {
      placedLoops,
      requirements,
      videoDuration,
      timestamp: Date.now()
    };
    
    // Save to old localStorage key (for compatibility)
    localStorage.setItem('school-beneath-composition', JSON.stringify(saveData));
    
    // Also trigger auto-save
    saveNow();
    
    // Save to Firebase for teacher viewing
    try {
      const result = await saveCompositionToServer(
        {
          ...saveData,
          studentName: studentId,
        },
        'school-beneath'
      );
      console.log('✅ Composition saved to Firebase:', result.shareCode);
      setSaveMessage('✓ Saved!');
    } catch (error) {
      console.error('❌ Firebase save failed:', error);
      setSaveMessage('✓ Saved locally!');
    }
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleAutoSave = () => {
    const saveData = {
      placedLoops,
      requirements,
      videoDuration,
      timestamp: Date.now()
    };
    
    localStorage.setItem('school-beneath-composition', JSON.stringify(saveData));
  };

  // Submit handler with Firebase saving + enters exploration mode
  const handleSubmitActivity = async () => {
    if (hasSubmittedRef.current) return;
    
    // Save the main composition
    saveComposition(placedLoops, requirements, videoDuration);
    console.log('Submitted composition with saveComposition()');
    
    // Save to Firebase for teacher
    try {
      const result = await saveCompositionToServer(
        {
          placedLoops,
          requirements,
          videoDuration,
          studentName: studentId,
          timestamp: Date.now()
        },
        'school-beneath'
      );
      console.log('✅ Composition saved to Firebase:', result.shareCode);
    } catch (error) {
      console.error('❌ Firebase save failed:', error);
    }
    
    hasSubmittedRef.current = true;
    
    // Enter exploration mode
    setIsExplorationMode(true);
    
    // Show submit success modal
    setShowSubmitSuccessModal(true);
    
    // Speak the success message
    if (!hasAnnouncedSubmitRef.current) {
      hasAnnouncedSubmitRef.current = true;
      speakMessage("Your work has been saved in the main menu. Now you have bonus time until the reflection activity. All loops have been unlocked. Let's hear how adding the scary, heroic, or upbeat loops give the video a different feeling with the time you have left.");
    }
  };

  const allRequirementsMet = requirements.instrumentation && 
                             requirements.layering && 
                             requirements.structure;

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  
  console.log('🔍 Loading check:', { 
    isLoadingVideo, 
    viewMode, 
    isSessionMode,
    shouldShowLoading: isLoadingVideo && !viewMode && !isSessionMode 
  });

  if (isLoadingVideo && !viewMode && !isSessionMode) {
    console.log('🚫 SHOWING LOADING SCREEN');
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading video...</p>
          <p className="text-xs text-gray-400 mt-2">
            Debug: isSessionMode={isSessionMode.toString()}, isLoadingVideo={isLoadingVideo.toString()}, viewMode={viewMode.toString()}
          </p>
        </div>
      </div>
    );
  }

  console.log('✅ BYPASSING LOADING SCREEN - Rendering DAW');

  // ============================================================================
  // ASSIGNMENT PANEL CONTENT
  // ============================================================================
  
  const assignmentPanelContent = !viewMode && !isExplorationMode ? (
    <div className="h-full bg-gray-800 text-white p-2 flex flex-col gap-2 overflow-y-auto">
      {/* Auto-Save Indicator */}
      {studentId && (
        <div className="bg-gray-700 rounded px-2 py-1 flex items-center justify-center">
          <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      )}
      
      {/* Save/Submit Buttons */}
      <div className="flex flex-col gap-1">
        <button
          onClick={handleSaveProgress}
          className="w-full px-3 py-1 text-xs rounded font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        >
          💾 Save Now
        </button>
        <button
          onClick={handleSubmitActivity}
          disabled={!allRequirementsMet}
          className={`w-full px-3 py-1 text-xs rounded font-medium transition-all ${
            allRequirementsMet
              ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse shadow-lg shadow-green-500/50'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {allRequirementsMet ? '📤 Submit' : 'Submit (Complete Requirements)'}
        </button>
        
        <button
          onClick={handleSaveProgress}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
        >
          💾 Save Progress
        </button>
        
        {saveMessage && (
          <div className="text-[9px] text-green-400 font-semibold text-center bg-green-900/20 py-1 rounded">
            {saveMessage}
          </div>
        )}
      </div>

      {/* Requirements Checklist */}
      <div className="bg-gray-700 rounded p-2">
        <h4 className="font-semibold text-xs mb-1.5">Assignment Requirements:</h4>
        <div className="space-y-1 text-[10px]">
          <div className={`flex items-start gap-1.5 ${requirements.instrumentation ? 'text-green-400' : 'text-gray-300'}`}>
            <span className="text-base leading-none">{requirements.instrumentation ? '✓' : '○'}</span>
            <span className="leading-tight">
              <strong>Instrumentation:</strong> Use at least 3 different mysterious loops (bass, strings, piano)
            </span>
          </div>
          <div className={`flex items-start gap-1.5 ${requirements.layering ? 'text-green-400' : 'text-gray-300'}`}>
            <span className="text-base leading-none">{requirements.layering ? '✓' : '○'}</span>
            <span className="leading-tight">
              <strong>Layering:</strong> Have loops playing at different times to create depth
            </span>
          </div>
          <div className={`flex items-start gap-1.5 ${requirements.structure ? 'text-green-400' : 'text-gray-300'}`}>
            <span className="text-base leading-none">{requirements.structure ? '✓' : '○'}</span>
            <span className="leading-tight">
              <strong>Structure:</strong> Place at least 2 loops to create a complete score
            </span>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-900/30 rounded p-2 text-[9px] text-blue-200">
        <p className="font-semibold mb-1">💡 Composition Tips:</p>
        <ul className="space-y-0.5 ml-3 list-disc">
          <li>Start with a bass loop for foundation</li>
          <li>Add strings or piano for melody</li>
          <li>Layer loops at different times</li>
          <li>Create a mysterious, underwater feeling</li>
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

      {/* Action Buttons */}
      <div className="space-y-1">
        <button
          onClick={handleSaveProgress}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
        >
          💾 Save Changes
        </button>
        
        {saveMessage && (
          <div className="text-[9px] text-green-400 font-semibold text-center bg-green-900/20 py-1 rounded">
            {saveMessage}
          </div>
        )}
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
  
  // Show Sound Effects activity after submission in session mode
  if (showSoundEffects && isSessionMode) {
    return (
      <SoundEffectsActivity
        onComplete={onComplete}
        viewMode={false}
        lessonStartTime={lessonStartTime}
      />
    );
  }
  
  return (
    <div className="h-full w-full bg-gray-900">
      <MusicComposer
        videoSrc="/projects/film-music-score/videos/school-beneath.mp4"
        onLoopPlaced={handleLoopPlaced}
        onLoopDeleted={handleLoopDeleted}
        onLoopUpdated={handleLoopUpdated}
        placedLoops={placedLoops}
        onVideoDurationDetected={setVideoDuration}
        assignmentPanelContent={assignmentPanelContent}
        disableSaving={viewMode}
        allowLoopDeletion={!viewMode}
        allowLoopEditing={!viewMode}
        isExplorationMode={isExplorationMode}
        viewMode={viewMode}
        showSoundEffects={false}
      />

      {/* Aha Moment Modal */}
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
    </div>
  );
};

export default SchoolBeneathActivity;