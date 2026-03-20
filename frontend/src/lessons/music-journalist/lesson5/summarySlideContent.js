// File: /src/lessons/music-journalist/lesson5/summarySlideContent.js
// All instructional text and content for Music Journalist Lesson 5 - Press Day
// "Present Your Story to the World"

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Slide 1 - Today You Publish
  publishDay: {
    title: "Press Day",
    subtitle: "Today You Publish Your Story",
    icon: "📰",
    journey: [
      {
        lesson: 1,
        title: "Read Like a Journalist",
        summary: "You learned to read critically and find the story behind the story"
      },
      {
        lesson: 2,
        title: "Find Your Beat",
        summary: "You chose your topic and started researching"
      },
      {
        lesson: 3,
        title: "Deep Dive",
        summary: "You gathered strong evidence and organized your research"
      },
      {
        lesson: 4,
        title: "Build Your Story",
        summary: "You turned your research into a 4-slide presentation"
      },
      {
        lesson: 5,
        title: "Press Day",
        summary: "TODAY - you present your story to the world!"
      }
    ],
    todaysAgenda: [
      "PRESENT your story to the class",
      "Give and receive PEER FEEDBACK",
      "Celebrate becoming a MUSIC JOURNALIST!"
    ],
    teacherNote: "Build excitement and reduce anxiety. Remind students that everyone is presenting and the class will be supportive. This is a celebration, not a test."
  },

  // Slide 2 - Presentation Format
  presentationFormat: {
    title: "Presentation Format",
    subtitle: "How This Will Work",
    icon: "🎤",
    forPresenter: [
      "You have about 2 MINUTES to present your 4 slides",
      "Don't just READ your slides - TELL your story",
      "Make eye contact with the audience",
      "Be ready for ONE question from the audience"
    ],
    forAudience: [
      "Listen actively and respectfully",
      "Think of ONE thing you liked and ONE question to ask",
      "You'll give written feedback after presentations",
      "Support your classmates - this takes courage!"
    ],
    presentationOrder: {
      method: "Random or volunteer-based",
      timePerStudent: "~2 minutes presenting + ~1 minute for questions",
      teacherNote: "Consider having 2-3 volunteers go first to set the tone. Use a random name picker if needed."
    },
    tips: [
      "Take a deep breath before you start",
      "Speak slowly - slower than you think you need to",
      "It's okay to glance at your slides for reference",
      "Smile - you worked hard on this!"
    ],
    teacherNote: "Review expectations clearly. Model what good audience behavior looks like. Consider having a brief practice round where one student presents their first slide."
  },

  // Slide 3 - Portfolio View
  portfolioView: {
    title: "Your Journalist Portfolio",
    subtitle: "Look at Everything You Created",
    icon: "📁",
    unitWork: [
      "Read and analyzed MULTIPLE music articles",
      "Built a RESEARCH BOARD with strong evidence",
      "Wrote attention-grabbing HEADLINES",
      "Created a 4-SLIDE PRESENTATION",
      "PRESENTED your story to an audience"
    ],
    skillsDeveloped: [
      {
        skill: "Critical Reading",
        description: "You can read an article and identify the key evidence"
      },
      {
        skill: "Research",
        description: "You can find, evaluate, and organize information from multiple sources"
      },
      {
        skill: "Writing",
        description: "You can write clear, compelling text for an audience"
      },
      {
        skill: "Visual Storytelling",
        description: "You can pair images with text to tell a stronger story"
      },
      {
        skill: "Public Speaking",
        description: "You can present your work confidently to a group"
      }
    ],
    teacherNote: "This is a moment for students to feel proud. Read through the skills slowly and let students appreciate how much they've grown."
  },

  // Slide 4 - Unit Celebration
  unitCelebration: {
    title: "You Are a Music Journalist!",
    subtitle: "Congratulations on Completing the Unit",
    icon: "🏆",
    whatMakesAJournalist: [
      "A journalist READS carefully and asks questions",
      "A journalist RESEARCHES deeply and finds strong evidence",
      "A journalist TELLS stories that help people understand the world",
      "A journalist uses FACTS to inform, not just opinions"
    ],
    youDidAllOfThat: [
      "You chose a topic YOU cared about",
      "You dug deep to find the real story",
      "You organized your thinking and built something to share",
      "You stood up and presented with courage"
    ],
    keepGoing: [
      "Music journalism is everywhere - blogs, magazines, YouTube, podcasts",
      "The skills you learned work for ANY topic, not just music",
      "Next time you read a news story, notice the Hook, Background, Evidence, and So What!",
      "Consider starting a music blog or podcast of your own!"
    ],
    finalMessage: "The world needs more thoughtful, evidence-based storytellers. You just proved you can be one.",
    teacherNote: "End on a high note. Consider having students share one thing they're proud of from the unit. If time allows, ask who might want to pursue journalism or writing in the future."
  }
};

// ========================================
// 2. PEER FEEDBACK STRUCTURE
// ========================================
export const peerFeedbackTemplate = {
  title: "Peer Feedback",
  subtitle: "Help Your Classmates Grow",
  instructions: [
    "Think about the presentation you just watched",
    "Write ONE specific thing you liked",
    "Write ONE specific suggestion for improvement",
    "Be KIND, SPECIFIC, and HELPFUL"
  ],
  starterSentences: {
    liked: [
      "I liked how you...",
      "Your strongest slide was ___ because...",
      "The evidence you used about ___ was really compelling because...",
      "Your headline grabbed my attention because...",
      "I learned something new: ..."
    ],
    suggestion: [
      "One thing that could make it even better: ...",
      "I wanted to hear more about...",
      "Your ___ slide could be stronger if you added...",
      "Consider using a more specific example for...",
      "The audience might connect more if you..."
    ]
  },
  rubric: [
    {
      category: "Hook",
      question: "Did the headline and opening make you want to hear more?"
    },
    {
      category: "Evidence",
      question: "Did they use specific quotes, numbers, or facts?"
    },
    {
      category: "Storytelling",
      question: "Did the presentation flow like a story (not just a list of facts)?"
    },
    {
      category: "Delivery",
      question: "Did the presenter speak clearly and engage the audience?"
    }
  ]
};

// ========================================
// 3. PRESENTATION TIPS
// ========================================
export const presentationTips = {
  beforeYouPresent: [
    "Take three deep breaths",
    "Review your slides one last time",
    "Remember: you know this topic better than anyone in the room",
    "The audience WANTS you to succeed"
  ],
  duringYourPresentation: [
    "Start with your headline - say it with confidence",
    "Look up from your slides and make eye contact",
    "Speak slowly and clearly - pause between slides",
    "If you lose your place, just take a breath and continue"
  ],
  handlingQuestions: [
    "Listen to the full question before answering",
    "It's okay to say 'That's a great question, I'm not sure but I think...'",
    "Connect your answer back to your evidence",
    "Thank the person for their question"
  ]
};

// ========================================
// 4. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Peer Feedback', definition: 'Constructive comments from classmates to help improve work' },
  { term: 'Constructive', definition: 'Helpful and focused on improvement, not criticism' },
  { term: 'Portfolio', definition: 'A collection of your best work that shows your skills' },
  { term: 'Delivery', definition: 'How you present - voice, eye contact, confidence, pacing' },
  { term: 'Audience Engagement', definition: 'Keeping listeners interested and connected to your story' },
  { term: 'Publish', definition: 'To share your work with an audience' }
];
