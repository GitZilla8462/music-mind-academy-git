// BeatEscapeRoomCollabCreator.jsx - Collaborative lock creation
// Both partners work simultaneously, seeing each other's progress in real-time
// Chromebook-safe: local-first saving, offline support, big touch targets

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Check, Lock, Loader, Edit3, WifiOff, ArrowLeft, Save } from 'lucide-react';
import BeatGrid from './BeatGrid';
import { createEmptyPattern, playPattern, sounds, MODES } from './beatEscapeRoomConfig';
import { getRoomBackground, THEMES } from './beatEscapeRoomThemes';
import { saveStudentWork } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
const POLL_INTERVAL = 3000; // 3 seconds
const LOCAL_STORAGE_KEY = 'beat-escape-room-pending';

const BeatEscapeRoomCollabCreator = ({
  roomCode,
  mode,
  themeId,
  playerIndex,
  onComplete,
  onBack
}) => {
  const [room, setRoom] = useState(null);
  const [editingLock, setEditingLock] = useState(null);
  const [currentPattern, setCurrentPattern] = useState(createEmptyPattern());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { currentStage } = useSession() || {};
  const prevStageRef = useRef(currentStage);
  const theme = THEMES[themeId] || THEMES['space-station'];

  // Get which locks belong to this player (uses MODES config)
  const myLocks = useMemo(() => {
    if (mode === 'partner') {
      // Partner mode: 10 locks total, 5 each
      return playerIndex === 0 ? [1, 3, 5, 7, 9] : [2, 4, 6, 8, 10];
    } else if (mode === 'trio') {
      if (playerIndex === 0) return [1, 4, 7];
      if (playerIndex === 1) return [2, 5, 8];
      return [3, 6, 9];
    }
    return [1, 2, 3, 4, 5, 6]; // solo - all locks
  }, [mode, playerIndex]);

  const totalLocks = MODES[mode]?.totalLocks || 6;

  // Count completed locks
  const myCompletedCount = useMemo(() => {
    if (!room?.patterns) return 0;
    return myLocks.filter(n => room.patterns[n]?.grid).length;
  }, [room?.patterns, myLocks]);

  const partnerCompletedCount = useMemo(() => {
    if (!room?.patterns) return 0;
    let count = 0;
    for (let i = 1; i <= totalLocks; i++) {
      if (!myLocks.includes(i) && room.patterns[i]?.grid) {
        count++;
      }
    }
    return count;
  }, [room?.patterns, myLocks, totalLocks]);

  const allMyLocksDone = myCompletedCount === myLocks.length;
  const imReady = room?.readyPlayers?.includes(playerIndex);
  const requiredPlayers = mode === 'trio' ? 3 : (mode === 'partner' ? 2 : 1);
  const allReady = room?.readyPlayers?.length >= requiredPlayers;

  // ============================================
  // Save to Join Page
  // ============================================

  const saveToJoinPage = useCallback(() => {
    if (!roomCode || !room) return false;

    const lockCount = room.patterns ? Object.keys(room.patterns).length : 0;
    const modeLabel = MODES[mode]?.label || 'Solo';

    saveStudentWork('beat-escape-room', {
      title: `Beat Escape Room`,
      emoji: '',
      viewRoute: `/join?loadRoom=${roomCode}`,
      subtitle: `${lockCount} locks | ${modeLabel} | Player ${playerIndex + 1}`,
      category: 'Film Music Project',
      data: {
        shareCode: roomCode,
        mode,
        patterns: room.patterns,
        playerIndex,
        phase: 'creating',
        createdAt: room.createdAt || Date.now()
      }
    });

    setIsSaved(true);
    return true;
  }, [roomCode, room, mode, playerIndex]);

  // Auto-save when session ends or stage changes
  useEffect(() => {
    const isEnded = currentStage === 'ended';
    const stageChanged = currentStage && prevStageRef.current && currentStage !== prevStageRef.current;

    if ((isEnded || stageChanged) && roomCode && room) {
      console.log('🎮 Auto-saving Beat Escape Room Collab (stage change or end)');
      saveToJoinPage();
    }

    prevStageRef.current = currentStage;
  }, [currentStage, roomCode, room, saveToJoinPage]);

  // ============================================
  // Local-first saving for Chromebook reliability
  // ============================================

  const savePendingToLocal = useCallback((lockNumber, grid) => {
    const pending = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    pending[`${roomCode}-${lockNumber}`] = { grid, playerIndex, timestamp: Date.now() };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pending));
  }, [roomCode, playerIndex]);

  const clearPendingFromLocal = useCallback((lockNumber) => {
    const pending = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    delete pending[`${roomCode}-${lockNumber}`];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pending));
  }, [roomCode]);

  const syncPendingChanges = useCallback(async () => {
    const pending = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    for (const key of Object.keys(pending)) {
      if (key.startsWith(`${roomCode}-`)) {
        const lockNumber = key.split('-').pop();
        const { grid, playerIndex: pIdx } = pending[key];
        try {
          await fetch(`${API_BASE_URL}/api/rooms/${roomCode}/pattern/${lockNumber}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grid, playerIndex: pIdx })
          });
          clearPendingFromLocal(lockNumber);
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
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomCode}`);
      if (response.ok) {
        const data = await response.json();
        setRoom(data);

        // Check if room is complete
        if (data.status === 'ready') {
          sounds.escape();
          onComplete?.(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch room:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [roomCode, isOnline, onComplete]);

  // Initial fetch
  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Polling - stop when room is complete
  useEffect(() => {
    if (room?.status === 'ready') return;

    const interval = setInterval(fetchRoom, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRoom, room?.status]);

  // ============================================
  // Save pattern (local-first)
  // ============================================

  const savePattern = async (lockNumber, pattern) => {
    // Convert pattern to grid format for storage
    const grid = {
      kick: pattern.kick,
      snare: pattern.snare,
      hihat: pattern.hihat
    };

    // 1. Save to localStorage FIRST (instant, works offline)
    savePendingToLocal(lockNumber, grid);

    // 2. Update local state immediately
    setRoom(prev => ({
      ...prev,
      patterns: {
        ...prev?.patterns,
        [lockNumber]: { grid, createdBy: playerIndex, completedAt: new Date() }
      }
    }));

    // 3. Try to sync to server
    if (isOnline) {
      try {
        await fetch(`${API_BASE_URL}/api/rooms/${roomCode}/pattern/${lockNumber}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grid, playerIndex })
        });
        clearPendingFromLocal(lockNumber);
      } catch (error) {
        console.log('Will sync when back online');
      }
    }

    sounds.unlock();
    setEditingLock(null);
  };

  // ============================================
  // Mark active lock (so partner sees you're editing)
  // ============================================

  const setActiveLock = async (lockNumber) => {
    if (!isOnline) return;
    try {
      await fetch(`${API_BASE_URL}/api/rooms/${roomCode}/active-lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIndex, lockNumber })
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
      await fetch(`${API_BASE_URL}/api/rooms/${roomCode}/ready`, {
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
  // Open lock for editing
  // ============================================

  const handleLockClick = (lockNumber) => {
    if (!myLocks.includes(lockNumber)) return;

    // Load existing pattern or create empty
    if (room?.patterns?.[lockNumber]?.grid) {
      const grid = room.patterns[lockNumber].grid;
      setCurrentPattern({
        kick: grid.kick || [false, false, false, false],
        snare: grid.snare || [false, false, false, false],
        hihat: grid.hihat || [false, false, false, false]
      });
    } else {
      setCurrentPattern(createEmptyPattern());
    }

    setEditingLock(lockNumber);
    setActiveLock(lockNumber);
  };

  const handleSaveAndClose = () => {
    if (editingLock) {
      // Check if pattern has at least 3 notes
      const noteCount = Object.values(currentPattern).flat().filter(Boolean).length;
      if (noteCount < 3) {
        sounds.wrongGuess();
        return;
      }
      savePattern(editingLock, currentPattern);
      setActiveLock(null);
    }
  };

  const handleCancel = () => {
    setEditingLock(null);
    setActiveLock(null);
  };

  const handlePreview = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await playPattern(currentPattern);
    setIsPlaying(false);
  };

  const toggleCell = useCallback((instrumentId, beatIndex) => {
    setCurrentPattern(prev => ({
      ...prev,
      [instrumentId]: prev[instrumentId].map((val, i) =>
        i === beatIndex ? !val : val
      )
    }));
  }, []);

  // ============================================
  // Render
  // ============================================

  const completedLocks = room?.patterns ? Object.keys(room.patterns).length : 0;
  const background = getRoomBackground(themeId, completedLocks + 1, totalLocks);
  const noteCount = Object.values(currentPattern).flat().filter(Boolean).length;

  // If editing a lock, show the beat grid editor
  if (editingLock !== null) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="fixed inset-0 bg-black/50 pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-gray-800/95 rounded-2xl p-6 w-full max-w-lg">
            <h2
              className="text-2xl font-bold text-white text-center mb-4"
              style={{ fontFamily: theme.font?.family || "'Orbitron', sans-serif" }}
            >
              Lock {editingLock}
            </h2>

            <div className="flex justify-center mb-4">
              <BeatGrid
                pattern={currentPattern}
                onToggle={toggleCell}
                mode="create"
                showConstraints={true}
                size="large"
                themeId={themeId}
              />
            </div>

            {/* Note count */}
            <div className={`text-center mb-4 text-sm ${noteCount < 3 ? 'text-orange-400' : 'text-green-400'}`}>
              {noteCount} / 3 minimum sounds
              {noteCount < 3 && (
                <span className="block text-red-400 text-xs mt-1">
                  Add at least 3 sounds!
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl text-white font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePreview}
                disabled={isPlaying || noteCount === 0}
                className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 rounded-xl text-white font-semibold transition-colors"
              >
                {isPlaying ? 'Playing...' : 'Preview'}
              </button>
              <button
                onClick={handleSaveAndClose}
                disabled={noteCount < 3}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors"
              >
                Save Lock
              </button>
            </div>
          </div>
        </div>

        {/* Font import */}
        <style>{`
          @import url('${theme.font?.import || "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"}');
        `}</style>
      </div>
    );
  }

  // Main collaborative grid view
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="fixed inset-0 bg-black/50 pointer-events-none" />

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
            <h1
              className="text-3xl font-bold text-white"
              style={{ fontFamily: theme.font?.family, letterSpacing: '0.1em' }}
            >
              Create Your Locks
            </h1>
            <div
              className="text-white/70 text-lg flex items-center justify-center gap-2"
              style={{ fontFamily: theme.font?.family }}
            >
              <span>Player {playerIndex + 1}</span>
              {isSyncing && <Loader size={16} className="animate-spin" />}
            </div>
          </div>

          {/* Room Code - Big and on the right */}
          <div className="bg-gray-800/80 rounded-xl px-4 py-2 text-right">
            <div className="text-white/60 text-xs" style={{ fontFamily: theme.font?.family }}>Room</div>
            <div className="text-2xl font-bold text-white font-mono tracking-widest">{roomCode}</div>
          </div>
        </div>

        {/* Lock Grid - Compact layout for Chromebooks (5 columns, 2 rows) */}
        <div className="flex-1 flex flex-col items-center justify-center pb-40 px-2">
          <div className="grid grid-cols-5 gap-3 w-full max-w-3xl">
            {Array.from({ length: totalLocks }, (_, i) => i + 1).map(lockNumber => {
              const isMyLock = myLocks.includes(lockNumber);
              const pattern = room?.patterns?.[lockNumber];
              const isComplete = !!pattern?.grid;
              const partnerEditing = room?.activeLocks &&
                Object.entries(room.activeLocks).some(
                  ([idx, lock]) => parseInt(idx) !== playerIndex && lock === lockNumber
                );

              return (
                <button
                  key={lockNumber}
                  onClick={() => handleLockClick(lockNumber)}
                  disabled={!isMyLock}
                  className={`
                    aspect-square min-h-[90px] max-h-[130px] rounded-xl flex flex-col items-center justify-center
                    transition-all touch-manipulation border-3
                    ${isMyLock
                      ? isComplete
                        ? 'bg-green-600/80 hover:bg-green-500/80 cursor-pointer border-green-400'
                        : 'bg-purple-600/80 hover:bg-purple-500/80 cursor-pointer hover:scale-105 border-purple-400'
                      : isComplete
                        ? 'bg-green-800/40 cursor-not-allowed border-green-600/50'
                        : partnerEditing
                          ? 'bg-yellow-600/40 cursor-not-allowed border-yellow-500/50 animate-pulse'
                          : 'bg-gray-700/40 cursor-not-allowed border-gray-600/50'
                    }
                  `}
                  style={{ fontFamily: theme.font?.family }}
                >
                  <span className="text-xl font-bold text-white">{lockNumber}</span>
                  <span className="text-xs text-white/80 mt-1 flex items-center gap-1">
                    {isComplete ? (
                      <>
                        <Check size={12} />
                        Done
                      </>
                    ) : partnerEditing ? (
                      <>
                        <Loader size={12} className="animate-spin" />
                        ...
                      </>
                    ) : isMyLock ? (
                      <>
                        <Edit3 size={12} />
                        Edit
                      </>
                    ) : (
                      <>
                        <Lock size={12} />
                      </>
                    )}
                  </span>
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
              <div className="flex justify-between text-sm mb-2" style={{ fontFamily: theme.font?.family }}>
                <span className="text-white">
                  You: {myCompletedCount}/{myLocks.length}
                  {myCompletedCount === myLocks.length && ' ✓'}
                </span>
                <span className="text-white/70">
                  Partner: {partnerCompletedCount}/{totalLocks - myLocks.length}
                  {partnerCompletedCount === (totalLocks - myLocks.length) && ' ✓'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-500"
                  style={{ width: `${((myCompletedCount + partnerCompletedCount) / totalLocks) * 100}%` }}
                />
              </div>
            </div>

            {/* Ready Button / Status */}
            {allReady ? (
              <div className="bg-green-600 rounded-xl p-4 text-center">
                <div className="text-white font-bold text-lg" style={{ fontFamily: theme.font?.family }}>
                  Room Complete! Ready to play
                </div>
              </div>
            ) : imReady ? (
              <div className="bg-blue-600/50 rounded-xl p-4 text-center flex items-center justify-center gap-3">
                <Loader className="animate-spin text-white" size={20} />
                <div className="text-white font-semibold" style={{ fontFamily: theme.font?.family }}>
                  You're ready! Waiting for partner...
                </div>
              </div>
            ) : allMyLocksDone ? (
              <button
                onClick={handleReady}
                className="w-full bg-green-600 hover:bg-green-500 rounded-xl p-4 text-white font-bold text-lg transition-all hover:scale-105"
                style={{ fontFamily: theme.font?.family }}
              >
                ✓ I'M READY
              </button>
            ) : (
              <div
                className="bg-gray-700/50 rounded-xl p-4 text-center text-white/50"
                style={{ fontFamily: theme.font?.family }}
              >
                Finish your {myLocks.length - myCompletedCount} remaining lock{myLocks.length - myCompletedCount !== 1 ? 's' : ''} to continue
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Font import */}
      <style>{`
        @import url('${theme.font?.import || "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"}');
      `}</style>
    </div>
  );
};

export default BeatEscapeRoomCollabCreator;
