// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/challengeDefinitions.js
// All challenge data definitions for the DAW tutorial
// UPDATED: Added Challenge 13 - Delete a loop using keyboard

export const DAW_CHALLENGES = [
  // SECTION 1: VIDEO PLAYER
  {
    id: 1,
    section: "Video Player",
    question: "Click on the video player where you can watch the film clip.",
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

  // SECTION 2: LOOP LIBRARY
  {
    id: 2,
    section: "Loop Library",
    question: "Click on the Loop Library on the left side of the screen.",
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
    id: 3,
    section: "Loop Library",
    question: "What do we call the short, repeating music clips in the library?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "They're designed to repeat seamlessly",
    correctAnswer: "Loops",
    choices: ["Tracks", "Loops", "Clips", "Samples"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true
  },
  {
    id: 4,
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

  // SECTION 3: TIMELINE & TRACKS
  {
    id: 5,
    section: "Timeline & Tracks",
    question: "What's the name of the horizontal area where you arrange your loops?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "It shows time flowing from left to right",
    correctAnswer: "Timeline",
    choices: ["Timeline", "Track List", "Loop Area", "Stage"],
    correctIndex: 0,
    autoAdvanceOnCorrect: true
  },
  {
    id: 6,
    section: "Timeline & Tracks",
    question: "What do we call each horizontal row in the timeline?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "Each instrument typically gets its own row",
    correctAnswer: "Track",
    choices: ["Lane", "Track", "Channel", "Strip"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true
  },
  {
    id: 7,
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

  // SECTION 4: TRACK CONTROLS
  {
    id: 8,
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

  // SECTION 5: NAVIGATION
  {
    id: 9,
    section: "Navigation",
    question: "Drag the blue button on the zoom controls to zoom in and out.",
    highlightSelector: '.zoom-controls',
    type: 'interactive-task',
    instruction: "Drag the blue dot on the zoom slider left and right to change the zoom level. The zoom controls are on the right side of the screen - drag this box if you need to!",
    hint: "Look for the zoom slider on the right side of the timeline. Drag the blue dot left (zoom out) or right (zoom in). If you can't see it, drag this orange box to a different position!",
    correctAnswer: "Zoom changed",
    validation: (context) => context.action === 'zoom-changed',
    lockFeatures: {
      allowLoopDrag: true,
      allowZoom: true
    }
  },

  // SECTION 6: PLAYBACK
  {
    id: 10,
    section: "Playback",
    question: "True or False: It's important to listen to your music as you create it.",
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
    id: 11,
    section: "Playback",
    question: "Click the Play button in the middle of your screen. It is a triangle and it is below the video player in the middle of the screen.",
    type: 'interactive-task',
    instruction: "Find and click the Play button (triangle icon) below the video player in the middle of the screen",
    hint: "The Play button is a triangle icon located below the video player in the center of the screen",
    correctAnswer: "Play started",
    validation: (context) => context.action === 'playback-started',
    requiresLoopPlaced: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: true
    }
  },
  {
    id: 12,
    section: "Playback",
    question: "Click the Stop button to stop playback. It is a square and is right next to the play button.",
    type: 'interactive-task',
    instruction: "Find and click the Stop button (square icon) right next to the Play button",
    hint: "The Stop button is a square icon located right next to the Play button",
    correctAnswer: "Play stopped",
    validation: (context) => context.action === 'playback-stopped',
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: true
    }
  },

  // SECTION 7: LOOP MANAGEMENT
  {
    id: 13,
    section: "Loop Management",
    question: "Delete a loop by clicking on it to select it, then pressing the Backspace or Delete key on your keyboard.",
    type: 'interactive-task',
    instruction: "First click on a loop in the timeline to select it (it will be highlighted), then press Backspace or Delete on your keyboard",
    hint: "Click on any loop block in the timeline to select it first, then use your keyboard's Backspace or Delete key to remove it",
    correctAnswer: "Loop deleted",
    validation: (context) => context.action === 'loop-deleted',
    requiresLoopPlaced: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowLoopDelete: true,
      allowPlayback: true
    }
  },

];