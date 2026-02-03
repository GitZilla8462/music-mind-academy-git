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
        id: 'meet-string-family',
        type: 'discussion',
        label: 'Meet the String Family',
        description: 'Discussion: What do students already know about string instruments?',
        duration: 2
      },
      {
        id: 'string-family-definition',
        type: 'summary',
        label: 'String Family Definition',
        description: 'Define string instruments and introduce the four orchestral strings.',
        duration: 2
      },
      {
        id: 'string-family-showcase',
        type: 'activity',
        label: 'See & Hear the Strings',
        description: 'Watch and hear each string instrument: Violin → Viola → Cello → Bass.',
        duration: 5
      },
      {
        id: 'dynamics-markings',
        type: 'summary',
        label: 'Dynamic Markings',
        description: 'Teach pp, p, mp, mf, f, ff.',
        duration: 3
      },
      {
        id: 'gradual-changes',
        type: 'summary',
        label: 'Gradual Changes',
        description: 'Teach crescendo and decrescendo.',
        duration: 2
      }
    ]
  },
  {
    id: 'active-listening',
    title: '2. Active Listening',
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
    title: '3. Create',
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
    title: '4. Reflect',
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
      type: "dynamics-listening-map",
      title: "Dynamics Listening Map",
      estimatedTime: "15 min"
    },
    {
      id: 2,
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
            'Learn DYNAMIC MARKINGS (pp, p, mp, mf, f, ff)',
            'Learn about CRESCENDO and DECRESCENDO',
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
    id: 'meet-string-family',
    label: 'Meet the String Family',
    description: 'Discussion: What do students already know about string instruments?',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Meet the String Family',
      subtitle: 'Let\'s Talk About Strings!',
      bullets: [
        'What string instruments do you know?',
        'Do you know any facts about string instruments?',
        'Do you play or know someone who plays a string instrument?'
      ]
    }
  },
  {
    id: 'string-family-definition',
    label: 'String Family Definition',
    description: 'Define string instruments and introduce the four orchestral strings.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'The String Family',
      subtitle: 'Instruments That Make Sound with Vibrating Strings',
      sections: [
        {
          heading: 'What is a String Instrument?',
          bullets: [
            'A string instrument makes sound when its strings vibrate',
            'Players can bow the strings (with a stick called a bow) or pluck them',
            'The body of the instrument amplifies the sound'
          ]
        },
        {
          heading: 'The Orchestral String Family',
          bullets: [
            'In the orchestra, we focus on four string instruments:',
            '🎻 Violin - smallest, highest sound',
            '🎻 Viola - slightly larger, warmer sound',
            '🎻 Cello - large, rich sound',
            '🎻 Double Bass - largest, deepest sound'
          ]
        }
      ]
    }
  },
  {
    id: 'string-family-showcase',
    label: 'See & Hear the Strings',
    description: 'Watch and hear each string instrument: Violin → Viola → Cello → Bass.',
    type: 'activity',
    duration: 5,
    presentationView: {
      type: 'string-family-showcase'
    }
  },
  {
    id: 'dynamics-markings',
    label: 'Dynamic Markings',
    description: 'Teach dynamic markings: pp through ff.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Dynamic Markings',
      subtitle: 'The Volume of Music',
      sections: [
        {
          heading: 'From Soft to Loud',
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
          heading: 'Remember',
          bullets: [
            'Piano = Soft (think of playing piano keys gently)',
            'Forte = Loud (think of a strong fortress)',
            'Mezzo = Medium (in between)'
          ]
        }
      ]
    }
  },
  {
    id: 'gradual-changes',
    label: 'Gradual Changes',
    description: 'Teach crescendo and decrescendo.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Gradual Dynamic Changes',
      subtitle: 'Getting Louder and Softer Over Time',
      sections: [
        {
          heading: 'Crescendo',
          bullets: [
            '📈 Crescendo = Gradually getting LOUDER',
            'Symbol: < (opens up like getting bigger)',
            'Example: Music builds from soft to loud'
          ]
        },
        {
          heading: 'Decrescendo (Diminuendo)',
          bullets: [
            '📉 Decrescendo = Gradually getting SOFTER',
            'Symbol: > (closes down like getting smaller)',
            'Example: Music fades from loud to soft'
          ]
        }
      ]
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
    'meet-string-family': 'discussion',
    'string-family-definition': 'summary',
    'string-family-showcase': 'string-family-showcase',
    'dynamics-markings': 'summary',
    'gradual-changes': 'summary',
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
