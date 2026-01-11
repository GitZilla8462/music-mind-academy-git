// File: /src/lessons/film-music/lesson1/lesson1StorageUtils.js
// Storage management for Film Music Lesson 1 - WHO Is In The Story? (Leitmotif & Melody)

// Storage Keys
export const STORAGE_KEYS = {
  DETECTIVE_SCORE: 'fm-lesson1-detective-score',
  MOTIF: 'fm-lesson1-motif',
  REFLECTION: 'fm-lesson1-reflection',
  LESSON_TIMER: 'fm-lesson1-timer',
  LESSON_PROGRESS: 'fm-lesson1-progress'
};

// ========================================
// LEITMOTIF DETECTIVE SCORE
// ========================================
export const saveDetectiveScore = (correct, total, responses) => {
  const score = {
    correct,
    total,
    responses, // Array of { themeId, selectedType, correctType, isCorrect }
    percentage: Math.round((correct / total) * 100),
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.DETECTIVE_SCORE, JSON.stringify(score));
  console.log('🎭 Detective score saved:', score);
  return score;
};

export const getDetectiveScore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DETECTIVE_SCORE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading detective score:', error);
    return null;
  }
};

// ========================================
// MOTIF (CHARACTER THEME)
// ========================================
export const saveMotif = (notes, characterType, instrument, tempo) => {
  const motif = {
    notes, // Array of { note, duration, timestamp }
    characterType, // Which character type this motif represents
    instrument, // Selected instrument for playback
    tempo, // BPM
    noteCount: notes.length,
    createdAt: new Date().toISOString(),
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.MOTIF, JSON.stringify(motif));
  console.log('🎵 Motif saved:', motif);
  return motif;
};

export const getMotif = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MOTIF);
    if (!data) return null;

    const motif = JSON.parse(data);
    console.log('🎵 Motif loaded:', motif);
    return motif;
  } catch (error) {
    console.error('Error loading motif:', error);
    return null;
  }
};

// ========================================
// REFLECTION DATA
// ========================================
export const saveReflection = (reviewType, partnerName, star1, star2, wish, characterType) => {
  const reflection = {
    reviewType,
    partnerName,
    star1,
    star2,
    wish,
    characterType,
    submittedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.REFLECTION, JSON.stringify(reflection));
  console.log('✨ Reflection saved:', reflection);
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
  console.log('📚 Lesson progress saved:', progress);
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
export const clearAllFMLesson1Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('🗑️ All Film Music Lesson 1 data cleared');
};

// ========================================
// GET COMPLETE SUMMARY
// ========================================
export const getFMLesson1Summary = () => {
  return {
    detectiveScore: getDetectiveScore(),
    motif: getMotif(),
    reflection: getReflection(),
    progress: getLessonProgress()
  };
};
