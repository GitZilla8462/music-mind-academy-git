// File: /lessons/film-music/lesson1/Lesson1config.jsx
// Film Music Lesson 1: WHO Is In The Story? - Leitmotif & Melody (~40 minutes)
// Students learn how composers create character identity through melody
//
// ========================================
// LESSON OVERVIEW
// ========================================
// Essential Understanding: Music gives characters identity — before we see them, we can hear them
// Film Skill: Leitmotif
// Music Skill: Creating a melody/motif using keyboard (5-note pentatonic)
// Standards: MU:Cr1.1.8a, MU:Cn11.0.8a

export const LESSON_PROGRESS_KEY = 'fm-lesson1-progress';
export const LESSON_TIMER_KEY = 'fm-lesson1-timer';

// ========================================
// CHARACTER ARCHETYPES FOR LEITMOTIF EXAMPLES
// ========================================
// Each example has a `recording` field for playback with key highlighting.
// To record: add ?dev=true to URL, record on the slide, copy JSON, paste here.
// Format: { notes: [{note, timestamp, duration}], instrument: 'brass', scale: 'major' }
export const LEITMOTIF_EXAMPLES = [
  {
    id: 'hero',
    name: 'The Hero',
    color: '#EF4444',
    reasons: [
      { bold: 'Bold and loud', detail: 'the music wants to be heard' },
      { bold: 'Major key, bright sound', detail: 'feels confident and strong' },
      { bold: 'Rising melody', detail: 'notes climb up, like they\'re rising to the challenge' },
    ],
    teacherPrompt: 'What instrument did you hear? Why does it fit a hero?',
    recording: null, // paste dev recording JSON here
  },
  {
    id: 'villain',
    name: 'The Villain',
    color: '#7C3AED',
    reasons: [
      { bold: 'Low and heavy', detail: 'deep instruments feel powerful and threatening' },
      { bold: 'Minor key', detail: 'dark, unsettling sound' },
      { bold: 'Slow and steady', detail: 'like they\'re marching toward you, and you can\'t stop them' },
    ],
    teacherPrompt: 'Does this music sound scary or evil? What\'s the difference?',
    recording: null,
  },
  {
    id: 'romantic',
    name: 'The Romantic',
    color: '#EC4899',
    reasons: [
      { bold: 'Smooth and flowing', detail: 'notes move gently, no sharp edges' },
      { bold: 'Warm instrument', detail: 'strings or piano, something that feels like a hug' },
      { bold: 'Rises and falls like breathing', detail: 'it feels like emotion, not action' },
    ],
    teacherPrompt: 'Where else have you heard music like this? What was happening on screen?',
    recording: null,
  },
  {
    id: 'sneaky',
    name: 'The Sneaky One',
    color: '#F59E0B',
    reasons: [
      { bold: 'Short, quick notes', detail: 'like tiptoeing' },
      { bold: 'Playful, not scary', detail: 'this character is up to something, but it\'s fun' },
      { bold: 'Lots of space between notes', detail: 'like they\'re hiding, then popping out' },
    ],
    teacherPrompt: 'What\'s the difference between sneaky music and villain music?',
    recording: null,
  }
];

// ========================================
// CHARACTER LIBRARY (12 line-art characters for Motif Builder)
// ========================================
export const CHARACTER_LIBRARY = [
  { id: 'fox', name: 'Fox', emoji: '🦊', defaultColor: '#F59E0B' },
  { id: 'knight', name: 'Knight', emoji: '🛡️', defaultColor: '#6B7280' },
  { id: 'robot', name: 'Robot', emoji: '🤖', defaultColor: '#3B82F6' },
  { id: 'dragon', name: 'Dragon', emoji: '🐉', defaultColor: '#EF4444' },
  { id: 'monster', name: 'Monster', emoji: '👹', defaultColor: '#7C3AED' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', defaultColor: '#8B5CF6' },
  { id: 'spy', name: 'Spy', emoji: '🕵️', defaultColor: '#1F2937' },
  { id: 'kid', name: 'Kid', emoji: '🧒', defaultColor: '#F97316' },
  { id: 'ghost', name: 'Ghost', emoji: '👻', defaultColor: '#D1D5DB' },
  { id: 'warrior', name: 'Warrior', emoji: '⚔️', defaultColor: '#DC2626' },
  { id: 'creature', name: 'Creature', emoji: '🐾', defaultColor: '#10B981' },
  { id: 'alien', name: 'Alien', emoji: '👽', defaultColor: '#06B6D4' },
];

// ========================================
// MOTIF BUILDER INSTRUMENTS (6 choices)
// ========================================
export const MOTIF_INSTRUMENTS = [
  { id: 'flute', name: 'Flute', emoji: '🎶', family: 'Woodwind' },
  { id: 'violin', name: 'Violin', emoji: '🎻', family: 'Strings' },
  { id: 'cello', name: 'Cello', emoji: '🎻', family: 'Strings' },
  { id: 'trumpet', name: 'Trumpet', emoji: '🎺', family: 'Brass' },
  { id: 'clarinet', name: 'Clarinet', emoji: '🎵', family: 'Woodwind' },
  { id: 'low-brass', name: 'Low Brass', emoji: '📯', family: 'Brass' },
];

// ========================================
// PENTATONIC KEYBOARD MAPPING (5 notes only)
// ========================================
export const PENTATONIC_NOTES = [
  { note: 'C4', key: 'a', label: 'C', color: '#3B82F6' },
  { note: 'D4', key: 's', label: 'D', color: '#10B981' },
  { note: 'E4', key: 'd', label: 'E', color: '#F59E0B' },
  { note: 'G4', key: 'f', label: 'G', color: '#EF4444' },
  { note: 'A4', key: 'g', label: 'A', color: '#8B5CF6' },
];

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'hook',
    title: '1. Hook',
    subtitle: 'Turn & Talk',
    color: 'orange',
    estimatedTime: 3,
    stages: [
      {
        id: 'hook-turn-and-talk',
        type: 'summary',
        label: 'Music Tells You Who\'s Coming',
        description: 'Turn-and-talk: Think of a villain or hero whose music you recognize.',
        duration: 3
      }
    ]
  },
  {
    id: 'learn',
    title: '2. Learn',
    subtitle: 'Leitmotif Examples',
    color: 'orange',
    estimatedTime: 11,
    stages: [
      {
        id: 'leitmotif-definition',
        type: 'summary',
        label: 'What Is a Leitmotif?',
        description: 'Define leitmotif — a short musical idea that belongs to a character.',
        duration: 3
      },
      {
        id: 'example-hero',
        type: 'demo',
        label: 'Example: The Hero',
        description: 'DEMO: Play hero motif on keyboard. Bold, major, rising.',
        duration: 2
      },
      {
        id: 'example-villain',
        type: 'demo',
        label: 'Example: The Villain',
        description: 'DEMO: Play villain motif on keyboard. Low, minor, steady.',
        duration: 2
      },
      {
        id: 'example-romantic',
        type: 'demo',
        label: 'Example: The Romantic',
        description: 'DEMO: Play romantic motif on keyboard. Smooth, warm, flowing.',
        duration: 2
      },
      {
        id: 'example-sneaky',
        type: 'demo',
        label: 'Example: The Sneaky One',
        description: 'DEMO: Play sneaky motif on keyboard. Short, playful, spacious.',
        duration: 2
      }
    ]
  },
  {
    id: 'keyboard-basics',
    title: '3. Keyboard Basics',
    subtitle: 'Your Keyboard Is a Piano',
    color: 'orange',
    estimatedTime: 4,
    stages: [
      {
        id: 'keyboard-diagram',
        type: 'summary',
        label: 'Your Keyboard Is a Piano',
        description: 'Show A=C, S=D, D=E, F=G, G=A. Try it for 60 seconds.',
        duration: 3
      },
      {
        id: 'your-mission',
        type: 'summary',
        label: 'Your Mission',
        description: 'Pick a character, describe in 3 words, compose a 4-8 note theme.',
        duration: 1
      }
    ]
  },
  {
    id: 'create',
    title: '4. Create',
    subtitle: 'Motif Builder',
    color: 'orange',
    estimatedTime: 12,
    stages: [
      {
        id: 'motif-builder',
        type: 'activity',
        label: '🎼 Motif Builder',
        duration: 12,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Pick character, describe in 3 words, compose a 4-8 note theme.',
        bonusDescription: 'Bonus: Try a different instrument — does it change the character?'
      }
    ]
  },
  {
    id: 'reflect',
    title: '5. Reflect & Close',
    subtitle: 'Two Stars & a Wish',
    color: 'orange',
    estimatedTime: 4,
    stages: [
      {
        id: 'reflection',
        type: 'activity',
        label: '⭐ Two Stars & a Wish',
        duration: 3,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Reflect on their theme.',
        bonusDescription: 'Bonus: Share your reflection with a partner.'
      },
      {
        id: 'closing',
        type: 'summary',
        label: 'You Made a Leitmotif Today',
        description: 'Wrap up: You decided WHO, picked an instrument, wrote a theme.',
        duration: 1
      }
    ]
  }
];

export const fmLesson1Config = {
  id: 'fm-lesson1',
  lessonPath: '/lessons/film-music/lesson1',
  title: "WHO Is In The Story?",
  subtitle: "Leitmotif & Melody",
  unitTitle: "Film Scoring Studio",
  learningObjectives: [
    "Understand what a leitmotif is and how it identifies characters.",
    "Recognize different character archetypes through music (hero, villain, romantic, sneaky).",
    "Create a 4-8 note character theme using a pentatonic keyboard."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "motif-builder",
      title: "Motif Builder",
      estimatedTime: "12 min"
    },
    {
      id: 2,
      type: "two-stars-wish",
      title: "Two Stars & a Wish",
      estimatedTime: "3 min"
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

  // --- Slide 1: Hook ---
  {
    id: 'hook-turn-and-talk',
    label: 'Music Tells You Who\'s Coming',
    description: 'Turn-and-talk: Think of a villain or hero whose music you recognize.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/1.svg'
    }
  },

  // --- Slide 2: Learn ---
  {
    id: 'leitmotif-definition',
    label: 'What Is a Leitmotif?',
    description: 'Define leitmotif — a short musical idea that belongs to a character.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/2.svg'
    }
  },

  // --- Slide 3: The Hero ---
  {
    id: 'example-hero',
    label: 'Example: The Hero',
    description: 'DEMO: Play hero motif on keyboard. Bold, major, rising.',
    type: 'demo',
    duration: 2,
    presentationView: {
      type: 'leitmotif-example',
      example: LEITMOTIF_EXAMPLES[0],
    }
  },

  // --- Slide 4: The Villain ---
  {
    id: 'example-villain',
    label: 'Example: The Villain',
    description: 'DEMO: Play villain motif on keyboard. Low, minor, steady.',
    type: 'demo',
    duration: 2,
    presentationView: {
      type: 'leitmotif-example',
      example: LEITMOTIF_EXAMPLES[1],
    }
  },

  // --- Slide 5: The Romantic ---
  {
    id: 'example-romantic',
    label: 'Example: The Romantic',
    description: 'DEMO: Play romantic motif on keyboard. Smooth, warm, flowing.',
    type: 'demo',
    duration: 2,
    presentationView: {
      type: 'leitmotif-example',
      example: LEITMOTIF_EXAMPLES[2],
    }
  },

  // --- Slide 6: The Sneaky One ---
  {
    id: 'example-sneaky',
    label: 'Example: The Sneaky One',
    description: 'DEMO: Play sneaky motif on keyboard. Short, playful, spacious.',
    type: 'demo',
    duration: 2,
    presentationView: {
      type: 'leitmotif-example',
      example: LEITMOTIF_EXAMPLES[3],
    }
  },

  // --- Slide 7: Keyboard Basics ---
  {
    id: 'keyboard-diagram',
    label: 'Your Keyboard Is a Piano',
    description: 'Show A=C, S=D, D=E, F=G, G=A. Try it for 60 seconds.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/7.svg'
    }
  },

  // --- Slide 8: Your Mission ---
  {
    id: 'your-mission',
    label: 'Your Mission',
    description: 'Pick a character, describe in 3 words, compose a 4-8 note theme.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/8.svg'
    }
  },

  // --- Slide 9: Motif Builder (12 min activity) ---
  {
    id: 'motif-builder',
    label: '🎼 Motif Builder',
    description: 'STUDENTS WORK: Pick character, describe in 3 words, compose a 4-8 note theme.',
    bonusDescription: 'Bonus: Try a different instrument — does it change the character?',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 12,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/9.svg'
    }
  },

  // --- Slide 10: Two Stars & a Wish ---
  {
    id: 'reflection',
    label: '⭐ Two Stars & a Wish',
    description: 'STUDENTS WORK: Reflect on their theme.',
    bonusDescription: 'Bonus: Share your reflection with a partner.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/10.svg'
    }
  },

  // --- Slide 11: Closing ---
  {
    id: 'closing',
    label: 'You Made a Leitmotif Today',
    description: 'Wrap up: You decided WHO, picked an instrument, wrote a theme.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/11.svg'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'hook-turn-and-talk': 'summary',
    'leitmotif-definition': 'summary',
    'example-hero': 'demo',
    'example-villain': 'demo',
    'example-romantic': 'demo',
    'example-sneaky': 'demo',
    'keyboard-diagram': 'summary',
    'your-mission': 'summary',
    'motif-builder': 'motif-builder',
    'reflection': 'two-stars-wish',
    'closing': 'summary'
  };
  return stageMap[stage];
};
