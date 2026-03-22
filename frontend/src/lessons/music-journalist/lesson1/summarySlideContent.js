// File: /src/lessons/music-journalist/lesson1/summarySlideContent.js
// All instructional text and content for Music Agent Unit — Lesson 1
// "How Artists Blow Up"
// Students learn what agents do, explore genres, discover emerging artists
//
// Standards:
// - MU:Re7.2.7 — Classify and compare music using musical vocabulary
// - MU:Cn10.0.7 — Personal interests influence musical selection
// - CCSS.ELA-LITERACY.SL.7.4 — Present claims with relevant evidence

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Welcome Hook - How do artists blow up?
  welcomeHook: {
    title: 'How Artists Blow Up',
    subtitle: 'From zero fans to millions — how does it happen?',
    body: 'Every artist you love started with zero fans. Zero streams. Zero followers. Then someone believed in them — found their music, told other people, and helped the world discover them. That person was a music agent. Today, you become one.',
    scenarios: [
      {
        headline: 'Billie Eilish — Bedroom to Billboard',
        description: 'Uploaded "Ocean Eyes" to SoundCloud at age 13. Someone found it.',
        type: 'discovery'
      },
      {
        headline: 'Chance the Rapper — Free Music, Global Fame',
        description: 'Gave away free mixtapes online. Never signed to a label. Still went viral.',
        type: 'discovery'
      },
      {
        headline: 'BTS — Tiny Label, Biggest Band in the World',
        description: 'Started at a small Korean label with no radio play. Built a fanbase one fan at a time.',
        type: 'discovery'
      }
    ],
    discussionPrompt: 'What do all three of these stories have in common? Someone BELIEVED in them early.',
    teacherNote: 'Use these stories to establish that discovery is the heart of the music industry. Every major artist had someone who saw their potential before anyone else. That is what an agent does — and that is what students will do in this unit.'
  },

  // What Is a Music Agent?
  whatIsAgent: {
    title: 'What Is a Music Agent?',
    subtitle: 'The People Behind the Artists',
    types: [
      {
        name: 'A&R Rep',
        icon: 'search',
        color: '#3B82F6',
        description: 'Discovers new talent for a record label — listens to hundreds of artists to find the few with real potential',
        example: 'The A&R rep who signed Billie Eilish heard one song and knew she was special',
        keyTraits: ['Listens to music constantly', 'Has a sharp ear for what is unique', 'Takes risks on unknown artists'],
        realWorld: 'Think of it like a talent scout for sports — they find the stars before anyone else'
      },
      {
        name: 'Music Agent',
        icon: 'star',
        color: '#F59E0B',
        description: 'Represents and promotes an artist — builds their brand, gets them heard, makes the case for why they matter',
        example: 'An agent creates the press kit, books the shows, and pitches the artist to labels and playlists',
        keyTraits: ['Knows the artist inside and out', 'Can explain their music to anyone', 'Builds the story that makes people care'],
        realWorld: 'Think of it like a coach who also does marketing — you develop AND promote the talent'
      },
      {
        name: 'You (This Unit)',
        icon: 'bookOpen',
        color: '#10B981',
        description: 'You will discover an emerging artist, research their story, analyze their music, build their promo campaign, and pitch them to the class',
        example: 'By the end of this unit, you will have a 5-slide press kit and a 2-minute pitch that could make your artist go viral',
        keyTraits: ['Research skills', 'Critical listening skills', 'Persuasive presentation skills'],
        realWorld: 'This is what real agents do every day — and the skills transfer to any career where you need to convince people'
      }
    ],
    teacherNote: 'Walk through each role. Emphasize that agents need EVIDENCE, not just vibes — they have to convince labels with facts, numbers, and a compelling story. This sets up the research and evidence skills for the whole unit.'
  },

  // Genre Exploration
  genreExploration: {
    title: 'Know Your Genres',
    subtitle: 'A Great Agent Knows Every Corner of Music',
    description: 'You are about to explore 20 emerging artists across 10 genres. A great agent does not just stick to their favorite genre — they discover talent EVERYWHERE. Your job is to listen with open ears.',
    features: [
      {
        label: 'Listen',
        description: 'Preview tracks from artists across 10 genres'
      },
      {
        label: 'Explore',
        description: 'Read artist bios, check out their story and influences'
      },
      {
        label: 'Star',
        description: 'Star artists that catch your ear — you will pick one next class'
      },
      {
        label: 'Discover',
        description: 'Try genres you have never listened to before'
      }
    ],
    teacherNote: 'Encourage students to explore at least 3 genres they do not usually listen to. The point is discovery — stepping outside their comfort zone.'
  },

  // Fact vs Opinion — Agent Edition
  factVsOpinion: {
    title: 'Fact vs Opinion',
    subtitle: 'Agents Need Evidence, Not Just Vibes',
    definition: {
      fact: 'A statement that can be PROVEN true or false with evidence, data, or documentation.',
      opinion: 'A statement that reflects someone\'s PERSONAL VIEW, belief, or judgment. It cannot be proven — only agreed or disagreed with.'
    },
    examples: [
      {
        statement: 'This artist has 12,000 streams in 3 months.',
        answer: 'fact',
        explanation: 'Streaming numbers are verifiable data.'
      },
      {
        statement: 'This artist is really good.',
        answer: 'opinion',
        explanation: '"Really good" is vague and subjective. An agent needs specifics.'
      },
      {
        statement: 'Their EP was featured on Bandcamp Daily in October 2025.',
        answer: 'fact',
        explanation: 'This is a verifiable event with a specific date and source.'
      },
      {
        statement: 'They have the best sound I have ever heard.',
        answer: 'opinion',
        explanation: '"Best" and "ever" are subjective. Strong opinions need evidence to back them up.'
      }
    ],
    signalWords: {
      fact: ['according to', 'data shows', 'records indicate', 'was released on', 'sold', 'won', 'earned', 'featured on', 'streamed'],
      opinion: ['best', 'worst', 'greatest', 'amazing', 'should', 'I think', 'I believe', 'obviously', 'everyone knows']
    },
    whyItMatters: [
      'A label will not sign an artist because you say they are "really good"',
      'Agents use FACTS to build a case: streaming numbers, press mentions, growth data',
      'OPINIONS matter too — but they must be supported by evidence',
      'The best pitches combine strong facts with passionate opinions'
    ],
    teacherNote: 'Frame this as an agent skill, not an academic exercise. "If you walk into a label meeting and say an artist is great but cannot back it up, you lose credibility." Facts are the agent\'s ammunition.'
  },

  // Reflection
  reflection: {
    title: 'Think Like an Agent',
    subtitle: 'What Caught Your Ear Today?',
    prompts: [
      {
        number: 1,
        question: 'Which genre surprised you the most today? Why?',
        hint: 'Think about a genre you did not expect to enjoy.'
      },
      {
        number: 2,
        question: 'If you had to pick an artist RIGHT NOW, who would it be and why?',
        hint: 'Think about what made them stand out — their sound, their story, or something else.'
      },
      {
        number: 3,
        question: 'What is the difference between saying "this artist is good" and "this artist has 12,000 streams in 3 months"?',
        hint: 'Think about which statement would convince a record label.'
      }
    ],
    lookingAhead: 'Next lesson, you will CHOOSE your artist. Come ready to commit — once you pick, that is YOUR artist for the rest of the unit.',
    teacherNote: 'Quick verbal discussion. Have 2-3 students share. The goal is to plant the seed that they need evidence, not just feelings, to be a good agent.'
  },

  // Lesson Complete
  lessonComplete: {
    title: 'Lesson 1 Complete!',
    subtitle: 'You Are Officially an Agent',
    summary: [
      'Music agents and A&R reps DISCOVER talent before anyone else',
      'There are 10+ genres, each with unique characteristics and emerging artists',
      'Agents need EVIDENCE (facts, data, numbers) not just opinions',
      'A press kit and pitch are how agents make an artist go viral'
    ],
    nextLesson: {
      title: 'Lesson 2: Claim Your Artist',
      preview: 'You will choose your artist, lock in your pick, and start researching their story.'
    },
    celebration: 'You are officially on your way to making an artist blow up!'
  }
};

// ========================================
// 2. FACT OR OPINION GAME DATA
// ========================================
export const factOpinionStatements = [
  {
    id: 1,
    statement: 'Beyonce has won 32 Grammy Awards.',
    answer: 'fact',
    explanation: 'This can be verified by checking Grammy records.'
  },
  {
    id: 2,
    statement: 'Beyonce is the greatest performer of all time.',
    answer: 'opinion',
    explanation: '"Greatest" is subjective — different people have different views.'
  },
  {
    id: 3,
    statement: 'Taylor Swift\'s Eras Tour grossed over $1 billion.',
    answer: 'fact',
    explanation: 'This is a documented financial figure reported by multiple sources.'
  },
  {
    id: 4,
    statement: 'Taylor Swift writes the most meaningful lyrics in pop music.',
    answer: 'opinion',
    explanation: '"Most meaningful" is a personal judgment, not a provable claim.'
  },
  {
    id: 5,
    statement: 'The Beatles released 12 studio albums between 1963 and 1970.',
    answer: 'fact',
    explanation: 'This is a documented historical fact that can be verified.'
  },
  {
    id: 6,
    statement: 'The Beatles are the most important band in music history.',
    answer: 'opinion',
    explanation: '"Most important" is debatable and depends on how you define importance.'
  },
  {
    id: 7,
    statement: 'Spotify had over 600 million users worldwide in 2024.',
    answer: 'fact',
    explanation: 'This is a verifiable statistic reported by the company.'
  },
  {
    id: 8,
    statement: 'Streaming has ruined the music industry.',
    answer: 'opinion',
    explanation: '"Ruined" is a value judgment. Others might say streaming helped independent artists get discovered.'
  },
  {
    id: 9,
    statement: 'Kendrick Lamar won the Pulitzer Prize for Music in 2018.',
    answer: 'fact',
    explanation: 'This is a documented award that can be verified through official records.'
  },
  {
    id: 10,
    statement: 'Kendrick Lamar is the best rapper alive.',
    answer: 'opinion',
    explanation: '"Best" is subjective and depends on personal taste and criteria.'
  },
  {
    id: 11,
    statement: 'BTS became the first K-pop group to perform at the Grammy Awards in 2020.',
    answer: 'fact',
    explanation: 'This is a documented first that can be verified through Grammy records.'
  },
  {
    id: 12,
    statement: 'K-pop has the most dedicated fanbase in all of music.',
    answer: 'opinion',
    explanation: '"Most dedicated" is subjective and cannot be measured objectively.'
  },
  {
    id: 13,
    statement: 'An artist with 50,000 monthly listeners on Spotify is considered emerging.',
    answer: 'fact',
    explanation: 'This is a commonly used industry benchmark for emerging artists.'
  },
  {
    id: 14,
    statement: 'Independent artists make better music than signed artists.',
    answer: 'opinion',
    explanation: '"Better" is subjective — quality depends on personal taste, not label status.'
  }
];

// ========================================
// 3. RESEARCH HIGHLIGHT COLORS
// ========================================
export const annotationColors = {
  fact: { color: 'yellow', hex: '#FDE047', label: 'Key Fact', shortcut: 'F' },
  vocabulary: { color: 'blue', hex: '#93C5FD', label: 'Music Term', shortcut: 'V' },
  opinion: { color: 'green', hex: '#Opinion/Quote', label: 'Opinion', shortcut: 'O' },
  save: { color: 'gold', hex: '#F0B429', label: 'Use in Pitch', shortcut: 'S' }
};

// ========================================
// 4. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'A&R', definition: 'Artists & Repertoire — the person at a record label who discovers and develops new talent' },
  { term: 'Music Agent', definition: 'Someone who represents and promotes an artist\'s career, helping them get discovered, booked, and noticed' },
  { term: 'Emerging Artist', definition: 'A musician who is gaining fans and attention but is not yet mainstream famous' },
  { term: 'Record Label', definition: 'A company that produces, distributes, and promotes music recordings' },
  { term: 'Unsigned', definition: 'An artist who is not currently signed to a record label — they release music independently' },
  { term: 'Press Kit', definition: 'A package of materials (bio, photos, music, achievements) used to promote an artist' },
  { term: 'Pitch', definition: 'A short, persuasive presentation designed to convince someone to take action — like supporting an artist' },
  { term: 'Genre', definition: 'A category of music defined by shared characteristics like instruments, rhythm, and style' },
  { term: 'Subgenre', definition: 'A more specific category within a genre — like "lo-fi hip-hop" within hip-hop' },
  { term: 'Go Viral', definition: 'When content spreads rapidly online — the goal is to make your artist\'s music reach as many people as possible' }
];
