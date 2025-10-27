// File: /src/lessons/film-music-project/lesson1/activities/SchoolBeneathActivity.jsx
// Composition exercise for "The School Beneath" mysterious trailer
// UPDATED: Split layout - assignment panel moves to left of video player
// Header now only has title and action buttons (Save/Submit moved to top right)

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
      setSaveMessage('[Error] Only Mysterious loops allowed!');
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
    console.log('Loop added to state:', newLoop);
  };

  const handleLoopDeleted = (loopId) => {
    console.log('Loop deleted callback received:', loopId);
    setPlacedLoops(prev => prev.filter(loop => loop.id !== loopId));
  };

  const handleLoopUpdated = (loopId, updates) => {
    console.log('Loop updated callback received:', loopId, updates);
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
    setSaveMessage('✓ Progress saved!');
    setTimeout(() => setSaveMessage(''), 2000);
    console.log('Saved composition:', saveData);
  };

  const handleAutoSave = () => {
    const saveData = {
      placedLoops,
      requirements,
      videoDuration,
      timestamp: Date.now()
    };
    
    localStorage.setItem('school-beneath-composition', JSON.stringify(saveData));
    console.log('Auto-saved composition:', saveData);
  };

  const handleSubmitActivity = () => {
    if (hasSubmittedRef.current) return;
    
    const saveData = {
      placedLoops,
      requirements,
      videoDuration,
      timestamp: Date.now()
    };
    
    localStorage.setItem('school-beneath-composition', JSON.stringify(saveData));
    console.log('Submitted composition:', saveData);
    
    hasSubmittedRef.current = true;
    setSaveMessage('✓ Submitted!');
    
    // Switch to exploration mode
    setIsExplorationMode(true);
    setPlacedLoops([]);
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

  // Create assignment panel content to pass to MusicComposer
  const assignmentPanelContent = !viewMode && !isExplorationMode ? (
    <div className="h-full bg-gray-800 text-white p-2 flex flex-col gap-2 overflow-y-auto">
      {/* Save/Submit Buttons at Top */}
      <div className="flex flex-col gap-1">
        <button
          onClick={handleSaveProgress}
          className="w-full px-3 py-1 text-xs rounded font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save
        </button>
        <button
          onClick={handleSubmitActivity}
          disabled={!allRequirementsMet}
          className={`w-full px-3 py-1 text-xs rounded font-medium transition-colors ${
            allRequirementsMet
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Submit
        </button>
      </div>

      {/* Composition Assignment - 2x Smaller */}
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
            {requirements.instrumentation ? '✓' : '○'}
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
            {requirements.layering ? '✓' : '○'}
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
            {requirements.structure ? '✓' : '○'}
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
        <h3 className="font-bold text-[10px] mb-1">✨ Bonus Exploration</h3>
        <p className="text-[9px] text-gray-300 leading-relaxed">
          Great job! Use the remaining time to explore.
        </p>
      </div>
      
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

      <div className="text-[9px] text-gray-300 bg-blue-900/30 border border-blue-500 rounded-lg p-2">
        <div className="font-semibold mb-1">💡 Try these:</div>
        <ul className="space-y-0.5 text-[9px]">
          <li>⭐ <strong>Heroic</strong> loops</li>
          <li>👻 <strong>Scary</strong> loops</li>
          <li>🎊 <strong>Upbeat</strong> loops</li>
          <li>🎭 Mix moods</li>
        </ul>
      </div>
    </div>
  ) : null;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Exploration Mode Minimizable Modal */}
      {isExplorationMode && !isMinimizedModal && (
        <div className="fixed top-16 right-4 z-50 w-80 bg-white rounded-lg shadow-2xl flex flex-col max-h-96 border-2 border-green-500">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-3 py-2 rounded-t-lg flex items-center justify-between flex-shrink-0">
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
        </div>
      )}

      {/* Activity Header - Shows content in sandbox mode, empty in lesson mode */}
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            {/* Show content only if NOT in lesson mode (standalone/sandbox) */}
            {!lessonStartTime ? (
              <>
                <h2 className="text-sm font-bold whitespace-nowrap">
                  {viewMode ? (viewBonusMode ? "Viewing Bonus Composition: " : "Viewing Saved Work: ") : ""}
                  {isExplorationMode ? '♪ Bonus Composition - The School Beneath' : 'The School Beneath - Composition Assignment'}
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
              // Empty when in lesson mode (behind navigation header)
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