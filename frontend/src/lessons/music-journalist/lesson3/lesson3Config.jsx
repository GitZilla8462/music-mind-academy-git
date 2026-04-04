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

// ── TRACK POOLS ──────────────────────────────────────
// Teacher plays these 3 tracks (~30s each) for the whole class
export const GUIDED_TRACKS = [
  {
    id: 'guided-1',
    title: 'Any Single Thing',
    artist: 'Pierce Murphy',
    artistId: 'pierce-murphy',
    genre: 'Blues Rock',
    audioUrl: 'https://media.musicmindacademy.com/artists/pierce-murphy/any-single-thing.mp3',
    playDuration: 30,
  },
  {
    id: 'guided-2',
    title: "Jenny's Theme",
    artist: 'Jason Shaw',
    artistId: 'jason-shaw',
    genre: 'Country / Acoustic',
    audioUrl: 'https://media.musicmindacademy.com/artists/jason-shaw/jennys-theme.mp3',
    playDuration: 30,
  },
  {
    id: 'guided-3',
    title: 'Horizon Ending',
    artist: 'Soft and Furious',
    artistId: 'soft-and-furious',
    genre: 'Synth Pop / Electronic',
    audioUrl: 'https://media.musicmindacademy.com/artists/soft-and-furious/horizon-ending.mp3',
    playDuration: 30,
  },
];

// Students pick 1 of these 5 tracks for independent listening
export const INDEPENDENT_TRACKS = [
  {
    id: 'indie-1',
    title: 'In Tune (Remix 2)',
    artist: 'Kellee Maize',
    artistId: 'kellee-maize',
    genre: 'Hip-Hop',
    audioUrl: 'https://media.musicmindacademy.com/artists/kellee-maize/in-tune-remix-2.mp3',
  },
  {
    id: 'indie-2',
    title: 'Foggy Headed',
    artist: 'HoliznaCC0',
    artistId: 'holiznacc0',
    genre: 'Lo-fi Hip-Hop',
    audioUrl: 'https://media.musicmindacademy.com/artists/holiznacc0/foggy-headed.mp3',
  },
  {
    id: 'indie-3',
    title: 'spectrogram',
    artist: 'Fog Lake',
    artistId: 'fog-lake',
    genre: 'Indie Rock / Shoegaze',
    audioUrl: 'https://media.musicmindacademy.com/artists/fog-lake/spectrogram.mp3',
  },
  {
    id: 'indie-4',
    title: 'Darling Corina',
    artist: 'David Mumford',
    artistId: 'david-mumford',
    genre: 'Folk',
    audioUrl: 'https://media.musicmindacademy.com/artists/david-mumford/darling-corina.mp3',
  },
  {
    id: 'indie-5',
    title: 'Follow',
    artist: 'Pamela Yuen',
    artistId: 'pamela-yuen',
    genre: 'Pop / Cinematic',
    audioUrl: 'https://media.musicmindacademy.com/artists/pamela-yuen/follow.mp3',
  },
];

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
    id: 'critical-listening',
    title: '2. Critical Listening',
    subtitle: 'Guided + Independent',
    color: 'blue',
    estimatedTime: 27,
    stages: [
      { id: 'guided-listening', type: 'activity', label: 'Guided Listening', description: 'Teacher plays 3 tracks. Students fill out Listening Guide together.', duration: 15, hasTimer: true, trackProgress: true },
      { id: 'independent-listening', type: 'activity', label: 'Independent Listening', description: 'Students pick 1 of 5 tracks and analyze on their own.', duration: 7, hasTimer: true, trackProgress: true },
      { id: 'listening-share', type: 'discussion', label: 'Share Out', description: 'Students share their analysis with the class.', duration: 5 }
    ]
  },
  {
    id: 'sound-statement',
    title: '3. Sound Statement',
    subtitle: 'Describe + Defend',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      { id: 'sound-statement-share', type: 'discussion', label: 'Sound Statement Share', description: '4-5 students read their Sound Statement aloud.', duration: 5 }
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
  duration: 50,
  themeColor: '#1a2744',
  accentColor: '#f0b429',
  learningObjectives: [
    'Listen critically and identify musical elements (tempo, mood, instrumentation)',
    'Analyze music independently using the Description Toolkit',
    'Share and defend observations with evidence from the music',
    'Evaluate source credibility'
  ],
  lessonSections,
  activities: [
    { id: 1, type: 'guided-listening', title: 'Guided Listening', estimatedTime: '15 min' },
    { id: 2, type: 'independent-listening', title: 'Independent Listening', estimatedTime: '7 min' },
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
          'Listen to music together and analyze it as a class',
          'Then pick a track and analyze it on your own'
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
        { heading: 'How We\'ll Use It', bullets: [
          'First: I\'ll play 3 tracks and we\'ll analyze them TOGETHER as a class',
          'Then: You\'ll pick a track and analyze it ON YOUR OWN',
          'Use ALL 6 categories for each track you listen to'
        ]}
      ]
    }
  },
  {
    id: 'guided-listening', label: 'Guided Listening', type: 'activity', duration: 15, hasTimer: true, trackProgress: true,
    presentationView: { type: 'guided-listening-player' }
  },
  {
    id: 'independent-listening', label: 'Independent Listening', type: 'activity', duration: 7, hasTimer: true, trackProgress: true,
    presentationView: {
      type: 'activity-banner',
      title: 'Your Turn: Independent Listening',
      subtitle: 'Pick a track. Listen. Fill out your Listening Guide.'
    }
  },
  {
    id: 'listening-share', label: 'Share Out', type: 'discussion', duration: 5,
    presentationView: {
      type: 'summary', title: 'Share Your Analysis', subtitle: 'What Did You Hear?',
      sections: [
        { heading: 'Share Out', bullets: [
          'What track did you pick and why?',
          'What instruments or sounds did you hear?',
          'What mood did the music create?',
          'What was the catchiest part (the hook)?'
        ]},
        { heading: 'Listen to Each Other', bullets: [
          'Did anyone pick the same track but hear different things?',
          'What descriptions helped you "hear" the music through their words?'
        ]}
      ]
    }
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
          'Your listening analysis from today',
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
          'Analyzed 3 tracks together as a class',
          'Independently analyzed a track on your own',
          'Shared your analysis and heard how others described the same music'
        ]}
      ]
    }
  }
];

export const getActivityForStage = (stage) => ({
  'join-code': 'waiting',
  'hook': 'summary',
  'description-toolkit': 'summary',
  'guided-listening': 'guided-listening',
  'independent-listening': 'independent-listening',
  'listening-share': 'discussion',
  'sound-statement-share': 'discussion',
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
