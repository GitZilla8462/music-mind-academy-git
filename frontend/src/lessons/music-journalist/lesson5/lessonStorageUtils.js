// File: /src/lessons/music-journalist/lesson5/lessonStorageUtils.js
// Storage management for Music Journalist Lesson 5 - Press Day

// Storage Keys
export const STORAGE_KEYS = {
  PRESENTATION: 'music-journalist-lesson5-presentation',
  PEER_FEEDBACK: 'music-journalist-lesson5-peer-feedback',
  LESSON_PROGRESS: 'music-journalist-lesson5-progress'
};

// Presentation Data
export const savePresentation = (presentationData) => {
  const presentation = {
    ...presentationData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.PRESENTATION, JSON.stringify(presentation));
  console.log('Presentation saved:', presentation);
  return presentation;
};

export const getPresentation = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRESENTATION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading presentation:', error);
    return null;
  }
};

// Peer Feedback Data
export const savePeerFeedback = (feedbackEntries) => {
  const feedback = {
    entries: feedbackEntries,
    totalGiven: feedbackEntries.length,
    submittedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.PEER_FEEDBACK, JSON.stringify(feedback));
  console.log('Peer feedback saved:', feedback);
  return feedback;
};

export const getPeerFeedback = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PEER_FEEDBACK);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading peer feedback:', error);
    return null;
  }
};

// Add single feedback entry
export const addPeerFeedbackEntry = (presenterName, liked, suggestion) => {
  const existing = getPeerFeedback();
  const entries = existing ? existing.entries : [];
  entries.push({
    presenterName,
    liked,
    suggestion,
    submittedAt: new Date().toISOString()
  });
  return savePeerFeedback(entries);
};

// Clear all lesson data
export const clearAllLesson5Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All Music Journalist Lesson 5 data cleared');
};

// Get complete lesson summary
export const getLesson5Summary = () => {
  return {
    presentation: getPresentation(),
    peerFeedback: getPeerFeedback()
  };
};
