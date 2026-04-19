// StringSlider.jsx
// Virtual string instrument — click and drag to play real sampled string notes
// Uses Tone.Sampler with violin/cello samples for realistic sound
// 4 strings (C, G, D, A), drag horizontally to play different notes

import React, { useCallback, useRef, useState, useEffect } from 'react';
import * as Tone from 'tone';

// Note names for display
const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Each string covers a range of semitones — like a real cello/violin
const STRINGS = [
  { id: 'string-1', name: 'A', color: '#EF4444', startNote: 57, endNote: 69 }, // A3 to A4
  { id: 'string-2', name: 'D', color: '#F59E0B', startNote: 50, endNote: 62 }, // D3 to D4
  { id: 'string-3', name: 'G', color: '#10B981', startNote: 43, endNote: 55 }, // G2 to G3
  { id: 'string-4', name: 'C', color: '#3B82F6', startNote: 36, endNote: 48 }, // C2 to C3
];

// MIDI note number to note name
const midiToNote = (midi) => {
  const octave = Math.floor(midi / 12) - 1;
  const name = ALL_NOTES[midi % 12];
  return `${name}${octave}`;
};

// Sample base URL
const SAMPLE_BASE = '/samples/strings';

const StringSlider = ({ isRecording, recordingStartTime, onStringNote, octaveShift = 0 }) => {
  const containerRef = useRef(null);
  const samplerRef = useRef(null);
  const reverbRef = useRef(null);
  const activeStringRef = useRef(null);
  const lastNoteRef = useRef(null);
  const [activeString, setActiveString] = useState(null);
  const [currentNote, setCurrentNote] = useState('');
  const [fingerX, setFingerX] = useState({}); // per-string finger position
  const [stringVibrations, setStringVibrations] = useState({});
  const [samplerLoaded, setSamplerLoaded] = useState(false);

  // Initialize sampler with real string samples
  useEffect(() => {
    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.2 }).toDestination();
    const filter = new Tone.Filter({ frequency: 4000, type: 'lowpass' }).connect(reverb);

    const sampler = new Tone.Sampler({
      urls: {
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        E4: 'E4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
      },
      baseUrl: `${SAMPLE_BASE}/`,
      attack: 0.08,
      release: 0.6,
      onload: () => {
        setSamplerLoaded(true);
      },
    }).connect(filter);
    sampler.volume.value = -4;

    samplerRef.current = sampler;
    reverbRef.current = reverb;

    return () => {
      sampler.dispose();
      filter.dispose();
      reverb.dispose();
      samplerRef.current = null;
    };
  }, []);

  // Convert x position (0-1) to exact MIDI value (with decimals for sub-semitone)
  const posToExactMidi = useCallback((x, string) => {
    const shift = octaveShift * 12;
    const start = string.startNote + shift;
    const end = string.endNote + shift;
    return start + x * (end - start);
  }, [octaveShift]);

  // Convert x position to nearest MIDI note (integer)
  const posToMidi = useCallback((x, string) => {
    return Math.round(posToExactMidi(x, string));
  }, [posToExactMidi]);

  // Get normalized x position from pointer event relative to string element
  const getPosition = useCallback((e, stringEl) => {
    const rect = stringEl.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }, []);

  const baseMidiRef = useRef(null); // the MIDI note currently sounding

  // Play or bend a note — uses detune for smooth sub-semitone sliding
  const playNote = useCallback((exactMidi, string) => {
    const sampler = samplerRef.current;
    if (!sampler || !samplerLoaded) return;
    if (Tone.context.state !== 'running') Tone.start();

    const nearestMidi = Math.round(exactMidi);
    const noteName = midiToNote(nearestMidi);
    const detuneAmount = (exactMidi - nearestMidi) * 100; // cents

    // If no note playing or we've drifted more than 2 semitones from base, retrigger
    if (baseMidiRef.current === null || Math.abs(nearestMidi - baseMidiRef.current) >= 2) {
      // Release previous with overlap
      if (lastNoteRef.current) {
        const prevNote = lastNoteRef.current;
        setTimeout(() => {
          try { sampler.triggerRelease(prevNote, Tone.now()); } catch (e) { /* ok */ }
        }, 120);
      }

      sampler.triggerAttack(noteName, Tone.now());
      lastNoteRef.current = noteName;
      baseMidiRef.current = nearestMidi;

      // Record
      if (isRecording && recordingStartTime != null && onStringNote) {
        onStringNote({
          note: noteName,
          timestamp: Tone.now() - recordingStartTime,
          duration: 0.25,
        });
      }
    }

    // Smoothly detune from the base note to create continuous pitch slide
    const totalDetune = (exactMidi - baseMidiRef.current) * 100;
    sampler.set({ detune: totalDetune });

    setCurrentNote(midiToNote(nearestMidi));
  }, [samplerLoaded, isRecording, recordingStartTime, onStringNote]);

  // Start playing a string
  const handleStringDown = useCallback((e, string) => {
    e.preventDefault();
    if (!samplerLoaded) return;
    if (Tone.context.state !== 'running') Tone.start();

    const stringEl = e.currentTarget;
    const x = getPosition(e, stringEl);
    const exactMidi = posToExactMidi(x, string);

    baseMidiRef.current = null; // force retrigger
    activeStringRef.current = { string, stringEl };
    setActiveString(string.id);
    setFingerX(prev => ({ ...prev, [string.id]: x }));
    setStringVibrations(prev => ({ ...prev, [string.id]: true }));

    playNote(exactMidi, string);
  }, [getPosition, posToExactMidi, playNote, samplerLoaded]);

  // Slide pitch while dragging — continuous sub-semitone detuning
  const handleMouseMove = useCallback((e) => {
    const active = activeStringRef.current;
    if (!active) return;

    const { string, stringEl } = active;
    const x = getPosition(e, stringEl);
    const exactMidi = posToExactMidi(x, string);

    setFingerX(prev => ({ ...prev, [string.id]: x }));
    playNote(exactMidi, string);
  }, [getPosition, posToMidi, playNote]);

  // Release string
  const handleMouseUp = useCallback(() => {
    const active = activeStringRef.current;
    if (!active) return;

    const sampler = samplerRef.current;
    if (sampler) {
      sampler.set({ detune: 0 }); // reset pitch bend
      if (lastNoteRef.current) {
        try { sampler.triggerRelease(lastNoteRef.current, Tone.now()); } catch (e) { /* ok */ }
      }
    }
    lastNoteRef.current = null;
    baseMidiRef.current = null;

    const stringId = active.string.id;
    setTimeout(() => {
      setStringVibrations(prev => ({ ...prev, [stringId]: false }));
    }, 300);

    activeStringRef.current = null;
    setActiveString(null);
    setCurrentNote('');
    setFingerX(prev => ({ ...prev, [stringId]: undefined }));
  }, []);

  // Global mouse events
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Get note markers for a string (with octave shift)
  const getNoteMarkers = (string) => {
    const shift = octaveShift * 12;
    const start = string.startNote + shift;
    const end = string.endNote + shift;
    const markers = [];
    for (let midi = start; midi <= end; midi++) {
      const x = (midi - start) / (end - start);
      const name = ALL_NOTES[midi % 12];
      const isNatural = !name.includes('#');
      markers.push({ x, name, isNatural, midi });
    }
    return markers;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-center select-none px-3 py-1"
      style={{ touchAction: 'none' }}
    >
      {/* Current note display */}
      <div className="text-center mb-1.5">
        <span className="text-xs font-mono text-gray-400">
          {!samplerLoaded ? 'Loading strings...' : currentNote || 'Click and drag a string to play'}
        </span>
      </div>

      {/* Strings */}
      <div className="flex-1 flex flex-col justify-center gap-2">
        {STRINGS.map((string) => {
          const isActive = activeString === string.id;
          const isVibrating = stringVibrations[string.id];
          const markers = getNoteMarkers(string);
          const fx = fingerX[string.id];

          return (
            <div key={string.id} className="flex items-center gap-2">
              {/* String label */}
              <div
                className="w-5 text-center text-[11px] font-bold flex-shrink-0"
                style={{ color: string.color }}
              >
                {string.name}
              </div>

              {/* Fingerboard */}
              <div
                className="flex-1 relative cursor-pointer rounded-sm"
                style={{
                  height: 30,
                  background: 'linear-gradient(180deg, #3D2817 0%, #2A1A0E 50%, #1A0F06 100%)',
                  border: `1px solid ${isActive ? string.color + '80' : '#3D2817'}`,
                  boxShadow: isActive
                    ? `0 0 10px ${string.color}20, inset 0 1px 3px rgba(0,0,0,0.4)`
                    : 'inset 0 1px 3px rgba(0,0,0,0.5)',
                }}
                onMouseDown={(e) => handleStringDown(e, string)}
              >
                {/* Fret/note markers */}
                {markers.map((m, i) => (
                  <div key={i} className="absolute top-0 bottom-0" style={{ left: `${m.x * 100}%` }}>
                    {/* Fret line */}
                    <div
                      className="absolute top-0 bottom-0"
                      style={{
                        width: m.isNatural ? 1 : 0,
                        backgroundColor: 'rgba(200,170,130,0.2)',
                      }}
                    />
                    {/* Note dot — only for natural notes */}
                    {m.isNatural && (
                      <div
                        className="absolute rounded-full"
                        style={{
                          width: 4,
                          height: 4,
                          top: '50%',
                          marginTop: -2,
                          marginLeft: -2,
                          backgroundColor: 'rgba(200,170,130,0.2)',
                        }}
                      />
                    )}
                  </div>
                ))}

                {/* String wire */}
                <div
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{
                    top: '50%',
                    height: isActive ? 3 : 2,
                    marginTop: isActive ? -1.5 : -1,
                    background: `linear-gradient(90deg, ${string.color}90, ${string.color}, ${string.color}90)`,
                    boxShadow: isActive ? `0 0 8px ${string.color}60` : `0 0 2px ${string.color}30`,
                    animation: isVibrating ? 'string-vibrate 0.04s infinite alternate' : 'none',
                  }}
                />

                {/* Glow at finger position */}
                {fx !== undefined && isActive && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${fx * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: 30,
                      marginLeft: -15,
                      background: `radial-gradient(ellipse at center, ${string.color}30 0%, transparent 70%)`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes string-vibrate {
          0% { transform: translateY(-0.5px); }
          100% { transform: translateY(0.5px); }
        }
      `}</style>
    </div>
  );
};

export default StringSlider;
