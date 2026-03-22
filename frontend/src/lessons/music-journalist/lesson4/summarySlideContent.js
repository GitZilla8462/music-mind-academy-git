// File: /src/lessons/music-journalist/lesson4/summarySlideContent.js
// All instructional text and content for Music Agent Unit — Lesson 4
// "Design the Campaign"
// Students build their 5-slide press kit using the presentation tool
//
// Standards:
// - CCSS.ELA-LITERACY.SL.7.5 — Include multimedia in presentations
// - CCSS.ELA-LITERACY.W.7.7 — Short research projects using several sources
// - ISTE 6a — Choose platforms to create original works

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Welcome Hook
  welcomeHook: {
    title: 'Design the Campaign',
    subtitle: 'What does the world see first?',
    essentialQuestion: 'How do you tell someone\'s story in a way that makes people care?',
    iCan: 'I can design a press kit that uses research, visuals, and persuasive writing to promote an emerging artist.',
    agenda: [
      'See a REAL press kit example',
      'Learn the 5-SLIDE STRUCTURE',
      'BUILD your press kit (25 min)',
      'Get PEER FEEDBACK from a partner',
      'POLISH for Launch Day'
    ],
    hook: {
      title: 'First Impressions Matter',
      prompts: [
        'When you scroll past an artist on social media, what makes you STOP?',
        'A great campaign makes someone go from "who?" to "I need to hear this" in seconds',
        'Today you design that moment for YOUR artist'
      ]
    },
    teacherNote: 'Show a real press kit or artist promo page if possible. The point is that professionals design how an artist is presented to the world — students are doing the same thing.'
  },

  // 5-Slide Structure
  fiveSlideStructure: {
    title: 'Your 5-Slide Press Kit',
    subtitle: 'The Campaign That Makes Your Artist Go Viral',
    slides: [
      {
        number: 1,
        title: 'This Is [Artist Name]',
        description: 'The introduction. Name, genre, location, and one hook sentence that makes someone want to know more.',
        prompt: 'What would you put on a billboard if you had 5 seconds of someone\'s attention?',
        requires: 'Artist name, genre, location, hook line, photo'
      },
      {
        number: 2,
        title: 'This Is What They Sound Like',
        description: 'Your Sound Statement front and center. Mood, influences, and "if you like ___, you\'ll love ___."',
        prompt: 'Can someone READ this slide and hear the music in their head?',
        requires: 'Sound Statement, mood tags, influences, comparison'
      },
      {
        number: 3,
        title: 'Why They\'re About to Blow Up',
        description: 'Your 3 evidence-backed reasons. Numbers, facts, press mentions, growth — the proof.',
        prompt: 'Would a record label executive read these 3 reasons and want to hear more?',
        requires: '3 specific, evidence-based reasons'
      },
      {
        number: 4,
        title: 'Press Play',
        description: 'The song that hooks you. What track should someone hear FIRST, and what should they listen for?',
        prompt: 'If you only had one song to convince someone, which one and WHY?',
        requires: 'Track title, album, what to listen for'
      },
      {
        number: 5,
        title: 'Make Them Go Viral',
        description: 'Your closing pitch. One powerful statement + your call to action. Why NOW?',
        prompt: 'In one sentence, why should anyone care about this artist RIGHT NOW?',
        requires: 'Closing pitch, call to action, memorable fact'
      }
    ],
    teacherNote: 'Walk through each slide slowly. Show how each one connects to work students already did: Slide 1 = artist profile (Lesson 2), Slide 2 = Sound Statement (Lesson 3), Slide 3 = 3 reasons (Lesson 3), Slide 4 = critical listening (Lesson 3), Slide 5 = synthesis of everything.'
  },

  // Build Time
  buildTime: {
    title: 'Build Your Press Kit',
    subtitle: '25 Minutes — Make It Count',
    tips: [
      {
        label: 'Start with your research',
        description: 'Open the Research Board panel — your facts and highlights are already there'
      },
      {
        label: 'Pick a layout',
        description: 'Choose how each slide looks — drag text and images to make it yours'
      },
      {
        label: 'Choose your colors',
        description: 'Pick a palette that matches your artist\'s vibe — genre colors are a great default'
      },
      {
        label: 'Add images',
        description: 'Use images from your Research Board or search for new ones'
      },
      {
        label: 'Make it UNIQUE',
        description: 'This is YOUR campaign — move things around, resize text, make every slide different'
      }
    ],
    reminder: 'Your press kit auto-saves every 30 seconds. Focus on content first, design second.',
    teacherNote: 'Let students work. Walk around and check for evidence quality, not just visual design. A pretty press kit with weak evidence will not win on Launch Day.'
  },

  // Peer Review
  peerReview: {
    title: 'Peer Review',
    subtitle: 'Swap and Give Real Feedback',
    instructions: [
      'SWAP Chromebooks with your partner',
      'Look at each slide — is the evidence strong? Is the design clear?',
      'Answer these questions:'
    ],
    questions: [
      'Which slide is the STRONGEST? Why?',
      'Which slide needs MORE EVIDENCE or detail?',
      'After seeing this press kit, would you listen to this artist? Why or why not?'
    ],
    feedbackRules: [
      'Be SPECIFIC — "Slide 3 needs a number" is better than "needs more work"',
      'Be CONSTRUCTIVE — suggest what to add, not just what is wrong',
      'Be HONEST — your partner needs real feedback to make their pitch better'
    ],
    teacherNote: 'Give 5 minutes for review, then 4 minutes for revisions. Students should make at least one change based on feedback before Lesson 5.'
  },

  // Presentation Prep
  presentationPrep: {
    title: 'Launch Day Is Next',
    subtitle: 'Prepare Your Pitch',
    formats: [
      {
        name: 'Live Pitch',
        description: 'Stand up, present your slides, teacher plays the track',
        icon: 'mic'
      },
      {
        name: 'Partner Pitch',
        description: 'Present together with a partner — split the slides',
        icon: 'users'
      }
    ],
    expectations: [
      '2-3 minutes per pitch',
      'Tell the STORY — do not just read your slides',
      'Make eye contact — you are an agent, not a robot',
      'You MUST play or reference a song — the music speaks for itself',
      'End with a call to action — tell the class what to DO'
    ],
    teacherNote: 'Set the stakes. Launch Day is a performance. Students who prepare will be more confident and persuasive. Encourage them to practice out loud at least once before next class.'
  },

  // Lesson Complete
  lessonComplete: {
    title: 'Lesson 4 Complete!',
    subtitle: 'Your Campaign Is Ready',
    summary: [
      'You designed a 5-slide press kit with layouts, colors, images, and evidence-backed content',
      'You received peer feedback and made revisions',
      'Your press kit connects research (Lesson 2), critical listening (Lesson 3), and persuasive design',
      'You are ready for Launch Day'
    ],
    nextLesson: {
      title: 'Lesson 5: Launch Day',
      preview: 'Present your campaign to the class. The class votes on whose artist goes viral.'
    },
    celebration: 'You just did what real agents do — turned research into a campaign that makes people care.'
  }
};

// ========================================
// 2. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Press Kit', definition: 'A professional package of materials used to promote an artist — includes bio, photos, music, and achievements' },
  { term: 'Call to Action', definition: 'Telling your audience exactly what you want them to do — like "follow this artist" or "press play right now"' },
  { term: 'Campaign', definition: 'A coordinated effort to promote something — your press kit is the visual campaign for your artist' },
  { term: 'Audience', definition: 'The people you are trying to reach and convince — in this case, the class (and eventually the world)' },
  { term: 'Peer Feedback', definition: 'Constructive comments from a classmate designed to help you improve your work before the final presentation' }
];
