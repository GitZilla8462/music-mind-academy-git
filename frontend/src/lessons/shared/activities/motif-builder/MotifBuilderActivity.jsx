// File: /src/lessons/shared/activities/motif-builder/MotifBuilderActivity.jsx
// Motif Builder — Students create a character and compose a 4-8 note theme
// Film Music Lesson 1: WHO Is In The Story? (Leitmotif & Melody)
//
// LEFT SIDE: Character Card (pick from 12, draw, color, name, 3 words)
// RIGHT SIDE: VirtualInstrumentOverlay (same keyboard as the DAW)
// Each character saves its own motif. Students can switch characters and present.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Save, Check, ChevronRight, ChevronDown, RotateCcw, Pencil, Eraser, Trash2, HelpCircle } from 'lucide-react';
import * as Tone from 'tone';
import { CHARACTER_LIBRARY } from '../../../film-music/lesson1/Lesson1config';
import { saveCharacterCard, getCharacterCard, saveMotif, getMotif } from '../../../film-music/lesson1/lesson1StorageUtils';
import VirtualInstrumentOverlay from '../../../film-music/shared/virtual-instrument/VirtualInstrumentOverlay';
import { INSTRUMENTS } from '../../../film-music/shared/virtual-instrument/instrumentConfig';
import DirectionsModal, { DirectionsReopenButton } from '../../components/DirectionsModal';
import useDirectionsModal from '../../hooks/useDirectionsModal';

// Color palette
const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
  '#FFFFFF', '#1F2937',
];

const MOTIF_BUILDER_DIRECTIONS = [
  { text: 'Pick a character from the grid on the left' },
  { text: 'Draw your character, choose a color, and name them' },
  { text: 'Describe your character in 3 words (e.g. brave, fierce, loyal)' },
  { text: 'Pick an instrument and scale that match your character' },
  { text: 'Press Record, then play 4-8 notes on the keyboard to create their theme' },
  { text: 'Press Play to hear it back — does it sound like your 3 words?' },
  { text: 'If not, press Clear and try again!' },
  { text: 'When you\'re happy, press Save' },
];

// ========================================
// Per-character localStorage helpers
// ========================================
const getCharacterMotif = (charId) => {
  try {
    const data = localStorage.getItem(`fm-lesson1-motif-${charId}`);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

const saveCharacterMotif = (charId, notes, instrument, characterData) => {
  const motif = { notes, instrument, ...characterData, savedAt: new Date().toISOString() };
  localStorage.setItem(`fm-lesson1-motif-${charId}`, JSON.stringify(motif));
  return motif;
};

const getCharacterDrawing = (charId) => {
  try { return localStorage.getItem(`fm-lesson1-drawing-${charId}`) || null; } catch { return null; }
};

const saveCharacterDrawing = (charId, dataUrl) => {
  try { localStorage.setItem(`fm-lesson1-drawing-${charId}`, dataUrl); } catch(e) {}
};

// ========================================
// Drawing Canvas with undo, fill, shapes
// ========================================
const DRAW_COLORS = [
  '#FFFFFF', '#1F2937', '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#A855F7',
];

const DrawingCanvas = ({ characterId, characterColor, onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser' | 'fill' | 'circle' | 'square' | 'triangle'
  const [brushSize, setBrushSize] = useState(3);
  const [drawColor, setDrawColor] = useState(characterColor || '#FFFFFF');
  const lastPosRef = useRef(null);
  const undoStackRef = useRef([]);

  // Save current state to undo stack
  const pushUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(data);
    if (undoStackRef.current.length > 20) undoStackRef.current.shift(); // limit
  };

  // Load saved drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStackRef.current = [];

    const saved = getCharacterDrawing(characterId);
    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = saved;
    }
  }, [characterId]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const autoSave = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    saveCharacterDrawing(characterId, dataUrl);
    if (onSave) onSave(dataUrl);
  };

  // Flood fill
  const floodFill = (startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width;
    const h = canvas.height;

    // Parse fill color
    const temp = document.createElement('canvas').getContext('2d');
    temp.fillStyle = fillColor;
    temp.fillRect(0, 0, 1, 1);
    const fc = temp.getImageData(0, 0, 1, 1).data;

    const sx = Math.floor(startX);
    const sy = Math.floor(startY);
    const idx = (sy * w + sx) * 4;
    const tr = data[idx], tg = data[idx + 1], tb = data[idx + 2];

    if (tr === fc[0] && tg === fc[1] && tb === fc[2]) return; // same color

    const stack = [[sx, sy]];
    const visited = new Set();
    const tolerance = 30;

    const match = (i) => {
      return Math.abs(data[i] - tr) <= tolerance &&
             Math.abs(data[i + 1] - tg) <= tolerance &&
             Math.abs(data[i + 2] - tb) <= tolerance;
    };

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = y * w + x;
      if (visited.has(key)) continue;
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      const i = key * 4;
      if (!match(i)) continue;
      visited.add(key);
      data[i] = fc[0]; data[i + 1] = fc[1]; data[i + 2] = fc[2]; data[i + 3] = 255;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    ctx.putImageData(imageData, 0, 0);
  };

  // Draw shape
  const drawShape = (pos, shape) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = brushSize * 6;
    ctx.fillStyle = drawColor;
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 2;

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'square') {
      ctx.fillRect(pos.x - size, pos.y - size, size * 2, size * 2);
    } else if (shape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y - size);
      ctx.lineTo(pos.x - size, pos.y + size);
      ctx.lineTo(pos.x + size, pos.y + size);
      ctx.closePath();
      ctx.fill();
    }
  };

  const startDraw = (e) => {
    e.preventDefault();
    const pos = getPos(e);

    if (tool === 'fill') {
      pushUndo();
      floodFill(pos.x, pos.y, drawColor);
      autoSave();
      return;
    }
    if (tool === 'circle' || tool === 'square' || tool === 'triangle') {
      pushUndo();
      drawShape(pos, tool);
      autoSave();
      return;
    }

    pushUndo();
    setIsDrawing(true);
    lastPosRef.current = pos;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    const last = lastPosRef.current;

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#1F2937' : drawColor;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    autoSave();
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop();
    canvas.getContext('2d').putImageData(prev, 0, 0);
    autoSave();
  };

  const clearCanvas = () => {
    pushUndo();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCharacterDrawing(characterId, '');
    if (onSave) onSave('');
  };

  const toolBtn = (id, icon, label) => (
    <button
      key={id}
      onClick={() => setTool(id)}
      className={`p-1.5 rounded transition-colors ${tool === id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
      title={label}
    >
      {icon}
    </button>
  );

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={240}
        height={180}
        className="w-full rounded-lg border border-gray-600"
        style={{ touchAction: 'none', aspectRatio: '4/3', cursor: tool === 'fill' ? 'crosshair' : tool === 'circle' || tool === 'square' || tool === 'triangle' ? 'cell' : 'crosshair' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />

      {/* Tool bar row 1: tools + undo + clear */}
      <div className="flex items-center gap-1">
        {toolBtn('pen', <Pencil size={13} />, 'Pen')}
        {toolBtn('eraser', <Eraser size={13} />, 'Eraser')}
        {toolBtn('fill', <span className="text-[11px] font-bold">Fill</span>, 'Fill bucket')}
        {toolBtn('circle', <span className="w-3 h-3 rounded-full border-2 border-current inline-block" />, 'Circle')}
        {toolBtn('square', <span className="w-3 h-3 border-2 border-current inline-block" />, 'Square')}
        {toolBtn('triangle', <span className="text-[13px] leading-none">△</span>, 'Triangle')}

        <div className="w-px h-4 bg-gray-700 mx-0.5" />

        <button onClick={undo} className="p-1.5 rounded bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Undo">
          <RotateCcw size={13} />
        </button>
        <button onClick={clearCanvas} className="p-1.5 rounded bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Clear all">
          <Trash2 size={13} />
        </button>

        {/* Brush size + preview dot */}
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-3 h-3 flex items-center justify-center">
            <div className="rounded-full bg-white" style={{ width: Math.max(3, brushSize), height: Math.max(3, brushSize) }} />
          </div>
          <input
            type="range" min="1" max="12" value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-14 h-1 accent-blue-500"
          />
        </div>
      </div>

      {/* Color row */}
      <div className="flex gap-1 flex-wrap">
        {DRAW_COLORS.map(c => (
          <button
            key={c}
            onClick={() => { setDrawColor(c); if (tool === 'eraser') setTool('pen'); }}
            className={`w-5 h-5 rounded-full border-2 transition-all ${drawColor === c && tool !== 'eraser' ? 'border-white scale-110' : 'border-gray-600'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
};

// ========================================
// Main Component
// ========================================
const MotifBuilderActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  // Character card state
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [threeWords, setThreeWords] = useState(['', '', '']);
  const [characterColor, setCharacterColor] = useState('#3B82F6');
  const [showDrawing, setShowDrawing] = useState(false);
  const [charDropdownOpen, setCharDropdownOpen] = useState(false);
  const charDropdownRef = useRef(null);

  // Close character dropdown on click outside
  useEffect(() => {
    if (!charDropdownOpen) return;
    const handle = (e) => {
      if (charDropdownRef.current && !charDropdownRef.current.contains(e.target)) setCharDropdownOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [charDropdownOpen]);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [recordedInstrument, setRecordedInstrument] = useState('piano');

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedKeys, setHighlightedKeys] = useState(new Set());
  const playbackSynthRef = useRef(null);
  const playbackTimeoutsRef = useRef([]);

  // Refs for playback to avoid stale closures
  const recordedNotesRef = useRef(recordedNotes);
  recordedNotesRef.current = recordedNotes;
  const recordedInstrumentRef = useRef(recordedInstrument);
  recordedInstrumentRef.current = recordedInstrument;

  // UI state
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState(null); // { targetId } or { newChar: true }

  // Directions modal
  const directions = useDirectionsModal('motif-builder');

  // Load saved data for selected character
  useEffect(() => {
    if (!selectedCharacterId) return;
    // Load character card
    const savedCard = getCharacterCard();
    if (savedCard && savedCard.characterId === selectedCharacterId) {
      setCharacterName(savedCard.characterName || '');
      setThreeWords(savedCard.threeWords || ['', '', '']);
      setCharacterColor(savedCard.characterColor || '#3B82F6');
    } else {
      // Load per-character motif data for name/words if available
      const savedMotif = getCharacterMotif(selectedCharacterId);
      if (savedMotif) {
        setCharacterName(savedMotif.characterName || '');
        setThreeWords(savedMotif.threeWords || ['', '', '']);
        setCharacterColor(savedMotif.characterColor || CHARACTER_LIBRARY.find(c => c.id === selectedCharacterId)?.defaultColor || '#3B82F6');
      } else {
        setCharacterName('');
        setThreeWords(['', '', '']);
        setCharacterColor(CHARACTER_LIBRARY.find(c => c.id === selectedCharacterId)?.defaultColor || '#3B82F6');
      }
    }

    // Load per-character motif
    const savedMotif = getCharacterMotif(selectedCharacterId);
    if (savedMotif?.notes?.length) {
      setRecordedNotes(savedMotif.notes);
      setRecordedInstrument(savedMotif.instrument || 'piano');
      setHasSaved(true);
    } else {
      setRecordedNotes([]);
      setRecordedInstrument('piano');
      setHasSaved(false);
    }

    // Stop any playback
    stopPlayback();
  }, [selectedCharacterId]);

  // Load initial character on mount
  useEffect(() => {
    const savedCard = getCharacterCard();
    if (savedCard?.characterId) {
      setSelectedCharacterId(savedCard.characterId);
    }
  }, []);

  useEffect(() => { directions.triggerIfUnseen(); }, []);

  useEffect(() => {
    return () => {
      playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
      if (playbackSynthRef.current) { try { playbackSynthRef.current.dispose(); } catch(e) {} }
    };
  }, []);

  // Recording callbacks
  const handleRecordStart = useCallback(async () => {
    if (Tone.context.state !== 'running') await Tone.start();
    setRecordingStartTime(Tone.now());
    setRecordedNotes([]);
    setIsRecording(true);
    setHasSaved(false);
  }, []);

  const handleRecordStop = useCallback(() => {
    setIsRecording(false);
    setRecordingStartTime(null);
  }, []);

  const handleRecordingComplete = useCallback((notes, instrument) => {
    setRecordedNotes(notes);
    setRecordedInstrument(instrument);
  }, []);

  // Schedule note playback with a ready synth
  const schedulePlayback = useCallback((synth, notes) => {
    const timeouts = [];
    const filteredNotes = notes.filter(n => !n.note?.startsWith('drum-'));

    filteredNotes.forEach((nd) => {
      const startMs = nd.timestamp * 1000;
      const durMs = (nd.duration || 0.3) * 1000;
      timeouts.push(setTimeout(() => {
        if (synth) {
          try { synth.triggerAttackRelease(nd.note, nd.duration || 0.3); } catch(e) {}
        }
        setHighlightedKeys(prev => new Set(prev).add(nd.note));
      }, startMs));
      timeouts.push(setTimeout(() => {
        setHighlightedKeys(prev => { const n = new Set(prev); n.delete(nd.note); return n; });
      }, startMs + durMs));
    });

    const lastNote = filteredNotes[filteredNotes.length - 1];
    const totalMs = lastNote ? (lastNote.timestamp + (lastNote.duration || 0.3)) * 1000 + 500 : 500;
    timeouts.push(setTimeout(() => {
      setIsPlaying(false);
      setHighlightedKeys(new Set());
    }, totalMs));
    playbackTimeoutsRef.current = timeouts;
  }, []);

  // Playback — uses refs to always read latest notes/instrument
  const playMotif = useCallback(async () => {
    const notes = recordedNotesRef.current;
    const instrument = recordedInstrumentRef.current;
    if (!notes?.length) return;
    if (Tone.context.state !== 'running') await Tone.start();

    if (playbackSynthRef.current) { try { playbackSynthRef.current.dispose(); } catch(e) {} }
    playbackSynthRef.current = null;
    const inst = INSTRUMENTS[instrument];
    if (!inst) return;

    setIsPlaying(true);

    if (inst.useSampler && inst.samples) {
      try {
        const sampler = new Tone.Sampler({
          urls: inst.samples.urls, baseUrl: inst.samples.baseUrl,
          attack: inst.samplerAttack || 0, release: inst.config?.envelope?.release || 1,
          onload: () => {
            // Sampler ready — now schedule the notes
            schedulePlayback(sampler, notes);
          },
          onerror: () => {
            // Fallback to PolySynth
            const fallback = new Tone.PolySynth(Tone.Synth, inst.config).toDestination();
            fallback.volume.value = -6;
            playbackSynthRef.current = fallback;
            schedulePlayback(fallback, notes);
          },
        }).toDestination();
        sampler.volume.value = -6;
        playbackSynthRef.current = sampler;
      } catch(e) {
        // Fallback to PolySynth
        playbackSynthRef.current = new Tone.PolySynth(Tone.Synth, inst.config).toDestination();
        playbackSynthRef.current.volume.value = -6;
        schedulePlayback(playbackSynthRef.current, notes);
      }
    } else {
      playbackSynthRef.current = new Tone.PolySynth(Tone.Synth, inst.config).toDestination();
      playbackSynthRef.current.volume.value = -6;
      schedulePlayback(playbackSynthRef.current, notes);
    }
  }, [schedulePlayback]); // uses refs — no other deps needed

  const stopPlayback = useCallback(() => {
    playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
    setIsPlaying(false);
    setHighlightedKeys(new Set());
  }, []);

  const clearMotif = () => {
    setRecordedNotes([]);
    stopPlayback();
    setHasSaved(false);
  };

  // Save — per character
  const handleSave = () => {
    if (recordedNotes.length < 4 || !selectedCharacterId) return;
    const charData = { characterName, threeWords, characterColor };
    saveCharacterCard(selectedCharacterId, characterName, threeWords, characterColor);
    saveCharacterMotif(selectedCharacterId, recordedNotes, recordedInstrument, charData);
    // Also save to the original storage for backward compat
    saveMotif(recordedNotes, selectedCharacterId, recordedInstrument, 80);
    setHasSaved(true);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleComplete = () => { if (onComplete) onComplete(); };

  // Check if there are unsaved recorded notes
  const hasUnsavedNotes = recordedNotes.length > 0 && !hasSaved;

  // Guard: prompt before switching characters if unsaved notes exist
  const switchCharacter = (targetId) => {
    if (targetId === selectedCharacterId) return;
    if (hasUnsavedNotes) {
      setPendingSwitch({ targetId });
      return;
    }
    setSelectedCharacterId(targetId);
  };

  const switchToNewCharacter = () => {
    if (hasUnsavedNotes) {
      setPendingSwitch({ newChar: true });
      return;
    }
    setSelectedCharacterId(null);
    setCharDropdownOpen(true);
    setRecordedNotes([]);
    setHasSaved(false);
  };

  // Confirm save + switch
  const confirmSaveAndSwitch = () => {
    handleSave();
    const target = pendingSwitch;
    setPendingSwitch(null);
    if (target?.newChar) {
      setSelectedCharacterId(null);
      setCharDropdownOpen(true);
      setRecordedNotes([]);
      setHasSaved(false);
    } else if (target?.targetId) {
      setSelectedCharacterId(target.targetId);
    }
  };

  // Discard + switch
  const confirmDiscardAndSwitch = () => {
    const target = pendingSwitch;
    setPendingSwitch(null);
    if (target?.newChar) {
      setSelectedCharacterId(null);
      setCharDropdownOpen(true);
      setRecordedNotes([]);
      setHasSaved(false);
    } else if (target?.targetId) {
      setSelectedCharacterId(target.targetId);
    }
  };

  const noteCount = recordedNotes.filter(n => !n.note?.startsWith('drum-')).length;
  const canSave = noteCount >= 1 && selectedCharacterId;
  const selectedCharacter = CHARACTER_LIBRARY.find(c => c.id === selectedCharacterId);

  // Check which characters have saved motifs (for the grid indicators)
  const savedCharIds = CHARACTER_LIBRARY.map(c => c.id).filter(id => {
    const m = getCharacterMotif(id);
    return m?.notes?.length >= 4;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Header — saved tabs left, directions + notes + Save right */}
      <div className="flex-shrink-0 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
        {/* Saved character tabs */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto">
          {savedCharIds.map((charId) => {
            const char = CHARACTER_LIBRARY.find(c => c.id === charId);
            if (!char) return null;
            const isActive = selectedCharacterId === charId;
            const motif = getCharacterMotif(charId);
            return (
              <button
                key={charId}
                onClick={() => switchCharacter(charId)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{char.emoji}</span>
                <span>{motif?.characterName || char.name}</span>
                <Check size={10} className="text-green-400" />
              </button>
            );
          })}
          {savedCharIds.length === 0 && (
            <span className="text-xs text-gray-600">Saved characters appear here</span>
          )}

          {/* Add new motif button */}
          <button
            onClick={switchToNewCharacter}
            className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-xs transition-colors flex-shrink-0"
            title="New character motif"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </div>

        {/* Right side: Directions + Notes + Save + Done */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Directions button (inline, not fixed-position) */}
          <button
            onClick={directions.open}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/90 hover:bg-white rounded-lg shadow border border-gray-200 text-gray-700 hover:text-gray-900 transition-all"
          >
            <HelpCircle size={14} />
            <span className="text-xs font-semibold">Directions</span>
          </button>

          {hasSaved && (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-xs"
            >
              Done <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">

        {/* ====== LEFT SIDE: Character Card ====== */}
        <div className="w-[340px] flex-shrink-0 border-r border-gray-700 flex flex-col overflow-y-auto p-4 space-y-3">

          {/* Character dropdown */}
          <div className="relative" ref={charDropdownRef}>
            <button
              onClick={() => setCharDropdownOpen(!charDropdownOpen)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                !selectedCharacterId
                  ? 'bg-green-600/20 border border-green-500/50 animate-pulse'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {selectedCharacter ? (
                <>
                  <span className="text-xl">{selectedCharacter.emoji}</span>
                  <span className="text-sm font-medium text-white flex-1 text-left">{selectedCharacter.name}</span>
                </>
              ) : (
                <span className="text-sm text-green-300 font-medium flex-1 text-left">Pick your character...</span>
              )}
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${charDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {charDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl py-1 z-50 max-h-[280px] overflow-y-auto">
                {CHARACTER_LIBRARY.map((char) => {
                  const hasSavedMotif = savedCharIds.includes(char.id);
                  const isSelected = selectedCharacterId === char.id;
                  return (
                    <button
                      key={char.id}
                      onClick={() => { switchCharacter(char.id); setCharDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        isSelected ? 'bg-orange-500/20 text-orange-300' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-lg">{char.emoji}</span>
                      <span className="flex-1">{char.name}</span>
                      {hasSavedMotif && <Check size={12} className="text-green-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Character card — only when selected */}
          {selectedCharacterId && (
            <div
              className="rounded-xl p-4 border-2 flex-1 flex flex-col"
              style={{ borderColor: characterColor, background: `${characterColor}15` }}
            >
              {/* Drawing canvas or emoji — custom always shows canvas */}
              {showDrawing || selectedCharacter?.isCustom ? (
                <DrawingCanvas
                  characterId={selectedCharacterId}
                  characterColor={characterColor}
                  onSave={() => {}}
                />
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-1">{selectedCharacter?.emoji}</div>
                </div>
              )}

              {/* Toggle draw — hidden for custom (always drawing) */}
              {!selectedCharacter?.isCustom && (
                <button
                  onClick={() => setShowDrawing(!showDrawing)}
                className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
              >
                <Pencil size={12} />
                  {showDrawing ? 'Hide Drawing' : 'Draw Your Character'}
                </button>
              )}

              {/* Name field */}
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value.slice(0, 20))}
                placeholder="Name your character"
                className="w-full bg-transparent text-center text-white text-lg font-bold placeholder-gray-500 outline-none border-b border-gray-600 focus:border-orange-400 pb-1 mt-3 mb-3"
                maxLength={20}
              />

              {/* 3 words — stacked */}
              <p className="text-xs text-gray-400 mb-2 text-center">Describe in 3 words:</p>
              <div className="space-y-1.5">
                {threeWords.map((word, i) => (
                  <input
                    key={i}
                    type="text"
                    value={word}
                    onChange={(e) => {
                      const next = [...threeWords];
                      next[i] = e.target.value.slice(0, 20);
                      setThreeWords(next);
                    }}
                    placeholder={`Word ${i + 1}`}
                    className="w-full bg-gray-800 text-center text-white text-sm rounded-lg px-3 py-2 placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-400"
                    maxLength={20}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ====== RIGHT SIDE: Keyboard + all controls below ====== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Keyboard overlay — no Record button (moved below) */}
          <div className="flex-1 relative">
            <VirtualInstrumentOverlay
              embedded={true}
              showRecord={false}
              isRecording={isRecording}
              recordingStartTime={recordingStartTime}
              onRecordStart={handleRecordStart}
              onRecordStop={handleRecordStop}
              onRecordingComplete={handleRecordingComplete}
              onClose={() => {}}
              highlightedKeys={highlightedKeys.size > 0 ? highlightedKeys : null}
            />
          </div>

          {/* All controls below piano: Play, Clear, Record, Save */}
          <div className="flex-shrink-0 border-t border-gray-700 px-4 py-2 flex items-center gap-2 bg-gray-800/60">
            {/* Play */}
            <button
              onClick={isPlaying ? stopPlayback : playMotif}
              disabled={recordedNotes.length === 0 || isRecording}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                recordedNotes.length === 0 || isRecording
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : isPlaying ? 'bg-green-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? <><Square size={14} fill="currentColor" /> Stop</> : <><Play size={14} fill="currentColor" /> Play</>}
            </button>

            {/* Clear */}
            <button
              onClick={clearMotif}
              disabled={recordedNotes.length === 0 || isRecording}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-400 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} /> Clear
            </button>

            <div className="flex-1" />

            {/* Record */}
            <button
              onClick={isRecording ? handleRecordStop : handleRecordStart}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40'
                  : 'bg-gray-700 text-gray-300 hover:bg-red-600/80 hover:text-white'
              }`}
            >
              {isRecording ? <><Square size={14} fill="currentColor" /> Stop Rec</> : <><span className="w-3 h-3 rounded-full bg-red-500" /> Record</>}
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                canSave ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save size={14} /> Save
            </button>
          </div>
        </div>
      </div>

      {/* No footer — Save/Play/Clear are in the header */}

      {showSaveSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse text-sm">
          <Check size={18} /> Saved!
        </div>
      )}

      <DirectionsModal
        title="Motif Builder"
        isOpen={directions.isOpen}
        onClose={directions.close}
        steps={MOTIF_BUILDER_DIRECTIONS}
        bonusText="Try a different instrument — does it change the character's personality?"
      />

      {/* Save before switching confirmation */}
      {pendingSwitch && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-white text-lg font-bold mb-2">Save your leitmotif?</h3>
            <p className="text-gray-400 text-sm mb-5">
              You have an unsaved recording. Would you like to save it before switching characters?
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDiscardAndSwitch}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-medium transition-colors"
              >
                Don't Save
              </button>
              <button
                onClick={() => setPendingSwitch(null)}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={confirmSaveAndSwitch}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DirectionsReopenButton is inline in the header — no fixed-position one needed */}
    </div>
  );
};

export default MotifBuilderActivity;
