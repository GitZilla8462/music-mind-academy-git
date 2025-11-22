// File: CityCompositionActivity.jsx
// City Soundscape Composition - Matches SportsCompositionActivity structure
// Uses MusicComposer component with city video selection

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { useAutoSave, AutoSaveIndicator } from '../../../hooks/useAutoSave.jsx';
import CityReflectionModal from './two-stars-and-a-wish/CityReflectionModal';
import LayerDetectivePartnerGame from './layer-detective/LayerDetectivePartnerGame';
import { useSession } from '../../../context/SessionContext';
import { saveSelectedVideo, getSelectedVideo } from '../../film-music-project/lesson3/lesson3StorageUtils';

const CITY_COMPOSITION_DEADLINE = 10 * 60 * 1000; // 10 minutes

// City video options - durations will be detected dynamically
const CITY_VIDEOS = [
  {
    id: 'nyc',
    title: 'New York City',
    subtitle: 'The City That Never Sleeps',
    videoPath: '/lessons/film-music-project/lesson3/NYCMontage.mp4',
    emoji: '🗽'
  },
  {
    id: 'paris',
    title: 'Paris',
    subtitle: 'The City of Light',
    videoPath: '/lessons/film-music-project/lesson3/ParisMontage.mp4',
    emoji: '🗼'
  },
  {
    id: 'madrid',
    title: 'Madrid',
    subtitle: 'The Heart of Spain',
    videoPath: '/lessons/film-music-project/lesson3/MadridMontage.mp4',
    emoji: '🏛️'
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

const CityCompositionActivity = ({ 
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
  const [showBonusGame, setShowBonusGame] = useState(false);
  
  // Student ID
  const [studentId, setStudentId] = useState('');
  
  // Composition state
  const [placedLoops, setPlacedLoops] = useState([]);
  const [videoDuration, setVideoDuration] = useState(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef(null);
  const autoAdvanceCalledRef = useRef(false);
  
  // Initialize student ID
  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
    console.log('🏙️ Student ID:', id);
  }, []);
  
  // Detect video durations on mount
  useEffect(() => {
    const detectAllDurations = async () => {
      console.log('🎬 Starting video duration detection for all city videos...');
      setDetectingDurations(true);
      
      const durations = {};
      
      for (const video of CITY_VIDEOS) {
        try {
          const duration = await detectVideoDuration(video.videoPath);
          durations[video.id] = duration;
        } catch (error) {
          console.error(`❌ Failed to detect duration for ${video.id}:`, error);
        }
      }
      
      console.log('✅ All video durations detected:', durations);
      setVideoDurations(durations);
      setDetectingDurations(false);
    };
    
    detectAllDurations();
  }, []);
  
  // Check if reflection is already completed on mount
  useEffect(() => {
    const savedReflection = localStorage.getItem('city-reflection');
    if (savedReflection) {
      try {
        const data = JSON.parse(savedReflection);
        if (data.submittedAt) {
          setReflectionCompleted(true);
          console.log('✅ Found completed city reflection on mount');
        }
      } catch (error) {
        console.error('Error loading reflection:', error);
      }
    }
  }, []);
  
  // REFLECTION DETECTION - Shows modal when teacher advances to reflection stage
  useEffect(() => {
    console.log('🏙️ Reflection Check:', {
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
    console.log('🎬 Loading saved video selection:', savedVideoSelection);
    
    if (savedVideoSelection) {
      const videoTemplate = CITY_VIDEOS.find(v => v.id === savedVideoSelection.videoId);
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
  
  const { lastSaved, isSaving, hasSavedWork, loadSavedWork } = useAutoSave(
    studentId,
    'city-composition',
    compositionData,
    5000
  );
  
  // Load saved work on mount ONLY
  useEffect(() => {
    if (!studentId || viewMode || !selectedVideo) return;
    
    const hasLoaded = sessionStorage.getItem('city-composition-loaded');
    if (hasLoaded) return;
    
    console.log('🎬 Initial load - checking for saved work');
    
    if (hasSavedWork) {
      const saved = loadSavedWork();
      if (saved && saved.placedLoops && saved.placedLoops.length > 0) {
        setPlacedLoops(saved.placedLoops || []);
        setVideoDuration(saved.videoDuration || selectedVideo.duration);
        console.log('✅ Auto-loaded previous work:', saved.placedLoops.length, 'loops');
      }
    }
    
    sessionStorage.setItem('city-composition-loaded', 'true');
  }, [studentId, hasSavedWork, viewMode, loadSavedWork, selectedVideo]);
  
  // REFLECTION VIEW HANDLERS
  const handleViewReflection = () => {
    console.log('👀 Opening city reflection in view mode');
    setViewingReflection(true);
    setShowReflection(true);
  };
  
  // TIMER (self-guided mode only)
  useEffect(() => {
    if (!lessonStartTime || viewMode || isSessionMode) return;

    const calculateRemaining = () => {
      const elapsed = Date.now() - lessonStartTime;
      return Math.max(0, CITY_COMPOSITION_DEADLINE - elapsed);
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
  const handleLoopPlaced = (loop, trackIndex, startTime) => {
    console.log(`🎵 Loop placed: ${loop.name} on track ${trackIndex} at ${startTime}s`);
  };
  
  const handleLoopDeleted = (loopId) => {
    console.log(`🗑️ Loop deleted: ${loopId}`);
  };
  
  const handleLoopUpdated = (loopId, updates) => {
    console.log(`✏️ Loop updated: ${loopId}`, updates);
  };
  
  // VIDEO PREVIEW FULLSCREEN
  if (previewingVideo) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
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
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-bold text-lg shadow-lg transition-all"
          >
            ✓ Compose with {previewingVideo.title}
          </button>
        </div>
      </div>
    );
  }
  
  // LOADING STATE
  if ((isLoadingVideo || (!selectedVideo && !showVideoSelection) || detectingDurations) && !viewMode) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>{detectingDurations ? 'Detecting video durations...' : 'Loading video...'}</p>
        </div>
      </div>
    );
  }
  
  // MAIN ACTIVITY
  return (
    <div className="h-full flex flex-col bg-gray-900 relative">
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold">
              {selectedVideo?.emoji} {selectedVideo?.title} - City Soundscape
              {selectedVideo?.duration && (
                <span className="text-xs text-gray-400 ml-2">
                  ({Math.floor(selectedVideo.duration / 60)}:{Math.floor(selectedVideo.duration % 60).toString().padStart(2, '0')})
                </span>
              )}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {reflectionCompleted && !showReflection && (
              <button
                onClick={handleViewReflection}
                className="px-3 py-1.5 text-sm rounded bg-yellow-600 hover:bg-yellow-700 font-semibold transition-colors flex items-center gap-1"
              >
                ⭐ View Reflection & Composition
              </button>
            )}
            
            {studentId && !viewMode && (
              <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
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
                onClick={() => navigate('/')}
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
            key={`city-composer-${selectedVideo?.id || 'none'}`}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
      </div>

      {showReflection && (
        <CityReflectionModal
          compositionData={{
            placedLoops,
            videoDuration,
            videoId: selectedVideo?.id,
            videoTitle: selectedVideo?.title,
            timestamp: Date.now()
          }}
          onComplete={() => {
            console.log('City reflection onComplete - viewingReflection:', viewingReflection);
            setReflectionCompleted(true);
            setShowReflection(false);
            setViewingReflection(false);
            setShowBonusGame(true);
          }}
          viewMode={viewingReflection}
          isSessionMode={isSessionMode}
        />
      )}
      
      {/* Bonus game as overlay */}
      {showBonusGame && (
        <div className="absolute inset-0 z-50 flex flex-col bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Bonus: Layer Detective Partner Game!</h2>
              <p className="text-orange-100">Play with a partner - take turns and compete!</p>
            </div>
            
            <button
              onClick={() => setShowBonusGame(false)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              ← Back to Composition
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <LayerDetectivePartnerGame 
              onComplete={() => {
                console.log('Partner game complete');
              }}
            />
          </div>
        </div>
      )}
      
      {/* Video selection as overlay */}
      {showVideoSelection && !viewMode && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 overflow-y-auto">
          <div className="max-w-5xl w-full my-4">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-white mb-3">
                🏙️ Choose Your City
              </h1>
              <p className="text-xl text-blue-200">
                Select a city to compose music for
              </p>
              {detectingDurations && (
                <p className="text-sm text-yellow-300 mt-2">
                  ⏳ Detecting video durations...
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {CITY_VIDEOS.map((video) => {
                const duration = videoDurations[video.id];
                const durationDisplay = duration 
                  ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`
                  : '...';
                
                return (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-7xl">
                        {video.emoji}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{video.subtitle}</p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>⏱️ {durationDisplay}</span>
                      </div>
                      
                      <button
                        onClick={() => handlePreviewVideo(video)}
                        disabled={!duration}
                        className={`w-full py-2.5 rounded-lg font-bold transition-all shadow-lg text-base ${
                          duration
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
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

export default CityCompositionActivity;