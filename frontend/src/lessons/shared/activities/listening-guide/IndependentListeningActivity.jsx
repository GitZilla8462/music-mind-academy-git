// File: IndependentListeningActivity.jsx
// Independent Listening — student browses Artist Discovery, picks any track,
// fills out the same 7-question Listening Guide used in guided listening.
// Tabbed layout: Explore Artists | Listening Guide.
// Directions modal on first entry.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Headphones, Save, CheckCircle, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { ARTIST_DATABASE, getArtistById } from '../artist-discovery/artistDatabase';
import { saveStudentWork, getClassAuthInfo, getStudentId } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import { AudioProvider, useGlobalAudio } from '../artist-discovery/AudioContext';
import DirectionsModal from '../../components/DirectionsModal';
import ArtistDiscovery from '../artist-discovery/ArtistDiscovery';
import MiniPlayer from '../artist-discovery/profile/MiniPlayer';

// ── Reuse the same question options from guided listening ──
const INSTRUMENT_OPTIONS = [
  'Vocals', 'Guitar', 'Bass', 'Drums', 'Piano/Keys', 'Synthesizer',
  'Strings', 'Brass', 'Woodwinds', 'Percussion', 'Samples/Loops', 'Other',
];
const TEMPO_OPTIONS = [
  { label: 'Largo', help: 'Very slow' },
  { label: 'Adagio', help: 'Slow, relaxed' },
  { label: 'Andante', help: 'Walking speed' },
  { label: 'Moderato', help: 'Medium' },
  { label: 'Allegro', help: 'Fast, lively' },
  { label: 'Presto', help: 'Very fast' },
];
const TEMPO_CHANGE_OPTIONS = [
  { label: 'Accelerando', help: 'Getting faster' },
  { label: 'Ritardando', help: 'Getting slower' },
  { label: 'Steady', help: 'Stays the same' },
];
const DYNAMICS_OPTIONS = [
  { label: 'pp', help: 'Very soft' },
  { label: 'p', help: 'Soft' },
  { label: 'mp', help: 'Medium soft' },
  { label: 'mf', help: 'Medium loud' },
  { label: 'f', help: 'Loud' },
  { label: 'ff', help: 'Very loud' },
];
const DYNAMICS_CHANGE_OPTIONS = [
  { label: 'Crescendo', help: 'Getting louder' },
  { label: 'Decrescendo', help: 'Getting softer' },
  { label: 'Steady', help: 'Stays the same' },
];
const MOOD_OPTIONS = [
  'Energetic', 'Chill', 'Happy', 'Sad', 'Mysterious', 'Powerful',
  'Peaceful', 'Intense', 'Dreamy', 'Playful', 'Dark', 'Uplifting',
];
const TEXTURE_OPTIONS = [
  { label: 'Thin', help: '1-2 layers' },
  { label: 'Medium', help: '2-3 layers' },
  { label: 'Thick', help: '4+ layers' },
];

const STORAGE_KEY = 'mma-independent-listening-l2';
const DIRECTIONS_KEY = 'mma-independent-listening-directions-seen';

const EMPTY_ENTRY = () => ({
  artistName: '',
  trackTitle: '',
  genre: '',
  instruments: [],
  otherInstrument: '',
  tempo: '',
  tempoChange: '',
  dynamics: [],
  dynamicsChange: '',
  texture: '',
  moods: [],
  hook: '',
  influences: '',
  notes: '',
});

function getStorageKey() {
  const studentId = getStudentId();
  return `${STORAGE_KEY}-${studentId}`;
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (raw) return JSON.parse(raw);
    return null;
  } catch { return null; }
}

function saveToDisk(entry) {
  localStorage.setItem(getStorageKey(), JSON.stringify({ entry, savedAt: new Date().toISOString() }));
}

const DIRECTIONS_STEPS = [
  { text: 'Browse artists and listen to different songs' },
  { text: 'Find a track that stands out to you' },
  { text: 'Switch to "Listening Guide" and fill it out for your chosen track' },
  { text: 'Once complete, keep exploring!' },
];

// ── Listening Guide Form (7 questions, same as guided) ──
const ListeningGuideForm = ({ entry, updateField, toggleInstrument, toggleMood, viewMode, handleSave, saved }) => {
  const [qPage, setQPage] = useState(0);

  const QUESTIONS = [
    { id: 'track', label: 'Your Track', subtitle: 'What are you listening to?', done: !!(entry.artistName && entry.trackTitle) },
    { id: 'tempo', label: 'Tempo', subtitle: 'How fast is the music?', done: !!entry.tempo },
    { id: 'dynamics', label: 'Dynamics', subtitle: 'How loud or soft?', done: entry.dynamics.length > 0 },
    { id: 'mood', label: 'Mood', subtitle: 'What feeling does it create?', done: entry.moods.length > 0 },
    { id: 'instruments', label: 'Instruments', subtitle: 'What sounds do you hear?', done: entry.instruments.length > 0 },
    { id: 'texture', label: 'Texture', subtitle: 'How many layers?', done: !!entry.texture },
    { id: 'hook', label: 'Hook', subtitle: 'What\'s the catchiest part?', done: !!entry.hook },
    { id: 'bonus', label: 'Bonus', subtitle: 'Influences & notes (optional)', done: !!(entry.influences || entry.notes) },
  ];
  const totalCore = 7;
  const answeredCore = QUESTIONS.slice(0, 7).filter(q => q.done).length;
  const currentQ = QUESTIONS[qPage] || QUESTIONS[0];
  const isLastPage = qPage >= QUESTIONS.length - 1;
  const isFirstPage = qPage === 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar: nav */}
      <div className="shrink-0 px-3 py-2 bg-[#141a21] border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto">
          {/* Back/Next + progress dots */}
          <div className="flex items-center gap-2">
            <button onClick={() => setQPage(p => p - 1)} disabled={isFirstPage}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[32px] flex items-center gap-1 ${
                isFirstPage ? 'bg-white/[0.03] text-white/15 cursor-not-allowed' : 'bg-white/[0.08] text-white/70 hover:bg-white/[0.12]'
              }`}>
              <ChevronDown size={14} className="rotate-90" /> Back
            </button>
            <div className="flex-1 flex items-center justify-center gap-1">
              {QUESTIONS.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setQPage(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === qPage
                      ? 'bg-amber-400 scale-125'
                      : q.done
                        ? 'bg-emerald-400/60 hover:bg-emerald-400'
                        : 'bg-white/[0.12] hover:bg-white/[0.2]'
                  }`}
                  title={q.label}
                />
              ))}
            </div>
            {isLastPage ? (
              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[32px] flex items-center gap-1 bg-emerald-500/10 text-emerald-400">
                <CheckCircle size={14} /> Done
              </div>
            ) : (
              <button onClick={() => setQPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[32px] flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600">
                Next <ChevronDown size={14} className="-rotate-90" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="text-center mb-5">
            <h2 className="text-white text-xl font-bold">
              {currentQ.label}
              {currentQ.done && <CheckCircle size={18} className="inline ml-2 text-emerald-400" />}
            </h2>
            <p className="text-white/40 text-sm mt-1">{currentQ.subtitle}</p>
          </div>

          {/* Q0: Track Selection */}
          {qPage === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Artist</label>
                <select
                  value={entry.artistName}
                  onChange={(e) => {
                    if (viewMode) return;
                    const artistName = e.target.value;
                    updateField('artistName', artistName);
                    if (artistName !== entry.artistName) {
                      updateField('trackTitle', '');
                      const artist = ARTIST_DATABASE.find(a => a.name === artistName);
                      if (artist) updateField('genre', artist.genre);
                    }
                  }}
                  disabled={viewMode}
                  className="w-full bg-white/[0.04] border-2 border-white/[0.08] rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-amber-400/30 min-h-[48px] appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a2030]">Select an artist...</option>
                  {ARTIST_DATABASE.map(artist => (
                    <option key={artist.id} value={artist.name} className="bg-[#1a2030]">{artist.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Track</label>
                <select
                  value={entry.trackTitle}
                  onChange={(e) => !viewMode && updateField('trackTitle', e.target.value)}
                  disabled={viewMode || !entry.artistName}
                  className="w-full bg-white/[0.04] border-2 border-white/[0.08] rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-amber-400/30 min-h-[48px] appearance-none cursor-pointer disabled:opacity-40"
                >
                  <option value="" className="bg-[#1a2030]">{entry.artistName ? 'Select a track...' : 'Pick an artist first'}</option>
                  {(() => {
                    const artist = ARTIST_DATABASE.find(a => a.name === entry.artistName);
                    return artist?.tracks?.map(track => (
                      <option key={track.title} value={track.title} className="bg-[#1a2030]">{track.title}</option>
                    )) || [];
                  })()}
                </select>
              </div>
            </div>
          )}

          {/* Q1: Tempo */}
          {qPage === 1 && (
            <div className="space-y-3">
              <div className="flex flex-wrap justify-center gap-2">
                {TEMPO_OPTIONS.map(t => (
                  <button key={t.label} onClick={() => !viewMode && updateField('tempo', entry.tempo === t.label ? '' : t.label)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                      entry.tempo === t.label ? 'bg-amber-500/25 text-amber-300 border-2 border-amber-400/50' : 'bg-white/[0.04] text-white/60 border-2 border-white/[0.06] hover:bg-white/[0.08]'
                    }`}>{t.label} <span className="text-white/25 text-xs">({t.help})</span></button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {TEMPO_CHANGE_OPTIONS.map(t => (
                  <button key={t.label} onClick={() => !viewMode && updateField('tempoChange', entry.tempoChange === t.label ? '' : t.label)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                      entry.tempoChange === t.label ? 'bg-amber-500/20 text-amber-300 border border-amber-400/25' : 'bg-white/[0.03] text-white/30 border border-white/[0.05] hover:bg-white/[0.06]'
                    }`}>{t.label} <span className="text-white/15">({t.help})</span></button>
                ))}
              </div>
            </div>
          )}

          {/* Q2: Dynamics */}
          {qPage === 2 && (
            <div className="space-y-3">
              <div className="flex flex-wrap justify-center gap-2">
                {DYNAMICS_OPTIONS.map(d => {
                  const selected = entry.dynamics.includes(d.label);
                  return (
                    <button key={d.label} onClick={() => { if (viewMode) return; updateField('dynamics', selected ? entry.dynamics.filter(v => v !== d.label) : [...entry.dynamics, d.label]); }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                        selected ? 'bg-blue-500/25 text-blue-300 border-2 border-blue-400/50' : 'bg-white/[0.04] text-white/60 border-2 border-white/[0.06] hover:bg-white/[0.08]'
                      }`}><span className="font-bold">{d.label}</span> <span className="text-white/25 text-xs">({d.help})</span></button>
                  );
                })}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {DYNAMICS_CHANGE_OPTIONS.map(d => (
                  <button key={d.label} onClick={() => !viewMode && updateField('dynamicsChange', entry.dynamicsChange === d.label ? '' : d.label)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                      entry.dynamicsChange === d.label ? 'bg-blue-500/20 text-blue-300 border border-blue-400/25' : 'bg-white/[0.03] text-white/30 border border-white/[0.05] hover:bg-white/[0.06]'
                    }`}>{d.label} <span className="text-white/15">({d.help})</span></button>
                ))}
              </div>
            </div>
          )}

          {/* Q3: Mood */}
          {qPage === 3 && (
            <div className="flex flex-wrap justify-center gap-2">
              {MOOD_OPTIONS.map(mood => {
                const selected = entry.moods.includes(mood);
                const disabled = !selected && entry.moods.length >= 3;
                return (
                  <button key={mood} onClick={() => !viewMode && toggleMood(mood)} disabled={viewMode ? false : disabled}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                      selected ? 'bg-purple-500/25 text-purple-300 border-2 border-purple-400/50' : disabled ? 'bg-white/[0.02] text-white/15 border-2 border-white/[0.04] cursor-not-allowed' : 'bg-white/[0.04] text-white/60 border-2 border-white/[0.06] hover:bg-white/[0.08]'
                    }`}>{mood}</button>
                );
              })}
            </div>
          )}

          {/* Q4: Instruments */}
          {qPage === 4 && (
            <div className="space-y-3">
              <div className="flex flex-wrap justify-center gap-2">
                {INSTRUMENT_OPTIONS.map(inst => (
                  <button key={inst} onClick={() => !viewMode && toggleInstrument(inst)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                      entry.instruments.includes(inst) ? 'bg-emerald-500/25 text-emerald-300 border-2 border-emerald-400/50' : 'bg-white/[0.04] text-white/60 border-2 border-white/[0.06] hover:bg-white/[0.08]'
                    }`}>{inst}</button>
                ))}
              </div>
              {entry.instruments.includes('Other') && (
                <input type="text" value={entry.otherInstrument} onChange={(e) => !viewMode && updateField('otherInstrument', e.target.value)} readOnly={viewMode}
                  placeholder="What other instrument or sound?" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 min-h-[44px]" />
              )}
            </div>
          )}

          {/* Q5: Texture */}
          {qPage === 5 && (
            <div className="flex flex-wrap justify-center gap-3">
              {TEXTURE_OPTIONS.map(t => (
                <button key={t.label} onClick={() => !viewMode && updateField('texture', entry.texture === t.label ? '' : t.label)}
                  className={`px-6 py-4 rounded-xl text-base font-medium transition-all min-h-[56px] ${
                    entry.texture === t.label ? 'bg-teal-500/25 text-teal-300 border-2 border-teal-400/50' : 'bg-white/[0.04] text-white/60 border-2 border-white/[0.06] hover:bg-white/[0.08]'
                  }`}>{t.label} <span className="text-white/25 text-sm">({t.help})</span></button>
              ))}
            </div>
          )}

          {/* Q6: Hook */}
          {qPage === 6 && (
            <textarea value={entry.hook} onChange={(e) => !viewMode && updateField('hook', e.target.value)} readOnly={viewMode}
              placeholder="Describe the catchiest part in 1-2 sentences..." rows={4}
              className="w-full bg-white/[0.04] border-2 border-white/[0.08] rounded-xl px-4 py-3 text-base text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none" />
          )}

          {/* Q7: Bonus + Save */}
          {qPage === 7 && (
            <div className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Influences — Who do they remind you of?</label>
                <input type="text" value={entry.influences} onChange={(e) => !viewMode && updateField('influences', e.target.value)} readOnly={viewMode}
                  placeholder="What other artists or songs does this remind you of?" className="w-full bg-white/[0.04] border-2 border-white/[0.08] rounded-xl px-4 py-3 text-base text-white placeholder-white/25 focus:outline-none focus:border-white/20 min-h-[48px]" />
              </div>
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Notes — Anything else you noticed?</label>
                <textarea value={entry.notes} onChange={(e) => !viewMode && updateField('notes', e.target.value)} readOnly={viewMode}
                  placeholder="Additional observations about this track..." rows={3}
                  className="w-full bg-white/[0.04] border-2 border-white/[0.08] rounded-xl px-4 py-3 text-base text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none" />
              </div>
              {!viewMode && (
                <button
                  onClick={handleSave}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold transition-all min-h-[56px] ${
                    saved ? 'bg-emerald-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {saved ? <><CheckCircle size={20} /> Saved!</> : <><Save size={20} /> Save My Work</>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

// ── Main Inner Component ───────────────────────────────
const IndependentListeningInner = ({ onComplete, isSessionMode, viewMode }) => {
  const [activeTab, setActiveTab] = useState('discover');
  const [showDirections, setShowDirections] = useState(true);
  const audio = useGlobalAudio();
  const hasAudioPlaying = audio?.currentTrack != null;

  const saved = loadSaved();
  const [entry, setEntry] = useState(saved?.entry || EMPTY_ENTRY());
  const [isSaved, setIsSaved] = useState(false);

  const closeDirections = () => {
    setShowDirections(false);
    localStorage.setItem(DIRECTIONS_KEY, 'true');
  };

  // Auto-save locally (800ms debounce)
  useEffect(() => {
    if (viewMode) return;
    const timeout = setTimeout(() => {
      saveToDisk(entry);
      // Dashboard key
      const studentId = getStudentId();
      const dashKey = `mma-saved-${studentId}-independent-listening`;
      try {
        localStorage.setItem(dashKey, JSON.stringify({
          activityId: 'independent-listening',
          title: 'Independent Listening',
          emoji: '\uD83C\uDFA7',
          viewRoute: '/lessons/music-journalist/lesson2?view=independent-listening',
          subtitle: entry.artistName && entry.trackTitle ? `"${entry.trackTitle}" by ${entry.artistName}` : 'Track analysis',
          category: 'Music Agent',
          lastSaved: new Date().toISOString(),
          data: { entry }
        }));
      } catch { /* localStorage full or blocked */ }
    }, 800);
    return () => clearTimeout(timeout);
  }, [entry, viewMode]);

  const updateField = useCallback((field, value) => {
    setEntry(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  }, []);

  const toggleInstrument = useCallback((inst) => {
    setEntry(prev => ({
      ...prev,
      instruments: prev.instruments.includes(inst)
        ? prev.instruments.filter(i => i !== inst)
        : [...prev.instruments, inst]
    }));
    setIsSaved(false);
  }, []);

  const toggleMood = useCallback((mood) => {
    setEntry(prev => {
      if (prev.moods.includes(mood)) return { ...prev, moods: prev.moods.filter(m => m !== mood) };
      if (prev.moods.length >= 3) return prev;
      return { ...prev, moods: [...prev.moods, mood] };
    });
    setIsSaved(false);
  }, []);

  // Firebase save
  const fullSave = useCallback(() => {
    saveToDisk(entry);
    setIsSaved(true);
    const authInfo = getClassAuthInfo();
    saveStudentWork('independent-listening', {
      title: 'Independent Listening',
      emoji: '\uD83C\uDFA7',
      viewRoute: '/lessons/music-journalist/lesson2?view=independent-listening',
      subtitle: entry.artistName && entry.trackTitle ? `"${entry.trackTitle}" by ${entry.artistName}` : 'Track analysis',
      category: 'Music Agent',
      lessonId: 'mj-lesson2',
      data: { entry }
    }, null, authInfo);
  }, [entry]);

  const handleSave = () => {
    fullSave();
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Teacher "Save All" listener
  const { sessionCode } = useSession();
  const classCode = new URLSearchParams(window.location.search).get('classCode');
  const effectiveSessionCode = sessionCode || classCode;
  const lastSaveCommandRef = useRef(null);
  const componentMountTimeRef = useRef(Date.now());
  const [teacherSaveToast, setTeacherSaveToast] = useState(false);

  useEffect(() => {
    if (!effectiveSessionCode || !isSessionMode || viewMode) return;
    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${effectiveSessionCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();
      if (!saveCommand) return;
      if (saveCommand <= componentMountTimeRef.current) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }
      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        fullSave();
        setTeacherSaveToast(true);
        setTimeout(() => setTeacherSaveToast(false), 3000);
      }
    });
    return () => unsubscribe();
  }, [effectiveSessionCode, isSessionMode, fullSave, viewMode]);

  // Compute progress for the tab badge
  const answeredCore = [
    !!entry.tempo,
    entry.dynamics.length > 0,
    entry.moods.length > 0,
    entry.instruments.length > 0,
    !!entry.texture,
    !!entry.hook,
  ].filter(Boolean).length;
  const totalCore = 6;

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0f1419' }}>
      {/* Directions modal — shared component */}
      <DirectionsModal
        title="Independent Listening"
        isOpen={showDirections}
        onClose={closeDirections}
        steps={DIRECTIONS_STEPS}
        bonusText="Use the Music Description Toolkit from earlier!"
      />

      {/* Tab bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/10" style={{ background: '#0f1b2e' }}>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'discover' ? 'bg-amber-500/20 text-amber-300' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Search size={12} /> Explore Artists
            </button>
            <button
              onClick={() => setActiveTab('listening')}
              className={`px-3 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'listening'
                  ? 'bg-amber-500/20 text-amber-300'
                  : answeredCore === 0
                    ? 'bg-red-500/15 text-red-300 hover:bg-red-500/25 animate-pulse'
                    : answeredCore < totalCore
                      ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              <Headphones size={13} /> Listening Guide
            </button>
          </div>
          {/* Progress text — always visible */}
          <span className={`text-xs font-bold ${answeredCore === 0 ? 'text-red-400' : answeredCore < totalCore ? 'text-amber-400' : 'text-emerald-400'}`}>
            {answeredCore}/{totalCore} Listening Guide Questions Answered
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Directions re-open button */}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDirections(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition-colors"
          >
            <HelpCircle size={12} /> Directions
          </button>
          {!viewMode && (
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSaved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white hover:bg-white/15'
              }`}>
              {isSaved ? <CheckCircle size={12} /> : <Save size={12} />}
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Artist Discovery */}
        <div className="flex-1 overflow-hidden" style={{ display: activeTab === 'discover' ? 'block' : 'none' }}>
          <div className="h-full overflow-y-auto">
            <ArtistDiscovery isSessionMode={isSessionMode} hideMiniPlayer />
          </div>
        </div>

        {/* Listening Guide */}
        <div className="flex-1 overflow-hidden flex flex-col" style={{ display: activeTab === 'listening' ? 'flex' : 'none' }}>
          <ListeningGuideForm
            entry={entry}
            updateField={updateField}
            toggleInstrument={toggleInstrument}
            toggleMood={toggleMood}
            viewMode={viewMode}
            handleSave={handleSave}
            saved={isSaved}
          />
        </div>
      </div>

      {/* MiniPlayer */}
      {hasAudioPlaying && (
        <MiniPlayer
          currentTrack={audio.currentTrack}
          isPlaying={audio.isPlaying}
          progress={audio.progress}
          currentTime={audio.currentTime}
          duration={audio.duration}
          onTogglePlay={audio.togglePlay}
          onNext={audio.next}
          onPrev={audio.prev}
          onSeek={audio.seek}
          volume={audio.volume}
          onVolumeChange={audio.setVolume}
          imageUrl={audio.artistImageUrl}
          artistName={audio.artistName}
          onArtistClick={() => setActiveTab('discover')}
        />
      )}

      {/* Teacher Save All toast */}
      {teacherSaveToast && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden text-center">
            <div className="bg-green-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Saving Your Work</h3>
            </div>
            <div className="p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-700 text-lg font-semibold">Your work is being saved!</p>
              <p className="text-gray-500 text-sm mt-2">You can view it anytime from your dashboard.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Exported wrapper with AudioProvider ────────────────
const IndependentListeningActivity = (props) => (
  <AudioProvider>
    <IndependentListeningInner {...props} />
  </AudioProvider>
);

export default IndependentListeningActivity;
