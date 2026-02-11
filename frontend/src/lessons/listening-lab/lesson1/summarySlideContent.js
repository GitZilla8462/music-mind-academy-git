// File: /src/lessons/listening-lab/lesson1/summarySlideContent.js
// All instructional text and content for Lesson 1 - Strings & Dynamics
// "Feel the Power of Soft and Loud"
// Featured Piece: Spring by Antonio Vivaldi

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Slide 1 - Title
  welcomeIntro: {
    title: "Strings & Dynamics",
    subtitle: "Feel the Power of Soft and Loud",
    essentialQuestion: "How do dynamics (soft and loud) change the way music makes us feel?",
    iCan: "I can identify string instruments and describe dynamics using proper musical terms.",
    agenda: [
      "Meet the STRING FAMILY (violin, viola, cello, bass)",
      "Learn DYNAMIC markings (pp, p, mp, mf, f, ff)",
      "Play STRING DETECTIVE",
      "Create a DYNAMICS LISTENING MAP"
    ],
    featuredPiece: {
      title: "Spring",
      composer: "Antonio Vivaldi",
      collection: "The Four Seasons"
    }
  },

  // Slide 2 - Opening Hook / Sound Mystery
  openingHook: {
    title: "Sound Mystery",
    subtitle: "Where have you heard this before?",
    icon: "🎵",
    audioPath: "/audio/classical/vivaldi-spring-opening.mp3",
    revealText: "This is \"Spring\" by Vivaldi - one of the most famous pieces ever written!",
    discussionPrompts: [
      "Where have you heard this music before?",
      "What video games, movies, or shows use this?",
      "What instruments do you hear?"
    ],
    popCultureConnection: {
      title: "Grow a Garden",
      platform: "Roblox",
      players: "10M+ players",
      description: "This music is used in peaceful, nature-themed games!"
    },
    teacherNote: "Play the opening of Spring without context. Let students share where they've heard it. Connect to Grow a Garden or other familiar media."
  },

  // Slide 3 - String Family
  stringFamily: {
    title: "The String Family",
    icon: "🎻",
    familyColor: "#3B82F6",
    instruments: [
      {
        name: "Violin",
        description: "Highest, brightest sound",
        color: "#3B82F6",
        audioPath: "/audio/orchestra-samples/strings/violin/violin-demo.mp3"
      },
      {
        name: "Viola",
        description: "Slightly lower, warmer tone",
        color: "#8B5CF6",
        audioPath: "/audio/orchestra-samples/strings/viola/viola-demo.mp3"
      },
      {
        name: "Cello",
        description: "Rich, singing voice",
        color: "#10B981",
        audioPath: "/audio/orchestra-samples/strings/cello/cello-demo.mp3"
      },
      {
        name: "Double Bass",
        description: "Deepest, most powerful",
        color: "#EF4444",
        audioPath: "/audio/orchestra-samples/strings/bass/bass-demo.mp3"
      }
    ],
    keyPoint: "Strings can play SOFT or LOUD — they have incredible DYNAMIC RANGE!",
    facts: [
      "Strings are the largest section of the orchestra",
      "All string instruments use a bow OR can be plucked (pizzicato)",
      "From high to low: Violin → Viola → Cello → Bass"
    ],
    teacherNote: "Play short clips of each instrument. Emphasize the dynamic range — same instrument can sound very different soft vs. loud."
  },

  // Slide 4 - Dynamics Vocabulary
  dynamicsVocabulary: {
    title: "Dynamics: The Volume of Music",
    subtitle: "From Very Soft to Very Loud",
    icon: "📊",
    dynamics: [
      { symbol: "pp", name: "pianissimo", meaning: "Very soft", level: 1, color: "#93C5FD" },
      { symbol: "p", name: "piano", meaning: "Soft", level: 2, color: "#60A5FA" },
      { symbol: "mp", name: "mezzo piano", meaning: "Medium soft", level: 3, color: "#FCD34D" },
      { symbol: "mf", name: "mezzo forte", meaning: "Medium loud", level: 4, color: "#FBBF24" },
      { symbol: "f", name: "forte", meaning: "Loud", level: 5, color: "#F87171" },
      { symbol: "ff", name: "fortissimo", meaning: "Very loud", level: 6, color: "#EF4444" }
    ],
    specialTerms: [
      { symbol: "<", name: "crescendo", meaning: "Gradually getting louder", icon: "📈" },
      { symbol: ">", name: "decrescendo", meaning: "Gradually getting softer", icon: "📉" }
    ],
    activity: {
      instruction: "Practice with hand levels!",
      description: "Teacher calls out a dynamic — students show it with their hands (low = soft, high = loud)"
    },
    teacherNote: "This is the core vocabulary for the lesson. Have students practice showing dynamics with their hands before moving on."
  },

  // Slide 5 - Game Instructions
  gameInstructions: {
    title: "String Detective",
    subtitle: "Can You Identify the Sound?",
    icon: "🎮",
    howToPlay: [
      "1. Listen to an audio clip",
      "2. Identify WHICH STRING INSTRUMENT is playing",
      "3. Identify the DYNAMIC LEVEL (soft, medium, or loud)",
      "4. Answer quickly for bonus points!"
    ],
    tips: [
      { instrument: "Violin", tip: "Highest, brightest" },
      { instrument: "Viola", tip: "Slightly lower, warmer" },
      { instrument: "Cello", tip: "Rich, singing" },
      { instrument: "Bass", tip: "Deep, rumbling" }
    ],
    scoring: [
      { action: "Correct instrument", points: "+10" },
      { action: "Correct dynamic", points: "+5" },
      { action: "Both correct", points: "+20 (bonus!)" },
      { action: "Speed bonus", points: "+2 to +10" }
    ],
    teacherNote: "This game reinforces both string instrument identification AND dynamic recognition."
  },

  // Slide 6 - Active Listening Instructions
  activeListeningIntro: {
    title: "Active Listening: Spring",
    subtitle: "Show the Dynamics with Your Hands!",
    icon: "🖐️",
    instructions: [
      "As you listen, show the DYNAMIC LEVEL with your hands:",
      "🖐️ HIGH = Loud (forte)",
      "✋ MIDDLE = Medium (mezzo)",
      "👇 LOW = Soft (piano)",
      "Listen for SUDDEN CHANGES — Vivaldi loves to surprise us!"
    ],
    audioPath: "/audio/classical/vivaldi-spring-excerpt.mp3",
    duration: 90,
    teacherNote: "First listen is just for experiencing the music. Students show dynamics with hand levels. Watch for engagement and understanding."
  },

  // Slide 7 - Dynamic Contrast Discussion
  dynamicContrast: {
    title: "Dynamic Contrast",
    subtitle: "The Element of Surprise",
    icon: "💥",
    discussionQuestions: [
      "When did Vivaldi SURPRISE you with a sudden change?",
      "Did you notice any CRESCENDOS (getting louder)?",
      "Did you notice any DECRESCENDOS (getting softer)?",
      "How did these dynamic changes make you FEEL?"
    ],
    keyTakeaway: "Composers use dynamic contrast to create emotion and keep listeners engaged!",
    teacherNote: "This discussion connects the active listening to the vocabulary. Help students articulate what they experienced."
  },

  // Slide 8 - Listening Map Instructions
  listeningMapInstructions: {
    title: "Dynamics Listening Map",
    subtitle: "Track What You Hear",
    icon: "🗺️",
    whatToMark: [
      "🎻 Circle STRING INSTRUMENTS when you hear them prominently",
      "📊 Mark DYNAMIC LEVELS at key moments (pp, p, mf, f, ff)",
      "📈 Draw CRESCENDO arrows where music builds",
      "📉 Draw DECRESCENDO arrows where music fades"
    ],
    colorCoding: [
      { dynamic: "Soft (pp, p)", color: "blue", hex: "#3B82F6" },
      { dynamic: "Medium (mp, mf)", color: "yellow", hex: "#FBBF24" },
      { dynamic: "Loud (f, ff)", color: "red", hex: "#EF4444" }
    ],
    teacherNote: "Students will listen to the full movement and create a visual map of the dynamics they hear."
  },

  // Slide 9 - Reflection / Exit Ticket
  reflection: {
    title: "Reflect: Feel the Dynamics",
    subtitle: "Exit Ticket",
    icon: "⭐",
    promptStart: "Complete this sentence:",
    mainPrompt: "\"The dynamics in Spring made me feel ___ because ___.\"",
    thinkAbout: [
      "Which dynamic moments stood out to you?",
      "How did soft vs. loud sections make you feel differently?",
      "What mood did the dynamic contrasts create?"
    ],
    teacherNote: "Text input on Chromebook. Responses save to student portfolio."
  }
};

// ========================================
// 2. STRING INSTRUMENTS DATA
// ========================================
export const stringInstruments = [
  {
    id: 'violin',
    name: 'Violin',
    color: '#3B82F6',
    description: 'Highest, brightest sound in the string family',
    audioFile: '/audio/orchestra-samples/strings/violin/violin-demo.mp3',
    range: 'high',
    icon: '🎻',
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
    icon: '🎻',
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
    icon: '🎻',
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
    icon: '🎸',
    facts: [
      'The double bass is the largest string instrument',
      'It provides the foundation for the orchestra',
      'Players either stand or sit on a tall stool to play it'
    ]
  }
];

// ========================================
// 3. DYNAMICS DATA
// ========================================
export const dynamicLevels = [
  { symbol: 'pp', name: 'pianissimo', meaning: 'Very soft', level: 1, color: '#93C5FD' },
  { symbol: 'p', name: 'piano', meaning: 'Soft', level: 2, color: '#60A5FA' },
  { symbol: 'mp', name: 'mezzo piano', meaning: 'Medium soft', level: 3, color: '#FCD34D' },
  { symbol: 'mf', name: 'mezzo forte', meaning: 'Medium loud', level: 4, color: '#FBBF24' },
  { symbol: 'f', name: 'forte', meaning: 'Loud', level: 5, color: '#F87171' },
  { symbol: 'ff', name: 'fortissimo', meaning: 'Very loud', level: 6, color: '#EF4444' }
];

export const dynamicTerms = [
  { symbol: '<', name: 'crescendo', meaning: 'Gradually getting louder' },
  { symbol: '>', name: 'decrescendo', meaning: 'Gradually getting softer' }
];

// Simplified dynamics for game (3 levels)
export const simplifiedDynamics = [
  { id: 'soft', name: 'Soft', symbols: ['pp', 'p'], color: '#93C5FD' },
  { id: 'medium', name: 'Medium', symbols: ['mp', 'mf'], color: '#FCD34D' },
  { id: 'loud', name: 'Loud', symbols: ['f', 'ff'], color: '#F87171' }
];

// ========================================
// 4. STRING DETECTIVE GAME CONFIG
// ========================================
export const stringDetectiveConfig = {
  totalQuestions: 16,
  questionTypes: [
    { type: 'instrument', description: 'Identify which string instrument is playing' },
    { type: 'dynamic', description: 'Identify the dynamic level' }
  ],
  scoring: {
    instrumentCorrect: 10,
    dynamicCorrect: 5,
    bothCorrect: 20,
    speedBonuses: [
      { maxTime: 2000, bonus: 10 },
      { maxTime: 4000, bonus: 8 },
      { maxTime: 6000, bonus: 6 },
      { maxTime: 8000, bonus: 4 },
      { maxTime: 10000, bonus: 2 }
    ]
  }
};

// ========================================
// 5. REFLECTION ACTIVITY CONTENT
// ========================================
export const reflectionActivity = {
  steps: {
    teacherInstruction: {
      title: "Time to Reflect!",
      text: "Think about how the dynamics in Spring affected your experience.",
      voiceText: "Time to reflect on your learning!"
    }
  },

  selfReflection: {
    star1: {
      title: "STAR 1: Dynamics & Feeling",
      question: "The dynamics in Spring made me feel ___ because ___.",
      voiceText: "Star 1: How did the dynamics make you feel?",
      options: [
        "The soft parts made me feel calm and peaceful",
        "The loud parts made me feel excited and energized",
        "The sudden changes surprised me and kept me engaged",
        "The crescendos made me feel the music building up",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: String Instruments",
      question: "Which string instrument stood out to you the most?",
      voiceText: "Star 2: Which string instrument caught your attention?",
      options: [
        "The violin — its bright, singing melody was beautiful",
        "The cello — its warm, rich sound was my favorite",
        "The viola — I noticed its darker tone in the harmony",
        "The bass — I could feel its deep foundation",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What to practice?",
      question: "What do you want to get better at identifying?",
      voiceText: "Wish: What do you want to practice more?",
      options: [
        "I want to get better at hearing dynamic changes",
        "I want to tell apart violin and viola sounds",
        "I want to notice crescendos and decrescendos more",
        "I want to identify all four string instruments confidently",
        "Custom..."
      ]
    }
  }
};

// ========================================
// 6. DYNAMICS LISTENING MAP CONTENT
// ========================================
export const dynamicsListeningMapContent = {
  instructions: {
    title: "🗺️ Dynamics Listening Map",
    subtitle: "Track the Dynamics in Spring",
    overview: "Listen to Spring by Vivaldi and map the dynamic changes you hear.",
    featuredPiece: {
      title: "Spring",
      composer: "Antonio Vivaldi",
      movement: "First Movement",
      audioPath: "/audio/classical/vivaldi-spring.mp3"
    },
    mainSteps: [
      {
        step: 1,
        icon: "🎧",
        title: "Listen to the music",
        description: "Press play and listen for dynamic changes"
      },
      {
        step: 2,
        icon: "📊",
        title: "Mark dynamic levels",
        description: "Place markers for pp, p, mp, mf, f, ff at key moments"
      },
      {
        step: 3,
        icon: "📈",
        title: "Draw crescendos & decrescendos",
        description: "Show where the music gradually gets louder or softer"
      },
      {
        step: 4,
        icon: "🎻",
        title: "Circle string instruments",
        description: "Mark when you hear specific strings prominently"
      },
      {
        step: 5,
        icon: "💾",
        title: "Save your work",
        description: "Click Save to keep your listening map"
      }
    ]
  },

  colorGuide: [
    { dynamic: "Soft (pp, p)", color: "#3B82F6", tip: "Blue for quiet, gentle moments" },
    { dynamic: "Medium (mp, mf)", color: "#FBBF24", tip: "Yellow for moderate volume" },
    { dynamic: "Loud (f, ff)", color: "#EF4444", tip: "Red for powerful, bold moments" }
  ],

  reflectionQuestions: [
    "Where were the loudest moments in the piece?",
    "Where were the softest moments?",
    "Did you notice any sudden dynamic changes?",
    "Where did you hear crescendos (getting louder)?",
    "Where did you hear decrescendos (getting softer)?"
  ]
};

// ========================================
// 6b. SHARE & PAIR CONTENT
// ========================================
export const shareAndPairContent = {
  title: 'Share & Pair',
  subtitle: 'Show your Listening Map to a partner!',
  icon: '🤝',
  prompts: [
    {
      number: 1,
      label: 'Mood',
      question: 'What MOOD did the dynamics create?',
      hint: 'Exciting, calm, dramatic, peaceful?'
    },
    {
      number: 2,
      label: 'Biggest Change',
      question: 'Where did you mark the BIGGEST dynamic change?',
      hint: 'Point to it on your map!'
    },
    {
      number: 3,
      label: 'Surprise',
      question: 'What SURPRISED you about the dynamics in Spring?',
      hint: 'A sudden change? A crescendo? A soft moment?'
    }
  ],
  teacherNote: 'Give students 2 minutes to share with a partner. Encourage them to use Presentation View to show their maps.'
};

// ========================================
// 7. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
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
  { term: 'String Family', definition: 'Violin, viola, cello, and double bass' },
  { term: 'Dynamic Range', definition: 'The difference between the softest and loudest sounds an instrument can make' },
  { term: 'Dynamic Contrast', definition: 'The difference between loud and soft sections in music' }
];

// ========================================
// 8. FEATURED PIECE INFO
// ========================================
export const featuredPiece = {
  title: "Spring",
  composer: "Antonio Vivaldi",
  fullTitle: "Spring from The Four Seasons",
  year: "1725",
  duration: "~3 minutes (first movement)",
  audioPath: "/audio/classical/vivaldi-spring.mp3",
  audioCredits: "Musopen.org - Public Domain Recording",
  description: "One of the most famous and recognizable pieces of classical music ever written. The first movement of Spring features bright, cheerful melodies that paint a picture of springtime.",
  dynamicFeatures: [
    "Sudden dynamic contrasts (loud to soft)",
    "Crescendos building to climactic moments",
    "Soft, gentle bird-like passages",
    "Bold, energetic tutti sections"
  ],
  popCultureAppearances: [
    "Grow a Garden (Roblox)",
    "Countless commercials and advertisements",
    "Wedding ceremonies",
    "Movies and TV shows"
  ]
};
