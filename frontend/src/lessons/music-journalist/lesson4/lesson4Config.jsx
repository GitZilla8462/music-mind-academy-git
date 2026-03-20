// File: /lessons/music-journalist/lesson4/lesson4Config.jsx
// Lesson 4: Build Your Story
// "Turn your research into a presentation"

export const LESSON_PROGRESS_KEY = 'music-journalist-lesson4-progress';
export const LESSON_TIMER_KEY = 'music-journalist-lesson4-timer';

// ========================================
// SECTION-BASED GROUPING FOR TEACHER CONTROL
// ========================================
export const lessonSections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    subtitle: 'From Reporter to Storyteller',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'join-code',
        type: 'waiting',
        label: 'Join Code Screen',
        description: 'Students enter session code to join.',
        duration: 0
      },
      {
        id: 'from-reporter',
        type: 'summary',
        label: 'From Reporter to Storyteller',
        description: 'Transition from gathering evidence to telling a story.',
        duration: 2
      },
      {
        id: 'four-slides-overview',
        type: 'summary',
        label: 'The 4-Slide Structure',
        description: 'Introduce the 4-slide presentation format journalists use.',
        duration: 2
      },
      {
        id: 'slide-writing-tips',
        type: 'summary',
        label: 'Slide Writing Tips',
        description: 'Reference card for writing effective presentation slides.',
        duration: 1
      }
    ]
  },
  {
    id: 'build',
    title: '2. Build',
    subtitle: 'Slide Builder',
    color: 'blue',
    estimatedTime: 30,
    stages: [
      {
        id: 'slide-builder',
        type: 'activity',
        label: 'Slide Builder',
        description: 'STUDENTS WORK: Build your 4-slide presentation from research.',
        duration: 25,
        hasTimer: true,
        trackProgress: true
      }
    ]
  },
  {
    id: 'wrap-up',
    title: '3. Wrap-Up',
    subtitle: 'Review & Next Steps',
    color: 'blue',
    estimatedTime: 5,
    stages: [
      {
        id: 'lesson-complete',
        type: 'summary',
        label: 'Lesson Complete',
        description: 'Celebrate progress and preview Press Day.',
        duration: 5
      }
    ]
  }
];

export const lesson4Config = {
  id: 'music-journalist-lesson4',
  lessonPath: '/lessons/music-journalist/lesson4',
  title: "Build Your Story",
  subtitle: "Turn Your Research Into a Presentation",
  learningObjectives: [
    "Understand the 4-slide presentation structure",
    "Select the strongest evidence for each slide",
    "Write clear, compelling slide text",
    "Build a complete presentation from research"
  ],
  lessonSections,
  activities: [
    {
      id: 1,
      type: "mj-slide-builder",
      title: "Slide Builder",
      estimatedTime: "25 min"
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
    id: 'from-reporter',
    label: 'From Reporter to Storyteller',
    description: 'Transition from gathering evidence to telling a story.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'From Reporter to Storyteller',
      subtitle: 'You Have the Evidence. Now Tell the Story.',
      sections: [
        {
          heading: 'What You\'ve Done So Far',
          bullets: [
            'You chose a music topic you care about',
            'You read THREE articles and collected evidence',
            'You organized your research board by theme',
            'You practiced writing attention-grabbing headlines'
          ]
        },
        {
          heading: 'What\'s Next',
          bullets: [
            'Today you become a STORYTELLER',
            'You\'ll turn your research into a 4-slide presentation',
            'Think of it as your own mini music documentary',
            'Tomorrow is PRESS DAY - you\'ll present to the class!'
          ]
        }
      ]
    }
  },
  {
    id: 'four-slides-overview',
    label: 'The 4-Slide Structure',
    description: 'Introduce the 4-slide presentation format.',
    type: 'summary',
    duration: 2,
    presentationView: {
      type: 'summary',
      title: 'The 4-Slide Structure',
      subtitle: 'Every Great Story Has a Shape',
      sections: [
        {
          heading: 'Slide 1: The Hook',
          bullets: [
            'Your headline + a powerful image',
            'ONE sentence that makes the reader say "Tell me more!"',
            'This is your first impression - make it count'
          ]
        },
        {
          heading: 'Slide 2: The Background',
          bullets: [
            'Context your audience needs to understand the story',
            'WHO is involved? WHAT happened? WHEN and WHERE?',
            'Use 2-3 bullet points with your strongest facts'
          ]
        },
        {
          heading: 'Slide 3: The Evidence',
          bullets: [
            'Your best quotes, data, and specific details',
            'This is the HEART of your story',
            'Include at least one direct quote and one specific number'
          ]
        },
        {
          heading: 'Slide 4: The So What?',
          bullets: [
            'Why does this story MATTER?',
            'What should the audience THINK or FEEL?',
            'End with a question or call to action'
          ]
        }
      ]
    }
  },
  {
    id: 'slide-writing-tips',
    label: 'Slide Writing Tips',
    description: 'Reference card for writing effective slides.',
    type: 'summary',
    duration: 1,
    presentationView: {
      type: 'summary',
      title: 'Slide Writing Tips',
      subtitle: 'Your Reference Card',
      sections: [
        {
          heading: 'DO',
          bullets: [
            'Keep text SHORT - no more than 4 bullet points per slide',
            'Use STRONG verbs (\"shattered\" not \"broke\")',
            'Include SPECIFIC numbers and dates',
            'Add images that SUPPORT your text'
          ]
        },
        {
          heading: 'DON\'T',
          bullets: [
            'Don\'t write full paragraphs on slides',
            'Don\'t use vague words like \"a lot\" or \"really good\"',
            'Don\'t forget to cite WHERE you found your evidence',
            'Don\'t pick images just because they look cool - they must CONNECT to your point'
          ]
        },
        {
          heading: 'Pro Tip',
          bullets: [
            'Read each slide OUT LOUD. If it takes more than 30 seconds to read, cut it down.'
          ]
        }
      ]
    }
  },
  {
    id: 'slide-builder',
    label: 'Slide Builder',
    description: 'STUDENTS WORK: Build your 4-slide presentation from research.',
    hasProgress: true,
    type: 'activity',
    hasTimer: true,
    duration: 25,
    presentationView: {
      type: 'activity-banner',
      title: 'Build Your 4-Slide Presentation',
      subtitle: 'Use your research board to create each slide. Hook → Background → Evidence → So What?'
    }
  },
  {
    id: 'lesson-complete',
    label: 'Lesson Complete',
    description: 'Celebrate progress and preview Press Day.',
    type: 'summary',
    duration: 5,
    presentationView: {
      type: 'summary',
      title: 'Build Your Story Complete!',
      subtitle: 'Your Presentation Is Taking Shape',
      sections: [
        {
          heading: 'Today You...',
          bullets: [
            'Learned the 4-SLIDE STRUCTURE used by real journalists',
            'Selected your STRONGEST evidence for each slide',
            'Built a COMPLETE presentation from your research',
            'Practiced writing clear, compelling slide text'
          ]
        },
        {
          heading: 'Next Time: Press Day!',
          bullets: [
            'You\'ll PRESENT your story to the class',
            'Give and receive PEER FEEDBACK',
            'Celebrate becoming a MUSIC JOURNALIST!',
            'Practice your presentation tonight if you can!'
          ]
        },
        {
          heading: 'Presentation Tips for Tomorrow',
          bullets: [
            'Speak clearly and make eye contact',
            'Don\'t just READ your slides - TELL the story',
            'Be ready to answer one question from the audience'
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
    'from-reporter': 'summary',
    'four-slides-overview': 'summary',
    'slide-writing-tips': 'summary',
    'slide-builder': 'mj-slide-builder',
    'lesson-complete': 'summary'
  };
  return stageMap[stage];
};
