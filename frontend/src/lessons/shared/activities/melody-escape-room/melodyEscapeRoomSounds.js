// melody-escape-room/melodyEscapeRoomSounds.js - Sound effects using Web Audio API
// No external audio files needed - generates sounds programmatically

let audioCtx = null;

// Lazy init audio context (must be after user interaction)
const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play a tone with envelope
const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if audio not available
  }
};

// Play a chord (multiple tones)
const playChord = (frequencies, duration, type = 'sine', volume = 0.2) => {
  frequencies.forEach((freq, i) => {
    setTimeout(() => playTone(freq, duration, type, volume), i * 30);
  });
};

// Sound effects themed for escape room
export const sounds = {
  // Lock unlocked - triumphant key turning sound
  unlock: () => {
    playTone(392, 0.1, 'sine', 0.25); // G4
    setTimeout(() => playTone(494, 0.1, 'sine', 0.25), 80); // B4
    setTimeout(() => playTone(587, 0.15, 'sine', 0.3), 160); // D5
    setTimeout(() => playTone(784, 0.2, 'sine', 0.25), 250); // G5
  },

  // Wrong answer - lock rattling/buzzer
  wrongGuess: () => {
    playTone(150, 0.15, 'sawtooth', 0.2);
    setTimeout(() => playTone(140, 0.1, 'sawtooth', 0.15), 80);
    setTimeout(() => playTone(130, 0.15, 'sawtooth', 0.12), 150);
  },

  // Hint revealed - mysterious chime
  hint: () => {
    playTone(523, 0.15, 'sine', 0.2);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.18), 100);
    setTimeout(() => playTone(523, 0.2, 'sine', 0.15), 200);
  },

  // Listen button click - loop preview start
  listen: () => {
    playTone(440, 0.05, 'triangle', 0.2);
    setTimeout(() => playTone(550, 0.05, 'triangle', 0.18), 40);
  },

  // Room escaped - victory fanfare
  escape: () => {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 100);
    });
    setTimeout(() => playChord([523, 659, 784, 1047], 0.5, 'sine', 0.2), 500);
    setTimeout(() => playChord([587, 740, 880, 1175], 0.6, 'sine', 0.18), 900); // D major
  },

  // Door creaking open (when selecting a lock)
  doorCreak: () => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },

  // Timer tick (last 10 seconds)
  tick: () => {
    playTone(800, 0.03, 'square', 0.1);
  },

  // Button click - soft pop
  click: () => {
    playTone(600, 0.05, 'sine', 0.15);
  },

  // Select item (creator mode)
  select: () => {
    playTone(440, 0.08, 'triangle', 0.2);
    setTimeout(() => playTone(550, 0.06, 'triangle', 0.15), 30);
  },

  // Deselect item
  deselect: () => {
    playTone(350, 0.08, 'triangle', 0.15);
  },

  // Room created success
  roomCreated: () => {
    playTone(523, 0.1, 'sine', 0.25);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.25), 100);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.25), 200);
    setTimeout(() => playChord([523, 659, 784], 0.3, 'sine', 0.2), 350);
  },

  // Code copied
  codeCopied: () => {
    playTone(880, 0.08, 'sine', 0.2);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.18), 80);
  },

  // All listens used warning
  noListensLeft: () => {
    playTone(200, 0.2, 'sawtooth', 0.15);
  },

  // Time penalty added
  timePenalty: () => {
    playTone(180, 0.1, 'square', 0.12);
    setTimeout(() => playTone(160, 0.15, 'square', 0.1), 100);
  }
};

// Initialize audio context on first user interaction
export const initAudio = () => {
  getAudioContext();
};
