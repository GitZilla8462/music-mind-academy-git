// File: /lessons/music-journalist/lesson5/lesson5Config.jsx
// Lesson 5: Launch Day
// "Can you convince someone to care about something you believe in?"
//
// Standards:
// - MU:Re9.1.7 — Apply criteria to evaluate music, give constructive feedback
// - CCSS.ELA-LITERACY.SL.7.4 — Present claims and findings with relevant evidence
// - ISTE 6d — Publish or present for intended audiences
// ========================================

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson5-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson5-timer';

export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Welcome',
    subtitle: 'Set the Stage',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      { id: 'welcome', type: 'summary', label: 'Welcome', description: '"Today you\'re agents in a room full of label executives."', duration: 3 },
      { id: 'expectations', type: 'summary', label: 'Expectations', description: 'Presentation norms and peer feedback instructions.', duration: 2 }
    ]
  },
  {
    id: 'presentations',
    title: '2. Presentations',
    subtitle: 'The Pitches',
    color: 'blue',
    estimatedTime: 28,
    stages: [
      { id: 'presentations', type: 'activity', label: 'Presentations', description: 'Students present press kits. Teacher plays Bandcamp tracks.', duration: 25, hasTimer: false, trackProgress: true },
      { id: 'peer-feedback', type: 'activity', label: 'Peer Feedback', description: 'STUDENTS: Submit feedback for each presenter.', duration: 3, hasTimer: false, trackProgress: true }
    ]
  },
  {
    id: 'the-vote',
    title: '3. The Vote',
    subtitle: 'Whose Artist Goes Viral?',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      { id: 'class-vote', type: 'activity', label: 'Class Vote', description: 'STUDENTS VOTE: Whose artist goes viral?', duration: 3, trackProgress: true },
      { id: 'results', type: 'summary', label: 'Results', description: 'Reveal the winner + awards.', duration: 2 }
    ]
  },
  {
    id: 'celebration',
    title: '4. Celebration',
    subtitle: 'Reflect + Celebrate',
    color: 'blue',
    estimatedTime: 7,
    stages: [
      { id: 'reflection', type: 'discussion', label: 'Reflection', description: '"What did you learn about music you didn\'t know before?"', duration: 4 },
      { id: 'celebration', type: 'summary', label: 'Celebration', description: '"You just did what real agents do every day."', duration: 3 }
    ]
  }
];

export const lesson5Config = {
  id: 'music-journalist-lesson5',
  lessonPath: '/lessons/music-journalist/lesson5',
  title: 'Launch Day',
  subtitle: 'Make your artist go viral',
  duration: 45,
  themeColor: '#1a2744',
  accentColor: '#f0b429',
  learningObjectives: [
    'Deliver a persuasive 2-3 minute presentation with evidence',
    'Listen critically to peers and provide constructive feedback',
    'Vote on whose artist deserves to go viral based on the strongest pitch',
    'Reflect on music discovery, research, and communication skills'
  ],
  lessonSections,
  activities: [
    { id: 1, type: 'mj-presentation', title: 'Presentations', estimatedTime: '25 min' },
    { id: 2, type: 'mj-peer-feedback', title: 'Peer Feedback', estimatedTime: '3 min' },
    { id: 3, type: 'artist-vote', title: 'Class Vote', estimatedTime: '3 min' }
  ]
};

export const lessonStages = [
  { id: 'join-code', label: 'Join Code', type: 'waiting' },
  {
    id: 'welcome', label: 'Welcome', type: 'summary', duration: 3,
    presentationView: {
      type: 'summary', title: 'Launch Day', subtitle: 'Today You\'re Not Students — You\'re Agents',
      sections: [
        { heading: 'The Scene', bullets: [
          'You found an artist that NOBODY in this room knows about',
          'Each agent has ONE artist they believe in',
          'You have 2-3 minutes to convince the room',
          'At the end, the class VOTES — whose artist goes VIRAL?'
        ]},
        { heading: 'Make It Count', bullets: [
          'Tell the STORY — don\'t just read your slides',
          'Play the MUSIC — let the room hear what you hear',
          'Make them CARE — why should anyone pay attention to your artist?'
        ]}
      ]
    }
  },
  {
    id: 'expectations', label: 'Expectations', type: 'summary', duration: 2,
    presentationView: {
      type: 'summary', title: 'Presentation Norms', subtitle: 'How Pitch Day Works',
      sections: [
        { heading: 'For Presenters', bullets: [
          '2-3 minutes per pitch',
          'Tell the story — don\'t read from your slides',
          'Make eye contact with the room',
          'You MUST play or reference a specific song',
          'End with your CALL TO ACTION'
        ]},
        { heading: 'For the Audience', bullets: [
          'Silent during pitches — this is a professional setting',
          'Snap or clap after each pitch',
          'Fill out a PEER FEEDBACK form for each presenter',
          'One thing that convinced you + one thing that could be stronger',
          'Be ready for 1 audience question per pitch'
        ]}
      ]
    }
  },
  {
    id: 'presentations', label: 'Presentations', type: 'activity', duration: 25, hasTimer: false, trackProgress: true,
    presentationView: { type: 'activity-banner', title: 'Presentations', subtitle: 'Agents are pitching. Listen closely — you\'ll vote at the end.' }
  },
  {
    id: 'peer-feedback', label: 'Peer Feedback', type: 'activity', duration: 3, hasTimer: false, trackProgress: true,
    presentationView: { type: 'activity-banner', title: 'Peer Feedback', subtitle: 'Submit your feedback for each presenter.' }
  },
  {
    id: 'class-vote', label: 'Class Vote', type: 'activity', duration: 3, trackProgress: true,
    presentationView: { type: 'activity-banner', title: 'The Vote', subtitle: 'Whose artist goes VIRAL? Vote now.' }
  },
  {
    id: 'results', label: 'Results', type: 'summary', duration: 2,
    presentationView: {
      type: 'summary', title: 'The Results Are In', subtitle: 'Whose Artist Goes Viral?',
      sections: [
        { heading: 'Awards', bullets: [
          'GONE VIRAL — the artist with the most votes',
          'Best Hook — most compelling opening pitch',
          'Best Sound Statement — most vivid music description',
          'Strongest Case — best evidence and research',
          'Best Campaign Design — most professional press kit',
          'Crowd Favorite — the pitch that got the biggest reaction'
        ]}
      ]
    }
  },
  {
    id: 'reflection', label: 'Reflection', type: 'discussion', duration: 4,
    presentationView: {
      type: 'summary', title: 'Reflect', subtitle: 'What Did You Discover?',
      sections: [
        { heading: 'Discussion', bullets: [
          'What did you learn about MUSIC you didn\'t know before this unit?',
          'Did anyone discover a GENRE they didn\'t expect to like?',
          'What was the hardest part: the research, the writing, or the presenting?',
          'Would you actually follow the artist you represented? Why or why not?'
        ]}
      ]
    }
  },
  {
    id: 'celebration', label: 'Celebration', type: 'summary', duration: 3,
    presentationView: {
      type: 'summary', title: 'You Are Music Agents', subtitle: 'Unit 3 Complete',
      sections: [
        { heading: 'What You Did in This Unit', bullets: [
          'Explored 10 genres and 20 emerging artists nobody knew about',
          'Chose YOUR artist, researched their story with real evidence',
          'Described their music so precisely people could hear it through your words',
          'Designed a visual campaign that made people care',
          'Stood up and made your case to a live audience'
        ]},
        { heading: 'That\'s Real', bullets: [
          'You just did what REAL music agents and A&R reps do every day',
          'You found talent. You built the case. You designed the campaign. You pitched it.',
          'These skills — research, writing, design, and speaking — go way beyond music class.'
        ]}
      ]
    }
  },
  {
    id: 'lesson-complete', label: 'Lesson Complete', type: 'summary', duration: 1,
    presentationView: {
      type: 'summary', title: 'Unit 3 Complete!', subtitle: 'Congratulations, Agents',
      sections: [
        { heading: 'Final Portfolio', bullets: [
          'Research Board with highlighted evidence',
          'Listening Guide with track analysis',
          'Sound Statement',
          '5-Slide Press Kit',
          'Peer feedback given and received'
        ]}
      ]
    }
  }
];

export const getActivityForStage = (stage) => ({
  'join-code': 'waiting',
  'welcome': 'summary',
  'expectations': 'summary',
  'presentations': 'mj-presentation',
  'peer-feedback': 'mj-peer-feedback',
  'class-vote': 'artist-vote',
  'results': 'summary',
  'reflection': 'discussion',
  'celebration': 'summary',
  'lesson-complete': 'summary'
})[stage];

export const VOCABULARY = [
  { term: 'Pitch', definition: 'A short, persuasive presentation designed to convince someone to take action' },
  { term: 'Call to Action', definition: 'The final statement telling your audience exactly what you want them to do' },
  { term: 'Peer Feedback', definition: 'Constructive comments from classmates — one strength and one suggestion' },
  { term: 'Go Viral', definition: 'When content spreads rapidly online — the goal is to make your artist\'s music reach as many people as possible' }
];
