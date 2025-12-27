// File: /lessons/shared/activities/melody-mystery/MelodyMysteryActivity.jsx
// Mystery Melody: The Vanishing Composer
// Main orchestrator - manages flow between Setup → Create → Share → Solve → Results

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MelodyMysterySetup from './MelodyMysterySetup';
import MelodyMysteryCreator from './MelodyMysteryCreator';
import MelodyMysteryCollabCreator from './MelodyMysteryCollabCreator';
import MelodyMysterySolver from './MelodyMysterySolver';
import MelodyMysteryResults from './MelodyMysteryResults';
import {
  saveRoom,
  loadRoom,
  initMelodySynth,
  disposeSynth,
  MODES
} from './melodyMysteryConfig';
import {
  getConcept,
  getEnding,
  getConceptAssets
} from './melodyMysteryConcepts';
import { saveStudentWork } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';
import { Copy, Check, ArrowRight, Save } from 'lucide-react';

const PHASES = {
  SETUP: 'setup',
  CREATE: 'create',
  SHARE: 'share',
  SOLVE: 'solve',
  RESULTS: 'results'
};

const MelodyMysteryActivity = ({ onComplete, viewMode, isSessionMode, initialLoadCode }) => {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [selectedConcept, setSelectedConcept] = useState('vanishing-composer');
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedEnding, setSelectedEnding] = useState(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [mysteryData, setMysteryData] = useState(null);
  const [shareCode, setShareCode] = useState(null);
  const [solveResults, setSolveResults] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [resetKey, setResetKey] = useState(0); // Forces component remount on reset
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);

  const { sessionData, currentStage } = useSession() || {};
  const prevStageRef = useRef(currentStage);

  // Initialize audio on mount
  useEffect(() => {
    initMelodySynth();
    return () => disposeSynth();
  }, []);

  // Auto-load from prop (passed from JoinWithCode)
  useEffect(() => {
    if (initialLoadCode && !autoLoadAttempted) {
      setAutoLoadAttempted(true);
      (async () => {
        const mystery = await loadRoom(initialLoadCode);
        if (mystery) {
          setMysteryData(mystery);
          setShareCode(initialLoadCode);
          setSelectedConcept(mystery.concept || 'vanishing-composer');
          setSelectedMode(mystery.mode || 'solo');
          setSelectedEnding(mystery.ending);
          setPhase(PHASES.SOLVE);
        } else {
          console.error('Failed to load mystery room:', initialLoadCode);
        }
      })();
    }
  }, [initialLoadCode, autoLoadAttempted]);

  // Save to Join page function
  const saveToJoinPage = useCallback(() => {
    if (!shareCode || !mysteryData) {
      setSaveMessage({ type: 'error', text: 'Nothing to save yet!' });
      setTimeout(() => setSaveMessage(null), 3000);
      return false;
    }

    const ending = getEnding(selectedConcept, selectedEnding);
    const melodyCount = mysteryData?.melodies ? Object.keys(mysteryData.melodies).length : 0;
    const modeLabel = MODES[selectedMode]?.label || 'Solo';

    saveStudentWork('melody-mystery', {
      title: 'Mystery Melody',
      emoji: '',
      viewRoute: `/join?loadMelodyMystery=${shareCode}`,
      subtitle: `${melodyCount} melodies | ${modeLabel} | ${phase === PHASES.RESULTS ? `Score: ${solveResults?.totalScore || 0}` : 'Ready to play'}`,
      category: 'Lesson 5 - Game On',
      data: {
        shareCode,
        concept: selectedConcept,
        ending: selectedEnding,
        mode: selectedMode,
        melodies: mysteryData?.melodies,
        results: solveResults,
        phase,
        createdAt: mysteryData?.createdAt || Date.now()
      }
    });

    setIsSaved(true);
    setSaveMessage({ type: 'success', text: 'Saved to your work!' });
    setTimeout(() => setSaveMessage(null), 3000);
    return true;
  }, [shareCode, mysteryData, selectedConcept, selectedEnding, selectedMode, solveResults, phase]);

  // Auto-save when session ends or teacher moves to next stage
  useEffect(() => {
    const isEnded = currentStage === 'ended';
    const stageChanged = currentStage && prevStageRef.current && currentStage !== prevStageRef.current;

    if ((isEnded || stageChanged) && shareCode && mysteryData) {
      console.log('Auto-saving Mystery Melody');
      saveToJoinPage();
    }

    prevStageRef.current = currentStage;
  }, [currentStage, shareCode, mysteryData, saveToJoinPage]);

  // Handle starting CREATE mode
  const handleStartCreate = ({ concept, mode, ending, playerIndex: pIndex = 0, shareCode: preGeneratedCode = null }) => {
    setSelectedConcept(concept);
    setSelectedMode(mode);
    setSelectedEnding(ending);
    setPlayerIndex(pIndex);
    if (preGeneratedCode) {
      setShareCode(preGeneratedCode);
    }
    setPhase(PHASES.CREATE);
  };

  // Handle joining room to add melodies (partner mode)
  const handleJoinToCreate = async (code, mode) => {
    const mystery = await loadRoom(code);
    if (mystery) {
      setMysteryData(mystery);
      setShareCode(code);
      setSelectedConcept(mystery.concept || 'vanishing-composer');
      setSelectedMode(mystery.mode || mode);
      setSelectedEnding(mystery.ending);
      setPlayerIndex(1); // Joiner is Player 1
      setPhase(PHASES.CREATE);
    } else {
      alert('Mystery not found! Check the code and try again.');
    }
  };

  // Handle playing a saved room
  const handlePlaySavedRoom = async (savedRoom) => {
    const mystery = await loadRoom(savedRoom.data.shareCode);
    if (mystery) {
      setMysteryData(mystery);
      setShareCode(savedRoom.data.shareCode);
      setSelectedConcept(mystery.concept || 'vanishing-composer');
      setSelectedMode(mystery.mode || 'solo');
      setSelectedEnding(mystery.ending);
      setPhase(PHASES.SOLVE);
    } else {
      alert('Mystery not found. It may have expired.');
    }
  };

  // Handle joining existing mystery to SOLVE
  const handleJoinMystery = async (code) => {
    const mystery = await loadRoom(code);
    if (mystery) {
      setMysteryData(mystery);
      setShareCode(code);
      setSelectedConcept(mystery.concept || 'vanishing-composer');
      setSelectedEnding(mystery.ending);
      setPhase(PHASES.SOLVE);
    } else {
      alert('Mystery not found! Check the code and try again.');
    }
  };

  // Handle completing CREATE phase
  const handleCreateComplete = async (melodies) => {
    const data = {
      concept: selectedConcept,
      ending: selectedEnding,
      mode: selectedMode,
      melodies,
      createdAt: mysteryData?.createdAt || Date.now()
    };

    // For partner mode, use existing code if we have one (when joining)
    const existingCode = selectedMode === 'partner' && shareCode ? shareCode : null;
    const code = await saveRoom(data, existingCode);
    setShareCode(code);
    setMysteryData(data);

    // Auto-save to Join page
    const ending = getEnding(selectedConcept, selectedEnding);
    const isPartnerJoiner = selectedMode === 'partner' && playerIndex === 1;
    const melodyCount = melodies ? Object.keys(melodies).length : 0;
    const modeLabel = MODES[selectedMode]?.label || 'Solo';

    saveStudentWork('melody-mystery', {
      title: 'Mystery Melody',
      emoji: '',
      viewRoute: `/join?loadMelodyMystery=${code}`,
      subtitle: `${melodyCount} melodies | ${modeLabel} | Ready to play`,
      category: 'Lesson 5 - Game On',
      data: {
        shareCode: code,
        concept: selectedConcept,
        ending: selectedEnding,
        mode: selectedMode,
        melodies,
        phase: isPartnerJoiner ? 'solve' : 'share',
        createdAt: data.createdAt
      }
    });
    setIsSaved(true);
    setSaveMessage({ type: 'success', text: 'Saved to Join page!' });
    setTimeout(() => setSaveMessage(null), 4000);

    // Partner joiner goes to solve, first player goes to share
    if (isPartnerJoiner) {
      setPhase(PHASES.SOLVE);
    } else {
      setPhase(PHASES.SHARE);
    }
  };

  // Handle completing collaborative CREATE phase (partner/trio modes)
  // CollabCreator handles saving to server, this just transitions to solve
  const handleCollabComplete = async (melodies) => {
    // Convert melodies array to object format for mysteryData
    const melodiesObj = {};
    melodies.forEach((melody, i) => {
      melodiesObj[i] = {
        grid: melody.grid,
        device: melody.selectedDevice,
        contour: melody.contour
      };
    });

    const data = {
      concept: selectedConcept,
      ending: selectedEnding,
      mode: selectedMode,
      melodies: melodiesObj,
      createdAt: mysteryData?.createdAt || Date.now()
    };

    setMysteryData(data);

    // Auto-save to Join page
    const melodyCount = Object.keys(melodiesObj).length;
    const modeLabel = MODES[selectedMode]?.label || 'Partner';

    saveStudentWork('melody-mystery', {
      title: 'Mystery Melody',
      emoji: '',
      viewRoute: `/join?loadMelodyMystery=${shareCode}`,
      subtitle: `${melodyCount} melodies | ${modeLabel} | Ready to play`,
      category: 'Lesson 5 - Game On',
      data: {
        shareCode,
        concept: selectedConcept,
        ending: selectedEnding,
        mode: selectedMode,
        melodies: melodiesObj,
        phase: 'solve',
        createdAt: data.createdAt
      }
    });
    setIsSaved(true);

    // Go directly to solve (skip share phase for collab mode)
    setPhase(PHASES.SOLVE);
  };

  // Handle starting solve after sharing
  const handleStartSolve = () => {
    setPhase(PHASES.SOLVE);
  };

  // Handle completing SOLVE phase
  const handleSolveComplete = (results) => {
    setSolveResults(results);
    setPhase(PHASES.RESULTS);

    // Auto-save with results
    if (shareCode && mysteryData) {
      const melodyCount = mysteryData?.melodies ? Object.keys(mysteryData.melodies).length : 0;
      const modeLabel = MODES[mysteryData.mode]?.label || 'Solo';

      saveStudentWork('melody-mystery', {
        title: 'Mystery Melody',
        emoji: '',
        viewRoute: `/join?loadMelodyMystery=${shareCode}`,
        subtitle: `${melodyCount} melodies | ${modeLabel} | Score: ${results.totalScore}`,
        category: 'Lesson 5 - Game On',
        data: {
          shareCode,
          concept: selectedConcept,
          ending: selectedEnding,
          mode: selectedMode,
          melodies: mysteryData.melodies,
          results,
          phase: 'results',
          createdAt: mysteryData.createdAt || Date.now()
        }
      });
      setIsSaved(true);
    }
  };

  // Handle playing again
  const handlePlayAgain = () => {
    setSolveResults(null);
    setPhase(PHASES.SOLVE);
  };

  // Handle creating new mystery
  const handleCreateNew = () => {
    setSelectedConcept('vanishing-composer');
    setSelectedMode(null);
    setSelectedEnding(null);
    setPlayerIndex(0);
    setMysteryData(null);
    setShareCode(null);
    setSolveResults(null);
    setIsSaved(false);
    setResetKey(prev => prev + 1); // Force component remount
    setPhase(PHASES.SETUP);
  };

  // Handle going back - reset all state to start fresh
  const handleBack = () => {
    setSelectedConcept('vanishing-composer');
    setSelectedMode(null);
    setSelectedEnding(null);
    setPlayerIndex(0);
    setMysteryData(null);
    setShareCode(null);
    setSolveResults(null);
    setIsSaved(false);
    setResetKey(prev => prev + 1); // Force component remount
    setPhase(PHASES.SETUP);
  };

  // Copy share code
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

  // Render based on phase
  const renderPhase = () => {
    switch (phase) {
      case PHASES.SETUP:
        return (
          <MelodyMysterySetup
            key={`setup-${resetKey}`}
            onStartCreate={handleStartCreate}
            onJoinMystery={handleJoinMystery}
            onJoinToCreate={handleJoinToCreate}
            onPlaySavedRoom={handlePlaySavedRoom}
          />
        );

      case PHASES.CREATE:
        // Use CollabCreator for partner/trio modes, Creator for solo
        const isCollabMode = selectedMode === 'partner' || selectedMode === 'trio';

        if (isCollabMode && shareCode) {
          return (
            <MelodyMysteryCollabCreator
              key={`collab-${resetKey}-${shareCode}`}
              roomCode={shareCode}
              mode={selectedMode}
              conceptId={selectedConcept}
              ending={selectedEnding}
              playerIndex={playerIndex}
              onComplete={handleCollabComplete}
              onBack={handleBack}
            />
          );
        }

        return (
          <MelodyMysteryCreator
            key={`${resetKey}-${shareCode || 'new'}`}
            conceptId={selectedConcept}
            ending={selectedEnding}
            mode={selectedMode}
            playerIndex={playerIndex}
            existingMelodies={mysteryData?.melodies || null}
            onComplete={handleCreateComplete}
            onBack={handleBack}
          />
        );

      case PHASES.SHARE:
        const concept = getConcept(selectedConcept);
        const ending = getEnding(selectedConcept, selectedEnding);
        const shareAssets = getConceptAssets(selectedConcept);
        const melodyCount = mysteryData?.melodies ? Object.keys(mysteryData.melodies).length : 0;

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
                Your Mystery Melody is Ready!
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

              {/* Room Info - matches Beat Escape Room exactly */}
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Theme:</span>
                  <span className="text-white font-semibold">
                    {concept?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Story:</span>
                  <span className="text-white font-semibold">
                    {ending?.icon} {ending?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Mode:</span>
                  <span className="text-white font-semibold">{MODES[selectedMode]?.label}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Melodies Created:</span>
                  <span className="text-white font-semibold">
                    {melodyCount}
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
                  onClick={handleStartSolve}
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

      case PHASES.SOLVE:
        return (
          <MelodyMysterySolver
            mysteryData={mysteryData}
            onComplete={handleSolveComplete}
            onBack={handleBack}
          />
        );

      case PHASES.RESULTS:
        return (
          <MelodyMysteryResults
            results={solveResults}
            conceptId={selectedConcept}
            ending={selectedEnding}
            onPlayAgain={handlePlayAgain}
            onCreateNew={handleCreateNew}
            onSave={saveToJoinPage}
            isSaved={isSaved}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="mystery-melody-activity">
      {renderPhase()}
    </div>
  );
};

export default MelodyMysteryActivity;
