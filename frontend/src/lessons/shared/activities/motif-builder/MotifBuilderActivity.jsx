// File: /src/lessons/shared/activities/motif-builder/MotifBuilderActivity.jsx
// Motif Builder — Students create a character and compose a 4-8 note theme
// Film Music Lesson 1: WHO Is In The Story? (Leitmotif & Melody)
//
// LEFT SIDE: Character Card (pick from 12, draw, color, name, 3 words)
// RIGHT SIDE: VirtualInstrumentOverlay (same keyboard as the DAW)
// Each character saves its own motif. Students can switch characters and present.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Save, Check, ChevronRight, ChevronDown, RotateCcw, Pencil, Eraser, Trash2, HelpCircle, Stamp } from 'lucide-react';
import getStroke from 'perfect-freehand';
import * as Tone from 'tone';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';
import { CHARACTER_LIBRARY, MOTIF_INSTRUMENTS } from '../../../film-music/lesson1/Lesson1config';
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

const MOTIF_BUILDER_PAGES = [
  {
    title: 'Create Your Character',
    items: [
      'Pick a character from the grid on the left',
      'Draw your character, choose a color, and name them',
      'Choose a type (Hero, Villain, Sneaky, etc.) and describe them in a few words',
    ]
  },
  {
    title: 'Compose Their Theme',
    items: [
      'Pick an instrument and scale that match your character',
      'Press Record, then play 4–8 notes on the keyboard',
      'Press Play to hear it back — does it match your character?',
      'If not, press Clear and try again!',
    ]
  }
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

const deleteCharacterMotif = (charId) => {
  try {
    localStorage.removeItem(`fm-lesson1-motif-${charId}`);
    localStorage.removeItem(`fm-lesson1-drawing-${charId}`);
  } catch(e) {}
};

const saveCharacterDrawing = (charId, dataUrl) => {
  try { localStorage.setItem(`fm-lesson1-drawing-${charId}`, dataUrl); } catch(e) {}
};

// ========================================
// Drawing Canvas — perfect-freehand strokes + stamps
// ========================================
const DRAW_COLORS = [
  '#FFFFFF', '#1F2937', '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#A855F7',
];

// SVG stamp icons — music-themed + character accessories
const STAMPS = [
  { id: 'star', text: '⭐' },
  { id: 'heart', text: '❤️' },
  { id: 'lightning', text: '⚡' },
  { id: 'music', text: '🎵' },
  { id: 'note', text: '🎶' },
  { id: 'fire', text: '🔥' },
  { id: 'crown', text: '👑' },
  { id: 'sword', text: '⚔️' },
  { id: 'shield', text: '🛡️' },
  { id: 'moon', text: '🌙' },
  { id: 'sun', text: '☀️' },
  { id: 'skull', text: '💀' },
  { id: 'sparkle', text: '✨' },
  { id: 'flower', text: '🌸' },
  { id: 'eye', text: '👁️' },
  { id: 'gem', text: '💎' },
];

// Convert perfect-freehand points to an SVG path then render onto canvas
const renderFreehandStroke = (ctx, points, color, size) => {
  const stroke = getStroke(points, {
    size: size * 2,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });
  if (stroke.length < 2) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(stroke[0][0], stroke[0][1]);
  for (let i = 1; i < stroke.length; i++) {
    const [x, y] = stroke[i];
    const [px, py] = stroke[i - 1];
    ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
  }
  ctx.closePath();
  ctx.fill();
};

const DrawingCanvas = ({ characterId, characterColor, onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser' | 'fill' | 'stamp'
  const [brushSize, setBrushSize] = useState(3);
  const [drawColor, setDrawColor] = useState(characterColor || '#FFFFFF');
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [showStamps, setShowStamps] = useState(false);
  const strokePointsRef = useRef([]);
  const undoStackRef = useRef([]);

  const pushUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(data);
    if (undoStackRef.current.length > 20) undoStackRef.current.shift();
  };

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
      setHasDrawn(true);
    } else {
      setHasDrawn(false);
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
    const w = canvas.width, h = canvas.height;
    const temp = document.createElement('canvas').getContext('2d');
    temp.fillStyle = fillColor;
    temp.fillRect(0, 0, 1, 1);
    const fc = temp.getImageData(0, 0, 1, 1).data;
    const sx = Math.floor(startX), sy = Math.floor(startY);
    const idx = (sy * w + sx) * 4;
    const tr = data[idx], tg = data[idx + 1], tb = data[idx + 2];
    if (tr === fc[0] && tg === fc[1] && tb === fc[2]) return;
    const stack = [[sx, sy]];
    const visited = new Set();
    const tolerance = 30;
    const match = (i) => Math.abs(data[i] - tr) <= tolerance && Math.abs(data[i + 1] - tg) <= tolerance && Math.abs(data[i + 2] - tb) <= tolerance;
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = y * w + x;
      if (visited.has(key) || x < 0 || x >= w || y < 0 || y >= h) continue;
      const i = key * 4;
      if (!match(i)) continue;
      visited.add(key);
      data[i] = fc[0]; data[i + 1] = fc[1]; data[i + 2] = fc[2]; data[i + 3] = 255;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    ctx.putImageData(imageData, 0, 0);
  };

  // Place stamp on canvas
  const placeStamp = (pos) => {
    if (!selectedStamp) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const stampSize = Math.max(24, brushSize * 5);
    // Use system emoji font to ensure color rendering
    ctx.font = `${stampSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF'; // fallback for non-emoji chars
    ctx.fillText(selectedStamp.text, pos.x, pos.y);
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
    if (tool === 'stamp') {
      pushUndo();
      placeStamp(pos);
      autoSave();
      return;
    }

    pushUndo();
    setIsDrawing(true);
    strokePointsRef.current = [[pos.x, pos.y, 0.5]];
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);

    if (tool === 'eraser') {
      // Eraser uses simple line for immediate feedback
      const last = strokePointsRef.current[strokePointsRef.current.length - 1];
      ctx.beginPath();
      ctx.moveTo(last[0], last[1]);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = brushSize * 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      strokePointsRef.current.push([pos.x, pos.y, 0.5]);
    } else {
      // Pen: accumulate points, re-render stroke for smooth output
      strokePointsRef.current.push([pos.x, pos.y, 0.5]);
      // Restore to before this stroke, then re-render
      if (undoStackRef.current.length > 0) {
        const base = undoStackRef.current[undoStackRef.current.length - 1];
        ctx.putImageData(base, 0, 0);
      }
      renderFreehandStroke(ctx, strokePointsRef.current, drawColor, brushSize);
    }
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Final render of the completed stroke
    if (tool === 'pen' && strokePointsRef.current.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (undoStackRef.current.length > 0) {
        ctx.putImageData(undoStackRef.current[undoStackRef.current.length - 1], 0, 0);
      }
      renderFreehandStroke(ctx, strokePointsRef.current, drawColor, brushSize);
    }
    strokePointsRef.current = [];
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
      onClick={() => { setTool(id); if (id !== 'stamp') setShowStamps(false); }}
      className={`p-1 rounded transition-colors ${tool === id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
      title={label}
    >
      {icon}
    </button>
  );

  const handleStartDraw = (e) => {
    setHasDrawn(true);
    startDraw(e);
  };

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={450}
          className="w-full rounded-lg border border-gray-600"
          style={{ touchAction: 'none', aspectRatio: '2/3', cursor: tool === 'stamp' ? 'copy' : tool === 'fill' ? 'crosshair' : 'crosshair' }}
          onMouseDown={handleStartDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={handleStartDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-6xl mb-3 opacity-30">✏️</span>
            <span className="text-gray-500 text-sm font-semibold">Draw Your Character</span>
          </div>
        )}
      </div>

      {/* Toolbar: pen, eraser, fill, stamps, undo, clear, size */}
      <div className="flex items-center gap-0.5">
        {toolBtn('pen', <Pencil size={12} />, 'Pen')}
        {toolBtn('eraser', <Eraser size={12} />, 'Eraser')}
        {toolBtn('fill', <span className="text-[10px] font-bold">Fill</span>, 'Fill bucket')}
        <button
          onClick={() => { setTool('stamp'); setShowStamps(!showStamps); }}
          className={`p-1 rounded transition-colors ${tool === 'stamp' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
          title="Stamps"
        >
          <Stamp size={12} />
        </button>

        <div className="w-px h-3.5 bg-gray-700 mx-0.5" />

        <button onClick={undo} className="p-1 rounded bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Undo">
          <RotateCcw size={12} />
        </button>
        <button onClick={clearCanvas} className="p-1 rounded bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Clear">
          <Trash2 size={12} />
        </button>

        <div className="flex items-center gap-0.5 ml-auto">
          <div className="w-3 h-3 flex items-center justify-center">
            <div className="rounded-full bg-white" style={{ width: Math.max(3, brushSize), height: Math.max(3, brushSize) }} />
          </div>
          <input
            type="range" min="1" max="12" value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-12 h-1 accent-blue-500"
          />
        </div>
      </div>

      {/* Stamp palette — collapsible */}
      {showStamps && (
        <div className="grid grid-cols-8 gap-1 bg-gray-800 rounded-lg p-1.5">
          {STAMPS.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedStamp(s); setTool('stamp'); }}
              className={`text-lg p-0.5 rounded transition-all ${selectedStamp?.id === s.id ? 'bg-blue-600 scale-110' : 'hover:bg-gray-700'}`}
              title={s.text}
            >
              {s.text}
            </button>
          ))}
        </div>
      )}

      {/* Color row */}
      <div className="flex gap-1 flex-wrap">
        {DRAW_COLORS.map(c => (
          <button
            key={c}
            onClick={() => { setDrawColor(c); if (tool === 'eraser') setTool('pen'); }}
            className={`w-4 h-4 rounded-full border-2 transition-all ${drawColor === c && tool !== 'eraser' ? 'border-white scale-110' : 'border-gray-600'}`}
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
  // Session context for Firebase sync
  const { classId, sessionCode, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  const studentsPath = React.useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  // Derive register from recorded notes
  const deriveRegister = (notes) => {
    if (!notes || notes.length === 0) return 'mid';
    const octaves = notes
      .filter(n => n.note && !n.note.startsWith('drum-'))
      .map(n => parseInt(n.note.replace(/[^0-9]/g, '')) || 4);
    if (octaves.length === 0) return 'mid';
    const avg = octaves.reduce((a, b) => a + b, 0) / octaves.length;
    if (avg <= 3) return 'low';
    if (avg >= 5) return 'high';
    return 'mid';
  };

  // Derive mode from character type
  const deriveMode = (charType) => {
    return (charType === 'villain' || charType === 'sneaky') ? 'minor' : 'major';
  };

  // Derive instrument family from instrument ID using MOTIF_INSTRUMENTS config
  const deriveInstrumentFamily = (instrumentId) => {
    const motifInst = MOTIF_INSTRUMENTS.find(i => i.id === instrumentId);
    if (motifInst) return motifInst.family.toLowerCase();
    return 'strings';
  };

  // Sync motif to Firebase so teacher can see it in Gallery
  const syncMotifToFirebase = useCallback((charId, notes, instrument, charData) => {
    if (!studentsPath || !userId) return;
    const db = getDatabase();
    const charType = charData.characterType || 'hero';
    update(ref(db, `${studentsPath}/${userId}`), {
      motifSubmission: JSON.stringify({
        characterId: charId,
        notes,
        instrument,
        characterName: charData.characterName || '',
        characterDescription: charData.characterDescription || '',
        characterType: charType,
        characterColor: charData.characterColor || '#3B82F6',
        // Derived categories for Gallery guessing
        mode: deriveMode(charType),
        instrumentFamily: deriveInstrumentFamily(instrument),
        register: deriveRegister(notes),
        submittedAt: Date.now(),
      })
    });
  }, [studentsPath, userId]);

  // Force re-render when characters are deleted
  const [charVersion, setCharVersion] = useState(0);

  // Character card state
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [characterType, setCharacterType] = useState('hero'); // hero, villain, romantic, sneaky, other
  const [customType, setCustomType] = useState('');
  const [characterColor, setCharacterColor] = useState('#3B82F6');
  const [showDrawing, setShowDrawing] = useState(false);
  const [charDropdownOpen, setCharDropdownOpen] = useState(false);
  const charDropdownRef = useRef(null);

  const CHARACTER_TYPES = [
    { id: 'hero', label: 'Hero' },
    { id: 'villain', label: 'Villain' },
    { id: 'romantic', label: 'Romantic' },
    { id: 'sneaky', label: 'Sneaky' },
    { id: 'other', label: 'Other...' },
  ];

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
  // Directions modal
  const directions = useDirectionsModal('motif-builder');

  // Load saved data for selected character
  useEffect(() => {
    if (!selectedCharacterId) return;
    // Load character card
    const savedCard = getCharacterCard();
    if (savedCard && savedCard.characterId === selectedCharacterId) {
      setCharacterName(savedCard.characterName || '');
      setCharacterDescription(savedCard.characterDescription || '');
      setCharacterType(savedCard.characterType || 'hero');
      setCustomType(savedCard.customType || '');
      setCharacterColor(savedCard.characterColor || '#3B82F6');
    } else {
      // Load per-character motif data for name/words if available
      const savedMotif = getCharacterMotif(selectedCharacterId);
      if (savedMotif) {
        setCharacterName(savedMotif.characterName || '');
        setCharacterDescription(savedMotif.characterDescription || '');
        setCharacterType(savedMotif.characterType || 'hero');
        setCustomType(savedMotif.customType || '');
        setCharacterColor(savedMotif.characterColor || CHARACTER_LIBRARY.find(c => c.id === selectedCharacterId)?.defaultColor || '#3B82F6');
      } else {
        setCharacterName('');
        setCharacterDescription('');
        setCharacterType('hero');
        setCustomType('');
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

    // Auto-save when recording stops (if there are notes and a character selected)
    if (notes.length > 0 && selectedCharacterId) {
      const charData = { characterName, characterDescription, characterType, customType, characterColor };
      saveCharacterCard(selectedCharacterId, characterName, characterDescription, characterColor, characterType, customType);
      saveCharacterMotif(selectedCharacterId, notes, instrument, charData);
      saveMotif(notes, selectedCharacterId, instrument, 80);
      syncMotifToFirebase(selectedCharacterId, notes, instrument, charData);
      setHasSaved(true);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  }, [selectedCharacterId, characterName, characterDescription, characterType, customType, characterColor, syncMotifToFirebase]);

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
  const handleSave = useCallback(() => {
    if (recordedNotes.length < 1 || !selectedCharacterId) return;
    const charData = { characterName, characterDescription, characterType, customType, characterColor };
    saveCharacterCard(selectedCharacterId, characterName, characterDescription, characterColor, characterType, customType);
    saveCharacterMotif(selectedCharacterId, recordedNotes, recordedInstrument, charData);
    // Also save to the original storage for backward compat
    saveMotif(recordedNotes, selectedCharacterId, recordedInstrument, 80);
    syncMotifToFirebase(selectedCharacterId, recordedNotes, recordedInstrument, charData);
    setHasSaved(true);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  }, [recordedNotes, selectedCharacterId, characterName, characterDescription, characterType, customType, characterColor, recordedInstrument, syncMotifToFirebase]);

  const handleComplete = () => { if (onComplete) onComplete(); };

  // Listen for teacher save command (Save & Continue)
  const lastSaveCommandRef = useRef(null);
  useEffect(() => {
    const effectiveCode = sessionCode || classId;
    if (!effectiveCode || !isSessionMode) return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${effectiveCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();
      if (!saveCommand) return;
      if (lastSaveCommandRef.current === null) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }
      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('📡 Teacher save command received — saving motif builder');
        handleSave();
      }
    });

    return () => unsubscribe();
  }, [sessionCode, classId, isSessionMode, handleSave]);

  // Switch characters directly (auto-save means nothing is lost)
  const switchCharacter = (targetId) => {
    if (targetId === selectedCharacterId) return;
    setSelectedCharacterId(targetId);
  };

  const switchToNewCharacter = () => {
    setSelectedCharacterId(null);
    setCharDropdownOpen(true);
    setRecordedNotes([]);
    setHasSaved(false);
  };

  const noteCount = recordedNotes.filter(n => !n.note?.startsWith('drum-')).length;
  const canSave = noteCount >= 1 && selectedCharacterId;
  const selectedCharacter = CHARACTER_LIBRARY.find(c => c.id === selectedCharacterId);

  // Check which characters have saved motifs (for the grid indicators)
  // charVersion dependency forces re-check after delete
  const savedCharIds = CHARACTER_LIBRARY.map(c => c.id).filter(id => {
    void charVersion; // depend on version to re-compute after delete
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
              <div key={charId} className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => switchCharacter(charId)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-l-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span>{char.emoji}</span>
                  <span>{motif?.characterName || char.name}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCharacterMotif(charId);
                    setCharVersion(v => v + 1);
                    if (selectedCharacterId === charId) switchToNewCharacter();
                  }}
                  className="px-1 py-1 rounded-r-lg bg-gray-800 text-gray-600 hover:text-red-400 hover:bg-gray-700 transition-colors text-xs"
                  title="Delete character"
                >
                  ×
                </button>
              </div>
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

          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
              canSave ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save size={12} /> Save
          </button>
        </div>
      </div>

      {/* Main Content — LEFT: artwork | RIGHT: info + keyboard */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ====== LEFT: Character picker + artwork ====== */}
        <div className="w-[340px] flex-shrink-0 border-r border-gray-700 flex flex-col overflow-y-auto p-3 space-y-2">
          {/* Character dropdown */}
          <div className="relative" ref={charDropdownRef}>
            <button
              onClick={() => setCharDropdownOpen(!charDropdownOpen)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                !selectedCharacterId
                  ? 'bg-green-600/20 border border-green-500/50 animate-pulse'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {selectedCharacter ? (
                <>
                  <span className="text-lg">{selectedCharacter.emoji}</span>
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
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
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

          {/* Drawing / emoji + color */}
          {selectedCharacterId && (
            <div
              className="rounded-xl p-3 border-2 flex-1 flex flex-col min-h-0"
              style={{ borderColor: characterColor, background: `${characterColor}15` }}
            >
              {true ? (
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


            </div>
          )}
        </div>

        {/* ====== RIGHT: Name/type/description + keyboard + controls ====== */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">

          {/* Character info bar — compact row above keyboard */}
          {selectedCharacterId && (
            <div className="flex-shrink-0 px-3 py-2 border-b border-gray-700 flex items-center gap-3">
              {/* Name */}
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value.slice(0, 20))}
                placeholder="Name"
                className="w-[140px] bg-gray-800 text-white text-sm font-bold placeholder-gray-500 outline-none rounded-lg px-2.5 py-1.5 border border-gray-700 focus:border-orange-400"
                maxLength={20}
              />

              {/* Character type */}
              <select
                value={characterType}
                onChange={(e) => setCharacterType(e.target.value)}
                className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1.5 outline-none border border-gray-700 focus:border-orange-400"
              >
                {CHARACTER_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              {characterType === 'other' && (
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value.slice(0, 20))}
                  placeholder="Type..."
                  className="w-[100px] bg-gray-800 text-white text-xs rounded-lg px-2 py-1.5 placeholder-gray-500 outline-none border border-gray-700 focus:border-orange-400"
                  maxLength={20}
                />
              )}

              {/* Description */}
              <textarea
                rows={2}
                value={characterDescription}
                onChange={(e) => setCharacterDescription(e.target.value.slice(0, 150))}
                placeholder="Describe your character (e.g. A brave knight who protects the village)"
                className="flex-1 bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 placeholder-gray-500 outline-none border border-gray-700 focus:border-orange-400 resize-none"
                maxLength={150}
              />
            </div>
          )}

          {/* Keyboard — natural height, controls sit right below */}
          <div className="flex-shrink-0">
            <VirtualInstrumentOverlay
              embedded={true}
              showRecord={false}
              keyboardOnly={true}
              defaultScale={characterType === 'villain' || characterType === 'sneaky' ? 'minor' : 'major'}
              isRecording={isRecording}
              recordingStartTime={recordingStartTime}
              onRecordStart={handleRecordStart}
              onRecordStop={handleRecordStop}
              onRecordingComplete={handleRecordingComplete}
              onClose={() => {}}
              highlightedKeys={highlightedKeys.size > 0 ? highlightedKeys : null}
            />
          </div>

          {/* Controls — flush under piano */}
          <div className="flex-shrink-0 px-3 py-1 flex items-center gap-2 bg-gray-900 border-t border-gray-700">
            <button
              onClick={isRecording ? handleRecordStop : handleRecordStart}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40'
                  : 'bg-gray-700 text-gray-300 hover:bg-red-600/80 hover:text-white'
              }`}
            >
              {isRecording ? <><Square size={14} fill="currentColor" /> Stop Rec</> : <><span className="w-3 h-3 rounded-full bg-red-500" /> Record</>}
            </button>

            <button
              onClick={isPlaying ? stopPlayback : playMotif}
              disabled={recordedNotes.length === 0 || isRecording}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors ${
                recordedNotes.length === 0 || isRecording
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : isPlaying ? 'bg-green-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? <><Square size={14} fill="currentColor" /> Stop</> : <><Play size={14} fill="currentColor" /> Play</>}
            </button>

            <button
              onClick={() => { if (window.confirm('Are you sure you want to erase your recording?')) clearMotif(); }}
              disabled={recordedNotes.length === 0 || isRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-400 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} /> Clear
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
        pages={MOTIF_BUILDER_PAGES}
      />

      {/* DirectionsReopenButton is inline in the header — no fixed-position one needed */}
    </div>
  );
};

export default MotifBuilderActivity;
