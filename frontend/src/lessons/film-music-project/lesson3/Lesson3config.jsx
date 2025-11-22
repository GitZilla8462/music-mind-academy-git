// File: /lessons/film-music-project/lesson3/Lesson3config.jsx
// Lesson 3: City Soundscapes - Configuration
// Music concept: Texture and Layering

export const LESSON_PROGRESS_KEY = 'lesson3-progress';
export const LESSON_TIMER_KEY = 'lesson3-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: 'Introduction',
    subtitle: 'City Soundscapes & Texture Concept',
    icon: '🏙️',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      { 
        id: 'city-soundscapes-intro', 
        type: 'summary', 
        label: 'City Soundscapes Introduction',
        description: 'Display welcome screen - Slide 1',
        duration: 1
      },
      { 
        id: 'show-agenda', 
        type: 'summary', 
        label: 'Show Agenda',
        description: 'Display lesson agenda - Slide 2',
        duration: 1
      },
      { 
        id: 'introduce-texture', 
        type: 'summary', 
        label: 'Texture',
        description: 'Introduce texture concept - Slide 3',
        duration: 2
      },
      { 
        id: 'texture-continued', 
        type: 'summary', 
        label: 'Texture Continued',
        description: 'Continue texture explanation - Slide 4',
        duration: 2
      },
      { 
        id: 'layers-and-texture', 
        type: 'summary', 
        label: 'Layers and Texture',
        description: 'Explain layers and texture relationship - Slide 5',
        duration: 2
      }
    ]
  },
  {
    id: 'activity1',
    title: 'Activity 1 - Layer Detective',
    subtitle: 'Identify Layers Game',
    icon: '🔍',
    color: 'orange',
    estimatedTime: 7,
    stages: [
      { 
        id: 'introduce-layer-detective', 
        type: 'summary', 
        label: 'Introduce Layer Detective Game',
        description: 'Introduce the Layer Detective activity - Slide 6',
        duration: 1
      },
      { 
        id: 'layer-detective', 
        type: 'activity', 
        label: 'Unlock Layer Detective Game', 
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students play layer identification game',
        bonusDescription: 'Bonus: Replay and improve your score'
      },
      { 
        id: 'layer-detective-results', 
        type: 'results', 
        label: 'Show Layer Detective Results', 
        duration: 1,
        description: 'Display winner podium and scores'
      }
    ]
  },
  {
    id: 'activity2',
    title: 'Activity 2 - Composition',
    subtitle: 'City Soundscape Music',
    icon: '🎵',
    color: 'green',
    estimatedTime: 13,
    stages: [
      { 
        id: 'composition-instructions', 
        type: 'summary', 
        label: 'Show Composition Instructions',
        description: 'Display composition requirements - Slide 7',
        duration: 1
      },
      { 
        id: 'composition-instructions-continued', 
        type: 'summary', 
        label: 'Composition Instructions Continued',
        description: 'Continue composition instructions - Slide 8',
        duration: 1
      },
      { 
        id: 'city-composition', 
        type: 'activity', 
        label: 'Unlock Composition Activity', 
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: 'Students compose city soundscape music',
        bonusDescription: 'Bonus: Add More Layers and Variation'
      },
      { 
        id: 'reflection', 
        type: 'activity', 
        label: 'Unlock Reflection Activity', 
        duration: 1,
        hasTimer: true,
        trackProgress: true,
        description: 'Students complete Two Stars and a Wish',
        bonusDescription: 'Bonus: Share Your Soundscape'
      }
    ]
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    subtitle: 'Class Discussion',
    icon: '💬',
    color: 'gray',
    estimatedTime: 2,
    stages: [
      {
        id: 'conclusion',
        type: 'discussion',
        label: 'Class Discussion',
        description: 'Review and wrap up - Slide 9',
        duration: 2
      }
    ]
  }
];

export const lesson3Config = {
  id: 'lesson3',
  title: "City Soundscapes",
  subtitle: "Texture and Layering in Music",
  learningObjectives: [
    "Understand texture as the thickness or thinness of sound",
    "Identify the number of layers in musical compositions",
    "Create city soundscapes using multiple musical layers"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "layer-detective",
      title: "Layer Detective Game",
      estimatedTime: "3 min"
    },
    {
      id: 2,
      type: "city-composition-activity",
      title: "Compose Your City Soundscape",
      estimatedTime: "10 min",
      includesVideoSelection: false
    },
    {
      id: 3,
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
    id: 'locked', 
    label: 'Join with Class Code', 
    description: 'Students enter session code',
    type: 'waiting'
  },
  { 
    id: 'city-soundscapes-intro', 
    label: 'City Soundscapes Introduction', 
    description: 'Welcome screen - Slide 1',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/1.png'
    }
  },
  { 
    id: 'show-agenda', 
    label: 'Show Agenda', 
    description: 'Lesson agenda - Slide 2',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/2.png'
    }
  },
  { 
    id: 'introduce-texture', 
    label: 'Texture', 
    description: 'Introduce texture concept - Slide 3',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/3.png'
    }
  },
  { 
    id: 'texture-continued', 
    label: 'Texture Continued', 
    description: 'Continue texture explanation - Slide 4',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/4.png'
    }
  },
  { 
    id: 'layers-and-texture', 
    label: 'Layers and Texture', 
    description: 'Explain layers and texture - Slide 5',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/5.png'
    }
  },
  { 
    id: 'introduce-layer-detective', 
    label: 'Layer Detective Game', 
    description: 'Introduce Layer Detective activity - Slide 6',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/6.png'
    }
  },
  { 
    id: 'layer-detective', 
    label: 'Unlock Layer Detective Game', 
    description: 'Students play layer identification game',
    bonusDescription: 'Bonus: Replay and improve your score',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'layer-detective-leaderboard'  // ✅ Show live leaderboard
    }
  },
  { 
    id: 'layer-detective-results', 
    label: 'Show Layer Detective Results', 
    description: 'Display winner podium and scores',
    type: 'results',
    duration: 1,
    presentationView: {
      type: 'layer-detective-results'  // ✅ Show winner celebration
    }
  },
  { 
    id: 'composition-instructions', 
    label: 'Show Composition Instructions', 
    description: 'Display composition requirements - Slide 7',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/7.png'
    }
  },
  { 
    id: 'composition-instructions-continued', 
    label: 'Composition Instructions Continued', 
    description: 'Continue composition instructions - Slide 8',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/8.png'
    }
  },
  { 
    id: 'city-composition', 
    label: 'Unlock Composition Activity', 
    description: 'Students compose city soundscape - Slide 9', 
    bonusDescription: 'Bonus: Add More Layers and Variation',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/9.png'
    }
  },
  { 
    id: 'reflection', 
    label: 'Unlock Reflection Activity', 
    description: 'Students complete Two Stars and a Wish - Slide 10', 
    bonusDescription: 'Bonus: Share Your Soundscape',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/10.png'
    }
  },
  {
    id: 'conclusion',
    label: 'Class Discussion',
    description: 'Wrap up lesson - Slide 11',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/11.png'
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
    'introduce-layer-detective': 'summary',
    'layer-detective': 'layer-detective',
    'layer-detective-results': 'results',  // ✅ Results screen
    'composition-instructions': 'summary',
    'composition-instructions-continued': 'summary',
    'city-composition': 'city-composition-activity',
    'reflection': 'city-composition-activity',  // Show composition during reflection (modal appears on top)
    'conclusion': 'discussion'
  };
  return stageMap[stage];
};