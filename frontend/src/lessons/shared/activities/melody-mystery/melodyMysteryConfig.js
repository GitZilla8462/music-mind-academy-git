// Melody Mystery Configuration
// Grid setup, Tone.js audio, storage API, scoring

import * as Tone from 'tone';

// ========================================
// MELODY GRID SETUP - Pentatonic Scale
// ========================================

export const MELODY_NOTES = [
  { id: 'A4', name: 'A', color: '#8B5CF6', row: 0 },  // Purple - top
  { id: 'G4', name: 'G', color: '#3B82F6', row: 1 },  // Blue
  { id: 'E4', name: 'E', color: '#10B981', row: 2 },  // Green - middle
  { id: 'D4', name: 'D', color: '#F59E0B', row: 3 },  // Orange
  { id: 'C4', name: 'C', color: '#EF4444', row: 4 },  // Red - bottom
];

export const GRID_ROWS = 5;
export const GRID_COLS = 8;
export const DEFAULT_BPM = 120;

// ========================================
// MODE CONFIGURATIONS
// ========================================

export const MODES = {
  solo: {
    id: 'solo',
    label: 'Solo',
    icon: '🧑',
    totalMelodies: 6,
    perPerson: 6,
    description: 'Create all 6 melodies yourself',
    players: 1
  },
  partner: {
    id: 'partner',
    label: 'Partner',
    icon: '🧑‍🤝‍🧑',
    totalMelodies: 6,
    perPerson: 3,
    description: '3 melodies each',
    players: 2
  }
};

export const getMelodyAssignments = (mode, playerIndex = 0) => {
  switch (mode) {
    case 'solo':
      return [1, 2, 3, 4, 5, 6];
    case 'partner':
      return playerIndex === 0
        ? [1, 3, 5]  // Player A: odd melodies
        : [2, 4, 6]; // Player B: even melodies
    default:
      return [1, 2, 3, 4, 5, 6];
  }
};

// ========================================
// PATTERN UTILITIES
// ========================================

// Create empty 5x8 grid (5 rows of pitches, 8 columns/beats)
export const createEmptyGrid = () => {
  return Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));
};

// CRITICAL: Enforce one note per column
export const toggleCellWithConstraint = (grid, row, col) => {
  const newGrid = grid.map(r => [...r]);

  // If clicking on an already-active cell, just turn it off
  if (newGrid[row][col]) {
    newGrid[row][col] = false;
    return newGrid;
  }

  // Otherwise, clear the entire column first, then activate the clicked cell
  for (let r = 0; r < GRID_ROWS; r++) {
    newGrid[r][col] = false;
  }
  newGrid[row][col] = true;

  return newGrid;
};

// Check if grids match exactly
export const gridsMatch = (grid1, grid2) => {
  if (!grid1 || !grid2) return false;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (grid1[row][col] !== grid2[row][col]) {
        return false;
      }
    }
  }
  return true;
};

// Count active notes in grid
export const countActiveNotes = (grid) => {
  let count = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (grid[row][col]) count++;
    }
  }
  return count;
};

// Validate pattern has minimum notes
export const validatePattern = (grid, minNotes = 3) => {
  return countActiveNotes(grid) >= minNotes;
};

// Get contour (melodic shape) as array of row indices per column
export const getContour = (grid) => {
  const contour = [];
  for (let col = 0; col < GRID_COLS; col++) {
    let foundRow = -1;
    for (let row = 0; row < GRID_ROWS; row++) {
      if (grid[row][col]) {
        foundRow = row;
        break;
      }
    }
    contour.push(foundRow);
  }
  return contour;
};

// Compare contours (melodic shapes) - returns percentage match
export const compareContours = (grid1, grid2) => {
  const contour1 = getContour(grid1);
  const contour2 = getContour(grid2);

  let matches = 0;
  let total = 0;

  for (let col = 0; col < GRID_COLS; col++) {
    // Only compare columns where both have notes
    if (contour1[col] !== -1 && contour2[col] !== -1) {
      total++;
      if (contour1[col] === contour2[col]) {
        matches++;
      }
    } else if (contour1[col] !== -1 || contour2[col] !== -1) {
      // One has a note, one doesn't
      total++;
    }
  }

  return total > 0 ? (matches / total) * 100 : 0;
};

// ========================================
// SCORING WITH PARTIAL CREDIT
// ========================================

export const calculateScore = (userGrid, targetGrid) => {
  // Check for exact match first
  if (gridsMatch(userGrid, targetGrid)) {
    return { points: 100, stars: 3, message: 'Perfect!' };
  }

  // Calculate contour match percentage
  const contourMatch = compareContours(userGrid, targetGrid);

  if (contourMatch >= 80) {
    return { points: 75, stars: 2, message: 'Great contour!' };
  } else if (contourMatch >= 50) {
    return { points: 50, stars: 1, message: 'Getting there!' };
  } else {
    return { points: 25, stars: 0, message: 'Keep trying!' };
  }
};

// ========================================
// STORAGE & SHARE CODES (Server-based)
// ========================================

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? ''
  : 'http://localhost:5000';

const STORAGE_KEY = 'melody-mystery-rooms';

export const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Create a new room on the server
export const createRoom = async (roomData) => {
  const code = generateShareCode();
  const data = { ...roomData, code, createdAt: Date.now() };

  try {
    const response = await fetch(`${API_BASE_URL}/api/melody-rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const room = await response.json();
      console.log('🎵 Melody Mystery room created on server:', room.code);
      return room;
    }
  } catch (error) {
    console.error('Failed to create room on server:', error);
  }

  // Fallback to localStorage
  const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  rooms[code] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  console.log('🎵 Melody Mystery room created in localStorage:', code);
  return { ...data, code };
};

// Save/update room
export const saveRoom = async (roomData, existingCode = null) => {
  if (existingCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/melody-rooms/${existingCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });

      if (response.ok) {
        console.log('🎵 Room updated on server:', existingCode);
        return existingCode;
      }
    } catch (error) {
      console.error('Failed to update room on server:', error);
    }

    // Fallback to localStorage
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    rooms[existingCode] = { ...roomData, code: existingCode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    return existingCode;
  }

  const room = await createRoom(roomData);
  return room.code;
};

// Load room from server
export const loadRoom = async (shareCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/melody-rooms/${shareCode}`);

    if (response.ok) {
      const room = await response.json();
      console.log('🎵 Room loaded from server:', shareCode);
      return room;
    }

    if (response.status === 404) {
      console.log('🎵 Room not found on server:', shareCode);
    }
  } catch (error) {
    console.error('Failed to load room from server:', error);
  }

  // Fallback to localStorage
  const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return rooms[shareCode.toUpperCase()] || null;
};

// Get all locally stored rooms
export const getAllRooms = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
};

// ========================================
// AUDIO - MELODY SYNTH (Triangle wave)
// ========================================

let melodySynth = null;
let initialized = false;

export const initMelodySynth = async () => {
  if (initialized) return;

  await Tone.start();

  melodySynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 }
  }).toDestination();

  initialized = true;
};

export const playNote = async (noteId) => {
  if (!initialized) await initMelodySynth();
  melodySynth?.triggerAttackRelease(noteId, '8n');
};

export const playGrid = async (grid, bpm = DEFAULT_BPM) => {
  if (!initialized) await initMelodySynth();

  const interval = (60 / bpm) * 1000 / 2; // 8th notes at given BPM

  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = 0; row < GRID_ROWS; row++) {
      if (grid[row][col]) {
        setTimeout(() => {
          melodySynth?.triggerAttackRelease(MELODY_NOTES[row].id, '8n');
        }, col * interval);
        break; // Only one note per column
      }
    }
  }

  return new Promise(resolve => setTimeout(resolve, GRID_COLS * interval + 200));
};

export const disposeSynth = () => {
  try {
    melodySynth?.dispose();
  } catch (e) { /* ignore */ }
  melodySynth = null;
  initialized = false;
};

// ========================================
// UI SOUNDS
// ========================================

let uiSynth = null;

const initUISynth = async () => {
  if (!uiSynth) {
    await Tone.start();
    uiSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.3 }
    }).toDestination();
    uiSynth.volume.value = -12;
  }
};

export const sounds = {
  click: async () => {
    await initUISynth();
    uiSynth?.triggerAttackRelease('C5', '32n');
  },

  wrongGuess: async () => {
    await initUISynth();
    uiSynth?.triggerAttackRelease('E3', '8n');
    setTimeout(() => uiSynth?.triggerAttackRelease('C3', '8n'), 150);
  },

  unlock: async () => {
    await initUISynth();
    const notes = ['C5', 'E5', 'G5', 'C6'];
    notes.forEach((note, i) => {
      setTimeout(() => uiSynth?.triggerAttackRelease(note, '16n'), i * 100);
    });
  },

  hint: async () => {
    await initUISynth();
    uiSynth?.triggerAttackRelease('G4', '8n');
  },

  escape: async () => {
    await initUISynth();
    const notes = ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'];
    notes.forEach((note, i) => {
      setTimeout(() => uiSynth?.triggerAttackRelease(note, '8n'), i * 100);
    });
  }
};
