// File: /lessons/music-journalist/lesson3/lesson3Config.jsx
// Lesson 3: Deep Dive
// "Go deeper — more sources, more evidence, stronger story"

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson3-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson3-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'progress-check',
    title: '1. Progress Check',
    subtitle: 'Review & Reconnect',
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
        id: 'progress-check',
        type: 'summary',
        label: 'Progress Check',
        description: 'Review what students have gathered so far and set goals for today.',
        duration: 5
      }
    ]
  },
  {
    id: 'evidence-images',
    title: '2. Evidence & Images',
    subtitle: 'Strengthen Your Research',
    color: 'blue',
    estimatedTime: 15,
    stages: [
      {
        id: 'strong-evidence',
        type: 'summary',
        label: 'Strong vs. Weak Evidence',
        description: 'Show examples of weak vs. strong evidence and how to improve quotes and facts.',
        duration: 5
      },
      {
        id: 'image-library-intro',
        type: 'summary',
        label: 'Image Library',
        description: 'Introduce the image library and how journalists use images to support their stories.',
        duration: 3
      },
      {
        id: 'read-third-article',
        type: 'activity',
        label: 'Read Third Article',
        description: 'STUDENTS WORK: Read a third article and collect strong evidence.',
        duration: 7,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'organize',
    title: '3. Organize',
    subtitle: 'Research Board',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'organize-research',
        type: 'activity',
        label: 'Organize Research Board',
        description: 'STUDENTS WORK: Organize all evidence on the research board by theme.',
        duration: 10,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'game',
    title: '4. Headline Writer',
    subtitle: 'Game Time',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'headline-writer-intro',
        type: 'summary',
        label: 'Headline Writer Instructions',
        description: 'Explain the Headline Writer game: craft compelling headlines from evidence.',
        duration: 2
      },
      {
        id: 'headline-writer-game',
        type: 'activity',
        label: 'Headline Writer Game',
        description: 'CLASS GAME: Write the best headline for real music stories!',
        duration: 8,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'reflect',
    title: '5. Reflect',
    subtitle: 'Wrap Up',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'reflection',
        type: 'discussion',
        label: 'Reflection',
        description: 'Discuss what makes evidence strong and how research boards help organize thinking.',
        duration: 3
      },
      {
        id: 'lesson-complete',
        type: 'summary',
        label: 'Lesson Complete',
        description: 'Celebrate progress and preview Lesson 4.',
        duration: 2
      }
    ]
  }
];

export const lesson3Config = {
  id: 'music-journalist-lesson3',
  lessonPath: '/lessons/music-journalist/lesson3',
  title: "Deep Dive",
  subtitle: "More Sources, More Evidence, Stronger Story",
  learningObjectives: [
    "Distinguish between strong and weak evidence",
    "Collect evidence from a third source article",
    "Organize research by theme on a research board",
    "Write compelling headlines from evidence"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "article-reader",
      title: "Read Third Article",
      estimatedTime: "7 min"
    },
    {
      id: 2,
      type: "research-board",
      title: "Organize Research Board",
      estimatedTime: "10 min"
    },
    {
      id: 3,
      type: "headline-writer",
      title: "Headline Writer Game",
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
    id: 'progress-check',
    label: 'Progress Check',
    description: 'Review what students have gathered so far and set goals for today.',
    type: 'summary',
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Progress Check',
      subtitle: 'Where Are We in Our Investigation?',
      sections: [
        {
          heading: 'So Far You Have...',
          bullets: [
            'Chosen a music topic to investigate',
            'Read TWO articles about your topic',
            'Collected evidence: quotes, facts, and observations',
            'Started building your research board'
          ]
        },
        {
          heading: 'Today\'s Goal',
          bullets: [
            'Read a THIRD article for deeper evidence',
            'Learn to tell STRONG evidence from WEAK evidence',
            'ORGANIZE your research board by theme',
            'Play the Headline Writer game'
          ]
        }
      ]
    }
  },
  {
    id: 'strong-evidence',
    label: 'Strong vs. Weak Evidence',
    description: 'Show examples of weak vs. strong evidence.',
    type: 'summary',
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Strong vs. Weak Evidence',
      subtitle: 'Not All Evidence Is Created Equal',
      sections: [
        {
          heading: 'Weak Evidence',
          bullets: [
            '"The song is popular." (Too vague - HOW popular?)',
            '"People like it." (Who? How many?)',
            '"It sounds good." (That\'s an opinion, not evidence)'
          ]
        },
        {
          heading: 'Strong Evidence',
          bullets: [
            '"The song reached #1 on Billboard Hot 100 in its first week." (Specific fact)',
            '"Producer Pharrell Williams said: \'I wanted every beat to feel like sunshine.\'" (Direct quote)',
            '"The album sold 2 million copies in 3 days." (Measurable data)'
          ]
        },
        {
          heading: 'How to Strengthen Your Evidence',
          bullets: [
            'Add NUMBERS and DATES when possible',
            'Use DIRECT QUOTES from artists or experts',
            'Include WHO, WHAT, WHEN, WHERE details'
          ]
        }
      ]
    }
  },
  {
    id: 'image-library-intro',
    label: 'Image Library',
    description: 'Introduce the image library and how journalists use images.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Images Tell Stories Too',
      subtitle: 'How Journalists Use Visuals',
      sections: [
        {
          heading: 'Why Images Matter',
          bullets: [
            'A great image grabs the reader\'s attention FIRST',
            'Images provide CONTEXT that words alone cannot',
            'Professional journalists always pair text with visuals'
          ]
        },
        {
          heading: 'Choosing the Right Image',
          bullets: [
            'Does it connect to your MAIN IDEA?',
            'Does it make the reader want to READ MORE?',
            'Could you write a caption explaining WHY this image matters?'
          ]
        }
      ]
    }
  },
  {
    id: 'read-third-article',
    label: 'Read Third Article',
    description: 'STUDENTS WORK: Read a third article and collect strong evidence.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 7,
    presentationView: {
      type: 'activity-banner',
      title: 'Read Your Third Article',
      subtitle: 'Find strong evidence: quotes, facts, and specific details.'
    }
  },
  {
    id: 'organize-research',
    label: 'Organize Research Board',
    description: 'STUDENTS WORK: Organize all evidence on the research board by theme.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 10,
    presentationView: {
      type: 'activity-banner',
      title: 'Organize Your Research Board',
      subtitle: 'Group your evidence by theme. Look for patterns and connections.'
    }
  },
  {
    id: 'headline-writer-intro',
    label: 'Headline Writer Instructions',
    description: 'Explain the Headline Writer game.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Headline Writer',
      subtitle: 'Can You Write the Perfect Headline?',
      sections: [
        {
          heading: 'How to Play',
          bullets: [
            '1. Read a short music news summary',
            '2. Write the most compelling HEADLINE you can',
            '3. A great headline is SHORT, SPECIFIC, and makes you want to read more',
            '4. Vote on the best headlines from the class!'
          ]
        },
        {
          heading: 'Headline Tips',
          bullets: [
            'Use ACTIVE verbs (\"breaks\" not \"has broken\")',
            'Include a HOOK that creates curiosity',
            'Keep it under 10 words if possible',
            'Make the reader ask \"Wait, what?!\"'
          ]
        }
      ]
    }
  },
  {
    id: 'headline-writer-game',
    label: 'Headline Writer Game',
    description: 'CLASS GAME: Write the best headline for real music stories!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 8,
    presentationView: {
      type: 'headline-writer-teacher-game'
    }
  },
  {
    id: 'reflection',
    label: 'Reflection',
    description: 'Discuss what makes evidence strong and how research boards help organize thinking.',
    type: 'discussion',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Reflection',
      subtitle: 'Think About Your Research',
      sections: [
        {
          heading: 'Discussion Questions',
          bullets: [
            '1. What is the STRONGEST piece of evidence you found today?',
            '2. How did organizing your research board help you see your story more clearly?',
            '3. What headline would YOU write for your own story?'
          ]
        }
      ]
    }
  },
  {
    id: 'lesson-complete',
    label: 'Lesson Complete',
    description: 'Celebrate progress and preview Lesson 4.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Deep Dive Complete!',
      subtitle: 'You\'re Building a Real Story',
      sections: [
        {
          heading: 'Today You...',
          bullets: [
            'Learned to identify STRONG vs. WEAK evidence',
            'Read a THIRD article and collected key details',
            'ORGANIZED your research board by theme',
            'Practiced writing attention-grabbing HEADLINES'
          ]
        },
        {
          heading: 'Next Time: Build Your Story',
          bullets: [
            'Turn your research into a 4-slide presentation',
            'Learn storytelling techniques real journalists use',
            'Build something you\'re proud to share!'
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
    'progress-check': 'summary',
    'strong-evidence': 'summary',
    'image-library-intro': 'summary',
    'read-third-article': 'article-reader',
    'organize-research': 'research-board',
    'headline-writer-intro': 'summary',
    'headline-writer-game': 'headline-writer',
    'reflection': 'discussion',
    'lesson-complete': 'summary'
  };
  return stageMap[stage];
};
