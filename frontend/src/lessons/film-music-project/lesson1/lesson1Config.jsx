// File: /lessons/film-music-project/lesson1/lesson1Config.jsx
// Lesson 1: Score the Adventure - Mood & Expression
// Students learn how music affects emotion through drone footage scoring
//
// ========================================
// VIDEO CREDITS (CC BY License)
// ========================================
// Hook Video: "Intro to Film Scoring: Same Scene 5 Ways" by Midnight Music (midnightmusic.com.au)
//             Music: Kevin MacLeod (incompetech.com)
// Nature Drone Footage compilation:
//   - "Relaxing Ocean Waves & Nature Drone Shots in 4K" by Nara Prime
//   - "Copyright Free Video" by 4K Drone Footage HD
//   - "FPV Nature Landscapes" by Scenic World
//   - "Beautiful Drone Footage of Nature" by AG Stock Footage
// ========================================

export const LESSON_PROGRESS_KEY = 'lesson1-progress';
export const LESSON_TIMER_KEY = 'lesson1-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Slides → Hook Demo',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'Score the Adventure',
        description: 'Introduce the lesson and essential question.',
        duration: 1
      },
      {
        id: 'show-agenda',
        type: 'summary',
        label: 'Agenda',
        description: 'Review the three-part agenda.',
        duration: 1
      },
      {
        id: 'hook-intro',
        type: 'summary',
        label: 'Hook Introduction',
        description: 'Prepare students to watch the same video with different music.',
        duration: 1
      },
      {
        id: 'hook-video',
        type: 'demo',
        label: 'Hook: Same Video, Different Music',
        description: 'DEMO: Play same drone video with 2 different scores.',
        duration: 3
      },
      {
        id: 'mood-discussion',
        type: 'summary',
        label: 'Mood Discussion',
        description: 'Discuss: "How did the music change how you felt?"',
        duration: 2
      },
      {
        id: 'mood-categories',
        type: 'summary',
        label: 'Mood Categories',
        description: 'Introduce the five mood categories used in the software.',
        duration: 2
      }
    ]
  },
  {
    id: 'practice',
    title: '2. Practice',
    subtitle: 'Slides → Mood Match Game',
    color: 'blue',
    estimatedTime: 6,
    stages: [
      {
        id: 'mood-match-intro',
        type: 'summary',
        label: 'Mood Match Introduction',
        description: 'Explain how to play the Mood Match Game.',
        duration: 1
      },
      {
        id: 'mood-match-game',
        type: 'activity',
        label: '🎮 Unlock Mood Match Game',
        duration: 5,
        hasTimer: false,
        trackProgress: true,
        description: 'STUDENTS WORK: Listen to loops, match to mood categories.',
        bonusDescription: 'Bonus: Try to get a perfect score!'
      }
    ]
  },
  {
    id: 'create',
    title: '3. Create',
    subtitle: 'Tutorial → Compose',
    color: 'blue',
    estimatedTime: 17,
    stages: [
      {
        id: 'what-is-daw',
        type: 'summary',
        label: 'What is a DAW?',
        description: 'Introduce DAWs and their history.',
        duration: 1
      },
      {
        id: 'daws-today',
        type: 'summary',
        label: 'DAWs Today',
        description: 'Modern DAWs and professional use.',
        duration: 1
      },
      {
        id: 'composition-tutorial',
        type: 'video',
        label: 'DAW Tutorial Video',
        description: 'PLAY VIDEO: How to use the DAW.',
        duration: 2
      },
      {
        id: 'composition-reminder',
        type: 'summary',
        label: 'Composition Reminder',
        description: 'Remind students of the three requirements before they begin.',
        duration: 1
      },
      {
        id: 'adventure-composition',
        type: 'activity',
        label: '🎮 Unlock Score the Adventure',
        duration: 12,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Pick a mood, score drone footage with 5+ loops.',
        bonusDescription: 'Bonus: Build intensity—start quiet and get louder!'
      }
    ]
  },
  {
    id: 'reflect',
    title: '4. Reflect',
    subtitle: 'Two Stars and a Wish',
    color: 'blue',
    estimatedTime: 6,
    stages: [
      {
        id: 'reflection-instructions',
        type: 'summary',
        label: 'Reflection Time',
        description: 'Introduce the reflection activity.',
        duration: 1
      },
      {
        id: 'reflection',
        type: 'activity',
        label: '🎮 Unlock Reflection',
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Complete Two Stars and a Wish.',
        bonusDescription: 'Bonus: Share your reflection with a partner.'
      }
    ]
  },
  {
    id: 'conclusion',
    title: '5. Conclusion',
    subtitle: 'Discuss',
    color: 'blue',
    estimatedTime: 2,
    stages: [
      {
        id: 'conclusion',
        type: 'discussion',
        label: 'Class Discussion',
        description: 'Share moods and discuss how music changed the video.',
        duration: 2
      }
    ]
  }
];

export const lesson1Config = {
  id: 'lesson1',
  lessonPath: '/lessons/film-music-project/lesson1',
  title: "Score the Adventure",
  subtitle: "Mood & Expression",
  learningObjectives: [
    "Understand how music affects emotion and mood.",
    "Identify different mood categories in music.",
    "Create a composition that conveys a specific mood."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "mood-match-game",
      title: "Mood Match Game",
      estimatedTime: "5 min"
    },
    {
      id: 2,
      type: "video",
      title: "DAW Tutorial Video",
      estimatedTime: "2 min",
      src: "/lessons/film-music-project/lesson1/IntrotoDAW122025.mp4"
    },
    {
      id: 3,
      type: "adventure-composition",
      title: "Score the Adventure",
      estimatedTime: "12 min",
      videoSrc: "/lessons/film-music-project/lesson1/NatureDroneFootage.mp4"
    },
    {
      id: 4,
      type: "two-stars-wish",
      title: "Reflection Activity",
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
    id: 'welcome-intro',
    label: 'Score the Adventure',
    description: 'Introduce the lesson and essential question.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/1.svg'
    }
  },
  {
    id: 'show-agenda',
    label: 'Agenda',
    description: 'Review the three-part agenda.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/2.svg'
    }
  },
  {
    id: 'hook-intro',
    label: 'Hook Introduction',
    description: 'Prepare students to watch the same video with different music.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/3.svg'
    }
  },
  {
    id: 'hook-video',
    label: 'Hook: Same Video, Different Music',
    description: 'DEMO: Play same drone video with 2 different scores.',
    type: 'demo',
    duration: 3,
    presentationView: {
      type: 'video',
      videoPath: '/lessons/film-music-project/lesson1/videos/SameSceneFiveWays.mp4',
      title: 'Same Scene, Different Music',
      startTime: 4,
      slidePath: '/lessons/film-music-project/lesson1/slides/4.svg'
    }
  },
  {
    id: 'mood-discussion',
    label: 'Mood Discussion',
    description: 'Discuss: "How did the music change how you felt?"',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/5.svg'
    }
  },
  {
    id: 'mood-categories',
    label: 'Mood Categories',
    description: 'Introduce the five mood categories used in the software.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/6.svg'
    }
  },
  {
    id: 'mood-match-intro',
    label: 'Mood Match Introduction',
    description: 'Explain how to play the Mood Match Game.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/7.svg'
    }
  },
  {
    id: 'mood-match-game',
    label: '🎮 Unlock Mood Match Game',
    description: 'STUDENTS WORK: Listen to loops, match to mood categories.',
    bonusDescription: 'Bonus: Try to get a perfect score!',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 5,
    presentationView: {
      type: 'mood-match-teacher',
      slidePath: '/lessons/film-music-project/lesson1/slides/8.svg'
    }
  },
  {
    id: 'what-is-daw',
    label: 'What is a DAW?',
    description: 'Introduce DAWs and their history.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'image-slide',
      imagePath: '/landingpage/DigitalAudioWorkstation.png',
      slidePath: '/lessons/film-music-project/lesson1/slides/9.svg'
    }
  },
  {
    id: 'daws-today',
    label: 'DAWs Today',
    description: 'Modern DAWs and professional use.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'image-slide',
      imagePath: '/landingpage/LandingPageTopPicture.png',
      slidePath: '/lessons/film-music-project/lesson1/slides/10.svg'
    }
  },
  {
    id: 'composition-tutorial',
    label: 'DAW Tutorial Video',
    description: 'PLAY VIDEO: How to use the DAW.',
    type: 'video',
    duration: 2,
    presentationView: {
      type: 'video',
      videoPath: '/lessons/film-music-project/lesson1/IntrotoDAW122025.mp4',
      title: 'How to Use the DAW',
      slidePath: '/lessons/film-music-project/lesson1/slides/10.svg'
    }
  },
  {
    id: 'composition-reminder',
    label: 'Composition Reminder',
    description: 'Remind students of the three requirements before they begin.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/11.svg'
    }
  },
  {
    id: 'adventure-composition',
    label: '🎮 Unlock Score the Adventure',
    description: 'STUDENTS WORK: Pick a mood, score drone footage with 5+ loops.',
    bonusDescription: 'Bonus: Build intensity—start quiet and get louder!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 12,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/12.svg'
    }
  },
  {
    id: 'reflection-instructions',
    label: 'Reflection Time',
    description: 'Introduce the reflection activity.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/13.svg'
    }
  },
  {
    id: 'reflection',
    label: '🎮 Unlock Reflection',
    description: 'STUDENTS WORK: Complete Two Stars and a Wish.',
    bonusDescription: 'Bonus: Share your reflection with a partner.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/13.svg'
    }
  },
  {
    id: 'conclusion',
    label: 'Class Discussion',
    description: 'Share moods and discuss how music changed the video.',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson1/slides/15.svg'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'show-agenda': 'summary',
    'hook-intro': 'summary',
    'hook-video': 'demo',
    'mood-discussion': 'summary',
    'mood-categories': 'summary',
    'mood-match-intro': 'summary',
    'mood-match-game': 'mood-match-game',
    'what-is-daw': 'summary',
    'daws-today': 'summary',
    'composition-tutorial': 'video',
    'composition-reminder': 'summary',
    'adventure-composition': 'adventure-composition',
    'reflection-instructions': 'summary',
    'reflection': 'two-stars-wish',
    'conclusion': 'discussion'
  };
  return stageMap[stage];
};

// Mood categories for the lesson
export const MOOD_CATEGORIES = [
  {
    id: 'heroic',
    name: 'Heroic',
    description: 'Powerful, bold, triumphant',
    color: '#EF4444', // red
    characteristics: 'Brass, big drums, major key'
  },
  {
    id: 'hype',
    name: 'Hype',
    description: 'Exciting, energetic, pumped up',
    color: '#F59E0B', // amber
    characteristics: 'Fast tempo, driving beats, intense'
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    description: 'Intriguing, unknown, curious',
    color: '#3B82F6', // blue
    characteristics: 'Minor key, soft, atmospheric'
  },
  {
    id: 'scary',
    name: 'Scary',
    description: 'Frightening, tense, horror',
    color: '#7C3AED', // purple
    characteristics: 'Low synths, dissonance, sparse'
  },
  {
    id: 'upbeat',
    name: 'Upbeat',
    description: 'Happy, positive, cheerful',
    color: '#10B981', // green
    characteristics: 'Major key, bright, rhythmic'
  }
];
