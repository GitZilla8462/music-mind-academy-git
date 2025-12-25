// File: /src/lessons/film-music-project/lesson5/summarySlideContent.js
// All instructional text and content for Lesson 5 - Game On! (Melody & Contour)
// Based on standards-aligned slide-by-slide directions

// ========================================
// VOCABULARY PANEL (visible on every slide)
// ========================================
export const VOCABULARY = [
  {
    term: 'Melody',
    icon: '🎵',
    color: '#8B5CF6',
    definition: 'A sequence of pitches you can sing or hum'
  },
  {
    term: 'Contour',
    icon: '📈',
    color: '#3B82F6',
    definition: 'The shape of a melody (up, down, repeated)'
  },
  {
    term: 'Phrase',
    icon: '💬',
    color: '#10B981',
    definition: 'A musical sentence (4-8 beats)'
  },
  {
    term: 'Theme',
    icon: '🎭',
    color: '#F59E0B',
    definition: 'A melody that represents something'
  }
];

// ========================================
// SLIDE 1: Essential Question + Vocabulary
// ========================================
export const slide1_essentialQuestion = {
  slideNumber: 1,
  title: '🎮 GAME ON!',
  essentialQuestion: 'How does the shape of a melody affect the way music makes us feel?',
  estimatedTime: '1 minute',
  vocabularyHighlighted: 'All terms visible'
};

// ========================================
// SLIDE 2: Agenda
// ========================================
export const slide2_agenda = {
  slideNumber: 2,
  title: "TODAY'S AGENDA",
  estimatedTime: '1 minute',
  agenda: [
    { number: 1, icon: '🎧', text: 'Discover how MELODY creates identity in video games' },
    { number: 2, icon: '🎹', text: 'Learn to build MELODIES with different CONTOURS' },
    { number: 3, icon: '🎮', text: 'Compose your own video game soundtrack' }
  ],
  vocabularyHighlighted: 'All 4 terms visible'
};

// ========================================
// SLIDE 3: Name That Game!
// ========================================
export const slide3_nameThatGame = {
  slideNumber: 3,
  title: '🎧 NAME THAT GAME!',
  estimatedTime: '3 minutes',
  instructions: 'Listen to the MELODY. Can you name the game?',
  teacherNotes: [
    'Play 5 iconic game melodies (5-10 seconds each)',
    'Students guess the game',
    'After each: "That MELODY is the game\'s THEME - it represents that game!"'
  ],
  discussionPrompt: 'How did you know which game it was? You recognized the THEME!',
  vocabularyHighlighted: '🎭 THEME'
};

// ========================================
// SLIDE 4: What is Melody?
// ========================================
export const slide4_whatIsMelody = {
  slideNumber: 4,
  title: '🎵 WHAT IS MELODY?',
  estimatedTime: '2 minutes',
  definition: {
    main: 'MELODY = A sequence of pitches moving through time',
    kidFriendly: 'The part of music you can sing or hum'
  },
  keyPoints: [
    'Every song you know has a MELODY',
    "It's the part that gets stuck in your head",
    "When you hum a song, you're humming the MELODY"
  ],
  tryIt: [
    '🎵 "Hum the Mario theme..."',
    '🎵 "Hum the Minecraft music..."',
    "That's the MELODY!"
  ],
  vocabularyHighlighted: '🎵 MELODY'
};

// ========================================
// SLIDE 5: What is Contour?
// ========================================
export const slide5_whatIsContour = {
  slideNumber: 5,
  title: '📈 MELODIC CONTOUR',
  estimatedTime: '2 minutes',
  definition: {
    main: 'CONTOUR = The shape of a melody created by the way pitches move up, down, and repeat',
    kidFriendly: 'The shape your melody makes'
  },
  directions: [
    {
      symbol: '↗',
      term: 'ASCENDING',
      whatItDoes: 'Pitches go UP',
      howItFeels: 'Exciting, building, hopeful'
    },
    {
      symbol: '↘',
      term: 'DESCENDING',
      whatItDoes: 'Pitches go DOWN',
      howItFeels: 'Calming, relaxing, ending'
    },
    {
      symbol: '→',
      term: 'REPEATED',
      whatItDoes: 'Pitches stay the SAME',
      howItFeels: 'Steady, intense, suspenseful'
    }
  ],
  visual: 'Show each direction as a simple line',
  vocabularyHighlighted: '📈 CONTOUR'
};

// ========================================
// SLIDE 6: Steps and Skips
// ========================================
export const slide6_stepsAndSkips = {
  slideNumber: 6,
  title: '🎹 HOW MELODIES MOVE',
  estimatedTime: '2 minutes',
  motionTypes: [
    {
      type: 'STEP',
      whatItMeans: 'Moving to the very next note',
      soundsLike: 'Smooth, connected',
      example: 'C → D → E'
    },
    {
      type: 'SKIP',
      whatItMeans: 'Jumping over a note',
      soundsLike: 'Jumpy, energetic',
      example: 'C → E → G'
    }
  ],
  visual: 'Show step (smooth line) vs skip (jagged line)',
  keyPoint: 'Most MELODIES use a mix of STEPS and SKIPS!',
  teacherPrompt: 'A melody with lots of STEPS feels smooth and singing. A melody with lots of SKIPS feels jumpy and exciting!'
};

// ========================================
// SLIDE 7: Contour Hand Signals
// ========================================
export const slide7_handSignals = {
  slideNumber: 7,
  title: '👋 SHOW ME THE CONTOUR!',
  estimatedTime: '1 minute',
  instructions: 'Use your hand to show each CONTOUR direction',
  practice: [
    { teacherSays: 'Show me ASCENDING', studentsDo: 'Hand moves up ↗' },
    { teacherSays: 'Show me DESCENDING', studentsDo: 'Hand moves down ↘' },
    { teacherSays: 'Show me REPEATED', studentsDo: 'Hand stays flat →' }
  ],
  activity: "I'll play a short MELODY. Show me the CONTOUR with your hand!",
  teacherNotes: [
    'Play 4-5 short melodic examples',
    'Students show contour with hands',
    'Mix of ascending, descending, repeated',
    'Try some that combine directions: "This one goes UP then DOWN!"'
  ],
  vocabularyHighlighted: '📈 CONTOUR'
};

// ========================================
// SLIDE 8: Building a Melody Intro
// ========================================
export const slide8_buildingMelodyIntro = {
  slideNumber: 8,
  title: '🎹 BUILDING A MELODY',
  estimatedTime: '1 minute',
  introText: 'Just like "Build a Beat" for rhythm - now we\'re building MELODIES!',
  grid: {
    notes: ['A', 'G', 'E', 'D', 'C'],
    beats: [1, 2, 3, 4, 5, 6, 7, 8],
    labels: { high: 'HIGH', low: 'LOW' }
  },
  keyPoints: [
    '5 notes: C, D, E, G, A (pentatonic scale)',
    '8 beats = one PHRASE',
    'Click to place notes',
    'No wrong notes - everything sounds good together!',
    "Watch the CONTOUR line show your melody's shape"
  ],
  vocabularyHighlighted: ['🎵 MELODY', '💬 PHRASE', '📈 CONTOUR']
};

// ========================================
// SLIDE 9: Building a Melody Examples (Teacher Demo)
// ========================================
export const slide9_melodyExamples = {
  slideNumber: 9,
  title: '🎹 MELODY EXAMPLES',
  estimatedTime: '5 minutes',
  examples: [
    {
      number: 1,
      name: 'Ascending',
      contour: '↗',
      notes: 'C→D→E→G→A',
      whatToSay: 'This MELODY goes UP - that\'s ASCENDING. It uses all STEPS.'
    },
    {
      number: 2,
      name: 'Descending',
      contour: '↘',
      notes: 'A→G→E→D→C',
      whatToSay: 'This MELODY goes DOWN - that\'s DESCENDING.'
    },
    {
      number: 3,
      name: 'Repeated',
      contour: '→',
      notes: 'E→E→E→E→E',
      whatToSay: "This MELODY stays on the same pitch - that's REPEATED."
    },
    {
      number: 4,
      name: 'Mixed with Steps',
      contour: '↗↘',
      notes: 'C→D→E→G→E→D',
      whatToSay: 'This one goes UP then DOWN using mostly STEPS - smooth!'
    },
    {
      number: 5,
      name: 'Mixed with Skips',
      contour: '↗↘',
      notes: 'C→E→A→E→C',
      whatToSay: "This one uses SKIPS - hear how it's more jumpy?"
    }
  ],
  forEachExample: [
    'Teacher clicks PLAY',
    'Visual shows the contour line animating',
    'Prompt: "Students, show me this CONTOUR with your hand!"',
    'Ask: "Did you hear mostly STEPS or SKIPS?"'
  ],
  studentView: '"Watch the Main Screen" + Vocabulary Panel',
  vocabularyHighlighted: ['🎵 MELODY', '📈 CONTOUR', 'ASCENDING', 'DESCENDING', 'REPEATED', 'STEP', 'SKIP']
};

// ========================================
// SLIDE 10: Composition Instructions
// ========================================
export const slide10_compositionInstructions = {
  slideNumber: 10,
  title: '🎮 GAME SCORE COMPOSITION',
  estimatedTime: '1 minute',
  yourTask: 'Choose a video game and compose a soundtrack using your own MELODY!',
  videoOptions: [
    {
      icon: '🚗',
      game: 'Rocket League',
      mood: 'Hype / Intense',
      suggestedContour: 'Ascending ↗ (building excitement)'
    },
    {
      icon: '🏈',
      game: 'Madden',
      mood: 'Heroic / Triumphant',
      suggestedContour: 'Ascending with skips (bold, powerful)'
    },
    {
      icon: '⛏️',
      game: 'Minecraft',
      mood: 'Peaceful / Mysterious',
      suggestedContour: 'Mix of steps (smooth, wandering)'
    },
    {
      icon: '🎮',
      game: 'Roblox Action',
      mood: 'Exciting / Adventurous',
      suggestedContour: 'Ascending ↗ (energy building)'
    },
    {
      icon: '🏠',
      game: 'Roblox Chill',
      mood: 'Happy / Upbeat',
      suggestedContour: 'Repeated with some steps (steady, calm)'
    },
    {
      icon: '📦',
      game: 'Cozy Game',
      mood: 'Peaceful / Satisfying',
      suggestedContour: 'Repeated and descending (relaxing)'
    }
  ],
  thinkAbout: "What CONTOUR matches your game's mood?"
};

// ========================================
// SLIDE 11: Composition Requirements
// ========================================
export const slide11_compositionRequirements = {
  slideNumber: 11,
  title: '✅ REQUIREMENTS',
  estimatedTime: '1 minute',
  requirements: [
    { number: 1, requirement: 'Create a clear MELODY using the Melody Builder', vocabulary: '🎵 MELODY' },
    { number: 2, requirement: "Your CONTOUR should match the game's mood", vocabulary: '📈 CONTOUR' },
    { number: 3, requirement: 'Use a mix of STEPS and SKIPS', vocabulary: 'STEP, SKIP' },
    { number: 4, requirement: 'Include at least 2 different PHRASES', vocabulary: '💬 PHRASE' },
    { number: 5, requirement: 'Add layers under your melody (drums, bass, pads)', vocabulary: 'Texture' }
  ],
  bonus: 'Create a second PHRASE with a different CONTOUR!',
  rememberFromPreviousLessons: [
    'Lesson 1: Match the MOOD',
    'Lesson 2: Add LAYERS for texture',
    'Lesson 3: Use SECTIONS (Intro → A → B → Outro)',
    'Lesson 4: Add a BEAT foundation'
  ],
  vocabularyHighlighted: ['🎵 MELODY', '📈 CONTOUR', '💬 PHRASE', 'STEP', 'SKIP']
};

// ========================================
// SLIDE 12: Game Score Composition Activity
// ========================================
export const slide12_compositionActivity = {
  slideNumber: 12,
  title: '🎮 COMPOSE YOUR GAME SOUNDTRACK',
  estimatedTime: '10 minutes',
  studentView: 'Full DAW with Melody Builder + Video',
  timer: '10:00',
  onScreenReminders: [
    'Create a MELODY with clear CONTOUR',
    'Use STEPS for smooth motion',
    'Use SKIPS for energy',
    'Build at least 2 PHRASES'
  ],
  vocabularyPanel: 'Visible with all terms',
  teacherView: [
    'Timer controls',
    'Student progress',
    'Slide image for projection'
  ]
};

// ========================================
// SLIDE 13: Reflection Instructions
// ========================================
export const slide13_reflectionInstructions = {
  slideNumber: 13,
  title: '⭐ TWO STARS AND A WISH',
  estimatedTime: '1 minute',
  instructions: "Reflect on your composition using today's vocabulary!",
  promptsPreview: [
    {
      icon: '⭐',
      prompt: 'Describe the CONTOUR of your MELODY. Was it mostly ascending, descending, or repeated?'
    },
    {
      icon: '⭐',
      prompt: 'Did you use more STEPS or SKIPS? How did that affect the feel of your MELODY?'
    },
    {
      icon: '💫',
      prompt: 'What CONTOUR would you try next time to create a different mood?'
    }
  ],
  vocabularyHighlighted: 'All terms'
};

// ========================================
// SLIDE 14: Reflection Activity
// ========================================
export const slide14_reflectionActivity = {
  slideNumber: 14,
  title: '⭐ REFLECTION',
  estimatedTime: '4 minutes',
  studentView: 'Two Stars and a Wish form with vocabulary prompts',
  timer: '4:00',
  teacherView: [
    'Timer controls',
    'Student progress'
  ]
};

// ========================================
// SLIDE 15: Conclusion
// ========================================
export const slide15_conclusion = {
  slideNumber: 15,
  title: '🎮 GAME ON! - What We Learned',
  estimatedTime: '2 minutes',
  returnToEssentialQuestion: 'How does the shape of a melody affect the way music makes us feel?',
  discussionPrompts: [
    'What CONTOUR did you use? How did it match your game?',
    'Did you use mostly STEPS or SKIPS? Why?',
    'How is a THEME different from just any MELODY?'
  ],
  vocabularyReview: [
    { term: '🎵 MELODY', weLearned: 'A sequence of pitches you can sing or hum' },
    { term: '📈 CONTOUR', weLearned: 'The shape - ascending, descending, or repeated' },
    { term: '💬 PHRASE', weLearned: 'A musical sentence (4-8 beats)' },
    { term: '🎭 THEME', weLearned: 'A melody that represents something' },
    { term: 'STEP', weLearned: 'Moving to the next note (smooth)' },
    { term: 'SKIP', weLearned: 'Jumping over a note (jumpy)' }
  ]
};

// ========================================
// SLIDE 16: Melody Mystery Intro (Bonus)
// ========================================
export const slide16_melodyMysteryIntro = {
  slideNumber: 16,
  title: '🔍 MELODY MYSTERY: The Vanishing Composer',
  estimatedTime: '1 minute',
  storySetup: 'A famous composer has disappeared. Work with a partner to track him down!',
  howItWorks: {
    partnerA: {
      role: 'Creator',
      tasks: [
        'Pick an ending',
        'Create 6 MELODIES',
        'Get a share code'
      ]
    },
    partnerB: {
      role: 'Solver',
      tasks: [
        'Enter the code',
        'Listen & recreate each MELODY',
        'Decode clues to find the composer'
      ]
    }
  },
  threePossibleEndings: [
    { emoji: '🏃', ending: 'He Ran Away' },
    { emoji: '🚐', ending: 'He Was Kidnapped' },
    { emoji: '🚔', ending: 'He Was Arrested' }
  ],
  vocabularyFocus: [
    'Recreate each MELODY correctly to decode the clue!',
    'Pay attention to the CONTOUR - is it ascending, descending, or repeated?',
    'Listen for STEPS and SKIPS!'
  ]
};

// ========================================
// SLIDE 17: Melody Mystery Activity (Bonus)
// ========================================
export const slide17_melodyMysteryActivity = {
  slideNumber: 17,
  title: '🔍 MELODY MYSTERY',
  estimatedTime: '8 minutes',
  studentView: 'Melody Mystery game interface',
  timer: '8:00 (optional)',
  teacherView: [
    'Activity unlocked indicator',
    'Student progress'
  ]
};

// ========================================
// SUMMARY: All Slides
// ========================================
export const allSlidesSummary = [
  { number: 1, title: 'Essential Question + Vocabulary', type: 'Summary', time: '1 min' },
  { number: 2, title: 'Agenda', type: 'Summary', time: '1 min' },
  { number: 3, title: 'Name That Game!', type: 'Demo', time: '3 min' },
  { number: 4, title: 'What is Melody?', type: 'Summary', time: '2 min' },
  { number: 5, title: 'What is Contour?', type: 'Summary', time: '2 min' },
  { number: 6, title: 'Steps and Skips', type: 'Summary', time: '2 min' },
  { number: 7, title: 'Contour Hand Signals', type: 'Summary', time: '1 min' },
  { number: 8, title: 'Building a Melody Intro', type: 'Summary', time: '1 min' },
  { number: 9, title: 'Building a Melody Examples', type: 'Demo', time: '5 min' },
  { number: 10, title: 'Composition Instructions', type: 'Summary', time: '1 min' },
  { number: 11, title: 'Composition Requirements', type: 'Summary', time: '1 min' },
  { number: 12, title: 'Game Score Composition', type: 'Activity', time: '10 min' },
  { number: 13, title: 'Reflection Instructions', type: 'Summary', time: '1 min' },
  { number: 14, title: 'Reflection', type: 'Activity', time: '4 min' },
  { number: 15, title: 'Conclusion', type: 'Discussion', time: '2 min' },
  { number: 16, title: 'Melody Mystery Intro', type: 'Summary', time: '1 min' },
  { number: 17, title: 'Melody Mystery', type: 'Activity', time: '8 min' }
];

// Total: 40 min (+ 8 min bonus)

// ========================================
// STANDARDS-ALIGNED VOCABULARY
// ========================================
export const standardsAlignedVocabulary = [
  { term: 'Melody', source: 'NCCAS Glossary' },
  { term: 'Melodic contour', source: 'NCCAS Glossary' },
  { term: 'Ascending', source: 'NCCAS / Standard terminology' },
  { term: 'Descending', source: 'NCCAS / Standard terminology' },
  { term: 'Repeated', source: 'NCCAS Glossary ("pitches repeat")' },
  { term: 'Step', source: 'NCCAS Glossary ("steps and skips")' },
  { term: 'Skip', source: 'NCCAS Glossary ("steps and skips")' },
  { term: 'Phrase', source: 'NCCAS Glossary' },
  { term: 'Theme', source: 'Standard terminology' }
];

// ========================================
// GAME OPTIONS FOR COMPOSITION
// ========================================
export const gameOptions = [
  {
    id: 'rocket-league',
    icon: '🚗',
    title: 'Rocket League',
    mood: 'Hype / Intense',
    color: '#EF4444',
    suggestedContour: 'Ascending ↗ (building excitement)'
  },
  {
    id: 'madden',
    icon: '🏈',
    title: 'Madden',
    mood: 'Heroic / Triumphant',
    color: '#F59E0B',
    suggestedContour: 'Ascending with skips (bold, powerful)'
  },
  {
    id: 'minecraft',
    icon: '⛏️',
    title: 'Minecraft',
    mood: 'Peaceful / Mysterious',
    color: '#10B981',
    suggestedContour: 'Mix of steps (smooth, wandering)'
  },
  {
    id: 'roblox-action',
    icon: '🎮',
    title: 'Roblox Action',
    mood: 'Exciting / Adventurous',
    color: '#3B82F6',
    suggestedContour: 'Ascending ↗ (energy building)'
  },
  {
    id: 'roblox-chill',
    icon: '🏠',
    title: 'Roblox Chill',
    mood: 'Happy / Upbeat',
    color: '#EC4899',
    suggestedContour: 'Repeated with some steps (steady, calm)'
  },
  {
    id: 'cozy-game',
    icon: '📦',
    title: 'Cozy Game',
    mood: 'Peaceful / Satisfying',
    color: '#8B5CF6',
    suggestedContour: 'Repeated and descending (relaxing)'
  }
];

// ========================================
// NAME THAT GAME - Famous Themes
// ========================================
export const nameThatGameContent = {
  title: 'Name That Game!',
  subtitle: 'Can you identify these famous game themes?',
  instructions: 'Listen to the MELODY. Can you name the game?',
  discussionPrompt: 'How did you know which game it was? You recognized the THEME!',
  games: [
    {
      id: 'mario',
      name: 'Super Mario Bros',
      description: 'Ascending, energetic, bouncy',
      contour: 'Mixed with lots of arches'
    },
    {
      id: 'zelda',
      name: 'Legend of Zelda',
      description: 'Heroic, adventurous',
      contour: 'Ascending with dramatic arch'
    },
    {
      id: 'minecraft',
      name: 'Minecraft',
      description: 'Peaceful, flowing',
      contour: 'Gentle arches and stationary'
    },
    {
      id: 'tetris',
      name: 'Tetris',
      description: 'Repetitive, building energy',
      contour: 'Stationary with descending phrases'
    },
    {
      id: 'sonic',
      name: 'Sonic the Hedgehog',
      description: 'Fast, energetic',
      contour: 'Ascending with skips'
    }
  ]
};

// ========================================
// TEACHER DEMO MELODY EXAMPLES
// ========================================
export const melodyBuilderExamples = {
  title: 'Building a Melody - Examples',
  subtitle: 'Watch how different contours create different feelings',
  examples: [
    {
      id: 'ascending',
      number: 1,
      name: 'Ascending',
      contour: '↗',
      notes: 'C→D→E→G→A',
      teachingPoint: "This MELODY goes UP - that's ASCENDING. It uses all STEPS.",
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
      notes: 'A→G→E→D→C',
      teachingPoint: "This MELODY goes DOWN - that's DESCENDING.",
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
      notes: 'E→E→E→E→E',
      teachingPoint: "This MELODY stays on the same pitch - that's REPEATED.",
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
      notes: 'C→D→E→G→E→D',
      teachingPoint: 'This one goes UP then DOWN using mostly STEPS - smooth!',
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
      notes: 'C→E→A→E→C',
      teachingPoint: "This one uses SKIPS - hear how it's more jumpy?",
      grid: [
        [false, false, true, false, false, false, false, false],   // A
        [false, false, false, false, false, false, false, false],  // G
        [false, true, false, true, false, false, false, false],    // E
        [false, false, false, false, false, false, false, false],  // D
        [true, false, false, false, true, false, false, false],    // C
      ]
    }
  ]
};

// ========================================
// REFLECTION ACTIVITY CONTENT (Melody Spotlight)
// ========================================
export const reflectionActivity = {
  title: '⭐ TWO STARS AND A WISH',
  instructions: "Reflect on your composition using today's vocabulary!",
  prompts: {
    star1: {
      icon: '⭐',
      title: 'YOUR CONTOUR',
      question: 'Describe the CONTOUR of your MELODY. Was it mostly ascending, descending, or repeated?',
      options: [
        'I used ascending (going up) to create energy and excitement',
        'I used descending (going down) for a calm, relaxing feeling',
        'I used repeated notes for tension or steadiness',
        'I mixed different contour shapes for variety',
        'Custom...'
      ]
    },
    star2: {
      icon: '⭐',
      title: 'STEPS AND SKIPS',
      question: 'Did you use more STEPS or SKIPS? How did that affect the feel of your MELODY?',
      options: [
        'I used mostly STEPS - it made my melody smooth and connected',
        'I used mostly SKIPS - it made my melody jumpy and energetic',
        'I used a mix of both for variety',
        'Custom...'
      ]
    },
    wish: {
      icon: '💫',
      title: 'NEXT TIME',
      question: 'What CONTOUR would you try next time to create a different mood?',
      options: [
        'I would try more ascending to build more excitement',
        'I would try more descending to create calm',
        'I would try repeated notes for more tension',
        'I would experiment with different combinations',
        'Custom...'
      ]
    }
  }
};

// ========================================
// LEGACY EXPORTS (for backward compatibility)
// ========================================
export const summarySlides = {
  essentialQuestion: slide1_essentialQuestion,
  showAgenda: slide2_agenda,
  whatIsMelody: slide4_whatIsMelody,
  whatIsContour: slide5_whatIsContour,
  stepsAndSkips: slide6_stepsAndSkips,
  handSignals: slide7_handSignals,
  melodyBuilderIntro: slide8_buildingMelodyIntro,
  compositionInstructions: slide10_compositionInstructions,
  compositionRequirements: slide11_compositionRequirements,
  reflectionInstructions: slide13_reflectionInstructions,
  conclusion: slide15_conclusion,
  melodyMysteryIntro: slide16_melodyMysteryIntro
};
