// shared/useAudioEngine.js - Web Audio API AudioBuffer approach for sample-accurate sync
// ✅ FIX: Uses AudioBufferSourceNode.start() for precise timing on Chromebooks
import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

export const useAudioEngine = (videoDuration = 60) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const audioBuffersRef = useRef(new Map()); // Stores decoded AudioBuffers
  const activeSourcesRef = useRef(new Set()); // Track active AudioBufferSourceNodes
  const playersRef = useRef(new Map()); // Keep for Tone.js players (non-MP3)
  const scheduledEventsRef = useRef([]);
  const rafRef = useRef(null);
  const lastSeekTimeRef = useRef(0);
  const SEEK_DEBOUNCE_MS = 100;
  const previewPlayerRef = useRef(null);
  const currentPreviewLoopIdRef = useRef(null);
  const transportStoppedByStopRef = useRef(false);
  const gainNodeRef = useRef(null); // Master gain node for volume control

  const initializeAudio = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      console.log('Audio context initialized');
    }

    // Create master gain node if not exists (connects to Tone.js destination)
    if (!gainNodeRef.current) {
      gainNodeRef.current = Tone.context.createGain();
      gainNodeRef.current.connect(Tone.context.destination);
      gainNodeRef.current.gain.value = volume;
      console.log('✅ Master gain node created');
    }

    Tone.Transport.loop = false;
    Tone.Transport.position = 0;

    Tone.Transport.on('stop', () => {
      console.log('🛑 Transport stopped event');

      if (transportStoppedByStopRef.current) {
        console.log('  ⏳ Stop was called by user - cleaning up');
        transportStoppedByStopRef.current = false;
        return;
      }

      console.log('  ⏳ Natural end of Transport - not seeking to 0');
    });
  }, [volume]);

  const clearScheduledEvents = useCallback(() => {
    // Clear all scheduled Tone.js transport events
    scheduledEventsRef.current.forEach(event => {
      if (event.type === 'transport') {
        try {
          Tone.Transport.clear(event.id);
        } catch (err) {
          console.error('Error clearing transport event:', err);
        }
      }
    });
    scheduledEventsRef.current = [];

    // Stop all active AudioBufferSourceNodes
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (err) {
        // Source may already be stopped - ignore
      }
    });
    activeSourcesRef.current.clear();

    // Stop Tone.js players (non-MP3 files)
    playersRef.current.forEach((player) => {
      try {
        if (!player.isBuffer) {
          player.stop();
        }
      } catch (err) {
        console.error('Error stopping Tone.js player:', err);
      }
    });
  }, []);

  // 🛑 CLEANUP: Stop all audio when hook unmounts
  useEffect(() => {
    return () => {
      console.log('🛑 useAudioEngine unmounting - cleaning up all audio');

      // Clear all scheduled transport events
      scheduledEventsRef.current.forEach(event => {
        if (event.type === 'transport') {
          try {
            Tone.Transport.clear(event.id);
          } catch (err) { /* ignore */ }
        }
      });

      // Stop all active AudioBufferSourceNodes
      activeSourcesRef.current.forEach(source => {
        try {
          source.stop();
          source.disconnect();
        } catch (err) { /* ignore */ }
      });
      activeSourcesRef.current.clear();

      // Stop Transport
      try {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      } catch (err) { /* ignore */ }

      // Stop all Tone.js players
      playersRef.current.forEach((player) => {
        try {
          if (!player.isBuffer) {
            player.stop();
          }
        } catch (err) { /* ignore */ }
      });
      playersRef.current.clear();

      // Clear audio buffers
      audioBuffersRef.current.clear();
    };
  }, []);

  const createLoopPlayer = useCallback(async (loopData, placedLoopId) => {
    try {
      const playerKey = placedLoopId || loopData.id;
      console.log(`Creating player for: ${loopData.name} with key: ${playerKey}`);

      // Check if we already have the AudioBuffer cached (use loopData.id for buffer cache)
      const bufferKey = loopData.id;
      if (audioBuffersRef.current.has(bufferKey)) {
        console.log(`  ✓ AudioBuffer already cached for ${loopData.name}`);
        const cachedBuffer = audioBuffersRef.current.get(bufferKey);
        // Return a wrapper that references the cached buffer
        const wrappedPlayer = {
          buffer: cachedBuffer,
          isBuffer: true,
          loaded: true,
          duration: cachedBuffer.duration
        };
        playersRef.current.set(playerKey, wrappedPlayer);
        return wrappedPlayer;
      }

      const isMp3 = loopData.file.toLowerCase().endsWith('.mp3');

      if (isMp3) {
        console.log(`  🎵 Decoding MP3 into AudioBuffer: ${loopData.name}`);

        // Fetch the audio file as ArrayBuffer
        const response = await fetch(loopData.file);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${loopData.file}: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        // Decode into AudioBuffer using Web Audio API
        const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
        console.log(`  ✅ AudioBuffer decoded: ${loopData.name}, duration: ${audioBuffer.duration.toFixed(2)}s`);

        // Cache the buffer for reuse
        audioBuffersRef.current.set(bufferKey, audioBuffer);

        const wrappedPlayer = {
          buffer: audioBuffer,
          isBuffer: true,
          loaded: true,
          duration: audioBuffer.duration
        };

        playersRef.current.set(playerKey, wrappedPlayer);
        console.log(`  ✅ Stored AudioBuffer player with key: ${playerKey}`);
        return wrappedPlayer;

      } else {
        console.log(`  🎹 Using Tone.js Player for: ${loopData.name}`);
        const player = new Tone.Player({
          url: loopData.file,
          loop: false,
          fadeIn: 0.01,
          fadeOut: 0.01,
          onload: () => {
            console.log(`  ✅ Tone.js player loaded: ${loopData.name}, duration: ${player.buffer.duration}s`);
          }
        }).toDestination();

        await Tone.loaded();

        playersRef.current.set(playerKey, player);
        console.log(`  ✅ Stored Tone.js player with key: ${playerKey}`);
        return player;
      }

    } catch (error) {
      console.error(`❌ Failed to create player for ${loopData.name}:`, error);
      throw error;
    }
  }, []);

  const scheduleLoops = useCallback((placedLoops, duration, trackStates) => {
    clearScheduledEvents();

    const schedulingStartTime = Tone.Transport.seconds;
    const audioContext = Tone.context;
    const contextTime = audioContext.currentTime;

    // ✅ OPTIMIZED: Reduced logging for production
    const isDevMode = process.env.NODE_ENV === 'development';

    if (isDevMode) {
      console.log(`\n=== SCHEDULING LOOPS at Transport ${schedulingStartTime.toFixed(2)}s, Context ${contextTime.toFixed(2)}s ===`);
      console.log(`Total loops to consider: ${placedLoops.length}`);
    }

    const groupedLoops = new Map();
    placedLoops.forEach(loop => {
      if (!groupedLoops.has(loop.id)) {
        groupedLoops.set(loop.id, []);
      }
      groupedLoops.get(loop.id).push(loop);
    });

    let scheduledCount = 0;
    const scheduledEvents = [];

    groupedLoops.forEach((loopGroup, loopId) => {
      loopGroup.forEach(loop => {
        if (isDevMode) console.log(`🎵 Loop: ${loop.name}`, loop);

        const player = playersRef.current.get(loop.id);
        if (!player) {
          console.warn(`  ⚠️ No player found for ${loop.name} (key: ${loop.id})`);
          return;
        }

        const trackId = `track-${loop.trackIndex}`;
        const trackState = trackStates[trackId];

        if (!trackState) {
          console.warn(`  ⚠️ No track state for ${trackId}`);
          return;
        }

        const trackVolume = trackState.volume ?? 0.7;
        const loopVolume = loop.volume ?? 1.0;
        const effectiveVolume = trackVolume * loopVolume;

        if (trackState.muted || effectiveVolume < 0.01) {
          console.log(`  🔇 ${loop.name} is muted (track: ${trackState.muted}, volume: ${effectiveVolume.toFixed(2)})`);
          return;
        }

        const loopStartTime = loop.startTime;
        const loopEndTime = loop.endTime;
        const originalLoopDuration = loop.duration; // Original audio file duration
        const placedLoopDuration = loopEndTime - loopStartTime; // Actual duration on timeline

        if (loopEndTime <= schedulingStartTime) {
          if (isDevMode) console.log(`  ⏭️ Loop ends at ${loopEndTime.toFixed(2)}s (before current ${schedulingStartTime.toFixed(2)}s) - skipping entirely`);
          return;
        }

        // Calculate repeats based on the PLACED duration (which may be trimmed)
        // FIXED: Add tolerance to prevent floating point precision causing extra repeats
        const rawRepeats = placedLoopDuration / originalLoopDuration;
        const numRepeats = (rawRepeats % 1) < 0.02 ? Math.max(1, Math.floor(rawRepeats)) : Math.ceil(rawRepeats);

        if (isDevMode) {
          console.log(`  📍 Scheduling ${loop.name}:`);
          console.log(`     Video times: ${loopStartTime.toFixed(2)}s → ${loopEndTime.toFixed(2)}s`);
          console.log(`     Original loop duration: ${originalLoopDuration.toFixed(2)}s`);
          console.log(`     Placed loop duration: ${placedLoopDuration.toFixed(2)}s`);
          console.log(`     Repeats needed: ${numRepeats}`);
          console.log(`     Track ${loop.trackIndex} volume: ${effectiveVolume.toFixed(2)}`);
          if (loop.startOffset) {
            console.log(`     ✂️ Left-edge trim offset: ${loop.startOffset.toFixed(2)}s`);
          }
        }

        // Schedule each repeat with proper offset calculation
        for (let i = 0; i < numRepeats; i++) {
          const repeatStartTime = loopStartTime + (i * originalLoopDuration);
          const repeatEndTime = Math.min(repeatStartTime + originalLoopDuration, loopEndTime);

          // Skip if this repeat is entirely before current time
          if (repeatEndTime <= schedulingStartTime) {
            if (isDevMode) console.log(`  ⏭️  Repeat ${i + 1} ends at ${repeatEndTime.toFixed(2)}s (before ${schedulingStartTime.toFixed(2)}s) - skipping`);
            continue;
          }

          // ✅ CRITICAL FIX: Calculate offset within the loop if starting mid-loop
          // ALWAYS include the loop.startOffset (from left-edge trimming)
          const trimOffset = loop.startOffset || 0; // Offset from left-edge trimming
          let loopOffset = trimOffset; // Start with trim offset
          let actualDuration = originalLoopDuration; // Use original duration
          let actualStartTime = repeatStartTime;

          if (repeatStartTime < schedulingStartTime && repeatEndTime > schedulingStartTime) {
            // We're starting playback in the middle of this repeat
            const midLoopOffset = schedulingStartTime - repeatStartTime;
            loopOffset = trimOffset + midLoopOffset; // Combine trim offset + mid-loop offset
            actualDuration = repeatEndTime - schedulingStartTime;
            actualStartTime = schedulingStartTime;
            if (isDevMode) console.log(`  🎯 Starting mid-loop: trim offset ${trimOffset.toFixed(2)}s + mid-loop ${midLoopOffset.toFixed(2)}s = ${loopOffset.toFixed(2)}s, duration ${actualDuration.toFixed(2)}s`);
          } else if (repeatEndTime > loopEndTime) {
            // This is a partial repeat at the end
            actualDuration = loopEndTime - repeatStartTime;
            if (isDevMode) console.log(`  ✂️ Partial end repeat: offset ${loopOffset.toFixed(2)}s, duration ${actualDuration.toFixed(2)}s`);
          } else {
            // Normal repeat from the start (but with trim offset applied)
            if (isDevMode) console.log(`  ▶️ Full repeat: starting from trim offset ${loopOffset.toFixed(2)}s, duration ${actualDuration.toFixed(2)}s`);
          }

          // Calculate Transport time for this repeat
          const transportTime = Math.max(0, actualStartTime - schedulingStartTime);

          if (isDevMode) console.log(`  ▶️  Scheduling repeat ${i + 1}/${numRepeats} at Transport ${transportTime.toFixed(2)}s (video ${actualStartTime.toFixed(2)}s)`);

          // ✅ FIX: Only schedule audio if Transport is running
          // This prevents auto-play when loops are moved/resized
          if (Tone.Transport.state !== 'started') {
            if (isDevMode) console.log(`  ⏸️ Transport not running - skipping scheduling for ${loop.name}`);
            continue;
          }

          if (player.isBuffer) {
            // ✅ WEB AUDIO API: Sample-accurate scheduling with AudioBufferSourceNode
            const source = audioContext.createBufferSource();
            source.buffer = player.buffer;

            // Create individual gain node for volume control
            const gainNode = audioContext.createGain();
            gainNode.gain.value = effectiveVolume;

            // Connect: source -> gain -> master gain -> destination
            source.connect(gainNode);
            if (gainNodeRef.current) {
              gainNode.connect(gainNodeRef.current);
            } else {
              gainNode.connect(audioContext.destination);
            }

            // Calculate absolute AudioContext time for this loop
            // contextTime is "now", transportTime is how far in the future to start
            const startWhen = contextTime + transportTime;

            // ✅ SAMPLE-ACCURATE: Use source.start(when, offset, duration)
            source.start(startWhen, loopOffset, actualDuration);

            // Track this source for cleanup
            activeSourcesRef.current.add(source);

            // Remove from tracking when done
            source.onended = () => {
              activeSourcesRef.current.delete(source);
              source.disconnect();
              gainNode.disconnect();
            };

            if (isDevMode) console.log(`  🎵 AudioBuffer scheduled at context time ${startWhen.toFixed(3)}s`);
            scheduledCount++;
          } else {
            // ✅ Tone.js Player (for non-MP3 files)
            player.volume.value = Tone.gainToDb(effectiveVolume);
            player.start(`+${transportTime}`, loopOffset, actualDuration);
            scheduledCount++;
          }
        }
      });
    });

    scheduledEventsRef.current = scheduledEvents;
    if (isDevMode) console.log(`\n=== SUMMARY: ${scheduledCount} scheduled in ${groupedLoops.size} groups ===\n`);
  }, [clearScheduledEvents]);

  const play = useCallback(async () => {
    console.log(`🎬 Starting playback at ${Tone.Transport.seconds.toFixed(2)}s`);
    
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
      console.log('✅ Transport started immediately');
    } else {
      console.log('⏯️ Transport already running');
    }
    
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    console.log('⏸️ Pausing playback');
    Tone.Transport.pause();
    setIsPlaying(false);
    clearScheduledEvents();
  }, [clearScheduledEvents]);

  const stop = useCallback(() => {
    console.log('⏹️ Stopping playback');
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
    
    console.log(`Seeking to ${time.toFixed(2)}s`);
    
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
    // Also update our master gain node for AudioBuffer playback
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = vol;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      Tone.Destination.mute = newMuted;
      // Also mute our master gain node for AudioBuffer playback
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = newMuted ? 0 : volume;
      }
      return newMuted;
    });
  }, [volume]);

  // 🔥 FIXED: Preview loop now properly toggles on/off for the same loop
  const previewLoop = useCallback(async (loopData, onEnded = null) => {
    // 🔥 FIX: Check if we're trying to preview the same loop that's already playing
    const isSameLoop = currentPreviewLoopIdRef.current === loopData.id;

    if (previewPlayerRef.current) {
      console.log(`🛑 Stopping previous preview: ${currentPreviewLoopIdRef.current}`);
      try {
        if (previewPlayerRef.current.source) {
          // AudioBuffer preview - stop the source node
          previewPlayerRef.current.source.stop();
          previewPlayerRef.current.source.disconnect();
          if (previewPlayerRef.current.gainNode) {
            previewPlayerRef.current.gainNode.disconnect();
          }
        } else if (!previewPlayerRef.current.isBuffer) {
          // Tone.js player
          previewPlayerRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping previous preview:', err);
      }
      previewPlayerRef.current = null;
      currentPreviewLoopIdRef.current = null;

      // 🔥 FIX: If clicking same loop, just stop and return (don't restart)
      if (isSameLoop) {
        console.log(`⏹️ Same loop clicked - stopping preview only`);
        if (onEnded) {
          onEnded(loopData);
        }
        return;
      }
    }

    // Only start a new preview if we're not stopping the same loop
    try {
      console.log(`▶️ Starting new preview: ${loopData.name}`);
      const player = await createLoopPlayer(loopData, `preview-${Date.now()}`);
      currentPreviewLoopIdRef.current = loopData.id; // Track which loop is playing

      if (player.isBuffer) {
        // ✅ WEB AUDIO API: Use AudioBufferSourceNode for preview
        const audioContext = Tone.context;
        const source = audioContext.createBufferSource();
        source.buffer = player.buffer;

        // Create gain node for volume
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume;

        // Connect source -> gain -> destination
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Track the source for stopping
        previewPlayerRef.current = { source, gainNode, isBuffer: true };

        // Handle end of playback
        source.onended = () => {
          console.log(`✅ Preview ended: ${loopData.name}`);
          previewPlayerRef.current = null;
          currentPreviewLoopIdRef.current = null;

          if (onEnded) {
            onEnded(loopData);
          }
        };

        // Start playback immediately
        source.start(0);
      } else {
        // Tone.js player (non-MP3)
        previewPlayerRef.current = player;
        player.volume.value = Tone.gainToDb(volume);
        player.start();
      }

      console.log(`🎧 Previewing: ${loopData.name}`);
    } catch (error) {
      console.error('Preview error:', error);
      currentPreviewLoopIdRef.current = null;
      throw error;
    }
  }, [createLoopPlayer, volume]);

  useEffect(() => {
    const updateTime = () => {
      if (Tone.Transport.state === 'started') {
        const newTime = Tone.Transport.seconds;
        setCurrentTime(newTime);
        
        // FIXED: Only check end of video if we have a valid duration
        if (videoDuration && videoDuration > 0 && newTime >= videoDuration) {
          console.log(`🎬 Reached end of video duration (${videoDuration}s), stopping playback`);
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