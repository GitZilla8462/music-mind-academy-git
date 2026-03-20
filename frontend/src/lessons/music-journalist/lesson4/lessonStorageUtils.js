// File: /src/lessons/music-journalist/lesson4/lessonStorageUtils.js
// Storage management for Music Journalist Lesson 4 - Build Your Story

// Storage Keys
export const STORAGE_KEYS = {
  SLIDES: 'music-journalist-lesson4-slides',
  LESSON_PROGRESS: 'music-journalist-lesson4-progress'
};

// Slides Data
export const saveSlides = (slides) => {
  const presentation = {
    slides,
    slideCount: slides.length,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.SLIDES, JSON.stringify(presentation));
  console.log('Slides saved:', presentation);
  return presentation;
};

export const getSlides = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SLIDES);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading slides:', error);
    return null;
  }
};

// Save individual slide
export const saveSlide = (slideIndex, slideData) => {
  const existing = getSlides();
  const slides = existing ? existing.slides : [{}, {}, {}, {}];
  slides[slideIndex] = {
    ...slideData,
    updatedAt: new Date().toISOString()
  };
  return saveSlides(slides);
};

// Get individual slide
export const getSlide = (slideIndex) => {
  const existing = getSlides();
  if (!existing || !existing.slides) return null;
  return existing.slides[slideIndex] || null;
};

// Clear all lesson data
export const clearAllLesson4Data = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All Music Journalist Lesson 4 data cleared');
};

// Get complete lesson summary
export const getLesson4Summary = () => {
  return {
    slides: getSlides()
  };
};
