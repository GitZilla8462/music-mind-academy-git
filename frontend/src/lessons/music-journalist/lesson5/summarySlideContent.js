// File: /src/lessons/music-journalist/lesson5/summarySlideContent.js
// All instructional text and content for Music Agent Unit — Lesson 5
// "Launch Day"
// Students present their press kits, class votes on whose artist goes viral
//
// Standards:
// - MU:Re9.1.7 — Apply criteria, give constructive feedback
// - CCSS.ELA-LITERACY.SL.7.4 — Present claims and findings with relevant evidence
// - ISTE 6d — Publish and present for intended audiences

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Welcome
  welcome: {
    title: 'Launch Day',
    subtitle: 'Make your artist go viral',
    essentialQuestion: 'Can you convince someone to care about something you believe in?',
    iCan: 'I can present a persuasive pitch using evidence, music, and visual design to promote an emerging artist.',
    body: 'Today you are not students. You are agents in a room full of people who have never heard of your artist. Your job: make them care. Make them press play. Make them remember the name.',
    teacherNote: 'Set the professional tone immediately. Dim the lights if possible. This is a performance, not a class presentation. The energy matters.'
  },

  // Presentation Norms
  presentationNorms: {
    title: 'How This Works',
    subtitle: 'Norms for Launch Day',
    forPresenters: [
      '2-3 minutes — that is all you get. Make every second count.',
      'TELL the story — do not read your slides word for word',
      'Make eye contact — you are selling, not reporting',
      'You MUST play or reference a song — let the music speak',
      'End with a CALL TO ACTION — tell us what to do'
    ],
    forAudience: [
      'SILENT during pitches — give every agent respect',
      'Snap or clap AFTER — show appreciation',
      'Fill out the FEEDBACK FORM for each presenter',
      'Be ready with ONE QUESTION if time allows',
      'Vote with your HONEST OPINION — which artist deserves it?'
    ],
    teacherNote: 'Read through norms quickly. Enforce silence during presentations — it makes the room feel professional and raises the stakes.'
  },

  // During Presentations
  presentations: {
    title: 'The Pitches',
    subtitle: 'Each agent has 2-3 minutes',
    flow: [
      'Agent presents their 5-slide press kit',
      'Teacher plays the featured track (30-60 seconds)',
      'Quick reaction — snap, clap, or comment',
      'Next agent'
    ],
    teacherNote: 'Keep transitions tight. Use a timer visible to students. Play the track during or after the presentation depending on how the student sets it up. The music is the most important moment — make sure speakers are working and volume is right.'
  },

  // Peer Feedback
  peerFeedback: {
    title: 'Feedback Time',
    subtitle: 'Help Each Other Get Better',
    instructions: [
      'For each presenter, write:',
      '1. ONE THING that convinced you (be specific)',
      '2. ONE THING that could be stronger (be constructive)',
    ],
    starterSentences: {
      convinced: [
        'I was convinced when you said...',
        'The strongest evidence was...',
        'The moment I wanted to listen was...',
        'Your Sound Statement made me...'
      ],
      stronger: [
        'Slide __ could use more...',
        'I wanted to know more about...',
        'The evidence would be stronger if...',
        'The call to action could be more specific, like...'
      ]
    },
    teacherNote: 'Students fill out feedback during or right after each presentation. Keep it short — 1-2 sentences each. Quality matters more than quantity.'
  },

  // The Vote
  theVote: {
    title: 'The Vote',
    subtitle: 'Whose Artist Goes Viral?',
    description: 'You have heard every pitch. You have seen every press kit. Now vote: which artist deserves to blow up? Vote based on the PITCH, not just the music — who made the strongest case?',
    criteria: [
      'Strength of evidence (facts, numbers, sources)',
      'Quality of Sound Statement (could you hear the music?)',
      'Design of the press kit (visual impact)',
      'Delivery of the pitch (confidence, storytelling)',
      'The music itself (did it make you want to listen more?)'
    ],
    teacherNote: 'One vote per student. Real-time results via Firebase. Build suspense — do not reveal results immediately. Count down.'
  },

  // Results & Awards
  results: {
    title: 'The Results',
    subtitle: 'And the Winner Is...',
    awards: [
      {
        name: 'Gone Viral',
        icon: 'trophy',
        color: '#F59E0B',
        description: 'The artist with the most votes — the class chose YOUR artist to blow up',
        criteria: 'Most votes'
      },
      {
        name: 'Best Hook',
        icon: 'zap',
        color: '#EF4444',
        description: 'The opening that grabbed the room — you had us from the first sentence',
        criteria: 'Most compelling opening pitch'
      },
      {
        name: 'Best Sound Statement',
        icon: 'music',
        color: '#3B82F6',
        description: 'We could HEAR the music through your words — that is a real skill',
        criteria: 'Most vivid, specific music description'
      },
      {
        name: 'Strongest Case',
        icon: 'shield',
        color: '#10B981',
        description: 'Your evidence was airtight — facts, numbers, sources, proof',
        criteria: 'Best evidence quality'
      },
      {
        name: 'Best Campaign Design',
        icon: 'palette',
        color: '#8B5CF6',
        description: 'Your press kit looked like it came from a real agency',
        criteria: 'Most professional visual design'
      },
      {
        name: 'Crowd Favorite',
        icon: 'heart',
        color: '#EC4899',
        description: 'The pitch that got the biggest reaction from the room',
        criteria: 'Most audience engagement'
      }
    ],
    teacherNote: 'Reveal the main winner (Gone Viral) last for maximum impact. Other awards can be teacher-chosen or class-nominated. Make it feel like a real awards moment.'
  },

  // Reflection & Celebration
  celebration: {
    title: 'You Did It',
    subtitle: 'What You Just Accomplished',
    reflection: [
      {
        question: 'What did you learn about MUSIC through this project?',
        hint: 'Think about genres, instruments, production, or artists you didn\'t know before.'
      },
      {
        question: 'Did anyone discover a genre they didn\'t expect to like?',
        hint: 'Raise your hand if you found something outside your comfort zone.'
      },
      {
        question: 'What was hardest: the research, the writing, or the presenting?',
        hint: 'All three are skills that get better with practice.'
      },
      {
        question: 'Would you actually follow your artist after this?',
        hint: 'If yes, that means the project worked — you genuinely connected with their music.'
      }
    ],
    skillsSummary: [
      'CRITICAL LISTENING — you can describe music with precision, not just feelings',
      'RESEARCH — you can find and evaluate evidence from credible sources',
      'PERSUASIVE WRITING — you can build an argument backed by facts',
      'VISUAL DESIGN — you can create a campaign that communicates visually',
      'PUBLIC SPEAKING — you can stand up and make a case to a live audience'
    ],
    portfolio: [
      'Research Board with highlighted evidence',
      'Listening Guide with track analysis',
      'Sound Statement',
      '5-Slide Press Kit',
      'Peer feedback given and received'
    ],
    closingMessage: 'You just did what REAL music agents do every day. You found talent that nobody else was paying attention to, you built the case, you designed the campaign, and you presented it to the world. These skills — research, writing, design, and speaking — transfer to any career. The music was just the beginning.',
    teacherNote: 'End on a high note. If time allows, have students share one artist from another student\'s pitch that they want to follow. This validates the work and shows that the pitches actually worked.'
  },

  // Lesson Complete
  lessonComplete: {
    title: 'Unit Complete!',
    subtitle: 'You Are a Music Agent',
    summary: [
      'You discovered an emerging artist that nobody in this class knew about',
      'You researched their story with specific, verifiable evidence',
      'You described their music so precisely that people could hear it through your words',
      'You designed a visual campaign that made people care',
      'You stood up and made your case to a live audience'
    ],
    celebration: 'Go follow your artist. Share their music. You believed in them — now make it real.'
  }
};

// ========================================
// 2. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Pitch', definition: 'A short, persuasive presentation designed to convince someone to take action — the culmination of your research and design' },
  { term: 'Call to Action', definition: 'The specific thing you want your audience to do — follow, listen, share, sign' },
  { term: 'Peer Feedback', definition: 'Constructive comments from classmates — what worked and what could be stronger' },
  { term: 'Go Viral', definition: 'When content spreads rapidly — your goal is to make the class believe your artist is the next one to blow up' }
];
