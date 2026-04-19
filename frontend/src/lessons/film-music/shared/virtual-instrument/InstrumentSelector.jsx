// InstrumentSelector.jsx
// Instrument selection bar for the virtual instrument
// Horizontal row of instruments + Keyboard/Drums mode toggle

import React from 'react';
import { Piano, Music, Volume2, Wind, Layers, Guitar, Users, Activity, Drum } from 'lucide-react';
import { INSTRUMENT_LIST } from './instrumentConfig';

const ICON_MAP = {
  Piano, Music, Volume2, Wind, Layers, Guitar, Users, Activity
};

// Color map for instruments based on their track target
const INSTRUMENT_COLORS = {
  piano: '#3B82F6',
  strings: '#8B5CF6',
  brass: '#F59E0B',
  woodwind: '#10B981',
  synthPad: '#EC4899',
  plucked: '#06B6D4',
  choir: '#A855F7',
  bass: '#10B981',
};

const InstrumentSelector = ({
  selectedInstrument,
  onInstrumentChange,
  mode,
  onModeChange,
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60">
      {/* Mode toggle */}
      <div className="flex bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        <button
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-all ${
            mode === 'keyboard'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          onClick={() => onModeChange('keyboard')}
        >
          <Piano className="w-3.5 h-3.5" />
          Keys
        </button>
        <button
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-all ${
            mode === 'drums'
              ? 'bg-amber-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          onClick={() => onModeChange('drums')}
        >
          <Drum className="w-3.5 h-3.5" />
          Pads
        </button>
      </div>

      {/* Divider */}
      {mode === 'keyboard' && <div className="w-px h-6 bg-gray-700" />}

      {/* Instrument buttons — only in keyboard mode */}
      {mode === 'keyboard' && (
        <div className="flex gap-1 overflow-x-auto">
          {INSTRUMENT_LIST.map((inst) => {
            const IconComponent = ICON_MAP[inst.icon] || Music;
            const isSelected = selectedInstrument === inst.id;
            const color = INSTRUMENT_COLORS[inst.id] || '#3B82F6';
            return (
              <button
                key={inst.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'text-white shadow-lg'
                    : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-600'
                }`}
                style={isSelected ? {
                  backgroundColor: color,
                  borderColor: color,
                  boxShadow: `0 0 12px ${color}30`,
                } : {}}
                onClick={() => onInstrumentChange(inst.id)}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {inst.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InstrumentSelector;
