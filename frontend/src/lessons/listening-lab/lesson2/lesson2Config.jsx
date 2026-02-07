// File: /lessons/listening-lab/lesson2/lesson2Config.jsx
// Lesson 2: Woodwinds & Tempo
// "Feel the Speed of Music"
// Featured Piece: Hungarian Dance No. 5 by Johannes Brahms
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students learn:
// - Instruments of the woodwind family (flute, oboe, clarinet, bassoon)
// - Tempo markings (Largo, Adagio, Andante, Allegro, Presto)
// - Tempo changes (accelerando, ritardando)
// - Create a Tempo Listening Map while listening to Brahms's Hungarian Dance No. 5
//
// ========================================
//
// AUDIO CREDITS (Public Domain)
// ========================================
// Musopen.org - Royalty-free classical recordings
// Hungarian Dance No. 5 (Brahms): https://musopen.org/music/
// Philharmonia Orchestra Sound Sample Library (CC BY)
// ========================================

export const LESSON_PROGRESS_KEY = 'listening-lab-lesson2-progress';
export const LESSON_TIMER_KEY = 'listening-lab-lesson2-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Meet the Woodwinds + Tempo',
    color: 'blue',
    estimatedTime: 12,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'Woodwinds & Tempo',
        description: 'Show students what we will learn today.',
        duration: 1
      },
      {
        id: 'meet-woodwind-family',
        type: 'discussion',
        label: 'Meet the Woodwind Family',
        description: 'Discussion: What do students already know about woodwind instruments?',
        duration: 2
      },
      {
        id: 'woodwind-family-definition',
        type: 'summary',
        label: 'What is a Woodwind Instrument?',
        description: 'Define what makes an instrument a woodwind instrument.',
        duration: 2
      },
      {
        id: 'orchestral-woodwinds',
        type: 'summary',
        label: 'Orchestral Woodwind Family',
        description: 'Introduce the four orchestral woodwind instruments.',
        duration: 2
      },
      {
        id: 'woodwind-family-showcase',
        type: 'summary',
        label: 'See & Hear the Woodwinds',
        description: 'Watch and hear each woodwind instrument: Flute, Oboe, Clarinet, Bassoon.',
        duration: 3
      },
      {
        id: 'tempo-definition',
        type: 'summary',
        label: 'What is Tempo?',
        description: 'Define tempo and introduce BPM.',
        duration: 1
      },
      {
        id: 'tempo-markings-showcase',
        type: 'summary',
        label: 'Tempo Markings',
        description: 'Teach Largo, Adagio, Andante, Allegro, Presto.',
        duration: 2
      },
      {
        id: 'tempo-changes',
        type: 'summary',
        label: 'Accelerando & Ritardando',
        description: 'Teach accelerando and ritardando.',
        duration: 1
      }
    ]
  },
  {
    id: 'tempo-charades-whole-class',
    title: '2. Tempo Charades (Whole Class)',
    subtitle: 'Act Out the Tempo',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      {
        id: 'tempo-charades-intro',
        type: 'summary',
        label: 'Tempo Charades Instructions',
        description: 'Explain the game: act out tempo terms for the class to guess.',
        duration: 1
      },
      {
        id: 'tempo-charades-teacher-game',
        type: 'activity',
        label: '🎮 Unlock Tempo Charades',
        duration: 7,
        hasTimer: false,
        trackProgress: true,
        description: 'CLASS GAME: Act out tempo terms for the class to guess!',
        bonusDescription: 'Can you act out accelerando and ritardando?'
      },
      {
        id: 'tempo-charades-results',
        type: 'activity',
        label: '🏆 Tempo Charades Results',
        description: 'View class results and celebrate top scorers.',
        duration: 1
      }
    ]
  },
  {
    id: 'tempo-charades-small-groups',
    title: '3. Tempo Charades (Small Groups)',
    subtitle: 'Everyone Gets a Turn',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'small-group-instructions',
        type: 'summary',
        label: 'Small Group Instructions',
        description: 'Explain how to play Tempo Charades in small groups.',
        duration: 1
      },
      {
        id: 'small-group-game',
        type: 'activity',
        label: '🎮 Unlock Small Group Charades',
        duration: 9,
        hasTimer: false,
        trackProgress: true,
        description: 'SMALL GROUPS: Take turns acting and guessing tempo terms!',
        bonusDescription: 'Everyone gets a turn to be the actor!'
      },
      {
        id: 'small-group-results',
        type: 'summary',
        label: 'Great Work! Let\'s Listen',
        description: 'Transition to active listening section.',
        duration: 1
      }
    ]
  },
  {
    id: 'active-listening',
    title: '4. Active Listening + Listening Map',
    subtitle: 'Hungarian Dance No. 5',
    color: 'blue',
    estimatedTime: 12,
    stages: [
      {
        id: 'active-listening-intro',
        type: 'summary',
        label: 'Hungarian Dance No. 5',
        description: 'Introduce Brahms and the piece.',
        duration: 1
      },
      {
        id: 'active-listening-play',
        type: 'summary',
        label: 'Listen: Hungarian Dance No. 5',
        description: 'Play the piece — students watch main screen and show tempo with hands.',
        duration: 3
      },
      {
        id: 'tempo-contrast-discussion',
        type: 'discussion',
        label: 'Tempo Surprises',
        description: 'Discussion: What tempo changes did you notice?',
        duration: 2
      },
      {
        id: 'listening-map-instructions',
        type: 'summary',
        label: 'Tempo Listening Map Instructions',
        description: 'Explain the Tempo Listening Map activity.',
        duration: 1
      },
      {
        id: 'tempo-listening-map',
        type: 'activity',
        label: '🎮 Unlock Tempo Listening Map',
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Create a Tempo Listening Map for Hungarian Dance No. 5.',
        bonusDescription: 'Bonus: Circle moments where you hear the clarinet!'
      }
    ]
  },
  {
    id: 'reflect',
    title: '5. Reflection',
    subtitle: 'Exit Ticket',
    color: 'blue',
    estimatedTime: 3,
    stages: [
      {
        id: 'reflection',
        type: 'discussion',
        label: 'Class Reflection',
        duration: 3,
        description: 'Wrap up with three reflection questions.',
        bonusDescription: ''
      }
    ]
  }
];

export const lesson2Config = {
  id: 'listening-lab-lesson2',
  lessonPath: '/lessons/listening-lab/lesson2',
  title: "Woodwinds & Tempo",
  subtitle: "Feel the Speed of Music",
  featuredPiece: {
    title: "Hungarian Dance No. 5",
    composer: "Johannes Brahms",
    collection: "Hungarian Dances",
    duration: "~3 min",
    audioPath: "/audio/classical/brahms-hungarian-dance-5.mp3"
  },
  learningObjectives: [
    "Identify woodwind instruments by sight and sound",
    "Define and demonstrate understanding of tempo markings (Largo, Adagio, Andante, Allegro, Presto)",
    "Identify tempo changes (accelerando, ritardando) in music",
    "Create a tempo listening map while listening to Brahms's Hungarian Dance No. 5"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "tempo-charades",
      title: "Tempo Charades (Whole Class)",
      estimatedTime: "7 min"
    },
    {
      id: 2,
      type: "tempo-charades-small-group",
      title: "Tempo Charades (Small Groups)",
      estimatedTime: "9 min"
    },
    {
      id: 3,
      type: "tempo-listening-map",
      title: "Tempo Listening Map",
      estimatedTime: "8 min"
    },
    {
      id: 4,
      type: "listening-lab-lesson2-reflection",
      title: "Reflection",
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
    label: 'Woodwinds & Tempo',
    description: 'Show students what we will learn today.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Woodwinds & Tempo',
      subtitle: 'Feel the Speed of Music',
      sections: [
        {
          heading: 'Today We Will',
          bullets: [
            'Meet the WOODWIND FAMILY (flute, oboe, clarinet, bassoon)',
            'Learn TEMPO MARKINGS (Largo, Adagio, Andante, Allegro, Presto)',
            'Learn about ACCELERANDO and RITARDANDO',
            'Play TEMPO CHARADES',
            'Create a TEMPO LISTENING MAP'
          ]
        }
      ],
      featuredPiece: {
        title: 'Hungarian Dance No. 5',
        composer: 'Johannes Brahms'
      }
    }
  },
  {
    id: 'meet-woodwind-family',
    label: 'Meet the Woodwind Family',
    description: 'Discussion: What do students already know about woodwind instruments?',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Meet the Woodwind Family',
      subtitle: 'Let\'s Talk About Woodwinds!',
      bullets: [
        'What woodwind instruments can you name?',
        'How do you think woodwinds make sound?',
        'Does anyone play a woodwind instrument?'
      ]
    }
  },
  {
    id: 'woodwind-family-definition',
    label: 'What is a Woodwind Instrument?',
    description: 'Define what makes an instrument a woodwind instrument.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'What is a Woodwind Instrument?',
      subtitle: 'Instruments That Make Sound with Air and Vibration',
      bullets: [
        'Air vibrates inside a tube to create sound',
        'Some use a reed (thin piece of wood that vibrates) \u2014 some don\'t',
        'Covering and uncovering holes changes the pitch',
        'Fun fact: Not all woodwinds are made of wood! (the flute is metal)'
      ]
    }
  },
  {
    id: 'orchestral-woodwinds',
    label: 'Orchestral Woodwind Family',
    description: 'Introduce the four orchestral woodwind instruments.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'The Orchestral Woodwind Family',
      subtitle: 'Four Instruments We Will Focus On',
      bullets: [
        '\uD83C\uDFB5 Flute \u2014 highest, no reed, bright and airy',
        '\uD83C\uDFB5 Oboe \u2014 double reed, nasal and piercing',
        '\uD83C\uDFB5 Clarinet \u2014 single reed, warm and smooth',
        '\uD83C\uDFB5 Bassoon \u2014 double reed, deep and rich'
      ]
    }
  },
  {
    id: 'woodwind-family-showcase',
    label: 'See & Hear the Woodwinds',
    description: 'Watch and hear each woodwind instrument: Flute, Oboe, Clarinet, Bassoon.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'woodwind-showcase'
    }
  },
  {
    id: 'tempo-definition',
    label: 'What is Tempo?',
    description: 'Define tempo and introduce BPM.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'What is Tempo?',
      subtitle: 'The Speed of Music',
      sections: [
        {
          heading: 'Tempo',
          bullets: [
            'Tempo = the speed of the music',
            'Measured in BPM (beats per minute)',
            'Composers use Italian words to tell performers how fast to play'
          ]
        }
      ]
    }
  },
  {
    id: 'tempo-markings-showcase',
    label: 'Tempo Markings',
    description: 'Teach Largo, Adagio, Andante, Allegro, Presto.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'tempo-showcase'
    }
  },
  {
    id: 'tempo-changes',
    label: 'Accelerando & Ritardando',
    description: 'Teach accelerando and ritardando.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'tempo-changes'
    }
  },
  {
    id: 'tempo-charades-intro',
    label: 'Tempo Charades Instructions',
    description: 'Explain the Tempo Charades game.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Tempo Charades',
      subtitle: 'Can You Act Out the Tempo?',
      sections: [
        {
          heading: 'How to Play',
          bullets: [
            '1. One person comes to the front and acts out a tempo',
            '2. The class guesses which tempo term it is',
            '3. Fastest correct answer gets the most points!',
            '4. No talking, no sounds \u2014 movement only!'
          ]
        },
        {
          heading: 'Remember',
          bullets: [
            'Largo/Adagio = Slow',
            'Andante = Walking',
            'Allegro/Presto = Fast',
            'Accelerando = Getting faster',
            'Ritardando = Getting slower'
          ]
        }
      ]
    }
  },
  {
    id: 'tempo-charades-teacher-game',
    label: '🎮 Unlock Tempo Charades',
    description: 'CLASS GAME: Act out tempo terms for the class to guess!',
    bonusDescription: 'Can you act out accelerando and ritardando?',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 7,
    presentationView: {
      type: 'tempo-charades-teacher-game'
    }
  },
  {
    id: 'tempo-charades-results',
    label: '🏆 Tempo Charades Results',
    description: 'View class results and celebrate top scorers.',
    type: 'activity',
    duration: 1,
    presentationView: {
      type: 'tempo-charades-results'
    }
  },
  {
    id: 'small-group-instructions',
    label: 'Small Group Instructions',
    description: 'Explain how to play Tempo Charades in small groups.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Tempo Charades: Small Groups',
      subtitle: 'Everyone Gets a Turn!',
      sections: [
        {
          heading: 'Instructions',
          bullets: [
            'Get into groups of 3\u20134',
            'Join your group with a shared code',
            'Take turns being the actor \u2014 the game will tell you when it\'s your turn',
            'Everyone else guesses on their Chromebook'
          ]
        }
      ]
    }
  },
  {
    id: 'small-group-game',
    label: '🎮 Unlock Small Group Charades',
    description: 'SMALL GROUPS: Take turns acting and guessing tempo terms!',
    bonusDescription: 'Everyone gets a turn to be the actor!',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 9,
    presentationView: {
      type: 'activity-banner',
      title: 'Tempo Charades: Small Groups',
      subtitle: 'Group up! Take turns acting and guessing.'
    }
  },
  {
    id: 'small-group-results',
    label: 'Great Work! Let\'s Listen',
    description: 'Transition to active listening section.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Great Work! Let\'s Listen.',
      subtitle: '',
      sections: [
        {
          heading: 'Up Next',
          bullets: [
            'Now that you know your tempo terms, let\'s hear a composer use them',
            'Listen for: fast, slow, speeding up, slowing down',
            'Can you identify the woodwinds?'
          ]
        }
      ]
    }
  },
  {
    id: 'active-listening-intro',
    label: 'Hungarian Dance No. 5',
    description: 'Introduce Brahms and the piece.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Active Listening: Hungarian Dance No. 5',
      subtitle: '',
      sections: [
        {
          heading: 'About This Piece',
          bullets: [
            'Composer: Johannes Brahms (1833\u20131897, German)',
            'One of 21 Hungarian Dances inspired by Roma (Gypsy) music',
            'This is the most famous one!'
          ]
        },
        {
          heading: 'As You Listen',
          bullets: [
            'Show the tempo with your hands: move fast = fast tempo, move slow = slow tempo',
            'Listen for sudden changes \u2014 Brahms loves to surprise you!'
          ]
        }
      ]
    }
  },
  {
    id: 'active-listening-play',
    label: 'Listen: Hungarian Dance No. 5',
    description: 'Play the piece \u2014 students watch main screen and show tempo with hands.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'active-listening-play',
      audioPath: '/audio/classical/brahms-hungarian-dance-5.mp3',
      title: 'Hungarian Dance No. 5',
      composer: 'Johannes Brahms'
    }
  },
  {
    id: 'tempo-contrast-discussion',
    label: 'Tempo Surprises',
    description: 'Discussion: What tempo changes did you notice?',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Tempo Surprises',
      subtitle: 'What Did You Notice?',
      bullets: [
        'Where did Brahms surprise you with a tempo change?',
        'How did the slow sections feel compared to the fast sections?',
        'Did you hear any accelerando or ritardando?',
        'Did anyone notice the clarinet during the slow part?'
      ]
    }
  },
  {
    id: 'listening-map-instructions',
    label: 'Tempo Listening Map Instructions',
    description: 'Explain the Tempo Listening Map activity.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Tempo Listening Map',
      subtitle: '',
      sections: [
        {
          heading: 'Instructions',
          bullets: [
            'Mark the tempo throughout the piece using colors:',
            '\uD83D\uDD35 Blue = Slow, \uD83D\uDFE1 Yellow = Medium, \uD83D\uDD34 Red = Fast',
            'Draw arrows for accelerando (\u2192 speeding up) and ritardando (\u2192 slowing down)',
            '\u2B50 Bonus: Circle moments where you hear the clarinet'
          ]
        }
      ]
    }
  },
  {
    id: 'tempo-listening-map',
    label: '🎮 Unlock Tempo Listening Map',
    description: 'STUDENTS WORK: Create a Tempo Listening Map for Hungarian Dance No. 5.',
    bonusDescription: 'Bonus: Circle moments where you hear the clarinet!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'tempo-listening-map-directions'
    }
  },
  {
    id: 'reflection',
    label: 'Class Reflection',
    description: 'Wrap up with three reflection questions.',
    type: 'discussion',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Class Reflection',
      subtitle: '',
      sections: [
        {
          heading: 'Reflect on Today\'s Lesson',
          bullets: [
            '1. The tempo in Hungarian Dance No. 5 made me feel ______ because ______.',
            '2. The woodwind I noticed most was the ______ because ______.',
            '3. One tempo term I\'ll remember is ______ which means ______.'
          ]
        }
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'meet-woodwind-family': 'discussion',
    'woodwind-family-definition': 'summary',
    'orchestral-woodwinds': 'summary',
    'woodwind-family-showcase': 'summary',
    'tempo-definition': 'summary',
    'tempo-markings-showcase': 'summary',
    'tempo-changes': 'summary',
    'tempo-charades-intro': 'summary',
    'tempo-charades-teacher-game': 'tempo-charades',
    'tempo-charades-results': 'tempo-charades',
    'small-group-instructions': 'summary',
    'small-group-game': 'tempo-charades-small-group',
    'small-group-results': 'summary',
    'active-listening-intro': 'summary',
    'active-listening-play': 'summary',
    'tempo-contrast-discussion': 'discussion',
    'listening-map-instructions': 'summary',
    'tempo-listening-map': 'tempo-listening-map',
    'reflection': 'discussion'
  };
  return stageMap[stage];
};

// Woodwind instruments for the lesson
export const WOODWIND_INSTRUMENTS = [
  {
    id: 'flute',
    name: 'Flute',
    color: '#3B82F6',
    emoji: '\uD83C\uDFB5',
    description: 'Highest woodwind, bright and airy sound, no reed',
    audioFile: '/audio/orchestra-samples/woodwinds/flute/flute-demo.mp3',
    facts: [
      'The flute is the only common orchestral woodwind made entirely of metal',
      'Sound is produced by blowing across the mouthhole \u2014 no reed needed',
      'The flute plays the highest notes in the woodwind family'
    ]
  },
  {
    id: 'oboe',
    name: 'Oboe',
    color: '#8B5CF6',
    emoji: '\uD83C\uDFB5',
    description: 'Double reed, nasal and piercing tone',
    audioFile: '/audio/orchestra-samples/woodwinds/oboe/oboe-demo.mp3',
    facts: [
      'The oboe uses a double reed \u2014 two thin pieces of cane vibrate together',
      'The oboe tunes the entire orchestra with its clear, steady pitch',
      'It has a distinctive nasal, piercing sound'
    ]
  },
  {
    id: 'clarinet',
    name: 'Clarinet',
    color: '#10B981',
    emoji: '\uD83C\uDFB5',
    description: 'Single reed, warm and smooth sound with wide range',
    audioFile: '/audio/orchestra-samples/woodwinds/clarinet/clarinet-demo.mp3',
    facts: [
      'The clarinet uses a single reed attached to a mouthpiece',
      'It has the widest range of any woodwind instrument',
      'The clarinet can sound warm and smooth or bright and piercing'
    ]
  },
  {
    id: 'bassoon',
    name: 'Bassoon',
    color: '#EF4444',
    emoji: '\uD83C\uDFB5',
    description: 'Double reed, deep and rich sound, the bass of the woodwinds',
    audioFile: '/audio/orchestra-samples/woodwinds/bassoon/bassoon-demo.mp3',
    facts: [
      'The bassoon uses a double reed, like the oboe',
      'It is the lowest-sounding standard orchestral woodwind',
      'The bassoon has over 8 feet of tubing folded into its body'
    ]
  }
];

// Tempo markings
export const TEMPO_MARKINGS = [
  { symbol: 'Largo', name: 'Largo', meaning: 'Very slow', bpm: '40-60', color: '#93C5FD', emoji: '\uD83D\uDC0C' },
  { symbol: 'Adagio', name: 'Adagio', meaning: 'Slow, relaxed', bpm: '66-76', color: '#60A5FA', emoji: '\uD83D\uDC22' },
  { symbol: 'Andante', name: 'Andante', meaning: 'Walking speed', bpm: '76-108', color: '#FCD34D', emoji: '\uD83D\uDEB6' },
  { symbol: 'Allegro', name: 'Allegro', meaning: 'Fast, lively', bpm: '120-156', color: '#FBBF24', emoji: '\uD83C\uDFC3' },
  { symbol: 'Presto', name: 'Presto', meaning: 'Very fast', bpm: '168-200', color: '#EF4444', emoji: '\u26A1' }
];

// Tempo changes
export const TEMPO_CHANGES = [
  { symbol: 'accel.', name: 'Accelerando', meaning: 'Gradually getting faster', color: '#4ADE80' },
  { symbol: 'rit.', name: 'Ritardando', meaning: 'Gradually getting slower', color: '#F87171' }
];

// Vocabulary for this lesson
export const VOCABULARY = [
  { term: 'Woodwind', definition: 'A family of instruments that produce sound by blowing air through a tube' },
  { term: 'Reed', definition: 'A thin piece of wood (cane) that vibrates to produce sound' },
  { term: 'Flute', definition: 'A high-pitched woodwind instrument made of metal, played by blowing across a mouthhole' },
  { term: 'Oboe', definition: 'A double-reed woodwind with a nasal, piercing tone that tunes the orchestra' },
  { term: 'Clarinet', definition: 'A single-reed woodwind with a warm, smooth sound and wide range' },
  { term: 'Bassoon', definition: 'A large double-reed woodwind that plays the lowest notes in the woodwind family' },
  { term: 'Tempo', definition: 'The speed of the music, measured in beats per minute (BPM)' },
  { term: 'BPM', definition: 'Beats per minute \u2014 how we measure the speed of music' },
  { term: 'Largo', definition: 'Very slow tempo (40\u201360 BPM)' },
  { term: 'Adagio', definition: 'Slow, relaxed tempo (66\u201376 BPM)' },
  { term: 'Andante', definition: 'Walking speed tempo (76\u2013108 BPM)' },
  { term: 'Allegro', definition: 'Fast, lively tempo (120\u2013156 BPM)' },
  { term: 'Presto', definition: 'Very fast tempo (168\u2013200 BPM)' },
  { term: 'Accelerando', definition: 'Gradually getting faster' },
  { term: 'Ritardando', definition: 'Gradually getting slower' }
];
