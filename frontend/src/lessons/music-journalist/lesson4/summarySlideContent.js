// File: /src/lessons/music-journalist/lesson4/summarySlideContent.js
// All instructional text and content for Music Journalist Lesson 4 - Build Your Story
// "Turn Your Research Into a Presentation"

// ========================================
// 1. SLIDE CONTENT FOR PRESENTATION VIEW
// ========================================
export const summarySlides = {
  // Slide 1 - From Reporter to Storyteller
  fromReporter: {
    title: "From Reporter to Storyteller",
    subtitle: "You Have the Evidence. Now Tell the Story.",
    icon: "📝",
    whatYouveDone: [
      "You chose a music topic you care about",
      "You read THREE articles and collected evidence",
      "You organized your research board by theme",
      "You practiced writing attention-grabbing headlines"
    ],
    whatsNext: [
      "Today you become a STORYTELLER",
      "You'll turn your research into a 4-slide presentation",
      "Think of it as your own mini music documentary",
      "Tomorrow is PRESS DAY - you'll present to the class!"
    ],
    teacherNote: "Build excitement. Emphasize that they already have everything they need - today is about SHAPING it into a story."
  },

  // Slide 2 - The 4-Slide Structure
  fourSlidesOverview: {
    title: "The 4-Slide Structure",
    subtitle: "Every Great Story Has a Shape",
    icon: "📊",
    slides: [
      {
        number: 1,
        name: "The Hook",
        color: "#3B82F6",
        description: "Your headline + a powerful image",
        details: [
          "ONE sentence that makes the reader say 'Tell me more!'",
          "Choose an image that grabs attention",
          "This is your first impression - make it count"
        ],
        example: "\"14-Year-Old Detroit Singer Lands Record Deal After TikTok Goes Viral\""
      },
      {
        number: 2,
        name: "The Background",
        color: "#10B981",
        description: "Context your audience needs",
        details: [
          "WHO is involved? WHAT happened? WHEN and WHERE?",
          "Use 2-3 bullet points with your strongest facts",
          "Give the audience the foundation of your story"
        ],
        example: "\"Maya Johnson, age 14, posted a cover of 'Ocean Eyes' on TikTok in January 2026. Within one week, it had 50 million views.\""
      },
      {
        number: 3,
        name: "The Evidence",
        color: "#F59E0B",
        description: "Your best quotes, data, and details",
        details: [
          "This is the HEART of your story",
          "Include at least one direct quote",
          "Include at least one specific number or date",
          "Use your STRONGEST evidence from your research board"
        ],
        example: "\"Atlantic Records VP said: 'Her voice stopped me in my tracks.' The label signed her to a 3-album deal worth $1.2 million.\""
      },
      {
        number: 4,
        name: "The So What?",
        color: "#EF4444",
        description: "Why this story matters",
        details: [
          "Why should the audience CARE?",
          "What should they THINK or FEEL after hearing your story?",
          "End with a question or call to action"
        ],
        example: "\"Maya's story shows that talent can come from anywhere. What undiscovered artist might be posting their first video right now?\""
      }
    ],
    teacherNote: "Walk through each slide type with the class. Use the examples to show what good looks like. Emphasize that Slide 1 and Slide 4 are the most important."
  },

  // Slide 3 - Slide Writing Tips
  slideWritingTips: {
    title: "Slide Writing Tips",
    subtitle: "Your Reference Card",
    icon: "💡",
    doList: [
      "Keep text SHORT - no more than 4 bullet points per slide",
      "Use STRONG verbs ('shattered' not 'broke')",
      "Include SPECIFIC numbers and dates",
      "Add images that SUPPORT your text"
    ],
    dontList: [
      "Don't write full paragraphs on slides",
      "Don't use vague words like 'a lot' or 'really good'",
      "Don't forget to cite WHERE you found your evidence",
      "Don't pick images just because they look cool - they must CONNECT to your point"
    ],
    proTip: "Read each slide OUT LOUD. If it takes more than 30 seconds to read, cut it down.",
    strongVerbs: [
      { weak: "broke", strong: "shattered" },
      { weak: "got", strong: "earned" },
      { weak: "made", strong: "crafted" },
      { weak: "said", strong: "declared" },
      { weak: "went up", strong: "skyrocketed" },
      { weak: "is good at", strong: "dominates" }
    ],
    teacherNote: "This slide stays visible during work time as a reference. Encourage students to check their work against these tips."
  },

  // Slide 4 - Lesson Complete
  lessonComplete: {
    title: "Build Your Story Complete!",
    subtitle: "Your Presentation Is Taking Shape",
    icon: "🎉",
    todayAccomplishments: [
      "Learned the 4-SLIDE STRUCTURE used by real journalists",
      "Selected your STRONGEST evidence for each slide",
      "Built a COMPLETE presentation from your research",
      "Practiced writing clear, compelling slide text"
    ],
    nextLesson: {
      title: "Lesson 5: Press Day!",
      preview: [
        "You'll PRESENT your story to the class",
        "Give and receive PEER FEEDBACK",
        "Celebrate becoming a MUSIC JOURNALIST!"
      ]
    },
    presentationTips: [
      "Speak clearly and make eye contact",
      "Don't just READ your slides - TELL the story",
      "Be ready to answer one question from the audience",
      "Practice your presentation tonight if you can!"
    ],
    teacherNote: "Celebrate effort. Remind students their presentations are saved and will be ready for Press Day. Encourage practice at home."
  }
};

// ========================================
// 2. THE 4-SLIDE STRUCTURE DETAILS
// ========================================
export const fourSlideStructure = [
  {
    number: 1,
    name: "The Hook",
    color: "#3B82F6",
    icon: "🎣",
    purpose: "Grab attention and make the audience want to hear more",
    includes: ["Headline", "Powerful image", "One-sentence hook"],
    questions: [
      "What is the most surprising or interesting thing about your topic?",
      "What would make someone stop scrolling to read this?",
      "Can you say it in ONE sentence?"
    ],
    wordLimit: 25
  },
  {
    number: 2,
    name: "The Background",
    color: "#10B981",
    icon: "📖",
    purpose: "Give the audience the context they need to understand your story",
    includes: ["Who", "What", "When", "Where", "2-3 key facts"],
    questions: [
      "What does the audience need to know FIRST?",
      "Who are the main people or groups in this story?",
      "When and where did this happen?"
    ],
    wordLimit: 50
  },
  {
    number: 3,
    name: "The Evidence",
    color: "#F59E0B",
    icon: "🔍",
    purpose: "Support your story with the strongest proof",
    includes: ["Direct quote", "Specific number or statistic", "Key detail from research"],
    questions: [
      "What is the most powerful quote you found?",
      "What number or statistic makes this story real?",
      "What detail would surprise your audience?"
    ],
    wordLimit: 60
  },
  {
    number: 4,
    name: "The So What?",
    color: "#EF4444",
    icon: "💭",
    purpose: "Explain why this story matters and leave a lasting impression",
    includes: ["Why it matters", "What the audience should feel or think", "Closing question or call to action"],
    questions: [
      "Why should people care about this?",
      "What do you want your audience to FEEL?",
      "What question can you leave them with?"
    ],
    wordLimit: 40
  }
];

// ========================================
// 3. VOCABULARY FOR THIS LESSON
// ========================================
export const vocabulary = [
  { term: 'Hook', definition: 'The opening that grabs the audience\'s attention' },
  { term: 'Background', definition: 'Context and facts that help the audience understand the story' },
  { term: 'Evidence', definition: 'Quotes, data, and details that prove your points' },
  { term: 'So What?', definition: 'Why the story matters and what the audience should take away' },
  { term: 'Call to Action', definition: 'A statement that asks the audience to think or do something' },
  { term: 'Caption', definition: 'Text that explains an image and connects it to the story' },
  { term: 'Cite', definition: 'To name the source where you found information' }
];
