// File: /src/lessons/film-music-project/lesson4/summarySlideContent.js
// All instructional text and content for Lesson 4 - Epic Wildlife
// ✅ UPDATED: Renamed from "Chef's Soundtrack" to "Epic Wildlife"

// ========================================
// 1. PRE-ACTIVITY SUMMARY SLIDES
// ========================================
export const summarySlides = {
  introVideo: {
    title: "Welcome to Epic Wildlife!",
    icon: "🌍",
    estimatedTime: "3 minutes",
    points: [
      "Learn about song form and sectional loops.",
      "Build song structures using Intro → A → A' → A → Outro.",
      "Create your own wildlife soundtrack using multiple sections."
    ]
  },

  songFormConcept: {
    title: "What is Song Form?",
    icon: "🎵",
    estimatedTime: "Discussion",
    points: [
      "Form = The structure or organization of music",
      "Sections = Different parts of a song (A, B, C, etc.)",
      "Intro = Beginning that sets the mood",
      "Outro = Ending that wraps up the music"
    ]
  },

  sectionalLoopForm: {
    title: "Sectional Loop Form",
    icon: "🔄",
    estimatedTime: "Discussion",
    points: [
      "Music is built from repeating loops in sections.",
      "Each section has a different number of layers.",
      "A' (A-prime) is a variation of A with MORE layers.",
      "The pattern: Intro → A → A' → A → Outro"
    ]
  },

  sectionalLoopBuilder: {
    title: "Section Safari Game",
    icon: "🎮",
    estimatedTime: "10 minutes",
    points: [
      "Listen to mystery clips and count the layers",
      "Place each clip in the correct slot",
      "Build the song structure: Intro → A → A' → A → Outro",
      "Safari bonus: Find classmates and enter their codes!"
    ],
    structure: {
      title: "Target Structure",
      sections: [
        { name: "INTRO", layers: 2, description: "Thin texture to start" },
        { name: "A", layers: 3, description: "Main theme with medium texture" },
        { name: "A'", layers: 4, description: "Variation with thicker texture" },
        { name: "A", layers: 3, description: "Return to main theme" },
        { name: "OUTRO", layers: 1, description: "Thin texture to end" }
      ]
    },
    scoring: {
      correct: { points: 25, label: "Correct Placement" },
      completion: { points: 25, label: "Round Bonus" },
      safari: { points: 50, label: "Safari Bonus" }
    }
  },

  wildlifeComposition: {
    title: "Compose Your Wildlife Soundtrack",
    icon: "🦁",
    estimatedTime: "12 minutes",
    points: [
      "Choose a wildlife video to score.",
      "Use sectional loop form: Intro → A → A' → A → Outro.",
      "Create at least 5 different sections.",
      "Build thin and thick textures across your composition."
    ]
  },

  reflection: {
    title: "Two Stars and a Wish",
    icon: "⭐",
    estimatedTime: "2 minutes",
    points: [
      "Name two things you did well with song form and sections.",
      "Describe one thing you would improve or try differently.",
      "Listen to your composition while completing the reflection."
    ]
  },

  robotMelodyMaker: {
    title: "Robot Melody Maker",
    icon: "🤖",
    estimatedTime: "8 minutes",
    points: [
      "Create your own loop using the step sequencer.",
      "Customize your robot's body, eyes, mouth, and accessories.",
      "Watch your robot dance and sing to your music!",
      "Save your creation when you're done."
    ]
  }
};

// ========================================
// 2. ASSIGNMENT PANEL CONTENT
// ========================================
export const assignmentPanels = {
  sectionalLoopBuilder: {
    title: "Section Safari Game",
    requirements: [
      {
        id: "listen",
        label: "Listen",
        shortText: "Listen to each mystery clip",
        fullText: "Count the number of layers in each clip to identify its section."
      },
      {
        id: "identify",
        label: "Identify",
        shortText: "Count the layers",
        fullText: "INTRO=2, A=3, A'=4, OUTRO=1 layers."
      },
      {
        id: "place",
        label: "Place",
        shortText: "Put clips in the right slots",
        fullText: "Build the correct song structure by placing clips in order."
      },
      {
        id: "safari",
        label: "Safari",
        shortText: "Find classmates (bonus)",
        fullText: "When prompted, find the classmate with the matching animal and enter their code for bonus points!"
      }
    ]
  },

  wildlifeComposition: {
    title: "Composition Assignment",
    requirements: [
      {
        id: "sections",
        label: "Sections",
        shortText: "5+ Different sections",
        fullText: "Create at least five different sections in your composition."
      },
      {
        id: "form",
        label: "Form",
        shortText: "Use sectional loop form",
        fullText: "Follow the Intro → A → A' → A → Outro structure."
      },
      {
        id: "texture",
        label: "Texture",
        shortText: "Vary your texture",
        fullText: "Create thin and thick textures across different sections."
      },
      {
        id: "progression",
        label: "Progression",
        shortText: "Build and release",
        fullText: "Your music should build up to A' and then return down."
      }
    ]
  },

  robotMelodyMaker: {
    title: "Robot Melody Maker",
    requirements: [
      {
        id: "sequencer",
        label: "Sequencer",
        shortText: "Create a loop",
        fullText: "Click cells in the grid to create your melody and beat pattern."
      },
      {
        id: "customize",
        label: "Customize",
        shortText: "Design your robot",
        fullText: "Choose body shape, colors, eyes, mouth, and accessories."
      },
      {
        id: "play",
        label: "Play",
        shortText: "Watch it perform",
        fullText: "Press play to see your robot dance and sing to your music!"
      },
      {
        id: "save",
        label: "Save",
        shortText: "Save your creation",
        fullText: "Give your robot melody a name and save it."
      }
    ]
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
        text: "Take a moment to listen to your wildlife soundtrack. Think about your song form and sectional choices.",
        voiceText: "Listen to your composition and think about your song form and sectional choices."
      },
      partner: {
        title: "Listen to Your Partner's Composition",
        text: "Take a moment to listen to your partner's wildlife soundtrack. Think about their song form and sectional choices.",
        voiceText: "Listen to your partner's composition and think about their song form and sectional choices."
      }
    }
  },

  // Self-reflection prompts
  selfReflection: {
    star1: {
      title: "STAR 1: Song Form & Sections",
      question: "What did you do well with song form and sections?",
      voiceText: "Star 1: Think about what went well with song form and sections.",
      options: [
        "I used clear Intro, A, A', and Outro sections",
        "I built up texture effectively through sections",
        "I created good contrast between sections",
        "I followed the sectional loop form structure well",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: Musical Choices",
      question: "How well did your musical choices support the wildlife video?",
      voiceText: "Star 2: Think about how your musical choices supported the wildlife video.",
      options: [
        "My loops matched the mood of the wildlife footage",
        "I created tension and release that fit the video",
        "My section changes aligned with video moments",
        "The texture changes enhanced the visual story",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What to try next?",
      question: "What do you want to improve or try next time?",
      voiceText: "Now for the Wish: What do you want to try or improve next time?",
      options: [
        "I want to create more dramatic section changes",
        "I want to try adding a B section",
        "I want to better match music to video moments",
        "I want to experiment with different loop combinations",
        "Custom..."
      ]
    }
  },

  // Partner reflection prompts
  partnerReflection: {
    star1: {
      title: "STAR 1: What did [Partner Name] do well?",
      question: "What did [Partner Name] do well with song form and sections?",
      voiceText: "Star 1: What did they do well with song form and sections?",
      options: [
        "[Partner Name] used clear sections effectively",
        "[Partner Name] built up texture well through sections",
        "[Partner Name] created good contrast between sections",
        "[Partner Name] followed the sectional loop form well",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: What worked well?",
      question: "How well did [Partner Name]'s music support the wildlife video?",
      voiceText: "Star 2: How well did their music support the wildlife video?",
      options: [
        "The loops matched the mood of the footage",
        "The section changes were well-timed",
        "The texture changes enhanced the visual story",
        "The music built tension and release effectively",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What could they try?",
      question: "What could [Partner Name] try or improve next time?",
      voiceText: "Now for the Wish: What could they try or improve?",
      options: [
        "[Partner Name] could create more dramatic section changes",
        "[Partner Name] could try adding a B section",
        "[Partner Name] could better match music to video moments",
        "[Partner Name] could experiment with different loops",
        "Custom..."
      ]
    }
  }
};

// ========================================
// 4. SECTIONAL LOOP BUILDER CONTENT
// ========================================
export const sectionalLoopBuilderContent = {
  instructions: {
    title: "🎮 Section Safari",
    subtitle: "Build the Wildlife Score",
    overview: "Listen to mystery clips and place them in the correct order to build the song structure.",
    mainSteps: [
      {
        step: 1,
        icon: "🎧",
        title: "Listen to the clip",
        description: "Count how many layers you hear in each mystery clip"
      },
      {
        step: 2,
        icon: "🔢",
        title: "Identify the section",
        description: "INTRO=2 layers, A=3 layers, A'=4 layers, OUTRO=1 layer"
      },
      {
        step: 3,
        icon: "📍",
        title: "Place in the correct slot",
        description: "Click the slot where this clip belongs in the structure"
      },
      {
        step: 4,
        icon: "🎯",
        title: "Complete the round",
        description: "Fill all 5 slots to complete the round and earn bonus points"
      }
    ]
  },
  
  structure: [
    { id: "intro", label: "INTRO", layers: 2, color: "#8B5CF6", description: "Thin texture" },
    { id: "a1", label: "A", layers: 3, color: "#3B82F6", description: "Medium texture" },
    { id: "aPrime", label: "A'", layers: 4, color: "#F59E0B", description: "Thick texture" },
    { id: "a2", label: "A", layers: 3, color: "#3B82F6", description: "Medium texture" },
    { id: "outro", label: "OUTRO", layers: 1, color: "#8B5CF6", description: "Thin texture" }
  ],

  safari: {
    title: "🦁 Safari Bonus",
    description: "When selected, leave your Chromebook and find the classmate with the matching animal!",
    rules: [
      "Look at their screen to find their 4-digit code",
      "Return to your device and enter the code",
      "Earn +50 bonus points for success!",
      "You have 60 seconds to complete the safari"
    ]
  }
};

// ========================================
// 5. WILDLIFE COMPOSITION CONTENT
// ========================================
export const wildlifeCompositionContent = {
  instructions: {
    title: "🌍 Epic Wildlife Composition",
    subtitle: "Create a Nature Documentary Soundtrack",
    overview: "Use sectional loop form to create music that evolves with wildlife footage.",
    mainSteps: [
      {
        step: 1,
        icon: "🎬",
        title: "Choose your video",
        description: "Select a wildlife video to score"
      },
      {
        step: 2,
        icon: "📝",
        title: "Plan your sections",
        description: "Think about where Intro, A, A', and Outro will go"
      },
      {
        step: 3,
        icon: "🎵",
        title: "Build your soundtrack",
        description: "Drag loops to create each section with different textures"
      },
      {
        step: 4,
        icon: "💾",
        title: "Save your work",
        description: "Click Save to keep your composition"
      }
    ]
  },
  
  sectionGuide: {
    title: "Section Guide",
    sections: [
      {
        name: "INTRO",
        layers: "1-2 layers",
        purpose: "Set the mood, establish the setting",
        tip: "Keep it simple - hint at what's to come"
      },
      {
        name: "A Section",
        layers: "3 layers",
        purpose: "Main theme - the primary musical idea",
        tip: "Choose loops that work well together"
      },
      {
        name: "A' Section",
        layers: "4+ layers",
        purpose: "Climax - the most intense moment",
        tip: "Add more layers for thicker texture"
      },
      {
        name: "OUTRO",
        layers: "1 layer",
        purpose: "Wind down and conclude",
        tip: "Gradually remove layers to create closure"
      }
    ]
  }
};