// File: /src/lessons/listening-lab/lesson3/lessonStorageUtils.js
// Storage management for Lesson 3 - Brass, Percussion & Form
// "Music Has a Blueprint"

// Storage Keys
export const STORAGE_KEYS = {
  SECTION_SPOTTER_SCORE: 'listening-lab-lesson3-section-spotter-score',
  LISTENING_MAP: 'listening-lab-lesson3-listening-map',
  REFLECTION: 'listening-lab-lesson3-reflection',
  LESSON_TIMER: 'listening-lab-lesson3-timer',
  LESSON_PROGRESS: 'listening-lab-lesson3-progress'
};

// Section Spotter Game Score
export const saveSectionSpotterScore = (correct, total, rounds) => {
  const score = {
    correct,
    total,
    rounds,
    percentage: Math.round((correct / total) * 100),
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.SECTION_SPOTTER_SCORE, JSON.stringify(score));
  console.log('Section Spotter score saved:', score);
  return score;
};

export const getSectionSpotterScore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SECTION_SPOTTER_SCORE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading section spotter score:', error);
    return null;
  }
};

// Listening Map Data
export const saveListeningMap = (mapData, audioTitle) => {
  const listeningMap = {
    title: audioTitle || 'Form Listening Map',
    mapData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.LISTENING_MAP, JSON.stringify(listeningMap));
  console.log('Listening map saved:', listeningMap);
  return listeningMap;
};

export const getListeningMap = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LISTENING_MAP);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading listening map:', error);
    return null;
  }
};

// Reflection Data
export const saveReflection = (response1, response2, response3) => {
  const reflection = {
    response1,
    response2,
    response3,
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
export const clearAllLesson3Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All Listening Lab Lesson 3 data cleared');
};

// Get complete lesson summary
export const getLesson3Summary = () => {
  return {
    sectionSpotterScore: getSectionSpotterScore(),
    listeningMap: getListeningMap(),
    reflection: getReflection()
  };
};
