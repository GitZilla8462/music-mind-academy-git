// File: /src/lessons/film-music/lesson4/lesson4StorageUtils.js
// Storage management for Film Music Lesson 4 - HOW Does Tension Build? (Harmony & Tension)

export const STORAGE_KEYS = {
  TENSION_TIMELINE: 'fm-lesson4-tension-timeline',
  HARMONY_LAB: 'fm-lesson4-harmony-lab',
  REFLECTION: 'fm-lesson4-reflection',
  LESSON_TIMER: 'fm-lesson4-timer',
  LESSON_PROGRESS: 'fm-lesson4-progress'
};

export const saveTensionTimeline = (tensionValues) => {
  const data = {
    tensionValues,
    pointCount: Object.keys(tensionValues).length,
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.TENSION_TIMELINE, JSON.stringify(data));
  return data;
};

export const getTensionTimeline = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TENSION_TIMELINE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading tension timeline:', error);
    return null;
  }
};

export const saveHarmonyLab = (ratings, favoriteChord) => {
  const data = {
    ratings,
    favoriteChord,
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.HARMONY_LAB, JSON.stringify(data));
  return data;
};

export const getHarmonyLab = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HARMONY_LAB);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading harmony lab:', error);
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

export const clearAllFMLesson4Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const getFMLesson4Summary = () => {
  return {
    tensionTimeline: getTensionTimeline(),
    harmonyLab: getHarmonyLab(),
    reflection: getReflection(),
    progress: getLessonProgress()
  };
};
