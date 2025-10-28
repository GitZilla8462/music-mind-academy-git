// File: /src/lessons/film-music-project/lesson1/lessonStorageUtils.js
// Centralized localStorage management for Lesson 1 data
// ✅ FIXED: Ensures all loop properties are preserved for proper playback

// Storage Keys
export const STORAGE_KEYS = {
  DAW_STATS: 'lesson1-daw-stats',
  COMPOSITION: 'school-beneath-composition',
  BONUS_COMPOSITION: 'school-beneath-bonus',
  REFLECTION: 'school-beneath-reflection',
  LESSON_TIMER: 'lesson1-timer',
  LESSON_PROGRESS: 'lesson1-progress'
};

// ✅ NEW: Helper to ensure loop has all required properties
const normalizeLoop = (loop) => {
  // Calculate endTime if missing
  const endTime = loop.endTime || (loop.startTime + loop.duration);
  
  return {
    id: loop.id,
    originalId: loop.originalId || loop.id,
    name: loop.name,
    file: loop.file,
    duration: loop.duration,
    category: loop.category,
    color: loop.color,
    trackIndex: loop.trackIndex,
    startTime: loop.startTime,
    endTime: endTime,  // ✅ Ensure endTime exists
    volume: loop.volume !== undefined ? loop.volume : 1,
    muted: loop.muted !== undefined ? loop.muted : false
  };
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
  // ✅ Normalize all loops to ensure they have complete properties
  const normalizedLoops = placedLoops.map(normalizeLoop);
  
  const composition = {
    title: 'The School Beneath',
    placedLoops: normalizedLoops,  // ✅ Save normalized loops
    requirements,
    videoDuration,
    savedAt: new Date().toISOString(),
    loopCount: normalizedLoops.length
  };
  localStorage.setItem(STORAGE_KEYS.COMPOSITION, JSON.stringify(composition));
  console.log('✅ Composition saved with normalized loops:', composition);
  return composition;
};

export const getComposition = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPOSITION);
    if (!data) return null;
    
    const composition = JSON.parse(data);
    
    // ✅ Normalize loops on load to ensure backward compatibility
    if (composition.placedLoops) {
      composition.placedLoops = composition.placedLoops.map(normalizeLoop);
    }
    
    console.log('✅ Composition loaded with normalized loops:', composition);
    return composition;
  } catch (error) {
    console.error('Error loading composition:', error);
    return null;
  }
};

// Bonus Composition
export const saveBonusComposition = (placedLoops, videoDuration) => {
  // ✅ Normalize all loops
  const normalizedLoops = placedLoops.map(normalizeLoop);
  
  const bonus = {
    title: 'The School Beneath - Bonus',
    placedLoops: normalizedLoops,  // ✅ Save normalized loops
    videoDuration,
    savedAt: new Date().toISOString(),
    loopCount: normalizedLoops.length
  };
  localStorage.setItem(STORAGE_KEYS.BONUS_COMPOSITION, JSON.stringify(bonus));
  console.log('✅ Bonus composition saved with normalized loops:', bonus);
  return bonus;
};

export const getBonusComposition = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BONUS_COMPOSITION);
    if (!data) return null;
    
    const bonus = JSON.parse(data);
    
    // ✅ Normalize loops on load
    if (bonus.placedLoops) {
      bonus.placedLoops = bonus.placedLoops.map(normalizeLoop);
    }
    
    console.log('✅ Bonus composition loaded with normalized loops:', bonus);
    return bonus;
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