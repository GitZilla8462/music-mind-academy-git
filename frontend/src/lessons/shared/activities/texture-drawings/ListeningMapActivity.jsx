/**
 * ListeningMapActivity.jsx - Main Component
 * 
 * Lane-based drawing activity for teaching musical texture.
 * Students draw while listening to music with multiple instruments.
 * 
 * Uses modular components:
 * - DrawingCanvas (with BrushEngine, ShapeEngine, FillEngine)
 * - MainToolbar (with brush/shape/utility tool popups)
 * - ColorPanel (color palettes)
 * - StickerPanel (emoji stickers)
 * - MidiPianoRoll (MIDI visualization)
 * - useDAW (Audio/MIDI sync engine)
 * - RoundIntro / SummaryScreen
 * 
 * Props:
 *   onComplete - Called when activity is finished
 */

import React, { useState, useRef, useEffect } from 'react';

// Import screen components
import RoundIntro from './components/Screens/RoundIntro';
import SummaryScreen from './components/Screens/SummaryScreen';

// Import canvas and toolbar
import DrawingCanvas from './components/Canvas/DrawingCanvas';
import MainToolbar from './components/Toolbar/MainToolbar';
import ColorPanel from './components/Toolbar/ColorPanel';
import StickerPanel from './components/Toolbar/StickerPanel';
import MidiPianoRoll from './components/Canvas/MidiPianoRoll';

// Import DAW engine
import useDAW from './engine/useDAW';

// Import config
import { ROUNDS } from './config/rounds';
import { TOOL_TYPES, BRUSH_SIZES } from './config/tools';
import { QUICK_PALETTE } from './config/colors';

// Import storage utils
import { saveListeningMap } from '../../../film-music-project/lesson3/lesson3StorageUtils';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ListeningMapActivity = ({ onComplete }) => {
  // Single round - no round progression needed
  const [phase, setPhase] = useState('intro'); // 'intro' | 'drawing' | 'summary'
  
  // Tool state
  const [tool, setTool] = useState(TOOL_TYPES.BRUSH);
  const [color, setColor] = useState('#000000'); // Start with black
  const [brushSize, setBrushSize] = useState(12);
  const [opacity, setOpacity] = useState(1);
  
  // History state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Panel state
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  
  // Sticker state
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickerSize, setStickerSize] = useState(32);
  
  // Expand/fullscreen state
  const [expanded, setExpanded] = useState(false);
  
  // Clear track confirmation state
  const [clearTrackConfirm, setClearTrackConfirm] = useState(null); // null or { id, name }
  
  // Solo track state (null = no solo, or track id that's soloed)
  const [soloTrack, setSoloTrack] = useState(null);
  
  // Muted tracks state (separate from audio engine's enabled state)
  const [mutedTracks, setMutedTracks] = useState(() => {
    const initial = {};
    ROUNDS[0].instruments.forEach(inst => {
      initial[inst.id] = false; // Start with nothing muted
    });
    return initial;
  });
  
  // MIDI piano roll visibility per track
  const [midiVisibleTracks, setMidiVisibleTracks] = useState(() => {
    const initial = {};
    ROUNDS[0].instruments.forEach(inst => {
      initial[inst.id] = true; // Start with MIDI visible
    });
    return initial;
  });
  
  // Save state
  const [saveMessage, setSaveMessage] = useState(null);
  const [studentId, setStudentId] = useState('');
  const isSavingRef = useRef(false);
  
  // Refs
  const canvasRef = useRef(null);
  
  // Single round data (Quartet)
  const round = ROUNDS[0];
  
  // DAW Engine - handles all audio/MIDI sync
  // Skip MIDI start offset if we're using midiDisplayOffset for manual alignment
  const daw = useDAW(round.instruments, { 
    skipMidiStartOffset: round.midiDisplayOffset !== undefined 
  });
  
  // Responsive sizing for Chromebook (1366x768)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        const newHeight = containerRef.current.offsetHeight;
        setContainerSize({ width: newWidth, height: newHeight });
      }
    };
    
    // Initial measurement with longer delay to ensure DOM is fully rendered
    const initialTimeout = setTimeout(updateSize, 100);
    
    // Also try again after a bit longer in case first measurement was too early
    const secondTimeout = setTimeout(updateSize, 300);
    
    // Also measure on resize
    window.addEventListener('resize', updateSize);
    
    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(secondTimeout);
      window.removeEventListener('resize', updateSize);
    };
  }, [expanded, phase]); // Re-measure when phase changes (entering drawing mode)
  
  // Calculate dimensions
  // Available width = container - toolbar (52px) - track controls (144px) - right sidebar (48px)
  const availableWidth = containerSize.width - 52 - 96 - 48; // toolbar (52) - tracks (96/w-24) - sidebar (48)
  // Available height for canvas (full container height)
  const availableHeight = containerSize.height;
  
  // Lane height: 4 instruments fill the FULL screen height
  const numInstruments = round.instruments.length;
  const laneHeight = availableHeight > 0 ? Math.floor(availableHeight / numInstruments) : 0;
  
  // Canvas dimensions - only set when we have real measurements
  // Don't use fallback values that would lock in wrong dimensions
  const canvasWidth = availableWidth > 0 ? availableWidth : 0;
  const canvasHeight = laneHeight * numInstruments;

  // ========================================================================
  // AUDIO/MIDI CONTROLS (via useDAW hook)
  // ========================================================================

  // Destructure DAW controls for cleaner usage
  const { 
    isPlaying, 
    currentTime: progress, 
    startOffset,
    duration: audioDuration, // Actual audio duration from loaded files
    enabledTracks,
    midiEngine,
    togglePlay, 
    stop, 
    seekTo, 
    rewind,
    toggleTrack,
    setTrackEnabled
  } = daw;
  
  // Use actual audio duration, fallback to config if not loaded yet
  const totalDuration = audioDuration || round.duration;
  
  // Debug: Log duration values once
  React.useEffect(() => {
    if (audioDuration > 0) {
      console.log('📊 Duration comparison:');
      console.log('   audioDuration (from DAW):', audioDuration);
      console.log('   round.duration (from config):', round.duration);
      console.log('   totalDuration (used for playhead):', totalDuration);
    }
  }, [audioDuration]);

  // Handle solo and mute track changes
  React.useEffect(() => {
    if (!setTrackEnabled) return;
    
    round.instruments.forEach(inst => {
      if (soloTrack) {
        // Solo mode: only the soloed track is enabled (unless it's also muted)
        const shouldPlay = inst.id === soloTrack && !mutedTracks[inst.id];
        setTrackEnabled(inst.id, shouldPlay);
      } else {
        // No solo: use mute state
        setTrackEnabled(inst.id, !mutedTracks[inst.id]);
      }
    });
  }, [soloTrack, mutedTracks, setTrackEnabled, round.instruments]);

  // Initialize student ID
  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
    console.log('🗺️ Listening Map Student ID:', id);
  }, []);

  // Manual save handler - saves canvas image to localStorage
  const handleManualSave = () => {
    if (isSavingRef.current) {
      console.log('⏸️ Save already in progress, skipping');
      return;
    }

    if (!studentId) {
      setSaveMessage({ type: 'error', text: '❌ Cannot save: Missing student ID' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    if (!canvasRef.current) {
      setSaveMessage({ type: 'error', text: '❌ Cannot save: Canvas not ready' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    isSavingRef.current = true;

    try {
      // Get canvas image data as base64
      const imageData = canvasRef.current.toDataURL?.();
      
      if (!imageData) {
        setSaveMessage({ type: 'error', text: '❌ Cannot save: No drawing found' });
        setTimeout(() => setSaveMessage(null), 3000);
        isSavingRef.current = false;
        return;
      }

      // Use the storage utility function for consistent saving
      saveListeningMap(studentId, imageData, round.id, round.title, round.instruments.length);
      console.log('💾 Listening map saved for student:', studentId);

      setSaveMessage({ type: 'success', text: '✅ Drawing saved!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('❌ Save error:', error);
      setSaveMessage({ type: 'error', text: '❌ Save failed' });
      setTimeout(() => setSaveMessage(null), 3000);
    }

    setTimeout(() => {
      isSavingRef.current = false;
    }, 500);
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ========================================================================
  // PHASE HANDLERS
  // ========================================================================

  const handleStartDrawing = () => {
    setPhase('drawing');
    rewind(); // Reset to start offset
  };

  const handleCompleteActivity = () => {
    // Stop playback
    stop();
    setExpanded(false);
    
    // Go to summary
    setPhase('summary');
  };

  const handleRestart = () => {
    setPhase('intro');
  };

  const handleContinue = () => {
    onComplete?.();
  };

  // ========================================================================
  // TOOL HANDLERS
  // ========================================================================

  const handleHistoryChange = (info) => {
    setCanUndo(info?.canUndo ?? false);
    setCanRedo(info?.canRedo ?? false);
  };

  const handleToolChange = (newTool) => {
    setTool(newTool);
    if (newTool !== TOOL_TYPES.STICKER) {
      setShowStickerPanel(false);
    }
  };

  const handleColorSelect = (newColor) => {
    setColor(newColor);
    // Don't close panel here - let user keep using sliders
    // Panel closes via its own close button or clicking outside
  };

  const handleColorPick = (pickedColor) => {
    setColor(pickedColor);
    setTool(TOOL_TYPES.BRUSH);
  };

  const handleStickerSelect = (sticker) => {
    setSelectedSticker(sticker);
    setTool(TOOL_TYPES.STICKER);
  };

  // Clear a specific track's art
  const handleClearTrack = (instId) => {
    const laneIndex = round.instruments.findIndex(i => i.id === instId);
    if (laneIndex !== -1 && canvasRef.current?.clearLane) {
      canvasRef.current.clearLane(laneIndex);
    }
    setClearTrackConfirm(null);
  };

  // ========================================================================
  // INTRO SCREEN
  // ========================================================================

  if (phase === 'intro') {
    return (
      <div className="h-full bg-gray-900 text-white">
        <RoundIntro round={round} onStart={handleStartDrawing} />
      </div>
    );
  }

  // ========================================================================
  // SUMMARY SCREEN
  // ========================================================================

  if (phase === 'summary') {
    return (
      <div className="h-full bg-gray-900 text-white">
        <SummaryScreen 
          drawings={drawings} 
          onRestart={handleRestart} 
          onContinue={handleContinue} 
        />
      </div>
    );
  }

  // ========================================================================
  // DRAWING SCREEN
  // ========================================================================

  return (
    <div className={`h-full bg-gray-100 text-gray-800 flex flex-col ${expanded ? 'fixed inset-0 z-50' : ''}`}>
      {/* Audio elements are created dynamically in trackAudioRefs */}
      
      {/* Header - Clean white style */}
      <div className="h-11 px-4 flex items-center justify-between bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-gray-800 font-semibold text-sm">
            {round.title}
          </span>
          <span className="text-gray-400 text-xs">
            {round.subtitle}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title={expanded ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {expanded ? '✕' : '⛶'}
          </button>
          <button
            onClick={handleManualSave}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            💾 Save
          </button>
        </div>
      </div>
      
      {/* Main Area */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative bg-white">
        {/* Main Toolbar */}
        <MainToolbar
          activeTool={tool}
          onToolChange={handleToolChange}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          onUndo={() => canvasRef.current?.undo?.()}
          onRedo={() => canvasRef.current?.redo?.()}
          canUndo={canUndo}
          canRedo={canRedo}
          onOpenStickers={() => setShowStickerPanel(!showStickerPanel)}
          onOpenColors={() => setShowColorPanel(!showColorPanel)}
        />
        
        {/* Backdrop for closing panels */}
        {(showColorPanel || showStickerPanel) && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowColorPanel(false);
              setShowStickerPanel(false);
            }}
          />
        )}
        
        {/* Color Panel (floating) */}
        {showColorPanel && (
          <div className="absolute left-16 top-4 z-50">
            <ColorPanel
              currentColor={color}
              onColorChange={handleColorSelect}
              onClose={() => setShowColorPanel(false)}
            />
          </div>
        )}
        
        {/* Sticker Panel (floating) */}
        {showStickerPanel && (
          <div className="absolute left-16 top-4 z-50">
            <StickerPanel
              selectedSticker={selectedSticker}
              stickerSize={stickerSize}
              onStickerSelect={handleStickerSelect}
              onSizeChange={setStickerSize}
              onClose={() => setShowStickerPanel(false)}
            />
          </div>
        )}
        
        {/* Instrument Track Controls - DAW style */}
        <div className="w-24 bg-gray-100 border-r border-gray-300 flex flex-col flex-shrink-0">
          {round.instruments.map((inst, index) => {
            // Determine if this track should be audible
            // If solo is active, only the soloed track plays
            // Otherwise, use the mutedTracks state
            const isMuted = mutedTracks[inst.id];
            const isSoloed = soloTrack === inst.id;
            const isAudible = soloTrack 
              ? (soloTrack === inst.id && !isMuted) 
              : !isMuted;
            
            return (
              <div
                key={inst.id}
                className="flex flex-col justify-center px-1.5 py-1 border-b border-gray-300 last:border-b-0"
                style={{ 
                  height: laneHeight,
                  borderLeftWidth: '4px',
                  borderLeftColor: isAudible ? inst.color : '#9ca3af',
                  backgroundColor: isAudible ? '#ffffff' : '#f3f4f6'
                }}
              >
                {/* Track name */}
                <span className={`text-[10px] font-semibold truncate mb-1 ${
                  isAudible ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {inst.name}
                </span>
                
                {/* Control buttons - stacked vertically */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => setMutedTracks(prev => ({
                      ...prev,
                      [inst.id]: !prev[inst.id]
                    }))}
                    className={`px-1 py-0.5 rounded text-[8px] font-bold transition-all text-left ${
                      isMuted
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-red-100'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    MUTE
                  </button>
                  <button
                    onClick={() => setSoloTrack(prev => prev === inst.id ? null : inst.id)}
                    className={`px-1 py-0.5 rounded text-[8px] font-bold transition-all text-left ${
                      isSoloed
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-200 text-gray-500 hover:bg-yellow-100'
                    }`}
                    title={isSoloed ? 'Unsolo' : 'Solo'}
                  >
                    SOLO
                  </button>
                  <button
                    onClick={() => setMidiVisibleTracks(prev => ({
                      ...prev,
                      [inst.id]: !prev[inst.id]
                    }))}
                    className={`px-1 py-0.5 rounded text-[8px] font-bold transition-all text-left ${
                      midiVisibleTracks[inst.id]
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-purple-100'
                    }`}
                    title={midiVisibleTracks[inst.id] ? 'Hide MIDI' : 'Show MIDI'}
                  >
                    MIDI
                  </button>
                  <button
                    onClick={() => setClearTrackConfirm({ id: inst.id, name: inst.name, index })}
                    className="px-1 py-0.5 rounded text-[8px] font-bold transition-all text-left bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-500"
                    title="Clear track"
                  >
                    🗑️ CLEAR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Clear Track Confirmation Modal */}
        {clearTrackConfirm && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-5 max-w-xs mx-4">
              <h3 className="text-gray-800 font-semibold mb-2">Clear Track?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Erase all art in the <strong>{clearTrackConfirm.name}</strong> track?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setClearTrackConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClearTrack(clearTrackConfirm.id)}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Canvas Area with Playhead */}
        <div 
          className="relative flex-1 overflow-hidden"
          style={{ width: canvasWidth > 0 ? canvasWidth : 'auto' }}
        >
          {/* MIDI Piano Roll Background */}
          {canvasWidth > 0 && canvasHeight > 0 && midiEngine && (
            <MidiPianoRoll
              midiEngine={midiEngine}
              instruments={round.instruments}
              width={canvasWidth}
              height={canvasHeight}
              duration={totalDuration}
              visibleTracks={midiVisibleTracks}
              midiDisplayOffset={round.midiDisplayOffset || 0}
            />
          )}
          
          <DrawingCanvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            instruments={round.instruments}
            tool={tool}
            color={color}
            brushSize={brushSize}
            opacity={opacity}
            selectedSticker={selectedSticker}
            stickerSize={stickerSize}
            onHistoryChange={handleHistoryChange}
            onColorPick={handleColorPick}
          />
          
          {/* Playhead - vertical line showing current playback position */}
          {canvasWidth > 0 && canvasHeight > 0 && (
            <div
              className="absolute top-0 w-0.5 bg-red-500 pointer-events-none z-10"
              style={{
                height: canvasHeight,
                transform: `translateX(${(progress / totalDuration) * canvasWidth}px)`,
                willChange: 'transform',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.6), 0 0 2px rgba(239, 68, 68, 0.8)'
              }}
              // Debug: log playhead values periodically
              ref={el => {
                if (el && Math.floor(progress) !== Math.floor(progress - 0.1)) {
                  console.log(`🔴 Playhead: progress=${progress.toFixed(2)}s, duration=${totalDuration}, x=${((progress / totalDuration) * canvasWidth).toFixed(1)}px`);
                }
              }}
            >
              {/* Playhead handle at top */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md" />
              {/* Playhead handle at bottom */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md" />
            </div>
          )}
        </div>
        
        {/* Right Sidebar - Colors Only */}
        <div className="w-12 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-3 gap-1.5 flex-shrink-0 overflow-y-auto shadow-inner">
          {/* Current color indicator */}
          <button
            className="w-9 h-9 rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform ring-2 ring-gray-200"
            style={{ backgroundColor: color }}
            onClick={() => setShowColorPanel(!showColorPanel)}
            title="Change Color"
          />
          
          <div className="w-6 h-px bg-gray-200 my-2" />
          
          {/* Quick colors - compact grid with black first */}
          <div className="grid grid-cols-2 gap-1.5">
            {['#000000', ...QUICK_PALETTE.slice(0, 11)].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${
                  color === c ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Transport Bar - DAW style controls */}
      <div className="h-14 px-4 flex items-center gap-3 bg-white border-t border-gray-200 flex-shrink-0 shadow-sm">
        
        {/* Transport Controls */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {/* Rewind to start */}
          <button
            onClick={rewind}
            className="w-10 h-10 rounded-lg hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
            title="Back to start"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className={`w-12 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isPlaying 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          {/* Stop (pause and rewind) */}
          <button
            onClick={stop}
            className="w-10 h-10 rounded-lg hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
            title="Stop"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h12v12H6z"/>
            </svg>
          </button>
        </div>
        
        {/* Time display */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg font-mono">
          <span className="text-green-400 text-sm font-semibold tracking-wider">
            {formatTime(progress)}
          </span>
          <span className="text-gray-500 text-xs">/</span>
          <span className="text-gray-400 text-sm">
            {formatTime(totalDuration)}
          </span>
        </div>
        
        {/* Progress bar */}
        <div 
          className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            seekTo(ratio * totalDuration);
          }}
        >
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 group-hover:from-blue-600 group-hover:to-blue-500 transition-colors"
            style={{ 
              width: `${(progress / totalDuration) * 100}%`
            }}
          />
        </div>
        
        {/* Track count indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
          <span className="text-xs font-medium text-gray-600">
            {Object.values(enabledTracks).filter(Boolean).length}/{round.instruments.length}
          </span>
          <span className="text-xs text-gray-400">tracks</span>
        </div>
        
        {/* MIDI visibility indicator */}
        {Object.values(midiVisibleTracks).some(v => v) && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 rounded-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-purple-600">
              <path d="M4 3h16v18H4V3zm2 2v14h12V5H6zm2 2h2v4H8V7zm4 0h2v4h-2V7zm4 0h2v4h-2V7zm-8 6h2v4H8v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4z"/>
            </svg>
            <span className="text-xs font-medium text-purple-600">
              {Object.values(midiVisibleTracks).filter(Boolean).length} MIDI
            </span>
          </div>
        )}
        
        {/* Current tool/color indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <div 
            className="w-5 h-5 rounded-full shadow-inner border border-gray-300"
            style={{ backgroundColor: tool === TOOL_TYPES.ERASER ? '#e5e7eb' : color }}
          />
          <span className="text-xs text-gray-500 font-medium">
            {brushSize}px
          </span>
        </div>
      </div>
      
      {/* Save Message Toast */}
      {saveMessage && (
        <div 
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl font-bold text-white transition-all duration-300 ${
            saveMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {saveMessage.text}
        </div>
      )}
    </div>
  );
};

export default ListeningMapActivity;