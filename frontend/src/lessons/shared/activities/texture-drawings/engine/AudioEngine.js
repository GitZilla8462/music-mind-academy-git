/**
 * AudioEngine.js - Synchronized Multi-Track Audio Playback
 * 
 * Handles loading, syncing, and playing multiple audio tracks
 * with precise timing control like a DAW.
 */

class AudioEngine {
  constructor() {
    this.tracks = {};
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.startOffset = 0; // Where playback should start (e.g., MIDI first note)
    this.onTimeUpdate = null;
    this.onEnded = null;
    this.animationFrameId = null;
    this.masterStartTime = 0; // When playback started (performance.now)
    this.pausedAt = 0; // Where we paused
  }

  /**
   * Load audio tracks from instrument configs
   */
  async loadTracks(instruments) {
    const loadPromises = instruments.map(async (inst) => {
      if (!inst.audio) return;
      
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = inst.audio;
        
        await new Promise((resolve, reject) => {
          audio.oncanplaythrough = resolve;
          audio.onerror = () => {
            console.warn(`⚠️ Could not load audio for ${inst.name}: ${inst.audio}`);
            reject(new Error(`Failed to load ${inst.audio}`));
          };
        });
        
        this.tracks[inst.id] = {
          audio,
          enabled: true,
          name: inst.name
        };
        
        // Set duration from first loaded track
        if (this.duration === 0) {
          this.duration = audio.duration;
        }
        
        console.log(`✅ Loaded audio for ${inst.name}: ${audio.duration.toFixed(2)}s`);
      } catch (err) {
        console.warn(`Failed to load ${inst.name}:`, err.message);
      }
    });
    
    await Promise.allSettled(loadPromises);
    return this.duration;
  }

  /**
   * Set the start offset (where playhead begins, e.g., first MIDI note)
   */
  setStartOffset(offset) {
    this.startOffset = offset;
    this.currentTime = offset;
    this.pausedAt = offset;
    
    // Seek all tracks to this position
    Object.values(this.tracks).forEach(track => {
      track.audio.currentTime = offset;
    });
  }

  /**
   * Play all enabled tracks synchronized
   */
  play() {
    if (this.isPlaying) return;
    
    console.log('▶️ AudioEngine.play() called');
    console.log('   Tracks:', Object.keys(this.tracks));
    
    this.isPlaying = true;
    this.masterStartTime = performance.now() - (this.pausedAt * 1000);
    
    // Start all enabled tracks
    let playedCount = 0;
    Object.entries(this.tracks).forEach(([id, track]) => {
      if (track.enabled) {
        track.audio.currentTime = this.pausedAt;
        track.audio.play()
          .then(() => {
            console.log(`   ✅ Playing: ${track.name}`);
            playedCount++;
          })
          .catch(err => {
            console.warn(`   ❌ Play error for ${track.name}:`, err.message);
          });
      }
    });
    
    // Start the animation frame loop for smooth time updates
    this.startTimeLoop();
  }

  /**
   * Pause all tracks
   */
  pause() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    this.pausedAt = this.currentTime;
    
    // Pause all tracks
    Object.values(this.tracks).forEach(track => {
      track.audio.pause();
    });
    
    // Stop the animation loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Stop and reset to start offset
   */
  stop() {
    this.pause();
    this.seekTo(this.startOffset);
  }

  /**
   * Seek to a specific time
   */
  seekTo(time) {
    this.currentTime = time;
    this.pausedAt = time;
    
    // Seek all tracks
    Object.values(this.tracks).forEach(track => {
      track.audio.currentTime = time;
    });
    
    // Update master start time if playing
    if (this.isPlaying) {
      this.masterStartTime = performance.now() - (time * 1000);
    }
    
    // Notify listener
    if (this.onTimeUpdate) {
      this.onTimeUpdate(time);
    }
  }

  /**
   * Toggle a track on/off
   */
  toggleTrack(trackId, enabled) {
    const track = this.tracks[trackId];
    if (!track) return;
    
    track.enabled = enabled;
    
    if (this.isPlaying) {
      if (enabled) {
        track.audio.currentTime = this.currentTime;
        track.audio.play().catch(() => {});
      } else {
        track.audio.pause();
      }
    }
  }

  /**
   * Animation frame loop for smooth time updates
   */
  startTimeLoop() {
    const update = () => {
      if (!this.isPlaying) return;
      
      // Get current time from the first enabled audio track (source of truth)
      // This ensures playhead matches actual audio position
      let audioTime = null;
      for (const track of Object.values(this.tracks)) {
        if (track.enabled && !track.audio.paused) {
          audioTime = track.audio.currentTime;
          break;
        }
      }
      
      // Use audio time if available, otherwise fall back to master clock
      if (audioTime !== null) {
        this.currentTime = audioTime;
      } else {
        // Fallback to performance.now() calculation
        this.currentTime = (performance.now() - this.masterStartTime) / 1000;
      }
      
      // Check if we've reached the end
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.pause();
        this.seekTo(this.startOffset);
        if (this.onEnded) {
          this.onEnded();
        }
        return;
      }
      
      // Notify listener
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.currentTime);
      }
      
      // Continue loop
      this.animationFrameId = requestAnimationFrame(update);
    };
    
    this.animationFrameId = requestAnimationFrame(update);
  }

  /**
   * Cleanup
   */
  destroy() {
    this.pause();
    Object.values(this.tracks).forEach(track => {
      track.audio.src = '';
    });
    this.tracks = {};
  }
}

export default AudioEngine;