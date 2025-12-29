// shared/useAudioEngine.js - Web Audio API with AudioBuffer for Chromebook sync
// DEBUG VERSION with extensive logging
import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

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
  const previewSourceRef = useRef(null);
  const currentPreviewLoopIdRef = useRef(null);
  const transportStoppedByStopRef = useRef(false);

  // Get the base loop ID from a placed loop ID
  // e.g., "heroic-drums-1-1767032095368" -> "heroic-drums-1"
  const getBaseLoopId = (loopId) => {
    // Remove the timestamp suffix (last part after the last hyphen if it's a number)
    const parts = loopId.split('-');
    const lastPart = parts[parts.length - 1];
    if (/^\d{10,}$/.test(lastPart)) {
      return parts.slice(0, -1).join('-');
    }
    return loopId;
  };

  const initializeAudio = useCallback(async () => {
    console.log('🎵 initializeAudio called');
    if (Tone.context.state !== 'running') {
      await Tone.start();
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
    console.log('\n========================================');
    console.log('🎬 SCHEDULE LOOPS CALLED');
    console.log('========================================');
    console.log(`   Total loops: ${placedLoops.length}`);
    console.log(`   Transport state: ${Tone.Transport.state}`);
    console.log(`   Transport time: ${Tone.Transport.seconds.toFixed(3)}s`);
    console.log(`   AudioContext time: ${Tone.context.currentTime.toFixed(3)}s`);
    console.log(`   AudioContext state: ${Tone.context.state}`);

    clearScheduledEvents();

    if (Tone.Transport.state !== 'started') {
      console.log('⏸️ Transport not started - skipping scheduling');
      return;
    }

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
      const actualDuration = loop.endTime - Math.max(loop.startTime, schedulingStartTime);

      console.log(`   Timing: transportTime=${transportTime.toFixed(3)}s, offset=${loopOffset.toFixed(3)}s, duration=${actualDuration.toFixed(3)}s`);

      // Create AudioBufferSourceNode
      const source = audioContext.createBufferSource();
      source.buffer = player.buffer;

      // Create gain node for volume
      const gainNode = audioContext.createGain();
      gainNode.gain.value = effectiveVolume;

      // Connect: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Calculate when to start
      const now = audioContext.currentTime;
      let startWhen;
      let startOffset = loopOffset;

      if (transportTime <= 0.01) {
        // Start immediately
        startWhen = 0;
        // If we're starting mid-timeline, adjust offset
        if (schedulingStartTime > loop.startTime) {
          startOffset = loopOffset + (schedulingStartTime - loop.startTime);
        }
        console.log(`   🎵 START NOW (offset=${startOffset.toFixed(3)}s)`);
      } else {
        // Start in the future
        startWhen = now + transportTime;
        console.log(`   🎵 START at ${startWhen.toFixed(3)}s (${transportTime.toFixed(3)}s from now)`);
      }

      try {
        source.start(startWhen, startOffset, actualDuration);
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

  const play = useCallback(async () => {
    console.log('▶️ PLAY called');
    console.log(`   Transport state: ${Tone.Transport.state}`);
    console.log(`   Transport time: ${Tone.Transport.seconds.toFixed(3)}s`);

    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
      console.log('   ✅ Transport started');
    }

    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    console.log('⏸️ PAUSE called');
    Tone.Transport.pause();
    setIsPlaying(false);
    clearScheduledEvents();
  }, [clearScheduledEvents]);

  const stop = useCallback(() => {
    console.log('⏹️ STOP called');
    transportStoppedByStopRef.current = true;
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    clearScheduledEvents();
  }, [clearScheduledEvents]);

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

      const rawContext = getRawContext();
      const source = rawContext.createBufferSource();
      source.buffer = buffer;

      const gainNode = rawContext.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(rawContext.destination);

      previewSourceRef.current = { source, gainNode };
      currentPreviewLoopIdRef.current = loopData.id;

      source.onended = () => {
        console.log('   Preview ended:', loopData.name);
        previewSourceRef.current = null;
        currentPreviewLoopIdRef.current = null;
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
    createLoopPlayer,
    scheduleLoops,
    initializeAudio,
    playersRef
  };
};
