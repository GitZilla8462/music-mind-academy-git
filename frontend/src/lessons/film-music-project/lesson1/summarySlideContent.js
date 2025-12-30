// File: /src/lessons/film-music-project/lesson1/summarySlideContent.js
// All instructional text and content for Lesson 1 - Score the Adventure (Mood & Expression)

// ========================================
// 1. PRE-ACTIVITY SUMMARY SLIDES
// ========================================
export const summarySlides = {
  welcomeIntro: {
    title: "Score the Adventure",
    icon: "🎬",
    estimatedTime: "1 minute",
    points: [
      "Today you'll score stunning drone footage with music.",
      "Learn how music creates different moods and emotions.",
      "Choose a mood and create music that makes people FEEL it."
    ]
  },

  agenda: {
    title: "Today's Agenda",
    icon: "📋",
    estimatedTime: "1 minute",
    points: [
      "1. Discover how music creates mood",
      "2. Practice matching loops to moods",
      "3. Learn about a digital audio workstation",
      "4. Create your own adventure score"
    ]
  },

  hookDemo: {
    title: "Same Video, Different Music",
    icon: "🎭",
    estimatedTime: "3 minutes",
    points: [
      "Watch the same drone footage with two different scores.",
      "Notice how the music completely changes how you feel.",
      "Think: Which version feels epic? Which feels mysterious?"
    ]
  },

  moodDiscussion: {
    title: "How Did the Music Make You Feel?",
    icon: "💭",
    estimatedTime: "2 minutes",
    points: [
      "The same video can feel completely different with different music.",
      "Music has the power to create emotions in the viewer.",
      "Film composers choose music carefully to shape how audiences feel."
    ]
  },

  moodCategories: {
    title: "The Five Mood Categories",
    subtitle: "These are the mood categories you will be able to compose with later in class.",
    icon: "🎨",
    estimatedTime: "2 minutes",
    categories: [
      { name: "Heroic", description: "Powerful, bold, triumphant", color: "#EF4444" },
      { name: "Hype", description: "Exciting, energetic, pumped up", color: "#F59E0B" },
      { name: "Mysterious", description: "Intriguing, unknown, curious", color: "#3B82F6" },
      { name: "Scary", description: "Frightening, tense, horror", color: "#7C3AED" },
      { name: "Upbeat", description: "Happy, positive, cheerful", color: "#10B981" }
    ]
  },

  moodMatchIntro: {
    title: "Mood Match Game",
    icon: "🎮",
    estimatedTime: "1 minute",
    points: [
      "Listen to different music loops.",
      "Drag each loop to the mood category it belongs to.",
      "Think about HOW the music makes you feel, not just the instruments."
    ]
  },

  whatIsDAW: {
    title: "What is a DAW?",
    subtitle: "Digital Audio Workstation",
    icon: "🎹",
    estimatedTime: "1 minute",
    imagePath: "/landingpage/DigitalAudioWorkstation.png",
    points: [
      "DAW = Digital Audio Workstation — software that lets you record, edit, and create music on a computer.",
      "Before DAWs, musicians needed million-dollar recording studios with giant mixing boards, tape machines, and rooms full of equipment.",
      "In the 1990s, software like Pro Tools made it possible to do all of that on a regular computer."
    ]
  },

  dawsToday: {
    title: "DAWs Today",
    icon: "🎧",
    estimatedTime: "1 minute",
    imagePath: "/landingpage/LandingPageTopPicture.png",
    points: [
      "Apps like GarageBand, FL Studio, Ableton, and Logic Pro are used by professional artists to make hit songs.",
      "Billie Eilish's brother Finneas produced her Grammy-winning album in his bedroom using Logic Pro.",
      "That song stuck in your head right now? It was probably made on a laptop, not in a fancy studio.",
      "Next we will watch a 2 minute video that introduces the DAW we will use today."
    ]
  },

  reflectionInstructions: {
    title: "Two Stars and a Wish",
    icon: "⭐",
    estimatedTime: "1 minute",
    points: [
      "Star 1: What mood did you create? How did you achieve it?",
      "Star 2: What worked well in your composition?",
      "Wish: What would you try differently next time?",
      "🎮 When finished, play Name That Loop with 1-2 other students!"
    ]
  },

  conclusion: {
    title: "Share Your Adventure",
    icon: "🌟",
    estimatedTime: "2 minutes",
    points: [
      "What mood did you choose to create?",
      "How did you use music to achieve that mood?",
      "Did anyone try a different mood for the same footage?"
    ]
  }
};

// ========================================
// 2. ASSIGNMENT PANEL CONTENT
// ========================================
export const assignmentPanels = {
  adventureComposition: {
    title: "Composition Assignment",
    requirements: [
      {
        id: "mood",
        label: "Mood",
        shortText: "Choose 1 mood",
        fullText: "Pick one mood category for your composition (Epic, Scary, Mysterious, Peaceful, or Triumphant)."
      },
      {
        id: "variety",
        label: "Variety",
        shortText: "5+ different loops",
        fullText: "Use five or more different loops in your composition."
      },
      {
        id: "layering",
        label: "Layering",
        shortText: "3+ layers",
        fullText: "Create three or more layers by playing loops together at the same time."
      }
    ]
  },

  bonusActivity: {
    title: "Bonus: Build Intensity",
    description: "Great job! Use remaining time to enhance your composition.",
    instructions: {
      title: "Ways to build intensity:",
      items: [
        "Start with fewer layers, add more as the video progresses",
        "Use quieter loops at the start, louder ones at the climax",
        "Match loop changes to key moments in the drone footage"
      ]
    }
  }
};

// ========================================
// 3. MOOD MATCH GAME CONTENT
// ========================================
export const moodMatchGame = {
  instructions: {
    title: "Match the Loops to Their Mood",
    text: "Listen to each loop and drag it to the mood category that best describes how it makes you feel.",
    tip: "Think about the emotion the music creates, not just what instruments you hear."
  },

  moodDescriptions: {
    epic: {
      name: "Epic",
      description: "Powerful, heroic, triumphant",
      hints: ["Big drums", "Brass instruments", "Major key", "Building energy"]
    },
    scary: {
      name: "Scary",
      description: "Frightening, tense, horror",
      hints: ["Low synths", "Dissonance", "Sparse sounds", "Tension"]
    },
    mysterious: {
      name: "Mysterious",
      description: "Intriguing, unknown, curious",
      hints: ["Minor key", "Soft sounds", "Atmospheric", "Wonder"]
    },
    peaceful: {
      name: "Peaceful",
      description: "Calm, relaxing, serene",
      hints: ["Acoustic sounds", "Slow tempo", "Major key", "Gentle"]
    },
    triumphant: {
      name: "Triumphant",
      description: "Victorious, celebratory",
      hints: ["Brass fanfares", "Percussion", "Building crescendo", "Joy"]
    }
  },

  feedback: {
    correct: "Great ear! That loop definitely fits the {mood} mood.",
    incorrect: "Not quite! Think about how this loop makes you FEEL. Try again!",
    hint: "Listen for: {hints}"
  }
};

// ========================================
// 4. REFLECTION ACTIVITY CONTENT
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
        title: "Listen to Your Adventure Score",
        mainText: "Listen to your entire composition from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "What mood did you create?",
            "How did your loop choices create that mood?",
            "Did your layers build intensity?"
          ]
        },
        voiceText: "Now, listen to your entire adventure score. Pay attention to: What mood did you create? How did your loop choices create that mood? And did your layers build intensity?"
      },
      partner: {
        title: "Share & Listen",
        shareFirst: {
          title: "📤 First: Share your score",
          text: "Share your score with [Partner Name] so they can see and hear your work."
        },
        mainText: "Now, listen to [Partner Name]'s entire adventure score from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "What mood did they create?",
            "How did their loop choices create that mood?",
            "Did their layers build intensity?"
          ]
        },
        voiceText: "Now share your work! First, share your score with [Partner Name]. Then, listen to their composition and pay attention to the mood, loop choices, and layering."
      }
    },

    summary: {
      self: {
        title: "♪ Your Reflection Summary",
        readAloud: {
          title: "📖 Now Read Your Reflection Aloud!",
          text: "Read your reflection to yourself or share it with a neighbor."
        },
        voiceText: "Here's your complete reflection summary! Now read your reflection out loud to yourself or share it with a neighbor."
      },
      partner: {
        title: "♪ Your Reflection Summary",
        readAloud: {
          title: "📖 Now Read Your Reflection Aloud!",
          text: "Read this feedback out loud to [Partner Name]."
        },
        voiceText: "Here's your complete reflection summary! Now read your feedback out loud to [Partner Name]."
      }
    }
  },

  // Self-reflection prompts
  selfReflection: {
    star1: {
      title: "STAR 1: Creating Mood",
      question: "What mood did you create and how?",
      voiceText: "Star 1: What mood did you create and how did you achieve it?",
      options: [
        "I created an epic mood with powerful drums and brass",
        "I created a mysterious mood with soft, atmospheric sounds",
        "I created a peaceful mood with gentle, acoustic loops",
        "I created a scary mood with tense, dissonant sounds",
        "I created a triumphant mood with building, celebratory music",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: What Worked Well?",
      question: "What worked well in your composition?",
      voiceText: "Star 2: What worked well in your composition?",
      options: [
        "My loop choices all fit the same mood",
        "My layers built intensity throughout the video",
        "I timed my loops to match key moments in the footage",
        "My composition made me feel the mood I was going for",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What to try next?",
      question: "What would you try differently next time?",
      voiceText: "Now for the Wish: What would you try differently next time?",
      options: [
        "I would try a different mood to see how it changes the video",
        "I would add more layers to make the music fuller",
        "I would time my loop changes more carefully",
        "I would experiment with mixing different mood loops",
        "Custom..."
      ]
    }
  },

  // Partner reflection prompts
  partnerReflection: {
    star1: {
      title: "STAR 1: What mood did [Partner Name] create?",
      question: "What mood did [Partner Name] create and how?",
      voiceText: "Star 1: What mood did they create and how did they achieve it?",
      options: [
        "[Partner Name] created an epic mood effectively",
        "[Partner Name] created a mysterious, intriguing atmosphere",
        "[Partner Name] created a peaceful, calming score",
        "[Partner Name] created a tense, scary mood",
        "[Partner Name] created a triumphant, celebratory feel",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: What worked well?",
      question: "What worked well in [Partner Name]'s composition?",
      voiceText: "Star 2: What worked well in their composition?",
      options: [
        "Their loop choices all fit together well",
        "Their layers created a full, rich sound",
        "Their timing matched the video perfectly",
        "Their composition really made me feel the mood",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What could they try?",
      question: "What could [Partner Name] try next time?",
      voiceText: "Now for the Wish: What could they try next time?",
      options: [
        "[Partner Name] could try a different mood",
        "[Partner Name] could add more layers",
        "[Partner Name] could adjust timing more precisely",
        "[Partner Name] could experiment with different loops",
        "Custom..."
      ]
    }
  }
};
