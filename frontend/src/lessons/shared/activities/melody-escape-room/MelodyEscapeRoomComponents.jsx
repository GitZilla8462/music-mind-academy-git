// melody-escape-room/MelodyEscapeRoomComponents.jsx - Reusable UI components
import React, { useState, useEffect } from 'react';

// Animation styles
export const animationStyles = `
@keyframes pop {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
}
@keyframes unlock {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-15deg) scale(1.1); }
  50% { transform: rotate(15deg) scale(1.1); }
  75% { transform: rotate(-5deg) scale(1.05); }
  100% { transform: rotate(0deg) scale(1); opacity: 0; }
}
.anim-pop { animation: pop 0.3s ease-out forwards; }
.anim-shake { animation: shake 0.4s ease-out; }
.anim-pulse { animation: pulse 1.5s ease-in-out infinite; }
.anim-slide-up { animation: slideUp 0.4s ease-out forwards; }
.anim-float { animation: float 2s ease-in-out infinite; }
.anim-glow { animation: glow 1.5s ease-in-out infinite; }
.anim-unlock { animation: unlock 0.6s ease-out forwards; }
`;

// Simple confetti effect (Chromebook-friendly - limited particles)
export const Confetti = ({ active, count = 25 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const colors = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'];
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random()
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 3000);
    }
  }, [active, count]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            backgroundColor: p.color,
            animation: `fall ${p.duration}s ease-out ${p.delay}s forwards`
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Lock component for solver mode
export const Lock = ({
  index,
  isUnlocked,
  isActive,
  lockColor = 'amber',
  onClick,
  listenCount,
  maxListens
}) => {
  const colorMap = {
    amber: { bg: 'from-amber-600 to-yellow-500', border: 'border-amber-400', text: 'text-amber-400' },
    cyan: { bg: 'from-cyan-600 to-blue-500', border: 'border-cyan-400', text: 'text-cyan-400' },
    yellow: { bg: 'from-yellow-500 to-amber-400', border: 'border-yellow-300', text: 'text-yellow-300' },
    purple: { bg: 'from-purple-600 to-pink-500', border: 'border-purple-400', text: 'text-purple-400' },
    teal: { bg: 'from-teal-600 to-cyan-500', border: 'border-teal-400', text: 'text-teal-400' },
    orange: { bg: 'from-orange-600 to-red-500', border: 'border-orange-400', text: 'text-orange-400' }
  };

  const colors = colorMap[lockColor] || colorMap.amber;

  if (isUnlocked) {
    return (
      <div className="relative w-20 h-24 flex flex-col items-center justify-center opacity-50">
        <div className="text-4xl anim-unlock">🔓</div>
        <div className="text-xs text-green-400 font-bold mt-1">UNLOCKED</div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative w-20 h-24 rounded-xl flex flex-col items-center justify-center transition-all
        ${isActive
          ? `bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-lg scale-105`
          : 'bg-gray-700/50 border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-700'
        }`}
    >
      <div className={`text-3xl ${isActive ? 'anim-float' : ''}`}>
        🔒
      </div>
      <div className={`text-xs font-bold mt-1 ${isActive ? colors.text : 'text-gray-400'}`}>
        Lock {index + 1}
      </div>
      {listenCount !== undefined && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center">
          <span className={`text-xs font-bold ${listenCount >= maxListens ? 'text-red-400' : 'text-gray-300'}`}>
            {maxListens - listenCount}
          </span>
        </div>
      )}
    </button>
  );
};

// Loop card for creator mode
export const LoopCard = ({
  loop,
  isSelected,
  selectionOrder,
  onClick,
  onPreview,
  isPlaying
}) => {
  return (
    <div
      className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer
        ${isSelected
          ? 'bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-purple-400 shadow-lg'
          : 'bg-gray-800/50 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
        }`}
      onClick={onClick}
    >
      {/* Selection order badge */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">{selectionOrder}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-2xl">{loop.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm truncate">{loop.instrument}</div>
          <div className="text-gray-400 text-xs">{loop.category}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
            ${isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gray-600 hover:bg-gray-500'
            }`}
        >
          {isPlaying ? '⏹' : '▶️'}
        </button>
      </div>
    </div>
  );
};

// Theme selector for creator mode
export const ThemeSelector = ({ themes, selectedTheme, onSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {themes.map(theme => (
        <button
          key={theme.id}
          onClick={() => onSelect(theme)}
          className={`p-4 rounded-xl border-2 transition-all
            ${selectedTheme?.id === theme.id
              ? `bg-gradient-to-br ${theme.bg} border-white/50 shadow-lg`
              : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
            }`}
        >
          <div className="text-3xl mb-1">{theme.emoji}</div>
          <div className="text-white font-bold text-sm">{theme.name}</div>
        </button>
      ))}
    </div>
  );
};

// Share code display
export const ShareCodeDisplay = ({ code, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <div className="text-gray-400 text-sm mb-2">Share this code with a partner:</div>
      <div className="flex items-center justify-center gap-3">
        <div className="text-3xl font-mono font-black text-white tracking-widest bg-gray-900 px-6 py-3 rounded-lg">
          {code}
        </div>
        <button
          onClick={handleCopy}
          className={`px-4 py-3 rounded-lg font-bold transition-all
            ${copied
              ? 'bg-green-500 text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
    </div>
  );
};

// Timer display
export const Timer = ({ seconds, isWarning }) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className={`font-mono text-2xl font-bold ${isWarning ? 'text-red-400 anim-pulse' : 'text-white'}`}>
      {minutes}:{secs.toString().padStart(2, '0')}
    </div>
  );
};

// Score display
export const ScoreDisplay = ({ score, penalties }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <div className="text-gray-400 text-xs">SCORE</div>
        <div className="text-2xl font-black text-green-400">{score}</div>
      </div>
      {penalties > 0 && (
        <div className="text-center">
          <div className="text-gray-400 text-xs">PENALTIES</div>
          <div className="text-lg font-bold text-red-400">-{penalties}</div>
        </div>
      )}
    </div>
  );
};

// Hint button and display
export const HintButton = ({ hint, isRevealed, onReveal, penaltyCost }) => {
  if (!hint) return null;

  if (isRevealed) {
    return (
      <div className="bg-purple-500/20 border border-purple-400/50 rounded-lg px-4 py-2">
        <div className="text-purple-300 text-sm">
          💡 <span className="font-medium">{hint}</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onReveal}
      className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50
                 rounded-lg px-4 py-2 transition-all text-purple-300 text-sm"
    >
      💡 Reveal Hint (-{penaltyCost} pts)
    </button>
  );
};

// Answer input
export const AnswerInput = ({
  value,
  onChange,
  onSubmit,
  isCorrect,
  isWrong,
  disabled
}) => {
  return (
    <div className={`relative ${isWrong ? 'anim-shake' : ''}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        disabled={disabled}
        placeholder="Type the instrument name..."
        className={`w-full px-4 py-3 rounded-xl bg-gray-800 border-2 text-white font-medium
          placeholder:text-gray-500 focus:outline-none transition-all
          ${isCorrect ? 'border-green-400 bg-green-900/30' : ''}
          ${isWrong ? 'border-red-400 bg-red-900/30' : ''}
          ${!isCorrect && !isWrong ? 'border-gray-600 focus:border-purple-400' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg font-bold
          transition-all ${disabled || !value.trim()
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
      >
        Unlock
      </button>
    </div>
  );
};

// Results screen for solver
export const ResultsScreen = ({
  roomName,
  time,
  score,
  penalties,
  locksUnlocked,
  totalLocks,
  hintsUsed,
  wrongGuesses,
  onPlayAgain,
  onCreateOwn,
  onDone
}) => {
  const minutes = Math.floor(time / 60);
  const secs = time % 60;
  const escaped = locksUnlocked === totalLocks;

  return (
    <div className="text-center anim-slide-up">
      <Confetti active={escaped} count={30} />

      <div className="text-6xl mb-4">
        {escaped ? '🎉' : '⏰'}
      </div>

      <h1 className="text-3xl font-black text-white mb-2">
        {escaped ? 'YOU ESCAPED!' : 'Time\'s Up!'}
      </h1>

      <p className="text-gray-300 mb-6">{roomName}</p>

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Time</div>
          <div className="text-2xl font-bold text-white">{minutes}:{secs.toString().padStart(2, '0')}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Final Score</div>
          <div className="text-2xl font-bold text-green-400">{Math.max(0, score - penalties)}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Locks Opened</div>
          <div className="text-2xl font-bold text-purple-400">{locksUnlocked}/{totalLocks}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Hints Used</div>
          <div className="text-2xl font-bold text-yellow-400">{hintsUsed}</div>
        </div>
      </div>

      {wrongGuesses > 0 && (
        <p className="text-red-400 text-sm mb-6">
          Wrong guesses: {wrongGuesses} (-{wrongGuesses * 10} pts, +{wrongGuesses * 5}s)
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-all"
          >
            🔄 Try Another Room
          </button>
        )}
        {onCreateOwn && (
          <button
            onClick={onCreateOwn}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600
                       text-white font-bold rounded-xl transition-all"
          >
            🔨 Create Your Own
          </button>
        )}
        {onDone && (
          <button
            onClick={onDone}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl transition-all"
          >
            Done ✓
          </button>
        )}
      </div>
    </div>
  );
};

// Header for both modes
export const Header = ({
  mode,
  step,
  totalSteps,
  roomName,
  timer,
  score,
  onBack
}) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        )}
        <div>
          <h2 className="text-sm font-bold text-white">
            {mode === 'creator' ? '🔨 Create Escape Room' : '🔓 Solve Escape Room'}
          </h2>
          {roomName && (
            <p className="text-xs text-gray-400">{roomName}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {step && totalSteps && (
          <div className="text-sm text-gray-400">
            Step {step}/{totalSteps}
          </div>
        )}
        {timer !== undefined && (
          <Timer seconds={timer} isWarning={timer < 30} />
        )}
        {score !== undefined && (
          <div className="text-green-400 font-bold">{score} pts</div>
        )}
      </div>
    </div>
  );
};
