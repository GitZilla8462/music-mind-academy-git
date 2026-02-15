// Audio sync + section tracking + scroll speed
// isPlaying is driven by audio element events (playing/pause) so it always
// matches actual browser state — prevents sprite-moves-but-no-audio desync.

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { getTempoById } from '../characterAnimations';

const useJourneyPlayback = (audioSrc, totalDuration, sections, volume = 1.0) => {
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ref so rAF loop always sees latest value without recreating closures
  const totalDurationRef = useRef(totalDuration);
  totalDurationRef.current = totalDuration;

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audio.src = audioSrc;

    audio.addEventListener('canplaythrough', () => setIsLoaded(true));
    audio.addEventListener('error', () => setIsLoaded(true));

    // ── rAF loop — started/stopped by audio events ──────────────────
    const startLoop = () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      const loop = () => {
        if (audio.paused) return; // event handler will sync state
        const time = Math.min(audio.currentTime, totalDurationRef.current);
        setCurrentTime(time);
        if (time >= totalDurationRef.current) {
          audio.pause();
          audio.currentTime = 0;
          setCurrentTime(0);
          return;
        }
        animationRef.current = requestAnimationFrame(loop);
      };
      animationRef.current = requestAnimationFrame(loop);
    };

    // ── Audio-element events drive isPlaying ─────────────────────────
    audio.addEventListener('playing', () => {
      setIsPlaying(true);
      startLoop();
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    });

    // When audio stalls (buffering after seek), stop sprite too
    audio.addEventListener('waiting', () => {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [audioSrc]);

  // ── Controls ─────────────────────────────────────────────────────
  const play = useCallback(() => {
    if (audioRef.current) {
      setIsPlaying(true); // respond instantly — audio 'pause' event corrects if play fails
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seekTo = useCallback((time) => {
    const clamped = Math.max(0, Math.min(time, totalDuration));
    if (audioRef.current) audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  }, [totalDuration]);

  const rewind = useCallback(() => {
    pause();
    seekTo(0);
  }, [pause, seekTo]);

  const togglePlay = useCallback(() => isPlaying ? pause() : play(), [isPlaying, play, pause]);

  // Derive current section from playback position
  const currentSectionIndex = useMemo(() => {
    const idx = sections.findIndex(s => currentTime >= s.startTime && currentTime < s.endTime);
    return idx !== -1 ? idx : 0;
  }, [currentTime, sections]);

  const currentSection = sections[currentSectionIndex] || sections[0];

  // Scroll speed — tempo only (movement affects character animation, not parallax)
  const scrollSpeed = useMemo(() => {
    if (!currentSection) return 1.0;
    return getTempoById(currentSection.tempo).speed;
  }, [currentSection]);

  return {
    isPlaying,
    currentTime,
    isLoaded,
    currentSectionIndex,
    currentSection,
    scrollSpeed,
    play,
    pause,
    seekTo,
    rewind,
    togglePlay
  };
};

export default useJourneyPlayback;
