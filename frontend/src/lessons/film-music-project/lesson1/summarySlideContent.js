// File: /src/lessons/film-music-project/lesson1/summarySlideContent.js
// CENTRALIZED CONTENT for all Lesson 1 instructional text
// All slides, panels, modals, and activity instructions in ONE place

// ========================================
// 1. PRE-ACTIVITY SUMMARY SLIDES
// ========================================
export const summarySlides = {
  introVideo: {
    title: "Welcome to Film Music Composition!",
    icon: "🎬",
    estimatedTime: "3 minutes",
    points: [
      "Learn how film composers create music for movies.",
      "Complete interactive challenges to learn the DAW interface.",
      "View the three-minute introduction video to begin your journey."
    ]
  },

  dawTutorial: {
    title: "DAW Basics Challenge",
    icon: "🎹",
    estimatedTime: "5 minutes",
    points: [
      "Answer all questions about the DAW.",
      "Click every button, control, and panel to learn how to use the DAW.",
      "If you finish early, then explore and experiment!"
    ]
  },

  activityIntro: {
    title: "Time to Compose!",
    icon: "🎼",
    estimatedTime: "2 minutes",
    points: [
      "Use your skills to place loops, adjust timing, and layer sounds together.",
      "Discover \"The School Beneath,\" your mysterious underwater trailer project.",
      "View the two-minute video explaining your composition challenge."
    ]
  },

  schoolBeneath: {
    title: "Create Your Film Score",
    icon: "🎵",
    estimatedTime: "10 minutes",
    points: [
      "Use five or more different loops in your composition.",
      "Create three or more layers by playing loops together.",
      "Place five or more total loops to complete your musical score."
    ]
  },

  reflection: {
    title: "Two Stars and a Wish",
    icon: "⭐",
    estimatedTime: "5 minutes",
    points: [
      "Name two things you did well in your composition today.",
      "Describe one thing you would improve or change next time.",
      "Fill out the reflection form while listening to your musical score."
    ]
  }
};

// ========================================
// 2. ASSIGNMENT PANEL CONTENT (During Activities)
// ========================================
export const assignmentPanels = {
  schoolBeneath: {
    title: "Composition Assignment",
    requirements: [
      {
        id: "instrumentation",
        label: "Instrumentation",
        shortText: "5+ Mysterious loops",
        fullText: "Use five or more different loops in your composition."
      },
      {
        id: "layering",
        label: "Layering",
        shortText: "3+ different times",
        fullText: "Create three or more layers by playing loops together."
      },
      {
        id: "structure",
        label: "Structure",
        shortText: "5+ loops total",
        fullText: "Place five or more total loops to complete your musical score."
      }
    ]
  },

  soundEffects: {
    title: "Bonus: Add Sound Effects",
    description: "Great job! Use the remaining time to explore.",
    instructions: {
      title: "Sound effects you can add:",
      items: [
        "Electric shocks & impacts",
        "Risers to build tension",
        "Wooshes for movement"
      ]
    },
    howToAdd: {
      title: "How to add sound effects:",
      steps: [
        "Look for Show Sound Effects checkbox",
        "Check it to see available sound effects",
        "Drag onto timeline like music loops",
        "Place at perfect moments in your video!"
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
        title: "Listen to Your Composition",
        mainText: "Listen to your entire film score from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "How the music tools (timeline, tracks, volume) were used",
            "How the loops are timed with the video",
            "The overall sound and mood of the music"
          ]
        },
        voiceText: "Now, listen to your entire film score from beginning to end. Pay attention to: How the music tools, such as timeline, tracks, and volume, were used. How the loops are timed with the video. And the overall sound and mood of the music."
      },
      partner: {
        title: "Share & Listen",
        shareFirst: {
          title: "🔄 First: Share your score",
          text: "Share your score with [Partner Name] so they can see and hear your work."
        },
        mainText: "Now, listen to [Partner Name]'s entire film score from beginning to end.",
        payAttentionTo: {
          title: "Pay attention to:",
          items: [
            "How the music tools (timeline, tracks, volume) were used",
            "How the loops are timed with the video",
            "The overall sound and mood of the music"
          ]
        },
        voiceText: "Now it's time to share! First, share your score with [Partner Name] so they can see and hear your work. Then, listen to [Partner Name]'s entire film score from beginning to end. Pay attention to: How the music tools were used. How the loops are timed with the video. And the overall sound and mood of the music."
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
      title: "STAR 1: Using the DAW",
      question: "What did you do well with using the DAW tools?",
      voiceText: "Star 1: Think about what went well with using the DAW tools. What did you do well?",
      options: [
        "I placed loops at the right times on the timeline",
        "I used multiple tracks to organize my music",
        "I adjusted the volume to balance different loops",
        "I previewed loops before adding them to my project",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: Loop Timing & Sound",
      question: "What worked well with your loop timing and music sound?",
      voiceText: "Star 2: Think about what worked well with the loop timing and music sound.",
      options: [
        "My loops matched the mood of the video perfectly",
        "I timed my loops to important moments in the video",
        "My layers created an interesting sound together",
        "The loops I chose worked well together",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What to try next?",
      question: "What do you want to try or improve next time?",
      voiceText: "Now for the Wish: What do you want to try or improve next time?",
      options: [
        "I want to experiment with more tracks and layers",
        "I want to try different loop combinations",
        "I want to time my loops more precisely with the video",
        "I want to adjust volumes to make certain loops stand out",
        "Custom..."
      ]
    }
  },

  // Partner reflection prompts
  partnerReflection: {
    star1: {
      title: "STAR 1: What did [Partner Name] do well?",
      question: "What did [Partner Name] do well with the DAW tools?",
      voiceText: "Star 1: Think about what went well with using the DAW tools. What did you do well?",
      options: [
        "[Partner Name] placed loops at good times on the timeline",
        "[Partner Name] used multiple tracks effectively",
        "[Partner Name] balanced the volume well between loops",
        "[Partner Name] chose loops that fit the video well",
        "Custom..."
      ]
    },
    star2: {
      title: "STAR 2: What worked well?",
      question: "What worked well with [Partner Name]'s loop timing and music?",
      voiceText: "Star 2: Think about what worked well with the loop timing and music sound.",
      options: [
        "The loops matched the mood of the video",
        "The timing matched important video moments",
        "The layers created an interesting sound",
        "The loop choices worked well together",
        "Custom..."
      ]
    },
    wish: {
      title: "WISH: What could they try?",
      question: "What could [Partner Name] try or improve next time?",
      voiceText: "Now for the Wish: What do you want to try or improve next time?",
      options: [
        "[Partner Name] could try using more tracks",
        "[Partner Name] could experiment with different loops",
        "[Partner Name] could adjust timing more precisely",
        "[Partner Name] could try different volume levels",
        "Custom..."
      ]
    }
  }
};