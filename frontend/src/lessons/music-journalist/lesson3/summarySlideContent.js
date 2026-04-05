// File: /src/lessons/music-journalist/lesson3/summarySlideContent.js
// All instructional text and content for Music Agent Unit — Lesson 3
// "Claim Your Artist"
// Students choose their artist, research their story, learn strong vs weak evidence
//
// Standards:
// - MU:Cn10.0.7 — Personal interests influence musical selection
// - CCSS.ELA-LITERACY.RI.7.1 — Cite textual evidence to support analysis
// - CCSS.ELA-LITERACY.W.7.7 — Short research projects using multiple sources

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Welcome Hook
  welcomeHook: {
    title: 'Claim Your Artist',
    subtitle: 'Find the one nobody knows about yet',
    essentialQuestion: 'What makes an artist worth believing in?',
    iCan: 'I can select an emerging artist and identify strong evidence about why they deserve attention.',
    agenda: [
      'Review: What makes an artist worth signing?',
      'CHOOSE your artist from the platform',
      'Research their story — build your evidence',
      'Play FACT OR OPINION to sharpen your skills'
    ],
    hook: {
      title: 'Imagine This...',
      prompts: [
        'You are scrolling through music and you hear something that stops you',
        'Something about this artist is DIFFERENT — their sound, their story, their energy',
        'Today you find that artist and make them YOURS'
      ]
    },
    teacherNote: 'Build urgency — this is the commitment moment. Once they choose, that artist is theirs for the rest of the unit. First come, first served means they need to be decisive. Remind them to use the listening skills from Lesson 2 when choosing.'
  },

  // What Makes an Artist Worth It?
  worthSigning: {
    title: 'What Makes an Artist Worth It?',
    subtitle: 'The 4-Point Checklist',
    checklist: [
      {
        label: 'Unique Sound',
        icon: 'music',
        description: 'Do they sound DIFFERENT from everyone else? Can you hear their voice in a crowd?',
        question: 'If you played their song in a room of 100 songs, would it stand out?'
      },
      {
        label: 'Story',
        icon: 'bookOpen',
        description: 'Where are they from? What drives them? Is there something about their background that makes you care?',
        question: 'Could you tell someone their story in 30 seconds and make them interested?'
      },
      {
        label: 'Growth',
        icon: 'trendingUp',
        description: 'Are they getting better? Are more people discovering them? Is there momentum?',
        question: 'Is this artist on the way UP — or have they peaked?'
      },
      {
        label: 'Your Gut',
        icon: 'heart',
        description: 'Do YOU believe in this artist? Would you stake your reputation on them?',
        question: 'If you had one shot to make an artist blow up, would you pick THIS one?'
      }
    ],
    teacherNote: 'Walk through each point. Emphasize that agents use ALL FOUR — not just gut feeling. The research in this unit is about backing up your gut with evidence. Remind students to use the Description Toolkit from Lesson 2 when evaluating sound.'
  },

  // Strong vs Weak Evidence
  strongVsWeak: {
    title: 'Strong vs Weak Evidence',
    subtitle: 'What Would Convince a Label?',
    strong: [
      {
        statement: 'Their EP has 12,000 streams in 3 months',
        why: 'Specific number + specific timeframe = verifiable growth'
      },
      {
        statement: 'Featured on Bandcamp Daily in October 2025',
        why: 'Named source + specific date = credible press mention'
      },
      {
        statement: 'Self-released debut at age 20, Pitchfork gave it Best New Music',
        why: 'Specific achievement + recognized publication = strong credential'
      }
    ],
    weak: [
      {
        statement: 'They are really good',
        why: 'Vague — what does "good" mean? No specifics.'
      },
      {
        statement: 'A lot of people like them',
        why: 'How many? Where? "A lot" means nothing without data.'
      },
      {
        statement: 'They should be famous',
        why: 'Opinion without evidence — WHY should they be famous?'
      }
    ],
    rule: 'Strong evidence has NUMBERS, NAMES, DATES, and SOURCES. Weak evidence has VAGUE WORDS and NO PROOF.',
    teacherNote: 'This is the most important slide for the unit. Every pitch in Lesson 5 will be judged on evidence quality. Plant the seed now that "I like them" is not enough — agents need proof.'
  },

  // Research Session
  researchIntro: {
    title: 'Research Your Artist',
    subtitle: 'Build Your Evidence Board',
    description: 'You have your artist. Now dig into their profile and find the facts that will make your case. Save at least 5 strong pieces of evidence to your Research Board.',
    tasks: [
      {
        label: 'Read the Bio',
        description: 'Where are they from? When did they start? What is their story?'
      },
      {
        label: 'Check the Numbers',
        description: 'How many albums? What instruments? When did they form?'
      },
      {
        label: 'Find the Hook',
        description: 'What is the ONE thing about this artist that would make someone stop scrolling?'
      },
      {
        label: 'Save to Research Board',
        description: 'Highlight and save at least 5 facts that you can use in your pitch'
      }
    ],
    teacherNote: 'Students should spend the full 12 minutes reading and saving. Walk around and check that they are finding SPECIFIC facts, not just reading casually.'
  },

  // Checkpoint
  checkpoint: {
    title: 'Agent Checkpoint',
    subtitle: 'Where Do You Stand?',
    prompts: [
      {
        number: 1,
        question: 'Tell your neighbor: Who did you pick and WHY?',
        hint: 'Use at least one specific fact from your research, not just "I liked their sound."'
      },
      {
        number: 2,
        question: 'What is the strongest piece of evidence you found?',
        hint: 'Think: would this convince a label executive?'
      }
    ],
    lookingAhead: 'Next lesson, you will DESIGN THE CAMPAIGN — build a 5-slide press kit using your research, Sound Statement, and evidence. Bring everything.',
    teacherNote: 'Quick partner share. Listen for students using specific evidence vs vague opinions. Call out strong examples to the class.'
  },

  // Lesson Complete
  lessonComplete: {
    title: 'Lesson 3 Complete!',
    subtitle: 'You Have Your Artist',
    summary: [
      'You chose an emerging artist and committed to representing them',
      'Strong evidence uses NUMBERS, NAMES, DATES, and SOURCES',
      'Weak evidence uses vague words with no proof',
      'Your Research Board has at least 5 facts to build your case'
    ],
    nextLesson: {
      title: 'Lesson 4: Design the Campaign',
      preview: 'Build your 5-slide press kit — the visual campaign that makes the world discover your artist.'
    },
    celebration: 'Your artist has an agent now. Do not let them down.'
  }
};

// ========================================
// 2. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Evidence', definition: 'Facts, data, quotes, or examples that support a claim — the proof behind your argument' },
  { term: 'Strong Evidence', definition: 'Specific, verifiable information with numbers, dates, names, or sources' },
  { term: 'Weak Evidence', definition: 'Vague statements without specifics — "a lot of people" or "really good" with no proof' },
  { term: 'Research Board', definition: 'Your collection of saved facts, quotes, and images about your artist — the raw material for your pitch' },
  { term: 'Credible Source', definition: 'A trustworthy place where information comes from — like a recognized publication or official record' },
  { term: 'Fact', definition: 'A statement that can be proven true or false with evidence' },
  { term: 'Opinion', definition: 'A statement that reflects someone\'s personal view — it cannot be proven, only agreed or disagreed with' }
];
