// File: /src/lessons/music-journalist/lesson3/summarySlideContent.js
// All instructional text and content for Music Agent Unit — Lesson 3
// "Build Your Case"
// Students listen critically, write a Sound Statement, form evidence-based opinions
//
// Standards:
// - MU:Re7.1.7 — Select and describe musical elements
// - MU:Re8.1.7 — Interpret expressive intent, citing evidence
// - MU:Cn11.0.7 — Relationships between music, history, culture

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Welcome Hook
  welcomeHook: {
    title: 'Build Your Case',
    subtitle: 'Describe the music so well that someone HAS to press play',
    essentialQuestion: 'How do you describe music so other people can hear it through your words?',
    iCan: 'I can analyze music using specific descriptors and write a Sound Statement that captures an artist\'s unique sound.',
    agenda: [
      'Hook: Two "rock" songs that sound NOTHING alike',
      'Learn the MUSIC DESCRIPTION TOOLKIT (6 ways to describe music)',
      'LISTEN critically to your artist\'s tracks',
      'Write your SOUND STATEMENT',
      'Form your 3 REASONS to make them go viral'
    ],
    hook: {
      title: 'Same Genre, Totally Different',
      prompts: [
        'I am going to play two songs. Both are "rock."',
        'Your challenge: describe the DIFFERENCE using words, not just feelings',
        'If you cannot explain WHY the music is good, you cannot convince anyone else'
      ]
    },
    teacherNote: 'Play two contrasting rock clips (e.g., acoustic folk-rock vs heavy metal). The point: genre labels are not enough. Agents need precise vocabulary to describe what makes their artist unique.'
  },

  // Music Description Toolkit
  descriptionToolkit: {
    title: 'The Music Description Toolkit',
    subtitle: '6 Ways to Describe Any Music',
    tools: [
      {
        name: 'Tempo',
        icon: 'clock',
        color: '#3B82F6',
        description: 'How fast or slow is the music?',
        options: ['Slow', 'Moderate', 'Fast', 'Changes'],
        example: 'The track starts slow and builds to a fast climax'
      },
      {
        name: 'Mood',
        icon: 'heart',
        color: '#EC4899',
        description: 'What feeling does the music create?',
        options: ['Energetic', 'Chill', 'Mysterious', 'Powerful', 'Melancholic', 'Playful'],
        example: 'The mood shifts from mysterious to triumphant when the drums enter'
      },
      {
        name: 'Instrumentation',
        icon: 'music',
        color: '#F59E0B',
        description: 'What sounds and instruments do you hear?',
        options: ['Guitar', 'Synth', 'Drums', 'Vocals', 'Bass', 'Strings', 'Brass', 'Sampler'],
        example: 'Built on turntables and drum machines — no traditional instruments'
      },
      {
        name: 'Hook',
        icon: 'zap',
        color: '#EF4444',
        description: 'What is the catchiest part? What grabs you?',
        options: ['Melody', 'Beat', 'Lyric', 'Riff', 'Drop', 'Vocal run'],
        example: 'The hook is a three-note piano riff that repeats throughout'
      },
      {
        name: 'Production',
        icon: 'sliders',
        color: '#8B5CF6',
        description: 'How is the music recorded and mixed?',
        options: ['Raw', 'Polished', 'Lo-fi', 'Layered', 'Minimalist', 'Experimental'],
        example: 'Lo-fi bedroom production gives it a raw, intimate feel'
      },
      {
        name: 'Influence',
        icon: 'link',
        color: '#10B981',
        description: 'What traditions, genres, or artists does this draw from?',
        options: [],
        example: 'Blends Mongolian folk with modern jazz improvisation'
      }
    ],
    teacherNote: 'Walk through each descriptor with a brief audio example if possible. These 6 tools give students the vocabulary to move from "it sounds cool" to specific, evidence-based descriptions. This directly supports MU:Re7.1.7 and MU:Re8.1.7.'
  },

  // Sound Statement
  soundStatement: {
    title: 'Write Your Sound Statement',
    subtitle: 'One Sentence That Makes Someone Press Play',
    description: 'A Sound Statement captures your artist\'s unique sound in one sentence. It uses specific descriptors, not vague praise. If someone reads your Sound Statement, they should be able to HEAR the music in their head.',
    formula: '[Artist] blends [genre/influence] with [genre/influence], featuring [key sound/instrument] and creating [mood] atmosphere that [what makes it unique].',
    examples: [
      {
        artist: 'Enji',
        statement: 'Enji blends Mongolian folk with jazz improvisation, featuring haunting vocals in three languages and creating a meditative atmosphere that connects ancient traditions to modern music.'
      },
      {
        artist: 'Theon Cross',
        statement: 'Theon Cross blends Caribbean rhythms with London jazz, featuring the tuba as a lead instrument and creating an energetic atmosphere that proves any instrument can be a star.'
      },
      {
        artist: 'Ela Minus',
        statement: 'Ela Minus blends Colombian synth-pop with techno, featuring all-analog hardware synthesizers and creating a pulsing atmosphere that challenges what electronic music can be.'
      }
    ],
    teacherNote: 'The Sound Statement is the centerpiece of Slide 2 in their press kit. It needs to be specific enough that someone who has never heard the artist can imagine the sound. Push students beyond "they sound good" to "they sound LIKE THIS."'
  },

  // Form Your Opinion
  formOpinion: {
    title: 'Why Should This Artist Go Viral?',
    subtitle: '3 Evidence-Backed Reasons',
    description: 'You have researched the story. You have analyzed the music. Now write 3 specific reasons why your artist deserves to blow up — each one backed by evidence.',
    structure: [
      {
        label: 'Reason 1: The Sound',
        prompt: 'What is unique about their music? Reference your Sound Statement and specific songs.',
        example: 'Their music blends two genres nobody else is combining, creating a sound that stands out in every playlist.'
      },
      {
        label: 'Reason 2: The Story',
        prompt: 'What about their background or journey makes people care? Use specific facts.',
        example: 'They recorded their debut album in a bedroom at age 20 and got Pitchfork Best New Music with zero label backing.'
      },
      {
        label: 'Reason 3: The Momentum',
        prompt: 'What evidence shows they are growing? Streams, press, shows, community?',
        example: 'Their EP has 12,000 streams in 3 months and they were featured on Bandcamp Daily — the audience is already finding them.'
      }
    ],
    teacherNote: 'These 3 reasons become Slide 3 of their press kit. Each reason MUST include a specific fact, not just an opinion. Walk around and check for evidence quality.'
  },

  // Source or Not Game Intro
  sourceOrNot: {
    title: 'Source or Not?',
    subtitle: 'Can You Spot a Credible Source?',
    description: 'Agents need to know which information to trust. Not everything online is reliable. Can you tell the difference between a credible music source and random noise?',
    credibleExamples: ['Billboard', 'NPR Music', 'Rolling Stone', 'Pitchfork', 'Bandcamp Daily'],
    notCredibleExamples: ['Anonymous blog post', 'Random Reddit comment', 'YouTube comment section', 'Unverified social media post'],
    teacherNote: 'Quick intro before the game. Students will evaluate 10 sources in the Firebase game. This builds media literacy skills that transfer beyond music.'
  },

  // Preview Next
  previewNext: {
    title: 'What You Are Bringing to Lesson 4',
    subtitle: 'Your Campaign Toolkit',
    items: [
      'Your RESEARCH BOARD with highlighted evidence',
      'Your SOUND STATEMENT — one sentence that captures the sound',
      'Your 3 REASONS why this artist should go viral',
      'Next class: you DESIGN THE CAMPAIGN — the visual, the hook, the pitch'
    ],
    teacherNote: 'Make sure students have all three items saved. Lesson 4 is build time — they cannot build a press kit without research.'
  },

  // Lesson Complete
  lessonComplete: {
    title: 'Lesson 3 Complete!',
    subtitle: 'You Can Hear It. Now Make Others Hear It Too.',
    summary: [
      'You analyzed music using 6 specific descriptors (Tempo, Mood, Instrumentation, Hook, Production, Influence)',
      'You wrote a Sound Statement that captures your artist\'s unique sound in one sentence',
      'You formed 3 evidence-backed reasons why your artist deserves to go viral',
      'You can distinguish credible sources from unreliable ones'
    ],
    nextLesson: {
      title: 'Lesson 4: Design the Campaign',
      preview: 'Build your 5-slide press kit — the visual campaign that makes the world discover your artist.'
    },
    celebration: 'You can describe music in a way that makes people want to listen. That is a real skill.'
  }
};

// ========================================
// 2. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Tempo', definition: 'The speed of the music — slow, moderate, fast, or changing' },
  { term: 'Mood', definition: 'The feeling or emotion the music creates — energetic, chill, mysterious, powerful' },
  { term: 'Instrumentation', definition: 'The specific instruments and sounds used in a piece of music' },
  { term: 'Hook', definition: 'The catchiest, most memorable part of a song — what grabs you and sticks in your head' },
  { term: 'Production', definition: 'How the music was recorded and mixed — raw, polished, lo-fi, layered, experimental' },
  { term: 'Influence', definition: 'The musical traditions, genres, or artists that shaped an artist\'s sound' },
  { term: 'Sound Statement', definition: 'One sentence that captures an artist\'s unique sound using specific descriptors — the core of your pitch' },
  { term: 'EP', definition: 'Extended Play — a release with more songs than a single but fewer than a full album, usually 4-6 tracks' }
];
