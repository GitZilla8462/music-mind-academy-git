/**
 * ListeningMapActivity.jsx - Traditional Listening Map
 * 
 * Layout:
 * - Header: Toggle Tools (left), Song Title & Composer (center), Undo/Redo + Save (right)
 * - Left: Sticker Panel (accordion)
 * - Left-Center: Row Controls (time + clear)
 * - Center: Canvas
 * - Right: Tools (HAND default, then Brush/Pencil/Eraser)
 * - Bottom: Transport
 * 
 * ✅ UPDATED: Now saves editable data (stickers + canvas) so you can continue editing
 * ✅ UPDATED: Loads saved work on mount, just like compositions
 * ✅ NEW: Drag stickers from panel directly onto canvas
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

// Components
import DrawingCanvas from './components/Canvas/DrawingCanvas';
import StickerPanel from './components/Toolbar/StickerPanel';
import RowControls from './components/Toolbar/RowControls';
import RightToolbar from './components/Toolbar/RightToolbar';
import ColorPanel from './components/Toolbar/ColorPanel';

// Config
import { TOOL_TYPES } from './config/tools';
import { INSTRUMENT_ICONS } from './config/InstrumentIcons';

// Context
import { useSession } from '../../../../context/SessionContext';

// Storage - Use generic system so it appears on Join page
import { saveStudentWork, loadStudentWork } from '../../../../utils/studentWorkStorage';

// ============================================================================
// CONFIG
// ============================================================================

const LISTENING_MAP_CONFIG = {
  audioFile: '/lessons/film-music-project/lesson2/VivaldiSpring.mp3',
  totalDuration: 120,
  numRows: 4,
  secondsPerRow: 30,
  rows: [
    { id: 'row1', name: '0:00 - 0:30', color: '#3b82f6', emoji: '1️⃣' },
    { id: 'row2', name: '0:30 - 1:00', color: '#8b5cf6', emoji: '2️⃣' },
    { id: 'row3', name: '1:00 - 1:30', color: '#ec4899', emoji: '3️⃣' },
    { id: 'row4', name: '1:30 - 2:00', color: '#f59e0b', emoji: '4️⃣' }
  ],
  credits: {
    title: "Allegro (from Vivaldi's Spring)",
    composer: 'Antonio Vivaldi',
    performer: 'John Harrison with the Wichita State University Chamber Players',
    license: 'CC BY-SA 3.0',
    source: 'Free Music Archive'
  }
};

// ============================================================================
// AUDIO HOOK
// ============================================================================

const useAudioPlayer = (audioSrc, totalDuration) => {
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration] = useState(totalDuration);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = audioSrc;

    audio.addEventListener('canplaythrough', () => setIsLoaded(true));
    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime >= totalDuration) {
        audio.pause();
        audio.currentTime = 0;
        setCurrentTime(0);
        setIsPlaying(false);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      }
    });
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    });
    audio.addEventListener('error', () => setIsLoaded(true));

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [audioSrc, totalDuration]);

  const updateTime = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      const time = Math.min(audioRef.current.currentTime, duration);
      setCurrentTime(time);
      if (time >= duration) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        setIsPlaying(false);
        return;
      }
      animationRef.current = requestAnimationFrame(updateTime);
    }
  }, [duration]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        animationRef.current = requestAnimationFrame(updateTime);
      }).catch(() => {});
    }
  }, [updateTime]);

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  const stop = useCallback(() => {
    pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentTime(0);
  }, [pause]);

  const seekTo = useCallback((time) => {
    const clampedTime = Math.max(0, Math.min(time, duration));
    if (audioRef.current) audioRef.current.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  }, [duration]);

  const rewind = useCallback(() => seekTo(0), [seekTo]);
  const togglePlay = useCallback(() => isPlaying ? pause() : play(), [isPlaying, play, pause]);

  return { isPlaying, currentTime, duration, isLoaded, play, pause, stop, seekTo, rewind, togglePlay };
};

// ============================================================================
// FORMAT TIME
// ============================================================================

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ============================================================================
// DRAG GHOST COMPONENT - Renders floating sticker while dragging from panel
// ============================================================================

const DragGhost = ({ sticker, position, size }) => {
  if (!sticker || !position) return null;
  
  const renderSymbol = () => {
    const renderType = sticker.render || 'emoji';

    switch (renderType) {
      case 'svg':
        const IconComponent = INSTRUMENT_ICONS?.[sticker.id];
        if (IconComponent) {
          return <IconComponent size={size * 0.7} />;
        }
        return <span style={{ fontSize: `${size * 0.7}px` }}>🎵</span>;

      case 'text':
        return (
          <span style={{
            fontFamily: 'Times New Roman, Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 'bold',
            fontSize: `${size * 0.5}px`,
            color: '#000000'
          }}>
            {sticker.symbol}
          </span>
        );

      case 'text-italic':
        return (
          <span style={{
            fontFamily: 'Times New Roman, Georgia, serif',
            fontStyle: 'italic',
            fontSize: `${size * 0.35}px`,
            color: '#000000',
            fontWeight: '600'
          }}>
            {sticker.symbol}
          </span>
        );

      case 'crescendo':
        return (
          <svg width={size * 0.8} height={size * 0.4} viewBox="0 0 40 20">
            <path d="M36 2 L4 10 L36 18" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );

      case 'decrescendo':
        return (
          <svg width={size * 0.8} height={size * 0.4} viewBox="0 0 40 20">
            <path d="M4 2 L36 10 L4 18" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );

      case 'symbol':
        return (
          <span style={{
            fontFamily: 'Noto Music, Symbola, serif',
            fontSize: `${size * 0.6}px`,
            color: '#000000'
          }}>
            {sticker.symbol}
          </span>
        );

      case 'symbol-large':
        return (
          <span style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: `${size * 0.7}px`,
            fontWeight: 'bold',
            color: '#000000'
          }}>
            {sticker.symbol}
          </span>
        );

      case 'form-label':
        return (
          <div style={{
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            border: '2px solid #1d4ed8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <span style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: `${size * 0.35}px`,
              fontWeight: 'bold',
              color: '#ffffff'
            }}>
              {sticker.symbol}
            </span>
          </div>
        );

      case 'form-text':
        return (
          <div style={{
            padding: '4px 8px',
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <span style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: `${size * 0.25}px`,
              fontWeight: 'bold',
              color: '#92400e'
            }}>
              {sticker.symbol}
            </span>
          </div>
        );

      default:
        return (
          <span style={{ fontSize: `${size * 0.7}px` }}>
            {sticker.symbol}
          </span>
        );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        pointerEvents: 'none',
        zIndex: 10000,
        transform: 'scale(1.1)',
        transition: 'transform 0.1s ease'
      }}
    >
      {renderSymbol()}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ListeningMapActivity = ({ onComplete, audioFile, config = {}, isSessionMode = false }) => {
  const mapConfig = { ...LISTENING_MAP_CONFIG, ...config };
  if (audioFile) mapConfig.audioFile = audioFile;

  // Session context for saveCommand listener
  const { sessionCode } = useSession();

  // Teacher save toast
  const [teacherSaveToast, setTeacherSaveToast] = useState(false);
  const lastSaveCommandRef = useRef(null);

  // DEFAULT: HAND tool
  const [tool, setTool] = useState(TOOL_TYPES.HAND || 'hand');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(16);
  const [opacity] = useState(1);

  // History
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Panels
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [showStickerPanel, setShowStickerPanel] = useState(true);

  // Stickers - DEFAULT size 56 (middle of 32-96 range)
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerSize, setStickerSize] = useState(56);

  // ✅ NEW: Drag-from-panel state
  const [isDraggingFromPanel, setIsDraggingFromPanel] = useState(false);
  const [draggedSticker, setDraggedSticker] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);

  // UI
  const [expanded, setExpanded] = useState(false);

  // Save
  const [saveMessage, setSaveMessage] = useState(null);
  const [studentId, setStudentId] = useState('');
  const isSavingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Refs
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [canvasReady, setCanvasReady] = useState(false);

  // Audio
  const audio = useAudioPlayer(mapConfig.audioFile, mapConfig.totalDuration);

  // Init student ID
  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
  }, []);

  // Measure container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    setTimeout(updateSize, 100);
    setTimeout(updateSize, 300);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [expanded, showStickerPanel]);

  // Mark canvas as ready when dimensions are set
  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0 && canvasRef.current) {
      // Small delay to ensure canvas is fully initialized
      setTimeout(() => setCanvasReady(true), 200);
    }
  }, [containerSize.width, containerSize.height]);

  // ✅ LOAD SAVED WORK ON MOUNT
  useEffect(() => {
    if (!studentId || !canvasReady || hasLoadedRef.current) return;
    
    console.log('🎨 Checking for saved listening map...');
    
    const savedWork = loadStudentWork('listening-map', studentId);
    
    if (savedWork && savedWork.data?.editableData) {
      console.log('📂 Found saved listening map, restoring...');
      
      // Use loadState to restore stickers and canvas
      if (canvasRef.current?.loadState) {
        canvasRef.current.loadState(savedWork.data.editableData);
        console.log('✅ Listening map restored!');
      }
      
      hasLoadedRef.current = true;
    } else {
      console.log('ℹ️ No saved listening map found');
      hasLoadedRef.current = true;
    }
  }, [studentId, canvasReady]);

  // Dimensions
  const stickerPanelWidth = showStickerPanel ? 240 : 0;
  const rowControlsWidth = 80;
  const rightToolbarWidth = 60;
  const canvasWidth = Math.max(0, containerSize.width - stickerPanelWidth - rowControlsWidth - rightToolbarWidth);
  const canvasHeight = containerSize.height;
  const rowHeight = canvasHeight / mapConfig.numRows;

  // Playhead
  const currentRow = Math.min(Math.floor(audio.currentTime / mapConfig.secondsPerRow), mapConfig.numRows - 1);
  const timeInRow = audio.currentTime % mapConfig.secondsPerRow;
  const playheadX = (timeInRow / mapConfig.secondsPerRow) * canvasWidth;
  const playheadY = currentRow * rowHeight;

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleHistoryChange = (info) => {
    setCanUndo(info?.canUndo ?? false);
    setCanRedo(info?.canRedo ?? false);
  };

  const handleUndo = () => canvasRef.current?.undo?.();
  const handleRedo = () => canvasRef.current?.redo?.();

  const handleToolChange = (newTool) => {
    setTool(newTool);
    if (newTool !== (TOOL_TYPES.HAND || 'hand') && newTool !== TOOL_TYPES.STICKER) {
      setSelectedSticker(null);
    }
  };

  const handleColorChange = (newColor) => setColor(newColor);

  const handleStickerSelect = (sticker) => {
    setSelectedSticker(sticker);
    setTool(TOOL_TYPES.STICKER);
  };

  const handleStickerPlaced = () => {
    setTool(TOOL_TYPES.HAND || 'hand');
  };

  const handleClearRow = (rowIndex) => {
    canvasRef.current?.clearLane?.(rowIndex);
  };

  const stickerData = selectedSticker;

  // ========================================================================
  // ✅ NEW: DRAG FROM PANEL HANDLERS
  // ========================================================================

  const handlePanelDragStart = useCallback((sticker, event) => {
    console.log('🎯 Drag started:', sticker.name);
    setIsDraggingFromPanel(true);
    setDraggedSticker(sticker);
    setDragPosition({ x: event.clientX, y: event.clientY });
  }, []);

  // Global mouse handlers for drag from panel
  useEffect(() => {
    if (!isDraggingFromPanel) return;

    const handleMouseMove = (e) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e) => {
      // Check if dropped over canvas
      const canvasBounds = canvasRef.current?.getCanvasBounds?.();
      
      if (canvasBounds && draggedSticker) {
        const { clientX, clientY } = e;
        
        // Check if cursor is within canvas bounds
        if (
          clientX >= canvasBounds.left &&
          clientX <= canvasBounds.right &&
          clientY >= canvasBounds.top &&
          clientY <= canvasBounds.bottom
        ) {
          // Convert screen position to canvas coordinates
          const canvasPoint = canvasRef.current?.screenToCanvas?.(clientX, clientY);
          
          if (canvasPoint) {
            console.log('✅ Dropped on canvas at:', canvasPoint);
            canvasRef.current?.placeStickerAt?.(draggedSticker, canvasPoint.x, canvasPoint.y, stickerSize);
          }
        } else {
          console.log('❌ Dropped outside canvas');
        }
      }

      // Clean up drag state
      setIsDraggingFromPanel(false);
      setDraggedSticker(null);
      setDragPosition(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingFromPanel, draggedSticker, stickerSize]);

  // ✅ UPDATED: Save using editable data so it can be loaded and edited later
  // silent = true means don't show message (used by teacher save command)
  const handleManualSave = useCallback((silent = false) => {
    if (isSavingRef.current || !studentId || !canvasRef.current) return;
    isSavingRef.current = true;

    try {
      // Get editable data (stickers + canvas drawing)
      const editableData = canvasRef.current.getEditableData?.();
      // Also get flat image for preview/thumbnail
      const imageData = canvasRef.current.toDataURL?.();

      if (editableData) {
        // Save using the generic system so it appears on Join page
        saveStudentWork('listening-map', {
          title: mapConfig.credits.title,
          emoji: '🗺️',
          viewRoute: '/lessons/film-music-project/lesson2?view=listening-map',  // ✅ Go back into activity
          subtitle: `${mapConfig.numRows} rows • Vivaldi`,
          category: 'Film Music Project',
          data: {
            editableData,  // ✅ Stickers + canvas - for loading back into activity
            imageData,     // Flat image - for thumbnail/preview
            songTitle: mapConfig.credits.title,
            composer: mapConfig.credits.composer,
            numRows: mapConfig.numRows,
            savedAt: new Date().toISOString()
          }
        }, studentId);

        if (!silent) {
          setSaveMessage({ type: 'success', text: '✅ Composition saved! View it anytime from the Join page.' });
        }
      }
    } catch (error) {
      console.error('Error saving listening map:', error);
      if (!silent) {
        setSaveMessage({ type: 'error', text: '❌ Save failed' });
      }
    }

    if (!silent) {
      setTimeout(() => setSaveMessage(null), 3000);
    }
    setTimeout(() => { isSavingRef.current = false; }, 500);
  }, [studentId, mapConfig]);

  // ✅ Listen for teacher's save command from Firebase
  useEffect(() => {
    if (!sessionCode || !isSessionMode) return;

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}/saveCommand`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const saveCommand = snapshot.val();

      // Skip if no command
      if (!saveCommand) return;

      // On first load, just store the value without triggering
      if (lastSaveCommandRef.current === null) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }

      // Only trigger if this is a new command (timestamp changed)
      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('💾 Teacher save command received for listening map!');

        // Trigger save
        if (studentId && canvasRef.current) {
          handleManualSave(true); // Silent save

          // Show toast notification
          setTeacherSaveToast(true);
          setTimeout(() => setTeacherSaveToast(false), 3000);
        }
      }
    });

    return () => unsubscribe();
  }, [sessionCode, isSessionMode, studentId, handleManualSave]);

  // ✅ Auto-save on unmount (when student leaves the activity)
  // This ensures work is saved even if teacher triggers save while student is on another activity
  const handleManualSaveRef = useRef(handleManualSave);
  handleManualSaveRef.current = handleManualSave;

  useEffect(() => {
    return () => {
      // Save silently when component unmounts
      if (isSessionMode) {
        console.log('💾 Auto-saving listening map on unmount...');
        handleManualSaveRef.current?.(true);
      }
    };
  }, [isSessionMode]);

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.seekTo(ratio * audio.duration);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className={`h-full bg-gray-100 text-gray-800 flex flex-col ${expanded ? 'fixed inset-0 z-50' : ''}`}>

      {/* HEADER */}
      <div className="h-16 px-4 flex items-center justify-between bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-gray-800">🎵 Listening Map Canvas</span>
        </div>

        {/* Center: Song Title & Composer */}
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-500 text-sm font-medium">Song:</span>
              <span className="font-bold text-lg text-gray-900">{mapConfig.credits.title}</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-gray-500 text-sm font-medium">Composer:</span>
              <span className="font-semibold text-base text-gray-700">{mapConfig.credits.composer}</span>
            </div>
          </div>
        </div>

        {/* Right: Hide Tools, Undo/Redo, Fullscreen, Save */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStickerPanel(!showStickerPanel)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showStickerPanel ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {showStickerPanel ? '◀ Hide Tools' : '▶ Show Tools'}
          </button>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={handleUndo} disabled={!canUndo}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${canUndo ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300 cursor-not-allowed'}`}
              title="Undo">↩️</button>
            <button onClick={handleRedo} disabled={!canRedo}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${canRedo ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300 cursor-not-allowed'}`}
              title="Redo">↪️</button>
          </div>

          <button onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
            title={expanded ? 'Exit Fullscreen' : 'Fullscreen'}>
            {expanded ? '✕' : '⛶'}
          </button>

          <button onClick={() => handleManualSave(false)}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm">
            💾 Save
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">

        {showStickerPanel && (
          <StickerPanel
            selectedSticker={selectedSticker}
            onStickerSelect={handleStickerSelect}
            stickerSize={stickerSize}
            onSizeChange={setStickerSize}
            isOpen={showStickerPanel}
            onDragStart={handlePanelDragStart}  // ✅ NEW: Pass drag handler
          />
        )}

        <RowControls
          rows={mapConfig.rows}
          currentRow={currentRow}
          isPlaying={audio.isPlaying}
          rowHeight={rowHeight}
          onClearRow={handleClearRow}
        />

        {showColorPanel && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowColorPanel(false)} />
            <div className="absolute right-16 top-4 z-50">
              <ColorPanel currentColor={color} onColorChange={handleColorChange} onClose={() => setShowColorPanel(false)} />
            </div>
          </>
        )}

        {/* CANVAS */}
        <div className="relative flex-1 overflow-hidden bg-white">
          {canvasWidth > 0 && canvasHeight > 0 && (
            <>
              <DrawingCanvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                instruments={mapConfig.rows}
                tool={tool}
                color={color}
                brushSize={brushSize}
                opacity={opacity}
                selectedSticker={stickerData}
                stickerSize={stickerSize}
                onHistoryChange={handleHistoryChange}
                onColorPick={handleColorChange}
                onStickerPlaced={handleStickerPlaced}
              />

              {[1, 2, 3].map((i) => (
                <div key={i} className="absolute left-0 right-0 h-px bg-gray-300 pointer-events-none" style={{ top: i * rowHeight, zIndex: 5 }} />
              ))}

              <div className="absolute w-0.5 bg-red-500 pointer-events-none z-20"
                style={{ height: rowHeight, top: playheadY, left: 0, transform: `translateX(${playheadX}px)`, willChange: 'transform', boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}>
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
              </div>

              {/* ✅ NEW: Drop zone indicator when dragging */}
              {isDraggingFromPanel && (
                <div 
                  className="absolute inset-0 pointer-events-none z-30"
                  style={{
                    border: '3px dashed #3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    borderRadius: '8px'
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                    Drop sticker here!
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <RightToolbar
          activeTool={tool}
          onToolChange={handleToolChange}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          color={color}
          onColorChange={handleColorChange}
          onOpenColorPanel={() => setShowColorPanel(!showColorPanel)}
        />
      </div>

      {/* TRANSPORT */}
      <div className="h-14 px-4 flex items-center gap-3 bg-white border-t border-gray-200 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={audio.rewind} className="w-10 h-10 rounded-lg hover:bg-gray-200 text-gray-600 flex items-center justify-center" title="Rewind">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button onClick={audio.togglePlay}
            className={`w-12 h-10 rounded-lg flex items-center justify-center ${audio.isPlaying ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            title={audio.isPlaying ? 'Pause' : 'Play'}>
            {audio.isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button onClick={audio.stop} className="w-10 h-10 rounded-lg hover:bg-gray-200 text-gray-600 flex items-center justify-center" title="Stop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg font-mono">
          <span className="text-green-400 text-sm font-semibold">{formatTime(audio.currentTime)}</span>
          <span className="text-gray-500 text-xs">/</span>
          <span className="text-gray-400 text-sm">{formatTime(audio.duration)}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mapConfig.rows[currentRow]?.color }} />
          <span className="text-xs font-medium text-gray-600">Row {currentRow + 1}</span>
          <span className="text-xs text-gray-400">of {mapConfig.numRows}</span>
        </div>

        <div className="flex-1 h-3 bg-gray-200 rounded-full cursor-pointer overflow-hidden relative" onClick={handleProgressClick}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-gray-400 z-10" style={{ left: `${(i / 4) * 100}%` }} />
          ))}
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: `${(audio.currentTime / audio.duration) * 100}%` }} />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <div className="w-5 h-5 rounded-full shadow-inner border border-gray-300"
            style={{ backgroundColor: tool === TOOL_TYPES.ERASER ? '#e5e7eb' : color }} />
          <span className="text-xs text-gray-500 font-medium">{brushSize}px</span>
        </div>

        {onComplete && (
          <button onClick={() => { audio.stop(); onComplete(); }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">
            Done ✓
          </button>
        )}
      </div>

      {/* ✅ NEW: Floating ghost sticker while dragging from panel */}
      {isDraggingFromPanel && (
        <DragGhost 
          sticker={draggedSticker} 
          position={dragPosition} 
          size={stickerSize} 
        />
      )}

      {saveMessage && (
        <div className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-xl font-bold text-white ${saveMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {saveMessage.text}
        </div>
      )}

      {/* Teacher Save Command Toast */}
      {teacherSaveToast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl font-bold text-white bg-blue-600 animate-pulse">
          💾 Your teacher saved your listening map!
        </div>
      )}
    </div>
  );
};

export default ListeningMapActivity;