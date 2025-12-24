// File: /src/lessons/shared/activities/WildlifeCompositionActivity.jsx
// Epic Wildlife Composition - Nature Documentary Soundtrack
// Uses MusicComposer component with wildlife video selection
// ✅ Based on CityCompositionActivity structure

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer.jsx";
import { useAutoSave } from '../../../hooks/useAutoSave.jsx';
import WildlifeReflectionModal from './two-stars-and-a-wish/WildlifeReflectionModal.jsx';
import { useSession } from '../../../context/SessionContext.jsx';
import { saveSelectedVideo, getSelectedVideo } from '../../film-music-project/lesson4/lesson4StorageUtils.js';
import { saveStudentWork } from '../../../utils/studentWorkStorage.js';

const WILDLIFE_COMPOSITION_DEADLINE = 10 * 60 * 1000; // 10 minutes

// Wildlife video options - durations will be detected dynamically
const WILDLIFE_VIDEOS = [
  {
    id: 'forest',
    title: 'Forest Creatures',
    subtitle: 'Life Among the Trees',
    videoPath: '/lessons/film-music-project/lesson3/slides/ForestCreatures.mp4',
    emoji: '🌲'
  },
  {
    id: 'savanna',
    title: 'Savanna Creatures',
    subtitle: 'The African Plains',
    videoPath: '/lessons/film-music-project/lesson3/slides/SavannaCreatures.mp4',
    emoji: '🦁'
  },
  {
    id: 'underwater',
    title: 'Underwater Creatures',
    subtitle: 'Beneath the Waves',
    videoPath: '/lessons/film-music-project/lesson3/slides/UnderwaterCreatures.mp4',
    emoji: '🐠'
  }
];

// Helper function to detect video duration
const detectVideoDuration = async (videoPath) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    const timeout = setTimeout(() => {
      video.src = '';
      reject(new Error('Video duration detection timeout'));
    }, 10000);
    
    video.addEventListener('loadedmetadata', () => {
      clearTimeout(timeout);
      const duration = video.duration;
      console.log(`✅ Detected duration for ${videoPath}: ${duration}s (${Math.floor(duration/60)}:${Math.floor(duration%60).toString().padStart(2, '0')})`);
      video.src = '';
      resolve(duration);
    });
    
    video.addEventListener('error', (e) => {
      clearTimeout(timeout);
      video.src = '';
      reject(new Error(`Video load error: ${e.message || 'Unknown error'}`));
    });
    
    video.src = videoPath;
  });
};

const WildlifeCompositionActivity = ({ 
  onComplete, 
  viewMode = false, 
  lessonStartTime,
  isSessionMode = false
}) => {
  const navigate = useNavigate();
  
  // Session mode detection
  const { getCurrentStage } = useSession();
  const currentStage = isSessionMode ? getCurrentStage() : null;
  const isReflectionStage = currentStage === 'reflection' || currentStage === 'reflection-activity';
  
  // Video selection state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoSelection, setShowVideoSelection] = useState(() => {
    const saved = getSelectedVideo();
    return !saved;
  });
  const [previewingVideo, setPreviewingVideo] = useState(null);
  
  // Track detected durations for all videos
  const [videoDurations, setVideoDurations] = useState({});
  const [detectingDurations, setDetectingDurations] = useState(false);
  
  // Reflection flow states
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionCompleted, setReflectionCompleted] = useState(false);
  const [viewingReflection, setViewingReflection] = useState(false);
  
  // Student ID
  const [studentId, setStudentId] = useState('');
  
  // Composition state
  const [placedLoops, setPlacedLoops] = useState([]);
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [saveMessage, setSaveMessage] = useState(null);
  const timerRef = useRef(null);
  const autoAdvanceCalledRef = useRef(false);
  
  // Use ref instead of sessionStorage so it resets on page refresh
  const hasLoadedRef = useRef(false);
  const isSavingRef = useRef(false);
  
  // Initialize student ID
  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
    console.log('🌍 Wildlife Student ID:', id);
  }, []);
  
  // Detect video durations on mount
  useEffect(() => {
    const detectAllDurations = async () => {
      console.log('🎬 Starting video duration detection for all wildlife videos...');
      setDetectingDurations(true);
      
      const durations = {};
      
      for (const video of WILDLIFE_VIDEOS) {
        try {
          const duration = await detectVideoDuration(video.videoPath);
          durations[video.id] = duration;
        } catch (error) {
          console.error(`❌ Failed to detect duration for ${video.id}:`, error);
        }
      }
      
      console.log('✅ All wildlife video durations detected:', durations);
      setVideoDurations(durations);
      setDetectingDurations(false);
    };
    
    detectAllDurations();
  }, []);
  
  // Check if reflection is already completed on mount
  useEffect(() => {
    const savedReflection = localStorage.getItem('epic-wildlife-reflection');
    if (savedReflection) {
      try {
        const data = JSON.parse(savedReflection);
        if (data.submittedAt) {
          setReflectionCompleted(true);
          console.log('✅ Found completed wildlife reflection on mount');
        }
      } catch (error) {
        console.error('Error loading reflection:', error);
      }
    }
  }, []);
  
  // REFLECTION DETECTION - Shows modal when teacher advances to reflection stage
  useEffect(() => {
    console.log('🌍 Reflection Check:', {
      isReflectionStage,
      reflectionCompleted,
      studentId,
      showReflection,
      viewingReflection
    });
    
    if (isReflectionStage && !showReflection && !viewingReflection && studentId) {
      console.log('✅ Showing reflection modal');
      setShowReflection(true);
      
      if (reflectionCompleted) {
        setViewingReflection(true);
      }
    }
  }, [isReflectionStage, reflectionCompleted, studentId, showReflection, viewingReflection]);
  
  // Load previously selected video on mount - WITH detected duration
  useEffect(() => {
    const savedVideoSelection = getSelectedVideo();
    console.log('🎬 Loading saved wildlife video selection:', savedVideoSelection);
    
    if (savedVideoSelection) {
      const videoTemplate = WILDLIFE_VIDEOS.find(v => v.id === savedVideoSelection.videoId);
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
        } else {
          console.log('⏳ Waiting for duration detection to complete...');
          setIsLoadingVideo(true);
        }
      } else {
        console.error('❌ Video not found for ID:', savedVideoSelection.videoId);
        setIsLoadingVideo(false);
      }
    } else {
      console.log('ℹ️ No saved video selection found');
      setIsLoadingVideo(false);
    }
  }, [videoDurations]);
  
  // AUTO-SAVE
  const compositionData = {
    placedLoops,
    videoDuration,
    videoId: selectedVideo?.id,
    timestamp: Date.now()
  };
  
  const { hasSavedWork, loadSavedWork } = useAutoSave(
    studentId,
    'epic-wildlife-composition',
    compositionData,
    5000
  );
  
  // SILENT AUTO-SAVE - Saves to same location as manual save every 30 seconds
  useEffect(() => {
    if (!studentId || !selectedVideo || viewMode) return;
    
    const autoSaveInterval = setInterval(() => {
      if (placedLoops.length > 0) {
        handleManualSave(true); // silent save
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [studentId, selectedVideo, placedLoops, viewMode]);
  
  // Load saved work on mount ONLY - includes manual saves
  useEffect(() => {
    if (!studentId || !selectedVideo) return;
    
    // Skip if already loaded this session (ref resets on refresh, allowing reload)
    if (hasLoadedRef.current) {
      console.log('⏭️ Already loaded this session, skipping');
      return;
    }
    
    console.log('🎬 Initial load - checking for saved work');
    
    // First try to load from manual save (has video metadata)
    const manualSaveKey = `epic-wildlife-composition-${studentId}`;
    const manualSave = localStorage.getItem(manualSaveKey);
    
    if (manualSave) {
      try {
        const data = JSON.parse(manualSave);
        console.log('📂 Found manual save:', data);
        
        if (data.composition && data.composition.placedLoops && data.composition.placedLoops.length > 0) {
          // Make sure loops match the current video
          if (data.composition.videoId === selectedVideo.id) {
            setPlacedLoops(data.composition.placedLoops);
            setVideoDuration(data.composition.videoDuration || selectedVideo.duration);
            console.log('✅ Loaded from manual save:', data.composition.placedLoops.length, 'loops for', selectedVideo.title);
            hasLoadedRef.current = true;
            return;
          } else {
            console.log('⚠️ Saved video mismatch - saved:', data.composition.videoId, 'current:', selectedVideo.id);
          }
        }
      } catch (error) {
        console.error('Error loading manual save:', error);
      }
    }
    
    // Fallback to auto-save
    if (hasSavedWork) {
      const saved = loadSavedWork();
      if (saved && saved.placedLoops && saved.placedLoops.length > 0) {
        // Check if video matches
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
  }, [studentId, hasSavedWork, loadSavedWork, selectedVideo]);
  
  // REFLECTION VIEW HANDLERS
  const handleViewReflection = () => {
    console.log('👀 Opening wildlife reflection in view mode');
    setViewingReflection(true);
    setShowReflection(true);
  };
  
  // MANUAL SAVE HANDLER - Saves to localStorage for viewing on join page
  const handleManualSave = (silent = false) => {
    // Prevent duplicate saves
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
    
    // Set saving flag
    isSavingRef.current = true;
    
    const saveKey = `epic-wildlife-composition-${studentId}`;
    const saveData = {
      composition: {
        placedLoops,
        videoDuration,
        videoId: selectedVideo.id,
        videoTitle: selectedVideo.title,
        videoPath: selectedVideo.videoPath,
        videoEmoji: selectedVideo.emoji,
        timestamp: Date.now()
      },
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(saveKey, JSON.stringify(saveData));
    console.log('💾 Manual save complete:', saveKey, saveData);
    
    // Also save to the generic student work system so it appears on Join page
    saveStudentWork('epic-wildlife-composition', {
      title: selectedVideo.title || 'Epic Wildlife',
      emoji: selectedVideo.emoji || '🌍',
      viewRoute: '/lessons/film-music-project/lesson4?view=saved',
      subtitle: `${placedLoops.length} loops`,
      category: 'Film Music Project',
      data: saveData.composition
    }, studentId);
    
    if (!silent) {
      console.log('🔔 About to show toast message, silent =', silent);
      setSaveMessage({ type: 'success', text: '✅ Composition saved! View it anytime from the Join page.' });
      setTimeout(() => setSaveMessage(null), 4000);
    }
    
    // Reset saving flag after a short delay
    setTimeout(() => {
      isSavingRef.current = false;
    }, 500);
  };
  
  // TIMER (self-guided mode only)
  useEffect(() => {
    if (!lessonStartTime || viewMode || isSessionMode) return;

    const calculateRemaining = () => {
      const elapsed = Date.now() - lessonStartTime;
      return Math.max(0, WILDLIFE_COMPOSITION_DEADLINE - elapsed);
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
  }, [lessonStartTime, onComplete, viewMode, isSessionMode]);
  
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
  // ✅ CHROMEBOOK OPTIMIZED: Removed verbose logging
  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    // Create new loop object
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
      endTime: startTime + loopData.duration,
      volume: 1.0
    };
    
    // Update state
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
  
  // VIDEO PREVIEW FULLSCREEN
  if (previewingVideo) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 flex items-center justify-between">
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
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-bold text-lg shadow-lg transition-all"
          >
            ✓ Compose with {previewingVideo.title}
          </button>
        </div>
      </div>
    );
  }
  
  // LOADING STATE - Skip if in reflection mode (modal can show while loading)
  if ((isLoadingVideo || (!selectedVideo && !showVideoSelection) || detectingDurations) && !viewMode && !isReflectionStage) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>{detectingDurations ? 'Detecting video durations...' : 'Loading video...'}</p>
        </div>
      </div>
    );
  }
  
  // MAIN ACTIVITY
  return (
    <div className="h-full flex flex-col bg-gray-900 relative">
      {/* Save Message Toast */}
      {saveMessage && console.log('🎨 RENDERING TOAST:', saveMessage.text)}
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
            <h2 className="text-sm font-bold">
              {selectedVideo?.emoji} {selectedVideo?.title} - Epic Wildlife Soundtrack
              {selectedVideo?.duration && (
                <span className="text-xs text-gray-400 ml-2">
                  ({Math.floor(selectedVideo.duration / 60)}:{Math.floor(selectedVideo.duration % 60).toString().padStart(2, '0')})
                </span>
              )}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* SAVE BUTTON - Top Right */}
            {studentId && selectedVideo && placedLoops.length > 0 && (
              <button
                onClick={() => handleManualSave()}
                className="px-4 py-1.5 text-sm rounded bg-green-600 hover:bg-green-700 font-bold transition-colors"
              >
                💾 Save
              </button>
            )}
            
            {reflectionCompleted && !showReflection && (
              <button
                onClick={handleViewReflection}
                className="px-3 py-1.5 text-sm rounded bg-yellow-600 hover:bg-yellow-700 font-semibold transition-colors flex items-center gap-1"
              >
                ⭐ View Reflection & Composition
              </button>
            )}
            
            <div className="text-xs text-gray-400">
              {placedLoops.length} loops
            </div>
            
            {lessonStartTime && !isSessionMode && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Time:</span>
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
            )}
            
            {viewMode && (
              <button
                onClick={() => {
                  // Auto-save silently before leaving if there are loops
                  if (placedLoops.length > 0 && studentId && selectedVideo) {
                    handleManualSave(true);
                  }
                  navigate('/');
                }}
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
          <MusicComposer
            key={`wildlife-composer-${selectedVideo?.id || 'none'}`}
            compositionKey={`epic-wildlife-composition-${selectedVideo?.id}`}
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
            hideHeader={true}
            hideSubmitButton={true}
            isLessonMode={true}
            showToast={(msg, type) => console.log(msg, type)}
            initialPlacedLoops={placedLoops}
            readOnly={viewMode || showReflection}
            assignmentPanelContent={null}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
      </div>

      {showReflection && (
        <WildlifeReflectionModal
          compositionData={{
            placedLoops,
            videoDuration,
            videoId: selectedVideo?.id,
            videoTitle: selectedVideo?.title,
            timestamp: Date.now()
          }}
          onComplete={() => {
            console.log('Wildlife reflection onComplete - viewingReflection:', viewingReflection);
            setReflectionCompleted(true);
            setShowReflection(false);
            setViewingReflection(false);
            // No bonus activity - just close
          }}
          viewMode={viewingReflection}
          isSessionMode={isSessionMode}
        />
      )}
      
      {/* Video selection as overlay - OPTIMIZED FOR 1366x768 */}
      {showVideoSelection && !viewMode && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 p-6 overflow-y-auto">
          <div className="max-w-5xl w-full my-4">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                🌍 Choose Your Wildlife Video
              </h1>
              <p className="text-lg text-green-200">
                Select a nature scene to compose music for
              </p>
              {detectingDurations && (
                <p className="text-sm text-yellow-300 mt-2">
                  ⏳ Detecting video durations...
                </p>
              )}
            </div>
            
            {/* 3 columns for wildlife videos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {WILDLIFE_VIDEOS.map((video) => {
                const duration = videoDurations[video.id];
                const durationDisplay = duration 
                  ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`
                  : '...';
                
                return (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    {/* Video thumbnail area */}
                    <div className="relative h-40 bg-gradient-to-br from-green-500 to-teal-600 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-7xl">
                        {video.emoji}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    
                    {/* Video info */}
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">{video.subtitle}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>⏱️ {durationDisplay}</span>
                      </div>
                      
                      {/* Preview button */}
                      <button
                        onClick={() => handlePreviewVideo(video)}
                        disabled={!duration}
                        className={`w-full py-2.5 rounded-lg font-bold transition-all shadow-lg ${
                          duration
                            ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600'
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

export default WildlifeCompositionActivity;