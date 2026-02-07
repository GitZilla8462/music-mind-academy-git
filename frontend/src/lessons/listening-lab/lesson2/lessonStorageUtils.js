// File: /src/lessons/listening-lab/lesson2/lessonStorageUtils.js
// Storage management for Lesson 2 - Woodwinds & Tempo
// "Feel the Speed of Music"

// Storage Keys
export const STORAGE_KEYS = {
  TEMPO_CHARADES_SCORE: 'listening-lab-lesson2-tempo-charades-score',
  LISTENING_MAP: 'listening-lab-lesson2-listening-map',
  REFLECTION: 'listening-lab-lesson2-reflection',
  LESSON_TIMER: 'listening-lab-lesson2-timer',
  LESSON_PROGRESS: 'listening-lab-lesson2-progress'
};

// Tempo Charades Game Score
export const saveTempoCharadesScore = (correct, total, rounds) => {
  const score = {
    correct,
    total,
    rounds,
    percentage: Math.round((correct / total) * 100),
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.TEMPO_CHARADES_SCORE, JSON.stringify(score));
  console.log('Tempo Charades score saved:', score);
  return score;
};

export const getTempoCharadesScore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPO_CHARADES_SCORE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading tempo charades score:', error);
    return null;
  }
};

// Listening Map Data
export const saveListeningMap = (mapData, audioTitle) => {
  const listeningMap = {
    title: audioTitle || 'Tempo Listening Map',
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
export const clearAllLesson2Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All Listening Lab Lesson 2 data cleared');
};

// Get complete lesson summary
export const getLesson2Summary = () => {
  return {
    tempoCharadesScore: getTempoCharadesScore(),
    listeningMap: getListeningMap(),
    reflection: getReflection()
  };
};
