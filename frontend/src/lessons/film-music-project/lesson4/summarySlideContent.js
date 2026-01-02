// File: /src/lessons/film-music-project/lesson4/summarySlideContent.js
// All instructional text and content for Lesson 4 - Sports Highlights (Rhythm & Beat Creation)
// STREAMLINED: Updated for 11-stage lesson flow

// ========================================
// 1. SUMMARY SLIDES (Streamlined)
// ========================================
export const summarySlides = {
  welcomeAgenda: {
    title: "Sports Highlight Reel",
    subtitle: "Rhythm & Beat Creation",
    estimatedTime: "1 minute",
    agenda: [
      "1. WATCH - Compare video with/without music",
      "2. LEARN - How beats create energy",
      "3. CREATE - Build your own beat + score a video"
    ],
    essentialQuestion: "How does rhythm create energy in music?"
  },

  hookDiscussion: {
    title: "What Did You Notice?",
    estimatedTime: "2 minutes",
    questions: [
      "How did the music change how you felt?",
      "What did you notice about the rhythm?",
      "What feeling did you have when you heard the rhythm being added?"
    ]
  },

  beatBasics: {
    title: "WHAT IS A BEAT?",
    estimatedTime: "3 minutes",
    concepts: [
      {
        term: "BEAT",
        definition: "The steady pulse you can clap to"
      },
      {
        term: "MEASURE",
        definition: "A group of 4 beats (1-2-3-4)"
      }
    ],
    intro: "Next, you'll hear the 4 sounds that make up almost every pop, hip-hop, rock, and EDM song:",
    drumSounds: [
      {
        name: "KICK DRUM",
        emoji: "🔴",
        description: "The big bass drum on the floor",
        color: "#ef4444"
      },
      {
        name: "SNARE DRUM",
        emoji: "🟠",
        description: "The cracking drum in the middle",
        color: "#f59e0b"
      },
      {
        name: "HI-HAT (closed)",
        emoji: "🟢",
        description: "Two cymbals tapping together",
        color: "#10b981"
      },
      {
        name: "HI-HAT (open)",
        emoji: "🔵",
        description: "Two cymbals ringing out",
        color: "#3b82f6"
      }
    ]
  },

  compositionInstructions: {
    title: "Score the Sports Highlight",
    subtitle: "Student Activity",
    estimatedTime: "1 minute",
    requirements: [
      "Use YOUR beat from Beat Maker or create additional custom beats by clicking on Beat Maker",
      "Add 3+ loops from the library",
      "Match the energy of the action",
      "Build intensity as the video builds"
    ]
  },

  quickShare: {
    title: "Quick Share",
    estimatedTime: "2 minutes",
    points: [
      "2-3 students will play 15 seconds of their work.",
      "Listen for how their beat matches the action.",
      "Notice different rhythmic choices.",
      "Celebrate creative decisions!"
    ]
  },

  conclusion: {
    title: "Today's Key Insight",
    estimatedTime: "1 minute",
    mainPoint: "Rhythm is the heartbeat of your music",
    takeaways: [
      "KICK = Foundation",
      "SNARE = Backbeat",
      "HI-HAT = Momentum",
      "Together they DRIVE the action!"
    ]
  }
};

// ========================================
// 2. ASSIGNMENT PANEL CONTENT
// ========================================
export const assignmentPanels = {
  beatMaker: {
    title: "Beat Maker Activity",
    requirements: [
      {
        id: "kick",
        label: "Kick Pattern",
        shortText: "Add kick drum",
        fullText: "Create a kick drum pattern as your rhythmic foundation."
      },
      {
        id: "snare",
        label: "Snare Pattern",
        shortText: "Add snare",
        fullText: "Add snare hits to create the backbeat."
      },
      {
        id: "hihat",
        label: "Hi-Hat Pattern",
        shortText: "Add hi-hat",
        fullText: "Layer in hi-hat to create momentum and drive."
      }
    ]
  },

  sportsComposition: {
    title: "Composition Assignment",
    requirements: [
      {
        id: "beat",
        label: "Original Beat",
        shortText: "Create a beat",
        fullText: "Use your original beat pattern from the Beat Maker."
      },
      {
        id: "loops",
        label: "Loops",
        shortText: "3+ loops",
        fullText: "Add at least three loops from the library to complement your beat."
      },
      {
        id: "energy",
        label: "Energy Match",
        shortText: "Match the action",
        fullText: "Your rhythm should match the energy of the sports video."
      },
      {
        id: "intensity",
        label: "Build Intensity",
        shortText: "Build up",
        fullText: "Increase intensity as the action builds in the video."
      }
    ]
  },

  bonusActivity: {
    title: "Bonus: Rhythm Variations",
    description: "Great job! Use remaining time to enhance your beat.",
    instructions: {
      title: "Ways to enhance your rhythm:",
      items: [
        "Try different kick and snare patterns",
        "Experiment with hi-hat variations",
        "Add syncopation for more excitement"
      ]
    }
  }
};

// ========================================
// 3. BEAT MAKER CONTENT
// ========================================
export const beatMakerContent = {
  instructions: {
    title: "Next you will make your own beat",
    text: "Add a kick, snare, hi-hat, and open hi-hat to make a drum pattern."
  },

  drumDescriptions: {
    kick: {
      name: "Kick Drum",
      description: "Low, deep foundation",
      hints: ["The heartbeat", "Usually on 1 and 3", "Creates the pulse"]
    },
    snare: {
      name: "Snare Drum",
      description: "Sharp, cracking sound",
      hints: ["Creates the backbeat", "Usually on 2 and 4", "Adds punch"]
    },
    hihat: {
      name: "Hi-Hat",
      description: "Metallic, ticking sound",
      hints: ["Creates momentum", "Can play every beat", "Drives the groove"]
    }
  },

  feedback: {
    tryKick: "Try adding kick drum on beats 1 and 3 first.",
    addSnare: "Nice! Now add snare on beats 2 and 4.",
    layerHiHat: "Great! Layer in hi-hat to add momentum.",
    complete: "You've built a solid beat! Ready to compose!"
  }
};

// ========================================
// 4. REFLECTION ACTIVITY CONTENT (Beat Spotlight)
// ========================================
export const reflectionActivity = {
  steps: {
    teacherInstruction: {
      title: "Time to Reflect!",
      text: "Think about the rhythmic choices you made in your composition. How did your beat match the sports action?",
      voiceText: "Time to reflect on your beat choices! Think about why you created the rhythm you did.",
      note: "Click Continue to begin your Beat Spotlight reflection."
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
        title: "Listen to Your Sports Music",
        mainText: "Listen to your entire sports composition from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "What beat pattern did you create?",
            "How does your rhythm match the action?",
            "Where does the energy build?"
          ]
        },
        voiceText: "Now, listen to your entire sports composition. Pay attention to: Your beat pattern. How the rhythm matches the action. And where the energy builds."
      },
      partner: {
        title: "Share & Listen",
        shareFirst: {
          title: "First: Share your score",
          text: "Share your score with [Partner Name] so they can see and hear your work."
        },
        mainText: "Now, listen to [Partner Name]'s entire sports composition from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "What beat pattern did they create?",
            "How does their rhythm match the action?",
            "Where does the energy build?"
          ]
        },
        voiceText: "Now share your work! First, share your score with [Partner Name]. Then, listen to their composition and pay attention to their rhythm choices."
      }
    },

    summary: {
      self: {
        title: "Your Beat Spotlight",
        readAloud: {
          title: "Now Read Your Reflection Aloud!",
          text: "Read your reflection to yourself or share it with a neighbor."
        },
        voiceText: "Here's your complete Beat Spotlight! Now read your reflection out loud to yourself or share it with a neighbor."
      },
      partner: {
        title: "Your Beat Spotlight",
        readAloud: {
          title: "Now Read Your Reflection Aloud!",
          text: "Read this feedback out loud to [Partner Name]."
        },
        voiceText: "Here's your complete Beat Spotlight! Now read your feedback out loud to [Partner Name]."
      }
    }
  },

  // Self-reflection prompts (Beat Spotlight format)
  selfReflection: {
    beatPattern: {
      title: "YOUR BEAT",
      question: "Describe your beat pattern.",
      voiceText: "Describe your beat: What pattern did you create?",
      options: [
        "I used a strong kick on 1 and 3 with snare on 2 and 4",
        "I created a driving beat with hi-hat throughout",
        "I used syncopated rhythms for more excitement",
        "I kept the beat simple to support the loops",
        "Custom..."
      ]
    },
    energyMatch: {
      title: "THE MATCH",
      question: "How does your beat match the video action?",
      voiceText: "How does your beat match the sports action?",
      options: [
        "The beat builds energy when the action gets intense",
        "My rhythm matches the speed of the sports movements",
        "The kick hits match big moments in the video",
        "The overall feel matches the sports energy",
        "Custom..."
      ]
    },
    wish: {
      title: "NEXT TIME",
      question: "What would you change next time?",
      voiceText: "What would you try next time?",
      options: [
        "I would try more complex hi-hat patterns",
        "I would add more variation in my beat",
        "I would build more intensity throughout",
        "I would try different tempo settings",
        "Custom..."
      ]
    }
  },

  // Partner reflection prompts
  partnerReflection: {
    beatPattern: {
      title: "THEIR BEAT",
      question: "Describe [Partner Name]'s beat pattern.",
      voiceText: "What beat pattern did they create?",
      options: [
        "[Partner Name] used a strong, steady beat pattern",
        "[Partner Name] created interesting rhythmic variations",
        "[Partner Name] kept the beat simple and effective",
        "[Partner Name] used complex layered rhythms",
        "Custom..."
      ]
    },
    energyMatch: {
      title: "THE MATCH",
      question: "How well did their beat match the action?",
      voiceText: "How does their beat match the sports action?",
      options: [
        "Their beat matched the energy of the video well",
        "The rhythm built at the right moments",
        "The beat supported the sports action nicely",
        "The intensity matched the video's intensity",
        "Custom..."
      ]
    },
    wish: {
      title: "SUGGESTION",
      question: "What could [Partner Name] try next time?",
      voiceText: "What could they try next time?",
      options: [
        "[Partner Name] could try more hi-hat variation",
        "[Partner Name] could build more intensity",
        "[Partner Name] could try different beat patterns",
        "[Partner Name] could experiment with syncopation",
        "Custom..."
      ]
    }
  }
};

// ========================================
// 5. DRUM KIT DEFINITIONS
// ========================================
export const DRUM_KIT = [
  {
    id: 'kick',
    name: 'Kick Drum',
    description: 'Low, deep foundation',
    color: '#ef4444',
    beats: [1, 3],
    role: 'The heartbeat of the music'
  },
  {
    id: 'snare',
    name: 'Snare Drum',
    description: 'Sharp, cracking sound',
    color: '#f59e0b',
    beats: [2, 4],
    role: 'Creates the backbeat'
  },
  {
    id: 'hihat',
    name: 'Hi-Hat',
    description: 'Metallic, ticking sound',
    color: '#10b981',
    beats: [1, 2, 3, 4],
    role: 'Creates momentum'
  }
];
