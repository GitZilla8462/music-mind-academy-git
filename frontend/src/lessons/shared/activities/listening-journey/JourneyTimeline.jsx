// iMovie-style timeline: single clip strip, drag scenes on, trim/extend edges
// Clips snap together from time 0 with no gaps. Empty space shown after last clip.

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { getSkyMoodById } from './config/skyMoods';
import { getEnvironmentById } from './config/environments';
import ENVIRONMENTS from './config/environments';
import { SCENE_SKY_MAP } from './journeyDefaults';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ── Scene Palette Card ──────────────────────────────────────────────

const SceneCard = ({ env, onAdd }) => {
  const skyId = SCENE_SKY_MAP[env.id] || 'clear-day';
  const sky = getSkyMoodById(skyId);

  return (
    <button
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('scene-id', env.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => onAdd(env.id)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-gray-800 hover:bg-gray-700 hover:border-white/30 cursor-grab active:cursor-grabbing transition-all text-xs whitespace-nowrap flex-shrink-0"
    >
      <div
        className="w-6 h-5 rounded-sm flex items-center justify-center text-sm"
        style={{ background: sky.gradient }}
      >
        {env.icon}
      </div>
      <span className="text-white/80 font-medium">{env.name}</span>
    </button>
  );
};

// ── Clip Block (iMovie-style filmstrip clip) ────────────────────────

// ── Preset Placeholder Block (greyed out, awaiting scene drop) ──────
const PresetPlaceholder = ({ section, totalDuration, isActive, isSelected, onDrop, onClear, onClick }) => {
  const startPct = (section.startTime / totalDuration) * 100;
  const widthPct = ((section.endTime - section.startTime) / totalDuration) * 100;
  const [isDragOver, setIsDragOver] = useState(false);
  const hasScene = !!section.scene;

  if (hasScene) {
    const env = getEnvironmentById(section.scene);
    return (
      <div
        onClick={onClick}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
          const sceneId = e.dataTransfer.getData('scene-id');
          if (sceneId) onDrop(sceneId);
        }}
        className={`absolute top-0 h-full rounded-lg overflow-hidden cursor-pointer group/clip transition-shadow ${
          isActive ? 'ring-2 ring-white shadow-lg shadow-white/10 z-10' : 'hover:ring-1 hover:ring-white/50'
        } ${isDragOver ? 'ring-2 ring-blue-400' : ''}`}
        style={{ left: `${startPct}%`, width: `${widthPct}%`, minWidth: '36px', backgroundColor: `${section.color}30` }}
      >
        {/* Section color fill */}
        <div className="absolute inset-0" style={{ backgroundColor: section.color, opacity: 0.25 }} />
        <div className="relative h-full flex items-center gap-1.5 px-2 z-10">
          <span className="text-lg flex-shrink-0">{env.icon}</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-extrabold truncate" style={{ color: section.color }}>Section {section.label} — {section.sectionLabel}</span>
            <span className="text-[9px] font-semibold text-white/70">{env.name}</span>
          </div>
        </div>
        {/* X button to clear scene */}
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-all z-20"
          title="Remove scene"
        >
          &times;
        </button>
      </div>
    );
  }

  // Empty placeholder — greyed out
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
        const sceneId = e.dataTransfer.getData('scene-id');
        if (sceneId) onDrop(sceneId);
      }}
      onClick={onClick}
      className={`absolute top-0 h-full rounded-lg overflow-hidden cursor-pointer transition-all border-2 border-dashed ${
        isSelected ? 'border-yellow-400 bg-yellow-400/15 ring-2 ring-yellow-400/50'
        : isDragOver ? 'border-blue-400 bg-blue-400/15'
        : 'border-white/20 bg-gray-700/40'
      } ${isActive && !isSelected ? 'ring-2 ring-white/30' : ''}`}
      style={{ left: `${startPct}%`, width: `${widthPct}%`, minWidth: '36px' }}
    >
      <div className="relative h-full flex flex-col items-center justify-center z-10">
        <span className="text-sm font-black text-white/70" style={{ color: section.color }}>Section {section.label} — {section.sectionLabel}</span>
        <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-yellow-400/70 font-semibold' : 'text-white/25'}`}>
          {isSelected ? 'Now click a scene above' : 'Click to select, or drag a scene'}
        </span>
      </div>
    </div>
  );
};

const ClipBlock = ({ section, totalDuration, isActive, onClick, onRemove }) => {
  const startPct = (section.startTime / totalDuration) * 100;
  const widthPct = ((section.endTime - section.startTime) / totalDuration) * 100;
  const sky = getSkyMoodById(section.sky);
  const env = getEnvironmentById(section.scene);
  const durationSec = Math.round(section.endTime - section.startTime);

  return (
    <div
      onClick={onClick}
      className={`absolute top-0 h-full rounded-lg overflow-hidden cursor-pointer group/clip transition-shadow ${
        isActive ? 'ring-2 ring-white shadow-lg shadow-white/10 z-10' : 'hover:ring-1 hover:ring-white/50'
      }`}
      style={{ left: `${startPct}%`, width: `${widthPct}%`, minWidth: '36px' }}
    >
      {/* Sky gradient background */}
      <div className="absolute inset-0" style={{ background: sky.gradient }} />

      {/* Film grain overlay for iMovie feel */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className="relative h-full flex items-center gap-1.5 px-2 z-10">
        <span className="text-xl flex-shrink-0 drop-shadow-lg">{env.icon}</span>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold text-white drop-shadow-md truncate">{env.name}</span>
          <span className="text-[9px] text-white/60 drop-shadow">{section.label} &middot; {durationSec}s</span>
        </div>
      </div>

      {/* Left/right edge indicators on hover */}
      <div className="absolute top-0 left-0 w-1 h-full bg-white/0 group-hover/clip:bg-white/20 transition-colors" />
      <div className="absolute top-0 right-0 w-1 h-full bg-white/0 group-hover/clip:bg-white/20 transition-colors" />

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-all z-20"
        title="Remove"
      >
        &times;
      </button>
    </div>
  );
};

// ── Boundary Handle (between adjacent clips) ────────────────────────

const BoundaryHandle = ({ leftPct, isDragging, onDragStart }) => (
  <div
    className={`absolute top-0 bottom-0 w-5 -translate-x-1/2 cursor-col-resize z-20 group ${isDragging ? 'z-30' : ''}`}
    style={{ left: `${leftPct}%` }}
    onMouseDown={onDragStart}
    onTouchStart={onDragStart}
  >
    <div className={`absolute left-1/2 -translate-x-1/2 top-0 h-full transition-all ${
      isDragging
        ? 'w-1 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'
        : 'w-0.5 bg-white/30 group-hover:bg-white group-hover:w-1'
    }`} />
    <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-0.5 transition-opacity ${
      isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
    }`}>
      <div className="w-1.5 h-1 rounded-full bg-white" />
      <div className="w-1.5 h-1 rounded-full bg-white" />
      <div className="w-1.5 h-1 rounded-full bg-white" />
    </div>
  </div>
);

// ── Items Track (multi-lane sticker/text editor) ─────────────────────
// Assigns each item to a lane so overlapping items stack vertically.
// Items can be dragged left/right to reposition in time, and edges
// dragged to change duration.

const LANE_COUNT = 5;
const LANE_HEIGHT = 20; // px per lane

const assignLanes = (items, totalDuration) => {
  // Sort by start time, then assign each to the first lane that has space
  const sorted = [...items].sort((a, b) => a.timestamp - b.timestamp);
  const laneEnds = new Array(LANE_COUNT).fill(-Infinity);
  const assignments = {};

  sorted.forEach(item => {
    const start = item.timestamp;
    const end = start + (item.duration || 3);
    // Find first lane where item fits
    let lane = 0;
    for (let i = 0; i < LANE_COUNT; i++) {
      if (laneEnds[i] <= start + 0.01) {
        lane = i;
        break;
      }
      if (i === LANE_COUNT - 1) lane = i; // overflow to last lane
    }
    laneEnds[lane] = end;
    assignments[item.id] = lane;
  });

  return assignments;
};

const ItemBlock = ({ item, lane, totalDuration, isSelected, onSelect, onUpdate, onRemove, onSeek, calcTime }) => {
  const leftPct = (item.timestamp / totalDuration) * 100;
  const widthPct = ((item.duration || 3) / totalDuration) * 100;
  const isSticker = item.type === 'sticker';
  const bg = isSticker ? 'rgba(168,85,247,0.6)' : 'rgba(245,158,11,0.6)';
  const bgSelected = isSticker ? 'rgba(168,85,247,0.85)' : 'rgba(245,158,11,0.85)';

  // ── Body drag (move in time) ──────────────────────────────────────
  const startBodyDrag = useCallback((clientX) => {
    onSelect(item.id);
    const startClientX = clientX;
    const startTimestamp = item.timestamp;

    const handleMove = (mx) => {
      if (!calcTime) return;
      const deltaTime = calcTime(mx) - calcTime(startClientX);
      const newTimestamp = Math.max(0, Math.min(totalDuration - (item.duration || 3), startTimestamp + deltaTime));
      onUpdate(item.id, { timestamp: newTimestamp });
      // Seek playhead to midpoint of block so viewport shows the sticker
      if (onSeek) onSeek(newTimestamp + (item.duration || 3) / 2);
    };

    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => { if (e.touches.length > 0) handleMove(e.touches[0].clientX); };
    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
  }, [item, totalDuration, onUpdate, onSelect, calcTime]);

  return (
    <div
      className={`absolute rounded-sm cursor-grab active:cursor-grabbing group/item flex items-center overflow-hidden transition-shadow ${
        isSelected ? 'ring-1 ring-white shadow-lg z-10' : 'hover:ring-1 hover:ring-white/50'
      }`}
      style={{
        left: `${leftPct}%`,
        width: `${Math.max(widthPct, 0.5)}%`,
        top: `${lane * LANE_HEIGHT}px`,
        height: `${LANE_HEIGHT - 2}px`,
        backgroundColor: isSelected ? bgSelected : bg,
      }}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); startBodyDrag(e.clientX); }}
      onTouchStart={(e) => { e.stopPropagation(); if (e.touches.length > 0) startBodyDrag(e.touches[0].clientX); }}
    >
      {/* Content */}
      <span className="text-[9px] text-white/90 truncate px-2 pointer-events-none select-none">
        {isSticker ? item.icon : (item.content?.substring(0, 8) || 'Text')}
      </span>

      {/* Remove button — visible on hover */}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(item.id); }}
          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
          onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(item.id); }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full text-white text-[10px] font-bold flex items-center justify-center z-30 opacity-0 group-hover/item:opacity-100 transition-opacity shadow-md"
          title="Delete"
        >
          &times;
        </button>
      )}
    </div>
  );
};

const ItemsTrack = ({ items, totalDuration, onUpdateItem, onRemoveItem, onSeek, calcTime }) => {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const laneAssignments = assignLanes(items, totalDuration);

  return (
    <div
      className="relative rounded overflow-hidden"
      style={{ height: `${LANE_COUNT * LANE_HEIGHT}px` }}
      onClick={() => setSelectedItemId(null)}
    >
      {/* Lane backgrounds */}
      {Array.from({ length: LANE_COUNT }, (_, i) => (
        <div
          key={i}
          className={`absolute w-full ${i % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/15'}`}
          style={{ top: `${i * LANE_HEIGHT}px`, height: `${LANE_HEIGHT}px` }}
        />
      ))}

      {/* Item blocks */}
      {items.map(item => (
        <ItemBlock
          key={item.id}
          item={item}
          lane={laneAssignments[item.id] || 0}
          totalDuration={totalDuration}
          isSelected={selectedItemId === item.id}
          onSelect={setSelectedItemId}
          onUpdate={onUpdateItem}
          onRemove={onRemoveItem}
          onSeek={onSeek}
          calcTime={calcTime}
        />
      ))}
    </div>
  );
};

// ── Main Timeline ───────────────────────────────────────────────────

const JourneyTimeline = ({
  sections,
  items = [],
  currentTime,
  totalDuration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onRewind,
  onOpenPicker,
  onAddScene,
  onRemoveSection,
  onResizeBoundary,
  onExtendLastEdge,
  onUpdateItem,
  onRemoveItem,
  presetMode = false,
  hideScenes = false,
  onAssignScene,
  onClearScene
}) => {
  const clipStripRef = useRef(null);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [draggingBoundary, setDraggingBoundary] = useState(null);
  const [isDraggingLastEdge, setIsDraggingLastEdge] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(null);

  const coveredEnd = sections.length > 0 ? sections[sections.length - 1].endTime : 0;
  const coveredPct = (coveredEnd / totalDuration) * 100;
  const activeIndex = sections.findIndex(s => currentTime >= s.startTime && currentTime < s.endTime);
  const hasContent = presetMode ? true : sections.length > 0;

  // ── Time calc from clip strip (used for seeking + item drags) ─────

  const calcTimeFromClipStrip = useCallback((clientX) => {
    if (!clipStripRef.current) return null;
    const rect = clipStripRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * totalDuration;
  }, [totalDuration]);

  // ── Clip strip seek (click/drag anywhere to scrub) ────────────────

  const handleClipStripMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDraggingProgress(true);
    const time = calcTimeFromClipStrip(e.clientX);
    if (time !== null) onSeek(time);
  }, [calcTimeFromClipStrip, onSeek]);

  const handleClipStripTouchStart = useCallback((e) => {
    setIsDraggingProgress(true);
    if (e.touches.length > 0) {
      const time = calcTimeFromClipStrip(e.touches[0].clientX);
      if (time !== null) onSeek(time);
    }
  }, [calcTimeFromClipStrip, onSeek]);

  const handleBoundaryDragStart = useCallback((index, e) => {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    setDraggingBoundary(index);
  }, []);

  const handleLastEdgeDragStart = useCallback((e) => {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    setIsDraggingLastEdge(true);
  }, []);

  // ── Global drag handlers ──────────────────────────────────────────

  useEffect(() => {
    const anyDragging = isDraggingProgress || draggingBoundary !== null || isDraggingLastEdge;
    if (!anyDragging) return;

    const handleMove = (clientX) => {
      if (isDraggingProgress) {
        const time = calcTimeFromClipStrip(clientX);
        if (time !== null) onSeek(time);
      }
      if (draggingBoundary !== null && onResizeBoundary) {
        const time = calcTimeFromClipStrip(clientX);
        if (time !== null) onResizeBoundary(draggingBoundary, time);
      }
      if (isDraggingLastEdge && onExtendLastEdge) {
        const time = calcTimeFromClipStrip(clientX);
        if (time !== null) onExtendLastEdge(time);
      }
    };

    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => { if (e.touches.length > 0) handleMove(e.touches[0].clientX); };
    const handleEnd = () => {
      setIsDraggingProgress(false);
      setDraggingBoundary(null);
      setIsDraggingLastEdge(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDraggingProgress, draggingBoundary, isDraggingLastEdge, calcTimeFromClipStrip, onSeek, onResizeBoundary, onExtendLastEdge]);

  // ── Drop zone ─────────────────────────────────────────────────────

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const sceneId = e.dataTransfer.getData('scene-id');
    if (sceneId && onAddScene) onAddScene(sceneId);
  };

  // ── Clip click → open property editor ─────────────────────────────

  const handleClipClick = useCallback((sectionIndex, e) => {
    if (draggingBoundary !== null || isDraggingLastEdge) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onOpenPicker(sectionIndex, 'all', {
      top: rect.top, left: rect.left, width: rect.width, height: rect.height,
    });
  }, [onOpenPicker, draggingBoundary, isDraggingLastEdge]);

  const progressPercent = (currentTime / totalDuration) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Scene palette row */}
      {!hideScenes && <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-white/40 font-bold uppercase w-12 flex-shrink-0">Scenes</span>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {ENVIRONMENTS.map(env => (
            <SceneCard
              key={env.id}
              env={env}
              onAdd={(sceneId) => {
                if (presetMode && onAssignScene) {
                  const targetIdx = selectedPresetIndex !== null ? selectedPresetIndex
                    : activeIndex >= 0 ? activeIndex
                    : sections.findIndex(s => !s.scene);
                  if (targetIdx >= 0) {
                    onAssignScene(targetIdx, sceneId);
                    setSelectedPresetIndex(targetIdx);
                  }
                } else {
                  onAddScene(sceneId);
                }
              }}
            />
          ))}
        </div>
      </div>}

      {/* Timeline: transport left, tracks right */}
      <div className="flex gap-2 items-start">
        {/* Transport controls */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-2">
          <div className="flex gap-1">
            <button
              onClick={onRewind}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={onTogglePlay}
              disabled={!hasContent}
              className={`p-2 rounded-lg transition-colors ${
                hasContent ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
          <span className="text-[10px] text-white/50 font-mono whitespace-nowrap">
            {formatTime(currentTime)}
          </span>
          <span className="text-[10px] text-white/30 font-mono whitespace-nowrap">
            / {formatTime(totalDuration)}
          </span>
        </div>

        {/* Timeline tracks — click anywhere to seek */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Clip strip */}
          <div
            ref={clipStripRef}
            className={`relative rounded-lg transition-colors select-none ${
              isDraggingProgress ? 'cursor-grabbing' : 'cursor-pointer'
            } ${isDragOver ? 'ring-2 ring-blue-400 bg-blue-400/5' : ''
            } ${hasContent ? 'h-14' : 'h-20'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onMouseDown={handleClipStripMouseDown}
            onTouchStart={handleClipStripTouchStart}
          >
            {!hasContent ? (
              <div className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
                isDragOver ? 'border-blue-400 bg-blue-400/10' : 'border-white/15 bg-gray-800/30'
              }`}>
                <p className="text-white/35 text-sm">Click a scene above or drag it here to start</p>
              </div>
            ) : (
              <>
                {/* Background (full duration) */}
                <div className="absolute inset-0 bg-gray-800/30 rounded-lg" />

                {/* Empty space (after last clip) — hidden in preset mode */}
                {!presetMode && coveredPct < 100 && (
                  <div
                    className={`absolute top-0 h-full border-2 border-dashed rounded-r-lg flex items-center justify-center transition-colors ${
                      isDragOver ? 'border-blue-400/40 bg-blue-400/5' : 'border-white/10'
                    }`}
                    style={{ left: `${coveredPct}%`, width: `${100 - coveredPct}%` }}
                  >
                    {(100 - coveredPct) > 15 && (
                      <span className="text-white/15 text-xs">drag edge or add scene</span>
                    )}
                  </div>
                )}

                {/* Clip blocks */}
                {presetMode ? (
                  sections.map((section, idx) => (
                    <PresetPlaceholder
                      key={section.id}
                      section={section}
                      totalDuration={totalDuration}
                      isActive={idx === activeIndex}
                      isSelected={idx === selectedPresetIndex}
                      onClick={() => {
                        setSelectedPresetIndex(prev => prev === idx ? null : idx);
                      }}
                      onDrop={(sceneId) => {
                        onAssignScene && onAssignScene(idx, sceneId);
                        setSelectedPresetIndex(null);
                      }}
                      onClear={() => onClearScene && onClearScene(idx)}
                    />
                  ))
                ) : (
                  sections.map((section, idx) => (
                    <ClipBlock
                      key={section.id}
                      section={section}
                      totalDuration={totalDuration}
                      isActive={idx === activeIndex}
                      onClick={(e) => handleClipClick(idx, e)}
                      onRemove={() => onRemoveSection(idx)}
                    />
                  ))
                )}

                {/* Boundary handles between adjacent clips (not in preset mode) */}
                {!presetMode && sections.slice(0, -1).map((section, idx) => (
                  <BoundaryHandle
                    key={`b-${idx}`}
                    leftPct={(section.endTime / totalDuration) * 100}
                    isDragging={draggingBoundary === idx}
                    onDragStart={(e) => handleBoundaryDragStart(idx, e)}
                  />
                ))}

                {/* Last edge handle — drag to extend/trim last clip (not in preset mode) */}
                {!presetMode && coveredEnd < totalDuration && (
                  <div
                    className={`absolute top-0 h-full w-5 -translate-x-1/2 cursor-col-resize z-20 group ${isDraggingLastEdge ? 'z-30' : ''}`}
                    style={{ left: `${coveredPct}%` }}
                    onMouseDown={handleLastEdgeDragStart}
                    onTouchStart={handleLastEdgeDragStart}
                  >
                    <div className={`absolute left-1/2 -translate-x-1/2 top-0 h-full transition-all rounded-full ${
                      isDraggingLastEdge
                        ? 'w-1.5 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                        : 'w-1 bg-green-400/40 group-hover:bg-green-400 group-hover:w-1.5'
                    }`} />
                    <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-green-400 text-[10px] transition-opacity ${
                      isDraggingLastEdge ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      ↔
                    </div>
                  </div>
                )}

                {/* Also allow trimming when fully extended (not in preset mode) */}
                {!presetMode && coveredEnd >= totalDuration && sections.length > 0 && (
                  <div
                    className={`absolute top-0 right-0 h-full w-5 cursor-col-resize z-20 group ${isDraggingLastEdge ? 'z-30' : ''}`}
                    onMouseDown={handleLastEdgeDragStart}
                    onTouchStart={handleLastEdgeDragStart}
                  >
                    <div className={`absolute right-0 top-0 h-full transition-all rounded-full ${
                      isDraggingLastEdge
                        ? 'w-1.5 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                        : 'w-1 bg-white/20 group-hover:bg-green-400 group-hover:w-1.5'
                    }`} />
                  </div>
                )}

                {/* Playhead — spans clip strip + items track */}
                <div
                  className="absolute top-0 w-0.5 bg-yellow-400 z-10 pointer-events-none"
                  style={{ left: `${progressPercent}%`, height: `calc(100% + ${items.length > 0 ? LANE_COUNT * LANE_HEIGHT + 8 : 0}px)` }}
                />
              </>
            )}
          </div>

          {/* Items track removed — stickers managed via viewport only */}
        </div>
      </div>
    </div>
  );
};

export default JourneyTimeline;
