// File: /src/lessons/shared/activities/capstone/CapstonePlanning.jsx
// Capstone Planning — fits 1366x768 Chromebook viewport
// White paper worksheet, 2-column layout, inline dropdown blanks.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Save, Play, Square, Plus, ChevronDown } from 'lucide-react';
import { getPieceById } from '../../../listening-lab/lesson4/lesson4Config';

const SELECTION_STORAGE_KEY = 'listening-lab-lesson4-selected-piece';
const PLAN_STORAGE_KEY = 'listening-lab-lesson4-capstone-plan';

// ============ OPTIONS ============
const DYNAMICS_OPTIONS = [
  { value: 'pp', label: 'pianissimo (pp)' },
  { value: 'p', label: 'piano (p)' },
  { value: 'mp', label: 'mezzo piano (mp)' },
  { value: 'mf', label: 'mezzo forte (mf)' },
  { value: 'f', label: 'forte (f)' },
  { value: 'ff', label: 'fortissimo (ff)' },
  { value: 'crescendo', label: 'crescendo' },
  { value: 'decrescendo', label: 'decrescendo' },
];

const TEMPO_OPTIONS = [
  { value: 'largo', label: 'Largo' },
  { value: 'adagio', label: 'Adagio' },
  { value: 'andante', label: 'Andante' },
  { value: 'moderato', label: 'Moderato' },
  { value: 'allegro', label: 'Allegro' },
  { value: 'presto', label: 'Presto' },
  { value: 'accelerando', label: 'accelerando' },
  { value: 'ritardando', label: 'ritardando' },
];

const FAMILY_OPTIONS = [
  { value: 'strings', label: 'Strings' },
  { value: 'woodwinds', label: 'Woodwinds' },
  { value: 'brass', label: 'Brass' },
  { value: 'percussion', label: 'Percussion' },
];

const INSTRUMENTS_BY_FAMILY = [
  { family: 'Strings', instruments: ['Violin', 'Viola', 'Cello', 'Double Bass'] },
  { family: 'Woodwinds', instruments: ['Flute', 'Oboe', 'Clarinet', 'Bassoon'] },
  { family: 'Brass', instruments: ['French Horn', 'Trumpet', 'Trombone', 'Tuba'] },
  { family: 'Percussion', instruments: ['Timpani', 'Cymbals', 'Snare Drum', 'Bass Drum'] },
];
const ALL_INSTRUMENTS = INSTRUMENTS_BY_FAMILY.flatMap(f => f.instruments);

// ============ AUDIO HOOK ============
const useSectionAudio = (audioPath) => {
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const [playingSection, setPlayingSection] = useState(null);

  useEffect(() => {
    if (!audioPath) return;
    audioRef.current = new Audio(audioPath);
    audioRef.current.preload = 'auto';
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    };
  }, [audioPath]);

  const playSection = useCallback((sectionId, startTime, endTime) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (playingSection === sectionId) { audio.pause(); setPlayingSection(null); return; }
    audio.currentTime = startTime;
    audio.play().catch(() => {});
    setPlayingSection(sectionId);
    timerRef.current = setTimeout(() => { audio.pause(); setPlayingSection(null); }, (endTime - startTime) * 1000);
  }, [playingSection]);

  return { playSection, playingSection };
};

// ============ INLINE SELECT ============
const Blank = ({ value, onChange, options, placeholder }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className={`inline bg-transparent border-b-2 text-sm leading-tight px-0.5 py-0 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer mx-0.5 transition-colors ${
      value ? 'border-gray-400 text-gray-900 font-semibold hover:border-blue-400' : 'border-gray-300 text-gray-400 hover:border-gray-400'
    }`}
    style={{
      width: value ? `${Math.max(55, (options.find(o => o.value === value)?.label.length || 8) * 7.5 + 18)}px` : `${Math.max(55, (placeholder?.length || 8) * 6.5 + 14)}px`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1px center',
    }}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ============ FLAT MULTI-SELECT DROPDOWN ============
const FlatSelect = ({ value, onChange, options, taken, placeholder }) => {
  const excluded = new Set(taken.filter(v => v !== value));
  const available = options.filter(o => !excluded.has(o.value));
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`inline bg-transparent border-b-2 text-sm leading-tight px-0.5 py-0 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer mx-0.5 transition-colors ${
        value ? 'border-gray-400 text-gray-900 font-semibold hover:border-blue-400' : 'border-gray-300 text-gray-400 hover:border-gray-400'
      }`}
      style={{
        width: `${Math.max(55, ((value ? (options.find(o => o.value === value)?.label || value) : (placeholder || 'select...')).length) * 7.5 + 18)}px`,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1px center',
      }}
    >
      <option value="">{value ? 'remove' : (placeholder || 'select...')}</option>
      {available.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
};

// ============ MULTI-SELECT SENTENCE ============
const MultiSelectSentence = ({ items, onChange, options, prefix, suffix }) => {
  const hasAny = items.length > 0;

  const handleChange = (index, newVal) => {
    const updated = [...items];
    if (newVal === '') { updated.splice(index, 1); } else { updated[index] = newVal; }
    onChange(updated);
  };

  const handleAdd = (newVal) => { if (newVal) onChange([...items, newVal]); };
  const canAddMore = options.length > items.length;

  return (
    <span className={`transition-colors ${hasAny ? 'text-gray-900' : 'text-gray-400'}`}>
      {prefix}
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const isSecondToLast = idx === items.length - 2;
        return (
          <span key={idx}>
            <FlatSelect value={item} onChange={(v) => handleChange(idx, v)} options={options} taken={items} placeholder={options.find(o => o.value === item)?.label || item} />
            {!isLast && items.length === 2 && isSecondToLast && ' and '}
            {!isLast && items.length > 2 && isSecondToLast && ', and '}
            {!isLast && !isSecondToLast && ', '}
          </span>
        );
      })}
      {canAddMore && (
        <>
          {hasAny && items.length === 1 && ' and '}
          {hasAny && items.length > 1 && ', and '}
          <FlatSelect value="" onChange={handleAdd} options={options} taken={items} placeholder={hasAny ? 'add more...' : 'select...'} />
        </>
      )}
      {suffix}
    </span>
  );
};

// ============ GROUPED INSTRUMENT SELECT ============
const InstrumentSelect = ({ value, onChange, taken, placeholder }) => {
  const excluded = new Set(taken.filter(i => i !== value));
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`inline bg-transparent border-b-2 text-sm leading-tight px-0.5 py-0 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer mx-0.5 transition-colors ${
        value ? 'border-gray-400 text-gray-900 font-semibold hover:border-blue-400' : 'border-gray-300 text-gray-400 hover:border-gray-400'
      }`}
      style={{
        width: `${Math.max(55, ((value || placeholder || 'select...').length) * 7.5 + 18)}px`,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1px center',
      }}
    >
      <option value="">{value ? 'remove' : (placeholder || 'select...')}</option>
      {INSTRUMENTS_BY_FAMILY.map(group => {
        const available = group.instruments.filter(i => !excluded.has(i));
        if (available.length === 0) return null;
        return (
          <optgroup key={group.family} label={`── ${group.family} ──`}>
            {available.map(i => <option key={i} value={i}>{i}</option>)}
          </optgroup>
        );
      })}
    </select>
  );
};

// ============ INSTRUMENT SENTENCE ============
const InstrumentSentence = ({ instruments, onChange }) => {
  const hasAny = instruments.length > 0;

  const handleChange = (index, newVal) => {
    const updated = [...instruments];
    if (newVal === '') { updated.splice(index, 1); } else { updated[index] = newVal; }
    onChange(updated);
  };

  const handleAdd = (newVal) => { if (newVal) onChange([...instruments, newVal]); };
  const canAddMore = ALL_INSTRUMENTS.length > instruments.length;

  return (
    <span className={`transition-colors ${hasAny ? 'text-gray-900' : 'text-gray-400'}`}>
      I can also hear{' '}
      {instruments.map((inst, idx) => {
        const isLast = idx === instruments.length - 1;
        const isSecondToLast = idx === instruments.length - 2;
        return (
          <span key={idx}>
            <InstrumentSelect value={inst} onChange={(v) => handleChange(idx, v)} taken={instruments} placeholder={inst} />
            {!isLast && instruments.length === 2 && isSecondToLast && ' and '}
            {!isLast && instruments.length > 2 && isSecondToLast && ', and '}
            {!isLast && !isSecondToLast && ', '}
          </span>
        );
      })}
      {canAddMore && (
        <>
          {hasAny && instruments.length === 1 && ' and '}
          {hasAny && instruments.length > 1 && ', and '}
          <InstrumentSelect value="" onChange={handleAdd} taken={instruments} placeholder={hasAny ? 'add more...' : 'select...'} />
        </>
      )}
      .
    </span>
  );
};

// ============ COLLAPSIBLE INSTRUMENTS ============
const CollapsibleInstruments = ({ instruments, onChange }) => {
  const [expanded, setExpanded] = useState(instruments.length > 0);
  const hasAny = instruments.length > 0;

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        <Plus size={12} />
        {hasAny ? `Specific instruments (${instruments.length})` : 'Add specific instruments'}
      </button>
    );
  }

  return (
    <div className="mt-0.5 flex items-start gap-1">
      <button
        onClick={() => setExpanded(false)}
        className="shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ChevronDown size={14} />
      </button>
      <span className="text-sm text-gray-900">
        <InstrumentSentence instruments={instruments} onChange={onChange} />
      </span>
    </div>
  );
};

// ============ MAIN ============
const CapstonePlanning = ({ onComplete, isSessionMode, highlightSection = null, initialData = null, viewMode = false }) => {
  const [piece, setPiece] = useState(null);
  const [plans, setPlans] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      // If initialData provided (grading view), use it directly
      const pieceIdFromData = initialData?.pieceId;
      let pieceId = pieceIdFromData || null;
      if (!pieceId) {
        const sel = localStorage.getItem(SELECTION_STORAGE_KEY);
        if (sel) { pieceId = JSON.parse(sel)?.pieceId; }
      }
      const p = getPieceById(pieceId || 'mountain-king');
      if (!p) return;
      setPiece(p);
      const d = {};
      p.sections.forEach(s => { d[s.id] = { dynamics: [], tempo: [], families: [], instruments: [] }; });

      // Load from initialData prop or localStorage
      const savedSections = initialData?.sections || (() => {
        const saved = localStorage.getItem(PLAN_STORAGE_KEY);
        if (saved) {
          const sp = JSON.parse(saved);
          if (sp?.pieceId === p.id && sp?.sections) return sp.sections;
        }
        return null;
      })();

      if (savedSections) {
        Object.keys(savedSections).forEach(sid => {
          if (d[sid]) {
            const merged = { ...d[sid], ...savedSections[sid] };
            if (!Array.isArray(merged.instruments)) merged.instruments = [];
            // Backward compat: convert old string values to arrays
            if (typeof merged.dynamics === 'string') merged.dynamics = merged.dynamics ? [merged.dynamics] : [];
            if (typeof merged.tempo === 'string') merged.tempo = merged.tempo ? [merged.tempo] : [];
            if (typeof merged.families === 'string') merged.families = merged.families ? [merged.families] : [];
            d[sid] = merged;
          }
        });
      }
      setPlans(d);
    } catch (e) { console.error(e); }
  }, [initialData]);

  const { playSection, playingSection } = useSectionAudio(piece?.audioPath || '');

  const set = useCallback((sid, field, val) => {
    if (viewMode) return;
    setPlans(prev => ({ ...prev, [sid]: { ...prev[sid], [field]: val } }));
    setIsSaved(false);
  }, [viewMode]);

  const save = useCallback(() => {
    if (!piece) return;
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ pieceId: piece.id, sections: plans, savedAt: new Date().toISOString() }));
    setIsSaved(true);
  }, [piece, plans]);

  const done = useCallback(() => { save(); onComplete?.(); }, [save, onComplete]);

  if (!piece) return null;

  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* White paper area — fills viewport */}
      <div className="flex-1 flex justify-center overflow-auto py-3 px-3">
        <div className="bg-white shadow-lg w-full max-w-[1300px] rounded px-8 py-5 flex flex-col" style={{ maxHeight: '100%' }}>

          {/* Header — compact */}
          <div className="text-center mb-3 shrink-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Listening Lab — Capstone Project</p>
            <h1 className="text-xl font-bold text-gray-900 leading-tight mt-0.5">Plan Your Journey</h1>
            <h2 className="text-base text-gray-600 italic">{piece.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {piece.composer} ({piece.year}) &nbsp;&bull;&nbsp; Form: {piece.formLetters} &nbsp;&bull;&nbsp; {piece.duration}
            </p>
          </div>

          <div className="border-t border-gray-200 mb-3 shrink-0" />

          <p className="text-xs text-gray-500 mb-3 shrink-0">
            <strong className="text-gray-600">Directions:</strong> Listen to each section. Fill in the blanks to describe what you hear. This will guide your Listening Journey.
          </p>

          {/* Sections — single column, top to bottom */}
          <div className="flex-1 flex flex-col gap-2.5 min-h-0">
            {piece.sections.map((section, i) => {
              const plan = plans[section.id] || {};
              const playing = playingSection === section.id;
              const instruments = Array.isArray(plan.instruments) ? plan.instruments : [];
              const dynamics = Array.isArray(plan.dynamics) ? plan.dynamics : [];
              const tempos = Array.isArray(plan.tempo) ? plan.tempo : [];
              const families = Array.isArray(plan.families) ? plan.families : (plan.families ? [plan.families] : []);

              const isHighlighted = highlightSection === section.id || highlightSection === section.label;

              return (
                <div
                  key={section.id}
                  className={`shrink-0 rounded-lg transition-all duration-300 ${
                    isHighlighted
                      ? 'bg-yellow-50 p-2 -mx-2'
                      : highlightSection != null ? 'opacity-30 p-2 -mx-2' : ''
                  }`}
                  style={isHighlighted ? { border: `3px solid ${section.color}`, boxShadow: `0 0 0 3px ${section.color}30, 0 0 24px ${section.color}15` } : {}}
                >
                  {/* Section heading + paragraph on same block */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2.5 py-0.5 rounded text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: section.color }}
                    >
                      {section.label}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900">
                      Section {section.label}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {fmt(section.startTime)}–{fmt(section.endTime)}
                    </span>
                    <button
                      onClick={() => playSection(section.id, section.startTime, section.endTime)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ml-auto shrink-0 transition-colors ${
                        playing ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {playing
                        ? <><Square size={10} fill="currentColor" /> Stop</>
                        : <><Play size={10} fill="currentColor" /> Listen</>
                      }
                    </button>
                  </div>

                  <div className="text-sm text-gray-900 leading-[2] pl-1">
                    <p>
                      <MultiSelectSentence
                        items={dynamics}
                        onChange={(arr) => set(section.id, 'dynamics', arr)}
                        options={DYNAMICS_OPTIONS}
                        prefix="In this section, the dynamics I hear are "
                        suffix=""
                      />
                      {' '}and{' '}
                      <MultiSelectSentence
                        items={tempos}
                        onChange={(arr) => set(section.id, 'tempo', arr)}
                        options={TEMPO_OPTIONS}
                        prefix="the tempo I hear is "
                        suffix="."
                      />
                      {' '}
                      <MultiSelectSentence
                        items={families}
                        onChange={(arr) => set(section.id, 'families', arr)}
                        options={FAMILY_OPTIONS}
                        prefix="The instrument families I hear are "
                        suffix="."
                      />
                    </p>
                    {/* Collapsible specific instruments */}
                    <CollapsibleInstruments
                      instruments={instruments}
                      onChange={(arr) => set(section.id, 'instruments', arr)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar — hidden in view mode */}
      {!viewMode && <div className="bg-white border-t border-gray-200 py-3 px-6 shrink-0 flex items-center justify-end gap-3">
        <button
          onClick={save}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            isSaved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          {isSaved ? <Check size={16} /> : <Save size={16} />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={done}
          className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700"
        >
          <Check size={16} /> Done
        </button>
      </div>}
    </div>
  );
};

export default CapstonePlanning;
