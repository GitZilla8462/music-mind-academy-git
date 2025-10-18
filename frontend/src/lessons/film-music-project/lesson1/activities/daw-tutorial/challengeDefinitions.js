// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/challengeDefinitions.js
// All challenge data definitions for the DAW tutorial

export const DAW_CHALLENGES = [
  // SECTION 1: VIDEO PLAYER (Challenges 1-2)
  {
    id: 1,
    section: "Video Player",
    question: "Click on the area of the DAW that allows you to watch a video while composing music.",
    type: 'identify-click',
    instruction: "Click anywhere on the video player at the top",
    hint: "The video player is the large area at the top showing the film clip",
    correctAnswer: "Video Player",
    validation: (context) => context.action === 'video-player-clicked',
    highlightSelector: '.video-player-container',
    lockFeatures: {
      allowLoopDrag: false,
      allowPlayback: false,
      allowVolumeChange: false,
      allowZoom: false,
      allowLoopLibraryClick: true
    }
  },
  {
    id: 2,
    section: "Video Player",
    question: "True or False: The video helps you match your music to the mood and timing of scenes.",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "Music needs to match what's happening on screen",
    correctAnswer: "True",
    choices: ["True", "False"],
    correctIndex: 0,
    explanation: "Watching the video helps you create music that matches the emotion and timing of each scene",
    autoAdvanceOnCorrect: true
  },

  // SECTION 2: LOOP LIBRARY (Challenges 3-6)
  {
    id: 3,
    section: "Loop Library",
    question: "Click on the area where you find all the available music loops to use in your composition.",
    type: 'identify-click',
    instruction: "Click anywhere in the Loop Library panel on the left",
    hint: "It's the entire left panel with categories and sound names",
    correctAnswer: "Loop Library (or Browser)",
    validation: (context) => context.action === 'loop-library-clicked',
    highlightSelector: '.loop-library',
    lockFeatures: {
      allowLoopDrag: false,
      allowPlayback: false,
      allowVolumeChange: false,
      allowZoom: false,
      allowLoopLibraryClick: true
    }
  },
  {
    id: 4,
    section: "Loop Library",
    question: "What are the short, repeatable musical phrases in the library called?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "They're designed to repeat seamlessly",
    correctAnswer: "Loops",
    choices: ["Tracks", "Loops", "Clips", "Samples"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true
  },
  {
    id: 5,
    section: "Loop Library",
    question: "Drag any loop from the library onto the timeline.",
    type: 'interactive-task',
    instruction: "Click and hold on any loop, then drag it to a track on the timeline",
    hint: "Pick any loop you like and drag it to one of the empty tracks",
    correctAnswer: "Yes",
    validation: (context) => context.action === 'loop-placed' && context.placedLoops.length > 0,
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: false
    }
  },
  {
    id: 6,
    section: "Loop Library",
    question: "Loops are organized into categories. Which category would you use for rhythm?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "Think about what instrument keeps the beat",
    correctAnswer: "Drums",
    choices: ["Bass", "Drums", "Melody", "Effects"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true
  },

  // SECTION 3: TIMELINE & TRACKS (Challenges 7-11)
  {
    id: 7,
    section: "Timeline & Tracks",
    question: "The horizontal area where you arrange loops is called the what?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "It shows time flowing from left to right",
    correctAnswer: "Timeline",
    choices: ["Timeline", "Track List", "Loop Area", "Stage"],
    correctIndex: 0,
    autoAdvanceOnCorrect: true
  },
  {
    id: 8,
    section: "Timeline & Tracks",
    question: "Each horizontal row in the timeline is called a what?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "Each instrument typically gets its own row",
    correctAnswer: "Track",
    choices: ["Lane", "Track", "Channel", "Strip"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true
  },
  {
    id: 9,
    section: "Timeline & Tracks",
    question: "Click on any track header (the name area on the left of a track).",
    type: 'interactive-task',
    instruction: "Click on the track name/header area on the left side",
    hint: "It's the colored area on the left that shows the track name",
    correctAnswer: "Yes",
    validation: (context) => context.action === 'track-header-clicked',
    requiresLoopPlaced: false,
    lockFeatures: {
      allowLoopDrag: true
    }
  },
  {
    id: 10,
    section: "Timeline & Tracks",
    question: "The vertical line that shows your current playback position is called the what?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "It's usually red and shows where you are in the song",
    correctAnswer: "Playhead",
    choices: ["Timeline", "Playhead", "Track", "Measure Line"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true
  },
  {
    id: 11,
    section: "Timeline & Tracks",
    question: "Drag the loop you placed to a different time position.",
    type: 'interactive-task',
    instruction: "Click and hold on the loop, then drag it left or right",
    hint: "Click on the loop block and drag it to move it",
    correctAnswer: "Yes",
    validation: (context) => context.action === 'loop-moved',
    requiresLoopPlaced: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowLoopMove: true,
      allowPlayback: false
    }
  },

  // SECTION 4: TRACK CONTROLS (Challenges 12-14)
  {
    id: 12,
    section: "Track Controls",
    question: "Click the volume buttons (< or >) on any track to adjust its level.",
    type: 'interactive-task',
    instruction: "Find the volume buttons in any track header and click them to change the volume.",
    hint: "Look for the < and > buttons with a percentage number between them in the track header.",
    correctAnswer: "Adjust volume",
    validation: (context) => context.action === 'track-volume-changed',
    lockFeatures: {
      allowLoopDrag: true,
      allowVolumeChange: true,
      allowPlayback: false
    }
  },
  {
    id: 13,
    section: "Track Controls",
    question: "What does the S button on each track do?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "It lets you hear just one track by itself",
    correctAnswer: "Solo (play only that track)",
    choices: ["Stop the track", "Solo (play only that track)", "Save the track", "Select the track"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true
  },
  {
    id: 14,
    section: "Track Controls",
    question: "Click the S (Solo) button on any track.",
    type: 'interactive-task',
    instruction: "Find and click the S button in any track header",
    hint: "The S button is next to the volume controls in the track header",
    correctAnswer: "Solo track",
    validation: (context) => context.action === 'track-solo-toggled',
    requiresLoopPlaced: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowSolo: true,
      allowPlayback: false
    }
  },

  // SECTION 5: NAVIGATION (Challenges 15-16)
  {
    id: 15,
    section: "Navigation",
    question: "What allows you to see more detail or fit more of your composition on screen?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "It changes how much time you can see at once",
    correctAnswer: "Zoom controls",
    choices: ["Pan controls", "Zoom controls", "View mode", "Scale"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true
  },
  {
    id: 16,
    section: "Navigation",
    question: "Use the zoom controls (+ or - buttons) to change the timeline view.",
    type: 'interactive-task',
    instruction: "Click the + or - zoom buttons to change the timeline zoom level",
    hint: "Look for the zoom buttons, usually near the timeline",
    correctAnswer: "Zoom changed",
    validation: (context) => context.action === 'zoom-changed',
    lockFeatures: {
      allowLoopDrag: true,
      allowZoom: true
    }
  },

  // SECTION 6: PLAYBACK (Challenges 17-19)
  {
    id: 17,
    section: "Playback",
    question: "True or False: You should listen to your composition regularly to hear how it sounds.",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "Composers need to hear their work to make good decisions",
    correctAnswer: "True",
    choices: ["True", "False"],
    correctIndex: 0,
    explanation: "Listening helps you make better musical choices and catch mistakes",
    autoAdvanceOnCorrect: true
  },
  {
    id: 18,
    section: "Playback",
    question: "Click the Play button to start playback of your composition.",
    type: 'interactive-task',
    instruction: "Find and click the Play button (usually a triangle icon)",
    hint: "The Play button is typically in the transport controls",
    correctAnswer: "Play started",
    validation: (context) => context.action === 'playback-started',
    requiresLoopPlaced: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: true
    }
  },
  {
    id: 19,
    section: "Playback",
    question: "Click the Stop button to stop playback.",
    type: 'interactive-task',
    instruction: "Find and click the Stop button (usually a square icon)",
    hint: "The Stop button is next to the Play button",
    correctAnswer: "Play stopped",
    validation: (context) => context.action === 'playback-stopped',
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: true
    }
  },

  // FINAL CHALLENGE (Challenge 20)
  {
    id: 21,
    section: "Completion",
    question: "Congratulations! You've learned the basics of the DAW. Ready to move on?",
    type: 'multiple-choice',
    instruction: "Select 'Yes' to complete the tutorial",
    hint: "Click 'Yes' when you're ready",
    correctAnswer: "Yes",
    choices: ["Yes, I'm ready!", "Let me practice more"],
    correctIndex: 0,
    explanation: "Great work! You're ready to start composing your own film music.",
    autoAdvanceOnCorrect: true
  }
];