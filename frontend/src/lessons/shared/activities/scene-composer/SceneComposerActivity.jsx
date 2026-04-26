// SceneComposerActivity.jsx
// Film Music Lesson 2: Scene Composer
// Full MusicComposer DAW with a drawing panel replacing the video player.
// Students draw characters on a plain canvas and compose music using the DAW.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pencil, Eraser, Trash2, RotateCcw, Stamp, HelpCircle, Save, Check } from 'lucide-react';
import getStroke from 'perfect-freehand';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';
import MusicComposer from '../../../../pages/projects/film-music-score/composer/MusicComposer';
import {
  saveSceneDrawing, getSceneDrawing,
  saveSceneCharacter, getSceneCharacter,
  saveSceneSpotting, getSceneSpotting
} from '../../../film-music/lesson2/lesson2StorageUtils';
import {
  saveStudentWork, getStudentId, getClassAuthInfo, loadStudentWork
} from '../../../../utils/studentWorkStorage';
import { loadStudentWork as loadFromFirebase } from '../../../../firebase/studentWork';
import DirectionsModal from '../../components/DirectionsModal';

// ========================================
// Drawing helpers (same pattern as MotifBuilder)
// ========================================
const DRAW_COLORS = [
  '#FFFFFF', '#1F2937', '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#A855F7',
];

const STAMPS = [
  { id: 'star', text: '⭐' }, { id: 'heart', text: '❤️' },
  { id: 'lightning', text: '⚡' }, { id: 'music', text: '🎵' },
  { id: 'fire', text: '🔥' }, { id: 'crown', text: '👑' },
  { id: 'sword', text: '⚔️' }, { id: 'shield', text: '🛡️' },
  { id: 'moon', text: '🌙' }, { id: 'skull', text: '💀' },
  { id: 'sparkle', text: '✨' }, { id: 'gem', text: '💎' },
];

const renderFreehandStroke = (ctx, points, color, size) => {
  const stroke = getStroke(points, {
    size: size * 2, thinning: 0.5, smoothing: 0.5, streamline: 0.5,
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

const DIRECTIONS_PAGES = [
  {
    title: 'Your Mission',
    items: [
      'Two scenes. Two characters. Two themes.',
      'Scene 1 (0–10 sec) and Scene 2 (10–20 sec)',
      'When the scene changes, your music must change too.',
      'The bigger the contrast, the better!'
    ]
  },
  {
    title: 'How It Works',
    items: [
      'Draw your character on the canvas in the video area',
      'Use the Instrument tool to record a 4–8 note theme',
      'Pick a DIFFERENT instrument for each character',
      'Switch between Scene 1 and Scene 2 using the tabs',
      'You can also use Beat Maker, Melody Maker, or Loop Library',
      'Your work auto-saves as you go'
    ]
  }
];

// ========================================
// Drawing Panel — replaces the VideoPlayer in the DAW
// ========================================
const CANVAS_BG = '#1F2937'; // dark gray background

const DrawingPanel = ({ sceneNum, onSceneChange }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(4);
  const [drawColor, setDrawColor] = useState('#FFFFFF');
  const [showStamps, setShowStamps] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [characterName, setCharacterName] = useState(() => getSceneCharacter(sceneNum));
  const strokePointsRef = useRef([]);
  const undoStackRef = useRef([]);

  const pushUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(data);
    if (undoStackRef.current.length > 20) undoStackRef.current.shift();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Fill with background color
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStackRef.current = [];
    setCharacterName(getSceneCharacter(sceneNum));
    const saved = getSceneDrawing(sceneNum);
    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = saved;
    }
  }, [sceneNum]);

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
    saveSceneDrawing(sceneNum, canvas.toDataURL('image/png'));
  };

  const floodFill = (startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const w = canvas.width, h = canvas.height;
    const temp = document.createElement('canvas').getContext('2d');
    temp.fillStyle = fillColor;
    temp.fillRect(0, 0, 1, 1);
    const fc = temp.getImageData(0, 0, 1, 1).data;
    const sx = Math.floor(startX), sy = Math.floor(startY);
    const idx = (sy * w + sx) * 4;
    const tr = data[idx], tg = data[idx + 1], tb = data[idx + 2], ta = data[idx + 3];
    if (tr === fc[0] && tg === fc[1] && tb === fc[2] && ta === fc[3]) return;
    const stack = [[sx, sy]];
    const visited = new Set();
    const tolerance = 30;
    const match = (i) => Math.abs(data[i] - tr) <= tolerance && Math.abs(data[i + 1] - tg) <= tolerance && Math.abs(data[i + 2] - tb) <= tolerance && Math.abs(data[i + 3] - ta) <= tolerance;
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

  const placeStamp = (pos) => {
    if (!selectedStamp) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const stampSize = Math.max(24, brushSize * 4);
    ctx.font = `${stampSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedStamp.text, pos.x, pos.y);
  };

  const startDraw = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    if (tool === 'fill') { pushUndo(); floodFill(pos.x, pos.y, drawColor); autoSave(); return; }
    if (tool === 'stamp') { pushUndo(); placeStamp(pos); autoSave(); return; }
    pushUndo();
    setIsDrawing(true);
    strokePointsRef.current = [[pos.x, pos.y, 0.5]];
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const pos = getPos(e);
    if (tool === 'eraser') {
      const last = strokePointsRef.current[strokePointsRef.current.length - 1];
      // Eraser paints with background color
      ctx.beginPath();
      ctx.moveTo(last[0], last[1]);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = CANVAS_BG;
      ctx.lineWidth = brushSize * 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      strokePointsRef.current.push([pos.x, pos.y, 0.5]);
    } else {
      strokePointsRef.current.push([pos.x, pos.y, 0.5]);
      if (undoStackRef.current.length > 0) {
        ctx.putImageData(undoStackRef.current[undoStackRef.current.length - 1], 0, 0);
      }
      renderFreehandStroke(ctx, strokePointsRef.current, drawColor, brushSize);
    }
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (tool === 'pen' && strokePointsRef.current.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
    canvas.getContext('2d', { willReadFrequently: true }).putImageData(undoStackRef.current.pop(), 0, 0);
    autoSave();
  };

  const clearCanvas = () => {
    pushUndo();
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveSceneDrawing(sceneNum, '');
  };

  const handleCharName = (name) => {
    setCharacterName(name);
    saveSceneCharacter(sceneNum, name);
  };

  const toolBtn = (id, icon) => (
    <button key={id} onClick={() => { setTool(id); if (id !== 'stamp') setShowStamps(false); }}
      className={`p-1 rounded ${tool === id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
    >{icon}</button>
  );

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-hidden">
      {/* TOP: Drawing tools only — scene switching is in the timeline scene track */}
      <div className="flex-shrink-0">
        {/* Drawing tools + colors */}
        <div className="flex items-center gap-0.5 px-2 py-1 bg-gray-850 border-b border-gray-700">
          {toolBtn('pen', <Pencil size={12} />)}
          {toolBtn('eraser', <Eraser size={12} />)}
          {toolBtn('fill', <span className="text-[10px] font-bold px-0.5">Fill</span>)}
          <button onClick={() => { setTool('stamp'); setShowStamps(!showStamps); }}
            className={`p-1 rounded ${tool === 'stamp' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
          ><Stamp size={12} /></button>
          <div className="w-px h-4 bg-gray-700 mx-0.5" />
          <button onClick={undo} className="p-1 rounded bg-gray-700 text-gray-400 hover:text-white"><RotateCcw size={12} /></button>
          <button onClick={clearCanvas} className="p-1 rounded bg-gray-700 text-gray-400 hover:text-white"><Trash2 size={12} /></button>
          <div className="w-px h-4 bg-gray-700 mx-1" />
          <div className="flex gap-0.5">
            {DRAW_COLORS.map(c => (
              <button key={c} onClick={() => { setDrawColor(c); if (tool === 'eraser') setTool('pen'); }}
                className={`w-4 h-4 rounded-full border ${drawColor === c && tool !== 'eraser' ? 'border-white scale-110' : 'border-gray-600'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input type="range" min="1" max="12" value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-12 h-1 accent-blue-500 ml-auto"
          />
        </div>

        {showStamps && (
          <div className="flex gap-1 p-1.5 bg-gray-800 border-b border-gray-700 flex-wrap">
            {STAMPS.map(s => (
              <button key={s.id} onClick={() => { setSelectedStamp(s); setTool('stamp'); }}
                className={`text-base p-0.5 rounded ${selectedStamp?.id === s.id ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              >{s.text}</button>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM: Plain drawing canvas — constrained 16:9 */}
      <div className="flex-1 flex items-center justify-center bg-gray-950 min-h-0 p-2">
        <div className="relative w-full h-full" style={{ maxWidth: 'calc(100vh * 16 / 9)', aspectRatio: '16/9', maxHeight: '100%' }}>
          <canvas ref={canvasRef} width={640} height={360}
            className="absolute inset-0 w-full h-full rounded-lg"
            style={{ touchAction: 'none', cursor: tool === 'stamp' ? 'copy' : 'crosshair' }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          />
          {/* Scene label */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-bold pointer-events-none">
            Scene {sceneNum}{characterName ? `: ${characterName}` : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// Spotting Guide — character info panel to the right of the drawing canvas
// ========================================
const CHARACTER_TYPES = [
  { id: 'hero', label: 'Hero', emoji: '🦸' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
  { id: 'villain', label: 'Villain', emoji: '🦹' },
  { id: 'sneaky', label: 'Sneaky', emoji: '🕵️' },
  { id: 'other', label: 'Other...', emoji: '✏️' },
];

const SpottingGuide = ({ sceneNum }) => {
  const [data, setData] = useState(() => getSceneSpotting(sceneNum) || {
    characterName: '',
    characterType: 'hero',
    customType: '',
    description: '',
  });

  useEffect(() => {
    const saved = getSceneSpotting(sceneNum);
    setData(saved || { characterName: '', characterType: 'hero', customType: '', description: '' });
  }, [sceneNum]);

  const update = (field, value) => {
    setData(prev => {
      const updated = { ...prev, [field]: value };
      saveSceneSpotting(sceneNum, updated);
      // Also save character name for the timeline label
      if (field === 'characterName') saveSceneCharacter(sceneNum, value);
      return updated;
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border-l border-gray-700 overflow-hidden" style={{ width: 200 }}>
      {/* Header */}
      <div className="px-3 py-1.5 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <h3 className="text-white text-xs font-bold">Scene {sceneNum} Guide</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Character Name */}
        <div>
          <label className="text-gray-400 text-[10px] font-bold uppercase">Character Name</label>
          <input
            type="text"
            value={data.characterName}
            onChange={(e) => update('characterName', e.target.value)}
            placeholder="Name your character..."
            maxLength={25}
            className="w-full mt-0.5 px-2 py-1.5 bg-gray-800 text-white text-xs rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Character Type */}
        <div>
          <label className="text-gray-400 text-[10px] font-bold uppercase">Character Type</label>
          <div className="grid grid-cols-2 gap-1 mt-0.5">
            {CHARACTER_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => update('characterType', type.id)}
                className={`flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-medium transition-colors ${
                  data.characterType === type.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{type.emoji}</span> {type.label}
              </button>
            ))}
          </div>
          {data.characterType === 'other' && (
            <input
              type="text"
              value={data.customType}
              onChange={(e) => update('customType', e.target.value)}
              placeholder="Type..."
              maxLength={20}
              className="w-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
            />
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-gray-400 text-[10px] font-bold uppercase">Describe Your Character</label>
          <textarea
            value={data.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="e.g. A brave knight who protects the village..."
            maxLength={150}
            rows={3}
            className="w-full mt-0.5 px-2 py-1.5 bg-gray-800 text-white text-xs rounded border border-gray-600 focus:border-orange-500 focus:outline-none resize-none"
          />
          <div className="text-gray-600 text-[9px] text-right">{data.description.length}/150</div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// Main SceneComposerActivity
// ========================================
const COMPOSITION_KEY = 'fm-lesson2-daw';
const SCENES_KEY = 'fm-lesson2-scenes';
const DEFAULT_SCENE_DURATION = 10;
const MIN_SCENE_DURATION = 3;
const MAX_SCENES = 8;

// Load/save scenes from localStorage
const loadScenes = () => {
  try {
    const saved = localStorage.getItem(SCENES_KEY);
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  // Default: two 10-second scenes
  return [
    { startTime: 0, endTime: 10 },
    { startTime: 10, endTime: 20 },
  ];
};

const saveScenes = (scenes) => {
  try { localStorage.setItem(SCENES_KEY, JSON.stringify(scenes)); } catch(e) {}
};

const ACTIVITY_ID = 'fm-scene-composer';
const VIEW_ROUTE = '/lessons/film-music/lesson2?view=saved';

const SceneComposerActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  const { sessionCode, classId } = useSession();
  const [activeScene, setActiveScene] = useState(1);
  const [showDirections, setShowDirections] = useState(!viewMode);
  const [scenes, setScenes] = useState(loadScenes);
  const [showSaved, setShowSaved] = useState(false);
  const [studentId, setStudentId] = useState(null);

  const totalDuration = scenes.length > 0 ? scenes[scenes.length - 1].endTime : 20;

  // DAW state
  const [placedLoops, setPlacedLoops] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPOSITION_KEY);
      return saved ? JSON.parse(saved).placedLoops || [] : [];
    } catch { return []; }
  });

  // Refs for Firebase listener (avoid stale closures)
  const placedLoopsRef = useRef(placedLoops);
  placedLoopsRef.current = placedLoops;
  const scenesStateRef = useRef(scenes);
  scenesStateRef.current = scenes;
  const studentIdRef = useRef(studentId);
  studentIdRef.current = studentId;
  const hasLoadedRef = useRef(false);
  const isSavingRef = useRef(false);
  const lastSaveCommandRef = useRef(null);

  // Get student ID on mount
  useEffect(() => {
    const id = getStudentId();
    setStudentId(id);
  }, []);

  // ========================================
  // LOAD: Firebase first, then localStorage
  // ========================================
  useEffect(() => {
    if (!studentId || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadSavedWork = async () => {
      const classAuth = getClassAuthInfo();

      // Try Firebase first (authenticated students)
      if (classAuth?.uid) {
        try {
          const fbData = await Promise.race([
            loadFromFirebase(classAuth.uid, 'fms-lesson2', 'fm-scene-composer'),
            new Promise((_, reject) => setTimeout(() => reject('timeout'), 8000))
          ]);
          if (fbData?.data) {
            console.log('☁️ Loaded scene composer from Firebase');
            if (fbData.data.placedLoops) setPlacedLoops(fbData.data.placedLoops);
            if (fbData.data.scenes) { setScenes(fbData.data.scenes); saveScenes(fbData.data.scenes); }
            // Restore spotting guide data per scene
            if (fbData.data.spottingGuides) {
              fbData.data.spottingGuides.forEach((sg, i) => {
                if (sg) {
                  saveSceneSpotting(i + 1, sg);
                  if (sg.characterName) saveSceneCharacter(i + 1, sg.characterName);
                }
              });
            }
            // Restore drawings
            if (fbData.data.drawings) {
              fbData.data.drawings.forEach((d, i) => { if (d) saveSceneDrawing(i + 1, d); });
            }
            return;
          }
        } catch (e) {
          console.warn('Firebase load failed/timed out, using localStorage:', e);
        }
      }

      // Fallback: localStorage
      const localData = loadStudentWork(ACTIVITY_ID, studentId);
      if (localData?.data) {
        console.log('💾 Loaded scene composer from localStorage');
        if (localData.data.placedLoops) setPlacedLoops(localData.data.placedLoops);
        if (localData.data.scenes) { setScenes(localData.data.scenes); saveScenes(localData.data.scenes); }
      }
    };

    loadSavedWork();
  }, [studentId]);

  // ========================================
  // SAVE: Bundle all data and call saveStudentWork
  // ========================================
  const doSave = useCallback((silent = false) => {
    if (isSavingRef.current) return;
    const loops = placedLoopsRef.current;
    const currentScenes = scenesStateRef.current;
    const id = studentIdRef.current;
    if (!id) return;

    isSavingRef.current = true;
    const authInfo = getClassAuthInfo();

    // Collect spotting guides and drawings for all scenes
    const spottingGuides = currentScenes.map((_, i) => getSceneSpotting(i + 1));
    const drawings = currentScenes.map((_, i) => getSceneDrawing(i + 1));

    // Also save to localStorage DAW key
    try {
      localStorage.setItem(COMPOSITION_KEY, JSON.stringify({
        placedLoops: loops,
        savedAt: new Date().toISOString()
      }));
    } catch(e) {}

    saveStudentWork(ACTIVITY_ID, {
      title: 'Scene Composer',
      emoji: '🎬',
      viewRoute: VIEW_ROUTE,
      subtitle: `${currentScenes.length} scenes • ${loops.length} loops`,
      category: 'Film Music: Scoring the Story',
      lessonId: 'fms-lesson2',
      data: {
        placedLoops: loops,
        scenes: currentScenes,
        spottingGuides,
        drawings,
        totalDuration: currentScenes.length > 0 ? currentScenes[currentScenes.length - 1].endTime : 20,
        timestamp: Date.now()
      }
    }, id, authInfo);

    isSavingRef.current = false;

    if (!silent) {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  }, []);

  // ========================================
  // TEACHER SAVE COMMAND LISTENER
  // ========================================
  useEffect(() => {
    const effectiveCode = sessionCode || classId;
    if (!effectiveCode || !isSessionMode || viewMode || !studentId) return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${effectiveCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();
      if (!saveCommand) return;
      // Skip initial load
      if (lastSaveCommandRef.current === null) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }
      // New command detected — save using refs (never stale)
      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('📡 Teacher save command received — saving scene composer');
        doSave(true);
      }
    });

    return () => unsubscribe();
  }, [sessionCode, classId, isSessionMode, viewMode, studentId, doSave]);

  // ========================================
  // AUTO-SAVE every 30 seconds
  // ========================================
  useEffect(() => {
    if (viewMode) return;
    const interval = setInterval(() => {
      if (placedLoopsRef.current.length > 0) {
        doSave(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [viewMode, doSave]);

  // ========================================
  // SAVE ON UNMOUNT
  // ========================================
  useEffect(() => {
    return () => {
      if (isSessionMode && !viewMode && placedLoopsRef.current.length > 0) {
        doSave(true);
      }
    };
  }, [isSessionMode, viewMode, doSave]);

  // ========================================
  // LOOP CALLBACKS (also save to localStorage DAW key)
  // ========================================
  const saveComposition = (loops) => {
    try {
      localStorage.setItem(COMPOSITION_KEY, JSON.stringify({
        placedLoops: loops,
        savedAt: new Date().toISOString()
      }));
    } catch(e) {}
  };

  const handleLoopPlaced = useCallback((loop) => {
    setPlacedLoops(prev => {
      const updated = [...prev, loop];
      saveComposition(updated);
      return updated;
    });
  }, []);

  const handleLoopDeleted = useCallback((loopId) => {
    setPlacedLoops(prev => {
      const updated = prev.filter(l => l.id !== loopId);
      saveComposition(updated);
      return updated;
    });
  }, []);

  const handleLoopUpdated = useCallback((loopId, updates) => {
    setPlacedLoops(prev => {
      const updated = prev.map(l => l.id === loopId ? { ...l, ...updates } : l);
      saveComposition(updated);
      return updated;
    });
  }, []);

  // Auto-switch scene when playhead crosses scene boundaries
  const scenesRef = useRef(scenes);
  scenesRef.current = scenes;
  const handleTimeUpdate = useCallback((time) => {
    const sc = scenesRef.current;
    for (let i = sc.length - 1; i >= 0; i--) {
      if (time >= sc[i].startTime) {
        setActiveScene(prev => prev !== i + 1 ? i + 1 : prev);
        return;
      }
    }
  }, []);

  // Add a new scene
  const addScene = useCallback(() => {
    setScenes(prev => {
      if (prev.length >= MAX_SCENES) return prev;
      const lastEnd = prev[prev.length - 1].endTime;
      const updated = [...prev, { startTime: lastEnd, endTime: lastEnd + DEFAULT_SCENE_DURATION }];
      saveScenes(updated);
      return updated;
    });
  }, []);

  // Resize scene boundary (drag divider between scene i and i+1)
  const handleSceneBoundaryDrag = useCallback((boundaryIndex, newTime) => {
    // boundaryIndex = the scene whose endTime is being changed
    setScenes(prev => {
      const updated = [...prev];
      const minEnd = updated[boundaryIndex].startTime + MIN_SCENE_DURATION;
      const maxEnd = updated[boundaryIndex + 1].endTime - MIN_SCENE_DURATION;
      const clamped = Math.max(minEnd, Math.min(maxEnd, Math.round(newTime)));
      updated[boundaryIndex] = { ...updated[boundaryIndex], endTime: clamped };
      updated[boundaryIndex + 1] = { ...updated[boundaryIndex + 1], startTime: clamped };
      saveScenes(updated);
      return updated;
    });
  }, []);

  // Delete a scene — shift later scenes left to fill the gap
  const deleteScene = useCallback((deleteIndex) => {
    setScenes(prev => {
      if (prev.length <= 2) return prev; // minimum 2 scenes
      const deleted = prev[deleteIndex];
      const deletedDuration = deleted.endTime - deleted.startTime;
      const updated = prev.filter((_, i) => i !== deleteIndex);
      // Shift all scenes after the deleted one left
      for (let i = deleteIndex; i < updated.length; i++) {
        updated[i] = {
          startTime: updated[i].startTime - deletedDuration,
          endTime: updated[i].endTime - deletedDuration,
        };
      }
      saveScenes(updated);
      return updated;
    });
    // Fix active scene if needed
    setActiveScene(prev => {
      const newCount = scenes.length - 1;
      if (prev > newCount) return newCount;
      return prev;
    });
  }, [scenes.length]);

  // Character names — load dynamically per scene
  const getCharName = (num) => getSceneCharacter(num);

  // Scene drawing + spotting guide replaces the VideoPlayer
  const sceneVideoContent = (
    <div className="h-full flex">
      {/* Drawing canvas — takes remaining space */}
      <div className="flex-1 min-w-0">
        <DrawingPanel
          key={`scene-${activeScene}`}
          sceneNum={activeScene}
          onSceneChange={setActiveScene}
        />
      </div>
      {/* Spotting guide — fixed width on the right */}
      <SpottingGuide
        key={`spotting-${activeScene}`}
        sceneNum={activeScene}
      />
    </div>
  );

  // Build scene blocks data from scenes array
  const sceneBlocksData = scenes.map((scene, i) => {
    const num = i + 1;
    const charName = getCharName(num);
    const duration = scene.endTime - scene.startTime;
    return {
      startTime: scene.startTime,
      endTime: scene.endTime,
      label: `Scene ${num}${charName ? ': ' + charName : ''} (${duration}s)`,
      active: activeScene === num,
      onClick: () => setActiveScene(num),
      // Each scene except the last gets a resize handle on its right edge
      onResize: i < scenes.length - 1 ? (newTime) => handleSceneBoundaryDrag(i, newTime) : undefined,
      // Delete available when more than 2 scenes
      onDelete: scenes.length > 2 ? () => deleteScene(i) : undefined,
    };
  });

  // Add "+" button as a special block after the last scene
  if (scenes.length < MAX_SCENES) {
    sceneBlocksData.push({
      startTime: totalDuration,
      endTime: totalDuration, // zero-width — rendered specially in TimelineContent
      label: '+',
      isAddButton: true,
      onClick: addScene,
    });
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Compact header with directions + save buttons */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <span className="text-gray-400 text-xs">
          {viewMode ? 'Viewing Saved Work' : `Scene Composer — ${scenes.length} scenes, ${totalDuration}s`}
        </span>
        {!viewMode && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowDirections(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs hover:bg-gray-600 hover:text-white transition-colors"
            >
              <HelpCircle size={13} /> Directions
            </button>
            <button
              onClick={() => doSave(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                showSaved
                  ? 'bg-green-600 text-white'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {showSaved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save</>}
            </button>
          </div>
        )}
      </div>

      {/* Full DAW with scene drawing replacing the video player */}
      <div className="flex-1 min-h-0">
        <MusicComposer
          key="fm-lesson2-daw"
          onLoopDropCallback={handleLoopPlaced}
          onLoopDeleteCallback={handleLoopDeleted}
          onLoopUpdateCallback={handleLoopUpdated}
          onTimeUpdate={handleTimeUpdate}
          preselectedVideo={{ id: 'scene-composer', title: 'Scene Composer', duration: totalDuration }}
          customVideoContent={sceneVideoContent}
          sceneBlocks={sceneBlocksData}
          initialTopPanelHeight={500}
          showCreatorTools={true}
          showVirtualInstrument={true}
          defaultVirtualInstrumentOpen={true}
          primaryCreatorTool="virtual-instrument"
          showSoundEffects={true}
          hideHeader={true}
          hideSubmitButton={true}
          isLessonMode={true}
          showToast={(msg, type) => console.log(msg, type)}
          initialPlacedLoops={placedLoops}
          readOnly={viewMode}
          compositionKey={COMPOSITION_KEY}
        />
      </div>

      {/* Directions modal — shows on mount */}
      <DirectionsModal
        title="Scene Composer"
        isOpen={showDirections}
        pages={DIRECTIONS_PAGES}
        onClose={() => setShowDirections(false)}
      />
    </div>
  );
};

export default SceneComposerActivity;
