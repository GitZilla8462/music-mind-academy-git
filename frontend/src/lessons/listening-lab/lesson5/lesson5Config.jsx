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
    id: 'decoys',
    title: '1. Add Decoys',
    subtitle: 'Set Your Traps',
    color: 'red',
    estimatedTime: 9,
    stages: [
      {
        id: 'welcome-back',
        type: 'summary',
        label: 'Welcome Back',
        description: 'Quick check-in: Where did you leave off? What do you need to finish?',
        duration: 2
      },
      {
        id: 'decoy-time',
        type: 'activity',
        label: 'Add Decoys',
        duration: 7,
        hasTimer: true,
        trackProgress: true,
        description: 'Students finish their journey AND add decoy stickers.',
        bonusDescription: 'Place decoys near real stickers to make your game harder!'
      }
    ]
  },
  {
    id: 'play',
    title: '2. Peer Play',
    subtitle: 'Play Each Other\'s Journeys',
    color: 'green',
    estimatedTime: 10,
    stages: [
      {
        id: 'play-intro',
        type: 'summary',
        label: 'How Peer Play Works',
        description: 'Explain the automatic matchmaking system and turn-based play.',
        duration: 2
      },
      {
        id: 'peer-play',
        type: 'activity',
        label: 'Peer Play',
        duration: 8,
        hasTimer: true,
        trackProgress: false,
        description: 'Auto-matched pairs play each other\'s journeys. Students meet up, take turns, and watch each other play.'
      }
    ]
  },
  {
    id: 'gallery',
    title: '3. Gallery Circle',
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
            'FINISH — Polish your Listening Journey (15 min)',
            'DECOYS — Add traps to make it a game (5 min)',
            'PLAY — Play each other\'s games (8 min)',
            'GALLERY — Share favorites with the class (8 min)'
          ]
        },
        {
          heading: 'Quick Check-In',
          bullets: [
            'Almost done? Polish your scenes and add details',
            'Need help? Raise your hand',
            'Goal: Every journey should show dynamics, tempo, AND form'
          ]
        }
      ]
    }
  },
  {
    id: 'decoy-time',
    label: 'Add Decoys',
    description: 'Students finish their journey and add decoy stickers.',
    bonusDescription: 'Place decoys near real stickers to make your game harder!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 7,
    showDirectionsOnStudent: true,
    presentationView: {
      type: 'journey-animator-directions',
      pieceConfig: buildPieceConfig(getPieceById('mountain-king')),
      journeyProps: { gameMode: true },
      directions: [
        {
          title: 'What Are Decoys?',
          items: [
            'Decoys are fake stickers that trick the player',
            'When a bird flies into a decoy, the player LOSES 5 points',
            'Real stickers are worth +10 points, decoys cost -5 points',
            'Your job: make it hard to tell real stickers from fakes!'
          ]
        },
        {
          title: 'How to Place Decoys',
          items: [
            'Click the red "Place Decoy" button in the toolbar',
            'The button turns bright red when decoy mode is ON',
            'Click anywhere on the scene to place a decoy sticker',
            'Click any existing sticker to toggle it between real and decoy'
          ]
        },
        {
          title: 'Strategy Tips',
          items: [
            'Place decoys RIGHT NEXT TO real stickers to make them tricky',
            'Use similar-looking stickers for your decoys',
            'Spread decoys across different sections of your journey',
            'Test your game by clicking "Play Game" to see how hard it is!'
          ]
        }
      ]
    }
  },
  {
    id: 'play-intro',
    label: 'How Peer Play Works',
    description: 'Explain the automatic matchmaking and turn-based play.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Peer Play',
      subtitle: 'Play Each Other\'s Journeys',
      sections: [
        {
          heading: 'How It Works',
          bullets: [
            '1. You\'ll be automatically matched with a partner',
            '2. Your Chromebook loads THEIR journey — their Chromebook loads YOURS',
            '3. Meet up — one person watches while the other plays',
            '4. Then switch — now YOU watch them play YOUR journey',
            '5. When both turns are done, you get a new partner automatically'
          ]
        },
        {
          heading: 'Controls',
          bullets: [
            'Use arrow keys to fly the bird and collect stickers',
            'Real stickers = +10 points',
            'Decoys = -5 points',
            'Try to get the highest score on your partner\'s game'
          ]
        }
      ]
    }
  },
  {
    id: 'peer-play',
    label: 'Peer Play',
    description: 'Auto-matched pairs play each other\'s journey games with turn-based play.',
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'peer-play-teacher',
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
    'decoy-time': 'listening-journey',
    'play-intro': 'summary',
    'peer-play': 'peer-play',
    'gallery-intro': 'summary',
    'gallery-sharing': 'gallery-circle'
  };
  return stageMap[stage];
};
