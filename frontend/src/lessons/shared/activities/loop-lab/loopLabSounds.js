// loop-lab/loopLabSounds.js - Sound effects using Web Audio API
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

// Sound effects
export const sounds = {
  // Correct answer - happy rising ding
  correct: () => {
    playTone(523, 0.1, 'sine', 0.3); // C5
    setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 50); // E5
    setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 100); // G5
  },
  
  // Wrong answer - low buzz
  wrong: () => {
    playTone(150, 0.2, 'sawtooth', 0.2);
    setTimeout(() => playTone(130, 0.15, 'sawtooth', 0.15), 100);
  },
  
  // Perfect round - triumphant fanfare
  perfect: () => {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 80);
    });
    setTimeout(() => playChord([523, 659, 784, 1047], 0.4, 'sine', 0.15), 350);
  },
  
  // Score counting up - quick blips
  scoreUp: () => {
    playTone(880 + Math.random() * 200, 0.05, 'sine', 0.15);
  },
  
  // Score calculating/tallying - rhythmic ticks (call repeatedly)
  scoreTick: () => {
    playTone(600 + Math.random() * 100, 0.03, 'square', 0.1);
  },
  
  // Score total reveal - big ding
  scoreTotal: () => {
    playTone(523, 0.08, 'sine', 0.25);
    setTimeout(() => playTone(784, 0.12, 'sine', 0.3), 60);
    setTimeout(() => playTone(1047, 0.2, 'sine', 0.25), 120);
  },
  
  // Mystery box hover
  boxHover: () => {
    playTone(400 + Math.random() * 100, 0.04, 'sine', 0.12);
  },
  
  // Mystery box open - dramatic reveal
  boxOpen: () => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },
  
  // No power-up (empty box)
  boxEmpty: () => {
    playTone(200, 0.15, 'sawtooth', 0.15);
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.1), 100);
  },
  
  // Score reveal - whoosh up
  reveal: () => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  },
  
  // Button click - soft pop
  click: () => {
    playTone(600, 0.05, 'sine', 0.15);
  },
  
  // Select instrument - pluck
  select: () => {
    playTone(440, 0.08, 'triangle', 0.2);
    setTimeout(() => playTone(550, 0.06, 'triangle', 0.15), 30);
  },
  
  // Deselect - lower pluck
  deselect: () => {
    playTone(350, 0.08, 'triangle', 0.15);
  },
  
  // Power-up appear - magical shimmer
  powerUp: () => {
    const freqs = [523, 659, 784, 880, 1047];
    freqs.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'sine', 0.12), i * 40);
    });
  },
  
  // Game start - ready beep
  start: () => {
    playTone(440, 0.1, 'square', 0.15);
    setTimeout(() => playTone(440, 0.1, 'square', 0.15), 150);
    setTimeout(() => playTone(660, 0.2, 'square', 0.2), 300);
  },
  
  // Round end - resolution chord
  roundEnd: () => {
    playChord([262, 330, 392], 0.3, 'sine', 0.2);
  },
  
  // Victory - big fanfare
  victory: () => {
    setTimeout(() => sounds.perfect(), 0);
    setTimeout(() => sounds.perfect(), 500);
    setTimeout(() => playChord([262, 330, 392, 523], 0.6, 'sine', 0.2), 1000);
  },
  
  // Streak fire - sizzle
  streak: () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(800 + i * 100, 0.05, 'sawtooth', 0.08), i * 30);
    }
  },
  
  // Countdown tick
  tick: () => {
    playTone(800, 0.03, 'square', 0.1);
  }
};

// Initialize audio context on first user interaction
export const initAudio = () => {
  getAudioContext();
};