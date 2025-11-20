// File: /lessons/film-music-project/lesson2/Lesson2config.jsx
// Lesson 2: Sports Highlight Reel Music - Configuration
// ✅ UPDATED: New structure matching lesson plan with DAW Challenge

export const LESSON_PROGRESS_KEY = 'lesson2-progress';
export const LESSON_TIMER_KEY = 'lesson2-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: 'Introduction',
    subtitle: 'Welcome & DAW Challenge',
    icon: '🎬',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      { 
        id: 'sports-highlight-intro', 
        type: 'summary', 
        label: 'Sports Highlight Reel Introduction',
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
        id: 'introduce-daw', 
        type: 'summary', 
        label: 'Introduce Digital Audio Workstation',
        description: 'Display DAW overview - Slide 3',
        duration: 1
      },
      { 
        id: 'introduce-daw-challenge', 
        type: 'summary', 
        label: 'Introduce DAW Challenge',
        description: 'Display DAW challenge instructions - Slide 4',
        duration: 1
      },
      { 
        id: 'daw-tutorial', 
        type: 'activity', 
        label: 'Unlock DAW Challenge', 
        duration: 6,
        hasTimer: true,
        trackProgress: true,
        description: 'Interactive DAW basics - Slide 5',
        bonusDescription: 'Bonus Activity: Explore the DAW'
      }
    ]
  },
  {
    id: 'activity1',
    title: 'Activity 1 - Composition',
    subtitle: 'Sports Highlight Music',
    icon: '🎵',
    color: 'red',
    estimatedTime: 15,
    stages: [
      { 
        id: 'introduce-video', 
        type: 'summary', 
        label: 'Introduce Video',
        description: 'Display video introduction - Slide 6',
        duration: 1
      },
      { 
        id: 'sports-video', 
        type: 'video', 
        label: 'Play SportsHighlightComposition.mp4',
        description: 'Play composition video',
        duration: 3
      },
      { 
        id: 'composition-instructions', 
        type: 'summary', 
        label: 'Show Composition Instructions',
        description: 'Display requirements - Slide 7',
        duration: 1
      },
      { 
        id: 'sports-composition', 
        type: 'activity', 
        label: 'Unlock Composition Activity', 
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
    estimatedTime: 7,
    stages: [
      { 
        id: 'show-reflection', 
        type: 'summary', 
        label: 'Show Two Stars and a Wish Activity',
        description: 'Display reflection instructions - Slide 9',
        duration: 2
      },
      { 
        id: 'reflection', 
        type: 'activity', 
        label: 'Unlock Two Stars and a Wish Activity', 
        duration: 5,
        hasTimer: true,
        trackProgress: true,
        description: 'Students complete reflection',
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
        description: 'Review and wrap up - Slide 10',
        duration: 2
      }
    ]
  }
];

export const lesson2Config = {
  id: 'lesson2',
  title: "Sports Highlight Reel Music",
  subtitle: "Introduction to the DAW",
  learningObjectives: [
    "Master the DAW interface and basic controls",
    "Create high-energy music for sports highlights",
    "Practice placing and manipulating music loops"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "daw-tutorial",
      title: "DAW Challenge",
      estimatedTime: "6 min"
    },
    {
      id: 2,
      type: "video",
      title: "Sports Composition Video",
      estimatedTime: "3 min",
      src: "/lessons/film-music-project/lesson2/SportsHighlightComposition.mp4"
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
// ========================================
export const lessonStages = [
  { 
    id: 'locked', 
    label: 'Join with Class Code', 
    description: 'Students enter session code',
    type: 'waiting'
  },
  { 
    id: 'sports-highlight-intro', 
    label: 'Sports Highlight Reel Introduction', 
    description: 'Welcome screen - Slide 1',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/1.png'
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
      slidePath: '/lessons/film-music-project/lesson2/slides/2.png'
    }
  },
  { 
    id: 'introduce-daw', 
    label: 'Introduce Digital Audio Workstation', 
    description: 'DAW overview - Slide 3',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/3.png'
    }
  },
  { 
    id: 'introduce-daw-challenge', 
    label: 'Introduce DAW Challenge', 
    description: 'DAW challenge instructions - Slide 4',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/4.png'
    }
  },
  { 
    id: 'daw-tutorial', 
    label: 'Unlock DAW Challenge', 
    description: 'Interactive DAW basics - Slide 5',
    bonusDescription: 'Bonus Activity: Explore the DAW',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 6,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/5.png'
    }
  },
  { 
    id: 'introduce-video', 
    label: 'Introduce Video', 
    description: 'Video introduction - Slide 6',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/6.png'
    }
  },
  { 
    id: 'sports-video', 
    label: 'Play SportsHighlightComposition.mp4', 
    description: 'Composition video', 
    type: 'video',
    duration: 3,
    presentationView: {
      type: 'video',
      videoPath: '/lessons/film-music-project/lesson2/SportsHighlightComposition.mp4',
      title: 'Sports Composition Introduction'
    }
  },
  { 
    id: 'composition-instructions', 
    label: 'Show Composition Instructions', 
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
    label: 'Unlock Composition Activity', 
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
    id: 'show-reflection', 
    label: 'Show Two Stars and a Wish Activity', 
    description: 'Reflection instructions - Slide 9',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'slide',
      slidePath: '/lessons/film-music-project/lesson2/slides/9.png'
    }
  },
  { 
    id: 'reflection', 
    label: 'Unlock Two Stars and a Wish Activity', 
    description: 'Students complete reflection', 
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
    'sports-highlight-intro': 'summary',
    'show-agenda': 'summary',
    'introduce-daw': 'summary',
    'introduce-daw-challenge': 'summary',
    'daw-tutorial': 'daw-tutorial',
    'introduce-video': 'summary',
    'sports-video': 'video',
    'composition-instructions': 'summary',
    'sports-composition': 'sports-composition-activity',
    'show-reflection': 'summary',
    'reflection': 'sports-composition-activity',  // Show composition during reflection
    'conclusion': 'discussion'
  };
  return stageMap[stage];
};