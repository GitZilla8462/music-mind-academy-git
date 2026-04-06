// File: GuidedListeningActivity.jsx
// Student view for teacher-guided listening.
// Teacher plays 3 tracks on classroom speakers. Students fill out the listening guide.
// No audio player on student side — they listen to the teacher's speakers.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Music, ChevronDown, ChevronUp, Save, CheckCircle, Headphones, Search } from 'lucide-react';
import { GUIDED_TRACKS } from '../../../music-journalist/lesson2/lesson2Config';
import { getArtistById } from '../artist-discovery/artistDatabase';
import { saveStudentWork, getClassAuthInfo, getStudentId } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import { AudioProvider, useGlobalAudio } from '../artist-discovery/AudioContext';
import ArtistDiscovery from '../artist-discovery/ArtistDiscovery';
import MiniPlayer from '../artist-discovery/profile/MiniPlayer';

// Instruments — common pop/rock instruments + orchestral families from Unit 2
const INSTRUMENT_OPTIONS = [
  'Vocals', 'Guitar', 'Bass', 'Drums', 'Piano/Keys', 'Synthesizer',
  'Strings', 'Brass', 'Woodwinds', 'Percussion', 'Samples/Loops', 'Other',
];

// Tempo — Italian terms from Unit 2 Listening Lab with helping descriptions
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

// Dynamics — from Unit 2 Listening Lab Lesson 1
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

// Mood — from Unit 1 + expanded
const MOOD_OPTIONS = [
  'Energetic', 'Chill', 'Happy', 'Sad', 'Mysterious', 'Powerful',
  'Peaceful', 'Intense', 'Dreamy', 'Playful', 'Dark', 'Uplifting',
];

// Texture — from Unit 1 Lesson 2
const TEXTURE_OPTIONS = [
  { label: 'Thin', help: '1-2 layers' },
  { label: 'Medium', help: '2-3 layers' },
  { label: 'Thick', help: '4+ layers' },
];

const EMPTY_ENTRY = () => ({
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

// Per-student storage key so shared Chromebooks don't overwrite each other
function getStorageKey() {
  const studentId = getStudentId();
  return `mma-guided-listening-l3-${studentId}`;
}

function loadSaved() {
  try {
    // Try working state first
    const raw = localStorage.getItem(getStorageKey());
    if (raw) return JSON.parse(raw);
    // Fallback: try the saveStudentWork entry (mma-saved-{id}-guided-listening)
    const studentId = getStudentId();
    const savedWork = localStorage.getItem(`mma-saved-${studentId}-guided-listening`);
    if (savedWork) {
      const parsed = JSON.parse(savedWork);
      if (parsed?.data?.entries) return { entries: parsed.data.entries };
    }
    return null;
  } catch { return null; }
}

function saveToDisk(entries) {
  localStorage.setItem(getStorageKey(), JSON.stringify({ entries, savedAt: new Date().toISOString() }));
}

const GuidedListeningActivity = ({ onComplete, isSessionMode, highlightTrack, singleTrackId, viewMode, initialData, embedded }) => {
  // When singleTrackId is set, only show that one track (used in teacher split-screen view)
  const visibleTracks = singleTrackId
    ? GUIDED_TRACKS.filter(t => t.id === singleTrackId)
    : GUIDED_TRACKS;

  const [entries, setEntries] = useState(() => {
    // View mode with initialData: use the saved data directly
    if (viewMode && initialData?.entries) return initialData.entries;
    // Normal mode: load from localStorage
    const saved = loadSaved();
    if (saved?.entries && Object.keys(saved.entries).length) return saved.entries;
    const init = {};
    GUIDED_TRACKS.forEach(t => { init[t.id] = EMPTY_ENTRY(); });
    return init;
  });
  const [selectedTab, setSelectedTab] = useState(singleTrackId || GUIDED_TRACKS[0]?.id);

  // Track how far the teacher has progressed — students can go back but not forward
  const { currentStage, sessionCode } = useSession();
  const stageToIndex = { 'guided-listening-1': 0, 'guided-listening-2': 1, 'guided-listening-3': 2 };
  const teacherTrackIndex = stageToIndex[currentStage] ?? 0;
  // In view mode or single-track mode, all tabs are unlocked
  const maxUnlockedIndex = (viewMode || singleTrackId) ? 2 : teacherTrackIndex;

  // Auto-switch to the teacher's current track
  useEffect(() => {
    if (highlightTrack) { setSelectedTab(highlightTrack); return; }
    const stageToTrack = {
      'guided-listening-1': 'guided-1',
      'guided-listening-2': 'guided-2',
      'guided-listening-3': 'guided-3',
    };
    const trackId = stageToTrack[currentStage];
    if (trackId) { setSelectedTab(trackId); setQPage(0); }
  }, [highlightTrack, currentStage]);
  const [saved, setSaved] = useState(false);
  const [qPage, setQPage] = useState(0); // 0-7: which question is shown

  // Auto-save: working state + dashboard key (so student dashboard always has latest)
  useEffect(() => {
    if (viewMode) return; // Don't save in view mode
    const timeout = setTimeout(() => {
      saveToDisk(entries);
      // Also write to the mma-saved-* key so student dashboard sees it
      const studentId = getStudentId();
      const dashKey = `mma-saved-${studentId}-guided-listening`;
      try {
        localStorage.setItem(dashKey, JSON.stringify({
          activityId: 'guided-listening',
          title: 'Guided Listening',
          emoji: '\uD83C\uDFA7',
          viewRoute: '/lessons/music-journalist/lesson2?view=guided-listening',
          subtitle: `${GUIDED_TRACKS.length} tracks analyzed`,
          category: 'Music Journalist',
          lastSaved: new Date().toISOString(),
          data: { entries }
        }));
      } catch { /* localStorage full or blocked */ }
    }, 800);
    return () => clearTimeout(timeout);
  }, [entries, viewMode]);

  const updateField = useCallback((trackId, field, value) => {
    setEntries(prev => ({
      ...prev,
      [trackId]: { ...prev[trackId], [field]: value }
    }));
    setSaved(false);
  }, []);

  const toggleInstrument = useCallback((trackId, inst) => {
    setEntries(prev => {
      const entry = { ...prev[trackId] };
      entry.instruments = entry.instruments.includes(inst)
        ? entry.instruments.filter(i => i !== inst)
        : [...entry.instruments, inst];
      return { ...prev, [trackId]: entry };
    });
    setSaved(false);
  }, []);

  const toggleMood = useCallback((trackId, mood) => {
    setEntries(prev => {
      const entry = { ...prev[trackId] };
      if (entry.moods.includes(mood)) {
        entry.moods = entry.moods.filter(m => m !== mood);
      } else if (entry.moods.length < 3) {
        entry.moods = [...entry.moods, mood];
      }
      return { ...prev, [trackId]: entry };
    });
    setSaved(false);
  }, []);

  // ── Firebase save (teacher Save All + manual save) ────
  const fullSave = useCallback(() => {
    saveToDisk(entries);
    setSaved(true);
    const authInfo = getClassAuthInfo();
    saveStudentWork('guided-listening', {
      title: 'Guided Listening',
      emoji: '\uD83C\uDFA7',
      viewRoute: '/lessons/music-journalist/lesson2?view=guided-listening',
      subtitle: `${GUIDED_TRACKS.length} tracks analyzed`,
      category: 'Music Journalist',
      lessonId: 'mj-lesson2',
      data: { entries }
    }, null, authInfo);
  }, [entries]);

  const handleSave = () => {
    fullSave();
    setTimeout(() => setSaved(false), 2000);
  };

  // Listen for teacher "Save All" command
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
  }, [effectiveSessionCode, isSessionMode, fullSave]);

  return (
    <div className={`${embedded ? 'h-full' : 'h-screen'} flex flex-col bg-[#0f1419]`}>
      {/* Header — hidden in single-track (teacher split) mode */}
      {!singleTrackId && (
        <div className="flex-shrink-0 border-b border-white/[0.08] bg-[#0f1419] px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {viewMode && (
                <button
                  onClick={onComplete}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/15"
                >
                  <ChevronDown size={20} className="rotate-90" />
                </button>
              )}
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Headphones size={20} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Guided Listening</h1>
                <p className="text-white/40 text-xs">{viewMode ? 'Viewing saved work — 3 tracks analyzed' : 'Fill out the listening guide independently. Then discuss your findings as a class.'}</p>
              </div>
            </div>
            {!viewMode && (
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                  saved
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {saved ? <CheckCircle size={16} /> : <Save size={16} />}
                {saved ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Track selector dropdowns — hidden in single-track (teacher split) mode */}
      {!singleTrackId && (
        <div className="flex-shrink-0 bg-[#0f1419] border-b border-white/[0.08] px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Artist</label>
              <select
                value={selectedTab}
                onChange={(e) => {
                  const idx = GUIDED_TRACKS.findIndex(t => t.id === e.target.value);
                  if (idx <= maxUnlockedIndex) { setSelectedTab(e.target.value); setQPage(0); }
                }}
                className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-2.5 text-white text-sm font-medium appearance-none cursor-pointer min-h-[44px] focus:outline-none focus:border-amber-400/50"
              >
                {GUIDED_TRACKS.map((track, idx) => {
                  const isLocked = idx > maxUnlockedIndex;
                  return (
                    <option key={track.id} value={track.id} disabled={isLocked} className="bg-[#1a2030] text-white">
                      {isLocked ? '🔒 ' : ''}{track.artist}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Track</label>
              <select
                value={selectedTab}
                onChange={(e) => {
                  const idx = GUIDED_TRACKS.findIndex(t => t.id === e.target.value);
                  if (idx <= maxUnlockedIndex) { setSelectedTab(e.target.value); setQPage(0); }
                }}
                className="w-full bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-2.5 text-white text-sm font-medium appearance-none cursor-pointer min-h-[44px] focus:outline-none focus:border-amber-400/50"
              >
                {GUIDED_TRACKS.map((track, idx) => {
                  const isLocked = idx > maxUnlockedIndex;
                  return (
                    <option key={track.id} value={track.id} disabled={isLocked} className="bg-[#1a2030] text-white">
                      {isLocked ? '🔒 ' : ''}"{track.title}"
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* One-question-at-a-time form */}
      {(() => {
        const track = visibleTracks.find(t => t.id === selectedTab) || visibleTracks[0];
        if (!track) return null;
        const entry = entries[track.id] || EMPTY_ENTRY();
        const tid = track.id;

        // Question definitions
        const QUESTIONS = [
          { id: 'tempo', label: 'Tempo', subtitle: 'How fast is the music?', done: !!entry.tempo },
          { id: 'dynamics', label: 'Dynamics', subtitle: 'How loud or soft?', done: entry.dynamics.length > 0 },
          { id: 'mood', label: 'Mood', subtitle: 'What feeling does it create?', done: entry.moods.length > 0 },
          { id: 'instruments', label: 'Instruments', subtitle: 'What sounds do you hear?', done: entry.instruments.length > 0 },
          { id: 'texture', label: 'Texture', subtitle: 'How many layers?', done: !!entry.texture },
          { id: 'hook', label: 'Hook', subtitle: 'What\'s the catchiest part?', done: !!entry.hook },
          { id: 'bonus', label: 'Bonus', subtitle: 'Influences & notes (optional)', done: !!(entry.influences || entry.notes) },
        ];
        const totalCore = 6;
        const answeredCore = QUESTIONS.slice(0, 6).filter(q => q.done).length;
        const currentQ = QUESTIONS[qPage] || QUESTIONS[0];
        const isLastPage = qPage >= QUESTIONS.length - 1;
        const isFirstPage = qPage === 0;

        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Progress dots + counter */}
            <div className="shrink-0 px-4 py-2 bg-[#141a21] border-b border-white/[0.06]">
              <div className="max-w-lg mx-auto flex items-center justify-between">
                <div className="flex items-center gap-1">
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
                <span className={`text-xs font-bold ${answeredCore >= totalCore ? 'text-emerald-400' : 'text-white/40'}`}>
                  {answeredCore} of {totalCore}
                </span>
              </div>
            </div>

            {/* Question content — centered, one at a time */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-y-auto">
              <div className="w-full max-w-lg">
                {/* Artist info banner */}
                {(() => {
                  const artistData = getArtistById(track.artistId);
                  return artistData ? (
                    <div className="flex items-center gap-3 mb-4 bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.06]">
                      {artistData.imageUrl && (
                        <img
                          src={artistData.imageUrl}
                          alt={artistData.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{artistData.name}</p>
                        <p className="text-white/40 text-xs truncate">"{track.title}" &middot; {track.genre}</p>
                        {artistData.whyInteresting && (
                          <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{artistData.whyInteresting}</p>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Question header */}
                <div className="text-center mb-5">
                  <h2 className="text-white text-xl font-bold">
                    {currentQ.label}
                    {currentQ.done && <CheckCircle size={18} className="inline ml-2 text-emerald-400" />}
                  </h2>
                  <p className="text-white/40 text-sm mt-1">{currentQ.subtitle}</p>
                </div>

                {/* Q0: Tempo */}
                {qPage === 0 && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-center gap-2">
                      {TEMPO_OPTIONS.map(t => (
                        <button
                          key={t.label}
                          onClick={() => !viewMode && updateField(tid, 'tempo', entry.tempo === t.label ? '' : t.label)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                            entry.tempo === t.label
                              ? 'bg-amber-500/25 text-amber-300 border-2 border-amber-400/50'
                              : 'bg-white/[0.04] text-white/60 border-2 border-white/[0.06] hover:bg-white/[0.08]'
                          }`}
                        >
                          {t.label} <span className="text-white/25 text-xs">({t.help})</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {TEMPO_CHANGE_OPTIONS.map(t => (
                        <button
                          key={t.label}
                          onClick={() => !viewMode && updateField(tid, 'tempoChange', entry.tempoChange === t.label ? '' : t.label)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                            entry.tempoChange === t.label
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/25'
                              : 'bg-white/[0.03] text-white/30 border border-white/[0.05] hover:bg-white/[0.06]'
                          }`}
                        >
                          {t.label} <span className="text-white/15">({t.help})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Q1: Dynamics */}
                {qPage === 1 && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-center gap-2">
                      {DYNAMICS_OPTIONS.map(d => {
                        const selected = entry.dynamics.includes(d.label);
                        return (
                          <button
                            key={d.label}
                            onClick={() => {
                              if (viewMode) return;
                              updateField(tid, 'dynamics', selected
                                ? entry.dynamics.filter(v => v !== d.label)
                                : [...entry.dynamics, d.label]);
                            }}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                              selected
                                ? 'bg-blue-500/25 text-blue-300 border-2 border-blue-400/50'
                                : 'bg-white/[0.04] text-white/60 border-2 border-white/[0.06] hover:bg-white/[0.08]'
                            }`}
                          >
                            <span className="font-bold">{d.label}</span> <span className="text-white/25 text-xs">({d.help})</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {DYNAMICS_CHANGE_OPTIONS.map(d => (
                        <button
                          key={d.label}
                          onClick={() => !viewMode && updateField(tid, 'dynamicsChange', entry.dynamicsChange === d.label ? '' : d.label)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                            entry.dynamicsChange === d.label
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/25'
                              : 'bg-white/[0.03] text-white/30 border border-white/[0.05] hover:bg-white/[0.06]'
                          }`}
                        >
                          {d.label} <span className="text-white/15">({d.help})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Q2: Mood */}
                {qPage === 2 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {MOOD_OPTIONS.map(mood => {
                      const selected = entry.moods.includes(mood);
                      const disabled = !selected && entry.moods.length >= 3;
                      return (
                        <button
                          key={mood}
                          onClick={() => !viewMode && toggleMood(tid, mood)}
                          disabled={viewMode ? false : disabled}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                            selected
                              ? 'bg-purple-500/25 text-purple-300 border-2 border-purple-400/50'
                              : disabled
                                ? 'bg-white/[0.02] text-white/15 border-2 border-white/[0.04] cursor-not-allowed'
                                : 'bg-white/[0.04] text-white/60 border-2 border-white/[0.06] hover:bg-white/[0.08]'
                          }`}
                        >
                          {mood}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Q3: Instruments */}
                {qPage === 3 && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-center gap-2">
                      {INSTRUMENT_OPTIONS.map(inst => (
                        <button
                          key={inst}
                          onClick={() => !viewMode && toggleInstrument(tid, inst)}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                            entry.instruments.includes(inst)
                              ? 'bg-emerald-500/25 text-emerald-300 border-2 border-emerald-400/50'
                              : 'bg-white/[0.04] text-white/60 border-2 border-white/[0.06] hover:bg-white/[0.08]'
                          }`}
                        >
                          {inst}
                        </button>
                      ))}
                    </div>
                    {entry.instruments.includes('Other') && (
                      <input
                        type="text"
                        value={entry.otherInstrument}
                        onChange={(e) => !viewMode && updateField(tid, 'otherInstrument', e.target.value)}
                        readOnly={viewMode}
                        placeholder="What other instrument or sound?"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 min-h-[44px]"
                      />
                    )}
                  </div>
                )}

                {/* Q4: Texture */}
                {qPage === 4 && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {TEXTURE_OPTIONS.map(t => (
                      <button
                        key={t.label}
                        onClick={() => !viewMode && updateField(tid, 'texture', entry.texture === t.label ? '' : t.label)}
                        className={`px-6 py-4 rounded-xl text-base font-medium transition-all min-h-[56px] ${
                          entry.texture === t.label
                            ? 'bg-teal-500/25 text-teal-300 border-2 border-teal-400/50'
                            : 'bg-white/[0.04] text-white/60 border-2 border-white/[0.06] hover:bg-white/[0.08]'
                        }`}
                      >
                        {t.label} <span className="text-white/25 text-sm">({t.help})</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Q5: Hook */}
                {qPage === 5 && (
                  <textarea
                    value={entry.hook}
                    onChange={(e) => !viewMode && updateField(tid, 'hook', e.target.value)}
                    readOnly={viewMode}
                    placeholder="Describe the catchiest part in 1-2 sentences..."
                    rows={4}
                    className="w-full bg-white/[0.04] border-2 border-white/[0.08] rounded-xl px-4 py-3 text-base text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none"
                  />
                )}

                {/* Q6: Bonus — Influences + Notes + Save */}
                {qPage === 6 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                        Influences — Who do they remind you of?
                      </label>
                      <input
                        type="text"
                        value={entry.influences}
                        onChange={(e) => !viewMode && updateField(tid, 'influences', e.target.value)}
                        readOnly={viewMode}
                        placeholder="What other artists or songs does this remind you of?"
                        className="w-full bg-white/[0.04] border-2 border-white/[0.08] rounded-xl px-4 py-3 text-base text-white placeholder-white/25 focus:outline-none focus:border-white/20 min-h-[48px]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                        Notes — Anything else you noticed?
                      </label>
                      <textarea
                        value={entry.notes}
                        onChange={(e) => !viewMode && updateField(tid, 'notes', e.target.value)}
                        readOnly={viewMode}
                        placeholder="Additional observations about this track..."
                        rows={3}
                        className="w-full bg-white/[0.04] border-2 border-white/[0.08] rounded-xl px-4 py-3 text-base text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none"
                      />
                    </div>
                    {!viewMode && (
                      <button
                        onClick={handleSave}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold transition-all min-h-[56px] ${
                          saved
                            ? 'bg-emerald-500 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {saved ? <><CheckCircle size={20} /> Saved!</> : <><Save size={20} /> Save My Work</>}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Back / Next buttons — pinned at bottom */}
            <div className="shrink-0 px-4 py-3 bg-[#0f1419] border-t border-white/[0.08]">
              <div className="max-w-lg mx-auto flex items-center gap-3">
                <button
                  onClick={() => setQPage(p => p - 1)}
                  disabled={isFirstPage}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] ${
                    isFirstPage
                      ? 'bg-white/[0.03] text-white/15 cursor-not-allowed'
                      : 'bg-white/[0.08] text-white/70 hover:bg-white/[0.12] active:scale-[0.98]'
                  }`}
                >
                  <ChevronDown size={18} className="rotate-90" /> Back
                </button>
                {isLastPage ? (
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold min-h-[48px] bg-emerald-500/10 text-emerald-400">
                    <CheckCircle size={18} /> Done! Review your answers.
                  </div>
                ) : (
                  <button
                    onClick={() => setQPage(p => p + 1)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98]"
                  >
                    Next <ChevronDown size={18} className="-rotate-90" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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

// ── Tabbed wrapper: Explore Artists + Listening Guide ──────
// When students are filling out the listening guide, they can toggle to
// the artist discovery platform and keep listening via the MiniPlayer.
// Teacher split-screen mode (singleTrackId) skips the tabs entirely.
const GuidedListeningWithExplore = (props) => {
  // Single-track teacher mode: no tabs, no audio provider
  if (props.singleTrackId) {
    return <GuidedListeningActivity {...props} />;
  }

  return (
    <AudioProvider>
      <GuidedListeningTabs {...props} />
    </AudioProvider>
  );
};

const GuidedListeningTabs = (props) => {
  const { currentStage } = useSession();
  const isGuidedStage = ['guided-listening-1', 'guided-listening-2', 'guided-listening-3'].includes(currentStage);
  const [activeTab, setActiveTab] = useState(isGuidedStage ? 'listening' : 'discover');
  const audio = useGlobalAudio();
  const hasAudioPlaying = audio?.currentTrack != null;

  // When teacher moves to a guided listening stage, force students to the listening tab
  useEffect(() => {
    if (isGuidedStage) setActiveTab('listening');
  }, [isGuidedStage]);

  // During guided listening stages, no tabs — just the listening guide
  if (isGuidedStage) {
    return <GuidedListeningActivity {...props} />;
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: '#0f1419' }}>
      {/* Tab bar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 border-b border-white/10" style={{ background: '#0f1b2e' }}>
        <div className="flex bg-white/5 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Search size={12} /> Explore Artists
          </button>
          <button
            onClick={() => setActiveTab('listening')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'listening'
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Headphones size={12} /> Listening Guide
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Artist Discovery — always mounted, hidden when on listening tab */}
        <div
          className="flex-1 overflow-hidden"
          style={{ display: activeTab === 'discover' ? 'block' : 'none' }}
        >
          <div className="h-full overflow-y-auto">
            <ArtistDiscovery isSessionMode={props.isSessionMode} hideMiniPlayer />
          </div>
        </div>

        {/* Listening Guide */}
        <div
          className="flex-1 overflow-hidden"
          style={{ display: activeTab === 'listening' ? 'flex' : 'none' }}
        >
          <GuidedListeningActivity {...props} embedded />
        </div>
      </div>

      {/* MiniPlayer — shows when audio is playing */}
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
    </div>
  );
};

export default GuidedListeningWithExplore;
