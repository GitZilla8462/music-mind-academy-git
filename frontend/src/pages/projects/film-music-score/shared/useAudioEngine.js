// shared/useAudioEngine.js - FIXED: Proper native audio lifecycle management
import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

export const useAudioEngine = (videoDuration = 60) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const playersRef = useRef(new Map());
  const scheduledEventsRef = useRef([]);
  const activeNativeAudioRef = useRef(new Set()); // Track active native audio elements
  const rafRef = useRef(null);
  const lastSeekTimeRef = useRef(0);
  const SEEK_DEBOUNCE_MS = 100;
  const previewPlayerRef = useRef(null);
  const transportStoppedByStopRef = useRef(false);

  const initializeAudio = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      console.log('Audio context initialized');
    }
    
    Tone.Transport.loop = false;
    Tone.Transport.position = 0;
    
    Tone.Transport.on('stop', () => {
      console.log('ðŸ›‘ Transport stopped event');
      
      if (transportStoppedByStopRef.current) {
        console.log('  â†³ Stop was called by user - cleaning up');
        transportStoppedByStopRef.current = false;
        return;
      }
      
      console.log('  â†³ Natural end of Transport - not seeking to 0');
    });
  }, []);

  const clearScheduledEvents = useCallback(() => {
    // Clear all scheduled events (timeouts and Tone.js events)
    scheduledEventsRef.current.forEach(event => {
      if (event.type === 'transport') {
        try {
          Tone.Transport.clear(event.id);
        } catch (err) {
          console.error('Error clearing transport event:', err);
        }
      } else if (event.type === 'native-timeout') {
        clearTimeout(event.id);
      }
    });
    scheduledEventsRef.current = [];
    
    // Stop all active native audio elements
    activeNativeAudioRef.current.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (err) {
        console.error('Error stopping active native audio:', err);
      }
    });
    activeNativeAudioRef.current.clear();
    
    // Stop Tone.js players (they handle their own scheduling)
    playersRef.current.forEach((player) => {
      try {
        if (!player.isNative) {
          player.stop();
        }
      } catch (err) {
        console.error('Error stopping Tone.js player:', err);
      }
    });
  }, []);

  const createLoopPlayer = useCallback(async (loopData, placedLoopId) => {
    try {
      const playerKey = placedLoopId || loopData.id;
      console.log(`Creating player for: ${loopData.name} with key: ${playerKey}`);
      
      if (playersRef.current.has(playerKey)) {
        console.log(`  âœ“ Player already exists for ${playerKey}`);
        return playersRef.current.get(playerKey);
      }

      const isMp3 = loopData.file.toLowerCase().endsWith('.mp3');
      
      if (isMp3) {
        console.log(`  ðŸŽµ Using native HTML5 Audio for MP3: ${loopData.name}`);
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = loopData.file;
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Native audio load timeout'));
          }, 5000);
          
          audio.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
            console.log(`  âœ… Native audio loaded: ${loopData.name}, duration: ${audio.duration}s`);
            resolve();
          }, { once: true });
          
          audio.addEventListener('error', (e) => {
            clearTimeout(timeout);
            console.error(`  âŒ Native audio load error for ${loopData.name}:`, e);
            reject(new Error(`Failed to load: ${e.message || 'Unknown error'}`));
          }, { once: true });
          
          audio.load();
        });
        
        const wrappedPlayer = {
          audio,
          isNative: true,
          loaded: true,
          stop: () => {
            audio.pause();
            audio.currentTime = 0;
          }
        };
        
        playersRef.current.set(playerKey, wrappedPlayer);
        console.log(`  âœ… Stored native player with key: ${playerKey}`);
        return wrappedPlayer;
        
      } else {
        console.log(`  ðŸŽ¹ Using Tone.js Player for: ${loopData.name}`);
        const player = new Tone.Player({
          url: loopData.file,
          loop: false,
          fadeIn: 0.01,
          fadeOut: 0.01,
          onload: () => {
            console.log(`  âœ… Tone.js player loaded: ${loopData.name}, duration: ${player.buffer.duration}s`);
          }
        }).toDestination();
        
        await Tone.loaded();
        
        playersRef.current.set(playerKey, player);
        console.log(`  âœ… Stored Tone.js player with key: ${playerKey}`);
        return player;
      }
      
    } catch (error) {
      console.error(`âŒ Failed to create player for ${loopData.name}:`, error);
      throw error;
    }
  }, []);

  const scheduleLoops = useCallback((placedLoops, duration, trackStates) => {
    clearScheduledEvents();
    
    const schedulingStartTime = Tone.Transport.seconds;
    const isTransportPlaying = Tone.Transport.state === 'started';
    
    console.log(`\n=== SCHEDULING LOOPS at time ${schedulingStartTime.toFixed(2)}s ===`);
    console.log(`Transport playing: ${isTransportPlaying}`);
    console.log(`Total loops to consider: ${placedLoops.length}`);
    
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
        console.log(`ðŸ” Loop: ${loop.name}`, loop);
        
        const player = playersRef.current.get(loop.id);
        if (!player) {
          console.warn(`  âš ï¸ No player found for ${loop.name} (key: ${loop.id})`);
          return;
        }
        
        const trackId = `track-${loop.trackIndex}`;
        const trackState = trackStates[trackId];
        
        if (!trackState) {
          console.warn(`  âš ï¸ No track state for ${trackId}`);
          return;
        }
        
        const trackVolume = trackState.volume ?? 0.7;
        const loopVolume = loop.volume ?? 1.0;
        const effectiveVolume = trackVolume * loopVolume;
        
        if (trackState.muted || effectiveVolume < 0.01) {
          console.log(`  ðŸ”‡ ${loop.name} is muted (track: ${trackState.muted}, volume: ${effectiveVolume.toFixed(2)})`);
          return;
        }
        
        const actualPlayer = player.isNative ? player.audio : player;
        if (actualPlayer) {
          if (player.isNative) {
            actualPlayer.volume = effectiveVolume;
          } else {
            actualPlayer.volume.value = Tone.gainToDb(effectiveVolume);
          }
        }
        
        const loopStartTime = loop.startTime;
        const loopEndTime = loop.endTime;
        const loopDuration = loop.duration;
        
        if (loopEndTime <= schedulingStartTime) {
          console.log(`  â­ï¸ Loop ends at ${loopEndTime.toFixed(2)}s (before current ${schedulingStartTime.toFixed(2)}s) - skipping entirely`);
          return;
        }
        
        const totalLoopDuration = loopEndTime - loopStartTime;
        const numRepeats = Math.ceil(totalLoopDuration / loopDuration);
        
        console.log(`  ðŸ“Š Scheduling ${loop.name}:`);
        console.log(`     Video times: ${loopStartTime.toFixed(2)}s â†’ ${loopEndTime.toFixed(2)}s`);
        console.log(`     Loop duration: ${loopDuration.toFixed(2)}s`);
        console.log(`     Repeats needed: ${numRepeats}`);
        console.log(`     Track ${loop.trackIndex} volume: ${effectiveVolume.toFixed(2)}`);
        
        // Schedule each repeat with proper offset calculation
        for (let i = 0; i < numRepeats; i++) {
          const repeatStartTime = loopStartTime + (i * loopDuration);
          const repeatEndTime = Math.min(repeatStartTime + loopDuration, loopEndTime);
          
          // Skip if this repeat is entirely before current time
          if (repeatEndTime <= schedulingStartTime) {
            console.log(`  â­ï¸  Repeat ${i + 1} ends at ${repeatEndTime.toFixed(2)}s (before ${schedulingStartTime.toFixed(2)}s) - skipping`);
            continue;
          }
          
          // Calculate offset within the loop if starting mid-loop
          let loopOffset = 0;
          let actualDuration = loopDuration;
          let actualStartTime = repeatStartTime;
          
          if (repeatStartTime < schedulingStartTime && repeatEndTime > schedulingStartTime) {
            // We're starting playback in the middle of this repeat
            loopOffset = schedulingStartTime - repeatStartTime;
            actualDuration = repeatEndTime - schedulingStartTime;
            actualStartTime = schedulingStartTime;
            console.log(`  ðŸŽ¯ Starting mid-loop: offset ${loopOffset.toFixed(2)}s, duration ${actualDuration.toFixed(2)}s`);
          } else if (repeatEndTime > loopEndTime) {
            // This is a partial repeat at the end
            actualDuration = loopEndTime - repeatStartTime;
            console.log(`  âœ‚ï¸ Partial end repeat: duration ${actualDuration.toFixed(2)}s`);
          }
          
          // Calculate Transport time for this repeat
          const transportTime = Math.max(0, actualStartTime - schedulingStartTime);
          
          console.log(`  â–¶ï¸  Scheduling repeat ${i + 1}/${numRepeats} at Transport ${transportTime.toFixed(2)}s (video ${actualStartTime.toFixed(2)}s)`);
          
          // Only actually schedule if transport is playing
          if (!isTransportPlaying) {
            console.log(`  â¸ï¸ Transport stopped - not scheduling this repeat`);
            continue;
          }
          
          const actualPlayer = player.isNative ? player.audio : player;
          
          if (player.isNative) {
            // Native HTML5 Audio - clone the audio element for each repeat
            const delay = transportTime * 1000;
            
            // Create a NEW audio element clone for this specific repeat
            const audioClone = player.audio.cloneNode(true);
            audioClone.volume = player.audio.volume;
            audioClone.load(); // Prepare the clone
            
            const timeoutId = setTimeout(() => {
              if (!trackState.muted && effectiveVolume > 0.01) {
                audioClone.currentTime = loopOffset;
                
                // Track this as active audio
                activeNativeAudioRef.current.add(audioClone);
                
                audioClone.play().catch(err => {
                  console.error(`Failed to play native audio for ${loop.name}:`, err);
                  activeNativeAudioRef.current.delete(audioClone);
                });
                
                // Stop the audio after actualDuration
                const stopTimeoutId = setTimeout(() => {
                  audioClone.pause();
                  audioClone.currentTime = 0;
                  audioClone.src = ''; // Release resources
                  activeNativeAudioRef.current.delete(audioClone);
                }, actualDuration * 1000);
                scheduledEvents.push({ type: 'native-timeout', id: stopTimeoutId });
              }
            }, delay);
            scheduledEvents.push({ type: 'native-timeout', id: timeoutId });
            scheduledCount++;
          } else {
            // Tone.js Player - provide offset parameter
            actualPlayer.start(`+${transportTime}`, loopOffset, actualDuration);
            scheduledCount++;
          }
        }
      });
    });
    
    scheduledEventsRef.current = scheduledEvents;
    console.log(`\n=== SUMMARY: ${scheduledCount} scheduled in ${groupedLoops.size} groups ===\n`);
  }, [clearScheduledEvents]);

  const play = useCallback(async () => {
    console.log(`ðŸŽ¬ Starting playback at ${Tone.Transport.seconds.toFixed(2)}s`);
    
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
      console.log('âœ… Transport started immediately');
    } else {
      console.log('â„¹ï¸ Transport already running');
    }
    
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    console.log('â¸ï¸ Pausing playback');
    Tone.Transport.pause();
    setIsPlaying(false);
    clearScheduledEvents();
  }, [clearScheduledEvents]);

  const stop = useCallback(() => {
    console.log('â¹ï¸ Stopping playback');
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
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      Tone.Destination.mute = newMuted;
      return newMuted;
    });
  }, []);

  const previewLoop = useCallback(async (loopData, onEnded = null) => {
    if (previewPlayerRef.current) {
      try {
        if (previewPlayerRef.current.isNative) {
          previewPlayerRef.current.audio.pause();
          previewPlayerRef.current.audio.currentTime = 0;
        } else {
          previewPlayerRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping previous preview:', err);
      }
      previewPlayerRef.current = null;
    }

    try {
      const player = await createLoopPlayer(loopData, `preview-${Date.now()}`);
      previewPlayerRef.current = player;
      
      if (player.isNative) {
        player.audio.volume = volume;
        player.audio.loop = false; // Never loop during preview
        
        // Add ended event listener to clean up when preview finishes
        player.audio.addEventListener('ended', () => {
          console.log(`✅ Preview ended: ${loopData.name}`);
          previewPlayerRef.current = null;
          
          // Call onEnded callback if provided
          if (onEnded) {
            onEnded(loopData);
          }
        });
        
        await player.audio.play();
      } else {
        player.volume.value = Tone.gainToDb(volume);
        player.start();
      }
      
      console.log(`ðŸŽ§ Previewing: ${loopData.name}`);
    } catch (error) {
      console.error('Preview error:', error);
      throw error;
    }
  }, [createLoopPlayer, volume]);

  useEffect(() => {
    const updateTime = () => {
      if (Tone.Transport.state === 'started') {
        const newTime = Tone.Transport.seconds;
        setCurrentTime(newTime);
        
        if (newTime >= videoDuration) {
          console.log('ðŸŽ¬ Reached end of video duration, stopping playback');
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