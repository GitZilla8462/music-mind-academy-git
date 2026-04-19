// File: /lessons/film-music/lesson5/Lesson5config.jsx
// Film Music Lesson 5: Finish + Viewing Party
// Students complete their capstone score, write composer's notes, and showcase
//
// ========================================
// LESSON OVERVIEW
// ========================================
// Essential Understanding: How do all the elements serve the story?
// Film Skill: Complete scoring
// Music Skill: Integrating motif, bass, silence, SFX, and harmony
// Standards: MU:Cr3.1.5a, MU:Re7.2.5a, MU:Pr4.2.5a

export const LESSON_PROGRESS_KEY = 'fm-lesson5-progress';
export const LESSON_TIMER_KEY = 'fm-lesson5-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'finish',
    title: '1. Finish Your Score',
    subtitle: 'Work Time',
    color: 'orange',
    estimatedTime: 15,
    stages: [
      {
        id: 'finish-intro',
        type: 'summary',
        label: 'Finish Your Score',
        description: 'Remind students of the goal: polish and refine their film score.',
        duration: 2
      },
      {
        id: 'finish-work',
        type: 'activity',
        label: '🎬 Work Time: Film Music DAW',
        duration: 13,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Refine timing, hit points, volume balance.',
        bonusDescription: 'Bonus: Try re-recording a section to improve it!'
      }
    ]
  },
  {
    id: 'composers-notes',
    title: "2. Composer's Notes",
    subtitle: 'Written Reflection',
    color: 'orange',
    estimatedTime: 5,
    stages: [
      {
        id: 'composers-notes-intro',
        type: 'summary',
        label: "Composer's Notes Introduction",
        description: 'Explain the reflection: 3+ creative choices.',
        duration: 1
      },
      {
        id: 'composers-notes',
        type: 'activity',
        label: "📝 Composer's Notes",
        duration: 4,
        hasTimer: true,
        trackProgress: true,
        description: "STUDENTS WORK: Write about their creative choices.",
        bonusDescription: 'Bonus: Explain why your motif represents your character!'
      }
    ]
  },
  {
    id: 'viewing-party',
    title: '3. Viewing Party',
    subtitle: 'Class Showcase',
    color: 'orange',
    estimatedTime: 15,
    stages: [
      {
        id: 'viewing-intro',
        type: 'summary',
        label: 'Viewing Party Rules',
        description: 'Set expectations: no commentary during, applause after each one.',
        duration: 1
      },
      {
        id: 'viewing-party',
        type: 'activity',
        label: '🎬 Viewing Party',
        duration: 14,
        hasTimer: false,
        trackProgress: false,
        description: 'TEACHER-LED: Play each student\'s scored film for the class.'
      }
    ]
  },
  {
    id: 'debrief',
    title: '4. Class Debrief',
    subtitle: 'Discussion',
    color: 'orange',
    estimatedTime: 5,
    stages: [
      {
        id: 'class-debrief',
        type: 'discussion',
        label: 'Class Debrief',
        description: 'Discuss: what stood out? Whose silence hit hardest? Most recognizable motif?',
        duration: 5
      }
    ]
  }
];

export const fmLesson5Config = {
  id: 'fm-lesson5',
  lessonPath: '/lessons/film-music/lesson5',
  title: "Finish + Viewing Party",
  subtitle: "Complete Score & Showcase",
  unitTitle: "Film Music: Scoring the Story",
  learningObjectives: [
    "Refine and polish your complete film score.",
    "Reflect on creative choices through Composer's Notes.",
    "Experience your film score as an audience member."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "film-music-daw",
      title: "Film Music DAW",
      estimatedTime: "13 min"
    },
    {
      id: 2,
      type: "composers-notes",
      title: "Composer's Notes",
      estimatedTime: "4 min"
    },
    {
      id: 3,
      type: "viewing-party",
      title: "Viewing Party",
      estimatedTime: "14 min"
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
    id: 'finish-intro',
    label: 'Finish Your Score',
    description: 'Remind students of the goal: polish and refine their film score.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson5/slides/1.svg'
    }
  },
  {
    id: 'finish-work',
    label: '🎬 Work Time: Film Music DAW',
    description: 'STUDENTS WORK: Refine timing, hit points, volume balance.',
    bonusDescription: 'Bonus: Try re-recording a section to improve it!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 13,
    presentationView: {
      type: 'composition-workspace',
      title: 'Film Music Composition',
      instruction: 'Score your film using the virtual instrument, loops, and sound effects.',
      bonusTip: 'Bonus: Try re-recording a section to improve it!'
    }
  },
  {
    id: 'composers-notes-intro',
    label: "Composer's Notes Introduction",
    description: 'Explain the reflection: 3+ creative choices.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson5/slides/3.svg'
    }
  },
  {
    id: 'composers-notes',
    label: "📝 Composer's Notes",
    description: "STUDENTS WORK: Write about their creative choices.",
    bonusDescription: 'Bonus: Explain why your motif represents your character!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 4,
    presentationView: {
      type: 'activity-slide',
      slidePath: '/lessons/film-music/lesson5/slides/4.svg'
    }
  },
  {
    id: 'viewing-intro',
    label: 'Viewing Party Rules',
    description: 'Set expectations: no commentary during, applause after each one.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson5/slides/5.svg'
    }
  },
  {
    id: 'viewing-party',
    label: '🎬 Viewing Party',
    description: "TEACHER-LED: Play each student's scored film for the class.",
    type: 'activity',
    hasTimer: false,
    duration: 14,
    presentationView: {
      type: 'viewing-party-teacher',
    }
  },
  {
    id: 'class-debrief',
    label: 'Class Debrief',
    description: 'Discuss: what stood out? Whose silence hit hardest? Most recognizable motif?',
    type: 'discussion',
    duration: 5,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson5/slides/6.svg'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'finish-intro': 'summary',
    'finish-work': 'film-music-daw',
    'composers-notes-intro': 'summary',
    'composers-notes': 'composers-notes',
    'viewing-intro': 'summary',
    'viewing-party': 'viewing-party',
    'class-debrief': 'discussion'
  };
  return stageMap[stage];
};
