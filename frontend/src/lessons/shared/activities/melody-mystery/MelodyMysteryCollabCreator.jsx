// MelodyMysteryCollabCreator.jsx - Collaborative melody creation
// Both partners work simultaneously, seeing each other's progress in real-time
// Chromebook-safe: local-first saving, offline support, big touch targets

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Check, Lock, Loader, Edit3, WifiOff, ArrowLeft, Save, MapPin, Music } from 'lucide-react';
import SimpleMelodyGrid, {
  createEmptySimpleGrid,
  countSimpleNotes,
  playSimpleGrid,
  getSimpleContour
} from './SimpleMelodyGrid';
import {
  getMelodyAssignments,
  initMelodySynth,
  sounds,
  MODES
} from './melodyMysteryConfig';
import {
  getConcept,
  getEnding,
  getSceneImage,
  getDeviceImage
} from './melodyMysteryConcepts';
import { saveStudentWork } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
const POLL_INTERVAL = 3000; // 3 seconds
const LOCAL_STORAGE_KEY = 'melody-mystery-pending';

const MelodyMysteryCollabCreator = ({
  roomCode,
  mode,
  conceptId = 'vanishing-composer',
  ending,
  playerIndex,
  onComplete,
  onBack
}) => {
  const [room, setRoom] = useState(null);
  const [editingScene, setEditingScene] = useState(null);
  const [currentGrid, setCurrentGrid] = useState(createEmptySimpleGrid());
  const [currentDevice, setCurrentDevice] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [isSaved, setIsSaved] = useState(false);

  const { currentStage } = useSession() || {};
  const prevStageRef = useRef(currentStage);
  const playingRef = useRef(false);

  const concept = getConcept(conceptId);
  const endingData = getEnding(conceptId, ending);
  const locations = endingData?.locations || [];

  // Detect Chromebook for performance optimizations
  const isChromebook = typeof navigator !== 'undefined' && navigator.userAgent.includes('CrOS');

  // Get which scenes belong to this player (1-indexed from config, convert to 0-indexed)
  const myScenes = useMemo(() => {
    return getMelodyAssignments(mode, playerIndex).map(m => m - 1);
  }, [mode, playerIndex]);

  const totalScenes = 6;

  // Count completed scenes
  const myCompletedCount = useMemo(() => {
    if (!room?.melodies) return 0;
    return myScenes.filter(sceneIndex => {
      const melody = room.melodies[sceneIndex];
      return melody?.grid && countSimpleNotes(melody.grid) >= 3;
    }).length;
  }, [room?.melodies, myScenes]);

  const partnerCompletedCount = useMemo(() => {
    if (!room?.melodies) return 0;
    let count = 0;
    for (let i = 0; i < totalScenes; i++) {
      if (!myScenes.includes(i)) {
        const melody = room.melodies[i];
        if (melody?.grid && countSimpleNotes(melody.grid) >= 3) {
          count++;
        }
      }
    }
    return count;
  }, [room?.melodies, myScenes]);

  const allMyScenesDone = myCompletedCount === myScenes.length;
  const imReady = room?.readyPlayers?.includes(playerIndex);
  const requiredPlayers = mode === 'trio' ? 3 : (mode === 'partner' ? 2 : 1);
  const allReady = room?.readyPlayers?.length >= requiredPlayers;

  // ============================================
  // Save to Join Page
  // ============================================

  const saveToJoinPage = useCallback(() => {
    if (!roomCode || !room) return false;

    const melodyCount = room.melodies ? Object.keys(room.melodies).filter(k => room.melodies[k]?.grid).length : 0;
    const modeLabel = MODES[mode]?.label || 'Solo';

    saveStudentWork('melody-mystery', {
      title: 'Mystery Melody',
      emoji: '',
      viewRoute: `/join?loadMelodyMystery=${roomCode}`,
      subtitle: `${melodyCount} melodies | ${modeLabel} | Player ${playerIndex + 1}`,
      category: 'Lesson 5 - Game On',
      data: {
        shareCode: roomCode,
        concept: conceptId,
        ending,
        mode,
        melodies: room.melodies,
        playerIndex,
        phase: 'creating',
        createdAt: room.createdAt || Date.now()
      }
    });

    setIsSaved(true);
    return true;
  }, [roomCode, room, mode, playerIndex, conceptId, ending]);

  // Auto-save when session ends or stage changes
  useEffect(() => {
    const isEnded = currentStage === 'ended';
    const stageChanged = currentStage && prevStageRef.current && currentStage !== prevStageRef.current;

    if ((isEnded || stageChanged) && roomCode && room) {
      console.log('🎵 Auto-saving Melody Mystery Collab (stage change or end)');
      saveToJoinPage();
    }

    prevStageRef.current = currentStage;
  }, [currentStage, roomCode, room, saveToJoinPage]);

  // ============================================
  // Local-first saving for Chromebook reliability
  // ============================================

  const savePendingToLocal = useCallback((sceneIndex, grid, device) => {
    const pending = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    pending[`${roomCode}-${sceneIndex}`] = { grid, device, playerIndex, timestamp: Date.now() };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pending));
  }, [roomCode, playerIndex]);

  const clearPendingFromLocal = useCallback((sceneIndex) => {
    const pending = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    delete pending[`${roomCode}-${sceneIndex}`];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pending));
  }, [roomCode]);

  const syncPendingChanges = useCallback(async () => {
    const pending = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    for (const key of Object.keys(pending)) {
      if (key.startsWith(`${roomCode}-`)) {
        const sceneIndex = parseInt(key.split('-').pop());
        const { grid, device, playerIndex: pIdx } = pending[key];
        try {
          await fetch(`${API_BASE_URL}/api/melody-rooms/${roomCode}/melody/${sceneIndex}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grid, device, playerIndex: pIdx })
          });
          clearPendingFromLocal(sceneIndex);
        } catch (e) {
          console.log('Still offline, will retry later');
        }
      }
    }
  }, [roomCode, clearPendingFromLocal]);

  // ============================================
  // Online/Offline handling
  // ============================================

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingChanges();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingChanges]);

  // ============================================
  // Fetch room data (with polling)
  // ============================================

  const fetchRoom = useCallback(async () => {
    if (!isOnline) return;

    try {
      setIsSyncing(true);
      const response = await fetch(`${API_BASE_URL}/api/melody-rooms/${roomCode}`);
      if (response.ok) {
        const data = await response.json();
        setRoom(data);

        // Check if room is complete
        if (data.status === 'ready') {
          sounds.escape();
          // Convert melodies object to array format for onComplete
          const melodiesArray = locations.map((loc, i) => ({
            locationId: loc.id,
            locationName: loc.name,
            grid: data.melodies?.[i]?.grid || createEmptySimpleGrid(),
            contour: data.melodies?.[i]?.grid ? getSimpleContour(data.melodies[i].grid) : [],
            selectedDevice: data.melodies?.[i]?.device || loc.selectableDevices?.[0] || null
          }));
          onComplete?.(melodiesArray);
        }
      }
    } catch (error) {
      console.error('Failed to fetch room:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [roomCode, isOnline, onComplete, locations]);

  // Initial fetch and audio init
  useEffect(() => {
    initMelodySynth();
    fetchRoom();
  }, [fetchRoom]);

  // Polling - stop when room is complete
  useEffect(() => {
    if (room?.status === 'ready') return;

    const interval = setInterval(fetchRoom, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRoom, room?.status]);

  // ============================================
  // Save melody (local-first)
  // ============================================

  const saveMelody = async (sceneIndex, grid, device) => {
    // 1. Save to localStorage FIRST (instant, works offline)
    savePendingToLocal(sceneIndex, grid, device);

    // 2. Update local state immediately
    setRoom(prev => ({
      ...prev,
      melodies: {
        ...prev?.melodies,
        [sceneIndex]: {
          grid,
          device,
          createdBy: playerIndex,
          completedAt: new Date().toISOString()
        }
      }
    }));

    // 3. Try to sync to server
    if (isOnline) {
      try {
        await fetch(`${API_BASE_URL}/api/melody-rooms/${roomCode}/melody/${sceneIndex}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grid, device, playerIndex })
        });
        clearPendingFromLocal(sceneIndex);
      } catch (error) {
        console.log('Will sync when back online');
      }
    }

    sounds.unlock();
    setEditingScene(null);
  };

  // ============================================
  // Mark active scene (so partner sees you're editing)
  // ============================================

  const setActiveScene = async (sceneIndex) => {
    if (!isOnline) return;
    try {
      await fetch(`${API_BASE_URL}/api/melody-rooms/${roomCode}/active-scene`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIndex, sceneIndex })
      });
    } catch (e) {
      // Non-critical, ignore
    }
  };

  // ============================================
  // Mark ready
  // ============================================

  const handleReady = async () => {
    sounds.click();
    try {
      await fetch(`${API_BASE_URL}/api/melody-rooms/${roomCode}/ready`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIndex })
      });
      fetchRoom();
    } catch (error) {
      console.error('Failed to mark ready:', error);
    }
  };

  // ============================================
  // Open scene for editing
  // ============================================

  const handleSceneClick = (sceneIndex) => {
    if (!myScenes.includes(sceneIndex)) return;

    const location = locations[sceneIndex];

    // Load existing melody or create empty
    if (room?.melodies?.[sceneIndex]?.grid) {
      setCurrentGrid(room.melodies[sceneIndex].grid);
      setCurrentDevice(room.melodies[sceneIndex].device || location?.selectableDevices?.[0] || null);
    } else {
      setCurrentGrid(createEmptySimpleGrid());
      setCurrentDevice(location?.selectableDevices?.[0] || null);
    }

    setEditingScene(sceneIndex);
    setActiveScene(sceneIndex);
  };

  const handleSaveAndClose = () => {
    if (editingScene !== null) {
      // Check if melody has at least 3 notes
      const noteCount = countSimpleNotes(currentGrid);
      if (noteCount < 3) {
        sounds.wrongGuess();
        return;
      }
      saveMelody(editingScene, currentGrid, currentDevice);
      setActiveScene(null);
    }
  };

  const handleCancel = () => {
    setEditingScene(null);
    setActiveScene(null);
    setCurrentBeat(-1);
    playingRef.current = false;
  };

  const handlePreview = async () => {
    if (isPlaying) {
      playingRef.current = false;
      setIsPlaying(false);
      setCurrentBeat(-1);
      return;
    }

    setIsPlaying(true);
    playingRef.current = true;

    await playSimpleGrid(currentGrid, 120, (beat) => {
      if (playingRef.current) {
        setCurrentBeat(beat);
      }
    });

    setIsPlaying(false);
    setCurrentBeat(-1);
    playingRef.current = false;
  };

  const handleGridToggle = (newGrid) => {
    setCurrentGrid(newGrid);
  };

  const handleClearGrid = () => {
    setCurrentGrid(createEmptySimpleGrid());
  };

  // ============================================
  // Render
  // ============================================

  const noteCount = countSimpleNotes(currentGrid);

  // If editing a scene, show the editor modal
  if (editingScene !== null) {
    const location = locations[editingScene];
    const selectableDevices = location?.selectableDevices || [];
    const sceneImage = getSceneImage(conceptId, location?.id, location?.nameSlug);

    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(30, 27, 75, 0.85), rgba(30, 27, 75, 0.9)), url(${sceneImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="fixed inset-0 bg-black/30 pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-gray-800/50 rounded-lg px-3 py-2"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin size={20} style={{ color: concept?.colors?.accent }} />
              Scene {editingScene + 1}: {location?.name}
            </h2>
            <div className="w-20" /> {/* Spacer */}
          </div>

          {/* Main content - side by side */}
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* LEFT: Device Picker */}
            <div className="w-1/2 bg-gray-800/80 rounded-2xl p-4 flex flex-col">
              <h3 className="text-lg font-bold text-white text-center mb-4">
                Hide Signal In:
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                  {selectableDevices.map((device) => {
                    const deviceImagePath = getDeviceImage(conceptId, location.id, device.letter, device.id);
                    return (
                      <div key={device.id} className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => setCurrentDevice(device)}
                          className={`w-full aspect-square rounded-xl overflow-hidden border-4 transition-all ${
                            currentDevice?.id === device.id
                              ? 'border-amber-400 ring-2 ring-amber-400 scale-105 shadow-lg shadow-amber-500/30'
                              : 'border-slate-600 hover:border-slate-400'
                          }`}
                        >
                          <img
                            src={deviceImagePath}
                            alt={device.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        <span className={`text-xs text-center font-medium ${
                          currentDevice?.id === device.id ? 'text-amber-400' : 'text-gray-400'
                        }`}>
                          {device.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: Melody Grid */}
            <div className="w-1/2 bg-gray-800/80 rounded-2xl p-4 flex flex-col">
              <h3 className="text-lg font-bold text-white text-center mb-4">
                Make Signal Melody
              </h3>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-xs">
                  <SimpleMelodyGrid
                    grid={currentGrid}
                    onToggle={handleGridToggle}
                    disabled={false}
                    currentBeat={isPlaying ? currentBeat : -1}
                  />
                </div>

                {/* Note count */}
                <div className={`text-center mt-4 text-sm ${noteCount < 3 ? 'text-orange-400' : 'text-green-400'}`}>
                  {noteCount} / 3 minimum notes
                  {noteCount < 3 && (
                    <span className="block text-red-400 text-xs mt-1">
                      Add at least 3 notes!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="flex gap-3 mt-4 justify-center">
            <button
              onClick={handleClearGrid}
              className="px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl text-white font-semibold transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handlePreview}
              className={`px-6 py-3 rounded-xl text-white font-semibold transition-colors ${
                isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'
              }`}
            >
              {isPlaying ? 'Stop' : 'Preview'}
            </button>
            <button
              onClick={handleSaveAndClose}
              disabled={noteCount < 3}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors"
            >
              Save Melody
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main collaborative grid view
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${concept?.colors?.background || '#1e1b4b'} 0%, #1a1a2e 50%, #16213e 100%)`
      }}
    >
      {/* Connection Status Bar */}
      {!isOnline && (
        <div className="relative z-20 bg-yellow-500 text-black text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
          <WifiOff size={16} />
          Offline - your work is saved locally
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-1 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-gray-800/50 rounded-lg px-3 py-2"
            >
              <ArrowLeft size={18} />
              Exit
            </button>
            <button
              onClick={saveToJoinPage}
              className={`flex items-center gap-2 transition-colors rounded-lg px-3 py-2 ${
                isSaved
                  ? 'bg-green-600/50 text-green-300'
                  : 'bg-blue-600/50 hover:bg-blue-500/50 text-white'
              }`}
            >
              {isSaved ? <Check size={18} /> : <Save size={18} />}
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">
              Create Your Melodies
            </h1>
            <div className="text-white/70 text-sm flex items-center justify-center gap-2">
              <span>Player {playerIndex + 1}</span>
              <span className="text-white/40">•</span>
              <span>{endingData?.name}</span>
              {isSyncing && <Loader size={14} className="animate-spin" />}
            </div>
          </div>

          {/* Room Code */}
          <div className="bg-gray-800/80 rounded-xl px-4 py-2 text-right">
            <div className="text-white/60 text-xs">Room</div>
            <div className="text-2xl font-bold text-white font-mono tracking-widest">{roomCode}</div>
          </div>
        </div>

        {/* Scene Grid - 2x3 for 6 scenes */}
        <div className="flex-1 flex flex-col items-center justify-center pb-48">
          <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
            {locations.map((location, sceneIndex) => {
              const isMyScene = myScenes.includes(sceneIndex);
              const melody = room?.melodies?.[sceneIndex];
              const isComplete = melody?.grid && countSimpleNotes(melody.grid) >= 3;
              const partnerEditing = room?.activeScenes &&
                Object.entries(room.activeScenes).some(
                  ([idx, scene]) => parseInt(idx) !== playerIndex && scene === sceneIndex
                );
              const sceneImage = getSceneImage(conceptId, location.id, location.nameSlug);

              return (
                <button
                  key={sceneIndex}
                  onClick={() => handleSceneClick(sceneIndex)}
                  disabled={!isMyScene}
                  className={`
                    rounded-xl overflow-hidden flex flex-col
                    transition-all touch-manipulation border-3
                    ${isMyScene
                      ? isComplete
                        ? 'cursor-pointer border-green-400 hover:scale-105'
                        : 'cursor-pointer hover:scale-105 border-purple-400'
                      : isComplete
                        ? 'cursor-not-allowed border-green-600/50'
                        : partnerEditing
                          ? 'cursor-not-allowed border-yellow-500/50'
                          : 'cursor-not-allowed border-gray-600/50'
                    }
                  `}
                  style={{ borderWidth: '3px' }}
                >
                  {/* Scene image */}
                  <div
                    className="h-24 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${sceneImage})` }}
                  >
                    <div className={`absolute inset-0 ${
                      isMyScene
                        ? isComplete ? 'bg-green-600/40' : 'bg-purple-600/40'
                        : isComplete ? 'bg-green-800/60' : 'bg-gray-800/60'
                    }`} />

                    {/* Status icon */}
                    <div className="absolute top-2 right-2">
                      {isComplete ? (
                        <div className="bg-green-500 rounded-full p-1">
                          <Check size={16} className="text-white" />
                        </div>
                      ) : partnerEditing ? (
                        <div className="bg-yellow-500 rounded-full p-1">
                          <Loader size={16} className="text-white animate-spin" />
                        </div>
                      ) : isMyScene ? (
                        <div className="bg-purple-500 rounded-full p-1">
                          <Edit3 size={16} className="text-white" />
                        </div>
                      ) : (
                        <div className="bg-gray-600 rounded-full p-1">
                          <Lock size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scene info */}
                  <div className={`p-3 text-left ${
                    isMyScene
                      ? isComplete ? 'bg-green-600/80' : 'bg-purple-600/80'
                      : isComplete ? 'bg-green-800/40' : 'bg-gray-700/40'
                  }`}>
                    <div className="text-white font-bold text-sm">
                      Scene {sceneIndex + 1}
                    </div>
                    <div className="text-white/80 text-xs truncate">
                      {location.name}
                    </div>
                    <div className="text-white/60 text-xs mt-1 flex items-center gap-1">
                      {isComplete ? (
                        <>
                          <Music size={12} />
                          Done
                        </>
                      ) : partnerEditing ? (
                        <>
                          <Loader size={12} className={`${!isChromebook ? 'animate-spin' : ''}`} />
                          Partner...
                        </>
                      ) : isMyScene ? (
                        <>
                          <Edit3 size={12} />
                          Tap to edit
                        </>
                      ) : (
                        <>
                          <Lock size={12} />
                          Partner's
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fixed Bottom Progress Section */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/80 to-transparent p-4 pt-8">
          <div className="max-w-md mx-auto">
            {/* Progress Stats */}
            <div className="bg-gray-800/90 rounded-xl p-4 mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white">
                  You: {myCompletedCount}/{myScenes.length}
                  {myCompletedCount === myScenes.length && ' ✓'}
                </span>
                <span className="text-white/70">
                  Partner: {partnerCompletedCount}/{totalScenes - myScenes.length}
                  {partnerCompletedCount === (totalScenes - myScenes.length) && ' ✓'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-purple-500 to-green-500 ${!isChromebook ? 'transition-all duration-500' : ''}`}
                  style={{ width: `${((myCompletedCount + partnerCompletedCount) / totalScenes) * 100}%` }}
                />
              </div>
            </div>

            {/* Ready Button / Status */}
            {allReady ? (
              <div className="bg-green-600 rounded-xl p-4 text-center">
                <div className="text-white font-bold text-lg">
                  Room Complete! Ready to play
                </div>
              </div>
            ) : imReady ? (
              <div className="bg-blue-600/50 rounded-xl p-4 text-center flex items-center justify-center gap-3">
                <Loader className={`text-white ${!isChromebook ? 'animate-spin' : ''}`} size={20} />
                <div className="text-white font-semibold">
                  You're ready! Waiting for partner...
                </div>
              </div>
            ) : allMyScenesDone ? (
              <button
                onClick={handleReady}
                className={`w-full bg-green-600 hover:bg-green-500 rounded-xl p-4 text-white font-bold text-lg ${!isChromebook ? 'transition-all hover:scale-105' : ''}`}
              >
                ✓ I'M READY
              </button>
            ) : (
              <div className="bg-gray-700/50 rounded-xl p-4 text-center text-white/50">
                Finish your {myScenes.length - myCompletedCount} remaining scene{myScenes.length - myCompletedCount !== 1 ? 's' : ''} to continue
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MelodyMysteryCollabCreator;
