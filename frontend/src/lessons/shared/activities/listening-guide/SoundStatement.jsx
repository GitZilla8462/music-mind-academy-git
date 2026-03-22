import React, { useState, useEffect } from 'react';
import { Lightbulb, Save, CheckCircle, Quote } from 'lucide-react';

const EXAMPLES = [
  {
    text: 'Enji blends Mongolian folk with jazz improvisation, featuring haunting vocals in three languages and creating a meditative atmosphere that connects ancient traditions to modern music.',
    artist: 'Enji',
  },
  {
    text: 'Theon Cross blends Caribbean rhythms with London jazz, featuring the tuba as a lead instrument and creating an energetic atmosphere that proves any instrument can be a star.',
    artist: 'Theon Cross',
  },
  {
    text: 'Ela Minus blends Colombian synth-pop with techno, featuring all-analog hardware synthesizers and creating a pulsing atmosphere that challenges what electronic music can be.',
    artist: 'Ela Minus',
  },
];

function loadStatement(artistId) {
  try {
    const raw = localStorage.getItem(`mma-sound-statement-${artistId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStatement(artistId, data) {
  localStorage.setItem(
    `mma-sound-statement-${artistId}`,
    JSON.stringify({ ...data, savedAt: new Date().toISOString() })
  );
}

const BLANK_FIELDS = {
  genre1: '',
  genre2: '',
  keySound: '',
  mood: '',
  unique: '',
};

const SoundStatement = ({ artistId, artistName }) => {
  const [fields, setFields] = useState(() => {
    const saved = loadStatement(artistId);
    return saved?.fields || { ...BLANK_FIELDS };
  });
  const [saved, setSaved] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const update = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    const fullStatement = buildStatement();
    saveStatement(artistId, { fields, statement: fullStatement });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const buildStatement = () => {
    const name = artistName || '[Artist Name]';
    const g1 = fields.genre1 || '[genre/style 1]';
    const g2 = fields.genre2 || '[genre/style 2]';
    const ks = fields.keySound || '[key instrument/sound]';
    const m = fields.mood || '[mood]';
    const u = fields.unique || '[what makes them unique]';
    return `${name} blends ${g1} with ${g2}, featuring ${ks} and creating a ${m} atmosphere that ${u}.`;
  };

  const allFilled = fields.genre1 && fields.genre2 && fields.keySound && fields.mood && fields.unique;

  // Auto-save on changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      const fullStatement = buildStatement();
      saveStatement(artistId, { fields, statement: fullStatement });
    }, 800);
    return () => clearTimeout(timeout);
  }, [fields, artistId]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white">Sound Statement</h2>
        <p className="text-white/40 text-sm">
          Write one sentence that captures {artistName || "your artist"}'s unique sound.
        </p>
      </div>

      {/* Examples toggle */}
      <button
        onClick={() => setShowExamples(prev => !prev)}
        className="flex items-center gap-2 text-amber-400/70 hover:text-amber-400 transition-colors text-sm min-h-[44px]"
      >
        <Lightbulb size={15} />
        <span className="font-medium">{showExamples ? 'Hide' : 'Show'} examples for inspiration</span>
      </button>

      {showExamples && (
        <div className="space-y-3">
          {EXAMPLES.map((ex, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex gap-3"
            >
              <Quote size={14} className="text-white/20 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white/60 text-sm leading-relaxed italic">{ex.text}</p>
                <p className="text-white/30 text-xs mt-1">-- {ex.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fill-in-the-blank template */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-4">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          Fill in Each Blank
        </h3>

        <div className="text-white/70 text-[15px] leading-loose">
          <span className="text-white font-medium">{artistName || '[Artist Name]'}</span>
          {' blends '}

          {/* Genre 1 */}
          <InlineInput
            value={fields.genre1}
            onChange={(v) => update('genre1', v)}
            placeholder="genre/style 1"
            hint="e.g. folk, hip-hop, jazz"
          />

          {' with '}

          {/* Genre 2 */}
          <InlineInput
            value={fields.genre2}
            onChange={(v) => update('genre2', v)}
            placeholder="genre/style 2"
            hint="e.g. electronic, R&B, punk"
          />

          {', featuring '}

          {/* Key sound */}
          <InlineInput
            value={fields.keySound}
            onChange={(v) => update('keySound', v)}
            placeholder="key instrument/sound"
            hint="e.g. haunting vocals, the tuba"
          />

          {' and creating a '}

          {/* Mood */}
          <InlineInput
            value={fields.mood}
            onChange={(v) => update('mood', v)}
            placeholder="mood"
            hint="e.g. dreamy, intense, meditative"
          />

          {' atmosphere that '}

          {/* Unique */}
          <InlineInput
            value={fields.unique}
            onChange={(v) => update('unique', v)}
            placeholder="what makes them unique"
            hint="e.g. connects ancient traditions to modern music"
            wide
          />

          {'.'}
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
          Preview
        </h3>
        <p className={`text-[15px] leading-relaxed ${allFilled ? 'text-white/90' : 'text-white/40 italic'}`}>
          {buildStatement()}
        </p>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!allFilled}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all min-h-[48px] ${
          saved
            ? 'bg-emerald-500/20 text-emerald-400'
            : allFilled
              ? 'bg-amber-400 text-black hover:bg-amber-300'
              : 'bg-white/[0.06] text-white/25 cursor-not-allowed'
        }`}
      >
        {saved ? <CheckCircle size={16} /> : <Save size={16} />}
        {saved ? 'Sound Statement Saved' : 'Save Sound Statement'}
      </button>
    </div>
  );
};

// Small inline input used within the sentence template
const InlineInput = ({ value, onChange, placeholder, hint, wide }) => (
  <span className="inline-block align-baseline">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      title={hint}
      className={`bg-white/[0.06] border-b-2 border-amber-400/40 focus:border-amber-400 rounded-t-md px-2 py-1 text-[15px] text-amber-300 placeholder-white/20 focus:outline-none transition-colors ${
        wide ? 'w-64' : 'w-40'
      }`}
      style={{ minHeight: '36px' }}
    />
  </span>
);

export default SoundStatement;
