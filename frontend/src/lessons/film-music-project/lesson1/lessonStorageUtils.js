// File: /src/lessons/film-music-project/lesson1/lessonStorageUtils.js
// Storage management for Lesson 1 - Score the Adventure (Mood & Expression)

// Storage Keys
export const STORAGE_KEYS = {
  SELECTED_MOOD: 'adventure-selected-mood',
  MOOD_MATCH_SCORE: 'adventure-mood-match-score',
  COMPOSITION: 'adventure-composition',
  REFLECTION: 'adventure-reflection',
  LESSON_TIMER: 'lesson1-timer',
  LESSON_PROGRESS: 'lesson1-progress'
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

// Selected Mood for Composition
export const saveSelectedMood = (moodId, moodName) => {
  const selection = {
    moodId,
    moodName,
    selectedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.SELECTED_MOOD, JSON.stringify(selection));
  console.log('Mood selection saved:', selection);
  return selection;
};

export const getSelectedMood = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SELECTED_MOOD);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading selected mood:', error);
    return null;
  }
};

// Mood Match Game Score
export const saveMoodMatchScore = (correct, total, attempts) => {
  const score = {
    correct,
    total,
    attempts,
    percentage: Math.round((correct / total) * 100),
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.MOOD_MATCH_SCORE, JSON.stringify(score));
  console.log('Mood match score saved:', score);
  return score;
};

export const getMoodMatchScore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MOOD_MATCH_SCORE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading mood match score:', error);
    return null;
  }
};

// Adventure Composition
export const saveAdventureComposition = (placedLoops, requirements, videoDuration, selectedMood) => {
  const normalizedLoops = placedLoops.map(normalizeLoop);

  const composition = {
    title: 'Score the Adventure',
    selectedMood,
    placedLoops: normalizedLoops,
    requirements,
    videoDuration,
    savedAt: new Date().toISOString(),
    loopCount: normalizedLoops.length
  };
  localStorage.setItem(STORAGE_KEYS.COMPOSITION, JSON.stringify(composition));
  console.log('Adventure composition saved:', composition);
  return composition;
};

export const getAdventureComposition = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPOSITION);
    if (!data) return null;

    const composition = JSON.parse(data);

    if (composition.placedLoops) {
      composition.placedLoops = composition.placedLoops.map(normalizeLoop);
    }

    console.log('Adventure composition loaded:', composition);
    return composition;
  } catch (error) {
    console.error('Error loading adventure composition:', error);
    return null;
  }
};

// Reflection Data
export const saveAdventureReflection = (reviewType, partnerName, star1, star2, wish, selectedMood) => {
  const reflection = {
    reviewType,
    partnerName,
    star1,
    star2,
    wish,
    selectedMood,
    submittedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.REFLECTION, JSON.stringify(reflection));
  console.log('Reflection saved:', reflection);
  return reflection;
};

export const getAdventureReflection = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REFLECTION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading reflection:', error);
    return null;
  }
};

// Clear all lesson data
export const clearAllLesson1Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All Lesson 1 data cleared');
};

// Get complete lesson summary
export const getLesson1Summary = () => {
  return {
    selectedMood: getSelectedMood(),
    moodMatchScore: getMoodMatchScore(),
    composition: getAdventureComposition(),
    reflection: getAdventureReflection()
  };
};
