// File: /src/lessons/listening-lab/lesson1/lessonStorageUtils.js
// Storage management for Lesson 1 - Meet the Orchestra (Instruments & Timbre)

// Storage Keys
export const STORAGE_KEYS = {
  GUESS_INSTRUMENT_SCORE: 'listening-lab-guess-instrument-score',
  LISTENING_MAP: 'listening-lab-lesson1-listening-map',
  REFLECTION: 'listening-lab-lesson1-reflection',
  LESSON_TIMER: 'listening-lab-lesson1-timer',
  LESSON_PROGRESS: 'listening-lab-lesson1-progress'
};

// Guess That Instrument Game Score
export const saveGuessInstrumentScore = (correct, total, level, attempts) => {
  const score = {
    correct,
    total,
    level,
    attempts,
    percentage: Math.round((correct / total) * 100),
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.GUESS_INSTRUMENT_SCORE, JSON.stringify(score));
  console.log('Guess That Instrument score saved:', score);
  return score;
};

export const getGuessInstrumentScore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GUESS_INSTRUMENT_SCORE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading guess instrument score:', error);
    return null;
  }
};

// Listening Map Data
export const saveListeningMap = (mapData, audioTitle) => {
  const listeningMap = {
    title: audioTitle || 'Listening Map #1',
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
export const saveReflection = (easiestFamily, hardestFamily, newObservation, additionalNotes) => {
  const reflection = {
    easiestFamily,
    hardestFamily,
    newObservation,
    additionalNotes,
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
export const clearAllLesson1Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All Listening Lab Lesson 1 data cleared');
};

// Get complete lesson summary
export const getLesson1Summary = () => {
  return {
    guessInstrumentScore: getGuessInstrumentScore(),
    listeningMap: getListeningMap(),
    reflection: getReflection()
  };
};
