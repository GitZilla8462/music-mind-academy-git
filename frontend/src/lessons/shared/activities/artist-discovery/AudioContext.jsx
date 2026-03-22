// Global Audio Context — provides persistent audio playback across component unmounts.
// The audio element lives at the context level so it survives tab switches,
// route changes, and component unmounts within the lesson.

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const AudioCtx = createContext(null);

export function useGlobalAudio() {
  return useContext(AudioCtx);
}

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const animFrameRef = useRef(null);

  const [state, setState] = useState({
    currentTrack: null,      // { title, duration, audioUrl, ... }
    artistId: null,
    artistName: null,
    artistImageUrl: null,
    trackIndex: null,
    tracks: [],              // full track list for next/prev
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Progress loop
  const startLoop = useCallback(() => {
    const update = () => {
      if (audioRef.current) {
        setState(prev => ({ ...prev, currentTime: audioRef.current.currentTime }));
      }
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
  }, []);

  const stopLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // Play a specific track
  const playTrack = useCallback((track, index, tracks, artistInfo = {}) => {
    if (!track?.audioUrl) return;

    const s = stateRef.current;

    // Same track — just resume
    if (s.currentTrack?.audioUrl === track.audioUrl && audioRef.current) {
      audioRef.current.play().then(() => {
        setState(prev => ({ ...prev, isPlaying: true }));
        startLoop();
      }).catch(() => {});
      return;
    }

    // New track
    if (audioRef.current) {
      audioRef.current.pause();
      stopLoop();
    }

    const audio = new Audio(track.audioUrl);
    audio.volume = volumeRef.current;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    });

    audio.addEventListener('ended', () => {
      stopLoop();
      // Auto-advance
      const nextIdx = index + 1;
      if (nextIdx < tracks.length && tracks[nextIdx]?.audioUrl) {
        playTrack(tracks[nextIdx], nextIdx, tracks, artistInfo);
      } else {
        setState(prev => ({ ...prev, isPlaying: false }));
      }
    });

    audio.addEventListener('error', () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      stopLoop();
    });

    setState(prev => ({
      ...prev,
      currentTrack: track,
      trackIndex: index,
      tracks,
      artistId: artistInfo.artistId || prev.artistId,
      artistName: artistInfo.artistName || prev.artistName,
      artistImageUrl: artistInfo.artistImageUrl || prev.artistImageUrl,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
    }));

    audio.play().then(() => {
      startLoop();
    }).catch(() => {
      setState(prev => ({ ...prev, isPlaying: false }));
    });
  }, [startLoop, stopLoop]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
      stopLoop();
    }
  }, [stopLoop]);

  const togglePlay = useCallback(() => {
    const s = stateRef.current;
    if (s.isPlaying) {
      pause();
    } else if (s.currentTrack) {
      playTrack(s.currentTrack, s.trackIndex, s.tracks, {
        artistId: s.artistId,
        artistName: s.artistName,
        artistImageUrl: s.artistImageUrl,
      });
    }
  }, [pause, playTrack]);

  const seek = useCallback((fraction) => {
    if (audioRef.current && state.duration > 0) {
      const time = fraction * state.duration;
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, [state.duration]);

  const next = useCallback(() => {
    const s = stateRef.current;
    if (s.trackIndex === null) return;
    const nextIdx = s.trackIndex + 1;
    if (nextIdx < s.tracks.length && s.tracks[nextIdx]?.audioUrl) {
      playTrack(s.tracks[nextIdx], nextIdx, s.tracks, {
        artistId: s.artistId,
        artistName: s.artistName,
        artistImageUrl: s.artistImageUrl,
      });
    }
  }, [playTrack]);

  const prev = useCallback(() => {
    const s = stateRef.current;
    if (s.trackIndex === null) return;
    if (s.currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setState(prev => ({ ...prev, currentTime: 0 }));
      return;
    }
    const prevIdx = s.trackIndex - 1;
    if (prevIdx >= 0 && s.tracks[prevIdx]?.audioUrl) {
      playTrack(s.tracks[prevIdx], prevIdx, s.tracks, {
        artistId: s.artistId,
        artistName: s.artistName,
        artistImageUrl: s.artistImageUrl,
      });
    }
  }, [playTrack]);

  // Volume control
  const volumeRef = useRef(0.8);
  const [volume, setVolumeState] = useState(0.8);

  const setVolume = useCallback((val) => {
    const v = Math.max(0, Math.min(1, val));
    volumeRef.current = v;
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  // Cleanup on unmount (provider level — only when lesson exits)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      stopLoop();
    };
  }, [stopLoop]);

  const progress = state.duration > 0 ? state.currentTime / state.duration : 0;

  const value = {
    ...state,
    progress,
    volume,
    playTrack,
    pause,
    togglePlay,
    seek,
    setVolume,
    next,
    prev,
    hasAudio: state.currentTrack !== null,
  };

  return (
    <AudioCtx.Provider value={value}>
      {children}
    </AudioCtx.Provider>
  );
}

export default AudioCtx;
