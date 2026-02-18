// ListeningJourney — iMovie-style parallax builder
// Timeline starts EMPTY — user drags/clicks scenes to build, then resizes & decorates
// Stickers are time-pinned: only visible when the playhead is at their timestamp

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Save, RotateCcw, Sticker, Type, Moon, Sun, CloudRain, CloudSnow, Wind, CloudOff, Hammer, Presentation, Maximize, Minimize, Play, Pause, SkipBack } from 'lucide-react';
import PlanningGuide from './PlanningGuide';
import EssayPanel from './EssayPanel';

import JourneyViewport from './JourneyViewport';
import JourneyTimeline from './JourneyTimeline';
import StickerOverlay from './StickerOverlay';
import DrawingOverlay from './DrawingOverlay';
import SectionPicker from './SectionPicker';
import TextOverlayEditor from './TextOverlayEditor';
import CharacterSelector from './CharacterSelector';
import useJourneyPlayback from './hooks/useJourneyPlayback';
import useParallaxScroll, { getScrollOffsetAtTime } from './hooks/useParallaxScroll';
import { MOVEMENT_TYPES } from './characterAnimations';
import { AUDIO_PATH, TOTAL_DURATION, CHARACTER_OPTIONS, SCENE_SKY_MAP, SECTION_COLORS } from './journeyDefaults';
import { SCENE_GROUND_MAP } from './config/groundTypes';
import { saveStudentWork, loadStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, onValue } from 'firebase/database';

let _nextSectionId = Date.now();

const DRAW_COLORS = ['#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];
const DRAW_SIZES = [4, 8, 16, 24, 32];

const ListeningJourney = ({ onComplete, viewMode = false, isSessionMode = false, pieceConfig = null }) => {
  // If pieceConfig is provided, use it instead of defaults
  const audioPath = pieceConfig?.audioPath || AUDIO_PATH;
  const audioVolume = pieceConfig?.volume || 1.0;
  const totalDuration = pieceConfig?.totalDuration || TOTAL_DURATION;
  const storageKey = pieceConfig?.storageKey || 'listening-journey';
  const presetMode = pieceConfig?.presetMode || false;
  const hideScenes = pieceConfig?.hideScenes || false;
  const hideMovement = pieceConfig?.hideMovement || false;
  const defaultTab = pieceConfig?.defaultTab || null;
  // ── State ──────────────────────────────────────────────────────────
  // Load saved data ONCE (instead of 6 separate localStorage parses)
  const [savedSnapshot] = useState(() => loadStudentWork(storageKey));
  const savedData = savedSnapshot?.data;

  const [sections, setSections] = useState(() => {
    if (savedData?.sections?.length > 0) {
      return savedData.sections.map(s => ({
        ...s,
        sky: s.sky || 'clear-day',
        scene: s.scene || (presetMode ? null : 'forest'),
        ground: s.ground || 'grass',
      }));
    }
    if (pieceConfig?.defaultSections?.length > 0) {
      // Pre-populate with piece sections (form times given, students customize visuals)
      return pieceConfig.defaultSections.map(s => ({
        ...s,
        sky: s.sky || (presetMode && !s.scene ? null : 'clear-day'),
        scene: s.scene || (presetMode ? null : 'forest'),
        ground: s.ground || (presetMode && !s.scene ? null : 'grass'),
      }));
    }
    return []; // Start empty — user builds by adding scenes
  });

  const [items, setItems] = useState(() => savedData?.items || []);

  const defaultCharacter = pieceConfig?.defaultCharacter || null;
  const [character, setCharacter] = useState(() => savedData?.character || defaultCharacter);

  const [editMode, setEditMode] = useState(defaultTab ? 'sticker' : 'select'); // 'select' | 'sticker' | 'text'
  const [saveStatus, setSaveStatus] = useState(null);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [marquee, setMarquee] = useState(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textEditorPosition, setTextEditorPosition] = useState(null);
  const [leftPanelTab, setLeftPanelTab] = useState(defaultTab ? 'stickers' : 'movement'); // 'stickers' | 'movement' | 'text'

  // Drawing tool state
  const [drawingTool, setDrawingTool] = useState(null); // null | 'brush' | 'pencil' | 'eraser'
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(8);
  const drawingCanvasRef = React.useRef(null);
  const [initialDrawingData] = useState(() => savedData?.drawingData || null);

  // App mode: build (editor), present (animation + essay), fullscreen (animation only)
  const [appMode, setAppMode] = useState('build'); // 'build' | 'present' | 'fullscreen'

  // Planning guide checklist state (per-section items)
  const [guideData, setGuideData] = useState(() => savedData?.guideData || {});

  // Essay writing state
  const [essayData, setEssayData] = useState(() => savedData?.essayData || {});

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Teacher save command listener
  const { sessionCode } = useSession();
  const lastSaveCommandRef = useRef(null);
  const componentMountTimeRef = useRef(Date.now());
  const [teacherSaveToast, setTeacherSaveToast] = useState(false);

  // Scrubbing state (for sprite animation during timeline drag)
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Section picker state
  const [pickerState, setPickerState] = useState(null); // { sectionIndex, track, rect }

  // ── Playback ───────────────────────────────────────────────────────
  const {
    isPlaying, currentTime, isLoaded,
    currentSectionIndex, currentSection, scrollSpeed,
    seekTo, rewind, togglePlay
  } = useJourneyPlayback(audioPath, totalDuration, sections, audioVolume);

  const { midgroundOffset, foregroundOffset, rawMidgroundOffset } = useParallaxScroll(currentTime, sections);

  // Active section — always derived from playhead position
  const activeSectionIndex = useMemo(() => {
    if (sections.length === 0) return 0;
    const idx = sections.findIndex(s => currentTime >= s.startTime && currentTime < s.endTime);
    return idx !== -1 ? idx : 0;
  }, [sections, currentTime]);

  const activeSection = sections[activeSectionIndex] || sections[0] || null;

  // ── Scene management (iMovie-style) ────────────────────────────────

  const handleAddScene = useCallback((sceneId) => {
    setSections(prev => {
      const newIndex = prev.length;
      const DEFAULT_CLIP_DURATION = 15;

      // Where does the new clip start? Right after the last clip (or at 0)
      const startTime = prev.length > 0 ? prev[prev.length - 1].endTime : 0;

      // No room left
      if (startTime >= totalDuration) return prev;

      // Cap at remaining time
      const endTime = Math.min(startTime + DEFAULT_CLIP_DURATION, totalDuration);

      return [...prev, {
        id: _nextSectionId++,
        label: String.fromCharCode(65 + (newIndex % 26)),
        sectionLabel: '',
        startTime,
        endTime,
        color: SECTION_COLORS[newIndex % SECTION_COLORS.length],
        sky: SCENE_SKY_MAP[sceneId] || 'clear-day',
        scene: sceneId,
        ground: SCENE_GROUND_MAP[sceneId] || 'grass',
        tempo: 'andante',
        dynamics: 'mf',
        articulation: 'legato'
      }];
    });
  }, []);

  const handleRemoveSection = useCallback((index) => {
    setSections(prev => {
      if (prev.length <= 1) return []; // Removing last section → empty

      const removed = prev[index];
      const updated = prev.filter((_, i) => i !== index);

      // Merge removed section's time into an adjacent section
      if (index === 0) {
        // Removed first → next section starts at 0
        updated[0] = { ...updated[0], startTime: 0 };
      } else if (index === prev.length - 1) {
        // Removed last → previous extends to end
        updated[updated.length - 1] = { ...updated[updated.length - 1], endTime: totalDuration };
      } else {
        // Removed middle → previous section absorbs the time
        updated[index - 1] = { ...updated[index - 1], endTime: removed.endTime };
      }

      // Re-label A, B, C...
      return updated.map((s, i) => ({
        ...s,
        label: String.fromCharCode(65 + (i % 26)),
        color: SECTION_COLORS[i % SECTION_COLORS.length]
      }));
    });
  }, []);

  // ── Section property editing ───────────────────────────────────────

  const handleUpdateSection = useCallback((index, field, value) => {
    setSections(prev => prev.map((s, i) => {
      if (i !== index) return s;
      const updated = { ...s, [field]: value };
      // Auto-pair ground when scene changes
      if (field === 'scene' && SCENE_GROUND_MAP[value]) {
        updated.ground = SCENE_GROUND_MAP[value];
      }
      return updated;
    }));
  }, []);

  // Extend/trim last clip — drag its right edge into empty space (or back)
  const handleExtendLastEdge = useCallback((newEndTime) => {
    setSections(prev => {
      if (prev.length === 0) return prev;
      const updated = prev.map(s => ({ ...s }));
      const last = updated[updated.length - 1];
      const minEnd = last.startTime + 5;
      last.endTime = Math.round(Math.max(minEnd, Math.min(totalDuration, newEndTime)));
      return updated;
    });
  }, []);

  // Boundary resize — drag edge between sections to adjust duration
  const handleResizeBoundary = useCallback((boundaryIndex, newTime) => {
    setSections(prev => {
      const updated = prev.map(s => ({ ...s }));
      const left = updated[boundaryIndex];
      const right = updated[boundaryIndex + 1];
      if (!left || !right) return prev;

      // Clamp so each section stays at least 5 seconds
      const minTime = left.startTime + 5;
      const maxTime = right.endTime - 5;
      const clamped = Math.round(Math.max(minTime, Math.min(maxTime, newTime)));

      left.endTime = clamped;
      right.startTime = clamped;
      return updated;
    });
  }, []);

  // ── Save / Reset ───────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    const authInfo = getClassAuthInfo();
    // Strip ephemeral _placedWallTime so loaded stickers get entry animation on replay
    const cleanItems = items.map(({ _placedWallTime, ...rest }) => rest);
    const drawingData = drawingCanvasRef.current?.getDataURL() || null;
    saveStudentWork(storageKey, {
      title: 'Listening Journey',
      emoji: '\uD83C\uDFAD',
      viewRoute: pieceConfig?.viewRoute || '/lessons/listening-lab/lesson4?view=saved',
      subtitle: `${sections.length} sections`,
      category: 'Listening Lab',
      lessonId: pieceConfig?.lessonId || null,
      data: { sections, character, items: cleanItems, guideData, essayData, drawingData, audioPath, audioVolume, pieceTitle: pieceConfig?.title || null }
    }, null, authInfo);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
  }, [sections, character, items, guideData, essayData, audioPath, audioVolume, storageKey, pieceConfig]);

  // Listen for teacher's "Save All & Continue" command from Firebase
  useEffect(() => {
    if (!sessionCode || !isSessionMode || viewMode) return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${sessionCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();
      if (!saveCommand) return;

      // Only process save commands issued AFTER this component mounted
      if (saveCommand <= componentMountTimeRef.current) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }

      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('💾 Teacher save command received for listening journey!');

        if (sections.length > 0) {
          handleSave();
          setTeacherSaveToast(true);
          setTimeout(() => setTeacherSaveToast(false), 3000);
        }
      }
    });

    return () => unsubscribe();
  }, [sessionCode, isSessionMode, viewMode, sections, handleSave]);

  const handleReset = useCallback(() => {
    if (presetMode && pieceConfig?.defaultSections) {
      // In preset mode, restore to empty section placeholders (not full clear)
      setSections(pieceConfig.defaultSections.map(s => ({
        ...s, sky: null, scene: null, ground: null,
      })));
    } else {
      setSections([]);
    }
    setCharacter(null);
    setItems([]);
    setEditMode('select');
    setDrawingTool(null);
    drawingCanvasRef.current?.clear();
  }, [presetMode, pieceConfig]);

  // ── Sticker / text placement ───────────────────────────────────────

  const selectItem = useCallback((id) => setSelectedItemIds(new Set(id != null ? [id] : [])), []);
  const clearSelection = useCallback(() => setSelectedItemIds(new Set()), []);

  const handleViewportClick = useCallback((pos) => {
    // Deselect any selected stickers
    if (selectedItemIds.size > 0) clearSelection();

    // Only allow placement in build mode
    if (appMode !== 'build') return;

    if (editMode === 'sticker' && selectedSticker) {
      // Sticker visible from now until end of piece (scrolls off screen naturally)
      const startTime = currentTime;
      const duration = totalDuration - currentTime;

      setItems(prev => [...prev, {
        type: 'sticker',
        icon: selectedSticker.symbol || selectedSticker.id,
        render: selectedSticker.render || 'emoji',
        name: selectedSticker.name,
        timestamp: startTime,
        position: { x: pos.x, y: pos.y },
        placedAtOffset: rawMidgroundOffset,
        entryOffsetX: 1.0 - pos.x,
        _placedWallTime: performance.now(),
        duration,
        scale: 2,
        id: _nextSectionId++,
      }]);
    } else if (editMode === 'text') {
      setTextEditorPosition(pos);
      setShowTextEditor(true);
    }
  }, [appMode, editMode, selectedSticker, selectedItemIds, clearSelection, currentTime, rawMidgroundOffset, sections, totalDuration]);

  // ── Marquee drag-to-select ──────────────────────────────────────────
  const handleMarqueeEnd = useCallback((rect) => {
    const minX = Math.min(rect.startX, rect.endX);
    const maxX = Math.max(rect.startX, rect.endX);
    const minY = Math.min(rect.startY, rect.endY);
    const maxY = Math.max(rect.startY, rect.endY);
    const hits = items.filter(item => {
      const px = item.position.x;
      const py = item.position.y;
      return px >= minX && px <= maxX && py >= minY && py <= maxY;
    });
    if (hits.length > 0) {
      setSelectedItemIds(new Set(hits.map(h => h.id)));
    }
  }, [items]);

  const handleAddTextItem = useCallback((textData) => {
    setItems(prev => [...prev, {
      type: 'text',
      ...textData,
      timestamp: currentTime,
      position: textEditorPosition,
      id: Date.now(),
    }]);
    setShowTextEditor(false);
    setTextEditorPosition(null);
  }, [currentTime, textEditorPosition]);

  const handleRemoveItem = useCallback((itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const handleUpdateItem = useCallback((itemId, updates) => {
    setItems(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      const updated = { ...i, ...updates };
      // When timestamp changes (drag/left-resize), recalculate placedAtOffset
      // so the sticker enters from the right edge at the new time
      if ('timestamp' in updates && updates.timestamp !== i.timestamp) {
        updated.placedAtOffset = getScrollOffsetAtTime(updates.timestamp, sections);
      }
      return updated;
    }));
  }, [sections]);

  const handleAddItem = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);

  // ── Clipboard for copy/paste ──────────────────────────────────────
  const clipboardRef = React.useRef(null);
  const pasteCountRef = React.useRef(0);

  // ── Keyboard shortcuts (spacebar, delete, copy/paste) ─────────────
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedItemIds.size > 0) {
        e.preventDefault();
        setItems(prev => prev.filter(i => !selectedItemIds.has(i.id)));
        clearSelection();
      }
      // Ctrl+C / Cmd+C — copy first selected sticker
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC' && selectedItemIds.size > 0) {
        e.preventDefault();
        const firstId = [...selectedItemIds][0];
        const item = items.find(i => i.id === firstId);
        if (item) {
          clipboardRef.current = item;
          pasteCountRef.current = 0;
        }
      }
      // Ctrl+V / Cmd+V — paste copied sticker, each paste offsets further down-right
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV' && clipboardRef.current) {
        e.preventDefault();
        pasteCountRef.current++;
        const src = clipboardRef.current;
        const offset = 0.03 * pasteCountRef.current;
        const newItem = {
          ...src,
          id: _nextSectionId++,
          position: { x: Math.min(src.position.x + offset, 0.95), y: Math.min(src.position.y + offset, 0.95) },
          timestamp: currentTime,
          duration: totalDuration - currentTime,
          placedAtOffset: rawMidgroundOffset,
          _placedWallTime: performance.now(),
        };
        setItems(prev => [...prev, newItem]);
        setSelectedItemIds(new Set([newItem.id]));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, selectedItemIds, clearSelection, items, currentTime, totalDuration, rawMidgroundOffset]);

  // ── Section picker ─────────────────────────────────────────────────

  const handleOpenPicker = useCallback((sectionIndex, track, rect) => {
    setPickerState({ sectionIndex, track, rect });
  }, []);

  const handlePickerSelect = useCallback((value, propertyOverride) => {
    if (!pickerState) return;
    const { sectionIndex, track } = pickerState;
    const effectiveTrack = propertyOverride || track;
    handleUpdateSection(sectionIndex, effectiveTrack, value);
    // Keep picker open in 'all' mode so user can change multiple properties
    if (track !== 'all') {
      setPickerState(null);
    }
  }, [pickerState, handleUpdateSection]);

  // ── Edit mode switching ────────────────────────────────────────────

  const handleSetEditMode = useCallback((mode) => {
    setEditMode(mode);
    if (mode !== 'sticker') {
      setSelectedSticker(null);
    }
  }, []);

  const handleSwitchLeftTab = useCallback((tab) => {
    setLeftPanelTab(tab);
    setDrawingTool(null);
    clearSelection();
    if (tab === 'stickers') {
      setEditMode('sticker');
    } else if (tab === 'text') {
      setEditMode('text');
    } else {
      setEditMode('select');
      setSelectedSticker(null);
    }
  }, []);

  // ── Render ─────────────────────────────────────────────────────────
  const isBuild = appMode === 'build';
  const isPresent = appMode === 'present';
  const isFullscreen = appMode === 'fullscreen';

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header — hidden in fullscreen */}
      {!isFullscreen && (
        <div className="flex items-center justify-between px-2 sm:px-4 py-1 sm:py-1.5 bg-black/30 border-b border-white/10 flex-shrink-0 flex-nowrap overflow-hidden">
          {/* Left: Title + Color tools + Sprites */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <h1 className="text-xs sm:text-sm font-bold whitespace-nowrap mr-1">Listening Journey</h1>
            <span className="text-[10px] sm:text-[11px] text-white/50 truncate mr-1 hidden sm:inline">{pieceConfig?.title || 'Hungarian Dance No. 5 - Brahms'}</span>

            <div className="w-px h-5 sm:h-6 bg-white/20 mx-0.5 sm:mx-1" />

            {/* Color tools (inline) */}
            {isBuild && (
              <>
                {[
                  { id: 'brush', icon: '\uD83D\uDD8C\uFE0F' },
                  { id: 'pencil', icon: '\u270F\uFE0F' },
                  { id: 'eraser', icon: '\u2B1C' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setDrawingTool(drawingTool === t.id ? null : t.id); clearSelection(); }}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-xs transition-all ${
                      drawingTool === t.id
                        ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/60'
                    }`}
                    title={t.id}
                  >
                    {t.icon}
                  </button>
                ))}

                {DRAW_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-transform hover:scale-110 flex-shrink-0"
                    style={{
                      backgroundColor: c,
                      border: brushColor === c ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                ))}

                <button
                  onClick={() => drawingCanvasRef.current?.undo()}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/60 text-xs transition-all"
                  title="Undo drawing"
                >
                  {'\u21A9'}
                </button>

                <div className="w-px h-5 sm:h-6 bg-white/20 mx-0.5 sm:mx-1" />
              </>
            )}

            {/* Character selector (sprites) */}
            <CharacterSelector selectedId={character?.id} onSelect={setCharacter} />
          </div>

          {/* Right: Build/Present + Reset + Save */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Mode switcher */}
            <div className="flex bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setAppMode('build')}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-colors ${
                  isBuild ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <Hammer size={12} /> <span className="hidden sm:inline">Build</span>
              </button>
              <button
                onClick={() => setAppMode('present')}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-colors ${
                  isPresent ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <Presentation size={12} /> <span className="hidden sm:inline">Present</span>
              </button>
              <button
                onClick={() => setAppMode('fullscreen')}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-colors ${
                  isFullscreen ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <Maximize size={12} />
              </button>
            </div>

            <div className="w-px h-5 sm:h-6 bg-white/20 mx-0.5 sm:mx-1" />

            {/* Reset with confirmation */}
            {showResetConfirm ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-[11px] text-red-400 font-semibold whitespace-nowrap">Sure?</span>
                <button
                  onClick={() => { handleReset(); setShowResetConfirm(false); }}
                  className="px-1.5 sm:px-2 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-[10px] sm:text-[11px] font-bold transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-1.5 sm:px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/70 text-[10px] sm:text-[11px] font-bold transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-[10px] sm:text-[11px] font-semibold transition-colors"
                title="Reset all work"
              >
                <RotateCcw size={12} /> <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={sections.length === 0}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                saveStatus === 'saved'
                  ? 'bg-green-500 text-white'
                  : sections.length === 0
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Save size={14} />
              {saveStatus === 'saved' ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Floating controls for presentation & fullscreen */}
      {(isFullscreen || isPresent) && (
        <div className="absolute bottom-3 right-3 z-50 flex items-center gap-2">
          <button
            onClick={rewind}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white/60 hover:text-white transition-colors"
            title="Rewind"
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white/60 hover:text-white transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          {isFullscreen && (
            <button
              onClick={() => setAppMode('build')}
              className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white/60 hover:text-white transition-colors"
              title="Exit fullscreen"
            >
              <Minimize size={16} />
            </button>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Left panel — only in build mode */}
        {isBuild && (
          <div className="w-40 sm:w-48 lg:w-56 flex-shrink-0 bg-black/20 border-r border-white/10 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-white/10 flex-shrink-0">
              {[
                { id: 'stickers', icon: <Sticker size={13} />, label: 'Stickers' },
                ...(!hideMovement ? [{ id: 'movement', icon: <Wind size={13} />, label: 'Movement' }] : []),
                { id: 'text', icon: <Type size={13} />, label: 'Text' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleSwitchLeftTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-bold transition-colors ${
                    leftPanelTab === tab.id
                      ? 'bg-white/10 text-white border-b-2 border-blue-400'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {leftPanelTab === 'stickers' && (
                <StickerPanelWrapper
                  selectedSticker={selectedSticker}
                  onStickerSelect={setSelectedSticker}
                  defaultTab={defaultTab}
                />
              )}

              {leftPanelTab === 'movement' && (
                <div className="p-2 flex flex-col gap-3">
                  {/* Movement */}
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-bold mb-1.5 text-center">Movement</div>
                    <div className="flex flex-col gap-1">
                      {MOVEMENT_TYPES.map(m => (
                        <button
                          key={m.id}
                          onClick={() => handleUpdateSection(activeSectionIndex, 'movement', m.id)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs ${
                            (activeSection?.movement || 'walk') === m.id
                              ? 'bg-emerald-500 text-white ring-1 ring-emerald-300'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-sm">{m.icon}</span>
                          <span className="font-bold">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weather */}
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-bold mb-1.5 text-center">Weather</div>
                    <div className="flex flex-col gap-1">
                      {[
                        { id: 'none', icon: <CloudOff size={14} />, label: 'Clear' },
                        { id: 'rain', icon: <CloudRain size={14} />, label: 'Rain' },
                        { id: 'snow', icon: <CloudSnow size={14} />, label: 'Snow' },
                      ].map(w => (
                        <button
                          key={w.id}
                          onClick={() => handleUpdateSection(activeSectionIndex, 'weather', w.id)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs ${
                            (activeSection?.weather || 'none') === w.id
                              ? 'bg-cyan-500 text-white ring-1 ring-cyan-300'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {w.icon}
                          <span className="font-bold">{w.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lighting */}
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-bold mb-1.5 text-center">Lighting</div>
                    <div className="flex flex-col gap-1">
                      {[
                        { id: false, icon: <Sun size={14} />, label: 'Day' },
                        { id: true, icon: <Moon size={14} />, label: 'Night' },
                      ].map(l => (
                        <button
                          key={String(l.id)}
                          onClick={() => handleUpdateSection(activeSectionIndex, 'nightMode', l.id)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs ${
                            (activeSection?.nightMode || false) === l.id
                              ? 'bg-indigo-500 text-white ring-1 ring-indigo-300'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {l.icon}
                          <span className="font-bold">{l.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {leftPanelTab === 'text' && (
                <div className="p-3 flex flex-col gap-3">
                  <div className="text-center text-white/60 text-xs leading-relaxed mt-2">
                    Click anywhere on the scene to add a text label.
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-[11px] text-white/40 leading-relaxed">
                    <div className="font-bold text-white/60 mb-1">Tips:</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Add section labels (A, B, Coda)</li>
                      <li>Describe what you hear</li>
                      <li>Label instruments or dynamics</li>
                      <li>Click a text item to edit or delete</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Viewport (center) */}
        <div className={`flex-1 ${isFullscreen ? 'p-0' : 'p-1.5 sm:p-2 lg:p-3'} min-w-0 flex flex-col`}>
          <div className="flex-1 min-h-0">
            <JourneyViewport
              section={activeSection}
              character={character}
              isPlaying={isPlaying || isScrubbing}
              midgroundOffset={midgroundOffset}
              foregroundOffset={foregroundOffset}
              items={items}
              currentTime={currentTime}
              onViewportClick={drawingTool ? undefined : handleViewportClick}
              editMode={isBuild && !drawingTool ? editMode : 'select'}
              isBuildMode={isBuild}
              marquee={marquee}
              onMarqueeChange={setMarquee}
              onMarqueeEnd={handleMarqueeEnd}
            >
              <DrawingOverlay
                ref={drawingCanvasRef}
                isActive={isBuild && !!drawingTool}
                tool={drawingTool || 'brush'}
                color={brushColor}
                brushSize={brushSize}
                initialData={initialDrawingData}
              />
              <StickerOverlay
                items={items}
                currentTime={currentTime}
                isPlaying={isPlaying}
                editMode={isBuild && !drawingTool ? editMode : 'select'}
                onRemoveItem={handleRemoveItem}
                onUpdateItem={handleUpdateItem}
                onAddItem={handleAddItem}
                onSwitchToSelect={() => setEditMode('select')}
                rawScrollOffset={rawMidgroundOffset}
                selectedItemIds={selectedItemIds}
                onSelectItem={selectItem}
                isBuildMode={isBuild && !drawingTool}
              />
            </JourneyViewport>
          </div>
        </div>

        {/* Right panel — Planning Guide (build) or Essay (present) */}
        {isBuild && (
          <PlanningGuide
            sections={sections}
            activeSectionIndex={activeSectionIndex}
            guide={guideData}
            onGuideChange={setGuideData}
          />
        )}
        {isPresent && (
          <EssayPanel
            sections={sections}
            guideData={guideData}
            pieceTitle={pieceConfig?.title}
            character={character}
            items={items}
          />
        )}
      </div>

      {/* Timeline + transport (bottom) — hidden in fullscreen */}
      {!isFullscreen && <div className="px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-3 bg-black/30 border-t border-white/10">
        <JourneyTimeline
          sections={sections}
          items={items}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onSeek={seekTo}
          onRewind={rewind}
          onOpenPicker={handleOpenPicker}
          onAddScene={handleAddScene}
          onRemoveSection={hideScenes ? null : handleRemoveSection}
          onResizeBoundary={handleResizeBoundary}
          onExtendLastEdge={handleExtendLastEdge}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          presetMode={presetMode}
          hideScenes={hideScenes}
          onAssignScene={(sectionIndex, sceneId) => {
            setSections(prev => {
              const updated = [...prev];
              const sky = SCENE_SKY_MAP[sceneId] || 'clear-day';
              const ground = SCENE_GROUND_MAP[sceneId] || 'grass';
              updated[sectionIndex] = { ...updated[sectionIndex], scene: sceneId, sky, ground };
              return updated;
            });
          }}
          onScrubChange={setIsScrubbing}
          onClearScene={hideScenes ? null : (sectionIndex) => {
            setSections(prev => {
              const updated = [...prev];
              updated[sectionIndex] = { ...updated[sectionIndex], scene: null, sky: null, ground: null };
              return updated;
            });
          }}
        />
      </div>}

      {/* Section picker popover */}
      {pickerState && (
        <SectionPicker
          track={pickerState.track}
          currentValue={sections[pickerState.sectionIndex]?.[pickerState.track]}
          sectionData={sections[pickerState.sectionIndex]}
          rect={pickerState.rect}
          onSelect={handlePickerSelect}
          onClose={() => setPickerState(null)}
        />
      )}

      {/* Text overlay editor modal */}
      {showTextEditor && (
        <TextOverlayEditor
          onAdd={handleAddTextItem}
          onClose={() => { setShowTextEditor(false); setTextEditorPosition(null); }}
        />
      )}

      {/* Teacher save toast */}
      {teacherSaveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-semibold animate-bounce">
          Teacher saved your work!
        </div>
      )}
    </div>
  );
};

// ── Sticker Panel Wrapper ──────────────────────────────────────────
// Lazy wrapper to avoid importing the large StickerPanel unless needed
const StickerPanelWrapper = ({ selectedSticker, onStickerSelect, defaultTab = null }) => {
  const [StickerPanel, setStickerPanel] = useState(null);
  const [stickerSize, setStickerSize] = useState(56);

  // Lazy load StickerPanel
  React.useEffect(() => {
    import('../texture-drawings/components/Toolbar/StickerPanel').then(mod => {
      setStickerPanel(() => mod.default);
    });
  }, []);

  if (!StickerPanel) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-white/40 text-sm">Loading stickers...</span>
      </div>
    );
  }

  return (
    <StickerPanel
      selectedSticker={selectedSticker}
      onStickerSelect={onStickerSelect}
      stickerSize={stickerSize}
      onSizeChange={setStickerSize}
      isOpen={true}
      availableTabs={['instruments', 'dynamics', 'tempo', 'form', 'emojis']}
      defaultTab={defaultTab}
    />
  );
};

export default ListeningJourney;
