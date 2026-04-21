// File: /src/lessons/film-music/lesson1/lesson1StorageUtils.js
// Storage management for Film Music Lesson 1 - WHO Is In The Story? (Leitmotif & Melody)

// Storage Keys
export const STORAGE_KEYS = {
  CHARACTER_CARD: 'fm-lesson1-character-card',
  MOTIF: 'fm-lesson1-motif',
  REFLECTION: 'fm-lesson1-reflection',
  LESSON_TIMER: 'fm-lesson1-timer',
  LESSON_PROGRESS: 'fm-lesson1-progress'
};

// ========================================
// CHARACTER CARD (character pick, name, 3 words, color)
// ========================================
export const saveCharacterCard = (characterId, characterName, threeWords, characterColor) => {
  const card = {
    characterId,
    characterName,
    threeWords, // Array of 3 strings
    characterColor,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.CHARACTER_CARD, JSON.stringify(card));
  return card;
};

export const getCharacterCard = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHARACTER_CARD);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading character card:', error);
    return null;
  }
};

// ========================================
// MOTIF (CHARACTER THEME - recorded notes)
// ========================================
export const saveMotif = (notes, characterId, instrument, tempo) => {
  const motif = {
    notes, // Array of { note, label, timestamp, duration }
    characterId,
    instrument, // Instrument ID (flute, violin, cello, trumpet, clarinet, low-brass)
    tempo, // BPM
    noteCount: notes.length,
    createdAt: new Date().toISOString(),
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.MOTIF, JSON.stringify(motif));
  return motif;
};

export const getMotif = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MOTIF);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading motif:', error);
    return null;
  }
};

// ========================================
// REFLECTION DATA (Two Stars & a Wish)
// ========================================
export const saveReflection = (star1, star2, wish) => {
  const reflection = {
    star1, // "One thing I love about my theme is..."
    star2, // "My theme matches my character because..."
    wish,  // "If I had more time, I would..."
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
// LEITMOTIF DETECTIVE SCORE (kept for backward compatibility)
// ========================================
export const saveDetectiveScore = (correct, total, responses) => {
  const score = {
    correct,
    total,
    responses,
    percentage: Math.round((correct / total) * 100),
    completedAt: new Date().toISOString()
  };
  localStorage.setItem('fm-lesson1-detective-score', JSON.stringify(score));
  return score;
};

export const getDetectiveScore = () => {
  try {
    const data = localStorage.getItem('fm-lesson1-detective-score');
    return data ? JSON.parse(data) : null;
  } catch (error) {
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
};

// ========================================
// GET COMPLETE SUMMARY
// ========================================
export const getFMLesson1Summary = () => {
  return {
    characterCard: getCharacterCard(),
    motif: getMotif(),
    reflection: getReflection(),
    progress: getLessonProgress()
  };
};
