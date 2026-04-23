// VirtualInstrumentOverlay.jsx
// Bottom overlay for the Film Music DAW
// Contains instrument selector, scale dropdown, keyboard/drum pads, and record controls
// Owns the Tone.js synth lifecycle and note recording

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Circle, Square, ChevronDown, Music } from 'lucide-react';
import * as Tone from 'tone';
import InstrumentKeyboard from './InstrumentKeyboard';
import DrumPadGrid from './DrumPadGrid';
import InstrumentSelector from './InstrumentSelector';
import { INSTRUMENTS, KEY_TO_NOTE, KEY_TO_PAD, DRUM_PADS, SCALES, OCTAVE_RANGES, getNotesForOctave, getScaleForOctave, getLabelsForOctave } from './instrumentConfig';

const VirtualInstrumentOverlay = ({
  onClose,
  onRecordingComplete,
  isRecording,
  onRecordStart,
  onRecordStop,
  recordingStartTime,
  embedded = false, // When true: no close button, compact positioning
  showRecord = undefined, // Override record button visibility (default: !embedded)
  allowedNotes: externalAllowedNotes = undefined, // External override — when provided, scale dropdown is hidden
  defaultScale = null, // Optional default scale ID (e.g. 'major') for initial dropdown value
  highlightedKeys = null, // Optional Set of note strings to highlight (for playback visualization)
  keyboardOnly = false, // When true: hide Pads/Bow mode toggle, keyboard only
}) => {
  const [mode, setMode] = useState('keyboard'); // 'keyboard' | 'drums' | 'strings'
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [activePads, setActivePads] = useState(new Set());

  // Scale state — internal, used when externalAllowedNotes is NOT provided
  const [selectedScaleId, setSelectedScaleId] = useState(defaultScale || 'chromatic');
  const [scaleDropdownOpen, setScaleDropdownOpen] = useState(false);
  const scaleDropdownRef = useRef(null);

  // Octave range state
  const [selectedOctave, setSelectedOctave] = useState('middle'); // 'low' | 'middle' | 'high'
  const [octaveDropdownOpen, setOctaveDropdownOpen] = useState(false);
  const octaveDropdownRef = useRef(null);

  const activeOctaveRange = OCTAVE_RANGES.find(o => o.id === selectedOctave) || OCTAVE_RANGES[1];
  const octaveNotes = getNotesForOctave(activeOctaveRange.octave);

  // Build key-to-note map for the current octave
  const currentKeyToNote = {};
  octaveNotes.forEach(n => { currentKeyToNote[n.key] = n.note; });

  // Determine the active scale (shifted to current octave)
  const activeScale = (() => {
    if (externalAllowedNotes !== undefined) return null; // externally controlled
    return SCALES.find(s => s.id === selectedScaleId) || null;
  })();
  const activeAllowedNotes = externalAllowedNotes !== undefined
    ? externalAllowedNotes
    : (activeScale ? getScaleForOctave(activeScale, activeOctaveRange.octave) : null);
  const activeLabels = externalAllowedNotes !== undefined
    ? null
    : (activeScale ? getLabelsForOctave(activeScale?.labels, activeOctaveRange.octave) : null);

  // Close dropdowns on click outside
  useEffect(() => {
    if (!scaleDropdownOpen && !octaveDropdownOpen) return;
    const handle = (e) => {
      if (scaleDropdownOpen && scaleDropdownRef.current && !scaleDropdownRef.current.contains(e.target)) {
        setScaleDropdownOpen(false);
      }
      if (octaveDropdownOpen && octaveDropdownRef.current && !octaveDropdownRef.current.contains(e.target)) {
        setOctaveDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [scaleDropdownOpen, octaveDropdownOpen]);

  // Synth refs
  const melodySynthRef = useRef(null);
  const pendingSamplerRef = useRef(null); // sampler loading in background
  const drumSynthsRef = useRef({});

  // Recording state — use refs to avoid stale closures in note handlers
  const recordedNotesRef = useRef([]);
  const noteStartTimesRef = useRef({});
  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;
  const recordingStartTimeRef = useRef(recordingStartTime);
  recordingStartTimeRef.current = recordingStartTime;

  // Initialize/update melody synth — PolySynth plays instantly, Sampler swaps in when loaded
  useEffect(() => {
    const inst = INSTRUMENTS[selectedInstrument];
    if (!inst) return;

    if (melodySynthRef.current) {
      melodySynthRef.current.dispose();
      melodySynthRef.current = null;
    }
    if (pendingSamplerRef.current) {
      try { pendingSamplerRef.current.dispose(); } catch(e) {}
      pendingSamplerRef.current = null;
    }

    // Create PolySynth immediately — plays instantly, no loading needed
    const polySynth = new Tone.PolySynth(Tone.Synth, inst.config).toDestination();
    polySynth.volume.value = -6;
    melodySynthRef.current = polySynth;

    // Load Sampler in background, swap in when ready for better sound quality
    if (inst.useSampler && inst.samples) {
      const sampler = new Tone.Sampler({
        urls: inst.samples.urls,
        baseUrl: inst.samples.baseUrl,
        attack: inst.samplerAttack || 0,
        release: inst.config?.envelope?.release || 1,
        onload: () => {
          if (pendingSamplerRef.current !== sampler) { sampler.dispose(); return; }
          const old = melodySynthRef.current;
          melodySynthRef.current = sampler;
          pendingSamplerRef.current = null;
          if (old) try { old.dispose(); } catch(e) {}
        },
        onerror: () => {
          if (pendingSamplerRef.current === sampler) pendingSamplerRef.current = null;
          try { sampler.dispose(); } catch(e) {}
        },
      }).toDestination();
      sampler.volume.value = -6;
      pendingSamplerRef.current = sampler;
    }

    return () => {
      if (melodySynthRef.current) {
        melodySynthRef.current.dispose();
        melodySynthRef.current = null;
      }
      if (pendingSamplerRef.current) {
        try { pendingSamplerRef.current.dispose(); } catch(e) {}
        pendingSamplerRef.current = null;
      }
    };
  }, [selectedInstrument]);

  // Initialize drum synths once
  useEffect(() => {
    const synths = {};
    DRUM_PADS.forEach((pad) => {
      if (pad.synthType === 'membrane') {
        synths[pad.id] = new Tone.MembraneSynth(pad.config).toDestination();
      } else if (pad.synthType === 'noise') {
        synths[pad.id] = new Tone.NoiseSynth(pad.config).toDestination();
      } else if (pad.synthType === 'metal') {
        synths[pad.id] = new Tone.MetalSynth(pad.config).toDestination();
      }
      if (synths[pad.id]) {
        synths[pad.id].volume.value = -6;
      }
    });
    drumSynthsRef.current = synths;

    return () => {
      Object.values(synths).forEach(s => s.dispose());
      drumSynthsRef.current = {};
    };
  }, []);

  // Get the actual note to play (with octave shift for bass)
  const getPlayNote = useCallback((note) => {
    const inst = INSTRUMENTS[selectedInstrument];
    if (inst?.octaveShift) {
      const match = note.match(/([A-G]#?)(\d)/);
      if (match) {
        return `${match[1]}${parseInt(match[2]) + inst.octaveShift}`;
      }
    }
    return note;
  }, [selectedInstrument]);

  // Pre-warm audio context on first pointer interaction (no delay on first note)
  const audioWarmedRef = useRef(false);
  useEffect(() => {
    const warmUp = () => {
      if (!audioWarmedRef.current) {
        Tone.start();
        audioWarmedRef.current = true;
      }
    };
    // Listen for any click/touch to start audio context early
    document.addEventListener('pointerdown', warmUp, { once: true });
    return () => document.removeEventListener('pointerdown', warmUp);
  }, []);

  // Note start (keyboard)
  const handleNoteStart = useCallback((note) => {
    const synth = melodySynthRef.current;
    if (!synth) return;

    const playNote = getPlayNote(note);

    // Ensure audio context is running
    if (Tone.context.state !== 'running') {
      Tone.start().then(() => {
        try { synth.triggerAttack(playNote, Tone.now()); } catch(e) {}
      });
      setPressedKeys(prev => new Set(prev).add(note));
      if (isRecordingRef.current && recordingStartTimeRef.current != null) {
        noteStartTimesRef.current[note] = Tone.now();
      }
      return;
    }

    synth.triggerAttack(playNote, Tone.now());
    setPressedKeys(prev => new Set(prev).add(note));

    // Track note start time for recording (use refs to avoid stale closure)
    if (isRecordingRef.current && recordingStartTimeRef.current != null) {
      noteStartTimesRef.current[note] = Tone.now();
    }
  }, [getPlayNote]);

  // Note end (keyboard)
  const handleNoteEnd = useCallback((note) => {
    const synth = melodySynthRef.current;
    if (!synth) return;

    const playNote = getPlayNote(note);
    synth.triggerRelease(playNote, Tone.now());
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });

    // Record the note with duration (use refs to avoid stale closure)
    if (isRecordingRef.current && recordingStartTimeRef.current != null && noteStartTimesRef.current[note]) {
      const startTime = noteStartTimesRef.current[note];
      const duration = Tone.now() - startTime;
      const timestamp = startTime - recordingStartTimeRef.current;

      recordedNotesRef.current.push({
        note: playNote,
        timestamp: Math.max(0, timestamp),
        duration: Math.max(0.05, duration), // minimum 50ms
      });

      delete noteStartTimesRef.current[note];
    }
  }, [getPlayNote]);

  // Drum pad hit
  const handlePadHit = useCallback((padId) => {
    const synth = drumSynthsRef.current[padId];
    if (!synth) return;

    const playDrum = () => {
      const pad = DRUM_PADS.find(p => p.id === padId);
      if (pad.synthType === 'membrane') {
        synth.triggerAttackRelease('C2', 0.2);
      } else {
        synth.triggerAttackRelease(0.2);
      }
    };

    if (Tone.context.state !== 'running') {
      Tone.start().then(playDrum);
    } else {
      playDrum();
    }

    // Visual feedback
    setActivePads(prev => new Set(prev).add(padId));
    setTimeout(() => {
      setActivePads(prev => {
        const next = new Set(prev);
        next.delete(padId);
        return next;
      });
    }, 100);

    // Record drum hit
    if (isRecordingRef.current && recordingStartTimeRef.current != null) {
      recordedNotesRef.current.push({
        note: `drum-${padId}`,
        timestamp: Math.max(0, Tone.now() - recordingStartTimeRef.current),
        duration: 0.2,
      });
    }
  }, [isRecording, recordingStartTime]);

  // Computer keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      // Don't capture keyboard when typing in an input
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
      const key = e.key.toLowerCase();

      if (mode === 'keyboard') {
        const note = currentKeyToNote[key];
        // Block notes not in the active scale
        if (note && activeAllowedNotes && !activeAllowedNotes.has(note)) return;
        if (note && !pressedKeys.has(note)) {
          handleNoteStart(note);
        }
      } else {
        const pad = KEY_TO_PAD[key];
        if (pad) {
          handlePadHit(pad.id);
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();

      if (mode === 'keyboard') {
        const note = currentKeyToNote[key];
        if (note) {
          handleNoteEnd(note);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, pressedKeys, handleNoteStart, handleNoteEnd, handlePadHit, activeAllowedNotes, currentKeyToNote]);

  // Watch for external stop — when parent sets isRecording from true to false, flush notes
  const prevIsRecordingRef = useRef(isRecording);
  useEffect(() => {
    if (prevIsRecordingRef.current && !isRecording) {
      // Recording just stopped externally — flush captured notes
      Object.keys(noteStartTimesRef.current).forEach(note => {
        handleNoteEnd(note);
      });
      const notes = [...recordedNotesRef.current];
      recordedNotesRef.current = [];
      noteStartTimesRef.current = {};
      if (notes.length > 0) {
        onRecordingComplete(notes, selectedInstrument, mode);
      }
    }
    prevIsRecordingRef.current = isRecording;
  }, [isRecording]);

  // Handle record toggle (internal button click)
  const handleRecordToggle = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    if (isRecording) {
      // Stop recording — flush any held notes
      Object.keys(noteStartTimesRef.current).forEach(note => {
        handleNoteEnd(note);
      });

      const notes = [...recordedNotesRef.current];
      recordedNotesRef.current = [];
      noteStartTimesRef.current = {};

      onRecordStop();

      if (notes.length > 0) {
        onRecordingComplete(notes, selectedInstrument, mode);
      }
    } else {
      // Start recording
      recordedNotesRef.current = [];
      noteStartTimesRef.current = {};
      onRecordStart();
    }
  }, [isRecording, selectedInstrument, mode, onRecordStart, onRecordStop, onRecordingComplete, handleNoteEnd]);

  const instrumentColor = (() => {
    if (mode === 'drums') return '#F59E0B';
    const inst = INSTRUMENTS[selectedInstrument];
    const colorMap = { motif: '#3B82F6', bass: '#10B981', harmony: '#8B5CF6' };
    return colorMap[inst?.trackTarget] || '#3B82F6';
  })();

  // Current scale label for dropdown button
  const selectedScale = SCALES.find(s => s.id === selectedScaleId);
  const scaleLabel = selectedScale
    ? (selectedScale.character ? `${selectedScale.character} — ${selectedScale.name}` : selectedScale.name)
    : 'All Notes';
  const showScaleDropdown = externalAllowedNotes === undefined && mode === 'keyboard';

  return (
    <div
      className={`bg-gray-900 border border-gray-700 flex flex-col z-30 ${
        embedded
          ? 'rounded-xl shadow-2xl'
          : 'absolute inset-x-0 bottom-0 border-t'
      }`}
      style={embedded ? { height: '380px', width: '100%' } : { height: '55%' }}
    >
      {/* Header bar: Scale → Instrument → Notes (octave) */}
      <div className="flex items-center justify-between bg-gray-800/80 border-b border-gray-700">
        <div className="flex items-center">
          {/* 1. Scale dropdown — only in keyboard mode, only when not externally controlled */}
          {showScaleDropdown && (
            <>
              <div ref={scaleDropdownRef} className="relative">
                <button
                  onClick={() => setScaleDropdownOpen(!scaleDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-[11px] font-medium text-white transition-colors mx-1"
                >
                  <Music className="w-3 h-3" />
                  {scaleLabel}
                  <ChevronDown size={10} className={`text-gray-400 transition-transform ${scaleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {scaleDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl py-1 z-50"
                    style={{ minWidth: 220 }}
                  >
                    {SCALES.map((s) => {
                      const isSelected = selectedScaleId === s.id;
                      const label = s.character ? `${s.character} — ${s.name}` : s.name;
                      return (
                        <button
                          key={s.id}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                            isSelected ? 'bg-blue-600/20 text-blue-300' : 'text-gray-300 hover:bg-gray-700'
                          }`}
                          onClick={() => { setSelectedScaleId(s.id); setScaleDropdownOpen(false); }}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          <span>{label}</span>
                          {isSelected && <span className="ml-auto text-blue-400 text-[10px]">active</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="w-px h-5 bg-gray-700 mx-1" />
            </>
          )}

          {/* 2. Instrument selector */}
          <InstrumentSelector
            selectedInstrument={selectedInstrument}
            onInstrumentChange={setSelectedInstrument}
            mode={mode}
            onModeChange={setMode}
            keyboardOnly={keyboardOnly}
          />

          {/* 3. Octave range — only in keyboard mode */}
          {mode === 'keyboard' && (
            <>
              <div className="w-px h-5 bg-gray-700 mx-1" />
              <div ref={octaveDropdownRef} className="relative">
                <button
                  onClick={() => setOctaveDropdownOpen(!octaveDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-[11px] font-medium text-white transition-colors mx-1"
                >
                  {activeOctaveRange.name} {activeOctaveRange.label}
                  <ChevronDown size={10} className={`text-gray-400 transition-transform ${octaveDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {octaveDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl py-1 z-50" style={{ minWidth: 200 }}>
                    {OCTAVE_RANGES.map((o) => {
                      const isSelected = selectedOctave === o.id;
                      return (
                        <button
                          key={o.id}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                            isSelected ? 'bg-blue-600/20 text-blue-300' : 'text-gray-300 hover:bg-gray-700'
                          }`}
                          onClick={() => { setSelectedOctave(o.id); setOctaveDropdownOpen(false); }}
                        >
                          <span className="font-medium">{o.name}</span>
                          <span className="text-gray-500">{o.label}</span>
                          {isSelected && <span className="ml-auto text-blue-400 text-[10px]">active</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 px-4">
          {/* Record button */}
          {(showRecord !== undefined ? showRecord : !embedded) && (
            <button
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40'
                  : 'bg-gray-700 text-gray-300 hover:bg-red-600/80 hover:text-white'
              }`}
              onClick={handleRecordToggle}
            >
              {isRecording ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  Record
                </>
              )}
            </button>
          )}

          {/* Close button — hidden in embedded mode */}
          {!embedded && (
            <button
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Instrument area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {mode === 'keyboard' ? (
          <InstrumentKeyboard
            pressedKeys={pressedKeys}
            onNoteStart={handleNoteStart}
            onNoteEnd={handleNoteEnd}
            instrumentColor={instrumentColor}
            allowedNotes={activeAllowedNotes}
            noteLabels={activeLabels}
            highlightedKeys={highlightedKeys}
            notes={octaveNotes}
          />
        ) : (
          <DrumPadGrid
            activePads={activePads}
            onPadHit={handlePadHit}
          />
        )}
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-900/80 text-red-200 px-4 py-1.5 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Recording — play notes to capture
        </div>
      )}
    </div>
  );
};

export default VirtualInstrumentOverlay;
