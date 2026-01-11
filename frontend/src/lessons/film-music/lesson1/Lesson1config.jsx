// File: /lessons/film-music/lesson1/Lesson1config.jsx
// Film Music Lesson 1: WHO Is In The Story? - Leitmotif & Melody
// Students learn how composers create character identity through melody
//
// ========================================
// LESSON OVERVIEW
// ========================================
// Essential Understanding: Music gives characters identity — before we see them, we can hear them
// Film Skill: Leitmotif
// Music Skill: Creating a melody/motif using keyboard
// Standards: MU:Cr1.1.8a, MU:Cn11.0.8a

export const LESSON_PROGRESS_KEY = 'fm-lesson1-progress';
export const LESSON_TIMER_KEY = 'fm-lesson1-timer';

// ========================================
// CHARACTER TYPES FOR LEITMOTIF DETECTIVE
// ========================================
export const CHARACTER_TYPES = [
  {
    id: 'hero',
    name: 'Hero',
    description: 'Brave, powerful, triumphant',
    color: '#EF4444', // red
    characteristics: 'Rising melody, major key, brass/strings'
  },
  {
    id: 'villain',
    name: 'Villain',
    description: 'Dark, menacing, dangerous',
    color: '#7C3AED', // purple
    characteristics: 'Low register, minor key, dissonance'
  },
  {
    id: 'love-interest',
    name: 'Love Interest',
    description: 'Romantic, tender, emotional',
    color: '#EC4899', // pink
    characteristics: 'Lyrical melody, soft dynamics, strings'
  },
  {
    id: 'comic-relief',
    name: 'Comic Relief',
    description: 'Playful, silly, lighthearted',
    color: '#F59E0B', // amber
    characteristics: 'Quirky rhythm, staccato, woodwinds'
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    description: 'Unknown, intriguing, enigmatic',
    color: '#3B82F6', // blue
    characteristics: 'Ambiguous harmony, sparse, atmospheric'
  },
  {
    id: 'innocent',
    name: 'Innocent',
    description: 'Pure, childlike, gentle',
    color: '#10B981', // green
    characteristics: 'Simple melody, high register, music box/celesta'
  }
];

// ========================================
// KEYBOARD MAPPING
// ========================================
export const KEYBOARD_MAPPING = {
  // Computer keyboard keys mapped to notes
  'a': { note: 'C4', label: 'C', color: 'white' },
  's': { note: 'D4', label: 'D', color: 'white' },
  'd': { note: 'E4', label: 'E', color: 'white' },
  'f': { note: 'F4', label: 'F', color: 'white' },
  'g': { note: 'G4', label: 'G', color: 'white' },
  'h': { note: 'A4', label: 'A', color: 'white' },
  'j': { note: 'B4', label: 'B', color: 'white' },
  'k': { note: 'C5', label: 'C', color: 'white' },
  // Black keys
  'w': { note: 'C#4', label: 'C#', color: 'black' },
  'e': { note: 'D#4', label: 'D#', color: 'black' },
  't': { note: 'F#4', label: 'F#', color: 'black' },
  'y': { note: 'G#4', label: 'G#', color: 'black' },
  'u': { note: 'A#4', label: 'A#', color: 'black' }
};

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook → Learn',
    color: 'orange',
    estimatedTime: 10,
    stages: [
      {
        id: 'welcome-intro',
        type: 'summary',
        label: 'WHO Is In The Story?',
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
        id: 'hook-audio',
        type: 'demo',
        label: 'Hook: Darth Vader',
        description: 'DEMO: Play Darth Vader breathing... then Imperial March.',
        duration: 3
      },
      {
        id: 'leitmotif-definition',
        type: 'summary',
        label: 'What is a Leitmotif?',
        description: 'Define leitmotif and its role in film music.',
        duration: 3
      },
      {
        id: 'famous-leitmotifs',
        type: 'summary',
        label: 'Famous Leitmotifs',
        description: 'Show examples from Star Wars, Harry Potter, Jaws.',
        duration: 2
      }
    ]
  },
  {
    id: 'keyboard-basics',
    title: '2. Keyboard Basics',
    subtitle: 'Learn to Play',
    color: 'orange',
    estimatedTime: 5,
    stages: [
      {
        id: 'keyboard-intro',
        type: 'summary',
        label: 'Keyboard Introduction',
        description: 'Explain the computer keyboard to note mapping.',
        duration: 1
      },
      {
        id: 'keyboard-tutorial',
        type: 'activity',
        label: '🎹 Keyboard Practice',
        duration: 4,
        hasTimer: false,
        trackProgress: true,
        description: 'STUDENTS WORK: Practice playing notes with the keyboard.',
        bonusDescription: 'Bonus: Try playing a simple pattern!'
      }
    ]
  },
  {
    id: 'practice',
    title: '3. Practice',
    subtitle: 'Leitmotif Detective',
    color: 'orange',
    estimatedTime: 10,
    stages: [
      {
        id: 'detective-intro',
        type: 'summary',
        label: 'Detective Introduction',
        description: 'Explain the Leitmotif Detective game rules.',
        duration: 1
      },
      {
        id: 'leitmotif-detective',
        type: 'activity',
        label: '🎮 Unlock Leitmotif Detective',
        duration: 9,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Listen to themes, identify character types.',
        bonusDescription: 'Bonus: Explain WHY you chose that character type!'
      }
    ]
  },
  {
    id: 'create',
    title: '4. Create',
    subtitle: 'Build Your Motif',
    color: 'orange',
    estimatedTime: 12,
    stages: [
      {
        id: 'motif-builder-intro',
        type: 'summary',
        label: 'Motif Builder Introduction',
        description: 'Show how to create a simple motif using steps, skips, and repeats.',
        duration: 2
      },
      {
        id: 'motif-builder',
        type: 'activity',
        label: '🎮 Unlock Motif Builder',
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Create a 4-8 note character theme.',
        bonusDescription: 'Bonus: Add rhythm variation to your motif!'
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
        bonusDescription: 'Bonus: Share your reflection with a partner.'
      }
    ]
  }
];

export const fmLesson1Config = {
  id: 'fm-lesson1',
  lessonPath: '/lessons/film-music/lesson1',
  title: "WHO Is In The Story?",
  subtitle: "Leitmotif & Melody",
  unitTitle: "Film Music: Scoring the Story",
  learningObjectives: [
    "Understand what a leitmotif is and how it identifies characters.",
    "Play melodies using the computer keyboard.",
    "Create a 4-8 note character theme (Theme A) for a video clip."
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "keyboard-tutorial",
      title: "Keyboard Practice",
      estimatedTime: "4 min"
    },
    {
      id: 2,
      type: "leitmotif-detective",
      title: "Leitmotif Detective",
      estimatedTime: "9 min"
    },
    {
      id: 3,
      type: "motif-builder",
      title: "Motif Builder",
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
    label: 'WHO Is In The Story?',
    description: 'Introduce the lesson and essential question.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/1.svg'
    }
  },
  {
    id: 'show-agenda',
    label: 'Agenda',
    description: 'Review the lesson agenda.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/2.svg'
    }
  },
  {
    id: 'hook-audio',
    label: 'Hook: Darth Vader',
    description: 'DEMO: Play Darth Vader breathing... then Imperial March.',
    type: 'demo',
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/3.svg'
    }
  },
  {
    id: 'leitmotif-definition',
    label: 'What is a Leitmotif?',
    description: 'Define leitmotif and its role in film music.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/4.svg'
    }
  },
  {
    id: 'famous-leitmotifs',
    label: 'Famous Leitmotifs',
    description: 'Show examples from Star Wars, Harry Potter, Jaws.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/5.svg'
    }
  },
  {
    id: 'keyboard-intro',
    label: 'Keyboard Introduction',
    description: 'Explain the computer keyboard to note mapping.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/6.svg'
    }
  },
  {
    id: 'keyboard-tutorial',
    label: '🎹 Keyboard Practice',
    description: 'STUDENTS WORK: Practice playing notes with the keyboard.',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 4,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/7.svg'
    }
  },
  {
    id: 'detective-intro',
    label: 'Detective Introduction',
    description: 'Explain the Leitmotif Detective game rules.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/8.svg'
    }
  },
  {
    id: 'leitmotif-detective',
    label: '🎮 Unlock Leitmotif Detective',
    description: 'STUDENTS WORK: Listen to themes, identify character types.',
    bonusDescription: 'Bonus: Explain WHY you chose that character type!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 9,
    presentationView: {
      type: 'leitmotif-detective-teacher',
      slidePath: '/lessons/film-music/lesson1/slides/9.svg'
    }
  },
  {
    id: 'motif-builder-intro',
    label: 'Motif Builder Introduction',
    description: 'Show how to create a simple motif using steps, skips, and repeats.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/10.svg'
    }
  },
  {
    id: 'motif-builder',
    label: '🎮 Unlock Motif Builder',
    description: 'STUDENTS WORK: Create a 4-8 note character theme.',
    bonusDescription: 'Bonus: Add rhythm variation to your motif!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/11.svg'
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
      type: 'slide',
      slidePath: '/lessons/film-music/lesson1/slides/12.svg'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-intro': 'summary',
    'show-agenda': 'summary',
    'hook-audio': 'demo',
    'leitmotif-definition': 'summary',
    'famous-leitmotifs': 'summary',
    'keyboard-intro': 'summary',
    'keyboard-tutorial': 'keyboard-tutorial',
    'detective-intro': 'summary',
    'leitmotif-detective': 'leitmotif-detective',
    'motif-builder-intro': 'summary',
    'motif-builder': 'motif-builder',
    'reflection': 'two-stars-wish'
  };
  return stageMap[stage];
};
