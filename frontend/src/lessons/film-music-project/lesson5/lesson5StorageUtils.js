// File: /src/lessons/film-music-project/lesson5/lesson5StorageUtils.js
// Storage management for Lesson 5 - Game On! (Melody & Contour)

// Storage Keys
export const STORAGE_KEYS = {
  MELODY_GRID: 'lesson5-melody-grid',
  MELODY_SAVED: 'lesson5-melody-saved',
  GAME_SELECTION: 'lesson5-game-selection',
  COMPOSITION: 'lesson5-composition',
  REFLECTION: 'lesson5-reflection',
  LESSON_TIMER: 'lesson5-timer',
  LESSON_PROGRESS: 'lesson5-progress',
  MELODY_MYSTERY: 'lesson5-melody-mystery'
};

// ========================================
// MELODY GRID STORAGE
// ========================================
export const saveMelodyGrid = (grid) => {
  localStorage.setItem(STORAGE_KEYS.MELODY_GRID, JSON.stringify(grid));
  return grid;
};

export const getMelodyGrid = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MELODY_GRID);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading melody grid:', error);
    return null;
  }
};

// ========================================
// SAVED MELODY (with metadata)
// ========================================
export const saveMelody = (melodyData) => {
  const saved = {
    ...melodyData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.MELODY_SAVED, JSON.stringify(saved));
  console.log('Melody saved:', saved);
  return saved;
};

export const getSavedMelody = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MELODY_SAVED);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading saved melody:', error);
    return null;
  }
};

// ========================================
// GAME SELECTION
// ========================================
export const saveGameSelection = (gameId, gameTitle, mood) => {
  const selection = {
    gameId,
    gameTitle,
    mood,
    selectedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.GAME_SELECTION, JSON.stringify(selection));
  console.log('Game selection saved:', selection);
  return selection;
};

export const getGameSelection = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_SELECTION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading game selection:', error);
    return null;
  }
};

// ========================================
// COMPOSITION (melody + game combined)
// ========================================
export const saveComposition = (melody, game) => {
  const composition = {
    title: `${game?.gameTitle || 'Game'} Theme`,
    gameId: game?.gameId,
    gameTitle: game?.gameTitle,
    mood: game?.mood,
    melody,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.COMPOSITION, JSON.stringify(composition));
  console.log('Composition saved:', composition);
  return composition;
};

export const getComposition = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPOSITION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading composition:', error);
    return null;
  }
};

// ========================================
// REFLECTION DATA (Melody Spotlight)
// ========================================
export const saveReflection = (reviewType, partnerName, contourChoice, themeChoice, wish) => {
  const reflection = {
    reviewType,
    partnerName,
    contourChoice,
    themeChoice,
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

// ========================================
// MELODY MYSTERY STORAGE
// ========================================
export const saveMelodyMystery = (mysteryData) => {
  const saved = {
    ...mysteryData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.MELODY_MYSTERY, JSON.stringify(saved));
  console.log('Melody Mystery saved:', saved);
  return saved;
};

export const getMelodyMystery = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MELODY_MYSTERY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading Melody Mystery:', error);
    return null;
  }
};

// ========================================
// CLEAR ALL LESSON DATA
// ========================================
export const clearAllLesson5Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All Lesson 5 data cleared');
};

// ========================================
// GET COMPLETE LESSON SUMMARY
// ========================================
export const getLesson5Summary = () => {
  return {
    melodyGrid: getMelodyGrid(),
    savedMelody: getSavedMelody(),
    gameSelection: getGameSelection(),
    composition: getComposition(),
    reflection: getReflection(),
    melodyMystery: getMelodyMystery()
  };
};
