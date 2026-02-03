// File: /lessons/listening-lab/lesson1/lesson1Config.jsx
// Lesson 1: Meet the Orchestra - Instruments & Timbre
// Students learn to identify instrument families by sound
//
// ========================================
// AUDIO CREDITS (CC BY License)
// ========================================
// Philharmonia Orchestra Sound Sample Library
// https://philharmonia.co.uk/resources/sound-samples/
// Free to use in commercial work
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
    subtitle: 'Slides → Instrument Families',
    color: 'purple',
    estimatedTime: 12,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'Meet the Orchestra',
        description: 'Introduce the lesson and essential question.',
        duration: 1
      },
      {
        id: 'opening-hook',
        type: 'discussion',
        label: 'Opening Hook',
        description: 'What instruments do you know? Think you could identify them by sound?',
        duration: 3
      },
      {
        id: 'string-family',
        type: 'summary',
        label: 'String Family',
        description: 'Violin, Viola, Cello, Bass - warm and emotional.',
        duration: 2
      },
      {
        id: 'woodwind-family',
        type: 'summary',
        label: 'Woodwind Family',
        description: 'Flute, Clarinet, Oboe, Bassoon - airy and expressive.',
        duration: 2
      },
      {
        id: 'brass-family',
        type: 'summary',
        label: 'Brass Family',
        description: 'Trumpet, Horn, Trombone, Tuba - powerful and bold.',
        duration: 2
      },
      {
        id: 'percussion-family',
        type: 'summary',
        label: 'Percussion Family',
        description: 'Timpani, Snare, Cymbals, and more - rhythm and drama.',
        duration: 2
      }
    ]
  },
  {
    id: 'practice',
    title: '2. Practice',
    subtitle: 'Guess That Instrument',
    color: 'purple',
    estimatedTime: 13,
    stages: [
      {
        id: 'game-instructions',
        type: 'summary',
        label: 'Game Instructions',
        description: 'Explain the three difficulty levels.',
        duration: 1
      },
      {
        id: 'guess-that-instrument',
        type: 'activity',
        label: '🎮 Unlock Guess That Instrument',
        duration: 12,
        hasTimer: false,
        trackProgress: true,
        description: 'CLASS GAME: Identify instruments by ear!',
        bonusDescription: 'Bonus: Try Level 3 - instruments that sound similar!'
      }
    ]
  },
  {
    id: 'create',
    title: '3. Create',
    subtitle: 'Listening Map #1',
    color: 'purple',
    estimatedTime: 18,
    stages: [
      {
        id: 'listening-map-tutorial',
        type: 'video',
        label: 'Listening Map Tutorial',
        description: 'PLAY VIDEO: How to use the Listening Map.',
        duration: 3
      },
      {
        id: 'listening-map-instructions',
        type: 'summary',
        label: 'Listening Map Instructions',
        description: 'Explain the activity: track instrument families as you listen.',
        duration: 1
      },
      {
        id: 'listening-map-instruments',
        type: 'activity',
        label: '🎮 Unlock Listening Map',
        duration: 15,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Mark when each instrument family enters.',
        bonusDescription: 'Bonus: Identify specific instruments, not just families!'
      }
    ]
  },
  {
    id: 'reflect',
    title: '4. Reflect',
    subtitle: 'Exit Ticket',
    color: 'purple',
    estimatedTime: 5,
    stages: [
      {
        id: 'reflection',
        type: 'activity',
        label: '🎮 Unlock Reflection',
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Which family was easiest/hardest to identify?',
        bonusDescription: ''
      }
    ]
  },
  {
    id: 'bonus',
    title: '5. Bonus',
    subtitle: 'Orchestra Lab Partner Game',
    color: 'amber',
    estimatedTime: 10,
    stages: [
      {
        id: 'orchestra-lab-instructions',
        type: 'summary',
        label: 'Orchestra Lab Instructions',
        description: 'Explain the partner challenge: one picks, one guesses.',
        duration: 1
      },
      {
        id: 'orchestra-lab',
        type: 'activity',
        label: '🎮 Unlock Orchestra Lab',
        duration: 10,
        hasTimer: false,
        trackProgress: false,
        isBonus: true,
        isPartnerActivity: true,
        description: 'PARTNER GAME: Take turns picking and guessing instruments.',
        bonusDescription: ''
      }
    ]
  }
];

export const lesson1Config = {
  id: 'listening-lab-lesson1',
  lessonPath: '/lessons/listening-lab/lesson1',
  title: "Meet the Orchestra",
  subtitle: "Instruments & Timbre",
  learningObjectives: [
    "Identify the four instrument families by sound.",
    "Describe how different instruments contribute to mood.",
    "Create a Listening Map tracking instrument entries."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "guess-that-instrument",
      title: "Guess That Instrument",
      estimatedTime: "12 min"
    },
    {
      id: 2,
      type: "listening-map-instruments",
      title: "Listening Map #1 - Instruments",
      estimatedTime: "15 min"
    },
    {
      id: 3,
      type: "listening-lab-reflection",
      title: "Reflection",
      estimatedTime: "5 min"
    },
    {
      id: 4,
      type: "orchestra-lab",
      title: "Orchestra Lab Partner Game",
      estimatedTime: "10 min",
      isBonus: true,
      isPartnerActivity: true
    }
  ]
};

// ========================================
// LESSON STAGES - With presentationView data for each stage
// Code-based slides (no PNG images required)
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
    label: 'Meet the Orchestra',
    description: 'Introduce the lesson and essential question.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Meet the Orchestra',
      subtitle: 'Instruments & Timbre',
      sections: [
        {
          heading: 'Essential Question',
          bullets: ['How does the sound of an instrument affect the mood of the music?']
        },
        {
          heading: 'I Can Statement',
          bullets: ['I can identify instruments by their sound and describe how they contribute to the mood of a piece.']
        },
        {
          heading: 'Today We Will',
          bullets: [
            'Learn the four families of the orchestra',
            'Play Guess That Instrument',
            'Create your first Listening Map'
          ]
        }
      ]
    }
  },
  {
    id: 'opening-hook',
    label: 'Opening Hook',
    description: 'What instruments do you know? Think you could identify them by sound?',
    type: 'discussion',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Listen: What Do You Hear?',
      subtitle: 'Discussion Time',
      bullets: [
        'What are some instruments of the orchestra you know?',
        'Think you could identify them just by hearing them play?',
        "Let's find out!"
      ]
    }
  },
  {
    id: 'string-family',
    label: 'String Family',
    description: 'Violin, Viola, Cello, Bass - warm and emotional.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'instrument-family',
      title: 'The String Family',
      familyColor: '#3B82F6',
      instruments: ['Violin', 'Viola', 'Cello', 'Double Bass'],
      sound: 'Warm, emotional, smooth — strings often carry the melody',
      facts: [
        'Strings are the largest section of the orchestra',
        'All string instruments use a bow or can be plucked (pizzicato)',
        'From high to low: Violin → Viola → Cello → Bass'
      ],
      audioPath: '/audio/orchestra-samples/families/strings-sample.mp3'
    }
  },
  {
    id: 'woodwind-family',
    label: 'Woodwind Family',
    description: 'Flute, Clarinet, Oboe, Bassoon - airy and expressive.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'instrument-family',
      title: 'The Woodwind Family',
      familyColor: '#10B981',
      instruments: ['Flute', 'Clarinet', 'Oboe', 'Bassoon'],
      sound: 'Airy, playful, sometimes haunting',
      facts: [
        'A solo flute and a solo oboe sound very different even though they\'re in the same family',
        'The flute is metal but is still considered a woodwind',
        'The oboe\'s distinct sound often tunes the orchestra'
      ],
      audioPath: '/audio/orchestra-samples/families/woodwinds-sample.mp3'
    }
  },
  {
    id: 'brass-family',
    label: 'Brass Family',
    description: 'Trumpet, Horn, Trombone, Tuba - powerful and bold.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'instrument-family',
      title: 'The Brass Family',
      familyColor: '#EF4444',
      instruments: ['Trumpet', 'French Horn', 'Trombone', 'Tuba'],
      sound: 'Powerful, heroic, bold',
      facts: [
        'Think about it: When you hear brass in a movie, what\'s usually happening?',
        'Brass instruments make sound through buzzing lips into a mouthpiece',
        'The tuba provides the bass foundation for the whole orchestra'
      ],
      audioPath: '/audio/orchestra-samples/families/brass-sample.mp3'
    }
  },
  {
    id: 'percussion-family',
    label: 'Percussion Family',
    description: 'Timpani, Snare, Cymbals, and more - rhythm and drama.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'instrument-family',
      title: 'The Percussion Family',
      familyColor: '#F59E0B',
      instruments: ['Timpani', 'Snare Drum', 'Bass Drum', 'Cymbals', 'Xylophone', 'Triangle'],
      sound: 'Rhythm, energy, drama, accent',
      facts: [
        'Percussion can be loud and explosive or soft and subtle',
        'Timpani (kettle drums) can actually be tuned to specific pitches',
        'The triangle may be small, but it cuts through the entire orchestra!'
      ],
      audioPath: '/audio/orchestra-samples/families/percussion-sample.mp3'
    }
  },
  {
    id: 'game-instructions',
    label: 'Game Instructions',
    description: 'Explain the three difficulty levels.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Guess That Instrument',
      subtitle: 'Choose Your Level',
      sections: [
        {
          heading: 'Level 1 — Easy',
          bullets: ['Identify instrument FAMILIES: Strings, Woodwinds, Brass, or Percussion']
        },
        {
          heading: 'Level 2 — Medium',
          bullets: ['Identify specific instruments that sound VERY DIFFERENT (like Violin vs. Tuba)']
        },
        {
          heading: 'Level 3 — Hard',
          bullets: ['Identify specific instruments that sound SIMILAR (like Violin vs. Viola)']
        }
      ]
    }
  },
  {
    id: 'guess-that-instrument',
    label: '🎮 Unlock Guess That Instrument',
    description: 'CLASS GAME: Identify instruments by ear!',
    bonusDescription: 'Bonus: Try Level 3 - instruments that sound similar!',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 12,
    presentationView: {
      type: 'guess-instrument-teacher'
    }
  },
  {
    id: 'listening-map-tutorial',
    label: 'Listening Map Tutorial',
    description: 'PLAY VIDEO: How to use the Listening Map.',
    type: 'video',
    duration: 3,
    presentationView: {
      type: 'video',
      videoPath: '/lessons/film-music-project/lesson2/ListeningMapTutorial.mp4',
      title: 'How to Use the Listening Map'
    }
  },
  {
    id: 'listening-map-instructions',
    label: 'Listening Map Instructions',
    description: 'Explain the activity: track instrument families as you listen.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Listening Map #1: Instruments',
      subtitle: 'Track the Orchestra',
      sections: [
        {
          heading: 'Color Coding',
          bullets: [
            '🔵 Strings = Blue',
            '🟢 Woodwinds = Green',
            '🔴 Brass = Red',
            '🟡 Percussion = Yellow'
          ]
        },
        {
          heading: 'Instructions',
          bullets: [
            'Step 1: Listen to the music with your class — don\'t mark anything yet',
            'Step 2: Discuss what you heard with the class',
            'Step 3: Create your own Listening Map — 15 minutes'
          ]
        }
      ]
    }
  },
  {
    id: 'listening-map-instruments',
    label: '🎮 Unlock Listening Map',
    description: 'STUDENTS WORK: Mark when each instrument family enters.',
    bonusDescription: 'Bonus: Identify specific instruments, not just families!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 15,
    presentationView: {
      type: 'activity-banner',
      title: 'Listening Map Activity',
      subtitle: 'Mark when each instrument family enters the music'
    }
  },
  {
    id: 'reflection',
    label: '🎮 Unlock Reflection',
    description: 'STUDENTS WORK: Which family was easiest/hardest to identify?',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Reflect: What Did You Hear?',
      subtitle: 'Exit Ticket',
      bullets: [
        'Which instrument family was EASIEST for you to identify? Why?',
        'Which instrument family was HARDEST? What made it tricky?',
        'Name ONE THING you heard today that you wouldn\'t have noticed before this lesson.'
      ]
    }
  },
  {
    id: 'orchestra-lab-instructions',
    label: 'Orchestra Lab Instructions',
    description: 'Explain the partner challenge: one picks, one guesses.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Orchestra Lab: Partner Challenge',
      subtitle: 'Bonus Activity',
      sections: [
        {
          heading: 'Setup',
          bullets: [
            'Pair up with a partner — each on your own Chromebook',
            'Join a room with your partner using a room code'
          ]
        },
        {
          heading: 'How It Works',
          bullets: [
            'Player 1 taps an instrument — only Player 2 hears the sound',
            'Player 2 guesses which instrument it is',
            'After the guess, both see if it was correct',
            'Roles swap — keep going until time is up!'
          ]
        }
      ]
    }
  },
  {
    id: 'orchestra-lab',
    label: '🎮 Unlock Orchestra Lab',
    description: 'PARTNER GAME: Take turns picking and guessing instruments.',
    isBonus: true,
    isPartnerActivity: true,
    hasProgress: false,
    type: 'activity',
    hasTimer: false,
    duration: 10,
    presentationView: {
      type: 'activity-banner',
      title: 'Orchestra Lab',
      subtitle: 'Partner Challenge — One picks, one guesses!'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'opening-hook': 'discussion',
    'string-family': 'summary',
    'woodwind-family': 'summary',
    'brass-family': 'summary',
    'percussion-family': 'summary',
    'game-instructions': 'summary',
    'guess-that-instrument': 'guess-that-instrument',
    'listening-map-tutorial': 'video',
    'listening-map-instructions': 'summary',
    'listening-map-instruments': 'listening-map-instruments',
    'reflection': 'listening-lab-reflection',
    'orchestra-lab-instructions': 'summary',
    'orchestra-lab': 'orchestra-lab'
  };
  return stageMap[stage];
};

// Instrument families for the lesson
export const INSTRUMENT_FAMILIES = [
  {
    id: 'strings',
    name: 'Strings',
    color: '#3B82F6', // blue
    instruments: ['violin', 'viola', 'cello', 'bass'],
    description: 'Warm, emotional, smooth — strings often carry the melody'
  },
  {
    id: 'woodwinds',
    name: 'Woodwinds',
    color: '#10B981', // green
    instruments: ['flute', 'clarinet', 'oboe', 'bassoon'],
    description: 'Airy, playful, sometimes haunting'
  },
  {
    id: 'brass',
    name: 'Brass',
    color: '#EF4444', // red
    instruments: ['trumpet', 'french-horn', 'trombone', 'tuba'],
    description: 'Powerful, heroic, bold'
  },
  {
    id: 'percussion',
    name: 'Percussion',
    color: '#F59E0B', // amber
    instruments: ['timpani', 'snare-drum', 'bass-drum', 'cymbals', 'xylophone', 'triangle'],
    description: 'Rhythm, energy, drama, accent'
  }
];

// Individual instruments with metadata
export const INSTRUMENTS = {
  // Strings
  violin: { id: 'violin', name: 'Violin', family: 'strings', audioFile: '/audio/orchestra-samples/strings/violin.mp3' },
  viola: { id: 'viola', name: 'Viola', family: 'strings', audioFile: '/audio/orchestra-samples/strings/viola.mp3' },
  cello: { id: 'cello', name: 'Cello', family: 'strings', audioFile: '/audio/orchestra-samples/strings/cello.mp3' },
  bass: { id: 'bass', name: 'Bass', family: 'strings', audioFile: '/audio/orchestra-samples/strings/bass.mp3' },

  // Woodwinds
  flute: { id: 'flute', name: 'Flute', family: 'woodwinds', audioFile: '/audio/orchestra-samples/woodwinds/flute.mp3' },
  clarinet: { id: 'clarinet', name: 'Clarinet', family: 'woodwinds', audioFile: '/audio/orchestra-samples/woodwinds/clarinet.mp3' },
  oboe: { id: 'oboe', name: 'Oboe', family: 'woodwinds', audioFile: '/audio/orchestra-samples/woodwinds/oboe.mp3' },
  bassoon: { id: 'bassoon', name: 'Bassoon', family: 'woodwinds', audioFile: '/audio/orchestra-samples/woodwinds/bassoon.mp3' },

  // Brass
  trumpet: { id: 'trumpet', name: 'Trumpet', family: 'brass', audioFile: '/audio/orchestra-samples/brass/trumpet.mp3' },
  'french-horn': { id: 'french-horn', name: 'French Horn', family: 'brass', audioFile: '/audio/orchestra-samples/brass/french-horn.mp3' },
  trombone: { id: 'trombone', name: 'Trombone', family: 'brass', audioFile: '/audio/orchestra-samples/brass/trombone.mp3' },
  tuba: { id: 'tuba', name: 'Tuba', family: 'brass', audioFile: '/audio/orchestra-samples/brass/tuba.mp3' },

  // Percussion
  timpani: { id: 'timpani', name: 'Timpani', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/timpani.mp3' },
  'snare-drum': { id: 'snare-drum', name: 'Snare Drum', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/snare-drum.mp3' },
  'bass-drum': { id: 'bass-drum', name: 'Bass Drum', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/bass-drum.mp3' },
  cymbals: { id: 'cymbals', name: 'Cymbals', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/cymbals.mp3' },
  xylophone: { id: 'xylophone', name: 'Xylophone', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/xylophone.mp3' },
  triangle: { id: 'triangle', name: 'Triangle', family: 'percussion', audioFile: '/audio/orchestra-samples/percussion/triangle.mp3' }
};
