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
    estimatedTime: 8,
    stages: [
      { 
        id: 'city-soundscapes-intro', 
        type: 'summary', 
        label: 'City Soundscapes',
        description: 'Ask: "What city have you visited? How would it feel there?"',
        duration: 1
      },
      { 
        id: 'show-agenda', 
        type: 'summary', 
        label: 'Agenda',
        description: 'Review: "1) Learn texture & layering, 2) Create City Soundscape"',
        duration: 1
      },
      { 
        id: 'introduce-texture', 
        type: 'summary', 
        label: 'Texture',
        description: 'Explain: "Texture = thick/thin sound based on # of layers"',
        duration: 2
      },
      { 
        id: 'texture-continued', 
        type: 'summary', 
        label: 'Sandwich Analogy',
        description: 'Analogy: "1 ingredient = thin, many ingredients = full"',
        duration: 2
      },
      { 
        id: 'layers-and-texture', 
        type: 'summary', 
        label: 'Making Layers',
        description: 'Explain: "1 layer = thin, 2-3 = medium, 4+ = full texture"',
        duration: 2
      }
    ]
  },
  {
    id: 'activity1',
    title: '2. Listening Map',
    subtitle: 'Video → Draw',
    color: 'blue',
    estimatedTime: 11,
    stages: [
      { 
        id: 'introduce-listening-map', 
        type: 'summary', 
        label: 'Listening Map Intro',
        description: 'Announce: "We\'ll watch a 1-min video then draw while listening"',
        duration: 1
      },
      { 
        id: 'listening-map-video', 
        type: 'video', 
        label: '▶️ Play Video',
        description: 'PLAY VIDEO: Listening Map explanation (students watch main screen)',
        duration: 2
      },
      { 
        id: 'listening-map', 
        type: 'activity', 
        label: '🎮 Unlock Listening Map', 
        duration: 8,
        hasTimer: true,
        trackProgress: true,
        description: 'STUDENTS WORK: Create 4 rows, unique style per row',
        bonusDescription: 'Bonus: Add more colors, textures, and pictures'
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
        label: 'Reflection Instructions',
        description: 'Explain Two Stars and a Wish.',
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
    duration: 1,
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
    duration: 1,
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
    duration: 2,
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
    duration: 2,
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
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/5.png'
    }
  },
  // Activity 1: Listening Map
  { 
    id: 'introduce-listening-map', 
    label: 'Listening Map Intro', 
    description: 'Announce: "We\'ll watch a 1-min video then draw while listening"',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/6.png'
    }
  },
  { 
    id: 'listening-map-video', 
    label: '▶️ Play Video', 
    description: 'PLAY VIDEO: Listening Map explanation (students watch main screen)',
    type: 'video',
    duration: 2,
    presentationView: {
      type: 'video',
      videoPath: '/lessons/film-music-project/lesson2/ListeningMapExplanation.mp4',
      title: 'Listening Map Explanation'
    }
  },
  {
    id: 'listening-map',
    label: '🎮 Unlock Listening Map',
    description: 'STUDENTS WORK: Create 4 rows, unique style per row',
    bonusDescription: 'Bonus: Add more colors, textures, and pictures',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/6.5.svg'
    }
  },
  // Activity 2: Composition
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
    label: 'Reflection Instructions',
    description: 'Explain Two Stars and a Wish.',
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
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/11.svg'
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
    'reflection-instructions': 'summary',
    'reflection': 'two-stars-wish',
    'conclusion': 'discussion'
  };
  return stageMap[stage];
};