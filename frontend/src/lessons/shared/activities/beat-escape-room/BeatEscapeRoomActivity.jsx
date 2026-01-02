// BeatEscapeRoomActivity.jsx - Main orchestrator
// Manages flow between Setup → Create → Share → Play → Results
// Supports saving to Join page for Chromebook compatibility

import React, { useState, useEffect, useCallback, useRef } from 'react';
import BeatEscapeRoomSetup from './BeatEscapeRoomSetup';
import BeatEscapeRoomCreator from './BeatEscapeRoomCreator';
import BeatEscapeRoomCollabCreator from './BeatEscapeRoomCollabCreator';
import BeatEscapeRoomPlayer from './BeatEscapeRoomPlayer';
import BeatEscapeRoomResults from './BeatEscapeRoomResults';
import {
  saveRoom,
  loadRoom,
  initDrumSynths,
  disposeSynths,
  MODES
} from './beatEscapeRoomConfig';
import { THEMES, getThemeAssets } from './beatEscapeRoomThemes';
import { saveStudentWork, loadStudentWork } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';
import { Copy, Check, ArrowRight, Save } from 'lucide-react';

// Activity phases
const PHASES = {
  SETUP: 'setup',
  CREATE: 'create',
  SHARE: 'share',      // Show code after creating
  PLAY: 'play',
  RESULTS: 'results'
};

const BeatEscapeRoomActivity = ({ onComplete, viewMode, isSessionMode }) => {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [mode, setMode] = useState(null);           // 'solo' | 'partner' | 'trio'
  const [themeId, setThemeId] = useState('space-station');
  const [playerIndex, setPlayerIndex] = useState(0);
  const [roomData, setRoomData] = useState(null);
  const [shareCode, setShareCode] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Get session context for auto-save on session end
  const { sessionData, currentStage } = useSession() || {};
  const prevStageRef = useRef(currentStage);

  // Initialize audio on mount
  useEffect(() => {
    initDrumSynths();
    return () => disposeSynths();
  }, []);

  // Save to Join page function
  const saveToJoinPage = useCallback(() => {
    if (!shareCode || !roomData) {
      setSaveMessage({ type: 'error', text: 'Nothing to save yet!' });
      setTimeout(() => setSaveMessage(null), 3000);
      return false;
    }

    const lockCount = roomData.patterns ? Object.keys(roomData.patterns).length : 0;
    const modeLabel = MODES[roomData.mode]?.label || 'Solo';

    saveStudentWork('beat-escape-room', {
      title: `Beat Escape Room`,
      emoji: '',
      viewRoute: `/join?loadRoom=${shareCode}`,
      subtitle: `${lockCount} locks | ${modeLabel} | ${finalScore > 0 ? `Score: ${finalScore}` : 'Ready to play'}`,
      category: 'Film Music Project',
      data: {
        shareCode,
        mode: roomData.mode,
        patterns: roomData.patterns,
        score: finalScore,
        phase,
        createdAt: roomData.createdAt || Date.now()
      }
    });

    setIsSaved(true);
    setSaveMessage({ type: 'success', text: 'Saved to your work!' });
    setTimeout(() => setSaveMessage(null), 3000);
    return true;
  }, [shareCode, roomData, finalScore, phase]);

  // Auto-save when session ends or teacher moves to next stage
  useEffect(() => {
    const isEnded = currentStage === 'ended';
    const stageChanged = currentStage && prevStageRef.current && currentStage !== prevStageRef.current;

    if ((isEnded || stageChanged) && shareCode && roomData) {
      console.log('🎮 Auto-saving Beat Escape Room (stage change or end)');
      saveToJoinPage();
    }

    prevStageRef.current = currentStage;
  }, [currentStage, shareCode, roomData, saveToJoinPage]);

  // Don't auto-load saved progress - let user choose from saved rooms on landing page
  // Saved rooms are now shown in BeatEscapeRoomSetup

  // Handle starting CREATE mode
  const handleStartCreate = ({ mode: selectedMode, themeId: selectedTheme, playerIndex: pIndex = 0, shareCode: preGeneratedCode = null }) => {
    setMode(selectedMode);
    setThemeId(selectedTheme || 'space-station');
    setPlayerIndex(pIndex);
    // Use pre-generated code for partner mode
    if (preGeneratedCode) {
      setShareCode(preGeneratedCode);
    }
    setPhase(PHASES.CREATE);
  };

  // Handle joining existing room to PLAY
  const handleJoinRoom = async (code) => {
    const room = await loadRoom(code);
    if (room) {
      setRoomData(room);
      setShareCode(code);
      setThemeId(room.theme || 'space-station');
      setPhase(PHASES.PLAY);
    } else {
      alert('Room not found! Check the code and try again.');
    }
  };

  // Handle joining existing room to ADD LOCKS (partner mode)
  const handleJoinToCreate = async (code, selectedMode) => {
    const room = await loadRoom(code);
    if (room) {
      // Joiner is always Player 1 (or higher for trio)
      // The creator is Player 0, so anyone joining is at least Player 1
      const modeConfig = MODES[room.mode || selectedMode];
      const locksPerPerson = modeConfig?.perPerson || 5;

      // Count how many players have contributed locks
      const playersThatHaveContributed = new Set();
      Object.values(room.patterns || {}).forEach(p => {
        if (p.createdBy !== undefined) {
          playersThatHaveContributed.add(p.createdBy);
        }
      });

      // If no one has contributed yet, joiner is Player 1
      // If Player 0 has contributed, joiner is Player 1
      // If Players 0 and 1 have contributed, joiner is Player 2 (trio mode)
      let pIndex = 1; // Default: joiner is Player 1
      if (room.mode === 'trio') {
        if (playersThatHaveContributed.has(1)) {
          pIndex = 2; // Player 1 already joined, so this is Player 2
        }
      }

      setRoomData(room);
      setShareCode(code);
      setMode(room.mode || selectedMode);
      setThemeId(room.theme || 'space-station');
      setPlayerIndex(pIndex);
      setPhase(PHASES.CREATE);
    } else {
      alert('Room not found! Check the code and try again.');
    }
  };

  // Handle playing a saved room directly
  const handlePlaySavedRoom = async (savedRoom) => {
    const room = await loadRoom(savedRoom.data.shareCode);
    if (room) {
      setRoomData(room);
      setShareCode(savedRoom.data.shareCode);
      setMode(room.mode);
      setThemeId(room.theme || 'space-station');
      setFinalScore(savedRoom.data.score || 0);
      setPhase(PHASES.PLAY);
    } else {
      alert('Room not found on server. It may have expired.');
    }
  };

  // Handle sharing a saved room (go to share screen)
  const handleShareSavedRoom = async (savedRoom) => {
    const room = await loadRoom(savedRoom.data.shareCode);
    if (room) {
      setRoomData(room);
      setShareCode(savedRoom.data.shareCode);
      setMode(room.mode);
      setThemeId(room.theme || 'space-station');
      setFinalScore(savedRoom.data.score || 0);
      setIsSaved(true);
      setPhase(PHASES.SHARE);
    } else {
      alert('Room not found on server. It may have expired.');
    }
  };

  // Handle completing CREATE phase
  const handleCreateComplete = async (newPatterns) => {
    // If we have existing room data, merge the patterns
    const mergedPatterns = roomData?.patterns
      ? { ...roomData.patterns, ...newPatterns }
      : newPatterns;

    // Save room with the share code (uses existing code if available)
    const roomInfo = {
      mode,
      patterns: mergedPatterns,
      creatorIndex: playerIndex,
      theme: themeId
    };

    // Save room - pass existing shareCode if we have one
    const code = await saveRoom(roomInfo, shareCode);
    setShareCode(code);

    // Load the saved room data for playing
    const savedRoom = await loadRoom(code);
    setRoomData(savedRoom);

    // Auto-save to Join page
    const lockCount = mergedPatterns ? Object.keys(mergedPatterns).length : 0;
    const modeLabel = MODES[mode]?.label || 'Solo';

    saveStudentWork('beat-escape-room', {
      title: `Beat Escape Room`,
      emoji: '',
      viewRoute: `/join?loadRoom=${code}`,
      subtitle: `${lockCount} locks | ${modeLabel} | Ready to play`,
      category: 'Film Music Project',
      data: {
        shareCode: code,
        mode,
        patterns: mergedPatterns,
        score: 0,
        phase: 'share',
        createdAt: Date.now()
      }
    });
    setIsSaved(true);
    setSaveMessage({ type: 'success', text: '✅ Saved to Join page!' });
    setTimeout(() => setSaveMessage(null), 4000);

    // Go to share screen
    setPhase(PHASES.SHARE);
  };

  // Handle starting play after sharing
  const handleStartPlay = () => {
    setPhase(PHASES.PLAY);
  };

  // Handle completing PLAY phase
  const handlePlayComplete = (score) => {
    setFinalScore(score);
    setPhase(PHASES.RESULTS);

    // Auto-save with final score
    if (shareCode && roomData) {
      const lockCount = roomData.patterns ? Object.keys(roomData.patterns).length : 0;
      const modeLabel = MODES[roomData.mode]?.label || 'Solo';

      saveStudentWork('beat-escape-room', {
        title: `Beat Escape Room`,
        emoji: '',
        viewRoute: `/join?loadRoom=${shareCode}`,
        subtitle: `${lockCount} locks | ${modeLabel} | Score: ${score}`,
        category: 'Film Music Project',
        data: {
          shareCode,
          mode: roomData.mode,
          patterns: roomData.patterns,
          score,
          phase: 'results',
          createdAt: roomData.createdAt || Date.now()
        }
      });
      setIsSaved(true);
    }
  };

  // Handle playing again (same room)
  const handlePlayAgain = () => {
    setFinalScore(0);
    setPhase(PHASES.PLAY);
  };

  // Handle creating new room
  const handleCreateNew = () => {
    setMode(null);
    setThemeId('space-station');
    setRoomData(null);
    setShareCode(null);
    setFinalScore(0);
    setIsSaved(false);
    setPhase(PHASES.SETUP);
  };

  // Handle exiting activity
  const handleExit = () => {
    if (onComplete) {
      onComplete({ score: finalScore, completed: phase === PHASES.RESULTS });
    }
  };

  // Handle going back
  const handleBack = () => {
    switch (phase) {
      case PHASES.CREATE:
        setPhase(PHASES.SETUP);
        break;
      case PHASES.SHARE:
        setPhase(PHASES.SETUP);
        break;
      case PHASES.PLAY:
        if (roomData?.creatorIndex === playerIndex) {
          // Own room - go back to share
          setPhase(PHASES.SHARE);
        } else {
          // Joined room - go back to setup
          setPhase(PHASES.SETUP);
        }
        break;
      default:
        setPhase(PHASES.SETUP);
    }
  };

  // Copy share code to clipboard
  const handleCopyCode = async () => {
    if (shareCode) {
      try {
        await navigator.clipboard.writeText(shareCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Render based on current phase
  const renderPhase = () => {
    switch (phase) {
      case PHASES.SETUP:
        return (
          <BeatEscapeRoomSetup
            onStartCreate={handleStartCreate}
            onJoinRoom={handleJoinRoom}
            onJoinToCreate={handleJoinToCreate}
            onPlaySavedRoom={handlePlaySavedRoom}
            onShareSavedRoom={handleShareSavedRoom}
          />
        );

      case PHASES.CREATE:
        // Use collaborative creator for partner/trio modes
        if (mode === 'partner' || mode === 'trio') {
          return (
            <BeatEscapeRoomCollabCreator
              roomCode={shareCode}
              mode={mode}
              themeId={themeId}
              playerIndex={playerIndex}
              onComplete={(completedRoom) => {
                setRoomData(completedRoom);

                // Auto-save to Join page for partner/trio modes
                const lockCount = completedRoom.patterns ? Object.keys(completedRoom.patterns).length : 0;
                const modeLabel = MODES[mode]?.label || 'Partner';

                saveStudentWork('beat-escape-room', {
                  title: `Beat Escape Room`,
                  emoji: '',
                  viewRoute: `/join?loadRoom=${shareCode}`,
                  subtitle: `${lockCount} locks | ${modeLabel} | Ready to play`,
                  category: 'Film Music Project',
                  data: {
                    shareCode,
                    mode,
                    patterns: completedRoom.patterns,
                    score: 0,
                    phase: 'share',
                    createdAt: Date.now()
                  }
                });
                setIsSaved(true);
                setSaveMessage({ type: 'success', text: '✅ Saved to Join page!' });
                setTimeout(() => setSaveMessage(null), 4000);

                setPhase(PHASES.SHARE);
              }}
              onBack={handleBack}
            />
          );
        }

        // Solo mode uses the original creator
        return (
          <BeatEscapeRoomCreator
            mode={mode}
            themeId={themeId}
            playerIndex={playerIndex}
            shareCode={shareCode}
            onComplete={handleCreateComplete}
            onBack={handleBack}
          />
        );

      case PHASES.SHARE:
        const shareAssets = getThemeAssets(themeId);
        return (
          <div
            className="min-h-screen flex flex-col items-center justify-center p-6 relative"
            style={{
              backgroundImage: `url(${shareAssets.bgShare})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            <div className="text-center mb-8 relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                Your Escape Room is Ready!
              </h1>
              <p className="text-purple-200 text-lg">
                Have players join with this code:
              </p>
            </div>

            <div className="bg-gray-800/90 rounded-2xl p-8 w-full max-w-md mb-8 relative z-10">
              {/* Share Code Display */}
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm mb-2">Your Room Code:</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-gray-900 px-6 py-4 rounded-xl text-4xl font-mono font-bold text-white tracking-widest">
                    {shareCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="text-green-400" size={24} />
                    ) : (
                      <Copy className="text-gray-300" size={24} />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-400 text-sm mt-2">
                    Copied to clipboard!
                  </p>
                )}
              </div>

              {/* Room Info */}
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Theme:</span>
                  <span className="text-white font-semibold">
                    {THEMES[themeId]?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Mode:</span>
                  <span className="text-white font-semibold">{MODES[mode]?.label}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Locks Created:</span>
                  <span className="text-white font-semibold">
                    {roomData ? Object.keys(roomData.patterns).length : 0}
                  </span>
                </div>
              </div>

              {/* Save Message - Prominent notification */}
              {saveMessage && (
                <div className={`text-center mb-4 px-6 py-4 rounded-xl text-lg font-bold animate-pulse ${
                  saveMessage.type === 'success'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/50'
                    : 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                }`}>
                  {saveMessage.text}
                </div>
              )}

              {/* Saved Indicator */}
              {isSaved && !saveMessage && (
                <div className="text-center mb-4 text-green-400 text-sm flex items-center justify-center gap-2">
                  <Check size={16} />
                  Saved to your work
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={saveToJoinPage}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={handleStartPlay}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Play
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-700/80 hover:bg-gray-600 rounded-lg text-white transition-colors relative z-10"
            >
              ← Start Over
            </button>
          </div>
        );

      case PHASES.PLAY:
        return (
          <BeatEscapeRoomPlayer
            roomData={roomData}
            onComplete={handlePlayComplete}
            onBack={handleBack}
          />
        );

      case PHASES.RESULTS:
        return (
          <BeatEscapeRoomResults
            score={finalScore}
            totalLocks={roomData ? Object.keys(roomData.patterns).length : 0}
            roomCode={shareCode}
            mode={mode}
            themeId={themeId}
            onPlayAgain={handlePlayAgain}
            onCreateNew={handleCreateNew}
            onExit={handleExit}
            onSave={saveToJoinPage}
            isSaved={isSaved}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="beat-escape-room-activity">
      {renderPhase()}
    </div>
  );
};

export default BeatEscapeRoomActivity;
