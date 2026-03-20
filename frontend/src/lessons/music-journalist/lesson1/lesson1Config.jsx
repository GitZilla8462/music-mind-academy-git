// File: /lessons/music-journalist/lesson1/lesson1Config.jsx
// Lesson 1: Read Like a Journalist
// "How journalists find, read, and analyze music stories"
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students learn:
// - What music journalism is and why it matters
// - Three types of music writing: news, review, feature
// - How to annotate articles using color-coded highlights
// - The difference between fact and opinion in music writing
//
// Color theme: deep navy (#1a2744) with gold accent (#f0b429)
// ========================================

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson1-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson1-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook + What Is Music Journalism',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'welcome-hook',
        type: 'summary',
        label: 'Welcome Hook',
        description: 'What makes a story worth telling?',
        duration: 2
      },
      {
        id: 'what-is-journalism',
        type: 'summary',
        label: 'What Is Music Journalism?',
        description: 'Introduce three types of music writing: news, review, feature.',
        duration: 3
      },
      {
        id: 'news-feed-intro',
        type: 'summary',
        label: 'MMA News Feed',
        description: 'Introduce the MMA News Feed where students will find articles.',
        duration: 2
      }
    ]
  },
  {
    id: 'guided-reading',
    title: '2. Guided Reading',
    subtitle: 'Read & Annotate Together',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'read-featured-article',
        type: 'activity',
        label: 'Read Featured Article',
        description: 'Class reads a featured music article together.',
        duration: 6,
        hasTimer: false,
        trackProgress: true
      },
      {
        id: 'annotation-practice',
        type: 'summary',
        label: 'Annotation Practice',
        description: 'How to annotate: color-coded highlighting system.',
        duration: 4
      }
    ]
  },
  {
    id: 'fact-vs-opinion',
    title: '3. Fact vs Opinion',
    subtitle: 'Concept + Game',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'fact-vs-opinion',
        type: 'summary',
        label: 'Fact vs Opinion',
        description: 'Teach the difference between fact and opinion with music examples.',
        duration: 4
      },
      {
        id: 'fact-opinion-game',
        type: 'activity',
        label: 'Fact or Opinion Sorter',
        description: 'STUDENTS PLAY: Sort music statements into fact or opinion!',
        duration: 6,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'reflect',
    title: '4. Reflect',
    subtitle: 'Portfolio Prompt',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'reflection',
        type: 'discussion',
        label: 'Portfolio Reflection',
        description: 'Students reflect on what they learned about reading music journalism.',
        duration: 5
      }
    ]
  }
];

export const lesson1Config = {
  id: 'music-journalist-lesson1',
  lessonPath: '/lessons/music-journalist/lesson1',
  title: 'Read Like a Journalist',
  subtitle: 'How journalists find, read, and analyze music stories',
  duration: 45,
  themeColor: '#1a2744',
  accentColor: '#f0b429',
  learningObjectives: [
    'Define music journalism and identify three types of music writing',
    'Read and annotate a music article using color-coded highlights',
    'Distinguish between fact and opinion in music writing',
    'Reflect on why music journalism matters to artists and fans'
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: 'article-reader',
      title: 'Read Featured Article',
      estimatedTime: '6 min'
    },
    {
      id: 2,
      type: 'fact-opinion-sorter',
      title: 'Fact or Opinion Sorter',
      estimatedTime: '6 min'
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
    id: 'welcome-hook',
    label: 'Welcome Hook',
    description: 'What makes a story worth telling?',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Read Like a Journalist',
      subtitle: 'What makes a story worth telling?',
      sections: [
        {
          heading: 'Think About This',
          bullets: [
            'Your favorite artist just dropped a surprise album at midnight',
            'A local teen wins a national songwriting contest',
            'A concert venue bans phones from all shows',
            'Which of these would YOU want to read about? Why?'
          ]
        },
        {
          heading: 'Today You Will',
          bullets: [
            'Learn what MUSIC JOURNALISM is and why it matters',
            'Read and ANNOTATE a real music article',
            'Tell the difference between FACT and OPINION',
            'Start building your JOURNALIST PORTFOLIO'
          ]
        }
      ]
    }
  },
  {
    id: 'what-is-journalism',
    label: 'What Is Music Journalism?',
    description: 'Introduce three types of music writing: news, review, feature.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'What Is Music Journalism?',
      subtitle: 'Three Types of Music Writing',
      sections: [
        {
          heading: 'NEWS Article',
          bullets: [
            'Reports WHAT HAPPENED — factual, timely, objective',
            'Example: "Billie Eilish announces 2026 world tour with 47 dates across North America"',
            'Answers: Who? What? When? Where? Why?'
          ]
        },
        {
          heading: 'REVIEW',
          bullets: [
            'Shares a critic\'s OPINION about music — argues a point of view',
            'Example: "Kendrick Lamar\'s new album is a masterpiece of storytelling and production"',
            'Includes evidence and reasoning to support the opinion'
          ]
        },
        {
          heading: 'FEATURE Story',
          bullets: [
            'A deep dive into a person, trend, or topic — tells a STORY',
            'Example: "How a 14-year-old bedroom producer became the most streamed artist on SoundCloud"',
            'Uses interviews, quotes, and narrative to engage readers'
          ]
        }
      ]
    }
  },
  {
    id: 'news-feed-intro',
    label: 'MMA News Feed',
    description: 'Introduce the MMA News Feed where students will find articles.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'The MMA News Feed',
      subtitle: 'Your Source for Music Stories',
      sections: [
        {
          heading: 'What Is the MMA News Feed?',
          bullets: [
            'A curated collection of music articles written for YOU',
            'New articles appear throughout the unit',
            'Each article is labeled: NEWS, REVIEW, or FEATURE'
          ]
        },
        {
          heading: 'How You Will Use It',
          bullets: [
            'Read articles and ANNOTATE them with highlights',
            'Save articles to your PORTFOLIO for writing assignments',
            'Use articles as MODELS for your own music journalism'
          ]
        }
      ]
    }
  },
  {
    id: 'read-featured-article',
    label: 'Read Featured Article',
    description: 'Class reads a featured music article together.',
    type: 'activity',
    duration: 6,
    hasTimer: false,
    trackProgress: true,
    presentationView: {
      type: 'activity-banner',
      title: 'Read Featured Article',
      subtitle: 'Open on your Chromebook and read along with the class.'
    }
  },
  {
    id: 'annotation-practice',
    label: 'Annotation Practice',
    description: 'How to annotate: color-coded highlighting system.',
    type: 'summary',
    duration: 4,
    presentationView: {
      type: 'summary',
      title: 'How to Annotate Like a Journalist',
      subtitle: 'Use Colors to Mark What You Find',
      sections: [
        {
          heading: 'Color-Coded Highlighting',
          bullets: [
            'YELLOW = FACT — something that can be proven true',
            'BLUE = VOCABULARY — a word or term you want to remember',
            'GREEN = OPINION — someone\'s personal view or judgment',
            'STAR = SAVE — a quote or detail you want to use later'
          ]
        },
        {
          heading: 'Why Annotate?',
          bullets: [
            'Journalists mark up articles to find KEY INFORMATION quickly',
            'Annotations help you REMEMBER what you read',
            'You will use your annotations when you WRITE your own articles',
            'Practice now — you will annotate every article in this unit'
          ]
        }
      ]
    }
  },
  {
    id: 'fact-vs-opinion',
    label: 'Fact vs Opinion',
    description: 'Teach the difference between fact and opinion with music examples.',
    type: 'summary',
    duration: 4,
    presentationView: {
      type: 'summary',
      title: 'Fact vs Opinion',
      subtitle: 'Can You Tell the Difference?',
      sections: [
        {
          heading: 'What Is a FACT?',
          bullets: [
            'A statement that can be PROVEN true or false',
            '"Beyonce has won 32 Grammy Awards" — checkable, provable',
            '"The Beatles released their first album in 1963" — documented, verifiable',
            '"Drake\'s album Views debuted at #1 on the Billboard 200" — recorded data'
          ]
        },
        {
          heading: 'What Is an OPINION?',
          bullets: [
            'A statement that reflects someone\'s PERSONAL VIEW or judgment',
            '"Beyonce is the greatest performer of all time" — debatable, subjective',
            '"The Beatles changed music forever" — arguable, not provable',
            '"Drake\'s Views is his best album" — a matter of taste'
          ]
        },
        {
          heading: 'Why Does It Matter?',
          bullets: [
            'NEWS articles should be mostly FACTS',
            'REVIEWS are built on OPINIONS supported by evidence',
            'Good journalists know the difference and use both on purpose'
          ]
        }
      ]
    }
  },
  {
    id: 'fact-opinion-game',
    label: 'Fact or Opinion Sorter',
    description: 'STUDENTS PLAY: Sort music statements into fact or opinion!',
    type: 'activity',
    duration: 6,
    hasTimer: true,
    trackProgress: true,
    hasProgress: true,
    presentationView: {
      type: 'fact-opinion-sorter-teacher-game'
    }
  },
  {
    id: 'reflection',
    label: 'Portfolio Reflection',
    description: 'Students reflect on what they learned about reading music journalism.',
    type: 'discussion',
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Portfolio Reflection',
      subtitle: 'Think Like a Journalist',
      sections: [
        {
          heading: 'Reflect on Today',
          bullets: [
            '1. What is one thing you learned about music journalism today?',
            '2. Which type of music writing interests you most: news, review, or feature? Why?',
            '3. Why is it important for a journalist to know the difference between fact and opinion?'
          ]
        },
        {
          heading: 'Looking Ahead',
          bullets: [
            'Next lesson: you will learn to WRITE like a journalist',
            'Start noticing music articles you see online — are they news, reviews, or features?'
          ]
        }
      ]
    }
  },
  {
    id: 'lesson-complete',
    label: 'Lesson Complete',
    description: 'Wrap up and celebrate progress.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Lesson 1 Complete!',
      subtitle: 'You Are Reading Like a Journalist',
      sections: [
        {
          heading: 'What You Learned Today',
          bullets: [
            'Music journalism includes NEWS, REVIEWS, and FEATURES',
            'Annotating with color-coded highlights helps you read actively',
            'Facts can be proven — opinions reflect personal views',
            'Good journalists use both facts and opinions on purpose'
          ]
        },
        {
          heading: 'Next Time',
          bullets: [
            'Lesson 2: Write Like a Journalist',
            'You will draft your first music news article!'
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
    'welcome-hook': 'summary',
    'what-is-journalism': 'summary',
    'news-feed-intro': 'summary',
    'read-featured-article': 'article-reader',
    'annotation-practice': 'summary',
    'fact-vs-opinion': 'summary',
    'fact-opinion-game': 'fact-opinion-sorter',
    'reflection': 'discussion',
    'lesson-complete': 'summary'
  };
  return stageMap[stage];
};

// ========================================
// VOCABULARY FOR THIS LESSON
// ========================================
export const VOCABULARY = [
  { term: 'Music Journalism', definition: 'Writing about music for an audience — reporting, reviewing, and telling stories about artists and the music industry' },
  { term: 'News Article', definition: 'A factual report about something that happened — answers who, what, when, where, and why' },
  { term: 'Review', definition: 'A piece of writing that shares a critic\'s opinion about music, supported by evidence and reasoning' },
  { term: 'Feature Story', definition: 'A longer, in-depth article that tells a story about a person, trend, or topic in music' },
  { term: 'Fact', definition: 'A statement that can be proven true or false with evidence' },
  { term: 'Opinion', definition: 'A statement that reflects someone\'s personal view, belief, or judgment' },
  { term: 'Annotate', definition: 'To mark up a text with highlights, notes, or symbols to identify key information' },
  { term: 'Source', definition: 'Where information comes from — a person, document, or organization that provides facts' },
  { term: 'Headline', definition: 'The title of an article, designed to grab attention and summarize the story' },
  { term: 'Byline', definition: 'The line in an article that tells the reader who wrote it' }
];
