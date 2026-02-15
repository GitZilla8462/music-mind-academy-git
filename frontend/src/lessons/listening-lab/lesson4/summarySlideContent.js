// File: /src/lessons/listening-lab/lesson4/summarySlideContent.js
// All instructional text and content for Lesson 4 - Review + Start Capstone
// "Putting It All Together"

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Slide 1 - Title
  welcomeIntro: {
    title: 'Review + Start Capstone',
    subtitle: 'Putting It All Together',
    essentialQuestion: 'How do dynamics, tempo, and form work together to create meaning in music?',
    iCanStatements: [
      'I can identify dynamics, tempo, and form concepts by ear.',
      'I can select a piece and plan a Listening Journey.',
      'I can begin building a visual world that shows what I hear.'
    ]
  },

  // Slide 2 - Name That Element Instructions
  reviewGameIntro: {
    title: 'Name That Element',
    subtitle: 'Rapid-Fire Review!',
    icon: '🎮',
    howToPlay: [
      '1. You\'ll hear a short music clip or see a musical term',
      '2. Decide: Is this about DYNAMICS, TEMPO, or FORM?',
      '3. Tap your answer on your Chromebook',
      '4. 3 rounds of 4 clips each — 12 questions total!',
      '5. Fast + correct = more points!'
    ],
    elements: [
      { name: 'Dynamics', emoji: '📢', color: '#EF4444', examples: 'p, f, crescendo, decrescendo' },
      { name: 'Tempo', emoji: '⏱️', color: '#8B5CF6', examples: 'allegro, adagio, accelerando, ritardando' },
      { name: 'Form', emoji: '🔤', color: '#3B82F6', examples: 'A section, rondo, refrain, episode' }
    ],
    teacherNote: 'This is review — keep it fast and fun. Play clips from the Vivaldi, Brahms, and Mouret pieces students already know. Celebrate correct answers, don\'t dwell on mistakes.'
  },

  // Slide 3 - Capstone Explanation
  capstoneExplanation: {
    title: 'Your Capstone Project',
    subtitle: 'The Listening Journey',
    icon: '🎬',
    overview: 'Build a visual world that shows what you HEAR in a piece of music. Your character walks through scenes that change based on the dynamics, tempo, and form.',
    whatToShow: [
      { element: 'Dynamics', visual: 'Brightness, size, intensity of the world', emoji: '📢' },
      { element: 'Tempo', visual: 'Speed of your character\'s movement', emoji: '⏱️' },
      { element: 'Form', visual: 'Different backgrounds for different sections', emoji: '🔤' }
    ],
    teacherNote: 'This is the "wow" moment — show a teacher-made example so students see what the finished product looks like. The tool is intuitive but the concept needs demonstration.'
  },

  // Slide 4 - Piece Selection
  pieceSelection: {
    title: 'Pick Your Piece',
    subtitle: 'Choose Your Capstone Masterwork',
    icon: '🎵',
    instructions: 'Listen to preview clips of each piece. Think about which one excites you most. You\'ll be living with this piece for two class periods!',
    teacherNote: 'Play 15-20 second preview clips of each piece. Let students listen before choosing. All 5 pieces showcase dynamics, tempo, AND form clearly, so any pick works.'
  },

  // Slide 5 - Planning Phase
  planningPhase: {
    title: 'Plan Before You Build',
    subtitle: 'Your Journey Blueprint',
    icon: '📋',
    planningSteps: [
      { step: 1, question: 'How many sections does your piece have?', hint: 'Look at the form letters' },
      { step: 2, question: 'Where are the big DYNAMIC changes?', hint: 'Loud → soft or soft → loud' },
      { step: 3, question: 'Where does the TEMPO shift?', hint: 'Fast → slow or slow → fast' },
      { step: 4, question: 'What MOOD does each section create?', hint: 'This helps you pick backgrounds' }
    ],
    teacherNote: 'Don\'t skip this step! Students who plan first build better journeys. 5 minutes with a template prevents 15 minutes of aimless clicking.'
  },

  // Slide 6 - Build Time
  buildTime: {
    title: 'Build Time!',
    subtitle: 'Create Your Listening Journey',
    icon: '🏗️',
    checklist: [
      'Load your piece\'s audio',
      'Set up timeline sections (match the form)',
      'Choose backgrounds for each section',
      'Set dynamics (brightness/intensity)',
      'Set tempo (character speed)',
      'Pick your character'
    ],
    teacherNote: 'Circulate and check: Are students identifying sections correctly? Are they making intentional choices (not random backgrounds)? Students who are stuck can reference their L1-L3 listening maps.'
  },

  // Slide 7 - Save & Preview
  savePreview: {
    title: 'Save Your Work!',
    subtitle: 'Tomorrow: Finish & Share',
    icon: '💾',
    reminders: [
      'Click SAVE in the builder',
      'Your progress saves automatically — but double-check!',
      'Tomorrow: 20 more minutes to finish',
      'Then: Gallery Circle — share with the class!'
    ],
    teacherNote: 'Make sure every student saves. Quick verbal check: "Raise your hand if you\'ve saved!" Tomorrow\'s L5 picks up right where they left off.'
  }
};

// ========================================
// 2. REVIEW GAME QUESTIONS
// ========================================
// 3 rounds of 4 questions each = 12 total
// Each question tests whether students can identify the element category
export const reviewGameQuestions = [
  // Round 1 - Term identification
  {
    round: 1,
    roundTitle: 'Round 1: Name That Term!',
    questions: [
      { id: 1, type: 'term', prompt: 'Crescendo', correctAnswer: 'dynamics', explanation: 'Crescendo means getting louder — that\'s dynamics!' },
      { id: 2, type: 'term', prompt: 'Allegro', correctAnswer: 'tempo', explanation: 'Allegro means fast — that\'s tempo!' },
      { id: 3, type: 'term', prompt: 'Rondo', correctAnswer: 'form', explanation: 'Rondo is ABACADA — that\'s form!' },
      { id: 4, type: 'term', prompt: 'Pianissimo (pp)', correctAnswer: 'dynamics', explanation: 'Pianissimo means very soft — that\'s dynamics!' }
    ]
  },
  // Round 2 - Description identification
  {
    round: 2,
    roundTitle: 'Round 2: What Element Is This?',
    questions: [
      { id: 5, type: 'description', prompt: 'The music suddenly gets much louder', correctAnswer: 'dynamics', explanation: 'Volume changes = dynamics!' },
      { id: 6, type: 'description', prompt: 'The A section comes back after the B section', correctAnswer: 'form', explanation: 'Sections returning = form!' },
      { id: 7, type: 'description', prompt: 'The beat slows down gradually', correctAnswer: 'tempo', explanation: 'Speed changes = tempo! (ritardando)' },
      { id: 8, type: 'description', prompt: 'The music is organized A-B-A-C-A-D-A', correctAnswer: 'form', explanation: 'Section patterns = form! (That\'s a rondo!)' }
    ]
  },
  // Round 3 - Mixed / harder
  {
    round: 3,
    roundTitle: 'Round 3: Expert Level!',
    questions: [
      { id: 9, type: 'term', prompt: 'Decrescendo', correctAnswer: 'dynamics', explanation: 'Decrescendo means getting softer — dynamics!' },
      { id: 10, type: 'description', prompt: 'The orchestra races through the melody', correctAnswer: 'tempo', explanation: 'Speed of the music = tempo! (presto)' },
      { id: 11, type: 'term', prompt: 'Episode', correctAnswer: 'form', explanation: 'Episodes are contrasting sections in a rondo — form!' },
      { id: 12, type: 'description', prompt: 'The music whispers, then SHOUTS', correctAnswer: 'dynamics', explanation: 'Soft to loud = dynamics! (p to ff)' }
    ]
  }
];

// ========================================
// 3. VOCABULARY
// ========================================
export const vocabulary = [
  { term: 'Capstone', definition: 'A final project that brings together everything you\'ve learned' },
  { term: 'Listening Journey', definition: 'A visual world that responds to music — showing dynamics, tempo, and form' },
  { term: 'Review', definition: 'Looking back at what you\'ve learned to strengthen your understanding' },
  { term: 'Dynamics', definition: 'How loud or soft the music is' },
  { term: 'Tempo', definition: 'How fast or slow the music moves' },
  { term: 'Form', definition: 'How a piece is organized into sections' }
];
