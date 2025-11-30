/**
 * FILE: monster-melody-maker/hooks/useMelodyEngine.js
 * 
 * Simple melody sequencer using Tone.js
 * - Single synth for clean sound
 * - Passes actual pitch row (0-7) for smooth monster animation
 * - Row 0 = highest note, Row 7 = lowest note
 */

import { useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

// Pentatonic scale - 8 notes from high to low
// Row 0 = C5 (highest), Row 7 = G3 (lowest)
const SCALE_NOTES = ['C5', 'A4', 'G4', 'E4', 'D4', 'C4', 'A3', 'G3'];

const useMelodyEngine = ({ pattern, tempo, isPlaying, onNotePlay, onStep }) => {
  const synthRef = useRef(null);
  const sequenceRef = useRef(null);
  const reverbRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Initialize audio
  const initAudio = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      await Tone.start();

      // Create reverb for spaciousness
      reverbRef.current = new Tone.Reverb({
        decay: 1.5,
        wet: 0.25,
      }).toDestination();

      // Create a warm, voice-like synth
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        maxPolyphony: 8,
        voice: Tone.Synth,
        options: {
          oscillator: {
            type: 'triangle8', // Warm, soft tone
          },
          envelope: {
            attack: 0.02,
            decay: 0.3,
            sustain: 0.3,
            release: 0.8,
          },
        },
      }).connect(reverbRef.current);

      synthRef.current.volume.value = -8;

      isInitializedRef.current = true;
      console.log('🎵 Melody engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, []);

  // Create/update sequence
  const createSequence = useCallback(() => {
    if (!synthRef.current || !pattern) return;

    // Dispose old sequence
    if (sequenceRef.current) {
      sequenceRef.current.dispose();
    }

    // Create new sequence - 16 steps
    sequenceRef.current = new Tone.Sequence(
      (time, step) => {
        // Find which notes are active at this step
        const activeNotes = [];
        let lowestActiveRow = null; // Track lowest row number (highest pitch)

        pattern.forEach((row, rowIndex) => {
          if (row[step]) {
            activeNotes.push(SCALE_NOTES[rowIndex]);
            // Track the lowest row index (highest note) for animation
            if (lowestActiveRow === null || rowIndex < lowestActiveRow) {
              lowestActiveRow = rowIndex;
            }
          }
        });

        // Play notes
        if (activeNotes.length > 0) {
          synthRef.current.triggerAttackRelease(activeNotes, '8n', time);

          // Notify about pitch for monster animation
          // Use Tone.getDraw().schedule to sync with visual updates
          Tone.getDraw().schedule(() => {
            if (onNotePlay) {
              // Pass the actual row number (0-7) for smooth interpolation
              onNotePlay(lowestActiveRow);
            }
          }, time);
        } else {
          // No notes playing at this step
          Tone.getDraw().schedule(() => {
            if (onNotePlay) {
              onNotePlay(null); // null means no note
            }
          }, time);
        }

        // Update step indicator
        Tone.getDraw().schedule(() => {
          if (onStep) {
            onStep(step);
          }
        }, time);
      },
      [...Array(16).keys()], // Steps 0-15
      '16n' // 16th note intervals
    );

    sequenceRef.current.loop = true;
  }, [pattern, onNotePlay, onStep]);

  // Handle play/pause/stop
  useEffect(() => {
    const handlePlayback = async () => {
      if (isPlaying) {
        await initAudio();
        
        // Set tempo
        Tone.getTransport().bpm.value = tempo;
        
        // Create sequence with current pattern
        createSequence();
        
        // Start
        if (sequenceRef.current) {
          sequenceRef.current.start(0);
        }
        Tone.getTransport().start();
        
        console.log('▶️ Playback started');
      } else {
        // Stop
        Tone.getTransport().stop();
        Tone.getTransport().position = 0;
        
        if (sequenceRef.current) {
          sequenceRef.current.stop();
        }
        
        // Reset step
        if (onStep) {
          onStep(-1);
        }
        
        // Clear pitch (monster returns to rest)
        if (onNotePlay) {
          onNotePlay(null);
        }
        
        console.log('⏹️ Playback stopped');
      }
    };

    handlePlayback();
  }, [isPlaying, tempo, initAudio, createSequence, onStep, onNotePlay]);

  // Update sequence when pattern changes during playback
  useEffect(() => {
    if (isPlaying && isInitializedRef.current) {
      createSequence();
    }
  }, [pattern, isPlaying, createSequence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (reverbRef.current) {
        reverbRef.current.dispose();
      }
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      console.log('🧹 Melody engine cleaned up');
    };
  }, []);

  return {
    isReady: isInitializedRef.current,
  };
};

export default useMelodyEngine;