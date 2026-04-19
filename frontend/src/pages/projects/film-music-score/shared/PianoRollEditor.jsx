// PianoRollEditor.jsx
// Piano roll note editor for custom recordings
// Shows notes as rectangles on a time×pitch grid
// Students can drag, resize, delete, and add notes
// Re-renders WAV on save

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { GripHorizontal, Minimize2, Maximize2, Play, Square, Save, Trash2, Plus, Undo2 } from 'lucide-react';
import * as Tone from 'tone';
import { INSTRUMENTS } from '../../../../lessons/film-music/shared/virtual-instrument/instrumentConfig';

const isChromebook = typeof navigator !== 'undefined' && (
  /CrOS/.test(navigator.userAgent) ||
  (navigator.userAgentData?.platform === 'Chrome OS') ||
  (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent))
);

// All notes in one octave (bottom to top)
const PITCH_ROWS = [
  { note: 'C5', label: 'C5', isBlack: false },
  { note: 'B4', label: 'B', isBlack: false },
  { note: 'A#4', label: 'A#', isBlack: true },
  { note: 'A4', label: 'A', isBlack: false },
  { note: 'G#4', label: 'G#', isBlack: true },
  { note: 'G4', label: 'G', isBlack: false },
  { note: 'F#4', label: 'F#', isBlack: true },
  { note: 'F4', label: 'F', isBlack: false },
  { note: 'E4', label: 'E', isBlack: false },
  { note: 'D#4', label: 'D#', isBlack: true },
  { note: 'D4', label: 'D', isBlack: false },
  { note: 'C#4', label: 'C#', isBlack: true },
  { note: 'C4', label: 'C4', isBlack: false },
];

const ROW_HEIGHT = 22;
const LABEL_WIDTH = 40;
const PIXELS_PER_SECOND = 80;
const SNAP_INTERVAL = 0.125; // snap to 1/8 second

const snap = (val) => Math.round(val / SNAP_INTERVAL) * SNAP_INTERVAL;

// Convert AudioBuffer to WAV
const audioBufferToWav = (buffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const totalLength = 44 + dataLength;
  const ab = new ArrayBuffer(totalLength);
  const v = new DataView(ab);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, totalLength - 8, true); ws(8, 'WAVE'); ws(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, numChannels, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * blockAlign, true);
  v.setUint16(32, blockAlign, true); v.setUint16(34, bitDepth, true); ws(36, 'data');
  v.setUint32(40, dataLength, true);
  const chs = []; for (let c = 0; c < numChannels; c++) chs.push(buffer.getChannelData(c));
  let off = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      v.setInt16(off, Math.max(-1, Math.min(1, chs[c][i])) * 0x7FFF, true); off += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
};

const PianoRollEditor = ({
  isOpen,
  onClose,
  loop, // The custom-recording loop object with .notes and .instrumentId
  onSave, // Called with updated loop object (new blob + notes)
}) => {
  const defaultSize = isChromebook
    ? { width: 700, height: 360 }
    : { width: 800, height: 400 };

  const [size, setSize] = useState(defaultSize);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [prevSize, setPrevSize] = useState(null);

  // Notes state — editable copy
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([]);

  const synthRef = useRef(null);
  const playbackRef = useRef(null);
  const animRef = useRef(null);
  const gridRef = useRef(null);

  // Load notes from loop when opened
  useEffect(() => {
    if (isOpen && loop?.notes) {
      const notesWithIds = loop.notes.map((n, i) => ({
        ...n,
        id: n.id || `note-${i}-${Date.now()}`,
      }));
      setNotes(notesWithIds);
      setHistory([]);
      setSelectedNoteId(null);
      setPlayheadTime(0);

      const vw = window.visualViewport?.width || window.innerWidth;
      const vh = window.visualViewport?.height || window.innerHeight;
      setPosition({
        x: Math.max(20, (vw - size.width) / 2),
        y: Math.max(20, (vh - size.height) / 2 - 30),
      });
    }
  }, [isOpen, loop]);

  // Init synth
  useEffect(() => {
    if (!isOpen) return;
    const inst = INSTRUMENTS[loop?.instrumentId || 'piano'];
    if (!inst) return;

    if (synthRef.current) synthRef.current.dispose();
    synthRef.current = new Tone.PolySynth(Tone.Synth, inst.config).toDestination();
    synthRef.current.volume.value = -6;

    return () => {
      if (synthRef.current) { synthRef.current.dispose(); synthRef.current = null; }
    };
  }, [isOpen, loop?.instrumentId]);

  // Calculate total duration
  const totalDuration = notes.length > 0
    ? Math.max(...notes.map(n => n.timestamp + n.duration)) + 0.5
    : 4;
  const gridWidth = Math.max(400, totalDuration * PIXELS_PER_SECOND);

  // Push to undo history
  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-20), notes.map(n => ({ ...n }))]);
  }, [notes]);

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setNotes(prev);
  }, [history]);

  // Note click → select
  const handleNoteClick = useCallback((e, noteId) => {
    e.stopPropagation();
    setSelectedNoteId(prev => prev === noteId ? null : noteId);
  }, []);

  // Delete selected note
  const handleDeleteNote = useCallback(() => {
    if (!selectedNoteId) return;
    pushHistory();
    setNotes(prev => prev.filter(n => n.id !== selectedNoteId));
    setSelectedNoteId(null);
  }, [selectedNoteId, pushHistory]);

  // Add note on grid click
  const handleGridClick = useCallback((e) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + gridRef.current.scrollLeft;
    const y = e.clientY - rect.top;

    const timestamp = snap(x / PIXELS_PER_SECOND);
    const rowIndex = Math.floor(y / ROW_HEIGHT);
    if (rowIndex < 0 || rowIndex >= PITCH_ROWS.length) return;

    const pitch = PITCH_ROWS[rowIndex];
    pushHistory();
    setNotes(prev => [...prev, {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      note: pitch.note,
      timestamp,
      duration: 0.25,
    }]);
    setSelectedNoteId(null);

    // Preview the note
    if (synthRef.current && Tone.context.state === 'running') {
      synthRef.current.triggerAttackRelease(pitch.note, 0.2);
    }
  }, [pushHistory]);

  // Drag note to move
  const handleNoteDrag = useCallback((noteId, e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const origTimestamp = note.timestamp;
    const origRowIndex = PITCH_ROWS.findIndex(r => r.note === note.note);

    pushHistory();

    const handleMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const newTimestamp = snap(Math.max(0, origTimestamp + dx / PIXELS_PER_SECOND));
      const newRowIndex = Math.max(0, Math.min(PITCH_ROWS.length - 1,
        origRowIndex + Math.round(dy / ROW_HEIGHT)
      ));
      const newNote = PITCH_ROWS[newRowIndex].note;

      setNotes(prev => prev.map(n =>
        n.id === noteId ? { ...n, timestamp: newTimestamp, note: newNote } : n
      ));
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [notes, pushHistory]);

  // Resize note duration (right edge drag)
  const handleNoteResize = useCallback((noteId, e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const origDuration = note.duration;
    pushHistory();

    const handleMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const newDuration = snap(Math.max(0.125, origDuration + dx / PIXELS_PER_SECOND));
      setNotes(prev => prev.map(n =>
        n.id === noteId ? { ...n, duration: newDuration } : n
      ));
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [notes, pushHistory]);

  // Play preview
  const handlePlay = useCallback(async () => {
    if (Tone.context.state !== 'running') await Tone.start();
    if (isPlaying) {
      // Stop
      if (playbackRef.current) {
        playbackRef.current.forEach(id => clearTimeout(id));
        playbackRef.current = null;
      }
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setIsPlaying(false);
      setPlayheadTime(0);
      synthRef.current?.releaseAll();
      return;
    }

    setIsPlaying(true);
    const startTime = Tone.now();
    const timeouts = [];

    notes.forEach(({ note, timestamp, duration }) => {
      const t = setTimeout(() => {
        synthRef.current?.triggerAttackRelease(note, duration);
      }, timestamp * 1000);
      timeouts.push(t);
    });

    playbackRef.current = timeouts;

    // Playhead animation
    const animate = () => {
      const elapsed = Tone.now() - startTime;
      setPlayheadTime(elapsed);
      if (elapsed < totalDuration) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setPlayheadTime(0);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  }, [isPlaying, notes, totalDuration]);

  // Save — re-render notes to WAV and call onSave
  const handleSave = useCallback(async () => {
    if (notes.length === 0) return;
    setIsSaving(true);

    const inst = INSTRUMENTS[loop?.instrumentId || 'piano'];
    if (!inst) { setIsSaving(false); return; }

    const dur = Math.max(...notes.map(n => n.timestamp + n.duration)) + 0.5;

    try {
      const offlineBuffer = await Tone.Offline(() => {
        const synth = new Tone.PolySynth(Tone.Synth, inst.config).toDestination();
        synth.volume.value = -6;
        notes.forEach(({ note, timestamp, duration }) => {
          synth.triggerAttackRelease(note, duration, timestamp);
        });
      }, dur);

      const wavBlob = audioBufferToWav(offlineBuffer);
      const blobURL = URL.createObjectURL(wavBlob);

      // Revoke old blob
      if (loop?.file?.startsWith('blob:')) {
        URL.revokeObjectURL(loop.file);
      }

      onSave({
        ...loop,
        file: blobURL,
        duration: dur,
        notes: notes.map(({ id, ...rest }) => rest), // strip editor IDs
      });

      onClose();
    } catch (e) {
      console.error('Error saving piano roll:', e);
    } finally {
      setIsSaving(false);
    }
  }, [notes, loop, onSave, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNoteId) { e.preventDefault(); handleDeleteNote(); }
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); handleUndo();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, selectedNoteId, handleDeleteNote, handleUndo]);

  const toggleMinimize = () => {
    if (isMinimized) { if (prevSize) setSize(prevSize); setIsMinimized(false); }
    else { setPrevSize({ ...size }); setSize({ width: size.width, height: 44 }); setIsMinimized(true); }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (playbackRef.current) playbackRef.current.forEach(id => clearTimeout(id));
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  if (!isOpen || !loop) return null;

  const instColor = (() => {
    const colors = {
      piano: '#3B82F6', strings: '#8B5CF6', brass: '#F59E0B', woodwind: '#10B981',
      synthPad: '#EC4899', plucked: '#06B6D4', choir: '#A855F7', bass: '#10B981',
    };
    return colors[loop?.instrumentId] || '#3B82F6';
  })();

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, dir, ref, delta, pos) => {
        setSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
        setPosition(pos);
      }}
      minWidth={500}
      minHeight={isMinimized ? 44 : 280}
      maxWidth={1200}
      maxHeight={isMinimized ? 44 : 600}
      bounds="window"
      dragHandleClassName="drag-handle"
      enableResizing={!isMinimized}
      style={{ zIndex: 1001, position: 'fixed' }}
    >
      <div className="h-full flex flex-col bg-gray-900 rounded-lg shadow-2xl border border-gray-600 overflow-hidden">
        {/* Header */}
        <div className="drag-handle flex-shrink-0 bg-gray-800 border-b border-gray-700 px-3 py-1.5 select-none cursor-move"
          style={{ touchAction: 'none' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripHorizontal size={14} className="text-gray-500" />
              <h2 className="text-sm font-bold text-white">Piano Roll</h2>
              <span className="text-xs text-gray-500">— {loop?.name || 'Recording'}</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Play */}
              <button onClick={(e) => { e.stopPropagation(); handlePlay(); }}
                className={`p-1.5 rounded transition-colors ${isPlaying ? 'text-green-400 bg-green-900/30' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                {isPlaying ? <Square size={12} className="fill-current" /> : <Play size={12} />}
              </button>
              {/* Undo */}
              <button onClick={(e) => { e.stopPropagation(); handleUndo(); }}
                disabled={history.length === 0}
                className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 transition-colors">
                <Undo2 size={12} />
              </button>
              {/* Delete selected */}
              <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(); }}
                disabled={!selectedNoteId}
                className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700 disabled:opacity-30 transition-colors">
                <Trash2 size={12} />
              </button>
              {/* Save */}
              <button onClick={(e) => { e.stopPropagation(); handleSave(); }}
                disabled={isSaving}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-500 transition-colors disabled:opacity-50">
                <Save size={10} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              {/* Minimize */}
              <button onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
                className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
                {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </button>
              {/* Close */}
              <button onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-1.5 hover:bg-red-600 rounded text-gray-400 hover:text-white transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        {!isMinimized && (
          <div className="flex-1 flex overflow-hidden">
            {/* Pitch labels */}
            <div className="flex-shrink-0 bg-gray-800 border-r border-gray-700" style={{ width: LABEL_WIDTH }}>
              {PITCH_ROWS.map((row) => (
                <div
                  key={row.note}
                  className="flex items-center justify-end pr-1.5 text-[10px] font-mono border-b border-gray-800"
                  style={{
                    height: ROW_HEIGHT,
                    color: row.isBlack ? '#6B7280' : '#9CA3AF',
                    backgroundColor: row.isBlack ? '#1a1f2e' : 'transparent',
                  }}
                >
                  {row.label}
                </div>
              ))}
            </div>

            {/* Note grid */}
            <div
              ref={gridRef}
              className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-crosshair"
              onClick={handleGridClick}
            >
              <div className="relative" style={{ width: gridWidth, height: PITCH_ROWS.length * ROW_HEIGHT }}>
                {/* Grid rows */}
                {PITCH_ROWS.map((row, i) => (
                  <div
                    key={row.note}
                    className="absolute left-0 right-0 border-b"
                    style={{
                      top: i * ROW_HEIGHT,
                      height: ROW_HEIGHT,
                      backgroundColor: row.isBlack ? '#111827' : '#1F2937',
                      borderColor: '#374151',
                    }}
                  />
                ))}

                {/* Beat grid lines */}
                {Array.from({ length: Math.ceil(totalDuration * 4) }, (_, i) => {
                  const isBeat = i % 4 === 0;
                  return (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0"
                      style={{
                        left: (i * 0.25) * PIXELS_PER_SECOND,
                        width: 1,
                        backgroundColor: isBeat ? '#4B5563' : '#2D3748',
                      }}
                    />
                  );
                })}

                {/* Notes */}
                {notes.map((n) => {
                  const rowIndex = PITCH_ROWS.findIndex(r => r.note === n.note);
                  if (rowIndex === -1) return null;
                  const left = n.timestamp * PIXELS_PER_SECOND;
                  const width = Math.max(6, n.duration * PIXELS_PER_SECOND);
                  const isSelected = selectedNoteId === n.id;

                  return (
                    <div
                      key={n.id}
                      className="absolute rounded-sm cursor-pointer"
                      style={{
                        left,
                        top: rowIndex * ROW_HEIGHT + 2,
                        width,
                        height: ROW_HEIGHT - 4,
                        backgroundColor: isSelected ? '#FFFFFF' : instColor,
                        opacity: isSelected ? 1 : 0.85,
                        border: isSelected ? `2px solid ${instColor}` : '1px solid rgba(255,255,255,0.2)',
                        boxShadow: isSelected ? `0 0 8px ${instColor}60` : 'none',
                        zIndex: isSelected ? 10 : 5,
                      }}
                      onClick={(e) => handleNoteClick(e, n.id)}
                      onMouseDown={(e) => {
                        if (e.button === 0) handleNoteDrag(n.id, e);
                      }}
                    >
                      {/* Resize handle on right edge */}
                      <div
                        className="absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize"
                        onMouseDown={(e) => { e.stopPropagation(); handleNoteResize(n.id, e); }}
                        style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '0 2px 2px 0' }}
                      />
                    </div>
                  );
                })}

                {/* Playhead */}
                {isPlaying && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                    style={{ left: playheadTime * PIXELS_PER_SECOND }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer hint */}
        {!isMinimized && (
          <div className="flex-shrink-0 px-3 py-1 bg-gray-800/60 border-t border-gray-700 text-[10px] text-gray-500">
            Click grid to add note &bull; Drag notes to move &bull; Drag right edge to resize &bull; Delete/Backspace to remove &bull; Ctrl+Z undo
          </div>
        )}
      </div>
    </Rnd>
  );
};

export default PianoRollEditor;
