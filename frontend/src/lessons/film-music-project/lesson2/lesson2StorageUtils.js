// File: /src/lessons/film-music-project/lesson2/lesson2StorageUtils.js
// Storage management for Lesson 2 - Sports Highlights

// Storage Keys
export const STORAGE_KEYS = {
  SPORTS_COMPOSITION: 'sports-composition',
  REFLECTION: 'sports-reflection',
  LESSON_TIMER: 'lesson2-timer',
  LESSON_PROGRESS: 'lesson2-progress',
  SELECTED_VIDEO: 'sports-selected-video'
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

// Selected Video
export const saveSelectedVideo = (videoId, videoTitle) => {
  const selection = {
    videoId,
    videoTitle,
    selectedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.SELECTED_VIDEO, JSON.stringify(selection));
  console.log('Video selection saved:', selection);
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

// Sports Composition
export const saveSportsComposition = (placedLoops, requirements, videoDuration, videoId) => {
  const normalizedLoops = placedLoops.map(normalizeLoop);
  
  const composition = {
    title: 'Sports Highlight Music',
    videoId: videoId,
    placedLoops: normalizedLoops,
    requirements,
    videoDuration,
    savedAt: new Date().toISOString(),
    loopCount: normalizedLoops.length
  };
  localStorage.setItem(STORAGE_KEYS.SPORTS_COMPOSITION, JSON.stringify(composition));
  console.log('✅ Sports composition saved:', composition);
  return composition;
};

export const getSportsComposition = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SPORTS_COMPOSITION);
    if (!data) return null;
    
    const composition = JSON.parse(data);
    
    if (composition.placedLoops) {
      composition.placedLoops = composition.placedLoops.map(normalizeLoop);
    }
    
    console.log('✅ Sports composition loaded:', composition);
    return composition;
  } catch (error) {
    console.error('Error loading sports composition:', error);
    return null;
  }
};

// Reflection Data
export const saveSportsReflection = (reviewType, partnerName, star1, star2, wish) => {
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

export const getSportsReflection = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REFLECTION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading reflection:', error);
    return null;
  }
};

// Clear all lesson data
export const clearAllLesson2Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All Lesson 2 data cleared');
};

// Get complete lesson summary
export const getLesson2Summary = () => {
  return {
    selectedVideo: getSelectedVideo(),
    composition: getSportsComposition(),
    reflection: getSportsReflection()
  };
};