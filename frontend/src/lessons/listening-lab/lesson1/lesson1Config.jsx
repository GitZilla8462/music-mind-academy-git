// File: /lessons/listening-lab/lesson1/lesson1Config.jsx
// Lesson 1: Strings & Dynamics
// "Feel the Power of Soft and Loud"
// Featured Piece: Spring from The Four Seasons by Antonio Vivaldi
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students learn:
// - Instruments of the string family (violin, viola, cello, double bass)
// - Dynamic markings (pp, p, mp, mf, f, ff)
// - How dynamics affect mood and energy in music
// - Create a Dynamics Listening Map while listening to Vivaldi's Spring
//
// Pop Culture Hook: Grow a Garden (Roblox) - 10M+ players
// ========================================
//
// AUDIO CREDITS (Public Domain)
// ========================================
// Musopen.org - Royalty-free classical recordings
// Spring (Vivaldi): https://musopen.org/music/2213-the-four-seasons/
// Philharmonia Orchestra Sound Sample Library (CC BY)
// ========================================

export const LESSON_PROGRESS_KEY = 'listening-lab-lesson1-progress';
export const LESSON_TIMER_KEY = 'listening-lab-lesson1-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook + Meet the Strings',
    color: 'blue',
    estimatedTime: 12,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'Strings & Dynamics',
        description: 'Introduce the lesson: Feel the Power of Soft and Loud.',
        duration: 1
      },
      {
        id: 'opening-hook',
        type: 'discussion',
        label: 'Sound Mystery',
        description: 'Play Spring opening. "Where have you heard this before?" Connect to Grow a Garden.',
        duration: 3
      },
      {
        id: 'string-family-showcase',
        type: 'activity',
        label: 'Meet the Strings',
        description: 'Watch and hear each string instrument: Violin → Viola → Cello → Bass.',
        duration: 5
      },
      {
        id: 'dynamics-vocabulary',
        type: 'summary',
        label: 'Dynamics Vocabulary',
        description: 'Teach pp, p, mp, mf, f, ff. Practice with hand levels (low=soft, high=loud).',
        duration: 4
      }
    ]
  },
  {
    id: 'practice',
    title: '2. Practice',
    subtitle: 'String Detective Game',
    color: 'blue',
    estimatedTime: 15,
    stages: [
      {
        id: 'game-instructions',
        type: 'summary',
        label: 'Game Instructions',
        description: 'Explain String Detective: identify the instrument AND the dynamic level.',
        duration: 2
      },
      {
        id: 'string-detective',
        type: 'activity',
        label: '🎮 Unlock String Detective',
        duration: 12,
        hasTimer: false,
        trackProgress: true,
        description: 'CLASS GAME: Identify string instruments and their dynamics!',
        bonusDescription: 'Bonus: Can you tell violin from viola?'
      }
    ]
  },
  {
    id: 'active-listening',
    title: '3. Active Listening',
    subtitle: 'Vivaldi\'s Spring',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      {
        id: 'active-listening-intro',
        type: 'summary',
        label: 'Active Listening Instructions',
        description: 'Students raise hands high when loud, low when soft.',
        duration: 1
      },
      {
        id: 'active-listening-spring',
        type: 'activity',
        label: '🎵 Listen to Spring',
        duration: 5,
        hasTimer: false,
        trackProgress: false,
        description: 'Listen to first 90 seconds. Students show dynamics with hand levels.',
        bonusDescription: ''
      },
      {
        id: 'dynamic-contrast',
        type: 'discussion',
        label: 'Dynamic Contrast Discussion',
        description: '"When did Vivaldi SURPRISE you with a sudden change?"',
        duration: 2
      }
    ]
  },
  {
    id: 'create',
    title: '4. Create',
    subtitle: 'Dynamics Listening Map',
    color: 'blue',
    estimatedTime: 18,
    stages: [
      {
        id: 'listening-map-instructions',
        type: 'summary',
        label: 'Listening Map Instructions',
        description: 'Explain: circle instruments, mark dynamics (pp-ff), draw crescendo/decrescendo arrows.',
        duration: 2
      },
      {
        id: 'dynamics-listening-map',
        type: 'activity',
        label: '🎮 Unlock Dynamics Listening Map',
        duration: 15,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Create a Dynamics Listening Map for Spring.',
        bonusDescription: 'Bonus: Add tempo observations!'
      }
    ]
  },
  {
    id: 'reflect',
    title: '5. Reflect',
    subtitle: 'Exit Ticket',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'reflection',
        type: 'activity',
        label: '🎮 Unlock Reflection',
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: '"The dynamics in Spring made me feel ___ because ___."',
        bonusDescription: ''
      }
    ]
  }
];

export const lesson1Config = {
  id: 'listening-lab-lesson1',
  lessonPath: '/lessons/listening-lab/lesson1',
  title: "Strings & Dynamics",
  subtitle: "Feel the Power of Soft and Loud",
  featuredPiece: {
    title: "Spring",
    composer: "Antonio Vivaldi",
    collection: "The Four Seasons",
    duration: "~3 min (first movement)",
    audioPath: "/audio/classical/vivaldi-spring.mp3"
  },
  popCultureHook: "Grow a Garden (Roblox)",
  learningObjectives: [
    "Identify instruments of the string family by sight and sound",
    "Define and demonstrate understanding of dynamic markings (pp, p, mp, mf, f, ff)",
    "Track dynamic changes on a listening map while listening to Vivaldi's Spring",
    "Describe how dynamics affect the mood and energy of music"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "string-detective",
      title: "String Detective",
      estimatedTime: "12 min"
    },
    {
      id: 2,
      type: "dynamics-listening-map",
      title: "Dynamics Listening Map",
      estimatedTime: "15 min"
    },
    {
      id: 3,
      type: "listening-lab-reflection",
      title: "Reflection",
      estimatedTime: "5 min"
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
    label: 'Strings & Dynamics',
    description: 'Introduce the lesson and essential question.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Strings & Dynamics',
      subtitle: 'Feel the Power of Soft and Loud',
      sections: [
        {
          heading: 'Essential Question',
          bullets: ['How do dynamics (soft and loud) change the way music makes us feel?']
        },
        {
          heading: 'I Can Statement',
          bullets: ['I can identify string instruments and describe dynamics using proper musical terms.']
        },
        {
          heading: 'Today We Will',
          bullets: [
            'Meet the STRING FAMILY (violin, viola, cello, bass)',
            'Learn DYNAMIC markings (pp, p, mp, mf, f, ff)',
            'Play STRING DETECTIVE',
            'Create a DYNAMICS LISTENING MAP'
          ]
        }
      ],
      featuredPiece: {
        title: 'Spring',
        composer: 'Antonio Vivaldi'
      }
    }
  },
  {
    id: 'opening-hook',
    label: 'Sound Mystery',
    description: 'Play Spring opening without context. Connect to Grow a Garden.',
    type: 'discussion',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Sound Mystery',
      subtitle: 'Where have you heard this before?',
      bullets: [
        '🎵 Teacher: Play the opening of "Spring" by Vivaldi',
        'Where have you heard this music before?',
        'What video games, movies, or shows use this?',
        'What instruments do you hear?',
        '🎮 Pop Culture: Grow a Garden (Roblox) - 10M+ players!'
      ]
    }
  },
  {
    id: 'string-family-showcase',
    label: 'Meet the Strings',
    description: 'Watch and hear each string instrument: Violin → Viola → Cello → Bass.',
    type: 'activity',
    duration: 5,
    presentationView: {
      type: 'string-family-showcase'
    }
  },
  {
    id: 'dynamics-vocabulary',
    label: 'Dynamics Vocabulary',
    description: 'Teach dynamic markings: pp through ff, crescendo, decrescendo.',
    type: 'summary',
    duration: 4,
    presentationView: {
      type: 'summary',
      title: 'Dynamics: The Volume of Music',
      subtitle: 'From Very Soft to Very Loud',
      sections: [
        {
          heading: 'Dynamic Markings',
          bullets: [
            'pp (pianissimo) = Very soft',
            'p (piano) = Soft',
            'mp (mezzo piano) = Medium soft',
            'mf (mezzo forte) = Medium loud',
            'f (forte) = Loud',
            'ff (fortissimo) = Very loud'
          ]
        },
        {
          heading: 'Gradual Changes',
          bullets: [
            '📈 Crescendo (<) = Gradually getting LOUDER',
            '📉 Decrescendo (>) = Gradually getting SOFTER'
          ]
        },
        {
          heading: 'Practice Activity',
          bullets: [
            'Show dynamics with your hands!',
            '👇 LOW = Soft (piano)',
            '✋ MIDDLE = Medium (mezzo)',
            '🖐️ HIGH = Loud (forte)'
          ]
        }
      ]
    }
  },
  {
    id: 'game-instructions',
    label: 'Game Instructions',
    description: 'Explain String Detective game rules.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'String Detective',
      subtitle: 'Can You Identify the Sound?',
      sections: [
        {
          heading: 'How to Play',
          bullets: [
            '1. Listen to an audio clip',
            '2. Identify WHICH STRING INSTRUMENT is playing',
            '3. Identify the DYNAMIC LEVEL (soft, medium, or loud)',
            '4. Answer quickly for bonus points!'
          ]
        },
        {
          heading: 'Tips',
          bullets: [
            'Violin = Highest, brightest',
            'Viola = Slightly lower, warmer',
            'Cello = Rich, singing',
            'Bass = Deep, rumbling'
          ]
        }
      ]
    }
  },
  {
    id: 'string-detective',
    label: '🎮 Unlock String Detective',
    description: 'CLASS GAME: Identify string instruments and their dynamics!',
    bonusDescription: 'Bonus: Can you tell violin from viola?',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 12,
    presentationView: {
      type: 'activity-banner',
      title: 'String Detective',
      subtitle: 'Identify the instrument and dynamic level!'
    }
  },
  {
    id: 'active-listening-intro',
    label: 'Active Listening Instructions',
    description: 'Explain hand-level dynamics activity.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Active Listening: Spring',
      subtitle: 'Show the Dynamics with Your Hands!',
      bullets: [
        'As you listen, show the DYNAMIC LEVEL with your hands:',
        '🖐️ HIGH = Loud (forte)',
        '✋ MIDDLE = Medium (mezzo)',
        '👇 LOW = Soft (piano)',
        'Listen for SUDDEN CHANGES — Vivaldi loves to surprise us!'
      ]
    }
  },
  {
    id: 'active-listening-spring',
    label: '🎵 Listen to Spring',
    description: 'Active listening with hand movements showing dynamics.',
    type: 'activity',
    hasTimer: false,
    duration: 5,
    presentationView: {
      type: 'activity-banner',
      title: 'Active Listening: Spring by Vivaldi',
      subtitle: 'Show dynamics with your hands! (HIGH = loud, LOW = soft)'
    }
  },
  {
    id: 'dynamic-contrast',
    label: 'Dynamic Contrast Discussion',
    description: 'Discuss moments of dynamic surprise in Spring.',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Dynamic Contrast',
      subtitle: 'The Element of Surprise',
      bullets: [
        'When did Vivaldi SURPRISE you with a sudden change?',
        'Did you notice any CRESCENDOS (getting louder)?',
        'Did you notice any DECRESCENDOS (getting softer)?',
        'How did these dynamic changes make you FEEL?'
      ]
    }
  },
  {
    id: 'listening-map-instructions',
    label: 'Listening Map Instructions',
    description: 'Explain how to create a Dynamics Listening Map.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Dynamics Listening Map',
      subtitle: 'Track What You Hear',
      sections: [
        {
          heading: 'What to Mark',
          bullets: [
            '🎻 Circle STRING INSTRUMENTS when you hear them prominently',
            '📊 Mark DYNAMIC LEVELS at key moments (pp, p, mf, f, ff)',
            '📈 Draw CRESCENDO arrows where music builds',
            '📉 Draw DECRESCENDO arrows where music fades'
          ]
        },
        {
          heading: 'Color Coding',
          bullets: [
            '🔵 Soft dynamics (pp, p) = Blue',
            '🟡 Medium dynamics (mp, mf) = Yellow',
            '🔴 Loud dynamics (f, ff) = Red'
          ]
        }
      ]
    }
  },
  {
    id: 'dynamics-listening-map',
    label: '🎮 Unlock Dynamics Listening Map',
    description: 'STUDENTS WORK: Create a Dynamics Listening Map for Spring.',
    bonusDescription: 'Bonus: Add tempo observations!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 15,
    presentationView: {
      type: 'activity-banner',
      title: 'Dynamics Listening Map',
      subtitle: 'Track the dynamics in Spring by Vivaldi'
    }
  },
  {
    id: 'reflection',
    label: '🎮 Unlock Reflection',
    description: 'Students reflect on how dynamics affected their experience.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Reflect: Feel the Dynamics',
      subtitle: 'Exit Ticket',
      bullets: [
        'Complete this sentence:',
        '"The dynamics in Spring made me feel ___ because ___."',
        '',
        'Think about:',
        '• Which dynamic moments stood out to you?',
        '• How did soft vs. loud sections make you feel differently?',
        '• What mood did the dynamic contrasts create?'
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'opening-hook': 'discussion',
    'string-family-showcase': 'string-family-showcase',
    'dynamics-vocabulary': 'summary',
    'game-instructions': 'summary',
    'string-detective': 'string-detective',
    'active-listening-intro': 'summary',
    'active-listening-spring': 'activity-banner',
    'dynamic-contrast': 'discussion',
    'listening-map-instructions': 'summary',
    'dynamics-listening-map': 'dynamics-listening-map',
    'reflection': 'listening-lab-reflection'
  };
  return stageMap[stage];
};

// String instruments for the lesson
export const STRING_INSTRUMENTS = [
  {
    id: 'violin',
    name: 'Violin',
    color: '#3B82F6',
    description: 'Highest, brightest sound in the string family',
    audioFile: '/audio/orchestra-samples/strings/violin/violin-demo.mp3',
    range: 'high',
    facts: [
      'The violin is the smallest string instrument',
      'It plays the highest notes in the string family',
      'Violins often play the melody in orchestras'
    ]
  },
  {
    id: 'viola',
    name: 'Viola',
    color: '#8B5CF6',
    description: 'Slightly larger than violin, warmer and darker tone',
    audioFile: '/audio/orchestra-samples/strings/viola/viola-demo.mp3',
    range: 'medium-high',
    facts: [
      'The viola is slightly larger than a violin',
      'It has a warmer, darker sound than the violin',
      'Violas often play harmony parts'
    ]
  },
  {
    id: 'cello',
    name: 'Cello',
    color: '#10B981',
    description: 'Large string instrument with rich, warm tone',
    audioFile: '/audio/orchestra-samples/strings/cello/cello-demo.mp3',
    range: 'medium-low',
    facts: [
      'The cello is played sitting down, held between the knees',
      'It has a rich, warm tone similar to a human voice',
      'Cellists can play both melody and bass lines'
    ]
  },
  {
    id: 'bass',
    name: 'Double Bass',
    color: '#EF4444',
    description: 'Largest string instrument, deep and powerful',
    audioFile: '/audio/orchestra-samples/strings/bass/bass-demo.mp3',
    range: 'low',
    facts: [
      'The double bass is the largest string instrument',
      'It provides the foundation for the orchestra',
      'Players either stand or sit on a tall stool to play it'
    ]
  }
];

// Dynamic markings
export const DYNAMICS = [
  { symbol: 'pp', name: 'pianissimo', meaning: 'Very soft', level: 1, color: '#93C5FD' },
  { symbol: 'p', name: 'piano', meaning: 'Soft', level: 2, color: '#60A5FA' },
  { symbol: 'mp', name: 'mezzo piano', meaning: 'Medium soft', level: 3, color: '#FCD34D' },
  { symbol: 'mf', name: 'mezzo forte', meaning: 'Medium loud', level: 4, color: '#FBBF24' },
  { symbol: 'f', name: 'forte', meaning: 'Loud', level: 5, color: '#F87171' },
  { symbol: 'ff', name: 'fortissimo', meaning: 'Very loud', level: 6, color: '#EF4444' }
];

// Vocabulary for this lesson
export const VOCABULARY = [
  { term: 'Dynamics', definition: 'How loud or soft music is played' },
  { term: 'Pianissimo (pp)', definition: 'Very soft' },
  { term: 'Piano (p)', definition: 'Soft' },
  { term: 'Mezzo piano (mp)', definition: 'Medium soft' },
  { term: 'Mezzo forte (mf)', definition: 'Medium loud' },
  { term: 'Forte (f)', definition: 'Loud' },
  { term: 'Fortissimo (ff)', definition: 'Very loud' },
  { term: 'Crescendo', definition: 'Gradually getting louder' },
  { term: 'Decrescendo', definition: 'Gradually getting softer' },
  { term: 'Timbre', definition: 'The unique tone color of an instrument' },
  { term: 'String Family', definition: 'Violin, viola, cello, and double bass' }
];
