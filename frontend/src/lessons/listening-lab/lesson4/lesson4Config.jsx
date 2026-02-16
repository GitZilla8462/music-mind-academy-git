// File: /lessons/listening-lab/lesson4/lesson4Config.jsx
// Lesson 4: Percussion & Review
// "Instrument Families & Review"
// Students meet the percussion family, review L1-L3 concepts, continue Listening Journey
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students:
// - Meet the percussion family (pitched vs. unpitched)
// - Review dynamics, tempo, and form from L1-L3
// - Continue building their Listening Journey (worktime)
// - Bonus: Play "Name That Element" rapid-fire review game
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
    form: 'Ternary (ABA)',
    formLetters: 'A-B-A\'',
    keyFeatures: ['ABA ternary form — statement, contrast, return', 'Pizzicato strings create sneaky atmosphere in A', 'Brass enters in B section with increased tempo', 'A\' return features full orchestra, ff, accelerando to presto'],
    sections: [
      { id: 1, label: 'A', sectionLabel: 'Sneaky Start', startTime: 0, endTime: 59, color: '#3B82F6', defaultDynamics: 'pp', defaultTempo: 'andante' },
      { id: 2, label: 'B', sectionLabel: 'Building Energy', startTime: 59, endTime: 101, color: '#EF4444', defaultDynamics: 'mf', defaultTempo: 'moderato' },
      { id: 3, label: 'A\'', sectionLabel: 'Explosive Return', startTime: 101, endTime: 150, color: '#3B82F6', defaultDynamics: 'ff', defaultTempo: 'presto' }
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
    id: 'percussion',
    title: '1. Percussion',
    subtitle: 'Meet the Percussion',
    color: 'blue',
    estimatedTime: 6,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'Percussion & Review',
        description: 'Welcome! Today: percussion family, review, and Listening Journey worktime.',
        duration: 1
      },
      {
        id: 'percussion-definition',
        type: 'summary',
        label: 'Pitched vs. Unpitched',
        description: 'Define percussion: pitched (timpani) vs unpitched (snare, bass drum, cymbals).',
        duration: 2
      },
      {
        id: 'percussion-showcase',
        type: 'summary',
        label: 'See & Hear Percussion',
        description: 'Watch and hear each percussion instrument.',
        duration: 4
      }
    ]
  },
  {
    id: 'review',
    title: '2. Review',
    subtitle: 'Dynamics, Tempo & Form',
    color: 'blue',
    estimatedTime: 4,
    stages: [
      {
        id: 'review-slides',
        type: 'summary',
        label: 'Quick Review',
        description: 'Recap dynamics, tempo, and form concepts from Lessons 1-3.',
        duration: 4
      }
    ]
  },
  {
    id: 'worktime',
    title: '3. Listening Journey Worktime',
    subtitle: 'Build Your Journey',
    color: 'blue',
    estimatedTime: 20,
    stages: [
      {
        id: 'build-time',
        type: 'activity',
        label: 'Build Your Journey',
        duration: 20,
        hasTimer: true,
        trackProgress: true,
        description: 'Students continue building their Listening Journey.',
        bonusDescription: 'Match backgrounds, tempo, and dynamics to what you hear!'
      }
    ]
  },
  {
    id: 'bonus-game',
    title: '4. Bonus Game',
    subtitle: 'Name That Element',
    color: 'blue',
    estimatedTime: 10,
    stages: [
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
        label: 'Name That Element',
        duration: 8,
        hasTimer: false,
        trackProgress: true,
        description: 'CLASS GAME: Rapid-fire review — dynamics, tempo, or form?',
        bonusDescription: 'Speed bonus for fast answers!'
      }
    ]
  }
];

export const lesson4Config = {
  id: 'listening-lab-lesson4',
  lessonPath: '/lessons/listening-lab/lesson4',
  title: "Percussion & Review",
  subtitle: "Instrument Families & Review",
  featuredPiece: null,
  learningObjectives: [
    "Identify percussion instruments and distinguish pitched from unpitched",
    "Review dynamics, tempo, and form concepts from Lessons 1-3",
    "Continue building a Listening Journey that shows dynamics, tempo, and form"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "percussion-showcase",
      title: "Meet the Percussion Family",
      estimatedTime: "4 min"
    },
    {
      id: 2,
      type: "listening-journey",
      title: "Listening Journey Worktime",
      estimatedTime: "20 min"
    },
    {
      id: 3,
      type: "name-that-element",
      title: "Name That Element (Bonus Game)",
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
    id: 'welcome-intro',
    label: 'Percussion & Review',
    description: 'Welcome! Today: percussion family, review, and Listening Journey worktime.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Percussion & Review',
      subtitle: 'Instrument Families & Review',
      sections: [
        {
          heading: 'Today\'s Plan',
          bullets: [
            '🥁 PERCUSSION — Meet the percussion family (pitched vs. unpitched)',
            '📝 REVIEW — Quick recap of dynamics, tempo, and form',
            '🏗️ WORKTIME — Continue building your Listening Journey',
            '🎮 BONUS — Name That Element game!'
          ]
        }
      ]
    }
  },
  {
    id: 'percussion-definition',
    label: 'Pitched vs. Unpitched',
    description: 'Define percussion: pitched (timpani) vs unpitched (snare, bass drum, cymbals).',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'The Percussion Family',
      subtitle: 'Instruments you strike, shake, or scrape',
      sections: [
        {
          heading: 'Two Types of Percussion',
          bullets: [
            'PITCHED — can play specific notes (timpani, xylophone, marimba)',
            'UNPITCHED — no specific pitch, just rhythm and color (snare drum, bass drum, cymbals)',
            'Percussion instruments are played by striking, shaking, or scraping'
          ]
        }
      ]
    }
  },
  {
    id: 'percussion-showcase',
    label: 'See & Hear Percussion',
    description: 'Watch and hear each percussion instrument.',
    type: 'summary',
    duration: 4,
    presentationView: {
      type: 'percussion-showcase'
    }
  },
  {
    id: 'review-slides',
    label: 'Quick Review',
    description: 'Recap dynamics, tempo, and form from Lessons 1-3.',
    type: 'summary',
    duration: 4,
    presentationView: {
      type: 'summary',
      title: 'Quick Review',
      subtitle: 'What have we learned so far?',
      sections: [
        {
          heading: 'Dynamics (Lesson 1)',
          bullets: [
            'How LOUD or SOFT the music is',
            'pp → p → mp → mf → f → ff',
            'Crescendo (getting louder) & Decrescendo (getting softer)'
          ]
        },
        {
          heading: 'Tempo (Lesson 2)',
          bullets: [
            'How FAST or SLOW the music moves',
            'Largo → Adagio → Andante → Allegro → Presto',
            'Accelerando (speeding up) & Ritardando (slowing down)'
          ]
        },
        {
          heading: 'Form (Lesson 3)',
          bullets: [
            'The BLUEPRINT of a piece — sections labeled with letters',
            'Ternary form: ABA (statement, contrast, return)',
            'Mountain King: A (sneaky) → B (building) → A\' (explosive)'
          ]
        }
      ]
    }
  },
  {
    id: 'build-time',
    label: 'Build Your Journey',
    description: 'Students continue building their Listening Journey.',
    bonusDescription: 'Match backgrounds, tempo, and dynamics to what you hear!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 20,
    presentationView: {
      type: 'activity-banner',
      title: 'Listening Journey Worktime',
      subtitle: 'Continue building — show what you hear!'
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
            'DYNAMICS — How loud or soft? (p, f, crescendo, decrescendo)',
            'TEMPO — How fast or slow? (allegro, adagio, accelerando)',
            'FORM — What section? (A section, B section, ternary, rondo)'
          ]
        }
      ]
    }
  },
  {
    id: 'review-game',
    label: 'Name That Element',
    description: 'CLASS GAME: Rapid-fire review of dynamics, tempo, and form.',
    bonusDescription: 'Speed bonus for fast answers!',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 8,
    presentationView: {
      type: 'name-that-element-teacher-game'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'percussion-definition': 'summary',
    'percussion-showcase': 'summary',
    'review-slides': 'summary',
    'build-time': 'listening-journey',
    'review-game-intro': 'summary',
    'review-game': 'name-that-element'
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
