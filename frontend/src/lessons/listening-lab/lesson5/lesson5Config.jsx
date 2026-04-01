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
        id: 'peer-play',
        type: 'activity',
        label: 'Peer Play',
        duration: 15,
        hasTimer: true,
        trackProgress: false,
        description: 'Students share codes and play each other\'s Listening Journey games.'
      }
    ]
  },
  {
    id: 'exit-ticket',
    title: '3. Exit Ticket',
    subtitle: 'What Did You Learn?',
    color: 'purple',
    estimatedTime: 7,
    stages: [
      {
        id: 'exit-ticket-intro',
        type: 'summary',
        label: 'Exit Ticket',
        description: 'Quick check — what did students learn this unit?',
        duration: 1
      },
      {
        id: 'exit-ticket',
        type: 'activity',
        label: 'Exit Ticket',
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students answer 2 quick questions and 2 reflections on their Chromebooks.'
      }
    ]
  }
];

export const lesson5Config = {
  id: 'listening-lab-lesson5',
  lessonPath: '/lessons/listening-lab/lesson5',
  title: "Finish & Play",
  subtitle: "Decoys, Peer Play & Exit Ticket",
  featuredPiece: null,
  learningObjectives: [
    "Add decoys to create a challenging game for classmates",
    "Play each other's Listening Journey games",
    "Reflect on what you learned about dynamics and tempo"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "listening-journey",
      title: "Add Decoys",
      estimatedTime: "7 min"
    },
    {
      id: 2,
      type: "listening-journey-peer-play",
      title: "Play Each Other's Games",
      estimatedTime: "15 min"
    },
    {
      id: 3,
      type: "exit-ticket",
      title: "Exit Ticket",
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
            'ADD DECOYS — Finish your journey and add traps (7 min)',
            'PEER PLAY — Play each other\'s games (15 min)',
            'EXIT TICKET — Quick reflection (5 min)'
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
    id: 'peer-play',
    label: 'Peer Play',
    description: 'Students share codes and play each other\'s Listening Journey games.',
    type: 'activity',
    hasTimer: true,
    duration: 15,
    showDirectionsOnStudent: true,
    presentationView: {
      type: 'peer-play-teacher',
      pieceConfig: buildPieceConfig(getPieceById('mountain-king')),
      journeyProps: { gameMode: true },
      directions: [
        {
          title: 'Peer Play Time!',
          items: [
            'Click "Play Game" — your 5-digit code is at the top',
            'Tell your partner your code',
            'Type their code in "Play a Friend\'s Journey" and play!',
            'Try to get 5 people to play YOUR game'
          ]
        },
        {
          title: 'How to Play',
          items: [
            'Use arrow keys or WASD to fly the bird',
            'Collect real stickers for +10 points',
            'Dodge decoys — they cost -5 points',
            'Check your Scores button to see who played your game!'
          ]
        }
      ]
    }
  },
  {
    id: 'exit-ticket-intro',
    label: 'Exit Ticket',
    description: 'Introduce the exit ticket — quick check on what students learned.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Exit Ticket',
      subtitle: 'What Did You Learn?',
      sections: [
        {
          heading: 'Quick Check',
          bullets: [
            'Answer 2 quick questions on your Chromebook',
            'Then write 2 short reflections about what you learned',
            'Be honest — this helps your teacher know what stuck!'
          ]
        }
      ]
    }
  },
  {
    id: 'exit-ticket',
    label: 'Exit Ticket',
    description: 'Students complete the exit ticket on their Chromebooks.',
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'exit-ticket-teacher',
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-back': 'summary',
    'decoy-time': 'listening-journey',
    'peer-play': 'listening-journey',
    'exit-ticket-intro': 'summary',
    'exit-ticket': 'exit-ticket'
  };
  return stageMap[stage];
};
