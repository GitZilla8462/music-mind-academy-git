// File: /src/lessons/shared/activities/layer-lab/LayerLabActivity.jsx
// Main Layer Lab component - Full-featured texture building activity
// Combines mini track sidebar with expanded editor view

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as Tone from 'tone';

// Local imports
import { 
  TRACK_TYPES, 
  STYLE_PRESETS, 
  CHORD_PROGRESSIONS, 
  SCALES,
  INSTRUMENT_SOUNDS,
  DRUM_KITS,
  GRID_COLS 
} from './trackConfig';

import {
  generateMelodyPattern,
  generateHarmonyPattern,
  generateRhythmPattern,
  generateBassPattern,
  generatePercussionPattern
} from './patternGenerators';

import MiniTrack from './components/MiniTrack';
import TrackEditor from './components/TrackEditor';
import StylePanel from './components/StylePanel';
import PlaybackControls from './components/PlaybackControls';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LayerLabActivity = ({ onComplete }) => {
  // Track state
  const [activeTracks, setActiveTracks] = useState(() => 
    TRACK_TYPES.filter(t => t.defaultEnabled).map(t => t.id)
  );
  const [selectedTrack, setSelectedTrack] = useState('melody');
  const [mutedTracks, setMutedTracks] = useState({});
  
  // Grid state for each track
  const [grids, setGrids] = useState(() => {
    const initial = {};
    TRACK_TYPES.forEach(track => {
      initial[track.id] = Array(track.rows).fill(null).map(() => 
        Array(GRID_COLS).fill(false)
      );
    });
    return initial;
  });
  
  // Sound selections per track
  const [trackSounds, setTrackSounds] = useState(() => {
    const initial = {};
    TRACK_TYPES.forEach(track => {
      initial[track.id] = track.defaultSound || track.defaultKit || 'bells';
    });
    return initial;
  });
  
  // Musical settings
  const [currentPreset, setCurrentPreset] = useState('pop');
  const [currentProgression, setCurrentProgression] = useState('pop');
  const [currentScale, setCurrentScale] = useState('pentatonic');
  const [bpm, setBpm] = useState(100);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  
  // UI state
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // Audio refs
  const synthsRef = useRef({});
  const drumKitsRef = useRef({});
  const sequenceRef = useRef(null);
  const isInitializedRef = useRef(false);
  
  // Performance: use refs for data accessed in audio callback
  const gridsRef = useRef(grids);
  const mutedTracksRef = useRef(mutedTracks);
  const activeTracksRef = useRef(activeTracks);
  const trackSoundsRef = useRef(trackSounds);
  const currentScaleRef = useRef(currentScale);
  
  // Keep refs in sync with state
  useEffect(() => { gridsRef.current = grids; }, [grids]);
  useEffect(() => { mutedTracksRef.current = mutedTracks; }, [mutedTracks]);
  useEffect(() => { activeTracksRef.current = activeTracks; }, [activeTracks]);
  useEffect(() => { trackSoundsRef.current = trackSounds; }, [trackSounds]);
  useEffect(() => { currentScaleRef.current = currentScale; }, [currentScale]);

  // CHROMEBOOK MEMORY OPTIMIZATION: Cleanup synths on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Layer Lab unmounting - disposing audio');

      // Dispose all melodic synths
      Object.values(synthsRef.current).forEach(synth => {
        try {
          synth.dispose();
        } catch (err) {}
      });
      synthsRef.current = {};

      // Dispose all drum kits
      Object.values(drumKitsRef.current).forEach(kit => {
        Object.values(kit).forEach(drum => {
          try {
            drum.dispose();
          } catch (err) {}
        });
      });
      drumKitsRef.current = {};

      // Stop and dispose sequence
      if (sequenceRef.current) {
        try {
          sequenceRef.current.stop();
          sequenceRef.current.dispose();
        } catch (err) {}
        sequenceRef.current = null;
      }

      // Stop transport
      try {
        Tone.Transport.stop();
      } catch (err) {}

      isInitializedRef.current = false;
    };
  }, []);

  // ============================================================================
  // AUDIO INITIALIZATION
  // ============================================================================
  
  const initAudio = useCallback(async () => {
    if (isInitializedRef.current) return;
    
    await Tone.start();
    
    // Create melodic synths
    Object.entries(INSTRUMENT_SOUNDS.melody).forEach(([key, config]) => {
      synthsRef.current[`melody_${key}`] = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: config.type },
        envelope: { attack: config.attack, decay: config.decay, sustain: config.sustain, release: config.release },
        volume: -10
      }).toDestination();
    });
    
    Object.entries(INSTRUMENT_SOUNDS.harmony).forEach(([key, config]) => {
      synthsRef.current[`harmony_${key}`] = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: config.type },
        envelope: { attack: config.attack, decay: config.decay, sustain: config.sustain, release: config.release },
        volume: -12
      }).toDestination();
    });
    
    Object.entries(INSTRUMENT_SOUNDS.bass).forEach(([key, config]) => {
      synthsRef.current[`bass_${key}`] = new Tone.MonoSynth({
        oscillator: { type: config.type },
        envelope: { attack: config.attack, decay: config.decay, sustain: config.sustain, release: config.release },
        volume: -6
      }).toDestination();
    });
    
    // Create drum kits
    Object.entries(DRUM_KITS).forEach(([kitName, kit]) => {
      drumKitsRef.current[kitName] = {
        kick: new Tone.MembraneSynth({ volume: -4 }).toDestination(),
        snare: new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.001, decay: kit.sounds.snare.decay, sustain: 0, release: 0.1 },
          volume: -10
        }).toDestination(),
        hihat: new Tone.MetalSynth({
          frequency: kit.sounds.hihat.freq,
          envelope: { attack: 0.001, decay: kit.sounds.hihat.decay, release: 0.01 },
          volume: -18
        }).toDestination(),
        tom: new Tone.MembraneSynth({ volume: -8 }).toDestination(),
        shaker: new Tone.NoiseSynth({
          noise: { type: 'pink' },
          envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
          volume: -16
        }).toDestination(),
        clap: new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
          volume: -12
        }).toDestination(),
        cowbell: new Tone.MetalSynth({
          frequency: 560,
          envelope: { attack: 0.001, decay: 0.1, release: 0.05 },
          volume: -16
        }).toDestination(),
        conga: new Tone.MembraneSynth({ volume: -10 }).toDestination()
      };
    });
    
    Tone.Transport.bpm.value = bpm;
    isInitializedRef.current = true;
    console.log('🎵 Layer Lab audio initialized');
  }, [bpm]);

  // ============================================================================
  // NOTE PLAYING
  // ============================================================================
  
  const getNoteFromScale = useCallback((noteIndex, octave) => {
    const scale = SCALES[currentScaleRef.current] || SCALES.pentatonic;
    const noteInScale = noteIndex % scale.notes.length;
    return scale.notes[noteInScale] + octave;
  }, []);

  const playNote = useCallback((trackId, rowIndex, time) => {
    const track = TRACK_TYPES.find(t => t.id === trackId);
    if (!track) return;
    
    const isDrum = trackId === 'rhythm' || trackId === 'percussion';
    const sounds = trackSoundsRef.current;
    
    if (isDrum) {
      const kit = drumKitsRef.current[sounds[trackId]] || drumKitsRef.current.acoustic;
      const drumMap = trackId === 'rhythm' 
        ? ['hihat', 'snare', 'kick', 'tom']
        : ['shaker', 'clap', 'cowbell', 'conga'];
      const drum = kit[drumMap[rowIndex]];
      
      if (drum) {
        if (drumMap[rowIndex] === 'kick' || drumMap[rowIndex] === 'tom' || drumMap[rowIndex] === 'conga') {
          drum.triggerAttackRelease('C2', '8n', time);
        } else {
          drum.triggerAttackRelease('8n', time);
        }
      }
    } else {
      const soundKey = sounds[trackId] || 'bells';
      const synthType = trackId.includes('bass') ? 'bass' : trackId.includes('harmony') ? 'harmony' : 'melody';
      const synth = synthsRef.current[`${synthType}_${soundKey}`];
      
      if (synth) {
        const invertedRow = (track.rows - 1) - rowIndex;
        const note = getNoteFromScale(invertedRow, track.octave);
        synth.triggerAttackRelease(note, '8n', time);
      }
    }
  }, [getNoteFromScale]);
  
  // For preview sounds (not during playback)
  const playPreviewNote = useCallback((trackId, rowIndex) => {
    const track = TRACK_TYPES.find(t => t.id === trackId);
    if (!track) return;
    
    const isDrum = trackId === 'rhythm' || trackId === 'percussion';
    
    if (isDrum) {
      const kit = drumKitsRef.current[trackSounds[trackId]] || drumKitsRef.current.acoustic;
      const drumMap = trackId === 'rhythm' 
        ? ['hihat', 'snare', 'kick', 'tom']
        : ['shaker', 'clap', 'cowbell', 'conga'];
      const drum = kit[drumMap[rowIndex]];
      
      if (drum) {
        if (drumMap[rowIndex] === 'kick' || drumMap[rowIndex] === 'tom' || drumMap[rowIndex] === 'conga') {
          drum.triggerAttackRelease('C2', '8n');
        } else {
          drum.triggerAttackRelease('8n');
        }
      }
    } else {
      const soundKey = trackSounds[trackId] || 'bells';
      const synthType = trackId.includes('bass') ? 'bass' : trackId.includes('harmony') ? 'harmony' : 'melody';
      const synth = synthsRef.current[`${synthType}_${soundKey}`];
      
      if (synth) {
        const invertedRow = (track.rows - 1) - rowIndex;
        const note = getNoteFromScale(invertedRow, track.octave);
        synth.triggerAttackRelease(note, '8n');
      }
    }
  }, [trackSounds, getNoteFromScale]);

  // ============================================================================
  // GRID OPERATIONS
  // ============================================================================
  
  const toggleCell = useCallback(async (trackId, row, col) => {
    await initAudio();
    
    setGrids(prev => {
      const newValue = !prev[trackId][row][col];
      const newGrids = { ...prev };
      newGrids[trackId] = prev[trackId].map((r, rIdx) =>
        rIdx === row ? r.map((c, cIdx) => cIdx === col ? newValue : c) : [...r]
      );
      
      if (newValue) playPreviewNote(trackId, row);
      return newGrids;
    });
  }, [initAudio, playPreviewNote]);

  const generatePatternForTrack = useCallback(async (trackId) => {
    await initAudio();
    const track = TRACK_TYPES.find(t => t.id === trackId);
    if (!track) return;
    
    let pattern;
    const options = { progression: currentProgression };
    
    if (trackId.includes('melody')) {
      pattern = generateMelodyPattern(track.rows, GRID_COLS, options);
    } else if (trackId.includes('harmony')) {
      pattern = generateHarmonyPattern(track.rows, GRID_COLS, options);
    } else if (trackId === 'rhythm') {
      pattern = generateRhythmPattern(track.rows, GRID_COLS, options);
    } else if (trackId === 'percussion') {
      pattern = generatePercussionPattern(track.rows, GRID_COLS, options);
    } else if (trackId.includes('bass')) {
      pattern = generateBassPattern(track.rows, GRID_COLS, options);
    }
    
    if (pattern) {
      setGrids(prev => ({ ...prev, [trackId]: pattern }));
    }
  }, [initAudio, currentProgression]);

  const clearTrack = useCallback((trackId) => {
    const track = TRACK_TYPES.find(t => t.id === trackId);
    if (!track) return;
    setGrids(prev => ({
      ...prev,
      [trackId]: Array(track.rows).fill(null).map(() => Array(GRID_COLS).fill(false))
    }));
  }, []);

  const generateAllPatterns = useCallback(async () => {
    await initAudio();
    activeTracks.forEach(trackId => {
      generatePatternForTrack(trackId);
    });
  }, [initAudio, activeTracks, generatePatternForTrack]);

  // ============================================================================
  // TRACK MANAGEMENT
  // ============================================================================
  
  const addTrack = (trackId) => {
    if (activeTracks.length < 8 && !activeTracks.includes(trackId)) {
      setActiveTracks(prev => [...prev, trackId]);
      setSelectedTrack(trackId);
    }
    setShowAddMenu(false);
  };

  const removeTrack = (trackId) => {
    if (activeTracks.length > 1) {
      setActiveTracks(prev => prev.filter(id => id !== trackId));
      clearTrack(trackId);
      if (selectedTrack === trackId) {
        setSelectedTrack(activeTracks.find(id => id !== trackId) || 'melody');
      }
    }
  };

  const toggleMute = (trackId) => {
    setMutedTracks(prev => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  // ============================================================================
  // PRESET APPLICATION
  // ============================================================================
  
  const applyPreset = useCallback(async (presetKey) => {
    const preset = STYLE_PRESETS[presetKey];
    if (!preset) return;
    
    setCurrentPreset(presetKey);
    setBpm(preset.bpm);
    setCurrentScale(preset.scale);
    setCurrentProgression(preset.progression);
    
    // Update sounds for each track type
    setTrackSounds(prev => ({
      ...prev,
      melody: preset.sounds.melody,
      melody2: preset.sounds.melody,
      harmony: preset.sounds.harmony,
      harmony2: preset.sounds.harmony,
      rhythm: Object.keys(DRUM_KITS).find(k => 
        DRUM_KITS[k].name.toLowerCase().includes(presetKey) || k === 'acoustic'
      ) || 'acoustic',
      bass: preset.sounds.bass,
      bass2: preset.sounds.bass
    }));
  }, []);

  // ============================================================================
  // PLAYBACK
  // ============================================================================
  
  useEffect(() => {
    if (!isPlaying || !isInitializedRef.current) return;
    
    Tone.Transport.bpm.value = bpm;
    
    sequenceRef.current = new Tone.Sequence(
      (time, col) => {
        // Update beat indicator using requestAnimationFrame for smoother UI
        Tone.Draw.schedule(() => {
          setCurrentBeat(col);
        }, time);
        
        // Use refs to avoid stale closures
        const currentGrids = gridsRef.current;
        const currentMuted = mutedTracksRef.current;
        const currentActive = activeTracksRef.current;
        
        currentActive.forEach(trackId => {
          if (currentMuted[trackId]) return;
          const grid = currentGrids[trackId];
          grid?.forEach((row, rowIdx) => {
            if (row[col]) playNote(trackId, rowIdx, time);
          });
        });
      },
      [...Array(GRID_COLS).keys()],
      '8n'
    );
    
    sequenceRef.current.start(0);
    Tone.Transport.start();
    
    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.stop();
        sequenceRef.current.dispose();
        sequenceRef.current = null;
      }
      Tone.Transport.stop();
      setCurrentBeat(-1);
    };
  }, [isPlaying, bpm, playNote]);

  const togglePlayback = useCallback(async () => {
    await initAudio();
    if (isPlaying) {
      Tone.Transport.stop();
      setCurrentBeat(-1);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, initAudio]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const activeLayerCount = activeTracks.filter(trackId => {
    if (mutedTracks[trackId]) return false;
    return grids[trackId]?.some(row => row.some(cell => cell));
  }).length;

  const selectedTrackData = TRACK_TYPES.find(t => t.id === selectedTrack);
  const availableTracks = TRACK_TYPES.filter(t => !activeTracks.includes(t.id));

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: 'white',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '22px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #FFD700, #FF6B6B, #4ECDC4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🎨 Layer Lab
        </h1>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          Build musical texture with layers
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden',
        padding: '8px'
      }}>
        {/* Left Sidebar - Mini Tracks */}
        <div style={{
          width: '200px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          paddingRight: '8px',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          overflow: 'auto',
          flexShrink: 0
        }}>
          {/* Style Panel */}
          <StylePanel
            currentPreset={currentPreset}
            currentProgression={currentProgression}
            currentScale={currentScale}
            currentBpm={bpm}
            onPresetSelect={applyPreset}
            onProgressionChange={setCurrentProgression}
            onScaleChange={setCurrentScale}
            onBpmChange={setBpm}
            onGenerateAll={generateAllPatterns}
          />

          {/* Track List */}
          {activeTracks.map(trackId => {
            const track = TRACK_TYPES.find(t => t.id === trackId);
            if (!track) return null;
            
            return (
              <MiniTrack
                key={trackId}
                track={track}
                grid={grids[trackId]}
                isSelected={selectedTrack === trackId}
                isMuted={mutedTracks[trackId]}
                currentBeat={currentBeat}
                isPlaying={isPlaying}
                onSelect={() => setSelectedTrack(trackId)}
                onToggleMute={() => toggleMute(trackId)}
                onRemove={() => removeTrack(trackId)}
                canRemove={activeTracks.length > 1}
              />
            );
          })}

          {/* Add Track Button */}
          {activeTracks.length < 8 && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px dashed rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                ➕ Add Layer ({activeTracks.length}/8)
              </button>

              {showAddMenu && availableTracks.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {availableTracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => addTrack(track.id)}
                      style={{
                        padding: '8px',
                        border: `1px solid ${track.color}`,
                        borderRadius: '6px',
                        background: track.bgColor,
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{track.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{track.name}</div>
                        <div style={{ fontSize: '9px', opacity: 0.7 }}>{track.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div style={{ 
          flex: 1, 
          marginLeft: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {selectedTrackData && (
            <TrackEditor
              track={selectedTrackData}
              grid={grids[selectedTrack]}
              currentBeat={currentBeat}
              isPlaying={isPlaying}
              isMuted={mutedTracks[selectedTrack]}
              selectedSound={trackSounds[selectedTrack]}
              selectedKit={trackSounds[selectedTrack]}
              scale={currentScale}
              onCellToggle={(row, col) => toggleCell(selectedTrack, row, col)}
              onGeneratePattern={() => generatePatternForTrack(selectedTrack)}
              onClear={() => clearTrack(selectedTrack)}
              onToggleMute={() => toggleMute(selectedTrack)}
              onSoundChange={(sound) => setTrackSounds(prev => ({ ...prev, [selectedTrack]: sound }))}
              onKitChange={(kit) => setTrackSounds(prev => ({ ...prev, [selectedTrack]: kit }))}
            />
          )}
        </div>
      </div>

      {/* Playback Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        currentBeat={currentBeat}
        bpm={bpm}
        activeLayerCount={activeLayerCount}
        onTogglePlay={togglePlayback}
        onBpmChange={setBpm}
      />
    </div>
  );
};

export default LayerLabActivity;