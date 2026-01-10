// loop-lab/LoopLabScreens.jsx - Setup, Rules, and Game Over screens

import React from 'react';
import { animationStyles } from './loopLabStyles';
import { Confetti, AnimatedNumber } from './LoopLabComponents';

// Setup Screen
export const SetupScreen = ({ player1, player2, setPlayer1, setPlayer2, startGame }) => {
  const canStart = player1.trim() && player2.trim();
  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <style>{animationStyles}</style>
      <div className="w-full max-w-lg">
        <div className="text-center mb-5">
          <div className="mb-3">
            <h1 className="text-2xl font-black text-cyan-400 leading-tight">
              ONE DEVICE FOR THIS GAME
            </h1>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">LOOP LAB</h1>
          <p className="text-purple-300 text-base mt-1">The Music Communication Challenge</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 mb-5 border border-white/10">
          <div className="space-y-3">
            <input type="text" value={player1} onChange={e => setPlayer1(e.target.value.slice(0, 10))}
              placeholder="Player 1 name..."
              className="w-full px-4 py-3 bg-cyan-500/20 border-2 border-cyan-400/30 rounded-xl text-white text-lg font-bold placeholder-white/40 focus:outline-none focus:border-cyan-400" />
            <div className="text-center text-white/30 font-bold text-lg">VS</div>
            <input type="text" value={player2} onChange={e => setPlayer2(e.target.value.slice(0, 10))}
              placeholder="Player 2 name..."
              className="w-full px-4 py-3 bg-pink-500/20 border-2 border-pink-400/30 rounded-xl text-white text-lg font-bold placeholder-white/40 focus:outline-none focus:border-pink-400" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/60 text-base mb-3">Choose Rounds</p>
          <div className="flex gap-3 justify-center">
            {[8, 12, 16].map(n => (
              <button key={n} onClick={() => startGame(n)} disabled={!canStart}
                className={`px-6 py-4 rounded-xl font-black text-xl ${canStart ? 'bg-white/10 hover:bg-purple-500/30 border-2 border-white/20 hover:border-purple-400 text-white hover:scale-105' : 'bg-white/5 border-2 border-white/10 text-white/30'} transition-all`}
              >{n}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Rules Screen
export const RulesScreen = ({ player1, player2, startRound }) => (
  <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
    <style>{animationStyles}</style>
    <div className="w-full max-w-2xl">
      <h1 className="text-3xl font-black text-white text-center mb-3">How to Play</h1>
      <div className="flex justify-center gap-4 mb-4">
        <span className="text-cyan-400 font-bold text-lg">{player1}</span>
        <span className="text-white/50 text-lg">vs</span>
        <span className="text-pink-400 font-bold text-lg">{player2}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/30">
          <div className="text-3xl mb-1">🔨</div>
          <h2 className="font-black text-white text-lg mb-1">BUILDER</h2>
          <ul className="text-white/80 text-sm space-y-0.5">
            <li>Listener looks away</li>
            <li>Pick 1-3 instruments</li>
            <li>Pass to listener</li>
          </ul>
        </div>
        <div className="bg-cyan-500/20 rounded-xl p-4 border border-cyan-400/30">
          <div className="text-3xl mb-1">👂</div>
          <h2 className="font-black text-white text-lg mb-1">LISTENER</h2>
          <ul className="text-white/80 text-sm space-y-0.5">
            <li>Play the mix</li>
            <li>Guess instruments</li>
            <li>Earn points!</li>
          </ul>
        </div>
      </div>

      <div className="bg-black/30 rounded-xl p-3 mb-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-green-500/20 rounded-lg p-2">
            <div className="text-xl font-black text-green-400">+15</div>
            <div className="text-green-200 text-xs">Correct</div>
          </div>
          <div className="bg-red-500/20 rounded-lg p-2">
            <div className="text-xl font-black text-red-400">-5</div>
            <div className="text-red-200 text-xs">Wrong</div>
          </div>
          <div className="bg-yellow-500/20 rounded-lg p-2">
            <div className="text-xl font-black text-yellow-400">+25</div>
            <div className="text-yellow-200 text-xs">Perfect</div>
          </div>
          <div className="bg-purple-500/20 rounded-lg p-2">
            <div className="text-xl font-black text-purple-400">+10</div>
            <div className="text-purple-200 text-xs">Quick</div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/10 rounded-xl p-3 mb-4 border border-yellow-400/20 text-center">
        <span className="text-white/70 text-sm">After Round 1, choose a power-up each round! </span>
        <span className="text-xl">✨🛡️💡🎁🎯</span>
      </div>

      <div className="text-center">
        <button onClick={() => startRound()} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-black text-lg rounded-xl hover:scale-105 transition-all shadow-lg">
          Start Game!
        </button>
      </div>
    </div>
  </div>
);

// Game Over Screen
export const GameOverScreen = ({ player1, player2, p1Score, p2Score, history, onPlayAgain, onComplete }) => {
  const winner = p1Score > p2Score ? 1 : p2Score > p1Score ? 2 : 0;
  const perfects = history.filter(h => h.isPerfect).length;
  
  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <style>{animationStyles}</style>
      <Confetti active count={40} />
      
      <div className="w-full max-w-lg text-center">
        <div className="text-5xl mb-2">🏆</div>
        <h1 className="text-3xl font-black text-white mb-2">Game Over!</h1>
        <p className="text-xl text-yellow-400 font-bold mb-4">
          {winner === 0 ? "It's a TIE!" : `${winner === 1 ? player1 : player2} Wins!`}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className={`bg-cyan-500/20 rounded-xl p-4 border-2 ${winner === 1 ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-cyan-400/30'}`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              {winner === 1 && <span className="text-2xl">👑</span>}
              <span className="text-cyan-400 font-bold text-lg">{player1}</span>
            </div>
            <div className="text-4xl font-black text-white text-center"><AnimatedNumber value={p1Score} duration={1200} /></div>
          </div>
          <div className={`bg-pink-500/20 rounded-xl p-4 border-2 ${winner === 2 ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-pink-400/30'}`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              {winner === 2 && <span className="text-2xl">👑</span>}
              <span className="text-pink-400 font-bold text-lg">{player2}</span>
            </div>
            <div className="text-4xl font-black text-white text-center"><AnimatedNumber value={p2Score} duration={1200} /></div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl">⭐</div>
              <div className="text-2xl font-black text-yellow-400">{perfects}</div>
              <div className="text-white/50 text-xs">Perfect</div>
            </div>
            <div className="text-center">
              <div className="text-3xl">🎯</div>
              <div className="text-2xl font-black text-green-400">{history.length}</div>
              <div className="text-white/50 text-xs">Rounds</div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button onClick={onPlayAgain}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:scale-105 transition-all">
            🔄 Play Again
          </button>
          {onComplete && (
            <button onClick={onComplete} className="px-8 py-3 bg-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/30">
              Done ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};