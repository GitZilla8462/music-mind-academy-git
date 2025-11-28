/**
 * RoundIntro.jsx - Round Introduction Screen
 */

import React from 'react';

const RoundIntro = ({ round, onStart }) => (
  <div className="h-full flex items-center justify-center p-8">
    <div className="text-center max-w-xl">
      <div className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Round {round.id} of 3
      </div>
      <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        {round.title}
      </h1>
      <p className="text-xl text-gray-400 mb-8">{round.subtitle}</p>
      
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
          {round.instruments.length === 1 ? 'Instrument' : 'Instruments'}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {round.instruments.map((inst) => (
            <div
              key={inst.id}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
              style={{ 
                borderColor: inst.color, 
                backgroundColor: `${inst.color}15` 
              }}
            >
              <span className="text-lg">{inst.emoji}</span>
              <span style={{ color: inst.color }} className="font-medium">
                {inst.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-lg text-gray-300 mb-2">{round.description}</p>
      <p className="text-gray-400 mb-6">{round.instruction}</p>
      {round.tip && (
        <p className="text-sm text-gray-500 italic mb-8">💡 {round.tip}</p>
      )}
      
      <button
        onClick={onStart}
        className="px-12 py-4 text-lg font-semibold rounded-xl text-white transition-transform hover:scale-105"
        style={{ 
          backgroundColor: round.accent,
          boxShadow: `0 4px 20px ${round.accent}40`
        }}
      >
        Start Drawing
      </button>
      
      <div className="flex justify-center gap-2 mt-8">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-2 rounded-full transition-all ${
              n === round.id ? 'w-6 bg-gray-400' : 'w-2 bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  </div>
);

export default RoundIntro;
