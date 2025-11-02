// File: /lessons/film-music-project/lesson1/lesson1Config.js
// Lesson 1 configuration - activities, stages, and constants

export const LESSON_PROGRESS_KEY = 'lesson1-progress';
export const LESSON_TIMER_KEY = 'lesson1-timer';

export const lesson1Config = {
  id: 'lesson1',
  title: "Introduction to the Digital Audio Workstation",
  learningObjectives: [
    "Master the DAW interface and basic controls",
    "Practice placing and manipulating music loops",
    "Create a mysterious film score using layering techniques"
  ],
  activities: [
    {
      id: 1,
      type: "video",
      title: "Lesson Introduction",
      estimatedTime: "3 min",
      src: "/lessons/film-music-project/lesson1/Lesson1intro.mp4"
    },
    {
      id: 2,
      type: "daw-tutorial",
      title: "DAW Basics Interactive Tutorial",
      estimatedTime: "5 min"
    },
    {
      id: 3,
      type: "video",
      title: "Activity Introduction",
      estimatedTime: "2 min",
      src: "/lessons/film-music-project/lesson1/Lesson1activityintro.mp4"
    },
    {
      id: 4,
      type: "school-beneath-activity",
      title: "The School Beneath",
      estimatedTime: "10 min"
    },
    {
      id: 5,
      type: "two-stars-wish",
      title: "Reflection Activity",
      estimatedTime: "5 min"
    },
    {
      id: 6,
      type: "sound-effects",
      title: "Bonus: Add Sound Effects",
      estimatedTime: "Remaining time"
    }
  ]
};

export const lessonStages = [
  { 
    id: 'locked', 
    label: 'Join with Class Code', 
    description: 'Students enter session code',
    type: 'waiting'
  },
  { 
    id: 'intro-summary', 
    label: 'Show Welcome Instructions', 
    description: 'Introduction summary',
    type: 'summary',
    content: 'introVideo'
  },
  { 
    id: 'intro-video', 
    label: 'Play Introduction Video', 
    description: 'Lesson intro video', 
    hasProgress: false,
    type: 'video',
    duration: '3:00'
  },
  { 
    id: 'daw-summary', 
    label: 'Show DAW Instructions', 
    description: 'DAW tutorial summary',
    type: 'summary',
    content: 'dawTutorial'
  },
  { 
    id: 'daw-tutorial', 
    label: 'Unlock DAW Tutorial', 
    description: 'Interactive DAW basics', 
    hasProgress: true,
    type: 'activity',
    recommendedMinutes: 5
  },
  { 
    id: 'activity-summary', 
    label: 'Show Activity Instructions', 
    description: 'Activity intro summary',
    type: 'summary',
    content: 'activityIntro'
  },
  { 
    id: 'activity-intro', 
    label: 'Play Activity Introduction', 
    description: 'Activity introduction video', 
    hasProgress: false,
    type: 'video',
    duration: '2:00'
  },
  { 
    id: 'school-summary', 
    label: 'Show Composition Instructions', 
    description: 'School Beneath summary',
    type: 'summary',
    content: 'schoolBeneath'
  },
  { 
    id: 'school-beneath', 
    label: 'Unlock School Beneath', 
    description: 'The School Beneath composition', 
    hasProgress: true,
    type: 'activity',
    recommendedMinutes: 10
  },
  { 
    id: 'reflection-summary', 
    label: 'Show Reflection Instructions', 
    description: 'Reflection summary',
    type: 'summary',
    content: 'reflection'
  },
  { 
    id: 'reflection', 
    label: 'Unlock Reflection', 
    description: 'Two Stars and a Wish', 
    hasProgress: true,
    type: 'activity',
    recommendedMinutes: 5
  },
  { 
    id: 'sound-effects', 
    label: 'Unlock Bonus: Sound Effects', 
    description: 'Add sound effects', 
    hasProgress: true,
    type: 'bonus'
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'intro-summary': 'summary',
    'intro-video': 'video',
    'daw-summary': 'summary',
    'daw-tutorial': 'daw-tutorial',
    'activity-summary': 'summary',
    'activity-intro': 'video',
    'school-summary': 'summary',
    'school-beneath': 'school-beneath-activity',
    'reflection-summary': 'summary',
    'reflection': 'two-stars-wish',
    'sound-effects': 'sound-effects'
  };
  return stageMap[stage];
};