/// File: /src/lessons/film-music-project/lesson4/summarySlideContent.js
// CENTRALIZED CONTENT for all Lesson 4 instructional text
// All slides, panels, modals, and activity instructions in ONE place

// ========================================
// 1. PRE-ACTIVITY SUMMARY SLIDES
// ========================================
export const summarySlides = {
  intro: {
    title: "Welcome to Chef's Soundtrack!",
    icon: "🍳",
    estimatedTime: "2 minutes",
    points: [
      "Learn how music evolves throughout a cooking process.",
      "Understand song form and sectional loop composition.",
      "Create music that builds and changes with the recipe."
    ]
  },

  songForm: {
    title: "Understanding Song Form",
    icon: "🎵",
    estimatedTime: "3 minutes",
    points: [
      "Songs have different sections (verses, choruses, bridges).",
      "Each section has its own musical character and purpose.",
      "Sections repeat and contrast to create interesting music."
    ]
  },

  sectionalLoopForm: {
    title: "Sectional Loop Builder",
    icon: "🎮",
    estimatedTime: "5 minutes",
    points: [
      "Practice building music with different sections.",
      "Learn how sections work together to create structure.",
      "Complete the interactive game to master the concept."
    ]
  },

  composition: {
    title: "Compose Your Chef's Soundtrack",
    icon: "👨‍🍳",
    estimatedTime: "10 minutes",
    points: [
      "Create at least three distinct sections of music.",
      "Use different loops for each section to show progression.",
      "Match your music to the stages of the cooking process."
    ]
  },

  reflection: {
    title: "Two Stars and a Wish",
    icon: "⭐",
    estimatedTime: "6 minutes",
    points: [
      "Name two things you did well in your composition today.",
      "Describe one thing you would improve or change next time.",
      "Reflect on how your music evolved with the cooking video."
    ]
  }
};

// ========================================
// 2. ASSIGNMENT PANEL CONTENT (During Activities)
// ========================================
export const assignmentPanels = {
  composition: {
    title: "Chef's Soundtrack Assignment",
    requirements: [
      {
        id: "sections",
        label: "Song Form",
        shortText: "3+ distinct sections",
        fullText: "Create at least three distinct musical sections (A, B, C, etc.)"
      },
      {
        id: "progression",
        label: "Mood Progression",
        shortText: "Music evolves with video",
        fullText: "Your music should change and evolve as the cooking process progresses"
      },
      {
        id: "variety",
        label: "Loop Variety",
        shortText: "Different loops per section",
        fullText: "Use different loop combinations in each section to create contrast"
      }
    ]
  },

  bonusChallenge: {
    title: "Bonus: Add More Sections",
    description: "Great job! Use the remaining time to expand your composition.",
    instructions: {
      title: "Ways to enhance your soundtrack:",
      items: [
        "Add an intro section before cooking begins",
        "Create a climax section for the final plating",
        "Add transitions between your main sections",
        "Experiment with volume changes across sections"
      ]
    },
    howToAdd: {
      title: "Tips for sectional composition:",
      steps: [
        "Think about the emotional arc of cooking",
        "Start calm, build energy during prep",
        "Peak excitement during cooking",
        "Satisfying resolution at the end"
      ]
    }
  }
};

// ========================================
// 3. REFLECTION ACTIVITY CONTENT
// ========================================
export const reflectionActivity = {
  // Step-by-step instructions and voice narration
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
        title: "Listen to Your Chef's Soundtrack",
        mainText: "Listen to your entire soundtrack from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "How your music changes between sections",
            "How the sections match the cooking process",
            "The overall progression and flow of your music"
          ]
        },
        voiceText: "Now, listen to your entire Chef's Soundtrack from beginning to end. Pay attention to: How your music changes between sections. How the sections match the cooking process. And the overall progression and flow of your music."
      },
      partner: {
        title: "Share & Listen",
        shareFirst: {
          title: "🔄 First: Share your soundtrack",
          text: "Share your soundtrack with [Partner Name] so they can see and hear your work."
        },
        mainText: "Now, listen to [Partner Name]'s entire soundtrack from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "How the music changes between sections",
            "How the sections match the cooking process",
            "The overall progression and flow of the music"
          ]
        },
        voiceText: "Now it's time to share! First, share your soundtrack with [Partner Name] so they can see and hear your work. Then, listen to [Partner Name]'s entire soundtrack from beginning to end. Pay attention to: How the music changes between sections. How the sections match the cooking process. And the overall progression and flow."
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
      title: "STAR 1: Sectional Composition",
      question: "What did you do well with creating distinct sections?",
      voiceText: "Star 1: Think about what went well with creating distinct sections. What did you do well?",
      options: [
        "I created clear differences between my sections",
        "I chose loops that fit each stage of cooking",
        "I organized my sections in a logical order",
        "I used the sectional loop builder concepts effectively",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: Musical Progression",
      question: "What worked well with how your music evolved?",
      voiceText: "Star 2: Think about what worked well with how your music evolved over time.",
      options: [
        "My music built energy throughout the cooking process",
        "Each section had its own unique character",
        "The transitions between sections felt smooth",
        "My music matched the mood of each cooking stage",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What to try next?",
      question: "What do you want to try or improve next time?",
      voiceText: "Now for the Wish: What do you want to try or improve next time?",
      options: [
        "I want to create more sections with better contrast",
        "I want to make smoother transitions between sections",
        "I want to experiment with different section orders",
        "I want to add an intro or outro section",
        "Custom..."
      ]
    }
  },

  // Partner reflection prompts
  partnerReflection: {
    star1: {
      title: "STAR 1: What did [Partner Name] do well?",
      question: "What did [Partner Name] do well with their sectional composition?",
      voiceText: "Star 1: Think about what went well with the sectional composition. What did they do well?",
      options: [
        "[Partner Name] created clear section differences",
        "[Partner Name] chose loops that fit the cooking stages",
        "[Partner Name] organized sections in a good order",
        "[Partner Name] used sectional concepts effectively",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: What worked well?",
      question: "What worked well with [Partner Name]'s musical progression?",
      voiceText: "Star 2: Think about what worked well with the musical progression.",
      options: [
        "The music built energy throughout",
        "Each section had unique character",
        "The transitions felt smooth",
        "The music matched the cooking mood",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What could they try?",
      question: "What could [Partner Name] try or improve next time?",
      voiceText: "Now for the Wish: What could they try or improve next time?",
      options: [
        "[Partner Name] could try more section contrast",
        "[Partner Name] could work on smoother transitions",
        "[Partner Name] could experiment with section order",
        "[Partner Name] could add intro/outro sections",
        "Custom..."
      ]
    }
  }
};

// ========================================
// 4. SECTIONAL LOOP BUILDER GAME CONTENT
// ========================================
export const sectionalBuilderContent = {
  instructions: {
    title: "Build Your Song!",
    description: "Drag sections to create a complete song form.",
    rules: [
      "Each song needs at least 3 sections",
      "Sections can repeat (A-B-A is valid)",
      "Try different combinations to see what sounds good!"
    ]
  },
  
  sections: {
    A: { name: "Section A", color: "#3b82f6", description: "Main theme" },
    B: { name: "Section B", color: "#10b981", description: "Contrasting idea" },
    C: { name: "Section C", color: "#f59e0b", description: "Bridge or climax" }
  },
  
  exampleForms: {
    simple: { pattern: "A-B-A", name: "Simple Song Form" },
    verse: { pattern: "A-B-A-B", name: "Verse-Chorus" },
    complex: { pattern: "A-B-C-B", name: "With Bridge" }
  }
};