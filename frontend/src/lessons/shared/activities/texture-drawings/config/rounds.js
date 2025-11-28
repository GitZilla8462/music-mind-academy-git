/**
 * rounds.js - Round Definitions
 * Single round: Quartet with 4 instruments
 */

export const ROUNDS = [
  {
    id: 1,
    title: 'Quartet',
    subtitle: 'Four Voices',
    // Offset to align MIDI visualization with audio (in seconds)
    // Positive = shift MIDI notes right (later), Negative = shift left (earlier)
    // If playhead is BEHIND the notes visually, use a NEGATIVE value
    midiDisplayOffset: -1.82, // Shift MIDI notes 1.82s earlier to align with audio start
    instruments: [
      { 
        id: 'violin1', 
        name: 'Violin I', 
        color: '#EF4444', 
        emoji: '🎻', 
        audio: '/lessons/film-music-project/lesson3/mp3/Eine-violin1.mp3',
        midi: '/lessons/film-music-project/lesson3/mp3/Eine-violin1.mid'
      },
      { 
        id: 'violin2', 
        name: 'Violin II', 
        color: '#F97316', 
        emoji: '🎻', 
        audio: '/lessons/film-music-project/lesson3/mp3/Eine-violin2.mp3',
        midi: '/lessons/film-music-project/lesson3/mp3/Eine-violin2.mid'
      },
      { 
        id: 'viola', 
        name: 'Viola', 
        color: '#FBBF24', 
        emoji: '🎻', 
        audio: '/lessons/film-music-project/lesson3/mp3/Eine-viola.mp3',
        midi: '/lessons/film-music-project/lesson3/mp3/Eine-viola.mid'
      },
      { 
        id: 'cello', 
        name: 'Cello', 
        color: '#22C55E', 
        emoji: '🎻', 
        audio: '/lessons/film-music-project/lesson3/mp3/Eine-cello.mp3',
        midi: '/lessons/film-music-project/lesson3/mp3/Eine-cello.mid'
      }
    ],
    audio: '/lessons/film-music-project/lesson3/mp3/Eine-full.mp3',
    duration: 49, // Actual audio duration ~49s
    accent: '#F97316',
    description: 'Listen for FOUR instruments weaving together',
    instruction: 'Draw in each lane when you hear that instrument!',
    tip: 'Notice how instruments take turns and play together!'
  }
];

export const COLORS = [
  '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
  '#00C7BE', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
  '#FF6961', '#FFB347', '#FDFD96', '#77DD77', '#89CFF0'
];

export const BRUSH_SIZES = [4, 8, 12, 18, 24, 32];

export const TOOLS = {
  BRUSH: 'brush',
  ERASER: 'eraser'
};

export default ROUNDS;