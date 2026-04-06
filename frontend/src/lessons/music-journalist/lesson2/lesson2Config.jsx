// File: /lessons/music-journalist/lesson2/lesson2Config.jsx
// Lesson 2: Listen Like an Agent
// "How do you describe music so other people can hear it through your words?"
//
// Standards:
// - MU:Re7.1.7 — Select and describe musical elements
// - MU:Re8.1.7 — Interpret expressive intent, citing evidence from the music
// - MU:Cn11.0.7 — Relationships between music, history, and culture
// ========================================

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson2-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson2-timer';

// ── TRACK POOLS ──────────────────────────────────────
// Teacher plays these 3 tracks (~45s each) for the whole class, one at a time
export const GUIDED_TRACKS = [
  {
    id: 'guided-1',
    title: 'Trench Work',
    artist: 'Ketsa',
    artistId: 'ketsa',
    genre: 'Jazz / Soul / Trip-Hop',
    audioUrl: 'https://media.musicmindacademy.com/artists/ketsa/trench-work.mp3',
    playDuration: 60,
  },
  {
    id: 'guided-2',
    title: "Jenny's Theme",
    artist: 'Jason Shaw',
    artistId: 'jason-shaw',
    genre: 'Country / Acoustic',
    audioUrl: 'https://media.musicmindacademy.com/artists/jason-shaw/jennys-theme.mp3',
    playDuration: 60,
  },
  {
    id: 'guided-3',
    title: 'Horizon Ending',
    artist: 'Soft and Furious',
    artistId: 'soft-and-furious',
    genre: 'Synth Pop / Electronic',
    audioUrl: 'https://media.musicmindacademy.com/artists/soft-and-furious/horizon-ending.mp3',
    playDuration: 60,
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
    subtitle: 'Why Listen Like an Agent?',
    color: 'blue',
    estimatedTime: 3,
    stages: [
      { id: 'hook', type: 'summary', label: 'Why Listen Like an Agent?', description: 'Set up WHY agents need precise vocabulary to describe music.', duration: 3 }
    ]
  },
  {
    id: 'critical-listening',
    title: '2. Critical Listening',
    subtitle: 'Guided + Independent',
    color: 'blue',
    estimatedTime: 27,
    stages: [
      { id: 'guided-listening-intro', type: 'summary', label: 'Guided Listening Intro', description: 'Set up the 3 guided listenings.', duration: 2 },
      { id: 'guided-listening-1', type: 'activity', label: 'Guided Listening 1', description: 'Ketsa — "Trench Work" (Jazz / Soul / Trip-Hop)', duration: 5, hasTimer: true, trackProgress: true },
      { id: 'guided-listening-2', type: 'activity', label: 'Guided Listening 2', description: 'Jason Shaw — "Jenny\'s Theme" (Country / Acoustic)', duration: 5, hasTimer: true, trackProgress: true },
      { id: 'guided-listening-3', type: 'activity', label: 'Guided Listening 3', description: 'Soft and Furious — "Horizon Ending" (Synth Pop)', duration: 5, hasTimer: true, trackProgress: true },
      { id: 'independent-listening', type: 'activity', label: 'Independent Listening', description: 'Students pick 1 of 5 tracks and analyze on their own.', duration: 7, hasTimer: true, trackProgress: true },
      { id: 'listening-share', type: 'discussion', label: 'Share Out', description: 'Students share their analysis with the class.', duration: 5 }
    ]
  },
  {
    id: 'sign-or-pass',
    title: '3. Sign or Pass',
    subtitle: 'Rank + Debate',
    color: 'blue',
    estimatedTime: 7,
    stages: [
      { id: 'sign-or-pass-intro', type: 'summary', label: 'Sign or Pass Intro', description: 'Explain the game and get into groups.', duration: 2 },
      { id: 'sign-or-pass-game', type: 'activity', label: 'Sign or Pass', description: 'Listen to 3 mystery artists. Rank 1–3. Match your group to score!', duration: 5, hasTimer: true, trackProgress: true }
    ]
  },
  {
    id: 'wrap-up',
    title: '4. Wrap Up',
    subtitle: 'Share + Complete',
    color: 'blue',
    estimatedTime: 1,
    stages: [
      { id: 'lesson-complete', type: 'summary', label: 'Lesson Complete', description: 'Review what we learned today.', duration: 1 }
    ]
  }
];

export const lesson2Config = {
  id: 'music-journalist-lesson2',
  lessonPath: '/lessons/music-journalist/lesson2',
  title: 'Listen Like an Agent',
  subtitle: 'How do you describe music so other people can hear it through your words?',
  duration: 50,
  themeColor: '#1a2744',
  accentColor: '#f0b429',
  learningObjectives: [
    'Listen critically and identify musical elements (tempo, mood, instrumentation)',
    'Analyze music independently using the Description Toolkit',
    'Share and defend observations with evidence from the music'
  ],
  lessonSections,
  activities: [
    { id: 1, type: 'guided-listening', title: 'Guided Listening (3 tracks)', estimatedTime: '15 min' },
    { id: 2, type: 'independent-listening', title: 'Independent Listening', estimatedTime: '7 min' },
    { id: 3, type: 'sign-or-pass', title: 'Sign or Pass', estimatedTime: '5 min' }
  ]
};

export const lessonStages = [
  { id: 'join-code', label: 'Join Code', type: 'waiting' },
  {
    id: 'hook', label: 'Why Listen Like an Agent?', type: 'summary', duration: 3,
    presentationView: {
      type: 'summary', title: 'Listen Like an Agent', subtitle: 'Agents don\'t just say "I like it" — they say WHY.',
      sections: [
        { heading: '', bullets: [
          'Last class you explored genres and discovered artists — but liking a song isn\'t enough',
          'To pitch an artist, you need to DESCRIBE their sound so precisely that someone who\'s never heard them can imagine it',
          'Today you\'ll learn the vocabulary real agents use to break down any piece of music',
          'By the end of class, you\'ll be able to listen to a track and tell someone exactly what makes it unique'
        ]}
      ]
    }
  },
  {
    id: 'guided-listening-intro', label: 'Guided Listening Intro', type: 'summary', duration: 2,
    presentationView: {
      type: 'summary', title: 'Guided Listening', subtitle: 'Listen Like an Agent',
      sections: [
        { heading: 'What We\'re Doing', bullets: [
          'We\'ll listen to 3 clips from different emerging artists — this is what real music agents do every day',
          'I\'ll play each clip for the class (45 seconds each)',
          'After each clip, we\'ll fill out a Listening Guide together as a class',
          'We\'ll discuss what we heard before moving to the next track'
        ]},
        { heading: 'What to Listen For', bullets: [
          'Tempo — How fast is it? Use your Italian terms (Largo, Andante, Allegro...)',
          'Dynamics — How loud/soft? Is there a crescendo or decrescendo?',
          'Mood — What feeling does it create?',
          'Instrumentation — What instruments and sounds do you hear?'
        ]}
      ]
    }
  },
  {
    id: 'guided-listening-1', label: 'Guided Listening 1', type: 'activity', duration: 5, hasTimer: true, trackProgress: true,
    presentationView: { type: 'guided-listening-split', trackIndex: 0 }
  },
  {
    id: 'guided-listening-2', label: 'Guided Listening 2', type: 'activity', duration: 5, hasTimer: true, trackProgress: true,
    presentationView: { type: 'guided-listening-split', trackIndex: 1 }
  },
  {
    id: 'guided-listening-3', label: 'Guided Listening 3', type: 'activity', duration: 5, hasTimer: true, trackProgress: true,
    presentationView: { type: 'guided-listening-split', trackIndex: 2 }
  },
  {
    id: 'independent-listening', label: 'Independent Listening', type: 'activity', duration: 7, hasTimer: true, trackProgress: true,
    presentationView: {
      type: 'independent-listening-teacher',
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
    id: 'sign-or-pass-intro', label: 'Sign or Pass Intro', type: 'summary', duration: 2,
    presentationView: {
      type: 'summary', title: 'Sign or Pass', subtitle: 'Would You Sign This Artist?',
      sections: [
        { heading: 'How It Works', bullets: [
          'Get into groups of 2–5',
          'One person creates a group, others join with the 4-digit code',
          'Listen to 3 mystery artists — 15 seconds each',
          'Privately rank them 1–3 by who you\'d sign to your record label',
          'Reveal at the same time — score points when your rankings match!'
        ]},
        { heading: 'The Catch', bullets: [
          'You\'re not just picking your favorite — you\'re trying to predict what your GROUP thinks',
          'When you disagree, explain WHY using what you learned today'
        ]}
      ]
    }
  },
  {
    id: 'sign-or-pass-game', label: 'Sign or Pass', type: 'activity', duration: 5, hasTimer: true, trackProgress: true,
    presentationView: {
      type: 'sign-or-pass-teacher'
    }
  },
  {
    id: 'lesson-complete', label: 'Lesson Complete', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Lesson 2 Complete!', subtitle: 'You\'re Listening Like an Agent',
      sections: [
        { heading: 'Quick Check', bullets: [
          'Name 2 of the 6 ways to describe music from today\'s toolkit.',
          'If you had to sign one artist from Sign or Pass, who would it be and why?',
          'What\'s one thing you heard in a track today that surprised you?'
        ]},
        { heading: 'Next Time: Lesson 3', bullets: [
          'You\'ll pick YOUR artist and start building your case',
          'Think about which artists caught your ear today — you might want to claim one!'
        ]}
      ]
    }
  }
];

export const getActivityForStage = (stage) => ({
  'join-code': 'waiting',
  'hook': 'summary',
  'guided-listening-intro': 'summary',
  'guided-listening-1': 'guided-listening',
  'guided-listening-2': 'guided-listening',
  'guided-listening-3': 'guided-listening',
  'independent-listening': 'independent-listening',
  'listening-share': 'discussion',
  'sign-or-pass-intro': 'summary',
  'sign-or-pass-game': 'sign-or-pass',
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
