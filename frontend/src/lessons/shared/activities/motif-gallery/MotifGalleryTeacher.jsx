// Motif Gallery — Teacher Presentation View
// Directions modal → Main menu (Start Gallery / Search Student / Finish)
// Gallery plays all shuffled submissions. Search finds specific student.
// Class votes on 4 categories. Reveal shows vote bars + composer info.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, ChevronRight, Users, Eye, RotateCcw, Search, ArrowLeft, X } from 'lucide-react';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';
import { formatFirstNameLastInitial } from '../layer-detective/nameGenerator';
import { INSTRUMENTS } from '../../../film-music/shared/virtual-instrument/instrumentConfig';
import DirectionsModal from '../../components/DirectionsModal';

const ActivityBanner = () => (
  <div className="w-full flex items-center justify-center" style={{ height: '64px', backgroundColor: '#7c3aed', flexShrink: 0 }}>
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>STUDENT ACTIVITY</span>
  </div>
);

const GALLERY_DIRECTIONS = [
  { text: 'Time to hear your classmates\' motifs! One at a time, a mystery motif will play on the main screen.' },
  { text: 'Listen carefully — then on your device, vote on 4 things: Character Type (Hero, Villain, Romantic, or Sneaky), Mode (Bright or Dark), Instrument Family (Strings, Woodwind, or Brass), and Register (Low, Mid, or High).' },
  { text: 'Once everyone has voted, the composer will be revealed along with how the whole class voted for each category.' },
  { text: 'Did the composer\'s choices come through in their music? Could you hear the character? That\'s what a great leitmotif does!' },
];

const CHARACTER_OPTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'villain', label: 'Villain' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'sneaky', label: 'Sneaky' },
];
const MODE_OPTIONS = [
  { id: 'major', label: 'Major', description: 'Bright' },
  { id: 'minor', label: 'Minor', description: 'Dark' },
];
const FAMILY_OPTIONS = [
  { id: 'strings', label: 'Strings' },
  { id: 'woodwind', label: 'Woodwind' },
  { id: 'brass', label: 'Brass' },
];
const REGISTER_OPTIONS = [
  { id: 'low', label: 'Low' },
  { id: 'mid', label: 'Mid' },
  { id: 'high', label: 'High' },
];

// Vote distribution bar
const VoteBar = ({ label, count, total, isCorrect }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className={`w-20 text-right text-sm font-bold ${isCorrect ? 'text-green-400' : 'text-white/70'}`}>{label}</span>
      <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${isCorrect ? 'bg-green-500' : 'bg-white/30'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`w-8 text-sm font-bold ${isCorrect ? 'text-green-400' : 'text-white/60'}`}>{count}</span>
    </div>
  );
};

const VoteCategoryCard = ({ title, options, votes, correctId }) => {
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const correctLabel = options.find(o => o.id === correctId)?.label || correctId;
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-purple-300 uppercase">{title}</h3>
        <span className="text-sm font-bold text-green-400">{correctLabel}</span>
      </div>
      <div className="space-y-1.5">
        {options.map(opt => (
          <VoteBar key={opt.id} label={opt.label} count={votes[opt.id] || 0} total={totalVotes} isCorrect={opt.id === correctId} />
        ))}
      </div>
    </div>
  );
};

// Shuffle helper
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const MotifGalleryTeacher = ({ sessionData, onComplete }) => {
  const { sessionCode: contextSessionCode, classId } = useSession();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = contextSessionCode || sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/motifGallery`;
    if (sessionCode) return `sessions/${sessionCode}/motifGallery`;
    return null;
  }, [classId, sessionCode]);

  const studentsPath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  // Phases: directions, menu, playing, guessing, revealed
  const [phase, setPhase] = useState('directions');
  const [showDirections, setShowDirections] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [queue, setQueue] = useState([]); // shuffled play queue
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGalleryMode, setIsGalleryMode] = useState(false); // true = full gallery, false = single search
  const [totalStudents, setTotalStudents] = useState(0);
  const [lockedCount, setLockedCount] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Votes
  const [votes, setVotes] = useState({ character: {}, mode: {}, instrumentFamily: {}, register: {} });

  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef(null);
  const playbackTimeoutsRef = useRef([]);
  const [ToneLib, setToneLib] = useState(null);

  useEffect(() => { import('tone').then(t => setToneLib(t)); }, []);

  const updateGame = useCallback((data) => {
    if (!gamePath) return;
    update(ref(getDatabase(), gamePath), data);
  }, [gamePath]);

  // Subscribe to students
  useEffect(() => {
    if (!studentsPath) return;
    const db = getDatabase();
    const unsubscribe = onValue(ref(db, studentsPath), (snapshot) => {
      const data = snapshot.val() || {};

      const list = Object.entries(data)
        .filter(([, s]) => s.motifSubmission)
        .map(([id, s]) => {
          const motif = typeof s.motifSubmission === 'string' ? JSON.parse(s.motifSubmission) : s.motifSubmission;
          return { id, studentName: formatFirstNameLastInitial(s.displayName || s.playerName || s.name || 'Student'), ...motif };
        })
        .filter(s => s.notes && s.notes.length > 0);
      setSubmissions(list);

      const allStudents = Object.entries(data).filter(([, s]) => s.displayName || s.playerName || s.name);
      setTotalStudents(allStudents.length);
      setLockedCount(allStudents.filter(([, s]) => s.galleryVote).length);

      // Tally votes
      const cv = {}, mv = {}, fv = {}, rv = {};
      allStudents.forEach(([, s]) => {
        if (!s.galleryVote) return;
        const v = typeof s.galleryVote === 'string' ? JSON.parse(s.galleryVote) : s.galleryVote;
        if (v.character) cv[v.character] = (cv[v.character] || 0) + 1;
        if (v.mode) mv[v.mode] = (mv[v.mode] || 0) + 1;
        if (v.instrumentFamily) fv[v.instrumentFamily] = (fv[v.instrumentFamily] || 0) + 1;
        if (v.register) rv[v.register] = (rv[v.register] || 0) + 1;
      });
      setVotes({ character: cv, mode: mv, instrumentFamily: fv, register: rv });
    });
    return () => unsubscribe();
  }, [studentsPath]);

  // Clear votes
  const clearVotes = async () => {
    if (!studentsPath) return;
    const db = getDatabase();
    const snap = await get(ref(db, studentsPath));
    const data = snap.val() || {};
    const resets = {};
    Object.keys(data).forEach(id => { resets[`${id}/galleryVote`] = null; });
    if (Object.keys(resets).length > 0) await update(ref(db, studentsPath), resets);
  };

  // Playback
  const stopPlayback = useCallback(() => {
    playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
    if (synthRef.current) { try { synthRef.current.dispose(); } catch(e) {} }
    synthRef.current = null;
    setIsPlaying(false);
  }, []);

  const doPlayback = useCallback(async (motif) => {
    if (!motif?.notes?.length || !ToneLib) return;
    if (ToneLib.context.state !== 'running') await ToneLib.start();
    stopPlayback();

    const inst = INSTRUMENTS[motif.instrument];
    if (!inst) return;
    setIsPlaying(true);

    const startNotes = (synth) => {
      synthRef.current = synth;
      const timeouts = [];
      const notes = motif.notes.filter(n => !n.note?.startsWith('drum-'));
      notes.forEach(nd => {
        timeouts.push(setTimeout(() => {
          try { synth.triggerAttackRelease(nd.note, nd.duration || 0.3); } catch(e) {}
        }, nd.timestamp * 1000));
      });
      const last = notes[notes.length - 1];
      const totalMs = last ? (last.timestamp + (last.duration || 0.3)) * 1000 + 500 : 500;
      timeouts.push(setTimeout(() => setIsPlaying(false), totalMs));
      playbackTimeoutsRef.current = timeouts;
    };

    if (inst.useSampler && inst.samples) {
      try {
        const sampler = new ToneLib.Sampler({
          urls: inst.samples.urls, baseUrl: inst.samples.baseUrl,
          attack: inst.samplerAttack || 0, release: inst.config?.envelope?.release || 1,
          onload: () => startNotes(sampler),
          onerror: () => { const fb = new ToneLib.PolySynth(ToneLib.Synth, inst.config).toDestination(); fb.volume.value = -6; startNotes(fb); },
        }).toDestination();
        sampler.volume.value = -6;
      } catch(e) {
        const fb = new ToneLib.PolySynth(ToneLib.Synth, inst.config).toDestination(); fb.volume.value = -6; startNotes(fb);
      }
    } else {
      const s = new ToneLib.PolySynth(ToneLib.Synth, inst.config).toDestination(); s.volume.value = -6; startNotes(s);
    }
  }, [ToneLib, stopPlayback]);

  useEffect(() => { return () => { stopPlayback(); }; }, [stopPlayback]);

  // Start full gallery
  const startGallery = async () => {
    if (submissions.length === 0) return;
    const shuffled = shuffleArray([...submissions]);
    setQueue(shuffled);
    setCurrentIndex(0);
    setIsGalleryMode(true);
    setPhase('playing');
    await clearVotes();
    updateGame({ phase: 'playing', currentIndex: 0, totalMotifs: shuffled.length, correctAnswers: null, composerInfo: null });
  };

  // Play specific student (search)
  const playStudent = async (motif) => {
    setQueue([motif]);
    setCurrentIndex(0);
    setIsGalleryMode(false);
    setShowSearch(false);
    setSearchQuery('');
    setPhase('playing');
    await clearVotes();
    updateGame({ phase: 'playing', currentIndex: 0, totalMotifs: 1, correctAnswers: null, composerInfo: null });
  };

  // Play motif (transition to guessing)
  const playMotif = async () => {
    const motif = queue[currentIndex];
    await doPlayback(motif);
    setPhase('guessing');
    updateGame({ phase: 'guessing', currentIndex });
  };

  const replayMotif = () => doPlayback(queue[currentIndex]);

  // Reveal
  const revealAnswer = () => {
    stopPlayback();
    const motif = queue[currentIndex];
    setPhase('revealed');
    updateGame({
      phase: 'revealed',
      correctAnswers: JSON.stringify({
        character: motif.characterType,
        mode: motif.mode || (motif.characterType === 'villain' || motif.characterType === 'sneaky' ? 'minor' : 'major'),
        instrumentFamily: motif.instrumentFamily || 'strings',
        register: motif.register || 'mid',
      }),
      composerInfo: JSON.stringify({
        name: motif.studentName,
        characterName: motif.characterName || '',
        description: motif.characterDescription || '',
        instrument: INSTRUMENTS[motif.instrument]?.name || motif.instrument,
        characterColor: motif.characterColor || '#3B82F6',
      }),
    });
  };

  // Next motif (gallery mode) or back to menu (search mode)
  const nextMotif = async () => {
    if (!isGalleryMode || currentIndex + 1 >= queue.length) {
      returnToMenu();
      return;
    }
    const next = currentIndex + 1;
    setCurrentIndex(next);
    setPhase('playing');
    await clearVotes();
    updateGame({ phase: 'playing', currentIndex: next, correctAnswers: null, composerInfo: null });
  };

  // Return to main menu
  const returnToMenu = () => {
    stopPlayback();
    setPhase('menu');
    setQueue([]);
    setCurrentIndex(0);
    updateGame({ phase: 'menu' });
  };

  const currentMotif = queue[currentIndex];

  // Filtered search results
  const searchResults = searchQuery.trim()
    ? submissions.filter(s => s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()))
    : submissions;

  // ============ DIRECTIONS MODAL + MENU ============
  if (phase === 'directions' || phase === 'menu') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
        <ActivityBanner />
        <div className="flex-1 flex flex-col items-center justify-center p-6">

          {/* Search overlay */}
          {showSearch ? (
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student name..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder-purple-300 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {searchResults.length === 0 ? (
                  <p className="text-center text-purple-300 py-8">No submissions found</p>
                ) : (
                  searchResults.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => playStudent(sub)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                        style={{ backgroundColor: sub.characterColor || '#3B82F6' }}
                      >
                        {(sub.studentName || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold truncate">{sub.studentName}</div>
                        <div className="text-purple-300 text-sm">{sub.notes?.length || 0} notes — {INSTRUMENTS[sub.instrument]?.name || sub.instrument}</div>
                      </div>
                      <Play size={20} className="text-purple-300 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Main menu */
            <div className="text-center w-full max-w-lg">
              <h1 className="text-5xl font-black text-white mb-3">Motif Gallery</h1>
              <p className="text-xl text-purple-200 mb-2">{submissions.length} motif{submissions.length !== 1 ? 's' : ''} submitted</p>
              <p className="text-purple-300 mb-10">Class guesses Character, Mode, Instrument Family, and Register</p>

              <div className="space-y-4">
                <button
                  onClick={startGallery}
                  disabled={submissions.length === 0}
                  className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-2xl font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Start Gallery ({submissions.length})
                </button>

                <button
                  onClick={() => setShowSearch(true)}
                  disabled={submissions.length === 0}
                  className="w-full py-5 bg-white/10 hover:bg-white/15 text-white text-xl font-bold rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Search size={24} /> Search Student
                </button>

                <button
                  onClick={onComplete}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white text-lg font-bold rounded-2xl transition-all"
                >
                  Finish Gallery
                </button>
              </div>
            </div>
          )}
        </div>

        <DirectionsModal
          title="Motif Gallery"
          isOpen={showDirections && phase === 'directions'}
          onClose={() => { setShowDirections(false); setPhase('menu'); }}
          steps={GALLERY_DIRECTIONS}
        />
      </div>
    );
  }

  // ============ PLAYING / GUESSING / REVEALED ============
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
      <ActivityBanner />

      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-3xl mb-6">
          <div className="flex items-center gap-3">
            <button onClick={returnToMenu} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-black text-white">
              {isGalleryMode ? `Mystery Motif ${currentIndex + 1} of ${queue.length}` : 'Mystery Motif'}
            </h1>
          </div>
          {phase === 'guessing' && (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Users size={20} className="text-purple-300" />
              <span className="text-xl font-bold text-white">{lockedCount}/{totalStudents}</span>
              <span className="text-purple-300 text-sm">voted</span>
            </div>
          )}
        </div>

        {/* Playing */}
        {phase === 'playing' && (
          <div className="text-center">
            <p className="text-2xl text-purple-200 mb-4">Guess the traits of this motif</p>
            <div className="flex gap-4 justify-center mb-6">
              <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-sm text-purple-300 mb-1">Character</div>
                <div className="text-lg font-bold text-white">Who?</div>
              </div>
              <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-sm text-purple-300 mb-1">Mode</div>
                <div className="text-lg font-bold text-white">Bright or Dark?</div>
              </div>
              <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-sm text-purple-300 mb-1">Instrument Family</div>
                <div className="text-lg font-bold text-white">What family?</div>
              </div>
              <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-sm text-purple-300 mb-1">Register</div>
                <div className="text-lg font-bold text-white">Low, Mid, High?</div>
              </div>
            </div>
            <button
              onClick={playMotif}
              className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-2xl font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-3 mx-auto"
            >
              <Play size={28} /> Play Motif
            </button>
          </div>
        )}

        {/* Guessing */}
        {phase === 'guessing' && (
          <div className="text-center">
            <p className="text-2xl text-purple-200 mb-2">Students are guessing the traits...</p>
            <div className="flex gap-4 justify-center mb-6">
              <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-sm text-purple-300 mb-1">Character</div>
                <div className="text-lg font-bold text-white">Who?</div>
              </div>
              <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-sm text-purple-300 mb-1">Mode</div>
                <div className="text-lg font-bold text-white">Bright or Dark?</div>
              </div>
              <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-sm text-purple-300 mb-1">Instrument Family</div>
                <div className="text-lg font-bold text-white">What family?</div>
              </div>
              <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
                <div className="text-sm text-purple-300 mb-1">Register</div>
                <div className="text-lg font-bold text-white">Low, Mid, High?</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={replayMotif} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-2 transition-colors">
                <RotateCcw size={20} /> Replay
              </button>
              <button onClick={revealAnswer} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-105">
                <Eye size={20} /> Reveal
              </button>
            </div>
          </div>
        )}

        {/* Revealed */}
        {phase === 'revealed' && currentMotif && (
          <div className="w-full max-w-3xl">
            {/* Composer card */}
            <div className="bg-white/10 rounded-2xl p-6 mb-6 text-center">
              <p className="text-sm text-purple-300 mb-1">Composed by</p>
              <h2 className="text-3xl font-black text-white mb-1">{currentMotif.studentName}</h2>
              <div className="text-xl font-bold" style={{ color: currentMotif.characterColor || '#3B82F6' }}>
                {currentMotif.characterName || 'Unnamed Character'}
              </div>
              {currentMotif.characterDescription && (
                <p className="text-purple-300 italic mt-1">"{currentMotif.characterDescription}"</p>
              )}
            </div>

            {/* Vote bars - 2x2 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <VoteCategoryCard title="Character" options={CHARACTER_OPTIONS} votes={votes.character}
                correctId={currentMotif.characterType} />
              <VoteCategoryCard title="Mode" options={MODE_OPTIONS} votes={votes.mode}
                correctId={currentMotif.mode || (currentMotif.characterType === 'villain' || currentMotif.characterType === 'sneaky' ? 'minor' : 'major')} />
              <VoteCategoryCard title="Instrument Family" options={FAMILY_OPTIONS} votes={votes.instrumentFamily}
                correctId={currentMotif.instrumentFamily || 'strings'} />
              <VoteCategoryCard title="Register" options={REGISTER_OPTIONS} votes={votes.register}
                correctId={currentMotif.register || 'mid'} />
            </div>

            <div className="flex gap-4 justify-center">
              {isGalleryMode && currentIndex + 1 < queue.length ? (
                <button onClick={nextMotif} className="px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xl font-bold rounded-2xl transition-all hover:scale-105 flex items-center gap-2">
                  <ChevronRight size={24} /> Next Motif
                </button>
              ) : null}
              <button onClick={returnToMenu} className="px-10 py-4 bg-white/10 hover:bg-white/15 text-white text-xl font-bold rounded-2xl transition-all flex items-center gap-2">
                <ArrowLeft size={20} /> Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotifGalleryTeacher;
