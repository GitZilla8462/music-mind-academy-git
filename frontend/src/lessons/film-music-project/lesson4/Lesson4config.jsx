// File: /lessons/film-music-project/lesson4/Lesson4config.jsx
// Lesson 4: Sports Highlight Reel Music - Rhythm & Beat Creation
// Students learn how to create rhythmic phrases that convey energy and intent

export const LESSON_PROGRESS_KEY = 'lesson4-progress';
export const LESSON_TIMER_KEY = 'lesson4-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook → Discussion',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'Sports Highlight Reel',
        description: 'Essential question: How do musicians create rhythmic phrases?',
        duration: 1
      },
      {
        id: 'show-agenda',
        type: 'summary',
        label: 'Agenda',
        description: 'Today: Learn, Build, Create.',
        duration: 1
      },
      {
        id: 'hook-intro',
        type: 'summary',
        label: 'What Makes Sports Music Intense?',
        description: 'Set up the comparison video.',
        duration: 1
      },
      {
        id: 'hook-video',
        type: 'demo',
        label: 'Sports Clip Comparison',
        description: 'VIDEO: Same clip with/without music.',
        duration: 3
      },
      {
        id: 'beat-discussion',
        type: 'summary',
        label: 'Beat Discussion',
        description: 'Discussion: How did the music create energy?',
        duration: 2
      }
    ]
  },
  {
    id: 'learn',
    title: '2. Learn',
    subtitle: 'Beat Basics → Demo',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      {
        id: 'beat-basics',
        type: 'summary',
        label: 'What is a Beat?',
        description: 'Rhythm, beat, measure, 4/4 time.',
        duration: 2
      },
      {
        id: 'drum-kit',
        type: 'summary',
        label: 'Three Core Drum Sounds',
        description: 'Kick, snare, hi-hat and their roles.',
        duration: 2
      },
      {
        id: 'beat-demo',
        type: 'demo',
        label: 'Building a Beat',
        description: 'DEMO: Layer kick → snare → hi-hat.',
        duration: 2
      },
      {
        id: 'energy-levels',
        type: 'summary',
        label: 'How Rhythm Creates Energy',
        description: 'More notes = more energy. Syncopation = excitement.',
        duration: 2
      }
    ]
  },
  {
    id: 'explore',
    title: '3. Explore',
    subtitle: 'Beat Maker Activity',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'beat-maker-intro',
        type: 'summary',
        label: 'Beat Maker Introduction',
        description: 'How to use the drum grid tool.',
        duration: 2
      },
      {
        id: 'beat-maker-activity',
        type: 'activity',
        label: 'Build Your Beat',
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Create a 4-bar beat pattern.',
        bonusDescription: 'Bonus: Try different patterns and tempos!'
      }
    ]
  },
  {
    id: 'create',
    title: '4. Create',
    subtitle: 'Sports Composition',
    color: 'blue',
    estimatedTime: 14,
    stages: [
      {
        id: 'composition-instructions',
        type: 'summary',
        label: 'Composition Requirements',
        description: 'Original beat + 3 loops, match sports energy.',
        duration: 1
      },
      {
        id: 'composition-reminder',
        type: 'summary',
        label: 'Remember',
        description: 'Beat = foundation. Loops = color.',
        duration: 1
      },
      {
        id: 'sports-composition',
        type: 'activity',
        label: 'Score the Sports Highlight',
        duration: 12,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Score sports video with beat + loops.',
        bonusDescription: 'Bonus: Build intensity as the action builds!'
      }
    ]
  },
  {
    id: 'reflect',
    title: '5. Reflect',
    subtitle: 'Two Stars and a Wish',
    color: 'blue',
    estimatedTime: 4,
    stages: [
      {
        id: 'reflection-instructions',
        type: 'summary',
        label: 'Two Stars and a Wish',
        description: 'Explain the reflection prompts.',
        duration: 1
      },
      {
        id: 'reflection-activity',
        type: 'activity',
        label: 'Reflection',
        duration: 3,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Complete Two Stars and a Wish reflection.',
        bonusDescription: 'Bonus: Play Name That Loop with a partner.'
      }
    ]
  },
  {
    id: 'conclusion',
    title: '6. Conclusion',
    subtitle: 'Share → Key Insight',
    color: 'blue',
    estimatedTime: 3,
    stages: [
      {
        id: 'quick-share',
        type: 'discussion',
        label: 'Quick Share',
        description: '2-3 students play 15 seconds for class.',
        duration: 2
      },
      {
        id: 'conclusion',
        type: 'discussion',
        label: 'Key Insight',
        description: 'Rhythm is the heartbeat of your music.',
        duration: 1
      }
    ]
  }
];

export const lesson4Config = {
  id: 'lesson2',
  lessonPath: '/lessons/film-music-project/lesson2',
  title: "Sports Highlight Reel",
  subtitle: "Rhythm & Beat Creation",
  learningObjectives: [
    "Explain the role of kick, snare, and hi-hat in creating a beat.",
    "Create an original 4-bar rhythmic pattern using a drum grid.",
    "Combine original beats with loops to score a sports video.",
    "Describe how rhythm creates energy and matches visual action."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "beat-maker",
      title: "Beat Maker",
      estimatedTime: "8 min"
    },
    {
      id: 2,
      type: "sports-composition-activity",
      title: "Sports Composition",
      estimatedTime: "12 min",
      includesVideoSelection: true
    },
    {
      id: 3,
      type: "two-stars-and-a-wish",
      title: "Two Stars and a Wish",
      estimatedTime: "3 min"
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
    description: 'Students enter session code to join.',
    type: 'waiting'
  },
  {
    id: 'welcome-intro',
    label: 'Sports Highlight Reel',
    description: 'Essential question: How do musicians create rhythmic phrases?',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/1.svg'
    }
  },
  {
    id: 'show-agenda',
    label: 'Agenda',
    description: 'Today: Learn, Build, Create.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/2.svg'
    }
  },
  {
    id: 'hook-intro',
    label: 'What Makes Sports Music Intense?',
    description: 'Set up the comparison video.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/3.svg'
    }
  },
  {
    id: 'hook-video',
    label: 'Sports Clip Comparison',
    description: 'VIDEO: Same clip with/without music.',
    type: 'demo',
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/4.svg'
    }
  },
  {
    id: 'beat-discussion',
    label: 'Beat Discussion',
    description: 'Discussion: How did the music create energy?',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/5.svg'
    }
  },
  {
    id: 'beat-basics',
    label: 'What is a Beat?',
    description: 'Rhythm, beat, measure, 4/4 time.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/6.svg'
    }
  },
  {
    id: 'drum-kit',
    label: 'Three Core Drum Sounds',
    description: 'Kick, snare, hi-hat and their roles.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/7.svg'
    }
  },
  {
    id: 'beat-demo',
    label: 'Building a Beat',
    description: 'DEMO: Layer kick → snare → hi-hat.',
    type: 'demo',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/8.svg'
    }
  },
  {
    id: 'energy-levels',
    label: 'How Rhythm Creates Energy',
    description: 'More notes = more energy. Syncopation = excitement.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/9.svg'
    }
  },
  {
    id: 'beat-maker-intro',
    label: 'Beat Maker Introduction',
    description: 'How to use the drum grid tool.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/10.svg'
    }
  },
  {
    id: 'beat-maker-activity',
    label: 'Build Your Beat',
    description: 'STUDENTS WORK: Create a 4-bar beat pattern.',
    bonusDescription: 'Bonus: Try different patterns and tempos!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/11.svg'
    }
  },
  {
    id: 'composition-instructions',
    label: 'Composition Requirements',
    description: 'Original beat + 3 loops, match sports energy.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/12.svg'
    }
  },
  {
    id: 'composition-reminder',
    label: 'Remember',
    description: 'Beat = foundation. Loops = color.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/13.svg'
    }
  },
  {
    id: 'sports-composition',
    label: 'Score the Sports Highlight',
    description: 'STUDENTS WORK: Score sports video with beat + loops.',
    bonusDescription: 'Bonus: Build intensity as the action builds!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 12,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/14.svg'
    }
  },
  {
    id: 'reflection-instructions',
    label: 'Two Stars and a Wish',
    description: 'Explain the reflection prompts.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/15.svg'
    }
  },
  {
    id: 'reflection-activity',
    label: 'Reflection',
    description: 'STUDENTS WORK: Complete Two Stars and a Wish reflection.',
    bonusDescription: 'Bonus: Play Name That Loop with a partner.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/16.svg'
    }
  },
  {
    id: 'quick-share',
    label: 'Quick Share',
    description: '2-3 students play 15 seconds for class.',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/17.svg'
    }
  },
  {
    id: 'conclusion',
    label: 'Key Insight',
    description: 'Rhythm is the heartbeat of your music.',
    type: 'discussion',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/17.svg'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'show-agenda': 'summary',
    'hook-intro': 'summary',
    'hook-video': 'demo',
    'beat-discussion': 'summary',
    'beat-basics': 'summary',
    'drum-kit': 'summary',
    'beat-demo': 'demo',
    'energy-levels': 'summary',
    'beat-maker-intro': 'summary',
    'beat-maker-activity': 'beat-maker',
    'composition-instructions': 'summary',
    'composition-reminder': 'summary',
    'sports-composition': 'sports-composition-activity',
    'reflection-instructions': 'summary',
    'reflection-activity': 'two-stars-and-a-wish',
    'quick-share': 'discussion',
    'conclusion': 'discussion'
  };
  return stageMap[stage];
};

// Drum kit components for the lesson
export const DRUM_KIT = [
  {
    id: 'kick',
    name: 'Kick Drum',
    description: 'Low, deep foundation',
    color: '#ef4444',
    beats: [1, 3],
    role: 'The heartbeat of the music'
  },
  {
    id: 'snare',
    name: 'Snare Drum',
    description: 'Sharp, cracking sound',
    color: '#f59e0b',
    beats: [2, 4],
    role: 'Creates the backbeat'
  },
  {
    id: 'hihat',
    name: 'Hi-Hat',
    description: 'Metallic, ticking sound',
    color: '#10b981',
    beats: [1, 2, 3, 4],
    role: 'Creates momentum'
  }
];
