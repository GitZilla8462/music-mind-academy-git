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
// FLOW: Welcome (5 min) → Genre Showcase (10 min) → Genre Match Game (8 min)
//       → Genre Scouts + Explore (15 min) → Share + Preview (5 min)
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
    id: 'welcome',
    title: '1. Welcome to the Agency',
    subtitle: 'Hook + What Does an Agent Do?',
    color: 'blue',
    estimatedTime: 5,
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
        description: 'Teach: A&R, music agent, press kit, pitch. The 5-lesson mission.',
        duration: 2
      }
    ]
  },
  {
    id: 'genre-showcase',
    title: '2. Genre Showcase',
    subtitle: '6 Genres, 6 Artists',
    color: 'blue',
    estimatedTime: 10,
    stages: [
      {
        id: 'genre-showcase',
        type: 'summary',
        label: 'Genre Showcase',
        description: 'TEACHER: Step through 7 genres with real artists and audio previews.',
        duration: 10,
        hasTimer: true
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
    id: 'genre-scouts',
    title: '4. Genre Scouts',
    subtitle: 'Explore + Find One Artist Per Genre',
    color: 'blue',
    estimatedTime: 22,
    stages: [
      {
        id: 'genre-scouts-intro',
        type: 'summary',
        label: 'Genre Scouts Instructions',
        description: 'Explain: Browse artists and find one that represents each genre.',
        duration: 2
      },
      {
        id: 'genre-scouts',
        type: 'activity',
        label: 'Genre Scouts',
        description: 'STUDENTS BUILD: Explore artists + complete 3 slides (Genre Lineup, Surprise Discovery, Sound Snapshot).',
        duration: 20,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'share',
    title: '5. Share + Preview',
    subtitle: 'Discussion + What\'s Next',
    color: 'blue',
    estimatedTime: 8,
    stages: [
      {
        id: 'share-out',
        type: 'activity',
        label: 'Share Out',
        description: 'STUDENTS: Share your genre lineup and surprise discovery with a partner.',
        duration: 6
      },
      {
        id: 'lesson-preview',
        type: 'summary',
        label: 'Next Time',
        description: 'Preview Lesson 2: You\'ll learn to listen and describe music like an agent.',
        duration: 2
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
    'Find one artist that represents each genre and describe what you hear'
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: 'genre-showcase',
      title: 'Genre Showcase',
      estimatedTime: '10 min'
    },
    {
      id: 2,
      type: 'genre-match',
      title: 'Genre Match Game',
      estimatedTime: '8 min'
    },
    {
      id: 3,
      type: 'genre-scouts',
      title: 'Genre Scouts',
      estimatedTime: '20 min'
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
            'BILLIE EILISH \u2014 uploaded songs to SoundCloud from her bedroom at age 13',
            'CHANCE THE RAPPER \u2014 gave away free mixtapes and never signed to a label',
            'BTS \u2014 started at a tiny label with no radio play, built a global fanbase online',
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
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'You Are a Music Agent',
      subtitle: 'Find the next big artist',
      sections: [
        {
          heading: 'Your 5-Lesson Mission',
          bullets: [
            'EXPLORE \u2014 Browse genres and discover new artists',
            'LISTEN \u2014 Learn to describe what makes an artist unique',
            'CLAIM \u2014 Pick your artist and research their story',
            'BUILD \u2014 Create a press kit presentation',
            'PITCH \u2014 Present to the class and pitch your artist!'
          ]
        }
      ]
    }
  },
  {
    id: 'genre-showcase',
    label: 'Genre Showcase',
    description: 'TEACHER: Step through 7 genres with real artists and audio.',
    type: 'summary',
    duration: 10,
    hasTimer: true,
    presentationView: {
      type: 'genre-showcase'
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
    id: 'genre-scouts-intro',
    label: 'Genre Scouts Instructions',
    description: 'Explain: Browse artists and find one that represents each genre.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Genre Scouts',
      subtitle: 'Find One Artist Per Genre',
      sections: [
        {
          heading: 'Your Mission',
          bullets: [
            'Start by clicking "My Report" \u2014 read the example text on each slide',
            'Click "Explore Artists" to browse the library and listen to music',
            'Go back and forth until all 3 slides are complete'
          ]
        },
        {
          heading: 'Your 3 Slides',
          bullets: [
            'Slide 1: GENRE LINEUP \u2014 one artist per genre you explored',
            'Slide 2: SURPRISE DISCOVERY \u2014 which genre surprised you? Who changed your mind?',
            'Slide 3: SOUND SNAPSHOT \u2014 pick one artist and describe what you hear'
          ]
        },
        {
          heading: '',
          bullets: [
            'You have 20 minutes \u2014 start by looking at your report, then explore artists!',
          ]
        }
      ]
    }
  },
  {
    id: 'genre-scouts',
    label: 'Genre Scouts',
    description: 'STUDENTS BUILD: Explore artists + complete 3 slides (Genre Lineup, Surprise Discovery, Sound Snapshot).',
    type: 'activity',
    duration: 20,
    hasTimer: true,
    trackProgress: true,
    presentationView: {
      type: 'genre-scouts-teacher'
    }
  },
  {
    id: 'share-out',
    label: 'Share Out',
    description: 'STUDENTS: Share your genre lineup and surprise discovery with a partner.',
    type: 'activity',
    duration: 6,
    presentationView: {
      type: 'genre-scouts-share-teacher',
    },
    studentDirections: [
      { text: 'Find a partner or small group near you' },
      { text: 'Show them your Genre Lineup \u2014 who did you pick for each genre?' },
      { text: 'Share your Surprise Discovery \u2014 which genre caught you off guard?' },
      { text: 'Listen to your partner \u2014 did anyone pick the same artists?' },
    ],
  },
  {
    id: 'lesson-preview',
    label: 'Next Time',
    description: 'Preview Lesson 2.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Lesson 1 Complete!',
      subtitle: 'Welcome to the Agency',
      sections: [
        {
          heading: 'What You Did Today',
          bullets: [
            'Learned what music agents and A&R reps do',
            'Heard 6 genres with real emerging artists',
            'Explored the artist library with Genre Scouts',
            'Shared your discoveries with a partner'
          ]
        },
        {
          heading: 'Next Time: Lesson 2 \u2014 Listen Like an Agent',
          bullets: [
            'You\'ll learn 6 ways to DESCRIBE music (tempo, mood, instrumentation, hook, production, influence)',
            'You\'ll listen to tracks and practice analyzing what you hear',
            'These skills will help you choose the RIGHT artist in Lesson 3'
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
      title: 'See You Next Time!',
      subtitle: 'Lesson 2: Listen Like an Agent',
      sections: [
        {
          heading: '',
          bullets: [
            'Next class you\'ll learn to describe music like a real agent',
            'Start thinking about what makes YOUR favorite music unique \u2014 what would you say about it?'
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
    'genre-showcase': 'genre-showcase',
    'genre-match-game': 'genre-match',
    'genre-scouts-intro': 'summary',
    'genre-scouts': 'genre-scouts',
    'share-out': 'genre-scouts',
    'lesson-preview': 'summary',
    'lesson-complete': 'summary'
  };
  return stageMap[stage];
};

// ========================================
// VOCABULARY FOR THIS LESSON
// ========================================
export const VOCABULARY = [
  { term: 'A&R', definition: 'Artists & Repertoire \u2014 the person at a record label who discovers and develops new talent' },
  { term: 'Music Agent', definition: 'Someone who represents and promotes an artist\'s career, helping them get signed, booked, and noticed' },
  { term: 'Emerging Artist', definition: 'A musician who is gaining fans and attention but isn\'t mainstream famous yet' },
  { term: 'Record Label', definition: 'A company that produces, distributes, and promotes music recordings' },
  { term: 'Unsigned', definition: 'An artist who is not currently signed to a record label \u2014 they release music independently' },
  { term: 'Press Kit', definition: 'A package of materials (bio, photos, music samples, achievements) used to promote an artist to labels and media' },
  { term: 'Pitch', definition: 'A short, persuasive presentation designed to convince someone to take action \u2014 like signing an artist' },
  { term: 'Genre', definition: 'A category of music defined by shared characteristics like instruments, rhythm, and style (hip-hop, jazz, rock, etc.)' },
  { term: 'Subgenre', definition: 'A more specific category within a genre \u2014 like "indie rock" within rock, or "trap" within hip-hop' },
  { term: 'Genre Scouts', definition: 'An agent\'s first exploration \u2014 finding one artist that represents each genre' }
];
