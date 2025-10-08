import { useState, useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';

// Helper to calculate repeat schedule for extended loops
const calculateLoopRepeats = (loop, currentTransportTime) => {
  const totalDuration = loop.endTime - loop.startTime;
  const originalDuration = loop.duration; // actual audio file length
  const numRepeats = Math.ceil(totalDuration / originalDuration);
  
  const repeats = [];
  for (let i = 0; i < numRepeats; i++) {
    const repeatStart = loop.startTime + (i * originalDuration);
    const repeatEnd = Math.min(loop.startTime + ((i + 1) * originalDuration), loop.endTime);
    
    if (repeatEnd > currentTransportTime) {
      repeats.push({
        startTime: repeatStart,
        endTime: repeatEnd,
        duration: repeatEnd - repeatStart,
        index: i
      });
    }
  }
  return repeats;
};

export const useAudioEngine = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  const playersRef = useRef({});
  const nativePlayersRef = useRef({}); 
  const scheduledLoopsRef = useRef({});
  const loopTimeoutsRef = useRef({});
  const animationFrameRef = useRef(null);
  const audioInitialized = useRef(false);
  const transportStartTime = useRef(0);
  const lastScheduledLoops = useRef([]);
  const currentlyPlayingLoops = useRef(new Set());

  const initializeAudio = useCallback(async () => {
    if (!audioInitialized.current) {
      try {
        if (Tone.context.state === 'suspended') {
          await Tone.context.resume();
        }
        
        await Tone.start();
        audioInitialized.current = true;
        
        window.Tone = Tone;
        
        Tone.Transport.on('start', () => {
          setIsPlaying(true);
          transportStartTime.current = Tone.now();
        });
        
        Tone.Transport.on('pause', () => {
          setIsPlaying(false);
        });
        
        Tone.Transport.on('stop', () => {
          setIsPlaying(false);
          setCurrentTime(0);
          Tone.Transport.seconds = 0;
          stopAllCurrentLoops();
        });
        
        Tone.Destination.volume.value = Tone.gainToDb(0.8);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        throw error;
      }
    }
  }, []);

  const stopAllCurrentLoops = useCallback(() => {
    Object.keys(loopTimeoutsRef.current).forEach(loopId => {
      if (loopTimeoutsRef.current[loopId]) {
        clearTimeout(loopTimeoutsRef.current[loopId]);
        delete loopTimeoutsRef.current[loopId];
      }
    });
    
    currentlyPlayingLoops.current.forEach(loopId => {
      const baseLoopId = loopId.split('-repeat-')[0];
      const player = playersRef.current[baseLoopId];
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

  const createNativePlayer = useCallback((loop) => {
    const audioElement = new Audio();
    audioElement.src = loop.file;
    audioElement.preload = 'auto'; // Changed from 'metadata' to 'auto' for better preloading
    audioElement.volume = (loop.volume || 0.8) * volume;
    audioElement.dataset.loopId = loop.id;
    audioElement.dataset.loopName = loop.name;
    
    // CRITICAL: Enable native looping for extended loops
    audioElement.loop = true;
    
    const player = {
      audio: audioElement,
      loaded: false,
      isNative: true,
      loopId: loop.id,
      loopingTimeout: null,
      start: (time = 0, offset = 0, duration) => {
        try {
          audioElement.currentTime = offset;
          audioElement.volume = (loop.volume || 0.8) * volume * (isMuted ? 0 : 1);
          
          const promise = audioElement.play();
          if (promise) {
            promise.then(() => {
              currentlyPlayingLoops.current.add(loop.id);
              
              // Stop after the specified duration (even if looping)
              if (duration && duration > 0) {
                if (player.loopingTimeout) {
                  clearTimeout(player.loopingTimeout);
                }
                player.loopingTimeout = setTimeout(() => {
                  if (!audioElement.paused) {
                    audioElement.pause();
                    audioElement.currentTime = 0;
                    currentlyPlayingLoops.current.delete(loop.id);
                  }
                }, duration * 1000);
              }
            }).catch(e => {
              console.error(`Native audio play failed for ${loop.name}:`, e);
              currentlyPlayingLoops.current.delete(loop.id);
            });
          }
        } catch (error) {
          console.error(`Error starting native audio for ${loop.name}:`, error);
        }
      },
      stop: () => {
        if (player.loopingTimeout) {
          clearTimeout(player.loopingTimeout);
          player.loopingTimeout = null;
        }
        audioElement.pause();
        audioElement.currentTime = 0;
        currentlyPlayingLoops.current.delete(loop.id);
      },
      dispose: () => {
        if (player.loopingTimeout) {
          clearTimeout(player.loopingTimeout);
        }
        audioElement.pause();
        audioElement.src = '';
        currentlyPlayingLoops.current.delete(loop.id);
      },
      volume: {
        get value() { return audioElement.volume; },
        set value(vol) { 
          audioElement.volume = Math.max(0, Math.min(1, vol));
        }
      }
    };

    audioElement.addEventListener('canplaythrough', () => {
      player.loaded = true;
    });

    audioElement.addEventListener('error', (e) => {
      console.error(`Native audio error for ${loop.name}:`, e);
    });

    return player;
  }, [volume, isMuted]);

  const createLoopPlayer = useCallback(async (loop) => {
    const playerKey = loop.id;
    
    if (playersRef.current[playerKey]) {
      return playersRef.current[playerKey];
    }
    
    try {
      const player = new Tone.Player({
        url: loop.file,
        autostart: false,
        loop: false,
        volume: Tone.gainToDb(loop.volume || 0.8)
      }).toDestination();

      const loadTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tone.js load timeout')), 5000)
      );

      await Promise.race([player.load(), loadTimeout]);
      
      if (player.loaded) {
        playersRef.current[playerKey] = player;
        return player;
      } else {
        throw new Error('Tone.js player not loaded');
      }
    } catch (error) {
      try {
        const nativePlayer = createNativePlayer(loop);
        playersRef.current[playerKey] = nativePlayer;
        nativePlayersRef.current[playerKey] = nativePlayer;
        
        return new Promise((resolve) => {
          setTimeout(() => resolve(nativePlayer), 500);
        });
      } catch (nativeError) {
        console.error(`Both Tone.js and native audio failed for ${loop.name}:`, nativeError);
        throw nativeError;
      }
    }
  }, [createNativePlayer]);

  const getActiveLoopsAtTime = useCallback((placedLoops, currentTime) => {
    return placedLoops.filter(loop => 
      !loop.muted && 
      currentTime >= loop.startTime && 
      currentTime < loop.endTime
    );
  }, []);

  const startLoopWithOffset = useCallback(async (loop, currentTime, trackStates = {}) => {
    if (loop.muted || currentTime < loop.startTime || currentTime >= loop.endTime) {
      return;
    }

    const player = playersRef.current[loop.id];
    if (!player || (!player.loaded && !player.isNative)) {
      return;
    }

    const trackState = trackStates[`track-${loop.trackIndex}`] || {};
    if (trackState.muted) {
      return;
    }

    const soloedTracks = Object.keys(trackStates).filter(trackId => trackStates[trackId].solo);
    const hasSoloedTracks = soloedTracks.length > 0;
    const shouldPlayBasedOnSolo = !hasSoloedTracks || trackState.solo;
    
    if (!shouldPlayBasedOnSolo) {
      return;
    }

    try {
      const positionInLoop = currentTime - loop.startTime;
      const remainingDuration = loop.endTime - currentTime;
      const offsetIntoAudioFile = positionInLoop % loop.duration;

      const trackVolume = trackState.volume !== undefined ? trackState.volume : 0.7;
      const loopVolume = loop.volume !== undefined ? loop.volume : 0.8;
      const finalVolume = loopVolume * trackVolume * volume;

      if (remainingDuration < 0.1) {
        return;
      }

      if (player.isNative) {
        player.audio.currentTime = offsetIntoAudioFile;
        player.audio.volume = Math.max(0, Math.min(1, finalVolume));
        player.audio.loop = true; // Enable looping
        
        const promise = player.audio.play();
        if (promise) {
          promise.then(() => {
            currentlyPlayingLoops.current.add(loop.id);
            
            loopTimeoutsRef.current[loop.id] = setTimeout(() => {
              if (!player.audio.paused) {
                player.audio.pause();
                player.audio.currentTime = 0;
                player.audio.loop = false;
                currentlyPlayingLoops.current.delete(loop.id);
                delete loopTimeoutsRef.current[loop.id];
              }
            }, remainingDuration * 1000);
          }).catch(e => {
            console.error(`Play failed:`, e);
          });
        }
      } else {
        const dbValue = finalVolume === 0 ? -Infinity : Tone.gainToDb(finalVolume);
        player.volume.value = dbValue;
        player.start(Tone.now(), offsetIntoAudioFile, remainingDuration);
        currentlyPlayingLoops.current.add(loop.id);
      }
    } catch (error) {
      console.error(`Error starting loop with offset ${loop.name}:`, error);
    }
  }, [volume]);

  const scheduleLoops = useCallback((placedLoops, duration, trackStates = {}) => {
    if (!audioInitialized.current || !Array.isArray(placedLoops)) {
      return;
    }

    Tone.Transport.cancel();
    Object.keys(scheduledLoopsRef.current).forEach(key => {
      delete scheduledLoopsRef.current[key];
    });

    stopAllCurrentLoops();

    const currentTransportTime = Tone.Transport.seconds;
    const isTransportPlaying = Tone.Transport.state === 'started';

    console.log(`\n=== SCHEDULING LOOPS at time ${currentTransportTime.toFixed(2)}s ===`);
    console.log(`Transport playing: ${isTransportPlaying}`);
    console.log(`Total loops to consider: ${placedLoops.length}`);

    const soloedTracks = Object.keys(trackStates).filter(trackId => trackStates[trackId].solo);
    const hasSoloedTracks = soloedTracks.length > 0;

    let scheduledCount = 0;
    let immediateCount = 0;
    let skippedCount = 0;

    placedLoops.forEach((loop, index) => {
      const player = playersRef.current[loop.id];
      const trackState = trackStates[`track-${loop.trackIndex}`] || {};
      
      console.log(`\nLoop ${index + 1}: ${loop.name}`);
      console.log(`  Time range: ${loop.startTime.toFixed(2)}s - ${loop.endTime.toFixed(2)}s`);
      console.log(`  Track: ${loop.trackIndex}, Muted: ${loop.muted || trackState.muted}`);
      console.log(`  Current time: ${currentTransportTime.toFixed(2)}s`);
      
      const shouldPlayBasedOnSolo = !hasSoloedTracks || trackState.solo;
      
      if (!player) {
        console.log(`  SKIPPED: No player`);
        skippedCount++;
        return;
      }
      
      if (loop.muted || trackState.muted) {
        console.log(`  SKIPPED: Muted`);
        skippedCount++;
        return;
      }
      
      if (!shouldPlayBasedOnSolo) {
        console.log(`  SKIPPED: Solo mode`);
        skippedCount++;
        return;
      }

      try {
        const totalDuration = loop.endTime - loop.startTime;
        const repeats = calculateLoopRepeats(loop, currentTransportTime);
        
        console.log(`  Repeats to schedule: ${repeats.length}`);
        
        const trackVolume = trackState.volume !== undefined ? trackState.volume : 0.7;
        const loopVolume = loop.volume !== undefined ? loop.volume : 0.8;
        const finalVolume = loopVolume * trackVolume * volume;
        
        if (player.isNative) {
          // Check if we're in the middle of this loop
          if (currentTransportTime >= loop.startTime && currentTransportTime < loop.endTime) {
            const remainingTime = loop.endTime - currentTransportTime;
            
            console.log(`  IN PROGRESS - Remaining time: ${remainingTime.toFixed(2)}s`);
            
            if (remainingTime >= 0.05) {
              const scheduleId = Tone.Transport.schedule((time) => {
                const actualTransportTime = Tone.Transport.seconds;
                const offsetIntoLoop = actualTransportTime - loop.startTime;
                const offsetIntoAudioFile = offsetIntoLoop % loop.duration;
                const actualRemainingTime = loop.endTime - actualTransportTime;
                
                console.log(`  PLAYING NOW: ${loop.name} at offset ${offsetIntoAudioFile.toFixed(2)}s`);
                
                try {
                  if (currentlyPlayingLoops.current.has(loop.id)) {
                    return;
                  }
                  
                  player.audio.volume = Math.max(0, Math.min(1, finalVolume));
                  player.audio.loop = true;
                  
                  // Wait for seek to complete before playing
                  const playAfterSeek = () => {
                    player.audio.removeEventListener('seeked', playAfterSeek);
                    
                    const promise = player.audio.play();
                    if (promise) {
                      promise.then(() => {
                        currentlyPlayingLoops.current.add(loop.id);
                        console.log(`  SUCCESS: ${loop.name} started playing`);
                        
                        loopTimeoutsRef.current[loop.id] = setTimeout(() => {
                          if (!player.audio.paused && currentlyPlayingLoops.current.has(loop.id)) {
                            player.audio.pause();
                            player.audio.currentTime = 0;
                            player.audio.loop = false;
                            currentlyPlayingLoops.current.delete(loop.id);
                            delete loopTimeoutsRef.current[loop.id];
                            console.log(`  STOPPED: ${loop.name} after ${actualRemainingTime.toFixed(2)}s`);
                          }
                        }, actualRemainingTime * 1000);
                      }).catch(e => {
                        console.error(`  ERROR playing ${loop.name}:`, e);
                      });
                    }
                  };
                  
                  // Set up seek listener
                  player.audio.addEventListener('seeked', playAfterSeek);
                  
                  // Trigger the seek
                  player.audio.currentTime = offsetIntoAudioFile;
                  
                } catch (playError) {
                  console.error(`  ERROR playing ${loop.name}:`, playError);
                }
              }, "+0");

              scheduledLoopsRef.current[loop.id] = scheduleId;
              scheduledCount++;
              console.log(`  SCHEDULED immediately ("+0")`);
            } else {
              console.log(`  SKIPPED: Remaining time too short (${remainingTime.toFixed(2)}s)`);
              skippedCount++;
            }
          } else if (loop.startTime > currentTransportTime) {
            // Future playback
            console.log(`  FUTURE - Will start at ${loop.startTime.toFixed(2)}s`);
            
            const scheduleId = Tone.Transport.schedule((time) => {
              try {
                player.audio.currentTime = 0;
                player.audio.volume = Math.max(0, Math.min(1, finalVolume));
                player.audio.loop = true;
                
                const promise = player.audio.play();
                if (promise) {
                  promise.then(() => {
                    currentlyPlayingLoops.current.add(loop.id);
                    console.log(`  SUCCESS: ${loop.name} started playing (future)`);
                    
                    loopTimeoutsRef.current[loop.id] = setTimeout(() => {
                      if (!player.audio.paused && currentlyPlayingLoops.current.has(loop.id)) {
                        player.audio.pause();
                        player.audio.currentTime = 0;
                        player.audio.loop = false;
                        currentlyPlayingLoops.current.delete(loop.id);
                        delete loopTimeoutsRef.current[loop.id];
                        console.log(`  STOPPED: ${loop.name} after ${totalDuration.toFixed(2)}s`);
                      }
                    }, totalDuration * 1000);
                  }).catch(e => {
                    console.error(`  ERROR playing ${loop.name}:`, e);
                  });
                }
              } catch (playError) {
                console.error(`  ERROR playing ${loop.name}:`, playError);
              }
            }, loop.startTime);

            scheduledLoopsRef.current[loop.id] = scheduleId;
            scheduledCount++;
            console.log(`  SCHEDULED at time ${loop.startTime.toFixed(2)}s`);
          } else {
            console.log(`  SKIPPED: Loop already passed (ends at ${loop.endTime.toFixed(2)}s)`);
            skippedCount++;
          }
        } else {
          // Tone.js player - schedule each repeat separately
          repeats.forEach((repeat) => {
            const scheduleKey = `${loop.id}-repeat-${repeat.index}`;
            
            if (currentTransportTime >= repeat.startTime && currentTransportTime < repeat.endTime) {
              const remainingTime = repeat.endTime - currentTransportTime;
              
              if (remainingTime >= 0.05) {
                const scheduleId = Tone.Transport.schedule((time) => {
                  try {
                    const dbValue = finalVolume === 0 ? -Infinity : Tone.gainToDb(finalVolume);
                    player.volume.value = dbValue;
                    
                    const offsetIntoLoop = currentTransportTime - repeat.startTime;
                    
                    if (remainingTime > 0.05) {
                      player.start(time, offsetIntoLoop, remainingTime);
                      currentlyPlayingLoops.current.add(scheduleKey);
                    }
                  } catch (playError) {
                    console.error(`  ERROR playing ${loop.name}:`, playError);
                  }
                }, "+0");

                scheduledLoopsRef.current[scheduleKey] = scheduleId;
                scheduledCount++;
              }
            } else if (repeat.startTime > currentTransportTime) {
              const scheduleId = Tone.Transport.schedule((time) => {
                try {
                  const dbValue = finalVolume === 0 ? -Infinity : Tone.gainToDb(finalVolume);
                  player.volume.value = dbValue;
                  player.start(time, 0, repeat.duration);
                  currentlyPlayingLoops.current.add(scheduleKey);
                } catch (playError) {
                  console.error(`  ERROR playing ${loop.name}:`, playError);
                }
              }, repeat.startTime);

              scheduledLoopsRef.current[scheduleKey] = scheduleId;
              scheduledCount++;
            }
          });
        }
        
      } catch (scheduleError) {
        console.error(`  ERROR scheduling ${loop.name}:`, scheduleError);
        skippedCount++;
      }
    });

    console.log(`\n=== SUMMARY: ${scheduledCount} scheduled, ${immediateCount} immediate, ${skippedCount} skipped ===\n`);
    lastScheduledLoops.current = placedLoops;
  }, [volume, startLoopWithOffset, stopAllCurrentLoops]);

  const play = useCallback(async () => {
    try {
      await initializeAudio();
      Tone.Transport.start();
    } catch (error) {
      console.error('Error starting playback:', error);
      throw error;
    }
  }, [initializeAudio]);

  const pause = useCallback(() => {
    Tone.Transport.pause();
    stopAllCurrentLoops();
  }, [stopAllCurrentLoops]);

  const stop = useCallback(() => {
    Tone.Transport.stop();
    setCurrentTime(0);
    stopAllCurrentLoops();
  }, [stopAllCurrentLoops]);

  const seek = useCallback((time) => {
    const clampedTime = Math.max(0, time);
    Tone.Transport.seconds = clampedTime;
    setCurrentTime(clampedTime);
    stopAllCurrentLoops();
  }, [stopAllCurrentLoops]);

  const setMasterVolume = useCallback((vol) => {
    const clampedVolume = Math.max(0, Math.min(1, vol));
    setVolume(clampedVolume);
    
    if (!isMuted && window.Tone) {
      const dbValue = clampedVolume === 0 ? -Infinity : window.Tone.gainToDb(clampedVolume);
      window.Tone.Destination.volume.value = dbValue;
    }
    
    Object.values(playersRef.current).forEach(player => {
      if (player && player.isNative && player.audio) {
        const finalVolume = isMuted ? 0 : clampedVolume;
        player.audio.volume = Math.max(0, Math.min(1, finalVolume));
      }
    });
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      
      if (newMuted) {
        if (window.Tone) {
          window.Tone.Destination.volume.value = -Infinity;
        }
        Object.values(playersRef.current).forEach(player => {
          if (player && player.isNative && player.audio) {
            player.audio.volume = 0;
          }
        });
      } else {
        if (window.Tone) {
          const dbValue = volume === 0 ? -Infinity : window.Tone.gainToDb(volume);
          window.Tone.Destination.volume.value = dbValue;
        }
        Object.values(playersRef.current).forEach(player => {
          if (player && player.isNative && player.audio) {
            player.audio.volume = Math.max(0, Math.min(1, volume));
          }
        });
      }
      
      return newMuted;
    });
  }, [volume]);

  const previewLoop = useCallback(async (loop) => {
    try {
      await initializeAudio();
      
      let player = playersRef.current[loop.id];
      if (!player) {
        player = await createLoopPlayer(loop);
      }
      
      if (player && (player.loaded || player.isNative)) {
        Object.values(playersRef.current).forEach(p => {
          if (p.loaded && p.state === 'started') {
            p.stop();
          }
          if (p.isNative && p.audio && !p.audio.paused) {
            p.stop();
          }
        });
        
        player.start();
      } else {
        throw new Error('Player not ready for preview');
      }
    } catch (error) {
      console.error('Error previewing loop:', error);
      throw error;
    }
  }, [initializeAudio, createLoopPlayer]);

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

  useEffect(() => {
    return () => {
      Tone.Transport.cancel();
      Tone.Transport.stop();
      
      Object.keys(loopTimeoutsRef.current).forEach(loopId => {
        if (loopTimeoutsRef.current[loopId]) {
          clearTimeout(loopTimeoutsRef.current[loopId]);
        }
      });
      
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