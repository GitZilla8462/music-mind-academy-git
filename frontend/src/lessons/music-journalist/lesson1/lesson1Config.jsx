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
//       → Scouting Report + Explore (15 min) → Share Top 5 (7 min)
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
    id: 'scouting-report',
    title: '4. Scouting Report',
    subtitle: 'Explore + Build 3 Slides',
    color: 'blue',
    estimatedTime: 15,
    stages: [
      {
        id: 'scouting-intro',
        type: 'summary',
        label: 'Scouting Instructions',
        description: 'Explain: Browse artists, then build your 3-slide scouting report.',
        duration: 2
      },
      {
        id: 'scouting-report',
        type: 'activity',
        label: 'Scouting Report',
        description: 'STUDENTS BUILD: Explore artists + complete 3 slides (Top 5, #1 Pick, What I Notice).',
        duration: 13,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'share',
    title: '5. Share Your Top 5',
    subtitle: 'Partner Discussion',
    color: 'blue',
    estimatedTime: 7,
    stages: [
      {
        id: 'share-top-5',
        type: 'discussion',
        label: 'Share Top 5',
        description: 'STUDENTS: Show your top 5 artists to a partner. Discuss picks.',
        duration: 5
      },
      {
        id: 'lesson-preview',
        type: 'summary',
        label: 'Next Time',
        description: 'Preview Lesson 2: You\'ll lock in your artist and start researching.',
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
    'Create a scouting report identifying your top 5 artists and #1 pick'
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
      type: 'scouting-report',
      title: 'Scouting Report',
      estimatedTime: '13 min'
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
      title: 'What Does a Music Agent Do?',
      subtitle: 'The People Behind the Artists',
      sections: [
        {
          heading: 'Key Roles',
          bullets: [
            'A&R (Artists & Repertoire) \u2014 the person who DISCOVERS new talent for a label',
            'MUSIC AGENT \u2014 represents and PROMOTES an artist\'s career',
            'They listen to hundreds of artists to find the few with real potential'
          ]
        },
        {
          heading: 'Your 5-Lesson Mission',
          bullets: [
            'Lesson 1 (TODAY): Explore genres and artists, create your scouting report',
            'Lesson 2: PICK your artist and start researching their story',
            'Lesson 3: LISTEN like a critic \u2014 describe their sound',
            'Lesson 4: BUILD your press kit \u2014 a 5-slide presentation',
            'Lesson 5: PITCH DAY \u2014 present to the class, class votes!'
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
    id: 'scouting-intro',
    label: 'Scouting Instructions',
    description: 'Explain: Browse artists, then build your 3-slide scouting report.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'Your Scouting Report',
      subtitle: 'Explore Artists + Build 3 Slides',
      sections: [
        {
          heading: 'What to Do',
          bullets: [
            'Browse the artist library \u2014 listen to tracks across different genres',
            'Star artists that catch your ear',
            'Switch to "My Report" to build your 3 slides'
          ]
        },
        {
          heading: 'Your 3 Slides',
          bullets: [
            'Slide 1: MY TOP 5 ARTISTS \u2014 list the 5 artists you like most',
            'Slide 2: MY #1 PICK \u2014 who would you sign? Why?',
            'Slide 3: WHAT I NOTICE \u2014 one interesting fact + what you hear in their music'
          ]
        },
        {
          heading: '',
          bullets: [
            'You have 13 minutes \u2014 start exploring, then switch to your report!',
          ]
        }
      ]
    }
  },
  {
    id: 'scouting-report',
    label: 'Scouting Report',
    description: 'STUDENTS BUILD: Explore artists + complete 3 slides.',
    type: 'activity',
    duration: 13,
    hasTimer: true,
    trackProgress: true,
    presentationView: {
      type: 'activity-banner',
      title: 'Scouting Report',
      subtitle: 'Explore artists and build your 3 slides: Top 5, #1 Pick, What I Notice'
    }
  },
  {
    id: 'share-top-5',
    label: 'Share Top 5',
    description: 'STUDENTS: Show your top 5 artists to a partner.',
    type: 'discussion',
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Share Your Top 5',
      subtitle: 'Find a Partner',
      sections: [
        {
          heading: 'Instructions',
          bullets: [
            'Find a partner near you',
            'Show them your Slide 1 \u2014 your Top 5 Artists',
            'Tell them about your #1 pick and WHY you chose them',
            'Listen to your partner\'s picks \u2014 did anyone pick the same artist?'
          ]
        },
        {
          heading: 'Discussion Questions',
          bullets: [
            'Which genre surprised you the most today?',
            'Did you discover a genre you didn\'t expect to like?',
            'What made your #1 pick stand out from the rest?'
          ]
        }
      ]
    }
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
            'Explored the artist library and built your scouting report',
            'Shared your Top 5 with a partner'
          ]
        },
        {
          heading: 'Next Time: Lesson 2',
          bullets: [
            'You will LOCK IN your artist \u2014 once you choose, that\'s your artist for the unit',
            'You\'ll start researching their story and gathering evidence',
            'Come ready to commit to your #1 pick!'
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
      subtitle: 'Lesson 2: Scout Your Artist',
      sections: [
        {
          heading: '',
          bullets: [
            'Think about which artist you want to represent',
            'Come ready to commit \u2014 once you choose, that\'s YOUR artist for the unit'
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
    'scouting-intro': 'summary',
    'scouting-report': 'scouting-report',
    'share-top-5': 'discussion',
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
  { term: 'Scouting Report', definition: 'An agent\'s first assessment of potential talent \u2014 your initial picks and observations' }
];
