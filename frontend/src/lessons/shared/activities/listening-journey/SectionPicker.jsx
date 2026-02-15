// Section property editor — popover for editing sky, scene, tempo, dynamics, articulation
// track='sky' or 'scene' → single picker (legacy)
// track='all' → full property editor (iMovie clip click)

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import SKY_MOODS from './config/skyMoods';
import ENVIRONMENTS from './config/environments';
import { TEMPO_SPEEDS, DYNAMICS_LEVELS, ARTICULATION_STYLES, MOVEMENT_TYPES } from './characterAnimations';

const SectionPicker = ({ track, currentValue, sectionData, rect, onSelect, onClose }) => {
  const popoverRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Position above the clicked element
  const style = {
    position: 'fixed',
    bottom: `${window.innerHeight - rect.top + 8}px`,
    left: `${Math.max(8, rect.left)}px`,
    zIndex: 50,
  };

  // ── Full property editor (track='all') ─────────────────────────────

  if (track === 'all' && sectionData) {
    return (
      <div ref={popoverRef} style={style} className="bg-gray-800 border border-white/20 rounded-xl shadow-2xl p-3 w-80 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-white">Section {sectionData.label} Properties</span>
          <button onClick={onClose} className="p-0.5 rounded hover:bg-white/10 text-white/50">
            <X size={14} />
          </button>
        </div>

        {/* Sky */}
        <div className="mb-3">
          <div className="text-[10px] text-white/50 uppercase font-bold mb-1.5">Sky</div>
          <div className="grid grid-cols-4 gap-1.5">
            {SKY_MOODS.map(sky => (
              <button
                key={sky.id}
                onClick={() => onSelect(sky.id, 'sky')}
                className={`h-10 rounded-lg transition-all flex items-end justify-center pb-0.5 ${
                  sectionData.sky === sky.id
                    ? 'ring-2 ring-white scale-105'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ background: sky.gradient }}
              >
                <span className="text-[8px] text-white font-bold drop-shadow-md">{sky.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scene */}
        <div className="mb-3">
          <div className="text-[10px] text-white/50 uppercase font-bold mb-1.5">Scene</div>
          <div className="grid grid-cols-3 gap-1.5">
            {ENVIRONMENTS.map(env => (
              <button
                key={env.id}
                onClick={() => onSelect(env.id, 'scene')}
                className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-all text-left ${
                  sectionData.scene === env.id
                    ? 'bg-white/20 ring-2 ring-white'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-base">{env.icon}</span>
                <span className="text-[10px] text-white/80 font-bold">{env.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tempo */}
        <div className="mb-3">
          <div className="text-[10px] text-white/50 uppercase font-bold mb-1.5">Tempo</div>
          <div className="flex gap-1 flex-wrap">
            {TEMPO_SPEEDS.map(t => (
              <button
                key={t.id}
                onClick={() => onSelect(t.id, 'tempo')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-xs ${
                  sectionData.tempo === t.id
                    ? 'bg-blue-500 text-white ring-1 ring-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <span>{t.icon}</span>
                <span className="font-bold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamics */}
        <div className="mb-3">
          <div className="text-[10px] text-white/50 uppercase font-bold mb-1.5">Volume</div>
          <div className="flex gap-1">
            {DYNAMICS_LEVELS.map(d => (
              <button
                key={d.id}
                onClick={() => onSelect(d.id, 'dynamics')}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all flex-1 ${
                  sectionData.dynamics === d.id
                    ? 'bg-amber-500 text-white ring-1 ring-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <span className="text-sm">{d.icon}</span>
                <span className="text-[10px] font-bold">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weather + Night Mode */}
        <div className="mb-3">
          <div className="text-[10px] text-white/50 uppercase font-bold mb-1.5">Effects</div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: 'none', icon: '☀️', label: 'Clear' },
              { id: 'rain', icon: '🌧️', label: 'Rain' },
              { id: 'snow', icon: '🌨️', label: 'Snow' },
              { id: 'wind', icon: '💨', label: 'Wind' },
            ].map(w => (
              <button
                key={w.id}
                onClick={() => onSelect(w.id, 'weather')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-xs ${
                  (sectionData.weather || 'none') === w.id
                    ? 'bg-cyan-500 text-white ring-1 ring-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <span>{w.icon}</span>
                <span className="font-bold">{w.label}</span>
              </button>
            ))}
            <button
              onClick={() => onSelect(!sectionData.nightMode, 'nightMode')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-xs ${
                sectionData.nightMode
                  ? 'bg-indigo-500 text-white ring-1 ring-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <span>{sectionData.nightMode ? '🌙' : '🌙'}</span>
              <span className="font-bold">Night</span>
            </button>
          </div>
        </div>

        {/* Movement */}
        <div className="mb-3">
          <div className="text-[10px] text-white/50 uppercase font-bold mb-1.5">Movement</div>
          <div className="flex gap-1 flex-wrap">
            {MOVEMENT_TYPES.map(m => (
              <button
                key={m.id}
                onClick={() => onSelect(m.id, 'movement')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-xs ${
                  (sectionData.movement || 'walk') === m.id
                    ? 'bg-emerald-500 text-white ring-1 ring-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <span>{m.icon}</span>
                <span className="font-bold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Articulation */}
        <div>
          <div className="text-[10px] text-white/50 uppercase font-bold mb-1.5">Style</div>
          <div className="flex gap-1.5">
            {ARTICULATION_STYLES.map(a => (
              <button
                key={a.id}
                onClick={() => onSelect(a.id, 'articulation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all flex-1 ${
                  sectionData.articulation === a.id
                    ? 'bg-purple-500 text-white ring-1 ring-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <span className="text-base">{a.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold">{a.label}</span>
                  <span className="text-[8px] text-white/50">{a.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Legacy single-property pickers ─────────────────────────────────

  if (track === 'sky') {
    return (
      <div ref={popoverRef} style={style} className="bg-gray-800 border border-white/20 rounded-xl shadow-2xl p-3 w-72">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white/70 uppercase">Choose Sky</span>
          <button onClick={onClose} className="p-0.5 rounded hover:bg-white/10 text-white/50">
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SKY_MOODS.map(sky => (
            <button
              key={sky.id}
              onClick={() => onSelect(sky.id)}
              className={`h-14 rounded-lg transition-all flex flex-col items-center justify-end pb-1 ${
                currentValue === sky.id
                  ? 'ring-2 ring-white scale-105'
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ background: sky.gradient }}
              title={sky.name}
            >
              <span className="text-[9px] text-white font-bold drop-shadow-md">{sky.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (track === 'scene') {
    return (
      <div ref={popoverRef} style={style} className="bg-gray-800 border border-white/20 rounded-xl shadow-2xl p-3 w-64">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white/70 uppercase">Choose Scene</span>
          <button onClick={onClose} className="p-0.5 rounded hover:bg-white/10 text-white/50">
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ENVIRONMENTS.map(env => (
            <button
              key={env.id}
              onClick={() => onSelect(env.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                currentValue === env.id
                  ? 'bg-white/20 ring-2 ring-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{env.icon}</span>
              <span className="text-[10px] text-white/80 font-bold">{env.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default SectionPicker;
