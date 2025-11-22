// File: /src/lessons/film-music-project/lesson4/lesson4StorageUtils.js
// Centralized localStorage management for Lesson 4 data
// Handles saving/loading compositions with sectional loop form

// Storage Keys
export const STORAGE_KEYS = {
  SECTIONAL_BUILDER_STATS: 'lesson4-sectional-builder-stats',
  COMPOSITION: 'chefs-soundtrack-composition',
  BONUS_COMPOSITION: 'chefs-soundtrack-bonus',
  REFLECTION: 'chefs-soundtrack-reflection',
  LESSON_TIMER: 'lesson4-timer',
  LESSON_PROGRESS: 'lesson4-progress'
};

// ✅ Helper to ensure loop has all required properties
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
    section: loop.section || 'A',  // ✅ Track which section this loop belongs to
    color: loop.color,
    trackIndex: loop.trackIndex,
    startTime: loop.startTime,
    endTime: endTime,
    volume: loop.volume !== undefined ? loop.volume : 1,
    muted: loop.muted !== undefined ? loop.muted : false
  };
};

// Sectional Loop Builder Stats
export const saveSectionalBuilderStats = (correct, incorrect, patternsCompleted) => {
  const stats = {
    correct,
    incorrect,
    patternsCompleted,
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.SECTIONAL_BUILDER_STATS, JSON.stringify(stats));
  console.log('Sectional builder stats saved:', stats);
  return stats;
};

export const getSectionalBuilderStats = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SECTIONAL_BUILDER_STATS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading sectional builder stats:', error);
    return null;
  }
};

// Chef's Soundtrack Composition
export const saveComposition = (placedLoops, sections, requirements, videoDuration) => {
  // ✅ Normalize all loops to ensure they have complete properties
  const normalizedLoops = placedLoops.map(normalizeLoop);
  
  const composition = {
    title: "Chef's Soundtrack",
    placedLoops: normalizedLoops,
    sections: sections || [],  // Array of section markers {id, startTime, endTime, name}
    requirements,
    videoDuration,
    savedAt: new Date().toISOString(),
    loopCount: normalizedLoops.length,
    sectionCount: sections ? sections.length : 0
  };
  localStorage.setItem(STORAGE_KEYS.COMPOSITION, JSON.stringify(composition));
  console.log('✅ Chef\'s Soundtrack composition saved with normalized loops:', composition);
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
    
    console.log('✅ Chef\'s Soundtrack composition loaded with normalized loops:', composition);
    return composition;
  } catch (error) {
    console.error('Error loading composition:', error);
    return null;
  }
};

// Bonus Composition (Extended version with more sections)
export const saveBonusComposition = (placedLoops, sections, videoDuration) => {
  // ✅ Normalize all loops
  const normalizedLoops = placedLoops.map(normalizeLoop);
  
  const bonus = {
    title: "Chef's Soundtrack - Extended",
    placedLoops: normalizedLoops,
    sections: sections || [],
    videoDuration,
    savedAt: new Date().toISOString(),
    loopCount: normalizedLoops.length,
    sectionCount: sections ? sections.length : 0
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
  console.log('All Lesson 4 data cleared');
};

// Get complete lesson summary
export const getLessonSummary = () => {
  return {
    sectionalBuilderStats: getSectionalBuilderStats(),
    composition: getComposition(),
    bonusComposition: getBonusComposition(),
    reflection: getReflection()
  };
};

// ✅ Helper: Check if composition meets requirements
export const checkCompositionRequirements = (placedLoops, sections) => {
  const requirements = {
    sections: {
      met: sections && sections.length >= 3,
      count: sections ? sections.length : 0,
      required: 3
    },
    progression: {
      met: sections && sections.length >= 2,  // At least 2 sections = some progression
      message: sections && sections.length >= 2 ? 'Music evolves across sections' : 'Add more sections'
    },
    variety: {
      met: placedLoops.length >= 6,  // At least 6 loops to show variety
      count: placedLoops.length,
      required: 6
    }
  };
  
  return requirements;
};