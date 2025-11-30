// File: /src/lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderSFX.js
// Sound effects system for Epic Wildlife game (presentation view only)

// Create and manage audio context
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Basic tone player
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
    console.warn('Audio playback failed:', e);
  }
};

// Chord player
const playChord = (frequencies, duration, type = 'sine', volume = 0.2) => {
  frequencies.forEach((freq, i) => {
    setTimeout(() => playTone(freq, duration, type, volume), i * 30);
  });
};

// ============ SOUND EFFECTS ============
export const sfx = {
  // Drumroll before reveal
  drumroll: () => {
    for (let i = 0; i < 16; i++) {
      setTimeout(() => playTone(150 + (i % 2) * 50, 0.05, 'triangle', 0.15), i * 50);
    }
  },
  
  // Rising sweep for reveal
  reveal: () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  },
  
  // Correct answer chime
  correct: () => {
    playTone(523, 0.1, 'sine', 0.25);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.25), 50);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.25), 100);
  },
  
  // Wrong answer buzz
  wrong: () => {
    playTone(150, 0.15, 'sawtooth', 0.15);
  },
  
  // Score pop (individual)
  scorePop: () => {
    playTone(880 + Math.random() * 200, 0.05, 'sine', 0.15);
  },
  
  // Game complete fanfare
  fanfare: () => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.2), i * 100);
    });
    setTimeout(() => playChord([523, 659, 784, 1047], 0.5, 'sine', 0.15), 450);
  },
  
  // New leader announcement
  newLeader: () => {
    playTone(784, 0.1, 'sine', 0.25);
    setTimeout(() => playTone(988, 0.1, 'sine', 0.25), 80);
    setTimeout(() => playTone(1175, 0.2, 'sine', 0.3), 160);
  },
  
  // Streak callout
  streak: () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(600 + i * 80, 0.05, 'sawtooth', 0.1), i * 40);
    }
  },
  
  // UI tick
  tick: () => {
    playTone(800, 0.03, 'square', 0.1);
  },
  
  // Round complete
  roundEnd: () => {
    playChord([262, 330, 392], 0.4, 'sine', 0.2);
  }
};

// CSS animation styles for leaderboard
export const animationStyles = `
  @keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes slideScore {
    0% { transform: translateX(-50px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px currentColor; }
    50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  }
  @keyframes flyUp {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-30px); opacity: 0; }
  }
  @keyframes crownBounce {
    0%, 100% { transform: translateY(0) rotate(-5deg); }
    50% { transform: translateY(-8px) rotate(5deg); }
  }
  @keyframes fireFlicker {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  @keyframes drumroll {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }
  .anim-pop { animation: popIn 0.4s ease-out forwards; }
  .anim-score { animation: slideScore 0.3s ease-out forwards; }
  .anim-shake { animation: shake 0.4s ease-out; }
  .anim-glow { animation: glow 1s ease-in-out infinite; }
  .anim-fly { animation: flyUp 0.6s ease-out forwards; }
  .anim-crown { animation: crownBounce 1s ease-in-out infinite; }
  .anim-fire { animation: fireFlicker 0.3s ease-in-out infinite; }
  .anim-drumroll { animation: drumroll 0.1s ease-in-out infinite; }
`;