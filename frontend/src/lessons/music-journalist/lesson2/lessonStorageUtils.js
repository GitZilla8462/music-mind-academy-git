// File: /src/lessons/music-journalist/lesson2/lessonStorageUtils.js
// Storage management for Lesson 2 - Listen Like an Agent
// Listening guide, sound statement, and reflection data

// Storage Keys
export const STORAGE_KEYS = {
  RESEARCH_BOARD: 'music-journalist-lesson2-research-board',
  REFLECTION: 'music-journalist-lesson2-reflection',
  LESSON_PROGRESS: 'music-journalist-lesson2-progress'
};

// Research Board Data
export const saveResearchBoard = (cards, themes) => {
  const board = {
    cards,
    themes,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.RESEARCH_BOARD, JSON.stringify(board));
  console.log('Research board saved:', board);
  return board;
};

export const getResearchBoard = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESEARCH_BOARD);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading research board:', error);
    return null;
  }
};

// Reflection Data
export const saveReflection = (strongestEvidence, organizationInsight, headlineIdea) => {
  const reflection = {
    strongestEvidence,
    organizationInsight,
    headlineIdea,
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
  console.log('All Music Journalist Lesson 2 data cleared');
};

// Get complete lesson summary
export const getLesson2Summary = () => {
  return {
    researchBoard: getResearchBoard(),
    reflection: getReflection()
  };
};
