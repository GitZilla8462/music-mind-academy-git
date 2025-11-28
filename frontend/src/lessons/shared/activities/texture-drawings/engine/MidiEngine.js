/**
 * MidiEngine.js - MIDI File Parser and Data Provider
 * 
 * Loads and parses MIDI files, provides note data for visualization.
 */

import { Midi } from '@tonejs/midi';

class MidiEngine {
  constructor() {
    this.tracks = {};
    this.startOffset = 0; // Time of the earliest note
    this.endTime = 0; // Time of the last note end
    this.isLoaded = false;
  }

  /**
   * Load MIDI files from instrument configs
   */
  async loadTracks(instruments) {
    let earliestNote = Infinity;
    let latestEnd = 0;

    const loadPromises = instruments.map(async (inst) => {
      if (!inst.midi) return;

      try {
        const response = await fetch(inst.midi);
        if (!response.ok) {
          console.warn(`Could not load MIDI for ${inst.name}: ${inst.midi}`);
          return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const midi = new Midi(arrayBuffer);

        // Extract notes from all tracks in the MIDI file
        const notes = [];
        let minPitch = 127;
        let maxPitch = 0;

        midi.tracks.forEach(track => {
          track.notes.forEach(note => {
            notes.push({
              time: note.time,
              duration: note.duration,
              endTime: note.time + note.duration,
              pitch: note.midi,
              velocity: note.velocity,
              name: note.name
            });

            minPitch = Math.min(minPitch, note.midi);
            maxPitch = Math.max(maxPitch, note.midi);

            // Track global timing
            if (note.time < earliestNote) {
              earliestNote = note.time;
            }
            if (note.time + note.duration > latestEnd) {
              latestEnd = note.time + note.duration;
            }
          });
        });

        // Sort notes by time
        notes.sort((a, b) => a.time - b.time);

        this.tracks[inst.id] = {
          notes,
          minPitch,
          maxPitch,
          noteCount: notes.length,
          name: inst.name,
          color: inst.color
        };

        console.log(`✅ MIDI loaded: ${inst.name} - ${notes.length} notes (${minPitch}-${maxPitch})`);
      } catch (err) {
        console.warn(`Error loading MIDI for ${inst.name}:`, err);
      }
    });

    await Promise.allSettled(loadPromises);

    // Set global timing info
    this.startOffset = earliestNote !== Infinity ? earliestNote : 0;
    this.endTime = latestEnd;
    this.isLoaded = true;

    console.log(`🎵 MIDI Engine ready - Start: ${this.startOffset.toFixed(2)}s, End: ${this.endTime.toFixed(2)}s`);

    return {
      startOffset: this.startOffset,
      endTime: this.endTime
    };
  }

  /**
   * Get notes for a specific track
   */
  getTrackNotes(trackId) {
    return this.tracks[trackId]?.notes || [];
  }

  /**
   * Get track info
   */
  getTrackInfo(trackId) {
    return this.tracks[trackId] || null;
  }

  /**
   * Get all track IDs
   */
  getTrackIds() {
    return Object.keys(this.tracks);
  }

  /**
   * Get notes that are active at a specific time
   */
  getActiveNotes(trackId, time) {
    const notes = this.tracks[trackId]?.notes || [];
    return notes.filter(note => 
      time >= note.time && time < note.endTime
    );
  }

  /**
   * Check if any notes are active at a time across all tracks
   */
  hasActiveNotes(time) {
    return Object.keys(this.tracks).some(trackId => 
      this.getActiveNotes(trackId, time).length > 0
    );
  }
}

export default MidiEngine;