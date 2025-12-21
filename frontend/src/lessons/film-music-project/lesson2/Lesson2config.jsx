// File: /lessons/film-music-project/lesson2/Lesson2config.jsx
// Lesson 2: Sports Highlight Reel Music - Configuration
// ✅ UPDATED: Better teacher descriptions for control panel

export const LESSON_PROGRESS_KEY = 'lesson2-progress';
export const LESSON_TIMER_KEY = 'lesson2-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Slides → DAW Tutorial',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      { 
        id: 'sports-highlight-intro', 
        type: 'summary', 
        label: 'Sports Highlight Reel',
        description: 'Ask: "What sport do you like? What music goes with it?"',
        duration: 1
      },
      { 
        id: 'show-agenda', 
        type: 'summary', 
        label: 'Agenda',
        description: 'Review: "1) Learn about DAW, 2) Create sports composition"',
        duration: 1
      },
      { 
        id: 'introduce-daw', 
        type: 'summary', 
        label: 'Digital Audio Workstation',
        description: 'Explain: "DAW = software for recording, editing, mixing audio"',
        duration: 1
      },
      { 
        id: 'introduce-daw-challenge', 
        type: 'summary', 
        label: 'DAW Challenge Preview',
        description: 'Preview: "You\'ll click buttons to learn the DAW"',
        duration: 1
      },
      {
        id: 'daw-tutorial',
        type: 'activity',
        label: '🎮 Unlock DAW Challenge',
        duration: 6,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Answer questions, click every button to learn DAW',
        bonusDescription: 'Bonus: Explore & experiment with the DAW'
      }
    ]
  },
  {
    id: 'activity1',
    title: '2. Sports Highlight Composition',
    subtitle: 'Slides → Compose',
    color: 'blue',
    estimatedTime: 15,
    stages: [
      { 
        id: 'introduce-video', 
        type: 'summary', 
        label: 'Composition Tutorial',
        description: 'Announce: "Next we\'ll watch a 2-min video on getting started"',
        duration: 1
      },
      { 
        id: 'sports-video', 
        type: 'video', 
        label: '▶️ Play Video',
        description: 'PLAY VIDEO: Sports composition tutorial (students watch main screen)',
        duration: 3
      },
      { 
        id: 'composition-instructions', 
        type: 'summary', 
        label: 'Composition Requirements',
        description: 'Review: "5+ loops, line up edges, same mood. Bonus: sound effects"',
        duration: 1
      },
      { 
        id: 'sports-composition', 
        type: 'activity', 
        label: '🎮 Unlock Composition', 
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Pick sport video, think about mood, compose music',
        bonusDescription: 'Bonus: Add more layers and sound effects'
      }
    ]
  },
  {
    id: 'activity2',
    title: '3. Reflection and Game',
    subtitle: 'Reflect → Bonus Game',
    color: 'blue',
    estimatedTime: 12,
    stages: [
      {
        id: 'reflection',
        type: 'activity',
        label: '🎮 Unlock Reflection',
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: 2 things well + 1 to improve, fill out form, share',
        bonusDescription: 'Bonus: Layer Detective with a partner'
      },
      {
        id: 'melody-escape-room',
        type: 'activity',
        label: '🔐 Melody Escape Room (Bonus)',
        duration: 7,
        hasTimer: true,
        trackProgress: true,
        isBonus: true,
        description: 'BONUS: Partner game - create & solve instrument puzzles',
        bonusDescription: 'Create multiple rooms and challenge the class!'
      }
    ]
  },
  {
    id: 'conclusion',
    title: '4. Conclusion',
    subtitle: 'Discuss',
    color: 'blue',
    estimatedTime: 2,
    stages: [
      {
        id: 'conclusion',
        type: 'discussion',
        label: 'Class Discussion',
        description: 'Ask: "What is a DAW? Partner\'s sport? How many layers? 6+?"',
        duration: 2
      }
    ]
  }
];

export const lesson2Config = {
  id: 'lesson2',
  lessonPath: '/lessons/film-music-project/lesson2',
  title: "Sports Highlight Reel Music",
  subtitle: "Introduction to the DAW",
  learningObjectives: [
    "Master the DAW interface and basic controls",
    "Create high-energy music for sports highlights",
    "Practice placing and manipulating music loops"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "daw-tutorial",
      title: "DAW Challenge",
      estimatedTime: "6 min"
    },
    {
      id: 2,
      type: "video",
      title: "Sports Composition Video",
      estimatedTime: "3 min",
      src: "/lessons/film-music-project/lesson2/SportsHighlightComposition.mp4"
    },
    {
      id: 3,
      type: "sports-composition-activity",
      title: "Compose Your Sports Music",
      estimatedTime: "10 min",
      includesVideoSelection: true
    },
    {
      id: 4,
      type: "two-stars-wish",
      title: "Reflection Activity",
      estimatedTime: "5 min"
    },
    {
      id: 5,
      type: "melody-escape-room",
      title: "Melody Escape Room (Bonus)",
      estimatedTime: "7 min",
      isBonus: true
    }
  ]
};

// ========================================
// LESSON STAGES - With presentationView data for each stage
// ========================================
export const lessonStages = [
  { 
    id: 'join-code', 
    label: 'Join Code Screen', 
    description: 'Students enter session code to join',
    type: 'waiting'
  },
  { 
    id: 'sports-highlight-intro', 
    label: 'Sports Highlight Reel', 
    description: 'Ask: "What sport do you like? What music goes with it?"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/1.png'
    }
  },
  { 
    id: 'show-agenda', 
    label: 'Agenda', 
    description: 'Review: "1) Learn about DAW, 2) Create sports composition"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/2.png'
    }
  },
  { 
    id: 'introduce-daw', 
    label: 'Digital Audio Workstation', 
    description: 'Explain: "DAW = software for recording, editing, mixing audio"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/3.png'
    }
  },
  { 
    id: 'introduce-daw-challenge', 
    label: 'DAW Challenge Preview', 
    description: 'Preview: "You\'ll click buttons to learn the DAW"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/4.png'
    }
  },
  {
    id: 'daw-tutorial',
    label: '🎮 Unlock DAW Challenge',
    description: 'STUDENTS WORK: Answer questions, click every button to learn DAW',
    bonusDescription: 'Bonus: Explore & experiment with the DAW',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 6,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/5.png'
    }
  },
  {
    id: 'introduce-video', 
    label: 'Composition Tutorial', 
    description: 'Announce: "Next we\'ll watch a 2-min video on getting started"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/6.png'
    }
  },
  { 
    id: 'sports-video', 
    label: '▶️ Play Video', 
    description: 'PLAY VIDEO: Sports composition tutorial (students watch main screen)', 
    type: 'video',
    duration: 3,
    presentationView: {
      type: 'video',
      videoPath: '/lessons/film-music-project/lesson2/SportsHighlightComposition.mp4',
      title: 'Sports Composition Introduction'
    }
  },
  { 
    id: 'composition-instructions', 
    label: 'Composition Requirements', 
    description: 'Review: "5+ loops, line up edges, same mood. Bonus: sound effects"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/7.png'
    }
  },
  { 
    id: 'sports-composition', 
    label: '🎮 Unlock Composition', 
    description: 'STUDENTS WORK: Pick sport video, think about mood, compose music', 
    bonusDescription: 'Bonus: Add more layers and sound effects',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/8.png'
    }
  },
  {
    id: 'reflection',
    label: '🎮 Unlock Reflection',
    description: 'STUDENTS WORK: 2 things well + 1 to improve, fill out form, share',
    bonusDescription: 'Bonus: Layer Detective with a partner',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/9.png'
    }
  },
  {
    id: 'melody-escape-room',
    label: '🔐 Melody Escape Room (Bonus)',
    description: 'BONUS: Partner game - create & solve instrument puzzles',
    bonusDescription: 'Create multiple rooms and challenge the class!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 7,
    isBonus: true,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/9.png'
    }
  },
  {
    id: 'conclusion',
    label: 'Class Discussion',
    description: 'Ask: "What is a DAW? Partner\'s sport? How many layers? 6+?"',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/10.png'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'sports-highlight-intro': 'summary',
    'show-agenda': 'summary',
    'introduce-daw': 'summary',
    'introduce-daw-challenge': 'summary',
    'daw-tutorial': 'daw-tutorial',
    'introduce-video': 'summary',
    'sports-video': 'video',
    'composition-instructions': 'summary',
    'sports-composition': 'sports-composition-activity',
    'reflection': 'sports-composition-activity',
    'melody-escape-room': 'melody-escape-room',
    'conclusion': 'discussion'
  };
  return stageMap[stage];
};