// File: /src/lessons/music-journalist/lesson1/lessonStorageUtils.js
// Storage management for Music Journalist Lesson 1 - Read Like a Journalist

// Storage Keys
export const STORAGE_KEYS = {
  ANNOTATION_DATA: 'music-journalist-lesson1-annotations',
  REFLECTION: 'music-journalist-lesson1-reflection',
  LESSON_PROGRESS: 'music-journalist-lesson1-progress',
  FACT_OPINION_SCORE: 'music-journalist-lesson1-fact-opinion-score'
};

// Annotation Data
export const saveAnnotationData = (articleId, annotations) => {
  const data = {
    articleId,
    annotations,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.ANNOTATION_DATA, JSON.stringify(data));
  console.log('Annotation data saved:', data);
  return data;
};

export const getAnnotationData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ANNOTATION_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading annotation data:', error);
    return null;
  }
};

// Fact or Opinion Game Score
export const saveFactOpinionScore = (correct, total, answers) => {
  const score = {
    correct,
    total,
    answers,
    percentage: Math.round((correct / total) * 100),
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.FACT_OPINION_SCORE, JSON.stringify(score));
  console.log('Fact or Opinion score saved:', score);
  return score;
};

export const getFactOpinionScore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FACT_OPINION_SCORE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading fact/opinion score:', error);
    return null;
  }
};

// Reflection Data
export const saveReflection = (whatLearned, favoriteType, factOpinionImportance, additionalNotes) => {
  const reflection = {
    whatLearned,
    favoriteType,
    factOpinionImportance,
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
  console.log('All Music Journalist Lesson 1 data cleared');
};

// Get complete lesson summary
export const getLesson1Summary = () => {
  return {
    annotationData: getAnnotationData(),
    factOpinionScore: getFactOpinionScore(),
    reflection: getReflection()
  };
};
