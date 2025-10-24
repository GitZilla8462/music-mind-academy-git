// ============================================================================
// FILE 3: useComposerEffects.js - FIXED with debounced keyboard shortcuts
// ============================================================================

import { useEffect, useRef } from 'react';
import { getVideoById } from '../../shared/loopData';

export const useComposerEffects = ({
  // Props
  videoId,
  preselectedVideo,
  assignmentId,
  tutorialMode,
  isDemo,
  isPractice,
  
  // State
  selectedVideo,
  setSelectedVideo,
  setVideoLoading,
  hasUnsavedChanges,
  placedLoops,
  setPlacedLoops,
  submissionNotes,
  setSubmissionNotes,
  audioReady,
  setAudioReady,
  isResizingLeft,
  isResizingTop,
  setIsResizingLeft,
  setIsResizingTop,
  leftPanelWidth,
  setLeftPanelWidth,
  topPanelHeight,
  setTopPanelHeight,
  containerRef,
  currentTime,
  lockFeatures,
  
  // Functions
  showToast,
  navigate,
  initializeAudio,
  pause,
  seek,
  handlePlay,
  handleRestart,
  isPlaying
}) => {
  
  // Track if we've already loaded a video to prevent re-initialization
  const hasLoadedVideoRef = useRef(false);
  
  // Initialize video with dynamic duration loading
  useEffect(() => {
    // Skip if we already have a video loaded
    if (selectedVideo) {
      console.log('📹 Video already loaded, skipping initialization');
      return;
    }
    
    // Skip if we've already attempted to load (prevents multiple re-runs)
    if (hasLoadedVideoRef.current) {
      return;
    }
    
    const loadVideo = async () => {
      hasLoadedVideoRef.current = true; // Mark as attempted
      
      if (!preselectedVideo && videoId) {
        setVideoLoading(true);
        try {
          const video = await getVideoById(videoId);
          
          if (video) {
            console.log('✅ Video loaded with duration:', video.duration, 'seconds');
            setSelectedVideo(video);
          } else {
            showToast?.('Video not found', 'error');
            if (isDemo) {
              navigate('/teacher/projects/film-music-score-demo');
            } else if (isPractice) {
              navigate('/student/practice/film-music-score');
            } else {
              navigate('/student');
            }
          }
        } catch (error) {
          console.error('❌ Error loading video:', error);
          showToast?.('Failed to load video', 'error');
        } finally {
          setVideoLoading(false);
        }
      } else if (preselectedVideo) {
        console.log('📹 Preselected video detected:', preselectedVideo);
        
        if (preselectedVideo.duration && preselectedVideo.duration > 0) {
          console.log('✅ Preselected video has duration:', preselectedVideo.duration, 'seconds');
          setSelectedVideo(preselectedVideo);
          return;
        }
        
        setVideoLoading(true);
        console.log('🔍 Detecting duration for preselected video:', preselectedVideo.videoPath);
        
        const videoElement = document.createElement('video');
        videoElement.src = preselectedVideo.videoPath;
        videoElement.preload = 'metadata';
        
        const loadPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video metadata load timeout'));
          }, 10000);
          
          videoElement.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            const detectedDuration = videoElement.duration;
            console.log('✅ Detected video duration:', detectedDuration, 'seconds');
            resolve(detectedDuration);
          });
          
          videoElement.addEventListener('error', (e) => {
            clearTimeout(timeout);
            reject(new Error(`Video load error: ${e.message || 'Unknown error'}`));
          });
        });
        
        try {
          const detectedDuration = await loadPromise;
          
          const videoWithDuration = {
            ...preselectedVideo,
            duration: detectedDuration
          };
          
          console.log('✅ Setting video with detected duration:', videoWithDuration);
          setSelectedVideo(videoWithDuration);
        } catch (error) {
          console.error('❌ Error detecting video duration:', error);
          showToast?.('Failed to load video duration. Using default 60s.', 'warning');
          
          const videoWithFallback = {
            ...preselectedVideo,
            duration: 60
          };
          setSelectedVideo(videoWithFallback);
        } finally {
          videoElement.src = '';
          videoElement.load();
          setVideoLoading(false);
        }
      }
    };

    loadVideo();
  }, [videoId, preselectedVideo]);

  // Auto-save functionality (disabled for demo and practice modes)
  useEffect(() => {
    if (hasUnsavedChanges && assignmentId && !tutorialMode && !isDemo && !isPractice) {
      const autoSave = setTimeout(() => {
        const compositionData = {
          selectedVideo,
          placedLoops,
          submissionNotes,
          videoId,
          lastModified: new Date().toISOString()
        };
        
        localStorage.setItem(`composition-${assignmentId}`, JSON.stringify(compositionData));
        console.log('Auto-saved composition');
      }, 2000);

      return () => clearTimeout(autoSave);
    }
  }, [placedLoops, submissionNotes, hasUnsavedChanges, assignmentId, selectedVideo, videoId, tutorialMode, isDemo, isPractice]);

  // Load saved composition on mount (disabled for demo and practice modes)
  useEffect(() => {
    if (assignmentId && !tutorialMode && !isDemo && !isPractice) {
      const saved = localStorage.getItem(`composition-${assignmentId}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.placedLoops) {
            setPlacedLoops(data.placedLoops);
          }
          if (data.submissionNotes) {
            setSubmissionNotes(data.submissionNotes);
          }
        } catch (error) {
          console.error('Error loading saved composition:', error);
        }
      }
    }
  }, [assignmentId, tutorialMode, isDemo, isPractice, setPlacedLoops, setSubmissionNotes]);

  // Auto-initialize audio for all modes
  useEffect(() => {
    if (!audioReady) {
      const autoInit = async () => {
        try {
          await initializeAudio();
          setAudioReady(true);
          console.log('✅ Audio auto-initialized');
        } catch (error) {
          console.error('❌ Failed to auto-initialize audio:', error);
        }
      };
      
      const timer = setTimeout(autoInit, 100);
      return () => clearTimeout(timer);
    }
  }, [audioReady, initializeAudio, setAudioReady]);

  // Handle panel resizing with smooth gradual movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingLeft && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        const minWidth = 120;
        const maxWidth = containerRect.width * 0.5;
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        setLeftPanelWidth(constrainedWidth);
      }

      if (isResizingTop && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const mouseYRelativeToContainer = e.clientY - containerRect.top;
        
        const minHeight = 120;
        const maxHeight = containerRect.height - 200;
        const newHeight = Math.max(minHeight, Math.min(maxHeight, mouseYRelativeToContainer));
        
        setTopPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingTop(false);
    };

    if (isResizingLeft || isResizingTop) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizingLeft ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingLeft, isResizingTop, containerRef, setLeftPanelWidth, setTopPanelHeight, setIsResizingLeft, setIsResizingTop]);

  // FIXED: Keyboard shortcuts with debouncing
  useEffect(() => {
    // Debounce refs for keyboard shortcuts
    const lastArrowPressRef = { current: 0 };
    const ARROW_DEBOUNCE_MS = 200;
    
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || !audioReady) {
        return;
      }
      
      if (lockFeatures.allowPlayback === false && (e.code === 'Space')) {
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          isPlaying ? pause() : handlePlay();
          break;
          
        case 'ArrowLeft':
        case 'ArrowRight':
          // FIXED: Debounce arrow key seeks to prevent spam
          const now = Date.now();
          if (now - lastArrowPressRef.current < ARROW_DEBOUNCE_MS) {
            e.preventDefault();
            return;
          }
          lastArrowPressRef.current = now;
          
          e.preventDefault();
          const delta = e.code === 'ArrowLeft' ? -5 : 5;
          const newTime = e.code === 'ArrowLeft' 
            ? Math.max(0, currentTime + delta)
            : Math.min(selectedVideo?.duration || 60, currentTime + delta);
          seek(newTime);
          break;
          
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleRestart();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime, pause, seek, selectedVideo?.duration, audioReady, lockFeatures, handlePlay, handleRestart]);
};