// melody-escape-room/melodyEscapeRoomConfig.js - Data and configuration

// Reuse loop data from existing library
export const loopData = {
  Heroic: {
    Bells: ['/projects/film-music-score/loops/Heroic Bells 1.m4a', '/projects/film-music-score/loops/Heroic Bells 2.m4a'],
    Brass: ['/projects/film-music-score/loops/Heroic Brass 1.m4a', '/projects/film-music-score/loops/Heroic Brass 2.m4a'],
    Drums: ['/projects/film-music-score/loops/Heroic Drums 1.m4a', '/projects/film-music-score/loops/Heroic Drums 2.m4a', '/projects/film-music-score/loops/Heroic Drums 3.m4a', '/projects/film-music-score/loops/Heroic Drums 4.m4a'],
    Guitar: ['/projects/film-music-score/loops/Heroic Guitar 1.m4a', '/projects/film-music-score/loops/Heroic Guitar 2.m4a'],
    Marimba: ['/projects/film-music-score/loops/Heroic Marimba.m4a'],
    Piano: ['/projects/film-music-score/loops/Heroic Piano 1.m4a'],
    Strings: ['/projects/film-music-score/loops/Heroic Strings 1.m4a', '/projects/film-music-score/loops/Heroic Strings 2.m4a', '/projects/film-music-score/loops/Heroic Strings 3.m4a', '/projects/film-music-score/loops/Heroic Strings 4.m4a'],
    Vibraphone: ['/projects/film-music-score/loops/Heroic Vibraphone.m4a'],
    Vocals: ['/projects/film-music-score/loops/Heroic Vocals 1.m4a', '/projects/film-music-score/loops/Heroic Vocals 2.m4a']
  },
  Hype: {
    Bass: ['/projects/film-music-score/loops/Hype Bass 1.m4a', '/projects/film-music-score/loops/Hype Bass 2.m4a'],
    Bells: ['/projects/film-music-score/loops/Hype Bells 1.m4a', '/projects/film-music-score/loops/Hype Bells 2.m4a', '/projects/film-music-score/loops/Hype Bells 3.m4a'],
    Drums: ['/projects/film-music-score/loops/Hype Drums 1.m4a', '/projects/film-music-score/loops/Hype Drums 2.m4a', '/projects/film-music-score/loops/Hype Drums 3.m4a'],
    Guitar: ['/projects/film-music-score/loops/Hype Guitar 1.m4a', '/projects/film-music-score/loops/Hype Guitar 2.m4a'],
    Lead: ['/projects/film-music-score/loops/Hype Lead 1.m4a', '/projects/film-music-score/loops/Hype Lead 2.m4a', '/projects/film-music-score/loops/Hype Lead 3.m4a'],
    Piano: ['/projects/film-music-score/loops/Hype Piano 1.m4a'],
    Strings: ['/projects/film-music-score/loops/Hype Strings 1.m4a', '/projects/film-music-score/loops/Hype Strings 2.m4a', '/projects/film-music-score/loops/Hype Strings 3.m4a', '/projects/film-music-score/loops/Hype Strings 4.m4a'],
    Synth: ['/projects/film-music-score/loops/Hype Synth 1.m4a', '/projects/film-music-score/loops/Hype Synth 2.m4a', '/projects/film-music-score/loops/Hype Synth 3.m4a']
  },
  Mysterious: {
    Bass: ['/projects/film-music-score/loops/Mysterious Bass 1.m4a', '/projects/film-music-score/loops/Mysterious Bass 2.m4a'],
    Brass: ['/projects/film-music-score/loops/Mysterious Brass 1.m4a'],
    Drums: ['/projects/film-music-score/loops/Mysterious Drums 1.m4a', '/projects/film-music-score/loops/Mysterious Drums 2.m4a', '/projects/film-music-score/loops/Mysterious Drums 3.m4a'],
    Glockenspiel: ['/projects/film-music-score/loops/Mysterious Glockenspiel.m4a'],
    Guitar: ['/projects/film-music-score/loops/Mysterious Guitar 1.m4a'],
    Keys: ['/projects/film-music-score/loops/Mysterious Keys 1.m4a', '/projects/film-music-score/loops/Mysterious Keys 2.m4a', '/projects/film-music-score/loops/Mysterious Keys 3.m4a'],
    Strings: ['/projects/film-music-score/loops/Mysterious Strings 1.m4a', '/projects/film-music-score/loops/Mysterious Strings 2.m4a', '/projects/film-music-score/loops/Mysterious Strings 3.m4a'],
    Synth: ['/projects/film-music-score/loops/Mysterious Synth 1.m4a', '/projects/film-music-score/loops/Mysterious Synth 2.m4a', '/projects/film-music-score/loops/Mysterious Synth 3.m4a', '/projects/film-music-score/loops/Mysterious Synth 4.m4a']
  },
  Scary: {
    Bass: ['/projects/film-music-score/loops/Scary Bass 1.m4a', '/projects/film-music-score/loops/Scary Bass 2.m4a'],
    Brass: ['/projects/film-music-score/loops/Scary Brass 1.m4a'],
    Percussion: ['/projects/film-music-score/loops/Scary Percussion 1.m4a', '/projects/film-music-score/loops/Scary Percussion 2.m4a'],
    Strings: ['/projects/film-music-score/loops/Scary Strings 1.m4a', '/projects/film-music-score/loops/Scary Strings 2.m4a'],
    Synth: ['/projects/film-music-score/loops/Scary Synth 1.m4a', '/projects/film-music-score/loops/Scary Synth 2.m4a']
  },
  Upbeat: {
    Bells: ['/projects/film-music-score/loops/Upbeat Bells.m4a'],
    Clarinet: ['/projects/film-music-score/loops/Upbeat Clarinet.m4a'],
    Drums: ['/projects/film-music-score/loops/Upbeat Drums 1.m4a', '/projects/film-music-score/loops/Upbeat Drums 2.m4a'],
    'Electric Bass': ['/projects/film-music-score/loops/Upbeat Electric Bass.m4a'],
    'Electric Guitar': ['/projects/film-music-score/loops/Upbeat Electric Guitar.m4a'],
    Piano: ['/projects/film-music-score/loops/Upbeat Piano 1.m4a'],
    Strings: ['/projects/film-music-score/loops/Upbeat Strings 1.m4a']
  }
};

export const categories = Object.keys(loopData);

export const instrumentIcons = {
  Bass: '🎸', Brass: '🎺', Drums: '🥁', Strings: '🎻', Synth: '🎹', Vocals: '🎤',
  Guitar: '🎸', Keys: '🎹', Lead: '🎛️', Percussion: '🪘', Bells: '🔔',
  Clarinet: '🎷', 'Electric Bass': '🎸', 'Electric Guitar': '🎸', Piano: '🎹',
  Marimba: '🎵', Vibraphone: '🎵'
};

// All unique instruments for answer matching
export const allInstruments = [
  'Bass', 'Brass', 'Drums', 'Strings', 'Synth', 'Vocals',
  'Guitar', 'Keys', 'Lead', 'Percussion', 'Bells',
  'Clarinet', 'Electric Bass', 'Electric Guitar', 'Piano',
  'Marimba', 'Vibraphone'
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
    'lead synth': 'lead',
    'synth lead': 'lead',
    'synth-lead': 'lead',
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
