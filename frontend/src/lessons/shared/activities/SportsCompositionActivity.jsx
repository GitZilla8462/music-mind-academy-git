// File: SportsCompositionActivity.jsx
// Sports Highlight Reel Composition - Optimized for Chromebook screens (1366x768)
// FIXED: Removed hard-coded durations - now detects actual video lengths!

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { useAutoSave } from '../../../hooks/useAutoSave.jsx';
import SportsReflectionModal from './two-stars-and-a-wish/SportsReflectionModal';
import NameThatLoopActivity from './layer-detective/NameThatLoopActivity';
import { useSession } from '../../../context/SessionContext';
import { saveSelectedVideo, getSelectedVideo } from '../../film-music-project/lesson2/lesson2StorageUtils';

const SPORTS_COMPOSITION_DEADLINE = 10 * 60 * 1000; // 10 minutes

// FIXED: Video options WITHOUT hard-coded durations
// Duration will be detected dynamically from the actual video files
const SPORTS_VIDEOS = [
  {
    id: 'soccer',
    title: 'Soccer Highlights',
    thumbnail: '/lessons/film-music-project/lesson2/soccer-thumb.png',
    videoPath: '/lessons/film-music-project/lesson2/SoccerHighlightReel.mp4',
    // REMOVED: duration property - will be detected dynamically
    description: 'Exciting soccer goals, passes, and game action',
    emoji: '⚽'
  },
  {
    id: 'basketball',
    title: 'Basketball Highlights',
    thumbnail: '/lessons/film-music-project/lesson2/basketball-thumb.png',
    videoPath: '/lessons/film-music-project/lesson2/BasketballHighlightReel.mp4',
    // REMOVED: duration property - will be detected dynamically
    description: 'High-energy basketball action with dunks and fast breaks',
    emoji: '🏀'
  },
  {
    id: 'skateboarding',
    title: 'Skateboarding Tricks',
    thumbnail: '/lessons/film-music-project/lesson2/skateboard-thumb.png',
    videoPath: '/lessons/film-music-project/lesson2/SkateboardHighlighReel.mp4',
    // REMOVED: duration property - will be detected dynamically
    description: 'Street skateboarding with technical tricks and stunts',
    emoji: '🛹'
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


const SportsCompositionActivity = ({ 
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
  
  // NEW: Track detected durations for all videos
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
  const [saveMessage, setSaveMessage] = useState(null);
  const timerRef = useRef(null);
  const autoAdvanceCalledRef = useRef(false);
  const isSavingRef = useRef(false);
  
  // ✅ FIXED: Use ref instead of sessionStorage so it resets on page refresh
  const hasLoadedRef = useRef(false);
  
  // Initialize student ID
  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
    console.log('🏀 Student ID:', id);
  }, []);
  
  // NEW: Detect video durations on mount
  useEffect(() => {
    const detectAllDurations = async () => {
      console.log('🎬 Starting video duration detection for all sports videos...');
      setDetectingDurations(true);
      
      const durations = {};
      
      for (const video of SPORTS_VIDEOS) {
        try {
          const duration = await detectVideoDuration(video.videoPath);
          durations[video.id] = duration;
        } catch (error) {
          console.error(`❌ Failed to detect duration for ${video.id}:`, error);
          // Don't set a fallback - let it stay undefined so we know it failed
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
    const savedReflection = localStorage.getItem('sports-reflection');
    if (savedReflection) {
      try {
        const data = JSON.parse(savedReflection);
        if (data.submittedAt) {
          setReflectionCompleted(true);
          console.log('✅ Found completed sports reflection on mount');
        }
      } catch (error) {
        console.error('Error loading reflection:', error);
      }
    }
  }, []);
  
  // ============================================================================
  // REFLECTION DETECTION - Shows modal when teacher advances to reflection stage
  // ============================================================================
  
  useEffect(() => {
    console.log('🏀 Reflection Check:', {
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
  
  // Load previously selected video on mount - WITH detected duration
  useEffect(() => {
    const savedVideoSelection = getSelectedVideo();
    console.log('🎬 Loading saved video selection:', savedVideoSelection);
    
    if (savedVideoSelection) {
      const videoTemplate = SPORTS_VIDEOS.find(v => v.id === savedVideoSelection.videoId);
      console.log('🎬 Found video template:', videoTemplate);
      
      if (videoTemplate) {
        // Wait for duration detection if not available yet
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
  }, [videoDurations]); // Re-run when durations are detected
  
  // AUTO-SAVE - Single composition that works with any video
  const compositionData = {
    placedLoops,
    videoDuration,
    videoId: selectedVideo?.id,
    timestamp: Date.now()
  };
  
  // Use single key for all videos - composition transfers between videos
  const { hasSavedWork, loadSavedWork } = useAutoSave(
    studentId,
    'sports-composition',  // ✅ Single key - same loops for all videos
    compositionData,
    5000
  );
  
  // ✅ SILENT AUTO-SAVE - Saves to same location as manual save every 30 seconds
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
  // ✅ FIXED: Use ref instead of sessionStorage so refresh reloads saved work
  useEffect(() => {
    if (!studentId || !selectedVideo) return;
    
    // Skip if already loaded this session (ref resets on refresh, allowing reload)
    if (hasLoadedRef.current) {
      console.log('⏭️ Already loaded this session, skipping');
      return;
    }
    
    console.log('🎬 Initial load - checking for saved work');
    
    // First try to load from manual save (has video metadata)
    const manualSaveKey = `sports-composition-${studentId}`;
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
  
  // REFLECTION DETECTION
  useEffect(() => {
    console.log('🔍 Reflection Check:', {
      isReflectionStage,
      reflectionCompleted,
      studentId,
      showReflection,
      viewingReflection
    });
    
    if (isReflectionStage && !showReflection && !viewingReflection && studentId) {
      console.log('✅ Showing sports reflection modal');
      setShowReflection(true);
      
      if (reflectionCompleted) {
        setViewingReflection(true);
      }
    }
  }, [isReflectionStage, reflectionCompleted, studentId, showReflection, viewingReflection]);
  
  // REFLECTION VIEW HANDLERS
  const handleViewReflection = () => {
    console.log('👀 Opening sports reflection in view mode');
    setViewingReflection(true);
    setShowReflection(true);
  };
  
  // ✅ MANUAL SAVE HANDLER - Saves to localStorage for viewing on join page
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
    
    const saveKey = `sports-composition-${studentId}`;
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
      return Math.max(0, SPORTS_COMPOSITION_DEADLINE - elapsed);
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
    
    // Get the detected duration
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
  
  const handleChangeVideo = () => {
    const confirmChange = window.confirm(
      'Change video? Your loops will stay on the timeline and play with the new video you select.'
    );
    
    if (confirmChange) {
      console.log('🔄 Showing video selection (keeping current composition loaded)');
      // Don't set selectedVideo to null - this would unmount MusicComposer
      // Just show the video selection overlay
      setShowVideoSelection(true);
    }
  };
  
  // COMPOSITION EVENT HANDLERS
  // COMPOSITION EVENT HANDLERS - ✅ FIXED to update state
  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
    console.log(`🎵 Loop placed: ${loopData.name} on track ${trackIndex} at ${startTime}s`);
    
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
    console.log(`✅ Added "${loopData.name}" to state - new total: ${placedLoops.length + 1}`);
  };
  
  const handleLoopDeleted = (loopId) => {
    console.log(`🗑️ Loop deleted: ${loopId}`);
    setPlacedLoops(prev => prev.filter(loop => loop.id !== loopId));
    console.log(`✅ Removed loop from state - new total: ${placedLoops.length - 1}`);
  };
  
  const handleLoopUpdated = (loopId, updates) => {
    console.log(`✏️ Loop updated: ${loopId}`, updates);
    setPlacedLoops(prev => prev.map(loop =>
      loop.id === loopId ? { ...loop, ...updates } : loop
    ));
    console.log(`✅ Updated loop in state`);
  };
  
  // VIDEO PREVIEW FULLSCREEN
  if (previewingVideo) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 flex items-center justify-between">
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
        
        {/* Video player */}
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
        
        {/* Bottom action bar */}
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
  
  // ============================================================================
  // VIDEO SELECTION SCREEN - Now renders as overlay (moved to bottom of component)
  
  // LOADING STATE - Also wait for video to be selected
  if ((isLoadingVideo || (!selectedVideo && !showVideoSelection) || detectingDurations) && !viewMode) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>{detectingDurations ? 'Detecting video durations...' : 'Loading video...'}</p>
        </div>
      </div>
    );
  }
  
  // BONUS GAME - Now renders as overlay to prevent composition from unmounting
  
  // MAIN ACTIVITY
  return (
    <div className="h-full flex flex-col bg-gray-900 relative">{/* Added relative for overlay positioning */}
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
              {selectedVideo?.title} - Composition
              {selectedVideo?.duration && (
                <span className="text-xs text-gray-400 ml-2">
                  ({Math.floor(selectedVideo.duration / 60)}:{Math.floor(selectedVideo.duration % 60).toString().padStart(2, '0')})
                </span>
              )}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* ✅ SAVE BUTTON - Top Right */}
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
            key={`sports-composer-${selectedVideo?.id || 'none'}`}  // Key based on video selection only - prevents re-mount when reflection appears
            onLoopDropCallback={handleLoopPlaced}
            onLoopDeleteCallback={handleLoopDeleted}
            onLoopUpdateCallback={handleLoopUpdated}
            tutorialMode={false}
            preselectedVideo={{
              id: selectedVideo.id,
              title: selectedVideo.title,
              duration: selectedVideo.duration,  // ✅ Now uses DETECTED duration!
              videoPath: selectedVideo.videoPath
            }}
            restrictToCategory={null}
            lockedMood={null}
            showSoundEffects={true}  // ✅ Show sound effects checkbox
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}
      </div>

      {showReflection && (
        <SportsReflectionModal
          compositionData={{
            placedLoops,
            videoDuration,
            videoId: selectedVideo?.id,
            videoTitle: selectedVideo?.title,
            timestamp: Date.now()
          }}
          onComplete={() => {
            console.log('Sports reflection onComplete - viewingReflection:', viewingReflection);
            setReflectionCompleted(true);
            setShowReflection(false);
            setViewingReflection(false);
            setShowBonusGame(true);
          }}
          viewMode={viewingReflection}
          isSessionMode={isSessionMode}
        />
      )}
      
      {/* Bonus game as overlay - keeps composition mounted underneath */}
      {showBonusGame && (
        <div className="absolute inset-0 z-50 flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Bonus: Name That Loop!</h2>
              <p className="text-blue-100">Play the listening game with a partner</p>
            </div>
            
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
      )}
      
      {/* Video selection as overlay - keeps composition and loops mounted */}
      {showVideoSelection && !viewMode && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-6 overflow-y-auto">
          <div className="max-w-5xl w-full my-4">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-white mb-3">
                Choose Your Sports Video
              </h1>
              <p className="text-xl text-orange-200">
                Your loops will play with whichever video you choose!
              </p>
              {detectingDurations && (
                <p className="text-sm text-yellow-300 mt-2">
                  ⏳ Detecting video durations...
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SPORTS_VIDEOS.map((video) => {
                const duration = videoDurations[video.id];
                const durationDisplay = duration 
                  ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`
                  : '...';
                
                return (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="relative h-40 bg-gray-900 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-7xl">
                        {video.emoji}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {video.title}
                      </h3>
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
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
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

export default SportsCompositionActivity;