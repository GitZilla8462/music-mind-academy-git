// File: /src/lessons/film-music-project/lesson1/activities/SchoolBeneathActivity.jsx
// ENHANCED VERSION with Two-Modal Flow and Voice Announcements
// UPDATED: isSessionMode prop to hide timer for students in session mode

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Minimize2, Maximize2 } from 'lucide-react';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { saveComposition, saveBonusComposition } from '../../film-music-project/lesson1/lessonStorageUtils';
import SoundEffectsActivity from './SoundEffectsActivity';

const SCHOOL_BENEATH_DEADLINE = 30 * 60 * 1000; // 30 minutes in milliseconds

const SchoolBeneathActivity = ({ 
  onComplete, 
  viewMode = false, 
  viewBonusMode = false, 
  lessonStartTime,
  isSessionMode = false  // NEW: Hide timer in session mode
}) => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState({
    instrumentation: false,
    layering: false,
    structure: false
  });
  const [placedLoops, setPlacedLoops] = useState([]);
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [isExplorationMode, setIsExplorationMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const autoAdvanceCalledRef = useRef(false);
  const [isMinimizedModal, setIsMinimizedModal] = useState(false);
  
  // NEW: Modal states for the two-modal flow
  const [showAhaMomentModal, setShowAhaMomentModal] = useState(false);
  const [showSubmitSuccessModal, setShowSubmitSuccessModal] = useState(false);
  const [submitCountdown, setSubmitCountdown] = useState(5);
  const hasAnnouncedAhaRef = useRef(false);
  const hasAnnouncedSubmitRef = useRef(false);
  
  // NEW: State to show Sound Effects activity after submission
  const [showSoundEffects, setShowSoundEffects] = useState(false);

  // NEW: Web Speech API helper function
  const speakMessage = (message) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to get a good voice
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

  // Load saved composition if in view mode
  useEffect(() => {
    if (viewMode) {
      const storageKey = viewBonusMode ? 'school-beneath-bonus' : 'school-beneath-composition';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setPlacedLoops(data.placedLoops || []);
          setRequirements(data.requirements || requirements);
          setVideoDuration(data.videoDuration || 60);
          setIsLoadingVideo(false);
          console.log('Loaded saved composition:', data);
        } catch (error) {
          console.error('Error loading saved composition:', error);
        }
      }
    }
  }, [viewMode, viewBonusMode]);

  // Calculate time remaining and start countdown - ONLY IN SELF-GUIDED MODE
  useEffect(() => {
    if (!lessonStartTime || viewMode || isSessionMode) return;  // NEW: Skip timer in session mode

    const calculateRemaining = () => {
      const elapsed = Date.now() - lessonStartTime;
      const remaining = SCHOOL_BENEATH_DEADLINE - elapsed;
      return Math.max(0, remaining);
    };

    const remaining = calculateRemaining();
    setTimeRemaining(remaining);

    timerRef.current = setInterval(() => {
      const newRemaining = calculateRemaining();
      setTimeRemaining(newRemaining);

      if (newRemaining <= 0 && !autoAdvanceCalledRef.current) {
        autoAdvanceCalledRef.current = true;
        clearInterval(timerRef.current);
        
        handleAutoSave();
        setSaveMessage('â° Time\'s up! Great work - let\'s share!');
        
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lessonStartTime, viewMode, isSessionMode, onComplete]);  // NEW: Added isSessionMode to deps

  // Detect video duration on mount
  useEffect(() => {
    if (viewMode) return;

    const videoPath = '/lessons/videos/film-music-loop-project/SchoolMystery.mp4';
    const videoElement = document.createElement('video');
    videoElement.src = videoPath;
    videoElement.preload = 'metadata';
    
    const handleMetadata = () => {
      const duration = videoElement.duration;
      console.log('Video duration detected:', duration, 'seconds');
      setVideoDuration(duration);
      setIsLoadingVideo(false);
      videoElement.removeEventListener('loadedmetadata', handleMetadata);
      videoElement.src = '';
    };
    
    const handleError = (e) => {
      console.error('Error loading video:', e);
      setVideoDuration(60);
      setIsLoadingVideo(false);
      videoElement.removeEventListener('error', handleError);
    };
    
    videoElement.addEventListener('loadedmetadata', handleMetadata);
    videoElement.addEventListener('error', handleError);
    
    const timeout = setTimeout(() => {
      if (videoDuration === null) {
        console.warn('Video duration detection timeout, using fallback 60s');
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

  // Check requirements as loops are placed
  useEffect(() => {
    if (viewMode || placedLoops.length === 0 || isExplorationMode) return;
    checkRequirements();
  }, [placedLoops, viewMode, isExplorationMode]);

  // NEW: Detect when all requirements are met for first time
  useEffect(() => {
    const allMet = requirements.instrumentation && 
                   requirements.layering && 
                   requirements.structure;
    
    if (allMet && !hasAnnouncedAhaRef.current && !isExplorationMode && !viewMode) {
      hasAnnouncedAhaRef.current = true;
      
      // Show "Aha Moment" modal
      setShowAhaMomentModal(true);
      
      // Speak the announcement
      speakMessage("Good job! Your work can now be submitted. Hit the save and submit button at this time.");
    }
  }, [requirements, isExplorationMode, viewMode]);

  // NEW: Handle submit success modal countdown - transition to Sound Effects Activity
  useEffect(() => {
    if (showSubmitSuccessModal && submitCountdown > 0) {
      const timer = setTimeout(() => {
        setSubmitCountdown(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (showSubmitSuccessModal && submitCountdown === 0) {
      // Countdown complete - show Sound Effects Activity
      setShowSubmitSuccessModal(false);
      setShowSoundEffects(true);
      
      // In session mode, students stay on same stage but see different content
      // In non-session mode, call onComplete to advance
      if (!isSessionMode && onComplete) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }
  }, [showSubmitSuccessModal, submitCountdown, onComplete, isSessionMode]);

  // NEW: Auto-save bonus composition during exploration
  useEffect(() => {
    if (isExplorationMode && placedLoops.length > 0 && !viewMode) {
      const autoSaveTimer = setTimeout(() => {
        saveBonusComposition(placedLoops, videoDuration);
        console.log('Auto-saved bonus composition');
      }, 2000);
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [placedLoops, isExplorationMode, videoDuration, viewMode]);

  const checkRequirements = () => {
    console.log('Checking requirements with loops:', placedLoops);
    
    const allMysterious = placedLoops.every(loop => loop.mood === 'Mysterious');
    if (!allMysterious) {
      console.warn('Non-Mysterious loops detected!');
      setRequirements({
        instrumentation: false,
        layering: false,
        structure: false
      });
      return;
    }
    
    const uniqueLoops = new Set(placedLoops.map(loop => loop.originalId || loop.id));
    const hasInstrumentation = uniqueLoops.size >= 5;

    const startTimes = new Set(placedLoops.map(loop => Math.floor(loop.startTime)));
    const hasLayering = startTimes.size >= 3 && placedLoops.length >= 5;

    const hasStructure = placedLoops.length >= 5;

    const newRequirements = {
      instrumentation: hasInstrumentation,
      layering: hasLayering,
      structure: hasStructure
    };
    
    setRequirements(newRequirements);
  };

  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    console.log('Loop placed callback received:', loopData, trackIndex, startTime);
    
    if (!isExplorationMode && loopData.mood !== 'Mysterious') {
      console.warn('Rejected non-Mysterious loop:', loopData.category);
      setSaveMessage('âŒ Only Mysterious loops allowed!');
      setTimeout(() => setSaveMessage(''), 2000);
      return;
    }
    
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

  const handleSaveProgress = () => {
    const saveData = {
      placedLoops,
      requirements,
      videoDuration,
      timestamp: Date.now()
    };
    
    localStorage.setItem('school-beneath-composition', JSON.stringify(saveData));
    setSaveMessage('âœ“ Progress saved!');
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

  // NEW: Enhanced submit handler with modal flow
  const handleSubmitActivity = () => {
    if (hasSubmittedRef.current) return;
    
    // Save the main composition using the utility function
    saveComposition(placedLoops, requirements, videoDuration);
    console.log('Submitted composition with saveComposition()');
    
    hasSubmittedRef.current = true;
    
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

  // Assignment panel content
  const assignmentPanelContent = !viewMode && !isExplorationMode ? (
    <div className="h-full bg-gray-800 text-white p-2 flex flex-col gap-2 overflow-y-auto">
      {/* Save/Submit Buttons */}
      <div className="flex flex-col gap-1">
        <button
          onClick={handleSaveProgress}
          className="w-full px-3 py-1 text-xs rounded font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Progress
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
          {allRequirementsMet ? 'âœ“ Save & Submit' : 'Submit (Complete Requirements)'}
        </button>
      </div>

      {/* Assignment Requirements */}
      <div>
        <h3 className="font-bold text-[10px] mb-1">Composition Assignment</h3>
      </div>

      <div className="space-y-1">
        <h4 className="font-semibold text-[9px] text-gray-400">Requirements:</h4>
        
        <div className={`flex items-start gap-1 px-1 py-0.5 rounded border ${
          requirements.instrumentation 
            ? 'bg-green-900/30 border-green-500' 
            : 'bg-gray-700 border-gray-600'
        }`}>
          <span className={`flex-shrink-0 text-[9px] ${requirements.instrumentation ? 'text-green-400' : 'text-gray-500'}`}>
            {requirements.instrumentation ? 'âœ“' : 'â—‹'}
          </span>
          <div className="text-[9px]">
            <div className="font-semibold">Instrumentation</div>
            <div className="text-gray-300">5+ Mysterious loops</div>
          </div>
        </div>

        <div className={`flex items-start gap-1 px-1 py-0.5 rounded border ${
          requirements.layering 
            ? 'bg-green-900/30 border-green-500' 
            : 'bg-gray-700 border-gray-600'
        }`}>
          <span className={`flex-shrink-0 text-[9px] ${requirements.layering ? 'text-green-400' : 'text-gray-500'}`}>
            {requirements.layering ? 'âœ“' : 'â—‹'}
          </span>
          <div className="text-[9px]">
            <div className="font-semibold">Layering</div>
            <div className="text-gray-300">3+ different times</div>
          </div>
        </div>

        <div className={`flex items-start gap-1 px-1 py-0.5 rounded border ${
          requirements.structure 
            ? 'bg-green-900/30 border-green-500' 
            : 'bg-gray-700 border-gray-600'
        }`}>
          <span className={`flex-shrink-0 text-[9px] ${requirements.structure ? 'text-green-400' : 'text-gray-500'}`}>
            {requirements.structure ? 'âœ“' : 'â—‹'}
          </span>
          <div className="text-[9px]">
            <div className="font-semibold">Structure</div>
            <div className="text-gray-300">5+ loops total</div>
          </div>
        </div>
      </div>
    </div>
  ) : isExplorationMode ? (
    <div className="h-full bg-gray-800 text-white p-2 flex flex-col gap-2 overflow-y-auto">
      <div>
        <h3 className="font-bold text-[10px] mb-1">âœ¨ Bonus Exploration</h3>
        <p className="text-[9px] text-gray-300 leading-relaxed">
          Great job! Use the remaining time to explore.
        </p>
      </div>
      
      {/* Timer Display - ONLY SHOW IN SELF-GUIDED MODE */}
      {!isSessionMode && (
        <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500 rounded-lg p-2">
          <div className="text-[9px] text-gray-300 mb-1 font-semibold">
            Time Remaining:
          </div>
          <div className="text-xl font-bold text-green-400 mb-1">
            {formatTime(timeRemaining)}
          </div>
          <div className="text-[9px] text-gray-400">
            All loops unlocked!
          </div>
        </div>
      )}

      <div className="text-[9px] text-gray-300 bg-blue-900/30 border border-blue-500 rounded-lg p-2">
        <div className="font-semibold mb-1">ðŸ’¡ Try these:</div>
        <ul className="space-y-0.5 text-[9px]">
          <li>â­ <strong>Heroic</strong> loops</li>
          <li>ðŸ‘» <strong>Scary</strong> loops</li>
          <li>ðŸŽŠ <strong>Upbeat</strong> loops</li>
          <li>ðŸŽ­ Mix moods</li>
        </ul>
      </div>
    </div>
  ) : null;

  // If Sound Effects mode is active, render that component instead
  if (showSoundEffects) {
    return (
      <SoundEffectsActivity
        onComplete={onComplete}
        viewMode={false}
        lessonStartTime={lessonStartTime}
        isSessionMode={isSessionMode}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* MODAL 1: "Aha Moment" - All Requirements Met */}
      {showAhaMomentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200]">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 border-green-400">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white text-center">
                ðŸŽ‰ Great Job!
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-800 text-center font-semibold text-lg">
                You've completed all the requirements!
              </p>
              
              <div className="space-y-2 bg-white rounded-lg p-4 border border-green-300">
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-lg">âœ“</span>
                  <span className="font-medium">Instrumentation - 5+ Mysterious loops</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-lg">âœ“</span>
                  <span className="font-medium">Layering - Different start times</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <span className="text-lg">âœ“</span>
                  <span className="font-medium">Structure - Proper alignment</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-700 font-medium mb-2">
                  Your composition is ready to submit!
                </p>
                <p className="text-sm text-gray-600">
                  Click the <span className="font-bold text-green-600">"Save & Submit"</span> button 
                  in the left panel to save your work and unlock bonus exploration time.
                </p>
              </div>

              <button
                onClick={() => setShowAhaMomentModal(false)}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-lg"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: "Submit Success" - Transition to Exploration */}
      {showSubmitSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 border-2 border-green-400">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4 rounded-t-xl">
              <h2 className="text-3xl font-bold text-white text-center">
                ðŸŽ‰ Assignment Submitted!
              </h2>
            </div>
            
            <div className="p-8 space-y-5 text-center">
              <div className="text-5xl animate-bounce">
                âœ“
              </div>

              <p className="text-xl text-gray-800 font-semibold">
                Your work has been saved in the main menu.
              </p>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-5">
                <p className="text-lg text-gray-700 font-medium mb-2">
                  Now you have <span className="text-green-600 font-bold">BONUS TIME</span> until the reflection activity!
                </p>
                <p className="text-md text-gray-600">
                  ðŸ”“ All loops have been unlocked!
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-semibold text-gray-800 mb-3">ðŸ’¡ Try adding:</div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-white rounded p-2 border border-yellow-300">
                    <div className="text-2xl mb-1">â­</div>
                    <div className="font-medium text-gray-700">Heroic</div>
                    <div className="text-xs text-gray-500">Adventure feel</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-purple-300">
                    <div className="text-2xl mb-1">ðŸ‘»</div>
                    <div className="font-medium text-gray-700">Scary</div>
                    <div className="text-xs text-gray-500">Extra suspense</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-pink-300">
                    <div className="text-2xl mb-1">ðŸŽŠ</div>
                    <div className="font-medium text-gray-700">Upbeat</div>
                    <div className="text-xs text-gray-500">Different mood</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 italic">
                Let's hear how different loops give the video a completely different feeling!
              </p>

              <div className="mt-6 bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium">
                  Starting Sound Effects Activity in
                </p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {submitCountdown}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exploration Mode Minimizable Modal (existing) - HIDE TIMER IN SESSION MODE */}
      {isExplorationMode && !isMinimizedModal && !isSessionMode && (
        <div className="fixed top-16 right-4 z-[200] w-80 bg-white rounded-lg shadow-2xl flex flex-col max-h-96 border-2 border-green-500">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-3 py-2 rounded-t-lg flex items-center justify-between flex-shrink-0">
            <div className="text-white font-bold text-sm">
              <span>Bonus Exploration</span>
            </div>
            <button
              onClick={() => setIsMinimizedModal(!isMinimizedModal)}
              className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 size={16} />
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex flex-col items-center text-center space-y-3">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  ðŸŽ‰ Assignment Submitted!
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Great job! Use the remaining time to explore.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-3 w-full">
                <div className="text-xs text-gray-600 mb-1 font-semibold">
                  Time Remaining:
                </div>
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-gray-500">
                  All loops unlocked - experiment!
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
                <div className="font-semibold mb-2 text-sm">ðŸ’¡ Try these ideas:</div>
                <ul className="text-left space-y-1 text-xs">
                  <li>â­ <strong>Heroic</strong> loops for an adventure feel</li>
                  <li>ðŸ‘» <strong>Scary</strong> loops for extra suspense</li>
                  <li>ðŸŽŠ <strong>Upbeat</strong> loops for a happy ending</li>
                  <li>ðŸŽ­ Mix moods to create your own unique style</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Header */}
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            {!lessonStartTime ? (
              <>
                <h2 className="text-sm font-bold whitespace-nowrap">
                  {viewMode ? (viewBonusMode ? "Viewing Bonus Composition: " : "Viewing Saved Work: ") : ""}
                  {isExplorationMode ? 'â™ª Bonus Composition - The School Beneath' : 'The School Beneath - Composition Assignment'}
                </h2>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-xs text-gray-400">
                    {placedLoops.length} loops
                  </div>

                  {saveMessage && (
                    <div className="text-xs text-green-400 font-semibold animate-pulse">
                      {saveMessage}
                    </div>
                  )}

                  {viewMode && (
                    <button
                      onClick={() => navigate('/')}
                      className="px-4 py-1.5 text-sm rounded font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Back to Resources
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <MusicComposer
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
          filterLoopCategory={isExplorationMode ? null : "Mysterious"}
          lockedMood={isExplorationMode ? null : "Mysterious"}
          restrictToCategory={isExplorationMode ? null : "Mysterious"}
          hideHeader={true}
          hideSubmitButton={true}
          isLessonMode={true}
          showToast={(msg, type) => console.log(msg, type)}
          initialPlacedLoops={viewMode ? placedLoops : undefined}
          readOnly={viewMode}
          key={`composer-${isExplorationMode ? 'exploration' : 'assignment'}`}
          assignmentPanelContent={assignmentPanelContent}
        />
      </div>
    </div>
  );
};

export default SchoolBeneathActivity;