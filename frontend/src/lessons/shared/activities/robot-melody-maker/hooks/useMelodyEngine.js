/**
 * FILE: monster-melody-maker/hooks/useMelodyEngine.js
 *
 * OPTIMIZED for Chromebook performance:
 * - Stable refs prevent effect re-triggering
 * - Proper Tone.js timing (no negative values)
 * - Single initialization, pattern updates without restart
 * - Debounced callbacks
 * - ✅ CHROMEBOOK FIX: Throttled visual callbacks to reduce React re-renders
 */

import { useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

// Pentatonic scale - 8 notes from high to low
const SCALE_NOTES = ['C5', 'A4', 'G4', 'E4', 'D4', 'C4', 'A3', 'G3'];

const useMelodyEngine = ({ pattern, tempo, isPlaying, onNotePlay, onStep }) => {
  // === REFS FOR STABLE VALUES ===
  const synthRef = useRef(null);
  const sequenceRef = useRef(null);
  const reverbRef = useRef(null);
  const isInitializedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const isDisposedRef = useRef(false); // Prevents "Synth was already disposed" during HMR

  // Store callbacks in refs to avoid effect re-runs
  const onNotePlayRef = useRef(onNotePlay);
  const onStepRef = useRef(onStep);
  const patternRef = useRef(pattern);
  const tempoRef = useRef(tempo);

  // ✅ CHROMEBOOK OPTIMIZATION: Track last callback time to throttle updates
  const lastVisualUpdateRef = useRef(0);
  const pendingStepRef = useRef(-1);
  const pendingPitchRef = useRef(null);
  const rafIdRef = useRef(null);

  // Update refs when props change (no effect trigger)
  useEffect(() => { onNotePlayRef.current = onNotePlay; }, [onNotePlay]);
  useEffect(() => { onStepRef.current = onStep; }, [onStep]);
  useEffect(() => { patternRef.current = pattern; }, [pattern]);

  // Update tempo without restarting sequence
  useEffect(() => {
    tempoRef.current = tempo;
    if (Tone.getTransport().state === 'started') {
      Tone.getTransport().bpm.value = tempo;
    }
  }, [tempo]);

  // === INITIALIZE AUDIO (once) ===
  const initAudio = useCallback(async () => {
    if (isInitializedRef.current) return true;

    try {
      await Tone.start();
      isDisposedRef.current = false; // Reset disposed flag

      // ✅ CHROMEBOOK OPTIMIZATION: Detect low-end devices
      const isChromebook = /CrOS/.test(navigator.userAgent);
      const isLowEnd = isChromebook || navigator.hardwareConcurrency <= 4;

      if (isLowEnd) {
        // Skip reverb entirely on Chromebook - direct to destination
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          maxPolyphony: 3, // Reduced further for Chromebook
          voice: Tone.Synth,
          options: {
            oscillator: {
              type: 'sine', // Simplest waveform for Chromebook
            },
            envelope: {
              attack: 0.01,
              decay: 0.15,
              sustain: 0.15,
              release: 0.3, // Very short release
            },
          },
        }).toDestination();

        console.log('🎵 Melody engine initialized (CHROMEBOOK MODE - no reverb)');
      } else {
        // Normal devices get reverb
        reverbRef.current = new Tone.Reverb({
          decay: 1.2,
          wet: 0.2,
        }).toDestination();

        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          maxPolyphony: 4,
          voice: Tone.Synth,
          options: {
            oscillator: {
              type: 'triangle',
            },
            envelope: {
              attack: 0.02,
              decay: 0.2,
              sustain: 0.2,
              release: 0.5,
            },
          },
        }).connect(reverbRef.current);

        console.log('🎵 Melody engine initialized (NORMAL MODE)');
      }

      synthRef.current.volume.value = -10;
      isInitializedRef.current = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }, []);

  // === CREATE SEQUENCE (reads from refs) ===
  const createSequence = useCallback(() => {
    if (!synthRef.current) return;

    // Dispose old sequence safely
    if (sequenceRef.current) {
      try {
        sequenceRef.current.dispose();
      } catch (e) {
        // Ignore disposal errors
      }
      sequenceRef.current = null;
    }

    // Create new sequence
    sequenceRef.current = new Tone.Sequence(
      (time, step) => {
        // Skip if disposed (prevents errors during hot reload)
        if (isDisposedRef.current) return;
        
        const currentPattern = patternRef.current;
        if (!currentPattern) return;

        // Find active notes
        const activeNotes = [];
        let lowestActiveRow = null;

        currentPattern.forEach((row, rowIndex) => {
          if (row[step]) {
            activeNotes.push(SCALE_NOTES[rowIndex]);
            if (lowestActiveRow === null || rowIndex < lowestActiveRow) {
              lowestActiveRow = rowIndex;
            }
          }
        });

        // Play notes (with disposed check)
        if (activeNotes.length > 0 && synthRef.current && !isDisposedRef.current) {
          try {
            synthRef.current.triggerAttackRelease(activeNotes, '8n', time);
          } catch (e) {
            // Ignore disposal errors during hot reload
          }
        }

        // ✅ CHROMEBOOK OPTIMIZATION: Batch visual updates using requestAnimationFrame
        // Store pending updates instead of calling setState immediately
        pendingStepRef.current = step;
        pendingPitchRef.current = lowestActiveRow;

        // Only schedule one RAF at a time
        if (!rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;

            // Apply the most recent pending updates
            if (onNotePlayRef.current) {
              onNotePlayRef.current(pendingPitchRef.current);
            }
            if (onStepRef.current) {
              onStepRef.current(pendingStepRef.current);
            }
          });
        }
      },
      [...Array(16).keys()],
      '16n'
    );

    sequenceRef.current.loop = true;
  }, []); // No dependencies - reads from refs

  // === HANDLE PLAY STATE CHANGES ===
  useEffect(() => {
    // Skip if state hasn't actually changed
    if (isPlayingRef.current === isPlaying) return;
    isPlayingRef.current = isPlaying;

    const handlePlayback = async () => {
      if (isPlaying) {
        // Initialize audio if needed
        const ready = await initAudio();
        if (!ready) return;

        // Set tempo
        Tone.getTransport().bpm.value = tempoRef.current;

        // Reset transport position to avoid negative time issues
        Tone.getTransport().stop();
        Tone.getTransport().position = 0;

        // Create fresh sequence
        createSequence();

        // Start playback
        if (sequenceRef.current) {
          sequenceRef.current.start(0);
        }
        Tone.getTransport().start();

        console.log('▶️ Playback started');
      } else {
        // Stop playback gracefully
        Tone.getTransport().stop();
        Tone.getTransport().position = 0;

        // Don't call stop on sequence (causes negative time error)
        // Just dispose and nullify
        if (sequenceRef.current) {
          try {
            sequenceRef.current.dispose();
          } catch (e) {
            // Ignore
          }
          sequenceRef.current = null;
        }

        // Reset visuals
        if (onStepRef.current) {
          onStepRef.current(-1);
        }
        if (onNotePlayRef.current) {
          onNotePlayRef.current(null);
        }

        console.log('⏹️ Playback stopped');
      }
    };

    handlePlayback();
  }, [isPlaying, initAudio, createSequence]);

  // === UPDATE PATTERN DURING PLAYBACK ===
  useEffect(() => {
    // Only recreate sequence if actively playing
    if (isPlayingRef.current && isInitializedRef.current && Tone.getTransport().state === 'started') {
      createSequence();
      sequenceRef.current?.start(0);
    }
  }, [pattern, createSequence]);

  // === CLEANUP ===
  useEffect(() => {
    return () => {
      // Set disposed flag FIRST to prevent any pending callbacks
      isDisposedRef.current = true;

      // Cancel any pending RAF
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      if (sequenceRef.current) {
        try {
          sequenceRef.current.dispose();
        } catch (e) {}
      }
      if (synthRef.current) {
        try {
          synthRef.current.dispose();
        } catch (e) {}
      }
      if (reverbRef.current) {
        try {
          reverbRef.current.dispose();
        } catch (e) {}
      }
      try {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
      } catch (e) {}

      // Reset refs
      synthRef.current = null;
      sequenceRef.current = null;
      reverbRef.current = null;
      isInitializedRef.current = false;
      isPlayingRef.current = false;

      console.log('🧹 Melody engine cleaned up');
    };
  }, []);

  return {
    isReady: isInitializedRef.current,
  };
};

export default useMelodyEngine;