// File: /src/lessons/shared/activities/capstone/CapstonePlanning.jsx
// Capstone Planning — fits 1366x768 Chromebook viewport
// White paper worksheet, 2-column layout, inline dropdown blanks.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Save, Play, Square } from 'lucide-react';
import { getPieceById } from '../../../listening-lab/lesson4/lesson4Config';

const SELECTION_STORAGE_KEY = 'listening-lab-lesson4-selected-piece';
const PLAN_STORAGE_KEY = 'listening-lab-lesson4-capstone-plan';

// ============ OPTIONS ============
const DYNAMICS_OPTIONS = [
  { value: '', label: 'select...' },
  { value: 'pp', label: 'pianissimo (pp)' },
  { value: 'p', label: 'piano (p)' },
  { value: 'mp', label: 'mezzo piano (mp)' },
  { value: 'mf', label: 'mezzo forte (mf)' },
  { value: 'f', label: 'forte (f)' },
  { value: 'ff', label: 'fortissimo (ff)' },
];

const TEMPO_OPTIONS = [
  { value: '', label: 'select...' },
  { value: 'largo', label: 'Largo' },
  { value: 'adagio', label: 'Adagio' },
  { value: 'andante', label: 'Andante' },
  { value: 'moderato', label: 'Moderato' },
  { value: 'allegro', label: 'Allegro' },
  { value: 'presto', label: 'Presto' },
];

const FAMILY_OPTIONS = [
  { value: '', label: 'select...' },
  { value: 'strings', label: 'Strings' },
  { value: 'woodwinds', label: 'Woodwinds' },
  { value: 'brass', label: 'Brass' },
  { value: 'percussion', label: 'Percussion' },
  { value: 'strings-woodwinds', label: 'Strings & Woodwinds' },
  { value: 'strings-brass', label: 'Strings & Brass' },
  { value: 'woodwinds-brass', label: 'Woodwinds & Brass' },
  { value: 'strings-woodwinds-brass', label: 'Strings, Woodwinds & Brass' },
  { value: 'full-orchestra', label: 'Full Orchestra' },
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
    className={`inline bg-transparent border-b-2 text-[11px] leading-tight px-0.5 py-0 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer mx-0.5 transition-colors ${
      value ? 'border-gray-300 text-gray-900 font-semibold hover:border-blue-400' : 'border-gray-200 text-gray-400 hover:border-gray-400'
    }`}
    style={{
      width: value ? `${Math.max(50, (options.find(o => o.value === value)?.label.length || 8) * 6.5 + 16)}px` : `${Math.max(50, (placeholder?.length || 8) * 5.5 + 12)}px`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1px center',
    }}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ============ GROUPED INSTRUMENT SELECT ============
const InstrumentSelect = ({ value, onChange, taken, placeholder }) => {
  const excluded = new Set(taken.filter(i => i !== value));
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`inline bg-transparent border-b-2 text-[11px] leading-tight px-0.5 py-0 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer mx-0.5 transition-colors ${
        value ? 'border-gray-300 text-gray-900 font-semibold hover:border-blue-400' : 'border-gray-200 text-gray-400 hover:border-gray-400'
      }`}
      style={{
        width: `${Math.max(50, ((value || placeholder || 'select...').length) * 6.5 + 16)}px`,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
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
    <span className={`transition-colors ${hasAny ? 'text-gray-700' : 'text-gray-300'}`}>
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

// ============ MAIN ============
const CapstonePlanning = ({ onComplete, isSessionMode }) => {
  const [piece, setPiece] = useState(null);
  const [plans, setPlans] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      let pieceId = null;
      const sel = localStorage.getItem(SELECTION_STORAGE_KEY);
      if (sel) { pieceId = JSON.parse(sel)?.pieceId; }
      const p = getPieceById(pieceId || 'mountain-king');
      if (!p) return;
      setPiece(p);
      const d = {};
      p.sections.forEach(s => { d[s.id] = { dynamics: '', tempo: '', families: '', instruments: [] }; });
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      if (saved) {
        const sp = JSON.parse(saved);
        if (sp?.pieceId === p.id && sp?.sections) {
          Object.keys(sp.sections).forEach(sid => {
            if (d[sid]) {
              const merged = { ...d[sid], ...sp.sections[sid] };
              if (!Array.isArray(merged.instruments)) merged.instruments = [];
              d[sid] = merged;
            }
          });
        }
      }
      setPlans(d);
    } catch (e) { console.error(e); }
  }, []);

  const { playSection, playingSection } = useSectionAudio(piece?.audioPath || '');

  const set = useCallback((sid, field, val) => {
    setPlans(prev => ({ ...prev, [sid]: { ...prev[sid], [field]: val } }));
    setIsSaved(false);
  }, []);

  const save = useCallback(() => {
    if (!piece) return;
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ pieceId: piece.id, sections: plans, savedAt: new Date().toISOString() }));
    setIsSaved(true);
  }, [piece, plans]);

  const done = useCallback(() => { save(); onComplete?.({ pieceId: piece?.id, sections: plans }); }, [save, onComplete, piece, plans]);

  if (!piece) return null;

  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* White paper area — fills viewport */}
      <div className="flex-1 flex justify-center overflow-auto py-3 px-3">
        <div className="bg-white shadow-lg w-full max-w-[1300px] rounded px-8 py-5 flex flex-col" style={{ maxHeight: '100%' }}>

          {/* Header — compact */}
          <div className="text-center mb-3 shrink-0">
            <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em]">Listening Lab — Capstone Project</p>
            <h1 className="text-lg font-bold text-gray-900 leading-tight mt-0.5">Plan Your Journey</h1>
            <h2 className="text-sm text-gray-500 italic">{piece.title}</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {piece.composer} ({piece.year}) &nbsp;&bull;&nbsp; Form: {piece.formLetters} &nbsp;&bull;&nbsp; {piece.duration}
            </p>
          </div>

          <div className="border-t border-gray-200 mb-3 shrink-0" />

          <p className="text-[10px] text-gray-400 mb-3 shrink-0">
            <strong className="text-gray-500">Directions:</strong> Listen to each section. Fill in the blanks to describe what you hear. This will guide your Listening Journey.
          </p>

          {/* Sections — single column, top to bottom */}
          <div className="flex-1 flex flex-col gap-2.5 min-h-0">
            {piece.sections.map((section, i) => {
              const plan = plans[section.id] || {};
              const playing = playingSection === section.id;
              const instruments = Array.isArray(plan.instruments) ? plan.instruments : [];

              return (
                <div key={section.id} className="shrink-0">
                  {/* Section heading + paragraph on same block */}
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="px-2 py-0.5 rounded text-white text-[11px] font-bold shrink-0"
                      style={{ backgroundColor: section.color }}
                    >
                      {section.label}
                    </span>
                    <h3 className="text-[12px] font-bold text-gray-900">
                      Section {section.label}
                    </h3>
                    <span className="text-[9px] text-gray-400">
                      {fmt(section.startTime)}–{fmt(section.endTime)}
                    </span>
                    <button
                      onClick={() => playSection(section.id, section.startTime, section.endTime)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ml-auto shrink-0 transition-colors ${
                        playing ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {playing
                        ? <><Square size={7} fill="currentColor" /> Stop</>
                        : <><Play size={7} fill="currentColor" /> Listen</>
                      }
                    </button>
                  </div>

                  <div className="text-[11px] text-gray-700 leading-[2] pl-1">
                    <p>
                      In this section, the dynamics I hear are
                      <Blank value={plan.dynamics} onChange={v => set(section.id, 'dynamics', v)} options={DYNAMICS_OPTIONS} placeholder="select..." />
                      and the tempo I hear is
                      <Blank value={plan.tempo} onChange={v => set(section.id, 'tempo', v)} options={TEMPO_OPTIONS} placeholder="select..." />.
                      The instrument families I hear are
                      <Blank value={plan.families} onChange={v => set(section.id, 'families', v)} options={FAMILY_OPTIONS} placeholder="select..." />.{' '}
                      <InstrumentSentence
                        instruments={instruments}
                        onChange={(arr) => set(section.id, 'instruments', arr)}
                      />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 py-2 px-4 shrink-0 flex items-center justify-end gap-3">
        <button
          onClick={save}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isSaved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          {isSaved ? <Check size={12} /> : <Save size={12} />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={done}
          className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
        >
          <Check size={12} /> Done
        </button>
      </div>
    </div>
  );
};

export default CapstonePlanning;
