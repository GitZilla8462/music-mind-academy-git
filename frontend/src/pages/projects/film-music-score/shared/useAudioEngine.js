// shared/useAudioEngine.js - Web Audio API with AudioBuffer for Chromebook sync
// CHROMEBOOK OPTIMIZED: Debug logging removed for better performance
import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

// Project BPM - all loops should sync to this tempo
const PROJECT_BPM = 110;
const BEAT_DURATION = 60 / PROJECT_BPM; // ~0.545454 seconds per beat

// CHROMEBOOK MEMORY OPTIMIZATION: Limit cached audio buffers
// Each buffer can be 1-5MB depending on loop length
const MAX_CACHED_BUFFERS = 10;

// Track buffers that failed to decode (so we can show feedback to user)
// Key: baseId, Value: error message
const failedBuffersMap = new Map();

// Calculate playback rate to sync a loop to the project BPM
// This ensures all library loops play at exactly 110 BPM regardless of their original tempo
const calculatePlaybackRate = (actualDuration) => {
  // Quantize to nearest beat boundary to find expected duration
  const numBeats = Math.round(actualDuration / BEAT_DURATION);
  const expectedDuration = numBeats * BEAT_DURATION;

  // Calculate rate: if loop is too long, speed it up (rate > 1)
  // if loop is too short, slow it down (rate < 1)
  const rate = actualDuration / expectedDuration;

  // Only apply correction if it's a small adjustment (within 2%)
  // Larger differences might indicate a different time signature or intentional tempo
  if (rate > 0.98 && rate < 1.02) {
    return rate;
  }

  return 1.0; // No adjustment for loops that are significantly different
};

export const useAudioEngine = (videoDuration = 60) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  // AudioBuffer cache - keyed by BASE loop ID (e.g., "heroic-drums-1")
  const audioBuffersRef = useRef(new Map());

  // Track buffer usage order for LRU eviction (most recent at end)
  const bufferUsageOrderRef = useRef([]);

  // Active sources for cleanup
  const activeSourcesRef = useRef(new Set());

  // Legacy refs for compatibility
  const playersRef = useRef(new Map());
  const scheduledEventsRef = useRef([]);
  const rafRef = useRef(null);
  const lastSeekTimeRef = useRef(0);
  const SEEK_DEBOUNCE_MS = 100;
  const lastScheduleTimeRef = useRef(0);
  const SCHEDULE_DEBOUNCE_MS = 50;
  const previewSourceRef = useRef(null);
  const currentPreviewLoopIdRef = useRef(null);
  const previewRequestIdRef = useRef(0);
  const transportStoppedByStopRef = useRef(false);

  // Get the base loop ID from a placed loop ID
  const getBaseLoopId = (loopId) => {
    const parts = loopId.split('-');

    // Handle custom beats and custom melodies specially
    if (parts[0] === 'custom' && (parts[1] === 'beat' || parts[1] === 'melody')) {
      if (parts.length >= 3) {
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
      return loopId;
    }

    // Handle MMA saved beats and melodies
    if (parts[0] === 'mma' && parts[1] === 'saved' && (parts[2] === 'beat' || parts[2] === 'melody')) {
      if (parts.length >= 4) {
        return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}`;
      }
      return loopId;
    }

    // For regular loops, remove the timestamp suffix (last part if it's a long number)
    const lastPart = parts[parts.length - 1];
    if (/^\d{10,}$/.test(lastPart)) {
      return parts.slice(0, -1).join('-');
    }
    return loopId;
  };

  // Get IDs of buffers currently in use (placed on timeline)
  const getInUseBufferIds = useCallback(() => {
    const inUse = new Set();
    playersRef.current.forEach((player) => {
      if (player.baseId) {
        inUse.add(player.baseId);
      }
    });
    return inUse;
  }, []);

  // Mark a buffer as recently used and evict old ones if over limit
  const touchBuffer = useCallback((baseId) => {
    // Remove from current position and add to end (most recent)
    const index = bufferUsageOrderRef.current.indexOf(baseId);
    if (index > -1) {
      bufferUsageOrderRef.current.splice(index, 1);
    }
    bufferUsageOrderRef.current.push(baseId);

    // Evict old buffers if over limit
    while (audioBuffersRef.current.size > MAX_CACHED_BUFFERS) {
      const inUse = getInUseBufferIds();

      // Find oldest buffer that's not in use
      let evicted = false;
      for (const oldId of bufferUsageOrderRef.current) {
        if (!inUse.has(oldId)) {
          audioBuffersRef.current.delete(oldId);
          bufferUsageOrderRef.current = bufferUsageOrderRef.current.filter(id => id !== oldId);
          console.log(`🧹 Evicted audio buffer: ${oldId} (cache size: ${audioBuffersRef.current.size})`);
          evicted = true;
          break;
        }
      }

      // If all buffers are in use, stop trying to evict
      if (!evicted) {
        break;
      }
    }
  }, [getInUseBufferIds]);

  const initializeAudio = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      try {
        const startPromise = Tone.start();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Audio start timeout')), 500)
        );
        await Promise.race([startPromise, timeoutPromise]);
      } catch (err) {
        throw new Error('AudioContext requires user gesture to start');
      }
      if (Tone.context.state !== 'running') {
        throw new Error('AudioContext requires user gesture to start');
      }
    }

    Tone.Transport.loop = false;
    Tone.Transport.position = 0;

    Tone.Transport.on('stop', () => {
      if (transportStoppedByStopRef.current) {
        transportStoppedByStopRef.current = false;
      }
    });
  }, []);

  const clearScheduledEvents = useCallback(() => {
    // Stop all active AudioBufferSourceNodes
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (err) {
        // Already stopped
      }
    });
    activeSourcesRef.current.clear();

    // Clear scheduled events
    scheduledEventsRef.current.forEach(event => {
      if (event.type === 'transport') {
        try {
          Tone.Transport.clear(event.id);
        } catch (err) {}
      }
    });
    scheduledEventsRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeSourcesRef.current.forEach(source => {
        try {
          source.stop();
          source.disconnect();
        } catch (err) {}
      });
      activeSourcesRef.current.clear();
      audioBuffersRef.current.clear();
      bufferUsageOrderRef.current = []; // Clear usage tracking

      try {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      } catch (err) {}
    };
  }, []);

  // Get the raw native AudioContext (not Tone.js wrapped)
  const getRawContext = useCallback(() => {
    return Tone.context.rawContext || Tone.context._context || Tone.context;
  }, []);

  // Decode an audio file into an AudioBuffer
  const decodeAudioFile = useCallback(async (url, name) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const rawContext = getRawContext();
    const audioBuffer = await rawContext.decodeAudioData(arrayBuffer);

    return audioBuffer;
  }, [getRawContext]);

  const createLoopPlayer = useCallback(async (loopData, placedLoopId) => {
    const playerKey = placedLoopId || loopData.id;
    const baseId = getBaseLoopId(loopData.id);

    // Check if we already have this buffer cached
    if (audioBuffersRef.current.has(baseId)) {
      const buffer = audioBuffersRef.current.get(baseId);
      touchBuffer(baseId); // Mark as recently used

      const wrappedPlayer = {
        buffer,
        isBuffer: true,
        baseId,
        duration: buffer.duration
      };
      playersRef.current.set(playerKey, wrappedPlayer);
      return wrappedPlayer;
    }

    // Check if this buffer previously failed to decode
    if (failedBuffersMap.has(baseId)) {
      console.warn(`⚠️ Skipping ${loopData.name} - previously failed to decode`);
      return null;
    }

    // Decode the audio file
    try {
      const buffer = await decodeAudioFile(loopData.file, loopData.name);

      // Cache by base ID and mark as recently used
      audioBuffersRef.current.set(baseId, buffer);
      touchBuffer(baseId);

      const wrappedPlayer = {
        buffer,
        isBuffer: true,
        baseId,
        duration: buffer.duration
      };
      playersRef.current.set(playerKey, wrappedPlayer);

      return wrappedPlayer;
    } catch (error) {
      console.error(`Failed to decode ${loopData.name}:`, error);
      // Track this as a failed buffer so we can provide user feedback
      failedBuffersMap.set(baseId, error.message || 'Unable to decode audio');
      throw error;
    }
  }, [decodeAudioFile, touchBuffer]);

  const scheduleLoops = useCallback((placedLoops, duration, trackStates) => {
    const now = Date.now();
    const timeSinceLastSchedule = now - lastScheduleTimeRef.current;

    if (Tone.Transport.state !== 'started') {
      return;
    }

    // Debounce rapid re-scheduling (within 50ms) to prevent double-triggers
    if (timeSinceLastSchedule < SCHEDULE_DEBOUNCE_MS && activeSourcesRef.current.size > 0) {
      return;
    }
    lastScheduleTimeRef.current = now;

    clearScheduledEvents();

    const schedulingStartTime = Tone.Transport.seconds;
    const audioContext = getRawContext();

    placedLoops.forEach((loop) => {
      // Get the base ID for buffer lookup
      const baseId = getBaseLoopId(loop.id);

      // First try exact match, then try base ID
      let player = playersRef.current.get(loop.id);
      if (!player) {
        for (const [key, p] of playersRef.current.entries()) {
          if (getBaseLoopId(key) === baseId || p.baseId === baseId) {
            player = p;
            break;
          }
        }
      }

      // If still no player, try to get buffer directly
      if (!player && audioBuffersRef.current.has(baseId)) {
        const buffer = audioBuffersRef.current.get(baseId);
        player = { buffer, isBuffer: true, baseId };
      }

      if (!player || !player.buffer) {
        return;
      }

      // Check track state
      const trackId = `track-${loop.trackIndex}`;
      const trackState = trackStates[trackId];

      if (!trackState || trackState.muted) {
        return;
      }

      const trackVolume = trackState.volume ?? 0.7;
      const loopVolume = loop.volume ?? 1.0;
      const effectiveVolume = trackVolume * loopVolume;

      // Skip if loop ends before current time
      if (loop.endTime <= schedulingStartTime) {
        return;
      }

      // Calculate timing
      const loopOffset = loop.startOffset || 0;
      const bufferDuration = player.buffer.duration;

      // How far into the timeline are we relative to this loop's start?
      const timelineProgress = Math.max(0, schedulingStartTime - loop.startTime);

      // Calculate timeline duration of this loop placement
      const timelineDuration = loop.endTime - loop.startTime;

      // Determine if loop should repeat (stretched beyond audio duration)
      const shouldLoop = timelineDuration > bufferDuration * 1.05;

      // Calculate audio offset
      let audioOffset;
      if (shouldLoop && timelineProgress > 0) {
        audioOffset = loopOffset + (timelineProgress % bufferDuration);
      } else {
        audioOffset = loopOffset + timelineProgress;
      }

      // How much timeline remains for this loop
      const remainingTimeline = loop.endTime - Math.max(loop.startTime, schedulingStartTime);

      // Create AudioBufferSourceNode
      const source = audioContext.createBufferSource();
      source.buffer = player.buffer;

      // Apply tempo correction (skip for custom beats/melodies)
      if (loop.type !== 'custom-beat' && loop.type !== 'custom-melody') {
        source.playbackRate.value = calculatePlaybackRate(player.buffer.duration);
      } else {
        source.playbackRate.value = 1.0;
      }

      // Enable looping if stretched beyond audio duration
      if (shouldLoop) {
        source.loop = true;
        source.loopStart = loopOffset;
        source.loopEnd = bufferDuration;
      }

      // Create gain node for volume
      const gainNode = audioContext.createGain();
      gainNode.gain.value = effectiveVolume;

      // Connect: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Validate offset is within buffer bounds
      if (audioOffset >= bufferDuration || remainingTimeline <= 0) {
        return;
      }

      // Calculate when to start
      const transportTime = Math.max(0, loop.startTime - schedulingStartTime);
      const startWhen = transportTime <= 0.01 ? 0 : audioContext.currentTime + transportTime;

      try {
        source.start(startWhen, audioOffset, remainingTimeline);
        activeSourcesRef.current.add(source);

        source.onended = () => {
          activeSourcesRef.current.delete(source);
          source.disconnect();
          gainNode.disconnect();
        };
      } catch (err) {
        console.error('Failed to start audio source:', err);
      }
    });
  }, [clearScheduledEvents, getRawContext]);

  // Stop any active preview
  const stopPreview = useCallback(() => {
    previewRequestIdRef.current += 1;

    if (previewSourceRef.current) {
      try {
        previewSourceRef.current.source.stop();
        previewSourceRef.current.source.disconnect();
        previewSourceRef.current.gainNode.disconnect();
      } catch (err) {}
      previewSourceRef.current = null;
      currentPreviewLoopIdRef.current = null;
    }
  }, []);

  const play = useCallback(async () => {
    stopPreview();

    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }

    setIsPlaying(true);
  }, [stopPreview]);

  const pause = useCallback(() => {
    Tone.Transport.pause();
    setIsPlaying(false);
    clearScheduledEvents();
    stopPreview();
  }, [clearScheduledEvents, stopPreview]);

  const stop = useCallback(() => {
    transportStoppedByStopRef.current = true;
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    stopPreview();
    setIsPlaying(false);
    setCurrentTime(0);
    clearScheduledEvents();
  }, [clearScheduledEvents, stopPreview]);

  const seek = useCallback((time) => {
    const now = Date.now();
    if (now - lastSeekTimeRef.current < SEEK_DEBOUNCE_MS) {
      return;
    }
    lastSeekTimeRef.current = now;

    const wasPlaying = Tone.Transport.state === 'started';

    if (wasPlaying) {
      Tone.Transport.pause();
    }

    clearScheduledEvents();
    Tone.Transport.seconds = time;
    setCurrentTime(time);

    if (wasPlaying) {
      setTimeout(() => {
        Tone.Transport.start();
      }, 50);
    }
  }, [clearScheduledEvents]);

  const setMasterVolume = useCallback((vol) => {
    setVolume(vol);
    Tone.Destination.volume.value = Tone.gainToDb(vol);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      Tone.Destination.mute = newMuted;
      return newMuted;
    });
  }, []);

  // Preview a single loop
  const previewLoop = useCallback(async (loopData, onEnded = null) => {
    previewRequestIdRef.current += 1;
    const thisRequestId = previewRequestIdRef.current;

    const isSameLoop = currentPreviewLoopIdRef.current === loopData.id;

    // Stop any current preview
    if (previewSourceRef.current) {
      try {
        previewSourceRef.current.source.stop();
        previewSourceRef.current.source.disconnect();
        previewSourceRef.current.gainNode.disconnect();
      } catch (err) {}
      previewSourceRef.current = null;
      currentPreviewLoopIdRef.current = null;

      if (isSameLoop) {
        if (onEnded) onEnded(loopData);
        return;
      }
    }

    try {
      // Get or create buffer
      const baseId = getBaseLoopId(loopData.id);

      // CHROMEBOOK FIX: Check if this buffer previously failed to decode
      if (failedBuffersMap.has(baseId)) {
        const errorMsg = failedBuffersMap.get(baseId);
        throw new Error(`This loop failed to load on your device: ${errorMsg}`);
      }

      let buffer = audioBuffersRef.current.get(baseId);

      if (!buffer) {
        buffer = await decodeAudioFile(loopData.file, loopData.name);
        audioBuffersRef.current.set(baseId, buffer);
      }

      // Mark as recently used (triggers eviction of old buffers if needed)
      touchBuffer(baseId);

      // Check if this request is still current
      if (thisRequestId !== previewRequestIdRef.current) {
        return;
      }

      const rawContext = getRawContext();

      // CHROMEBOOK FIX: Resume AudioContext if suspended (browser autoplay policy)
      // This can happen after tab visibility change or period of inactivity
      if (rawContext.state === 'suspended') {
        await rawContext.resume();
      }

      const source = rawContext.createBufferSource();
      source.buffer = buffer;

      // Apply tempo correction (skip for custom beats/melodies)
      if (loopData.type !== 'custom-beat' && loopData.type !== 'custom-melody') {
        source.playbackRate.value = calculatePlaybackRate(buffer.duration);
      } else {
        source.playbackRate.value = 1.0;
      }

      const gainNode = rawContext.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(rawContext.destination);

      previewSourceRef.current = { source, gainNode };
      currentPreviewLoopIdRef.current = loopData.id;

      source.onended = () => {
        if (currentPreviewLoopIdRef.current === loopData.id) {
          previewSourceRef.current = null;
          currentPreviewLoopIdRef.current = null;
        }
        if (onEnded) onEnded(loopData);
      };

      source.start(0);
    } catch (error) {
      console.error('Preview error:', error);
      currentPreviewLoopIdRef.current = null;
      throw error;
    }
  }, [decodeAudioFile, volume, getRawContext, touchBuffer]);

  // Time update loop
  useEffect(() => {
    const updateTime = () => {
      if (Tone.Transport.state === 'started') {
        const newTime = Tone.Transport.seconds;
        setCurrentTime(newTime);

        if (videoDuration && videoDuration > 0 && newTime >= videoDuration) {
          Tone.Transport.stop();
          Tone.Transport.position = 0;
          setIsPlaying(false);
          setCurrentTime(0);
          clearScheduledEvents();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(updateTime);
    };

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, videoDuration, clearScheduledEvents]);

  // Helper to check if a loop failed to decode (for UI feedback)
  const isLoopDecodeFailed = useCallback((loopId) => {
    const baseId = getBaseLoopId(loopId);
    return failedBuffersMap.has(baseId);
  }, []);

  // Get the error message for a failed loop
  const getLoopDecodeError = useCallback((loopId) => {
    const baseId = getBaseLoopId(loopId);
    return failedBuffersMap.get(baseId) || null;
  }, []);

  return {
    isPlaying,
    currentTime,
    volume,
    isMuted,
    play,
    pause,
    stop,
    seek,
    setMasterVolume,
    toggleMute,
    previewLoop,
    stopPreview,
    createLoopPlayer,
    scheduleLoops,
    initializeAudio,
    playersRef,
    // CHROMEBOOK: Helpers to check for failed audio decodes
    isLoopDecodeFailed,
    getLoopDecodeError
  };
};
