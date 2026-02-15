// File: /src/lessons/listening-lab/lesson5/lessonStorageUtils.js
// Storage management for Lesson 5 - Work Time + Gallery Circle

// Storage Keys
export const STORAGE_KEYS = {
  GALLERY_FEEDBACK: 'listening-lab-lesson5-gallery-feedback',
  EXIT_TICKET: 'listening-lab-lesson5-exit-ticket',
  LESSON_TIMER: 'listening-lab-lesson5-timer',
  LESSON_PROGRESS: 'listening-lab-lesson5-progress'
};

// Gallery Feedback
export const saveGalleryFeedback = (feedbackData) => {
  const feedback = {
    ...feedbackData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.GALLERY_FEEDBACK, JSON.stringify(feedback));
  return feedback;
};

export const getGalleryFeedback = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GALLERY_FEEDBACK);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Exit Ticket / Unit Reflection
export const saveExitTicket = (reflectionData) => {
  const ticket = {
    ...reflectionData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.EXIT_TICKET, JSON.stringify(ticket));
  return ticket;
};

export const getExitTicket = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXIT_TICKET);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Clear all lesson data
export const clearAllLesson5Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Get complete lesson summary
export const getLesson5Summary = () => {
  return {
    galleryFeedback: getGalleryFeedback(),
    exitTicket: getExitTicket()
  };
};
