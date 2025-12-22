// File: /src/lessons/film-music-project/lesson2/lesson2StorageUtils.js
// Storage management for Lesson 2 - City Soundscapes
// ✅ UPDATED: Renamed Texture Drawings to Listening Map

// Storage Keys
export const STORAGE_KEYS = {
  CITY_COMPOSITION: 'city-composition',
  REFLECTION: 'city-reflection',
  LESSON_TIMER: 'lesson2-timer',
  LESSON_PROGRESS: 'lesson2-progress',
  LISTENING_MAP: 'listening-map',  // ✅ RENAMED from texture-drawings
  LOOP_LAB_SCORE: 'lesson2-loop-lab-score',
  SELECTED_VIDEO: 'city-selected-video'
};

// Helper to ensure loop has all required properties
const normalizeLoop = (loop) => {
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
    endTime: endTime,
    volume: loop.volume !== undefined ? loop.volume : 1,
    muted: loop.muted !== undefined ? loop.muted : false
  };
};

// ✅ Selected City Video
export const saveSelectedVideo = (videoId, videoTitle) => {
  const selection = {
    videoId,
    videoTitle,
    selectedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.SELECTED_VIDEO, JSON.stringify(selection));
  console.log('✅ City video selection saved:', selection);
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

// ✅ RENAMED: Listening Map Storage (formerly Texture Drawings)
// Now uses studentId for consistency with other activities
export const saveListeningMap = (studentId, imageData, roundId, roundTitle, instrumentCount) => {
  const mapData = {
    imageData,
    roundId,
    roundTitle,
    instrumentCount,
    completedAt: new Date().toISOString(),
    timestamp: Date.now()
  };
  const saveKey = `${STORAGE_KEYS.LISTENING_MAP}-${studentId}`;
  localStorage.setItem(saveKey, JSON.stringify(mapData));
  console.log('✅ Listening map saved:', saveKey);
  return mapData;
};

export const getListeningMap = (studentId) => {
  try {
    // Try studentId-based key first
    if (studentId) {
      const data = localStorage.getItem(`${STORAGE_KEYS.LISTENING_MAP}-${studentId}`);
      if (data) return JSON.parse(data);
    }
    // Fallback to old key format (no studentId)
    const data = localStorage.getItem(STORAGE_KEYS.LISTENING_MAP);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading listening map:', error);
    return null;
  }
};

// Loop Lab Score
export const saveLoopLabScore = (playerScores, totalRounds, winner) => {
  const scoreData = {
    playerScores, // { player1: 50, player2: 45, player3: 0 }
    totalRounds,
    winner, // 1, 2, 3, or null for tie
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.LOOP_LAB_SCORE, JSON.stringify(scoreData));
  console.log('✅ Loop Lab score saved:', scoreData);
  return scoreData;
};

export const getLoopLabScore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOOP_LAB_SCORE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading Loop Lab score:', error);
    return null;
  }
};

// City Composition
// Now uses studentId for consistency with other activities
export const saveCityComposition = (studentId, placedLoops, requirements, compositionDuration, videoId) => {
  const normalizedLoops = placedLoops.map(normalizeLoop);
  
  const composition = {
    title: 'City Soundscape',
    videoId: videoId,
    placedLoops: normalizedLoops,
    requirements,
    compositionDuration,
    savedAt: new Date().toISOString(),
    loopCount: normalizedLoops.length,
    timestamp: Date.now()
  };
  const saveKey = `${STORAGE_KEYS.CITY_COMPOSITION}-${studentId}`;
  localStorage.setItem(saveKey, JSON.stringify(composition));
  console.log('✅ City composition saved:', saveKey);
  return composition;
};

export const getCityComposition = (studentId) => {
  try {
    // Try studentId-based key first
    if (studentId) {
      const data = localStorage.getItem(`${STORAGE_KEYS.CITY_COMPOSITION}-${studentId}`);
      if (data) {
        const composition = JSON.parse(data);
        if (composition.placedLoops) {
          composition.placedLoops = composition.placedLoops.map(normalizeLoop);
        }
        console.log('✅ City composition loaded:', composition);
        return composition;
      }
    }
    // Fallback to old key format (no studentId)
    const data = localStorage.getItem(STORAGE_KEYS.CITY_COMPOSITION);
    if (!data) return null;
    
    const composition = JSON.parse(data);
    
    if (composition.placedLoops) {
      composition.placedLoops = composition.placedLoops.map(normalizeLoop);
    }
    
    console.log('✅ City composition loaded:', composition);
    return composition;
  } catch (error) {
    console.error('Error loading city composition:', error);
    return null;
  }
};

// Reflection Data
export const saveCityReflection = (reviewType, partnerName, star1, star2, wish) => {
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

export const getCityReflection = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REFLECTION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading reflection:', error);
    return null;
  }
};

// Clear all lesson data
export const clearAllLesson3Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All Lesson 3 data cleared');
};

// Get complete lesson summary
export const getLesson3Summary = (studentId) => {
  return {
    selectedVideo: getSelectedVideo(),
    listeningMap: getListeningMap(studentId),  // ✅ Pass studentId
    loopLabScore: getLoopLabScore(),
    composition: getCityComposition(studentId),  // ✅ Pass studentId
    reflection: getCityReflection()
  };
};