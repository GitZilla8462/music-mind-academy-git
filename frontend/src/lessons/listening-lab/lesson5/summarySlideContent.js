// File: /src/lessons/listening-lab/lesson5/summarySlideContent.js
// All instructional text and content for Lesson 5 - Work Time + Gallery Circle
// "Finish & Share"

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Slide 1 - Welcome Back
  welcomeBack: {
    title: 'Work Time + Gallery Circle',
    subtitle: 'Finish & Share',
    essentialQuestion: 'How do dynamics, tempo, and form work together to create meaning in music?',
    iCanStatements: [
      'I can finish building a Listening Journey that shows dynamics, tempo, and form.',
      'I can share my journey and explain my musical choices.',
      'I can reflect on what I learned about listening to music.'
    ]
  },

  // Slide 2 - Gallery Circle Instructions
  galleryCircle: {
    title: 'Gallery Circle',
    subtitle: 'Time to Share!',
    icon: '🎪',
    howItWorks: [
      '1. We\'ll project 4-5 journeys on the big screen',
      '2. Watch the character walk through each world',
      '3. Listen — can you hear the dynamics, tempo, and form?',
      '4. After each, we\'ll share one thing we noticed'
    ],
    audienceGuidelines: [
      'Listen carefully to the music AND watch the visuals',
      'Think: What musical element stands out most?',
      'Celebrate creative choices — every journey is unique!'
    ],
    teacherNote: 'Small class (≤15): Project 4-5 journeys. Large class: Pair share + volunteer showcase. Use peer feedback cards for written responses if time allows.'
  },

  // Slide 3 - Exit Ticket
  exitTicket: {
    title: 'Exit Ticket',
    subtitle: 'What Did You Learn?',
    icon: '📝',
    questions: [
      'Name one musical element you can now identify by ear.',
      'What was the most surprising thing you learned in this unit?',
      'How has your listening changed since Lesson 1?'
    ],
    teacherNote: 'This is a formative assessment. Use responses to see who mastered the three elements and who needs review. Can be done on Chromebook or on paper.'
  }
};

// ========================================
// 2. GALLERY CIRCLE PEER FEEDBACK
// ========================================
export const peerFeedbackPrompts = [
  { id: 'dynamics', prompt: 'I could hear the dynamics because...', element: 'Dynamics', emoji: '📢' },
  { id: 'tempo', prompt: 'The tempo was shown by...', element: 'Tempo', emoji: '⏱️' },
  { id: 'form', prompt: 'I noticed the form when...', element: 'Form', emoji: '🔤' },
  { id: 'creative', prompt: 'A creative choice I liked was...', element: 'Creativity', emoji: '⭐' }
];

// ========================================
// 3. EXIT TICKET QUESTIONS
// ========================================
export const exitTicketQuestions = [
  {
    id: 1,
    type: 'multiple-choice',
    question: 'Which musical element describes how LOUD or SOFT the music is?',
    options: ['Tempo', 'Dynamics', 'Form', 'Timbre'],
    correctAnswer: 'Dynamics'
  },
  {
    id: 2,
    type: 'multiple-choice',
    question: 'What does "Allegro" tell you about the music?',
    options: ['It\'s loud', 'It\'s fast', 'It has sections', 'It\'s played by strings'],
    correctAnswer: 'It\'s fast'
  },
  {
    id: 3,
    type: 'multiple-choice',
    question: 'If a piece has the form A-B-A-C-A, what is it called?',
    options: ['Binary', 'Ternary', 'Rondo', 'Through-composed'],
    correctAnswer: 'Rondo'
  },
  {
    id: 4,
    type: 'open-response',
    question: 'What was the most interesting thing you learned about listening to music in this unit?'
  },
  {
    id: 5,
    type: 'open-response',
    question: 'How has the way you listen to music changed since Lesson 1?'
  }
];

// ========================================
// 4. VOCABULARY (Full Unit Review)
// ========================================
export const vocabulary = [
  // Dynamics
  { term: 'Piano (p)', definition: 'Soft', category: 'dynamics' },
  { term: 'Forte (f)', definition: 'Loud', category: 'dynamics' },
  { term: 'Crescendo', definition: 'Getting gradually louder', category: 'dynamics' },
  { term: 'Decrescendo', definition: 'Getting gradually softer', category: 'dynamics' },
  // Tempo
  { term: 'Largo', definition: 'Very slow (40 BPM)', category: 'tempo' },
  { term: 'Adagio', definition: 'Slow (60 BPM)', category: 'tempo' },
  { term: 'Andante', definition: 'Walking pace (76 BPM)', category: 'tempo' },
  { term: 'Allegro', definition: 'Fast (120 BPM)', category: 'tempo' },
  { term: 'Presto', definition: 'Very fast (168 BPM)', category: 'tempo' },
  // Form
  { term: 'Section', definition: 'A distinct part of a piece labeled with a letter (A, B, C)', category: 'form' },
  { term: 'Rondo', definition: 'A form where the A section keeps returning: ABACADA', category: 'form' },
  { term: 'Refrain', definition: 'The A section that keeps coming back', category: 'form' },
  { term: 'Episode', definition: 'A contrasting section between refrains (B, C, D)', category: 'form' }
];
