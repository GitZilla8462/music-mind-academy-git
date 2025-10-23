// File: /src/lessons/film-music-project/lesson1/lessonStorageUtils.js
// Centralized localStorage management for Lesson 1 data

// Storage Keys
export const STORAGE_KEYS = {
  DAW_STATS: 'lesson1-daw-stats',
  COMPOSITION: 'school-beneath-composition',
  BONUS_COMPOSITION: 'school-beneath-bonus',
  REFLECTION: 'school-beneath-reflection',
  LESSON_TIMER: 'lesson1-timer',
  LESSON_PROGRESS: 'lesson1-progress'
};

// DAW Tutorial Stats
export const saveDAWStats = (correct, incorrect) => {
  const stats = {
    correct,
    incorrect,
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.DAW_STATS, JSON.stringify(stats));
  console.log('DAW stats saved:', stats);
  return stats;
};

export const getDAWStats = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DAW_STATS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading DAW stats:', error);
    return null;
  }
};

// School Beneath Composition
export const saveComposition = (placedLoops, requirements, videoDuration) => {
  const composition = {
    title: 'The School Beneath',
    placedLoops,
    requirements,
    videoDuration,
    savedAt: new Date().toISOString(),
    loopCount: placedLoops.length
  };
  localStorage.setItem(STORAGE_KEYS.COMPOSITION, JSON.stringify(composition));
  console.log('Composition saved:', composition);
  return composition;
};

export const getComposition = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPOSITION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading composition:', error);
    return null;
  }
};

// Bonus Composition
export const saveBonusComposition = (placedLoops, videoDuration) => {
  const bonus = {
    title: 'The School Beneath - Bonus',
    placedLoops,
    videoDuration,
    savedAt: new Date().toISOString(),
    loopCount: placedLoops.length
  };
  localStorage.setItem(STORAGE_KEYS.BONUS_COMPOSITION, JSON.stringify(bonus));
  console.log('Bonus composition saved:', bonus);
  return bonus;
};

export const getBonusComposition = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BONUS_COMPOSITION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading bonus composition:', error);
    return null;
  }
};

// Reflection Data
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
  console.log('Reflection saved:', reflection);
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

// Clear all lesson data
export const clearAllLessonData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All lesson data cleared');
};

// Get complete lesson summary
export const getLessonSummary = () => {
  return {
    dawStats: getDAWStats(),
    composition: getComposition(),
    bonusComposition: getBonusComposition(),
    reflection: getReflection()
  };
};