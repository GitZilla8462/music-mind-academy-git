// strings-dynamics-lab/StringsDynamicsLabActivity.jsx
// Two-player game: Builder picks instrument + dynamic, Listener guesses both
// Optimized for 1366x768 Chromebook screens

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { stringInstruments, dynamics, scoring, calcStreakBonus, getResultMessage } from './stringsDynamicsLabData';

// Animation styles
const animationStyles = `
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pop { 0%{transform:scale(0)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }
  @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes confetti { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(100vh) rotate(720deg)} }
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

const StringsDynamicsLabActivity = ({ onComplete }) => {
  // Game state
  const [phase, setPhase] = useState('setup');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [builder, setBuilder] = useState(1);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(8);

  // Scores
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p1Streak, setP1Streak] = useState(0);
  const [p2Streak, setP2Streak] = useState(0);

  // Round state
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedDynamic, setSelectedDynamic] = useState(null);
  const [guessedInstrument, setGuessedInstrument] = useState(null);
  const [guessedDynamic, setGuessedDynamic] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [listened, setListened] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  // Results
  const [results, setResults] = useState(null);
  const [confetti, setConfetti] = useState(false);

  // Audio refs
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  // Computed
  const listener = builder === 1 ? 2 : 1;
  const builderName = builder === 1 ? player1 : player2;
  const listenerName = listener === 1 ? player1 : player2;
  const streak = listener === 1 ? p1Streak : p2Streak;

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

  // Play the selected instrument at selected dynamic
  // Only plays for 5 seconds, starting from a random clip position
  const playSound = () => {
    stopAudio();
    if (!selectedInstrument || !selectedDynamic) return;

    const instrument = stringInstruments.find(i => i.id === selectedInstrument);
    const dynamic = dynamics.find(d => d.id === selectedDynamic);

    if (!instrument || !dynamic) return;

    // Use Audio element
    const audio = new Audio(instrument.audioPath);
    audio.volume = dynamic.volume;
    audioRef.current = audio;

    // Pick a random clip start time from the available clips
    const clipStartTimes = instrument.clips || [20];
    const randomStart = clipStartTimes[Math.floor(Math.random() * clipStartTimes.length)];

    // When audio is ready, seek to the random start position and play
    audio.addEventListener('loadedmetadata', () => {
      audio.currentTime = randomStart;
      audio.play().then(() => {
        setPlaying(true);
        setListened(true);
        setPlayCount(p => p + 1);

        // Stop after 5 seconds
        timeoutRef.current = setTimeout(() => {
          stopAudio();
        }, 5000);
      }).catch((err) => {
        console.error('Audio playback failed:', err);
        setPlaying(false);
      });
    });

    // Handle case where metadata is already loaded
    if (audio.readyState >= 1) {
      audio.currentTime = randomStart;
      audio.play().then(() => {
        setPlaying(true);
        setListened(true);
        setPlayCount(p => p + 1);

        timeoutRef.current = setTimeout(() => {
          stopAudio();
        }, 5000);
      }).catch((err) => {
        console.error('Audio playback failed:', err);
        setPlaying(false);
      });
    }
  };

  // Start new round
  const startRound = useCallback(() => {
    stopAudio();
    setSelectedInstrument(null);
    setSelectedDynamic(null);
    setGuessedInstrument(null);
    setGuessedDynamic(null);
    setListened(false);
    setPlayCount(0);
    setResults(null);
    setPhase('builder');
  }, [stopAudio]);

  // Submit guess
  const submitGuess = () => {
    stopAudio();

    const instrumentCorrect = guessedInstrument === selectedInstrument;
    const dynamicCorrect = guessedDynamic === selectedDynamic;
    const isPerfect = instrumentCorrect && dynamicCorrect;

    let total = 0;
    if (instrumentCorrect) total += scoring.instrumentCorrect;
    if (dynamicCorrect) total += scoring.dynamicCorrect;
    if (isPerfect) total += scoring.perfectRound;
    if (playCount <= 2) total += scoring.quick;
    total += calcStreakBonus(streak + (isPerfect ? 1 : 0));

    setResults({ instrumentCorrect, dynamicCorrect, isPerfect, total });

    // Update scores
    if (listener === 1) {
      setP1Score(p => p + total);
      isPerfect ? setP1Streak(p => p + 1) : setP1Streak(0);
    } else {
      setP2Score(p => p + total);
      isPerfect ? setP2Streak(p => p + 1) : setP2Streak(0);
    }

    if (isPerfect) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2500);
    }

    setPhase('reveal');
  };

  // Next round
  const nextRound = () => {
    if (round >= totalRounds) {
      setPhase('gameOver');
    } else {
      setBuilder(builder === 1 ? 2 : 1);
      setRound(r => r + 1);
      startRound();
    }
  };

  // Start game
  const startGame = (rounds) => {
    if (!player1.trim() || !player2.trim()) return;
    setTotalRounds(rounds);
    setRound(1);
    setP1Score(0);
    setP2Score(0);
    setP1Streak(0);
    setP2Streak(0);
    setBuilder(1);
    setPhase('rules');
  };

  // ========== SETUP SCREEN ==========
  if (phase === 'setup') {
    return (
      <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <style>{animationStyles}</style>
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-3 anim-bounce">🎻</div>
          <h1 className="text-3xl font-black text-white mb-2">Strings & Dynamics Lab</h1>
          <p className="text-purple-300 mb-6">Can you identify the instrument AND the dynamic?</p>

          <div className="space-y-3 mb-6">
            <div>
              <label className="text-white/60 text-sm block mb-1">Player 1</label>
              <input
                type="text"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                placeholder="Enter name..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-center text-lg font-bold border-2 border-white/20 focus:border-cyan-400 outline-none"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm block mb-1">Player 2</label>
              <input
                type="text"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                placeholder="Enter name..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-center text-lg font-bold border-2 border-white/20 focus:border-pink-400 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-white/60 text-sm">How many rounds?</p>
            <div className="flex gap-2 justify-center">
              {[4, 6, 8].map(r => (
                <button
                  key={r}
                  onClick={() => startGame(r)}
                  disabled={!player1.trim() || !player2.trim()}
                  className={`px-6 py-3 rounded-xl font-black text-lg transition-all ${
                    player1.trim() && player2.trim()
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-105'
                      : 'bg-white/10 text-white/30'
                  }`}
                >
                  {r} Rounds
                </button>
              ))}
            </div>
          </div>
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
          <h1 className="text-3xl font-black text-white mb-4">How to Play</h1>

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
                  <div className="text-white/70 text-sm">Players switch roles each round</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/20 rounded-xl p-3 mb-4 border border-yellow-400/30">
            <p className="text-yellow-300 font-bold">Get both correct for PERFECT bonus points!</p>
          </div>

          <button
            onClick={startRound}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-lg rounded-xl hover:scale-105 transition-all"
          >
            Start Game!
          </button>
        </div>
      </div>
    );
  }

  // ========== BUILDER PHASE ==========
  if (phase === 'builder') {
    return (
      <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-3">
        <style>{animationStyles}</style>

        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-white/60 text-sm">Round {round}/{totalRounds}</div>
          <div className="flex gap-4">
            <span className="text-cyan-400 font-bold">{player1}: {p1Score}</span>
            <span className="text-pink-400 font-bold">{player2}: {p2Score}</span>
          </div>
        </div>

        {/* Look Away Warning */}
        <div className="bg-red-600/90 rounded-lg px-3 py-2 mb-3 text-center animate-pulse border border-red-400">
          <p className="text-white font-black text-xl">{listenerName}, LOOK AWAY!</p>
        </div>

        <h1 className="text-xl font-black text-white text-center mb-3">
          {builderName}: Pick an Instrument AND a Dynamic
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

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={() => setPhase('handoff')}
            disabled={!selectedInstrument || !selectedDynamic}
            className={`px-6 py-3 rounded-xl font-black text-lg transition-all ${
              selectedInstrument && selectedDynamic
                ? 'bg-white text-gray-900 hover:scale-105 shadow-lg'
                : 'bg-white/10 text-white/30'
            }`}
          >
            Pass to {listenerName} →
          </button>
        </div>
      </div>
    );
  }

  // ========== HANDOFF SCREEN ==========
  if (phase === 'handoff') {
    return (
      <div className="min-h-screen h-full bg-gradient-to-br from-gray-900 to-slate-800 flex items-center justify-center p-3">
        <style>{animationStyles}</style>
        <div className="text-center">
          <div className="text-6xl mb-4 anim-bounce">🎧</div>
          <h1 className="text-3xl font-black text-white mb-3">Pass to {listenerName}!</h1>
          <p className="text-gray-300 text-lg mb-6">
            {builderName} has picked a string instrument and dynamic level
          </p>
          <button
            onClick={() => setPhase('listener')}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-white font-black text-lg rounded-xl hover:scale-105 transition-all shadow-lg"
          >
            Ready to Listen! 👂
          </button>
        </div>
      </div>
    );
  }

  // ========== LISTENER PHASE ==========
  if (phase === 'listener') {
    return (
      <div className="min-h-screen h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-3">
        <style>{animationStyles}</style>

        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-white/60 text-sm">Round {round}/{totalRounds}</div>
          <div className="flex gap-4">
            <span className={`font-bold ${listener === 1 ? 'text-cyan-400' : 'text-white/60'}`}>{player1}: {p1Score}</span>
            <span className={`font-bold ${listener === 2 ? 'text-pink-400' : 'text-white/60'}`}>{player2}: {p2Score}</span>
          </div>
        </div>

        <h1 className="text-xl font-black text-white text-center mb-2">
          {listenerName}: Guess the Instrument AND Dynamic!
        </h1>

        {streak >= 2 && (
          <div className="text-center mb-2">
            <span className="bg-orange-500/30 text-orange-400 px-3 py-1 rounded-full font-bold text-sm">
              🔥 {streak}x Streak!
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
                Played {playCount}x {playCount <= 2 && <span className="text-yellow-300">+10 Quick Bonus!</span>}
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
            onClick={submitGuess}
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
  }

  // ========== REVEAL PHASE ==========
  if (phase === 'reveal' && results) {
    const selectedInst = stringInstruments.find(i => i.id === selectedInstrument);
    const selectedDyn = dynamics.find(d => d.id === selectedDynamic);
    const guessedInst = stringInstruments.find(i => i.id === guessedInstrument);
    const guessedDyn = dynamics.find(d => d.id === guessedDynamic);
    const msg = getResultMessage(results.instrumentCorrect, results.dynamicCorrect, streak);

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
                <div className="text-white/60 text-xs mb-1">Your Guess</div>
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
                <div className="text-white/60 text-xs mb-1">Your Guess</div>
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
              onClick={nextRound}
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
    const winner = p1Score > p2Score ? 1 : p2Score > p1Score ? 2 : 0;
    const winnerName = winner === 1 ? player1 : winner === 2 ? player2 : null;

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
              <div className="text-cyan-400 font-bold">{player1}</div>
              <div className="text-4xl font-black text-white">{p1Score}</div>
            </div>
            <div className={`bg-pink-500/20 rounded-xl p-4 border-2 ${winner === 2 ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-pink-400/30'}`}>
              {winner === 2 && <span className="text-2xl">👑</span>}
              <div className="text-pink-400 font-bold">{player2}</div>
              <div className="text-4xl font-black text-white">{p2Score}</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setPlayer1(''); setPlayer2(''); setPhase('setup'); }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl hover:scale-105 transition-all"
            >
              🔄 Play Again
            </button>
            {onComplete && (
              <button
                onClick={onComplete}
                className="px-6 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30"
              >
                Done ✓
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StringsDynamicsLabActivity;
