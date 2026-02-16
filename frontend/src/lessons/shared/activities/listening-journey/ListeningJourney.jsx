// ListeningJourney — iMovie-style parallax builder
// Timeline starts EMPTY — user drags/clicks scenes to build, then resizes & decorates
// Stickers are time-pinned: only visible when the playhead is at their timestamp

import React, { useState, useCallback, useMemo } from 'react';
import { Save, RotateCcw, Sticker, Type, Moon, Sun, CloudRain, CloudSnow, Wind, CloudOff, Hammer, Presentation, Maximize, Minimize, Play, Pause, SkipBack } from 'lucide-react';
import PlanningGuide from './PlanningGuide';
import EssayPanel from './EssayPanel';

import JourneyViewport from './JourneyViewport';
import JourneyTimeline from './JourneyTimeline';
import StickerOverlay from './StickerOverlay';
import SectionPicker from './SectionPicker';
import TextOverlayEditor from './TextOverlayEditor';
import CharacterSelector from './CharacterSelector';
import useJourneyPlayback from './hooks/useJourneyPlayback';
import useParallaxScroll, { getScrollOffsetAtTime } from './hooks/useParallaxScroll';
import { MOVEMENT_TYPES } from './characterAnimations';
import { AUDIO_PATH, TOTAL_DURATION, CHARACTER_OPTIONS, SCENE_SKY_MAP, SECTION_COLORS } from './journeyDefaults';
import { SCENE_GROUND_MAP } from './config/groundTypes';
import { saveStudentWork, loadStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';

let _nextSectionId = Date.now();

const ListeningJourney = ({ onComplete, viewMode = false, isSessionMode = false, pieceConfig = null }) => {
  // If pieceConfig is provided, use it instead of defaults
  const audioPath = pieceConfig?.audioPath || AUDIO_PATH;
  const audioVolume = pieceConfig?.volume || 1.0;
  const totalDuration = pieceConfig?.totalDuration || TOTAL_DURATION;
  const storageKey = pieceConfig?.storageKey || 'listening-journey';
  const presetMode = pieceConfig?.presetMode || false;
  // ── State ──────────────────────────────────────────────────────────
  const [sections, setSections] = useState(() => {
    const saved = loadStudentWork(storageKey);
    if (saved?.data?.sections?.length > 0) {
      return saved.data.sections.map(s => ({
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

  const [items, setItems] = useState(() => {
    const saved = loadStudentWork(storageKey);
    return saved?.data?.items || [];
  });

  const [character, setCharacter] = useState(() => {
    const saved = loadStudentWork(storageKey);
    if (saved?.data?.character) return saved.data.character;
    return null;
  });

  const [editMode, setEditMode] = useState('select'); // 'select' | 'sticker' | 'text'
  const [saveStatus, setSaveStatus] = useState(null);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textEditorPosition, setTextEditorPosition] = useState(null);
  const [leftPanelTab, setLeftPanelTab] = useState('movement'); // 'stickers' | 'movement' | 'text'

  // App mode: build (editor), present (animation + essay), fullscreen (animation only)
  const [appMode, setAppMode] = useState('build'); // 'build' | 'present' | 'fullscreen'

  // Planning guide checklist state (per-section items)
  const [guideData, setGuideData] = useState(() => {
    const saved = loadStudentWork(storageKey);
    return saved?.data?.guideData || {};
  });

  // Essay writing state
  const [essayData, setEssayData] = useState(() => {
    const saved = loadStudentWork(storageKey);
    return saved?.data?.essayData || {};
  });

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
    saveStudentWork(storageKey, {
      title: 'Listening Journey',
      emoji: '\uD83C\uDFAD',
      viewRoute: '/lessons/listening-lab/lesson4?view=saved',
      subtitle: `${sections.length} sections`,
      category: 'Listening Lab',
      data: { sections, character, items: cleanItems, guideData, essayData }
    }, null, authInfo);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
  }, [sections, character, items, guideData, essayData]);

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
  }, [presetMode, pieceConfig]);

  // ── Sticker / text placement ───────────────────────────────────────

  const handleViewportClick = useCallback((pos) => {
    // Deselect any selected sticker (sticker clicks stopPropagation before reaching here)
    setSelectedItemId(null);

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
  }, [editMode, selectedSticker, currentTime, rawMidgroundOffset, sections, totalDuration]);

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

  // ── Keyboard shortcuts (spacebar, delete) ─────────────────────────
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedItemId) {
        e.preventDefault();
        handleRemoveItem(selectedItemId);
        setSelectedItemId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, selectedItemId, handleRemoveItem]);

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
    setSelectedItemId(null);
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
        <div className="flex items-center justify-between px-4 py-1.5 bg-black/30 border-b border-white/10 flex-shrink-0 flex-nowrap overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 mr-2">
            <h1 className="text-sm font-bold whitespace-nowrap">Listening Journey</h1>
            <span className="text-[11px] text-white/50 truncate">{pieceConfig?.title || 'Hungarian Dance No. 5 - Brahms'}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Mode switcher */}
            <div className="flex bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setAppMode('build')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  isBuild ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <Hammer size={12} /> Build
              </button>
              <button
                onClick={() => setAppMode('present')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  isPresent ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <Presentation size={12} /> Present
              </button>
              <button
                onClick={() => setAppMode('fullscreen')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  isFullscreen ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <Maximize size={12} />
              </button>
            </div>

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Character selector */}
            <CharacterSelector selectedId={character?.id} onSelect={setCharacter} />

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
              title="Clear all sections"
            >
              <RotateCcw size={14} />
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={sections.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
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
        <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
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
          <div className="w-56 flex-shrink-0 bg-black/20 border-r border-white/10 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-white/10 flex-shrink-0">
              {[
                { id: 'stickers', icon: <Sticker size={13} />, label: 'Stickers' },
                { id: 'movement', icon: <Wind size={13} />, label: 'Movement' },
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
        <div className={`flex-1 ${isFullscreen ? 'p-0' : 'p-3'} min-w-0`}>
          <JourneyViewport
            section={activeSection}
            character={character}
            isPlaying={isPlaying}
            midgroundOffset={midgroundOffset}
            foregroundOffset={foregroundOffset}
            items={items}
            currentTime={currentTime}
            onViewportClick={handleViewportClick}
            editMode={isBuild ? editMode : 'select'}
          >
            <StickerOverlay
              items={items}
              currentTime={currentTime}
              isPlaying={isPlaying}
              editMode={isBuild ? editMode : 'select'}
              onRemoveItem={handleRemoveItem}
              onUpdateItem={handleUpdateItem}
              onAddItem={handleAddItem}
              onSwitchToSelect={() => setEditMode('select')}
              rawScrollOffset={rawMidgroundOffset}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              isBuildMode={isBuild}
            />
          </JourneyViewport>
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
      {!isFullscreen && <div className="px-4 py-3 bg-black/30 border-t border-white/10">
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
          onRemoveSection={handleRemoveSection}
          onResizeBoundary={handleResizeBoundary}
          onExtendLastEdge={handleExtendLastEdge}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          presetMode={presetMode}
          onAssignScene={(sectionIndex, sceneId) => {
            setSections(prev => {
              const updated = [...prev];
              const sky = SCENE_SKY_MAP[sceneId] || 'clear-day';
              const ground = SCENE_GROUND_MAP[sceneId] || 'grass';
              updated[sectionIndex] = { ...updated[sectionIndex], scene: sceneId, sky, ground };
              return updated;
            });
          }}
          onClearScene={(sectionIndex) => {
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
    </div>
  );
};

// ── Sticker Panel Wrapper ──────────────────────────────────────────
// Lazy wrapper to avoid importing the large StickerPanel unless needed
const StickerPanelWrapper = ({ selectedSticker, onStickerSelect }) => {
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
    />
  );
};

export default ListeningJourney;
