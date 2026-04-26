// File: /lessons/film-music/lesson3/Lesson3config.jsx
// Film Music Lesson 3: Plan Your Score (~40 minutes)
// Students choose a film, watch it, break it into scenes, and plan their music.
//
// ========================================
// LESSON OVERVIEW
// ========================================
// Essential Understanding: Real composers plan before they compose
// Film Skill: Spotting — deciding where music enters/exits
// Music Skill: Breaking a film into scenes and planning instrument/mood/character choices
// Standards: MU:Cr1.1.5a, MU:Cr2.1.5a, MU:Re7.2.5a, MU:Cn11.0.8a

export const LESSON_PROGRESS_KEY = 'fm-lesson3-progress';
export const LESSON_TIMER_KEY = 'fm-lesson3-timer';

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
        type: 'summary',
        label: 'Hook: Plan Before You Play',
        description: '"Real composers don\'t just start playing. They plan."',
        duration: 3
      },
      {
        id: 'spotting-concept',
        type: 'summary',
        label: 'What is Spotting?',
        description: 'Spotting = deciding where music enters and exits.',
        duration: 2
      }
    ]
  },
  {
    id: 'spotting-guide',
    title: '2. Spotting Guide',
    subtitle: 'Choose Film → Plan Scenes',
    color: 'orange',
    estimatedTime: 30,
    stages: [
      {
        id: 'spotting-guide',
        type: 'activity',
        label: '🎬 Spotting Guide',
        duration: 30,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Choose a film, watch it, add scene breaks, plan your music.',
      }
    ]
  },
  {
    id: 'share',
    title: '3. Share & Close',
    subtitle: 'Partner Share → Closing',
    color: 'orange',
    estimatedTime: 5,
    stages: [
      {
        id: 'partner-share',
        type: 'discussion',
        label: 'Partner Share',
        description: 'Compare your spotting guide with a partner. Same scenes? Same moods?',
        duration: 4
      },
      {
        id: 'closing',
        type: 'summary',
        label: 'Closing',
        description: 'Next class: you compose!',
        duration: 1
      }
    ]
  }
];

export const fmLesson3Config = {
  id: 'fm-lesson3',
  lessonPath: '/lessons/film-music/lesson3',
  title: "Plan Your Score",
  subtitle: "Choose a Film & Build Your Spotting Guide",
  unitTitle: "Film Music: Scoring the Story",
  learningObjectives: [
    "Understand spotting: deciding where music enters and exits.",
    "Break a film into scenes based on mood, action, and character changes.",
    "Plan instrument, mood, and character choices for each scene before composing."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "spotting-guide",
      title: "Spotting Guide",
      estimatedTime: "30 min"
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
    label: 'Hook: Plan Before You Play',
    description: '"Real composers don\'t just start playing. They plan."',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Real Composers Plan Before They Compose',
      sections: [
        {
          heading: '',
          bullets: [
            'Before writing a single note, film composers watch the scene dozens of times.',
            'They decide: Where does music start? Where does it stop?',
            'What characters need themes? What mood fits each moment?',
            'This process is called SPOTTING.'
          ]
        },
        {
          heading: 'Today:',
          bullets: [
            'You\'ll pick a film for your final project.',
            'Watch it. Break it into scenes.',
            'Plan your music — before you compose a single note.'
          ]
        }
      ]
    }
  },
  {
    id: 'spotting-concept',
    label: 'What is Spotting?',
    description: 'Spotting = deciding where music enters and exits.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Spotting',
      sections: [
        {
          heading: 'The Composer\'s First Job',
          bullets: [
            'SPOTTING = watching a film and deciding where music goes',
            'Not every moment needs music — sometimes silence is more powerful',
            'When the scene changes, your music plan should change too',
            'You already practiced this in Lesson 2 with two scenes!'
          ]
        },
        {
          heading: 'Your Spotting Guide',
          bullets: [
            'For each scene you\'ll decide:',
            '• What\'s happening?',
            '• What character type fits? What instrument?',
            '• What mood? Music or silence?',
            '• Any sound effects?'
          ]
        }
      ]
    }
  },
  {
    id: 'spotting-guide',
    label: '🎬 Spotting Guide',
    description: 'STUDENTS WORK: Choose a film, watch it, add scene breaks, plan your music.',
    type: 'activity',
    hasTimer: true,
    hasProgress: true,
    duration: 30,
    presentationView: {
      type: 'summary',
      title: 'Spotting Guide',
      sections: [
        {
          heading: 'Students Are Working',
          bullets: [
            'Choosing a film from the library',
            'Watching it and adding scene breaks',
            'Planning their music for each scene',
            'This saves for composing next class'
          ]
        }
      ]
    }
  },
  {
    id: 'partner-share',
    label: 'Partner Share',
    description: 'Compare your spotting guide with a partner.',
    type: 'discussion',
    duration: 4,
    presentationView: {
      type: 'summary',
      title: 'Compare Your Plans',
      sections: [
        {
          heading: 'With a partner:',
          bullets: [
            'Show your partner your scene breakdown',
            'Did you pick the same scene breaks? Different ones?',
            'Compare: same moods? Same instruments?',
            'What\'s the biggest difference between your plans?'
          ]
        },
        {
          heading: '',
          bullets: [
            '"There\'s no wrong answer — different plans make different scores."'
          ]
        }
      ]
    }
  },
  {
    id: 'closing',
    label: 'Closing',
    description: 'Next class: you compose!',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'You Have a Plan',
      sections: [
        {
          heading: 'Today you:',
          bullets: [
            'Picked a film for your final project',
            'Broke it into scenes — just like a real composer',
            'Planned your instruments, moods, and spotting decisions'
          ]
        },
        {
          heading: 'Next Class',
          bullets: [
            'You compose. Your spotting guide will be your roadmap.'
          ]
        }
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'hook': 'summary',
    'spotting-concept': 'summary',
    'spotting-guide': 'spotting-guide',
    'partner-share': 'discussion',
    'closing': 'summary'
  };
  return stageMap[stage];
};
