// File: /src/hooks/useAutoSave.jsx
// Custom hook for auto-saving student compositions to localStorage
// FIXED: Use refs to prevent re-subscribing on every render

import { useState, useEffect, useCallback, useRef } from 'react';
import { autoSaveComposition, loadAutoSavedComposition } from '../lessons/film-music-project/lesson1/compositionServerUtils';

/**
 * Auto-save hook for student compositions
 * @param {string} studentName - Student's name
 * @param {string} activityType - Activity type (e.g., 'school-beneath', 'sound-effects')
 * @param {Object} compositionData - Current composition data
 * @param {number} saveInterval - How often to auto-save in milliseconds (default: 5000 = 5 seconds)
 * @returns {Object} { lastSaved, isSaving, loadSavedWork, hasSavedWork }
 */
export const useAutoSave = (studentName, activityType, compositionData, saveInterval = 5000) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedWork, setHasSavedWork] = useState(false);
  const saveTimeoutRef = useRef(null);
  const lastDataRef = useRef(null);
  
  // 🚨 CRITICAL: Use ref to track current data without causing re-renders
  const compositionDataRef = useRef(compositionData);
  
  useEffect(() => {
    compositionDataRef.current = compositionData;
  }, [compositionData]);

  // Check if there's existing saved work on mount
  useEffect(() => {
    if (studentName && activityType) {
      const saved = loadAutoSavedComposition(activityType, studentName);
      setHasSavedWork(!!saved);
      if (saved) {
        console.log('📂 Found saved work on mount for', studentName, '-', activityType);
      }
    }
  }, [studentName, activityType]);

  // Auto-save function - stable, doesn't change
  const performSave = useCallback(() => {
    const currentData = compositionDataRef.current;
    
    if (!studentName || !activityType || !currentData) {
      return;
    }

    // Check if data actually changed (avoid unnecessary saves)
    const currentDataStr = JSON.stringify(currentData);
    if (lastDataRef.current === currentDataStr) {
      return;
    }

    setIsSaving(true);
    const result = autoSaveComposition(currentData, activityType, studentName);
    
    if (result.success) {
      setLastSaved(new Date(result.lastSaved));
      lastDataRef.current = currentDataStr;
      setHasSavedWork(true);
      console.log(`✅ Auto-saved locally for ${studentName} - ${activityType}`);
    }
    
    // Show "Saving..." for at least 500ms for visual feedback
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  }, [studentName, activityType]); // 🚨 NO compositionData dependency

  // Set up auto-save interval
  useEffect(() => {
    if (!studentName || !activityType) {
      return;
    }

    // Clear any existing interval
    if (saveTimeoutRef.current) {
      clearInterval(saveTimeoutRef.current);
    }

    // Set up new auto-save with setInterval (runs repeatedly every 5 seconds)
    saveTimeoutRef.current = setInterval(() => {
      performSave();
    }, saveInterval);

    console.log(`🔄 Auto-save started for ${studentName} - ${activityType} (every ${saveInterval/1000}s)`);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current);
        console.log(`🛑 Auto-save stopped for ${studentName} - ${activityType}`);
      }
    };
  }, [performSave, saveInterval, studentName, activityType]);

  // Load saved work function
  const loadSavedWork = useCallback(() => {
    if (!studentName || !activityType) {
      return null;
    }
    
    const saved = loadAutoSavedComposition(activityType, studentName);
    if (saved) {
      setHasSavedWork(true);
      return saved.composition;
    }
    return null;
  }, [studentName, activityType]);

  // Manual save function (for "Save Now" buttons)
  const saveNow = useCallback(() => {
    performSave();
  }, [performSave]);

  return {
    lastSaved,
    isSaving,
    hasSavedWork,
    loadSavedWork,
    saveNow
  };
};

/**
 * Component to display auto-save status
 */
export const AutoSaveIndicator = ({ lastSaved, isSaving }) => {
  if (isSaving) {
    return (
      <div className="flex items-center text-sm text-gray-600">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    const timeSince = Math.floor((Date.now() - new Date(lastSaved).getTime()) / 1000);
    let timeText = '';
    
    if (timeSince < 60) {
      timeText = 'just now';
    } else if (timeSince < 3600) {
      const minutes = Math.floor(timeSince / 60);
      timeText = `${minutes} min ago`;
    } else {
      const hours = Math.floor(timeSince / 3600);
      timeText = `${hours} hr ago`;
    }

    return (
      <div className="flex items-center text-sm text-green-600">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Saved {timeText}</span>
      </div>
    );
  }

  return null;
};