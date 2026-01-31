// sharedAudioContext.js
// Centralized audio context management using Tone.js
// This ensures all audio operations use the same AudioContext to avoid
// "cannot connect to an AudioNode belonging to a different audio context" errors

import * as Tone from 'tone';

/**
 * Get the shared audio context from Tone.js
 * This ensures all audio operations (Tone.js synths, native oscillators, media elements)
 * all use the same underlying AudioContext.
 *
 * @returns {AudioContext} The native AudioContext from Tone.js
 */
export const getSharedAudioContext = () => {
  // Tone.getContext() returns Tone's Context wrapper
  // .rawContext gives us the native AudioContext
  const ctx = Tone.getContext().rawContext;

  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  return ctx;
};

/**
 * Resume the shared audio context (call on user interaction)
 * @returns {Promise<void>}
 */
export const resumeAudioContext = async () => {
  await Tone.start();
};

/**
 * Check if audio context is running
 * @returns {boolean}
 */
export const isAudioContextRunning = () => {
  return Tone.getContext().state === 'running';
};

// Utility: Play a tone using the shared context
export const playTone = (frequency, duration, type = 'sine', volume = 0.3) => {
  try {
    const ctx = getSharedAudioContext();
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
    console.warn('Audio playback failed:', e);
  }
};

// Utility: Play a chord using the shared context
export const playChord = (frequencies, duration, type = 'sine', volume = 0.2) => {
  frequencies.forEach((freq, i) => {
    setTimeout(() => playTone(freq, duration, type, volume), i * 30);
  });
};
