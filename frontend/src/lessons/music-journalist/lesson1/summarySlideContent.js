// File: /src/lessons/music-journalist/lesson1/summarySlideContent.js
// All instructional text and content for Music Journalist Lesson 1
// "Read Like a Journalist"
// How journalists find, read, and analyze music stories

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Welcome Hook - What makes a story worth telling?
  welcomeHook: {
    title: 'Read Like a Journalist',
    subtitle: 'What makes a story worth telling?',
    body: 'Every day, thousands of music stories are published online. Album drops, concert reviews, artist interviews, industry news. Music journalists are the people who find these stories, investigate them, and share them with the world. Today, you become one of them.',
    scenarios: [
      {
        headline: 'Surprise Album Drop at Midnight',
        description: 'Your favorite artist just released a new album with zero promotion',
        type: 'news'
      },
      {
        headline: 'Local Teen Wins National Songwriting Contest',
        description: 'A 14-year-old from your city just beat 10,000 entries',
        type: 'feature'
      },
      {
        headline: 'Concert Venue Bans Phones From All Shows',
        description: 'A major arena says no more recording — fans are divided',
        type: 'news'
      }
    ],
    discussionPrompt: 'Which of these stories would YOU want to read about? Why?',
    teacherNote: 'Use these scenarios to spark discussion. Ask students which story grabs their attention and why. This sets up the idea that journalists choose stories their audience cares about.'
  },

  // What Is Music Journalism? - Three types of music writing
  whatIsJournalism: {
    title: 'What Is Music Journalism?',
    subtitle: 'Three Types of Music Writing',
    types: [
      {
        name: 'News Article',
        icon: 'newspaper',
        color: '#3B82F6',
        description: 'Reports WHAT HAPPENED — factual, timely, objective',
        example: 'Billie Eilish announces 2026 world tour with 47 dates across North America',
        keyTraits: ['Answers: Who? What? When? Where? Why?', 'Based on facts, not opinions', 'Written quickly after something happens'],
        realWorld: 'Think of it like a sports score — just the facts'
      },
      {
        name: 'Review',
        icon: 'star',
        color: '#F59E0B',
        description: 'Shares a critic\'s OPINION about music — argues a point of view',
        example: 'Kendrick Lamar\'s new album is a masterpiece of storytelling and production',
        keyTraits: ['States an opinion clearly', 'Supports opinion with specific evidence', 'Helps readers decide if they should listen'],
        realWorld: 'Think of it like a movie review — someone telling you if it is worth your time'
      },
      {
        name: 'Feature Story',
        icon: 'bookOpen',
        color: '#10B981',
        description: 'A deep dive into a person, trend, or topic — tells a STORY',
        example: 'How a 14-year-old bedroom producer became the most streamed artist on SoundCloud',
        keyTraits: ['Uses interviews, quotes, and details', 'Reads like a story with a beginning, middle, end', 'Takes more time to research and write'],
        realWorld: 'Think of it like a documentary — you learn something new about a person or topic'
      }
    ],
    teacherNote: 'Walk through each type slowly. Ask students to name real articles they have read that fit each category. Most students will be familiar with news and reviews but not features.'
  },

  // MMA News Feed Introduction
  newsFeedIntro: {
    title: 'The MMA News Feed',
    subtitle: 'Your Source for Music Stories',
    description: 'The MMA News Feed is a curated collection of music articles written specifically for this class. Throughout this unit, new articles will appear in your feed. Each one is labeled as NEWS, REVIEW, or FEATURE so you always know what type of writing you are reading.',
    features: [
      {
        label: 'Read',
        description: 'Open articles and read them on your Chromebook'
      },
      {
        label: 'Annotate',
        description: 'Highlight facts, opinions, vocabulary, and key quotes'
      },
      {
        label: 'Save',
        description: 'Bookmark articles to your portfolio for writing assignments'
      },
      {
        label: 'Sort',
        description: 'Filter articles by type: news, review, or feature'
      }
    ],
    teacherNote: 'This is a quick overview. Students will interact with the News Feed directly in the next stage when they read the featured article.'
  },

  // Annotation Practice - Four highlight colors and their meanings
  annotationPractice: {
    title: 'How to Annotate Like a Journalist',
    subtitle: 'Use Colors to Mark What You Find',
    highlights: [
      {
        color: 'yellow',
        hex: '#FDE047',
        label: 'FACT',
        description: 'Something that can be proven true with evidence',
        example: '"Taylor Swift\'s Eras Tour grossed over $1 billion in 2023."'
      },
      {
        color: 'blue',
        hex: '#93C5FD',
        label: 'VOCABULARY',
        description: 'A word or term you want to remember or look up',
        example: '"The artist\'s syncopated rhythms drew from West African drumming traditions."'
      },
      {
        color: 'green',
        hex: '#86EFAC',
        label: 'OPINION',
        description: 'Someone\'s personal view, belief, or judgment',
        example: '"This is the most innovative album of the decade."'
      },
      {
        color: 'star',
        hex: '#F0B429',
        label: 'SAVE',
        description: 'A quote or detail you want to use in your own writing later',
        example: '"Music is the soundtrack of your life." — Dick Clark'
      }
    ],
    whyAnnotate: [
      'Journalists mark up articles to find KEY INFORMATION quickly',
      'Annotations help you REMEMBER what you read',
      'You will use your annotations when you WRITE your own articles',
      'Practice now — you will annotate every article in this unit'
    ],
    teacherNote: 'Walk through each color one at a time. Show an example sentence on screen and ask the class what color they would use. Emphasize that there is no single right answer for every sentence — context matters.'
  },

  // Fact vs Opinion - Examples using real music facts/opinions
  factVsOpinion: {
    title: 'Fact vs Opinion',
    subtitle: 'Can You Tell the Difference?',
    definition: {
      fact: 'A statement that can be PROVEN true or false with evidence, data, or documentation.',
      opinion: 'A statement that reflects someone\'s PERSONAL VIEW, belief, or judgment. It cannot be proven — only agreed or disagreed with.'
    },
    examples: [
      {
        statement: 'Beyonce has won 32 Grammy Awards.',
        answer: 'fact',
        explanation: 'This can be verified by checking Grammy records. It is a documented number.'
      },
      {
        statement: 'Beyonce is the greatest performer of all time.',
        answer: 'opinion',
        explanation: '"Greatest" is subjective. Different people have different views on who the greatest performer is.'
      },
      {
        statement: 'The Beatles released their first album, Please Please Me, on March 22, 1963.',
        answer: 'fact',
        explanation: 'This is a documented historical date that can be verified.'
      },
      {
        statement: 'The Beatles changed music forever.',
        answer: 'opinion',
        explanation: 'While many agree, "changed music forever" is an interpretation, not a provable claim.'
      },
      {
        statement: 'Drake\'s album Views debuted at number one on the Billboard 200.',
        answer: 'fact',
        explanation: 'Billboard chart positions are recorded data.'
      },
      {
        statement: 'Drake\'s Views is his best album.',
        answer: 'opinion',
        explanation: '"Best" is a matter of personal taste. Others might prefer Take Care or Nothing Was the Same.'
      },
      {
        statement: 'Spotify had over 600 million users in 2024.',
        answer: 'fact',
        explanation: 'This is a verifiable statistic reported by the company.'
      },
      {
        statement: 'Spotify is the best music streaming service.',
        answer: 'opinion',
        explanation: '"Best" depends on personal preference. Some prefer Apple Music, YouTube Music, or Tidal.'
      }
    ],
    signalWords: {
      fact: ['according to', 'data shows', 'records indicate', 'was released on', 'sold', 'won', 'earned'],
      opinion: ['best', 'worst', 'greatest', 'most beautiful', 'should', 'I think', 'I believe', 'obviously']
    },
    whyItMatters: [
      'NEWS articles should be mostly FACTS',
      'REVIEWS are built on OPINIONS supported by evidence',
      'Good journalists know the difference and use both on purpose',
      'Readers trust journalists who are honest about what is fact vs opinion'
    ],
    teacherNote: 'Go through 3-4 examples as a class before the game. Ask students to explain WHY each statement is a fact or opinion. Introduce signal words as a tool for quick identification.'
  },

  // Reflection - Portfolio prompt questions
  reflection: {
    title: 'Portfolio Reflection',
    subtitle: 'Think Like a Journalist',
    prompts: [
      {
        number: 1,
        question: 'What is one thing you learned about music journalism today?',
        hint: 'Think about the three types of writing or the annotation system.'
      },
      {
        number: 2,
        question: 'Which type of music writing interests you most: news, review, or feature? Why?',
        hint: 'There is no wrong answer — think about what kind of writing you would enjoy doing.'
      },
      {
        number: 3,
        question: 'Why is it important for a journalist to know the difference between fact and opinion?',
        hint: 'Think about what would happen if a news article was full of opinions, or a review had no opinions at all.'
      }
    ],
    lookingAhead: 'Next lesson, you will learn to WRITE like a journalist. Start noticing music articles you see online — are they news, reviews, or features?',
    teacherNote: 'Students can respond verbally or in writing. If time allows, have 2-3 students share their answers. Save written responses to their portfolio.'
  },

  // Lesson Complete - Wrap-up message
  lessonComplete: {
    title: 'Lesson 1 Complete!',
    subtitle: 'You Are Reading Like a Journalist',
    summary: [
      'Music journalism includes three types: NEWS, REVIEWS, and FEATURES',
      'Annotating with color-coded highlights helps you read actively and find key information',
      'Facts can be proven with evidence — opinions reflect personal views and judgments',
      'Good journalists use both facts and opinions on purpose, and they are honest about which is which'
    ],
    nextLesson: {
      title: 'Lesson 2: Write Like a Journalist',
      preview: 'You will draft your first music news article using facts, quotes, and proper structure.'
    },
    celebration: 'You are officially on your way to becoming a music journalist!'
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
    explanation: '"Ruined" is a value judgment. Others might say streaming saved or transformed the industry.'
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
    statement: 'The electric guitar was invented in the 1930s.',
    answer: 'fact',
    explanation: 'This is a documented historical fact about the instrument\'s development.'
  },
  {
    id: 12,
    statement: 'Guitar solos are the most exciting part of any rock song.',
    answer: 'opinion',
    explanation: '"Most exciting" is a personal preference, not a provable statement.'
  },
  {
    id: 13,
    statement: 'BTS became the first K-pop group to perform at the Grammy Awards in 2020.',
    answer: 'fact',
    explanation: 'This is a documented first that can be verified through Grammy records.'
  },
  {
    id: 14,
    statement: 'K-pop has the most dedicated fanbase in all of music.',
    answer: 'opinion',
    explanation: '"Most dedicated" is subjective and cannot be measured objectively.'
  },
  {
    id: 15,
    statement: 'A standard piano has 88 keys.',
    answer: 'fact',
    explanation: 'This is a verifiable physical characteristic of the instrument.'
  },
  {
    id: 16,
    statement: 'Piano is the easiest instrument to learn.',
    answer: 'opinion',
    explanation: '"Easiest" depends on the individual learner and is not provable.'
  }
];

// ========================================
// 3. ANNOTATION COLOR GUIDE
// ========================================
export const annotationColors = {
  fact: { color: 'yellow', hex: '#FDE047', label: 'Fact', shortcut: 'F' },
  vocabulary: { color: 'blue', hex: '#93C5FD', label: 'Vocabulary', shortcut: 'V' },
  opinion: { color: 'green', hex: '#86EFAC', label: 'Opinion', shortcut: 'O' },
  save: { color: 'gold', hex: '#F0B429', label: 'Save', shortcut: 'S' }
};

// ========================================
// 4. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Music Journalism', definition: 'Writing about music for an audience — reporting, reviewing, and telling stories about artists and the music industry' },
  { term: 'News Article', definition: 'A factual report about something that happened — answers who, what, when, where, and why' },
  { term: 'Review', definition: 'A piece of writing that shares a critic\'s opinion about music, supported by evidence and reasoning' },
  { term: 'Feature Story', definition: 'A longer, in-depth article that tells a story about a person, trend, or topic in music' },
  { term: 'Fact', definition: 'A statement that can be proven true or false with evidence' },
  { term: 'Opinion', definition: 'A statement that reflects someone\'s personal view, belief, or judgment' },
  { term: 'Annotate', definition: 'To mark up a text with highlights, notes, or symbols to identify key information' },
  { term: 'Headline', definition: 'The title of an article, designed to grab attention and summarize the story' },
  { term: 'Byline', definition: 'The line in an article that tells the reader who wrote it' },
  { term: 'Source', definition: 'Where information comes from — a person, document, or organization that provides facts' }
];
