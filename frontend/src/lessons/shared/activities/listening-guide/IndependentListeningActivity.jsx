// File: IndependentListeningActivity.jsx
// Student picks 1 of 5 tracks, listens on their device, fills out listening guide.
// Has audio player (unlike GuidedListening where teacher plays for class).

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Music, Play, Pause, Save, CheckCircle, Headphones, ChevronDown, ChevronUp } from 'lucide-react';
import { INDEPENDENT_TRACKS } from '../../../music-journalist/lesson3/lesson3Config';
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

const STORAGE_KEY = 'mma-independent-listening-l3';

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

function saveToDisk(selectedTrackId, entry) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedTrackId, entry, savedAt: new Date().toISOString() }));
}

// ── Simple Audio Player ──────────────────────────────
const TrackPlayer = ({ track }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(track.audioUrl);
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.addEventListener('ended', () => { setIsPlaying(false); setProgress(0); });
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('play', () => setIsPlaying(true));

    return () => {
      cancelAnimationFrame(animRef.current);
      audio.pause();
      audio.src = '';
    };
  }, [track.audioUrl]);

  useEffect(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (audio && audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
      animRef.current = requestAnimationFrame(tick);
    };
    if (isPlaying) { animRef.current = requestAnimationFrame(tick); }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); } else { audio.play().catch(() => {}); }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = frac * audio.duration;
    setProgress(frac);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const audio = audioRef.current;
  const currentTime = audio ? audio.currentTime : 0;
  const duration = audio ? audio.duration || 0 : 0;

  return (
    <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
      <button
        onClick={togglePlay}
        className="w-11 h-11 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {isPlaying
          ? <Pause size={18} className="text-black" fill="currentColor" />
          : <Play size={18} className="text-black ml-0.5" fill="currentColor" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-sm font-semibold truncate">"{track.title}" — {track.artist}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-white/30 text-xs w-8 text-right flex-shrink-0">{fmt(currentTime)}</span>
          <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full cursor-pointer" onClick={seek}>
            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-white/30 text-xs w-8 flex-shrink-0">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────
const IndependentListeningActivity = ({ onComplete, isSessionMode }) => {
  const saved = loadSaved();
  const [selectedTrackId, setSelectedTrackId] = useState(saved?.selectedTrackId || null);
  const [entry, setEntry] = useState(saved?.entry || EMPTY_ENTRY());
  const [isSaved, setIsSaved] = useState(false);

  const selectedTrack = INDEPENDENT_TRACKS.find(t => t.id === selectedTrackId);

  // Auto-save locally
  useEffect(() => {
    if (!selectedTrackId) return;
    const timeout = setTimeout(() => saveToDisk(selectedTrackId, entry), 800);
    return () => clearTimeout(timeout);
  }, [entry, selectedTrackId]);

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

  // ── Firebase save ────
  const fullSave = useCallback(() => {
    if (!selectedTrackId) return;
    saveToDisk(selectedTrackId, entry);
    setIsSaved(true);
    const authInfo = getClassAuthInfo();
    const track = INDEPENDENT_TRACKS.find(t => t.id === selectedTrackId);
    saveStudentWork('independent-listening', {
      title: 'Independent Listening',
      emoji: '\uD83C\uDFA7',
      viewRoute: '/lessons/music-journalist/lesson3?view=independent-listening',
      subtitle: track ? `"${track.title}" by ${track.artist}` : 'Track analysis',
      category: 'Music Journalist',
      lessonId: 'mj-lesson3',
      data: { selectedTrackId, entry }
    }, null, authInfo);
  }, [entry, selectedTrackId]);

  const handleSave = () => {
    fullSave();
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Listen for teacher "Save All"
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

  // ── Track Selection Screen ─────────────────────────
  if (!selectedTrack) {
    return (
      <div className="h-screen flex flex-col bg-[#0f1419]">
        <div className="flex-shrink-0 border-b border-white/[0.08] px-4 py-4">
          <div className="max-w-2xl mx-auto text-center">
            <Headphones size={32} className="text-amber-400 mx-auto mb-2" />
            <h1 className="text-white font-bold text-xl">Pick a Track to Analyze</h1>
            <p className="text-white/40 text-sm mt-1">Choose one track. Listen carefully. Fill out the Listening Guide.</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
            {INDEPENDENT_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedTrackId(track.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-left min-h-[72px]"
              >
                <div className="w-12 h-12 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Music size={20} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-base truncate">"{track.title}"</p>
                  <p className="text-white/50 text-sm">{track.artist}</p>
                </div>
                <span className="text-xs text-white/30 bg-white/[0.06] px-3 py-1 rounded-full flex-shrink-0">
                  {track.genre}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Listening Guide for Selected Track ─────────────
  return (
    <div className="h-screen flex flex-col bg-[#0f1419]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/[0.08] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedTrackId(null); setEntry(EMPTY_ENTRY()); }}
              className="text-white/40 hover:text-white/70 text-sm font-medium transition-colors"
            >
              &larr; Change Track
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
              isSaved
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            {isSaved ? <CheckCircle size={16} /> : <Save size={16} />}
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          {/* Audio Player */}
          <TrackPlayer track={selectedTrack} />

          {/* Form */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-5">
            {/* Instruments */}
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                Instruments / Sounds
              </label>
              <div className="flex flex-wrap gap-2">
                {INSTRUMENT_OPTIONS.map(inst => (
                  <button
                    key={inst}
                    onClick={() => toggleInstrument(inst)}
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
                  onChange={(e) => updateField('otherInstrument', e.target.value)}
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
                    onClick={() => updateField('tempo', entry.tempo === tempo ? '' : tempo)}
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
                      onClick={() => toggleMood(mood)}
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
                onChange={(e) => updateField('hook', e.target.value)}
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
                onChange={(e) => updateField('influences', e.target.value)}
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
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Additional observations about this track..."
                rows={2}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none"
              />
            </div>
          </div>
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

export default IndependentListeningActivity;
