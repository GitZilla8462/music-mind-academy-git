// File: /lessons/music-journalist/lesson3/lesson3Config.jsx
// Lesson 3: Listen Like a Critic
// "How do you describe music so other people can hear it through your words?"
//
// Standards:
// - MU:Re7.1.7 — Select and describe musical elements
// - MU:Re8.1.7 — Interpret expressive intent, citing evidence from the music
// - MU:Cn11.0.7 — Relationships between music, history, and culture
// ========================================

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson3-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson3-timer';

export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook + Music Description Toolkit',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      { id: 'hook', type: 'summary', label: 'Hook', description: 'Play two clips of "rock" that sound totally different.', duration: 3 },
      { id: 'description-toolkit', type: 'summary', label: 'Description Toolkit', description: 'Teach: tempo, mood, instrumentation, hook, production, influence.', duration: 5 }
    ]
  },
  {
    id: 'listening-session',
    title: '2. Critical Listening',
    subtitle: 'Listen + Analyze',
    color: 'blue',
    estimatedTime: 15,
    stages: [
      { id: 'critical-listening', type: 'activity', label: 'Critical Listening', description: 'STUDENTS: Listen to 2-3 tracks. Fill out Listening Guide for each.', duration: 15, hasTimer: true, trackProgress: true }
    ]
  },
  {
    id: 'sound-statement',
    title: '3. Sound Statement',
    subtitle: 'Describe + Defend',
    color: 'blue',
    estimatedTime: 12,
    stages: [
      { id: 'sound-statement-share', type: 'discussion', label: 'Sound Statement Share', description: '4-5 students read their Sound Statement aloud.', duration: 5 },
      { id: 'form-opinion', type: 'activity', label: 'Form Your Opinion', description: 'STUDENTS: "Why should this artist be signed? Give 3 reasons with evidence."', duration: 7, hasTimer: true, trackProgress: true }
    ]
  },
  {
    id: 'game',
    title: '4. Source or Not?',
    subtitle: 'Credibility Game',
    color: 'blue',
    estimatedTime: 7,
    stages: [
      { id: 'source-or-not-game', type: 'activity', label: 'Source or Not?', description: 'STUDENTS PLAY: Judge source credibility!', duration: 7, hasTimer: true, trackProgress: true }
    ]
  },
  {
    id: 'preview',
    title: '5. Preview',
    subtitle: 'Next Steps',
    color: 'blue',
    estimatedTime: 3,
    stages: [
      { id: 'preview-next', type: 'summary', label: 'Preview', description: '"Next class you build the press kit."', duration: 3 }
    ]
  }
];

export const lesson3Config = {
  id: 'music-journalist-lesson3',
  lessonPath: '/lessons/music-journalist/lesson3',
  title: 'Listen Like a Critic',
  subtitle: 'How do you describe music so other people can hear it through your words?',
  duration: 45,
  themeColor: '#1a2744',
  accentColor: '#f0b429',
  learningObjectives: [
    'Listen critically and identify musical elements (tempo, mood, instrumentation)',
    'Write a Sound Statement describing an artist\'s unique sound',
    'Form an evidence-based opinion about why their artist deserves to be signed',
    'Evaluate source credibility'
  ],
  lessonSections,
  activities: [
    { id: 1, type: 'listening-guide', title: 'Critical Listening', estimatedTime: '15 min' },
    { id: 2, type: 'listening-guide', title: 'Form Your Opinion', estimatedTime: '7 min' },
    { id: 3, type: 'source-or-not', title: 'Source or Not?', estimatedTime: '7 min' }
  ]
};

export const lessonStages = [
  { id: 'join-code', label: 'Join Code', type: 'waiting' },
  {
    id: 'hook', label: 'Hook', type: 'summary', duration: 3,
    presentationView: {
      type: 'summary', title: 'Listen Like a Critic', subtitle: 'Can You Hear the Difference?',
      sections: [
        { heading: 'Listen to These Two Clips', bullets: [
          'Both of these artists are labeled "rock"',
          'But they sound COMPLETELY different',
          'How would you explain that difference to someone who hasn\'t heard them?'
        ]},
        { heading: 'Today\'s Challenge', bullets: [
          'Learn the vocabulary to DESCRIBE what you hear',
          'Listen to YOUR artist\'s music and analyze it',
          'Write a Sound Statement — one sentence that captures their unique sound'
        ]}
      ]
    }
  },
  {
    id: 'description-toolkit', label: 'Description Toolkit', type: 'summary', duration: 5,
    presentationView: {
      type: 'summary', title: 'The Music Description Toolkit', subtitle: '6 Ways to Describe What You Hear',
      sections: [
        { heading: 'The Toolkit', bullets: [
          'TEMPO — How fast is the music? (Slow, Moderate, Fast, Changes)',
          'MOOD — What feeling does it create? (Energetic, Chill, Mysterious, Powerful...)',
          'INSTRUMENTATION — What instruments or sounds do you hear?',
          'HOOK — What\'s the catchy part that grabs your attention?',
          'PRODUCTION — How is the overall sound shaped? (Raw, Polished, Lo-fi, Layered)',
          'INFLUENCE — Who do they remind you of? What genre traditions do they draw from?'
        ]},
        { heading: 'Your Listening Guide', bullets: [
          'For each track you listen to, fill in ALL 6 categories',
          'Then write a SOUND STATEMENT — one sentence describing their unique sound',
          'Example: "Enji blends Mongolian folk with jazz, featuring haunting vocals in three languages"'
        ]}
      ]
    }
  },
  {
    id: 'critical-listening', label: 'Critical Listening', type: 'activity', duration: 15, hasTimer: true, trackProgress: true,
    presentationView: { type: 'activity-banner', title: 'Critical Listening Session', subtitle: 'Listen to 2-3 tracks. Fill out the Listening Guide. Write your Sound Statement.' }
  },
  {
    id: 'sound-statement-share', label: 'Sound Statement Share', type: 'discussion', duration: 5,
    presentationView: {
      type: 'summary', title: 'Sound Statement Share', subtitle: 'Can We Hear the Music Through Your Words?',
      sections: [
        { heading: 'Share Out', bullets: [
          '4-5 agents will read their Sound Statement aloud',
          'Class: "Could you hear the music through their words?"',
          'What made certain descriptions more vivid than others?'
        ]}
      ]
    }
  },
  {
    id: 'form-opinion', label: 'Form Your Opinion', type: 'activity', duration: 7, hasTimer: true, trackProgress: true,
    presentationView: { type: 'activity-banner', title: 'Form Your Opinion', subtitle: '"Why should this artist be signed?" Give 3 reasons with evidence.' }
  },
  {
    id: 'source-or-not-game', label: 'Source or Not?', type: 'activity', duration: 7, hasTimer: true, trackProgress: true, hasProgress: true,
    presentationView: { type: 'source-or-not-teacher-game' }
  },
  {
    id: 'preview-next', label: 'Preview', type: 'summary', duration: 3,
    presentationView: {
      type: 'summary', title: 'Next Class: Build the Press Kit', subtitle: 'Bring Your Research + Sound Statement',
      sections: [
        { heading: 'What You Need for Lesson 4', bullets: [
          'Your Research Board with 5+ strong facts',
          'Your Sound Statement from today',
          'Your 3 reasons for signing your artist',
          'Next class: turn all of this into a 5-slide PRESS KIT'
        ]}
      ]
    }
  },
  {
    id: 'lesson-complete', label: 'Lesson Complete', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Lesson 3 Complete!', subtitle: 'You\'re Listening Like a Critic',
      sections: [
        { heading: 'What You Did Today', bullets: [
          'Learned 6 ways to describe music (tempo, mood, instrumentation, hook, production, influence)',
          'Listened critically to your artist\'s tracks',
          'Wrote a Sound Statement capturing their unique sound',
          'Formed an evidence-based opinion on why they should be signed'
        ]}
      ]
    }
  }
];

export const getActivityForStage = (stage) => ({
  'join-code': 'waiting',
  'hook': 'summary',
  'description-toolkit': 'summary',
  'critical-listening': 'listening-guide',
  'sound-statement-share': 'discussion',
  'form-opinion': 'listening-guide',
  'source-or-not-game': 'source-or-not',
  'preview-next': 'summary',
  'lesson-complete': 'summary'
})[stage];

export const VOCABULARY = [
  { term: 'Tempo', definition: 'The speed of the music — slow, moderate, fast, or changing' },
  { term: 'Mood', definition: 'The emotional feeling the music creates — energetic, melancholy, peaceful, intense' },
  { term: 'Instrumentation', definition: 'The specific instruments and sounds used in a song' },
  { term: 'Hook', definition: 'The catchy part of a song that grabs your attention and sticks in your head' },
  { term: 'Production', definition: 'How a song is recorded, mixed, and arranged — the overall sound quality and style' },
  { term: 'Influence', definition: 'Other artists, genres, or traditions that shaped an artist\'s sound' },
  { term: 'Sound Statement', definition: 'A one-sentence description capturing an artist\'s unique sound and what makes them different' },
  { term: 'EP', definition: 'Extended Play — a release with 4-6 songs, between a single and a full album' }
];
