// File: /src/lessons/film-music-project/lesson2/Lesson2config.jsx
// Lesson 2: City Soundscapes - Configuration
// Music concept: Texture and Layering
// ✅ UPDATED: Numbered sections, teacher-friendly descriptions based on actual slides

export const LESSON_PROGRESS_KEY = 'lesson2-progress';
export const LESSON_TIMER_KEY = 'lesson2-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Slides → Texture Concept',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'city-soundscapes-intro',
        type: 'summary',
        label: 'City Soundscapes',
        description: 'Ask: "What city have you visited? How would it feel there?"'
      },
      {
        id: 'show-agenda',
        type: 'summary',
        label: 'Agenda',
        description: 'Review: "1) Learn texture & layering, 2) Create City Soundscape"'
      },
      {
        id: 'introduce-texture',
        type: 'summary',
        label: 'Texture',
        description: 'Explain: "Texture = thick/thin sound based on # of layers"'
      },
      {
        id: 'texture-continued',
        type: 'summary',
        label: 'Sandwich Analogy',
        description: 'Analogy: "1 ingredient = thin, many ingredients = full"'
      },
      {
        id: 'layers-and-texture',
        type: 'summary',
        label: 'Making Layers',
        description: 'Explain: "1 layer = thin, 2-3 = medium, 4+ = full texture"'
      }
    ]
  },
  {
    id: 'layer-detective-section',
    title: '2. Layer Detective',
    subtitle: 'Class Game',
    color: 'orange',
    estimatedTime: 5,
    stages: [
      {
        id: 'layer-detective-intro',
        type: 'summary',
        label: 'Layer Detective Intro',
        description: 'Announce: "Now we will play a class game about layers!"'
      },
      {
        id: 'layer-detective',
        type: 'activity',
        label: '🎮 Layer Detective',
        duration: 5,
        hasTimer: false,
        trackProgress: true,
        description: 'STUDENTS PLAY: Count layers, choose A/B/C, earn points',
        bonusDescription: 'Faster answers = more points!'
      },
      {
        id: 'layer-detective-results',
        type: 'summary',
        label: '🏆 Results',
        description: 'Show leaderboard and celebrate top scorers'
      }
    ]
  },
  {
    id: 'activity2',
    title: '3. City Soundscape Composition',
    subtitle: 'Slides → Compose',
    color: 'blue',
    estimatedTime: 12,
    stages: [
      { 
        id: 'composition-instructions', 
        type: 'summary', 
        label: 'Composition Instructions',
        description: 'Instructions: "Select city, watch silent video, think about mood"',
        duration: 1
      },
      { 
        id: 'composition-instructions-continued', 
        type: 'summary', 
        label: 'Composition Requirements',
        description: 'Review: "5+ loops, line up edges, same mood. Bonus: sound effects"',
        duration: 1
      },
      { 
        id: 'city-composition', 
        type: 'activity', 
        label: '🎮 Unlock Composition', 
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Pick city video, compose soundscape music',
        bonusDescription: 'Bonus: Add more layers and sound effects'
      }
    ]
  },
  {
    id: 'reflection',
    title: '4. Reflection and Discussion',
    subtitle: 'Reflect → Discuss',
    color: 'blue',
    estimatedTime: 6,
    stages: [
      {
        id: 'reflection-instructions',
        type: 'summary',
        label: 'Reflection Time',
        description: 'Introduce the reflection activity.',
        duration: 1
      },
      {
        id: 'reflection',
        type: 'activity',
        label: '🎮 Unlock Reflection',
        duration: 3,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: 2 things well + 1 to improve, fill out form',
        bonusDescription: 'Bonus: Loop Lab Partner Game with a partner'
      },
      {
        id: 'conclusion',
        type: 'discussion',
        label: 'Class Discussion',
        description: 'Ask: "What is texture? Partner\'s city? What did you like?"',
        duration: 2
      }
    ]
  },
  {
    id: 'bonus-robot-melody',
    title: '⭐ Bonus: Robot Melody Maker',
    subtitle: 'Create & Customize',
    color: 'purple',
    estimatedTime: 10,
    isBonus: true,
    stages: [
      {
        id: 'bonus-intro',
        type: 'summary',
        label: 'Introduce Robot Melody Maker',
        description: 'Announce: "Create loops and customize your robot!"',
        duration: 1
      },
      {
        id: 'robot-melody-maker',
        type: 'activity',
        label: '🎮 Unlock Robot Melody Maker',
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Create loops and customize their robot',
        bonusDescription: 'Make your robot dance!'
      }
    ]
  }
];

export const lesson2Config = {
  id: 'lesson2',
  lessonPath: '/lessons/film-music-project/lesson2',
  title: "City Soundscapes",
  subtitle: "Texture and Layering in Music",
  learningObjectives: [
    "Understand texture as the thickness or thinness of sound",
    "Identify the number of layers in musical compositions",
    "Describe musical elements using appropriate vocabulary",
    "Create city soundscapes using multiple musical layers"
  ],
  lessonSections,
  activities: [
    {
      id: 0,
      type: "layer-detective",
      title: "Layer Detective",
      estimatedTime: "5 min"
    },
    {
      id: 1,
      type: "city-composition-activity",
      title: "Compose Your City Soundscape",
      estimatedTime: "10 min",
      includesVideoSelection: true
    },
    {
      id: 2,
      type: "two-stars-wish",
      title: "Reflection Activity",
      estimatedTime: "3 min"
    },
    {
      id: 3,
      type: "robot-melody-maker",
      title: "Robot Melody Maker",
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
    label: 'Join with Class Code', 
    description: 'Students enter session code',
    type: 'waiting'
  },
  // Introduction
  {
    id: 'city-soundscapes-intro',
    label: 'City Soundscapes',
    description: 'Ask: "What city have you visited? How would it feel there?"',
    type: 'summary',
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/1.png'
    }
  },
  {
    id: 'show-agenda',
    label: 'Agenda',
    description: 'Review: "1) Learn texture & layering, 2) Create City Soundscape"',
    type: 'summary',
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/2.png'
    }
  },
  {
    id: 'introduce-texture',
    label: 'Texture',
    description: 'Explain: "Texture = thick/thin sound based on # of layers"',
    type: 'summary',
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/3.png'
    }
  },
  {
    id: 'texture-continued',
    label: 'Sandwich Analogy',
    description: 'Analogy: "1 ingredient = thin, many ingredients = full"',
    type: 'summary',
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/4.png'
    }
  },
  {
    id: 'layers-and-texture',
    label: 'Making Layers',
    description: 'Explain: "1 layer = thin, 2-3 = medium, 4+ = full texture"',
    type: 'summary',
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/5.png'
    }
  },
  // Layer Detective Game
  {
    id: 'layer-detective-intro',
    label: 'Layer Detective Intro',
    description: 'Announce: "Now we will play a class game about layers!"',
    type: 'summary',
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/5.5.svg'
    }
  },
  {
    id: 'layer-detective',
    label: '🎮 Layer Detective',
    description: 'STUDENTS PLAY: Count layers, choose A/B/C, earn points',
    bonusDescription: 'Faster answers = more points!',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 5,
    presentationView: {
      type: 'layer-detective-leaderboard'
    }
  },
  {
    id: 'layer-detective-results',
    label: '🏆 Results',
    description: 'Show leaderboard and celebrate top scorers',
    type: 'summary',
    presentationView: {
      type: 'layer-detective-results'
    }
  },
  // Activity: Composition
  { 
    id: 'composition-instructions', 
    label: 'Composition Instructions', 
    description: 'Instructions: "Select city, watch silent video, think about mood"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/7.png'
    }
  },
  { 
    id: 'composition-instructions-continued', 
    label: 'Composition Requirements', 
    description: 'Review: "5+ loops, line up edges, same mood. Bonus: sound effects"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/8.png'
    }
  },
  {
    id: 'city-composition',
    label: '🎮 Unlock Composition',
    description: 'STUDENTS WORK: Pick city video, compose soundscape music',
    bonusDescription: 'Bonus: Add more layers and sound effects',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/9.svg'
    }
  },
  // Reflection
  {
    id: 'reflection-instructions',
    label: 'Reflection Time',
    description: 'Introduce the reflection activity.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/10.svg'
    }
  },
  {
    id: 'reflection',
    label: '🎮 Unlock Reflection',
    description: 'STUDENTS WORK: 2 things well + 1 to improve, fill out form',
    bonusDescription: 'Bonus: Loop Lab Partner Game with a partner',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'activity-slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/10.svg'
    }
  },
  // Conclusion
  {
    id: 'conclusion',
    label: 'Class Discussion',
    description: 'Ask: "What is texture? Partner\'s city? What did you like?"',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/11.png'
    }
  },
  // ⭐ BONUS: Robot Melody Maker
  {
    id: 'bonus-intro',
    label: 'Introduce Robot Melody Maker',
    description: 'Announce: "Create loops and customize your robot!"',
    type: 'summary',
    duration: 1,
    isBonus: true,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/13.svg'
    }
  },
  {
    id: 'robot-melody-maker',
    label: '🎮 Unlock Robot Melody Maker',
    description: 'STUDENTS WORK: Create loops and customize their robot',
    bonusDescription: 'Make your robot dance!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    isBonus: true,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/14.svg'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'city-soundscapes-intro': 'summary',
    'show-agenda': 'summary',
    'introduce-texture': 'summary',
    'texture-continued': 'summary',
    'layers-and-texture': 'summary',
    'layer-detective-intro': 'summary',
    'layer-detective': 'layer-detective',
    'layer-detective-results': 'summary',
    'composition-instructions': 'summary',
    'composition-instructions-continued': 'summary',
    'city-composition': 'city-composition-activity',
    'reflection-instructions': 'summary',
    'reflection': 'two-stars-wish',
    'conclusion': 'discussion',
    'bonus-intro': 'summary',
    'robot-melody-maker': 'robot-melody-maker'
  };
  return stageMap[stage];
};