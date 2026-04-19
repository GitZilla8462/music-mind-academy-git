// DrumPadGrid.jsx
// Professional drum pad grid + SFX soundboard
// GarageBand iPad-style with large touch-friendly pads
// Two tabs: Drums (9 pads) and SFX (sound effects from library)

import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { DRUM_PADS } from './instrumentConfig';
import { soundEffects } from '../../../../pages/projects/film-music-score/shared/soundEffectsData';

// Synthesized one-shot sound effects — no files needed
const SYNTH_SFX = [
  { id: 'synth-laser', name: 'Laser', color: '#EF4444', category: 'Fun' },
  { id: 'synth-explosion', name: 'Boom', color: '#F97316', category: 'Fun' },
  { id: 'synth-zap', name: 'Zap', color: '#EAB308', category: 'Fun' },
  { id: 'synth-swoosh', name: 'Swoosh', color: '#22C55E', category: 'Fun' },
  { id: 'synth-blip', name: 'Blip', color: '#3B82F6', category: 'Fun' },
  { id: 'synth-alarm', name: 'Alarm', color: '#EC4899', category: 'Fun' },
  { id: 'synth-bell', name: 'Bell', color: '#8B5CF6', category: 'Fun' },
  { id: 'synth-drop', name: 'Drop', color: '#06B6D4', category: 'Fun' },
  { id: 'synth-horn', name: 'Horn', color: '#F59E0B', category: 'Fun' },
];

// Play a synthesized SFX using Tone.js
const playSynthSfx = async (id) => {
  if (Tone.context.state !== 'running') await Tone.start();

  switch (id) {
    case 'synth-laser': {
      const s = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 } }).toDestination();
      s.volume.value = -10;
      s.triggerAttackRelease('C6', 0.1);
      s.frequency.rampTo(100, 0.3);
      setTimeout(() => s.dispose(), 500);
      break;
    }
    case 'synth-explosion': {
      const s = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.01, decay: 0.8, sustain: 0, release: 0.5 } }).toDestination();
      s.volume.value = -8;
      s.triggerAttackRelease(0.8);
      setTimeout(() => s.dispose(), 1500);
      break;
    }
    case 'synth-zap': {
      const s = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 } }).toDestination();
      s.volume.value = -10;
      s.triggerAttackRelease('G5', 0.05);
      s.frequency.rampTo('C3', 0.15);
      setTimeout(() => s.dispose(), 300);
      break;
    }
    case 'synth-swoosh': {
      const s = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.1, decay: 0.4, sustain: 0, release: 0.2 } }).toDestination();
      const f = new Tone.Filter({ frequency: 200, type: 'bandpass' }).toDestination();
      s.connect(f);
      s.volume.value = -12;
      f.frequency.rampTo(8000, 0.4);
      s.triggerAttackRelease(0.4);
      setTimeout(() => { s.dispose(); f.dispose(); }, 800);
      break;
    }
    case 'synth-blip': {
      const s = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 } }).toDestination();
      s.volume.value = -8;
      s.triggerAttackRelease('E6', 0.08);
      setTimeout(() => s.dispose(), 200);
      break;
    }
    case 'synth-alarm': {
      const s = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0.5, release: 0.1 } }).toDestination();
      s.volume.value = -12;
      s.triggerAttack('A5');
      s.frequency.rampTo('E6', 0.2);
      setTimeout(() => { s.frequency.rampTo('A5', 0.2); }, 200);
      setTimeout(() => { s.triggerRelease(); }, 400);
      setTimeout(() => s.dispose(), 600);
      break;
    }
    case 'synth-bell': {
      const s = new Tone.MetalSynth({ frequency: 400, envelope: { attack: 0.001, decay: 1.2, release: 0.5 }, harmonicity: 12, modulationIndex: 10, resonance: 2000, octaves: 0.5 }).toDestination();
      s.volume.value = -10;
      s.triggerAttackRelease(0.8);
      setTimeout(() => s.dispose(), 2000);
      break;
    }
    case 'synth-drop': {
      const s = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.6, sustain: 0, release: 0.2 } }).toDestination();
      s.volume.value = -8;
      s.triggerAttackRelease('C5', 0.4);
      s.frequency.rampTo('C2', 0.5);
      setTimeout(() => s.dispose(), 800);
      break;
    }
    case 'synth-horn': {
      const s = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.3 } }).toDestination();
      s.volume.value = -10;
      s.triggerAttackRelease('C4', 0.5);
      setTimeout(() => s.dispose(), 800);
      break;
    }
  }
};

const DrumPadGrid = ({ activePads, onPadHit }) => {
  const [tab, setTab] = useState('drums'); // 'drums' | 'sfx' | 'fun'
  const [activeSfx, setActiveSfx] = useState(new Set());
  const sfxPlayersRef = useRef({});

  // Cleanup SFX players on unmount
  useEffect(() => {
    return () => {
      Object.values(sfxPlayersRef.current).forEach(p => {
        try { p.stop(); p.dispose(); } catch (e) { /* ok */ }
      });
    };
  }, []);

  const handleSfxHit = useCallback(async (sfx) => {
    if (Tone.context.state !== 'running') await Tone.start();

    // Stop if already playing — immediate silence
    if (sfxPlayersRef.current[sfx.id]) {
      const player = sfxPlayersRef.current[sfx.id];
      try {
        player.volume.value = -Infinity; // immediate silence
        player.stop();
        player.dispose();
      } catch (e) { /* ok */ }
      delete sfxPlayersRef.current[sfx.id];
      setActiveSfx(prev => { const n = new Set(prev); n.delete(sfx.id); return n; });
      return;
    }

    try {
      const player = new Tone.Player(sfx.file).toDestination();
      player.volume.value = -6;
      await player.load(sfx.file);
      player.start();
      sfxPlayersRef.current[sfx.id] = player;
      setActiveSfx(prev => new Set(prev).add(sfx.id));

      player.onstop = () => {
        setActiveSfx(prev => { const n = new Set(prev); n.delete(sfx.id); return n; });
        try { player.dispose(); } catch (e) { /* ok */ }
        delete sfxPlayersRef.current[sfx.id];
      };
    } catch (e) {
      console.error('SFX play error:', e);
    }
  }, []);

  const handlePointerDown = useCallback((padId, e) => {
    e.preventDefault();
    onPadHit(padId);
  }, [onPadHit]);

  // Get SFX organized by category
  const sfxByCategory = {
    'SFX': soundEffects.filter(s => s.category === 'SFX'),
    'Nature': soundEffects.filter(s => s.category === 'Nature'),
    'City': soundEffects.filter(s => s.category === 'City'),
  };

  return (
    <div className="w-full h-full flex flex-col select-none" style={{ touchAction: 'none' }}>
      {/* Tab toggle */}
      <div className="flex gap-1 px-3 pt-1 pb-1">
        <button
          className={`px-3 py-0.5 rounded text-[10px] font-medium transition-all ${
            tab === 'drums' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'
          }`}
          onClick={() => setTab('drums')}
        >
          Drums
        </button>
        <button
          className={`px-3 py-0.5 rounded text-[10px] font-medium transition-all ${
            tab === 'sfx' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'
          }`}
          onClick={() => setTab('sfx')}
        >
          Sound FX
        </button>
        <button
          className={`px-3 py-0.5 rounded text-[10px] font-medium transition-all ${
            tab === 'fun' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-white'
          }`}
          onClick={() => setTab('fun')}
        >
          Fun
        </button>
      </div>

      {tab === 'drums' ? (
        /* Drum Pads — 3x3 grid, GarageBand style */
        <div className="flex-1 flex items-center justify-center p-2">
          <div className="grid grid-cols-3 gap-1.5" style={{ width: '100%', maxWidth: 360 }}>
            {DRUM_PADS.map((pad) => {
              const isActive = activePads.has(pad.id);
              return (
                <div
                  key={pad.id}
                  className="relative cursor-pointer aspect-square"
                  onPointerDown={(e) => handlePointerDown(pad.id, e)}
                >
                  <div
                    className="absolute inset-0 rounded-xl flex flex-col items-center justify-center transition-all duration-75"
                    style={{
                      background: isActive
                        ? `radial-gradient(circle at center, ${pad.color} 0%, ${pad.color}99 100%)`
                        : `radial-gradient(circle at 40% 35%, ${pad.color}25 0%, ${pad.color}08 70%)`,
                      border: `2px solid ${isActive ? pad.color : pad.color + '40'}`,
                      boxShadow: isActive
                        ? `0 0 24px ${pad.color}50, inset 0 0 20px ${pad.color}20`
                        : 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
                      transform: isActive ? 'scale(0.96)' : 'none',
                    }}
                  >
                    <span className="text-white font-semibold text-[11px]">{pad.name}</span>
                    <span
                      className="text-[9px] font-mono mt-0.5 opacity-50"
                      style={{ color: pad.color }}
                    >
                      {pad.key}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : tab === 'sfx' ? (
        /* SFX Soundboard — scrollable list of trigger buttons */
        <div className="flex-1 overflow-y-auto px-2 pb-1">
          {Object.entries(sfxByCategory).map(([category, sfxList]) => (
            <div key={category} className="mb-1.5">
              <div className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold px-1 mb-0.5">
                {category}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {sfxList.map((sfx) => {
                  const isPlaying = activeSfx.has(sfx.id);
                  return (
                    <button
                      key={sfx.id}
                      className="rounded-lg px-2 py-2 text-[10px] font-medium transition-all text-left truncate"
                      style={{
                        backgroundColor: isPlaying ? sfx.color : `${sfx.color}15`,
                        border: `1px solid ${isPlaying ? sfx.color : sfx.color + '30'}`,
                        color: isPlaying ? '#fff' : sfx.color,
                        boxShadow: isPlaying ? `0 0 12px ${sfx.color}30` : 'none',
                      }}
                      onClick={() => handleSfxHit(sfx)}
                    >
                      {sfx.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Fun SFX — synthesized one-shot sounds, no files needed */
        <div className="flex-1 flex items-center justify-center p-2">
          <div className="grid grid-cols-3 gap-1.5" style={{ width: '100%', maxWidth: 360 }}>
            {SYNTH_SFX.map((sfx) => (
              <button
                key={sfx.id}
                className="rounded-xl aspect-square flex flex-col items-center justify-center transition-all duration-75 active:scale-95"
                style={{
                  background: `radial-gradient(circle at 40% 35%, ${sfx.color}25 0%, ${sfx.color}08 70%)`,
                  border: `2px solid ${sfx.color}40`,
                }}
                onClick={() => playSynthSfx(sfx.id)}
                onMouseDown={(e) => {
                  e.currentTarget.style.background = `radial-gradient(circle at center, ${sfx.color} 0%, ${sfx.color}99 100%)`;
                  e.currentTarget.style.borderColor = sfx.color;
                  e.currentTarget.style.boxShadow = `0 0 20px ${sfx.color}50`;
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.background = `radial-gradient(circle at 40% 35%, ${sfx.color}25 0%, ${sfx.color}08 70%)`;
                  e.currentTarget.style.borderColor = `${sfx.color}40`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `radial-gradient(circle at 40% 35%, ${sfx.color}25 0%, ${sfx.color}08 70%)`;
                  e.currentTarget.style.borderColor = `${sfx.color}40`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span className="text-white font-semibold text-[11px]">{sfx.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrumPadGrid;
