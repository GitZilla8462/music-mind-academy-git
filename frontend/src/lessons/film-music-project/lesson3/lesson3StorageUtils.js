// File: /src/lessons/film-music-project/lesson3/lesson3StorageUtils.js
// Storage management for Lesson 3 - City Soundscapes
// ✅ UPDATED: Added city video selection storage

// Storage Keys
export const STORAGE_KEYS = {
  CITY_COMPOSITION: 'city-composition',
  REFLECTION: 'city-reflection',
  LESSON_TIMER: 'lesson3-timer',
  LESSON_PROGRESS: 'lesson3-progress',
  LAYER_DETECTIVE_SCORE: 'lesson3-layer-detective-score',
  SELECTED_VIDEO: 'city-selected-video'  // ✅ Added
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

// Layer Detective Score
export const saveLayerDetectiveScore = (score, totalQuestions, timeSpent) => {
  const scoreData = {
    score,
    totalQuestions,
    timeSpent,
    percentage: Math.round((score / totalQuestions) * 100),
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.LAYER_DETECTIVE_SCORE, JSON.stringify(scoreData));
  console.log('✅ Layer Detective score saved:', scoreData);
  return scoreData;
};

export const getLayerDetectiveScore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LAYER_DETECTIVE_SCORE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading Layer Detective score:', error);
    return null;
  }
};

// City Composition
export const saveCityComposition = (placedLoops, requirements, compositionDuration, videoId) => {
  const normalizedLoops = placedLoops.map(normalizeLoop);
  
  const composition = {
    title: 'City Soundscape',
    videoId: videoId,  // ✅ Now saves which city video was used
    placedLoops: normalizedLoops,
    requirements,
    compositionDuration,
    savedAt: new Date().toISOString(),
    loopCount: normalizedLoops.length
  };
  localStorage.setItem(STORAGE_KEYS.CITY_COMPOSITION, JSON.stringify(composition));
  console.log('✅ City composition saved:', composition);
  return composition;
};

export const getCityComposition = () => {
  try {
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
export const getLesson3Summary = () => {
  return {
    selectedVideo: getSelectedVideo(),
    layerDetectiveScore: getLayerDetectiveScore(),
    composition: getCityComposition(),
    reflection: getCityReflection()
  };
};