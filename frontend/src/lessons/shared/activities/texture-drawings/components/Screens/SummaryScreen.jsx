/**
 * SummaryScreen.jsx - Activity Summary Screen
 */

import React from 'react';
import { ROUNDS } from '../../config/rounds';

const SummaryScreen = ({ drawings, onRestart, onContinue }) => (
  <div className="h-full flex flex-col items-center justify-center p-8 overflow-auto">
    <h1 className="text-3xl font-bold mb-2">Your Listening Map</h1>
    <p className="text-gray-400 mb-8">See how the music changed as you listened</p>
    
    <div className="flex gap-6 mb-8 flex-wrap justify-center">
      {ROUNDS.map((round) => (
        <div key={round.id} className="w-72 bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <div 
            className="px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: round.accent }}
          >
            <span className="text-xs font-semibold opacity-80">Round {round.id}</span>
            <span className="font-semibold flex-1">{round.title}</span>
            <span className="text-xs opacity-70">
              {round.instruments.length} {round.instruments.length === 1 ? 'voice' : 'voices'}
            </span>
          </div>
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            {drawings[round.id] ? (
              <img src={drawings[round.id]} alt={`Round ${round.id}`} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-600 text-sm">Not completed</span>
            )}
          </div>
          <div className="p-3 flex flex-wrap gap-1 border-t border-gray-700">
            {round.instruments.map((inst) => (
              <span
                key={inst.id}
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: `${inst.color}20`, color: inst.color }}
              >
                {inst.emoji} {inst.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
    
    <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-xl p-6 max-w-xl mb-8">
      <div className="flex gap-4">
        <span className="text-3xl">💡</span>
        <div>
          <h3 className="font-bold mb-2">More layers = THICKER texture!</h3>
          <p className="text-sm text-gray-300">
            Notice how your drawings got fuller as we added more instruments. 
            One instrument creates a thin texture, while multiple instruments create a thick, rich texture.
          </p>
        </div>
      </div>
    </div>
    
    <div className="flex gap-4">
      <button
        onClick={onRestart}
        className="px-6 py-3 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-800 transition-colors"
      >
        Draw Again
      </button>
      <button
        onClick={onContinue}
        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
      >
        Continue →
      </button>
    </div>
  </div>
);

export default SummaryScreen;