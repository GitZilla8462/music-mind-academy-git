// File: FloatingVirtualInstrument.jsx
// Floating, draggable Virtual Instrument panel using react-rnd
// Follows same pattern as FloatingBeatMaker and FloatingMelodyMaker
// Includes keyboard/drum pad modes with record-to-timeline capability

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { GripHorizontal, Minimize2, Maximize2, Circle, Square } from 'lucide-react';
import * as Tone from 'tone';
import InstrumentKeyboard from '../../../../lessons/film-music/shared/virtual-instrument/InstrumentKeyboard';
import DrumPadGrid from '../../../../lessons/film-music/shared/virtual-instrument/DrumPadGrid';
import InstrumentSelector from '../../../../lessons/film-music/shared/virtual-instrument/InstrumentSelector';
import {
  INSTRUMENTS,
  KEY_TO_NOTE,
  KEY_TO_PAD,
  DRUM_PADS,
} from '../../../../lessons/film-music/shared/virtual-instrument/instrumentConfig';

// Instrument color map for recording labels
const INSTRUMENT_COLORS = {
  piano: '#3B82F6', strings: '#8B5CF6', brass: '#F59E0B', woodwind: '#10B981',
  synthPad: '#EC4899', plucked: '#06B6D4', choir: '#A855F7', bass: '#10B981',
};

// Detect Chromebook for sizing
const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS') ||
  (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent))
);

// Convert AudioBuffer to WAV blob
const audioBufferToWav = (buffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const totalLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  const channels = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

const FloatingVirtualInstrument = ({
  isOpen,
  onClose,
  onAddToProject,
  onRecordToTimeline, // (loopData, trackIndex, startTime) — places directly on timeline
  customLoopCount = 0,
  // For record-to-timeline: playback controls
  onPlay,
  onStop,
  isPlaying,
  currentTime,
}) => {
  const defaultSize = isChromebook
    ? { width: 520, height: 250 }
    : { width: 560, height: 270 };

  const [size, setSize] = useState(defaultSize);
  const [position, setPosition] = useState({ x: 200, y: 350 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [prevSize, setPrevSize] = useState(null);

  // Instrument state
  const [mode, setMode] = useState('keyboard');
  const [selectedInstrument, setSelectedInstrument] = useState('piano');
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [activePads, setActivePads] = useState(new Set());

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const recordedNotesRef = useRef([]);
  const noteStartTimesRef = useRef({});
  const recordingStartTimeRef = useRef(null);
  const recordingAnchorRef = useRef(0);

  // Synth refs
  const melodySynthRef = useRef(null);
  const drumSynthsRef = useRef({});

  const minWidth = isChromebook ? 460 : 500;
  const minHeight = isChromebook ? 220 : 240;

  // Reset position when opening
  useEffect(() => {
    if (isOpen) {
      const vw = window.visualViewport?.width || window.innerWidth;
      const vh = window.visualViewport?.height || window.innerHeight;
      const x = Math.max(20, (vw - size.width) / 2);
      const y = Math.max(40, vh - size.height - 40);
      setPosition({ x, y });
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Initialize/update melody synth
  useEffect(() => {
    if (!isOpen) return;
    const inst = INSTRUMENTS[selectedInstrument];
    if (!inst) return;

    if (melodySynthRef.current) {
      melodySynthRef.current.dispose();
    }
    melodySynthRef.current = new Tone.PolySynth(Tone.Synth, inst.config).toDestination();
    melodySynthRef.current.volume.value = -6;

    return () => {
      if (melodySynthRef.current) {
        melodySynthRef.current.dispose();
        melodySynthRef.current = null;
      }
    };
  }, [selectedInstrument, isOpen]);

  // Initialize drum synths
  useEffect(() => {
    if (!isOpen) return;
    const synths = {};
    DRUM_PADS.forEach((pad) => {
      if (pad.synthType === 'membrane') {
        synths[pad.id] = new Tone.MembraneSynth(pad.config).toDestination();
      } else if (pad.synthType === 'noise') {
        synths[pad.id] = new Tone.NoiseSynth(pad.config).toDestination();
      } else if (pad.synthType === 'metal') {
        synths[pad.id] = new Tone.MetalSynth(pad.config).toDestination();
      }
      if (synths[pad.id]) synths[pad.id].volume.value = -6;
    });
    drumSynthsRef.current = synths;

    return () => {
      Object.values(synths).forEach(s => s.dispose());
      drumSynthsRef.current = {};
    };
  }, [isOpen]);

  // Get play note with octave shift for bass
  const getPlayNote = useCallback((note) => {
    const inst = INSTRUMENTS[selectedInstrument];
    if (inst?.octaveShift) {
      const match = note.match(/([A-G]#?)(\d)/);
      if (match) return `${match[1]}${parseInt(match[2]) + inst.octaveShift}`;
    }
    return note;
  }, [selectedInstrument]);

  // Note start
  const handleNoteStart = useCallback((note) => {
    const synth = melodySynthRef.current;
    if (!synth) return;
    if (Tone.context.state !== 'running') Tone.start();

    const playNote = getPlayNote(note);
    synth.triggerAttack(playNote, Tone.now());
    setPressedKeys(prev => new Set(prev).add(note));

    if (isRecording) {
      noteStartTimesRef.current[note] = Tone.now();
    }
  }, [getPlayNote, isRecording]);

  // Note end
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

    if (isRecording && noteStartTimesRef.current[note]) {
      const startTime = noteStartTimesRef.current[note];
      const duration = Tone.now() - startTime;
      const timestamp = startTime - recordingStartTimeRef.current;

      recordedNotesRef.current.push({
        note: playNote,
        timestamp: Math.max(0, timestamp),
        duration: Math.max(0.05, duration),
      });
      delete noteStartTimesRef.current[note];
    }
  }, [getPlayNote, isRecording]);

  // Drum pad hit
  const handlePadHit = useCallback((padId) => {
    const synth = drumSynthsRef.current[padId];
    if (!synth) return;
    if (Tone.context.state !== 'running') Tone.start();

    const pad = DRUM_PADS.find(p => p.id === padId);
    if (pad.synthType === 'membrane') {
      synth.triggerAttackRelease('C2', 0.2);
    } else {
      synth.triggerAttackRelease(0.2);
    }

    setActivePads(prev => new Set(prev).add(padId));
    setTimeout(() => {
      setActivePads(prev => {
        const next = new Set(prev);
        next.delete(padId);
        return next;
      });
    }, 100);

    if (isRecording) {
      recordedNotesRef.current.push({
        note: `drum-${padId}`,
        timestamp: Math.max(0, Tone.now() - recordingStartTimeRef.current),
        duration: 0.2,
      });
    }
  }, [isRecording]);

  // Keyboard events
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (mode === 'keyboard') {
        const note = KEY_TO_NOTE[key];
        if (note && !pressedKeys.has(note)) handleNoteStart(note);
      } else {
        const pad = KEY_TO_PAD[key];
        if (pad) handlePadHit(pad.id);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (mode === 'keyboard') {
        const note = KEY_TO_NOTE[key];
        if (note) handleNoteEnd(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, isMinimized, mode, pressedKeys, handleNoteStart, handleNoteEnd, handlePadHit]);

  // Record toggle
  const handleRecordToggle = useCallback(async () => {
    if (Tone.context.state !== 'running') await Tone.start();

    if (isRecording) {
      // Stop recording — flush any held notes first
      Object.keys(noteStartTimesRef.current).forEach(note => handleNoteEnd(note));

      // Capture notes before clearing
      const allNotes = [...recordedNotesRef.current];
      recordedNotesRef.current = [];
      noteStartTimesRef.current = {};

      // Stop playback first, then update state
      if (onStop) onStop();
      setIsRecording(false);

      if (allNotes.length === 0) return;

      // Split melody and drum notes
      const melodyNotes = allNotes.filter(n => !n.note.startsWith('drum-'));
      const drumNotes = allNotes.filter(n => n.note.startsWith('drum-'));
      const inst = INSTRUMENTS[selectedInstrument];

      // Render melody recording
      if (melodyNotes.length > 0 && inst) {
        const lastNote = melodyNotes.reduce((a, b) =>
          (a.timestamp + a.duration) > (b.timestamp + b.duration) ? a : b
        );
        const totalDuration = lastNote.timestamp + lastNote.duration + 0.5;

        try {
          const offlineBuffer = await Tone.Offline(() => {
            const synth = new Tone.PolySynth(Tone.Synth, inst.config).toDestination();
            synth.volume.value = -6;
            melodyNotes.forEach(({ note, timestamp, duration }) => {
              synth.triggerAttackRelease(note, duration, timestamp);
            });
          }, totalDuration);

          const wavBlob = audioBufferToWav(offlineBuffer);
          const blobURL = URL.createObjectURL(wavBlob);

          const recordingLoop = {
            id: `custom-recording-${Date.now()}`,
            name: `${inst.name} ${customLoopCount + 1}`,
            file: blobURL,
            instrument: inst.name,
            mood: 'Custom',
            color: INSTRUMENT_COLORS[selectedInstrument] || '#3B82F6',
            category: 'Recordings',
            duration: totalDuration,
            loaded: true,
            accessible: true,
            needsRender: false,
            type: 'custom-recording',
            notes: melodyNotes,
            instrumentId: selectedInstrument,
          };

          // Add to library for re-use and editing
          onAddToProject(recordingLoop);

          // Place directly on timeline at the recording start position
          if (onRecordToTimeline) {
            onRecordToTimeline(recordingLoop, 0, recordingAnchorRef.current);
          }
        } catch (e) {
          console.error('Error rendering melody recording:', e);
        }
      }

      // Render drum recording separately
      if (drumNotes.length > 0) {
        const lastDrum = drumNotes.reduce((a, b) =>
          (a.timestamp + a.duration) > (b.timestamp + b.duration) ? a : b
        );
        const drumDuration = lastDrum.timestamp + lastDrum.duration + 0.3;

        try {
          const offlineBuffer = await Tone.Offline(() => {
            const kick = new Tone.MembraneSynth({
              pitchDecay: 0.05, octaves: 4,
              envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
            }).toDestination();
            const snare = new Tone.NoiseSynth({
              noise: { type: 'white' },
              envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
            }).toDestination();
            const hihat = new Tone.MetalSynth({
              frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
              harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, volume: -10
            }).toDestination();

            drumNotes.forEach(({ note, timestamp }) => {
              const padId = note.replace('drum-', '');
              if (padId === 'kick' || padId.startsWith('tom')) {
                kick.triggerAttackRelease('C2', 0.2, timestamp);
              } else if (padId === 'snare' || padId === 'clap' || padId === 'rim') {
                snare.triggerAttackRelease(0.2, timestamp);
              } else {
                hihat.triggerAttackRelease(0.1, timestamp);
              }
            });
          }, drumDuration);

          const wavBlob = audioBufferToWav(offlineBuffer);
          const blobURL = URL.createObjectURL(wavBlob);

          const drumLoop = {
            id: `custom-drums-${Date.now()}`,
            name: `Drum Pattern ${customLoopCount + 1}`,
            file: blobURL,
            instrument: 'Drums',
            mood: 'Custom',
            color: '#F59E0B',
            category: 'Recordings',
            duration: drumDuration,
            loaded: true,
            accessible: true,
            needsRender: false,
            type: 'custom-recording',
            notes: drumNotes,
            instrumentId: 'drums',
          };

          onAddToProject(drumLoop);

          if (onRecordToTimeline) {
            onRecordToTimeline(drumLoop, 1, recordingAnchorRef.current);
          }
        } catch (e) {
          console.error('Error rendering drum recording:', e);
        }
      }
    } else {
      // Start recording
      recordedNotesRef.current = [];
      noteStartTimesRef.current = {};
      recordingStartTimeRef.current = Tone.now();
      recordingAnchorRef.current = currentTime || 0;
      setIsRecording(true);

      // Start playback so student hears backing tracks + sees video
      if (onPlay) onPlay();
    }
  }, [isRecording, selectedInstrument, customLoopCount, onAddToProject, onPlay, onStop, currentTime, handleNoteEnd]);

  // Toggle minimize
  const toggleMinimize = () => {
    if (isMinimized) {
      if (prevSize) setSize(prevSize);
      setIsMinimized(false);
    } else {
      setPrevSize({ ...size });
      setSize({ width: size.width, height: 44 });
      setIsMinimized(true);
    }
  };

  if (!isOpen) return null;

  const instrumentColor = (() => {
    if (mode === 'drums') return '#F59E0B';
    const inst = INSTRUMENTS[selectedInstrument];
    const colorMap = { motif: '#3B82F6', bass: '#10B981', harmony: '#8B5CF6' };
    return colorMap[inst?.trackTarget] || '#3B82F6';
  })();

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, pos) => {
        setSize({
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10)
        });
        setPosition(pos);
      }}
      minWidth={minWidth}
      minHeight={isMinimized ? 44 : minHeight}
      maxWidth={1100}
      maxHeight={isMinimized ? 44 : 500}
      bounds="window"
      dragHandleClassName="drag-handle"
      enableResizing={!isMinimized}
      style={{
        zIndex: 1000,
        position: 'fixed',
        cursor: isChromebook ? 'none' : undefined
      }}
    >
      <div className="h-full flex flex-col bg-gray-900 rounded-lg shadow-2xl border border-gray-600 overflow-hidden">
        {/* Drag Handle Header */}
        <div
          className={`drag-handle flex-shrink-0 bg-gray-800 border-b border-gray-700 px-3 py-1.5 select-none ${isChromebook ? '' : 'cursor-move'}`}
          style={{ touchAction: 'none', WebkitTouchCallout: 'none', ...(isChromebook ? { cursor: 'none' } : {}) }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripHorizontal size={16} className="text-gray-500" />
              <h2 className="text-sm font-bold text-white">Virtual Instrument</h2>
              {isRecording && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-900/60 rounded text-red-300 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  REC
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Record button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRecordToggle();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-gray-700 text-gray-300 hover:bg-red-600/80 hover:text-white'
                }`}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                {isRecording ? (
                  <><Square size={10} className="fill-current" /> Stop</>
                ) : (
                  <><Circle size={10} className="fill-red-500 text-red-500" /> Record</>
                )}
              </button>
              {/* Minimize */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
                className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              {/* Close */}
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-1.5 hover:bg-red-600 rounded transition-colors text-gray-400 hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Instrument selector bar */}
            <div className="border-b border-gray-700">
              <InstrumentSelector
                selectedInstrument={selectedInstrument}
                onInstrumentChange={setSelectedInstrument}
                mode={mode}
                onModeChange={setMode}
              />
            </div>

            {/* Keyboard or Drum Pads */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              {mode === 'keyboard' ? (
                <InstrumentKeyboard
                  pressedKeys={pressedKeys}
                  onNoteStart={handleNoteStart}
                  onNoteEnd={handleNoteEnd}
                  instrumentColor={instrumentColor}
                />
              ) : (
                <DrumPadGrid
                  activePads={activePads}
                  onPadHit={handlePadHit}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Rnd>
  );
};

export default FloatingVirtualInstrument;
