// File: /lessons/listening-lab/lesson3/lesson3Config.jsx
// Lesson 3: Brass & Form
// "Music Has a Blueprint"
// Featured Piece: In the Hall of the Mountain King by Edvard Grieg (1875)
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students learn:
// - Instruments of the brass family (trumpet, French horn, trombone, tuba)
// - Musical form: how sections are labeled with letters (A, B)
// - Ternary form (ABA) in Grieg's Mountain King
// - Listen and identify form sections in the Section Spotter game
// - Use the Listening Journey Animator to visualize form sections
//
// ========================================
// AUDIO CREDITS (Public Domain)
// ========================================
// Grieg "In the Hall of the Mountain King" from Peer Gynt Suite No. 1, Op. 46 (1875)
// Public domain — composed for Ibsen's play "Peer Gynt"
// One of the most recognizable classical pieces in the world
// ========================================

import { buildPieceConfig, getPieceById } from '../lesson4/lesson4Config';
import { CHARACTER_OPTIONS } from '../../shared/activities/listening-journey/journeyDefaults';

export const LESSON_PROGRESS_KEY = 'listening-lab-lesson3-progress';
export const LESSON_TIMER_KEY = 'listening-lab-lesson3-timer';

// ========================================
// BRASS INSTRUMENTS DATA
// ========================================
export const BRASS_INSTRUMENTS = [
  {
    id: 'trumpet',
    name: 'Trumpet',
    color: '#F59E0B',
    emoji: '🎺',
    description: 'Highest brass, bright and powerful sound',
    audioFile: '/audio/orchestra-samples/brass/trumpet/trumpet-demo.mp3',
    facts: [
      'The trumpet is the highest-pitched brass instrument',
      'Sound is produced by buzzing lips into a cup-shaped mouthpiece',
      'Valves change the length of tubing to play different notes'
    ]
  },
  {
    id: 'french-horn',
    name: 'French Horn',
    color: '#8B5CF6',
    emoji: '📯',
    description: 'Warm and mellow, over 12 feet of tubing coiled up',
    audioFile: '/audio/orchestra-samples/brass/french-horn/french-horn-demo.mp3',
    facts: [
      'The French horn has over 12 feet of tubing coiled into a circular shape',
      'Players put their hand inside the bell to change the tone',
      'It can sound warm and mellow or bold and heroic'
    ]
  },
  {
    id: 'trombone',
    name: 'Trombone',
    color: '#3B82F6',
    emoji: '🎵',
    description: 'Uses a slide instead of valves, rich and bold',
    audioFile: '/audio/orchestra-samples/brass/trombone/trombone-demo.mp3',
    facts: [
      'The trombone uses a slide instead of valves to change pitch',
      'It can glide smoothly between notes (glissando)',
      'The name means "big trumpet" in Italian'
    ]
  },
  {
    id: 'tuba',
    name: 'Tuba',
    color: '#EF4444',
    emoji: '🎵',
    description: 'Lowest brass, deep and powerful foundation',
    audioFile: '/audio/orchestra-samples/brass/tuba/tuba-demo.mp3',
    facts: [
      'The tuba is the lowest-pitched brass instrument',
      'It has up to 16 feet of tubing',
      'It provides the bass foundation for the brass section'
    ]
  }
];

// ========================================
// PERCUSSION INSTRUMENTS DATA
// ========================================
export const PERCUSSION_INSTRUMENTS = [
  {
    id: 'timpani',
    name: 'Timpani',
    color: '#F59E0B',
    emoji: '🥁',
    description: 'Large pitched drums — the "thunder" of the orchestra',
    audioFile: '/audio/orchestra-samples/percussion/timpani/timpani-demo.mp3',
    category: 'pitched',
    facts: [
      'Timpani are PITCHED — they can play specific notes',
      'A pedal at the bottom changes the pitch by tightening the drumhead',
      'Usually played in sets of 2-4 drums'
    ]
  },
  {
    id: 'snare-drum',
    name: 'Snare Drum',
    color: '#3B82F6',
    emoji: '🥁',
    description: 'Sharp, crisp sound with metal wires underneath',
    audioFile: '/audio/orchestra-samples/percussion/snare/snare-demo.mp3',
    category: 'unpitched',
    facts: [
      'Metal wires (snares) stretched across the bottom create the buzz',
      'Used for marches, rhythmic patterns, and drum rolls',
      'UNPITCHED — no specific note, just rhythm'
    ]
  },
  {
    id: 'bass-drum',
    name: 'Bass Drum',
    color: '#8B5CF6',
    emoji: '🥁',
    description: 'Deep, booming sound — the heartbeat of the orchestra',
    audioFile: '/audio/orchestra-samples/percussion/bass-drum/bass-drum-demo.mp3',
    category: 'unpitched',
    facts: [
      'The largest drum in the orchestra',
      'Creates a deep, resonant boom',
      'Often used for dramatic moments and climaxes'
    ]
  },
  {
    id: 'cymbals',
    name: 'Cymbals',
    color: '#10B981',
    emoji: '🥁',
    description: 'Metallic crash — punctuates big moments',
    audioFile: '/audio/orchestra-samples/percussion/cymbals/cymbals-demo.mp3',
    category: 'unpitched',
    facts: [
      'Made of metal alloy (bronze)',
      'Crash cymbals are struck together for big accents',
      'UNPITCHED — no specific note, just a bright crash'
    ]
  }
];

// ========================================
// FORM DATA
// ========================================
export const FORM_TYPES = [
  { name: 'Binary', structure: 'AB', description: 'Two contrasting sections', color: '#3B82F6' },
  { name: 'Ternary', structure: 'ABA', description: 'Statement, contrast, return', color: '#8B5CF6' },
  { name: 'Rondo', structure: 'ABACADA', description: 'A section keeps returning between new episodes', color: '#F59E0B' }
];

export const SECTION_LABELS = [
  { label: 'A', color: '#3B82F6', description: 'Sneaky Theme — pizzicato strings and bassoons, quiet and mysterious', emoji: '🔵' },
  { label: 'B', color: '#EF4444', description: 'Building Energy — brass enters, tempo increases, louder dynamics', emoji: '🔴' }
];

// ========================================
// LISTENING JOURNEY ANIMATOR CONFIG
// Built from the CAPSTONE_PIECES entry in lesson4Config
// ========================================
export const MOUNTAIN_KING_JOURNEY_CONFIG = (() => {
  const base = buildPieceConfig(getPieceById('mountain-king'));
  return {
    ...base,
    lessonId: 'll-lesson3',
    hideScenes: true,
    hideMovement: true,
    defaultTab: 'dynamics',
    viewRoute: '/lessons/listening-lab/lesson3?view=saved',
    defaultCharacter: CHARACTER_OPTIONS.find(c => c.id === 'dog'),
    defaultSections: base.defaultSections.map(s => ({
      ...s,
      scene: 'night-mountain',
      sky: 'night',
      ground: 'rock',
    })),
  };
})();

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Brass Family',
    subtitle: 'Meet the Brass',
    color: 'blue',
    estimatedTime: 6,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'Brass & Form',
        description: 'Show students what we will learn today.',
        duration: 1
      },
      {
        id: 'brass-family-definition',
        type: 'summary',
        label: 'What is a Brass Instrument?',
        description: 'Define what makes an instrument a brass instrument.',
        duration: 1
      },
      {
        id: 'brass-family-showcase',
        type: 'summary',
        label: 'See & Hear the Brass',
        description: 'Watch and hear each brass instrument: Trumpet, French Horn, Trombone, Tuba.',
        duration: 4
      }
    ]
  },
  {
    id: 'form-concept',
    title: '2. What is Form?',
    subtitle: 'Sections & Letters',
    color: 'blue',
    estimatedTime: 14,
    stages: [
      {
        id: 'what-is-form',
        type: 'summary',
        label: 'What is Form?',
        description: 'Define musical form. First sound = A, new sound = B, A comes back = still A.',
        duration: 2
      },
      {
        id: 'meet-ternary-form',
        type: 'summary',
        label: 'Meet Ternary Form',
        description: 'Ternary = ABA. Statement, contrast, return.',
        duration: 2
      },
      {
        id: 'planning-intro',
        type: 'activity',
        label: 'Plan Your Journey',
        description: 'Students fill in their Capstone Plan worksheet — dynamics, tempo, and instruments for each section.',
        duration: 5,
        trackProgress: true
      }
      // {
      //   id: 'section-spotter',
      //   type: 'activity',
      //   label: 'Section Spotter',
      //   duration: 10,
      //   trackProgress: true,
      //   description: 'Listen to each Mountain King section. Answer questions about dynamics, instruments, and tempo.'
      // }
    ]
  },
  {
    id: 'animator-intro',
    title: '3. Listening Journey',
    subtitle: 'Build Your Journey',
    color: 'blue',
    estimatedTime: 14,
    stages: [
      {
        id: 'animator-intro-video',
        type: 'video',
        label: 'Intro to Listening Journey',
        duration: 2,
        description: 'Watch a video introducing the Listening Journey.'
      },
      {
        id: 'animator-directions',
        type: 'activity',
        label: 'Listening Journey Directions',
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: 'Students focus on placing dynamic markings in the Listening Journey.'
      },
      {
        id: 'lesson-complete',
        type: 'summary',
        label: 'Lesson Complete!',
        description: 'Lesson is complete. Review what we learned.',
        duration: 1
      }
    ]
  },
  {
    id: 'bonus',
    title: '4. Bonus',
    subtitle: 'Extra Activities',
    color: 'purple',
    estimatedTime: 12,
    stages: [
      {
        id: 'bonus-activity-intro',
        type: 'summary',
        label: 'Bonus Activity',
        description: 'Bonus activity if time allows.',
        duration: 1
      },
      {
        id: 'four-corners-instructions',
        type: 'summary',
        label: 'Four Corners Instructions',
        description: 'Explain how to play Four Corners.',
        duration: 1
      },
      {
        id: 'four-corners-game',
        type: 'activity',
        label: '\uD83C\uDFAE Unlock Four Corners',
        duration: 10,
        hasTimer: false,
        trackProgress: true,
        description: 'CLASS GAME: Move to a corner to answer review questions!',
        bonusDescription: 'Review dynamics, tempo, woodwinds, and brass!'
      }
    ]
  }
];

export const lesson3Config = {
  id: 'listening-lab-lesson3',
  lessonPath: '/lessons/listening-lab/lesson3',
  title: "Brass & Form",
  subtitle: "Music Has a Blueprint",
  featuredPiece: {
    title: "In the Hall of the Mountain King",
    composer: "Edvard Grieg",
    form: "Ternary (ABA)",
    year: 1875,
    duration: "~2:30",
    audioPath: "/audio/classical/grieg-mountain-king.mp3"
  },
  learningObjectives: [
    "Identify brass instruments by sight and sound (trumpet, French horn, trombone, tuba)",
    "Define musical form and label sections using letters (A, B)",
    "Recognize ternary form (ABA) in Grieg's Mountain King",
    "Identify dynamics, instruments, and tempo in each section of Mountain King"
  ],
  lessonSections,
  activities: [
    // {
    //   id: 1,
    //   type: "section-spotter",
    //   title: "Section Spotter — Mountain King",
    //   estimatedTime: "10 min"
    // },
    {
      id: 1,
      type: "animator-intro",
      title: "Intro to Listening Journey",
      estimatedTime: "4 min"
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
    label: 'Brass & Form',
    description: 'Show students what we will learn today.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Brass & Form',
      subtitle: 'Music Has a Blueprint',
      sections: [
        {
          heading: 'Today We Will',
          bullets: [
            'Meet the BRASS FAMILY (trumpet, French horn, trombone, tuba)',
            'Learn what MUSICAL FORM is — how composers organize music',
            'Discover TERNARY form (ABA) in a piece from 1875!',
            'Play SECTION SPOTTER to identify the form by ear',
            'PLAN your Listening Journey — describe what you hear!'
          ]
        }
      ],
      featuredPiece: {
        title: 'In the Hall of the Mountain King',
        composer: 'Edvard Grieg (1875)'
      }
    }
  },
  {
    id: 'brass-family-definition',
    label: 'What is a Brass Instrument?',
    description: 'Define what makes an instrument a brass instrument.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'What is a Brass Instrument?',
      subtitle: 'Instruments Made of Metal with a Cup Mouthpiece',
      bullets: [
        'Sound is produced by BUZZING LIPS into a cup-shaped mouthpiece',
        'All brass instruments are made of metal tubing',
        'Length and shape of the tubing determines the pitch range',
        'Valves or a slide change the length of tubing to play different notes'
      ]
    }
  },
  {
    id: 'brass-family-showcase',
    label: 'See & Hear the Brass',
    description: 'Watch and hear each brass instrument.',
    type: 'summary',
    duration: 4,
    presentationView: {
      type: 'brass-showcase'
    }
  },
  {
    id: 'what-is-form',
    label: 'What is Form?',
    description: 'Define musical form. A, B section labels.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'What is Form?',
      subtitle: 'The Blueprint of Music',
      sections: [
        {
          heading: 'Form = The Structure of Music',
          bullets: [
            'Music is organized into SECTIONS — like chapters in a book',
            'We use LETTERS to label different sections:',
            'First thing you hear = A',
            'Something new and different = B',
            'If A comes back again = still A!',
            'Another new thing = C, then D, etc.'
          ]
        }
      ]
    }
  },
  {
    id: 'meet-ternary-form',
    label: 'Meet Ternary Form',
    description: 'Explain Ternary form (ABA).',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'ternary-showcase',
      pieceTitle: 'In the Hall of the Mountain King',
      composer: 'Grieg',
      sections: [
        { label: 'A', color: '#3B82F6', name: 'Sneaky Start', desc: 'Pizzicato strings + bassoons, pp' },
        { label: 'B', color: '#EF4444', name: 'Building Energy', desc: 'Brass enters, tempo increases' },
        { label: 'A\'', color: '#3B82F6', name: 'Explosive Return', desc: 'Full orchestra, ff, presto' }
      ]
    }
  },
  // {
  //   id: 'section-spotter',
  //   label: 'Section Spotter',
  //   description: 'Listen to each Mountain King section. Answer questions about dynamics, instruments, and tempo.',
  //   type: 'activity',
  //   duration: 10,
  //   presentationView: {
  //     type: 'section-spotter-teacher-game',
  //     pieceId: 'mountain-king'
  //   }
  // },
  {
    id: 'planning-intro',
    label: 'Plan Your Journey',
    description: 'Students fill in their Capstone Plan worksheet.',
    type: 'activity',
    duration: 5,
    presentationView: {
      type: 'journey-planner-directions',
    }
  },
  {
    id: 'animator-intro-video',
    label: 'Intro to Listening Journey',
    description: 'Watch a video introducing the Listening Journey.',
    type: 'video',
    duration: 2,
    presentationView: {
      type: 'youtube-clip',
      videoId: 'PLACEHOLDER',
      title: 'Introduction to the Listening Journey',
      subtitle: 'See how to build your Listening Journey'
    }
  },
  {
    id: 'animator-directions',
    label: 'Listening Journey Directions',
    description: 'Students focus on placing dynamic markings in the Listening Journey.',
    type: 'activity',
    duration: 10,
    hasTimer: true,
    presentationView: {
      type: 'journey-animator-directions',
      pieceConfig: MOUNTAIN_KING_JOURNEY_CONFIG,
    }
  },
  {
    id: 'lesson-complete',
    label: 'Lesson Complete!',
    description: 'Lesson is complete. Review what we learned.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Lesson Complete!',
      subtitle: 'Great work today!',
      sections: [
        {
          heading: 'What We Learned',
          bullets: [
            'The four orchestral brass instruments: Trumpet, French Horn, Trombone, Tuba',
            'Musical form: how sections are labeled with letters (A, B)',
            'Ternary form (ABA) in Grieg\'s Mountain King',
            'How to identify dynamics, instruments, and tempo in each section'
          ]
        },
        {
          heading: 'Bonus Activity',
          bullets: [
            'The following activity is a BONUS if you have extra time.',
            'Four Corners \u2014 review everything from Lessons 1-3!'
          ]
        }
      ]
    }
  },
  {
    id: 'bonus-activity-intro',
    label: 'Bonus Activity',
    description: 'Bonus activity if time allows.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Bonus Activity',
      sections: [
        {
          bullets: [
            'The following activity is a BONUS if you have extra time.',
            'Four Corners \u2014 review everything from Lessons 1-3!'
          ]
        }
      ]
    }
  },
  {
    id: 'four-corners-instructions',
    label: 'Four Corners Instructions',
    description: 'Explain how to play Four Corners.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Four Corners',
      subtitle: 'Move to the Right Corner!',
      sections: [
        {
          heading: 'How to Play',
          bullets: [
            '1. A question appears on the screen with 4 possible answers',
            '2. Each answer is in a CORNER of the screen \u2014 matching a corner of the room',
            '3. Move to the corner you think is correct!',
            '4. You can also tap your answer on your Chromebook',
            '5. Teacher reveals the correct answer'
          ]
        }
      ]
    }
  },
  {
    id: 'four-corners-game',
    label: '\uD83C\uDFAE Unlock Four Corners',
    description: 'CLASS GAME: Move to a corner to answer review questions!',
    bonusDescription: 'Review dynamics, tempo, woodwinds, and brass!',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 10,
    presentationView: {
      type: 'four-corners-game'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'brass-family-definition': 'summary',
    'brass-family-showcase': 'summary',
    'what-is-form': 'summary',
    'meet-ternary-form': 'summary',
    // 'section-spotter': 'section-spotter',
    'planning-intro': 'capstone-planning',
    'animator-intro-video': 'video',
    'animator-directions': 'listening-journey',
    'lesson-complete': 'summary',
    'bonus-activity-intro': 'summary',
    'four-corners-instructions': 'summary',
    'four-corners-game': 'four-corners'
  };
  return stageMap[stage];
};

// ========================================
// VOCABULARY
// ========================================
export const VOCABULARY = [
  { term: 'Brass', definition: 'A family of instruments that produce sound by buzzing lips into a mouthpiece' },
  { term: 'Trumpet', definition: 'Highest brass instrument, bright and powerful' },
  { term: 'French Horn', definition: 'Warm, mellow brass instrument with over 12 feet of coiled tubing' },
  { term: 'Trombone', definition: 'Brass instrument that uses a slide instead of valves' },
  { term: 'Tuba', definition: 'Lowest brass instrument, provides the bass foundation' },
  { term: 'Form', definition: 'The overall structure or blueprint of a piece of music' },
  { term: 'Section', definition: 'A distinct part of a piece with its own musical character' },
  { term: 'Ternary', definition: 'A three-part form: A (statement), B (contrast), A (return) — ABA' },
  { term: 'Contrast', definition: 'When something sounds noticeably different from what came before' },
  { term: 'Return', definition: 'When a section comes back after contrasting material' }
];
