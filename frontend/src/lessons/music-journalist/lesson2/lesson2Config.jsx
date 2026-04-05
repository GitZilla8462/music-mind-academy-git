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
      { id: 'guided-listening-intro', type: 'summary', label: 'Guided Listening Intro', description: 'Set up the 3 guided listenings.', duration: 2 },
      { id: 'guided-listening-1', type: 'activity', label: 'Guided Listening 1', description: 'Ketsa — "Trench Work" (Jazz / Soul / Trip-Hop)', duration: 5, hasTimer: true, trackProgress: true },
      { id: 'guided-listening-2', type: 'activity', label: 'Guided Listening 2', description: 'Jason Shaw — "Jenny\'s Theme" (Country / Acoustic)', duration: 5, hasTimer: true, trackProgress: true },
      { id: 'guided-listening-3', type: 'activity', label: 'Guided Listening 3', description: 'Soft and Furious — "Horizon Ending" (Synth Pop)', duration: 5, hasTimer: true, trackProgress: true },
      { id: 'independent-listening', type: 'activity', label: 'Independent Listening', description: 'Students pick 1 of 5 tracks and analyze on their own.', duration: 7, hasTimer: true, trackProgress: true },
      { id: 'listening-share', type: 'discussion', label: 'Share Out', description: 'Students share their analysis with the class.', duration: 5 }
    ]
  },
  {
    id: 'wrap-up',
    title: '3. Wrap Up',
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
    { id: 2, type: 'independent-listening', title: 'Independent Listening', estimatedTime: '7 min' }
  ]
};

export const lessonStages = [
  { id: 'join-code', label: 'Join Code', type: 'waiting' },
  {
    id: 'hook', label: 'Hook', type: 'summary', duration: 3,
    presentationView: {
      type: 'summary', title: 'Listen Like an Agent', subtitle: 'Can You Hear the Difference?',
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
    id: 'lesson-complete', label: 'Lesson Complete', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Lesson 2 Complete!', subtitle: 'You\'re Listening Like an Agent',
      sections: [
        { heading: 'What You Did Today', bullets: [
          'Learned 6 ways to describe music (tempo, mood, instrumentation, hook, production, influence)',
          'Analyzed 3 tracks together as a class',
          'Independently analyzed a track on your own',
          'Shared your analysis and heard how others described the same music'
        ]},
        { heading: 'Come Ready for Lesson 3', bullets: ['You\'ll pick your artist and start building your case with real evidence'] }
      ]
    }
  }
];

export const getActivityForStage = (stage) => ({
  'join-code': 'waiting',
  'hook': 'summary',
  'description-toolkit': 'summary',
  'guided-listening-intro': 'summary',
  'guided-listening-1': 'guided-listening',
  'guided-listening-2': 'guided-listening',
  'guided-listening-3': 'guided-listening',
  'independent-listening': 'independent-listening',
  'listening-share': 'discussion',
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
