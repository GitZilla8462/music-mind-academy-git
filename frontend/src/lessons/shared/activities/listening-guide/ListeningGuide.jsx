import React, { useState, useEffect, useCallback } from 'react';
import { Music, ChevronDown, ChevronUp, Plus, Trash2, Save, CheckCircle } from 'lucide-react';

const INSTRUMENT_OPTIONS = [
  'Vocals', 'Guitar', 'Bass', 'Drums', 'Piano/Keys', 'Synthesizer',
  'Strings', 'Brass', 'Woodwinds', 'Percussion', 'Samples/Loops', 'Other',
];

const TEMPO_OPTIONS = ['Slow', 'Moderate', 'Fast', 'Changes'];

const MOOD_OPTIONS = [
  'Energetic', 'Chill', 'Happy', 'Sad', 'Mysterious', 'Powerful',
  'Peaceful', 'Intense', 'Dreamy', 'Playful', 'Dark', 'Uplifting',
];

const EMPTY_TRACK = () => ({
  name: '',
  instruments: [],
  otherInstrument: '',
  tempo: '',
  moods: [],
  hook: '',
  influences: '',
  notes: '',
});

function loadGuide(artistId) {
  try {
    const raw = localStorage.getItem(`mma-listening-guide-${artistId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveGuide(artistId, tracks) {
  localStorage.setItem(
    `mma-listening-guide-${artistId}`,
    JSON.stringify({ tracks, savedAt: new Date().toISOString() })
  );
}

const ListeningGuide = ({ artistId, artistName }) => {
  const [tracks, setTracks] = useState(() => {
    const saved = loadGuide(artistId);
    return saved?.tracks?.length ? saved.tracks : [EMPTY_TRACK()];
  });
  const [expandedTrack, setExpandedTrack] = useState(0);
  const [saved, setSaved] = useState(false);

  // Auto-save on changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveGuide(artistId, tracks);
    }, 800);
    return () => clearTimeout(timeout);
  }, [tracks, artistId]);

  const updateTrack = useCallback((index, field, value) => {
    setTracks(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setSaved(false);
  }, []);

  const toggleInstrument = useCallback((trackIdx, instrument) => {
    setTracks(prev => {
      const next = [...prev];
      const track = { ...next[trackIdx] };
      track.instruments = track.instruments.includes(instrument)
        ? track.instruments.filter(i => i !== instrument)
        : [...track.instruments, instrument];
      next[trackIdx] = track;
      return next;
    });
    setSaved(false);
  }, []);

  const toggleMood = useCallback((trackIdx, mood) => {
    setTracks(prev => {
      const next = [...prev];
      const track = { ...next[trackIdx] };
      if (track.moods.includes(mood)) {
        track.moods = track.moods.filter(m => m !== mood);
      } else if (track.moods.length < 3) {
        track.moods = [...track.moods, mood];
      }
      next[trackIdx] = track;
      return next;
    });
    setSaved(false);
  }, []);

  const addTrack = useCallback(() => {
    if (tracks.length >= 3) return;
    setTracks(prev => [...prev, EMPTY_TRACK()]);
    setExpandedTrack(tracks.length);
    setSaved(false);
  }, [tracks.length]);

  const removeTrack = useCallback((index) => {
    if (tracks.length <= 1) return;
    setTracks(prev => prev.filter((_, i) => i !== index));
    setExpandedTrack(prev => Math.min(prev, tracks.length - 2));
    setSaved(false);
  }, [tracks.length]);

  const handleSave = () => {
    saveGuide(artistId, tracks);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Listening Guide</h2>
          <p className="text-white/40 text-sm">
            Analyze up to 3 tracks from {artistName || 'your artist'}
          </p>
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

      {/* Tracks */}
      {tracks.map((track, idx) => (
        <div
          key={idx}
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden"
        >
          {/* Track header */}
          <button
            onClick={() => setExpandedTrack(expandedTrack === idx ? -1 : idx)}
            className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] hover:bg-white/[0.02] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
              <Music size={14} className="text-white/50" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white/80 text-sm font-medium truncate">
                {track.name || `Track ${idx + 1}`}
              </p>
              <p className="text-white/30 text-xs">
                {track.instruments.length > 0
                  ? `${track.instruments.length} instrument${track.instruments.length !== 1 ? 's' : ''} identified`
                  : 'Not started'}
              </p>
            </div>
            {tracks.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeTrack(idx); }}
                className="p-2 text-white/20 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
            {expandedTrack === idx ? (
              <ChevronUp size={16} className="text-white/30" />
            ) : (
              <ChevronDown size={16} className="text-white/30" />
            )}
          </button>

          {/* Track form */}
          {expandedTrack === idx && (
            <div className="px-4 pb-5 space-y-5 border-t border-white/[0.04]">
              {/* Track name */}
              <div className="pt-4">
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                  Track Name
                </label>
                <input
                  type="text"
                  value={track.name}
                  onChange={(e) => updateTrack(idx, 'name', e.target.value)}
                  placeholder="Enter the track name..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 min-h-[44px]"
                />
              </div>

              {/* Instruments */}
              <div>
                <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                  Instruments / Sounds
                </label>
                <div className="flex flex-wrap gap-2">
                  {INSTRUMENT_OPTIONS.map(inst => (
                    <button
                      key={inst}
                      onClick={() => toggleInstrument(idx, inst)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                        track.instruments.includes(inst)
                          ? 'bg-blue-500/25 text-blue-300 border border-blue-400/30'
                          : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]'
                      }`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
                {track.instruments.includes('Other') && (
                  <input
                    type="text"
                    value={track.otherInstrument}
                    onChange={(e) => updateTrack(idx, 'otherInstrument', e.target.value)}
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
                      onClick={() => updateTrack(idx, 'tempo', track.tempo === tempo ? '' : tempo)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                        track.tempo === tempo
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
                    const selected = track.moods.includes(mood);
                    const disabled = !selected && track.moods.length >= 3;
                    return (
                      <button
                        key={mood}
                        onClick={() => toggleMood(idx, mood)}
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
                  value={track.hook}
                  onChange={(e) => updateTrack(idx, 'hook', e.target.value)}
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
                  value={track.influences}
                  onChange={(e) => updateTrack(idx, 'influences', e.target.value)}
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
                  value={track.notes}
                  onChange={(e) => updateTrack(idx, 'notes', e.target.value)}
                  placeholder="Additional observations about this track..."
                  rows={2}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 resize-none"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add track button */}
      {tracks.length < 3 && (
        <button
          onClick={addTrack}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.1] text-white/40 hover:text-white/60 hover:border-white/20 transition-all min-h-[48px]"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add Track ({tracks.length}/3)</span>
        </button>
      )}
    </div>
  );
};

export default ListeningGuide;
