// File: /lessons/film-music-project/lesson4/Lesson4config.jsx
// Lesson 4: Sports Highlight Reel Music - Rhythm & Beat Creation
// STREAMLINED: Reduced from 18 stages to 11 stages for tighter flow

export const LESSON_PROGRESS_KEY = 'lesson4-progress';
export const LESSON_TIMER_KEY = 'lesson4-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Hook',
    subtitle: 'Video Comparison',
    color: 'blue',
    estimatedTime: 6,
    stages: [
      {
        id: 'welcome-agenda',
        type: 'summary',
        label: 'Sports Highlight Reel',
        description: 'Welcome + Today\'s agenda',
        duration: 1
      },
      {
        id: 'video-hook',
        type: 'demo',
        label: 'No Music vs With Music',
        description: 'Compare the same video with and without music',
        duration: 3
      },
      {
        id: 'hook-discussion',
        type: 'discussion',
        label: 'What Did You Notice?',
        description: 'How did the music change how you felt?',
        duration: 2
      }
    ]
  },
  {
    id: 'learn-create',
    title: '2. Learn & Create Beat',
    subtitle: 'Beat Basics + Activity',
    color: 'green',
    estimatedTime: 14,
    stages: [
      {
        id: 'beat-basics',
        type: 'summary',
        label: 'What is a Beat?',
        description: 'Beat, measure, kick, snare, hi-hat',
        duration: 3
      },
      {
        id: 'bpm-basics',
        type: 'summary',
        label: 'What is BPM?',
        description: 'Beats per minute and why loops sync',
        duration: 2
      },
      {
        id: 'beat-demo',
        type: 'demo',
        label: 'Building a Beat',
        description: 'Teacher demo: Layer kick → snare → hi-hat',
        duration: 2
      },
      {
        id: 'beat-maker-instructions',
        type: 'summary',
        label: 'Build Your Beat Instructions',
        description: 'Explain how to use the beat maker',
        duration: 1
      },
      {
        id: 'beat-maker-activity',
        type: 'activity',
        label: '🎮 Unlock Build Your Beat',
        description: 'Create a beat using the drum grid',
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        bonusDescription: 'Try different patterns and kits!'
      }
    ]
  },
  {
    id: 'create',
    title: '3. Compose',
    subtitle: 'Score the Video',
    color: 'orange',
    estimatedTime: 13,
    stages: [
      {
        id: 'composition-instructions',
        type: 'summary',
        label: 'Composition Requirements',
        description: 'Beat + 3 loops, match the energy',
        duration: 1
      },
      {
        id: 'sports-composition',
        type: 'activity',
        label: '🎮 Unlock Score the Sports Highlight',
        description: 'Combine your beat with loops',
        duration: 12,
        hasTimer: true,
        trackProgress: true,
        bonusDescription: 'Build intensity as the action builds!'
      }
    ]
  },
  {
    id: 'reflect-wrapup',
    title: '4. Reflect & Wrap Up',
    subtitle: 'Beat Spotlight + Conclusion',
    color: 'teal',
    estimatedTime: 5,
    stages: [
      {
        id: 'reflection-instructions',
        type: 'summary',
        label: 'Reflection Time',
        description: 'Introduce the reflection activity.',
        duration: 1
      },
      {
        id: 'reflection-activity',
        type: 'activity',
        label: '🎮 Unlock Reflection',
        description: 'STUDENTS WORK: Complete reflection activity.',
        duration: 5,
        hasTimer: true,
        trackProgress: true
      },
      {
        id: 'conclusion',
        type: 'summary',
        label: 'Key Insight',
        description: 'Rhythm is the heartbeat of your music',
        duration: 1
      }
    ]
  },
  {
    id: 'bonus',
    title: 'Bonus-Beat Escape Room',
    subtitle: 'Solo or Partner Activity',
    color: 'pink',
    estimatedTime: 10,
    isBonus: true,
    stages: [
      {
        id: 'beat-escape-room',
        type: 'activity',
        label: '🎮 Unlock Beat Escape Room',
        description: 'Partner activity: Create and solve beat puzzles',
        duration: 10,
        hasTimer: true,
        trackProgress: true
      }
    ]
  }
];

export const lesson4Config = {
  id: 'lesson4',
  lessonPath: '/lessons/film-music-project/lesson4',
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
      type: "student-beat-maker",
      title: "Build Your Beat",
      estimatedTime: "8 min"
    },
    {
      id: 2,
      type: "beat-escape-room",
      title: "Beat Escape Room",
      estimatedTime: "10 min",
      isBonus: true,
      description: "Partner activity: Create and solve beat puzzles"
    },
    {
      id: 3,
      type: "sports-composition-activity",
      title: "Sports Composition",
      estimatedTime: "12 min",
      includesVideoSelection: true
    },
    {
      id: 4,
      type: "two-stars-and-a-wish",
      title: "Beat Spotlight",
      estimatedTime: "3 min",
      activityId: "fm-lesson4-reflection"
    }
  ]
};

// ========================================
// LESSON STAGES - With presentationView data for each stage
// STREAMLINED: 11 stages total (down from 18)
// ========================================
export const lessonStages = [
  {
    id: 'join-code',
    label: 'Join Code Screen',
    description: 'Students enter session code to join.',
    type: 'waiting'
  },
  {
    id: 'welcome-agenda',
    label: 'Sports Highlight Reel',
    description: 'Welcome + Agenda',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/1-welcome.svg'
    }
  },
  {
    id: 'video-hook',
    label: 'No Music vs With Music',
    description: 'Compare the same video with and without music',
    type: 'demo',
    duration: 3,
    presentationView: {
      type: 'video-comparison'
      // This tells the component to show the video with toggle buttons
    }
  },
  {
    id: 'hook-discussion',
    label: 'What Did You Notice?',
    description: 'Discussion: How did the music change how you felt?',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/2-discussion.svg'
    }
  },
  {
    id: 'beat-basics',
    label: 'What is a Beat?',
    description: 'Beat, measure, and the three core drum sounds',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/3-beat-basics.svg'
    }
  },
  {
    id: 'bpm-basics',
    label: 'What is BPM?',
    description: 'Beats per minute and why loops sync up',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/3b-bpm-basics.svg'
    }
  },
  {
    id: 'beat-demo',
    label: 'Building a Beat',
    description: 'Teacher demo: Layer kick → snare → hi-hat → open hi-hat',
    type: 'demo',
    duration: 2,
    presentationView: {
      type: 'beat-maker-demo'
      // Teacher uses live beat maker tool
    }
  },
  {
    id: 'beat-maker-instructions',
    label: 'Build Your Beat Instructions',
    description: 'Explain how to use the beat maker',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/4-beat-instructions.svg'
    }
  },
  {
    id: 'beat-maker-activity',
    label: '🎮 Unlock Build Your Beat',
    description: 'Students create a beat using the drum grid',
    bonusDescription: 'Try different patterns and kits!',
    type: 'activity',
    hasTimer: true,
    hasProgress: true,
    trackProgress: true,
    duration: 8,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/4-activity-beat.svg'
    }
  },
  {
    id: 'composition-instructions',
    label: 'Composition Requirements',
    description: 'Your beat + 3 loops, match the energy',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/5-composition-instructions.svg'
    }
  },
  {
    id: 'sports-composition',
    label: '🎮 Unlock Score the Sports Highlight',
    description: 'Combine your beat with loops to score the video',
    bonusDescription: 'Build intensity as the action builds!',
    type: 'activity',
    hasTimer: true,
    hasProgress: true,
    trackProgress: true,
    duration: 12,
    presentationView: {
      type: 'composition-workspace',
      title: 'Sports Highlights',
      instruction: 'Combine your beat with loops to score the video.',
      bonusTip: 'Build intensity as the action builds!',
      videos: [
        { emoji: '⚽', title: 'Soccer', path: '/lessons/film-music-project/lesson4/SoccerHighlightReel.mp4' },
        { emoji: '🏀', title: 'Basketball', path: '/lessons/film-music-project/lesson4/BasketballHighlightReel.mp4' },
        { emoji: '🛹', title: 'Skateboarding', path: '/lessons/film-music-project/lesson4/SkateboardHighlighReel.mp4' }
      ]
    }
  },
  {
    id: 'reflection-instructions',
    label: 'Reflection Time',
    description: 'Introduce the reflection activity.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/7-reflection-instructions.svg'
    }
  },
  {
    id: 'reflection-activity',
    label: '🎮 Unlock Reflection',
    description: 'STUDENTS WORK: Complete reflection activity.',
    bonusDescription: 'Bonus: Name That Loop with a partner',
    type: 'activity',
    hasTimer: true,
    hasProgress: true,
    trackProgress: true,
    duration: 5,
    presentationView: {
      type: 'activity-slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/7-reflection-instructions.svg'
    }
  },
  {
    id: 'conclusion',
    label: 'Key Insight',
    description: 'Rhythm is the heartbeat of your music',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/8-conclusion.svg'
    }
  },
  // BONUS: Beat Escape Room (at end so it doesn't interrupt main flow)
  {
    id: 'beat-escape-room',
    label: '🎮 Unlock Beat Escape Room',
    description: 'Solo or partner activity: Create beat puzzles for others to solve',
    bonusDescription: 'Create a beat puzzle, then give your device to a friend to play!',
    type: 'activity',
    hasTimer: true,
    hasProgress: true,
    trackProgress: true,
    isBonus: true,
    duration: 10,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson4/slides/9-beat-escape-room-intro.svg'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-agenda': 'summary',
    'video-hook': 'demo',
    'hook-discussion': 'discussion',
    'beat-basics': 'summary',
    'bpm-basics': 'summary',
    'beat-demo': 'beat-maker-demo',  // Teacher demo of beat maker
    'beat-maker-instructions': 'summary',
    'beat-maker-activity': 'student-beat-maker',  // Student beat creation
    'beat-escape-room': 'beat-escape-room',  // Partner beat puzzle activity
    'composition-instructions': 'summary',
    'sports-composition': 'sports-composition-activity',
    'reflection-instructions': 'summary',
    'reflection-activity': 'two-stars-and-a-wish',  // Two Stars and a Wish reflection
    'conclusion': 'summary'
  };
  return stageMap[stage];
};

// Drum kit components for the lesson
export const DRUM_KIT = [
  {
    id: 'kick',
    name: 'Kick Drum',
    emoji: '🔴',
    description: 'The big bass drum on the floor',
    color: '#ef4444',
    beats: [1, 3],
    role: 'The heartbeat of the music'
  },
  {
    id: 'snare',
    name: 'Snare Drum',
    emoji: '🟠',
    description: 'The cracking drum in the middle',
    color: '#f59e0b',
    beats: [2, 4],
    role: 'Creates the backbeat'
  },
  {
    id: 'hihat',
    name: 'Hi-Hat (closed)',
    emoji: '🟢',
    description: 'Two cymbals tapping together',
    color: '#10b981',
    beats: [1, 2, 3, 4],
    role: 'Creates momentum'
  },
  {
    id: 'openhat',
    name: 'Hi-Hat (open)',
    emoji: '🔵',
    description: 'Two cymbals ringing out',
    color: '#3b82f6',
    beats: [],
    role: 'Adds variety and accents'
  }
];
