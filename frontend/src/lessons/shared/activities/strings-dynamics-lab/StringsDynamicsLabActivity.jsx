// strings-dynamics-lab/StringsDynamicsLabActivity.jsx
// Remote two-player game: Each student on their own Chromebook
// Builder picks instrument + dynamic, Listener guesses both
// Partners pair up using a 4-digit code synced via Firebase
// Optimized for 1366x768 Chromebook screens

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { stringInstruments, dynamics, scoring, calcStreakBonus, getResultMessage } from './stringsDynamicsLabData';
import {
  createPartnerGame,
  joinPartnerGame,
  subscribeToPartnerGame,
  updatePartnerGame,
  deletePartnerGame
} from '../../../../firebase/config';

const STORAGE_KEY = 'strings-dynamics-partner';

// Animation styles
const animationStyles = `
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pop { 0%{transform:scale(0)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }
  @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes confetti { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(100vh) rotate(720deg)} }
  @keyframes dots { 0%{content:'.'} 33%{content:'..'} 66%{content:'...'} }
  .anim-bounce { animation: bounce 0.6s ease-in-out infinite; }
  .anim-pop { animation: pop 0.3s ease-out; }
  .anim-slide-up { animation: slide-up 0.4s ease-out; }
  .anim-pulse { animation: pulse 1.5s ease-in-out infinite; }
`;

// Confetti component
const Confetti = ({ active, count = 20 }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            backgroundColor: ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][i % 5],
            animation: `confetti ${2 + Math.random()}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`
          }}
        />
      ))}
    </div>
  );
};

// Waiting dots animation
const WaitingDots = () => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return <span className="inline-block w-6 text-left">{dots}</span>;
};

// Scoreboard header used across phases
const ScoreHeader = ({ gameState, myPlayerNumber }) => {
  const p1Name = gameState?.player1?.name || 'Player 1';
  const p2Name = gameState?.player2?.name || 'Player 2';
  const p1Score = gameState?.scores?.p1 || 0;
  const p2Score = gameState?.scores?.p2 || 0;
  const round = gameState?.round || 0;
  const totalRounds = gameState?.totalRounds || 8;

  return (
    <div className="flex justify-between items-center mb-2">
      <div className="text-white/60 text-sm">Round {round}/{totalRounds}</div>
      <div className="flex gap-4">
        <span className={`font-bold ${myPlayerNumber === 1 ? 'text-cyan-400' : 'text-white/60'}`}>
          {p1Name}: {p1Score}
        </span>
        <span className={`font-bold ${myPlayerNumber === 2 ? 'text-pink-400' : 'text-white/60'}`}>
          {p2Name}: {p2Score}
        </span>
      </div>
    </div>
  );
};

const StringsDynamicsLabActivity = ({ onComplete }) => {
  // Identity
  const [gameCode, setGameCode] = useState(null);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [myPlayerNumber, setMyPlayerNumber] = useState(null); // 1 or 2

  // Game state from Firebase
  const [gameState, setGameState] = useState(null);

  // Local join UI state
  const [nameInput, setNameInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [joinMode, setJoinMode] = useState(null); // 'create' | 'join'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Local round state (not synced to Firebase until submit)
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedDynamic, setSelectedDynamic] = useState(null);
  const [guessedInstrument, setGuessedInstrument] = useState(null);
  const [guessedDynamic, setGuessedDynamic] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [listened, setListened] = useState(false);
  const [localPlayCount, setLocalPlayCount] = useState(0);
  const [confetti, setConfetti] = useState(false);

  // Audio refs
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);
  const prevPhaseRef = useRef(null);

  // Derived values from gameState
  const phase = gameState?.phase || 'join';
  const amIBuilder = gameState ? gameState.builder === myPlayerNumber : false;
  const myName = myPlayerNumber === 1 ? gameState?.player1?.name : gameState?.player2?.name;
  const partnerName = myPlayerNumber === 1 ? gameState?.player2?.name : gameState?.player1?.name;
  const round = gameState?.round || 0;
  const totalRounds = gameState?.totalRounds || 8;
  const myStreakKey = `p${myPlayerNumber}`;
  const myStreak = gameState?.streaks?.[myStreakKey] || 0;

  // Stop audio
  const stopAudio = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  // Reset local state when phase changes
  useEffect(() => {
    if (!gameState) return;
    const currentPhase = gameState.phase;
    if (currentPhase !== prevPhaseRef.current) {
      prevPhaseRef.current = currentPhase;
      if (currentPhase === 'building') {
        stopAudio();
        setSelectedInstrument(null);
        setSelectedDynamic(null);
        setGuessedInstrument(null);
        setGuessedDynamic(null);
        setListened(false);
        setLocalPlayCount(0);
      }
      if (currentPhase === 'reveal' && gameState.roundResult?.isPerfect) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2500);
      }
    }
  }, [gameState, stopAudio]);

  // Clear any stale partner game data on mount
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Subscribe to game state when we have a code
  useEffect(() => {
    if (!gameCode) return;

    const unsubscribe = subscribeToPartnerGame(gameCode, (data) => {
      if (!data) {
        setError('Game ended or not found.');
        setGameCode(null);
        setMyPlayerId(null);
        setMyPlayerNumber(null);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      setGameState(data);
    });

    return () => unsubscribe();
  }, [gameCode]);


  // Create a new game (always 8 rounds)
  const handleCreate = async () => {
    if (!nameInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { code, playerId } = await createPartnerGame(nameInput.trim(), 8);
      setGameCode(code);
      setMyPlayerId(playerId);
      setMyPlayerNumber(1);
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game. Try again.');
    }
    setLoading(false);
  };

  // Join an existing game
  const handleJoin = async () => {
    if (!nameInput.trim() || !codeInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await joinPartnerGame(codeInput.trim(), nameInput.trim());
      if (!result) {
        setError('Game not found or already full.');
        setLoading(false);
        return;
      }
      setGameCode(codeInput.trim());
      setMyPlayerId(result.playerId);
      setMyPlayerNumber(2);
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game. Try again.');
    }
    setLoading(false);
  };

  // Play the builder's selected instrument at selected dynamic
  const playSound = () => {
    stopAudio();
    const selection = gameState?.selection;
    if (!selection) return;

    const instrument = stringInstruments.find(i => i.id === selection.instrument);
    const dynamic = dynamics.find(d => d.id === selection.dynamic);
    if (!instrument || !dynamic) return;

    const audio = new Audio(instrument.audioPath);
    audio.volume = dynamic.volume;
    audioRef.current = audio;

    const clipStartTimes = instrument.clips || [20];
    const randomStart = clipStartTimes[Math.floor(Math.random() * clipStartTimes.length)];

    const startPlayback = () => {
      audio.currentTime = randomStart;
      audio.play().then(() => {
        setPlaying(true);
        setListened(true);
        setLocalPlayCount(p => p + 1);
        timeoutRef.current = setTimeout(() => stopAudio(), 5000);
      }).catch((err) => {
        console.error('Audio playback failed:', err);
        setPlaying(false);
      });
    };

    audio.addEventListener('loadedmetadata', startPlayback);
    if (audio.readyState >= 1) startPlayback();
  };

  // Builder locks in their selection
  const handleLockIn = async () => {
    if (!selectedInstrument || !selectedDynamic) return;
    await updatePartnerGame(gameCode, {
      phase: 'listening',
      selection: { instrument: selectedInstrument, dynamic: selectedDynamic },
      playCount: 0
    });
  };

  // Listener submits their guess
  const handleSubmitGuess = async () => {
    stopAudio();
    const selection = gameState.selection;
    const instrumentCorrect = guessedInstrument === selection.instrument;
    const dynamicCorrect = guessedDynamic === selection.dynamic;
    const isPerfect = instrumentCorrect && dynamicCorrect;

    const currentStreak = gameState.streaks?.[myStreakKey] || 0;
    let total = 0;
    if (instrumentCorrect) total += scoring.instrumentCorrect;
    if (dynamicCorrect) total += scoring.dynamicCorrect;
    if (isPerfect) total += scoring.perfectRound;
    if (localPlayCount <= 2) total += scoring.quick;
    total += calcStreakBonus(currentStreak + (isPerfect ? 1 : 0));

    const newStreak = isPerfect ? currentStreak + 1 : 0;
    const currentScore = gameState.scores?.[myStreakKey] || 0;

    await updatePartnerGame(gameCode, {
      phase: 'reveal',
      guess: { instrument: guessedInstrument, dynamic: guessedDynamic },
      playCount: localPlayCount,
      roundResult: { instrumentCorrect, dynamicCorrect, isPerfect, total },
      [`scores/${myStreakKey}`]: currentScore + total,
      [`streaks/${myStreakKey}`]: newStreak
    });
  };

  // Start the game (from rules)
  const handleStartGame = async () => {
    await updatePartnerGame(gameCode, {
      phase: 'building',
      round: 1,
      builder: 1,
      selection: null,
      guess: null,
      playCount: 0,
      roundResult: null
    });
  };

  // Next round
  const handleNextRound = async () => {
    if (round >= totalRounds) {
      await updatePartnerGame(gameCode, { phase: 'gameOver' });
    } else {
      const nextBuilder = gameState.builder === 1 ? 2 : 1;
      await updatePartnerGame(gameCode, {
        phase: 'building',
        round: round + 1,
        builder: nextBuilder,
        selection: null,
        guess: null,
        playCount: 0,
        roundResult: null
      });
    }
  };

  // Play again
  const handlePlayAgain = async () => {
    await updatePartnerGame(gameCode, {
      phase: 'building',
      round: 1,
      builder: 1,
      selection: null,
      guess: null,
      playCount: 0,
      scores: { p1: 0, p2: 0 },
      streaks: { p1: 0, p2: 0 },
      roundResult: null
    });
  };

  // Leave game
  const handleLeave = async () => {
    stopAudio();
    if (gameCode) {
      try { await deletePartnerGame(gameCode); } catch {}
    }
    localStorage.removeItem(STORAGE_KEY);
    setGameCode(null);
    setMyPlayerId(null);
    setMyPlayerNumber(null);
    setGameState(null);
    setNameInput('');
    setCodeInput('');
    setJoinMode(null);
    setError(null);
    if (onComplete) onComplete();
  };

  // ========== JOIN SCREEN ==========
  if (!gameCode) {
    return (
      <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <style>{animationStyles}</style>
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-3 anim-bounce">🎻</div>
          <h1 className="text-3xl font-black text-white mb-2">Strings & Dynamics Lab</h1>
          <p className="text-purple-300 mb-6">Partner up! One picks, one guesses.</p>

          {/* Name Input */}
          <div className="mb-5">
            <label className="text-white/60 text-sm block mb-1">Your Name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-center text-lg font-bold border-2 border-white/20 focus:border-cyan-400 outline-none"
              maxLength={20}
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2 mb-4">
              <p className="text-red-300 text-sm font-bold">{error}</p>
            </div>
          )}

          {!joinMode ? (
            <div className="space-y-3">
              <button
                onClick={handleCreate}
                disabled={!nameInput.trim() || loading}
                className={`w-full px-6 py-4 rounded-xl font-black text-lg transition-all ${
                  nameInput.trim() && !loading
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-105'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                {loading ? 'Creating...' : 'Create Team'}
              </button>
              <button
                onClick={() => setJoinMode('join')}
                disabled={!nameInput.trim() || loading}
                className={`w-full px-6 py-4 rounded-xl font-black text-lg transition-all ${
                  nameInput.trim()
                    ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-white hover:scale-105'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                Join with Code
              </button>
            </div>
          ) : (
            <div className="space-y-3 anim-slide-up">
              <label className="text-white/60 text-sm block">Partner's Game Code</label>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4-digit code"
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-center text-2xl font-black tracking-[0.5em] border-2 border-white/20 focus:border-green-400 outline-none"
                maxLength={4}
                inputMode="numeric"
              />
              <button
                onClick={handleJoin}
                disabled={codeInput.length !== 4 || loading}
                className={`w-full px-6 py-3 rounded-xl font-black text-lg transition-all ${
                  codeInput.length === 4 && !loading
                    ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-white hover:scale-105'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                {loading ? 'Joining...' : 'Join Game'}
              </button>
              <button
                onClick={() => { setJoinMode(null); setCodeInput(''); setError(null); }}
                className="text-white/40 text-sm hover:text-white/60"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== WAITING FOR PARTNER ==========
  if (phase === 'waiting') {
    return (
      <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <style>{animationStyles}</style>
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4 anim-bounce">🎻</div>
          <h1 className="text-2xl font-black text-white mb-2">Share This Code</h1>
          <p className="text-purple-300 mb-6">Tell your partner to enter this code</p>

          <div className="bg-white/10 rounded-2xl p-6 mb-6 border-2 border-white/20">
            <div className="text-6xl font-black text-white tracking-[0.3em] mb-2">
              {gameCode}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-white/50">
            <div className="w-2 h-2 rounded-full bg-cyan-400 anim-pulse" />
            <span>Waiting for partner to join<WaitingDots /></span>
          </div>

          <button
            onClick={handleLeave}
            className="mt-8 text-white/30 text-sm hover:text-white/50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ========== RULES SCREEN ==========
  if (phase === 'rules') {
    return (
      <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <style>{animationStyles}</style>
        <div className="w-full max-w-lg text-center">
          <h1 className="text-3xl font-black text-white mb-2">Partner Found!</h1>
          <p className="text-green-400 font-bold mb-4">
            {gameState?.player1?.name} vs {gameState?.player2?.name}
          </p>

          <div className="bg-white/10 rounded-xl p-4 mb-4 text-left">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔨</span>
                <div>
                  <div className="text-white font-bold">Builder</div>
                  <div className="text-white/70 text-sm">Pick a string instrument AND a dynamic level</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">👂</span>
                <div>
                  <div className="text-white font-bold">Listener</div>
                  <div className="text-white/70 text-sm">Listen and guess BOTH the instrument and dynamic</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <div className="text-white font-bold">Swap Roles</div>
                  <div className="text-white/70 text-sm">You switch roles every round</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/20 rounded-xl p-3 mb-4 border border-yellow-400/30">
            <p className="text-yellow-300 font-bold">Get both correct for PERFECT bonus points!</p>
          </div>

          <button
            onClick={handleStartGame}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-lg rounded-xl hover:scale-105 transition-all"
          >
            Start Game!
          </button>
        </div>
      </div>
    );
  }

  // ========== BUILDING PHASE ==========
  if (phase === 'building') {
    if (amIBuilder) {
      // I am the Builder - pick instrument + dynamic
      return (
        <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-3">
          <style>{animationStyles}</style>
          <ScoreHeader gameState={gameState} myPlayerNumber={myPlayerNumber} />

          <div className="bg-purple-600/30 rounded-lg px-3 py-2 mb-3 text-center border border-purple-400/30">
            <p className="text-purple-200 font-bold text-sm">You are the BUILDER this round</p>
          </div>

          <h1 className="text-xl font-black text-white text-center mb-3">
            Pick an Instrument AND a Dynamic
          </h1>

          {/* Instrument Selection */}
          <div className="mb-4">
            <h2 className="text-white/60 text-sm mb-2 text-center">String Instrument</h2>
            <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
              {stringInstruments.map(inst => (
                <button
                  key={inst.id}
                  onClick={() => setSelectedInstrument(inst.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedInstrument === inst.id
                      ? `bg-gradient-to-br ${inst.color} ring-2 ring-white scale-105`
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{inst.icon}</div>
                  <div className="text-white font-bold text-xs">{inst.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Selection */}
          <div className="mb-4">
            <h2 className="text-white/60 text-sm mb-2 text-center">Dynamic Level</h2>
            <div className="grid grid-cols-6 gap-2 max-w-lg mx-auto">
              {dynamics.map(dyn => (
                <button
                  key={dyn.id}
                  onClick={() => setSelectedDynamic(dyn.id)}
                  className={`p-2 rounded-xl text-center transition-all ${
                    selectedDynamic === dyn.id
                      ? `bg-gradient-to-br ${dyn.color} ring-2 ring-white scale-105`
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="text-white font-black text-lg">{dyn.id}</div>
                  <div className="text-white/70 text-[10px]">{dyn.meaning}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Lock In Button */}
          <div className="text-center">
            <button
              onClick={handleLockIn}
              disabled={!selectedInstrument || !selectedDynamic}
              className={`px-6 py-3 rounded-xl font-black text-lg transition-all ${
                selectedInstrument && selectedDynamic
                  ? 'bg-white text-gray-900 hover:scale-105 shadow-lg'
                  : 'bg-white/10 text-white/30'
              }`}
            >
              Lock In!
            </button>
          </div>
        </div>
      );
    } else {
      // I am the Listener - waiting for builder
      return (
        <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-3">
          <style>{animationStyles}</style>
          <div className="w-full max-w-md">
            <ScoreHeader gameState={gameState} myPlayerNumber={myPlayerNumber} />
            <div className="text-center mt-8">
              <div className="text-6xl mb-4 anim-bounce">👂</div>
              <div className="bg-cyan-600/30 rounded-lg px-3 py-2 mb-4 text-center border border-cyan-400/30">
                <p className="text-cyan-200 font-bold text-sm">You are the LISTENER this round</p>
              </div>
              <h1 className="text-2xl font-black text-white mb-3">Get Ready!</h1>
              <p className="text-gray-300 text-lg">
                {partnerName} is picking an instrument and dynamic<WaitingDots />
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  // ========== LISTENING PHASE ==========
  if (phase === 'listening') {
    if (!amIBuilder) {
      // I am the Listener - play audio and guess
      return (
        <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-3">
          <style>{animationStyles}</style>
          <ScoreHeader gameState={gameState} myPlayerNumber={myPlayerNumber} />

          <h1 className="text-xl font-black text-white text-center mb-2">
            Guess the Instrument AND Dynamic!
          </h1>

          {myStreak >= 2 && (
            <div className="text-center mb-2">
              <span className="bg-orange-500/30 text-orange-400 px-3 py-1 rounded-full font-bold text-sm">
                🔥 {myStreak}x Streak!
              </span>
            </div>
          )}

          {/* Play Button */}
          <div className="text-center mb-3">
            <button
              onClick={playing ? stopAudio : playSound}
              className={`px-8 py-3 rounded-xl font-black text-lg shadow-lg transition-all ${
                playing ? 'bg-red-500 text-white' : 'bg-white text-gray-900 hover:scale-105'
              }`}
            >
              {playing ? '⏹ Stop' : '▶ Play Sound'}
            </button>
            <div className="mt-1 text-sm">
              {listened ? (
                <span className="text-green-400 font-bold">
                  Played {localPlayCount}x {localPlayCount <= 2 && <span className="text-yellow-300">+10 Quick Bonus!</span>}
                </span>
              ) : (
                <span className="text-white/50">Listen first!</span>
              )}
            </div>
          </div>

          {/* Instrument Guess */}
          <div className="mb-3">
            <h2 className="text-white/60 text-sm mb-1 text-center">Which Instrument?</h2>
            <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
              {stringInstruments.map(inst => (
                <button
                  key={inst.id}
                  onClick={() => listened && setGuessedInstrument(inst.id)}
                  disabled={!listened}
                  className={`p-2 rounded-xl text-center transition-all ${
                    guessedInstrument === inst.id
                      ? `bg-gradient-to-br ${inst.color} ring-2 ring-white scale-105`
                      : listened ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 opacity-50'
                  }`}
                >
                  <div className="text-xl mb-0.5">{inst.icon}</div>
                  <div className="text-white font-bold text-xs">{inst.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Guess */}
          <div className="mb-3">
            <h2 className="text-white/60 text-sm mb-1 text-center">Which Dynamic?</h2>
            <div className="grid grid-cols-6 gap-2 max-w-lg mx-auto">
              {dynamics.map(dyn => (
                <button
                  key={dyn.id}
                  onClick={() => listened && setGuessedDynamic(dyn.id)}
                  disabled={!listened}
                  className={`p-2 rounded-xl text-center transition-all ${
                    guessedDynamic === dyn.id
                      ? `bg-gradient-to-br ${dyn.color} ring-2 ring-white scale-105`
                      : listened ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 opacity-50'
                  }`}
                >
                  <div className="text-white font-black text-base">{dyn.id}</div>
                  <div className="text-white/70 text-[9px]">{dyn.meaning}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmitGuess}
              disabled={!listened || !guessedInstrument || !guessedDynamic}
              className={`px-6 py-3 rounded-xl font-black text-lg transition-all ${
                listened && guessedInstrument && guessedDynamic
                  ? 'bg-white text-gray-900 hover:scale-105 shadow-lg'
                  : 'bg-white/10 text-white/30'
              }`}
            >
              Submit Guess!
            </button>
          </div>
        </div>
      );
    } else {
      // I am the Builder - waiting for listener to guess
      const selectedInst = stringInstruments.find(i => i.id === gameState?.selection?.instrument);
      const selectedDyn = dynamics.find(d => d.id === gameState?.selection?.dynamic);

      return (
        <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-3">
          <style>{animationStyles}</style>
          <div className="w-full max-w-md">
            <ScoreHeader gameState={gameState} myPlayerNumber={myPlayerNumber} />
            <div className="text-center mt-4">
              <div className="text-5xl mb-4">🎧</div>
              <h1 className="text-2xl font-black text-white mb-3">
                {partnerName} is listening<WaitingDots />
              </h1>

              {/* Show what you picked */}
              <div className="bg-white/10 rounded-xl p-4 mb-4 inline-block">
                <p className="text-white/60 text-xs mb-2">You picked:</p>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl">{selectedInst?.icon}</div>
                    <div className="text-white font-bold text-sm">{selectedInst?.name}</div>
                  </div>
                  <div className="text-white/30 text-2xl">+</div>
                  <div className="text-center">
                    <div className="text-white font-black text-2xl">{selectedDyn?.id}</div>
                    <div className="text-white/70 text-xs">{selectedDyn?.meaning}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // ========== REVEAL PHASE ==========
  if (phase === 'reveal' && gameState?.roundResult) {
    const results = gameState.roundResult;
    const selection = gameState.selection;
    const guess = gameState.guess;
    const selectedInst = stringInstruments.find(i => i.id === selection?.instrument);
    const selectedDyn = dynamics.find(d => d.id === selection?.dynamic);
    const guessedInst = stringInstruments.find(i => i.id === guess?.instrument);
    const guessedDyn = dynamics.find(d => d.id === guess?.dynamic);

    const listenerNum = gameState.builder === 1 ? 2 : 1;
    const listenerName = listenerNum === 1 ? gameState.player1?.name : gameState.player2?.name;
    const listenerStreak = gameState.streaks?.[`p${listenerNum}`] || 0;
    const msg = getResultMessage(results.instrumentCorrect, results.dynamicCorrect, listenerStreak);

    return (
      <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-3">
        <style>{animationStyles}</style>
        <Confetti active={confetti} />

        <div className="max-w-lg mx-auto">
          {/* Result Header */}
          <div className="text-center mb-4">
            <div className={`text-5xl mb-2 ${results.isPerfect ? 'anim-bounce' : ''}`}>
              {results.isPerfect ? '🎉' : results.instrumentCorrect || results.dynamicCorrect ? '👏' : '💪'}
            </div>
            <h1 className={`text-3xl font-black ${msg.color}`}>{msg.text}</h1>
          </div>

          {/* Answers vs Guesses */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Instrument */}
            <div className="bg-black/30 rounded-xl p-3">
              <h2 className="text-white/60 text-sm mb-2 text-center">Instrument</h2>
              <div className={`p-3 rounded-xl text-center mb-2 ${results.instrumentCorrect ? 'bg-green-500/30 border-2 border-green-400' : 'bg-red-500/30 border-2 border-red-400'}`}>
                <div className="text-white/60 text-xs mb-1">Answer</div>
                <div className="text-2xl">{selectedInst?.icon}</div>
                <div className="text-white font-bold">{selectedInst?.name}</div>
              </div>
              <div className={`p-3 rounded-xl text-center ${results.instrumentCorrect ? 'bg-green-500/20' : 'bg-white/10'}`}>
                <div className="text-white/60 text-xs mb-1">Guess</div>
                <div className="text-2xl">{guessedInst?.icon}</div>
                <div className="text-white font-bold">{guessedInst?.name}</div>
                <div className={`text-sm font-bold mt-1 ${results.instrumentCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {results.instrumentCorrect ? '✓ Correct!' : '✗ Wrong'}
                </div>
              </div>
            </div>

            {/* Dynamic */}
            <div className="bg-black/30 rounded-xl p-3">
              <h2 className="text-white/60 text-sm mb-2 text-center">Dynamic</h2>
              <div className={`p-3 rounded-xl text-center mb-2 ${results.dynamicCorrect ? 'bg-green-500/30 border-2 border-green-400' : 'bg-red-500/30 border-2 border-red-400'}`}>
                <div className="text-white/60 text-xs mb-1">Answer</div>
                <div className="text-white font-black text-2xl">{selectedDyn?.id}</div>
                <div className="text-white/70 text-sm">{selectedDyn?.meaning}</div>
              </div>
              <div className={`p-3 rounded-xl text-center ${results.dynamicCorrect ? 'bg-green-500/20' : 'bg-white/10'}`}>
                <div className="text-white/60 text-xs mb-1">Guess</div>
                <div className="text-white font-black text-2xl">{guessedDyn?.id}</div>
                <div className="text-white/70 text-sm">{guessedDyn?.meaning}</div>
                <div className={`text-sm font-bold mt-1 ${results.dynamicCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {results.dynamicCorrect ? '✓ Correct!' : '✗ Wrong'}
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-black/40 rounded-xl p-3 mb-4 anim-slide-up">
            <h3 className="text-white font-bold text-center mb-2">{listenerName}'s Score</h3>
            <div className="text-center">
              <span className="text-white/60">Total: </span>
              <span className="text-4xl font-black text-white">+{results.total}</span>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleNextRound}
              className="px-8 py-3 bg-white text-gray-900 font-black text-lg rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              {round >= totalRounds ? '🏆 See Results' : `Round ${round + 1} →`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== GAME OVER ==========
  if (phase === 'gameOver') {
    const p1Score = gameState?.scores?.p1 || 0;
    const p2Score = gameState?.scores?.p2 || 0;
    const p1Name = gameState?.player1?.name || 'Player 1';
    const p2Name = gameState?.player2?.name || 'Player 2';
    const winner = p1Score > p2Score ? 1 : p2Score > p1Score ? 2 : 0;
    const winnerName = winner === 1 ? p1Name : winner === 2 ? p2Name : null;

    return (
      <div className="min-h-screen h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-3">
        <style>{animationStyles}</style>
        <Confetti active count={40} />

        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-3xl font-black text-white mb-2">Game Over!</h1>
          <p className="text-xl text-yellow-400 font-bold mb-6">
            {winner === 0 ? "It's a TIE!" : `${winnerName} Wins!`}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`bg-cyan-500/20 rounded-xl p-4 border-2 ${winner === 1 ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-cyan-400/30'}`}>
              {winner === 1 && <span className="text-2xl">👑</span>}
              <div className="text-cyan-400 font-bold">{p1Name}</div>
              <div className="text-4xl font-black text-white">{p1Score}</div>
            </div>
            <div className={`bg-pink-500/20 rounded-xl p-4 border-2 ${winner === 2 ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-pink-400/30'}`}>
              {winner === 2 && <span className="text-2xl">👑</span>}
              <div className="text-pink-400 font-bold">{p2Name}</div>
              <div className="text-4xl font-black text-white">{p2Score}</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handlePlayAgain}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl hover:scale-105 transition-all"
            >
              🔄 Play Again
            </button>
            <button
              onClick={handleLeave}
              className="px-6 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30"
            >
              Done ✓
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading / fallback
  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <style>{animationStyles}</style>
      <div className="text-center">
        <div className="text-4xl mb-4 anim-bounce">🎻</div>
        <p className="text-white/50">Loading<WaitingDots /></p>
      </div>
    </div>
  );
};

export default StringsDynamicsLabActivity;
