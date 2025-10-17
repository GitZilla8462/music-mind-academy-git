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
    allowSkip: false,
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
    autoAdvanceOnCorrect: true,
    greyOutDAW: true
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
    allowSkip: false,
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
    autoAdvanceOnCorrect: true,
    greyOutDAW: true
  },

  {
    id: 6,
    section: "Loop Library",
    question: "Loops are organized into categories. Which category would you use for rhythm?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "Think about which instrument provides the beat",
    correctAnswer: "Drums",
    choices: ["Bass", "Drums", "Synth", "FX"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true,
    greyOutDAW: true
  },

  // SECTION 3: TIMELINE & TRACKS (Challenges 7-11)
  {
    id: 7,
    section: "Timeline & Tracks",
    question: "What is the main workspace where you arrange loops in chronological order?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "It shows time from left to right with vertical measure lines",
    correctAnswer: "Timeline",
    choices: ["Loop Library", "Timeline", "Video Player", "Transport Controls"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true,
    greyOutDAW: true
  },
  {
    id: 8,
    section: "Timeline & Tracks",
    question: "Click on any track header (the area where Track 1 or Track 2 are labeled on the left).",
    type: 'identify-click',
    instruction: "Click on any track header - the numbered boxes on the left that identify each track.",
    hint: "Look for the numbered boxes (1, 2, 3, etc.) on the left side of the timeline. Click on any one of them.",
    correctAnswer: "Track",
    validation: (context) => context.action === 'track-header-clicked',
    highlightSelector: '.track-header',
    allowSkip: false,
    lockFeatures: {
      allowLoopDrag: false,
      allowPlayback: false,
      allowVolumeChange: false,
      allowZoom: false,
      allowTrackHeaderClick: true
    }
  },
  {
    id: 9,
    section: "Timeline & Tracks",
    question: "Drag any loop from the library onto Track 1.",
    type: 'drag-drop-task',
    instruction: "Click and hold a loop, then drag it to the first track",
    hint: "Pick any loop you like and drag it onto the first track",
    correctAnswer: "Loops",
    validation: (context) => {
      return context.action === 'loop-placed' && 
             context.trackIndex === 0 && 
             context.placedLoops?.length > 0;
    },
    allowSkip: false,
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: false,
      allowVolumeChange: false,
      allowZoom: false
    }
  },
  {
    id: 10,
    section: "Timeline & Tracks",
    question: "What is the vertical line that shows the current playback position?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "It's usually red and shows where you are in the song",
    correctAnswer: "Playhead",
    choices: ["Timeline", "Playhead", "Track", "Measure Line"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true,
    greyOutDAW: true,
    allowSkip: false
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
    allowSkip: false,
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
    allowSkip: false,
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
    autoAdvanceOnCorrect: true,
    greyOutDAW: true,
    allowSkip: false
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
    allowSkip: false,
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
    hint: "You can make things bigger or smaller",
    correctAnswer: "Zoom",
    choices: ["Pan", "Zoom", "Scroll", "Resize"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true,
    greyOutDAW: true,
    allowSkip: false
  },
  {
    id: 16,
    section: "Navigation",
    question: "Zoom in to see more detail of your loops.",
    type: 'interactive-task',
    instruction: "Click the + button or use the zoom slider",
    hint: "Look for zoom controls, usually near the timeline header",
    correctAnswer: "Zoom in",
    validation: (context) => context.action === 'zoomed' && context.zoomDirection === 'in',
    allowSkip: false,
    lockFeatures: {
      allowLoopDrag: true,
      allowZoom: true,
      allowPlayback: false
    }
  },

  // SECTION 6: PLAYBACK & TRANSPORT (Challenges 17-19)
  {
    id: 17,
    section: "Playback",
    question: "Which button starts playing your composition?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "It's the triangle pointing to the right",
    correctAnswer: "Play button",
    choices: ["Stop button", "Play button", "Record button", "Loop button"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true,
    greyOutDAW: true
  },
  {
    id: 18,
    section: "Playback",
    question: "Click the Play button to hear your music with the video.",
    type: 'interactive-task',
    instruction: "Click the Play button at the bottom",
    hint: "The Play button is in the transport controls at the bottom",
    correctAnswer: "Play",
    validation: (context) => context.action === 'playback-started',
    requiresLoopPlaced: true,
    allowSkip: false,
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: true,
      allowVolumeChange: true
    }
  },
  {
    id: 19,
    section: "Playback",
    question: "Stop the playback by clicking the square Stop button.",
    type: 'interactive-task',
    instruction: "Click the Stop button (square icon) at the bottom",
    hint: "The Stop button is next to the Play button in the transport controls",
    correctAnswer: "Stop",
    validation: (context) => context.action === 'playback-stopped',
    requiresLoopPlaced: true,
    allowSkip: false,
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: true,
      allowVolumeChange: true
    }
  },

  // SECTION 7: LOOP EDITING (Challenge 20)
  {
    id: 20,
    section: "Loop Editing",
    question: "Delete a loop by clicking on the red trash can icon on the loop.",
    type: 'interactive-task',
    instruction: "Click the red trash can icon on the loop",
    hint: "Click the red trash can icon on the loop",
    correctAnswer: "Delete loop",
    validation: (context) => context.action === 'loop-deleted',
    requiresLoopPlaced: true,
    allowSkip: false,
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: false
    }
  }
];