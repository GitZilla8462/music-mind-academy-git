// File: /lessons/film-music-project/lesson4/Lesson4config.jsx
// Lesson 4: Chef's Soundtrack - Cooking Process Video
// Configuration for sectional loop form and composition

export const LESSON_PROGRESS_KEY = 'lesson4-progress';
export const LESSON_TIMER_KEY = 'lesson4-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: 'Introduction',
    subtitle: 'Song Form & Sectional Loops',
    icon: '🍳',
    color: 'yellow',
    estimatedTime: 12,
    stages: [
      { 
        id: 'kitchen-beats-intro', 
        type: 'summary', 
        label: "Chef's Soundtrack Introduction",
        description: 'Display welcome screen - Slide 1',
        duration: 1
      },
      { 
        id: 'show-agenda', 
        type: 'summary', 
        label: 'Show Agenda',
        description: 'Display lesson agenda - Slide 2',
        duration: 1
      },
      { 
        id: 'introduce-song-form', 
        type: 'summary', 
        label: 'Introduce Song Form',
        description: 'Introduction to song structure - Slide 3',
        duration: 1
      },
      { 
        id: 'form-continued', 
        type: 'summary', 
        label: 'Form Continued',
        description: 'More about song form - Slide 4',
        duration: 1
      },
      { 
        id: 'introduce-sectional-loop-form', 
        type: 'summary', 
        label: 'Introduce Sectional Loop Form',
        description: 'What is sectional loop form - Slide 5',
        duration: 1
      },
      { 
        id: 'sectional-loop-example', 
        type: 'summary', 
        label: 'Introduce Sectional Loop Form Example',
        description: 'Example of sectional loops - Slide 6',
        duration: 1
      },
      { 
        id: 'introduce-sectional-builder', 
        type: 'summary', 
        label: 'Introduce Sectional Loop Builder Game',
        description: 'Game instructions - Slide 7',
        duration: 1
      },
      { 
        id: 'sectional-loop-builder', 
        type: 'activity', 
        label: 'Unlock Sectional Loop Builder Game', 
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Interactive game - Game board coming to presentation.jsx soon',
        bonusDescription: 'Bonus: Try Advanced Patterns'
      }
    ]
  },
  {
    id: 'activity1',
    title: 'Activity 1 - Composition',
    subtitle: "Chef's Soundtrack Music",
    icon: '🎵',
    color: 'orange',
    estimatedTime: 18,
    stages: [
      { 
        id: 'composition-instructions', 
        type: 'summary', 
        label: 'Show Composition Instructions',
        description: 'Display requirements - Slide 8',
        duration: 1
      },
      { 
        id: 'composition-instructions-continued', 
        type: 'summary', 
        label: 'Composition Instructions Continued',
        description: 'More composition details - Slide 9',
        duration: 1
      },
      { 
        id: 'kitchen-composition', 
        type: 'activity', 
        label: 'Unlock Composition Activity', 
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: "Students compose chef's soundtrack music - Slide 10",
        bonusDescription: 'Bonus: Add More Sections'
      },
      { 
        id: 'reflection', 
        type: 'activity', 
        label: 'Two Stars and a Wish', 
        duration: 6,
        hasTimer: true,
        trackProgress: true,
        description: 'Students complete reflection',
        bonusDescription: 'Bonus: Share Your Work'
      }
    ]
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    subtitle: 'Class Discussion',
    icon: '💬',
    color: 'gray',
    estimatedTime: 2,
    stages: [
      {
        id: 'conclusion',
        type: 'discussion',
        label: 'Class Discussion',
        description: 'Review and wrap up - Slide 11',
        duration: 2
      }
    ]
  }
];

export const lesson4Config = {
  id: 'lesson4',
  title: "Chef's Soundtrack",
  subtitle: "Cooking Process Video - Sectional Loop Form",
  learningObjectives: [
    "Understand song form and structure",
    "Master sectional loop building",
    "Create music that evolves with cooking process"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "sectional-loop-builder",
      title: "Sectional Loop Builder Game",
      estimatedTime: "5 min"
    },
    {
      id: 2,
      type: "kitchen-composition-activity",
      title: "Compose Your Chef's Soundtrack",
      estimatedTime: "10 min",
      includesVideoSelection: true
    },
    {
      id: 3,
      type: "two-stars-wish",
      title: "Reflection Activity",
      estimatedTime: "6 min"
    }
  ]
};

// ========================================
// LESSON STAGES - With presentationView data for each stage
// ========================================
export const lessonStages = [
  { 
    id: 'locked', 
    label: 'Join with Class Code', 
    description: 'Students enter session code',
    type: 'waiting'
  },
  { 
    id: 'kitchen-beats-intro', 
    label: "Chef's Soundtrack Introduction", 
    description: 'Welcome screen - Slide 1',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/1.png'
    }
  },
  { 
    id: 'show-agenda', 
    label: 'Show Agenda', 
    description: 'Lesson agenda - Slide 2',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/2.png'
    }
  },
  { 
    id: 'introduce-song-form', 
    label: 'Introduce Song Form', 
    description: 'Introduction to song structure - Slide 3',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/3.png'
    }
  },
  { 
    id: 'form-continued', 
    label: 'Form Continued', 
    description: 'More about song form - Slide 4',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/4.png'
    }
  },
  { 
    id: 'introduce-sectional-loop-form', 
    label: 'Introduce Sectional Loop Form', 
    description: 'What is sectional loop form - Slide 5',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/5.png'
    }
  },
  { 
    id: 'sectional-loop-example', 
    label: 'Introduce Sectional Loop Form Example', 
    description: 'Example of sectional loops - Slide 6',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/6.png'
    }
  },
  { 
    id: 'introduce-sectional-builder', 
    label: 'Introduce Sectional Loop Builder Game', 
    description: 'Game instructions - Slide 7',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/7.png'
    }
  },
  { 
    id: 'sectional-loop-builder', 
    label: 'Unlock Sectional Loop Builder Game', 
    description: 'Interactive game - Game board coming soon',
    bonusDescription: 'Bonus: Try Advanced Patterns',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/7.png'  // Keep same slide during game
    }
  },
  { 
    id: 'composition-instructions', 
    label: 'Show Composition Instructions', 
    description: 'Display requirements - Slide 8',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/8.png'
    }
  },
  { 
    id: 'composition-instructions-continued', 
    label: 'Composition Instructions Continued', 
    description: 'More composition details - Slide 9',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/9.png'
    }
  },
  { 
    id: 'kitchen-composition', 
    label: 'Unlock Composition Activity', 
    description: "Compose chef's soundtrack music - Slide 10", 
    bonusDescription: 'Bonus: Add More Sections',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/10.png'
    }
  },
  { 
    id: 'reflection', 
    label: 'Two Stars and a Wish', 
    description: 'Students complete reflection', 
    bonusDescription: 'Bonus: Share Your Work',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 6,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/10.png'  // Keep composition slide during reflection
    }
  },
  {
    id: 'conclusion',
    label: 'Class Discussion',
    description: 'Wrap up lesson - Slide 11',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/11.png'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'kitchen-beats-intro': 'summary',
    'show-agenda': 'summary',
    'introduce-song-form': 'summary',
    'form-continued': 'summary',
    'introduce-sectional-loop-form': 'summary',
    'sectional-loop-example': 'summary',
    'introduce-sectional-builder': 'summary',
    'sectional-loop-builder': 'sectional-loop-builder',
    'composition-instructions': 'summary',
    'composition-instructions-continued': 'summary',
    'kitchen-composition': 'kitchen-composition-activity',
    'reflection': 'kitchen-composition-activity',  // Show composition during reflection
    'conclusion': 'discussion'
  };
  return stageMap[stage];
};