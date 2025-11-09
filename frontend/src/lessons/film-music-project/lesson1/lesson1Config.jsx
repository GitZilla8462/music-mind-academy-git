// File: /lessons/film-music-project/lesson1/lesson1Config.js
// Lesson 1 configuration - UPDATED with image slides

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
    icon: 'ðŸŽ¬',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      { 
        id: 'welcome-instructions', 
        type: 'summary', 
        label: 'Show Welcome Instructions',
        description: 'Display welcome screen',
        duration: 1
      },
      { 
        id: 'intro-summary', 
        type: 'summary', 
        label: 'Show Agenda',
        description: 'Display lesson agenda',
        duration: 1
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
        description: 'Display DAW tutorial summary',
        duration: 1
      },
      { 
        id: 'daw-tutorial', 
        type: 'activity', 
        label: 'Unlock DAW Tutorial', 
        duration: 4,
        hasTimer: true,
        trackProgress: true,
        description: 'Interactive DAW basics',
        bonusDescription: 'Bonus Activity: Explore the DAW'
      }
    ]
  },
  {
    id: 'activity1',
    title: 'Activity 1 - Composition',
    subtitle: 'The School Beneath',
    icon: 'ðŸŽµ',
    color: 'purple',
    estimatedTime: 12,
    stages: [
      { 
        id: 'activity-summary', 
        type: 'summary', 
        label: 'Show Activity Instructions',
        description: 'Display summary slide',
        duration: 1
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
        description: 'Display composition requirements',
        duration: 1
      },
      { 
        id: 'school-beneath', 
        type: 'activity', 
        label: 'Unlock School Beneath', 
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        description: 'Students compose music',
        bonusDescription: 'Bonus Activity: Adding Sound Effects'
      }
    ]
  },
  {
    id: 'activity2',
    title: 'Activity 2 - Reflection',
    subtitle: 'Two Stars and a Wish',
    icon: 'â­',
    color: 'yellow',
    estimatedTime: 10,
    stages: [
      { 
        id: 'reflection', 
        type: 'activity', 
        label: 'Unlock Reflection', 
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: 'Students complete reflection',
        bonusDescription: 'Bonus Activity: Guess the Loop with a Friend Game'
      }
    ]
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    subtitle: 'Whole Group Discussion',
    icon: 'ðŸ‘¥',
    color: 'gray',
    estimatedTime: 2,
    stages: [
      {
        id: 'conclusion',
        type: 'discussion',
        label: 'Class Discussion',
        description: 'Wrap up lesson, review key concepts',
        duration: 2
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
  lessonSections,
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
      estimatedTime: "4 min"
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
      estimatedTime: "8 min"
    },
    {
      id: 5,
      type: "two-stars-wish",
      title: "Reflection Activity",
      estimatedTime: "5 min"
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
    id: 'welcome-instructions', 
    label: 'Show Welcome Instructions', 
    description: 'Welcome screen',
    type: 'summary',
    content: 'introVideo',
    duration: 1
  },
  { 
    id: 'intro-summary', 
    label: 'Show Agenda', 
    description: 'Lesson agenda',
    type: 'summary',
    content: 'introVideo',
    duration: 1
  },
  { 
    id: 'intro-video', 
    label: 'Play Introduction Video', 
    description: 'Lesson intro video', 
    hasProgress: false,
    type: 'video',
    duration: 3
  },
  { 
    id: 'daw-summary', 
    label: 'Show DAW Instructions', 
    description: 'DAW tutorial summary',
    type: 'summary',
    content: 'dawTutorial',
    duration: 1
  },
  { 
    id: 'daw-tutorial', 
    label: 'Unlock DAW Tutorial', 
    description: 'Interactive DAW basics',
    bonusDescription: 'Bonus Activity: Explore the DAW',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 4
  },
  { 
    id: 'activity-summary', 
    label: 'Show Activity Instructions', 
    description: 'Activity intro summary',
    type: 'summary',
    content: 'activityIntro',
    duration: 1
  },
  { 
    id: 'activity-intro', 
    label: 'Play Activity Introduction', 
    description: 'Activity introduction video', 
    hasProgress: false,
    type: 'video',
    duration: 2
  },
  { 
    id: 'school-summary', 
    label: 'Show Composition Instructions', 
    description: 'School Beneath summary',
    type: 'summary',
    content: 'schoolBeneath',
    duration: 1
  },
  { 
    id: 'school-beneath', 
    label: 'Unlock School Beneath', 
    description: 'The School Beneath composition', 
    bonusDescription: 'Bonus Activity: Adding Sound Effects',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8
  },
  { 
    id: 'reflection', 
    label: 'Unlock Reflection', 
    description: 'Two Stars and a Wish', 
    bonusDescription: 'Bonus Activity: Guess the Loop with a Friend Game',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10
  },
  {
    id: 'conclusion',
    label: 'Class Discussion',
    description: 'Wrap up lesson',
    type: 'discussion',
    duration: 2
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-instructions': 'summary',
    'intro-summary': 'summary',
    'intro-video': 'video',
    'daw-summary': 'summary',
    'daw-tutorial': 'daw-tutorial',
    'activity-summary': 'summary',
    'activity-intro': 'video',
    'school-summary': 'summary',
    'school-beneath': 'school-beneath-activity',
    'reflection-summary': 'summary',
    'reflection': 'two-stars-wish'
  };
  return stageMap[stage];
};