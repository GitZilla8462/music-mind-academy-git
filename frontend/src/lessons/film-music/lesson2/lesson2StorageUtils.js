// File: /src/lessons/film-music/lesson2/lesson2StorageUtils.js
// Storage management for Film Music Lesson 2 — WHAT Do They Feel? (Instruments & Emotion)
// Supports dynamic number of scenes (1-8)

const PREFIX = 'fm-lesson2';

export const STORAGE_KEYS = {
  LESSON_TIMER: `${PREFIX}-timer`,
  LESSON_PROGRESS: `${PREFIX}-progress`
};

// ========================================
// Generic per-scene storage (supports any scene number)
// ========================================
const sceneKey = (sceneNum, field) => `${PREFIX}-scene${sceneNum}-${field}`;

// Scene drawing (base64 PNG data URL)
export const saveSceneDrawing = (sceneNum, dataUrl) => {
  try { localStorage.setItem(sceneKey(sceneNum, 'drawing'), dataUrl); } catch (e) {}
};

export const getSceneDrawing = (sceneNum) => {
  try { return localStorage.getItem(sceneKey(sceneNum, 'drawing')) || null; } catch { return null; }
};

// Scene background ID
export const saveSceneBackground = (sceneNum, bgId) => {
  localStorage.setItem(sceneKey(sceneNum, 'bg'), bgId);
};

export const getSceneBackground = (sceneNum) => {
  return localStorage.getItem(sceneKey(sceneNum, 'bg')) || null;
};

// Scene recording (array of {note, timestamp, duration})
export const saveSceneRecording = (sceneNum, notes, instrument) => {
  const data = { notes, instrument, savedAt: new Date().toISOString() };
  localStorage.setItem(sceneKey(sceneNum, 'recording'), JSON.stringify(data));
  localStorage.setItem(sceneKey(sceneNum, 'instrument'), instrument);
  return data;
};

export const getSceneRecording = (sceneNum) => {
  try {
    const data = localStorage.getItem(sceneKey(sceneNum, 'recording'));
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

export const getSceneInstrument = (sceneNum) => {
  return localStorage.getItem(sceneKey(sceneNum, 'instrument')) || null;
};

// Character name
export const saveSceneCharacter = (sceneNum, name) => {
  localStorage.setItem(sceneKey(sceneNum, 'character'), name);
};

export const getSceneCharacter = (sceneNum) => {
  return localStorage.getItem(sceneKey(sceneNum, 'character')) || '';
};

// ========================================
// Spotting guide data per scene (character type, description)
// ========================================
export const saveSceneSpotting = (sceneNum, data) => {
  try {
    localStorage.setItem(sceneKey(sceneNum, 'spotting'), JSON.stringify(data));
  } catch (e) {}
};

export const getSceneSpotting = (sceneNum) => {
  try {
    const data = localStorage.getItem(sceneKey(sceneNum, 'spotting'));
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

// ========================================
// Lesson progress
// ========================================
export const saveLessonProgress = (currentActivity, completedActivities) => {
  const progress = {
    currentActivity,
    completedActivities,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(progress));
  return progress;
};

export const getLessonProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

export const clearAllFMLesson2Data = () => {
  // Clear all fm-lesson2 keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};
