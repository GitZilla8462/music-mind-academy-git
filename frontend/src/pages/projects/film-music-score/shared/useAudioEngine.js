// shared/useAudioEngine.js - Web Audio API with AudioBuffer for Chromebook sync
// DEBUG VERSION with extensive logging
import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

// Project BPM - all loops should sync to this tempo
const PROJECT_BPM = 110;
const BEAT_DURATION = 60 / PROJECT_BPM; // ~0.545454 seconds per beat

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
  const previewRequestIdRef = useRef(0);  // Track preview request to handle race conditions
  const transportStoppedByStopRef = useRef(false);

  // Get the base loop ID from a placed loop ID
  // e.g., "heroic-drums-1-1767032095368" -> "heroic-drums-1"
  // For custom beats/melodies, preserve the creation timestamp as it's the unique ID:
  // e.g., "custom-beat-1767483773613" -> "custom-beat-1767483773613" (not "custom-beat"!)
  // e.g., "custom-beat-1767483773613-1767483778054" (placed) -> "custom-beat-1767483773613"
  const getBaseLoopId = (loopId) => {
    const parts = loopId.split('-');

    // Handle custom beats and custom melodies specially
    // Format: custom-beat-<timestamp> or custom-beat-<timestamp>-<timestamp2>
    // We need to preserve the first timestamp as it's the unique identifier
    if (parts[0] === 'custom' && (parts[1] === 'beat' || parts[1] === 'melody')) {
      // Always return first 3 parts: custom-beat-<timestamp> or custom-melody-<timestamp>
      if (parts.length >= 3) {
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
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

  const initializeAudio = useCallback(async () => {
    console.log('🎵 initializeAudio called, context state:', Tone.context.state);
    if (Tone.context.state !== 'running') {
      try {
        // Tone.start() can hang forever if autoplay is blocked
        // Use a timeout to detect this and fail fast
        const startPromise = Tone.start();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Audio start timeout')), 500)
        );
        await Promise.race([startPromise, timeoutPromise]);
      } catch (err) {
        console.log('❌ Tone.start() failed:', err.message);
        throw new Error('AudioContext requires user gesture to start');
      }
      // Check if it actually started - Tone.start() can fail silently on some browsers
      if (Tone.context.state !== 'running') {
        console.log('❌ Audio context failed to start, state:', Tone.context.state);
        throw new Error('AudioContext requires user gesture to start');
      }
      console.log('✅ Audio context started, state:', Tone.context.state);
    } else {
      console.log('✅ Audio context already running');
    }

    Tone.Transport.loop = false;
    Tone.Transport.position = 0;

    Tone.Transport.on('stop', () => {
      console.log('🛑 Transport stopped event');
      if (transportStoppedByStopRef.current) {
        transportStoppedByStopRef.current = false;
      }
    });
  }, []);

  const clearScheduledEvents = useCallback(() => {
    console.log('🧹 clearScheduledEvents called');

    // Stop all active AudioBufferSourceNodes
    console.log(`   Stopping ${activeSourcesRef.current.size} active sources`);
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
      console.log('🛑 useAudioEngine unmounting');
      activeSourcesRef.current.forEach(source => {
        try {
          source.stop();
          source.disconnect();
        } catch (err) {}
      });
      activeSourcesRef.current.clear();
      audioBuffersRef.current.clear();

      try {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      } catch (err) {}
    };
  }, []);

  // Get the raw native AudioContext (not Tone.js wrapped)
  const getRawContext = useCallback(() => {
    // Tone.context.rawContext gives us the native AudioContext
    return Tone.context.rawContext || Tone.context._context || Tone.context;
  }, []);

  // Decode an audio file into an AudioBuffer
  const decodeAudioFile = useCallback(async (url, name) => {
    console.log(`🎵 Decoding: ${name} from ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const rawContext = getRawContext();
    const audioBuffer = await rawContext.decodeAudioData(arrayBuffer);

    console.log(`✅ Decoded ${name}: ${audioBuffer.duration.toFixed(2)}s, ${audioBuffer.numberOfChannels}ch, ${audioBuffer.sampleRate}Hz`);
    return audioBuffer;
  }, [getRawContext]);

  const createLoopPlayer = useCallback(async (loopData, placedLoopId) => {
    const playerKey = placedLoopId || loopData.id;
    const baseId = getBaseLoopId(loopData.id);

    console.log(`🎵 createLoopPlayer: ${loopData.name}`);
    console.log(`   playerKey: ${playerKey}`);
    console.log(`   baseId: ${baseId}`);
    console.log(`   file: ${loopData.file}`);

    // Check if we already have this buffer cached
    if (audioBuffersRef.current.has(baseId)) {
      console.log(`   ✓ Buffer already cached for ${baseId}`);
      const buffer = audioBuffersRef.current.get(baseId);

      const wrappedPlayer = {
        buffer,
        isBuffer: true,
        baseId,
        duration: buffer.duration
      };
      playersRef.current.set(playerKey, wrappedPlayer);
      return wrappedPlayer;
    }

    // Decode the audio file
    try {
      const buffer = await decodeAudioFile(loopData.file, loopData.name);

      // Cache by base ID
      audioBuffersRef.current.set(baseId, buffer);
      console.log(`   ✅ Cached buffer for ${baseId}`);

      const wrappedPlayer = {
        buffer,
        isBuffer: true,
        baseId,
        duration: buffer.duration
      };
      playersRef.current.set(playerKey, wrappedPlayer);

      return wrappedPlayer;
    } catch (error) {
      console.error(`❌ Failed to decode ${loopData.name}:`, error);
      throw error;
    }
  }, [decodeAudioFile]);

  const scheduleLoops = useCallback((placedLoops, duration, trackStates) => {
    const now = Date.now();
    const timeSinceLastSchedule = now - lastScheduleTimeRef.current;

    console.log('\n========================================');
    console.log('🎬 SCHEDULE LOOPS CALLED');
    console.log('========================================');
    console.log(`   Total loops: ${placedLoops.length}`);
    console.log(`   Transport state: ${Tone.Transport.state}`);
    console.log(`   Transport time: ${Tone.Transport.seconds.toFixed(3)}s`);
    console.log(`   AudioContext time: ${Tone.context.currentTime.toFixed(3)}s`);
    console.log(`   AudioContext state: ${Tone.context.state}`);
    console.log(`   Time since last schedule: ${timeSinceLastSchedule}ms`);

    if (Tone.Transport.state !== 'started') {
      console.log('⏸️ Transport not started - skipping scheduling');
      return;
    }

    // Debounce rapid re-scheduling (within 50ms) to prevent double-triggers
    if (timeSinceLastSchedule < SCHEDULE_DEBOUNCE_MS && activeSourcesRef.current.size > 0) {
      console.log(`⏳ Debouncing schedule - ${activeSourcesRef.current.size} sources already active`);
      return;
    }
    lastScheduleTimeRef.current = now;

    clearScheduledEvents();

    const schedulingStartTime = Tone.Transport.seconds;
    const audioContext = getRawContext();
    let scheduledCount = 0;

    placedLoops.forEach((loop, index) => {
      console.log(`\n--- Loop ${index + 1}/${placedLoops.length}: ${loop.name} ---`);
      console.log(`   loop.id: ${loop.id}`);
      console.log(`   startTime: ${loop.startTime}, endTime: ${loop.endTime}`);
      console.log(`   duration: ${loop.duration}`);
      console.log(`   trackIndex: ${loop.trackIndex}`);

      // Get the base ID for buffer lookup
      const baseId = getBaseLoopId(loop.id);
      console.log(`   baseId: ${baseId}`);

      // First try exact match, then try base ID
      let player = playersRef.current.get(loop.id);
      if (!player) {
        // Try to find any player with this base ID
        for (const [key, p] of playersRef.current.entries()) {
          if (getBaseLoopId(key) === baseId || p.baseId === baseId) {
            player = p;
            console.log(`   Found player via baseId match: ${key}`);
            break;
          }
        }
      }

      // If still no player, try to get buffer directly
      if (!player && audioBuffersRef.current.has(baseId)) {
        const buffer = audioBuffersRef.current.get(baseId);
        player = { buffer, isBuffer: true, baseId };
        console.log(`   Created player from cached buffer`);
      }

      if (!player || !player.buffer) {
        console.warn(`   ⚠️ NO PLAYER/BUFFER for ${loop.name}`);
        console.log(`   Available players:`, [...playersRef.current.keys()]);
        console.log(`   Available buffers:`, [...audioBuffersRef.current.keys()]);
        return;
      }

      console.log(`   ✓ Found buffer: ${player.buffer.duration.toFixed(2)}s`);

      // Check track state
      const trackId = `track-${loop.trackIndex}`;
      const trackState = trackStates[trackId];

      if (!trackState) {
        console.warn(`   ⚠️ No track state for ${trackId}`);
        return;
      }

      if (trackState.muted) {
        console.log(`   🔇 Track muted - skipping`);
        return;
      }

      const trackVolume = trackState.volume ?? 0.7;
      const loopVolume = loop.volume ?? 1.0;
      const effectiveVolume = trackVolume * loopVolume;
      console.log(`   Volume: track=${trackVolume}, loop=${loopVolume}, effective=${effectiveVolume}`);

      // Skip if loop ends before current time
      if (loop.endTime <= schedulingStartTime) {
        console.log(`   ⏭️ Loop ends before current time - skipping`);
        return;
      }

      // Calculate timing
      const loopOffset = loop.startOffset || 0;
      const transportTime = Math.max(0, loop.startTime - schedulingStartTime);
      const bufferDuration = player.buffer.duration;

      // How far into the timeline are we relative to this loop's start?
      const timelineProgress = Math.max(0, schedulingStartTime - loop.startTime);

      // Calculate timeline duration of this loop placement
      const timelineDuration = loop.endTime - loop.startTime;

      // Determine if loop should repeat (stretched beyond audio duration)
      const shouldLoop = timelineDuration > bufferDuration * 1.05; // 5% tolerance

      // Calculate audio offset - if looping, use modulo to find position within loop cycle
      let audioOffset;
      if (shouldLoop && timelineProgress > 0) {
        // Find position within the current loop iteration
        audioOffset = loopOffset + (timelineProgress % bufferDuration);
        console.log(`   🔁 LOOPING: timeline=${timelineDuration.toFixed(1)}s, buffer=${bufferDuration.toFixed(1)}s, iteration=${Math.floor(timelineProgress / bufferDuration)}`);
      } else {
        // Normal - direct 1:1 mapping
        audioOffset = loopOffset + timelineProgress;
      }

      // How much timeline remains for this loop
      const remainingTimeline = loop.endTime - Math.max(loop.startTime, schedulingStartTime);

      console.log(`   Timing: transportTime=${transportTime.toFixed(3)}s, audioOffset=${audioOffset.toFixed(3)}s, remainingTimeline=${remainingTimeline.toFixed(3)}s, bufferDur=${bufferDuration.toFixed(3)}s, shouldLoop=${shouldLoop}`);

      // Create AudioBufferSourceNode
      const source = audioContext.createBufferSource();
      source.buffer = player.buffer;

      // Apply tempo correction to sync loops to project BPM (110 BPM)
      // SKIP for custom beats - they should play at their original BPM (the tempo the user created them at)
      // Custom beats already have their BPM baked in from Beat Maker (e.g., 70 BPM for Hype mood)
      let playbackRate = 1.0;
      if (loop.type !== 'custom-beat' && loop.type !== 'custom-melody') {
        playbackRate = calculatePlaybackRate(player.buffer.duration);
        source.playbackRate.value = playbackRate;
        if (playbackRate !== 1.0) {
          console.log(`   ⏱️ Tempo correction: ${loop.name} playbackRate=${playbackRate.toFixed(4)} (${((playbackRate - 1) * 100).toFixed(2)}% adjustment)`);
        }
      } else {
        source.playbackRate.value = 1.0;
        console.log(`   ⏭️ Skipping tempo correction for custom ${loop.type}: plays at original BPM`);
      }

      // Enable looping if the loop is stretched beyond audio duration
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
      if (audioOffset >= bufferDuration) {
        console.log(`   ⏭️ Audio offset ${audioOffset.toFixed(3)}s >= buffer ${bufferDuration.toFixed(3)}s - skipping`);
        return;
      }

      if (remainingTimeline <= 0) {
        console.log(`   ⏭️ No timeline remaining - skipping`);
        return;
      }

      // Calculate when to start
      const now = audioContext.currentTime;
      let startWhen;

      if (transportTime <= 0.01) {
        // Start immediately
        startWhen = 0;
        console.log(`   🎵 START NOW (audioOffset=${audioOffset.toFixed(3)}s, duration=${remainingTimeline.toFixed(3)}s, looping=${shouldLoop})`);
      } else {
        // Start in the future
        startWhen = now + transportTime;
        console.log(`   🎵 START at ${startWhen.toFixed(3)}s (${transportTime.toFixed(3)}s from now), audioOffset=${audioOffset.toFixed(3)}s, looping=${shouldLoop}`);
      }

      try {
        // Duration parameter stops the source after remainingTimeline seconds
        source.start(startWhen, audioOffset, remainingTimeline);
        activeSourcesRef.current.add(source);

        source.onended = () => {
          activeSourcesRef.current.delete(source);
          source.disconnect();
          gainNode.disconnect();
        };

        scheduledCount++;
        console.log(`   ✅ SCHEDULED! Total: ${scheduledCount}`);
      } catch (err) {
        console.error(`   ❌ Failed to start source:`, err);
      }
    });

    console.log('\n========================================');
    console.log(`✅ SCHEDULING COMPLETE: ${scheduledCount} sources started`);
    console.log('========================================\n');
  }, [clearScheduledEvents, getRawContext]);

  // Stop any active preview
  const stopPreview = useCallback(() => {
    // Increment request ID to invalidate any pending decode operations
    previewRequestIdRef.current += 1;

    if (previewSourceRef.current) {
      console.log('🔇 Stopping preview');
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
    console.log('▶️ PLAY called');
    console.log(`   Transport state: ${Tone.Transport.state}`);
    console.log(`   Transport time: ${Tone.Transport.seconds.toFixed(3)}s`);

    stopPreview();  // Stop any loop preview when timeline starts

    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
      console.log('   ✅ Transport started');
    }

    setIsPlaying(true);
  }, [stopPreview]);

  const pause = useCallback(() => {
    console.log('⏸️ PAUSE called');
    Tone.Transport.pause();
    setIsPlaying(false);
    clearScheduledEvents();
    stopPreview();  // Also stop any loop preview
  }, [clearScheduledEvents, stopPreview]);

  const stop = useCallback(() => {
    console.log('⏹️ STOP called');
    transportStoppedByStopRef.current = true;
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    stopPreview();  // Also stop any loop preview
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

    console.log(`⏩ SEEK to ${time.toFixed(2)}s`);

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
    console.log('🎧 PREVIEW LOOP:', loopData.name);

    // Increment request ID to invalidate any pending decode operations
    previewRequestIdRef.current += 1;
    const thisRequestId = previewRequestIdRef.current;

    const isSameLoop = currentPreviewLoopIdRef.current === loopData.id;

    // Stop any current preview
    if (previewSourceRef.current) {
      console.log('   Stopping previous preview');
      try {
        previewSourceRef.current.source.stop();
        previewSourceRef.current.source.disconnect();
        previewSourceRef.current.gainNode.disconnect();
      } catch (err) {}
      previewSourceRef.current = null;
      currentPreviewLoopIdRef.current = null;

      if (isSameLoop) {
        console.log('   Same loop - toggle off');
        if (onEnded) onEnded(loopData);
        return;
      }
    }

    try {
      // Get or create buffer
      const baseId = getBaseLoopId(loopData.id);
      let buffer = audioBuffersRef.current.get(baseId);

      if (!buffer) {
        console.log('   Decoding buffer for preview...');
        buffer = await decodeAudioFile(loopData.file, loopData.name);
        audioBuffersRef.current.set(baseId, buffer);
      }

      // Check if this request is still current (another preview may have been requested during decode)
      if (thisRequestId !== previewRequestIdRef.current) {
        console.log('   ⏭️ Stale preview request - ignoring (request', thisRequestId, 'vs current', previewRequestIdRef.current, ')');
        return;
      }

      const rawContext = getRawContext();
      const source = rawContext.createBufferSource();
      source.buffer = buffer;

      // Apply tempo correction to sync preview to project BPM (110 BPM)
      // SKIP for custom beats - they should play at their original BPM
      let playbackRate = 1.0;
      if (loopData.type !== 'custom-beat' && loopData.type !== 'custom-melody') {
        playbackRate = calculatePlaybackRate(buffer.duration);
        source.playbackRate.value = playbackRate;
        if (playbackRate !== 1.0) {
          console.log(`   ⏱️ Preview tempo correction: playbackRate=${playbackRate.toFixed(4)}`);
        }
      } else {
        source.playbackRate.value = 1.0;
        console.log(`   ⏭️ Skipping preview tempo correction for custom ${loopData.type}`);
      }

      const gainNode = rawContext.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(rawContext.destination);

      previewSourceRef.current = { source, gainNode };
      currentPreviewLoopIdRef.current = loopData.id;

      source.onended = () => {
        console.log('   Preview ended:', loopData.name);
        // Only clear ref if this source is still the current one
        // (prevents old stopped sources from clearing the new source's ref)
        if (currentPreviewLoopIdRef.current === loopData.id) {
          previewSourceRef.current = null;
          currentPreviewLoopIdRef.current = null;
        }
        if (onEnded) onEnded(loopData);
      };

      source.start(0);
      console.log('   ✅ Preview started');
    } catch (error) {
      console.error('   ❌ Preview error:', error);
      currentPreviewLoopIdRef.current = null;
      throw error;
    }
  }, [decodeAudioFile, volume, getRawContext]);

  // Time update loop
  useEffect(() => {
    const updateTime = () => {
      if (Tone.Transport.state === 'started') {
        const newTime = Tone.Transport.seconds;
        setCurrentTime(newTime);

        if (videoDuration && videoDuration > 0 && newTime >= videoDuration) {
          console.log('🎬 Reached end of video');
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
    playersRef
  };
};
