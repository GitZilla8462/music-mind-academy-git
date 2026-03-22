// File: /lessons/music-journalist/lesson4/lesson4Config.jsx
// Lesson 4: Build the Press Kit
// "How do you tell someone's story in a way that makes people care?"
//
// Standards:
// - CCSS.ELA-LITERACY.SL.7.5 — Include multimedia in presentations
// - CCSS.ELA-LITERACY.W.7.7 — Short research projects using several sources
// - ISTE 6a — Choose platforms to create original works
// ========================================

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson4-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson4-timer';

export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'Hook + The 5-Slide Structure',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      { id: 'hook', type: 'summary', label: 'Hook', description: 'Show a real press kit example.', duration: 3 },
      { id: 'five-slide-structure', type: 'summary', label: 'The 5-Slide Structure', description: 'Teach: Meet, Story, Sound, Why Sign, Listen.', duration: 5 }
    ]
  },
  {
    id: 'build',
    title: '2. Build Time',
    subtitle: 'Create Your Press Kit',
    color: 'blue',
    estimatedTime: 25,
    stages: [
      { id: 'build-press-kit', type: 'activity', label: 'Build Press Kit', description: 'STUDENTS: Build 5-slide press kit in the Slide Builder.', duration: 25, hasTimer: true, trackProgress: true }
    ]
  },
  {
    id: 'peer-review',
    title: '3. Peer Review',
    subtitle: 'Swap + Feedback',
    color: 'blue',
    estimatedTime: 9,
    stages: [
      { id: 'peer-review', type: 'activity', label: 'Peer Review', description: 'STUDENTS: Swap with partner, give feedback.', duration: 5, hasTimer: true, trackProgress: true },
      { id: 'revise', type: 'activity', label: 'Revise', description: 'STUDENTS: Make final edits based on feedback.', duration: 4, hasTimer: true }
    ]
  },
  {
    id: 'prep',
    title: '4. Presentation Prep',
    subtitle: 'Tomorrow\'s Format',
    color: 'blue',
    estimatedTime: 3,
    stages: [
      { id: 'presentation-prep', type: 'summary', label: 'Presentation Prep', description: 'Explain tomorrow\'s format and options.', duration: 3 }
    ]
  }
];

export const lesson4Config = {
  id: 'music-journalist-lesson4',
  lessonPath: '/lessons/music-journalist/lesson4',
  title: 'Build the Press Kit',
  subtitle: 'How do you tell someone\'s story in a way that makes people care?',
  duration: 45,
  themeColor: '#1a2744',
  accentColor: '#f0b429',
  learningObjectives: [
    'Structure a 5-slide press kit presentation using research and listening notes',
    'Write concise, persuasive slide content with evidence from multiple sources',
    'Give and receive constructive peer feedback',
    'Prepare for a 2-3 minute presentation'
  ],
  lessonSections,
  activities: [
    { id: 1, type: 'mj-press-kit', title: 'Build Press Kit', estimatedTime: '25 min' },
    { id: 2, type: 'mj-peer-feedback', title: 'Peer Review', estimatedTime: '5 min' }
  ]
};

export const lessonStages = [
  { id: 'join-code', label: 'Join Code', type: 'waiting' },
  {
    id: 'hook', label: 'Hook', type: 'summary', duration: 3,
    presentationView: {
      type: 'summary', title: 'Build the Press Kit', subtitle: 'From Agent Notes to Professional Presentation',
      sections: [
        { heading: 'What Is a Press Kit?', bullets: [
          'A PRESS KIT is what gets sent to record labels, festival bookers, and playlist curators',
          'It tells the artist\'s story in a way that makes people CARE',
          'Today YOU build one for your artist'
        ]},
        { heading: 'You Already Have Everything You Need', bullets: [
          'Research Board with 5+ strong facts',
          'Sound Statement from Lesson 3',
          '3 evidence-based reasons for signing',
          'Now: turn it all into 5 polished slides'
        ]}
      ]
    }
  },
  {
    id: 'five-slide-structure', label: 'The 5-Slide Structure', type: 'summary', duration: 5,
    presentationView: {
      type: 'summary', title: 'The 5-Slide Press Kit', subtitle: 'Every Slide Has a Job',
      sections: [
        { heading: 'Slide 1: "Meet [Artist Name]"', bullets: [
          'Photo, name, genre, location',
          'One HOOK sentence: "The 19-year-old producer redefining bedroom pop"'
        ]},
        { heading: 'Slide 2: "Their Story"', bullets: [
          'Where they\'re from, how they started, what drives them',
          '3-4 bullet points from your Research Board',
          'Must include at least one specific fact (date, number, place)'
        ]},
        { heading: 'Slide 3: "Their Sound"', bullets: [
          'Your Sound Statement from Lesson 3',
          'Instruments, genre, influences, mood',
          '"If you like ___, you\'ll love ___"',
          'Must reference a specific song by name'
        ]},
        { heading: 'Slide 4: "Why Sign Them?"', bullets: [
          'Your 3 evidence-based reasons',
          'Streaming numbers, press coverage, growth',
          'CALL TO ACTION: "This artist deserves attention because ___"'
        ]},
        { heading: 'Slide 5: "Listen"', bullets: [
          'Song title + album/EP name',
          'Why you picked THIS specific song',
          'Teacher will play the track during your live presentation'
        ]}
      ]
    }
  },
  {
    id: 'build-press-kit', label: 'Build Press Kit', type: 'activity', duration: 25, hasTimer: true, trackProgress: true,
    presentationView: { type: 'activity-banner', title: 'Build Your Press Kit', subtitle: '25 minutes. 5 slides. Make it count.' }
  },
  {
    id: 'peer-review', label: 'Peer Review', type: 'activity', duration: 5, hasTimer: true, trackProgress: true,
    presentationView: { type: 'activity-banner', title: 'Peer Review', subtitle: 'Swap with a partner. Answer: Strongest slide? What\'s missing? Would you sign this artist?' }
  },
  {
    id: 'revise', label: 'Revise', type: 'activity', duration: 4, hasTimer: true,
    presentationView: { type: 'activity-banner', title: 'Final Edits', subtitle: 'Use your partner\'s feedback to polish your press kit.' }
  },
  {
    id: 'presentation-prep', label: 'Presentation Prep', type: 'summary', duration: 3,
    presentationView: {
      type: 'summary', title: 'Tomorrow: Pitch Day', subtitle: 'Your Presentation Options',
      sections: [
        { heading: 'Choose Your Format', bullets: [
          'LIVE PITCH — Stand up, present your slides, teacher plays the track',
          'VOICEOVER — Record narration over your slides (plays like a mini-documentary)',
          'PARTNER PITCH — Present together, split the talking',
          'PANEL — 3-4 agents pitch in 90 seconds each, class votes per group'
        ]},
        { heading: 'Expectations', bullets: [
          '2-3 minutes per presentation',
          'TELL the story — don\'t just read your slides',
          'You MUST play or reference a specific song',
          'Class votes at the end: who gets SIGNED?'
        ]}
      ]
    }
  },
  {
    id: 'lesson-complete', label: 'Lesson Complete', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Lesson 4 Complete!', subtitle: 'Your Press Kit Is Ready',
      sections: [
        { heading: 'What You Built Today', bullets: [
          'A 5-slide press kit: Meet, Story, Sound, Why Sign, Listen',
          'Gave and received peer feedback',
          'Chose your presentation format for tomorrow'
        ]},
        { heading: 'Tomorrow', bullets: [
          'Lesson 5: PITCH DAY',
          'You present. Class votes. An artist gets SIGNED.',
          'Come ready to convince the room.'
        ]}
      ]
    }
  }
];

export const getActivityForStage = (stage) => ({
  'join-code': 'waiting',
  'hook': 'summary',
  'five-slide-structure': 'summary',
  'build-press-kit': 'mj-press-kit',
  'peer-review': 'mj-peer-feedback',
  'revise': 'mj-press-kit',
  'presentation-prep': 'summary',
  'lesson-complete': 'summary'
})[stage];

export const VOCABULARY = [
  { term: 'Press Kit', definition: 'A professional package of materials used to promote an artist — includes bio, photos, music, and achievements' },
  { term: 'Call to Action', definition: 'Telling your audience exactly what you want them to do — like "follow this artist" or "sign them now"' },
  { term: 'Unique Selling Point', definition: 'The ONE thing that makes your artist different from everyone else' },
  { term: 'Audience', definition: 'The people you are presenting to — you adjust your message and tone for them' },
  { term: 'Peer Feedback', definition: 'Constructive comments from a classmate designed to help you improve your work' }
];
