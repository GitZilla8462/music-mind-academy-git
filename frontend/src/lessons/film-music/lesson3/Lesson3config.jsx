// File: /lessons/film-music/lesson3/Lesson3config.jsx
// Film Music Lesson 3: WHEN Does Music Speak? - Spotting & Silence
// Students learn that silence is a compositional choice
//
// ========================================
// LESSON OVERVIEW
// ========================================
// Essential Understanding: Silence is not absence — it's a deliberate choice
// Film Skill: Spotting (deciding where music goes)
// Music Skill: Using silence and SFX purposefully
// Standards: MU:Cr2.1.5a, MU:Re7.2.5a, MU:Cn11.0.8a

export const LESSON_PROGRESS_KEY = 'fm-lesson3-progress';
export const LESSON_TIMER_KEY = 'fm-lesson3-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook → Learn',
    color: 'orange',
    estimatedTime: 9,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'WHEN Does Music Speak?',
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
        id: 'hook-comparison',
        type: 'demo',
        label: 'Hook: Music vs. Silence',
        description: 'DEMO: Same scene — with music vs. without. "Which hit harder?"',
        duration: 3
      },
      {
        id: 'spotting-definition',
        type: 'summary',
        label: 'What is Spotting?',
        description: 'Spotting = deciding where music enters and exits. Diegetic vs. non-diegetic.',
        duration: 2
      },
      {
        id: 'sfx-types',
        type: 'summary',
        label: 'Types of SFX',
        description: 'Four types: ambient, impact, tension, transition. Brief examples.',
        duration: 2
      }
    ]
  },
  {
    id: 'silence-study',
    title: '2. Silence Study',
    subtitle: 'Compare & Analyze',
    color: 'orange',
    estimatedTime: 8,
    stages: [
      {
        id: 'silence-study-intro',
        type: 'summary',
        label: 'Silence Study Introduction',
        description: 'Explain: compare wall-to-wall music vs. strategic silence.',
        duration: 1
      },
      {
        id: 'silence-study',
        type: 'activity',
        label: '🎮 Unlock Silence Study',
        duration: 7,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Compare scenes, decide where silence is more powerful.',
        bonusDescription: 'Bonus: Can you think of a movie where silence was powerful?'
      }
    ]
  },
  {
    id: 'spotting-session',
    title: '3. Spotting Session',
    subtitle: 'Mark IN/OUT Points',
    color: 'orange',
    estimatedTime: 9,
    stages: [
      {
        id: 'spotting-intro',
        type: 'summary',
        label: 'Spotting Session Introduction',
        description: 'Explain: mark where music enters and exits on a scene timeline.',
        duration: 1
      },
      {
        id: 'spotting-session',
        type: 'activity',
        label: '🎮 Unlock Spotting Session',
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Mark IN/OUT points and explain why.',
        bonusDescription: 'Bonus: Add reasoning for each spotting decision!'
      }
    ]
  },
  {
    id: 'compose',
    title: '4. Compose',
    subtitle: 'Add Silence & SFX',
    color: 'orange',
    estimatedTime: 10,
    stages: [
      {
        id: 'composition-instructions',
        type: 'summary',
        label: 'Composition Requirements',
        description: 'Adjust Theme A + Bass placement, add silence and SFX to your score.',
        duration: 1
      },
      {
        id: 'composition',
        type: 'activity',
        label: '🎬 Unlock Composition',
        duration: 9,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Adjust timing, add intentional silence and SFX.',
        bonusDescription: 'Bonus: Try removing music from one section entirely!'
      }
    ]
  },
  {
    id: 'reflect',
    title: '5. Reflect',
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
        bonusDescription: 'Bonus: Explain where you used silence and WHY.'
      }
    ]
  }
];

export const fmLesson3Config = {
  id: 'fm-lesson3',
  lessonPath: '/lessons/film-music/lesson3',
  title: "WHEN Does Music Speak?",
  subtitle: "Spotting & Silence",
  unitTitle: "Film Music: Scoring the Story",
  learningObjectives: [
    "Understand spotting: deciding where music enters and exits.",
    "Identify diegetic vs. non-diegetic sound.",
    "Use intentional silence and sound effects purposefully."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "silence-study",
      title: "Silence Study",
      estimatedTime: "7 min"
    },
    {
      id: 2,
      type: "spotting-session",
      title: "Spotting Session",
      estimatedTime: "8 min"
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
    label: 'WHEN Does Music Speak?',
    description: 'Introduce the lesson and essential question.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'WHEN Does Music Speak?',
      subtitle: 'Spotting & Silence',
      bullets: [
        'Essential Question: When should music talk, and when should it listen?',
        'So far you have Theme A (melody) and a bassline',
        'Today: you learn that SILENCE is one of the most powerful tools in film music',
        'You will decide exactly WHERE your music enters and exits'
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
            'Hook: Music vs. silence — which one hits harder?',
            'What is spotting? Deciding where music goes',
            'Sound effects: ambient, impact, tension, transition'
          ]
        },
        {
          heading: 'Create',
          bullets: [
            'Silence Study — compare wall-to-wall music vs. strategic silence',
            'Spotting Session — mark IN and OUT points on a scene',
            'Compose — adjust your score and add silence and SFX'
          ]
        }
      ]
    }
  },
  {
    id: 'hook-comparison',
    label: 'Hook: Music vs. Silence',
    description: 'DEMO: Same scene — with music vs. without. "Which hit harder?"',
    type: 'demo',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Music vs. Silence',
      subtitle: 'Same scene. Two versions. Which hits harder?',
      bullets: [
        'Version 1: Emotional music plays the ENTIRE time',
        'Version 2: Music plays... then STOPS. Just footsteps. Wind. A door closing.',
        'Which version made you FEEL more?',
        'Sometimes the most powerful moment in a film score is when the music DISAPPEARS'
      ]
    }
  },
  {
    id: 'spotting-definition',
    label: 'What is Spotting?',
    description: 'Spotting = deciding where music enters and exits. Diegetic vs. non-diegetic.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'What Is Spotting?',
      subtitle: 'The composer\'s most important decision',
      sections: [
        {
          heading: 'Spotting = Where Music Goes',
          bullets: [
            'Before writing a single note, film composers watch the film and MARK where music starts and stops',
            'Music IN = the moment the score begins playing',
            'Music OUT = the moment the score stops',
            'This process is called a SPOTTING SESSION'
          ]
        },
        {
          heading: 'Two Types of Sound',
          bullets: [
            'DIEGETIC — sounds that exist in the story (footsteps, dialogue, a radio playing)',
            'NON-DIEGETIC — sounds added for the audience (the film score, sound effects)',
            'Your score is non-diegetic — the characters cannot hear it, but the audience can'
          ]
        }
      ]
    }
  },
  {
    id: 'sfx-types',
    label: 'Types of SFX',
    description: 'Four types: ambient, impact, tension, transition. Brief examples.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Sound Effects (SFX)',
      subtitle: 'Four types every film composer uses',
      sections: [
        {
          heading: 'The Four Types',
          bullets: [
            'AMBIENT — background atmosphere (wind, rain, crowd noise, city hum)',
            'IMPACT — a single dramatic hit (door slam, thunder crack, explosion)',
            'TENSION — building suspense (rising tone, heartbeat, ticking clock)',
            'TRANSITION — moving between scenes (whoosh, reverse cymbal, fade)'
          ]
        },
        {
          heading: 'In Your Score',
          bullets: [
            'You can drag SFX from the library onto your timeline',
            'Place them at SPECIFIC moments for maximum impact',
            'A well-placed sound effect can be worth more than 30 seconds of music'
          ]
        }
      ]
    }
  },
  {
    id: 'silence-study-intro',
    label: 'Silence Study Introduction',
    description: 'Explain: compare wall-to-wall music vs. strategic silence.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Silence Study',
      subtitle: 'When is NO music the right choice?',
      bullets: [
        'You will compare THREE scenes — each with two versions',
        'Version A: music plays the whole time',
        'Version B: music uses strategic silence',
        'For each one, decide which version is MORE POWERFUL and why'
      ]
    }
  },
  {
    id: 'silence-study',
    label: '🎮 Unlock Silence Study',
    description: 'STUDENTS WORK: Compare scenes, decide where silence is more powerful.',
    bonusDescription: 'Bonus: Can you think of a movie where silence was powerful?',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 7,
    presentationView: {
      type: 'summary',
      title: 'Silence Study',
      subtitle: 'Student Activity',
      bullets: [
        'Compare each scene — wall-to-wall music vs. strategic silence',
        'Choose which version hits harder',
        'Bonus: Think of a movie where silence was the most powerful moment'
      ]
    }
  },
  {
    id: 'spotting-intro',
    label: 'Spotting Session Introduction',
    description: 'Explain: mark where music enters and exits on a scene timeline.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Spotting Session',
      subtitle: 'You are the composer. Where does the music go?',
      bullets: [
        'You will walk through a scene moment by moment',
        'For EACH moment, decide: Music IN, Music OUT, SFX, or Silence',
        'Explain WHY you made each choice',
        'There are no wrong answers — this is YOUR creative vision'
      ]
    }
  },
  {
    id: 'spotting-session',
    label: '🎮 Unlock Spotting Session',
    description: 'STUDENTS WORK: Mark IN/OUT points and explain why.',
    bonusDescription: 'Bonus: Add reasoning for each spotting decision!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'summary',
      title: 'Spotting Session',
      subtitle: 'Student Activity',
      bullets: [
        'Mark each moment: Music IN, Music OUT, SFX, or Silence',
        'Add a reason for each decision',
        'Bonus: Explain WHY you put silence in that specific spot'
      ]
    }
  },
  {
    id: 'composition-instructions',
    label: 'Composition Requirements',
    description: 'Adjust Theme A + Bass placement, add silence and SFX to your score.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Composition Time',
      subtitle: 'Add silence and SFX to your score',
      sections: [
        {
          heading: 'Requirements',
          bullets: [
            'Open your composition in the Film Music DAW',
            'Adjust WHERE your Theme A and bass sit in time',
            'Add at least ONE moment of intentional silence',
            'Add at least ONE sound effect from the SFX library'
          ]
        },
        {
          heading: 'Think Like a Composer',
          bullets: [
            'Where should the audience hold their breath? That is your silence.',
            'Where should they jump or feel impact? That is your SFX.',
            'Music does not need to play the whole time — the gaps are part of the score'
          ]
        }
      ]
    }
  },
  {
    id: 'composition',
    label: '🎬 Unlock Composition',
    description: 'STUDENTS WORK: Adjust timing, add intentional silence and SFX.',
    bonusDescription: 'Bonus: Try removing music from one section entirely!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 9,
    presentationView: {
      type: 'composition-workspace',
      title: 'Film Music Composition',
      instruction: 'Adjust your score timing, add intentional silence and SFX.',
      bonusTip: 'Try removing music from one section entirely!'
    }
  },
  {
    id: 'reflection',
    label: '🎮 Unlock Reflection',
    description: 'STUDENTS WORK: Complete Two Stars and a Wish.',
    bonusDescription: 'Bonus: Explain where you used silence and WHY.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Reflection',
      subtitle: 'Two Stars and a Wish',
      bullets: [
        'Share TWO things that went well with your spotting decisions',
        'Share ONE thing you want to improve in your score',
        'Bonus: Explain where you used silence and WHY it works there'
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'show-agenda': 'summary',
    'hook-comparison': 'demo',
    'spotting-definition': 'summary',
    'sfx-types': 'summary',
    'silence-study-intro': 'summary',
    'silence-study': 'silence-study',
    'spotting-intro': 'summary',
    'spotting-session': 'spotting-session',
    'composition-instructions': 'summary',
    'composition': 'film-music-daw',
    'reflection': 'two-stars-wish'
  };
  return stageMap[stage];
};
