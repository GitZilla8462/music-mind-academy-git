// File: /lessons/film-music/lesson4/Lesson4config.jsx
// Film Music Lesson 4: HOW Does Tension Build? - Harmony + Big Work Time
// Students learn tension techniques and begin their capstone film score
//
// ========================================
// LESSON OVERVIEW
// ========================================
// Essential Understanding: Music follows the story arc — tension and release
// Film Skill: Tension/release, story arc
// Music Skill: Chords, pads, harmonic layering
// Standards: MU:Cr1.1.8a, MU:Cr2.1.5a, MU:Re7.2.5a

export const LESSON_PROGRESS_KEY = 'fm-lesson4-progress';
export const LESSON_TIMER_KEY = 'fm-lesson4-timer';

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
        label: 'HOW Does Tension Build?',
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
        id: 'hook-jaws',
        type: 'demo',
        label: 'Hook: Jaws',
        description: 'DEMO: Two notes. Maximum dread. "How does music make us feel what\'s coming?"',
        duration: 3
      },
      {
        id: 'tension-techniques',
        type: 'summary',
        label: 'Tension Techniques',
        description: 'Drone, building layers, dissonance, accelerando.',
        duration: 3
      }
    ]
  },
  {
    id: 'chord-basics',
    title: '2. Chord Basics',
    subtitle: 'Major vs. Minor',
    color: 'orange',
    estimatedTime: 5,
    stages: [
      {
        id: 'chord-intro',
        type: 'summary',
        label: 'Chord Basics',
        description: 'A chord = 3+ notes together. Major vs. minor. Pads sustain chords.',
        duration: 3
      },
      {
        id: 'chord-demo',
        type: 'demo',
        label: 'Chord Demo',
        description: 'DEMO: Play major vs. minor chords. How does the feeling change?',
        duration: 2
      }
    ]
  },
  {
    id: 'tension-timeline',
    title: '3. Tension Timeline',
    subtitle: 'Graph the Tension',
    color: 'orange',
    estimatedTime: 9,
    stages: [
      {
        id: 'tension-timeline-intro',
        type: 'summary',
        label: 'Tension Timeline Introduction',
        description: 'Explain: graph the tension level over a suspense scene.',
        duration: 1
      },
      {
        id: 'tension-timeline',
        type: 'activity',
        label: '🎮 Unlock Tension Timeline',
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Graph tension level at each moment in a scene.',
        bonusDescription: 'Bonus: Notice when tension drops — that\'s release!'
      }
    ]
  },
  {
    id: 'harmony-lab',
    title: '4. Harmony Lab',
    subtitle: 'Try Chords Under Melody',
    color: 'orange',
    estimatedTime: 8,
    stages: [
      {
        id: 'harmony-lab-intro',
        type: 'summary',
        label: 'Harmony Lab Introduction',
        description: 'Explain: try different chords under the same melody.',
        duration: 1
      },
      {
        id: 'harmony-lab',
        type: 'activity',
        label: '🎮 Unlock Harmony Lab',
        duration: 7,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Listen to melody + chords, rate each one.',
        bonusDescription: 'Bonus: Pick the chord that fits your character\'s story!'
      }
    ]
  },
  {
    id: 'capstone',
    title: '5. Score Your Film',
    subtitle: 'Big Work Time',
    color: 'orange',
    estimatedTime: 12,
    stages: [
      {
        id: 'capstone-instructions',
        type: 'summary',
        label: 'Choose Your Film + Score It',
        description: 'Pick your short film. Apply Theme A, bass, silence, SFX, harmony.',
        duration: 2
      },
      {
        id: 'capstone-composition',
        type: 'activity',
        label: '🎬 Unlock Score Your Film',
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Pick film, build your complete score. Get a solid draft!',
        bonusDescription: 'Goal: solid draft by end of class!'
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
        bonusDescription: 'Bonus: Where is your tension? Where is your release?'
      }
    ]
  }
];

export const fmLesson4Config = {
  id: 'fm-lesson4',
  lessonPath: '/lessons/film-music/lesson4',
  title: "HOW Does Tension Build?",
  subtitle: "Tension & Harmony",
  unitTitle: "Film Music: Scoring the Story",
  learningObjectives: [
    "Understand tension techniques: drone, layers, dissonance, accelerando.",
    "Play chords (3+ notes together) and understand major vs minor.",
    "Add a harmonic pad with chord changes to create tension and release.",
    "Begin your capstone film score with all four layers."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "tension-timeline",
      title: "Tension Timeline",
      estimatedTime: "8 min"
    },
    {
      id: 2,
      type: "harmony-lab",
      title: "Harmony Lab",
      estimatedTime: "7 min"
    },
    {
      id: 3,
      type: "film-music-daw",
      title: "Score Your Film",
      estimatedTime: "10 min"
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
    label: 'HOW Does Tension Build?',
    description: 'Introduce the lesson and essential question.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'HOW Does Tension Build?',
      subtitle: 'Tension & Harmony',
      bullets: [
        'Essential Question: How does music follow the story arc?',
        'You have a melody, a bassline, and spotting decisions',
        'Today: you learn how composers BUILD and RELEASE tension using HARMONY',
        'Then you start scoring your actual film — this is the BIG WORK TIME'
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
            'Hook: Jaws — two notes, maximum dread',
            'Tension techniques: drone, layers, dissonance, accelerando',
            'Chord basics: major vs. minor, pads that sustain underneath'
          ]
        },
        {
          heading: 'Create',
          bullets: [
            'Tension Timeline — graph the tension arc of a scene',
            'Harmony Lab — try chords underneath your melody',
            'Score Your Film — choose your short film and BUILD YOUR SCORE'
          ]
        }
      ]
    }
  },
  {
    id: 'hook-jaws',
    label: 'Hook: Jaws',
    description: 'DEMO: Two notes. Maximum dread. "How does music make us feel what\'s coming?"',
    type: 'demo',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Jaws',
      subtitle: 'Two notes. Maximum dread.',
      bullets: [
        'Dun-dun... dun-dun... dun-dun dun-dun dun-dun',
        'You knew the shark was coming BEFORE you saw it',
        'John Williams used just TWO NOTES to create one of the most terrifying moments in film history',
        'How does music make us feel what is COMING before it arrives?'
      ]
    }
  },
  {
    id: 'tension-techniques',
    label: 'Tension Techniques',
    description: 'Drone, building layers, dissonance, accelerando.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Tension Techniques',
      subtitle: 'How composers build and release tension',
      sections: [
        {
          heading: 'Building Tension',
          bullets: [
            'DRONE — a single low note held for a long time (creates unease)',
            'BUILDING LAYERS — add one instrument at a time (tension rises)',
            'DISSONANCE — notes that clash on purpose (something feels WRONG)',
            'ACCELERANDO — getting faster and faster (the danger is approaching)'
          ]
        },
        {
          heading: 'Releasing Tension',
          bullets: [
            'CONSONANCE — notes that resolve and feel right (relief)',
            'SILENCE — sudden stop after buildup (the shock of nothing)',
            'SIMPLIFY — remove layers, slow down, return to calm'
          ]
        }
      ]
    }
  },
  {
    id: 'chord-intro',
    label: 'Chord Basics',
    description: 'A chord = 3+ notes together. Major vs. minor. Pads sustain chords.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Chord Basics',
      subtitle: 'Three notes played together = a chord',
      sections: [
        {
          heading: 'What Is a Chord?',
          bullets: [
            'A CHORD is 3 or more notes played at the same time',
            'Chords create HARMONY — the background color of your music',
            'A PAD is a sustained chord that sits underneath a melody'
          ]
        },
        {
          heading: 'Major vs. Minor',
          bullets: [
            'MAJOR chords feel bright, happy, resolved — the hero wins',
            'MINOR chords feel dark, sad, uneasy — something is wrong',
            'Film composers switch between them to control how the audience FEELS',
            'Same melody + major chord = hope. Same melody + minor chord = fear.'
          ]
        }
      ]
    }
  },
  {
    id: 'chord-demo',
    label: 'Chord Demo',
    description: 'DEMO: Play major vs. minor chords. How does the feeling change?',
    type: 'demo',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Chord Demo',
      subtitle: 'Teacher demonstrates major and minor chords',
      bullets: [
        'Watch the main screen — listen to each chord',
        'C Major (C + E + G) — bright, resolved, safe',
        'A Minor (A + C + E) — dark, uncertain, emotional',
        'Notice how the SAME melody sounds completely different over each chord'
      ]
    }
  },
  {
    id: 'tension-timeline-intro',
    label: 'Tension Timeline Introduction',
    description: 'Explain: graph the tension level over a suspense scene.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Tension Timeline',
      subtitle: 'Map the tension arc of a scene',
      bullets: [
        'You will walk through a suspense scene moment by moment',
        'For EACH moment, rate the tension level from 0 (calm) to 5 (maximum)',
        'Watch how tension RISES and FALLS like a wave',
        'Your score should follow this arc — build when tension builds, release when it releases'
      ]
    }
  },
  {
    id: 'tension-timeline',
    label: '🎮 Unlock Tension Timeline',
    description: 'STUDENTS WORK: Graph tension level at each moment in a scene.',
    bonusDescription: 'Bonus: Notice when tension drops — that\'s release!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'summary',
      title: 'Tension Timeline',
      subtitle: 'Student Activity',
      bullets: [
        'Rate the tension level at each moment in the scene',
        'Watch your tension arc take shape',
        'Bonus: Notice where tension DROPS — that is the release'
      ]
    }
  },
  {
    id: 'harmony-lab-intro',
    label: 'Harmony Lab Introduction',
    description: 'Explain: try different chords under the same melody.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Harmony Lab',
      subtitle: 'Same melody. Different chords. Which fits your story?',
      bullets: [
        'You will hear a melody played over 6 different chords',
        'Some are MAJOR (bright, resolved) and some are MINOR (dark, tense)',
        'Rate each one: does it fit a character\'s story or not?',
        'At the end, PICK YOUR FAVORITE — this is the harmony for your score'
      ]
    }
  },
  {
    id: 'harmony-lab',
    label: '🎮 Unlock Harmony Lab',
    description: 'STUDENTS WORK: Listen to melody + chords, rate each one.',
    bonusDescription: 'Bonus: Pick the chord that fits your character\'s story!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 7,
    presentationView: {
      type: 'summary',
      title: 'Harmony Lab',
      subtitle: 'Student Activity',
      bullets: [
        'Listen to each chord underneath the melody',
        'Rate it: fits or does not fit your character',
        'Pick your favorite chord at the end'
      ]
    }
  },
  {
    id: 'capstone-instructions',
    label: 'Choose Your Film + Score It',
    description: 'Pick your short film. Apply Theme A, bass, silence, SFX, harmony.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Score Your Film',
      subtitle: 'This is the big work time — bring it all together',
      sections: [
        {
          heading: 'Choose Your Film',
          bullets: [
            'Browse the film library and pick a short film that fits YOUR character',
            'Adventure, Drama, Nature, Comedy, Mystery — find the right mood',
            'You can change films later without losing your work'
          ]
        },
        {
          heading: 'Build Your Score',
          bullets: [
            'Theme A (Melody) — your character\'s identity from Lesson 1',
            'Bass — the foundation from Lesson 2',
            'Silence & SFX — the spotting decisions from Lesson 3',
            'Harmony — the chords and pads from today',
            'GOAL: Get a solid draft by end of class!'
          ]
        }
      ]
    }
  },
  {
    id: 'capstone-composition',
    label: '🎬 Unlock Score Your Film',
    description: 'STUDENTS WORK: Pick film, build your complete score. Get a solid draft!',
    bonusDescription: 'Goal: solid draft by end of class!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'composition-workspace',
      title: 'Score Your Film',
      instruction: 'Choose your film and apply all four layers: motif, bass, silence/SFX, and harmony.',
      bonusTip: 'Goal: solid draft by end of class!'
    }
  },
  {
    id: 'reflection',
    label: '🎮 Unlock Reflection',
    description: 'STUDENTS WORK: Complete Two Stars and a Wish.',
    bonusDescription: 'Bonus: Where is your tension? Where is your release?',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Reflection',
      subtitle: 'Two Stars and a Wish',
      bullets: [
        'Share TWO things that went well with your score so far',
        'Share ONE thing you want to refine next class',
        'Bonus: Where is your tension peak? Where is your release?'
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'show-agenda': 'summary',
    'hook-jaws': 'demo',
    'tension-techniques': 'summary',
    'chord-intro': 'summary',
    'chord-demo': 'demo',
    'tension-timeline-intro': 'summary',
    'tension-timeline': 'tension-timeline',
    'harmony-lab-intro': 'summary',
    'harmony-lab': 'harmony-lab',
    'capstone-instructions': 'summary',
    'capstone-composition': 'film-music-daw',
    'reflection': 'two-stars-wish'
  };
  return stageMap[stage];
};
