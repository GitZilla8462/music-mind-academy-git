// File: /src/lessons/music-journalist/lesson3/summarySlideContent.js
// All instructional text and content for Music Agent Unit — Lesson 3
// "Claim Your Artist"
// Students learn the 4-point checklist, strong vs weak evidence,
// play Fact or Opinion, and build a Scouting Report for one assigned artist.
//
// Standards:
// - MU:Cn10.0.7 — Personal interests influence musical selection
// - CCSS.ELA-LITERACY.RI.7.1 — Cite textual evidence to support analysis
// - CCSS.ELA-LITERACY.W.7.7 — Short research projects using multiple sources

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Hook
  hook: {
    title: 'Claim Your Artist',
    subtitle: 'Time to Find Your Next Star',
    prompts: [
      'Imagine you\'re scrolling through music and you hear something that STOPS you',
      'That\'s the moment every talent agent lives for',
      'Today you\'re going to find that artist'
    ],
    teacherNote: 'Build urgency — this is the commitment moment. Frame students as agents making a real decision.'
  },

  // 4-Point Checklist — one slide per point
  checklist1: {
    title: 'Unique Sound',
    subtitle: 'Point 1 of 4',
    bullets: [
      'Their music doesn\'t sound like anyone else in the library',
      'You could pick their song out of a playlist without seeing the name',
      'Their genre, style, or production has something you haven\'t heard before'
    ],
    teacherNote: 'Ask: "If you played 100 songs, would THIS one stand out?"'
  },

  checklist2: {
    title: 'Compelling Story',
    subtitle: 'Point 2 of 4',
    bullets: [
      'There\'s a real reason they started making music — loss, struggle, obsession, identity',
      'Their background makes you more interested in what they create',
      'The story makes the music mean something more than just sound'
    ],
    teacherNote: 'Stories make people care. The music gets you listening, the story keeps you invested.'
  },

  checklist3: {
    title: 'Signs of Growth',
    subtitle: 'Point 3 of 4',
    bullets: [
      'Their streams, followers, or shows have increased over time',
      'They\'ve been releasing music consistently, not just once',
      'Other people — blogs, playlists, venues — are starting to notice them'
    ],
    teacherNote: 'Growth means momentum. An artist going up is more exciting than one who peaked.'
  },

  checklist4: {
    title: 'Gut Feeling',
    subtitle: 'Point 4 of 4',
    bullets: [
      'You keep replaying their music even when you\'re not sure why',
      'Something about them feels different from everyone else you heard',
      'You\'d be disappointed if someone else signed them first'
    ],
    teacherNote: 'Validate instinct as real — but remind students that gut feeling alone isn\'t enough. They need all 4 points.'
  },

  // Strong vs Weak Evidence
  strongVsWeak: {
    title: 'Strong vs Weak Evidence',
    subtitle: 'Not All Facts Are Created Equal',
    strong: [
      'Specific facts — numbers, dates, names, places',
      'Something you could look up and verify'
    ],
    weak: [
      'Vague opinions — "they\'re amazing," "their vibe is different"',
      'Feelings without any facts to back them up'
    ],
    teacherNote: 'This is the key concept. Every pitch in Lesson 5 will be judged on evidence quality. "I like them" is not enough — agents need proof.'
  },

  // Teacher Models the Scouting Report
  modelReport: {
    title: 'Scouting Report — Example',
    subtitle: 'Here\'s What You\'re Building',
    slides: [
      {
        heading: 'Slide 1 of 3: Artist Overview',
        bullets: [
          'Artist Name: Ketsa',
          'Track: "Love Comes Back Around"',
          'Location: London, England',
          'Genre: Jazz / Soul / Latin'
        ]
      },
      {
        heading: 'Slide 2 of 3: The Four Points',
        bullets: [
          'Unique Sound: Blends jazz, soul, and Latin rhythms — no one else in the library sounds like this',
          'Compelling Story: Self-taught multi-instrumentalist who creates everything solo',
          'Signs of Growth: 8 albums released, tracks featured on multiple CC music platforms',
          'Gut Feeling: The music makes you want to move — it\'s feel-good without being generic'
        ]
      },
      {
        heading: 'Slide 3 of 3: Fact or Opinion Sort',
        bullets: [
          'Each statement — is it a Fact or Opinion? Strong or Weak evidence?',
          'Your job: classify each one correctly'
        ]
      }
    ],
    teacherNote: 'Walk through each slide so there is zero ambiguity about what students are filling in. Point out what makes the Four Points answers strong — specific facts, not vague.'
  },

  // Share Out
  shareOut: {
    title: 'Share Out',
    subtitle: 'Partner Discussion',
    prompts: [
      'Which of the four points felt strongest for this artist?',
      'What was your best piece of strong evidence?',
      'Would you sign them — yes or no?'
    ],
    lookingAhead: 'Next lesson, you\'ll pick YOUR OWN artist and start building the real presentation.',
    teacherNote: 'Quick partner share. Listen for students using specific evidence vs vague opinions. Call out strong examples to the class.'
  },

  // Lesson Complete
  lessonComplete: {
    title: 'Lesson 3 Complete!',
    subtitle: 'You Know How to Evaluate an Artist',
    summary: [
      'Learned the 4-Point Checklist for evaluating artists',
      'Practiced spotting strong vs weak evidence',
      'Played Fact or Opinion with three question types',
      'Built a Scouting Report using real evidence'
    ],
    nextLesson: {
      title: 'Lesson 4: Build Your Presentation',
      preview: 'Pick your OWN artist and start building the press kit.'
    },
    celebration: 'You know how to evaluate talent. Now it\'s time to find YOUR artist.'
  }
};

// ========================================
// 2. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Evidence', definition: 'Facts, data, quotes, or examples that support a claim — the proof behind your argument' },
  { term: 'Strong Evidence', definition: 'Specific, verifiable information with numbers, dates, names, or sources' },
  { term: 'Weak Evidence', definition: 'Vague statements without specifics — "a lot of people" or "really good" with no proof' },
  { term: 'Fact', definition: 'A statement that can be proven true or false with evidence' },
  { term: 'Opinion', definition: 'A statement that reflects someone\'s personal view — it cannot be proven, only agreed or disagreed with' },
  { term: '4-Point Checklist', definition: 'Unique Sound, Compelling Story, Signs of Growth, Gut Feeling — what agents evaluate before signing an artist' }
];
