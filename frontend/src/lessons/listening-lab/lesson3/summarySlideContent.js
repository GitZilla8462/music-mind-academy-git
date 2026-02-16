// File: /src/lessons/listening-lab/lesson3/summarySlideContent.js
// All instructional text and content for Lesson 3 - Brass, Percussion & Form
// "Music Has a Blueprint"
// Featured Piece: In the Hall of the Mountain King by Edvard Grieg (1875)

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Slide 1 - Title
  welcomeIntro: {
    title: 'Brass, Percussion & Form',
    subtitle: 'Music Has a Blueprint',
    essentialQuestion: 'How does recognizing patterns and sections help us understand music?',
    iCanStatements: [
      'I can identify brass and percussion instruments by sight and sound.',
      'I can label sections of music using letters (A, B).',
      'I can recognize ternary form (ABA) when I hear it.'
    ]
  },

  // Slide 2 - Brass Family
  brassFamily: {
    title: 'The Brass Family',
    icon: '🎺',
    familyColor: '#F59E0B',
    instruments: [
      {
        name: 'Trumpet',
        description: 'Highest, bright and powerful',
        color: '#F59E0B',
        audioPath: '/audio/orchestra-samples/brass/trumpet/trumpet-demo.mp3'
      },
      {
        name: 'French Horn',
        description: 'Warm and mellow, 12+ feet of tubing',
        color: '#8B5CF6',
        audioPath: '/audio/orchestra-samples/brass/french-horn/french-horn-demo.mp3'
      },
      {
        name: 'Trombone',
        description: 'Uses a slide, rich and bold',
        color: '#3B82F6',
        audioPath: '/audio/orchestra-samples/brass/trombone/trombone-demo.mp3'
      },
      {
        name: 'Tuba',
        description: 'Lowest, deep and powerful',
        color: '#EF4444',
        audioPath: '/audio/orchestra-samples/brass/tuba/tuba-demo.mp3'
      }
    ],
    keyPoint: 'All brass instruments produce sound the same way — buzzing lips into a cup-shaped mouthpiece!',
    facts: [
      'Brass instruments sit at the back of the orchestra — they\'re LOUD',
      'All use lip buzzing into a mouthpiece — different tubing lengths create different pitches',
      'From high to low: Trumpet → French Horn → Trombone → Tuba'
    ],
    teacherNote: 'Play short clips of each instrument. Mountain King features brass prominently in the B and A\' sections — connect what they hear in the clips to what they\'ll hear in the piece.'
  },

  // Slide 4 - Percussion Family
  percussionFamily: {
    title: 'The Percussion Family',
    icon: '🥁',
    familyColor: '#10B981',
    categories: [
      {
        name: 'Pitched Percussion',
        description: 'Can play specific NOTES',
        instruments: [
          { name: 'Timpani', description: 'Large drums with pedals to change pitch', color: '#F59E0B' },
          { name: 'Xylophone', description: 'Wooden bars struck with mallets', color: '#8B5CF6' }
        ]
      },
      {
        name: 'Unpitched Percussion',
        description: 'No specific note — just RHYTHM',
        instruments: [
          { name: 'Snare Drum', description: 'Sharp buzz from metal wires underneath', color: '#3B82F6' },
          { name: 'Bass Drum', description: 'Deep boom — the heartbeat', color: '#EF4444' },
          { name: 'Cymbals', description: 'Metallic crash for big moments', color: '#10B981' }
        ]
      }
    ],
    keyPoint: 'Percussion instruments produce sound by being struck, shaken, or scraped. In Mountain King, listen for the timpani and cymbals — they drive the explosive climax!',
    teacherNote: 'Quick overview — this completes all four instrument families (strings L1, woodwinds L2, brass + percussion L3). The timpani and cymbals are key to the dramatic ending of Mountain King.'
  },

  // Slide 5 - What is Form?
  whatIsForm: {
    title: 'What is Form?',
    subtitle: 'The Blueprint of Music',
    icon: '🔤',
    keyIdea: 'Form is how a piece of music is organized into sections. Some sections repeat, some are different.',
    analogy: 'Think of it like a song: the chorus keeps coming back between verses. In classical music, we use letters to label sections.',
    letterLabels: [
      { letter: 'A', meaning: 'The first section you hear', color: '#3B82F6' },
      { letter: 'B', meaning: 'Something new and different', color: '#EF4444' }
    ],
    classDemo: {
      instruction: 'Quick class demo: Teacher claps a 4-beat rhythm pattern.',
      steps: [
        'Clap a pattern — "That\'s A."',
        'Clap a different pattern — "That\'s B."',
        'Clap the first one again — "What was that?" (Students say A!)',
        'You just heard ABA form!'
      ]
    },
    teacherNote: 'Keep this quick and kinesthetic. The clapping demo makes it concrete before moving to the listening example.'
  },

  // Slide 6 - Meet Ternary Form
  meetTernaryForm: {
    title: 'Meet Ternary Form',
    subtitle: 'Statement — Contrast — Return',
    icon: '🔁',
    definition: 'Ternary form has three parts: A (statement), B (contrast), and A returns at the end.',
    pattern: 'A – B – A\'',
    explanation: [
      'A = the main theme (sneaky pizzicato strings in Mountain King)',
      'B = contrasting section (brass enters, tempo increases, louder dynamics)',
      'A\' = the return — the same theme comes back, but often changed (full orchestra, ff, presto!)'
    ],
    mountainKingBreakdown: [
      { section: 'A', description: 'Sneaky Start — pizzicato strings + bassoons, pp, andante', color: '#3B82F6' },
      { section: 'B', description: 'Building Energy — brass enters, tempo increases, mf', color: '#EF4444' },
      { section: 'A\'', description: 'Explosive Return — full orchestra, ff, accelerando to presto', color: '#3B82F6' }
    ],
    teacherNote: 'Walk through the ABA form. Emphasize that A\' is the SAME theme but transformed — louder, faster, full orchestra. Ask: "What do you think the troll\'s mountain hall sounds like when Peer Gynt is running away?"'
  },

  // Slide 7 - Section Spotter Instructions
  sectionSpotterInstructions: {
    title: 'Section Spotter',
    subtitle: 'Can You Hear the Sections?',
    icon: '🎮',
    howToPlay: [
      '1. Listen to Mountain King play section by section',
      '2. When each section plays, tap A or B on your Chromebook',
      '3. Hear sneaky pizzicato strings? That\'s A — tap it!',
      '4. Brass enters and it gets louder? That\'s B!',
      '5. Fastest correct answer gets bonus points!'
    ],
    tips: [
      { section: 'A', tip: 'Sneaky pizzicato strings + bassoons, quiet', emoji: '🔵' },
      { section: 'B', tip: 'Brass enters, tempo increases, louder', emoji: '🔴' }
    ],
    scoring: [
      { action: 'Correct section', points: '+10' },
      { action: 'Speed bonus', points: '+1 to +5' }
    ],
    teacherNote: 'Students will hear the full piece played section by section. They identify each section in real time. The A\' return should be recognizable — same melody but now full orchestra, ff, presto.'
  },

  // Slide 8 - Listening Map Instructions
  listeningMapInstructions: {
    title: 'Form Listening Map',
    subtitle: 'Track the Sections You Hear',
    icon: '🗺️',
    whatToMark: [
      '🔵 Blue = A section (sneaky pizzicato strings)',
      '🔴 Red = B section (brass enters, building energy)',
      '🎺 Label INSTRUMENTS you hear in each section',
      '🎵 Mark DYNAMICS (loud vs. soft) in each section'
    ],
    tips: [
      'The A sections should look similar — same color!',
      'The B section should look different from A',
      'Use dynamics from Lesson 1 and instruments from all lessons'
    ],
    teacherNote: 'This is the third listening map — students now have dynamics (L1), tempo (L2), AND form (L3) tools. The map should clearly show the ABA structure with color-coding.'
  },

  // Slide 9 - Capstone Preview
  capstonePreview: {
    title: 'Choose Your Piece',
    subtitle: 'Your Capstone Project Starts Next Lesson!',
    icon: '🎓',
    intro: 'You\'ve now learned three big elements of music: dynamics, tempo, and form. For your final project, you\'ll pick a piece and analyze ALL of them at once.',
    pieces: [
      {
        number: 1,
        title: 'In the Hall of the Mountain King',
        composer: 'Edvard Grieg',
        vibe: 'The Chase — starts sneaky, ends explosive',
        previewPath: '/audio/classical/grieg-mountain-king-preview.mp3'
      },
      {
        number: 2,
        title: 'Danse Macabre',
        composer: 'Camille Saint-Saens',
        vibe: 'Spooky Dance Party — skeletons at midnight',
        previewPath: '/audio/classical/saint-saens-danse-macabre-preview.mp3'
      },
      {
        number: 3,
        title: 'William Tell Overture: The Storm',
        composer: 'Gioachino Rossini',
        vibe: 'Nature\'s Fury — thunder, lightning, calm',
        previewPath: '/audio/classical/rossini-william-tell-storm-preview.mp3'
      },
      {
        number: 4,
        title: 'Symphony No. 5 (1st Movement)',
        composer: 'Ludwig van Beethoven',
        vibe: 'Fate Knocks — da-da-da-DUM!',
        previewPath: '/audio/classical/beethoven-5th-preview.mp3'
      },
      {
        number: 5,
        title: 'Night on Bald Mountain',
        composer: 'Modest Mussorgsky',
        vibe: 'The Dark Mountain — witches and demons',
        previewPath: '/audio/classical/mussorgsky-bald-mountain-preview.mp3'
      }
    ],
    teacherNote: 'Play 30-second preview clips. Let students jot down their top 2 choices. The anticipation carries into Lesson 4.'
  },

  // Slide 10 - Reflection / Exit Ticket
  reflection: {
    title: 'Reflect: Music Has a Blueprint',
    subtitle: 'Exit Ticket',
    icon: '⭐',
    prompts: [
      'The form of Mountain King is ______ (use letters).',
      'I knew the A section returned because I heard ______.',
      'The brass/percussion instrument I found most interesting was ______ because ______.'
    ],
    thinkAbout: [
      'How did the A section change when it returned as A\'?',
      'What made the B section sound different from A?',
      'How does ternary form create a satisfying ending by returning to A?'
    ],
    teacherNote: 'Text input on Chromebook. Responses save to student portfolio.'
  }
};

// ========================================
// 2. BRASS INSTRUMENTS DATA
// ========================================
export const brassInstruments = [
  {
    id: 'trumpet',
    name: 'Trumpet',
    emoji: '🎺',
    color: '#F59E0B',
    description: 'Highest, bright and powerful',
    sound: 'Bright, brilliant, and commanding — like a royal announcement',
    audioFile: '/audio/orchestra-samples/brass/trumpet/trumpet-demo.mp3',
    facts: [
      'Highest-pitched brass instrument',
      'Uses three valves to change notes',
      'Featured in Mountain King\'s explosive finale!'
    ]
  },
  {
    id: 'french-horn',
    name: 'French Horn',
    emoji: '📯',
    color: '#8B5CF6',
    description: 'Warm and mellow, over 12 feet of tubing',
    sound: 'Warm, rich, and noble — like a sunset over mountains',
    audioFile: '/audio/orchestra-samples/brass/french-horn/french-horn-demo.mp3',
    facts: [
      'Over 12 feet of tubing coiled in a circle',
      'Player puts their hand in the bell',
      'Can sound heroic or soft and lyrical'
    ]
  },
  {
    id: 'trombone',
    name: 'Trombone',
    emoji: '🎵',
    color: '#3B82F6',
    description: 'Uses a slide, rich and bold',
    sound: 'Bold, rich, and smooth — can glide between notes',
    audioFile: '/audio/orchestra-samples/brass/trombone/trombone-demo.mp3',
    facts: [
      'Uses a slide instead of valves',
      'Name means "big trumpet" in Italian',
      'Can play smooth glissandos (slides between notes)'
    ]
  },
  {
    id: 'tuba',
    name: 'Tuba',
    emoji: '🎵',
    color: '#EF4444',
    description: 'Lowest, deep and powerful',
    sound: 'Deep, powerful, and rumbling — the foundation of the brass section',
    audioFile: '/audio/orchestra-samples/brass/tuba/tuba-demo.mp3',
    facts: [
      'Lowest-pitched brass instrument',
      'Up to 16 feet of tubing',
      'Provides the bass for the whole brass section'
    ]
  }
];

// ========================================
// 3. PERCUSSION INSTRUMENTS DATA
// ========================================
export const percussionInstruments = [
  {
    id: 'timpani',
    name: 'Timpani',
    emoji: '🥁',
    color: '#F59E0B',
    description: 'Large pitched drums — the thunder of the orchestra',
    sound: 'Deep, resonant boom — like distant thunder',
    audioFile: '/audio/orchestra-samples/percussion/timpani/timpani-demo.mp3',
    category: 'pitched',
    facts: [
      'PITCHED — can play specific notes',
      'Pedal changes pitch by tightening the drumhead',
      'Powerful moments in Mountain King\'s dramatic climax!'
    ]
  },
  {
    id: 'snare-drum',
    name: 'Snare Drum',
    emoji: '🥁',
    color: '#3B82F6',
    description: 'Sharp, crisp buzz from metal wires underneath',
    sound: 'Sharp, crisp, and buzzy — great for marches',
    audioFile: '/audio/orchestra-samples/percussion/snare/snare-demo.mp3',
    category: 'unpitched',
    facts: [
      'UNPITCHED — no specific note',
      'Metal wires (snares) on the bottom create the buzz',
      'Used for marches, rolls, and rhythmic patterns'
    ]
  },
  {
    id: 'bass-drum',
    name: 'Bass Drum',
    emoji: '🥁',
    color: '#8B5CF6',
    description: 'Deep boom — the heartbeat of the orchestra',
    sound: 'Deep, powerful boom — you feel it in your chest',
    audioFile: '/audio/orchestra-samples/percussion/bass-drum/bass-drum-demo.mp3',
    category: 'unpitched',
    facts: [
      'UNPITCHED — no specific note',
      'Largest drum in the orchestra',
      'Used for dramatic moments and climaxes'
    ]
  },
  {
    id: 'cymbals',
    name: 'Cymbals',
    emoji: '🥁',
    color: '#10B981',
    description: 'Metallic crash — punctuates big moments',
    sound: 'Bright, shimmering crash — like lightning',
    audioFile: '/audio/orchestra-samples/percussion/cymbals/cymbals-demo.mp3',
    category: 'unpitched',
    facts: [
      'UNPITCHED — no specific note',
      'Made of bronze alloy',
      'Crash cymbals are struck together for big accents'
    ]
  }
];

// ========================================
// 4. FORM VOCABULARY DATA
// ========================================
export const formVocabulary = {
  formTypes: [
    { name: 'Binary', structure: 'AB', description: 'Two sections — statement and contrast', color: '#3B82F6' },
    { name: 'Ternary', structure: 'ABA', description: 'Three sections — statement, contrast, return', color: '#8B5CF6' },
    { name: 'Rondo', structure: 'ABACADA', description: 'A keeps returning between episodes', color: '#F59E0B' }
  ],
  sectionLabels: [
    { letter: 'A', name: 'Statement', description: 'The main theme — sneaky pizzicato strings', color: '#3B82F6', emoji: '🔵' },
    { letter: 'B', name: 'Contrast', description: 'Different material — brass enters, tempo increases', color: '#EF4444', emoji: '🔴' }
  ]
};

// ========================================
// 5. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Brass', definition: 'A family of instruments that produce sound by buzzing lips into a mouthpiece' },
  { term: 'Mouthpiece', definition: 'The cup-shaped piece brass players buzz their lips into' },
  { term: 'Trumpet', definition: 'Highest brass instrument — bright, powerful, commanding' },
  { term: 'French Horn', definition: 'Brass instrument with 12+ feet of coiled tubing — warm and noble' },
  { term: 'Trombone', definition: 'Brass instrument that uses a slide — "big trumpet" in Italian' },
  { term: 'Tuba', definition: 'Lowest brass instrument — deep, powerful foundation' },
  { term: 'Percussion', definition: 'Instruments that produce sound by being struck, shaken, or scraped' },
  { term: 'Pitched', definition: 'Percussion that plays specific notes (timpani, xylophone)' },
  { term: 'Unpitched', definition: 'Percussion with no specific note (snare, cymbals)' },
  { term: 'Timpani', definition: 'Large pitched drums — the "thunder" of the orchestra' },
  { term: 'Form', definition: 'The overall structure or blueprint of a piece of music' },
  { term: 'Section', definition: 'A distinct part of a piece with its own musical character' },
  { term: 'Ternary', definition: 'A three-part form: A (statement), B (contrast), A (return) — ABA' },
  { term: 'Contrast', definition: 'When something sounds noticeably different from what came before' },
  { term: 'Return', definition: 'When the A section comes back after the contrasting B section' }
];

// ========================================
// 6. FEATURED PIECE INFO
// ========================================
export const featuredPiece = {
  title: 'In the Hall of the Mountain King',
  composer: 'Edvard Grieg',
  year: '1875',
  origin: 'Norwegian Romantic — composed for Henrik Ibsen\'s play "Peer Gynt"',
  duration: '~2:30',
  audioPath: '/audio/classical/grieg-mountain-king.mp3',
  description: 'A masterpiece of building tension in ternary (ABA) form. The sneaky pizzicato theme starts quiet and slow, then transforms into a thundering orchestral explosion. Grieg himself called it something "that stinks of cow dung" — but audiences have loved it for 150 years!',
  formFeatures: [
    'Clear ABA ternary form — statement, contrast, return',
    'A section: pizzicato strings + bassoons, pp, andante',
    'B section: brass enters, tempo increases, mf dynamics',
    'A\' return: full orchestra, ff, accelerando to presto — the same theme, now explosive'
  ],
  funFact: 'Grieg actually didn\'t like this piece! He wrote in a letter: "I literally can\'t bear to listen to it because it absolutely reeks of cow dung." But it became one of the most famous classical pieces ever written.',
  popCultureAppearances: [
    'The Social Network (movie)',
    'Countless TV shows, commercials, and video games',
    'Used in horror movies for building tension',
    'One of the most-streamed classical pieces on Spotify'
  ]
};

// ========================================
// 7. REFLECTION ACTIVITY CONTENT
// ========================================
export const reflectionActivity = {
  steps: {
    teacherInstruction: {
      title: 'Time to Reflect!',
      text: 'Think about how form, brass, and percussion worked together in Mountain King.',
      voiceText: 'Time to reflect on your learning!'
    }
  },

  selfReflection: {
    prompt1: {
      title: 'Musical Form',
      question: 'The form of Mountain King is ______ (use letters).',
      voiceText: 'What form did you hear?',
      options: [
        'ABA — the sneaky theme came back at the end!',
        'AB — I heard two different sections',
        'ABC — I heard three different sections',
        'Custom...'
      ]
    },
    prompt2: {
      title: 'Hearing the A Section',
      question: 'I knew the A section returned because I heard ______.',
      voiceText: 'How did you know A was returning?',
      options: [
        'The same sneaky melody but now with full orchestra',
        'The music getting much louder and faster',
        'The pizzicato theme coming back in a new way',
        'The same melody I heard at the beginning',
        'Custom...'
      ]
    },
    prompt3: {
      title: 'Instrument Discovery',
      question: 'The brass/percussion instrument I found most interesting was ______ because ______.',
      voiceText: 'Which instrument stood out to you?',
      options: [
        'The trumpet — its bright, commanding sound was exciting',
        'The French horn — its warm, noble tone was beautiful',
        'The timpani — it made the climax feel powerful',
        'The trombone — I liked that it uses a slide',
        'Custom...'
      ]
    }
  }
};

// ========================================
// 8. REFLECTION PROMPTS (SIMPLE)
// ========================================
export const reflectionPrompts = [
  'The form of Mountain King is ______ (use letters).',
  'I knew the A section returned because I heard ______.',
  'The brass/percussion instrument I found most interesting was ______ because ______.'
];

// ========================================
// 9. FORM LISTENING MAP CONTENT
// ========================================
export const formListeningMapContent = {
  instructions: {
    title: 'Form Listening Map',
    subtitle: 'Track the Sections in Mountain King',
    overview: 'Listen to In the Hall of the Mountain King by Grieg and map the sections you hear. Color-code each section!',
    featuredPiece: {
      title: 'In the Hall of the Mountain King',
      composer: 'Edvard Grieg',
      audioPath: '/audio/classical/grieg-mountain-king.mp3'
    },
    mainSteps: [
      {
        step: 1,
        icon: '🎧',
        title: 'Listen to the music',
        description: 'Press play and listen for section changes'
      },
      {
        step: 2,
        icon: '🔤',
        title: 'Label each section',
        description: 'Mark A or B as each section plays'
      },
      {
        step: 3,
        icon: '🎨',
        title: 'Color-code the sections',
        description: 'Blue = A, Red = B'
      },
      {
        step: 4,
        icon: '🎺',
        title: 'Mark instruments',
        description: 'Label which instrument families you hear in each section'
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
    { section: 'A (Sneaky Theme)', color: '#3B82F6', tip: 'Blue for the pizzicato strings — quiet and mysterious' },
    { section: 'B (Building Energy)', color: '#EF4444', tip: 'Red for when brass enters and tempo increases' }
  ],

  reflectionQuestions: [
    'How did the A section change when it returned as A\'?',
    'What made the B section sound different from A?',
    'What instruments dominated the A\' section?',
    'How did the dynamics change across the three sections?',
    'Can you draw the form pattern using letters?'
  ]
};
