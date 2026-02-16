// File: /lessons/listening-lab/lesson5/lesson5Config.jsx
// Lesson 5: Worktime + Presentation
// "Finish & Share"
// Students finish building their Listening Journey and present to the class
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students:
// - Quick check-in on progress
// - ~23 minutes of build time to finish their Listening Journey
// - Gallery Circle: share journeys with the class
//
// ========================================

export const LESSON_PROGRESS_KEY = 'listening-lab-lesson5-progress';
export const LESSON_TIMER_KEY = 'listening-lab-lesson5-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'worktime',
    title: '1. Listening Journey Worktime',
    subtitle: 'Finish Your Journey',
    color: 'blue',
    estimatedTime: 25,
    stages: [
      {
        id: 'welcome-back',
        type: 'summary',
        label: 'Welcome Back',
        description: 'Quick check-in: Where did you leave off? What do you need to finish?',
        duration: 2
      },
      {
        id: 'build-time',
        type: 'activity',
        label: 'Finish Your Journey',
        duration: 23,
        hasTimer: true,
        trackProgress: true,
        description: 'Students polish their Listening Journey. Final build session!',
        bonusDescription: 'Make sure dynamics, tempo, and form all match the music!'
      }
    ]
  },
  {
    id: 'presentation',
    title: '2. Presentation',
    subtitle: 'Share & Celebrate',
    color: 'blue',
    estimatedTime: 12,
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
        label: 'Gallery Circle',
        duration: 11,
        hasTimer: true,
        trackProgress: false,
        description: 'Students share their Listening Journeys. Class watches and gives feedback.'
      }
    ]
  }
];

export const lesson5Config = {
  id: 'listening-lab-lesson5',
  lessonPath: '/lessons/listening-lab/lesson5',
  title: "Worktime + Presentation",
  subtitle: "Finish & Share",
  featuredPiece: null,
  learningObjectives: [
    "Finish building a Listening Journey that demonstrates dynamics, tempo, and form",
    "Share your journey with classmates and explain your musical choices"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "listening-journey",
      title: "Finish Your Listening Journey",
      estimatedTime: "23 min"
    },
    {
      id: 2,
      type: "gallery-circle",
      title: "Gallery Circle",
      estimatedTime: "11 min"
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
    description: 'Quick check-in on progress.',
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
            '🏗️ WORKTIME — Finish your Listening Journey',
            '🎪 PRESENTATION — Share your journey with the class'
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
    label: 'Finish Your Journey',
    description: 'Final build session — polish your Listening Journey.',
    bonusDescription: 'Make sure dynamics, tempo, and form all match the music!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 23,
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
            'We\'ll project 4-5 journeys on the big screen',
            'Watch the character walk through each world',
            'Listen — can you hear the dynamics, tempo, and form?',
            'After each, we\'ll share one thing we noticed'
          ]
        },
        {
          heading: 'Be a Great Audience',
          bullets: [
            'Listen carefully to the music AND watch the visuals',
            'Think: What musical element stands out most?',
            'Celebrate creative choices — every journey is unique!'
          ]
        }
      ]
    }
  },
  {
    id: 'gallery-sharing',
    label: 'Gallery Circle',
    description: 'Students share their Listening Journeys with the class.',
    type: 'activity',
    hasTimer: true,
    duration: 11,
    presentationView: {
      type: 'gallery-circle-teacher',
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-back': 'summary',
    'build-time': 'listening-journey',
    'gallery-intro': 'summary',
    'gallery-sharing': 'gallery-circle'
  };
  return stageMap[stage];
};
