// File: /src/lessons/film-music/lesson2/lesson2StorageUtils.js
// Storage management for Film Music Lesson 2 - WHAT Do They Feel? (Orchestration & Bass)

export const STORAGE_KEYS = {
  EMOTION_LAB: 'fm-lesson2-emotion-lab',
  BASS_BUILDER: 'fm-lesson2-bass-builder',
  REFLECTION: 'fm-lesson2-reflection',
  LESSON_TIMER: 'fm-lesson2-timer',
  LESSON_PROGRESS: 'fm-lesson2-progress'
};

export const saveEmotionLabResults = (ratings) => {
  const data = {
    ratings,
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.EMOTION_LAB, JSON.stringify(data));
  return data;
};

export const getEmotionLabResults = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EMOTION_LAB);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading emotion lab results:', error);
    return null;
  }
};

export const saveBassBuilder = (recordedNotes) => {
  const data = {
    recordedNotes,
    noteCount: recordedNotes.length,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.BASS_BUILDER, JSON.stringify(data));
  return data;
};

export const getBassBuilder = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BASS_BUILDER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading bass builder:', error);
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

export const clearAllFMLesson2Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const getFMLesson2Summary = () => {
  return {
    emotionLab: getEmotionLabResults(),
    bassBuilder: getBassBuilder(),
    reflection: getReflection(),
    progress: getLessonProgress()
  };
};
