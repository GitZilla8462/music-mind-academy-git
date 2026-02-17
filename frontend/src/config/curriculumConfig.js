// Curriculum Configuration - Single Source of Truth
// src/config/curriculumConfig.js
//
// All units, lessons, and gradable activities defined here.
// Import this instead of hardcoding LESSONS arrays in components.
//
// Activity types: 'game' (auto-scored), 'composition' (teacher-graded), 'reflection' (teacher-reviewed)

// ============================================================
// UNIT DEFINITIONS
// ============================================================

export const CURRICULUM = [
  {
    id: 'listening-lab',
    name: 'Listening Lab',
    shortName: 'Listening Lab',
    icon: '🎧',
    color: 'purple',
    lessons: [
      {
        id: 'll-lesson1',
        name: 'Lesson 1: Strings & Dynamics',
        shortName: 'Strings',
        concept: 'String family and dynamic markings (Vivaldi - Spring)',
        route: '/lessons/listening-lab/lesson1',
        activities: [
          { id: 'dynamics-dash', name: 'Dynamics Dash', type: 'game' },
          { id: 'dynamics-listening-map', name: 'Dynamics Listening Map', type: 'composition' },
          { id: 'll-lesson1-reflection', name: 'Reflection', type: 'reflection' }
        ]
      },
      {
        id: 'll-lesson2',
        name: 'Lesson 2: Woodwinds & Tempo',
        shortName: 'Woodwinds',
        concept: 'Woodwind family and tempo markings (Brahms - Hungarian Dance No. 5)',
        route: '/lessons/listening-lab/lesson2',
        activities: [
          { id: 'tempo-charades', name: 'Tempo Charades', type: 'game' },
          { id: 'tempo-listening-map', name: 'Tempo Listening Map', type: 'composition' },
          { id: 'll-lesson2-reflection', name: 'Reflection', type: 'reflection' }
        ]
      },
      {
        id: 'll-lesson3',
        name: 'Lesson 3: Brass, Percussion & Form',
        shortName: 'Brass & Form',
        concept: 'Brass/percussion families and ternary form',
        route: '/lessons/listening-lab/lesson3',
        activities: [
          { id: 'listening-journey-mountain-king', name: 'Listening Journey', type: 'composition' },
          { id: 'll-lesson3-reflection', name: 'Reflection', type: 'reflection' }
        ]
      },
      {
        id: 'll-lesson4',
        name: 'Lesson 4: Form & Structure',
        shortName: 'Form',
        concept: 'Musical form — rondo and ternary',
        route: '/lessons/listening-lab/lesson4',
        activities: [
          { id: 'listening-journey-fur-elise', name: 'Listening Journey', type: 'composition' },
          { id: 'll-lesson4-reflection', name: 'Reflection', type: 'reflection' }
        ]
      },
      {
        id: 'll-lesson5',
        name: 'Lesson 5: Full Orchestra',
        shortName: 'Orchestra',
        concept: 'All families together',
        route: '/lessons/listening-lab/lesson5',
        activities: [
          { id: 'll-lesson5-reflection', name: 'Reflection', type: 'reflection' }
        ]
      }
    ]
  },
  {
    id: 'film-music',
    name: 'Film Music for Media',
    shortName: 'Film Music',
    icon: '🎬',
    color: 'blue',
    lessons: [
      {
        id: 'fm-lesson1',
        name: 'Lesson 1: Leitmotif & Character',
        shortName: 'Leitmotif',
        concept: 'How composers give characters identity through melody',
        route: '/lessons/film-music/lesson1',
        activities: [
          { id: 'keyboard-tutorial', name: 'Keyboard Practice', type: 'game' },
          { id: 'leitmotif-detective', name: 'Leitmotif Detective', type: 'game' },
          { id: 'motif-builder', name: 'Motif Builder', type: 'composition' },
          { id: 'fm-lesson1-reflection', name: 'Reflection', type: 'reflection' }
        ]
      },
      {
        id: 'fm-lesson2',
        name: 'Lesson 2: Texture & Layering',
        shortName: 'Texture',
        concept: 'How many sounds play together',
        route: '/lessons/film-music-project/lesson2',
        activities: [
          { id: 'layer-detective', name: 'Layer Detective', type: 'game' },
          { id: 'city-composition', name: 'City Composition', type: 'composition' },
          { id: 'fm-lesson2-reflection', name: 'Reflection', type: 'reflection' }
        ]
      },
      {
        id: 'fm-lesson3',
        name: 'Lesson 3: Form & Structure',
        shortName: 'Form',
        concept: 'When sounds come in and out',
        route: '/lessons/film-music-project/lesson3',
        activities: [
          { id: 'sectional-loop-builder', name: 'Section Safari', type: 'game' },
          { id: 'wildlife-composition', name: 'Wildlife Composition', type: 'composition' },
          { id: 'fm-lesson3-reflection', name: 'Reflection', type: 'reflection' }
        ]
      },
      {
        id: 'fm-lesson4',
        name: 'Lesson 4: Rhythm & Beat',
        shortName: 'Rhythm',
        concept: 'Creating rhythm patterns for video',
        route: '/lessons/film-music-project/lesson4',
        activities: [
          { id: 'beat-maker-activity', name: 'Build Your Beat', type: 'game' },
          { id: 'sports-composition', name: 'Sports Composition', type: 'composition' },
          { id: 'fm-lesson4-reflection', name: 'Reflection', type: 'reflection' }
        ]
      },
      {
        id: 'fm-lesson5',
        name: 'Lesson 5: Melody & Contour',
        shortName: 'Melody',
        concept: 'Creating memorable themes',
        route: '/lessons/film-music-project/lesson5',
        activities: [
          { id: 'melody-maker-activity', name: 'Build Your Melody', type: 'game' },
          { id: 'game-composition', name: 'Game Composition', type: 'composition' },
          { id: 'fm-lesson5-reflection', name: 'Reflection', type: 'reflection' }
        ]
      }
    ]
  },
  {
    id: 'production-studio',
    name: 'The Production Studio',
    shortName: 'Production Studio',
    icon: '🎛️',
    color: 'orange',
    lessons: [
      {
        id: 'ps-lesson1',
        name: 'Lesson 1: Meet the Industry',
        shortName: 'Industry',
        concept: 'Music careers and collaboration roles',
        route: null, // Not yet built
        activities: [
          { id: 'credit-detective', name: 'Credit Detective', type: 'game' },
          { id: 'studio-contract', name: 'Studio Contract', type: 'reflection' }
        ]
      },
      {
        id: 'ps-lesson2',
        name: 'Lesson 2: The Creative Brief',
        shortName: 'Brief',
        concept: 'Genre, mood, audience, and artistic intent',
        route: null,
        activities: [
          { id: 'creative-brief', name: 'Creative Brief', type: 'composition' },
          { id: 'reference-track-picker', name: 'Reference Track Picker', type: 'game' }
        ]
      },
      {
        id: 'ps-lesson3',
        name: 'Lesson 3: Studio Session',
        shortName: 'Studio',
        concept: 'Arrangement, feedback, and revision',
        route: null,
        activities: [
          { id: 'studio-composition', name: 'Studio Composition', type: 'composition' },
          { id: 'ar-feedback', name: 'A&R Feedback', type: 'reflection' }
        ]
      },
      {
        id: 'ps-lesson4',
        name: 'Lesson 4: Mix & Brand',
        shortName: 'Mix',
        concept: 'Mixing fundamentals and music branding',
        route: null,
        activities: [
          { id: 'final-mix', name: 'Final Mix', type: 'composition' },
          { id: 'album-art', name: 'Album Art Creator', type: 'composition' },
          { id: 'composer-notes', name: 'Composer Notes', type: 'reflection' }
        ]
      },
      {
        id: 'ps-lesson5',
        name: 'Lesson 5: Release Day',
        shortName: 'Release',
        concept: 'Presentation, evaluation, and celebration',
        route: null,
        activities: [
          { id: 'album-release', name: 'Album Release Package', type: 'composition' },
          { id: 'ps-lesson5-reflection', name: 'Unit Reflection', type: 'reflection' }
        ]
      }
    ]
  }
];


// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get a flat list of all lessons across all units (for backward compat)
 * Each lesson includes its parent unit info
 */
export const getAllLessons = () => {
  const lessons = [];
  for (const unit of CURRICULUM) {
    for (const lesson of unit.lessons) {
      lessons.push({
        ...lesson,
        unitId: unit.id,
        unitName: unit.name,
        unitIcon: unit.icon,
        unitColor: unit.color
      });
    }
  }
  return lessons;
};

/**
 * Get a lesson by its ID
 * @param {string} lessonId
 * @returns {object|null} lesson with unit info
 */
export const getLessonById = (lessonId) => {
  for (const unit of CURRICULUM) {
    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (lesson) {
      return {
        ...lesson,
        unitId: unit.id,
        unitName: unit.name,
        unitIcon: unit.icon,
        unitColor: unit.color
      };
    }
  }
  return null;
};

/**
 * Get a specific activity by lesson ID and activity ID
 * @param {string} lessonId
 * @param {string} activityId
 * @returns {object|null}
 */
export const getActivityById = (lessonId, activityId) => {
  const lesson = getLessonById(lessonId);
  if (!lesson) return null;
  return lesson.activities.find(a => a.id === activityId) || null;
};

/**
 * Get the unit that contains a given lesson
 * @param {string} lessonId
 * @returns {object|null} unit object
 */
export const getUnitForLesson = (lessonId) => {
  for (const unit of CURRICULUM) {
    if (unit.lessons.some(l => l.id === lessonId)) {
      return unit;
    }
  }
  return null;
};

/**
 * Build a map from activityId -> lessonId for Firebase path resolution.
 * Used by studentWorkStorage.js to know which lesson an activity belongs to.
 * @returns {Object} { 'city-composition': 'fm-lesson2', ... }
 */
export const getActivityToLessonMap = () => {
  const map = {};
  for (const unit of CURRICULUM) {
    for (const lesson of unit.lessons) {
      for (const activity of lesson.activities) {
        map[activity.id] = lesson.id;
      }
    }
  }
  return map;
};

/**
 * Get total counts across all units
 * @returns {object} { totalUnits, totalLessons, totalActivities, builtLessons }
 */
export const getCurriculumStats = () => {
  let totalLessons = 0;
  let totalActivities = 0;
  let builtLessons = 0;

  for (const unit of CURRICULUM) {
    totalLessons += unit.lessons.length;
    for (const lesson of unit.lessons) {
      totalActivities += lesson.activities.length;
      if (lesson.route) builtLessons++;
    }
  }

  return {
    totalUnits: CURRICULUM.length,
    totalLessons,
    totalActivities,
    builtLessons
  };
};

/**
 * Backward-compatible flat LESSONS array matching the old format.
 * Use this only for migration - prefer CURRICULUM for new code.
 */
export const LESSONS_FLAT = getAllLessons().map(lesson => ({
  id: lesson.id,
  name: lesson.name,
  activities: lesson.activities
}));
