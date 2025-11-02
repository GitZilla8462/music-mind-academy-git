// File: /lessons/film-music-project/lesson1/lesson1Config.js
// Lesson 1 configuration - activities, stages, and constants

export const LESSON_PROGRESS_KEY = 'lesson1-progress';
export const LESSON_TIMER_KEY = 'lesson1-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: 'Introduction',
    subtitle: 'Welcome & DAW Tutorial',
    icon: '🎬',
    color: 'blue',
    estimatedTime: 10, // Total minutes for this section
    stages: [
      { 
        id: 'intro-summary', 
        type: 'summary', 
        label: 'Show Welcome Instructions',
        description: 'Display introduction summary'
      },
      { 
        id: 'intro-video', 
        type: 'video', 
        label: 'Play Introduction Video', 
        duration: 3,
        description: 'Lesson introduction video'
      },
      { 
        id: 'daw-summary', 
        type: 'summary', 
        label: 'Show DAW Instructions',
        description: 'Display DAW tutorial summary'
      },
      { 
        id: 'daw-tutorial', 
        type: 'activity', 
        label: 'Unlock DAW Tutorial', 
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Interactive DAW basics'
      }
    ]
  },
  {
    id: 'activity1',
    title: 'Activity 1 - Composition',
    subtitle: 'The School Beneath',
    icon: '🎵',
    color: 'purple',
    estimatedTime: 14, // Total minutes for this section
    stages: [
      { 
        id: 'activity-summary', 
        type: 'summary', 
        label: 'Show Activity Instructions',
        description: 'Display summary slide'
      },
      { 
        id: 'activity-intro', 
        type: 'video', 
        label: 'Play Activity Intro', 
        duration: 2,
        description: 'Introduction video'
      },
      { 
        id: 'school-summary', 
        type: 'summary', 
        label: 'Show Composition Instructions',
        description: 'Display composition requirements'
      },
      { 
        id: 'school-beneath', 
        type: 'activity', 
        label: 'Unlock School Beneath', 
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: 'Students compose music'
      }
    ]
  },
  {
    id: 'activity2',
    title: 'Activity 2 - Reflection',
    subtitle: 'Two Stars and a Wish',
    icon: '⭐',
    color: 'yellow',
    estimatedTime: 5,
    stages: [
      { 
        id: 'reflection-summary', 
        type: 'summary', 
        label: 'Show Reflection Instructions',
        description: 'Display reflection prompt'
      },
      { 
        id: 'reflection', 
        type: 'activity', 
        label: 'Unlock Reflection', 
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students complete reflection'
      }
    ]
  },
  {
    id: 'bonus',
    title: 'Bonus Activity',
    subtitle: 'Add Sound Effects',
    icon: '🎧',
    color: 'green',
    estimatedTime: 0, // Remaining time
    stages: [
      { 
        id: 'sound-effects', 
        type: 'bonus', 
        label: 'Unlock Bonus: Sound Effects',
        description: 'Add sound effects to composition'
      }
    ]
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    subtitle: 'Whole Group Discussion',
    icon: '👥',
    color: 'gray',
    estimatedTime: 2,
    stages: [
      {
        id: 'conclusion',
        type: 'discussion',
        label: 'Class Discussion',
        description: 'Wrap up lesson, review key concepts'
      }
    ]
  }
];

export const lesson1Config = {
  id: 'lesson1',
  title: "Introduction to the Digital Audio Workstation",
  learningObjectives: [
    "Master the DAW interface and basic controls",
    "Practice placing and manipulating music loops",
    "Create a mysterious film score using layering techniques"
  ],
  lessonSections, // ✅ Include lessonSections in the config
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