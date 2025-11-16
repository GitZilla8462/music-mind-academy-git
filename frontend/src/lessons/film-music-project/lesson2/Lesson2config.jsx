// File: /lessons/film-music-project/lesson2/Lesson2config.jsx
// Lesson 2: Sports Highlight Reel Music - Configuration
// ✅ UPDATED: Added presentationView to all stages for slide display
// ✅ UPDATED: Video selection is now PART of sports-composition, not a separate stage

export const LESSON_PROGRESS_KEY = 'lesson2-progress';
export const LESSON_TIMER_KEY = 'lesson2-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: 'Introduction',
    subtitle: 'Texture & Layering Concepts',
    icon: '🎬',
    color: 'blue',
    estimatedTime: 9,
    stages: [
      { 
        id: 'welcome-instructions', 
        type: 'summary', 
        label: 'Show Welcome Instructions',
        description: 'Display welcome screen - Slide 1',
        duration: 1
      },
      { 
        id: 'lesson-goals', 
        type: 'summary', 
        label: 'Show Lesson Goals',
        description: 'Display lesson objectives - Slide 2',
        duration: 1
      },
      { 
        id: 'texture-definition', 
        type: 'summary', 
        label: 'Texture Definition',
        description: 'Explain texture in music - Slide 3',
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
        id: 'layers-in-music', 
        type: 'summary', 
        label: 'Layers in Music',
        description: 'Explain layering concept - Slide 5',
        duration: 3
      }
    ]
  },
  {
    id: 'warm-up-activity',
    title: 'Warm-Up Activity',
    subtitle: 'Layer Detective Game',
    icon: '🕵️',
    color: 'orange',
    estimatedTime: 9,
    stages: [
      { 
        id: 'layer-detective-rules', 
        type: 'summary', 
        label: 'Layer Detective Rules',
        description: 'Show game instructions - Slide 6',
        duration: 1
      },
      { 
        id: 'layer-detective-class-demo', 
        type: 'class-demo', 
        label: 'Layer Detective Class Demo',
        description: 'Demonstrate game on main screen',
        duration: 2
      },
      { 
        id: 'layer-detective', 
        type: 'activity', 
        label: 'Start Layer Detective Game', 
        duration: 4,
        hasTimer: false,
        trackProgress: false,
        description: 'Interactive game to identify layers',
        bonusDescription: 'Leaderboard shown on main screen'
      },
      { 
        id: 'layer-detective-results', 
        type: 'results', 
        label: 'Show Game Results',
        description: 'Winner celebration screen',
        duration: 2
      }
    ]
  },
  {
    id: 'activity1',
    title: 'Activity 1 - Composition',
    subtitle: 'Sports Highlight Music',
    icon: '🎵',
    color: 'red',
    estimatedTime: 11,
    stages: [
      { 
        id: 'composition-directions', 
        type: 'summary', 
        label: 'Show Composition Directions',
        description: 'Display requirements - Slide 7',
        duration: 1
      },
      { 
        id: 'sports-composition', 
        type: 'activity', 
        label: 'Unlock Sports Composition', 
        duration: 10,
        hasTimer: true,
        trackProgress: true,
        description: 'Students choose video & compose music - Slide 8',
        bonusDescription: 'Bonus: Add More Layers'
      }
    ]
  },
  {
    id: 'activity2',
    title: 'Activity 2 - Reflection',
    subtitle: 'Two Stars and a Wish',
    icon: "⭐",
    color: 'yellow',
    estimatedTime: 5,
    stages: [
      { 
        id: 'reflection', 
        type: 'activity', 
        label: 'Unlock Reflection', 
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students complete reflection - Slide 9',
        bonusDescription: 'Bonus: Share Your Work'
      }
    ]
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    subtitle: 'Class Discussion',
    icon: "💬",
    color: 'gray',
    estimatedTime: 2,
    stages: [
      {
        id: 'conclusion',
        type: 'discussion',
        label: 'Class Discussion',
        description: 'Review texture and layering - Slide 10',
        duration: 2
      }
    ]
  }
];

export const lesson2Config = {
  id: 'lesson2',
  title: "Sports Highlight Reel Music",
  subtitle: "Texture & Layering",
  learningObjectives: [
    "Understand texture and layering in music composition",
    "Create high-energy music for sports highlights",
    "Layer multiple loops to build intensity and excitement"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "video",
      title: "Lesson Introduction",
      estimatedTime: "3 min",
      src: "/lessons/film-music-project/lesson2/Lesson2intro.mp4"
    },
    {
      id: 2,
      type: "layer-detective",
      title: "Layer Detective Warm-Up",
      estimatedTime: "4 min",
      component: "LayerDetectiveActivity"
    },
    {
      id: 3,
      type: "sports-composition-activity",
      title: "Compose Your Sports Music",
      estimatedTime: "10 min",
      includesVideoSelection: true  // Video selection is BUILT INTO this activity
    },
    {
      id: 4,
      type: "two-stars-wish",
      title: "Reflection Activity",
      estimatedTime: "5 min"
    }
  ]
};

// ========================================
// LESSON STAGES - With presentationView data for each stage
// ✅ Video selection is now PART of sports-composition stage
// ========================================
export const lessonStages = [
  { 
    id: 'locked', 
    label: 'Join with Class Code', 
    description: 'Students enter session code',
    type: 'waiting'
  },
  { 
    id: 'welcome-instructions', 
    label: 'Show Welcome Instructions', 
    description: 'Welcome screen - Slide 1',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/1.png'
    }
  },
  { 
    id: 'lesson-goals', 
    label: 'Show Lesson Goals', 
    description: 'Lesson objectives - Slide 2',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/2.png'
    }
  },
  { 
    id: 'texture-definition', 
    label: 'Texture Definition', 
    description: 'What is texture? - Slide 3',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/3.png'
    }
  },
  { 
    id: 'texture-continued', 
    label: 'Texture Continued', 
    description: 'More about texture - Slide 4',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/4.png'
    }
  },
  { 
    id: 'layers-in-music', 
    label: 'Layers in Music', 
    description: 'How layers create texture - Slide 5',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/5.png'
    }
  },
  { 
    id: 'layer-detective-rules', 
    label: 'Layer Detective Rules', 
    description: 'Game instructions - Slide 6',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/6.png'
    }
  },
  { 
    id: 'layer-detective-class-demo', 
    label: 'Layer Detective Class Demo', 
    description: 'Demonstrate game on main screen',
    type: 'class-demo',
    duration: 2,
    presentationView: {
      type: 'layer-detective-class-demo',
      component: 'LayerDetectiveClassDemo'
    }
  },
  { 
    id: 'layer-detective', 
    label: 'Layer Detective Game', 
    description: 'Interactive warm-up activity',
    type: 'activity',
    duration: 4,
    presentationView: {
      type: 'layer-detective-leaderboard',
      component: 'LayerDetectivePresentationView'
    }
  },
  { 
    id: 'layer-detective-results', 
    label: 'Show Game Results', 
    description: 'Winner celebration',
    type: 'results',
    duration: 2,
    presentationView: {
      type: 'layer-detective-results',
      component: 'LayerDetectiveResults'
    }
  },
  { 
    id: 'composition-directions', 
    label: 'Show Composition Directions', 
    description: 'Requirements - Slide 7',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/7.png'
    }
  },
  { 
    id: 'sports-composition', 
    label: 'Unlock Sports Composition', 
    description: 'Choose video & compose music - Slide 8', 
    bonusDescription: 'Bonus: Add More Layers',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/8.png'
    }
  },
  { 
    id: 'reflection', 
    label: 'Unlock Reflection', 
    description: 'Two Stars and a Wish - Slide 9', 
    bonusDescription: 'Bonus: Share Your Work',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/9.png'
    }
  },
  {
    id: 'conclusion',
    label: 'Class Discussion',
    description: 'Wrap up lesson - Slide 10',
    type: 'discussion',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/10.png'
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-instructions': 'summary',
    'lesson-goals': 'summary',
    'texture-definition': 'summary',
    'texture-continued': 'summary',
    'layers-in-music': 'summary',
    'layer-detective-rules': 'summary',
    'layer-detective-class-demo': 'layer-detective',
    'layer-detective': 'layer-detective',
    'layer-detective-results': 'layer-detective-results',
    'composition-directions': 'summary',
    'sports-composition': 'sports-composition-activity',  // Includes video selection!
    'reflection': 'sports-composition-activity',  // Show composition during reflection
    'conclusion': 'discussion'
  };
  return stageMap[stage];
};