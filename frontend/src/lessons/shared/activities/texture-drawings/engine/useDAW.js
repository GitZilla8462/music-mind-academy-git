/**
 * useDAW.js - Custom Hook for DAW-like Audio/MIDI Sync
 * 
 * Manages AudioEngine and MidiEngine together for synchronized playback.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import AudioEngine from './AudioEngine';
import MidiEngine from './MidiEngine';

const useDAW = (instruments, options = {}) => {
  const { skipMidiStartOffset = false } = options;
  
  // Engines
  const audioEngine = useRef(null);
  const midiEngine = useRef(null);
  const isInitialized = useRef(false);
  
  // State
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startOffset, setStartOffset] = useState(0);
  const [duration, setDuration] = useState(0);
  const [enabledTracks, setEnabledTracks] = useState({});
  
  // Initialize engines and load data (only once)
  useEffect(() => {
    if (isInitialized.current) {
      console.log('🔄 useDAW: Already initialized, skipping');
      return;
    }
    isInitialized.current = true;
    console.log('🎬 useDAW: Initializing...');
    
    const init = async () => {
      // Create engines
      audioEngine.current = new AudioEngine();
      midiEngine.current = new MidiEngine();
      console.log('   Created engines');
      
      // Initialize enabled tracks
      const initialEnabled = {};
      instruments.forEach(inst => {
        initialEnabled[inst.id] = true;
      });
      setEnabledTracks(initialEnabled);
      console.log('   Enabled tracks:', Object.keys(initialEnabled));
      
      // Load audio and MIDI in parallel
      console.log('   Loading audio and MIDI...');
      const [audioDuration, midiInfo] = await Promise.all([
        audioEngine.current.loadTracks(instruments),
        midiEngine.current.loadTracks(instruments)
      ]);
      console.log('   Audio duration:', audioDuration);
      console.log('   MIDI info:', midiInfo);
      
      // Use actual audio duration
      setDuration(audioDuration);
      
      // Set start offset from MIDI (unless manually handling alignment)
      const offset = skipMidiStartOffset ? 0 : (midiInfo.startOffset || 0);
      setStartOffset(offset);
      setCurrentTime(offset);
      
      // Configure audio engine
      audioEngine.current.setStartOffset(offset);
      audioEngine.current.onTimeUpdate = (time) => {
        setCurrentTime(time);
      };
      audioEngine.current.onEnded = () => {
        setIsPlaying(false);
      };
      
      console.log(`🎹 DAW Ready - Duration: ${audioDuration.toFixed(2)}s, Start: ${offset.toFixed(2)}s${skipMidiStartOffset ? ' (manual alignment)' : ''}`);
      setIsLoaded(true);
    };
    
    init().catch(err => {
      console.error('❌ useDAW init error:', err);
    });
    
    // Cleanup
    return () => {
      console.log('🧹 useDAW: Cleanup');
      if (audioEngine.current) {
        audioEngine.current.destroy();
      }
    };
  }, []); // Empty deps - only run once

  // Play
  const play = useCallback(() => {
    console.log('🎵 useDAW.play() called, isLoaded:', isLoaded);
    if (!audioEngine.current || !isLoaded) {
      console.log('   ❌ Cannot play - audioEngine:', !!audioEngine.current, 'isLoaded:', isLoaded);
      return;
    }
    audioEngine.current.play();
    setIsPlaying(true);
  }, [isLoaded]);

  // Pause
  const pause = useCallback(() => {
    if (!audioEngine.current) return;
    audioEngine.current.pause();
    setIsPlaying(false);
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Stop (pause and reset to start)
  const stop = useCallback(() => {
    if (!audioEngine.current) return;
    audioEngine.current.stop();
    setIsPlaying(false);
    setCurrentTime(startOffset);
  }, [startOffset]);

  // Seek to time
  const seekTo = useCallback((time) => {
    if (!audioEngine.current) return;
    audioEngine.current.seekTo(time);
    setCurrentTime(time);
  }, []);

  // Rewind to start
  const rewind = useCallback(() => {
    seekTo(startOffset);
  }, [startOffset, seekTo]);

  // Toggle track enabled
  const toggleTrack = useCallback((trackId) => {
    setEnabledTracks(prev => {
      const newEnabled = !prev[trackId];
      if (audioEngine.current) {
        audioEngine.current.toggleTrack(trackId, newEnabled);
      }
      return { ...prev, [trackId]: newEnabled };
    });
  }, []);

  // Set track enabled state directly
  const setTrackEnabled = useCallback((trackId, enabled) => {
    setEnabledTracks(prev => {
      if (audioEngine.current) {
        audioEngine.current.toggleTrack(trackId, enabled);
      }
      return { ...prev, [trackId]: enabled };
    });
  }, []);

  return {
    // State
    isLoaded,
    isPlaying,
    currentTime,
    startOffset,
    enabledTracks,
    duration, // Actual audio duration
    
    // Engines (for direct access if needed)
    midiEngine: midiEngine.current,
    audioEngine: audioEngine.current,
    
    // Controls
    play,
    pause,
    togglePlay,
    stop,
    seekTo,
    rewind,
    toggleTrack,
    setTrackEnabled
  };
};

export default useDAW;