// melody-escape-room/melodyEscapeRoomConfig.js - Data and configuration

// Reuse loop data from existing library
export const loopData = {
  Heroic: {
    Bass: ['/projects/film-music-score/loops/Heroic Bass 1.mp3'],
    Brass: ['/projects/film-music-score/loops/Heroic Brass 2.mp3'],
    Drums: ['/projects/film-music-score/loops/Heroic Drums 1.mp3', '/projects/film-music-score/loops/Heroic Drums 2.mp3'],
    Strings: ['/projects/film-music-score/loops/Heroic Strings 1.mp3', '/projects/film-music-score/loops/Heroic Strings 2.mp3'],
    Synth: ['/projects/film-music-score/loops/Heroic Synth 1.mp3', '/projects/film-music-score/loops/Heroic Synth 2.mp3'],
    Vocals: ['/projects/film-music-score/loops/Heroic Vocals.mp3']
  },
  Hype: {
    Bass: ['/projects/film-music-score/loops/Hype Bass 1.wav', '/projects/film-music-score/loops/Hype Bass 2.wav'],
    Drums: ['/projects/film-music-score/loops/Hype Drums 1.wav', '/projects/film-music-score/loops/Hype Drums 2.wav'],
    Guitar: ['/projects/film-music-score/loops/Hype Guitar 1.wav', '/projects/film-music-score/loops/Hype Guitar 2.wav'],
    Keys: ['/projects/film-music-score/loops/Hype Keys 1.wav'],
    Synth: ['/projects/film-music-score/loops/Hype Synth 1.wav', '/projects/film-music-score/loops/Hype Synth 2.wav'],
    'Synth Lead': ['/projects/film-music-score/loops/Hype Synth Lead 1.wav', '/projects/film-music-score/loops/Hype Synth Lead 2.wav']
  },
  Mysterious: {
    Bass: ['/projects/film-music-score/loops/Mysterious Bass 1.mp3', '/projects/film-music-score/loops/Mysterious Bass 2.mp3'],
    Drums: ['/projects/film-music-score/loops/Mysterious  Drums 2.mp3'],
    Guitar: ['/projects/film-music-score/loops/Mysterious Guitar.mp3'],
    Strings: ['/projects/film-music-score/loops/Mysterious Strings.mp3', '/projects/film-music-score/loops/Mysterious Strings 2.mp3'],
    Synth: ['/projects/film-music-score/loops/Mysterious Synth 1.mp3', '/projects/film-music-score/loops/Mysterious Synth 2.mp3']
  },
  Scary: {
    Bass: ['/projects/film-music-score/loops/Scary Bass 1.mp3', '/projects/film-music-score/loops/Scary Bass 2.mp3'],
    Brass: ['/projects/film-music-score/loops/Scary Brass 1.mp3'],
    Percussion: ['/projects/film-music-score/loops/Scary Percussion 1.mp3', '/projects/film-music-score/loops/Scary Percussion 2.mp3'],
    Strings: ['/projects/film-music-score/loops/Scary Strings 1.mp3', '/projects/film-music-score/loops/Scary Strings 2.mp3'],
    Synth: ['/projects/film-music-score/loops/Scary Synth 1.mp3', '/projects/film-music-score/loops/Scary Synth 2.mp3']
  },
  Upbeat: {
    Bells: ['/projects/film-music-score/loops/Upbeat Bells.mp3'],
    Clarinet: ['/projects/film-music-score/loops/Upbeat Clarinet.mp3'],
    Drums: ['/projects/film-music-score/loops/Upbeat Drums 1.mp3', '/projects/film-music-score/loops/Upbeat Drums 2.mp3'],
    'Electric Bass': ['/projects/film-music-score/loops/Upbeat Electric Bass.mp3'],
    'Electric Guitar': ['/projects/film-music-score/loops/Upbeat Electric Guitar.mp3'],
    Piano: ['/projects/film-music-score/loops/Upbeat Piano.mp3'],
    Strings: ['/projects/film-music-score/loops/Upbeat Strings.mp3']
  }
};

export const categories = Object.keys(loopData);

export const instrumentIcons = {
  Bass: '🎸', Brass: '🎺', Drums: '🥁', Strings: '🎻', Synth: '🎹', Vocals: '🎤',
  Guitar: '🎸', Keys: '🎹', 'Synth Lead': '🎛️', Percussion: '🪘', Bells: '🔔',
  Clarinet: '🎷', 'Electric Bass': '🎸', 'Electric Guitar': '🎸', Piano: '🎹'
};

// All unique instruments for answer matching
export const allInstruments = [
  'Bass', 'Brass', 'Drums', 'Strings', 'Synth', 'Vocals',
  'Guitar', 'Keys', 'Synth Lead', 'Percussion', 'Bells',
  'Clarinet', 'Electric Bass', 'Electric Guitar', 'Piano'
];

// Room themes for creators to choose
export const roomThemes = [
  { id: 'dungeon', name: 'Dungeon of Sound', emoji: '🏰', bg: 'from-gray-800 via-stone-700 to-gray-900', lockColor: 'amber' },
  { id: 'space', name: 'Space Station Alpha', emoji: '🚀', bg: 'from-indigo-900 via-purple-800 to-slate-900', lockColor: 'cyan' },
  { id: 'jungle', name: 'Temple of Beats', emoji: '🌴', bg: 'from-green-800 via-emerald-700 to-teal-900', lockColor: 'yellow' },
  { id: 'haunted', name: 'Haunted Melody Manor', emoji: '👻', bg: 'from-purple-900 via-gray-800 to-black', lockColor: 'purple' },
  { id: 'underwater', name: 'Submarine Sound Lab', emoji: '🌊', bg: 'from-blue-900 via-cyan-800 to-blue-950', lockColor: 'teal' },
  { id: 'volcano', name: 'Volcanic Vault', emoji: '🌋', bg: 'from-red-900 via-orange-800 to-red-950', lockColor: 'orange' }
];

// Scoring configuration
export const scoring = {
  basePoints: 100,           // Points per lock unlocked
  hintPenalty: 30,           // Points lost for using a hint
  wrongGuessPenalty: 10,     // Points lost per wrong guess (also adds 5 sec to time)
  timeBonusPerSecond: 2,     // Bonus points per second under par time
  maxListens: 3,             // Max listens per lock
  parTimePerLock: 30         // Expected seconds per lock for "par" time
};

// Generate a unique 6-character share code
export const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like 0/O, 1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Storage keys
export const STORAGE_KEY_ROOMS = 'melody-escape-rooms';

// Save a room to localStorage
export const saveRoom = (roomData) => {
  const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY_ROOMS) || '{}');
  rooms[roomData.shareCode] = {
    ...roomData,
    createdAt: Date.now()
  };
  localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
};

// Load a room by share code
export const loadRoom = (shareCode) => {
  const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY_ROOMS) || '{}');
  return rooms[shareCode.toUpperCase()] || null;
};

// Get all rooms created by a student
export const getMyRooms = (studentId) => {
  const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY_ROOMS) || '{}');
  return Object.values(rooms).filter(room => room.creatorId === studentId);
};

// Normalize instrument name for matching (case-insensitive, handle common variations)
export const normalizeInstrument = (input) => {
  const normalized = input.trim().toLowerCase();

  // Handle common variations
  const variations = {
    'drum': 'drums',
    'string': 'strings',
    'synths': 'synth',
    'synthesizer': 'synth',
    'key': 'keys',
    'keyboard': 'keys',
    'bell': 'bells',
    'vocal': 'vocals',
    'voice': 'vocals',
    'singing': 'vocals',
    'e bass': 'electric bass',
    'e guitar': 'electric guitar',
    'lead synth': 'synth lead',
    'synth-lead': 'synth lead',
    'perc': 'percussion'
  };

  return variations[normalized] || normalized;
};

// Check if answer matches the correct instrument
export const checkAnswer = (userAnswer, correctInstrument) => {
  const normalizedUser = normalizeInstrument(userAnswer);
  const normalizedCorrect = correctInstrument.toLowerCase();

  return normalizedUser === normalizedCorrect;
};

// Get a flattened list of all available loops for the creator to pick from
export const getAllLoops = () => {
  const loops = [];
  Object.entries(loopData).forEach(([category, instruments]) => {
    Object.entries(instruments).forEach(([instrument, files]) => {
      files.forEach((file, index) => {
        loops.push({
          id: `${category}-${instrument}-${index}`,
          category,
          instrument,
          file,
          icon: instrumentIcons[instrument] || '🎵',
          displayName: `${category} ${instrument} ${files.length > 1 ? index + 1 : ''}`
        });
      });
    });
  });
  return loops;
};
