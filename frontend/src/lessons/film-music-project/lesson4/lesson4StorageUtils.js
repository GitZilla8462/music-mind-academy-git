// File: /src/lessons/film-music-project/lesson4/lesson4StorageUtils.js
// Centralized localStorage management for Lesson 4 data
// ✅ UPDATED: Renamed from "Chef's Soundtrack" to "Epic Wildlife"
// Handles saving/loading compositions with sectional loop form

// Storage Keys
export const STORAGE_KEYS = {
  SECTIONAL_BUILDER_STATS: 'epic-wildlife-sectional-builder-stats',
  SECTIONAL_BUILDER_SCORE: 'epic-wildlife-sectional-builder-score',
  COMPOSITION: 'epic-wildlife-composition',
  BONUS_COMPOSITION: 'epic-wildlife-bonus',
  REFLECTION: 'epic-wildlife-reflection',
  LESSON_TIMER: 'lesson4-timer',
  LESSON_PROGRESS: 'lesson4-progress',
  SELECTED_VIDEO: 'epic-wildlife-selected-video'
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

// ✅ Selected Wildlife Video
export const saveSelectedVideo = (videoId, videoTitle) => {
  const selection = {
    videoId,
    videoTitle,
    selectedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.SELECTED_VIDEO, JSON.stringify(selection));
  console.log('✅ Wildlife video selection saved:', selection);
  return selection;
};

export const getSelectedVideo = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SELECTED_VIDEO);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading selected video:', error);
    return null;
  }
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

// Sectional Loop Builder Score (for session mode)
export const saveSectionalBuilderScore = (studentId, score, rounds, safariBonus) => {
  const scoreData = {
    score,
    rounds,
    safariBonus: safariBonus || 0,
    completedAt: new Date().toISOString()
  };
  const saveKey = `${STORAGE_KEYS.SECTIONAL_BUILDER_SCORE}-${studentId}`;
  localStorage.setItem(saveKey, JSON.stringify(scoreData));
  console.log('✅ Sectional builder score saved:', saveKey, scoreData);
  return scoreData;
};

export const getSectionalBuilderScore = (studentId) => {
  try {
    if (studentId) {
      const data = localStorage.getItem(`${STORAGE_KEYS.SECTIONAL_BUILDER_SCORE}-${studentId}`);
      if (data) return JSON.parse(data);
    }
    const data = localStorage.getItem(STORAGE_KEYS.SECTIONAL_BUILDER_SCORE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading sectional builder score:', error);
    return null;
  }
};

// Epic Wildlife Composition
export const saveComposition = (studentId, placedLoops, sections, requirements, videoDuration, videoId) => {
  // ✅ Normalize all loops to ensure they have complete properties
  const normalizedLoops = placedLoops.map(normalizeLoop);
  
  const composition = {
    title: "Epic Wildlife Soundtrack",
    videoId: videoId,
    placedLoops: normalizedLoops,
    sections: sections || [],  // Array of section markers {id, startTime, endTime, name}
    requirements,
    videoDuration,
    savedAt: new Date().toISOString(),
    loopCount: normalizedLoops.length,
    sectionCount: sections ? sections.length : 0,
    timestamp: Date.now()
  };
  const saveKey = studentId ? `${STORAGE_KEYS.COMPOSITION}-${studentId}` : STORAGE_KEYS.COMPOSITION;
  localStorage.setItem(saveKey, JSON.stringify(composition));
  console.log('✅ Epic Wildlife composition saved with normalized loops:', composition);
  return composition;
};

export const getComposition = (studentId) => {
  try {
    // Try studentId-based key first
    if (studentId) {
      const data = localStorage.getItem(`${STORAGE_KEYS.COMPOSITION}-${studentId}`);
      if (data) {
        const composition = JSON.parse(data);
        if (composition.placedLoops) {
          composition.placedLoops = composition.placedLoops.map(normalizeLoop);
        }
        return composition;
      }
    }
    // Fallback to old key format (no studentId)
    const data = localStorage.getItem(STORAGE_KEYS.COMPOSITION);
    if (!data) return null;
    
    const composition = JSON.parse(data);
    
    // ✅ Normalize loops on load to ensure backward compatibility
    if (composition.placedLoops) {
      composition.placedLoops = composition.placedLoops.map(normalizeLoop);
    }
    
    console.log('✅ Epic Wildlife composition loaded with normalized loops:', composition);
    return composition;
  } catch (error) {
    console.error('Error loading composition:', error);
    return null;
  }
};

// Bonus Composition (Extended version with more sections)
export const saveBonusComposition = (studentId, placedLoops, sections, videoDuration) => {
  // ✅ Normalize all loops
  const normalizedLoops = placedLoops.map(normalizeLoop);
  
  const bonus = {
    title: "Epic Wildlife - Extended",
    placedLoops: normalizedLoops,
    sections: sections || [],
    videoDuration,
    savedAt: new Date().toISOString(),
    loopCount: normalizedLoops.length,
    sectionCount: sections ? sections.length : 0,
    timestamp: Date.now()
  };
  const saveKey = studentId ? `${STORAGE_KEYS.BONUS_COMPOSITION}-${studentId}` : STORAGE_KEYS.BONUS_COMPOSITION;
  localStorage.setItem(saveKey, JSON.stringify(bonus));
  console.log('✅ Bonus composition saved with normalized loops:', bonus);
  return bonus;
};

export const getBonusComposition = (studentId) => {
  try {
    if (studentId) {
      const data = localStorage.getItem(`${STORAGE_KEYS.BONUS_COMPOSITION}-${studentId}`);
      if (data) {
        const bonus = JSON.parse(data);
        if (bonus.placedLoops) {
          bonus.placedLoops = bonus.placedLoops.map(normalizeLoop);
        }
        return bonus;
      }
    }
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
export const getLessonSummary = (studentId) => {
  return {
    selectedVideo: getSelectedVideo(),
    sectionalBuilderStats: getSectionalBuilderStats(),
    sectionalBuilderScore: getSectionalBuilderScore(studentId),
    composition: getComposition(studentId),
    bonusComposition: getBonusComposition(studentId),
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