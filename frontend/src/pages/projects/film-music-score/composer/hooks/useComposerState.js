// File: /src/pages/projects/film-music-score/composer/hooks/useComposerState.js
// Central state management

import { useState, useRef, useEffect } from 'react';

export const useComposerState = (preselectedVideo) => {
  // FIXED: If preselectedVideo is provided, don't start in loading state
  const initialVideoLoading = !preselectedVideo;

  // Video and composition state
  const [selectedVideo, setSelectedVideo] = useState(preselectedVideo);

  // Sync selectedVideo when preselectedVideo prop changes (e.g., duration detected later)
  // Also sync when the entire preselectedVideo object changes (new video selected)
  useEffect(() => {
    if (!preselectedVideo) return;

    // Sync if:
    // 1. Duration changed (detected later)
    // 2. Video ID changed (different video selected)
    // 3. selectedVideo is null but preselectedVideo exists
    const shouldSync = (
      (preselectedVideo.duration && preselectedVideo.duration !== selectedVideo?.duration) ||
      (preselectedVideo.id && preselectedVideo.id !== selectedVideo?.id) ||
      (!selectedVideo && preselectedVideo)
    );

    if (shouldSync) {
      console.log('📹 Syncing selectedVideo:', {
        from: { id: selectedVideo?.id, duration: selectedVideo?.duration },
        to: { id: preselectedVideo.id, duration: preselectedVideo.duration }
      });
      setSelectedVideo(preselectedVideo);
    }
  }, [preselectedVideo?.duration, preselectedVideo?.id, selectedVideo?.id, selectedVideo?.duration]);
  const [placedLoops, setPlacedLoops] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLoop, setSelectedLoop] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [videoLoading, setVideoLoading] = useState(initialVideoLoading);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [trackStates, setTrackStates] = useState({});
  
  // Panel sizing state
  const [leftPanelWidth, setLeftPanelWidth] = useState(160); // CHANGED from 320 to 160 (50% width)
  const [topPanelHeight, setTopPanelHeight] = useState(400);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingTop, setIsResizingTop] = useState(false);
  
  // Refs
  const containerRef = useRef(null);

  return {
    // Video and composition
    selectedVideo,
    setSelectedVideo,
    placedLoops,
    setPlacedLoops,
    selectedCategory,
    setSelectedCategory,
    selectedLoop,
    setSelectedLoop,
    submissionNotes,
    setSubmissionNotes,
    videoLoading,
    setVideoLoading,
    
    // UI state
    isSubmitting,
    setIsSubmitting,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    showNotesPanel,
    setShowNotesPanel,
    audioReady,
    setAudioReady,
    trackStates,
    setTrackStates,
    
    // Panel sizing
    leftPanelWidth,
    setLeftPanelWidth,
    topPanelHeight,
    setTopPanelHeight,
    isResizingLeft,
    setIsResizingLeft,
    isResizingTop,
    setIsResizingTop,
    
    // Refs
    containerRef
  };
};