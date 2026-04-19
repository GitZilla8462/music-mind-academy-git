// File: /src/lessons/film-music/lesson3/lesson3StorageUtils.js
// Storage management for Film Music Lesson 3 - WHEN Does Music Speak? (Spotting & Silence)

export const STORAGE_KEYS = {
  SILENCE_STUDY: 'fm-lesson3-silence-study',
  SPOTTING_SESSION: 'fm-lesson3-spotting-session',
  REFLECTION: 'fm-lesson3-reflection',
  LESSON_TIMER: 'fm-lesson3-timer',
  LESSON_PROGRESS: 'fm-lesson3-progress'
};

export const saveSilenceStudy = (answers) => {
  const data = {
    answers,
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.SILENCE_STUDY, JSON.stringify(data));
  return data;
};

export const getSilenceStudy = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SILENCE_STUDY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading silence study:', error);
    return null;
  }
};

export const saveSpottingSession = (decisions, reasons) => {
  const data = {
    decisions,
    reasons,
    cuePointCount: Object.keys(decisions).length,
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.SPOTTING_SESSION, JSON.stringify(data));
  return data;
};

export const getSpottingSession = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SPOTTING_SESSION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading spotting session:', error);
    return null;
  }
};

export const saveReflection = (reviewType, partnerName, star1, star2, wish) => {
  const reflection = {
    reviewType,
    partnerName,
    star1,
    star2,
    wish,
    submittedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.REFLECTION, JSON.stringify(reflection));
  return reflection;
};

export const getReflection = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REFLECTION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading reflection:', error);
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
    silenceStudy: getSilenceStudy(),
    spottingSession: getSpottingSession(),
    reflection: getReflection(),
    progress: getLessonProgress()
  };
};
