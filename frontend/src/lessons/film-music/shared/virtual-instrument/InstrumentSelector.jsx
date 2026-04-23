// InstrumentSelector.jsx
// Compact instrument selection with dropdown instead of horizontal row
// Always-visible Keys/Pads toggle + instrument dropdown + octave controls

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Piano, Music, Volume2, Wind, Layers, Guitar, Users, Activity, Drum, ChevronDown, ChevronUp, Waves } from 'lucide-react';
import { INSTRUMENT_LIST } from './instrumentConfig';

const ICON_MAP = {
  Piano, Music, Volume2, Wind, Layers, Guitar, Users, Activity
};

// Group instruments by category
const CATEGORIES = [
  {
    name: 'Keys',
    instruments: ['piano', 'synthPad'],
  },
  {
    name: 'Strings',
    instruments: ['violin', 'cello', 'doubleBass', 'plucked'],
  },
  {
    name: 'Brass',
    instruments: ['trumpet', 'trombone', 'tuba', 'brass'],
  },
  {
    name: 'Woodwinds',
    instruments: ['clarinet', 'oboe', 'bassoon', 'woodwind'],
  },
];

const InstrumentSelector = ({
  selectedInstrument,
  onInstrumentChange,
  mode,
  onModeChange,
  octaveShift,
  onOctaveChange,
  glide,
  onGlideChange,
  keyboardOnly = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handle = (e) => {
      // Check if click is inside the button or the fixed dropdown
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      // Check fixed dropdown by data attribute
      const fixedDropdown = document.querySelector('[data-instrument-dropdown]');
      if (fixedDropdown && fixedDropdown.contains(e.target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [dropdownOpen]);

  const selectedInst = INSTRUMENT_LIST.find(i => i.id === selectedInstrument);
  const SelectedIcon = selectedInst ? (ICON_MAP[selectedInst.icon] || Music) : Music;

  // Octave range label
  const baseOctave = 4 + (octaveShift || 0);
  const octaveLabel = `C${baseOctave}–C${baseOctave + 1}`;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-800/60">
      {/* Mode toggle — hidden when keyboardOnly */}
      {!keyboardOnly && (
        <div className="flex bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
          <button
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium transition-all ${
              mode === 'keyboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => onModeChange('keyboard')}
          >
            <Piano className="w-3 h-3" />
            Keys
          </button>
          <button
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium transition-all ${
              mode === 'drums'
                ? 'bg-amber-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => onModeChange('drums')}
          >
            <Drum className="w-3 h-3" />
            Pads
          </button>
          <button
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium transition-all ${
              mode === 'strings'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => onModeChange('strings')}
          >
            <Waves className="w-3 h-3" />
            Bow
          </button>
        </div>
      )}

      {/* Instrument dropdown — keyboard and strings modes */}
      {(mode === 'keyboard' || mode === 'strings') && (
        <>
          <div className="w-px h-5 bg-gray-700" />

          <div ref={dropdownRef}>
            <button
              ref={buttonRef}
              onClick={() => {
                if (!dropdownOpen && buttonRef.current) {
                  const rect = buttonRef.current.getBoundingClientRect();
                  setDropdownPos({ top: rect.bottom + 4, left: rect.left });
                }
                setDropdownOpen(!dropdownOpen);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-[11px] font-medium text-white transition-colors"
            >
              <SelectedIcon className="w-3 h-3" />
              {selectedInst?.name || 'Piano'}
              <ChevronDown size={10} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu — portaled to document.body to escape transform contexts (react-rnd) */}
            {dropdownOpen && createPortal(
              <div
                data-instrument-dropdown
                className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl py-1"
                style={{
                  position: 'fixed',
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  zIndex: 9999,
                  minWidth: 220,
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <div key={cat.name}>
                    <div className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                      {cat.name}
                    </div>
                    {cat.instruments.map((instId) => {
                      const inst = INSTRUMENT_LIST.find(i => i.id === instId);
                      if (!inst) return null;
                      const Icon = ICON_MAP[inst.icon] || Music;
                      const isSelected = selectedInstrument === instId;
                      return (
                        <button
                          key={instId}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-blue-600/20 text-blue-300'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            onInstrumentChange(instId);
                            setDropdownOpen(false);
                          }}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{inst.name}</span>
                          {isSelected && <span className="ml-auto text-blue-400 text-[10px]">active</span>}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>,
              document.body
            )}
          </div>

          {/* Octave controls */}
          {onOctaveChange && (
            <>
              <div className="w-px h-5 bg-gray-700" />
              <div className="flex items-center gap-0.5 bg-gray-900 rounded px-1.5 py-0.5 border border-gray-700">
                <button
                  onClick={() => onOctaveChange(Math.max(-2, (octaveShift || 0) - 1))}
                  disabled={(octaveShift || 0) <= -2}
                  className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronDown size={10} />
                </button>
                <span className="text-[10px] font-mono text-gray-300 min-w-[38px] text-center">
                  {octaveLabel}
                </span>
                <button
                  onClick={() => onOctaveChange(Math.min(2, (octaveShift || 0) + 1))}
                  disabled={(octaveShift || 0) >= 2}
                  className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronUp size={10} />
                </button>
              </div>
            </>
          )}

          {/* Glide toggle — keyboard mode only */}
          {mode === 'keyboard' && onGlideChange && (
            <>
              <div className="w-px h-5 bg-gray-700" />
              <button
                onClick={() => onGlideChange(!glide)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                  glide
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300'
                }`}
              >
                Glide
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default InstrumentSelector;
