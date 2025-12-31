// File: /src/lessons/film-music-project/lesson3/Lesson3config.jsx
// Lesson 3: Epic Wildlife - Nature Documentary Video
// Configuration for sectional loop form and composition
// ✅ UPDATED: Renamed from "Chef's Soundtrack" to "Epic Wildlife"
// ✅ UPDATED: Added Sectional Loop Builder game with leaderboard + results

export const LESSON_PROGRESS_KEY = 'lesson3-progress';
export const LESSON_TIMER_KEY = 'lesson3-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Epic Wildlife & Song Form',
    icon: '🌍',
    color: 'green',
    estimatedTime: 5,
    stages: [
      {
        id: 'epic-wildlife-intro',
        type: 'summary',
        label: "Epic Wildlife Introduction",
        description: 'Display welcome screen - Slide 1'
      },
      {
        id: 'show-agenda',
        type: 'summary',
        label: 'Show Agenda',
        description: 'Display lesson agenda - Slide 2'
      },
      {
        id: 'introduce-song-form',
        type: 'summary',
        label: 'Introduce Song Form',
        description: 'Introduction to song structure - Slide 3'
      }
    ]
  },
  {
    id: 'listening-map-section',
    title: '2. Listening Map',
    subtitle: 'Video → Draw',
    icon: '🎨',
    color: 'yellow',
    estimatedTime: 14,
    stages: [
      {
        id: 'introduce-listening-map',
        type: 'summary',
        label: 'Listening Map Intro',
        description: 'Explain: "A listening map is a visual guide that shows song form"',
        duration: 1
      },
      {
        id: 'listening-map-video',
        type: 'video',
        label: '▶️ Play Video',
        description: 'PLAY VIDEO: Listening Map explanation (students watch main screen)',
        duration: 2
      },
      {
        id: 'music-for-listening-map',
        type: 'summary',
        label: 'Music For Listening Map',
        description: 'Introduce: "Spring by Vivaldi - listen for violin imitating birds"',
        duration: 1
      },
      {
        id: 'listening-map',
        type: 'activity',
        label: '🎮 Unlock Listening Map',
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Create 4 rows, unique style per row',
        bonusDescription: 'Bonus: Add more colors, textures, and pictures'
      },
      {
        id: 'share-and-pair',
        type: 'summary',
        label: 'Share and Pair',
        description: 'Partner activity: Share work and discuss what inspired your choices',
        duration: 2
      }
    ]
  },
  {
    id: 'sectional-loop-form',
    title: '3. Sectional Loop Form',
    subtitle: 'Form & Structure',
    icon: '🎵',
    color: 'teal',
    estimatedTime: 5,
    stages: [
      {
        id: 'form-continued',
        type: 'summary',
        label: 'Form Continued',
        description: 'More about song form - Slide 4'
      },
      {
        id: 'introduce-sectional-loop-form',
        type: 'summary',
        label: 'Introduce Sectional Loop Form',
        description: 'What is sectional loop form - Slide 5'
      },
      {
        id: 'sectional-loop-example',
        type: 'summary',
        label: 'Sectional Loop Form Example',
        description: 'Example of sectional loops - Slide 6'
      }
    ]
  },
  {
    id: 'activity1',
    title: '4. Sectional Loop Builder',
    subtitle: 'Build the Wildlife Score',
    icon: '🎮',
    color: 'purple',
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
        id: 'sectional-loop-builder',
        type: 'activity',
        label: '🎮 Unlock Sectional Loop Builder Game',
        duration: 5,
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
    title: '5. Composition',
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
        label: '🎮 Unlock Composition',
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
    title: '6. Reflection',
    subtitle: 'Two Stars and a Wish',
    icon: '⭐',
    color: 'amber',
    estimatedTime: 8,
    stages: [
      {
        id: 'reflection-instructions',
        type: 'summary',
        label: 'Two Stars and a Wish',
        description: 'Explain the reflection prompts - Slide 11',
        duration: 1
      },
      {
        id: 'reflection',
        type: 'activity',
        label: '🎮 Unlock Reflection',
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students complete Two Stars and a Wish - Slide 12',
        bonusDescription: 'Bonus: Share Your Work'
      }
    ]
  }
];

export const lesson3Config = {
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
      type: "listening-map",
      title: "Listening Map",
      estimatedTime: "8 min"
    },
    {
      id: 2,
      type: "sectional-loop-builder",
      title: "Sectional Loop Builder Game",
      estimatedTime: "5 min"
    },
    {
      id: 3,
      type: "wildlife-composition-activity",
      title: "Compose Your Wildlife Soundtrack",
      estimatedTime: "10 min",
      includesVideoSelection: true
    },
    {
      id: 4,
      type: "two-stars-wish",
      title: "Reflection Activity",
      estimatedTime: "5 min"
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
      slidePath: '/lessons/film-music-project/lesson3/slides/1.png'
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
      slidePath: '/lessons/film-music-project/lesson3/slides/2.png'
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
      slidePath: '/lessons/film-music-project/lesson3/slides/3.png'
    }
  },
  // Listening Map Section
  {
    id: 'introduce-listening-map',
    label: 'Listening Map Intro',
    description: 'Explain: "A listening map is a visual guide that shows song form"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/3.5.svg'
    }
  },
  {
    id: 'listening-map-video',
    label: '▶️ Play Video',
    description: 'PLAY VIDEO: Listening Map explanation (students watch main screen)',
    type: 'video',
    duration: 2,
    presentationView: {
      type: 'video',
      videoPath: '/lessons/film-music-project/lesson2/ListeningMapExplanation.mp4',
      title: 'Listening Map Explanation'
    }
  },
  {
    id: 'music-for-listening-map',
    label: 'Music For Listening Map',
    description: 'Introduce: "Spring by Vivaldi - listen for violin imitating birds"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/6.7.svg'
    }
  },
  {
    id: 'listening-map',
    label: '🎮 Unlock Listening Map',
    description: 'STUDENTS WORK: Create 4 rows, unique style per row',
    bonusDescription: 'Bonus: Add more colors, textures, and pictures',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/6.5.svg'
    }
  },
  {
    id: 'share-and-pair',
    label: 'Share and Pair',
    description: 'Partner activity: Share work and discuss what inspired your choices',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/6.6.svg'
    }
  },
  // Sectional Loop Form Section
  {
    id: 'form-continued',
    label: 'Form Continued',
    description: 'More about song form - Slide 4',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/4.png'
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
      slidePath: '/lessons/film-music-project/lesson3/slides/5.png'
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
      slidePath: '/lessons/film-music-project/lesson3/slides/6.png'
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
      slidePath: '/lessons/film-music-project/lesson3/slides/7.png'
    }
  },
  {
    id: 'sectional-loop-builder',
    label: '🎮 Unlock Sectional Loop Builder Game',
    description: 'Students play individually - leaderboard on projector',
    bonusDescription: 'Safari: Find your classmates!',
    hasProgress: true,
    type: 'activity',
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
      slidePath: '/lessons/film-music-project/lesson3/slides/8.png'
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
      slidePath: '/lessons/film-music-project/lesson3/slides/9.png'
    }
  },
  {
    id: 'wildlife-composition',
    label: '🎮 Unlock Composition',
    description: "Compose wildlife soundtrack music - Slide 10",
    bonusDescription: 'Bonus: Add More Sections',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/10.svg'
    }
  },
  // Reflection
  {
    id: 'reflection-instructions',
    label: 'Two Stars and a Wish',
    description: 'Explain the reflection prompts - Slide 11',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/11.svg'
    }
  },
  {
    id: 'reflection',
    label: '🎮 Unlock Reflection',
    description: 'Students complete Two Stars and a Wish',
    bonusDescription: 'Bonus: Share Your Work',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/12.svg'
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
    'introduce-listening-map': 'summary',
    'listening-map-video': 'video',
    'music-for-listening-map': 'summary',
    'listening-map': 'listening-map',
    'share-and-pair': 'summary',
    'form-continued': 'summary',
    'introduce-sectional-loop-form': 'summary',
    'sectional-loop-example': 'summary',
    'introduce-sectional-builder': 'summary',
    'sectional-loop-builder': 'sectional-loop-builder',
    'sectional-loop-builder-results': 'results',
    'composition-instructions': 'summary',
    'composition-instructions-continued': 'summary',
    'wildlife-composition': 'wildlife-composition-activity',
    'kitchen-composition': 'wildlife-composition-activity',  // backward compatibility
    'reflection-instructions': 'summary',
    'reflection': 'two-stars-wish'
  };
  return stageMap[stage];
};