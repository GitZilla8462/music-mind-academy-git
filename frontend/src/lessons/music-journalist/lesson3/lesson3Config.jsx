// File: /lessons/music-journalist/lesson3/lesson3Config.jsx
// Lesson 3: Claim Your Artist
// "What makes an artist worth believing in?"
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students learn:
// - The 4-point checklist for evaluating an artist (Unique Sound, Compelling Story, Signs of Growth, Gut Feeling)
// - The difference between strong and weak evidence
// - How to classify statements as fact vs opinion
// - How to build a structured Scouting Report for one artist
//
// Standards:
// - MU:Cn10.0.7 — Personal interests influence musical selection
// - CCSS.ELA-LITERACY.RI.7.1 — Cite textual evidence
// - CCSS.ELA-LITERACY.W.7.7 — Short research using multiple sources
// ========================================

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson3-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson3-timer';

export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook + 4-Point Checklist',
    color: 'blue',
    estimatedTime: 7,
    stages: [
      { id: 'hook', type: 'summary', label: 'Hook', description: '"Imagine scrolling and hearing something that stops you."', duration: 2 },
      { id: 'checklist-overview', type: 'summary', label: '4 Points Overview', description: 'Here are 4 things agents look for before signing an artist.', duration: 1 },
      { id: 'checklist-1', type: 'summary', label: 'Unique Sound', description: 'Point 1 of 4 — What makes their sound different?', duration: 1 },
      { id: 'checklist-2', type: 'summary', label: 'Compelling Story', description: 'Point 2 of 4 — Why do they make music?', duration: 1 },
      { id: 'checklist-3', type: 'summary', label: 'Signs of Growth', description: 'Point 3 of 4 — Are more people discovering them?', duration: 1 },
      { id: 'checklist-4', type: 'summary', label: 'Gut Feeling', description: 'Point 4 of 4 — Do YOU believe in them?', duration: 1 },
      { id: 'facts-vs-opinions', type: 'summary', label: 'Facts vs. Opinions', description: 'How to tell a fact from an opinion.', duration: 1 },
      { id: 'strong-vs-weak', type: 'summary', label: 'Strong vs. Weak Evidence', description: 'What makes evidence strong or weak?', duration: 1 }
    ]
  },
  {
    id: 'game',
    title: '2. Artists Worth Signing',
    subtitle: 'Class Game',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      { id: 'fact-opinion-game', type: 'activity', label: 'Artists Worth Signing', description: 'STUDENTS: Vote on statements — fact or opinion, strong or weak evidence.', duration: 5, hasTimer: true, trackProgress: true, hasProgress: true },
      { id: 'fact-opinion-results', type: 'activity', label: 'Results', description: 'Show the winner podium and leaderboard.', duration: 1 }
    ]
  },
  {
    id: 'scouting',
    title: '3. Scouting Report',
    subtitle: 'Build Your Report',
    color: 'blue',
    estimatedTime: 15,
    stages: [
      { id: 'scouting-report', type: 'activity', label: 'Scouting Report', description: 'STUDENTS: Complete 3 slides for the assigned artist.', duration: 15, hasTimer: true, trackProgress: true }
    ]
  },
  {
    id: 'reflect',
    title: '4. Share Out',
    subtitle: 'Partner Discussion',
    color: 'blue',
    estimatedTime: 3,
    stages: [
      { id: 'share-out', type: 'activity', label: 'Share Out', description: '"Which of the four points felt strongest?"', duration: 3 }
    ]
  },
  {
    id: 'bonus',
    title: '5. Bonus',
    subtitle: 'Would You Sign Them?',
    color: 'yellow',
    estimatedTime: 7,
    stages: [
      { id: 'would-you-sign-them', type: 'activity', label: 'Would You Sign Them?', description: 'STUDENTS PLAY: Match evidence to the 4-point checklist!', duration: 7, hasTimer: true, trackProgress: true }
    ]
  }
];

export const lesson3Config = {
  id: 'music-journalist-lesson3',
  lessonPath: '/lessons/music-journalist/lesson3',
  title: 'Claim Your Artist',
  subtitle: 'What makes an artist worth believing in?',
  duration: 32,
  themeColor: '#1a2744',
  accentColor: '#f0b429',
  learningObjectives: [
    'Evaluate artists using the 4-point checklist',
    'Distinguish between strong evidence and weak evidence',
    'Classify statements as fact or opinion',
    'Build a structured Scouting Report with evidence'
  ],
  lessonSections,
  activities: [
    { id: 1, type: 'fact-opinion-sorter', title: 'Fact or Opinion', estimatedTime: '5 min' },
    { id: 2, type: 'claim-artist-report', title: 'Scouting Report', estimatedTime: '15 min' }
  ]
};

export const lessonStages = [
  { id: 'join-code', label: 'Join Code', type: 'waiting' },
  {
    id: 'hook', label: 'Hook', type: 'summary', duration: 2,
    presentationView: {
      type: 'summary', title: 'Claim Your Artist', subtitle: 'Time to Find Your Next Star',
      sections: [
        { heading: 'The Moment', bullets: [
          'Imagine you\'re scrolling through music and you hear something that STOPS you',
          'That\'s the moment every talent agent lives for',
          'Today you\'re going to find that artist'
        ]}
      ]
    }
  },
  {
    id: 'checklist-overview', label: '4 Points Overview', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'What Makes an Artist Worth Signing?', subtitle: 'The 4-Point Checklist',
      sections: [
        { heading: '', bullets: [
          '1. Unique Sound — Do they sound different from everyone else?',
          '2. Compelling Story — Why do they make music? What drives them?',
          '3. Signs of Growth — Are more people discovering them?',
          '4. Gut Feeling — Do YOU believe in this artist?'
        ]}
      ]
    }
  },
  {
    id: 'checklist-1', label: 'Unique Sound', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Unique Sound', subtitle: 'Point 1 of 4',
      sections: [
        { heading: '', bullets: [
          'Their music doesn\'t sound like anyone else in the library',
          'You could pick their song out of a playlist without seeing the name',
          'Their genre, style, or production has something you haven\'t heard before'
        ]}
      ]
    }
  },
  {
    id: 'checklist-2', label: 'Compelling Story', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Compelling Story', subtitle: 'Point 2 of 4',
      sections: [
        { heading: '', bullets: [
          'There\'s a real reason they started making music — loss, struggle, obsession, identity',
          'Their background makes you more interested in what they create',
          'The story makes the music mean something more than just sound'
        ]}
      ]
    }
  },
  {
    id: 'checklist-3', label: 'Signs of Growth', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Signs of Growth', subtitle: 'Point 3 of 4',
      sections: [
        { heading: '', bullets: [
          'Their streams, followers, or shows have increased over time',
          'They\'ve been releasing music consistently, not just once',
          'Other people — blogs, playlists, venues — are starting to notice them'
        ]}
      ]
    }
  },
  {
    id: 'checklist-4', label: 'Gut Feeling', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Gut Feeling', subtitle: 'Point 4 of 4',
      sections: [
        { heading: '', bullets: [
          'You keep replaying their music even when you\'re not sure why',
          'Something about them feels different from everyone else you heard',
          'You\'d be disappointed if someone else signed them first'
        ]}
      ]
    }
  },
  {
    id: 'facts-vs-opinions', label: 'Facts vs. Opinions', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Facts vs. Opinions', subtitle: 'Know the Difference',
      sections: [
        { heading: '', bullets: [
          'A FACT can be proven true or false — "They have 50,000 streams on Spotify"',
          'An OPINION is a personal view — "They\'re the best new artist out right now"',
          'Agents need facts to convince a label — opinions alone won\'t close the deal'
        ]}
      ]
    }
  },
  {
    id: 'strong-vs-weak', label: 'Strong vs. Weak Evidence', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Strong vs. Weak Evidence', subtitle: 'Not All Facts Hit the Same',
      sections: [
        { heading: '', bullets: [
          'STRONG evidence is specific and verifiable — names, numbers, dates, sources',
          'WEAK evidence is vague and unprovable — "a lot of people like them"',
          'Your job as an agent: back up every claim with the strongest evidence you can find'
        ]}
      ]
    }
  },
  {
    id: 'fact-opinion-game', label: 'Artists Worth Signing', type: 'activity', duration: 5, hasTimer: true, trackProgress: true, hasProgress: true,
    description: 'STUDENTS: Vote on statements — fact or opinion, strong or weak evidence.',
    presentationView: { type: 'fact-opinion-sorter-teacher-game' }
  },
  {
    id: 'fact-opinion-results', label: 'Results', type: 'activity', duration: 1,
    presentationView: { type: 'fact-opinion-sorter-results' }
  },
  {
    id: 'scouting-report', label: 'Scouting Report', type: 'activity', duration: 15, hasTimer: true, trackProgress: true,
    presentationView: { type: 'scouting-report-teacher' },
  },
  {
    id: 'share-out', label: 'Share Out', type: 'activity', duration: 3,
    presentationView: {
      type: 'claim-artist-share-teacher',
    },
    studentDirections: [
      { text: 'Find a partner or small group near you' },
      { text: 'Which of the four points felt strongest for this artist?' },
      { text: 'What was your best piece of strong evidence?' },
      { text: 'Would you sign them — yes or no?' },
    ],
  },
  {
    id: 'would-you-sign-them', label: 'Would You Sign Them?', type: 'activity', duration: 7, hasTimer: true, trackProgress: true,
    presentationView: { type: 'would-you-sign-them-teacher' }
  },
  {
    id: 'lesson-complete', label: 'Lesson Complete', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Lesson 3 Complete!', subtitle: 'You Know How to Evaluate an Artist',
      sections: [
        { heading: 'What You Did Today', bullets: [
          'Learned the 4-Point Checklist for evaluating artists',
          'Practiced telling facts from opinions about your artist',
          'Built a Scouting Report using real evidence'
        ]},
        { heading: 'Come Ready for Lesson 4', bullets: ['You\'ll pick your OWN artist and start building your press kit presentation'] }
      ]
    }
  }
];

export const getActivityForStage = (stage) => {
  const stageMap = {
    'join-code': 'waiting',
    'hook': 'summary',
    'checklist-overview': 'summary',
    'checklist-1': 'summary',
    'checklist-2': 'summary',
    'checklist-3': 'summary',
    'checklist-4': 'summary',
    'facts-vs-opinions': 'summary',
    'strong-vs-weak': 'summary',
    'fact-opinion-game': 'fact-opinion-sorter',
    'fact-opinion-results': 'fact-opinion-sorter',
    'scouting-report': 'claim-artist-report',
    'share-out': 'claim-artist-report',
    'would-you-sign-them': 'would-you-sign-them',
    'lesson-complete': 'summary'
  };
  return stageMap[stage];
};

export const VOCABULARY = [
  { term: 'Evidence', definition: 'Specific facts, quotes, numbers, or data that support your argument' },
  { term: 'Strong Evidence', definition: 'Evidence that is specific, measurable, and verifiable — like dates, numbers, and named sources' },
  { term: 'Weak Evidence', definition: 'Vague statements that don\'t include specific details — like "they\'re really good"' },
  { term: 'Fact', definition: 'A statement that can be proven true or false with evidence' },
  { term: 'Opinion', definition: 'A statement that reflects someone\'s personal view, belief, or judgment' },
  { term: '4-Point Checklist', definition: 'Unique Sound, Compelling Story, Signs of Growth, Gut Feeling — the four things agents look for' }
];
