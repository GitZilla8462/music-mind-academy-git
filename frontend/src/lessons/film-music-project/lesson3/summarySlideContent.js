// File: /src/lessons/film-music-project/lesson3/summarySlideContent.js
// All instructional text and content for Lesson 3 - City Soundscapes

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
      "Play the Layer Detective game to identify layers.",
      "Compose your own city soundscape using multiple layers."
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
      "Each loop you add is a new layer of sound.",
      "More layers = Thicker texture and fuller sound.",
      "Composers control texture by adding or removing layers.",
      "City soundscapes have thick texture with many overlapping sounds."
    ]
  },

  layerDetective: {
    title: "Layer Detective Game",
    icon: "🔍",
    estimatedTime: "3 minutes",
    points: [
      "Listen to short musical examples.",
      "Count how many layers you hear in each one.",
      "Test your ear training skills!",
      "Try to get the highest score possible."
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
    title: "Two Stars and a Wish",
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
        title: "Listen to Your City Soundscape",
        mainText: "Listen to your entire city soundscape from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "How many layers you used and when",
            "The overall texture (thin vs. thick)",
            "How the layers work together to create a city atmosphere"
          ]
        },
        voiceText: "Now, listen to your entire city soundscape. Pay attention to: How many layers you used. The overall texture. And how the layers work together."
      },
      partner: {
        title: "Share & Listen",
        shareFirst: {
          title: "🔊 First: Share your soundscape",
          text: "Share your composition with [Partner Name] so they can see and hear your work."
        },
        mainText: "Now, listen to [Partner Name]'s entire city soundscape from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "How many layers they used and when",
            "The overall texture (thin vs. thick)",
            "How the layers work together to create a city atmosphere"
          ]
        },
        voiceText: "Now share your work! First, share your soundscape with [Partner Name]. Then, listen to their composition and pay attention to the layers, texture, and overall atmosphere."
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