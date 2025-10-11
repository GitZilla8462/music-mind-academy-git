// File: /src/pages/projects/film-music-score/composer/hooks/useComposerState.js
// Central state management

import { useState, useRef } from 'react';

export const useComposerState = (preselectedVideo) => {
  // FIXED: If preselectedVideo is provided, don't start in loading state
  const initialVideoLoading = !preselectedVideo;
  
  // Video and composition state
  const [selectedVideo, setSelectedVideo] = useState(preselectedVideo);
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