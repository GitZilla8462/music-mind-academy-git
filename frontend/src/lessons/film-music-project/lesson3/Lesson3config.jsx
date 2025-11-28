// File: /src/lessons/film-music-project/lesson3/Lesson3config.jsx
// Lesson 3: City Soundscapes - Configuration
// Music concept: Texture and Layering
// ✅ UPDATED: Renamed Texture Drawings to Listening Map throughout

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
    title: 'Activity 1 - Listening Map',
    subtitle: 'Listen & Draw Layers',
    icon: '🗺️',
    color: 'purple',
    estimatedTime: 12,
    stages: [
      { 
        id: 'introduce-listening-map', 
        type: 'summary', 
        label: 'Introduce Listening Map',
        description: 'Introduce the Listening Map activity - Slide 6',
        duration: 1
      },
      { 
        id: 'listening-map-video', 
        type: 'video', 
        label: 'Play ListeningMapExplanation.mp4',
        description: 'Play explanation video',
        duration: 2
      },
      { 
        id: 'listening-map', 
        type: 'activity', 
        label: 'Unlock Listening Map', 
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        description: 'Students draw while listening to music',
        bonusDescription: 'Bonus: Compare your drawings!'
      }
    ]
  },
  {
    id: 'activity2',
    title: 'Activity 2 - Composition',
    subtitle: 'City Soundscape Music',
    icon: '🎵',
    color: 'green',
    estimatedTime: 12,
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
        description: 'Students choose city & compose soundscape',
        bonusDescription: 'Bonus: Add more layers!'
      }
    ]
  },
  {
    id: 'reflection',
    title: 'Reflection',
    subtitle: 'Two Stars and a Wish',
    icon: '⭐',
    color: 'amber',
    estimatedTime: 5,
    stages: [
      { 
        id: 'reflection', 
        type: 'activity', 
        label: 'Unlock Reflection Activity', 
        duration: 3,
        hasTimer: true,
        trackProgress: true,
        description: 'Students complete Two Stars and a Wish',
        bonusDescription: 'Bonus: Share with a partner!'
      },
      {
        id: 'conclusion',
        type: 'discussion',
        label: 'Class Discussion',
        description: 'Wrap up and review - Slide 11',
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
    "Describe musical elements using appropriate vocabulary",
    "Create city soundscapes using multiple musical layers"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "listening-map",
      title: "Listening Map",
      estimatedTime: "8 min"
    },
    {
      id: 2,
      type: "city-composition-activity",
      title: "Compose Your City Soundscape",
      estimatedTime: "10 min",
      includesVideoSelection: true
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
  // Introduction
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
  // Activity 1: Listening Map
  { 
    id: 'introduce-listening-map', 
    label: 'Introduce Listening Map', 
    description: 'Introduce Listening Map activity - Slide 6',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/6.png'
    }
  },
  { 
    id: 'listening-map-video', 
    label: 'Play ListeningMapExplanation.mp4', 
    description: 'Explanation video',
    type: 'video',
    duration: 2,
    presentationView: {
      type: 'video',
      videoPath: '/lessons/film-music-project/lesson3/ListeningMapExplanation.mp4',
      title: 'Listening Map Explanation'
    }
  },
  { 
    id: 'listening-map', 
    label: 'Unlock Listening Map', 
    description: 'Students draw while listening to music',
    bonusDescription: 'Bonus: Compare your drawings!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/6.5.png'
    }
  },
  // Activity 2: Composition
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
    description: 'Students choose city & compose soundscape', 
    bonusDescription: 'Bonus: Add more layers!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/9.png'
    }
  },
  // Reflection
  { 
    id: 'reflection', 
    label: 'Unlock Reflection Activity', 
    description: 'Students complete Two Stars and a Wish', 
    bonusDescription: 'Bonus: Share with a partner!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson3/slides/10.png'
    }
  },
  // Conclusion (part of Reflection section)
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
    'introduce-listening-map': 'summary',
    'introduce-texture-drawings': 'summary',  // backward compatibility
    'listening-map-video': 'video',
    'listening-map': 'listening-map',
    'texture-drawings': 'listening-map',  // backward compatibility
    'composition-instructions': 'summary',
    'composition-instructions-continued': 'summary',
    'city-composition': 'city-composition-activity',
    'reflection': 'two-stars-wish',
    'conclusion': 'discussion'
  };
  return stageMap[stage];
};