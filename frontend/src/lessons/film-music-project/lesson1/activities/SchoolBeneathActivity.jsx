// File: /src/lessons/film-music-project/lesson1/activities/SchoolBeneathActivity.jsx
// Composition exercise for "The School Beneath" mysterious trailer

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../../pages/projects/film-music-score/composer/MusicComposer";

const SchoolBeneathActivity = ({ onComplete }) => {
  const navigate = useNavigate();
  const [compositionSaved, setCompositionSaved] = useState(false);
  const [requirements, setRequirements] = useState({
    instrumentation: false,  // 5+ Mysterious loops
    layering: false,         // Different start times
    structure: false         // Proper alignment
  });
  const [placedLoops, setPlacedLoops] = useState([]);
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);

  // Detect video duration on mount
  useEffect(() => {
    const videoPath = '/lessons/videos/film-music-loop-project/SchoolMystery.mp4';
    const videoElement = document.createElement('video');
    videoElement.src = videoPath;
    videoElement.preload = 'metadata';
    
    const handleMetadata = () => {
      const duration = videoElement.duration;
      console.log('Video duration detected:', duration, 'seconds');
      setVideoDuration(duration);
      setIsLoadingVideo(false);
      
      // Cleanup
      videoElement.removeEventListener('loadedmetadata', handleMetadata);
      videoElement.src = '';
    };
    
    const handleError = (e) => {
      console.error('Error loading video:', e);
      // Fallback to 60 seconds if video can't load
      setVideoDuration(60);
      setIsLoadingVideo(false);
      videoElement.removeEventListener('error', handleError);
    };
    
    videoElement.addEventListener('loadedmetadata', handleMetadata);
    videoElement.addEventListener('error', handleError);
    
    // Timeout fallback
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
  }, []);

  // Check requirements as loops are placed
  useEffect(() => {
    if (placedLoops.length === 0) return;
    
    checkRequirements();
  }, [placedLoops]);

  const checkRequirements = () => {
    console.log('Checking requirements with loops:', placedLoops);
    
    // Check instrumentation: 5+ unique loops
    const uniqueLoops = new Set(placedLoops.map(loop => loop.originalId || loop.id));
    const hasInstrumentation = uniqueLoops.size >= 5;
    console.log('Instrumentation check:', hasInstrumentation, 'Unique loops:', uniqueLoops.size);

    // Check layering: Loops start at different times (at least 3 different start times)
    const startTimes = new Set(placedLoops.map(loop => Math.floor(loop.startTime)));
    const hasLayering = startTimes.size >= 3 && placedLoops.length >= 5;
    console.log('Layering check:', hasLayering, 'Unique start times:', startTimes.size);

    // Check structure: At least 5 loops placed (basic structure requirement)
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

  // Handle loop placement with correct signature
  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    console.log('Loop placed callback received:', loopData, trackIndex, startTime);
    
    // Create the complete loop object matching MusicComposer's internal format
    const newLoop = {
      id: `${loopData.id}-${Date.now()}`,
      originalId: loopData.id,
      name: loopData.name,
      file: loopData.file,
      duration: loopData.duration,
      category: loopData.category,
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

  const handleSaveComposition = () => {
    // In real implementation, this would save to backend
    console.log('Saving composition with loops:', placedLoops);
    console.log('All requirements met:', allRequirementsMet);
    console.log('Requirements status:', requirements);
    setCompositionSaved(true);
  };

  const handleSubmitActivity = () => {
    console.log('Submitting activity - calling onComplete');
    if (onComplete) {
      onComplete();
    }
  };

  const allRequirementsMet = Object.values(requirements).every(met => met);

  // Loading state while detecting video duration
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
      {/* Requirements Panel - Top Bar */}
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">The School Beneath - Composition Assignment</h2>
            <div className="flex items-center space-x-3">
              {compositionSaved && (
                <span className="text-green-400 text-sm font-medium">
                  ✓ Composition Saved
                </span>
              )}
              <button
                onClick={handleSaveComposition}
                disabled={!allRequirementsMet}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  allRequirementsMet
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Save Composition
              </button>
              <button
                onClick={handleSubmitActivity}
                disabled={!allRequirementsMet || !compositionSaved}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  allRequirementsMet && compositionSaved
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Complete Activity
              </button>
            </div>
          </div>

          {/* Requirements Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Instrumentation */}
            <div className={`p-3 rounded-lg border-2 transition-all ${
              requirements.instrumentation 
                ? 'bg-green-900/30 border-green-500' 
                : 'bg-gray-700 border-gray-600'
            }`}>
              <div className="flex items-start mb-2">
                <span className={`text-lg mr-2 ${requirements.instrumentation ? 'text-green-400' : 'text-gray-500'}`}>
                  {requirements.instrumentation ? '✓' : '○'}
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">Instrumentation</h3>
                  <p className="text-xs text-gray-300">
                    Use at least 5 different Mysterious loops
                  </p>
                </div>
              </div>
            </div>

            {/* Layering */}
            <div className={`p-3 rounded-lg border-2 transition-all ${
              requirements.layering 
                ? 'bg-green-900/30 border-green-500' 
                : 'bg-gray-700 border-gray-600'
            }`}>
              <div className="flex items-start mb-2">
                <span className={`text-lg mr-2 ${requirements.layering ? 'text-green-400' : 'text-gray-500'}`}>
                  {requirements.layering ? '✓' : '○'}
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">Layering</h3>
                  <p className="text-xs text-gray-300">
                    Introduce loops at 3+ different times
                  </p>
                </div>
              </div>
            </div>

            {/* Structure */}
            <div className={`p-3 rounded-lg border-2 transition-all ${
              requirements.structure 
                ? 'bg-green-900/30 border-green-500' 
                : 'bg-gray-700 border-gray-600'
            }`}>
              <div className="flex items-start mb-2">
                <span className={`text-lg mr-2 ${requirements.structure ? 'text-green-400' : 'text-gray-500'}`}>
                  {requirements.structure ? '✓' : '○'}
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">Structure</h3>
                  <p className="text-xs text-gray-300">
                    Place at least 5 loops total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Composer Area */}
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
          hideHeader={true}
          hideSubmitButton={true}
          isLessonMode={true}
          showToast={(msg, type) => console.log(msg, type)}
        />
      </div>
    </div>
  );
};

export default SchoolBeneathActivity;