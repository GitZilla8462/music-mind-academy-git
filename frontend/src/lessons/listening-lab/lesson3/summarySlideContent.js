// File: /src/lessons/listening-lab/lesson3/summarySlideContent.js
// All instructional text and content for Lesson 3 - Brass, Percussion & Form
// "Music Has a Blueprint"
// Featured Piece: Fanfare-Rondeau by Jean-Joseph Mouret (1729)

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
      'I can label sections of music using letters (A, B, C, D).',
      'I can recognize rondo form (ABACADA) when I hear it.'
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
    teacherNote: 'Play short clips of each instrument. The Mouret Rondeau features trumpets prominently — connect what they hear in the clips to what they heard in the hook.'
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
    keyPoint: 'Percussion instruments produce sound by being struck, shaken, or scraped. In the Mouret Rondeau, listen for the timpani — it punctuates the brass fanfare like an exclamation point!',
    teacherNote: 'Quick overview — this completes all four instrument families (strings L1, woodwinds L2, brass + percussion L3). The timpani is the star percussion instrument in the Mouret.'
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
      { letter: 'B', meaning: 'Something new and different', color: '#EF4444' },
      { letter: 'C', meaning: 'Yet another new idea', color: '#10B981' },
      { letter: 'D', meaning: 'Still another contrast', color: '#F59E0B' }
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

  // Slide 6 - Meet the Rondo
  meetTheRondo: {
    title: 'Meet the Rondo',
    subtitle: 'The A Section Keeps Coming Home',
    icon: '🔁',
    definition: 'A Rondo is a form where the A section keeps returning with different material (episodes) in between.',
    pattern: 'A – B – A – C – A – D – A',
    explanation: [
      'A = the brass fanfare (the refrain — it always comes back)',
      'B, C, D = episodes (contrasting sections with different instruments and mood)',
      'The A section is like home base — no matter where the music goes, it always returns'
    ],
    mouretBreakdown: [
      { section: 'A', description: 'Bold brass fanfare — trumpets + timpani', color: '#3B82F6' },
      { section: 'B', description: 'Lighter — strings and oboes', color: '#EF4444' },
      { section: 'A', description: 'Fanfare returns!', color: '#3B82F6' },
      { section: 'C', description: 'Different episode — new contrast', color: '#10B981' },
      { section: 'A', description: 'Fanfare again!', color: '#3B82F6' },
      { section: 'D', description: 'Third episode — yet another idea', color: '#F59E0B' },
      { section: 'A', description: 'Final fanfare — triumphant close', color: '#3B82F6' }
    ],
    teacherNote: 'Walk through the form on the board. When you get to the first "A returns," pause and ask: "What should happen next?" Students should predict the fanfare. This builds anticipation and demonstrates comprehension.'
  },

  // Slide 7 - Section Spotter Instructions
  sectionSpotterInstructions: {
    title: 'Section Spotter',
    subtitle: 'Can You Hear the Sections?',
    icon: '🎮',
    howToPlay: [
      '1. Listen to the Rondeau play section by section',
      '2. When each section plays, tap A, B, C, or D on your Chromebook',
      '3. Hear the brass fanfare? That\'s A — tap it!',
      '4. Something lighter with strings? Could be B, C, or D!',
      '5. Fastest correct answer gets bonus points!'
    ],
    tips: [
      { section: 'A', tip: 'Bold brass fanfare — trumpets and timpani', emoji: '🔵' },
      { section: 'B', tip: 'First episode — lighter, strings/oboes', emoji: '🔴' },
      { section: 'C', tip: 'Second episode — different from B', emoji: '🟢' },
      { section: 'D', tip: 'Third episode — yet another contrast', emoji: '🟡' }
    ],
    scoring: [
      { action: 'Correct section', points: '+10' },
      { action: 'Speed bonus', points: '+1 to +5' }
    ],
    teacherNote: 'Students will hear the full piece played section by section. They identify each section in real time. The A sections should get easier each time — by the fourth return, every student should nail it.'
  },

  // Slide 8 - Listening Map Instructions
  listeningMapInstructions: {
    title: 'Form Listening Map',
    subtitle: 'Track the Sections You Hear',
    icon: '🗺️',
    whatToMark: [
      '🔵 Blue = A section (brass fanfare)',
      '🔴 Red = B section (first episode)',
      '🟢 Green = C section (second episode)',
      '🟡 Yellow = D section (third episode)',
      '🎺 Label INSTRUMENTS you hear in each section',
      '🎵 Mark DYNAMICS (loud vs. soft) in each section'
    ],
    tips: [
      'The A sections should all look similar — same color!',
      'The episodes (B, C, D) should look different from A and from each other',
      'Use dynamics from Lesson 1 and instruments from all lessons'
    ],
    teacherNote: 'This is the third listening map — students now have dynamics (L1), tempo (L2), AND form (L3) tools. The map should clearly show the ABACADA structure with color-coding.'
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
      'The form of the Mouret Rondeau is ______ (use letters).',
      'I knew the A section was back because I heard ______.',
      'The brass/percussion instrument I found most interesting was ______ because ______.'
    ],
    thinkAbout: [
      'How many times did the A section return?',
      'What made the episodes (B, C, D) sound different from A?',
      'How is form like a chorus and verses in a pop song?'
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
      'The star of the Mouret Rondeau!'
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
      'Stars in the Mouret Rondeau alongside the trumpets!'
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
    { letter: 'A', name: 'Refrain', description: 'The main theme that keeps coming back', color: '#3B82F6', emoji: '🔵' },
    { letter: 'B', name: 'Episode 1', description: 'First contrasting section', color: '#EF4444', emoji: '🔴' },
    { letter: 'C', name: 'Episode 2', description: 'Second contrasting section', color: '#10B981', emoji: '🟢' },
    { letter: 'D', name: 'Episode 3', description: 'Third contrasting section', color: '#F59E0B', emoji: '🟡' }
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
  { term: 'Rondo', definition: 'Form where A returns between contrasting episodes (ABACADA)' },
  { term: 'Refrain', definition: 'The recurring A section that keeps coming back' },
  { term: 'Episode', definition: 'A contrasting section between returns of the refrain' }
];

// ========================================
// 6. FEATURED PIECE INFO
// ========================================
export const featuredPiece = {
  title: 'Fanfare-Rondeau',
  composer: 'Jean-Joseph Mouret',
  year: '1729',
  origin: 'French Baroque — composed for Louis XIV at the Palace of Versailles',
  duration: '~2 min',
  audioPath: '/audio/classical/mouret-rondeau.mp3',
  description: 'A textbook rondo featuring trumpets and timpani. Written in 1729, it became famous as the PBS Masterpiece Theatre theme. The brass fanfare is instantly recognizable and returns four times between contrasting episodes.',
  formFeatures: [
    'Clear ABACADA rondo form — the A section returns four times',
    'Bold brass fanfare (A) contrasts with lighter episodes (B, C, D)',
    'Trumpets and timpani dominate the A sections',
    'Episodes feature strings and oboes with softer dynamics'
  ],
  funFact: 'This piece is older than the United States! It was composed 47 years before the Declaration of Independence.',
  popCultureAppearances: [
    'PBS Masterpiece Theatre theme (since 1971)',
    'Civilization video game series',
    'Weddings and formal ceremonies',
    'Little Einsteins (PBS Kids)'
  ]
};

// ========================================
// 7. REFLECTION ACTIVITY CONTENT
// ========================================
export const reflectionActivity = {
  steps: {
    teacherInstruction: {
      title: 'Time to Reflect!',
      text: 'Think about how form, brass, and percussion worked together in the Mouret Rondeau.',
      voiceText: 'Time to reflect on your learning!'
    }
  },

  selfReflection: {
    prompt1: {
      title: 'Musical Form',
      question: 'The form of the Mouret Rondeau is ______ (use letters).',
      voiceText: 'What form did you hear?',
      options: [
        'ABACADA — the fanfare kept coming back!',
        'ABACA — I heard A return between contrasting sections',
        'ABA — I noticed A come back once',
        'Custom...'
      ]
    },
    prompt2: {
      title: 'Hearing the A Section',
      question: 'I knew the A section was back because I heard ______.',
      voiceText: 'How did you know A was returning?',
      options: [
        'The bold brass trumpets playing the fanfare',
        'The timpani joining back in with a big sound',
        'The music getting louder and more powerful',
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
        'The timpani — it made the fanfare feel powerful',
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
  'The form of the Mouret Rondeau is ______ (use letters).',
  'I knew the A section was back because I heard ______.',
  'The brass/percussion instrument I found most interesting was ______ because ______.'
];

// ========================================
// 9. FORM LISTENING MAP CONTENT
// ========================================
export const formListeningMapContent = {
  instructions: {
    title: 'Form Listening Map',
    subtitle: 'Track the Sections in the Mouret Rondeau',
    overview: 'Listen to the Fanfare-Rondeau by Mouret and map the sections you hear. Color-code each section!',
    featuredPiece: {
      title: 'Fanfare-Rondeau',
      composer: 'Jean-Joseph Mouret',
      audioPath: '/audio/classical/mouret-rondeau.mp3'
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
        description: 'Mark A, B, C, or D as each section plays'
      },
      {
        step: 3,
        icon: '🎨',
        title: 'Color-code the sections',
        description: 'Blue = A, Red = B, Green = C, Yellow = D'
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
    { section: 'A (Fanfare)', color: '#3B82F6', tip: 'Blue for the bold brass fanfare — the refrain' },
    { section: 'B (Episode 1)', color: '#EF4444', tip: 'Red for the first contrasting episode' },
    { section: 'C (Episode 2)', color: '#10B981', tip: 'Green for the second contrasting episode' },
    { section: 'D (Episode 3)', color: '#F59E0B', tip: 'Yellow for the third contrasting episode' }
  ],

  reflectionQuestions: [
    'How many times did the A section (fanfare) return?',
    'Which episode (B, C, or D) sounded the most different from A?',
    'What instruments dominated the A sections?',
    'How did the dynamics change between A sections and episodes?',
    'Can you draw the form pattern using letters?'
  ]
};
