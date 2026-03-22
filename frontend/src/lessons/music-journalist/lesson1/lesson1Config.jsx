// File: /lessons/music-journalist/lesson1/lesson1Config.jsx
// Lesson 1: Welcome to the Agency
// "What does it take to discover the next big artist?"
//
// ========================================
// CURRICULUM NOTES
// ========================================
// Students learn:
// - What music agents and A&R reps do
// - How to explore genres and identify characteristics
// - How to navigate the Artist Discovery platform
// - Music vocabulary: genre, subgenre, A&R, emerging artist, press kit, pitch
//
// Standards:
// - MU:Re7.2.7 — Classify and compare music using musical vocabulary
// - MU:Cn10.0.7 — Personal interests influence musical selection
// - CCSS.ELA-LITERACY.SL.7.4 — Present claims with relevant evidence
//
// Color theme: deep navy (#1a2744) with gold accent (#f0b429)
// ========================================

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson1-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson1-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Welcome to the Agency',
    subtitle: 'Hook + What Does an Agent Do?',
    color: 'blue',
    estimatedTime: 11,
    stages: [
      {
        id: 'welcome-hook',
        type: 'summary',
        label: 'Welcome Hook',
        description: '"You\'ve been hired at a music agency. Find the next big artist."',
        duration: 3
      },
      {
        id: 'what-is-an-agent',
        type: 'summary',
        label: 'What Does an Agent Do?',
        description: 'Teach: A&R, music agent, press kit, pitch.',
        duration: 3
      },
      {
        id: 'genre-exploration',
        type: 'summary',
        label: 'Genre Exploration',
        description: 'Quick overview of genres with audio examples.',
        duration: 5
      }
    ]
  },
  {
    id: 'explore-platform',
    title: '2. Explore the Platform',
    subtitle: 'Browse Artists by Genre',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'explore-artists',
        type: 'activity',
        label: 'Explore Artists',
        description: 'STUDENTS BROWSE: Listen to previews across genres. Star artists.',
        duration: 10,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'genre-game',
    title: '3. Genre Match Game',
    subtitle: 'Identify Genres by Listening',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      {
        id: 'genre-match-game',
        type: 'activity',
        label: 'Genre Match',
        description: 'STUDENTS PLAY: Hear a clip, identify the genre!',
        duration: 8,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'the-assignment',
    title: '4. The Assignment',
    subtitle: 'Unit Overview + Vocab',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      {
        id: 'unit-overview',
        type: 'summary',
        label: 'The Assignment',
        description: 'Explain the 5-lesson arc: discover → research → listen → build → pitch.',
        duration: 5
      },
      {
        id: 'vocab-check',
        type: 'summary',
        label: 'Vocab Check',
        description: 'Review key vocabulary: A&R, genre, emerging artist, press kit, pitch.',
        duration: 3
      }
    ]
  },
  {
    id: 'reflect',
    title: '5. Preview',
    subtitle: 'Discussion + Next Steps',
    color: 'blue',
    estimatedTime: 3,
    stages: [
      {
        id: 'lesson-preview',
        type: 'discussion',
        label: 'Preview',
        description: '"Which genre interests you most? Who might be your artist?"',
        duration: 3
      }
    ]
  }
];

export const lesson1Config = {
  id: 'music-journalist-lesson1',
  lessonPath: '/lessons/music-journalist/lesson1',
  title: 'Welcome to the Agency',
  subtitle: 'What does it take to discover the next big artist?',
  duration: 45,
  themeColor: '#1a2744',
  accentColor: '#f0b429',
  learningObjectives: [
    'Understand what music agents and A&R reps do in the music industry',
    'Explore and identify characteristics of different musical genres',
    'Navigate the Artist Discovery platform and preview emerging artists',
    'Use music vocabulary to describe and classify what you hear'
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: 'artist-discovery',
      title: 'Explore Artists',
      estimatedTime: '10 min'
    },
    {
      id: 2,
      type: 'genre-match',
      title: 'Genre Match Game',
      estimatedTime: '8 min'
    }
  ]
};

// ========================================
// LESSON STAGES - With presentationView data for each stage
// ========================================
export const lessonStages = [
  {
    id: 'join-code',
    label: 'Join Code Screen',
    description: 'Students enter session code to join.',
    type: 'waiting'
  },
  {
    id: 'welcome-hook',
    label: 'Welcome Hook',
    description: '"You\'ve been hired at a music agency."',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Welcome to the Agency',
      subtitle: 'You\'ve Just Been Hired',
      sections: [
        {
          heading: 'Your Mission',
          bullets: [
            'You are a MUSIC AGENT at a record label',
            'Your job: find the NEXT BIG ARTIST before anyone else',
            'Scout talent, research their story, build their press kit, and PITCH them'
          ]
        },
        {
          heading: 'Artists Who Were "Discovered"',
          bullets: [
            'BILLIE EILISH — uploaded songs to SoundCloud from her bedroom at age 13',
            'CHANCE THE RAPPER — gave away free mixtapes and never signed to a label',
            'BTS — started at a tiny label with no radio play, built a global fanbase online',
            'These artists were found by agents who believed in them before they were famous'
          ]
        }
      ]
    }
  },
  {
    id: 'what-is-an-agent',
    label: 'What Does an Agent Do?',
    description: 'Teach: A&R, music agent, press kit, pitch.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'What Does a Music Agent Do?',
      subtitle: 'The People Behind the Artists',
      sections: [
        {
          heading: 'Key Roles',
          bullets: [
            'A&R (Artists & Repertoire) — the person at a label who DISCOVERS new talent',
            'MUSIC AGENT — represents and PROMOTES an artist\'s career',
            'They listen to hundreds of artists to find the few with real potential'
          ]
        },
        {
          heading: 'The Agent\'s Toolkit',
          bullets: [
            'PRESS KIT — a package with the artist\'s bio, photos, music samples, and achievements',
            'PITCH — a short, persuasive presentation to convince a label to sign the artist',
            'By the end of this unit, YOU will build a press kit and deliver a pitch'
          ]
        }
      ]
    }
  },
  {
    id: 'genre-exploration',
    label: 'Genre Exploration',
    description: 'Quick overview of genres with audio examples.',
    type: 'summary',
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Know Your Genres',
      subtitle: 'A Great Agent Knows Every Corner of Music',
      sections: [
        {
          heading: '10 Genres to Explore',
          bullets: [
            'HIP-HOP — beats, rhymes, storytelling, sampling',
            'POP — catchy hooks, broad appeal, production-focused',
            'ROCK — guitars, drums, energy, rebellion',
            'R&B / SOUL — vocals, groove, emotion, Motown roots',
            'ELECTRONIC — synthesizers, beats, no traditional instruments required'
          ]
        },
        {
          heading: '',
          bullets: [
            'JAZZ — improvisation, complex harmony, swing feel',
            'LATIN — reggaeton, salsa, cumbia, global rhythms',
            'FOLK / COUNTRY — acoustic, storytelling, roots traditions',
            'WORLD — music from every culture, cross-cultural fusion',
            'INDIE / ALTERNATIVE — experimental, outside the mainstream'
          ]
        },
        {
          heading: 'Your Challenge',
          bullets: [
            'Explore at least 3 genres you DON\'T usually listen to',
            'A great agent discovers talent in EVERY genre, not just their favorite'
          ]
        }
      ]
    }
  },
  {
    id: 'explore-artists',
    label: 'Explore Artists',
    description: 'STUDENTS BROWSE: Listen to previews across genres. Star artists.',
    type: 'activity',
    duration: 10,
    hasTimer: true,
    trackProgress: true,
    presentationView: {
      type: 'activity-banner',
      title: 'Explore the Artist Library',
      subtitle: 'Browse by genre. Listen to tracks. Star artists you like.'
    }
  },
  {
    id: 'genre-match-game',
    label: 'Genre Match',
    description: 'STUDENTS PLAY: Hear a clip, identify the genre!',
    type: 'activity',
    duration: 8,
    hasTimer: true,
    trackProgress: true,
    hasProgress: true,
    presentationView: {
      type: 'genre-match-teacher-game'
    }
  },
  {
    id: 'unit-overview',
    label: 'The Assignment',
    description: 'Explain the 5-lesson arc.',
    type: 'summary',
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Your Mission: 5 Lessons',
      subtitle: 'From Scout to Agent',
      sections: [
        {
          heading: 'The Journey',
          bullets: [
            'Lesson 1 (TODAY): Explore the platform, learn about genres and agents',
            'Lesson 2: PICK your artist and start researching their story',
            'Lesson 3: LISTEN like a critic — describe their sound using music vocabulary',
            'Lesson 4: BUILD your press kit — a 5-slide presentation',
            'Lesson 5: PITCH DAY — present to the class, class votes on who gets signed!'
          ]
        },
        {
          heading: 'The Stakes',
          bullets: [
            'You are competing against other agents in the class',
            'The class VOTES on which artist should be signed',
            'Can you make the most convincing case for YOUR artist?'
          ]
        }
      ]
    }
  },
  {
    id: 'vocab-check',
    label: 'Vocab Check',
    description: 'Review key vocabulary.',
    type: 'summary',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Vocabulary Check',
      subtitle: 'Words You Need to Know',
      sections: [
        {
          heading: 'Music Industry',
          bullets: [
            'A&R — the person who discovers new talent for a record label',
            'MUSIC AGENT — someone who represents and promotes an artist',
            'EMERGING ARTIST — a musician gaining fans but not yet mainstream',
            'RECORD LABEL — a company that produces and distributes music',
            'UNSIGNED — an artist not currently signed to a label'
          ]
        },
        {
          heading: 'Your Toolkit',
          bullets: [
            'PRESS KIT — bio, photos, music samples packaged to promote an artist',
            'PITCH — a short, persuasive presentation to convince someone to act',
            'GENRE — a category of music with shared characteristics',
            'SUBGENRE — a more specific category within a genre'
          ]
        }
      ]
    }
  },
  {
    id: 'lesson-preview',
    label: 'Preview',
    description: '"Which genre interests you most?"',
    type: 'discussion',
    duration: 3,
    presentationView: {
      type: 'summary',
      title: 'Before Next Class',
      subtitle: 'Think About Your Pick',
      sections: [
        {
          heading: 'Discuss',
          bullets: [
            'Which GENRE surprised you the most today?',
            'Did you discover a genre you didn\'t expect to like?',
            'Which artist caught your ear? Why?'
          ]
        },
        {
          heading: 'Next Time',
          bullets: [
            'Lesson 2: You PICK your artist and start researching',
            'Think about which artist from today\'s exploration you want to represent',
            'Come ready to commit — once you choose, that\'s YOUR artist for the unit'
          ]
        }
      ]
    }
  },
  {
    id: 'lesson-complete',
    label: 'Lesson Complete',
    description: 'Wrap up.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Lesson 1 Complete!',
      subtitle: 'Welcome to the Agency',
      sections: [
        {
          heading: 'What You Learned Today',
          bullets: [
            'Music agents and A&R reps DISCOVER talent across every genre',
            'There are 10+ genres, each with unique characteristics',
            'A press kit and pitch are how agents promote their artists',
            'You explored 19 emerging artists on the platform'
          ]
        },
        {
          heading: 'Next Time',
          bullets: [
            'Lesson 2: Scout Your Artist',
            'You will pick your artist, research their story, and start building your case'
          ]
        }
      ]
    }
  }
];

// Helper function to map session stage to activity type
export const getActivityForStage = (stage) => {
  const stageMap = {
    'join-code': 'waiting',
    'welcome-hook': 'summary',
    'what-is-an-agent': 'summary',
    'genre-exploration': 'summary',
    'explore-artists': 'artist-discovery',
    'genre-match-game': 'genre-match',
    'unit-overview': 'summary',
    'vocab-check': 'summary',
    'lesson-preview': 'discussion',
    'lesson-complete': 'summary'
  };
  return stageMap[stage];
};

// ========================================
// VOCABULARY FOR THIS LESSON
// ========================================
export const VOCABULARY = [
  { term: 'A&R', definition: 'Artists & Repertoire — the person at a record label who discovers and develops new talent' },
  { term: 'Music Agent', definition: 'Someone who represents and promotes an artist\'s career, helping them get signed, booked, and noticed' },
  { term: 'Emerging Artist', definition: 'A musician who is gaining fans and attention but isn\'t mainstream famous yet' },
  { term: 'Record Label', definition: 'A company that produces, distributes, and promotes music recordings' },
  { term: 'Unsigned', definition: 'An artist who is not currently signed to a record label — they release music independently' },
  { term: 'Press Kit', definition: 'A package of materials (bio, photos, music samples, achievements) used to promote an artist to labels and media' },
  { term: 'Pitch', definition: 'A short, persuasive presentation designed to convince someone to take action — like signing an artist' },
  { term: 'Genre', definition: 'A category of music defined by shared characteristics like instruments, rhythm, and style (hip-hop, jazz, rock, etc.)' },
  { term: 'Subgenre', definition: 'A more specific category within a genre — like "indie rock" within rock, or "trap" within hip-hop' },
  { term: 'Discography', definition: 'The complete collection of an artist\'s recorded music — all their albums, EPs, and singles' }
];
