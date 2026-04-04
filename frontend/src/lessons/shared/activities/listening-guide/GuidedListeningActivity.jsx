// File: GuidedListeningActivity.jsx
// Student view for teacher-guided listening.
// Teacher plays 3 tracks on classroom speakers. Students fill out the listening guide.
// No audio player on student side — they listen to the teacher's speakers.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Music, ChevronDown, ChevronUp, Save, CheckCircle, Headphones } from 'lucide-react';
import { GUIDED_TRACKS } from '../../../music-journalist/lesson3/lesson3Config';
import { saveStudentWork, getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, onValue } from 'firebase/database';

const INSTRUMENT_OPTIONS = [
  'Vocals', 'Guitar', 'Bass', 'Drums', 'Piano/Keys', 'Synthesizer',
  'Strings', 'Brass', 'Woodwinds', 'Percussion', 'Samples/Loops', 'Other',
];
const TEMPO_OPTIONS = ['Slow', 'Moderate', 'Fast', 'Changes'];
const MOOD_OPTIONS = [
  'Energetic', 'Chill', 'Happy', 'Sad', 'Mysterious', 'Powerful',
  'Peaceful', 'Intense', 'Dreamy', 'Playful', 'Dark', 'Uplifting',
];

const STORAGE_KEY = 'mma-guided-listening-l3';

const EMPTY_ENTRY = () => ({
  instruments: [],
  otherInstrument: '',
  tempo: '',
  moods: [],
  hook: '',
  influences: '',
  notes: '',
});

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveToDisk(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, savedAt: new Date().toISOString() }));
}

const GuidedListeningActivity = ({ onComplete, isSessionMode }) => {
  const [entries, setEntries] = useState(() => {
    const saved = loadSaved();
    if (saved?.entries && Object.keys(saved.entries).length) return saved.entries;
    const init = {};
    GUIDED_TRACKS.forEach(t => { init[t.id] = EMPTY_ENTRY(); });
    return init;
  });
  const [expandedTrack, setExpandedTrack] = useState(GUIDED_TRACKS[0]?.id);
  const [saved, setSaved] = useState(false);

  // Auto-save locally
  useEffect(() => {
    const timeout = setTimeout(() => saveToDisk(entries), 800);
    return () => clearTimeout(timeout);
  }, [entries]);

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
      viewRoute: '/lessons/music-journalist/lesson3?view=guided-listening',
      subtitle: `${GUIDED_TRACKS.length} tracks analyzed`,
      category: 'Music Journalist',
      lessonId: 'mj-lesson3',
      data: { entries }
    }, null, authInfo);
  }, [entries]);

  const handleSave = () => {
    fullSave();
    setTimeout(() => setSaved(false), 2000);
  };

  // Listen for teacher "Save All" command
  const { sessionCode } = useSession();
  const classCode = new URLSearchParams(window.location.search).get('classCode');
  const effectiveSessionCode = sessionCode || classCode;
  const lastSaveCommandRef = useRef(null);
  const componentMountTimeRef = useRef(Date.now());
  const [teacherSaveToast, setTeacherSaveToast] = useState(false);

  useEffect(() => {
    if (!effectiveSessionCode || !isSessionMode) return;
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
    <div className="h-screen flex flex-col bg-[#0f1419]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/[0.08] bg-[#0f1419] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Headphones size={20} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Guided Listening</h1>
              <p className="text-white/40 text-xs">Listen to the teacher's speakers. Fill out the guide for each track.</p>
            </div>
          </div>
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
        </div>
      </div>

      {/* Track guides */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
          {GUIDED_TRACKS.map((track) => {
            const entry = entries[track.id] || EMPTY_ENTRY();
            const isExpanded = expandedTrack === track.id;

            return (
              <div key={track.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                {/* Track header */}
                <button
                  onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 min-h-[56px] hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Music size={14} className="text-white/50" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white/90 text-sm font-semibold truncate">
                      "{track.title}" — {track.artist}
                    </p>
                    <p className="text-white/30 text-xs">{track.genre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.instruments.length > 0 && (
                      <span className="text-xs text-emerald-400/70 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                        {entry.instruments.length} instruments
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
                  </div>
                </button>

                {/* Form */}
                {isExpanded && (
                  <div className="px-4 pb-5 space-y-5 border-t border-white/[0.04]">
                    {/* Instruments */}
                    <div className="pt-4">
                      <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                        Instruments / Sounds
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {INSTRUMENT_OPTIONS.map(inst => (
                          <button
                            key={inst}
                            onClick={() => toggleInstrument(track.id, inst)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                              entry.instruments.includes(inst)
                                ? 'bg-blue-500/25 text-blue-300 border border-blue-400/30'
                                : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]'
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
                          onChange={(e) => updateField(track.id, 'otherInstrument', e.target.value)}
                          placeholder="What other instrument or sound?"
                          className="mt-2 w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 min-h-[44px]"
                        />
                      )}
                    </div>

                    {/* Tempo */}
                    <div>
                      <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                        Tempo
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TEMPO_OPTIONS.map(tempo => (
                          <button
                            key={tempo}
                            onClick={() => updateField(track.id, 'tempo', entry.tempo === tempo ? '' : tempo)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                              entry.tempo === tempo
                                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/30'
                                : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]'
                            }`}
                          >
                            {tempo}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mood */}
                    <div>
                      <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                        Mood <span className="text-white/30 normal-case">(select up to 3)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MOOD_OPTIONS.map(mood => {
                          const selected = entry.moods.includes(mood);
                          const disabled = !selected && entry.moods.length >= 3;
                          return (
                            <button
                              key={mood}
                              onClick={() => toggleMood(track.id, mood)}
                              disabled={disabled}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                                selected
                                  ? 'bg-purple-500/25 text-purple-300 border border-purple-400/30'
                                  : disabled
                                    ? 'bg-white/[0.02] text-white/15 border border-white/[0.04] cursor-not-allowed'
                                    : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]'
                              }`}
                            >
                              {mood}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hook */}
                    <div>
                      <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                        Hook — What is the catchiest part?
                      </label>
                      <textarea
                        value={entry.hook}
                        onChange={(e) => updateField(track.id, 'hook', e.target.value)}
                        placeholder="Describe the catchiest part in 1-2 sentences..."
                        rows={2}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none"
                      />
                    </div>

                    {/* Influences */}
                    <div>
                      <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                        Influences — Who do they remind you of?
                      </label>
                      <input
                        type="text"
                        value={entry.influences}
                        onChange={(e) => updateField(track.id, 'influences', e.target.value)}
                        placeholder="What other artists or songs does this remind you of?"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 min-h-[44px]"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                        Notes — Anything else you noticed?
                      </label>
                      <textarea
                        value={entry.notes}
                        onChange={(e) => updateField(track.id, 'notes', e.target.value)}
                        placeholder="Additional observations about this track..."
                        rows={2}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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

export default GuidedListeningActivity;
