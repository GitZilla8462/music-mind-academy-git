// File: /lessons/film-music-project/lesson5/Lesson5config.jsx
// Lesson 5: Game On! - Melody & Contour
// STREAMLINED: Matches Lesson 4 structure exactly (13 stages)

export const LESSON_PROGRESS_KEY = 'lesson5-progress';
export const LESSON_TIMER_KEY = 'lesson5-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'hook',
    title: '1. Hook',
    subtitle: 'Name That Game',
    color: 'blue',
    estimatedTime: 6,
    stages: [
      {
        id: 'welcome-agenda',
        type: 'summary',
        label: 'Game On!',
        description: 'Welcome + Today\'s agenda',
        duration: 1
      },
      {
        id: 'name-that-game',
        type: 'demo',
        label: 'Name That Game!',
        description: 'Listen to game themes and guess the game',
        duration: 3
      },
      {
        id: 'hook-discussion',
        type: 'discussion',
        label: 'What Did You Notice?',
        description: 'What made those melodies memorable?',
        duration: 2
      }
    ]
  },
  {
    id: 'learn-create',
    title: '2. Learn & Create Melody',
    subtitle: 'Melody Basics + Activity',
    color: 'green',
    estimatedTime: 14,
    stages: [
      {
        id: 'melody-basics',
        type: 'summary',
        label: 'What is a Melody?',
        description: 'Melody, contour, steps, skips',
        duration: 2
      },
      {
        id: 'melody-demo',
        type: 'demo',
        label: 'Building a Melody',
        description: 'Teacher demo: Ascending, Descending, Steps, Skips',
        duration: 2
      },
      {
        id: 'melody-maker-instructions',
        type: 'summary',
        label: 'Build Your Melody Instructions',
        description: 'Explain how to use the melody maker',
        duration: 1
      },
      {
        id: 'melody-maker-activity',
        type: 'activity',
        label: '🎮 Unlock Build Your Melody',
        description: 'Create a melody using the note grid',
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        bonusDescription: 'If you make one melody, click Create Another Melody to make more! They can all be options to choose from for your composition today.'
      }
    ]
  },
  {
    id: 'create',
    title: '3. Compose',
    subtitle: 'Score the Game',
    color: 'orange',
    estimatedTime: 13,
    stages: [
      {
        id: 'composition-instructions',
        type: 'summary',
        label: 'Composition Requirements',
        description: 'Melody + loops, match the game mood',
        duration: 1
      },
      {
        id: 'game-composition',
        type: 'activity',
        label: '🎮 Unlock Score the Game',
        description: 'Combine your melody with loops',
        duration: 12,
        hasTimer: true,
        trackProgress: true,
        bonusDescription: 'Make your melody match the action!'
      }
    ]
  },
  {
    id: 'reflect-wrapup',
    title: '4. Reflect & Wrap Up',
    subtitle: 'Melody Spotlight + Conclusion',
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
        id: 'reflection',
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
        description: 'Melody is the memorable part of music',
        duration: 1
      }
    ]
  },
  {
    id: 'bonus',
    title: 'Bonus - Melody Mystery',
    subtitle: 'Solo or Partner Activity',
    color: 'pink',
    estimatedTime: 12,
    isBonus: true,
    stages: [
      {
        id: 'melody-mystery-intro',
        type: 'summary',
        label: 'Melody Mystery',
        description: 'Introduction to the partner puzzle activity',
        duration: 1
      },
      {
        id: 'melody-mystery-howto',
        type: 'summary',
        label: 'How It Works',
        description: 'Explain CREATE and SOLVE phases',
        duration: 1
      },
      {
        id: 'melody-mystery',
        type: 'activity',
        label: '🎮 Unlock Melody Mystery',
        description: 'Partner activity: Create and solve melody puzzles',
        duration: 10,
        hasTimer: true,
        trackProgress: true
      }
    ]
  }
];

export const lesson5Config = {
  id: 'lesson5',
  lessonPath: '/lessons/film-music-project/lesson5',
  title: "Game On!",
  subtitle: "Melody & Contour",
  learningObjectives: [
    "Define melody as a sequence of pitches you can sing or hum.",
    "Identify contour as the shape of a melody (ascending, descending, repeated).",
    "Distinguish between steps (smooth) and skips (jumpy) in melodic movement.",
    "Create an original 8-beat melody using a pentatonic scale.",
    "Describe how melody creates memorable themes in video game music."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "student-melody-maker",
      title: "Build Your Melody",
      estimatedTime: "8 min"
    },
    {
      id: 2,
      type: "melody-mystery",
      title: "Melody Mystery",
      estimatedTime: "10 min",
      isBonus: true,
      description: "Partner activity: Create and solve melody puzzles"
    },
    {
      id: 3,
      type: "game-composition-activity",
      title: "Game Composition",
      estimatedTime: "12 min",
      includesVideoSelection: true
    },
    {
      id: 4,
      type: "two-stars-and-a-wish",
      title: "Melody Spotlight",
      estimatedTime: "3 min"
    }
  ]
};

// ========================================
// LESSON STAGES - With presentationView data for each stage
// STREAMLINED: 13 stages total (matches Lesson 4)
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
    label: 'Game On!',
    description: 'Welcome + Agenda',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson5/slides/1-welcome.svg'
    }
  },
  {
    id: 'name-that-game',
    label: 'Name That Game!',
    description: 'Listen to game themes and guess the game',
    type: 'demo',
    duration: 3,
    presentationView: {
      type: 'name-that-game'
      // This tells the component to show the Name That Game activity
    }
  },
  {
    id: 'hook-discussion',
    label: 'What Did You Notice?',
    description: 'Discussion: What made those melodies memorable?',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson5/slides/2-discussion.svg'
    }
  },
  {
    id: 'melody-basics',
    label: 'What is a Melody?',
    description: 'Melody, contour, and how notes move',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson5/slides/3-melody-basics.svg'
    }
  },
  {
    id: 'melody-demo',
    label: 'Building a Melody',
    description: 'Teacher demo: Ascending, Descending, Steps, Skips',
    type: 'demo',  // Students see "Watch the Main Screen"
    duration: 2,
    trackProgress: true,
    presentationView: {
      type: 'melody-builder-demo'
      // Teacher uses live melody builder tool
    }
  },
  {
    id: 'melody-maker-instructions',
    label: 'Build Your Melody Instructions',
    description: 'Explain how to use the melody maker',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson5/slides/4-melody-instructions.svg'
    }
  },
  {
    id: 'melody-maker-activity',
    label: '🎮 Unlock Build Your Melody',
    description: 'Students create a melody using the note grid',
    bonusDescription: 'If you make one melody, click Create Another Melody to make more! They can all be options to choose from for your composition today.',
    type: 'activity',
    hasTimer: true,
    hasProgress: true,
    trackProgress: true,
    duration: 8,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson5/slides/4-activity-melody.svg'
    }
  },
  {
    id: 'composition-instructions',
    label: 'Composition Requirements',
    description: 'Your melody + loops, match the game mood',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson5/slides/5-composition-instructions.svg'
    }
  },
  {
    id: 'game-composition',
    label: '🎮 Unlock Score the Game',
    description: 'Combine your melody with loops to score the game',
    bonusDescription: 'Make your melody match the action!',
    type: 'activity',
    hasTimer: true,
    hasProgress: true,
    trackProgress: true,
    duration: 12,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson5/slides/6-activity-compose.svg'
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
      slidePath: '/lessons/film-music-project/lesson5/slides/7-reflection-instructions.svg'
    }
  },
  {
    id: 'reflection',
    label: '🎮 Unlock Reflection',
    description: 'STUDENTS WORK: Complete reflection activity.',
    bonusDescription: 'Bonus: Melody Mystery with a partner',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'activity-slide',
      slidePath: '/lessons/film-music-project/lesson5/slides/7-reflection-instructions.svg'
    }
  },
  {
    id: 'conclusion',
    label: 'Key Insight',
    description: 'Melody is the memorable part of music',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson5/slides/8-conclusion.svg'
    }
  },
  // BONUS: Melody Mystery (at end so it doesn't interrupt main flow)
  {
    id: 'melody-mystery-intro',
    label: 'Melody Mystery',
    description: 'Introduction to the partner puzzle activity',
    type: 'summary',
    isBonus: true,
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Melody Mystery',
      bullets: [
        'Create a melody puzzle for a classmate to solve',
        'Can they recreate your melody by ear?'
      ]
    }
  },
  {
    id: 'melody-mystery-howto',
    label: 'How It Works',
    description: 'Explain CREATE and SOLVE phases',
    type: 'summary',
    isBonus: true,
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'How It Works',
      sections: [
        {
          heading: 'PHASE 1: CREATE',
          bullets: [
            'Pick a mystery object',
            'Build your melody on the grid',
            'Get your mystery code and remember it!'
          ]
        },
        {
          heading: 'PHASE 2: SOLVE',
          bullets: [
            'Partner up and trade codes',
            'Enter your partner\'s code',
            'Tap the object to hear their hidden melody',
            'Recreate it on the decoder grid',
            'Check your answer!'
          ]
        }
      ]
    }
  },
  {
    id: 'melody-mystery',
    label: '🎮 Unlock Melody Mystery',
    description: 'Solo or partner activity: Create melody puzzles for others to solve',
    bonusDescription: 'Create a melody puzzle, then give your device to a friend to play!',
    type: 'activity',
    hasTimer: true,
    hasProgress: true,
    trackProgress: true,
    isBonus: true,
    duration: 10,
    presentationView: {
      type: 'activity',
      activityType: 'melody-mystery'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-agenda': 'summary',
    'name-that-game': 'name-that-game',
    'hook-discussion': 'discussion',
    'melody-basics': 'summary',
    'melody-demo': 'melody-builder-demo',  // Teacher demo of melody builder
    'melody-maker-instructions': 'summary',
    'melody-maker-activity': 'student-melody-maker',  // Student melody creation
    'melody-mystery-intro': 'summary',  // Melody Mystery intro slide
    'melody-mystery-howto': 'summary',  // Melody Mystery how-to slide
    'melody-mystery': 'melody-mystery',  // Partner melody puzzle activity
    'composition-instructions': 'summary',
    'game-composition': 'game-composition-activity',
    'reflection-instructions': 'summary',
    'reflection': 'two-stars-and-a-wish',  // Two Stars and a Wish reflection
    'conclusion': 'summary'
  };
  return stageMap[stage];
};

// ========================================
// CONTOUR PATTERNS FOR TEACHER DEMO (5 examples)
// ========================================
export const CONTOUR_PATTERNS = [
  {
    id: 'ascending',
    number: 1,
    name: 'Ascending',
    contour: '↗',
    notes: ['C4', 'D4', 'E4', 'G4', 'A4'],
    description: 'This MELODY goes UP - that\'s ASCENDING. It uses all STEPS.',
    grid: [
      [false, false, false, false, true, false, false, false],  // A
      [false, false, false, true, false, false, false, false],  // G
      [false, false, true, false, false, false, false, false],  // E
      [false, true, false, false, false, false, false, false],  // D
      [true, false, false, false, false, false, false, false],  // C
    ]
  },
  {
    id: 'descending',
    number: 2,
    name: 'Descending',
    contour: '↘',
    notes: ['A4', 'G4', 'E4', 'D4', 'C4'],
    description: 'This MELODY goes DOWN - that\'s DESCENDING.',
    grid: [
      [true, false, false, false, false, false, false, false],   // A
      [false, true, false, false, false, false, false, false],   // G
      [false, false, true, false, false, false, false, false],   // E
      [false, false, false, true, false, false, false, false],   // D
      [false, false, false, false, true, false, false, false],   // C
    ]
  },
  {
    id: 'repeated',
    number: 3,
    name: 'Repeated',
    contour: '→',
    notes: ['E4', 'E4', 'E4', 'E4', 'E4'],
    description: 'This MELODY stays on the same pitch - that\'s REPEATED.',
    grid: [
      [false, false, false, false, false, false, false, false],  // A
      [false, false, false, false, false, false, false, false],  // G
      [true, true, true, true, true, false, false, false],       // E
      [false, false, false, false, false, false, false, false],  // D
      [false, false, false, false, false, false, false, false],  // C
    ]
  },
  {
    id: 'mixed-steps',
    number: 4,
    name: 'Mixed with Steps',
    contour: '↗↘',
    notes: ['C4', 'D4', 'E4', 'G4', 'E4', 'D4'],
    description: 'This one goes UP then DOWN using mostly STEPS - smooth!',
    grid: [
      [false, false, false, false, false, false, false, false],  // A
      [false, false, false, true, false, false, false, false],   // G
      [false, false, true, false, true, false, false, false],    // E
      [false, true, false, false, false, true, false, false],    // D
      [true, false, false, false, false, false, false, false],   // C
    ]
  },
  {
    id: 'mixed-skips',
    number: 5,
    name: 'Mixed with Skips',
    contour: '↗↘',
    notes: ['C4', 'E4', 'A4', 'E4', 'C4'],
    description: 'This one uses SKIPS - hear how it\'s more jumpy?',
    grid: [
      [false, false, true, false, false, false, false, false],   // A
      [false, false, false, false, false, false, false, false],  // G
      [false, true, false, true, false, false, false, false],    // E
      [false, false, false, false, false, false, false, false],  // D
      [true, false, false, false, true, false, false, false],    // C
    ]
  }
];
