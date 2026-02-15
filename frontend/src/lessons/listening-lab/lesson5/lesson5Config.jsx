// File: /lessons/listening-lab/lesson5/lesson5Config.jsx
// Lesson 5: Work Time + Gallery Circle
// "Finish & Share"
// Students finish building their Listening Journey and share with classmates
//
// ========================================
// CURRICULUM NOTES
// ========================================
// This is the second of two capstone lessons. Students:
// - Quick check-in on progress
// - 18-20 minutes of build time to polish their Listening Journey
// - Gallery Circle: structured sharing with the class
// - Unit reflection / exit ticket
//
// ========================================

export const LESSON_PROGRESS_KEY = 'listening-lab-lesson5-progress';
export const LESSON_TIMER_KEY = 'listening-lab-lesson5-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'check-in',
    title: '1. Quick Check-In',
    subtitle: 'Where Are You?',
    color: 'blue',
    estimatedTime: 2,
    stages: [
      {
        id: 'welcome-back',
        type: 'summary',
        label: 'Welcome Back',
        description: 'Quick check-in: Where did you leave off? What do you need to finish?',
        duration: 2
      }
    ]
  },
  {
    id: 'work-time',
    title: '2. Work Time',
    subtitle: 'Finish Your Journey',
    color: 'blue',
    estimatedTime: 20,
    stages: [
      {
        id: 'build-time',
        type: 'activity',
        label: '🎮 Finish Your Journey',
        duration: 20,
        hasTimer: true,
        trackProgress: true,
        description: 'Students polish their Listening Journey. Final build session!',
        bonusDescription: 'Make sure dynamics, tempo, and form all match the music!'
      }
    ]
  },
  {
    id: 'gallery',
    title: '3. Gallery Circle',
    subtitle: 'Share & Celebrate',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'gallery-intro',
        type: 'summary',
        label: 'Gallery Circle',
        description: 'Explain the Gallery Circle format. Students will share their journeys.',
        duration: 1
      },
      {
        id: 'gallery-sharing',
        type: 'activity',
        label: '🎪 Gallery Circle',
        duration: 9,
        hasTimer: true,
        trackProgress: false,
        description: 'Students share their Listening Journeys. Class watches and gives feedback.'
      }
    ]
  },
  {
    id: 'reflection',
    title: '4. Unit Reflection',
    subtitle: 'What Did You Learn?',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'exit-ticket',
        type: 'activity',
        label: '📝 Exit Ticket',
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students reflect on what they learned across all 5 lessons.'
      }
    ]
  }
];

export const lesson5Config = {
  id: 'listening-lab-lesson5',
  lessonPath: '/lessons/listening-lab/lesson5',
  title: "Work Time + Gallery Circle",
  subtitle: "Finish & Share",
  featuredPiece: null,
  learningObjectives: [
    "Finish building a Listening Journey that demonstrates dynamics, tempo, and form",
    "Share your journey with classmates and explain your musical choices",
    "Reflect on what you learned about listening to music across the entire unit"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "listening-journey",
      title: "Finish Your Listening Journey",
      estimatedTime: "20 min"
    },
    {
      id: 2,
      type: "gallery-circle",
      title: "Gallery Circle",
      estimatedTime: "9 min"
    },
    {
      id: 3,
      type: "listening-lab-lesson5-reflection",
      title: "Unit Reflection / Exit Ticket",
      estimatedTime: "5 min"
    }
  ]
};

// ========================================
// LESSON STAGES - With presentationView data for each stage
// ========================================
export const lessonStages = [
  {
    id: 'join-code',
    label: 'Join Code Screen',
    description: 'Students enter session code to join.',
    type: 'waiting'
  },
  {
    id: 'welcome-back',
    label: 'Welcome Back',
    description: 'Quick check-in on progress from yesterday.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Welcome Back!',
      subtitle: 'Finish & Share Day',
      sections: [
        {
          heading: 'Today\'s Plan',
          bullets: [
            '🏗️ WORK TIME — 20 minutes to finish your Listening Journey',
            '🎪 GALLERY CIRCLE — Share your journey with the class',
            '📝 EXIT TICKET — Reflect on what you learned this unit'
          ]
        },
        {
          heading: 'Quick Check-In',
          bullets: [
            '👍 If you\'re almost done — polish and add details',
            '✋ If you need help — raise your hand, I\'ll come to you',
            '🎯 Goal: Every journey should show dynamics, tempo, AND form'
          ]
        }
      ]
    }
  },
  {
    id: 'build-time',
    label: '🎮 Finish Your Journey',
    description: 'Final build session — polish your Listening Journey.',
    bonusDescription: 'Make sure dynamics, tempo, and form all match the music!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 20,
    presentationView: {
      type: 'activity-banner',
      title: 'Work Time!',
      subtitle: 'Finish your Listening Journey — show what you hear!'
    }
  },
  {
    id: 'gallery-intro',
    label: 'Gallery Circle',
    description: 'Explain the Gallery Circle sharing format.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Gallery Circle',
      subtitle: 'Time to Share!',
      sections: [
        {
          heading: 'How It Works',
          bullets: [
            '🎬 We\'ll project 4-5 journeys on the big screen',
            '👀 Watch the character walk through each world',
            '🎵 Listen — can you hear the dynamics, tempo, and form?',
            '⭐ After each, we\'ll share one thing we noticed'
          ]
        },
        {
          heading: 'Be a Great Audience',
          bullets: [
            '👂 Listen carefully to the music AND watch the visuals',
            '💡 Think: What musical element stands out most?',
            '👏 Celebrate creative choices — every journey is unique!'
          ]
        }
      ]
    }
  },
  {
    id: 'gallery-sharing',
    label: '🎪 Gallery Circle',
    description: 'Students share their Listening Journeys with the class.',
    type: 'activity',
    hasTimer: true,
    duration: 9,
    presentationView: {
      type: 'gallery-circle-teacher',
    }
  },
  {
    id: 'exit-ticket',
    label: '📝 Exit Ticket',
    description: 'Students reflect on what they learned this unit.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'activity-banner',
      title: 'Exit Ticket',
      subtitle: 'What did you learn about listening to music?'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-back': 'summary',
    'build-time': 'listening-journey',
    'gallery-intro': 'summary',
    'gallery-sharing': 'gallery-circle',
    'exit-ticket': 'listening-lab-lesson5-reflection'
  };
  return stageMap[stage];
};
