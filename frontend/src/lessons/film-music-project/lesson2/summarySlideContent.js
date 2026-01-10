// File: /src/lessons/film-music-project/lesson3/summarySlideContent.js
// All instructional text and content for Lesson 3 - City Soundscapes
// ✅ UPDATED: Renamed Texture Drawings to Listening Map throughout

// ========================================
// 1. PRE-ACTIVITY SUMMARY SLIDES
// ========================================
export const summarySlides = {
  introVideo: {
    title: "Welcome to City Soundscapes!",
    icon: "🏙️",
    estimatedTime: "3 minutes",
    points: [
      "Learn about texture and layering in music.",
      "Draw a listening map while hearing instruments play.",
      "Create your own city soundscape using multiple layers."
    ]
  },

  textureConcept: {
    title: "What is Texture in Music?",
    icon: "🎹",
    estimatedTime: "Discussion",
    points: [
      "Texture = The thickness or thinness of sound",
      "Thin texture = Few layers (1-2 sounds)",
      "Thick texture = Many layers (3+ sounds)",
      "Layers create fullness and complexity in music"
    ]
  },

  layersAndTexture: {
    title: "Layers and Texture",
    icon: "📚",
    estimatedTime: "Discussion",
    points: [
      "Each instrument you hear is a new layer of sound.",
      "More layers = Thicker texture and fuller sound.",
      "Composers control texture by adding or removing instruments.",
      "City soundscapes have thick texture with many overlapping sounds."
    ]
  },

  musicForListeningMap: {
    title: "Music For Listening Map",
    subtitle: "🎵 Spring by Antonio Vivaldi",
    icon: "🎻",
    estimatedTime: "1 minute",
    points: [
      "Vivaldi was an Italian composer nicknamed \"The Red Priest\" because of his red hair.",
      "\"The Four Seasons\" is a set of four pieces — one for Spring, Summer, Autumn, and Winter — and Spring is the most famous.",
      "This is a concerto, which means one solo instrument (violin) shows off while the orchestra backs it up.",
      "Listen for the solo violin imitating birds singing, thunder, and flowing streams."
    ]
  },

  // ✅ RENAMED: Listening Map summary slide content
  listeningMap: {
    title: "Listening Map",
    icon: "🗺️",
    estimatedTime: "8 minutes",
    points: [
      "Listen to music with different numbers of instruments",
      "Draw what you hear on a blank canvas",
      "Create a visual map of the sounds you hear",
      "Notice how the music gets fuller with more instruments"
    ],
    rounds: [
      {
        number: 1,
        title: "Quartet",
        instruments: ["Violin 1", "Violin 2", "Viola", "Cello"],
        instruction: "Draw lines representing each instrument",
        color: "#8B5CF6"
      }
    ],
    reflectionQuestions: [
      "How did you represent different instruments in your drawing?",
      "What does 'thick texture' look like vs 'thin texture'?",
      "Could you hear each instrument separately?"
    ]
  },

  // Loop Lab summary slide content
  loopLab: {
    title: "Loop Lab Partner Game",
    icon: "🎧",
    estimatedTime: "6 minutes",
    points: [
      "Work in pairs (2-3 per Chromebook)",
      "One player listens and describes, one player builds",
      "Use musical vocabulary to communicate",
      "Swap roles each round!"
    ],
    roles: {
      listener: {
        title: "THE LISTENER 🎧",
        tasks: [
          "Wears headphones",
          "Hears the mystery loops",
          "Describes using musical words",
          "Can't touch the screen!"
        ]
      },
      builder: {
        title: "THE BUILDER 🔨",
        tasks: [
          "Sees all the loops",
          "Listens to descriptions",
          "Builds a matching mix",
          "Earns points for accuracy!"
        ]
      }
    },
    scoring: {
      exact: { points: 20, label: "Exact Match" },
      category: { points: 5, label: "Right Category" },
      perfect: { points: 10, label: "Perfect Bonus" }
    },
    vocabularyHints: [
      { icon: "🎵", label: "Pitch", examples: "High / Low / Bright / Dark" },
      { icon: "🥁", label: "Rhythm", examples: "Fast / Slow / Steady" },
      { icon: "🎸", label: "Instrument", examples: "Drums, Strings, Synth, Bass" },
      { icon: "✨", label: "Feel", examples: "Heroic, Scary, Mysterious, Upbeat" }
    ]
  },

  cityComposition: {
    title: "Compose Your City Soundscape",
    icon: "🎵",
    estimatedTime: "10 minutes",
    points: [
      "Use 5 or more different loops to create variety.",
      "Create 3 or more layers by playing loops together.",
      "Build a thick texture that sounds like a busy city!",
      "Be creative with your loop combinations."
    ]
  },

  reflection: {
    title: "Reflection Time",
    icon: "⭐",
    estimatedTime: "3 minutes",
    points: [
      "Name two things you did well with texture and layering.",
      "Describe one thing you would improve or try differently.",
      "Listen to your composition while completing the reflection."
    ]
  }
};

// ========================================
// 2. ASSIGNMENT PANEL CONTENT
// ========================================
export const assignmentPanels = {
  listeningMap: {
    title: "Listening Map Activity",
    requirements: [
      {
        id: "listen",
        label: "Listen",
        shortText: "Listen carefully to each instrument",
        fullText: "Pay attention to how many instruments you hear playing."
      },
      {
        id: "draw",
        label: "Draw",
        shortText: "Draw while the music plays",
        fullText: "Create lines, shapes, or patterns that represent what you hear."
      },
      {
        id: "map",
        label: "Map",
        shortText: "Create a visual map of sounds",
        fullText: "Your drawing should show the different layers of music."
      }
    ]
  },

  cityComposition: {
    title: "Composition Assignment",
    requirements: [
      {
        id: "variety",
        label: "Variety",
        shortText: "5+ Different loops",
        fullText: "Use five or more different loops in your composition."
      },
      {
        id: "layering",
        label: "Layering",
        shortText: "3+ Layers",
        fullText: "Create three or more layers by playing loops together at the same time."
      },
      {
        id: "texture",
        label: "Thick Texture",
        shortText: "Create thick texture",
        fullText: "Your city soundscape should have a thick, full texture with many overlapping sounds."
      }
    ]
  },

  bonusActivity: {
    title: "Bonus: Add More Layers & Variation",
    description: "Great job! Use remaining time to enhance your soundscape.",
    instructions: {
      title: "Ways to enhance your composition:",
      items: [
        "Add 4, 5, or even 6 layers of sound for ultra-thick texture",
        "Try different volume levels for each loop",
        "Create sections with different textures (thin vs. thick)",
        "Experiment with when loops start and stop"
      ]
    }
  }
};

// ========================================
// 3. REFLECTION ACTIVITY CONTENT
// ========================================
export const reflectionActivity = {
  steps: {
    teacherInstruction: {
      title: "Time to Reflect!",
      text: "Before you begin your reflection, ask your teacher whether you will be reviewing your own composition (self-reflection) or reviewing a partner's composition (peer feedback).",
      voiceText: "Time to reflect on your work! First, ask your teacher: Are you reviewing your own composition, or will you be reviewing a partner's work?",
      note: "Once your teacher tells you which type of review to do, click Continue below to proceed."
    },
    
    chooseReviewType: {
      title: "Whose composition are you reviewing?",
      options: [
        { value: "self", label: "My own composition (Self-Reflect)" },
        { value: "partner", label: "A friend's composition" }
      ],
      voiceText: "Whose composition are you reviewing? Choose whether you'll reflect on your own work or a friend's composition."
    },
    
    listenAndShare: {
      self: {
        title: "Listen to Your Composition",
        text: "Take a moment to listen to your city soundscape. Think about your texture and layering choices.",
        voiceText: "Listen to your composition and think about your texture and layering choices."
      },
      partner: {
        title: "Listen to Your Partner's Composition",
        text: "Take a moment to listen to your partner's city soundscape. Think about their texture and layering choices.",
        voiceText: "Listen to your partner's composition and think about their texture and layering choices."
      }
    }
  },

  // Self-reflection prompts
  selfReflection: {
    star1: {
      title: "STAR 1: Texture & Layering",
      question: "What did you do well with texture and layering?",
      voiceText: "Star 1: Think about what went well with texture and layering.",
      options: [
        "I used multiple layers to create thick texture",
        "I layered loops effectively to build a city atmosphere",
        "I created interesting texture by combining different loops",
        "I varied the texture throughout my composition",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: Loop Choices",
      question: "How well did your loop choices work together?",
      voiceText: "Star 2: Think about how your loop choices worked together.",
      options: [
        "My loops blended together nicely",
        "I chose loops that created a good city vibe",
        "My loop combinations were creative and interesting",
        "The different layers complemented each other well",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What to try next?",
      question: "What do you want to improve or try next time?",
      voiceText: "Now for the Wish: What do you want to try or improve next time?",
      options: [
        "I want to add even more layers for thicker texture",
        "I want to try different loop combinations",
        "I want to vary the texture more (thin and thick sections)",
        "I want to experiment with different volumes and timing",
        "Custom..."
      ]
    }
  },

  // Partner reflection prompts
  partnerReflection: {
    star1: {
      title: "STAR 1: What did [Partner Name] do well?",
      question: "What did [Partner Name] do well with texture and layering?",
      voiceText: "Star 1: What did they do well with texture and layering?",
      options: [
        "[Partner Name] used multiple layers effectively",
        "[Partner Name] created thick texture that sounded full",
        "[Partner Name] made interesting layer combinations",
        "[Partner Name] varied the texture throughout",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: What worked well?",
      question: "How well did [Partner Name]'s loops work together?",
      voiceText: "Star 2: How well did their loops work together?",
      options: [
        "The loops blended together nicely",
        "The loops created a good city atmosphere",
        "The loop combinations were creative",
        "The layers complemented each other well",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What could they try?",
      question: "What could [Partner Name] try or improve next time?",
      voiceText: "Now for the Wish: What could they try or improve?",
      options: [
        "[Partner Name] could add more layers",
        "[Partner Name] could try different loop combinations",
        "[Partner Name] could vary the texture more",
        "[Partner Name] could experiment with volumes and timing",
        "Custom..."
      ]
    }
  }
};

// ========================================
// 4. LISTENING MAP SPECIFIC CONTENT
// ========================================
export const listeningMapContent = {
  instructions: {
    title: "🗺️ Listening Map",
    subtitle: "Listen & Draw Layers",
    overview: "You'll listen to music and draw what you hear on a blank canvas.",
    mainSteps: [
      {
        step: 1,
        icon: "🎧",
        title: "Listen to the music",
        description: "Press play and listen carefully to how many instruments are playing"
      },
      {
        step: 2,
        icon: "🎨",
        title: "Draw while listening",
        description: "Use lines, shapes, and colors to represent each instrument you hear"
      },
      {
        step: 3,
        icon: "🗺️",
        title: "Create your map",
        description: "Your drawing is a visual map of all the sounds in the music"
      },
      {
        step: 4,
        icon: "💾",
        title: "Save your work",
        description: "Click Save to keep your listening map"
      }
    ]
  },
  
  rounds: [
    {
      id: 1,
      title: "String Quartet",
      subtitle: "Four Voices",
      instrumentCount: 4,
      instruments: ["Violin 1", "Violin 2", "Viola", "Cello"],
      description: "Listen for FOUR instruments weaving together",
      instruction: "Draw lines or shapes to represent each instrument you hear",
      color: "#8B5CF6",
      piece: "Eine kleine Nachtmusik"
    }
  ],

  drawingTips: [
    { icon: "📏", tip: "Use different line styles for different instruments (wavy, straight, dotted)" },
    { icon: "🎨", tip: "Try different colors for each instrument" },
    { icon: "⬆️", tip: "Higher sounds can go higher on the canvas" },
    { icon: "📐", tip: "Thicker lines for louder instruments" }
  ],

  reflectionQuestions: [
    "How did you represent different instruments in your drawing?",
    "Could you hear each instrument separately?",
    "What does 'thick texture' look like in your listening map?"
  ]
};

// ========================================
// 5. LOOP LAB SPECIFIC CONTENT
// ========================================
export const loopLabContent = {
  instructions: {
    title: "🎧 Loop Lab 🔬",
    subtitle: "One Hears, One Builds!",
    setup: "Groups of 2-3 students share ONE Chromebook",
    mainSteps: [
      {
        step: 1,
        icon: "🎧",
        title: "Listener puts on headphones",
        description: "Only the Listener can hear the mystery loops"
      },
      {
        step: 2,
        icon: "🗣️",
        title: "Listener describes what they hear",
        description: "Use musical words: pitch, rhythm, instrument type, mood"
      },
      {
        step: 3,
        icon: "🔨",
        title: "Builder selects matching loops",
        description: "Try to recreate what the Listener describes"
      },
      {
        step: 4,
        icon: "✅",
        title: "Check and score!",
        description: "See how close you got, then swap roles"
      }
    ]
  },
  
  vocabularyGuide: {
    title: "Musical Vocabulary Helper",
    categories: [
      {
        name: "Pitch",
        icon: "🎵",
        words: ["High", "Low", "Bright", "Dark", "Squeaky", "Deep", "Boomy"]
      },
      {
        name: "Rhythm",
        icon: "🥁", 
        words: ["Fast", "Slow", "Steady beat", "Bouncy", "Driving", "Relaxed"]
      },
      {
        name: "Instruments",
        icon: "🎸",
        words: ["Drums", "Strings", "Synth", "Bass", "Brass", "Guitar", "Piano", "Bells"]
      },
      {
        name: "Mood/Feel",
        icon: "✨",
        words: ["Heroic", "Scary", "Mysterious", "Upbeat", "Hype", "Intense", "Calm"]
      }
    ]
  },

  scoringExplanation: {
    title: "How Scoring Works",
    items: [
      { label: "Exact Match", points: "+20", description: "You picked the exact same loop!" },
      { label: "Right Category", points: "+5", description: "Right type of instrument, different loop" },
      { label: "Perfect Bonus", points: "+10", description: "All loops matched perfectly!" }
    ],
    tip: "The Builder earns points, so Listeners: communicate clearly to help your partner score!"
  }
};