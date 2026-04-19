// File: /src/lessons/film-music/lesson5/lesson5StorageUtils.js
// Storage management for Film Music Lesson 5 - Finish + Viewing Party

export const STORAGE_KEYS = {
  COMPOSERS_NOTES: 'fm-lesson5-composers-notes',
  LESSON_TIMER: 'fm-lesson5-timer',
  LESSON_PROGRESS: 'fm-lesson5-progress'
};

// ========================================
// COMPOSER'S NOTES
// ========================================
export const saveComposersNotes = (text) => {
  const data = {
    text,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.COMPOSERS_NOTES, JSON.stringify(data));
  return data;
};

export const getComposersNotes = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPOSERS_NOTES);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading composers notes:', error);
    return null;
  }
};

// ========================================
// LESSON PROGRESS
// ========================================
export const saveLessonProgress = (currentActivity, completedActivities) => {
  const progress = {
    currentActivity,
    completedActivities,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(progress));
  return progress;
};

export const getLessonProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading lesson progress:', error);
    return null;
  }
};

// ========================================
// CLEAR ALL DATA
// ========================================
export const clearAllFMLesson5Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// ========================================
// GET COMPLETE SUMMARY
// ========================================
export const getFMLesson5Summary = () => {
  return {
    composersNotes: getComposersNotes(),
    progress: getLessonProgress()
  };
};
