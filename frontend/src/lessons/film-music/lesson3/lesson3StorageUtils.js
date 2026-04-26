// File: /src/lessons/film-music/lesson3/lesson3StorageUtils.js
// Storage management for Film Music Lesson 3 - Plan Your Score (Spotting Guide)

export const STORAGE_KEYS = {
  SPOTTING_GUIDE: 'fm-lesson3-spotting-guide',
  LESSON_TIMER: 'fm-lesson3-timer',
  LESSON_PROGRESS: 'fm-lesson3-progress'
};

export const saveSpottingGuide = (data) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SPOTTING_GUIDE, JSON.stringify({
      ...data,
      savedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error saving spotting guide:', error);
  }
};

export const getSpottingGuide = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SPOTTING_GUIDE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading spotting guide:', error);
    return null;
  }
};

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

export const clearAllFMLesson3Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const getFMLesson3Summary = () => {
  return {
    spottingGuide: getSpottingGuide(),
    progress: getLessonProgress()
  };
};
