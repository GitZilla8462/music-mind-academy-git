// File: /lessons/music-journalist/lesson3/lesson3Config.jsx
// Lesson 3: Claim Your Artist
// "What makes an artist worth believing in?"
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students learn:
// - How to choose an artist and commit to researching them
// - The difference between strong and weak evidence
// - How to use the Research Board to save key facts
// - Fact vs opinion (game review from Lesson 1)
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
    subtitle: 'Hook + What Makes an Artist Worth Signing?',
    color: 'blue',
    estimatedTime: 7,
    stages: [
      { id: 'hook', type: 'summary', label: 'Hook', description: '"Imagine scrolling and hearing something that stops you."', duration: 3 },
      { id: 'worth-signing', type: 'summary', label: 'Worth Signing?', description: 'Teach the 4-point checklist: unique sound, story, growth, your gut.', duration: 4 }
    ]
  },
  {
    id: 'choose-artist',
    title: '2. Choose Your Artist',
    subtitle: 'Browse, Listen, Commit',
    color: 'blue',
    estimatedTime: 12,
    stages: [
      { id: 'choose-your-artist', type: 'activity', label: 'Choose Your Artist', description: 'STUDENTS: Browse artists, listen to tracks, pick ONE and lock in.', duration: 12, hasTimer: true, trackProgress: true }
    ]
  },
  {
    id: 'research',
    title: '3. Research Session',
    subtitle: 'Strong vs Weak Evidence + Research',
    color: 'blue',
    estimatedTime: 16,
    stages: [
      { id: 'strong-vs-weak', type: 'summary', label: 'Strong vs Weak Evidence', description: 'Teach: specific facts vs vague opinions.', duration: 4 },
      { id: 'research-session', type: 'activity', label: 'Research Session', description: 'STUDENTS: Read artist profile, highlight key facts. Save 5+ to Research Board.', duration: 12, hasTimer: true, trackProgress: true }
    ]
  },
  {
    id: 'game',
    title: '4. Fact or Opinion',
    subtitle: 'Game Time',
    color: 'blue',
    estimatedTime: 7,
    stages: [
      { id: 'fact-opinion-game', type: 'activity', label: 'Fact or Opinion', description: 'STUDENTS PLAY: Sort music statements!', duration: 7, hasTimer: true, trackProgress: true }
    ]
  },
  {
    id: 'reflect',
    title: '5. Checkpoint',
    subtitle: 'Share + Preview',
    color: 'blue',
    estimatedTime: 3,
    stages: [
      { id: 'checkpoint', type: 'discussion', label: 'Checkpoint', description: '"Tell your neighbor: Who did you pick and why?"', duration: 3 }
    ]
  }
];

export const lesson3Config = {
  id: 'music-journalist-lesson3',
  lessonPath: '/lessons/music-journalist/lesson3',
  title: 'Claim Your Artist',
  subtitle: 'What makes an artist worth believing in?',
  duration: 45,
  themeColor: '#1a2744',
  accentColor: '#f0b429',
  learningObjectives: [
    'Choose an emerging artist to represent as their agent',
    'Distinguish between strong evidence and weak evidence',
    'Use the Research Board to collect and organize key facts',
    'Apply fact vs opinion skills to music research'
  ],
  lessonSections,
  activities: [
    { id: 1, type: 'artist-discovery', title: 'Choose Your Artist', estimatedTime: '12 min' },
    { id: 2, type: 'artist-discovery', title: 'Research Session', estimatedTime: '12 min' },
    { id: 3, type: 'fact-opinion-sorter', title: 'Fact or Opinion', estimatedTime: '7 min' }
  ]
};

export const lessonStages = [
  { id: 'join-code', label: 'Join Code', type: 'waiting' },
  {
    id: 'hook', label: 'Hook', type: 'summary', duration: 3,
    presentationView: {
      type: 'summary', title: 'Claim Your Artist', subtitle: 'Time to Find Your Next Star',
      sections: [
        { heading: 'The Moment', bullets: [
          'Imagine you\'re scrolling through music and you hear something that STOPS you',
          'Something different. Something real. Something that makes you think "this person has IT"',
          'That\'s what we\'re looking for today'
        ]},
        { heading: 'Today\'s Goal', bullets: [
          'Pick ONE emerging artist from the platform',
          'Start researching their story',
          'Save at least 5 strong facts to your Research Board'
        ]}
      ]
    }
  },
  {
    id: 'worth-signing', label: 'Worth Signing?', type: 'summary', duration: 4,
    presentationView: {
      type: 'summary', title: 'What Makes an Artist Worth Signing?', subtitle: 'The Agent\'s Checklist',
      sections: [
        { heading: 'The 4-Point Checklist', bullets: [
          '1. UNIQUE SOUND — Do they sound like everyone else, or do they have their own thing?',
          '2. STORY — Where are they from? What drives them? Why do they make music?',
          '3. GROWTH — Are they getting better? Are more people discovering them?',
          '4. YOUR GUT — Do YOU believe in them? Would you stake your reputation on them?'
        ]},
        { heading: 'Remember', bullets: [
          'Great agents don\'t just follow trends — they FIND talent others miss',
          'No duplicates allowed — first come, first served!',
          'Use what you learned in Lesson 2 — listen like an agent when choosing'
        ]}
      ]
    }
  },
  {
    id: 'choose-your-artist', label: 'Choose Your Artist', type: 'activity', duration: 12, hasTimer: true, trackProgress: true,
    presentationView: { type: 'activity-banner', title: 'Choose Your Artist', subtitle: 'Browse. Listen. Pick ONE. Lock it in.' }
  },
  {
    id: 'strong-vs-weak', label: 'Strong vs Weak Evidence', type: 'summary', duration: 4,
    presentationView: {
      type: 'summary', title: 'Strong vs Weak Evidence', subtitle: 'Not All Facts Are Created Equal',
      sections: [
        { heading: 'STRONG Evidence', bullets: [
          '"Their EP has 12,000 streams in 3 months" — specific, measurable',
          '"They were featured on Bandcamp Daily in October 2025" — verifiable',
          '"She started playing guitar at age 14" — concrete fact',
          '"Their name means \'be strong\' in Urhobo" — specific, interesting'
        ]},
        { heading: 'WEAK Evidence', bullets: [
          '"They\'re really good" — vague, no detail',
          '"Their music is cool" — opinion, not evidence',
          '"A lot of people like them" — how many? who?',
          '"They\'ve been around for a while" — how long?'
        ]},
        { heading: 'Your Goal', bullets: ['Save at least 5 STRONG facts to your Research Board'] }
      ]
    }
  },
  {
    id: 'research-session', label: 'Research Session', type: 'activity', duration: 12, hasTimer: true, trackProgress: true,
    presentationView: { type: 'activity-banner', title: 'Research Session', subtitle: 'Read the artist profile. Highlight key facts. Save 5+ to Research Board.' }
  },
  {
    id: 'fact-opinion-game', label: 'Fact or Opinion', type: 'activity', duration: 7, hasTimer: true, trackProgress: true, hasProgress: true,
    presentationView: { type: 'fact-opinion-sorter-teacher-game' }
  },
  {
    id: 'checkpoint', label: 'Checkpoint', type: 'discussion', duration: 3,
    presentationView: {
      type: 'summary', title: 'Checkpoint', subtitle: 'Share Your Pick',
      sections: [
        { heading: 'Turn to Your Neighbor', bullets: [
          'Who did you pick and WHY?',
          'What\'s one STRONG fact you found about them?',
          'What makes their sound unique?'
        ]},
        { heading: 'Next Time', bullets: [
          'Lesson 4: Design the Campaign',
          'You\'ll take your research and listening notes and build a 5-slide press kit'
        ]}
      ]
    }
  },
  {
    id: 'lesson-complete', label: 'Lesson Complete', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Lesson 3 Complete!', subtitle: 'You\'ve Claimed Your Artist',
      sections: [
        { heading: 'What You Did Today', bullets: [
          'Evaluated artists using the 4-point checklist',
          'Chose YOUR artist to represent',
          'Researched their story with strong evidence',
          'Practiced spotting fact vs opinion'
        ]},
        { heading: 'Come Ready for Lesson 4', bullets: ['Bring your Research Board and Sound Statement — you\'ll build the press kit'] }
      ]
    }
  }
];

export const getActivityForStage = (stage) => {
  const stageMap = {
    'join-code': 'waiting',
    'hook': 'summary',
    'worth-signing': 'summary',
    'choose-your-artist': 'artist-discovery',
    'strong-vs-weak': 'summary',
    'research-session': 'artist-discovery',
    'fact-opinion-game': 'fact-opinion-sorter',
    'checkpoint': 'discussion',
    'lesson-complete': 'summary'
  };
  return stageMap[stage];
};

export const VOCABULARY = [
  { term: 'Evidence', definition: 'Specific facts, quotes, numbers, or data that support your argument' },
  { term: 'Strong Evidence', definition: 'Evidence that is specific, measurable, and verifiable — like dates, numbers, and named sources' },
  { term: 'Weak Evidence', definition: 'Vague statements that don\'t include specific details — like "they\'re really good"' },
  { term: 'Research Board', definition: 'Your collection of highlighted facts and evidence saved from artist profiles' },
  { term: 'Credible Source', definition: 'A trustworthy, reliable place to find accurate information' },
  { term: 'Fact', definition: 'A statement that can be proven true or false with evidence' },
  { term: 'Opinion', definition: 'A statement that reflects someone\'s personal view, belief, or judgment' }
];
