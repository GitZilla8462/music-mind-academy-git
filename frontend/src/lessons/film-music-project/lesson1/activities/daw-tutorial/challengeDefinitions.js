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
  // QUESTION 5 - UPDATED: Fixed pause detection
  {
    id: 5,
    section: "Loop Library",
    question: "Click play to preview a loop, then click pause to stop it",
    type: 'interactive-task',
    instruction: "Click the play button next to any loop name to hear a preview, then hit the pause button to stop the example.",
    hint: "Click the play button next to a loop name, then click it again (it becomes a pause button) to stop",
    correctAnswer: "Click on the loop preview button",
    validation: (context) => {
      // Must have played AND paused - check both conditions
      return (context.action === 'loop-preview-paused' || context.action === 'loop-preview') && 
             context.hasPlayedLoop === true && 
             context.hasPausedLoop === true;
    },
    allowSkip: true,
    lockFeatures: {
      allowLoopDrag: false,
      allowPlayback: false,
      allowVolumeChange: false,
      allowZoom: false,
      allowLoopPreview: true
    }
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
  // QUESTION 7 (was 8) - Timeline question now comes first
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
  // QUESTION 8 (was 7) - UPDATED: Clarified text about Track 1/Track 2 area
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
      // Only validate if this is specifically a loop placement on track index 0 (Track 1)
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
    greyOutDAW: true
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
    allowSkip: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowLoopMove: true,
      allowPlayback: false
    }
  },

  // SECTION 4: TRACK CONTROLS (Challenges 12-14)
  // QUESTION 12 - UPDATED: Changed "slider" to "buttons"
  {
    id: 12,
    section: "Track Controls",
    question: "Click the volume buttons (< or >) on any track to adjust its level.",
    type: 'interactive-task',
    instruction: "Find the volume buttons in any track header and click them to change the volume.",
    hint: "Look for the < and > buttons with a percentage number between them in the track header.",
    correctAnswer: "Volume Fader",
    validation: (context) => context.action === 'track-volume-changed',
    requiresLoopPlaced: true,
    allowSkip: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowVolumeChange: true,
      allowPlayback: false
    }
  },
  {
    id: 13,
    section: "Track Controls",
    question: "What does the 'S' button on a track do?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "Solo means to hear only that track",
    correctAnswer: "Solo - plays only that track",
    choices: ["Stop the track", "Solo - plays only that track", "Save the track", "Select the track"],
    correctIndex: 1,
    autoAdvanceOnCorrect: true,
    greyOutDAW: true
  },
  {
    id: 14,
    section: "Track Controls",
    question: "Click the 'S' button on any track to solo it.",
    type: 'interactive-task',
    instruction: "Click the 'S' button in a track header",
    hint: "The 'S' button is in the track header next to the mute button",
    correctAnswer: "Solo button",
    validation: (context) => context.action === 'track-solo-toggled',
    requiresLoopPlaced: true,
    allowSkip: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowVolumeChange: true,
      allowSolo: true,
      allowPlayback: false
    }
  },

  // SECTION 5: ZOOM & VIEW (Challenges 15-16)
  {
    id: 15,
    section: "Zoom & View",
    question: "If you want to see more detail for precise editing, should you zoom IN or OUT?",
    type: 'multiple-choice',
    instruction: "Select your answer below",
    hint: "Zooming in shows more detail, like using a magnifying glass",
    correctAnswer: "Zoom IN",
    choices: ["Zoom IN", "Zoom OUT"],
    correctIndex: 0,
    autoAdvanceOnCorrect: true,
    greyOutDAW: true
  },
  {
    id: 16,
    section: "Zoom & View",
    question: "Use the zoom controls to zoom in on the timeline.",
    type: 'interactive-task',
    instruction: "Click the + button or use the zoom slider",
    hint: "Look for zoom controls, usually near the timeline header",
    correctAnswer: "Zoom in",
    validation: (context) => context.action === 'zoomed' && context.zoomDirection === 'in',
    allowSkip: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowZoom: true,
      allowPlayback: false
    }
  },

  // SECTION 6: PLAYBACK & TRANSPORT (Challenges 17-21)
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
    allowSkip: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: true,
      allowVolumeChange: true
    }
  },
  {
    id: 20,
    section: "Loop Editing",
    question: "Make your loop longer by dragging its right edge to extend it.",
    type: 'interactive-task',
    instruction: "Hover over the right edge of a loop and drag it to the right",
    hint: "The cursor will change when you hover over the edge of a loop - click and drag to resize",
    correctAnswer: "Resize loop",
    validation: (context) => context.action === 'loop-resized',
    requiresLoopPlaced: true,
    allowSkip: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowLoopResize: true,
      allowPlayback: false
    }
  },
  {
    id: 21,
    section: "Loop Editing",
    question: "Delete a loop by right-clicking on it and selecting delete.",
    type: 'interactive-task',
    instruction: "Right-click on any loop and select delete, or press Delete key",
    hint: "Right-click on a loop block to see the delete option",
    correctAnswer: "Delete loop",
    validation: (context) => context.action === 'loop-deleted',
    requiresLoopPlaced: true,
    allowSkip: true,
    lockFeatures: {
      allowLoopDrag: true,
      allowPlayback: false
    }
  }
];