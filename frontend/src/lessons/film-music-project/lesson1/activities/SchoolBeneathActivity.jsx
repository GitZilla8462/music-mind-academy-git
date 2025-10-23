// File: /src/lessons/film-music-project/lesson1/activities/SchoolBeneathActivity.jsx
// Composition exercise for "The School Beneath" mysterious trailer
// UPDATED: Now triggers reflection modal after submission
// FIXED: Corrected symbol encoding AND mood/category validation logic

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../../pages/projects/film-music-score/composer/MusicComposer";
import TwoStarsAndAWishActivity from './two-stars-and-a-wish/TwoStarsAndAWishActivity';

const SchoolBeneathActivity = ({ onComplete, viewMode = false }) => {
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
  const [showReflection, setShowReflection] = useState(false);

  // Load saved composition if in view mode
  useEffect(() => {
    if (viewMode) {
      const saved = localStorage.getItem('school-beneath-composition');
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
  }, [viewMode]);

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

  // Check requirements as loops are placed (skip in viewMode)
  useEffect(() => {
    if (viewMode || placedLoops.length === 0) return;
    checkRequirements();
  }, [placedLoops, viewMode]);

  const checkRequirements = () => {
    console.log('Checking requirements with loops:', placedLoops);
    
    // FIXED: Check both mood and category for Mysterious loops
    const allMysterious = placedLoops.every(loop => 
      loop.mood === 'Mysterious' || loop.category === 'Mysterious'
    );
    
    if (!allMysterious) {
      console.warn('Non-Mysterious loops detected!');
      console.log('Loop categories:', placedLoops.map(l => ({ mood: l.mood, category: l.category })));
      setRequirements({
        instrumentation: false,
        layering: false,
        structure: false
      });
      return;
    }
    
    const uniqueLoops = new Set(placedLoops.map(loop => loop.originalId || loop.id));
    const hasInstrumentation = uniqueLoops.size >= 5;
    console.log('✓ Instrumentation check:', hasInstrumentation, 'Unique loops:', uniqueLoops.size);

    const startTimes = new Set(placedLoops.map(loop => Math.floor(loop.startTime)));
    const hasLayering = startTimes.size >= 3 && placedLoops.length >= 5;
    console.log('✓ Layering check:', hasLayering, 'Unique start times:', startTimes.size, 'Total loops:', placedLoops.length);

    const hasStructure = placedLoops.length >= 5;
    console.log('✓ Structure check:', hasStructure, 'Total loops:', placedLoops.length);

    const newRequirements = {
      instrumentation: hasInstrumentation,
      layering: hasLayering,
      structure: hasStructure
    };
    
    console.log('📊 Requirements updated:', newRequirements);
    setRequirements(newRequirements);
  };

  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    console.log('Loop placed callback received:', loopData, trackIndex, startTime);
    
    // FIXED: Check both mood and category for Mysterious loops
    const isMysteriousLoop = loopData.mood === 'Mysterious' || loopData.category === 'Mysterious';
    
    if (!isMysteriousLoop) {
      console.warn('Rejected non-Mysterious loop:', { mood: loopData.mood, category: loopData.category });
      setSaveMessage('❌ Only Mysterious loops allowed!');
      setTimeout(() => setSaveMessage(''), 2000);
      return;
    }
    
    // FIXED: Store both mood and category in the placed loop
    const newLoop = {
      id: `${loopData.id}-${Date.now()}`,
      originalId: loopData.id,
      name: loopData.name,
      file: loopData.file,
      duration: loopData.duration,
      category: loopData.category || 'Mysterious',
      mood: loopData.mood || 'Mysterious',  // Add mood property
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
    const compositionData = {
      title: 'The School Beneath',
      placedLoops: placedLoops,
      savedAt: new Date().toISOString(),
      loopCount: placedLoops.length,
      requirements: requirements,
      videoDuration: videoDuration
    };
    
    localStorage.setItem('school-beneath-composition', JSON.stringify(compositionData));
    console.log('Progress saved to localStorage:', compositionData);
    
    setSaveMessage('Progress saved! ✓');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // UPDATED: Submit triggers reflection modal instead of navigating away
  const handleSubmitActivity = () => {
    console.log('Submitting activity - saving composition and showing reflection');
    
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
    
    // Show reflection modal
    setShowReflection(true);
  };

  // Called when reflection is complete
  const handleReflectionComplete = () => {
    console.log('Reflection complete, navigating home');
    window.location.href = '/';
  };

  const allRequirementsMet = Object.values(requirements).every(met => met);

  // Show reflection modal overlay
  if (showReflection) {
    return (
      <TwoStarsAndAWishActivity onComplete={handleReflectionComplete} />
    );
  }

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
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
              <h2 className="text-sm font-bold whitespace-nowrap flex-shrink-0">
                {viewMode ? 'Viewing Saved Work: ' : ''}The School Beneath - Composition Assignment
              </h2>
              
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
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
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
              ) : (
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
              )}
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
          filterLoopCategory="Mysterious"
          lockedMood="Mysterious"
          restrictToCategory="Mysterious"
          hideHeader={true}
          hideSubmitButton={true}
          isLessonMode={true}
          showToast={(msg, type) => console.log(msg, type)}
          initialPlacedLoops={viewMode ? placedLoops : undefined}
          readOnly={viewMode}
        />
      </div>
    </div>
  );
};

export default SchoolBeneathActivity;