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
        id: 'agenda',
        type: 'summary',
        label: 'Agenda',
        description: 'Show students what we will learn today.',
        duration: 1
      },
      {
        id: 'essential-question',
        type: 'summary',
        label: 'Essential Question',
        description: 'Introduce the essential question and I Can statement.',
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
        label: 'What is a String Instrument?',
        description: 'Define what makes an instrument a string instrument.',
        duration: 2
      },
      {
        id: 'orchestral-strings',
        type: 'summary',
        label: 'Orchestral String Family',
        description: 'Introduce the four orchestral string instruments.',
        duration: 2
      },
      {
        id: 'string-family-showcase',
        type: 'summary',
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
    title: '2. Dynamics Dash',
    subtitle: 'Vivaldi\'s Spring',
    color: 'blue',
    estimatedTime: 12,
    stages: [
      {
        id: 'dynamics-dash-intro',
        type: 'summary',
        label: 'Dynamics Dash Instructions',
        description: 'Explain the game: identify dynamics in Spring.',
        duration: 2
      },
      {
        id: 'dynamics-dash',
        type: 'activity',
        label: '🎮 Unlock Dynamics Dash',
        duration: 8,
        hasTimer: false,
        trackProgress: true,
        description: 'CLASS GAME: Identify dynamics in Vivaldi\'s Spring!',
        bonusDescription: 'Listen carefully - can you hear the terraced dynamics?'
      },
      {
        id: 'dynamics-dash-results',
        type: 'activity',
        label: '🏆 Dynamics Dash Results',
        description: 'View class leaderboard and celebrate top scorers.',
        duration: 2
      }
    ]
  },
  {
    id: 'create',
    title: '3. Create',
    subtitle: 'Dynamics Listening Map',
    color: 'blue',
    estimatedTime: 15,
    stages: [
      {
        id: 'listening-map-intro',
        type: 'summary',
        label: 'Listening Map',
        description: 'Introduce the listening map activity.',
        duration: 1
      },
      {
        id: 'listening-map-instructions',
        type: 'summary',
        label: 'Listening Map Video',
        description: 'Watch the introduction video.',
        duration: 2
      },
      {
        id: 'dynamics-listening-map',
        type: 'activity',
        label: '🎮 Unlock Dynamics Listening Map',
        duration: 12,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Create a Dynamics Listening Map for Spring.',
        bonusDescription: 'Early finishers add instruments, tempo, melody direction.'
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
        type: 'discussion',
        label: 'Class Reflection',
        duration: 5,
        description: 'Wrap up with three reflection questions.',
        bonusDescription: ''
      }
    ]
  },
  {
    id: 'bonus',
    title: '5. Bonus',
    subtitle: 'Extra Activities',
    color: 'purple',
    estimatedTime: 15,
    stages: [
      {
        id: 'bonus-intro',
        type: 'summary',
        label: 'Bonus Activities',
        description: 'Extra activities for classes with additional time.',
        duration: 1
      },
      {
        id: 'strings-dynamics-lab',
        type: 'activity',
        label: '🎮 Unlock Strings & Dynamics Lab',
        duration: 12,
        hasTimer: false,
        trackProgress: true,
        description: 'Partner game: Pick an instrument and dynamic, partner guesses!',
        bonusDescription: 'Can you identify the instrument AND the dynamic level?'
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
      type: "dynamics-dash",
      title: "Dynamics Dash",
      estimatedTime: "8 min"
    },
    {
      id: 2,
      type: "dynamics-listening-map",
      title: "Dynamics Listening Map",
      estimatedTime: "12 min"
    },
    {
      id: 3,
      type: "listening-lab-reflection",
      title: "Reflection",
      estimatedTime: "5 min"
    },
    {
      id: 4,
      type: "strings-dynamics-lab",
      title: "Strings & Dynamics Lab",
      estimatedTime: "12 min",
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
    description: 'Students enter session code to join.',
    type: 'waiting'
  },
  {
    id: 'agenda',
    label: 'Agenda',
    description: 'Show students what we will learn today.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Strings & Dynamics',
      subtitle: 'Feel the Power of Soft and Loud',
      sections: [
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
    id: 'essential-question',
    label: 'Essential Question',
    description: 'Introduce the essential question and I Can statement.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Essential Question',
      subtitle: '',
      sections: [
        {
          heading: 'Essential Question',
          bullets: ['How do dynamics (soft and loud) change the way music makes us feel?']
        },
        {
          heading: 'I Can Statement',
          bullets: ['I can identify string instruments and describe dynamics using proper musical terms.']
        }
      ]
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
    label: 'What is a String Instrument?',
    description: 'Define what makes an instrument a string instrument.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'What is a String Instrument?',
      subtitle: 'Instruments That Make Sound with Vibrating Strings',
      bullets: [
        'A string instrument makes sound when its strings vibrate',
        'Players can bow the strings (with a stick called a bow) or pluck them',
        'The body of the instrument amplifies the sound'
      ]
    }
  },
  {
    id: 'orchestral-strings',
    label: 'Orchestral String Family',
    description: 'Introduce the four orchestral string instruments.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'The Orchestral String Family',
      subtitle: 'Four Instruments We Will Focus On',
      bullets: [
        '🎻 Violin - smallest, highest sound',
        '🎻 Viola - slightly larger, warmer sound',
        '🎻 Cello - large, rich sound',
        '🎻 Double Bass - largest, deepest sound'
      ]
    }
  },
  {
    id: 'string-family-showcase',
    label: 'See & Hear the Strings',
    description: 'Watch and hear each string instrument: Violin → Viola → Cello → Bass.',
    type: 'summary',
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
      type: 'dynamics-showcase'
    }
  },
  {
    id: 'gradual-changes',
    label: 'Gradual Changes',
    description: 'Teach crescendo and decrescendo.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'crescendo-decrescendo'
    }
  },
  {
    id: 'dynamics-dash-intro',
    label: 'Dynamics Dash Instructions',
    description: 'Explain the Dynamics Dash game.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Dynamics Dash',
      subtitle: 'Can You Identify the Dynamics?',
      sections: [
        {
          heading: 'How to Play',
          bullets: [
            '1. Listen to a 6-second clip from Spring',
            '2. Identify the DYNAMIC LEVEL (pp, p, mp, mf, f, ff)',
            '3. Answer quickly for bonus points!',
            '4. 9 questions total'
          ]
        },
        {
          heading: 'Remember',
          bullets: [
            'pp/p = Soft (piano)',
            'mp/mf = Medium',
            'f/ff = Loud (forte)'
          ]
        }
      ]
    }
  },
  {
    id: 'dynamics-dash',
    label: '🎮 Unlock Dynamics Dash',
    description: 'CLASS GAME: Identify dynamics in Vivaldi\'s Spring!',
    bonusDescription: 'Listen for terraced dynamics!',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 8,
    presentationView: {
      type: 'dynamics-dash-class-game'
    }
  },
  {
    id: 'dynamics-dash-results',
    label: '🏆 Dynamics Dash Results',
    description: 'View class leaderboard and celebrate top scorers.',
    type: 'activity',
    duration: 2,
    presentationView: {
      type: 'dynamics-dash-results'
    }
  },
  {
    id: 'listening-map-intro',
    label: 'Listening Map',
    description: 'Introduce the listening map activity.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Listening Map',
      subtitle: '',
      bullets: [
        'Next we will watch a 2 minute video'
      ]
    }
  },
  {
    id: 'listening-map-instructions',
    label: 'Listening Map Video',
    description: 'Watch the introduction video for the listening map activity.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'video',
      videoPath: '/lessons/videos/film-music-loop-project/Listening Map Introduction.mp4'
    }
  },
  {
    id: 'dynamics-listening-map',
    label: '🎮 Unlock Dynamics Listening Map',
    description: 'STUDENTS WORK: Create a Dynamics Listening Map for Spring.',
    bonusDescription: 'Early finishers add instruments, tempo, melody direction.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 12,
    presentationView: {
      type: 'dynamics-listening-map-directions'
    }
  },
  {
    id: 'reflection',
    label: 'Class Reflection',
    description: 'Wrap up with three reflection questions.',
    type: 'discussion',
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Class Reflection',
      subtitle: '',
      sections: [
        {
          heading: 'Wrap Up Questions',
          bullets: [
            '1. What is one dynamic marking you learned today?',
            '2. How did the dynamics in Spring make you feel?',
            '3. What was your favorite part of creating the listening map?'
          ]
        }
      ]
    }
  },
  {
    id: 'bonus-intro',
    label: 'Bonus Activities',
    description: 'Extra activities for classes with additional time.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Bonus Activities',
      subtitle: 'Extra Time?',
      bullets: [
        'These activities are for classes with extra time.',
        'Choose one or more to extend the lesson!'
      ]
    }
  },
  {
    id: 'strings-dynamics-lab',
    label: '🎮 Unlock Strings & Dynamics Lab',
    description: 'Partner game: Pick an instrument and dynamic, partner guesses!',
    bonusDescription: 'Can you identify the instrument AND the dynamic level?',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 12,
    presentationView: {
      type: 'activity-banner',
      title: 'Strings & Dynamics Lab',
      subtitle: 'Partner up! One picks, one guesses.'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'agenda': 'summary',
    'essential-question': 'summary',
    'meet-string-family': 'discussion',
    'string-family-definition': 'summary',
    'orchestral-strings': 'summary',
    'string-family-showcase': 'string-family-showcase',
    'dynamics-markings': 'summary',
    'gradual-changes': 'summary',
    'dynamics-dash-intro': 'summary',
    'dynamics-dash': 'dynamics-dash',
    'dynamics-dash-results': 'dynamics-dash',
    'listening-map-intro': 'summary',
    'listening-map-instructions': 'summary',
    'dynamics-listening-map': 'dynamics-listening-map',
    'reflection': 'listening-lab-reflection',
    'bonus-intro': 'summary',
    'strings-dynamics-lab': 'strings-dynamics-lab'
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
