// File: /src/lessons/film-music-project/lesson4/Lesson4config.jsx
// Lesson 4: Epic Wildlife - Nature Documentary Video
// Configuration for sectional loop form and composition
// ✅ UPDATED: Renamed from "Chef's Soundtrack" to "Epic Wildlife"
// ✅ UPDATED: Added Sectional Loop Builder game with leaderboard + results

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
    icon: '🌍',
    color: 'green',
    estimatedTime: 12,
    stages: [
      { 
        id: 'epic-wildlife-intro', 
        type: 'summary', 
        label: "Epic Wildlife Introduction",
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
      }
    ]
  },
  {
    id: 'activity1',
    title: 'Activity 1 - Sectional Loop Builder',
    subtitle: 'Build the Wildlife Score',
    icon: '🎮',
    color: 'teal',
    estimatedTime: 10,
    stages: [
      { 
        id: 'introduce-sectional-builder', 
        type: 'summary', 
        label: 'Introduce Sectional Loop Builder Game',
        description: 'Game instructions - Slide 7',
        duration: 1
      },
      {
        id: 'sectional-loop-builder-demo',
        type: 'class-demo',
        label: 'Class Demo (on projector)',
        description: '3-question demo on projector - students watch',
        duration: 2
      },
      { 
        id: 'sectional-loop-builder', 
        type: 'activity', 
        label: 'Unlock Sectional Loop Builder Game', 
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students play individually - leaderboard on projector',
        bonusDescription: 'Safari: Find your classmates!'
      },
      {
        id: 'sectional-loop-builder-results',
        type: 'results',
        label: 'Show Game Results',
        description: 'Display winner podium on projector',
        duration: 1
      }
    ]
  },
  {
    id: 'activity2',
    title: 'Activity 2 - Composition',
    subtitle: "Epic Wildlife Soundtrack",
    icon: '🎵',
    color: 'blue',
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
        id: 'wildlife-composition', 
        type: 'activity', 
        label: 'Unlock Composition Activity', 
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: "Students compose wildlife soundtrack music - Slide 10",
        bonusDescription: 'Bonus: Add More Sections'
      }
    ]
  },
  {
    id: 'reflection',
    title: 'Reflection',
    subtitle: 'Two Stars and a Wish',
    icon: '⭐',
    color: 'amber',
    estimatedTime: 8,
    stages: [
      {
        id: 'reflection-instructions',
        type: 'summary',
        label: 'Reflection Instructions',
        description: 'Display reflection instructions - Slide 11',
        duration: 1
      },
      { 
        id: 'reflection', 
        type: 'activity', 
        label: 'Unlock Reflection Activity', 
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students complete Two Stars and a Wish - Slide 12',
        bonusDescription: 'Bonus: Share Your Work'
      }
    ]
  },
  {
    id: 'bonus',
    title: 'Bonus',
    subtitle: 'Monster Melody Maker',
    icon: '👾',
    color: 'purple',
    estimatedTime: 10,
    stages: [
      {
        id: 'bonus-intro',
        type: 'summary',
        label: 'Introduce Monster Melody Maker',
        description: 'Bonus activity introduction - Slide 13',
        duration: 1
      },
      {
        id: 'monster-melody-maker',
        type: 'activity',
        label: 'Unlock Monster Melody Maker',
        description: 'Students create loops and customize their monster',
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        bonusDescription: 'Make your monster dance!'
      }
    ]
  }
];

export const lesson4Config = {
  id: 'lesson4',
  title: "Epic Wildlife",
  subtitle: "Nature Documentary - Sectional Loop Form",
  learningObjectives: [
    "Understand song form and structure",
    "Master sectional loop building (Intro → A → A' → A → Outro)",
    "Create music that evolves with nature footage"
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
      type: "wildlife-composition-activity",
      title: "Compose Your Wildlife Soundtrack",
      estimatedTime: "10 min",
      includesVideoSelection: true
    },
    {
      id: 3,
      type: "two-stars-wish",
      title: "Reflection Activity",
      estimatedTime: "5 min"
    },
    {
      id: 4,
      type: "monster-melody-maker",
      title: "Monster Melody Maker",
      estimatedTime: "8 min"
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
  // Introduction
  { 
    id: 'epic-wildlife-intro', 
    label: "Epic Wildlife Introduction", 
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
  // Activity 1: Sectional Loop Builder Game
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
    id: 'sectional-loop-builder-demo',
    label: 'Class Demo (on projector)',
    description: '3-question demo - students watch main screen',
    type: 'class-demo',
    duration: 2,
    presentationView: {
      type: 'sectional-loop-builder-class-demo'
    }
  },
  { 
    id: 'sectional-loop-builder', 
    label: 'Unlock Sectional Loop Builder Game', 
    description: 'Students play individually - leaderboard on projector',
    bonusDescription: 'Safari: Find your classmates!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'sectional-loop-builder-leaderboard'
    }
  },
  {
    id: 'sectional-loop-builder-results',
    label: 'Show Game Results',
    description: 'Winner celebration podium',
    type: 'results',
    duration: 1,
    presentationView: {
      type: 'sectional-loop-builder-results'
    }
  },
  // Activity 2: Composition
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
    id: 'wildlife-composition', 
    label: 'Unlock Composition Activity', 
    description: "Compose wildlife soundtrack music - Slide 10", 
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
  // Reflection
  {
    id: 'reflection-instructions',
    label: 'Reflection Instructions',
    description: 'Display reflection instructions - Slide 11',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/11.png'
    }
  },
  { 
    id: 'reflection', 
    label: 'Unlock Reflection Activity', 
    description: 'Students complete Two Stars and a Wish', 
    bonusDescription: 'Bonus: Share Your Work',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/12.png'
    }
  },
  // Bonus
  {
    id: 'bonus-intro',
    label: 'Introduce Monster Melody Maker',
    description: 'Bonus activity introduction - Slide 13',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/13.png'
    }
  },
  {
    id: 'monster-melody-maker',
    label: 'Unlock Monster Melody Maker',
    description: 'Students create loops and customize their monster',
    bonusDescription: 'Make your monster dance!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/14.png'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'epic-wildlife-intro': 'summary',
    'kitchen-beats-intro': 'summary',  // backward compatibility
    'show-agenda': 'summary',
    'introduce-song-form': 'summary',
    'form-continued': 'summary',
    'introduce-sectional-loop-form': 'summary',
    'sectional-loop-example': 'summary',
    'introduce-sectional-builder': 'summary',
    'sectional-loop-builder-demo': 'class-demo',
    'sectional-loop-builder': 'sectional-loop-builder',
    'sectional-loop-builder-results': 'results',
    'composition-instructions': 'summary',
    'composition-instructions-continued': 'summary',
    'wildlife-composition': 'wildlife-composition-activity',
    'kitchen-composition': 'wildlife-composition-activity',  // backward compatibility
    'reflection-instructions': 'summary',
    'reflection': 'two-stars-wish',
    'bonus-intro': 'summary',
    'bonus-challenges': 'summary',  // backward compatibility
    'monster-melody-maker': 'monster-melody-maker'
  };
  return stageMap[stage];
};