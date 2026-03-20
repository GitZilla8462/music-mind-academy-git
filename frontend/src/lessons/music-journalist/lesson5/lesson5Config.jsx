// File: /lessons/music-journalist/lesson5/lesson5Config.jsx
// Lesson 5: Press Day
// "Present your story to the world"

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson5-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson5-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Today You Publish',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'join-code',
        type: 'waiting',
        label: 'Join Code Screen',
        description: 'Students enter session code to join.',
        duration: 0
      },
      {
        id: 'publish-day',
        type: 'summary',
        label: 'Today You Publish',
        description: 'Set the stage for Press Day and build excitement.',
        duration: 3
      },
      {
        id: 'presentation-format',
        type: 'summary',
        label: 'Presentation Format',
        description: 'Explain how presentations will work and audience expectations.',
        duration: 2
      }
    ]
  },
  {
    id: 'presentations',
    title: '2. Presentations',
    subtitle: 'Share Your Stories',
    color: 'blue',
    estimatedTime: 30,
    stages: [
      {
        id: 'presentation-mode',
        type: 'activity',
        label: 'Presentations',
        description: 'Students present their 4-slide stories to the class.',
        duration: 25,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'portfolio',
    title: '3. Peer Feedback',
    subtitle: 'Give & Receive Feedback',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'peer-feedback',
        type: 'activity',
        label: 'Peer Feedback',
        description: 'STUDENTS WORK: Give feedback on presentations you watched.',
        duration: 8,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'celebration',
    title: '4. Celebration',
    subtitle: 'You Are a Music Journalist',
    color: 'purple',
    estimatedTime: 5,
    stages: [
      {
        id: 'portfolio-view',
        type: 'summary',
        label: 'Your Portfolio',
        description: 'Review everything students created across all 5 lessons.',
        duration: 2
      },
      {
        id: 'unit-celebration',
        type: 'summary',
        label: 'You Are a Music Journalist',
        description: 'Celebrate the unit completion and reflect on growth.',
        duration: 3
      }
    ]
  }
];

export const lesson5Config = {
  id: 'music-journalist-lesson5',
  lessonPath: '/lessons/music-journalist/lesson5',
  title: "Press Day",
  subtitle: "Present Your Story to the World",
  learningObjectives: [
    "Present a 4-slide story to an audience",
    "Speak clearly and engage the audience beyond reading slides",
    "Give constructive peer feedback",
    "Reflect on growth as a music journalist"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "mj-presentation",
      title: "Presentations",
      estimatedTime: "25 min"
    },
    {
      id: 2,
      type: "mj-peer-feedback",
      title: "Peer Feedback",
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
    label: 'Join Code Screen',
    description: 'Students enter session code to join.',
    type: 'waiting'
  },
  {
    id: 'publish-day',
    label: 'Today You Publish',
    description: 'Set the stage for Press Day.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Press Day',
      subtitle: 'Today You Publish Your Story',
      sections: [
        {
          heading: 'Your Journey',
          bullets: [
            'Lesson 1: You learned to READ like a journalist',
            'Lesson 2: You FOUND your topic and started researching',
            'Lesson 3: You went DEEP - more sources, stronger evidence',
            'Lesson 4: You BUILT your 4-slide presentation'
          ]
        },
        {
          heading: 'Today',
          bullets: [
            'You PRESENT your story to the class',
            'You give and receive PEER FEEDBACK',
            'You celebrate becoming a MUSIC JOURNALIST!'
          ]
        }
      ]
    }
  },
  {
    id: 'presentation-format',
    label: 'Presentation Format',
    description: 'Explain how presentations will work.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Presentation Format',
      subtitle: 'How This Will Work',
      sections: [
        {
          heading: 'For the Presenter',
          bullets: [
            'You have about 2 MINUTES to present your 4 slides',
            'Don\'t just READ your slides - TELL your story',
            'Make eye contact with the audience',
            'Be ready for ONE question from the audience'
          ]
        },
        {
          heading: 'For the Audience',
          bullets: [
            'Listen actively and respectfully',
            'Think of ONE thing you liked and ONE question to ask',
            'You\'ll give written feedback after presentations',
            'Support your classmates - this takes courage!'
          ]
        }
      ]
    }
  },
  {
    id: 'presentation-mode',
    label: 'Presentations',
    description: 'Students present their 4-slide stories to the class.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 25,
    presentationView: {
      type: 'activity-banner',
      title: 'Presentations',
      subtitle: 'Share your story with the class!'
    }
  },
  {
    id: 'peer-feedback',
    label: 'Peer Feedback',
    description: 'STUDENTS WORK: Give feedback on presentations you watched.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'activity-banner',
      title: 'Peer Feedback',
      subtitle: 'Share what you liked and one suggestion for improvement.'
    }
  },
  {
    id: 'portfolio-view',
    label: 'Your Portfolio',
    description: 'Review everything students created across all 5 lessons.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Your Journalist Portfolio',
      subtitle: 'Look at Everything You Created',
      sections: [
        {
          heading: 'Your Work This Unit',
          bullets: [
            'Read and analyzed MULTIPLE music articles',
            'Built a RESEARCH BOARD with strong evidence',
            'Wrote attention-grabbing HEADLINES',
            'Created a 4-SLIDE PRESENTATION',
            'PRESENTED your story to an audience'
          ]
        },
        {
          heading: 'Skills You Developed',
          bullets: [
            'Critical reading and analysis',
            'Research and evidence gathering',
            'Writing for an audience',
            'Visual storytelling',
            'Public speaking'
          ]
        }
      ]
    }
  },
  {
    id: 'unit-celebration',
    label: 'You Are a Music Journalist',
    description: 'Celebrate the unit completion.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'You Are a Music Journalist!',
      subtitle: 'Congratulations on Completing the Unit',
      sections: [
        {
          heading: 'What Makes a Journalist?',
          bullets: [
            'A journalist READS carefully and asks questions',
            'A journalist RESEARCHES deeply and finds strong evidence',
            'A journalist TELLS stories that help people understand the world',
            'A journalist uses FACTS to inform, not just opinions'
          ]
        },
        {
          heading: 'You Did All of That!',
          bullets: [
            'You chose a topic YOU cared about',
            'You dug deep to find the real story',
            'You organized your thinking and built something to share',
            'You stood up and presented with courage'
          ]
        },
        {
          heading: 'Keep Going!',
          bullets: [
            'Music journalism is everywhere - blogs, magazines, YouTube, podcasts',
            'The skills you learned work for ANY topic, not just music',
            'Next time you read a news story, notice the Hook, Background, Evidence, and So What!'
          ]
        }
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'join-code': 'waiting',
    'publish-day': 'summary',
    'presentation-format': 'summary',
    'presentation-mode': 'mj-presentation',
    'peer-feedback': 'mj-peer-feedback',
    'portfolio-view': 'summary',
    'unit-celebration': 'summary'
  };
  return stageMap[stage];
};
