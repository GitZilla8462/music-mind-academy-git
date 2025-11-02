// File: /lessons/shared/hooks/useLesson.js
// Main lesson state management hook - reusable across all lessons

import { useState, useEffect, useCallback } from 'react';

export const useLesson = (config) => {
  const { progressKey, timerKey } = config;
  
  const [currentActivity, setCurrentActivity] = useState(0);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState({});
  const [showNavigation, setShowNavigation] = useState(true);
  const [savedProgress, setSavedProgress] = useState(null);
  const [lessonStartTime, setLessonStartTime] = useState(null);

  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        const progress = JSON.parse(saved);
        setSavedProgress(progress);
      }

      // Load saved timer
      const savedTimer = localStorage.getItem(timerKey);
      if (savedTimer) {
        const timerData = JSON.parse(savedTimer);
        setLessonStartTime(timerData.startTime);
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  }, [progressKey, timerKey]);

  // Save progress automatically
  const saveProgress = useCallback(() => {
    const progress = {
      currentActivity,
      activityCompleted,
      lessonStarted,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(progressKey, JSON.stringify(progress));

    // Save timer
    if (lessonStartTime) {
      const timerData = {
        startTime: lessonStartTime,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(timerKey, JSON.stringify(timerData));
    }
  }, [currentActivity, activityCompleted, lessonStarted, lessonStartTime, progressKey, timerKey]);

  // Auto-save progress
  useEffect(() => {
    if (lessonStarted) {
      saveProgress();
    }
  }, [currentActivity, activityCompleted, lessonStarted, lessonStartTime, saveProgress]);

  const handleActivityComplete = useCallback(() => {
    console.log('Activity complete, moving to next activity');
    
    setActivityCompleted(prev => ({
      ...prev,
      [currentActivity]: true
    }));

    if (currentActivity < config.activities.length - 1) {
      setCurrentActivity(prev => prev + 1);
    } else {
      localStorage.removeItem(progressKey);
      localStorage.removeItem(timerKey);
      console.log('Lesson completed - progress cleared');
    }
  }, [currentActivity, config.activities.length, progressKey, timerKey]);

  const startLesson = useCallback(() => {
    const startTime = Date.now();
    setLessonStartTime(startTime);
    setLessonStarted(true);
    setSavedProgress(null);
    console.log('Lesson started at:', new Date(startTime).toISOString());
  }, []);

  const resumeLesson = useCallback(() => {
    if (savedProgress) {
      setCurrentActivity(savedProgress.currentActivity);
      setActivityCompleted(savedProgress.activityCompleted);
      setLessonStarted(true);
      setSavedProgress(null);
      console.log('Resuming lesson from activity:', savedProgress.currentActivity + 1);
      
      // If no start time saved, start timer now
      if (!lessonStartTime) {
        const startTime = Date.now();
        setLessonStartTime(startTime);
        console.log('Timer started on resume at:', new Date(startTime).toISOString());
      }
    }
  }, [savedProgress, lessonStartTime]);

  const startOver = useCallback(() => {
    localStorage.removeItem(progressKey);
    localStorage.removeItem(timerKey);
    setCurrentActivity(0);
    setActivityCompleted({});
    setLessonStarted(true);
    setSavedProgress(null);
    const startTime = Date.now();
    setLessonStartTime(startTime);
    console.log('Starting lesson over from beginning at:', new Date(startTime).toISOString());
  }, [progressKey, timerKey]);

  const toggleNavigation = useCallback(() => {
    setShowNavigation(prev => !prev);
  }, []);

  const skipToActivity = useCallback((index) => {
    if (index < 0 || index >= config.activities.length) return;
    console.log('Skipping to activity:', index);
    setCurrentActivity(index);
    if (!lessonStarted) {
      setLessonStarted(true);
      const startTime = Date.now();
      setLessonStartTime(startTime);
    }
  }, [lessonStarted, config.activities.length]);

  const skipNext = useCallback(() => {
    if (currentActivity < config.activities.length - 1) {
      skipToActivity(currentActivity + 1);
    }
  }, [currentActivity, skipToActivity, config.activities.length]);

  // Calculate progress
  const progressPercent = ((currentActivity + 1) / config.activities.length) * 100;
  const isLessonComplete = currentActivity >= config.activities.length;
  const currentActivityData = config.activities[currentActivity];

  return {
    // State
    currentActivity,
    lessonStarted,
    activityCompleted,
    showNavigation,
    savedProgress,
    lessonStartTime,
    progressPercent,
    isLessonComplete,
    currentActivityData,
    
    // Actions
    handleActivityComplete,
    startLesson,
    resumeLesson,
    startOver,
    toggleNavigation,
    skipToActivity,
    skipNext,
    setCurrentActivity,
    setLessonStarted
  };
};