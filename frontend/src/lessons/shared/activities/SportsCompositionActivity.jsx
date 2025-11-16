// File: SportsCompositionActivity.jsx
// Sports Highlight Reel Composition - Optimized for Chromebook screens (1366x768)
// UPDATED: Compact layouts for video selection and preview to fit on smaller screens

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MusicComposer from "../../../pages/projects/film-music-score/composer/MusicComposer";
import { useAutoSave, AutoSaveIndicator } from '../../../hooks/useAutoSave.jsx';
import SportsReflectionModal from './two-stars-and-a-wish/SportsReflectionModal';
import NameThatLoopActivity from './layer-detective/NameThatLoopActivity';
import { useSession } from '../../../context/SessionContext';
import { saveSelectedVideo, getSelectedVideo } from '../../film-music-project/lesson2/lesson2StorageUtils';

const SPORTS_COMPOSITION_DEADLINE = 10 * 60 * 1000; // 10 minutes

// Video options for sports highlights
const SPORTS_VIDEOS = [
  {
    id: 'soccer',
    title: 'Soccer Highlights',
    thumbnail: '/lessons/film-music-project/lesson2/soccer-thumb.png',
    videoPath: '/lessons/film-music-project/lesson2/SoccerHighlightReel.mp4',
    duration: 75,
    description: 'Exciting soccer goals, passes, and game action',
    emoji: '⚽'
  },
  {
    id: 'basketball',
    title: 'Basketball Highlights',
    thumbnail: '/lessons/film-music-project/lesson2/basketball-thumb.png',
    videoPath: '/lessons/film-music-project/lesson2/BasketballHighlightReel.mp4',
    duration: 75,
    description: 'High-energy basketball action with dunks and fast breaks',
    emoji: '🏀'
  },
  {
    id: 'skateboarding',
    title: 'Skateboarding Tricks',
    thumbnail: '/lessons/film-music-project/lesson2/skateboard-thumb.png',
    videoPath: '/lessons/film-music-project/lesson2/SkateboardHighlighReel.mp4',
    duration: 68,
    description: 'Street skateboarding with technical tricks and stunts',
    emoji: '🛹'
  }
];


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
    console.log('🏀 Student ID:', id);
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
  
  // Load previously selected video on mount
  useEffect(() => {
    const savedVideoSelection = getSelectedVideo();
    console.log('🎬 Loading saved video selection:', savedVideoSelection);
    
    if (savedVideoSelection) {
      const video = SPORTS_VIDEOS.find(v => v.id === savedVideoSelection.videoId);
      console.log('🎬 Found video object:', video);
      
      if (video) {
        setSelectedVideo(video);
        setVideoDuration(video.duration);
        setShowVideoSelection(false);
        setIsLoadingVideo(false); // Mark as loaded
        console.log('✅ Loaded saved video selection:', video.title, 'Path:', video.videoPath);
      } else {
        console.error('❌ Video not found for ID:', savedVideoSelection.videoId);
        setIsLoadingVideo(false);
      }
    } else {
      // No saved video - ready to show selection screen
      console.log('ℹ️ No saved video selection found');
      setIsLoadingVideo(false);
    }
  }, []);
  
  // AUTO-SAVE
  const compositionData = {
    placedLoops,
    videoDuration,
    videoId: selectedVideo?.id,
    timestamp: Date.now()
  };
  
  const { lastSaved, isSaving, hasSavedWork, loadSavedWork } = useAutoSave(
    studentId,
    'sports-composition',
    compositionData,
    5000
  );
  
  // Load saved work on mount
  useEffect(() => {
    if (!studentId || viewMode || !selectedVideo) return;
    
    if (hasSavedWork) {
      const saved = loadSavedWork();
      if (saved && saved.placedLoops && saved.placedLoops.length > 0) {
        if (saved.videoId === selectedVideo.id) {
          setPlacedLoops(saved.placedLoops || []);
          setVideoDuration(saved.videoDuration || selectedVideo.duration);
          console.log('✅ Auto-loaded previous work:', saved.placedLoops.length, 'loops');
        }
      }
    }
  }, [studentId, hasSavedWork, viewMode, loadSavedWork, selectedVideo]);
  
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
  }, [lessonStartTime, viewMode, isSessionMode, onComplete]);
  
  // VIDEO SELECTION HANDLER
  const handleVideoSelect = (video) => {
    console.log('🎬 Video selected:', video.title);
    console.log('   Keeping existing loops:', placedLoops.length);
    setSelectedVideo(video);
    setVideoDuration(video.duration);
    setShowVideoSelection(false);
    setPreviewingVideo(null);
    setIsLoadingVideo(false);
    saveSelectedVideo(video.id, video.title);
    // Note: placedLoops are preserved when changing videos
  };
  
  // CHANGE VIDEO HANDLER - with confirmation to preserve work
  const handleChangeVideo = () => {
    const hasLoops = placedLoops.length > 0;
    
    if (hasLoops) {
      const confirmChange = window.confirm(
        `You have ${placedLoops.length} loop(s) placed. Changing videos will keep your loops, but they may not match the new video's timing. Continue?`
      );
      
      if (!confirmChange) {
        return; // User cancelled
      }
    }
    
    console.log('🔄 Changing video - returning to selection, keeping loops:', placedLoops.length);
    setShowVideoSelection(true);
    setPreviewingVideo(null);
    // Note: placedLoops are kept, allowing students to reuse their work
  };
  
  // PREVIEW VIDEO HANDLER
  const handlePreviewVideo = (video) => {
    console.log('👁️ Previewing video:', video.title);
    setPreviewingVideo(video);
  };
  
  // LOOP HANDLERS
  const handleLoopPlaced = (loopData, trackIndex, startTime) => {
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
  
  // ============================================================================
  // VIDEO PREVIEW SCREEN - COMPACT for Chromebook (1366x768)
  // ============================================================================
  if (previewingVideo && !viewMode) {
    return (
      <div className="h-full flex flex-col bg-black">
        {/* Compact Header - 50px */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewingVideo(null)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-semibold"
            >
              ← Back
            </button>
            <div>
              <h2 className="text-lg font-bold text-white">{previewingVideo.title}</h2>
              <p className="text-xs text-orange-100">{previewingVideo.description}</p>
            </div>
          </div>
          <div className="text-white text-sm">
            {previewingVideo.emoji} ⏱️ {previewingVideo.duration}s
          </div>
        </div>
        
        {/* Video Player - Fits in remaining space (~600px) */}
        <div className="flex-1 flex items-center justify-center p-4 bg-black min-h-0">
          <div className="w-full max-w-5xl">
            <video
              key={previewingVideo.id}
              className="w-full rounded-lg shadow-2xl"
              style={{ maxHeight: 'calc(100vh - 180px)' }}
              controls
              autoPlay
              src={previewingVideo.videoPath}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        
        {/* Compact Action Bar - 60px */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 flex items-center justify-center flex-shrink-0 border-t border-orange-500">
          <button
            onClick={() => handleVideoSelect(previewingVideo)}
            className="px-8 py-3 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-xl transform hover:scale-105"
          >
            ✓ Compose with {previewingVideo.title}
          </button>
        </div>
      </div>
    );
  }
  
  // ============================================================================
  // VIDEO SELECTION SCREEN - COMPACT for Chromebook
  // ============================================================================
  if (showVideoSelection && !viewMode) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-6 overflow-y-auto">
        <div className="max-w-5xl w-full my-4">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-3">
              Choose Your Sports Video
            </h1>
            <p className="text-xl text-orange-200">
              Pick one sport to create high-energy music for!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SPORTS_VIDEOS.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                {/* Better sized emoji display - 160px */}
                <div className="relative h-40 bg-gray-900 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-7xl">
                    {video.emoji}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                
                {/* Better spaced card content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>⏱️ {video.duration}s</span>
                  </div>
                  
                  {/* Preview Button */}
                  <button
                    onClick={() => handlePreviewVideo(video)}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg text-base"
                  >
                    👁️ Watch Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // LOADING STATE - Also wait for video to be selected
  if ((isLoadingVideo || (!selectedVideo && !showVideoSelection)) && !viewMode) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }
  
  // BONUS GAME
  if (showBonusGame) {
    return (
      <div className="h-screen w-full flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
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
    );
  }
  
  // MAIN ACTIVITY
  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold">
              {selectedVideo?.title} - Composition
            </h2>
            
            {/* Change Video button - Always visible (moved to left side) */}
            {!viewMode && (
              <button
                onClick={handleChangeVideo}
                className="px-3 py-1.5 text-xs rounded bg-orange-600 hover:bg-orange-700 font-semibold transition-colors flex items-center gap-1"
              >
                🎬 Change Video
              </button>
            )}
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
            key={showBonusGame ? 'bonus-active' : 'composition-active'}
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
            showSoundEffects={false}
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
    </div>
  );
};

export default SportsCompositionActivity;