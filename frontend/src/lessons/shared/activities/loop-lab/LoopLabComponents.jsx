// loop-lab/LoopLabComponents.jsx - Reusable UI components

import React, { useState, useEffect } from 'react';

// Confetti - optimized with fewer particles for Chromebooks
export const Confetti = ({ active, count = 30 }) => {
  if (!active) return null;
  
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 6
  }));
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute anim-fall"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '2px',
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
};

// Floating score popup
export const FloatingScore = ({ points, x, y, type, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 800);
    return () => clearTimeout(timer);
  }, [onDone]);
  
  const color = type === 'bonus' ? 'text-yellow-400' : 
                type === 'perfect' ? 'text-purple-400' :
                points > 0 ? 'text-green-400' : 'text-red-400';
  
  return (
    <div 
      className={`fixed pointer-events-none z-50 font-black text-3xl anim-float ${color}`}
      style={{ left: x, top: y, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
    >
      {points > 0 ? '+' : ''}{points}
      {type === 'perfect' && ' ⭐'}
    </div>
  );
};

// Animated number (simpler for performance)
export const AnimatedNumber = ({ value, duration = 600, onTick, onComplete }) => {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    if (duration === 0) {
      setDisplay(value);
      return;
    }
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = Date.now();
    let lastTick = 0;
    let completed = false;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      const newVal = Math.round(start + diff * eased);
      setDisplay(newVal);
      
      // Call onTick for sound effects every ~80ms
      if (onTick && elapsed - lastTick > 80 && progress < 1) {
        onTick();
        lastTick = elapsed;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (!completed) {
        completed = true;
        if (onComplete) onComplete();
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span className="anim-count">{display}</span>;
};

// Power-up badge
export const PowerUpBadge = ({ powerUp, active }) => {
  if (!powerUp) return null;
  
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${powerUp.color} text-white font-bold text-base shadow-lg ${active ? 'anim-glow anim-bounce' : ''}`}>
      <span className="text-xl">{powerUp.emoji}</span>
      <span>{powerUp.name}</span>
    </div>
  );
};

// Streak fire display
export const StreakFire = ({ streak }) => {
  if (streak < 2) return null;
  const flames = Math.min(streak, 4);
  
  return (
    <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 rounded-full">
      {Array.from({ length: flames }).map((_, i) => (
        <span key={i} className="text-lg">🔥</span>
      ))}
      <span className="text-white font-bold text-base ml-1">{streak}x</span>
    </div>
  );
};

// Score card for a player
export const ScoreCard = ({ name, score, isActive, isLeader, streak, color, pointsThisRound, showAnimation }) => {
  const borderColor = color === 'cyan' ? 'border-cyan-400' : 'border-pink-400';
  const textColor = color === 'cyan' ? 'text-cyan-400' : 'text-pink-400';
  const bgGrad = color === 'cyan' ? 'from-cyan-500/20 to-blue-600/20' : 'from-pink-500/20 to-purple-600/20';
  
  return (
    <div className={`bg-gradient-to-br ${bgGrad} rounded-xl p-4 border-2 ${isActive ? `${borderColor} ring-2 ring-opacity-50` : 'border-white/20'}`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        {isLeader && <span className="text-2xl">👑</span>}
        <span className={`${textColor} font-bold text-lg truncate`}>{name}</span>
      </div>
      <div className="text-4xl font-black text-white text-center">
        <AnimatedNumber value={score} duration={showAnimation ? 800 : 0} />
      </div>
      {streak >= 2 && <div className="flex justify-center mt-2"><StreakFire streak={streak} /></div>}
      {pointsThisRound > 0 && (
        <div className="text-green-400 text-base font-bold mt-2 text-center">+{pointsThisRound}</div>
      )}
    </div>
  );
};

// Header bar with round and scores
export const GameHeader = ({ round, totalRounds, powerUp, p1Name, p1Score, p2Name, p2Score, currentListener }) => (
  <div className="flex justify-between items-center mb-3 px-1">
    <div className="flex items-center gap-3">
      <div className="bg-black/40 px-4 py-2 rounded-lg">
        <span className="text-white font-bold text-base">Round {round}/{totalRounds}</span>
      </div>
      {powerUp && <PowerUpBadge powerUp={powerUp} active />}
    </div>
    
    <div className="flex gap-3">
      <div className={`bg-black/40 px-3 py-2 rounded-lg ${currentListener === 1 ? 'ring-2 ring-cyan-400' : ''}`}>
        <span className="text-cyan-400 font-bold text-sm">{p1Name}: </span>
        <span className="text-white font-black text-base">{p1Score}</span>
      </div>
      <div className={`bg-black/40 px-3 py-2 rounded-lg ${currentListener === 2 ? 'ring-2 ring-pink-400' : ''}`}>
        <span className="text-pink-400 font-bold text-sm">{p2Name}: </span>
        <span className="text-white font-black text-base">{p2Score}</span>
      </div>
    </div>
  </div>
);

// Instrument button
export const InstrumentButton = ({ instrument, icon, isSelected, isDisabled, isFreebie, onClick }) => {
  let classes = 'p-4 rounded-xl text-center transition-all ';
  
  if (isFreebie) {
    classes += 'bg-green-500 text-white ring-2 ring-green-300 scale-105';
  } else if (isSelected) {
    classes += 'bg-white text-gray-900 scale-105 shadow-lg ring-2 ring-white/50';
  } else if (isDisabled) {
    classes += 'bg-white/10 text-white/30 cursor-not-allowed';
  } else {
    classes += 'bg-white/20 text-white hover:bg-white/30 hover:scale-102 cursor-pointer';
  }
  
  return (
    <button onClick={onClick} disabled={isDisabled && !isSelected} className={classes}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="font-bold text-sm leading-tight">{instrument}</div>
      {isFreebie && <div className="text-xs font-bold mt-1">🎯 FREE</div>}
    </button>
  );
};

// Selection indicator dots
export const SelectionDots = ({ count, max = 3 }) => (
  <div className="flex justify-center gap-3 my-3">
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={`w-14 h-3 rounded-full transition-all ${
          count > i ? 'bg-white shadow-lg' : 'bg-white/20'
        }`}
      />
    ))}
  </div>
);

// Result card for reveal
export const ResultCard = ({ instrument, icon, isCorrect, isRevealed, delay }) => (
  <div 
    className={`flex items-center gap-3 rounded-lg p-3 border transition-all ${
      isRevealed
        ? isCorrect
          ? 'bg-green-500/30 border-green-400 anim-slide-l'
          : 'bg-red-500/30 border-red-400 anim-shake'
        : 'bg-white/10 border-white/20'
    }`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-white font-bold text-base flex-1">{instrument}</span>
    {isRevealed && (
      <span className={`font-black text-xl ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
        {isCorrect ? '+15' : '-5'}
      </span>
    )}
  </div>
);

// Score breakdown item
export const ScoreItem = ({ value, label, color, delay = 0, emoji }) => (
  <div 
    className={`bg-${color}-500/20 rounded-lg px-4 py-3 text-center anim-pop`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`text-xl font-black text-${color}-400`}>
      {emoji && <span className="mr-1">{emoji}</span>}
      {value > 0 ? '+' : ''}{value}
    </div>
    <div className={`text-sm text-${color}-200`}>{label}</div>
  </div>
);