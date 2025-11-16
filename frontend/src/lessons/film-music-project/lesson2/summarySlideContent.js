// File: /src/lessons/film-music-project/lesson2/summarySlideContent.js
// All instructional text and content for Lesson 2 - Sports Highlights

// ========================================
// 1. PRE-ACTIVITY SUMMARY SLIDES
// ========================================
export const summarySlides = {
  introVideo: {
    title: "Welcome to Sports Highlight Music!",
    icon: "🏀",
    estimatedTime: "3 minutes",
    points: [
      "Learn how to create high-energy music for sports highlights.",
      "Explore texture and layering to build excitement and intensity.",
      "Choose from basketball, skateboarding, or football highlights to score."
    ]
  },

  textureConcept: {
    title: "Texture & Layering",
    icon: "🎹",
    estimatedTime: "Discussion",
    points: [
      "Texture = How many layers of sound are playing together",
      "Layering = Adding loops on top of each other to create fullness",
      "More layers = More energy and excitement in sports music"
    ]
  },

  videoSelection: {
    title: "Choose Your Sports Video",
    icon: "🎬",
    estimatedTime: "1 minute",
    points: [
      "Pick basketball, skateboarding, or football highlights.",
      "Each video is about 60-90 seconds long.",
      "You'll compose high-energy music to match the action!"
    ]
  },

  sportsComposition: {
    title: "Compose Your Sports Music",
    icon: "🎵",
    estimatedTime: "10 minutes",
    points: [
      "Use 5 or more different loops for variety.",
      "Create 3 or more layers by playing loops together.",
      "Match the energy and intensity of the sports action!"
    ]
  },

  reflection: {
    title: "Two Stars and a Wish",
    icon: "⭐",
    estimatedTime: "5 minutes",
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
  sportsComposition: {
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
        id: "energy",
        label: "Energy",
        shortText: "Match sports action",
        fullText: "Your music should match the high-energy feel of the sports highlights."
      }
    ]
  },

  bonusActivity: {
    title: "Bonus: Add More Layers",
    description: "Great job! Use remaining time to add even more layers.",
    instructions: {
      title: "Ways to enhance your composition:",
      items: [
        "Add 4, 5, or even 6 layers of sound",
        "Try different volume levels for each loop",
        "Time your layers to match specific moments in the video"
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
        title: "Listen to Your Sports Music",
        mainText: "Listen to your entire sports composition from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "How many layers you used and when",
            "How the music matched the sports action",
            "The overall energy and excitement of your composition"
          ]
        },
        voiceText: "Now, listen to your entire sports composition. Pay attention to: How many layers you used. How the music matched the sports action. And the overall energy and excitement."
      },
      partner: {
        title: "Share & Listen",
        shareFirst: {
          title: "📤 First: Share your score",
          text: "Share your score with [Partner Name] so they can see and hear your work."
        },
        mainText: "Now, listen to [Partner Name]'s entire sports composition from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "How many layers they used and when",
            "How the music matched the sports action",
            "The overall energy and excitement of the composition"
          ]
        },
        voiceText: "Now share your work! First, share your score with [Partner Name]. Then, listen to their composition and pay attention to the layers, how it matches the action, and the energy level."
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
        "I used multiple layers to build energy",
        "I layered loops at exciting moments in the video",
        "I created thick texture with many loops playing together",
        "I varied the texture by adding and removing layers",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: Matching the Action",
      question: "How well did your music match the sports action?",
      voiceText: "Star 2: Think about how your music matched the sports action.",
      options: [
        "My music built energy during intense moments",
        "The layers matched the pace of the sports action",
        "My loop choices fit the sports mood perfectly",
        "The timing of my layers matched key moments",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What to try next?",
      question: "What do you want to improve or try next time?",
      voiceText: "Now for the Wish: What do you want to try or improve next time?",
      options: [
        "I want to add even more layers for fuller sound",
        "I want to try different combinations of loops",
        "I want to time my layers more precisely",
        "I want to experiment with different volumes",
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
        "[Partner Name] layered loops at exciting moments",
        "[Partner Name] created thick texture with many sounds",
        "[Partner Name] varied the texture throughout",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: What worked well?",
      question: "How well did [Partner Name]'s music match the sports action?",
      voiceText: "Star 2: How well did their music match the sports action?",
      options: [
        "The music built energy during intense moments",
        "The layers matched the pace of the action",
        "The loop choices fit the sports mood well",
        "The timing matched key moments perfectly",
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
        "[Partner Name] could time layers more precisely",
        "[Partner Name] could experiment with volumes",
        "Custom..."
      ]
    }
  }
};