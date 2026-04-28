// File: /lessons/film-music/lesson2/Lesson2config.jsx
// Film Music Lesson 2: WHAT Do They Feel? — Music Changes With the Scene (~40 minutes)
// Students compose motifs for characters (class game), then score two scenes
// with different instruments on a drawing timeline.
//
// ========================================
// LESSON OVERVIEW
// ========================================
// Essential Understanding: Music changes in time — when the scene changes, the music changes
// Film Skill: Orchestration / Timbre / Scene contrast
// Music Skill: Choosing instruments to match character emotion, scoring against picture
// Standards: MU:Cr1.1.5a, MU:Cr2.1.5a, MU:Re7.2.5a, MU:Cn11.0.8a

export const LESSON_PROGRESS_KEY = 'fm-lesson2-progress';
export const LESSON_TIMER_KEY = 'fm-lesson2-timer';

// ========================================
// INSTRUMENT DEMO DATA (for slides 3–6)
// ========================================
export const INSTRUMENT_DEMOS = [
  {
    id: 'flute',
    name: 'The Flute',
    emoji: '🎶',
    color: '#06B6D4',
    family: 'Woodwind',
    feelsLike: [
      { bold: 'High and light', detail: 'feels like flying or floating' },
      { bold: 'Smooth and pure', detail: 'gentle, peaceful, magical' },
      { bold: 'Quick and playful', detail: 'can dance and dart around' },
    ],
    greatFor: 'Fairies, birds, kids, magical creatures, anything small or light',
    instrumentId: 'flute',
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/romantic-woodwinds-flute-major-high.wav',
  },
  {
    id: 'bassoon',
    name: 'The Bassoon',
    emoji: '🎵',
    color: '#7C2D12',
    family: 'Woodwind',
    feelsLike: [
      { bold: 'Low and round', detail: 'warm, deep, woody' },
      { bold: 'A little funny', detail: 'can sound silly or grumpy' },
      { bold: 'Slow and clumsy', detail: 'like someone walking heavy' },
    ],
    greatFor: 'Bears, goofy villains, big creatures, foxes, sneaky-but-not-scary characters',
    instrumentId: 'bassoon',
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/hero-woodwind-bassoon-major-medium.wav',
  },
  {
    id: 'trumpet',
    name: 'The Trumpet',
    emoji: '🎺',
    color: '#EF4444',
    family: 'Brass',
    feelsLike: [
      { bold: 'Bright and bold', detail: 'wants to be noticed' },
      { bold: 'Strong and confident', detail: 'feels like a hero arriving' },
      { bold: 'Sharp and clear', detail: 'cuts through everything' },
    ],
    greatFor: 'Heroes, kings, knights, big announcements, victory',
    instrumentId: 'trumpet',
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/hero-brass-frenchhorn-major-high.wav',
  },
  {
    id: 'low-brass',
    name: 'Low Brass',
    emoji: '📯',
    color: '#DC2626',
    family: 'Brass',
    feelsLike: [
      { bold: 'Heavy and powerful', detail: 'feels huge' },
      { bold: 'Threatening', detail: 'can sound scary or evil' },
      { bold: 'Slow and serious', detail: 'like something big approaching' },
    ],
    greatFor: 'Villains, monsters, dragons, dark forces, danger',
    instrumentId: 'low-brass',
    audioPath: 'https://media.musicmindacademy.com/audio/leitmotifs/villain-strings-bass-minor-low.wav',
  },
];

// Demo melody: simple 5-note pentatonic phrase, same for all instruments
// C4 → E4 → G4 → E4 → C4 (gentle arc, works on all instruments)
export const DEMO_MELODY = [
  { note: 'C4', duration: 0.5 },
  { note: 'E4', duration: 0.5 },
  { note: 'G4', duration: 0.7 },
  { note: 'E4', duration: 0.5 },
  { note: 'C4', duration: 0.8 },
];

// Hook melody — same notes, played on flute then bassoon
export const HOOK_INSTRUMENTS = ['flute', 'bassoon'];

// ========================================
// SCENE BACKGROUNDS for compose activity
// ========================================
export const SCENE_BACKGROUNDS = [
  { id: 'blue-forest', name: 'Forest', emoji: '🌲' },
  { id: 'mountain-peak', name: 'Mountain', emoji: '⛰️' },
  { id: 'dark-forest', name: 'Dark Forest', emoji: '🌳' },
  { id: 'winter-night', name: 'Winter', emoji: '❄️' },
  { id: 'night-mountain', name: 'Night', emoji: '🏔️' },
  { id: 'autumn-forest', name: 'Autumn', emoji: '🍂' },
  { id: 'city', name: 'City', emoji: '🏙️' },
  { id: 'clouds-sunset', name: 'Sunset', emoji: '🌅' },
  { id: 'clouds-night', name: 'Starry Sky', emoji: '🌙' },
  { id: 'sky-14', name: 'Cherry Blossom', emoji: '🌸' },
];

// ========================================
// CHARACTER SUGGESTIONS for the mission slide
// ========================================
export const CHARACTER_SUGGESTIONS = [
  'A small flying creature',
  'A heavy slow giant',
  'A brave hero',
  'A sad lonely traveler',
  'A sneaky thief',
  'A scary monster',
];

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook → Concept',
    color: 'orange',
    estimatedTime: 5,
    stages: [
      {
        id: 'hook',
        type: 'demo',
        label: 'Hook: Music Changes With the Scene',
        description: '"What happened to the music when the scene changed?"',
        duration: 3
      },
      {
        id: 'concept',
        type: 'summary',
        label: 'Music Lives in Time',
        description: 'When the scene changes, the music changes. You control WHEN.',
        duration: 2
      }
    ]
  },
  {
    id: 'score-this-character',
    title: '2. Score This Character',
    subtitle: 'Class Game',
    color: 'orange',
    estimatedTime: 15,
    stages: [
      {
        id: 'score-this-character',
        type: 'activity',
        label: '🎬 Score This Character',
        duration: 15,
        hasTimer: true,
        trackProgress: true,
        description: 'CLASS GAME: Create characters, compose motifs, vote on the best match!',
      }
    ]
  },
  {
    id: 'compose',
    title: '3. Scene Composer',
    subtitle: 'Two Scenes, Two Themes',
    color: 'orange',
    estimatedTime: 25,
    stages: [
      {
        id: 'compose',
        type: 'activity',
        label: '🎬 Scene Composer',
        duration: 25,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Draw two scenes, choose instruments, compose themes.',
        bonusDescription: 'Bonus: Make your scene change as dramatic as possible!'
      }
    ]
  },
  {
    id: 'share',
    title: '4. Share & Close',
    subtitle: 'Share & Pair → Closing',
    color: 'orange',
    estimatedTime: 5,
    stages: [
      {
        id: 'share-and-pair',
        type: 'activity',
        label: 'Share & Pair',
        description: 'Partner activity: Play your timeline, partner guesses when the scene changes.',
        duration: 4,
        hasTimer: true
      },
      {
        id: 'closing',
        type: 'summary',
        label: 'Closing',
        description: 'Review what we learned today.',
        duration: 1
      }
    ]
  }
];

export const fmLesson2Config = {
  id: 'fm-lesson2',
  lessonPath: '/lessons/film-music/lesson2',
  title: "WHAT Do They Feel?",
  subtitle: "Music Changes With the Scene",
  unitTitle: "Film Music: Scoring the Story",
  learningObjectives: [
    "Understand that music changes in time — when the scene changes, the music changes.",
    "Choose instruments that match a character's personality and emotion.",
    "Compose two contrasting character themes on a scene timeline."
  ],
  lessonSections,
  activities: [
    {
      id: 0,
      type: "score-this-character",
      title: "Score This Character",
      estimatedTime: "15 min"
    },
    {
      id: 1,
      type: "scene-composer",
      title: "Scene Composer",
      estimatedTime: "25 min"
    }
  ]
};

// ========================================
// LESSON STAGES — presentationView data for each stage
// ========================================
export const lessonStages = [
  {
    id: 'join-code',
    label: 'Join Code Screen',
    description: 'Students enter session code to join.',
    type: 'waiting'
  },
  {
    id: 'hook',
    label: 'Hook: Music Changes With the Scene',
    description: '"What happened to the music when the scene changed?"',
    type: 'demo',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Watch What Happens When the Scene Changes',
      sections: [
        {
          heading: '',
          bullets: [
            'Listen to this short clip...',
            'The scene changes halfway through.',
            'What happened to the music?'
          ]
        },
        {
          heading: 'Turn and Talk:',
          bullets: [
            'What changed? Did the instrument change?',
            'Did the feeling change?',
            'Why would a composer do that?'
          ]
        }
      ]
    }
  },
  {
    id: 'concept',
    label: 'Music Lives in Time',
    description: 'When the scene changes, the music changes. You control WHEN.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Music Lives in Time',
      sections: [
        {
          heading: 'The Big Idea',
          bullets: [
            'A film score isn\'t ONE piece of music — it\'s many pieces, each matched to what\'s happening on screen.',
            'When the camera changes → the music can change.',
            'When a new character appears → their theme starts.',
            'When the mood shifts → the instruments shift.'
          ]
        },
        {
          heading: '',
          bullets: [
            'As a composer, you control WHEN music happens — not just WHAT it sounds like.'
          ]
        }
      ]
    }
  },
  {
    id: 'score-this-character',
    label: '🎬 Score This Character',
    description: 'CLASS GAME: Create characters, compose motifs, vote on the best match!',
    type: 'activity',
    hasTimer: true,
    hasProgress: true,
    duration: 15,
    presentationView: {
      type: 'score-this-character-teacher',
    }
  },
  {
    id: 'compose',
    label: '🎬 Scene Composer',
    description: 'STUDENTS WORK: Draw two scenes, choose instruments, compose themes.',
    bonusDescription: 'Bonus: Make your scene change as dramatic as possible!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 25,
    presentationView: {
      type: 'scene-composer-teacher',
    }
  },
  {
    id: 'share-and-pair',
    label: 'Share & Pair',
    description: 'Partner activity: Play your timeline, partner guesses when the scene changes.',
    type: 'activity',
    hasTimer: true,
    duration: 4,
    presentationView: {
      type: 'scene-composer-share-and-pair'
    }
  },
  {
    id: 'closing',
    label: 'Closing',
    description: 'Review what we learned today.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'You Just Scored Two Scenes',
      sections: [
        {
          heading: 'Today you learned:',
          bullets: [
            'Music changes in TIME — composers decide WHEN music happens',
            'When the scene changes, the music changes too',
            'Bigger contrast = clearer storytelling'
          ]
        },
        {
          heading: 'Next Class',
          bullets: [
            'You\'ll pick the video for your final project and plan the whole score.'
          ]
        }
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'hook': 'demo',
    'concept': 'summary',
    'score-this-character': 'score-this-character',
    'compose': 'scene-composer',
    'share-and-pair': 'scene-composer',
    'closing': 'summary'
  };
  return stageMap[stage];
};
