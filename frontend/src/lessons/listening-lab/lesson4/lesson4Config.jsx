// File: /lessons/listening-lab/lesson4/lesson4Config.jsx
// Lesson 4: Review + Start Capstone
// "Putting It All Together"
// Students review dynamics, tempo, and form, then begin their capstone Listening Journey
//
// ========================================
// CURRICULUM NOTES
// ========================================
// This is the first of two capstone lessons. Students:
// - Review all three concepts from L1-L3 (dynamics, tempo, form)
// - Play "Name That Element" rapid-fire review game
// - Learn about the Listening Journey project
// - Pick their capstone piece from 5 options
// - Plan and begin building their Listening Journey
//
// ========================================
// AUDIO CREDITS
// ========================================
// All capstone pieces are public domain classical recordings
// ========================================

export const LESSON_PROGRESS_KEY = 'listening-lab-lesson4-progress';
export const LESSON_TIMER_KEY = 'listening-lab-lesson4-timer';

// ========================================
// CAPSTONE PIECE OPTIONS
// ========================================
export const CAPSTONE_PIECES = [
  {
    id: 'mountain-king',
    number: 1,
    title: 'In the Hall of the Mountain King',
    composer: 'Edvard Grieg',
    year: 1875,
    vibe: 'The Chase — starts sneaky, ends explosive',
    duration: '~2:30',
    audioPath: '/audio/classical/grieg-mountain-king.mp3',
    volume: 0.5,
    previewPath: '/audio/classical/grieg-mountain-king-preview.mp3',
    color: '#10B981',
    emoji: '🏔️',
    form: 'Through-composed (builds continuously)',
    formLetters: 'A-A\'-A\'\'-A\'\'\'',
    keyFeatures: ['Dramatic crescendo from pp to ff', 'Accelerando from andante to presto', 'Same melody repeats with growing intensity'],
    sections: [
      { id: 1, label: 'A', sectionLabel: 'Sneaky Start', startTime: 0, endTime: 37, color: '#3B82F6', defaultDynamics: 'pp', defaultTempo: 'andante' },
      { id: 2, label: 'A\'', sectionLabel: 'Getting Louder', startTime: 37, endTime: 75, color: '#8B5CF6', defaultDynamics: 'mp', defaultTempo: 'moderato' },
      { id: 3, label: 'A\'\'', sectionLabel: 'Building Up', startTime: 75, endTime: 112, color: '#F59E0B', defaultDynamics: 'f', defaultTempo: 'allegro' },
      { id: 4, label: 'A\'\'\'', sectionLabel: 'Explosive Finale', startTime: 112, endTime: 150, color: '#EF4444', defaultDynamics: 'ff', defaultTempo: 'presto' }
    ]
  },
  {
    id: 'danse-macabre',
    number: 2,
    title: 'Danse Macabre',
    composer: 'Camille Saint-Saens',
    year: 1874,
    vibe: 'Spooky Dance Party — skeletons at midnight',
    duration: '~3:00',
    audioPath: '/audio/classical/saint-saens-danse-macabre.mp3',
    previewPath: '/audio/classical/saint-saens-danse-macabre-preview.mp3',
    color: '#8B5CF6',
    emoji: '💀',
    form: 'Rondo-like (ABACABA)',
    formLetters: 'A-B-A-C-A-B-A',
    keyFeatures: ['Spooky violin solo (Death\'s fiddle)', 'Waltz tempo in 3/4 time', 'Dramatic dynamic contrasts'],
    sections: [
      { id: 1, label: 'Intro', sectionLabel: 'Midnight Strikes', startTime: 0, endTime: 20, color: '#6B7280', defaultDynamics: 'p', defaultTempo: 'adagio' },
      { id: 2, label: 'A', sectionLabel: 'Death\'s Dance', startTime: 20, endTime: 55, color: '#3B82F6', defaultDynamics: 'mf', defaultTempo: 'allegro' },
      { id: 3, label: 'B', sectionLabel: 'Ghostly Waltz', startTime: 55, endTime: 90, color: '#EF4444', defaultDynamics: 'mp', defaultTempo: 'moderato' },
      { id: 4, label: 'A', sectionLabel: 'Dance Returns', startTime: 90, endTime: 125, color: '#3B82F6', defaultDynamics: 'f', defaultTempo: 'allegro' },
      { id: 5, label: 'C', sectionLabel: 'Frenzy', startTime: 125, endTime: 155, color: '#10B981', defaultDynamics: 'ff', defaultTempo: 'presto' },
      { id: 6, label: 'A', sectionLabel: 'Final Dance', startTime: 155, endTime: 180, color: '#3B82F6', defaultDynamics: 'f', defaultTempo: 'allegro' }
    ]
  },
  {
    id: 'william-tell-storm',
    number: 3,
    title: 'William Tell Overture: The Storm',
    composer: 'Gioachino Rossini',
    year: 1829,
    vibe: 'Nature\'s Fury — thunder, lightning, calm',
    duration: '~3:00',
    audioPath: '/audio/classical/rossini-william-tell-storm.mp3',
    previewPath: '/audio/classical/rossini-william-tell-storm-preview.mp3',
    color: '#3B82F6',
    emoji: '⛈️',
    form: 'ABA (Ternary)',
    formLetters: 'A-B-A',
    keyFeatures: ['Dramatic storm with full orchestra', 'Calm pastoral section in the middle', 'Timpani thunder effects'],
    sections: [
      { id: 1, label: 'A', sectionLabel: 'The Storm Builds', startTime: 0, endTime: 50, color: '#3B82F6', defaultDynamics: 'f', defaultTempo: 'allegro' },
      { id: 2, label: 'B', sectionLabel: 'Calm Center', startTime: 50, endTime: 110, color: '#10B981', defaultDynamics: 'p', defaultTempo: 'andante' },
      { id: 3, label: 'A', sectionLabel: 'Storm Returns', startTime: 110, endTime: 170, color: '#3B82F6', defaultDynamics: 'ff', defaultTempo: 'presto' }
    ]
  },
  {
    id: 'beethoven-5th',
    number: 4,
    title: 'Symphony No. 5 (1st Movement)',
    composer: 'Ludwig van Beethoven',
    year: 1808,
    vibe: 'Fate Knocks — da-da-da-DUM!',
    duration: '~3:00',
    audioPath: '/audio/classical/beethoven-5th.mp3',
    previewPath: '/audio/classical/beethoven-5th-preview.mp3',
    color: '#EF4444',
    emoji: '🎵',
    form: 'Sonata (Exposition-Development-Recap)',
    formLetters: 'A-B-Dev-A-B',
    keyFeatures: ['Famous 4-note "fate" motif', 'Dramatic dynamic contrasts', 'Builds from tension to triumph'],
    sections: [
      { id: 1, label: 'A', sectionLabel: 'Fate Motif', startTime: 0, endTime: 45, color: '#EF4444', defaultDynamics: 'ff', defaultTempo: 'allegro' },
      { id: 2, label: 'B', sectionLabel: 'Lyrical Theme', startTime: 45, endTime: 90, color: '#3B82F6', defaultDynamics: 'p', defaultTempo: 'moderato' },
      { id: 3, label: 'Dev', sectionLabel: 'Development', startTime: 90, endTime: 135, color: '#F59E0B', defaultDynamics: 'f', defaultTempo: 'allegro' },
      { id: 4, label: 'A', sectionLabel: 'Fate Returns', startTime: 135, endTime: 165, color: '#EF4444', defaultDynamics: 'ff', defaultTempo: 'allegro' }
    ]
  },
  {
    id: 'bald-mountain',
    number: 5,
    title: 'Night on Bald Mountain',
    composer: 'Modest Mussorgsky',
    year: 1867,
    vibe: 'The Dark Mountain — witches and demons',
    duration: '~3:00',
    audioPath: '/audio/classical/mussorgsky-bald-mountain.mp3',
    previewPath: '/audio/classical/mussorgsky-bald-mountain-preview.mp3',
    color: '#6B21A8',
    emoji: '🌑',
    form: 'Through-composed with recurrent themes',
    formLetters: 'A-B-A-C-Coda',
    keyFeatures: ['Wild, demonic opening', 'Haunting quiet middle section', 'Dramatic ending — dawn breaks'],
    sections: [
      { id: 1, label: 'A', sectionLabel: 'Witches Gather', startTime: 0, endTime: 45, color: '#6B21A8', defaultDynamics: 'ff', defaultTempo: 'presto' },
      { id: 2, label: 'B', sectionLabel: 'Dark Ritual', startTime: 45, endTime: 90, color: '#EF4444', defaultDynamics: 'f', defaultTempo: 'allegro' },
      { id: 3, label: 'A', sectionLabel: 'Frenzy Returns', startTime: 90, endTime: 130, color: '#6B21A8', defaultDynamics: 'ff', defaultTempo: 'presto' },
      { id: 4, label: 'C', sectionLabel: 'Dawn Breaks', startTime: 130, endTime: 180, color: '#3B82F6', defaultDynamics: 'pp', defaultTempo: 'adagio' }
    ]
  }
];

export const getPieceById = (pieceId) => {
  return CAPSTONE_PIECES.find(p => p.id === pieceId) || CAPSTONE_PIECES[0];
};

// Build a pieceConfig for the ListeningJourney component from a CAPSTONE_PIECES entry
export const buildPieceConfig = (piece) => {
  if (!piece) return null;
  const lastSection = piece.sections[piece.sections.length - 1];
  return {
    audioPath: piece.audioPath,
    volume: piece.volume || 1.0,
    totalDuration: lastSection?.endTime || 150,
    storageKey: `listening-journey-${piece.id}`,
    title: `${piece.title} — ${piece.composer}`,
    presetMode: true,
    defaultSections: piece.sections.map(s => ({
      id: s.id,
      label: s.label,
      sectionLabel: s.sectionLabel,
      startTime: s.startTime,
      endTime: s.endTime,
      color: s.color,
      dynamics: s.defaultDynamics || 'mf',
      tempo: s.defaultTempo || 'andante',
    }))
  };
};

// ========================================
// NAME THAT ELEMENT - REVIEW GAME DATA
// ========================================
export const REVIEW_ELEMENTS = {
  dynamics: {
    label: 'Dynamics',
    color: '#EF4444',
    emoji: '📢',
    terms: ['piano (p)', 'forte (f)', 'crescendo', 'decrescendo', 'fortissimo (ff)', 'pianissimo (pp)']
  },
  tempo: {
    label: 'Tempo',
    color: '#8B5CF6',
    emoji: '⏱️',
    terms: ['allegro', 'adagio', 'andante', 'presto', 'accelerando', 'ritardando']
  },
  form: {
    label: 'Form',
    color: '#3B82F6',
    emoji: '🔤',
    terms: ['A section', 'B section', 'rondo', 'refrain', 'episode', 'binary', 'ternary']
  }
};

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'review',
    title: '1. Quick Review',
    subtitle: 'Name That Element',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'Review + Start Capstone',
        description: 'Welcome back! Today we review everything and start our capstone project.',
        duration: 1
      },
      {
        id: 'review-game-intro',
        type: 'summary',
        label: 'Name That Element',
        description: 'Explain the rapid-fire review game: hear a clip, identify dynamics, tempo, or form.',
        duration: 1
      },
      {
        id: 'review-game',
        type: 'activity',
        label: '🎮 Name That Element',
        duration: 8,
        hasTimer: false,
        trackProgress: true,
        description: 'CLASS GAME: Rapid-fire review — dynamics, tempo, or form?',
        bonusDescription: 'Speed bonus for fast answers!'
      }
    ]
  },
  {
    id: 'capstone-intro',
    title: '2. Capstone Introduction',
    subtitle: 'The Listening Journey',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'capstone-explanation',
        type: 'summary',
        label: 'Your Capstone Project',
        description: 'Explain the Listening Journey: build a visual world that shows what you hear.',
        duration: 3
      },
      {
        id: 'journey-demo',
        type: 'summary',
        label: 'Listening Journey Demo',
        description: 'Show a teacher-made example. Students see the finished product for the first time.',
        duration: 2
      },
      {
        id: 'piece-selection',
        type: 'activity',
        label: '🎵 Pick Your Piece',
        duration: 5,
        hasTimer: false,
        trackProgress: true,
        description: 'Students officially pick their capstone piece from 5 options.',
        bonusDescription: 'Listen to preview clips before you decide!'
      }
    ]
  },
  {
    id: 'planning',
    title: '3. Plan & Build',
    subtitle: 'Listening Journey',
    color: 'blue',
    estimatedTime: 20,
    stages: [
      {
        id: 'planning-phase',
        type: 'activity',
        label: '📋 Plan Your Journey',
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students sketch a plan: sections, dynamics, tempo for each part of their piece.',
        bonusDescription: 'Reference your listening maps from L1-L3!'
      },
      {
        id: 'build-time',
        type: 'activity',
        label: '🎮 Build Your Journey',
        duration: 15,
        hasTimer: true,
        trackProgress: true,
        description: 'Students open the Listening Journey builder and start creating.',
        bonusDescription: 'Match backgrounds, tempo, and dynamics to what you hear!'
      }
    ]
  },
  {
    id: 'wrap-up',
    title: '4. Save & Preview',
    subtitle: 'Save Your Progress',
    color: 'blue',
    estimatedTime: 2,
    stages: [
      {
        id: 'save-preview',
        type: 'summary',
        label: 'Save Your Work',
        description: 'Students save their progress. Reminder: tomorrow you finish and share!',
        duration: 2
      }
    ]
  }
];

export const lesson4Config = {
  id: 'listening-lab-lesson4',
  lessonPath: '/lessons/listening-lab/lesson4',
  title: "Review + Start Capstone",
  subtitle: "Putting It All Together",
  featuredPiece: null, // Students choose their own piece
  learningObjectives: [
    "Review dynamics, tempo, and form concepts from Lessons 1-3",
    "Understand the Listening Journey capstone project",
    "Select a capstone piece and identify its key musical features",
    "Plan and begin building a Listening Journey that shows dynamics, tempo, and form"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "name-that-element",
      title: "Name That Element (Review Game)",
      estimatedTime: "8 min"
    },
    {
      id: 2,
      type: "capstone-piece-selection",
      title: "Pick Your Piece",
      estimatedTime: "5 min"
    },
    {
      id: 3,
      type: "capstone-planning",
      title: "Plan Your Journey",
      estimatedTime: "5 min"
    },
    {
      id: 4,
      type: "listening-journey",
      title: "Build Your Listening Journey",
      estimatedTime: "15 min"
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
    label: 'Review + Start Capstone',
    description: 'Welcome back! Today we review and start the capstone.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Review + Start Capstone',
      subtitle: 'Putting It All Together',
      sections: [
        {
          heading: 'Today\'s Plan',
          bullets: [
            '🎮 QUICK REVIEW — Name That Element game (dynamics, tempo, form)',
            '🎬 CAPSTONE INTRO — See the Listening Journey project',
            '🎵 PICK YOUR PIECE — Choose from 5 classical masterworks',
            '📋 PLAN — Map out your sections, dynamics, and tempo',
            '🏗️ BUILD — Start creating your Listening Journey!'
          ]
        }
      ]
    }
  },
  {
    id: 'review-game-intro',
    label: 'Name That Element',
    description: 'Explain the rapid-fire review game.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Name That Element',
      subtitle: 'Rapid-Fire Review!',
      sections: [
        {
          heading: 'How to Play',
          bullets: [
            '1. You\'ll hear a short music clip',
            '2. Decide: Is this about DYNAMICS, TEMPO, or FORM?',
            '3. Tap your answer on your Chromebook',
            '4. 3 rounds of 4 clips each — 12 questions total!',
            '5. Fast + correct = more points!'
          ]
        },
        {
          heading: 'The Three Elements',
          bullets: [
            '📢 DYNAMICS — How loud or soft? (p, f, crescendo, decrescendo)',
            '⏱️ TEMPO — How fast or slow? (allegro, adagio, accelerando)',
            '🔤 FORM — What section? (A section, B section, rondo, refrain)'
          ]
        }
      ]
    }
  },
  {
    id: 'review-game',
    label: '🎮 Name That Element',
    description: 'CLASS GAME: Rapid-fire review of dynamics, tempo, and form.',
    bonusDescription: 'Speed bonus for fast answers!',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 8,
    presentationView: {
      type: 'name-that-element-teacher-game'
    }
  },
  {
    id: 'capstone-explanation',
    label: 'Your Capstone Project',
    description: 'Explain the Listening Journey project.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Your Capstone Project',
      subtitle: 'The Listening Journey',
      sections: [
        {
          heading: 'What You\'ll Build',
          bullets: [
            'A visual world that shows what you HEAR in a piece of music',
            'Your character walks through scenes that change with the music',
            'When dynamics change → the world gets brighter or darker',
            'When tempo changes → your character speeds up or slows down',
            'When the form changes → the scene transforms!'
          ]
        },
        {
          heading: 'You\'ll Show All Three Elements',
          bullets: [
            '📢 DYNAMICS — brightness, size, intensity of the world',
            '⏱️ TEMPO — speed of your character\'s movement',
            '🔤 FORM — different backgrounds for different sections'
          ]
        }
      ]
    }
  },
  {
    id: 'journey-demo',
    label: 'Listening Journey Demo',
    description: 'Show a teacher-made example.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'journey-demo'
    }
  },
  {
    id: 'piece-selection',
    label: '🎵 Pick Your Piece',
    description: 'Students pick their capstone piece.',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 5,
    presentationView: {
      type: 'piece-selection-teacher'
    }
  },
  {
    id: 'planning-phase',
    label: '📋 Plan Your Journey',
    description: 'Students sketch a plan for their Listening Journey.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'activity-banner',
      title: 'Planning Phase',
      subtitle: 'Map out your sections, dynamics, and tempo before you build!'
    }
  },
  {
    id: 'build-time',
    label: '🎮 Build Your Journey',
    description: 'Students open the Listening Journey builder.',
    bonusDescription: 'Match backgrounds, tempo, and dynamics to what you hear!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 15,
    presentationView: {
      type: 'activity-banner',
      title: 'Build Time!',
      subtitle: 'Create your Listening Journey — show what you hear!'
    }
  },
  {
    id: 'save-preview',
    label: 'Save Your Work',
    description: 'Save progress. Tomorrow: finish and share!',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Save Your Work!',
      subtitle: '',
      sections: [
        {
          heading: 'Before You Close',
          bullets: [
            '💾 Click SAVE in the Listening Journey builder',
            'Your progress is saved automatically — but double-check!',
            'Tomorrow: 20 more minutes to finish, then we SHARE'
          ]
        },
        {
          heading: 'Coming Tomorrow',
          bullets: [
            '🏗️ 20 minutes of build time to polish your journey',
            '🎪 Gallery Circle — share your journey with the class!',
            '⭐ Unit reflection — what did you learn?'
          ]
        }
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'review-game-intro': 'summary',
    'review-game': 'name-that-element',
    'capstone-explanation': 'summary',
    'journey-demo': 'summary',
    'piece-selection': 'capstone-piece-selection',
    'planning-phase': 'capstone-planning',
    'build-time': 'listening-journey',
    'save-preview': 'summary'
  };
  return stageMap[stage];
};

// ========================================
// VOCABULARY
// ========================================
export const VOCABULARY = [
  { term: 'Capstone', definition: 'A final project that brings together everything you\'ve learned' },
  { term: 'Listening Journey', definition: 'A visual world that responds to music — showing dynamics, tempo, and form' },
  { term: 'Dynamics', definition: 'How loud or soft the music is (p, f, crescendo, decrescendo)' },
  { term: 'Tempo', definition: 'How fast or slow the music moves (allegro, adagio, accelerando)' },
  { term: 'Form', definition: 'How a piece is organized into sections (A, B, C — rondo, binary, ternary)' },
  { term: 'Section', definition: 'A distinct part of a piece with its own character' },
  { term: 'Through-composed', definition: 'Music that continuously develops without repeating sections' }
];
