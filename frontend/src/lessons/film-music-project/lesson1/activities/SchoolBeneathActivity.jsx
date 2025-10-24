// File: /src/lessons/film-music-project/lesson1/activities/SchoolBeneathActivity.jsx
// Composition exercise for "The School Beneath" mysterious trailer
// UPDATED: 30-minute timer with exploration mode after submission
// FIXED: Clear timeline when entering exploration mode, improved modal styling

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../../pages/projects/film-music-score/composer/MusicComposer";
import { Clock, Minimize2, Maximize2 } from 'lucide-react';

const SCHOOL_BENEATH_DEADLINE = 30 * 60 * 1000; // 30 minutes in milliseconds

const SchoolBeneathActivity = ({ onComplete, viewMode = false, viewBonusMode = false, lessonStartTime }) => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState({
    instrumentation: false,  // 5+ Mysterious loops
    layering: false,         // Different start times
    structure: false         // Proper alignment
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

  // Calculate time remaining and start countdown
  useEffect(() => {
    if (!lessonStartTime || viewMode) return;

    const calculateRemaining = () => {
      const elapsed = Date.now() - lessonStartTime;
      const remaining = SCHOOL_BENEATH_DEADLINE - elapsed;
      return Math.max(0, remaining);
    };

    // Initial calculation
    const remaining = calculateRemaining();
    setTimeRemaining(remaining);

    // Start countdown timer
    timerRef.current = setInterval(() => {
      const newRemaining = calculateRemaining();
      setTimeRemaining(newRemaining);

      // When time hits 0, auto-advance
      if (newRemaining <= 0 && !autoAdvanceCalledRef.current) {
        autoAdvanceCalledRef.current = true;
        clearInterval(timerRef.current);
        
        // Auto-save current work
        handleAutoSave();
        
        // Show brief toast
        setSaveMessage('⏰ Time\'s up! Great work - let\'s share!');
        
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
  }, [lessonStartTime, viewMode, onComplete]);

  // Detect video duration on mount (skip if in viewMode)
  useEffect(() => {
    if (viewMode) {
      return;
    }

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

  // Check requirements as loops are placed (skip in viewMode or exploration mode)
  useEffect(() => {
    if (viewMode || placedLoops.length === 0 || isExplorationMode) return;
    checkRequirements();
  }, [placedLoops, viewMode, isExplorationMode]);

  const checkRequirements = () => {
    console.log('Checking requirements with loops:', placedLoops);
    
    // Verify all loops are Mysterious category
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
    console.log('Instrumentation check:', hasInstrumentation, 'Unique loops:', uniqueLoops.size);

    const startTimes = new Set(placedLoops.map(loop => Math.floor(loop.startTime)));
    const hasLayering = startTimes.size >= 3 && placedLoops.length >= 5;
    console.log('Layering check:', hasLayering, 'Unique start times:', startTimes.size);

    const hasStructure = placedLoops.length >= 5;
    console.log('Structure check:', hasStructure);

    const newRequirements = {
      instrumentation: hasInstrumentation,
      layering: hasLayering,
      structure: hasStructure
    };
    
    console.log('Requirements updated:', newRequirements);
    setRequirements(newRequirements);
  };

  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    console.log('Loop placed callback received:', loopData, trackIndex, startTime);
    
    // ONLY restrict to Mysterious in non-exploration mode
    if (!isExplorationMode && loopData.mood !== 'Mysterious') {
      console.warn('Rejected non-Mysterious loop:', loopData.category);
      setSaveMessage('❌ Only Mysterious loops allowed!');
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
      trackIndex,
      startTime,
      endTime: startTime + loopData.duration,
      volume: 1,
      muted: false
    };
    
    setPlacedLoops(prev => {
      const updated = [...prev, newLoop];
      console.log('Updated placedLoops:', updated);
      return updated;
    });
  };

  const handleLoopDeleted = (loopId) => {
    console.log('Loop deleted callback received:', loopId);
    setPlacedLoops(prev => {
      const updated = prev.filter(loop => loop.id !== loopId);
      console.log('Updated placedLoops after delete:', updated);
      return updated;
    });
  };

  const handleLoopUpdated = (loopId, updates) => {
    console.log('Loop updated callback received:', loopId, updates);
    setPlacedLoops(prev => {
      const updated = prev.map(loop => 
        loop.id === loopId ? { ...loop, ...updates } : loop
      );
      console.log('Updated placedLoops after update:', updated);
      return updated;
    });
  };

  const handleSaveProgress = () => {
    const storageKey = isExplorationMode ? 'school-beneath-bonus' : 'school-beneath-composition';
    
    const compositionData = {
      title: isExplorationMode ? 'The School Beneath - Bonus' : 'The School Beneath',
      placedLoops: placedLoops,
      savedAt: new Date().toISOString(),
      loopCount: placedLoops.length,
      requirements: requirements,
      videoDuration: videoDuration
    };
    
    localStorage.setItem(storageKey, JSON.stringify(compositionData));
    console.log('Progress saved to localStorage:', storageKey, compositionData);
    
    setSaveMessage('Progress saved! ✔');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleAutoSave = () => {
    if (isExplorationMode) {
      // Save bonus composition
      const bonusData = {
        title: 'The School Beneath - Bonus',
        placedLoops: placedLoops,
        savedAt: new Date().toISOString(),
        loopCount: placedLoops.length,
        videoDuration: videoDuration
      };
      localStorage.setItem('school-beneath-bonus', JSON.stringify(bonusData));
      console.log('Auto-saved bonus composition');
    } else {
      // Save regular composition
      const compositionData = {
        title: 'The School Beneath',
        placedLoops: placedLoops,
        savedAt: new Date().toISOString(),
        loopCount: placedLoops.length,
        requirements: requirements,
        videoDuration: videoDuration
      };
      localStorage.setItem('school-beneath-composition', JSON.stringify(compositionData));
      console.log('Auto-saved composition');
    }
  };

  // Submit triggers exploration mode
  const handleSubmitActivity = () => {
    if (hasSubmittedRef.current) return;
    
    console.log('Submitting activity - saving composition and entering exploration mode');
    
    hasSubmittedRef.current = true;
    
    // Save the completed assignment
    const compositionData = {
      title: 'The School Beneath',
      placedLoops: placedLoops,
      completedAt: new Date().toISOString(),
      loopCount: placedLoops.length,
      requirements: requirements,
      videoDuration: videoDuration
    };
    
    localStorage.setItem('school-beneath-composition', JSON.stringify(compositionData));
    console.log('Composition saved to localStorage:', compositionData);
    
    // CRITICAL FIX: Clear the loops FIRST before entering exploration mode
    // This ensures the MusicComposer receives an empty array and clears the timeline
    setPlacedLoops([]);
    
    // Small delay to ensure state update propagates, then enter exploration mode
    setTimeout(() => {
      setIsExplorationMode(true);
      setSaveMessage('✅ Submitted! Now create a bonus composition!');
      setTimeout(() => setSaveMessage(''), 3000);
      
      // Speak the exploration message
      setTimeout(() => {
        const message = "Great job with your composition! For the remaining time, you may explore all the loops available. What would your trailer sound like with heroic, scary, or upbeat loops?";
        
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.volume = 0.5;
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.name === 'Samantha' || 
            voice.name === 'Google US English' ||
            voice.name === 'Google US English Female' ||
            (voice.name.includes('Microsoft') && voice.lang === 'en-US') ||
            voice.name.includes('Zira') ||
            (voice.lang === 'en-US' && voice.name.includes('United States'))
          ) || voices.find(voice => voice.lang.startsWith('en-US'));
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log('Using voice:', preferredVoice.name, preferredVoice.lang);
          }
          
          window.speechSynthesis.speak(utterance);
        }
      }, 500);
    }, 100);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const allRequirementsMet = Object.values(requirements).every(met => met);

  if (isLoadingVideo || videoDuration === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg">Loading video...</div>
          <div className="text-sm text-gray-400 mt-2">Detecting video duration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900">
      {/* Exploration Mode Timer Modal - UPDATED STYLING TO MATCH DAWTutorial */}
      {isExplorationMode && timeRemaining > 0 && (
        <div
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            width: isMinimizedModal ? '250px' : '400px',
            height: isMinimizedModal ? 'auto' : '400px',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
          className="bg-white rounded-lg shadow-2xl border-4 border-green-500 overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="text-white font-bold text-sm">
              <span>Bonus Exploration</span>
            </div>
            <button
              onClick={() => setIsMinimizedModal(!isMinimizedModal)}
              className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              title={isMinimizedModal ? "Expand" : "Minimize"}
            >
              {isMinimizedModal ? (
                <Maximize2 size={16} />
              ) : (
                <Minimize2 size={16} />
              )}
            </button>
          </div>
          
          {!isMinimizedModal && (
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex flex-col items-center text-center space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    🎉 Assignment Submitted!
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
                  <div className="font-semibold mb-2 text-sm">💡 Try these ideas:</div>
                  <ul className="text-left space-y-1 text-xs">
                    <li>⭐ <strong>Heroic</strong> loops for an adventure feel</li>
                    <li>👻 <strong>Scary</strong> loops for extra suspense</li>
                    <li>🎊 <strong>Upbeat</strong> loops for a happy ending</li>
                    <li>🎭 Mix moods to create your own unique style</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {isMinimizedModal && (
            <div className="px-4 py-2 text-sm text-gray-600">
              {formatTime(timeRemaining)} remaining
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
              <h2 className="text-sm font-bold whitespace-nowrap flex-shrink-0">
                {viewMode ? (viewBonusMode ? "Viewing Bonus Composition: " : "Viewing Saved Work: ") : ""}
                {isExplorationMode ? '🎵 Bonus Composition - The School Beneath' : 'The School Beneath - Composition Assignment'}
              </h2>
              
              {!isExplorationMode && !viewMode && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${
                    requirements.instrumentation 
                      ? 'bg-green-900/30 border-green-500' 
                      : 'bg-gray-700 border-gray-600'
                  }`}>
                    <span className={requirements.instrumentation ? 'text-green-400' : 'text-gray-500'}>
                      {requirements.instrumentation ? '✓' : '○'}
                    </span>
                    <span className="font-semibold">Instrumentation:</span>
                    <span className="text-gray-300">5+ Mysterious loops</span>
                  </div>

                  <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${
                    requirements.layering 
                      ? 'bg-green-900/30 border-green-500' 
                      : 'bg-gray-700 border-gray-600'
                  }`}>
                    <span className={requirements.layering ? 'text-green-400' : 'text-gray-500'}>
                      {requirements.layering ? '✓' : '○'}
                    </span>
                    <span className="font-semibold">Layering:</span>
                    <span className="text-gray-300">3+ different times</span>
                  </div>

                  <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs ${
                    requirements.structure 
                      ? 'bg-green-900/30 border-green-500' 
                      : 'bg-gray-700 border-gray-600'
                  }`}>
                    <span className={requirements.structure ? 'text-green-400' : 'text-gray-500'}>
                      {requirements.structure ? '✓' : '○'}
                    </span>
                    <span className="font-semibold">Structure:</span>
                    <span className="text-gray-300">5+ loops total</span>
                  </div>
                </div>
              )}

              {isExplorationMode && (
                <div className="flex items-center gap-2 bg-green-900/30 border border-green-500 px-3 py-1 rounded text-xs">
                  <span className="text-green-300 font-semibold">✨ All Loops Unlocked!</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!viewMode && lessonStartTime && !isExplorationMode && (
                <div className="flex items-center gap-1 text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
                  <Clock size={14} />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              )}

              <div className="text-xs text-gray-400">
                {placedLoops.length} loops
              </div>

              {saveMessage && (
                <div className="text-xs text-green-400 font-semibold animate-pulse">
                  {saveMessage}
                </div>
              )}

              {!viewMode && (
                <button
                  onClick={handleSaveProgress}
                  className="px-4 py-1.5 text-sm rounded font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Progress
                </button>
              )}

              {viewMode ? (
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-1.5 text-sm rounded font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Back to Resources
                </button>
              ) : !isExplorationMode ? (
                <button
                  onClick={handleSubmitActivity}
                  disabled={!allRequirementsMet}
                  className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${
                    allRequirementsMet
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Submit
                </button>
              ) : null}
            </div>
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
        />
      </div>
    </div>
  );
};

export default SchoolBeneathActivity;