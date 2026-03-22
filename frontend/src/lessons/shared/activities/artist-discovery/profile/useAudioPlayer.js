import { useState, useRef, useCallback, useEffect, useContext } from 'react';
import AudioCtx from '../AudioContext';

/**
 * Audio player hook. If a global AudioProvider is present (e.g., in Press Kit Designer),
 * routes all playback through the global context so audio persists across tab switches.
 * Otherwise, falls back to a local <audio> element (original behavior).
 *
 * All hooks are always called (React Rules of Hooks) — we just choose which results to return.
 */
const useAudioPlayer = (tracks = [], artistInfo = {}) => {
  const globalAudio = useContext(AudioCtx);

  // Always call local hooks (React requires consistent hook order)
  const local = useLocalAudio(tracks);

  // If global audio context is available, build global bridge (no hooks needed — just derives values)
  if (globalAudio) {
    const isOurTrack = globalAudio.currentTrack?.audioUrl &&
      tracks.some(t => t.audioUrl === globalAudio.currentTrack?.audioUrl);

    const playTrack = (index) => {
      const track = tracks[index];
      if (!track?.audioUrl) return;
      globalAudio.playTrack(track, index, tracks, {
        artistId: artistInfo.artistId || null,
        artistName: artistInfo.artistName || null,
        artistImageUrl: artistInfo.artistImageUrl || null,
      });
    };

    return {
      currentTrack: isOurTrack ? globalAudio.currentTrack : null,
      currentTrackIndex: isOurTrack ? globalAudio.trackIndex : null,
      isPlaying: isOurTrack ? globalAudio.isPlaying : false,
      currentTime: isOurTrack ? globalAudio.currentTime : 0,
      duration: isOurTrack ? globalAudio.duration : 0,
      progress: isOurTrack ? globalAudio.progress : 0,
      hasAudio: tracks.some(t => t.audioUrl),
      playTrack,
      pause: globalAudio.pause,
      togglePlay: globalAudio.togglePlay,
      seek: globalAudio.seek,
      next: globalAudio.next,
      prev: globalAudio.prev,
    };
  }

  // No global context — use local audio
  return local;
};

// ---------------------------------------------------------------------------
// Local audio — standalone behavior (no global context)
// ---------------------------------------------------------------------------

function useLocalAudio(tracks) {
  const audioRef = useRef(null);
  const animFrameRef = useRef(null);
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const startProgressLoop = useCallback(() => {
    const update = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
  }, []);

  const stopProgressLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const playTrack = useCallback((index) => {
    const track = tracks[index];
    if (!track?.audioUrl) return;

    if (currentTrackIndex === index && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      startProgressLoop();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      stopProgressLoop();
    }

    const audio = new Audio(track.audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      stopProgressLoop();
      const nextIndex = index + 1;
      if (nextIndex < tracks.length && tracks[nextIndex]?.audioUrl) {
        playTrack(nextIndex);
      } else if (tracks[0]?.audioUrl) {
        playTrack(0);
      }
    });

    audio.addEventListener('error', () => {
      setIsPlaying(false);
      stopProgressLoop();
    });

    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setDuration(0);
    audio.play().then(() => {
      setIsPlaying(true);
      startProgressLoop();
    }).catch(() => {
      setIsPlaying(false);
    });
  }, [tracks, currentTrackIndex, startProgressLoop, stopProgressLoop]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopProgressLoop();
    }
  }, [stopProgressLoop]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (currentTrackIndex !== null) {
      playTrack(currentTrackIndex);
    } else if (tracks.length > 0 && tracks[0]?.audioUrl) {
      playTrack(0);
    }
  }, [isPlaying, currentTrackIndex, tracks, pause, playTrack]);

  const seek = useCallback((fraction) => {
    if (audioRef.current && duration > 0) {
      const time = fraction * duration;
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [duration]);

  const next = useCallback(() => {
    if (currentTrackIndex === null) return;
    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < tracks.length && tracks[nextIndex]?.audioUrl) {
      playTrack(nextIndex);
    } else if (tracks[0]?.audioUrl) {
      playTrack(0);
    }
  }, [currentTrackIndex, tracks, playTrack]);

  const prev = useCallback(() => {
    if (currentTrackIndex === null) return;
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      return;
    }
    const prevIndex = currentTrackIndex - 1;
    if (prevIndex >= 0 && tracks[prevIndex]?.audioUrl) {
      playTrack(prevIndex);
    }
  }, [currentTrackIndex, currentTime, tracks, playTrack]);

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
  const progress = duration > 0 ? currentTime / duration : 0;
  const hasAudio = tracks.some(t => t.audioUrl);

  return {
    currentTrack,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    progress,
    hasAudio,
    playTrack,
    pause,
    togglePlay,
    seek,
    next,
    prev,
  };
}

export default useAudioPlayer;
