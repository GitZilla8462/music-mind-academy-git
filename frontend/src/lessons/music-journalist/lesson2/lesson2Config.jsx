// File: /lessons/music-journalist/lesson2/lesson2Config.jsx
// Lesson 2: Find Your Beat
// "Choose your topic and start building your research board"
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students learn:
// - How to browse the news feed for music stories
// - How to choose a strong research topic
// - How to read articles and save highlights to a research board
// - How to evaluate source credibility (Source or Not? game)
//
// Duration: 45 minutes
// ========================================

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson2-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson2-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook + News Feed',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'welcome-hook',
        type: 'summary',
        label: 'What Story Do YOU Want to Tell?',
        description: 'Hook students with the idea of choosing their own music story.',
        duration: 3
      },
      {
        id: 'browse-news-feed',
        type: 'summary',
        label: 'How to Browse the News Feed',
        description: 'Show students how to navigate the news feed: top stories, search, genre filters, archive.',
        duration: 2
      }
    ]
  },
  {
    id: 'topic-selection',
    title: '2. Topic Selection',
    subtitle: 'Choose Your Beat',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'choosing-topic',
        type: 'summary',
        label: 'Choosing a Strong Topic',
        description: 'Review the checklist for picking a good topic.',
        duration: 3
      },
      {
        id: 'partner-setup',
        type: 'summary',
        label: 'Partner / Solo Setup',
        description: 'Confirm whether students work solo or with a partner (teacher sets in dashboard).',
        duration: 2
      },
      {
        id: 'save-topic',
        type: 'activity',
        label: 'Save Your Topic',
        description: 'STUDENTS WORK: Type in your chosen topic and save it.',
        duration: 5,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'research',
    title: '3. Research',
    subtitle: 'Build Your Board',
    color: 'blue',
    estimatedTime: 15,
    stages: [
      {
        id: 'research-session',
        type: 'activity',
        label: 'Research Session',
        description: 'STUDENTS WORK: Read at least 2 articles and save highlights to your research board.',
        duration: 15,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'game',
    title: '4. Game',
    subtitle: 'Source or Not?',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      {
        id: 'source-or-not-intro',
        type: 'summary',
        label: 'Source or Not? Intro',
        description: 'Explain the news credibility game.',
        duration: 2
      },
      {
        id: 'source-or-not-game',
        type: 'activity',
        label: 'Source or Not? Challenge',
        description: 'CLASS GAME: Can you tell a credible source from a fake one?',
        duration: 6,
        hasTimer: false,
        trackProgress: true
      }
    ]
  },
  {
    id: 'reflect',
    title: '5. Reflect',
    subtitle: 'Portfolio Reflection',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'reflection',
        type: 'discussion',
        label: 'Portfolio Reflection',
        description: 'Reflect on your topic choice and what you learned about credible sources.',
        duration: 4
      },
      {
        id: 'lesson-complete',
        type: 'summary',
        label: 'Lesson Complete',
        description: 'Wrap up and preview what comes next.',
        duration: 1
      }
    ]
  }
];

export const lesson2Config = {
  id: 'music-journalist-lesson2',
  lessonPath: '/lessons/music-journalist/lesson2',
  title: "Find Your Beat",
  subtitle: "Choose your topic and start building your research board",
  learningObjectives: [
    "Browse the news feed to discover music stories across genres",
    "Choose a strong research topic using the checklist criteria",
    "Read articles and save highlights to a research board",
    "Evaluate the credibility of news sources"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "topic-selector",
      title: "Save Your Topic",
      estimatedTime: "5 min"
    },
    {
      id: 2,
      type: "article-reader",
      title: "Research Session",
      estimatedTime: "15 min"
    },
    {
      id: 3,
      type: "source-or-not",
      title: "Source or Not?",
      estimatedTime: "6 min"
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
    label: 'What Story Do YOU Want to Tell?',
    description: 'Hook students with the idea of choosing their own music story.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Find Your Beat',
      subtitle: 'Choose your topic and start building your research board',
      sections: [
        {
          heading: 'What Story Do YOU Want to Tell?',
          bullets: [
            'Every great journalist starts with a question they care about',
            'Today YOU pick the music story you want to investigate',
            'Your topic will drive your entire project',
            'Think: What in music makes you curious? Excited? Confused?'
          ]
        },
        {
          heading: 'Today We Will',
          bullets: [
            'Browse the NEWS FEED for music stories',
            'Choose YOUR TOPIC using a checklist',
            'Start your RESEARCH BOARD with real articles',
            'Play SOURCE OR NOT? to sharpen your credibility skills'
          ]
        }
      ]
    }
  },
  {
    id: 'browse-news-feed',
    label: 'How to Browse the News Feed',
    description: 'Show students how to navigate the news feed: top stories, search, genre filters, archive.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Browsing the News Feed',
      subtitle: 'Find Stories That Interest You',
      sections: [
        {
          heading: 'How to Browse',
          bullets: [
            'TOP STORIES: Curated headlines updated regularly',
            'SEARCH: Type keywords to find specific topics',
            'GENRE FILTERS: Hip-hop, Pop, Rock, Classical, Jazz, Electronic, and more',
            'ARCHIVE: Older stories organized by date and category'
          ]
        },
        {
          heading: 'Pro Tips',
          bullets: [
            'Skim headlines first - do not read every article yet',
            'Star stories that catch your eye',
            'Look for topics with MULTIPLE articles (you will need at least 3)',
            'Think about what connects to your life or to class discussions'
          ]
        }
      ]
    }
  },
  {
    id: 'choosing-topic',
    label: 'Choosing a Strong Topic',
    description: 'Review the checklist for picking a good topic.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Choosing a Strong Topic',
      subtitle: 'Use This Checklist',
      sections: [
        {
          heading: 'Your Topic Should Have',
          bullets: [
            '3+ ARTICLES available to read and cite',
            'Be EXPLAINABLE - you can describe it in one sentence',
            'CONNECT to something we have discussed in class',
            'Be genuinely INTERESTING to you'
          ]
        },
        {
          heading: 'Strong Topic Examples',
          bullets: [
            '"How streaming changed the way artists release music"',
            '"Why K-pop is growing so fast in the U.S."',
            '"The debate over AI-generated music"',
            '"How TikTok turns unknown songs into hits"'
          ]
        },
        {
          heading: 'Weak Topic Examples',
          bullets: [
            '"Music" (too broad)',
            '"My favorite song" (too personal, not researchable)',
            '"A song from 1342" (not enough sources)'
          ]
        }
      ]
    }
  },
  {
    id: 'partner-setup',
    label: 'Partner / Solo Setup',
    description: 'Confirm whether students work solo or with a partner (teacher sets in dashboard).',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Working Solo or With a Partner',
      subtitle: 'Your Teacher Will Set This Up',
      sections: [
        {
          heading: 'If Solo',
          bullets: [
            'You choose your own topic',
            'You build your own research board',
            'You write your own article'
          ]
        },
        {
          heading: 'If Partners',
          bullets: [
            'You and your partner agree on ONE topic',
            'You split the reading - each person reads different articles',
            'You combine highlights on a shared research board',
            'You co-write the final article'
          ]
        },
        {
          heading: 'Either Way',
          bullets: [
            'Everyone is responsible for reading at least 2 articles today',
            'Everyone saves highlights to the research board'
          ]
        }
      ]
    }
  },
  {
    id: 'save-topic',
    label: 'Save Your Topic',
    description: 'STUDENTS WORK: Type in your chosen topic and save it.',
    bonusDescription: 'Make sure your topic passes the checklist!',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Save Your Topic',
      subtitle: 'Time to Commit!',
      sections: [
        {
          heading: 'On Your Screen',
          bullets: [
            '1. Type your topic in the text box',
            '2. Check off each item on the checklist',
            '3. Click SAVE to lock in your topic',
            '4. You can edit your topic later if needed'
          ]
        },
        {
          heading: 'Remember the Checklist',
          bullets: [
            '3+ articles available',
            'Explainable in one sentence',
            'Connects to class',
            'Interesting to YOU'
          ]
        }
      ]
    }
  },
  {
    id: 'research-session',
    label: 'Research Session',
    description: 'STUDENTS WORK: Read at least 2 articles and save highlights to your research board.',
    bonusDescription: 'Early finishers: read a 3rd article or organize your highlights.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 15,
    presentationView: {
      type: 'summary',
      title: 'Research Session',
      subtitle: 'Read, Highlight, Save',
      sections: [
        {
          heading: 'Your Goal',
          bullets: [
            'Read at least 2 ARTICLES related to your topic',
            'HIGHLIGHT key quotes, facts, and ideas',
            'SAVE highlights to your research board',
            'Note the SOURCE for each highlight (author, publication, date)'
          ]
        },
        {
          heading: 'What Makes a Good Highlight?',
          bullets: [
            'A surprising FACT or STATISTIC',
            'A direct QUOTE from someone important',
            'A KEY IDEA that supports your topic',
            'Something you DISAGREE with (that is useful too!)'
          ]
        },
        {
          heading: 'Early Finishers',
          bullets: [
            'Read a 3rd article',
            'Organize your highlights by theme',
            'Write a one-sentence summary of each article'
          ]
        }
      ]
    }
  },
  {
    id: 'source-or-not-intro',
    label: 'Source or Not? Intro',
    description: 'Explain the news credibility game.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Source or Not?',
      subtitle: 'The News Credibility Challenge',
      sections: [
        {
          heading: 'How to Play',
          bullets: [
            '1. You will see a music news headline and source',
            '2. Decide: Is this a CREDIBLE source or NOT?',
            '3. Answer quickly for bonus points!',
            '4. After each round, see WHY the source is credible or not'
          ]
        },
        {
          heading: 'What Makes a Source Credible?',
          bullets: [
            'Published by a known, reputable outlet',
            'Author is identified and has expertise',
            'Facts can be verified elsewhere',
            'NOT just someone\'s opinion blog or anonymous post'
          ]
        }
      ]
    }
  },
  {
    id: 'source-or-not-game',
    label: 'Source or Not? Challenge',
    description: 'CLASS GAME: Can you tell a credible source from a fake one?',
    bonusDescription: 'Can you get a perfect score?',
    hasProgress: true,
    type: 'activity',
    hasTimer: false,
    duration: 6,
    presentationView: {
      type: 'source-or-not-teacher-game'
    }
  },
  {
    id: 'reflection',
    label: 'Portfolio Reflection',
    description: 'Reflect on your topic choice and what you learned about credible sources.',
    type: 'discussion',
    duration: 4,
    presentationView: {
      type: 'summary',
      title: 'Portfolio Reflection',
      subtitle: '',
      sections: [
        {
          heading: 'Reflect on Today',
          bullets: [
            '1. What topic did you choose, and WHY does it interest you?',
            '2. What is one thing you learned from your research today?',
            '3. How will you know if a source is trustworthy for your project?'
          ]
        },
        {
          heading: 'Looking Ahead',
          bullets: [
            'Next class: You will continue building your research board',
            'Goal: 5+ highlights from 3+ articles before you start writing'
          ]
        }
      ]
    }
  },
  {
    id: 'lesson-complete',
    label: 'Lesson Complete',
    description: 'Wrap up and preview what comes next.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Great Work Today!',
      subtitle: 'You Found Your Beat',
      sections: [
        {
          heading: 'What You Accomplished',
          bullets: [
            'Chose a research topic that passes the checklist',
            'Read articles and started your research board',
            'Learned how to spot credible vs. non-credible sources'
          ]
        },
        {
          heading: 'Next Time',
          bullets: [
            'Continue your research with more articles',
            'Start organizing your highlights into an outline',
            'Get ready to write your first draft!'
          ]
        }
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'welcome-hook': 'summary',
    'browse-news-feed': 'summary',
    'choosing-topic': 'summary',
    'partner-setup': 'summary',
    'save-topic': 'topic-selector',
    'research-session': 'article-reader',
    'source-or-not-intro': 'summary',
    'source-or-not-game': 'source-or-not',
    'reflection': 'discussion',
    'lesson-complete': 'summary'
  };
  return stageMap[stage];
};
