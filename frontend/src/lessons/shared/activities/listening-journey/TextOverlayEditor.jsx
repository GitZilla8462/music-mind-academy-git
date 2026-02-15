// Modal for adding text overlays with font/size/color/animation/duration selectors
// Opens when clicking viewport in text mode

import React, { useState } from 'react';
import { X } from 'lucide-react';

const FONT_OPTIONS = [
  { id: 'sans-serif', label: 'Sans Serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'monospace', label: 'Mono' },
  { id: 'cursive', label: 'Cursive' },
];

const SIZE_OPTIONS = [
  { id: 14, label: 'S' },
  { id: 18, label: 'M' },
  { id: 24, label: 'L' },
  { id: 32, label: 'XL' },
];

const COLOR_OPTIONS = [
  '#ffffff', '#FBBF24', '#F87171', '#34D399',
  '#60A5FA', '#A78BFA', '#F472B6', '#000000',
];

const ANIMATION_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'pulse', label: 'Pulse' },
];

const DURATION_OPTIONS = [
  { id: 2, label: '2s' },
  { id: 3, label: '3s' },
  { id: 5, label: '5s' },
  { id: 10, label: '10s' },
];

const TextOverlayEditor = ({ onAdd, onClose }) => {
  const [content, setContent] = useState('');
  const [font, setFont] = useState('sans-serif');
  const [size, setSize] = useState(18);
  const [color, setColor] = useState('#ffffff');
  const [animation, setAnimation] = useState('none');
  const [duration, setDuration] = useState(3);

  const handleAdd = () => {
    if (!content.trim()) return;
    onAdd({ content: content.trim(), font, size, color, animation, duration });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-800 border border-white/20 rounded-2xl shadow-2xl p-5 w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Add Text</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-white/50">
            <X size={16} />
          </button>
        </div>

        {/* Text input */}
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 50))}
          placeholder="Type your text..."
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/40 mb-3"
          maxLength={50}
          autoFocus
        />

        {/* Preview */}
        <div className="bg-black/30 rounded-lg p-3 mb-3 flex items-center justify-center min-h-[48px]">
          <span
            style={{
              fontFamily: font,
              fontSize: `${size}px`,
              color,
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {content || 'Preview'}
          </span>
        </div>

        {/* Font */}
        <div className="mb-2.5">
          <label className="text-[10px] font-bold text-white/50 uppercase mb-1 block">Font</label>
          <div className="flex gap-1">
            {FONT_OPTIONS.map(f => (
              <button
                key={f.id}
                onClick={() => setFont(f.id)}
                className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${
                  font === f.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
                style={{ fontFamily: f.id }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="mb-2.5">
          <label className="text-[10px] font-bold text-white/50 uppercase mb-1 block">Size</label>
          <div className="flex gap-1">
            {SIZE_OPTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSize(s.id)}
                className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${
                  size === s.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="mb-2.5">
          <label className="text-[10px] font-bold text-white/50 uppercase mb-1 block">Color</label>
          <div className="flex gap-1.5">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c, border: c === '#000000' ? '1px solid #555' : 'none' }}
              />
            ))}
          </div>
        </div>

        {/* Animation */}
        <div className="mb-2.5">
          <label className="text-[10px] font-bold text-white/50 uppercase mb-1 block">Animation</label>
          <div className="flex gap-1">
            {ANIMATION_OPTIONS.map(a => (
              <button
                key={a.id}
                onClick={() => setAnimation(a.id)}
                className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${
                  animation === a.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-white/50 uppercase mb-1 block">Duration</label>
          <div className="flex gap-1">
            {DURATION_OPTIONS.map(d => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id)}
                className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${
                  duration === d.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={!content.trim()}
          className="w-full py-2 rounded-lg text-sm font-bold transition-colors bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add Text
        </button>
      </div>
    </div>
  );
};

export default TextOverlayEditor;
