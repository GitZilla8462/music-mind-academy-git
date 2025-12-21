// melody-escape-room/MelodyEscapeRoomActivity.jsx
// Main component for the Melody Escape Room activity
// Optimized for 1366x768 Chromebook screens
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  loopData, categories, instrumentIcons, roomThemes, scoring,
  generateShareCode, saveRoom, loadRoom, getAllLoops, checkAnswer
} from './melodyEscapeRoomConfig';
import { sounds, initAudio } from './melodyEscapeRoomSounds';
import {
  animationStyles, Confetti, Lock, LoopCard, ThemeSelector,
  ShareCodeDisplay, Timer, ScoreDisplay, HintButton, AnswerInput,
  ResultsScreen, Header
} from './MelodyEscapeRoomComponents';

const MelodyEscapeRoomActivity = ({ onComplete }) => {
  // ========== CORE STATE ==========
  const [mode, setMode] = useState(null); // 'creator' | 'solver' | null (menu)
  const [studentId, setStudentId] = useState('');

  // ========== CREATOR MODE STATE ==========
  const [creatorStep, setCreatorStep] = useState(1); // 1: select loops, 2: add hints, 3: choose theme, 4: share code
  const [selectedLoops, setSelectedLoops] = useState([]); // Array of loop objects
  const [loopHints, setLoopHints] = useState({}); // { loopId: hint string }
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [shareCode, setShareCode] = useState('');

  // ========== SOLVER MODE STATE ==========
  const [enteredCode, setEnteredCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [activeLockIndex, setActiveLockIndex] = useState(0);
  const [unlockedLocks, setUnlockedLocks] = useState([]);
  const [listenCounts, setListenCounts] = useState({}); // { lockIndex: count }
  const [revealedHints, setRevealedHints] = useState([]); // Array of lock indices
  const [answerInput, setAnswerInput] = useState('');
  const [answerState, setAnswerState] = useState(null); // null | 'correct' | 'wrong'
  const [solverScore, setSolverScore] = useState(0);
  const [penalties, setPenalties] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // ========== AUDIO STATE ==========
  const [playingLoopId, setPlayingLoopId] = useState(null);
  const audioRef = useRef(null);

  // ========== TIMER REF ==========
  const timerRef = useRef(null);

  // Initialize student ID
  useEffect(() => {
    let id = localStorage.getItem('anonymous-student-id');
    if (!id) {
      id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.setItem('anonymous-student-id', id);
    }
    setStudentId(id);
    console.log('🎮 Melody Escape Room - Student ID:', id);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start timer when solver mode begins
  useEffect(() => {
    if (mode === 'solver' && currentRoom && !isComplete) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mode, currentRoom, isComplete]);

  // ========== AUDIO FUNCTIONS ==========
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingLoopId(null);
  }, []);

  const playLoop = useCallback((loopFile, loopId) => {
    stopAudio();
    sounds.listen();

    const audio = new Audio(loopFile);
    audio.loop = true;
    audio.volume = 0.7;
    audioRef.current = audio;

    audio.play().catch(err => {
      console.error('Failed to play audio:', err);
    });

    setPlayingLoopId(loopId);
  }, [stopAudio]);

  const toggleLoopPreview = useCallback((loop) => {
    if (playingLoopId === loop.id) {
      stopAudio();
    } else {
      playLoop(loop.file, loop.id);
    }
  }, [playingLoopId, playLoop, stopAudio]);

  // ========== CREATOR MODE FUNCTIONS ==========
  const allLoops = getAllLoops();

  const toggleLoopSelection = (loop) => {
    sounds.select();
    setSelectedLoops(prev => {
      const isSelected = prev.some(l => l.id === loop.id);
      if (isSelected) {
        return prev.filter(l => l.id !== loop.id);
      }
      if (prev.length >= 5) {
        return prev; // Max 5 loops
      }
      return [...prev, loop];
    });
  };

  const getSelectionOrder = (loopId) => {
    const index = selectedLoops.findIndex(l => l.id === loopId);
    return index >= 0 ? index + 1 : null;
  };

  const moveLoopUp = (index) => {
    if (index === 0) return;
    sounds.click();
    setSelectedLoops(prev => {
      const newArr = [...prev];
      [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
      return newArr;
    });
  };

  const moveLoopDown = (index) => {
    if (index === selectedLoops.length - 1) return;
    sounds.click();
    setSelectedLoops(prev => {
      const newArr = [...prev];
      [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
      return newArr;
    });
  };

  const updateHint = (loopId, hint) => {
    setLoopHints(prev => ({
      ...prev,
      [loopId]: hint
    }));
  };

  const createRoom = () => {
    const code = generateShareCode();
    const roomData = {
      shareCode: code,
      creatorId: studentId,
      roomName: roomName || `${selectedTheme.name}`,
      theme: selectedTheme,
      locks: selectedLoops.map((loop, index) => ({
        id: loop.id,
        instrument: loop.instrument,
        file: loop.file,
        icon: loop.icon,
        hint: loopHints[loop.id] || null,
        order: index
      }))
    };

    saveRoom(roomData);
    setShareCode(code);
    setCreatorStep(4);
    sounds.roomCreated();
    console.log('🏰 Room created:', code);
  };

  // ========== SOLVER MODE FUNCTIONS ==========
  const joinRoom = () => {
    const room = loadRoom(enteredCode);
    if (room) {
      sounds.click();
      setCurrentRoom(room);
      setActiveLockIndex(0);
      setUnlockedLocks([]);
      setListenCounts({});
      setRevealedHints([]);
      setSolverScore(0);
      setPenalties(0);
      setWrongGuesses(0);
      setTimerSeconds(0);
      setIsComplete(false);
      console.log('🔓 Joined room:', room.roomName);
    } else {
      sounds.wrongGuess();
      alert('Room not found. Check the code and try again.');
    }
  };

  const selectLock = (index) => {
    if (unlockedLocks.includes(index)) return;
    sounds.doorCreak();
    stopAudio();
    setActiveLockIndex(index);
    setAnswerInput('');
    setAnswerState(null);
  };

  const listenToLock = () => {
    if (!currentRoom) return;

    const currentListens = listenCounts[activeLockIndex] || 0;
    if (currentListens >= scoring.maxListens) {
      sounds.noListensLeft();
      return;
    }

    const lock = currentRoom.locks[activeLockIndex];
    playLoop(lock.file, lock.id);

    setListenCounts(prev => ({
      ...prev,
      [activeLockIndex]: (prev[activeLockIndex] || 0) + 1
    }));
  };

  const revealHint = () => {
    if (revealedHints.includes(activeLockIndex)) return;
    sounds.hint();
    setRevealedHints(prev => [...prev, activeLockIndex]);
    setPenalties(prev => prev + scoring.hintPenalty);
  };

  const submitAnswer = () => {
    if (!answerInput.trim() || !currentRoom) return;

    const lock = currentRoom.locks[activeLockIndex];
    const isCorrect = checkAnswer(answerInput, lock.instrument);

    if (isCorrect) {
      sounds.unlock();
      setAnswerState('correct');
      setSolverScore(prev => prev + scoring.basePoints);
      setUnlockedLocks(prev => [...prev, activeLockIndex]);
      stopAudio();

      // Check if all locks are unlocked
      const newUnlocked = [...unlockedLocks, activeLockIndex];
      if (newUnlocked.length === currentRoom.locks.length) {
        // Escaped!
        setTimeout(() => {
          sounds.escape();
          setIsComplete(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }, 500);
      } else {
        // Move to next lock
        setTimeout(() => {
          const nextLock = currentRoom.locks.findIndex(
            (_, i) => !newUnlocked.includes(i)
          );
          if (nextLock >= 0) {
            setActiveLockIndex(nextLock);
            setAnswerInput('');
            setAnswerState(null);
          }
        }, 800);
      }
    } else {
      sounds.wrongGuess();
      setAnswerState('wrong');
      setWrongGuesses(prev => prev + 1);
      setPenalties(prev => prev + scoring.wrongGuessPenalty);
      setTimerSeconds(prev => prev + 5); // Add 5 second penalty

      setTimeout(() => {
        setAnswerState(null);
      }, 500);
    }
  };

  // ========== RESET FUNCTIONS ==========
  const resetCreator = () => {
    setCreatorStep(1);
    setSelectedLoops([]);
    setLoopHints({});
    setSelectedTheme(null);
    setRoomName('');
    setShareCode('');
    stopAudio();
  };

  const resetSolver = () => {
    setEnteredCode('');
    setCurrentRoom(null);
    setActiveLockIndex(0);
    setUnlockedLocks([]);
    setListenCounts({});
    setRevealedHints([]);
    setAnswerInput('');
    setAnswerState(null);
    setSolverScore(0);
    setPenalties(0);
    setWrongGuesses(0);
    setTimerSeconds(0);
    setIsComplete(false);
    stopAudio();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // ========== RENDER: MODE SELECTION ==========
  if (mode === null) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <style>{animationStyles}</style>
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-4 anim-float">🔐</div>
          <h1 className="text-4xl font-black text-white mb-2">Melody Escape Room</h1>
          <p className="text-gray-300 mb-8">Create an escape room for a partner, or solve one they made!</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => { initAudio(); sounds.click(); setMode('creator'); }}
              className="p-6 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl
                         hover:scale-105 transition-all shadow-xl border-2 border-cyan-400/30"
            >
              <div className="text-4xl mb-2">🔨</div>
              <div className="text-xl font-black text-white mb-1">Create Room</div>
              <div className="text-cyan-200 text-sm">Build a puzzle for someone else</div>
            </button>

            <button
              onClick={() => { initAudio(); sounds.click(); setMode('solver'); }}
              className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl
                         hover:scale-105 transition-all shadow-xl border-2 border-purple-400/30"
            >
              <div className="text-4xl mb-2">🔓</div>
              <div className="text-xl font-black text-white mb-1">Solve Room</div>
              <div className="text-purple-200 text-sm">Enter a code and escape!</div>
            </button>
          </div>

          {onComplete && (
            <button
              onClick={onComplete}
              className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
            >
              ← Back to Lesson
            </button>
          )}
        </div>
      </div>
    );
  }

  // ========== RENDER: CREATOR MODE ==========
  if (mode === 'creator') {
    // Step 1: Select Loops
    if (creatorStep === 1) {
      return (
        <div className="h-full bg-gradient-to-br from-gray-900 to-slate-800 flex flex-col">
          <style>{animationStyles}</style>
          <Header
            mode="creator"
            step={1}
            totalSteps={3}
            onBack={() => { resetCreator(); setMode(null); }}
          />

          <div className="flex-1 overflow-hidden p-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-white mb-1">Pick 4-5 Instrument Loops</h2>
              <p className="text-gray-400 text-sm">
                Select loops for your escape room locks ({selectedLoops.length}/5 selected)
              </p>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300
                             hover:bg-gray-600 transition-all"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Loop grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pb-4">
              {allLoops.map(loop => (
                <LoopCard
                  key={loop.id}
                  loop={loop}
                  isSelected={selectedLoops.some(l => l.id === loop.id)}
                  selectionOrder={getSelectionOrder(loop.id)}
                  onClick={() => toggleLoopSelection(loop)}
                  onPreview={() => toggleLoopPreview(loop)}
                  isPlaying={playingLoopId === loop.id}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              {selectedLoops.length < 4
                ? `Select at least ${4 - selectedLoops.length} more loop${4 - selectedLoops.length > 1 ? 's' : ''}`
                : '✓ Ready to continue'
              }
            </div>
            <button
              onClick={() => { sounds.click(); stopAudio(); setCreatorStep(2); }}
              disabled={selectedLoops.length < 4}
              className={`px-6 py-2 rounded-xl font-bold transition-all
                ${selectedLoops.length >= 4
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              Next: Add Hints →
            </button>
          </div>
        </div>
      );
    }

    // Step 2: Add Hints & Reorder
    if (creatorStep === 2) {
      return (
        <div className="h-full bg-gradient-to-br from-gray-900 to-slate-800 flex flex-col">
          <style>{animationStyles}</style>
          <Header
            mode="creator"
            step={2}
            totalSteps={3}
            onBack={() => setCreatorStep(1)}
          />

          <div className="flex-1 overflow-auto p-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-white mb-1">Arrange & Add Hints</h2>
              <p className="text-gray-400 text-sm">
                Drag to reorder (easiest first) and add optional hints
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-3">
              {selectedLoops.map((loop, index) => (
                <div
                  key={loop.id}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700 anim-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="text-2xl">{loop.icon}</span>
                    <div className="flex-1">
                      <div className="text-white font-bold">{loop.instrument}</div>
                      <div className="text-gray-400 text-xs">{loop.category}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveLoopUp(index)}
                        disabled={index === 0}
                        className={`w-8 h-8 rounded flex items-center justify-center
                          ${index === 0 ? 'text-gray-600' : 'text-gray-400 hover:bg-gray-700'}`}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveLoopDown(index)}
                        disabled={index === selectedLoops.length - 1}
                        className={`w-8 h-8 rounded flex items-center justify-center
                          ${index === selectedLoops.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:bg-gray-700'}`}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => toggleLoopPreview(loop)}
                        className={`w-8 h-8 rounded flex items-center justify-center
                          ${playingLoopId === loop.id ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                      >
                        {playingLoopId === loop.id ? '⏹' : '▶'}
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={loopHints[loop.id] || ''}
                    onChange={(e) => updateHint(loop.id, e.target.value)}
                    placeholder="Add a hint (optional)..."
                    maxLength={100}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600
                               text-white text-sm placeholder:text-gray-500 focus:outline-none
                               focus:border-purple-400"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setCreatorStep(1)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-all"
            >
              ← Back
            </button>
            <button
              onClick={() => { sounds.click(); stopAudio(); setCreatorStep(3); }}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all"
            >
              Next: Choose Theme →
            </button>
          </div>
        </div>
      );
    }

    // Step 3: Choose Theme
    if (creatorStep === 3) {
      return (
        <div className="h-full bg-gradient-to-br from-gray-900 to-slate-800 flex flex-col">
          <style>{animationStyles}</style>
          <Header
            mode="creator"
            step={3}
            totalSteps={3}
            onBack={() => setCreatorStep(2)}
          />

          <div className="flex-1 overflow-auto p-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-1">Choose a Theme</h2>
              <p className="text-gray-400 text-sm">Pick the look and feel of your escape room</p>
            </div>

            <div className="max-w-xl mx-auto mb-6">
              <ThemeSelector
                themes={roomThemes}
                selectedTheme={selectedTheme}
                onSelect={(theme) => { sounds.select(); setSelectedTheme(theme); }}
              />
            </div>

            {selectedTheme && (
              <div className="max-w-xl mx-auto anim-slide-up">
                <label className="block text-gray-300 text-sm mb-2">
                  Room Name (optional)
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder={selectedTheme.name}
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600
                             text-white placeholder:text-gray-500 focus:outline-none
                             focus:border-purple-400"
                />
              </div>
            )}
          </div>

          <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setCreatorStep(2)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-all"
            >
              ← Back
            </button>
            <button
              onClick={createRoom}
              disabled={!selectedTheme}
              className={`px-6 py-2 rounded-xl font-bold transition-all
                ${selectedTheme
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              Create Room! 🎉
            </button>
          </div>
        </div>
      );
    }

    // Step 4: Share Code
    if (creatorStep === 4) {
      return (
        <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
          <style>{animationStyles}</style>
          <Confetti active count={25} />

          <div className="text-center max-w-md anim-pop">
            <div className="text-6xl mb-4">🏰</div>
            <h1 className="text-3xl font-black text-white mb-2">Room Created!</h1>
            <p className="text-gray-300 mb-6">{roomName || selectedTheme?.name}</p>

            <ShareCodeDisplay
              code={shareCode}
              onCopy={() => sounds.codeCopied()}
            />

            <p className="text-gray-400 text-sm mt-4 mb-6">
              Share this code with a partner and challenge them to escape!
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => { resetCreator(); }}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-all"
              >
                🔨 Create Another
              </button>
              <button
                onClick={() => { resetCreator(); setMode(null); }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl transition-all"
              >
                Done ✓
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // ========== RENDER: SOLVER MODE ==========
  if (mode === 'solver') {
    // Enter code screen
    if (!currentRoom) {
      return (
        <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
          <style>{animationStyles}</style>

          <div className="text-center max-w-md">
            <div className="text-6xl mb-4 anim-float">🔐</div>
            <h1 className="text-3xl font-black text-white mb-2">Enter Room Code</h1>
            <p className="text-gray-300 mb-6">Get the code from your partner</p>

            <div className="mb-6">
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-letter code..."
                maxLength={6}
                className="w-full px-6 py-4 rounded-xl bg-gray-800 border-2 border-gray-600
                           text-white text-center text-2xl font-mono tracking-widest
                           placeholder:text-gray-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <button
              onClick={joinRoom}
              disabled={enteredCode.length !== 6}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition-all
                ${enteredCode.length === 6
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              Enter Room →
            </button>

            <button
              onClick={() => { setMode(null); }}
              className="block mx-auto mt-6 text-gray-400 hover:text-white transition-all"
            >
              ← Back
            </button>
          </div>
        </div>
      );
    }

    // Results screen
    if (isComplete) {
      return (
        <div className={`h-full bg-gradient-to-br ${currentRoom.theme.bg} flex items-center justify-center p-4`}>
          <style>{animationStyles}</style>
          <ResultsScreen
            roomName={currentRoom.roomName}
            time={timerSeconds}
            score={solverScore}
            penalties={penalties}
            locksUnlocked={unlockedLocks.length}
            totalLocks={currentRoom.locks.length}
            hintsUsed={revealedHints.length}
            wrongGuesses={wrongGuesses}
            onPlayAgain={() => resetSolver()}
            onCreateOwn={() => { resetSolver(); setMode('creator'); }}
            onDone={() => { resetSolver(); setMode(null); }}
          />
        </div>
      );
    }

    // Main solving screen
    const currentLock = currentRoom.locks[activeLockIndex];
    const currentListens = listenCounts[activeLockIndex] || 0;
    const isHintRevealed = revealedHints.includes(activeLockIndex);

    return (
      <div className={`h-full bg-gradient-to-br ${currentRoom.theme.bg} flex flex-col`}>
        <style>{animationStyles}</style>

        {/* Header */}
        <div className="bg-black/30 backdrop-blur border-b border-white/10 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentRoom.theme.emoji}</span>
            <div>
              <h2 className="text-sm font-bold text-white">{currentRoom.roomName}</h2>
              <p className="text-xs text-gray-300">
                {unlockedLocks.length}/{currentRoom.locks.length} locks opened
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Timer seconds={timerSeconds} isWarning={timerSeconds > 180} />
            <ScoreDisplay score={solverScore} penalties={penalties} />
          </div>
        </div>

        {/* Locks row */}
        <div className="flex justify-center gap-4 py-4 px-4 bg-black/20">
          {currentRoom.locks.map((lock, index) => (
            <Lock
              key={lock.id}
              index={index}
              isUnlocked={unlockedLocks.includes(index)}
              isActive={activeLockIndex === index}
              lockColor={currentRoom.theme.lockColor}
              onClick={() => selectLock(index)}
              listenCount={listenCounts[index] || 0}
              maxListens={scoring.maxListens}
            />
          ))}
        </div>

        {/* Active lock panel */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-black/40 backdrop-blur rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{currentLock.icon}</div>
              <h3 className="text-xl font-bold text-white">Lock {activeLockIndex + 1}</h3>
              <p className="text-gray-300 text-sm">Listen and identify the instrument</p>
            </div>

            {/* Listen button */}
            <div className="text-center mb-4">
              <button
                onClick={playingLoopId === currentLock.id ? stopAudio : listenToLock}
                disabled={currentListens >= scoring.maxListens && playingLoopId !== currentLock.id}
                className={`px-8 py-3 rounded-xl font-bold text-lg transition-all
                  ${playingLoopId === currentLock.id
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : currentListens >= scoring.maxListens
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-900 hover:scale-105 shadow-lg'
                  }`}
              >
                {playingLoopId === currentLock.id ? '⏹ Stop' : '▶️ Listen'}
              </button>
              <div className="mt-2 text-sm text-gray-400">
                {scoring.maxListens - currentListens} listen{scoring.maxListens - currentListens !== 1 ? 's' : ''} remaining
              </div>
            </div>

            {/* Hint button */}
            {currentLock.hint && (
              <div className="mb-4">
                <HintButton
                  hint={currentLock.hint}
                  isRevealed={isHintRevealed}
                  onReveal={revealHint}
                  penaltyCost={scoring.hintPenalty}
                />
              </div>
            )}

            {/* Answer input */}
            <AnswerInput
              value={answerInput}
              onChange={setAnswerInput}
              onSubmit={submitAnswer}
              isCorrect={answerState === 'correct'}
              isWrong={answerState === 'wrong'}
              disabled={unlockedLocks.includes(activeLockIndex)}
            />

            {/* Instrument examples */}
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-xs">
                Examples: drums, bass, strings, synth, guitar, brass, vocals, piano...
              </p>
            </div>
          </div>
        </div>

        {/* Quit button */}
        <div className="p-4 text-center">
          <button
            onClick={() => { stopAudio(); resetSolver(); setMode(null); }}
            className="text-gray-400 hover:text-white text-sm transition-all"
          >
            Give Up & Exit
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MelodyEscapeRoomActivity;
