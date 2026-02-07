// File: /src/lessons/listening-lab/lesson2/summarySlideContent.js
// All instructional text and content for Lesson 2 - Woodwinds & Tempo
// "Feel the Speed of Music"
// Featured Piece: Hungarian Dance No. 5 by Johannes Brahms

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Slide 1 - Title
  welcomeIntro: {
    title: 'Woodwinds & Tempo',
    subtitle: 'Feel the Speed of Music',
    essentialQuestion: 'How does tempo change the way music makes us feel?',
    iCanStatements: [
      'I can identify woodwind instruments by sight and sound.',
      'I can describe tempo using Italian musical terms.',
      'I can hear and label tempo changes in music.'
    ]
  },

  // Slide 2 - Opening Hook / Sound Mystery
  openingHook: {
    title: 'Sound Mystery',
    subtitle: 'Can you feel the speed change?',
    icon: '🎵',
    audioPath: '/audio/classical/brahms-hungarian-dance-5-opening.mp3',
    revealText: 'This is "Hungarian Dance No. 5" by Brahms — one of the most famous tempo-changing pieces ever!',
    discussionPrompts: [
      'Did the music stay the same speed the whole time?',
      'Where did it speed up or slow down?',
      'How did the speed changes make you feel?'
    ],
    teacherNote: 'Play the opening of Hungarian Dance No. 5 without context. Let students notice the dramatic tempo changes. Ask them to tap the beat — they will feel it shift.'
  },

  // Slide 3 - Woodwind Family
  woodwindFamily: {
    title: 'The Woodwind Family',
    icon: '🎵',
    familyColor: '#06B6D4',
    instruments: [
      {
        name: 'Flute',
        description: 'Highest, no reed, bright and airy',
        color: '#06B6D4',
        audioPath: '/audio/orchestra-samples/woodwinds/flute.mp3'
      },
      {
        name: 'Oboe',
        description: 'Double reed, nasal and piercing',
        color: '#8B5CF6',
        audioPath: '/audio/orchestra-samples/woodwinds/oboe.mp3'
      },
      {
        name: 'Clarinet',
        description: 'Single reed, warm and smooth',
        color: '#3B82F6',
        audioPath: '/audio/orchestra-samples/woodwinds/clarinet.mp3'
      },
      {
        name: 'Bassoon',
        description: 'Double reed, deep and rich',
        color: '#EF4444',
        audioPath: '/audio/orchestra-samples/woodwinds/bassoon.mp3'
      }
    ],
    keyPoint: 'Woodwinds produce sound by blowing air through a tube — with or without a reed!',
    facts: [
      'Woodwinds sit in the middle of the orchestra, behind the strings',
      'Some use a single reed (clarinet), some use a double reed (oboe, bassoon), and one uses no reed at all (flute)',
      'From high to low: Flute → Oboe → Clarinet → Bassoon'
    ],
    teacherNote: 'Play short clips of each instrument. Emphasize the different reed types — this is what gives each woodwind its unique sound.'
  },

  // Slide 4 - Tempo Vocabulary
  tempoVocabulary: {
    title: 'Tempo: The Speed of Music',
    subtitle: 'From Very Slow to Very Fast',
    icon: '⏱️',
    tempoMarkings: [
      { symbol: 'Largo', meaning: 'Very slow', bpm: '40-60', emoji: '🐌', color: '#93C5FD' },
      { symbol: 'Adagio', meaning: 'Slow, relaxed', bpm: '66-76', emoji: '🐢', color: '#60A5FA' },
      { symbol: 'Andante', meaning: 'Walking speed', bpm: '76-108', emoji: '🚶', color: '#FCD34D' },
      { symbol: 'Allegro', meaning: 'Fast, lively', bpm: '120-156', emoji: '🏃', color: '#FBBF24' },
      { symbol: 'Presto', meaning: 'Very fast', bpm: '168-200', emoji: '⚡', color: '#EF4444' }
    ],
    tempoChanges: [
      { symbol: 'accel.', name: 'Accelerando', meaning: 'Gradually getting faster', icon: '📈' },
      { symbol: 'rit.', name: 'Ritardando', meaning: 'Gradually getting slower', icon: '📉' }
    ],
    activity: {
      instruction: 'Practice with your body!',
      description: 'Teacher calls out a tempo — students walk/move at that speed (Largo = slow motion, Presto = speed walk)'
    },
    teacherNote: 'This is the core vocabulary for the lesson. Have students physically move to each tempo before moving on. This kinesthetic connection is key.'
  },

  // Slide 5 - Game Instructions
  gameInstructions: {
    title: 'Tempo Charades',
    subtitle: 'Can You Feel the Beat?',
    icon: '🎮',
    howToPlay: [
      '1. Listen to a music clip',
      '2. Identify the TEMPO (Largo, Adagio, Andante, Allegro, or Presto)',
      '3. Watch for TEMPO CHANGES (Accelerando or Ritardando)',
      '4. Answer quickly for bonus points!'
    ],
    tips: [
      { tempo: 'Largo', tip: 'Super slow — like slow motion' },
      { tempo: 'Adagio', tip: 'Slow and relaxed — like a lullaby' },
      { tempo: 'Andante', tip: 'Walking pace — comfortable' },
      { tempo: 'Allegro', tip: 'Fast and energetic — like a jog' },
      { tempo: 'Presto', tip: 'Super fast — like running' }
    ],
    scoring: [
      { action: 'Correct tempo', points: '+10' },
      { action: 'Correct tempo change', points: '+15' },
      { action: 'Speed bonus', points: '+2 to +10' }
    ],
    teacherNote: 'This game reinforces tempo identification. Encourage students to tap along to find the tempo before answering.'
  },

  // Slide 6 - Active Listening Instructions
  activeListeningIntro: {
    title: 'Active Listening: Hungarian Dance No. 5',
    subtitle: 'Move to the Tempo!',
    icon: '🖐️',
    instructions: [
      'As you listen, show the TEMPO with your body:',
      '🐌 SLOW = Sway gently side to side',
      '🚶 MEDIUM = Pat your knees steadily',
      '🏃 FAST = Tap the desk quickly',
      'Listen for SUDDEN CHANGES — Brahms loves to surprise us!'
    ],
    audioPath: '/audio/classical/brahms-hungarian-dance-5-excerpt.mp3',
    duration: 120,
    teacherNote: 'First listen is just for experiencing the music. Students show tempo with body movements. This piece has dramatic tempo changes — watch for students reacting to the shifts.'
  },

  // Slide 7 - Tempo Contrast Discussion
  tempoContrast: {
    title: 'Tempo Contrast',
    subtitle: 'The Element of Surprise',
    icon: '💥',
    discussionQuestions: [
      'When did Brahms SURPRISE you with a sudden tempo change?',
      'Did you notice any ACCELERANDOS (getting faster)?',
      'Did you notice any RITARDANDOS (getting slower)?',
      'How did these tempo changes make you FEEL?'
    ],
    keyTakeaway: 'Composers use tempo contrast to create excitement, tension, and keep listeners on their toes!',
    teacherNote: 'This discussion connects the active listening to the vocabulary. Help students use the Italian terms they learned.'
  },

  // Slide 8 - Listening Map Instructions
  listeningMapInstructions: {
    title: 'Tempo Listening Map',
    subtitle: 'Track the Speed Changes',
    icon: '🗺️',
    whatToMark: [
      '🎵 Label WOODWIND INSTRUMENTS when you hear them prominently',
      '⏱️ Mark TEMPO at key moments (Largo, Adagio, Andante, Allegro, Presto)',
      '📈 Draw ACCELERANDO arrows where music speeds up',
      '📉 Draw RITARDANDO arrows where music slows down'
    ],
    colorCoding: [
      { tempo: 'Slow (Largo, Adagio)', color: 'blue', hex: '#3B82F6' },
      { tempo: 'Medium (Andante)', color: 'yellow', hex: '#FBBF24' },
      { tempo: 'Fast (Allegro, Presto)', color: 'red', hex: '#EF4444' }
    ],
    teacherNote: 'Students will listen to the full piece and create a visual map of the tempo changes they hear.'
  },

  // Slide 9 - Reflection / Exit Ticket
  reflection: {
    title: 'Reflect: Feel the Tempo',
    subtitle: 'Exit Ticket',
    icon: '⭐',
    prompts: [
      'The tempo in Hungarian Dance No. 5 made me feel ______ because ______.',
      'The woodwind I noticed most was the ______ because ______.',
      'One tempo term I\'ll remember is ______ which means ______.'
    ],
    thinkAbout: [
      'Which tempo moments stood out to you?',
      'How did fast vs. slow sections make you feel differently?',
      'What mood did the tempo changes create?'
    ],
    teacherNote: 'Text input on Chromebook. Responses save to student portfolio.'
  }
};

// ========================================
// 2. WOODWIND INSTRUMENTS DATA
// ========================================
export const woodwindInstruments = [
  {
    id: 'flute',
    name: 'Flute',
    emoji: '🎵',
    color: '#06B6D4',
    description: 'Highest, no reed, bright and airy',
    sound: 'Light, clear, and sparkling — like a bird singing',
    audioFile: '/audio/orchestra-samples/woodwinds/flute.mp3',
    facts: [
      'Held sideways (transverse)',
      'Made of metal but classified as woodwind',
      'Plays the highest notes in the woodwind family'
    ]
  },
  {
    id: 'oboe',
    name: 'Oboe',
    emoji: '🎵',
    color: '#8B5CF6',
    description: 'Double reed, nasal and piercing',
    sound: 'Nasal and expressive — like a duck with beautiful tone',
    audioFile: '/audio/orchestra-samples/woodwinds/oboe.mp3',
    facts: [
      'Uses a double reed',
      'Tunes the entire orchestra',
      'Distinctive nasal quality'
    ]
  },
  {
    id: 'clarinet',
    name: 'Clarinet',
    emoji: '🎵',
    color: '#3B82F6',
    description: 'Single reed, warm and smooth',
    sound: 'Warm and versatile — can sound mellow or bright',
    audioFile: '/audio/orchestra-samples/woodwinds/clarinet.mp3',
    facts: [
      'Uses a single reed',
      'Widest range of any woodwind',
      'Found in classical, jazz, and klezmer music'
    ]
  },
  {
    id: 'bassoon',
    name: 'Bassoon',
    emoji: '🎵',
    color: '#EF4444',
    description: 'Double reed, deep and rich',
    sound: 'Deep and warm — the grandpa of woodwinds',
    audioFile: '/audio/orchestra-samples/woodwinds/bassoon.mp3',
    facts: [
      'Uses a double reed',
      'Over 8 feet of tubing folded up',
      'Provides the bass foundation'
    ]
  }
];

// ========================================
// 3. TEMPO MARKINGS DATA
// ========================================
export const tempoMarkings = [
  { symbol: 'Largo', meaning: 'Very slow', bpm: '40-60', emoji: '🐌', thinkOfItLike: 'Slow-motion replay', color: '#93C5FD' },
  { symbol: 'Adagio', meaning: 'Slow, relaxed', bpm: '66-76', emoji: '🐢', thinkOfItLike: 'Walking your dog', color: '#60A5FA' },
  { symbol: 'Andante', meaning: 'Walking speed', bpm: '76-108', emoji: '🚶', thinkOfItLike: 'Normal pace', color: '#FCD34D' },
  { symbol: 'Allegro', meaning: 'Fast, lively', bpm: '120-156', emoji: '🏃', thinkOfItLike: 'Jogging', color: '#FBBF24' },
  { symbol: 'Presto', meaning: 'Very fast', bpm: '168-200', emoji: '⚡', thinkOfItLike: 'Sprinting / running late', color: '#EF4444' }
];

// ========================================
// 4. TEMPO CHANGES DATA
// ========================================
export const tempoChanges = [
  { name: 'Accelerando', meaning: 'Gradually getting faster', description: 'Imagine a roller coaster climbing then dropping', color: '#4ADE80' },
  { name: 'Ritardando', meaning: 'Gradually getting slower', description: 'Imagine a car pulling into a parking spot', color: '#F87171' }
];

// ========================================
// 5. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Woodwind', definition: 'A family of instruments that produce sound by blowing air through a tube' },
  { term: 'Reed', definition: 'A thin piece of wood that vibrates to create sound' },
  { term: 'Flute', definition: 'Highest woodwind, no reed, bright and airy sound' },
  { term: 'Oboe', definition: 'Double reed woodwind, nasal and piercing sound' },
  { term: 'Clarinet', definition: 'Single reed woodwind, warm and smooth sound' },
  { term: 'Bassoon', definition: 'Double reed woodwind, deep and rich sound' },
  { term: 'Tempo', definition: 'The speed of the music' },
  { term: 'BPM', definition: 'Beats per minute — how tempo is measured' },
  { term: 'Largo', definition: 'Very slow tempo' },
  { term: 'Adagio', definition: 'Slow, relaxed tempo' },
  { term: 'Andante', definition: 'Walking-speed tempo' },
  { term: 'Allegro', definition: 'Fast, lively tempo' },
  { term: 'Presto', definition: 'Very fast tempo' },
  { term: 'Accelerando', definition: 'Gradually getting faster' },
  { term: 'Ritardando', definition: 'Gradually getting slower' }
];

// ========================================
// 6. FEATURED PIECE INFO
// ========================================
export const featuredPiece = {
  title: 'Hungarian Dance No. 5',
  composer: 'Johannes Brahms',
  year: '1869',
  origin: 'German, inspired by Roma (Gypsy) music',
  duration: '~3 min',
  audioPath: '/audio/classical/brahms-hungarian-dance-5.mp3',
  description: 'One of the most famous and recognizable pieces of classical music, known for its dramatic tempo changes. Brahms was inspired by Roma (Gypsy) folk music traditions.',
  tempoFeatures: [
    'Dramatic accelerandos (speeding up suddenly)',
    'Surprising ritardandos (slowing down dramatically)',
    'Alternates between fast and slow sections',
    'Uses tempo contrast to create excitement and tension'
  ],
  funFact: 'Brahms wrote 21 Hungarian Dances — this is the most famous one!',
  popCultureAppearances: [
    'The Great Dictator (Charlie Chaplin barber scene)',
    'Countless cartoons and comedy sketches',
    'TV commercials',
    'Video game soundtracks'
  ]
};

// ========================================
// 7. REFLECTION ACTIVITY CONTENT
// ========================================
export const reflectionActivity = {
  steps: {
    teacherInstruction: {
      title: 'Time to Reflect!',
      text: 'Think about how the tempo in Hungarian Dance No. 5 affected your experience.',
      voiceText: 'Time to reflect on your learning!'
    }
  },

  selfReflection: {
    prompt1: {
      title: 'Tempo & Feeling',
      question: 'The tempo in Hungarian Dance No. 5 made me feel ______ because ______.',
      voiceText: 'How did the tempo make you feel?',
      options: [
        'The fast parts made me feel excited and energized',
        'The slow parts made me feel calm and dreamy',
        'The sudden changes surprised me and kept me engaged',
        'The accelerandos made me feel the music building up',
        'Custom...'
      ]
    },
    prompt2: {
      title: 'Woodwind Instruments',
      question: 'The woodwind I noticed most was the ______ because ______.',
      voiceText: 'Which woodwind instrument caught your attention?',
      options: [
        'The flute — its bright, sparkling sound stood out',
        'The oboe — its nasal, expressive tone was memorable',
        'The clarinet — its warm, smooth sound was my favorite',
        'The bassoon — I could hear its deep, rich foundation',
        'Custom...'
      ]
    },
    prompt3: {
      title: 'Tempo Vocabulary',
      question: 'One tempo term I\'ll remember is ______ which means ______.',
      voiceText: 'Which tempo term will you remember?',
      options: [
        'Allegro — fast and lively, like jogging',
        'Presto — very fast, like sprinting',
        'Accelerando — gradually getting faster',
        'Ritardando — gradually getting slower',
        'Custom...'
      ]
    }
  }
};

// ========================================
// 8. REFLECTION PROMPTS (SIMPLE)
// ========================================
export const reflectionPrompts = [
  'The tempo in Hungarian Dance No. 5 made me feel ______ because ______.',
  'The woodwind I noticed most was the ______ because ______.',
  'One tempo term I\'ll remember is ______ which means ______.'
];

// ========================================
// 9. TEMPO LISTENING MAP CONTENT
// ========================================
export const tempoListeningMapContent = {
  instructions: {
    title: 'Tempo Listening Map',
    subtitle: 'Track the Speed Changes in Hungarian Dance No. 5',
    overview: 'Listen to Hungarian Dance No. 5 by Brahms and map the tempo changes you hear.',
    featuredPiece: {
      title: 'Hungarian Dance No. 5',
      composer: 'Johannes Brahms',
      audioPath: '/audio/classical/brahms-hungarian-dance-5.mp3'
    },
    mainSteps: [
      {
        step: 1,
        icon: '🎧',
        title: 'Listen to the music',
        description: 'Press play and listen for tempo changes'
      },
      {
        step: 2,
        icon: '⏱️',
        title: 'Mark tempo levels',
        description: 'Place markers for Largo, Adagio, Andante, Allegro, Presto at key moments'
      },
      {
        step: 3,
        icon: '📈',
        title: 'Draw accelerandos & ritardandos',
        description: 'Show where the music gradually speeds up or slows down'
      },
      {
        step: 4,
        icon: '🎵',
        title: 'Circle woodwind instruments',
        description: 'Mark when you hear specific woodwinds prominently'
      },
      {
        step: 5,
        icon: '💾',
        title: 'Save your work',
        description: 'Click Save to keep your listening map'
      }
    ]
  },

  colorGuide: [
    { tempo: 'Slow (Largo, Adagio)', color: '#3B82F6', tip: 'Blue for slow, relaxed moments' },
    { tempo: 'Medium (Andante)', color: '#FBBF24', tip: 'Yellow for moderate walking tempo' },
    { tempo: 'Fast (Allegro, Presto)', color: '#EF4444', tip: 'Red for fast, energetic moments' }
  ],

  reflectionQuestions: [
    'Where were the fastest moments in the piece?',
    'Where were the slowest moments?',
    'Did you notice any sudden tempo changes?',
    'Where did you hear accelerandos (getting faster)?',
    'Where did you hear ritardandos (getting slower)?'
  ]
};
