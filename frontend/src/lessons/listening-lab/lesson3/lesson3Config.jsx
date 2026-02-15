// File: /lessons/listening-lab/lesson3/lesson3Config.jsx
// Lesson 3: Brass & Form
// "Music Has a Blueprint"
// Featured Piece: Fanfare-Rondeau by Jean-Joseph Mouret (1729)
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students learn:
// - Instruments of the brass family (trumpet, French horn, trombone, tuba)
// - Musical form: how sections are labeled with letters (A, B, C, D)
// - Rondo form (ABACADA) in Mouret's Rondeau
// - Listen and mark form sections on a Listening Map canvas
// - Use the Listening Journey Animator to visualize form sections
//
// ========================================
// AUDIO CREDITS (Public Domain)
// ========================================
// Mouret "Fanfare-Rondeau" from Suite de Symphonies No. 1 (1729)
// Public domain — composed for Louis XIV at the Palace of Versailles
// Known as the PBS Masterpiece Theatre theme
// ========================================

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
  { label: 'A', color: '#3B82F6', description: 'Refrain — the bold brass fanfare that keeps coming back', emoji: '🔵' },
  { label: 'B', color: '#EF4444', description: 'Episode 1 — lighter, strings and oboes take over', emoji: '🔴' },
  { label: 'C', color: '#10B981', description: 'Episode 2 — different contrasting material', emoji: '🟢' },
  { label: 'D', color: '#F59E0B', description: 'Episode 3 — yet another new idea', emoji: '🟡' }
];

// Mouret Rondeau section timestamps
// NOTE: Timestamps are approximate for the 2:15 recording (La Loge Olympique, Internet Archive).
// Robert should verify and fine-tune against the actual recording.
export const MOURET_RONDEAU_SECTIONS = [
  { id: 1, section: 'A', startTime: 0, endTime: 19, label: 'Fanfare', description: 'Grand brass fanfare — trumpets and timpani, bold and regal' },
  { id: 2, section: 'B', startTime: 19, endTime: 38, label: 'Episode 1', description: 'Lighter texture — strings and oboes, softer dynamics' },
  { id: 3, section: 'A', startTime: 38, endTime: 57, label: 'Fanfare Returns', description: 'The brass fanfare comes back — unmistakable' },
  { id: 4, section: 'C', startTime: 57, endTime: 76, label: 'Episode 2', description: 'New contrasting material — different from B' },
  { id: 5, section: 'A', startTime: 76, endTime: 95, label: 'Fanfare Again', description: 'The fanfare returns once more' },
  { id: 6, section: 'D', startTime: 95, endTime: 114, label: 'Episode 3', description: 'Yet another new idea — the last contrasting episode' },
  { id: 7, section: 'A', startTime: 114, endTime: 135, label: 'Final Fanfare', description: 'Triumphant close — the fanfare one last time' }
];

// ========================================
// LISTENING JOURNEY ANIMATOR CONFIG
// Section times are pre-set; students customize visuals (backgrounds, tempos)
// ========================================
export const MOURET_JOURNEY_CONFIG = {
  audioPath: '/audio/classical/mouret-rondeau.mp3',
  totalDuration: 135, // ~2:15
  storageKey: 'listening-journey-mouret',
  title: 'Fanfare-Rondeau — Jean-Joseph Mouret',
  presetMode: true, // Sections are locked — students only change visuals
  defaultSections: [
    { id: 1, label: 'A', sectionLabel: 'Fanfare', startTime: 0, endTime: 19, color: '#3B82F6', sky: null, scene: null, ground: null },
    { id: 2, label: 'B', sectionLabel: 'Episode 1', startTime: 19, endTime: 38, color: '#EF4444', sky: null, scene: null, ground: null },
    { id: 3, label: 'A', sectionLabel: 'Fanfare Returns', startTime: 38, endTime: 57, color: '#3B82F6', sky: null, scene: null, ground: null },
    { id: 4, label: 'C', sectionLabel: 'Episode 2', startTime: 57, endTime: 76, color: '#10B981', sky: null, scene: null, ground: null },
    { id: 5, label: 'A', sectionLabel: 'Fanfare Again', startTime: 76, endTime: 95, color: '#3B82F6', sky: null, scene: null, ground: null },
    { id: 6, label: 'D', sectionLabel: 'Episode 3', startTime: 95, endTime: 114, color: '#F59E0B', sky: null, scene: null, ground: null },
    { id: 7, label: 'A', sectionLabel: 'Final Fanfare', startTime: 114, endTime: 135, color: '#3B82F6', sky: null, scene: null, ground: null }
  ]
};

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
    estimatedTime: 4,
    stages: [
      {
        id: 'what-is-form',
        type: 'summary',
        label: 'What is Form?',
        description: 'Define musical form. First sound = A, new sound = B, A comes back = still A.',
        duration: 2
      },
      {
        id: 'meet-the-rondo',
        type: 'summary',
        label: 'Meet the Rondo',
        description: 'Rondo = A keeps returning. Pattern: ABACADA.',
        duration: 2
      }
    ]
  },
  {
    id: 'rondo-form-game',
    title: '3. Rondo Form Game',
    subtitle: 'Identify the Form',
    color: 'blue',
    estimatedTime: 12,
    stages: [
      {
        id: 'rondo-form-game',
        type: 'activity',
        label: 'Rondo Form Game',
        duration: 10,
        hasTimer: false,
        trackProgress: true,
        description: 'Guided listening → Round 1: Arrange the Form → Round 2: Name That Section → Round 3: Full Puzzle'
      },
      {
        id: 'rondo-form-results',
        type: 'summary',
        label: 'Results',
        description: 'Show the Rondo Form Game leaderboard.',
        duration: 2
      }
    ]
  },
  {
    id: 'listening-journey',
    title: '4. Listening Journey Animator',
    subtitle: 'Make It Visual',
    color: 'blue',
    estimatedTime: 14,
    stages: [
      {
        id: 'journey-intro',
        type: 'summary',
        label: 'Listening Journey Animator Intro',
        description: 'Introduce the Listening Journey Animator. Students get the correct section times — their job is to make each section look and feel different.',
        duration: 2
      },
      {
        id: 'listening-journey-animator',
        type: 'activity',
        label: 'Listening Journey Animator',
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Customize backgrounds and tempos for each section of the Mouret Rondeau.'
      }
    ]
  },
  {
    id: 'reflect',
    title: '5. Reflection',
    subtitle: 'Wrap Up',
    color: 'blue',
    estimatedTime: 2,
    stages: [
      {
        id: 'reflection',
        type: 'discussion',
        label: 'Class Reflection',
        duration: 2,
        description: 'Wrap up with reflection questions about form and brass.'
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
    title: "Fanfare-Rondeau",
    composer: "Jean-Joseph Mouret",
    form: "Rondo (ABACADA)",
    year: 1729,
    duration: "~2 min",
    audioPath: "/audio/classical/mouret-rondeau.mp3"
  },
  learningObjectives: [
    "Identify brass instruments by sight and sound (trumpet, French horn, trombone, tuba)",
    "Define musical form and label sections using letters (A, B, C, D)",
    "Recognize rondo form (ABACADA) in Mouret's Rondeau",
    "Identify form sections by ear in the Section Spotter game",
    "Use the Listening Journey Animator to visualize form"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "rondo-form-game",
      title: "Rondo Form Game — 3 Rounds",
      estimatedTime: "10 min"
    },
    {
      id: 2,
      type: "listening-journey",
      title: "Listening Journey Animator",
      estimatedTime: "10 min"
    },
    {
      id: 3,
      type: "listening-lab-lesson3-reflection",
      title: "Reflection",
      estimatedTime: "2 min"
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
            'Discover RONDO form (ABACADA) in a piece from 1729!',
            'Play SECTION SPOTTER to identify the form by ear',
            'Create a LISTENING JOURNEY ANIMATOR'
          ]
        }
      ],
      featuredPiece: {
        title: 'Fanfare-Rondeau',
        composer: 'Jean-Joseph Mouret (1729)'
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
    description: 'Define musical form. A, B, C, D section labels.',
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
        },
        {
          heading: 'Think of it like a chorus in a song',
          bullets: [
            'The chorus keeps coming back between verses',
            'In classical music, when the A section keeps returning, that\'s called a RONDO'
          ]
        }
      ]
    }
  },
  {
    id: 'meet-the-rondo',
    label: 'Meet the Rondo',
    description: 'Explain Rondo form (ABACADA).',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'rondo-showcase',
      pieceTitle: 'Fanfare-Rondeau',
      composer: 'Mouret',
      sections: [
        { label: 'A', color: '#3B82F6', name: 'Fanfare', desc: 'Bold brass + timpani' },
        { label: 'B', color: '#EF4444', name: 'Episode 1', desc: 'Lighter — strings & oboes' },
        { label: 'A', color: '#3B82F6', name: 'Fanfare Returns', desc: 'Brass comes back!' },
        { label: 'C', color: '#10B981', name: 'Episode 2', desc: 'New contrasting material' },
        { label: 'A', color: '#3B82F6', name: 'Fanfare Again', desc: 'The familiar fanfare' },
        { label: 'D', color: '#F59E0B', name: 'Episode 3', desc: 'Last new idea' },
        { label: 'A', color: '#3B82F6', name: 'Final Fanfare', desc: 'Triumphant close' }
      ]
    }
  },
  {
    id: 'rondo-form-game',
    label: 'Rondo Form Game',
    description: 'Guided listening + 3-round game: Arrange the Form, Name That Section, Full Puzzle.',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 10,
    presentationView: {
      type: 'rondo-form-game-teacher'
    }
  },
  {
    id: 'rondo-form-results',
    label: 'Results',
    description: 'Show the Rondo Form Game leaderboard.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'rondo-form-game-results'
    }
  },
  {
    id: 'journey-intro',
    label: 'Listening Journey Animator Intro',
    description: 'Introduce the Listening Journey Animator activity.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Listening Journey Animator',
      subtitle: 'Make Each Section Come Alive!',
      sections: [
        {
          heading: 'Your Job',
          bullets: [
            'You now know the form: A – B – A – C – A – D – A',
            'The section times are already set for you',
            'YOUR job: make each section LOOK and FEEL different!',
            'Choose different BACKGROUNDS for each section',
            'Set different TEMPOS for the character animation',
            'When you\'re done, watch your journey play with the music!'
          ]
        }
      ]
    }
  },
  {
    id: 'listening-journey-animator',
    label: 'Listening Journey Animator',
    description: 'Students customize backgrounds and tempos for each section of the Rondeau.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'listening-journey-directions'
    }
  },
  {
    id: 'reflection',
    label: 'Class Reflection',
    description: 'Wrap up with reflection questions about form and brass.',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Class Reflection',
      subtitle: '',
      sections: [
        {
          heading: 'Reflect on Today\'s Lesson',
          bullets: [
            '1. The form of the Mouret Rondeau is ______ (use letters).',
            '2. I knew the A section was back because I heard ______.',
            '3. The brass instrument I found most interesting was ______ because ______.'
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
    'brass-family-definition': 'summary',
    'brass-family-showcase': 'summary',
    'what-is-form': 'summary',
    'meet-the-rondo': 'summary',
    'rondo-form-game': 'rondo-form-game',
    'rondo-form-results': 'summary',
    'journey-intro': 'summary',
    'listening-journey-animator': 'listening-journey',
    'reflection': 'discussion'
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
  { term: 'Rondo', definition: 'Form where A returns between contrasting episodes (ABACADA)' },
  { term: 'Episode', definition: 'A contrasting section between returns of the A theme' },
  { term: 'Refrain', definition: 'The recurring section that keeps coming back (the A in a rondo)' },
  { term: 'Contrast', definition: 'When something sounds noticeably different from what came before' }
];
