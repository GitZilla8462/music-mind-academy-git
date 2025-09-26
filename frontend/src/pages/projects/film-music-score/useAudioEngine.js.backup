import { useState, useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';

export const useAudioEngine = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  const playersRef = useRef({});
  const nativePlayersRef = useRef({}); 
  const scheduledLoopsRef = useRef({});
  const animationFrameRef = useRef(null);
  const audioInitialized = useRef(false);
  const transportStartTime = useRef(0);
  const lastScheduledLoops = useRef([]);
  const currentlyPlayingLoops = useRef(new Set()); // Track which loops are currently playing

  // Initialize Tone.js
  const initializeAudio = useCallback(async () => {
    if (!audioInitialized.current) {
      try {
        if (Tone.context.state === 'suspended') {
          await Tone.context.resume();
        }
        
        await Tone.start();
        audioInitialized.current = true;
        
        // Make Tone available globally for debugging
        window.Tone = Tone;
        
        Tone.Transport.on('start', () => {
          setIsPlaying(true);
          transportStartTime.current = Tone.now();
          console.log('Transport started at:', Tone.now());
        });
        
        Tone.Transport.on('pause', () => {
          setIsPlaying(false);
          console.log('Transport paused');
        });
        
        Tone.Transport.on('stop', () => {
          setIsPlaying(false);
          setCurrentTime(0);
          Tone.Transport.seconds = 0;
          // Stop all currently playing loops
          stopAllCurrentLoops();
          console.log('Transport stopped');
        });
        
        Tone.Destination.volume.value = Tone.gainToDb(0.8);
        
        console.log('Audio engine initialized successfully');
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        throw error;
      }
    }
  }, []);

  // Stop all currently playing loops
  const stopAllCurrentLoops = useCallback(() => {
    console.log(`Stopping ${currentlyPlayingLoops.current.size} currently playing loops`);
    currentlyPlayingLoops.current.forEach(loopId => {
      const player = playersRef.current[loopId];
      if (player) {
        try {
          if (player.isNative) {
            player.stop();
          } else if (player.state === 'started') {
            player.stop();
          }
        } catch (e) {
          console.warn(`Error stopping loop ${loopId}:`, e);
        }
      }
    });
    currentlyPlayingLoops.current.clear();
  }, []);

  // FIXED: Create fallback native audio player with unique audio element per loop
  const createNativePlayer = useCallback((loop) => {
    console.log(`Creating native audio player for ${loop.name} (${loop.id})`);
    
    // Create a completely new Audio element for each loop instance
    const audioElement = new Audio();
    audioElement.src = loop.file;
    audioElement.preload = 'metadata';
    audioElement.volume = (loop.volume || 0.8) * volume;
    
    // Add unique identifier to help with debugging
    audioElement.dataset.loopId = loop.id;
    audioElement.dataset.loopName = loop.name;
    
    const player = {
      audio: audioElement,
      loaded: false,
      isNative: true,
      loopId: loop.id, // Store loop ID for reference
      start: (time = 0, offset = 0, duration) => {
        try {
          audioElement.currentTime = offset;
          audioElement.volume = (loop.volume || 0.8) * volume * (isMuted ? 0 : 1);
          
          const promise = audioElement.play();
          if (promise) {
            promise.then(() => {
              currentlyPlayingLoops.current.add(loop.id);
              console.log(`Native audio started playing: ${loop.name} (${loop.id})`);
            }).catch(e => {
              console.error(`Native audio play failed for ${loop.name} (${loop.id}):`, e);
              // Remove from playing set if play failed
              currentlyPlayingLoops.current.delete(loop.id);
            });
          }
          
          if (duration && duration > 0) {
            setTimeout(() => {
              if (!audioElement.paused) {
                audioElement.pause();
                audioElement.currentTime = 0;
                currentlyPlayingLoops.current.delete(loop.id);
                console.log(`Native audio stopped after duration: ${loop.name} (${loop.id})`);
              }
            }, duration * 1000);
          }
        } catch (error) {
          console.error(`Error starting native audio for ${loop.name} (${loop.id}):`, error);
        }
      },
      stop: () => {
        audioElement.pause();
        audioElement.currentTime = 0;
        currentlyPlayingLoops.current.delete(loop.id);
        console.log(`Native audio stopped: ${loop.name} (${loop.id})`);
      },
      dispose: () => {
        audioElement.pause();
        audioElement.src = '';
        currentlyPlayingLoops.current.delete(loop.id);
        console.log(`Native audio disposed: ${loop.name} (${loop.id})`);
      },
      volume: {
        get value() { return audioElement.volume; },
        set value(vol) { audioElement.volume = vol; }
      }
    };

    audioElement.addEventListener('canplaythrough', () => {
      player.loaded = true;
      console.log(`Native player ready for ${loop.name} (${loop.id})`);
    });

    audioElement.addEventListener('error', (e) => {
      console.error(`Native audio error for ${loop.name} (${loop.id}):`, e);
      console.error(`Audio element state: readyState=${audioElement.readyState}, networkState=${audioElement.networkState}`);
    });

    audioElement.addEventListener('ended', () => {
      currentlyPlayingLoops.current.delete(loop.id);
      console.log(`Native audio ended: ${loop.name} (${loop.id})`);
    });

    return player;
  }, [volume, isMuted]);

  // FIXED: Create audio player for a loop with unique player per loop instance
  const createLoopPlayer = useCallback(async (loop) => {
    // Always create a unique player for each loop instance, even if same audio file
    const playerKey = loop.id; // Use the unique loop ID, not the file path
    
    if (playersRef.current[playerKey]) {
      console.log(`Player already exists for loop instance ${loop.name} (${loop.id})`);
      return playersRef.current[playerKey];
    }

    console.log(`Creating player for ${loop.name} (${loop.id}) with file: ${loop.file}`);
    
    try {
      const player = new Tone.Player({
        url: loop.file,
        autostart: false,
        loop: false,
        volume: Tone.gainToDb(loop.volume || 0.8),
        onload: () => {
          console.log(`Tone.js player loaded for ${loop.name} (${loop.id})`);
        },
        onerror: (error) => {
          console.error(`Tone.js player error for ${loop.name} (${loop.id}):`, error);
        }
      }).toDestination();

      const loadTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tone.js load timeout')), 5000)
      );

      await Promise.race([player.load(), loadTimeout]);
      
      if (player.loaded) {
        playersRef.current[playerKey] = player;
        console.log(`Successfully created Tone.js player for ${loop.name} (${loop.id})`);
        return player;
      } else {
        throw new Error('Tone.js player not loaded');
      }
    } catch (error) {
      console.warn(`Tone.js failed for ${loop.name} (${loop.id}), trying native audio:`, error.message);
      
      try {
        // Create a unique native player for this loop instance
        const nativePlayer = createNativePlayer(loop);
        playersRef.current[playerKey] = nativePlayer;
        nativePlayersRef.current[playerKey] = nativePlayer;
        
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log(`Created native audio player for ${loop.name} (${loop.id})`);
            resolve(nativePlayer);
          }, 500);
        });
      } catch (nativeError) {
        console.error(`Both Tone.js and native audio failed for ${loop.name} (${loop.id}):`, nativeError);
        throw nativeError;
      }
    }
  }, [createNativePlayer]);

  // Check which loops should be playing at current time
  const getActiveLoopsAtTime = useCallback((placedLoops, currentTime) => {
    return placedLoops.filter(loop => 
      !loop.muted && 
      currentTime >= loop.startTime && 
      currentTime < loop.endTime
    );
  }, []);

  // FIXED: Start a loop with correct offset when playback begins
  const startLoopWithOffset = useCallback(async (loop, currentTime) => {
    if (loop.muted || currentTime < loop.startTime || currentTime >= loop.endTime) {
      return;
    }

    const player = playersRef.current[loop.id];
    if (!player || (!player.loaded && !player.isNative)) {
      console.warn(`Player not ready for ${loop.name}`);
      return;
    }

    try {
      // Calculate how far we are into the loop's timeline position
      const positionInLoop = currentTime - loop.startTime;
      const totalLoopDuration = loop.endTime - loop.startTime;
      const remainingDuration = loop.endTime - currentTime;

      // IMPORTANT: For looping audio, we need to calculate the offset within the original audio file
      // The loop might be longer than the original audio file duration, so we use modulo
      const originalAudioDuration = loop.duration; // This is the actual audio file duration
      const offsetIntoAudioFile = positionInLoop % originalAudioDuration;

      console.log(`Starting loop with offset: ${loop.name}`);
      console.log(`  - Position in loop timeline: ${positionInLoop.toFixed(2)}s`);
      console.log(`  - Original audio duration: ${originalAudioDuration.toFixed(2)}s`);
      console.log(`  - Offset into audio file: ${offsetIntoAudioFile.toFixed(2)}s`);
      console.log(`  - Remaining duration: ${remainingDuration.toFixed(2)}s`);

      // Don't start if there's less than 0.1 seconds remaining
      if (remainingDuration < 0.1) {
        console.log(`  - Skipping: too little time remaining (${remainingDuration.toFixed(3)}s)`);
        return;
      }

      if (player.isNative) {
        // For native audio, start from the calculated offset
        player.start(0, offsetIntoAudioFile, remainingDuration);
      } else {
        // For Tone.js, start from the calculated offset
        player.volume.value = Tone.gainToDb((loop.volume || 0.8) * volume);
        player.start(Tone.now(), offsetIntoAudioFile, remainingDuration);
      }

      currentlyPlayingLoops.current.add(loop.id);
      console.log(`  - Successfully started with ${remainingDuration.toFixed(2)}s remaining`);
    } catch (error) {
      console.error(`Error starting loop with offset ${loop.name}:`, error);
    }
  }, [volume]);

  // FIXED: Enhanced scheduleLoops to handle immediate starts properly
  const scheduleLoops = useCallback((placedLoops, duration) => {
    if (!audioInitialized.current || !Array.isArray(placedLoops)) {
      console.warn('Audio not initialized or invalid loops array');
      return;
    }

    console.log(`\n=== SCHEDULING ${placedLoops.length} LOOPS ===`);

    // Clear existing scheduled events
    Tone.Transport.cancel();
    Object.keys(scheduledLoopsRef.current).forEach(key => {
      delete scheduledLoopsRef.current[key];
    });

    // Stop currently playing loops
    stopAllCurrentLoops();

    const currentTransportTime = Tone.Transport.seconds;
    const isTransportPlaying = Tone.Transport.state === 'started';
    console.log(`Current transport time: ${currentTransportTime.toFixed(2)}s`);
    console.log(`Transport state: ${Tone.Transport.state}`);

    let scheduledCount = 0;
    let immediateCount = 0;
    let skippedCount = 0;

    placedLoops.forEach((loop, index) => {
      const player = playersRef.current[loop.id];
      console.log(`\nLoop ${index + 1}: ${loop.name}`);
      console.log(`  - Start: ${loop.startTime.toFixed(2)}s, End: ${loop.endTime.toFixed(2)}s`);
      console.log(`  - Player: ${player ? (player.isNative ? 'Native' : 'Tone.js') : 'MISSING'}`);
      console.log(`  - Muted: ${loop.muted}`);
      
      if (!player || loop.muted) {
        if (!player) {
          console.warn(`  ❌ No player found for loop ${loop.name}`);
        } else {
          console.log(`  🔇 Loop is muted`);
        }
        skippedCount++;
        return;
      }

      try {
        const loopDuration = loop.endTime - loop.startTime;
        
        // FIXED: Better logic for when to schedule/start loops
        if (currentTransportTime >= loop.startTime && currentTransportTime < loop.endTime) {
          // Loop should be active at current time
          const remainingTime = loop.endTime - currentTransportTime;
          
          // FIXED: Start immediately regardless of transport state if enough time remains
          if (remainingTime >= 0.1) {
            if (isTransportPlaying) {
              console.log(`  ▶️ Starting immediately (${remainingTime.toFixed(2)}s remaining)`);
              startLoopWithOffset(loop, currentTransportTime);
              immediateCount++;
            } else {
              // FIXED: Transport is stopped - schedule to start when transport starts
              console.log(`  ⏰ Transport stopped - scheduling from current position for when play starts`);
              
              if (player.isNative) {
                const scheduleId = Tone.Transport.schedule((time) => {
                  console.log(`🎵 Playing mid-loop native audio ${loop.name} at time ${time.toFixed(2)}`);
                  
                  // Calculate current position in transport when this fires
                  const currentTimeWhenFired = Tone.Transport.seconds;
                  const offsetIntoLoop = currentTimeWhenFired - loop.startTime;
                  const offsetIntoAudioFile = offsetIntoLoop % loop.duration;
                  const remainingDuration = loop.endTime - currentTimeWhenFired;
                  
                  if (remainingDuration > 0.05) {
                    const delay = Math.max(0, time - Tone.now());
                    setTimeout(() => {
                      try {
                        player.start(0, offsetIntoAudioFile, remainingDuration);
                        currentlyPlayingLoops.current.add(loop.id);
                      } catch (playError) {
                        console.error(`Error playing native audio ${loop.name}:`, playError);
                      }
                    }, delay * 1000);
                  }
                }, currentTransportTime);

                scheduledLoopsRef.current[loop.id] = scheduleId;
              } else {
                const scheduleId = Tone.Transport.schedule((time) => {
                  console.log(`🎵 Playing mid-loop Tone.js ${loop.name} at time ${time.toFixed(2)}`);
                  try {
                    player.volume.value = Tone.gainToDb((loop.volume || 0.8) * volume);
                    
                    // Calculate current position in transport when this fires
                    const currentTimeWhenFired = time; // Use the scheduled time
                    const offsetIntoLoop = currentTimeWhenFired - loop.startTime;
                    const offsetIntoAudioFile = offsetIntoLoop % loop.duration;
                    const remainingDuration = loop.endTime - currentTimeWhenFired;
                    
                    if (remainingDuration > 0.05) {
                      player.start(time, offsetIntoAudioFile, remainingDuration);
                      currentlyPlayingLoops.current.add(loop.id);
                    }
                  } catch (playError) {
                    console.error(`Error playing Tone.js ${loop.name}:`, playError);
                  }
                }, currentTransportTime);

                scheduledLoopsRef.current[loop.id] = scheduleId;
              }
              
              scheduledCount++;
            }
          } else {
            console.log(`  ⏭️ Skipping immediate start: too little time remaining (${remainingTime.toFixed(3)}s)`);
            skippedCount++;
          }
        }
        // Schedule ALL future loops, regardless of transport state
        else if (loop.startTime > currentTransportTime) {
          console.log(`  ⏰ Scheduling for future playback at ${loop.startTime.toFixed(2)}s`);
          
          if (player.isNative) {
            const scheduleId = Tone.Transport.schedule((time) => {
              console.log(`🎵 Playing scheduled native audio ${loop.name} at time ${time.toFixed(2)}`);
              
              const delay = Math.max(0, time - Tone.now());
              
              setTimeout(() => {
                try {
                  player.start(0, 0, loopDuration);
                  currentlyPlayingLoops.current.add(loop.id);
                } catch (playError) {
                  console.error(`Error playing native audio ${loop.name}:`, playError);
                }
              }, delay * 1000);
            }, loop.startTime);

            scheduledLoopsRef.current[loop.id] = scheduleId;
          } else {
            const scheduleId = Tone.Transport.schedule((time) => {
              console.log(`🎵 Playing scheduled Tone.js ${loop.name} at time ${time.toFixed(2)}`);
              try {
                player.volume.value = Tone.gainToDb((loop.volume || 0.8) * volume);
                player.start(time, 0, loopDuration);
                currentlyPlayingLoops.current.add(loop.id);
              } catch (playError) {
                console.error(`Error playing Tone.js ${loop.name}:`, playError);
              }
            }, loop.startTime);

            scheduledLoopsRef.current[loop.id] = scheduleId;
          }
          
          scheduledCount++;
        }
        // Past loops
        else {
          console.log(`  ⏭️ Skipping (completely in the past: ends at ${loop.endTime.toFixed(2)}s)`);
          skippedCount++;
        }
        
      } catch (scheduleError) {
        console.error(`❌ Error scheduling ${loop.name}:`, scheduleError);
        skippedCount++;
      }
    });

    lastScheduledLoops.current = placedLoops;
    
    console.log(`\n=== SCHEDULING COMPLETE ===`);
    console.log(`✅ Scheduled for future: ${scheduledCount}`);
    console.log(`▶️ Started immediately: ${immediateCount}`);
    console.log(`⏭️ Skipped: ${skippedCount}`);
    console.log(`🎛️ Total active scheduled events: ${Object.keys(scheduledLoopsRef.current).length}`);
    console.log(`================================\n`);
  }, [volume, startLoopWithOffset, stopAllCurrentLoops]);

  // Transport controls
  const play = useCallback(async () => {
    try {
      await initializeAudio();
      console.log('Starting transport...');
      Tone.Transport.start();
    } catch (error) {
      console.error('Error starting playback:', error);
      throw error;
    }
  }, [initializeAudio]);

  const pause = useCallback(() => {
    console.log('Pausing transport...');
    Tone.Transport.pause();
    stopAllCurrentLoops();
  }, [stopAllCurrentLoops]);

  const stop = useCallback(() => {
    console.log('Stopping transport...');
    Tone.Transport.stop();
    setCurrentTime(0);
    stopAllCurrentLoops();
  }, [stopAllCurrentLoops]);

  const seek = useCallback((time) => {
    const clampedTime = Math.max(0, time);
    console.log(`Seeking to ${clampedTime.toFixed(2)}s`);
    Tone.Transport.seconds = clampedTime;
    setCurrentTime(clampedTime);
    
    // ALWAYS stop all currently playing loops when seeking
    stopAllCurrentLoops();
    
    // FIXED: Don't automatically reschedule loops on seek
    // Let the calling code decide whether to reschedule based on playback state
    console.log('Seek complete - loops stopped, scheduling will be handled by caller if needed');
  }, [stopAllCurrentLoops]);

  // Volume control
  const setMasterVolume = useCallback((vol) => {
    const clampedVolume = Math.max(0, Math.min(1, vol));
    setVolume(clampedVolume);
    if (!isMuted) {
      Tone.Destination.volume.value = Tone.gainToDb(clampedVolume);
    }
    
    Object.values(nativePlayersRef.current).forEach(player => {
      if (player.audio) {
        player.audio.volume = clampedVolume * (isMuted ? 0 : 1);
      }
    });
    
    console.log(`Master volume set to ${Math.round(clampedVolume * 100)}%`);
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted) {
        Tone.Destination.volume.value = -Infinity;
        Object.values(nativePlayersRef.current).forEach(player => {
          if (player.audio) {
            player.audio.volume = 0;
          }
        });
        console.log('Audio muted');
      } else {
        Tone.Destination.volume.value = Tone.gainToDb(volume);
        Object.values(nativePlayersRef.current).forEach(player => {
          if (player.audio) {
            player.audio.volume = volume;
          }
        });
        console.log('Audio unmuted');
      }
      return newMuted;
    });
  }, [volume]);

  // Preview a single loop
  const previewLoop = useCallback(async (loop) => {
    try {
      await initializeAudio();
      console.log(`Previewing loop: ${loop.name}`);
      
      let player = playersRef.current[loop.id];
      if (!player) {
        player = await createLoopPlayer(loop);
      }
      
      if (player && (player.loaded || player.isNative)) {
        // Stop any currently playing previews
        Object.values(playersRef.current).forEach(p => {
          if (p.loaded && p.state === 'started') {
            p.stop();
          }
          if (p.isNative && p.audio && !p.audio.paused) {
            p.stop();
          }
        });
        
        player.start();
        console.log(`Started preview for ${loop.name}`);
      } else {
        throw new Error('Player not ready for preview');
      }
    } catch (error) {
      console.error('Error previewing loop:', error);
      throw error;
    }
  }, [initializeAudio, createLoopPlayer]);

  // Update current time during playback
  useEffect(() => {
    const updateTime = () => {
      if (isPlaying) {
        const newTime = Tone.Transport.seconds;
        setCurrentTime(newTime);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up audio engine...');
      Tone.Transport.cancel();
      Tone.Transport.stop();
      
      Object.values(playersRef.current).forEach(player => {
        if (player && player.dispose) {
          player.dispose();
        }
      });
      
      Object.values(nativePlayersRef.current).forEach(player => {
        if (player && player.dispose) {
          player.dispose();
        }
      });
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    // State
    isPlaying,
    currentTime,
    volume,
    isMuted,
    
    // Actions
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
    
    // Refs for debugging
    playersRef
  };
};