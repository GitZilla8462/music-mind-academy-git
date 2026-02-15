// File: /src/lessons/listening-lab/lesson4/lessonStorageUtils.js
// Storage management for Lesson 4 - Review + Start Capstone

// Storage Keys
export const STORAGE_KEYS = {
  REVIEW_GAME_SCORE: 'listening-lab-lesson4-review-score',
  SELECTED_PIECE: 'listening-lab-lesson4-selected-piece',
  CAPSTONE_PLAN: 'listening-lab-lesson4-capstone-plan',
  LISTENING_JOURNEY: 'listening-lab-lesson4-listening-journey',
  LESSON_TIMER: 'listening-lab-lesson4-timer',
  LESSON_PROGRESS: 'listening-lab-lesson4-progress'
};

// Review Game Score
export const saveReviewScore = (correct, total, rounds) => {
  const score = {
    correct,
    total,
    rounds,
    percentage: Math.round((correct / total) * 100),
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.REVIEW_GAME_SCORE, JSON.stringify(score));
  return score;
};

export const getReviewScore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEW_GAME_SCORE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Selected Piece
export const saveSelectedPiece = (pieceId) => {
  const selection = {
    pieceId,
    selectedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.SELECTED_PIECE, JSON.stringify(selection));
  return selection;
};

export const getSelectedPiece = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SELECTED_PIECE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Capstone Plan
export const saveCaptonePlan = (planData) => {
  const plan = {
    ...planData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.CAPSTONE_PLAN, JSON.stringify(plan));
  return plan;
};

export const getCapstonePlan = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CAPSTONE_PLAN);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Listening Journey Data
export const saveListeningJourney = (journeyData) => {
  const journey = {
    ...journeyData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.LISTENING_JOURNEY, JSON.stringify(journey));
  return journey;
};

export const getListeningJourney = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LISTENING_JOURNEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Clear all lesson data
export const clearAllLesson4Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Get complete lesson summary
export const getLesson4Summary = () => {
  return {
    reviewScore: getReviewScore(),
    selectedPiece: getSelectedPiece(),
    capstonePlan: getCapstonePlan(),
    listeningJourney: getListeningJourney()
  };
};
