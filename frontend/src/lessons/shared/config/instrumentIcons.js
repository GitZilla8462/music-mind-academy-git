/**
 * Instrument Icons Configuration
 * 
 * Maps loop instrument types to their icon files
 * Place PNG files in: /public/icons/instruments/
 */

// Icon path base - adjust to match your public folder structure
const ICON_BASE = '/icons/instruments';

export const INSTRUMENT_ICONS = {
  // Strings
  violin: `${ICON_BASE}/violin.png`,
  'upright-bass': `${ICON_BASE}/upright-bass.png`,
  cello: `${ICON_BASE}/upright-bass.png`, // Use same as upright bass
  bass: `${ICON_BASE}/upright-bass.png`,
  'string-bass': `${ICON_BASE}/upright-bass.png`,
  strings: `${ICON_BASE}/violin.png`,
  harp: `${ICON_BASE}/harp.png`,
  'acoustic-guitar': `${ICON_BASE}/acoustic-guitar.png`,
  'electric-guitar': `${ICON_BASE}/electric-guitar.png`,
  guitar: `${ICON_BASE}/acoustic-guitar.png`,
  ukulele: `${ICON_BASE}/ukulele.png`,
  
  // Keyboards
  piano: `${ICON_BASE}/piano.png`,
  keys: `${ICON_BASE}/piano.png`,
  keyboard: `${ICON_BASE}/piano.png`,
  synthesizer: `${ICON_BASE}/synthesizer.png`,
  synth: `${ICON_BASE}/synthesizer.png`,
  'synth-lead': `${ICON_BASE}/synthesizer.png`,
  
  // Woodwinds
  flute: `${ICON_BASE}/flute.png`,
  clarinet: `${ICON_BASE}/clarinet.png`,
  saxophone: `${ICON_BASE}/saxophone.png`,
  sax: `${ICON_BASE}/saxophone.png`,
  bassoon: `${ICON_BASE}/bassoon.png`,
  recorder: `${ICON_BASE}/recorder.png`,
  oboe: `${ICON_BASE}/clarinet.png`, // Similar shape
  
  // Brass
  trumpet: `${ICON_BASE}/trumpet.png`,
  trombone: `${ICON_BASE}/trombone.png`,
  'french-horn': `${ICON_BASE}/french-horn.png`,
  horn: `${ICON_BASE}/french-horn.png`,
  tuba: `${ICON_BASE}/tuba.png`,
  brass: `${ICON_BASE}/trumpet.png`,
  
  // Percussion
  drums: `${ICON_BASE}/drum-kit.png`,
  'drum-kit': `${ICON_BASE}/drum-kit.png`,
  'snare-drum': `${ICON_BASE}/snare-drum.png`,
  snare: `${ICON_BASE}/snare-drum.png`,
  'bass-drum': `${ICON_BASE}/bass-drum.png`,
  timpani: `${ICON_BASE}/timpani.png`,
  percussion: `${ICON_BASE}/drum-kit.png`,
  
  // Mallet Percussion
  glockenspiel: `${ICON_BASE}/glockenspiel.png`,
  bells: `${ICON_BASE}/glockenspiel.png`,
  marimba: `${ICON_BASE}/marimba.png`,
  xylophone: `${ICON_BASE}/glockenspiel.png`,
  
  // Vocals
  microphone: `${ICON_BASE}/microphone.png`,
  vocals: `${ICON_BASE}/microphone.png`,
  voice: `${ICON_BASE}/microphone.png`,
};

// Instrument family groupings (for filtering UI)
export const INSTRUMENT_FAMILIES = {
  strings: ['violin', 'upright-bass', 'cello', 'bass', 'string-bass', 'strings', 'harp', 'acoustic-guitar', 'electric-guitar', 'guitar', 'ukulele'],
  keyboards: ['piano', 'keys', 'keyboard', 'synthesizer', 'synth', 'synth-lead'],
  woodwinds: ['flute', 'clarinet', 'saxophone', 'sax', 'bassoon', 'recorder', 'oboe'],
  brass: ['trumpet', 'trombone', 'french-horn', 'horn', 'tuba', 'brass'],
  percussion: ['drums', 'drum-kit', 'snare-drum', 'snare', 'bass-drum', 'timpani', 'percussion', 'glockenspiel', 'bells', 'marimba', 'xylophone'],
  vocals: ['microphone', 'vocals', 'voice'],
};

// Helper function to get icon for a loop name
export function getInstrumentIcon(loopName) {
  const name = loopName.toLowerCase();
  
  // Check each instrument keyword
  for (const [instrument, iconPath] of Object.entries(INSTRUMENT_ICONS)) {
    if (name.includes(instrument.replace('-', ' ')) || name.includes(instrument)) {
      return iconPath;
    }
  }
  
  // Default fallback
  return `${ICON_BASE}/microphone.png`;
}

// Helper to get family color for an instrument
export const FAMILY_COLORS = {
  strings: '#8B4513',    // Brown
  keyboards: '#1a1a2e',  // Dark blue/black
  woodwinds: '#2d3436',  // Dark gray
  brass: '#d4a017',      // Gold
  percussion: '#b45309', // Copper/brown
  vocals: '#374151',     // Gray
};

export function getInstrumentFamily(instrumentName) {
  const name = instrumentName.toLowerCase();
  for (const [family, instruments] of Object.entries(INSTRUMENT_FAMILIES)) {
    if (instruments.some(inst => name.includes(inst))) {
      return family;
    }
  }
  return 'percussion'; // Default
}