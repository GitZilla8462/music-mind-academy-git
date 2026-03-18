// File: /lessons/listening-lab/lesson5/lesson5Config.jsx
// Lesson 5: Finish, Add Decoys, Play & Share
// "Finish & Play"
// Students finish their Listening Journey, add decoys, play each other's games,
// then share favorites with the class
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students:
// - Quick check-in on progress (2 min)
// - Build time to finish their Listening Journey (15 min)
// - Learn about decoys and add them to their journey (7 min)
// - Play each other's games on their devices (8 min)
// - Gallery Circle: teacher picks journeys to showcase (9 min)
//
// ========================================

import { buildPieceConfig, getPieceById } from '../lesson4/lesson4Config';

export const LESSON_PROGRESS_KEY = 'listening-lab-lesson5-progress';
export const LESSON_TIMER_KEY = 'listening-lab-lesson5-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'worktime',
    title: '1. Finish Your Journey',
    subtitle: 'Build & Polish',
    color: 'blue',
    estimatedTime: 17,
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
        duration: 15,
        hasTimer: true,
        trackProgress: true,
        description: 'Students polish their Listening Journey. Final build session!',
        bonusDescription: 'Make sure your stickers, scenes, and character match the music!'
      }
    ]
  },
  {
    id: 'decoys',
    title: '2. Add Decoys',
    subtitle: 'Set Your Traps',
    color: 'red',
    estimatedTime: 7,
    stages: [
      {
        id: 'decoy-intro',
        type: 'summary',
        label: 'What Are Decoys?',
        description: 'Explain the decoy feature — fake stickers that trick players.',
        duration: 2
      },
      {
        id: 'decoy-time',
        type: 'activity',
        label: 'Add Decoys',
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students add decoy stickers using the Decoy button.',
        bonusDescription: 'Place decoys near real stickers to make your game harder!'
      }
    ]
  },
  {
    id: 'play',
    title: '3. Play Games',
    subtitle: 'Play Each Other\'s Journeys',
    color: 'green',
    estimatedTime: 9,
    stages: [
      {
        id: 'play-intro',
        type: 'summary',
        label: 'How to Play',
        description: 'Explain peer play — swap devices and play each other\'s games.',
        duration: 1
      },
      {
        id: 'peer-play',
        type: 'activity',
        label: 'Play Games',
        duration: 8,
        hasTimer: true,
        trackProgress: false,
        description: 'Students swap devices and play each other\'s Listening Journey games.'
      }
    ]
  },
  {
    id: 'gallery',
    title: '4. Gallery Circle',
    subtitle: 'Share & Celebrate',
    color: 'purple',
    estimatedTime: 9,
    stages: [
      {
        id: 'gallery-intro',
        type: 'summary',
        label: 'Gallery Circle',
        description: 'Explain the Gallery Circle format. Teacher picks journeys to showcase.',
        duration: 1
      },
      {
        id: 'gallery-sharing',
        type: 'activity',
        label: 'Gallery Circle',
        duration: 8,
        hasTimer: true,
        trackProgress: false,
        description: 'Teacher projects student journeys on the big screen. Class watches and celebrates.'
      }
    ]
  }
];

export const lesson5Config = {
  id: 'listening-lab-lesson5',
  lessonPath: '/lessons/listening-lab/lesson5',
  title: "Finish & Play",
  subtitle: "Decoys, Peer Play & Gallery Circle",
  featuredPiece: null,
  learningObjectives: [
    "Finish building a Listening Journey that demonstrates dynamics, tempo, and form",
    "Add decoys to create a challenging game for classmates",
    "Play each other's Listening Journey games",
    "Share your journey with the class and celebrate creative choices"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "listening-journey",
      title: "Finish Your Listening Journey",
      estimatedTime: "15 min"
    },
    {
      id: 2,
      type: "listening-journey",
      title: "Add Decoys",
      estimatedTime: "5 min"
    },
    {
      id: 3,
      type: "listening-journey-peer-play",
      title: "Play Each Other's Games",
      estimatedTime: "8 min"
    },
    {
      id: 4,
      type: "gallery-circle",
      title: "Gallery Circle",
      estimatedTime: "8 min"
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
      subtitle: 'Finish & Play Day',
      sections: [
        {
          heading: 'Today\'s Plan',
          bullets: [
            '🏗️ FINISH — Polish your Listening Journey (15 min)',
            '🎯 DECOYS — Add traps to make it a game (5 min)',
            '🎮 PLAY — Play each other\'s games (8 min)',
            '🎪 GALLERY — Share favorites with the class (8 min)'
          ]
        },
        {
          heading: 'Quick Check-In',
          bullets: [
            '👍 Almost done? Polish your scenes and add details',
            '✋ Need help? Raise your hand',
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
    bonusDescription: 'Make sure your stickers, scenes, and character match the music!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 15,
    presentationView: {
      type: 'journey-animator-directions',
      pieceConfig: buildPieceConfig(getPieceById('mountain-king')),
      journeyProps: { gameMode: true },
    }
  },
  {
    id: 'decoy-intro',
    label: 'What Are Decoys?',
    description: 'Explain the decoy feature to students.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Time to Set Traps!',
      subtitle: 'Adding Decoys to Your Game',
      sections: [
        {
          heading: 'What Are Decoys?',
          bullets: [
            '🎯 Decoys are FAKE stickers that look real but are traps',
            '🐦 When someone plays your game, their bird collects stickers',
            '✅ Real stickers = +10 points',
            '❌ Decoys = -5 points! Ouch!'
          ]
        },
        {
          heading: 'How to Add Decoys',
          bullets: [
            '1. Click the "Decoy" button in the toolbar — it turns red',
            '2. Now any sticker you place is automatically a decoy!',
            '3. You can also click existing stickers to toggle them',
            '4. Decoys show a red dot (only you can see it)',
            '5. Turn Decoy Mode off to place normal stickers again',
            '6. Tip: Place decoys near real stickers to trick players!'
          ]
        }
      ]
    }
  },
  {
    id: 'decoy-time',
    label: 'Add Decoys',
    description: 'Students add up to 5 decoy stickers to their journey.',
    bonusDescription: 'Place decoys near real stickers to make your game harder!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'journey-animator-directions',
      pieceConfig: buildPieceConfig(getPieceById('mountain-king')),
      journeyProps: { gameMode: true },
    }
  },
  {
    id: 'play-intro',
    label: 'How to Play',
    description: 'Explain peer play format.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Game Time!',
      subtitle: 'Play Each Other\'s Journeys',
      sections: [
        {
          heading: 'How It Works',
          bullets: [
            '🔄 Swap Chromebooks with a partner',
            '🎮 Press "Play Game" to start their journey',
            '🐦 Use arrow keys to fly the bird and collect stickers',
            '✅ Real stickers = +10 points | ❌ Decoys = -5 points',
            '🏆 Try to get the highest score!'
          ]
        },
        {
          heading: 'Rules',
          bullets: [
            'Play at least 2 different classmates\' games',
            'Be respectful — don\'t change anyone\'s work',
            'When the timer ends, return to your own Chromebook'
          ]
        }
      ]
    }
  },
  {
    id: 'peer-play',
    label: 'Play Games',
    description: 'Students swap devices and play each other\'s journey games.',
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'journey-animator-directions',
      pieceConfig: buildPieceConfig(getPieceById('mountain-king')),
      journeyProps: { gameMode: true },
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
            'Watch the character fly through each world',
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
    description: 'Teacher projects student journeys on the big screen.',
    type: 'activity',
    hasTimer: true,
    duration: 8,
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
    'decoy-intro': 'summary',
    'decoy-time': 'listening-journey',
    'play-intro': 'summary',
    'peer-play': 'listening-journey',
    'gallery-intro': 'summary',
    'gallery-sharing': 'gallery-circle'
  };
  return stageMap[stage];
};
