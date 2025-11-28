// loop-lab/LoopLabActivity.jsx - Main game component
// Optimized for 1366x768 Chromebook screens
// ✅ UPDATED: Made "look away" message much larger and more prominent
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { loopData, categories, instrumentIcons, categoryThemes, powerUps, scoring, calcStreakBonus, getResultMessage } from './loopLabData';
import { sounds, initAudio } from './loopLabSounds';
import { animationStyles } from './loopLabStyles';
import { Confetti, FloatingScore, AnimatedNumber, PowerUpBadge, StreakFire, GameHeader, InstrumentButton, SelectionDots, ResultCard, ScoreItem, ScoreCard } from './LoopLabComponents';
import { SetupScreen, RulesScreen, GameOverScreen } from './LoopLabScreens';
const LoopLabActivity = ({ onComplete }) => {
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
  const [history, setHistory] = useState([]);
  // Round state
  const [category, setCategory] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [files, setFiles] = useState({});
  const [guesses, setGuesses] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [listened, setListened] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  // Power-ups
  const [powerUp, setPowerUp] = useState(null);
  const [freebie, setFreebie] = useState(null);
  const [powerUpChoices, setPowerUpChoices] = useState([]);
  const [showPowerPick, setShowPowerPick] = useState(false);
  // Results
  const [results, setResults] = useState(null);
  const [revealStep, setRevealStep] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  // Effects
  const [confetti, setConfetti] = useState(false);
  const [floats, setFloats] = useState([]);
  // Categories used
  const [usedCats, setUsedCats] = useState([]);
  // Audio
  const audioRefs = useRef([]);
  // Computed
  const listener = builder === 1 ? 2 : 1;
  const builderName = builder === 1 ? player1 : player2;
  const listenerName = listener === 1 ? player1 : player2;
  const streak = listener === 1 ? p1Streak : p2Streak;
  const theme = category ? categoryThemes[category] : categoryThemes.Heroic;
  // Stop audio
  const stopAudio = useCallback(() => {
    audioRefs.current.forEach(a => { if (a) { a.pause(); a.currentTime = 0; } });
    setPlaying(false);
  }, []);
  useEffect(() => () => stopAudio(), [stopAudio]);
  // Add floating score
  const addFloat = (pts, type = 'normal') => {
    const id = Date.now() + Math.random();
    const x = 683 + (Math.random() - 0.5) * 200;
    const y = 350 + (Math.random() - 0.5) * 80;
    setFloats(p => [...p, { id, pts, x, y, type }]);
    if (pts > 0) sounds.scoreUp();
  };
  // Generate 3 power-ups for draft pick (no duplicates)
  const generatePowerUpChoices = () => {
    const allPowerUps = Object.values(powerUps);
    const shuffled = [...allPowerUps].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };
  // Start new round
  const startRound = useCallback((roundNum) => {
    const currentRound = roundNum || round;
    console.log('🎮 Starting round:', currentRound, 'showPowerPick:', currentRound > 1);
    stopAudio();
    let avail = categories.filter(c => !usedCats.includes(c));
    if (avail.length === 0) { avail = categories; setUsedCats([]); }
    const cat = avail[Math.floor(Math.random() * avail.length)];
    setCategory(cat);
    setUsedCats(p => [...p, cat]);
    const insts = Object.keys(loopData[cat]);
    setInstruments(insts);
    const f = {};
    insts.forEach(i => {
      const opts = loopData[cat][i];
      f[i] = opts[Math.floor(Math.random() * opts.length)];
    });
    setFiles(f);
    // Reset power-up state - will be set in powerPick phase
    setPowerUp(null);
    setPowerUpChoices([]);
    setShowPowerPick(currentRound > 1); // Show power pick after round 1
    setSelected([]);
    setGuesses([]);
    setListened(false);
    setPlayCount(0);
    setResults(null);
    setRevealStep(0);
    setShowBreakdown(false);
    setFreebie(null);
    setPhase('builder');
  }, [usedCats, stopAudio, round]);
  // Toggle instrument
  const toggleInst = (inst) => {
    sounds.select();
    setSelected(p => {
      if (p.includes(inst)) return p.filter(i => i !== inst);
      if (p.length < 3) return [...p, inst];
      return p;
    });
  };
  // Toggle guess
  const toggleGuess = (inst) => {
    if (inst === freebie) return;
    sounds.select();
    setGuesses(p => {
      if (p.includes(inst)) return p.filter(i => i !== inst);
      if (p.length < 3) return [...p, inst];
      return p;
    });
  };
  // Play mix
  const playMix = () => {
    stopAudio();
    audioRefs.current = [];
    selected.forEach(inst => {
      const audio = new Audio(files[inst]);
      audio.loop = true;
      audio.volume = 0.7;
      audioRefs.current.push(audio);
      audio.play().catch(() => {});
    });
    setPlaying(true);
    setListened(true);
    setPlayCount(p => p + 1);
  };
  // Use freebie
  const useFreebie = () => {
    if (powerUp?.id === 'freebie' && !freebie && selected.length > 0) {
      const f = selected[Math.floor(Math.random() * selected.length)];
      setFreebie(f);
      setGuesses(p => [...p, f]);
      sounds.correct();
    }
  };
  // Select a power-up from visible choices
  const selectPowerUp = (pu) => {
    sounds.powerUp();
    setPowerUp(pu);
    // Continue to listener phase after short delay
    setTimeout(() => {
      setPhase('listener');
    }, 800);
  };
  // Enter power pick phase
  const enterPowerPick = () => {
    const choices = generatePowerUpChoices();
    setPowerUpChoices(choices);
    setPhase('powerPick');
  };
  // Submit guesses
  const submit = () => {
    stopAudio();
    setPhase('reveal');
    const correct = guesses.filter(g => selected.includes(g));
    const wrong = guesses.filter(g => !selected.includes(g));
    const isPerfect = correct.length === selected.length && wrong.length === 0;
    let correctPts = correct.length * scoring.correct;
    let wrongPts = wrong.length * scoring.wrong;
    if (powerUp?.id === 'shield') wrongPts = 0;
    const quickBonus = playCount <= 2 ? scoring.quick : 0;
    const perfectBonus = isPerfect ? scoring.perfect : 0;
    const streakBonus = calcStreakBonus(streak + (isPerfect ? 1 : 0));
    let total = Math.max(0, correctPts - wrongPts + quickBonus + perfectBonus + streakBonus);
    if (powerUp?.id === 'bonus') total += 15;
    if (powerUp?.id === 'double') total *= 2;
    setResults({ correct, wrong, isPerfect, correctPts, wrongPts, quickBonus, perfectBonus, streakBonus, total });
    // Animated reveal
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setRevealStep(step);
      if (step <= guesses.length) {
        const g = guesses[step - 1];
        if (selected.includes(g)) {
          sounds.correct();
          addFloat(scoring.correct);
        } else {
          sounds.wrong();
          addFloat(-scoring.wrong, 'wrong');
        }
      }
      if (step === guesses.length + 1) {
        setShowBreakdown(true);
        // Play score counting sounds
        let ticks = 0;
        const tickInterval = setInterval(() => {
          sounds.scoreTick();
          ticks++;
          if (ticks >= 8) clearInterval(tickInterval);
        }, 80);
        setTimeout(() => sounds.scoreTotal(), 700);
        if (isPerfect) {
          sounds.perfect();
          setConfetti(true);
          addFloat(scoring.perfect, 'perfect');
          setTimeout(() => setConfetti(false), 2500);
        }
      }
      if (step === guesses.length + 2) {
        sounds.roundEnd();
        if (listener === 1) {
          setP1Score(p => p + total);
          isPerfect ? setP1Streak(p => p + 1) : (correct.length === 0 && setP1Streak(0));
        } else {
          setP2Score(p => p + total);
          isPerfect ? setP2Streak(p => p + 1) : (correct.length === 0 && setP2Streak(0));
        }
        setHistory(p => [...p, { round, listener, pts: total, isPerfect }]);
      }
      if (step >= guesses.length + 3) clearInterval(interval);
    }, 500);
  };
  // Next round
  const nextRound = () => {
    if (round >= totalRounds) {
      sounds.victory();
      setPhase('gameOver');
    } else {
      setBuilder(builder === 1 ? 2 : 1);
      const newRound = round + 1;
      setRound(newRound);
      startRound(newRound); // Pass new round number since setState is async
    }
  };
  // Start game
  const startGame = (rounds) => {
    if (!player1.trim() || !player2.trim()) return;
    initAudio();
    sounds.start();
    setTotalRounds(rounds);
    setRound(1);
    setP1Score(0);
    setP2Score(0);
    setP1Streak(0);
    setP2Streak(0);
    setHistory([]);
    setBuilder(1);
    setUsedCats([]);
    setPhase('rules');
  };
  // ========== SETUP SCREEN ==========
  if (phase === 'setup') {
    return <SetupScreen player1={player1} player2={player2} setPlayer1={setPlayer1} setPlayer2={setPlayer2} startGame={startGame} />;
  }
  // ========== RULES SCREEN ==========
  if (phase === 'rules') {
    return <RulesScreen player1={player1} player2={player2} startRound={startRound} />;
  }
  // ========== BUILDER PHASE ==========
  if (phase === 'builder') {
    return (
      <div className={`h-full bg-gradient-to-br ${theme.bg} p-2`}>
        <style>{animationStyles}</style>
        <GameHeader round={round} totalRounds={totalRounds} powerUp={powerUp} p1Name={player1} p1Score={p1Score} p2Name={player2} p2Score={p2Score} currentListener={listener} />
        
        {/* ✅ LARGE "LOOK AWAY" WARNING - Very prominent at top */}
        <div className="bg-red-600/90 rounded-xl p-2 mb-2 text-center animate-pulse shadow-lg border-2 border-red-400">
          <p className="text-white font-black text-2xl">
            🙈 {listenerName}, LOOK AWAY! 🙈
          </p>
        </div>
        
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full mb-2">
            <span className="text-2xl">{theme.emoji}</span>
            <span className="text-white font-bold text-base">{theme.name}</span>
          </div>
          <h1 className="text-xl font-black text-white">🔨 {builderName}: Pick 1-3 Instruments</h1>
        </div>
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {instruments.map(inst => (
              <InstrumentButton key={inst} instrument={inst} icon={instrumentIcons[inst]}
                isSelected={selected.includes(inst)} isDisabled={selected.length >= 3 && !selected.includes(inst)}
                onClick={() => toggleInst(inst)} />
            ))}
          </div>
          <SelectionDots count={selected.length} />
          <div className="text-center mt-3">
            <button onClick={() => { sounds.click(); setPhase('handoff'); }} disabled={selected.length === 0}
              className={`px-6 py-3 rounded-xl font-black text-base ${selected.length > 0 ? 'bg-white text-gray-900 hover:scale-105 shadow-lg' : 'bg-white/10 text-white/30'} transition-all`}>
              🎧 Pass to {listenerName} →
            </button>
          </div>
        </div>
      </div>
    );
  }
  // ========== HANDOFF SCREEN ==========
  if (phase === 'handoff') {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 to-slate-800 flex items-center justify-center p-3">
        <style>{animationStyles}</style>
        <div className="text-center">
          <div className="text-6xl mb-4 anim-bounce">🎧</div>
          <h1 className="text-3xl font-black text-white mb-3">Pass to {listenerName}!</h1>
          <p className="text-gray-300 text-lg mb-4">{builderName} picked <span className="text-purple-400 font-bold">{selected.length}</span> instrument{selected.length > 1 ? 's' : ''}</p>
          {showPowerPick && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 mb-4 border border-purple-400/30">
              <p className="text-purple-300 font-bold text-base">⚡ Choose your power-up next!</p>
            </div>
          )}
          <button onClick={() => { sounds.click(); showPowerPick ? enterPowerPick() : setPhase('listener'); }}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-white font-black text-lg rounded-xl hover:scale-105 transition-all shadow-lg">
            {showPowerPick ? '⚡ Choose Power-Up!' : 'Ready! 👂'}
          </button>
        </div>
      </div>
    );
  }
  // ========== POWER PICK PHASE ==========
  if (phase === 'powerPick') {
    const listenerScore = listener === 1 ? p1Score : p2Score;
    const opponentScore = listener === 1 ? p2Score : p1Score;
    const scoreDiff = listenerScore - opponentScore;
    const currentStreak = listener === 1 ? p1Streak : p2Streak;
    
    // Strategy hints based on game state
    const getHint = (pu) => {
      if (pu.id === 'double' && currentStreak >= 2) return '🔥 Great with your streak!';
      if (pu.id === 'double' && scoreDiff < -15) return '📈 Comeback potential!';
      if (pu.id === 'shield' && scoreDiff > 15) return '🛡️ Protect your lead!';
      if (pu.id === 'hint') return '🤔 Know the count!';
      if (pu.id === 'bonus' && scoreDiff < 0) return '💰 Safe points!';
      if (pu.id === 'freebie') return '✅ Guaranteed correct!';
      return null;
    };
    
    return (
      <div className="h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-3">
        <style>{animationStyles}</style>
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">⚡</div>
            <h1 className="text-2xl font-black text-white mb-1">{listenerName}, Choose Your Power-Up!</h1>
            <div className="flex justify-center gap-3 text-sm">
              <span className={listener === 1 ? 'text-cyan-400' : 'text-pink-400'}>
                Your score: <span className="font-bold">{listenerScore}</span>
              </span>
              <span className="text-white/50">vs</span>
              <span className={listener === 1 ? 'text-pink-400' : 'text-cyan-400'}>
                {listener === 1 ? player2 : player1}: <span className="font-bold">{opponentScore}</span>
              </span>
            </div>
            {currentStreak >= 2 && (
              <div className="mt-1">
                <span className="text-orange-400 font-bold text-sm">🔥 {currentStreak}x Streak!</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            {powerUpChoices.map((pu, i) => {
              const hint = getHint(pu);
              return (
                <button
                  key={pu.id}
                  onClick={() => selectPowerUp(pu)}
                  className={`bg-gradient-to-br ${pu.color} rounded-xl p-3 text-center transition-all hover:scale-105 hover:-translate-y-1 shadow-lg border-2 border-white/20 hover:border-white/50`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-4xl mb-2">{pu.emoji}</div>
                  <div className="text-white font-black text-base mb-0.5">{pu.name}</div>
                  <div className="text-white/80 text-xs mb-1">{pu.desc}</div>
                  {hint && (
                    <div className="bg-black/30 rounded px-1.5 py-0.5 text-[10px] text-yellow-300 font-bold">
                      {hint}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="text-center text-white/50 text-xs">
            <p>Pick wisely based on your situation!</p>
          </div>
        </div>
      </div>
    );
  }
  // ========== LISTENER PHASE ==========
  if (phase === 'listener') {
    return (
      <div className={`h-full bg-gradient-to-br ${theme.bg} p-2`}>
        <style>{animationStyles}</style>
        <GameHeader round={round} totalRounds={totalRounds} powerUp={powerUp} p1Name={player1} p1Score={p1Score} p2Name={player2} p2Score={p2Score} currentListener={listener} />
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-1 rounded-full mb-1">
            <span className="text-2xl">{theme.emoji}</span>
            <span className="text-white font-bold text-base">{theme.name}</span>
          </div>
          <h1 className="text-xl font-black text-white">👂 {listenerName}: Guess the Instruments!</h1>
          <div className="flex justify-center items-center gap-2 mt-1">
            {streak >= 2 && <StreakFire streak={streak} />}
            {powerUp && <PowerUpBadge powerUp={powerUp} active />}
          </div>
        </div>
        {/* Power-up hints */}
        {powerUp?.id === 'hint' && (
          <div className="max-w-lg mx-auto mb-2">
            <div className="bg-purple-500/30 rounded-lg px-3 py-2 text-center">
              <p className="text-purple-200 font-bold text-sm">💡 There are {selected.length} instruments!</p>
            </div>
          </div>
        )}
        {powerUp?.id === 'freebie' && !freebie && (
          <div className="max-w-lg mx-auto mb-2 text-center">
            <button onClick={useFreebie} className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:scale-105 text-sm">
              🎯 Use Freebie - Reveal One!
            </button>
          </div>
        )}
        {freebie && (
          <div className="max-w-lg mx-auto mb-2">
            <div className="bg-green-500/30 rounded-lg px-3 py-2 text-center">
              <p className="text-green-200 font-bold text-sm">🎯 Free: {instrumentIcons[freebie]} {freebie}</p>
            </div>
          </div>
        )}
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-3">
            <button onClick={playing ? stopAudio : playMix}
              className={`px-8 py-3 rounded-xl font-black text-lg ${playing ? 'bg-red-500 text-white' : 'bg-white text-gray-900'} shadow-lg hover:scale-105 transition-all`}>
              {playing ? '⏹️ Stop' : '▶️ Play Mix'}
            </button>
            <div className="mt-2 text-sm">
              {listened ? (
                <span className="text-green-400 font-bold">✓ Played {playCount}x {playCount <= 2 && <span className="text-yellow-300">+10 Quick Bonus!</span>}</span>
              ) : (
                <span className="text-white/50">Listen to the mix first!</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {instruments.map(inst => (
              <InstrumentButton key={inst} instrument={inst} icon={instrumentIcons[inst]}
                isSelected={guesses.includes(inst)} isDisabled={(!listened || guesses.length >= 3) && !guesses.includes(inst)}
                isFreebie={inst === freebie} onClick={() => toggleGuess(inst)} />
            ))}
          </div>
          <SelectionDots count={guesses.length} />
          <div className="text-center mt-3">
            <button onClick={submit} disabled={!listened || guesses.length === 0}
              className={`px-6 py-3 rounded-xl font-black text-base ${listened && guesses.length > 0 ? 'bg-white text-gray-900 hover:scale-105 shadow-lg' : 'bg-white/10 text-white/30'} transition-all`}>
              Submit Guess ({guesses.length}) ✓
            </button>
          </div>
        </div>
      </div>
    );
  }
  // ========== REVEAL PHASE ==========
  if (phase === 'reveal' && results) {
    const msg = getResultMessage(results.correct.length, selected.length, results.isPerfect, streak);
    return (
      <div className={`h-full bg-gradient-to-br ${theme.bg} p-2`}>
        <style>{animationStyles}</style>
        <Confetti active={confetti} count={25} />
        {floats.map(f => <FloatingScore key={f.id} points={f.pts} x={f.x} y={f.y} type={f.type} onDone={() => setFloats(p => p.filter(x => x.id !== f.id))} />)}
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-3">
            <div className={`text-5xl mb-2 ${results.isPerfect ? 'anim-bounce' : ''}`}>
              {results.isPerfect ? '🎉' : results.correct.length >= 2 ? '👏' : '💪'}
            </div>
            <h1 className={`text-2xl font-black ${msg.color}`}>{msg.text}</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-black/30 rounded-xl p-3">
              <h2 className="text-sm font-bold text-white mb-2">🔨 Answer</h2>
              <div className="space-y-1.5">
                {selected.map((inst, i) => (
                  <div key={inst} className="flex items-center gap-2 bg-purple-500/30 rounded-lg p-2 border border-purple-400 anim-slide-l" style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="text-xl">{instrumentIcons[inst]}</span>
                    <span className="text-white font-bold text-sm">{inst}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-3">
              <h2 className="text-sm font-bold text-white mb-2">👂 Guesses</h2>
              <div className="space-y-1.5">
                {guesses.map((inst, i) => (
                  <ResultCard key={inst} instrument={inst} icon={instrumentIcons[inst]}
                    isCorrect={selected.includes(inst)} isRevealed={revealStep > i} delay={i * 100} />
                ))}
              </div>
            </div>
          </div>
          {showBreakdown && (
            <div className="bg-black/40 rounded-xl p-3 mb-3 anim-slide-up">
              <h3 className="text-sm font-bold text-white mb-2 text-center">{listenerName}'s Score</h3>
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                {results.correctPts > 0 && <ScoreItem value={results.correctPts} label="Correct" color="green" />}
                {results.wrongPts > 0 && <ScoreItem value={-results.wrongPts} label="Wrong" color="red" />}
                {results.quickBonus > 0 && <ScoreItem value={results.quickBonus} label="Quick" color="purple" emoji="⚡" />}
                {results.perfectBonus > 0 && <ScoreItem value={results.perfectBonus} label="Perfect" color="yellow" emoji="⭐" />}
                {results.streakBonus > 0 && <ScoreItem value={results.streakBonus} label="Streak" color="orange" emoji="🔥" />}
                {powerUp?.id === 'bonus' && <ScoreItem value={15} label="Bonus" color="green" emoji="🎁" />}
                {powerUp?.id === 'double' && <div className="bg-yellow-500/20 rounded-lg px-3 py-2 text-center"><div className="text-lg font-black text-yellow-400">×2</div><div className="text-xs text-yellow-200">Double!</div></div>}
              </div>
              <div className="text-center border-t border-white/20 pt-2">
                <span className="text-white/60 text-base">Total: </span>
                <span className="text-3xl font-black text-white">+<AnimatedNumber value={results.total} duration={800} onTick={() => sounds.scoreTick()} onComplete={() => sounds.scoreTotal()} /></span>
              </div>
            </div>
          )}
          {revealStep > guesses.length + 1 && (
            <div className="text-center anim-pop">
              <button onClick={() => setPhase('summary')} className="px-6 py-3 bg-white text-gray-900 font-black text-base rounded-xl hover:scale-105 transition-all shadow-lg">
                Continue →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  // ========== ROUND SUMMARY ==========
  if (phase === 'summary' && results) {
    const isLast = round >= totalRounds;
    const nextB = builder === 1 ? 2 : 1;
    const leader = p1Score > p2Score ? 1 : p2Score > p1Score ? 2 : 0;
    return (
      <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3">
        <style>{animationStyles}</style>
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-3">
            <div className="text-4xl mb-2">🎉</div>
            <h1 className="text-2xl font-black text-white mb-1">Round {round} Complete!</h1>
            {leader > 0 && (
              <p className="text-base text-yellow-400 font-bold">
                {leader === 1 ? player1 : player2} is in the lead!
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className={`bg-cyan-500/20 rounded-xl p-3 border-2 ${leader === 1 ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-cyan-400/30'}`}>
              <div className="flex items-center justify-center gap-1 mb-1">
                {leader === 1 && <span className="text-xl">👑</span>}
                <span className="text-cyan-400 font-bold text-lg">{player1}</span>
              </div>
              <div className="text-4xl font-black text-white text-center">
                <AnimatedNumber value={p1Score} duration={1000} onTick={() => sounds.scoreTick()} onComplete={() => sounds.scoreTotal()} />
              </div>
              {p1Streak >= 2 && <div className="flex justify-center mt-1"><StreakFire streak={p1Streak} /></div>}
              {listener === 1 && results.total > 0 && (
                <div className="text-green-400 text-base font-bold mt-1 text-center">+{results.total} this round</div>
              )}
            </div>
            <div className={`bg-pink-500/20 rounded-xl p-3 border-2 ${leader === 2 ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-pink-400/30'}`}>
              <div className="flex items-center justify-center gap-1 mb-1">
                {leader === 2 && <span className="text-xl">👑</span>}
                <span className="text-pink-400 font-bold text-lg">{player2}</span>
              </div>
              <div className="text-4xl font-black text-white text-center">
                <AnimatedNumber value={p2Score} duration={1000} onTick={() => sounds.scoreTick()} onComplete={() => sounds.scoreTotal()} />
              </div>
              {p2Streak >= 2 && <div className="flex justify-center mt-1"><StreakFire streak={p2Streak} /></div>}
              {listener === 2 && results.total > 0 && (
                <div className="text-green-400 text-base font-bold mt-1 text-center">+{results.total} this round</div>
              )}
            </div>
          </div>
          {!isLast && (
            <div className="bg-white/10 rounded-xl p-3 mb-4">
              <p className="text-white/60 text-sm mb-2 text-center">Next Round - Roles Swap!</p>
              <div className="flex justify-center items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-0.5">🔨</div>
                  <div className="text-xs text-white/50">Builder</div>
                  <div className={`font-bold text-base ${nextB === 1 ? 'text-cyan-400' : 'text-pink-400'}`}>{nextB === 1 ? player1 : player2}</div>
                </div>
                <div className="text-white/30 text-xl">→</div>
                <div className="text-center">
                  <div className="text-2xl mb-0.5">👂</div>
                  <div className="text-xs text-white/50">Listener</div>
                  <div className={`font-bold text-base ${nextB === 1 ? 'text-pink-400' : 'text-cyan-400'}`}>{nextB === 1 ? player2 : player1}</div>
                </div>
              </div>
            </div>
          )}
          <div className="text-center">
            <button onClick={nextRound} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-lg rounded-xl hover:scale-105 transition-all shadow-lg">
              {isLast ? '🏆 See Results' : `Round ${round + 1} →`}
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
    const perfects = history.filter(h => h.isPerfect).length;
    return (
      <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-3">
        <style>{animationStyles}</style>
        <Confetti active count={40} />
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h1 className="text-2xl font-black text-white mb-1">Game Over!</h1>
          <p className="text-lg text-yellow-400 font-bold mb-4">
            {winner === 0 ? "It's a TIE!" : `${winnerName} Wins!`}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`bg-cyan-500/20 rounded-xl p-3 border-2 ${winner === 1 ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-cyan-400/30'}`}>
              <div className="flex items-center justify-center gap-1 mb-1">
                {winner === 1 && <span className="text-xl">👑</span>}
                <span className="text-cyan-400 font-bold text-sm">{player1}</span>
              </div>
              <div className="text-3xl font-black text-white text-center"><AnimatedNumber value={p1Score} duration={1200} /></div>
            </div>
            <div className={`bg-pink-500/20 rounded-xl p-3 border-2 ${winner === 2 ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-pink-400/30'}`}>
              <div className="flex items-center justify-center gap-1 mb-1">
                {winner === 2 && <span className="text-xl">👑</span>}
                <span className="text-pink-400 font-bold text-sm">{player2}</span>
              </div>
              <div className="text-3xl font-black text-white text-center"><AnimatedNumber value={p2Score} duration={1200} /></div>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-2 mb-4">
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <div className="text-xl">⭐</div>
                <div className="text-lg font-black text-yellow-400">{perfects}</div>
                <div className="text-white/50 text-xs">Perfect</div>
              </div>
              <div className="text-center">
                <div className="text-xl">🔥</div>
                <div className="text-lg font-black text-orange-400">{Math.max(p1Streak, p2Streak)}</div>
                <div className="text-white/50 text-xs">Streak</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setPlayer1(''); setPlayer2(''); setPhase('setup'); }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl hover:scale-105 transition-all text-sm">
              🔄 Again
            </button>
            {onComplete && (
              <button onClick={onComplete} className="px-4 py-2 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 text-sm">
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
export default LoopLabActivity;