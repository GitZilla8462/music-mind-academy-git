// File: /src/lessons/music-journalist/lesson3/summarySlideContent.js
// All instructional text and content for Music Journalist Lesson 3 - Deep Dive
// "More Sources, More Evidence, Stronger Story"

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Slide 1 - Progress Check
  progressCheck: {
    title: "Progress Check",
    subtitle: "Where Are We in Our Investigation?",
    icon: "📋",
    soFar: [
      "Chosen a music topic to investigate",
      "Read TWO articles about your topic",
      "Collected evidence: quotes, facts, and observations",
      "Started building your research board"
    ],
    todaysGoal: [
      "Read a THIRD article for deeper evidence",
      "Learn to tell STRONG evidence from WEAK evidence",
      "ORGANIZE your research board by theme",
      "Play the Headline Writer game"
    ],
    teacherNote: "Quick review to reconnect students with their research. Ask 2-3 students to share what topic they chose and one thing they learned."
  },

  // Slide 2 - Strong vs. Weak Evidence
  strongEvidence: {
    title: "Strong vs. Weak Evidence",
    subtitle: "Not All Evidence Is Created Equal",
    icon: "💪",
    weakExamples: [
      {
        text: "The song is popular.",
        problem: "Too vague - HOW popular?"
      },
      {
        text: "People like it.",
        problem: "Who? How many?"
      },
      {
        text: "It sounds good.",
        problem: "That's an opinion, not evidence"
      }
    ],
    strongExamples: [
      {
        text: "The song reached #1 on Billboard Hot 100 in its first week.",
        strength: "Specific fact with source"
      },
      {
        text: "Producer Pharrell Williams said: 'I wanted every beat to feel like sunshine.'",
        strength: "Direct quote from expert"
      },
      {
        text: "The album sold 2 million copies in 3 days.",
        strength: "Measurable data with timeframe"
      }
    ],
    howToStrengthen: [
      "Add NUMBERS and DATES when possible",
      "Use DIRECT QUOTES from artists or experts",
      "Include WHO, WHAT, WHEN, WHERE details",
      "Cite your SOURCE so readers can verify"
    ],
    teacherNote: "Walk through each weak example and ask students how to make it stronger. The key insight: strong evidence is SPECIFIC and VERIFIABLE."
  },

  // Slide 3 - Image Library
  imageLibraryIntro: {
    title: "Images Tell Stories Too",
    subtitle: "How Journalists Use Visuals",
    icon: "📸",
    whyImagesMatter: [
      "A great image grabs the reader's attention FIRST",
      "Images provide CONTEXT that words alone cannot",
      "Professional journalists always pair text with visuals"
    ],
    choosingImages: [
      "Does it connect to your MAIN IDEA?",
      "Does it make the reader want to READ MORE?",
      "Could you write a caption explaining WHY this image matters?"
    ],
    captionTips: [
      "A caption should explain WHAT is happening in the image",
      "Include WHO is in the image if it's a person",
      "Connect the image to your story's main point"
    ],
    teacherNote: "Show 2-3 examples of music journalism with strong images. Point out how the image draws you in before you read a single word."
  },

  // Slide 4 - Headline Writer Instructions
  headlineWriterInstructions: {
    title: "Headline Writer",
    subtitle: "Can You Write the Perfect Headline?",
    icon: "📰",
    howToPlay: [
      "Read a short music news summary",
      "Write the most compelling HEADLINE you can",
      "A great headline is SHORT, SPECIFIC, and makes you want to read more",
      "Vote on the best headlines from the class!"
    ],
    headlineTips: [
      "Use ACTIVE verbs ('breaks' not 'has broken')",
      "Include a HOOK that creates curiosity",
      "Keep it under 10 words if possible",
      "Make the reader ask 'Wait, what?!'"
    ],
    exampleHeadlines: [
      {
        weak: "Taylor Swift Releases New Album",
        strong: "Taylor Swift Drops Surprise Album at Midnight, Breaks Spotify Record"
      },
      {
        weak: "New Music Festival Announced",
        strong: "Coachella Adds Secret Stage Underground for 2026"
      }
    ],
    teacherNote: "Read through examples as a class. Ask students what makes the 'strong' headlines better. Emphasize: specificity and curiosity."
  },

  // Slide 5 - Reflection
  reflection: {
    title: "Reflection",
    subtitle: "Think About Your Research",
    icon: "🤔",
    discussionQuestions: [
      "What is the STRONGEST piece of evidence you found today?",
      "How did organizing your research board help you see your story more clearly?",
      "What headline would YOU write for your own story?"
    ],
    teacherNote: "Give students 30 seconds of think time before discussion. Cold call or pair-share for each question."
  },

  // Slide 6 - Lesson Complete
  lessonComplete: {
    title: "Deep Dive Complete!",
    subtitle: "You're Building a Real Story",
    icon: "🎉",
    todayAccomplishments: [
      "Learned to identify STRONG vs. WEAK evidence",
      "Read a THIRD article and collected key details",
      "ORGANIZED your research board by theme",
      "Practiced writing attention-grabbing HEADLINES"
    ],
    nextLesson: {
      title: "Lesson 4: Build Your Story",
      preview: [
        "Turn your research into a 4-slide presentation",
        "Learn storytelling techniques real journalists use",
        "Build something you're proud to share!"
      ]
    },
    teacherNote: "Celebrate effort. Remind students their research boards will be the foundation for their presentations in Lesson 4."
  }
};

// ========================================
// 2. EVIDENCE QUALITY EXAMPLES
// ========================================
export const evidenceExamples = {
  weak: [
    { text: "The song is popular.", issue: "No specifics - how popular?" },
    { text: "People like it.", issue: "Vague - who are these people?" },
    { text: "It sounds good.", issue: "Opinion, not evidence" },
    { text: "The concert was big.", issue: "No numbers or details" },
    { text: "They are famous.", issue: "No context or proof" }
  ],
  strong: [
    { text: "The song reached #1 on Billboard Hot 100.", strength: "Specific ranking with source" },
    { text: "The concert sold out 70,000 seats in 4 minutes.", strength: "Exact numbers and timeframe" },
    { text: "Beyonce said: 'This album is my love letter to Houston.'", strength: "Direct quote with attribution" },
    { text: "Spotify reported 100 million streams in the first 24 hours.", strength: "Data from named source" },
    { text: "The genre originated in the Bronx, New York in 1973.", strength: "Specific place and date" }
  ]
};

// ========================================
// 3. HEADLINE WRITER GAME DATA
// ========================================
export const headlineWriterPrompts = [
  {
    id: 1,
    summary: "A 14-year-old from Detroit just signed a record deal with Atlantic Records after her cover of a Billie Eilish song went viral on TikTok, getting 50 million views in one week.",
    sampleHeadlines: [
      "Detroit Teen's TikTok Cover Lands Atlantic Records Deal",
      "14-Year-Old Goes From Bedroom to Record Label in One Week",
      "50 Million Views Later: Detroit's Newest Signing"
    ]
  },
  {
    id: 2,
    summary: "Scientists discovered that listening to music you love releases the same brain chemicals as eating chocolate. The study tested 200 people and found that favorite songs increased dopamine by 9%.",
    sampleHeadlines: [
      "Science Confirms: Your Favorite Song Is Literally Like Chocolate",
      "Study: Music Triggers Same Brain Chemicals as Candy",
      "Why Your Playlist Feels So Good, According to Science"
    ]
  },
  {
    id: 3,
    summary: "The world's largest music festival, Glastonbury, announced it will be entirely solar-powered by 2027. The festival uses as much electricity as a small city during its 5-day run.",
    sampleHeadlines: [
      "Glastonbury Goes Solar: World's Biggest Festival Ditches Fossil Fuels",
      "A City of Music, Powered by the Sun",
      "Glastonbury 2027: 200,000 Fans, Zero Fossil Fuels"
    ]
  }
];

// ========================================
// 4. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Evidence', definition: 'Facts, quotes, or data that support a claim' },
  { term: 'Source', definition: 'Where information comes from (article, interview, report)' },
  { term: 'Direct Quote', definition: 'The exact words someone said, in quotation marks' },
  { term: 'Theme', definition: 'A main idea or topic that connects multiple pieces of evidence' },
  { term: 'Headline', definition: 'The title of a news story, designed to grab attention' },
  { term: 'Caption', definition: 'Text that explains what is happening in an image' },
  { term: 'Research Board', definition: 'A tool for organizing evidence by theme or category' }
];
