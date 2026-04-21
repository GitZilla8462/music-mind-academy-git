// motifInstrumentConfig.js
// Individual orchestral instrument configs for the Lesson 1 Motif Builder
// 6 instruments available to students: Flute, Violin, Cello, Trumpet, Clarinet, Low Brass
// Each has a PolySynth fallback + sample paths for real instrument sounds
//
// FULL ORCHESTRA SAMPLE PACK also defined here for future lessons

const SAMPLE_BASE = '/samples';

// ========================================
// MOTIF BUILDER INSTRUMENTS (Student picks one)
// ========================================
export const MOTIF_INSTRUMENTS = {
  flute: {
    id: 'flute',
    name: 'Flute',
    emoji: '🎶',
    family: 'Woodwind',
    color: '#06B6D4', // cyan
    useSampler: true,
    samples: {
      urls: { C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3' },
      baseUrl: `${SAMPLE_BASE}/flute/`,
    },
    // PolySynth fallback — bright sine with fast attack, airy feel
    config: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.08, decay: 0.3, sustain: 0.6, release: 0.8 }
    }
  },
  violin: {
    id: 'violin',
    name: 'Violin',
    emoji: '🎻',
    family: 'Strings',
    color: '#F59E0B', // amber
    useSampler: true,
    samples: {
      urls: { G3: 'G3.mp3', C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3' },
      baseUrl: `${SAMPLE_BASE}/violin/`,
    },
    // Bowed string — sawtooth with slow attack
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.2, decay: 0.4, sustain: 0.7, release: 0.8 }
    }
  },
  cello: {
    id: 'cello',
    name: 'Cello',
    emoji: '🎻',
    family: 'Strings',
    color: '#92400E', // warm brown
    useSampler: true,
    samples: {
      urls: { C3: 'C3.mp3', G3: 'G3.mp3', C4: 'C4.mp3', E4: 'E4.mp3' },
      baseUrl: `${SAMPLE_BASE}/cello/`,
    },
    // Rich low string — sawtooth with warm envelope
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.25, decay: 0.5, sustain: 0.8, release: 1.0 }
    }
  },
  trumpet: {
    id: 'trumpet',
    name: 'Trumpet',
    emoji: '🎺',
    family: 'Brass',
    color: '#EF4444', // red
    useSampler: true,
    samples: {
      urls: { C4: 'C4.mp3', E4: 'E4.mp3', G4: 'G4.mp3', C5: 'C5.mp3' },
      baseUrl: `${SAMPLE_BASE}/trumpet/`,
    },
    // Bright brass — sawtooth with moderate attack
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.06, decay: 0.2, sustain: 0.6, release: 0.4 }
    }
  },
  clarinet: {
    id: 'clarinet',
    name: 'Clarinet',
    emoji: '🎵',
    family: 'Woodwind',
    color: '#8B5CF6', // purple
    useSampler: true,
    samples: {
      urls: { C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3' },
      baseUrl: `${SAMPLE_BASE}/clarinet/`,
    },
    // Warm woodwind — square wave (hollow sound like a reed)
    config: {
      oscillator: { type: 'square' },
      envelope: { attack: 0.08, decay: 0.3, sustain: 0.5, release: 0.6 }
    }
  },
  'low-brass': {
    id: 'low-brass',
    name: 'Low Brass',
    emoji: '📯',
    family: 'Brass',
    color: '#DC2626', // deep red
    useSampler: true,
    samples: {
      urls: { C2: 'C2.mp3', G2: 'G2.mp3', C3: 'C3.mp3', G3: 'G3.mp3' },
      baseUrl: `${SAMPLE_BASE}/low-brass/`,
    },
    // Deep brass — sawtooth with slow attack, heavy feel
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.15, decay: 0.3, sustain: 0.7, release: 0.5 }
    }
  }
};

export const MOTIF_INSTRUMENT_LIST = Object.values(MOTIF_INSTRUMENTS);

// ========================================
// FULL ORCHESTRA SAMPLE PACK
// ========================================
// Individual instrument samples for future lessons and the full DAW
// Each instrument has sample URLs + PolySynth fallback
//
// To add samples: place .mp3 files in /public/samples/{instrument}/
// Minimum 3-4 samples per instrument spread across the range
// Tone.Sampler will interpolate between samples for other notes

export const ORCHESTRA_INSTRUMENTS = {
  // --- WOODWINDS ---
  flute: MOTIF_INSTRUMENTS.flute,
  oboe: {
    id: 'oboe',
    name: 'Oboe',
    emoji: '🎶',
    family: 'Woodwind',
    color: '#0D9488',
    useSampler: true,
    samples: {
      urls: { C4: 'C4.mp3', E4: 'E4.mp3', A4: 'A4.mp3', C5: 'C5.mp3' },
      baseUrl: `${SAMPLE_BASE}/oboe/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.5 }
    }
  },
  clarinet: MOTIF_INSTRUMENTS.clarinet,
  bassoon: {
    id: 'bassoon',
    name: 'Bassoon',
    emoji: '🎵',
    family: 'Woodwind',
    color: '#7C2D12',
    useSampler: true,
    samples: {
      urls: { C2: 'C2.mp3', G2: 'G2.mp3', C3: 'C3.mp3', G3: 'G3.mp3' },
      baseUrl: `${SAMPLE_BASE}/bassoon/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.6 }
    }
  },

  // --- STRINGS ---
  violin: MOTIF_INSTRUMENTS.violin,
  viola: {
    id: 'viola',
    name: 'Viola',
    emoji: '🎻',
    family: 'Strings',
    color: '#B45309',
    useSampler: true,
    samples: {
      urls: { C3: 'C3.mp3', G3: 'G3.mp3', C4: 'C4.mp3', E4: 'E4.mp3' },
      baseUrl: `${SAMPLE_BASE}/viola/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.25, decay: 0.5, sustain: 0.75, release: 0.9 }
    }
  },
  cello: MOTIF_INSTRUMENTS.cello,
  bass: {
    id: 'bass',
    name: 'Double Bass',
    emoji: '🎻',
    family: 'Strings',
    color: '#451A03',
    useSampler: true,
    samples: {
      urls: { E1: 'E1.mp3', A1: 'A1.mp3', E2: 'E2.mp3', A2: 'A2.mp3' },
      baseUrl: `${SAMPLE_BASE}/double-bass/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.3, decay: 0.5, sustain: 0.8, release: 1.2 }
    }
  },

  // --- BRASS ---
  trumpet: MOTIF_INSTRUMENTS.trumpet,
  'french-horn': {
    id: 'french-horn',
    name: 'French Horn',
    emoji: '📯',
    family: 'Brass',
    color: '#B91C1C',
    useSampler: true,
    samples: {
      urls: { C3: 'C3.mp3', G3: 'G3.mp3', C4: 'C4.mp3', G4: 'G4.mp3' },
      baseUrl: `${SAMPLE_BASE}/french-horn/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.12, decay: 0.3, sustain: 0.65, release: 0.5 }
    }
  },
  trombone: {
    id: 'trombone',
    name: 'Trombone',
    emoji: '🎺',
    family: 'Brass',
    color: '#DC2626',
    useSampler: true,
    samples: {
      urls: { C2: 'C2.mp3', G2: 'G2.mp3', C3: 'C3.mp3', G3: 'G3.mp3' },
      baseUrl: `${SAMPLE_BASE}/trombone/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.08, decay: 0.25, sustain: 0.6, release: 0.4 }
    }
  },
  tuba: {
    id: 'tuba',
    name: 'Tuba',
    emoji: '📯',
    family: 'Brass',
    color: '#991B1B',
    useSampler: true,
    samples: {
      urls: { C1: 'C1.mp3', G1: 'G1.mp3', C2: 'C2.mp3', G2: 'G2.mp3' },
      baseUrl: `${SAMPLE_BASE}/tuba/`,
    },
    config: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.15, decay: 0.3, sustain: 0.6, release: 0.5 }
    }
  },
  'low-brass': MOTIF_INSTRUMENTS['low-brass'],
};

export const ORCHESTRA_INSTRUMENT_LIST = Object.values(ORCHESTRA_INSTRUMENTS);
