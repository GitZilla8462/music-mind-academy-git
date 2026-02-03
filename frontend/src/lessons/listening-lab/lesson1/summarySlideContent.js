// File: /src/lessons/listening-lab/lesson1/summarySlideContent.js
// All instructional text and content for Lesson 1 - Meet the Orchestra
// Instruments & Timbre

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Slide 1 - Title
  welcomeIntro: {
    title: "Meet the Orchestra",
    subtitle: "Instruments & Timbre",
    essentialQuestion: "How does the sound of an instrument affect the mood of the music?",
    iCan: "I can identify instruments by their sound and describe how they contribute to the mood of a piece.",
    agenda: [
      "Learn the four families of the orchestra",
      "Play Guess That Instrument with a partner",
      "Create your first Listening Map"
    ]
  },

  // Slide 2 - Opening Hook
  openingHook: {
    title: "Listen: What Do You Hear?",
    icon: "🎵",
    points: [
      "What are some instruments of the orchestra you know?",
      "Think you could identify them just by hearing them play?",
      "Let's find out!"
    ],
    teacherNote: "Teacher-led discussion to activate prior knowledge. No student device interaction — just conversation."
  },

  // Slide 3 - String Family
  stringFamily: {
    title: "The String Family",
    icon: "🎻",
    instruments: ["Violin", "Viola", "Cello", "Double Bass"],
    sound: "Warm, emotional, smooth — strings often carry the melody",
    facts: [
      "Strings are the largest section of the orchestra",
      "All string instruments use a bow or can be plucked (pizzicato)",
      "From high to low: Violin → Viola → Cello → Bass"
    ],
    audioPath: "/audio/orchestra-samples/families/strings-sample.mp3"
  },

  // Slide 4 - Woodwind Family
  woodwindFamily: {
    title: "The Woodwind Family",
    icon: "🎶",
    instruments: ["Flute", "Clarinet", "Oboe", "Bassoon"],
    sound: "Airy, playful, sometimes haunting",
    facts: [
      "A solo flute and a solo oboe sound very different even though they're in the same family",
      "The flute is metal but is still considered a woodwind because of how air flows through it",
      "The oboe's distinct sound often tunes the orchestra"
    ],
    audioPath: "/audio/orchestra-samples/families/woodwinds-sample.mp3"
  },

  // Slide 5 - Brass Family
  brassFamily: {
    title: "The Brass Family",
    icon: "🎺",
    instruments: ["Trumpet", "French Horn", "Trombone", "Tuba"],
    sound: "Powerful, heroic, bold",
    facts: [
      "Think about it: When you hear brass in a movie, what's usually happening?",
      "Brass instruments make sound through buzzing lips into a mouthpiece",
      "The tuba provides the bass foundation for the whole orchestra"
    ],
    audioPath: "/audio/orchestra-samples/families/brass-sample.mp3"
  },

  // Slide 6 - Percussion Family
  percussionFamily: {
    title: "The Percussion Family",
    icon: "🥁",
    instruments: ["Timpani", "Snare Drum", "Bass Drum", "Cymbals", "Xylophone", "Triangle"],
    sound: "Rhythm, energy, drama, accent",
    facts: [
      "Percussion can be loud and explosive or soft and subtle",
      "Timpani (kettle drums) can actually be tuned to specific pitches",
      "The triangle may be small, but it cuts through the entire orchestra!"
    ],
    audioPath: "/audio/orchestra-samples/families/percussion-sample.mp3"
  },

  // Slide 7 - Game Instructions
  gameInstructions: {
    title: "Guess That Instrument",
    icon: "🎮",
    instructions: "Choose a level for your class:",
    levels: [
      {
        level: 1,
        name: "Easy",
        description: "Identify instrument families — Strings, Woodwinds, Brass, or Percussion"
      },
      {
        level: 2,
        name: "Medium",
        description: "Identify specific instruments that sound very different — like Violin vs. Tuba"
      },
      {
        level: 3,
        name: "Hard",
        description: "Identify specific instruments that sound similar — like Violin vs. Viola"
      }
    ],
    note: "Teacher selects the level. Each level has 9 rounds."
  },

  // Slide 9 - Listening Map Tutorial
  listeningMapTutorial: {
    title: "How to Use the Listening Map",
    icon: "🗺️",
    points: [
      "Watch this short tutorial to learn how the Listening Map works",
      "After the video you'll listen to a piece and track what instruments you hear"
    ],
    videoPath: "/lessons/film-music-project/lesson2/ListeningMapTutorial.mp4"
  },

  // Slide 10 - Listening Map Instructions
  listeningMapInstructions: {
    title: "Listening Map #1: Instruments",
    icon: "🎧",
    directions: [
      "Your teacher will play the song for the class. Just listen — don't place anything yet.",
      "What do you think you heard? Share with the class.",
      "Your teacher may demonstrate where to place some instruments on the map.",
      "Then it's your turn — you have 15 minutes to create your own Listening Map."
    ],
    colorCoding: [
      { family: "Strings", color: "blue", hex: "#3B82F6" },
      { family: "Woodwinds", color: "green", hex: "#10B981" },
      { family: "Brass", color: "red", hex: "#EF4444" },
      { family: "Percussion", color: "yellow", hex: "#F59E0B" }
    ],
    suggestedPieces: [
      "Britten's \"Young Person's Guide to the Orchestra\"",
      "Grieg's \"Morning Mood\""
    ]
  },

  // Slide 11 - Reflection / Exit Ticket
  reflection: {
    title: "Reflect: What Did You Hear?",
    icon: "⭐",
    questions: [
      "Which instrument family was easiest for you to identify? Why?",
      "Which instrument family was hardest? What made it tricky?",
      "Name one thing you heard today that you wouldn't have noticed before this lesson."
    ],
    note: "Text input fields on Chromebook. Responses save to student portfolio."
  },

  // Slide 12 - Bonus Game Instructions
  orchestraLabInstructions: {
    title: "Orchestra Lab: Partner Challenge",
    icon: "🎧",
    setup: "Pair up with a partner — you'll each stay on your own Chromebook",
    howItWorks: [
      "Join a room with your partner using a room code",
      "Take turns: one player picks an instrument sound, the other player guesses what it is"
    ],
    gameFlow: [
      "Player 1 sees a grid of orchestra instrument buttons organized by family",
      "Player 1 taps an instrument — only Player 2 hears the sound",
      "Player 2 sees multiple choice options and picks which instrument they think it is",
      "After the guess, both see if it was correct",
      "Roles swap — Player 2 picks, Player 1 guesses",
      "Keep going back and forth until the teacher ends the activity"
    ]
  }
};

// ========================================
// 2. INSTRUMENT FAMILY DATA
// ========================================
export const instrumentFamilies = [
  {
    id: 'strings',
    name: 'Strings',
    color: '#3B82F6', // blue
    instruments: ['Violin', 'Viola', 'Cello', 'Double Bass'],
    description: 'Warm, emotional, smooth — strings often carry the melody',
    samplePath: '/audio/orchestra-samples/families/strings-sample.mp3'
  },
  {
    id: 'woodwinds',
    name: 'Woodwinds',
    color: '#10B981', // green
    instruments: ['Flute', 'Clarinet', 'Oboe', 'Bassoon'],
    description: 'Airy, playful, sometimes haunting',
    samplePath: '/audio/orchestra-samples/families/woodwinds-sample.mp3'
  },
  {
    id: 'brass',
    name: 'Brass',
    color: '#EF4444', // red
    instruments: ['Trumpet', 'French Horn', 'Trombone', 'Tuba'],
    description: 'Powerful, heroic, bold',
    samplePath: '/audio/orchestra-samples/families/brass-sample.mp3'
  },
  {
    id: 'percussion',
    name: 'Percussion',
    color: '#F59E0B', // amber
    instruments: ['Timpani', 'Snare Drum', 'Bass Drum', 'Cymbals', 'Xylophone', 'Triangle'],
    description: 'Rhythm, energy, drama, accent',
    samplePath: '/audio/orchestra-samples/families/percussion-sample.mp3'
  }
];

// ========================================
// 3. GAME CONFIGURATION
// ========================================
export const guessThatInstrumentConfig = {
  levels: [
    {
      id: 1,
      name: 'Level 1: Families',
      difficulty: 'Easy',
      description: 'Identify instrument families — Strings, Woodwinds, Brass, or Percussion',
      rounds: 9
    },
    {
      id: 2,
      name: 'Level 2: Instruments',
      difficulty: 'Medium',
      description: 'Identify specific instruments that sound very different',
      rounds: 9
    },
    {
      id: 3,
      name: 'Level 3: Expert',
      difficulty: 'Hard',
      description: 'Identify specific instruments that sound similar (same family)',
      rounds: 9
    }
  ]
};

// ========================================
// 4. REFLECTION ACTIVITY CONTENT
// ========================================
export const reflectionActivity = {
  steps: {
    teacherInstruction: {
      title: "Time to Reflect!",
      text: "Think about what you learned today about the orchestra instruments.",
      voiceText: "Time to reflect on your learning!"
    }
  },

  selfReflection: {
    star1: {
      title: "STAR 1: Identifying Instruments",
      question: "Which instrument family was easiest for you to identify?",
      voiceText: "Star 1: Which instrument family was easiest to identify?",
      options: [
        "Strings were easiest — I can hear the warm, smooth sound",
        "Brass were easiest — they're loud and powerful",
        "Woodwinds were easiest — the airy sound stands out",
        "Percussion were easiest — the rhythmic sounds are clear",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: What You Noticed",
      question: "What's something new you heard today that you wouldn't have noticed before?",
      voiceText: "Star 2: What new thing did you notice?",
      options: [
        "I noticed how different instruments in the same family sound",
        "I heard how instruments work together to create mood",
        "I recognized individual instruments I didn't know before",
        "I heard how the timbre changes the feeling of the music",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What to practice?",
      question: "Which instrument family do you want to get better at identifying?",
      voiceText: "Wish: What do you want to practice more?",
      options: [
        "I want to practice telling apart string instruments",
        "I want to learn woodwinds better — they're tricky",
        "I want to identify individual brass instruments",
        "I want to hear percussion more clearly in orchestral music",
        "Custom..."
      ]
    }
  }
};

// ========================================
// 5. LISTENING MAP CONTENT
// ========================================
export const listeningMapContent = {
  instructions: {
    title: "🗺️ Listening Map #1: Instruments",
    subtitle: "Track the Orchestra",
    overview: "Listen to the music and mark when you hear each instrument family.",
    mainSteps: [
      {
        step: 1,
        icon: "🎧",
        title: "Listen to the music",
        description: "Press play and listen for different instrument families"
      },
      {
        step: 2,
        icon: "🎨",
        title: "Mark what you hear",
        description: "Use colors to show when each family is playing"
      },
      {
        step: 3,
        icon: "🗺️",
        title: "Create your map",
        description: "Your map shows how instruments enter and exit the music"
      },
      {
        step: 4,
        icon: "💾",
        title: "Save your work",
        description: "Click Save to keep your listening map"
      }
    ]
  },

  colorGuide: [
    { family: "Strings", color: "#3B82F6", tip: "Blue for the warm, smooth strings" },
    { family: "Woodwinds", color: "#10B981", tip: "Green for the airy woodwinds" },
    { family: "Brass", color: "#EF4444", tip: "Red for the powerful brass" },
    { family: "Percussion", color: "#F59E0B", tip: "Yellow for the rhythmic percussion" }
  ],

  reflectionQuestions: [
    "Which instrument family played the most?",
    "When did new instruments enter the music?",
    "Could you identify any specific instruments?"
  ]
};

// ========================================
// 6. ORCHESTRA LAB PARTNER GAME CONTENT
// ========================================
export const orchestraLabContent = {
  instructions: {
    title: "🎧 Orchestra Lab 🔬",
    subtitle: "One Picks, One Guesses!",
    setup: "Pair up with a partner — each on your own Chromebook",
    mainSteps: [
      {
        step: 1,
        icon: "🔗",
        title: "Join a room",
        description: "One partner creates a room, the other joins with the code"
      },
      {
        step: 2,
        icon: "🎹",
        title: "Player 1 picks an instrument",
        description: "Choose any instrument from the grid"
      },
      {
        step: 3,
        icon: "🎧",
        title: "Player 2 hears and guesses",
        description: "Only Player 2 hears the sound — pick the right instrument!"
      },
      {
        step: 4,
        icon: "🔄",
        title: "Swap roles",
        description: "Take turns picking and guessing"
      }
    ]
  },

  difficultyLevels: [
    {
      level: 1,
      name: "Easy",
      description: "Guess the instrument family (Strings, Woodwinds, Brass, Percussion)"
    },
    {
      level: 2,
      name: "Medium",
      description: "Guess from instruments that sound very different"
    },
    {
      level: 3,
      name: "Hard",
      description: "Guess from instruments in the same family"
    }
  ],

  scoringExplanation: {
    title: "How Scoring Works",
    items: [
      { label: "Correct Guess", points: "+10", description: "You identified the instrument!" },
      { label: "Speed Bonus", points: "+2 to +10", description: "Faster answers earn more points" }
    ]
  }
};
