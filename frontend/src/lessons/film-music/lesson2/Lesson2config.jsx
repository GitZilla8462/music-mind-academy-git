// File: /lessons/film-music/lesson2/Lesson2config.jsx
// Film Music Lesson 2: WHAT Do They Feel? - Orchestration & Bass
// Students learn how instrument choice affects emotional meaning
//
// ========================================
// LESSON OVERVIEW
// ========================================
// Essential Understanding: We hear what characters feel inside — even when they hide it
// Film Skill: Orchestration / Timbre
// Music Skill: Playing bass notes, understanding instrument emotion
// Standards: MU:Cr1.1.5a, MU:Re7.2.5a, MU:Cn11.0.8a

export const LESSON_PROGRESS_KEY = 'fm-lesson2-progress';
export const LESSON_TIMER_KEY = 'fm-lesson2-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook → Learn',
    color: 'orange',
    estimatedTime: 8,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'WHAT Do They Feel?',
        description: 'Introduce the lesson and essential question.',
        duration: 1
      },
      {
        id: 'show-agenda',
        type: 'summary',
        label: 'Agenda',
        description: 'Review the lesson agenda.',
        duration: 1
      },
      {
        id: 'hook-scene',
        type: 'demo',
        label: 'Hook: Hidden Emotions',
        description: 'DEMO: Character smiles, but music is sad. "What do they REALLY feel?"',
        duration: 3
      },
      {
        id: 'timbre-emotion',
        type: 'summary',
        label: 'Timbre & Emotion',
        description: 'Same melody, different instruments = completely different feeling.',
        duration: 3
      }
    ]
  },
  {
    id: 'bass-basics',
    title: '2. Bass Basics',
    subtitle: 'Left Hand Playing',
    color: 'orange',
    estimatedTime: 5,
    stages: [
      {
        id: 'bass-intro',
        type: 'summary',
        label: 'Bass Basics',
        description: 'Bass clef range, left hand, how bass anchors a melody.',
        duration: 3
      },
      {
        id: 'bass-demo',
        type: 'demo',
        label: 'Bass Demo',
        description: 'DEMO: Show pedal tone, walking bass, root & fifth patterns.',
        duration: 2
      }
    ]
  },
  {
    id: 'practice',
    title: '3. Practice',
    subtitle: 'Instrument Emotion Lab',
    color: 'orange',
    estimatedTime: 8,
    stages: [
      {
        id: 'emotion-lab-intro',
        type: 'summary',
        label: 'Emotion Lab Introduction',
        description: 'Explain: same melody through 6 instruments, rate the emotion.',
        duration: 1
      },
      {
        id: 'instrument-emotion-lab',
        type: 'activity',
        label: '🎮 Unlock Instrument Emotion Lab',
        duration: 7,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Listen to melody on each instrument, rate emotions.',
        bonusDescription: 'Bonus: Which instrument fits YOUR character?'
      }
    ]
  },
  {
    id: 'bass-builder',
    title: '4. Bass Builder',
    subtitle: 'Experiment with Bass',
    color: 'orange',
    estimatedTime: 7,
    stages: [
      {
        id: 'bass-builder-intro',
        type: 'summary',
        label: 'Bass Builder Introduction',
        description: 'Show how to try different bass patterns underneath a melody.',
        duration: 1
      },
      {
        id: 'bass-builder',
        type: 'activity',
        label: '🎮 Unlock Bass Builder',
        duration: 6,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Try bass patterns, record your own bassline.',
        bonusDescription: 'Bonus: Try all three patterns before recording!'
      }
    ]
  },
  {
    id: 'compose',
    title: '5. Compose',
    subtitle: 'Add Bassline to Score',
    color: 'orange',
    estimatedTime: 10,
    stages: [
      {
        id: 'composition-instructions',
        type: 'summary',
        label: 'Composition Requirements',
        description: 'Add a bassline underneath your Theme A using the virtual instrument.',
        duration: 1
      },
      {
        id: 'composition',
        type: 'activity',
        label: '🎬 Unlock Composition',
        duration: 9,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Open DAW, add bassline underneath Theme A.',
        bonusDescription: 'Bonus: Try switching instruments for your melody!'
      }
    ]
  },
  {
    id: 'reflect',
    title: '6. Reflect',
    subtitle: 'Two Stars and a Wish',
    color: 'orange',
    estimatedTime: 3,
    stages: [
      {
        id: 'reflection',
        type: 'activity',
        label: '🎮 Unlock Reflection',
        duration: 3,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Complete Two Stars and a Wish.',
        bonusDescription: 'Bonus: Share your reflection with a partner.'
      }
    ]
  }
];

export const fmLesson2Config = {
  id: 'fm-lesson2',
  lessonPath: '/lessons/film-music/lesson2',
  title: "WHAT Do They Feel?",
  subtitle: "Orchestration & Bass",
  unitTitle: "Film Music: Scoring the Story",
  learningObjectives: [
    "Understand how instrument choice (timbre) affects emotional meaning.",
    "Play bass notes with the left hand (slower, sustained notes).",
    "Add a bassline underneath Theme A from Lesson 1."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "instrument-emotion-lab",
      title: "Instrument Emotion Lab",
      estimatedTime: "7 min"
    },
    {
      id: 2,
      type: "bass-builder",
      title: "Bass Builder",
      estimatedTime: "6 min"
    },
    {
      id: 3,
      type: "film-music-daw",
      title: "Film Music DAW",
      estimatedTime: "9 min"
    },
    {
      id: 4,
      type: "two-stars-wish",
      title: "Reflection Activity",
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
  {
    id: 'welcome-intro',
    label: 'WHAT Do They Feel?',
    description: 'Introduce the lesson and essential question.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'WHAT Do They Feel?',
      subtitle: 'Orchestration & Bass',
      bullets: [
        'Essential Question: How do instruments reveal inner emotion?',
        'Last time you created Theme A — your character\'s identity in sound',
        'Today: the same melody on different instruments changes EVERYTHING',
        'You will add a BASS LINE underneath your theme'
      ]
    }
  },
  {
    id: 'show-agenda',
    label: 'Agenda',
    description: 'Review the lesson agenda.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Today\'s Agenda',
      sections: [
        {
          heading: 'Learn',
          bullets: [
            'Hook: Hidden emotions — what does the music reveal?',
            'Timbre & Emotion — same melody, 6 instruments, 6 feelings',
            'Bass Basics — how low notes anchor a melody'
          ]
        },
        {
          heading: 'Create',
          bullets: [
            'Instrument Emotion Lab — rate each instrument\'s emotional effect',
            'Bass Builder — experiment with bass patterns',
            'Compose — add a bassline underneath your Theme A'
          ]
        }
      ]
    }
  },
  {
    id: 'hook-scene',
    label: 'Hook: Hidden Emotions',
    description: 'DEMO: Character smiles, but music is sad. "What do they REALLY feel?"',
    type: 'demo',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Hidden Emotions',
      subtitle: 'Watch this scene closely...',
      bullets: [
        'The character is SMILING — but listen to the music underneath',
        'The music is SAD. Slow strings. Minor key.',
        'The audience knows what the character really feels BECAUSE OF THE MUSIC',
        'Film composers use instruments to reveal what\'s hidden inside'
      ]
    }
  },
  {
    id: 'timbre-emotion',
    label: 'Timbre & Emotion',
    description: 'Same melody, different instruments = completely different feeling.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Timbre & Emotion',
      subtitle: 'Same melody. Different instrument. Completely different feeling.',
      sections: [
        {
          heading: 'What Is Timbre?',
          bullets: [
            'Timbre (TAM-ber) = the unique sound quality of an instrument',
            'A piano and a violin can play the SAME note — but they sound completely different',
            'Timbre is HOW a sound sounds, not WHAT note it plays'
          ]
        },
        {
          heading: 'Why It Matters in Film',
          bullets: [
            'Strings = emotional, romantic, sweeping',
            'Brass = heroic, powerful, military',
            'Woodwinds = playful, mysterious, gentle',
            'Instrument choice IS emotional choice'
          ]
        }
      ]
    }
  },
  {
    id: 'bass-intro',
    label: 'Bass Basics',
    description: 'Bass clef range, left hand, how bass anchors a melody.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Bass Basics',
      subtitle: 'The foundation underneath the melody',
      sections: [
        {
          heading: 'What Does Bass Do?',
          bullets: [
            'Bass notes are LOW — they sit underneath the melody like a foundation',
            'Without bass, music feels thin and floating',
            'WITH bass, music feels grounded and powerful'
          ]
        },
        {
          heading: 'Three Bass Approaches',
          bullets: [
            'PEDAL TONE — one note held steady (creates tension or calm)',
            'WALKING BASS — moves step by step (creates forward motion)',
            'ROOT & FIFTH — alternates between two strong notes (creates stability)'
          ]
        }
      ]
    }
  },
  {
    id: 'bass-demo',
    label: 'Bass Demo',
    description: 'DEMO: Show pedal tone, walking bass, root & fifth patterns.',
    type: 'demo',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Bass Demo',
      subtitle: 'Teacher demonstrates three bass patterns on the virtual keyboard',
      bullets: [
        'Watch the main screen — listen to each pattern',
        'Pedal Tone: one note, held underneath',
        'Walking Bass: C → D → E → F, step by step',
        'Root & Fifth: C → G → C → G, back and forth'
      ]
    }
  },
  {
    id: 'emotion-lab-intro',
    label: 'Emotion Lab Introduction',
    description: 'Explain: same melody through 6 instruments, rate the emotion.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Instrument Emotion Lab',
      subtitle: 'Same melody. Six instruments. Which one fits YOUR character?',
      bullets: [
        'You will hear the SAME melody played on 6 different instruments',
        'For each one, choose the EMOTION it creates',
        'Pay attention — instrument choice completely changes the feeling',
        'Think about which instrument fits the character you created in Lesson 1'
      ]
    }
  },
  {
    id: 'instrument-emotion-lab',
    label: '🎮 Unlock Instrument Emotion Lab',
    description: 'STUDENTS WORK: Listen to melody on each instrument, rate emotions.',
    bonusDescription: 'Bonus: Which instrument fits YOUR character?',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 7,
    presentationView: {
      type: 'summary',
      title: 'Instrument Emotion Lab',
      subtitle: 'Student Activity',
      bullets: [
        'Listen to each instrument carefully',
        'Choose the emotion that fits each sound',
        'Bonus: Think about which instrument best matches your character'
      ]
    }
  },
  {
    id: 'bass-builder-intro',
    label: 'Bass Builder Introduction',
    description: 'Show how to try different bass patterns underneath a melody.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Bass Builder',
      subtitle: 'Time to experiment with bass notes',
      bullets: [
        'Use keys A through K to play bass notes (C through C, one octave lower)',
        'Try all THREE patterns before recording your own: Pedal, Walking, Root & Fifth',
        'When you are ready, hit RECORD and play your bassline',
        'You can always re-record if you want to try again'
      ]
    }
  },
  {
    id: 'bass-builder',
    label: '🎮 Unlock Bass Builder',
    description: 'STUDENTS WORK: Try bass patterns, record your own bassline.',
    bonusDescription: 'Bonus: Try all three patterns before recording!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 6,
    presentationView: {
      type: 'summary',
      title: 'Bass Builder',
      subtitle: 'Student Activity',
      bullets: [
        'Try each bass pattern first — then record your own',
        'Bonus: Try all three patterns before making your final recording!'
      ]
    }
  },
  {
    id: 'composition-instructions',
    label: 'Composition Requirements',
    description: 'Add a bassline underneath your Theme A using the virtual instrument.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Composition Time',
      subtitle: 'Add a bassline to your score',
      sections: [
        {
          heading: 'Requirements',
          bullets: [
            'Open the Film Music DAW',
            'Use the Virtual Instrument to record bass notes on the BASS track',
            'Your bassline should support your Theme A — not compete with it',
            'Try switching the instrument sound for your melody too!'
          ]
        },
        {
          heading: 'Remember',
          bullets: [
            'Bass = low and slow. Less is more.',
            'Leave space — not every beat needs a bass note',
            'Your composition saves automatically'
          ]
        }
      ]
    }
  },
  {
    id: 'composition',
    label: '🎬 Unlock Composition',
    description: 'STUDENTS WORK: Open DAW, add bassline underneath Theme A.',
    bonusDescription: 'Bonus: Try switching instruments for your melody!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 9,
    presentationView: {
      type: 'composition-workspace',
      title: 'Film Music Composition',
      instruction: 'Add a bassline underneath your Theme A using the virtual instrument.',
      bonusTip: 'Try switching instruments for your melody!'
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
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Reflection',
      subtitle: 'Two Stars and a Wish',
      bullets: [
        'Share TWO things that went well with your composition',
        'Share ONE thing you want to improve next time',
        'Bonus: Share your reflection with a partner'
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'show-agenda': 'summary',
    'hook-scene': 'demo',
    'timbre-emotion': 'summary',
    'bass-intro': 'summary',
    'bass-demo': 'demo',
    'emotion-lab-intro': 'summary',
    'instrument-emotion-lab': 'instrument-emotion-lab',
    'bass-builder-intro': 'summary',
    'bass-builder': 'bass-builder',
    'composition-instructions': 'summary',
    'composition': 'film-music-daw',
    'reflection': 'two-stars-wish'
  };
  return stageMap[stage];
};
