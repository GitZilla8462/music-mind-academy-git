// File: /src/lessons/music-journalist/lesson2/summarySlideContent.js
// All instructional text and content for Lesson 2 - Find Your Beat
// "Choose your topic and start building your research board"

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Slide 1 - Welcome Hook
  welcomeHook: {
    title: "Find Your Beat",
    subtitle: "Choose your topic and start building your research board",
    essentialQuestion: "What makes a music story worth investigating?",
    iCan: "I can choose a research topic and identify credible sources.",
    agenda: [
      "Browse the NEWS FEED for music stories",
      "Choose YOUR TOPIC using a checklist",
      "Start your RESEARCH BOARD with real articles",
      "Play SOURCE OR NOT? to sharpen your credibility skills"
    ],
    hook: {
      title: "What Story Do YOU Want to Tell?",
      prompts: [
        "Every great journalist starts with a question they care about",
        "Today YOU pick the music story you want to investigate",
        "Your topic will drive your entire project"
      ]
    },
    teacherNote: "Start by asking students what music topics they are curious about. Get a few responses before showing the agenda. Energy is key here - this is where students take ownership of their project."
  },

  // Slide 2 - Browse News Feed
  browseNewsFeed: {
    title: "Browsing the News Feed",
    subtitle: "Find Stories That Interest You",
    icon: "📰",
    features: [
      {
        name: "Top Stories",
        description: "Curated headlines updated regularly",
        icon: "📌"
      },
      {
        name: "Search",
        description: "Type keywords to find specific topics",
        icon: "🔍"
      },
      {
        name: "Genre Filters",
        description: "Hip-hop, Pop, Rock, Classical, Jazz, Electronic, and more",
        icon: "🎵"
      },
      {
        name: "Archive",
        description: "Older stories organized by date and category",
        icon: "📁"
      }
    ],
    proTips: [
      "Skim headlines first - do not read every article yet",
      "Star stories that catch your eye",
      "Look for topics with MULTIPLE articles (you will need at least 3)",
      "Think about what connects to your life or to class discussions"
    ],
    teacherNote: "Walk students through the news feed interface on the main screen. Show them how to use filters and search. Spend about 1 minute demonstrating, then let them explore on their own devices."
  },

  // Slide 3 - Choosing a Strong Topic
  choosingTopic: {
    title: "Choosing a Strong Topic",
    subtitle: "Use This Checklist",
    icon: "✅",
    checklist: [
      {
        item: "3+ Articles Available",
        description: "You need enough sources to research thoroughly",
        icon: "📚"
      },
      {
        item: "Explainable in One Sentence",
        description: "If you cannot explain it simply, it might be too broad or confusing",
        icon: "💬"
      },
      {
        item: "Connects to Class",
        description: "Relates to something we have discussed or will discuss",
        icon: "🔗"
      },
      {
        item: "Interesting to YOU",
        description: "You will be working on this for multiple lessons - pick something you care about",
        icon: "❤️"
      }
    ],
    strongExamples: [
      "How streaming changed the way artists release music",
      "Why K-pop is growing so fast in the U.S.",
      "The debate over AI-generated music",
      "How TikTok turns unknown songs into hits"
    ],
    weakExamples: [
      { topic: "Music", reason: "Too broad - what about music?" },
      { topic: "My favorite song", reason: "Too personal, not researchable" },
      { topic: "A song from 1342", reason: "Not enough sources available" }
    ],
    teacherNote: "Go through each checklist item. Ask students to give thumbs up/down on the examples. The weak examples usually get laughs and help clarify what NOT to do."
  },

  // Slide 4 - Partner Setup
  partnerSetup: {
    title: "Working Solo or With a Partner",
    subtitle: "Your Teacher Will Set This Up",
    icon: "🤝",
    soloMode: {
      title: "If Solo",
      points: [
        "You choose your own topic",
        "You build your own research board",
        "You write your own article"
      ]
    },
    partnerMode: {
      title: "If Partners",
      points: [
        "You and your partner agree on ONE topic",
        "You split the reading - each person reads different articles",
        "You combine highlights on a shared research board",
        "You co-write the final article"
      ]
    },
    eitherWay: [
      "Everyone is responsible for reading at least 2 articles today",
      "Everyone saves highlights to the research board"
    ],
    teacherNote: "This is configured in the teacher dashboard before the lesson. If partners, give students 1-2 minutes to discuss and agree on a shared topic."
  },

  // Slide 5 - Save Topic Instructions
  saveTopicInstructions: {
    title: "Save Your Topic",
    subtitle: "Time to Commit!",
    icon: "💾",
    steps: [
      {
        step: 1,
        icon: "✏️",
        title: "Type your topic",
        description: "Write your topic as a clear, specific question or statement"
      },
      {
        step: 2,
        icon: "✅",
        title: "Check the checklist",
        description: "Make sure your topic passes all four criteria"
      },
      {
        step: 3,
        icon: "💾",
        title: "Click Save",
        description: "Lock in your topic - you can edit it later if needed"
      }
    ],
    teacherNote: "Monitor the dashboard to see which students have saved topics. Help students who are stuck narrow down their ideas."
  },

  // Slide 6 - Research Session Instructions
  researchSession: {
    title: "Research Session",
    subtitle: "Read, Highlight, Save",
    icon: "🔬",
    goals: [
      "Read at least 2 ARTICLES related to your topic",
      "HIGHLIGHT key quotes, facts, and ideas",
      "SAVE highlights to your research board",
      "Note the SOURCE for each highlight (author, publication, date)"
    ],
    whatMakesGoodHighlight: [
      {
        type: "Surprising Fact or Statistic",
        example: "Streaming now accounts for 84% of music industry revenue",
        icon: "📊"
      },
      {
        type: "Direct Quote",
        example: "As Taylor Swift said, 'Music is art, and art should be paid for'",
        icon: "💬"
      },
      {
        type: "Key Idea",
        example: "AI-generated music raises questions about copyright ownership",
        icon: "💡"
      },
      {
        type: "Something You Disagree With",
        example: "The author claims vinyl is making a comeback, but the data is mixed",
        icon: "🤔"
      }
    ],
    earlyFinishers: [
      "Read a 3rd article",
      "Organize your highlights by theme",
      "Write a one-sentence summary of each article"
    ],
    teacherNote: "Set the timer for 15 minutes. Walk around and check in with students. Encourage them to highlight specific passages, not just star whole articles. Monitor the dashboard for progress."
  },

  // Slide 7 - Source or Not? Game Intro
  sourceOrNotIntro: {
    title: "Source or Not?",
    subtitle: "The News Credibility Challenge",
    icon: "🕵️",
    howToPlay: [
      "You will see a music news headline and source",
      "Decide: Is this a CREDIBLE source or NOT?",
      "Answer quickly for bonus points!",
      "After each round, see WHY the source is credible or not"
    ],
    credibleSignals: [
      {
        signal: "Known, Reputable Outlet",
        examples: "Rolling Stone, Billboard, NPR Music, Pitchfork",
        icon: "✅"
      },
      {
        signal: "Identified Author",
        examples: "Written by a named journalist with a bio",
        icon: "✅"
      },
      {
        signal: "Verifiable Facts",
        examples: "Claims can be checked against other sources",
        icon: "✅"
      },
      {
        signal: "Professional Editing",
        examples: "Proper grammar, citations, balanced reporting",
        icon: "✅"
      }
    ],
    notCredibleSignals: [
      {
        signal: "Anonymous Blog Post",
        examples: "No author name, no publication standards",
        icon: "❌"
      },
      {
        signal: "Clickbait Headlines",
        examples: "YOU WON'T BELIEVE what this artist did!!!",
        icon: "❌"
      },
      {
        signal: "No Sources Cited",
        examples: "Claims made without evidence or references",
        icon: "❌"
      },
      {
        signal: "Opinion Disguised as News",
        examples: "Personal rants presented as factual reporting",
        icon: "❌"
      }
    ],
    teacherNote: "This game reinforces media literacy. After the game, connect it back to their research: the sources they choose for their project matter."
  },

  // Slide 8 - Reflection
  reflection: {
    title: "Portfolio Reflection",
    subtitle: "Think About Your Choices",
    icon: "💭",
    prompts: [
      {
        number: 1,
        question: "What topic did you choose, and WHY does it interest you?",
        hint: "Think about what drew you to this story"
      },
      {
        number: 2,
        question: "What is one thing you learned from your research today?",
        hint: "A fact, quote, or idea that surprised you"
      },
      {
        number: 3,
        question: "How will you know if a source is trustworthy for your project?",
        hint: "Think about what you learned from Source or Not?"
      }
    ],
    lookingAhead: [
      "Next class: Continue building your research board",
      "Goal: 5+ highlights from 3+ articles before you start writing"
    ],
    teacherNote: "Give students 3-4 minutes for written reflection. These responses save to their portfolio and help you assess understanding."
  },

  // Slide 9 - Lesson Complete
  lessonComplete: {
    title: "Great Work Today!",
    subtitle: "You Found Your Beat",
    icon: "🎉",
    accomplishments: [
      "Chose a research topic that passes the checklist",
      "Read articles and started your research board",
      "Learned how to spot credible vs. non-credible sources"
    ],
    nextTime: [
      "Continue your research with more articles",
      "Start organizing your highlights into an outline",
      "Get ready to write your first draft!"
    ],
    teacherNote: "Quick verbal check: ask 2-3 students to share their topics. Celebrate the variety of topics chosen. Remind students their research boards save automatically."
  }
};

// ========================================
// 2. TOPIC CHECKLIST DATA
// ========================================
export const topicChecklist = [
  {
    id: 'articles',
    label: '3+ articles available',
    description: 'You need enough sources to research thoroughly',
    icon: '📚'
  },
  {
    id: 'explainable',
    label: 'Explainable in one sentence',
    description: 'If you cannot explain it simply, it might be too broad',
    icon: '💬'
  },
  {
    id: 'connects',
    label: 'Connects to class discussions',
    description: 'Relates to something we have discussed or will discuss',
    icon: '🔗'
  },
  {
    id: 'interesting',
    label: 'Interesting to YOU',
    description: 'You will work on this for multiple lessons',
    icon: '❤️'
  }
];

// ========================================
// 3. SOURCE OR NOT? GAME CONTENT
// ========================================
export const sourceOrNotQuestions = [
  {
    id: 1,
    headline: "Beyonce Breaks Billboard Record with New Album",
    source: "Billboard Magazine",
    sourceUrl: "billboard.com",
    isCredible: true,
    explanation: "Billboard is the industry standard for music charts and sales data. They have direct access to streaming and sales numbers."
  },
  {
    id: 2,
    headline: "This Artist Is SECRETLY Controlled by the Music Industry!!!",
    source: "MusicTruthRevealed.blogspot.com",
    sourceUrl: "musictruthrevealed.blogspot.com",
    isCredible: false,
    explanation: "Anonymous blog with sensationalized headline and no named author. Conspiracy-style language is a red flag."
  },
  {
    id: 3,
    headline: "Streaming Revenue Surpasses Physical Sales for Fifth Consecutive Year",
    source: "NPR Music",
    sourceUrl: "npr.org/music",
    isCredible: true,
    explanation: "NPR is a well-known, reputable news organization with professional editorial standards and fact-checking."
  },
  {
    id: 4,
    headline: "Top 10 Reasons Why Rap Music Is Destroying Society",
    source: "angry_music_fan_2024 on Reddit",
    sourceUrl: "reddit.com/r/unpopularopinion",
    isCredible: false,
    explanation: "This is an anonymous Reddit opinion post, not journalism. It has no editorial review, no sources cited, and uses biased, inflammatory language."
  },
  {
    id: 5,
    headline: "How K-Pop Groups Are Trained: Inside the Idol System",
    source: "Rolling Stone",
    sourceUrl: "rollingstone.com",
    isCredible: true,
    explanation: "Rolling Stone is one of the most established music publications with decades of credible reporting and named journalists."
  },
  {
    id: 6,
    headline: "EXPOSED: Record Labels Are Paying TikTok Influencers to Promote Songs",
    source: "The New York Times",
    sourceUrl: "nytimes.com",
    isCredible: true,
    explanation: "Despite the dramatic headline, The New York Times is a highly credible source with rigorous fact-checking. Investigative journalism often uses strong headlines."
  },
  {
    id: 7,
    headline: "AI Will Replace All Musicians by 2025 - Here's Proof",
    source: "FutureMusicNow (no author listed)",
    sourceUrl: "futuremusicnow.xyz",
    isCredible: false,
    explanation: "Unknown website with no named author, making absolute predictions without evidence. The .xyz domain and lack of editorial standards are red flags."
  },
  {
    id: 8,
    headline: "Live Nation Reports Record Concert Attendance in 2024",
    source: "Variety",
    sourceUrl: "variety.com",
    isCredible: true,
    explanation: "Variety is a long-established entertainment industry trade publication with professional reporters and editorial oversight."
  },
  {
    id: 9,
    headline: "Why Vinyl Records Sound Better Than Digital - A Musician's Take",
    source: "JamSession_Mike on YouTube",
    sourceUrl: "youtube.com/@jamsession_mike",
    isCredible: false,
    explanation: "While the creator may be knowledgeable, a personal YouTube channel is opinion content, not journalism. No editorial review or fact-checking process."
  },
  {
    id: 10,
    headline: "Music Education Programs Linked to Higher Test Scores, Study Finds",
    source: "Education Week",
    sourceUrl: "edweek.org",
    isCredible: true,
    explanation: "Education Week is a respected publication covering education policy and research. They cite studies and use professional editorial standards."
  }
];

// ========================================
// 4. RESEARCH BOARD CONTENT
// ========================================
export const researchBoardContent = {
  instructions: {
    title: "Your Research Board",
    subtitle: "Collect Evidence for Your Story",
    overview: "Save highlights from articles to build your evidence base.",
    mainSteps: [
      {
        step: 1,
        icon: "📖",
        title: "Read an article",
        description: "Choose an article related to your topic"
      },
      {
        step: 2,
        icon: "✨",
        title: "Highlight key passages",
        description: "Select facts, quotes, and ideas that matter"
      },
      {
        step: 3,
        icon: "📝",
        title: "Add your note",
        description: "Write why this highlight matters to your story"
      },
      {
        step: 4,
        icon: "💾",
        title: "Save to board",
        description: "Your highlights are saved automatically"
      }
    ]
  },
  highlightCategories: [
    { id: 'fact', label: 'Fact / Statistic', color: '#3B82F6', icon: '📊' },
    { id: 'quote', label: 'Direct Quote', color: '#8B5CF6', icon: '💬' },
    { id: 'idea', label: 'Key Idea', color: '#10B981', icon: '💡' },
    { id: 'disagree', label: 'Disagree / Question', color: '#F59E0B', icon: '🤔' }
  ]
};

// ========================================
// 5. REFLECTION ACTIVITY CONTENT
// ========================================
export const reflectionActivity = {
  steps: {
    teacherInstruction: {
      title: "Time to Reflect!",
      text: "Think about your topic choice and what you learned about credible sources.",
      voiceText: "Time to reflect on your learning!"
    }
  },

  selfReflection: {
    prompt1: {
      title: "Your Topic",
      question: "What topic did you choose, and WHY does it interest you?",
      voiceText: "What topic did you choose and why?",
      options: [
        "I chose it because it connects to music I listen to every day",
        "I chose it because I saw a debate about it online and want to learn more",
        "I chose it because it affects how artists make a living",
        "I chose it because it is changing how people discover new music",
        "Custom..."
      ]
    },
    prompt2: {
      title: "What You Learned",
      question: "What is one thing you learned from your research today?",
      voiceText: "What did you learn from your research?",
      options: [
        "I learned a surprising fact I did not know before",
        "I found a quote from an expert that changed my thinking",
        "I realized there are multiple sides to this story",
        "I discovered a connection between my topic and a bigger trend",
        "Custom..."
      ]
    },
    prompt3: {
      title: "Source Credibility",
      question: "How will you know if a source is trustworthy for your project?",
      voiceText: "How will you evaluate your sources?",
      options: [
        "I will check if the author is named and has expertise",
        "I will look for facts that can be verified elsewhere",
        "I will avoid anonymous blogs and opinion posts",
        "I will use established publications like Rolling Stone or NPR",
        "Custom..."
      ]
    }
  }
};

// ========================================
// 6. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Beat (journalism)', definition: 'A specific topic or area that a journalist covers regularly' },
  { term: 'Source', definition: 'Where information comes from - a person, publication, or document' },
  { term: 'Credible', definition: 'Trustworthy and reliable; can be believed based on evidence' },
  { term: 'Research Board', definition: 'A collection of highlights, quotes, and notes gathered from articles' },
  { term: 'Highlight', definition: 'A key passage selected from an article for its importance' },
  { term: 'Citation', definition: 'A reference to the source of information (author, publication, date)' },
  { term: 'Bias', definition: 'A tendency to favor one perspective over another' },
  { term: 'Primary Source', definition: 'Firsthand account or original material (interview, speech, data)' },
  { term: 'Secondary Source', definition: 'Analysis or interpretation of primary sources (news article, review)' },
  { term: 'Clickbait', definition: 'Sensationalized headlines designed to get clicks, often misleading' }
];
