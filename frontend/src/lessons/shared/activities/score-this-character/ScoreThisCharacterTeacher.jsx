// ScoreThisCharacterTeacher.jsx
// Score This Character — Teacher Projection / Game Controller
// Follows GenreMatchTeacherGame.jsx architecture.
// PHASES: setup → submit → picking → composing → listening → voting → revealed → (repeat) → finished

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Pause, Users, Trophy, Award, Medal, ChevronRight, Music, Eye, Square, Volume2 } from 'lucide-react';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';
import { formatFirstNameLastInitial } from '../layer-detective/nameGenerator';
import renderNotesToWav from '../../../../pages/projects/film-music-score/shared/renderWithSampler';

// Character type config
const CHARACTER_TYPES = [
  { id: 'hero', label: 'Hero', emoji: '🦸' },
  { id: 'villain', label: 'Villain', emoji: '🦹' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
  { id: 'sneaky', label: 'Sneaky', emoji: '🕵️' },
  { id: 'other', label: 'Other', emoji: '✏️' },
];

const ALL_VOTE_LABELS = ['A', 'B', 'C', 'D', 'E'];
const VOTE_COLORS = { A: '#3B82F6', B: '#8B5CF6', C: '#F59E0B', D: '#10B981', E: '#EF4444' };

const SCORING = { MAJORITY_VOTE: 1, WINNING_COMPOSER: 2 };

// Activity Banner
const ActivityBanner = () => (
  <div className="w-full flex items-center justify-center" style={{ height: '64px', backgroundColor: '#F59E0B', flexShrink: 0 }}>
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>STUDENT ACTIVITY</span>
  </div>
);

// Countdown display
const CountdownDisplay = ({ startTime, duration, label }) => {
  const [remaining, setRemaining] = useState(duration);
  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setRemaining(Math.max(0, Math.ceil(duration - elapsed)));
    }, 200);
    return () => clearInterval(interval);
  }, [startTime, duration]);

  const isLow = remaining <= 10;
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-white/60 text-xl">{label}</span>}
      <span className={`text-4xl font-black tabular-nums ${isLow ? 'text-red-400 animate-pulse' : 'text-white'}`}>
        {remaining}s
      </span>
    </div>
  );
};

const ScoreThisCharacterTeacher = ({ sessionData, onComplete }) => {
  const { sessionCode: contextSessionCode, classId } = useSession();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = contextSessionCode || sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  // Firebase paths
  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/scoreThisCharacter`;
    if (sessionCode) return `sessions/${sessionCode}/scoreThisCharacter`;
    return null;
  }, [classId, sessionCode]);

  const studentsPath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(3);
  const [numCandidates, setNumCandidates] = useState(5);
  const [listenRoundsPerCharacter, setListenRoundsPerCharacter] = useState(2);
  const [currentListenRound, setCurrentListenRound] = useState(0); // 0-based sub-round within a character
  const [phaseStartTime, setPhaseStartTime] = useState(null);

  // Derive active vote labels from candidate count
  const VOTE_LABELS = ALL_VOTE_LABELS.slice(0, numCandidates);

  // Students
  const [students, setStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Character submissions
  const [characterSubmissions, setCharacterSubmissions] = useState([]);
  const [featuredCharacter, setFeaturedCharacter] = useState(null);

  // Motif submissions
  const [motifSubmissions, setMotifSubmissions] = useState([]);
  const [candidates, setCandidates] = useState([]); // 4 picked for listening
  const [candidateAudios, setCandidateAudios] = useState({}); // { A: blobUrl, B: blobUrl, ... }
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Voting
  const [voteCounts, setVoteCounts] = useState({});
  const [scoreChanges, setScoreChanges] = useState({});
  const [majorityLabel, setMajorityLabel] = useState(null);
  const [winnerStudentId, setWinnerStudentId] = useState(null);

  // Audio playback
  const audioRef = useRef(null);
  const [playingLabel, setPlayingLabel] = useState(null);

  // Rotation tracking
  const previouslyFeaturedRef = useRef(new Set());

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      Object.values(candidateAudios).forEach(url => { try { URL.revokeObjectURL(url); } catch(e) {} });
    };
  }, []);

  // Firebase: update game state
  const updateGame = useCallback((data) => {
    if (!gamePath) return;
    const db = getDatabase();
    update(ref(db, gamePath), data);
  }, [gamePath]);

  // Firebase: subscribe to students
  useEffect(() => {
    if (!studentsPath) return;
    const db = getDatabase();
    const unsubscribe = onValue(ref(db, studentsPath), (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([, s]) => s.displayName || s.playerName || s.name)
        .map(([id, s]) => ({
          id,
          name: formatFirstNameLastInitial(s.displayName || s.playerName || s.name),
          score: s.stcScore || 0,
          playerColor: s.playerColor || '#3B82F6',
          playerEmoji: s.playerEmoji || '🎵',
          character: s.stcCharacter ? (typeof s.stcCharacter === 'string' ? JSON.parse(s.stcCharacter) : s.stcCharacter) : null,
          motif: s.stcMotif ? (typeof s.stcMotif === 'string' ? JSON.parse(s.stcMotif) : s.stcMotif) : null,
          vote: s.stcVote || null,
        }));

      setStudents(list);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));
      setCharacterSubmissions(list.filter(s => s.character));
      setMotifSubmissions(list.filter(s => s.motif));

      // Count votes
      const counts = {};
      list.forEach(s => { if (s.vote) counts[s.vote] = (counts[s.vote] || 0) + 1; });
      setVoteCounts(counts);
    });
    return () => unsubscribe();
  }, [studentsPath]);

  // ── START GAME ──
  const startGame = useCallback(async () => {
    setCurrentRound(0);
    setGamePhase('submit');
    setScoreChanges({});
    setFeaturedCharacter(null);
    setCandidates([]);
    previouslyFeaturedRef.current = new Set();

    // Reset all student fields
    if (studentsPath) {
      const db = getDatabase();
      try {
        const snap = await get(ref(db, studentsPath));
        if (snap.exists()) {
          const updates = {};
          Object.keys(snap.val()).forEach(id => {
            updates[`${id}/stcCharacter`] = null;
            updates[`${id}/stcMotif`] = null;
            updates[`${id}/stcVote`] = null;
            updates[`${id}/stcVoteTime`] = null;
            updates[`${id}/stcScore`] = null;
          });
          await update(ref(db, studentsPath), updates);
        }
      } catch (err) { console.error('Failed to reset students:', err); }
    }

    const now = Date.now();
    setPhaseStartTime(now);
    updateGame({ phase: 'submit', currentRound: 0, totalRounds, phaseStartTime: now, featuredCharacter: null, candidates: null, majorityLabel: null, winnerStudentId: null });
  }, [studentsPath, totalRounds, updateGame]);

  // ── PICK CHARACTER ──
  const pickCharacter = useCallback((studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student?.character) return;

    const featured = { ...student.character, studentId };
    setFeaturedCharacter(featured);

    // Clear all motifs and votes for new composing round
    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsPath}/${s.id}`), {
          stcMotif: null, stcVote: null, stcVoteTime: null,
        }).catch(() => {});
      });
    }

    const now = Date.now();
    setPhaseStartTime(now);
    setGamePhase('composing');
    setCandidates([]);
    setCandidateAudios({});
    updateGame({ phase: 'composing', featuredCharacter: featured, phaseStartTime: now, candidates: null, majorityLabel: null, winnerStudentId: null });
  }, [students, studentsPath, updateGame]);

  // ── STOP AUDIO ──
  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingLabel(null);
  }, []);

  // ── SELECT CANDIDATES ──
  const selectCandidates = useCallback(async () => {
    const withMotifs = students.filter(s => s.motif && s.motif.notes?.length > 0);
    if (withMotifs.length === 0) return;

    // Clean up previous audio URLs
    Object.values(candidateAudios).forEach(url => { try { URL.revokeObjectURL(url); } catch(e) {} });
    setCandidateAudios({});
    stopAudio();

    // Prefer students not previously featured
    const unfeatured = withMotifs.filter(s => !previouslyFeaturedRef.current.has(s.id));
    const pool = unfeatured.length >= numCandidates ? unfeatured : withMotifs;

    // Shuffle and pick
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, numCandidates).map((s, i) => ({
      studentId: s.id,
      studentName: s.name,
      label: ALL_VOTE_LABELS[i],
      motif: s.motif,
    }));

    picked.forEach(c => previouslyFeaturedRef.current.add(c.studentId));
    setCandidates(picked);
    setGamePhase('listening');
    updateGame({
      phase: 'listening',
      candidates: picked.map(c => ({ studentId: c.studentId, label: c.label })),
    });

    // Pre-render audio for all 4 candidates
    setLoadingAudio(true);
    const audios = {};
    await Promise.all(picked.map(async (c) => {
      try {
        const result = await renderNotesToWav(c.motif.notes, c.motif.instrument);
        if (result?.blobURL) audios[c.label] = result.blobURL;
      } catch (err) { console.error(`Failed to render motif ${c.label}:`, err); }
    }));
    setCandidateAudios(audios);
    setLoadingAudio(false);
  }, [students, numCandidates, candidateAudios, stopAudio, updateGame]);

  // ── PLAY CANDIDATE AUDIO ──
  const playCandidate = useCallback((label) => {
    const url = candidateAudios[label];
    if (!url) return;

    // Stop any currently playing
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingLabel(null);

    const audio = new Audio(url);
    audio.volume = 0.8;
    audioRef.current = audio;
    audio.onplay = () => setPlayingLabel(label);
    audio.onended = () => { setPlayingLabel(null); audioRef.current = null; };
    audio.onerror = () => { setPlayingLabel(null); audioRef.current = null; };
    audio.play().catch(() => setPlayingLabel(null));
  }, [candidateAudios]);

  // ── START VOTING ──
  const startVoting = useCallback(() => {
    setGamePhase('voting');
    updateGame({ phase: 'voting' });
    stopAudio();
  }, [updateGame, stopAudio]);

  // ── REVEAL ──
  const reveal = useCallback(() => {
    // Find majority
    const counts = {};
    VOTE_LABELS.forEach(l => { counts[l] = 0; });
    students.forEach(s => { if (s.vote) counts[s.vote] = (counts[s.vote] || 0) + 1; });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const majority = sorted[0][0];
    const winnerCandidate = candidates.find(c => c.label === majority);
    const winnerId = winnerCandidate?.studentId || null;

    setMajorityLabel(majority);
    setWinnerStudentId(winnerId);

    // Score
    const changes = {};
    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        let points = 0;
        if (s.vote === majority) points += SCORING.MAJORITY_VOTE;
        if (s.id === winnerId) points += SCORING.WINNING_COMPOSER;
        changes[s.id] = { points, votedMajority: s.vote === majority, isWinner: s.id === winnerId };
        if (points > 0) {
          update(ref(db, `${studentsPath}/${s.id}`), {
            stcScore: (s.score || 0) + points
          }).catch(err => console.error(`Failed to update score for ${s.id}:`, err));
        }
      });
    }

    setScoreChanges(changes);
    setGamePhase('revealed');
    updateGame({ phase: 'revealed', majorityLabel: majority, winnerStudentId: winnerId });
  }, [students, candidates, studentsPath, updateGame]);

  // ── NEXT (sub-round or new character) ──
  const nextRound = useCallback(() => {
    // Clean up audio URLs
    Object.values(candidateAudios).forEach(url => { try { URL.revokeObjectURL(url); } catch(e) {} });
    setCandidateAudios({});
    setCandidates([]);
    setScoreChanges({});
    setMajorityLabel(null);
    setWinnerStudentId(null);

    // Clear student votes only (keep motifs for re-picking within same character)
    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsPath}/${s.id}`), {
          stcVote: null, stcVoteTime: null,
        }).catch(() => {});
      });
    }

    const nextListenRound = currentListenRound + 1;

    // More sub-rounds for this character? Pick new motifs, same character
    if (nextListenRound < listenRoundsPerCharacter) {
      setCurrentListenRound(nextListenRound);
      setGamePhase('listening');
      updateGame({ phase: 'listening', candidates: null, majorityLabel: null, winnerStudentId: null });
      // Auto-pick new candidates
      selectCandidates();
      return;
    }

    // Done with this character — move to next character or finish
    setCurrentListenRound(0);

    // Also clear motifs for fresh composing
    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsPath}/${s.id}`), { stcMotif: null }).catch(() => {});
      });
    }

    const nextIdx = currentRound + 1;
    if (nextIdx >= totalRounds) {
      setGamePhase('finished');
      updateGame({ phase: 'finished' });
    } else {
      setCurrentRound(nextIdx);
      setGamePhase('picking');
      updateGame({ phase: 'picking', currentRound: nextIdx, featuredCharacter: null, candidates: null, majorityLabel: null, winnerStudentId: null });
    }
  }, [studentsPath, students, currentRound, totalRounds, currentListenRound, listenRoundsPerCharacter, candidateAudios, updateGame, selectCandidates]);

  // ── Helper: get type emoji ──
  const getTypeEmoji = (type) => CHARACTER_TYPES.find(t => t.id === type)?.emoji || '✏️';

  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════
  return (
    <div className="min-h-screen h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      <ActivityBanner />

      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎬</div>
            <h1 className="text-3xl font-bold">Score This Character</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Round {currentRound + 1} / {totalRounds}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Main content + leaderboard */}
        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0 overflow-hidden">
          {/* Main area (2 cols) */}
          <div className="col-span-2 flex flex-col min-h-0 overflow-auto">

            {/* ── SETUP ── */}
            {gamePhase === 'setup' && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-8xl mb-4">🎬</div>
                <h2 className="text-4xl font-bold mb-6">Score This Character</h2>

                {/* How to Play */}
                <div className="bg-white/10 rounded-2xl p-6 max-w-lg w-full mb-6">
                  <h3 className="text-lg font-bold text-orange-400 mb-3">How to Play</h3>
                  <ol className="space-y-2 text-white text-lg">
                    <li className="flex gap-3"><span className="font-black text-orange-400 shrink-0">1.</span> Everyone creates a character on their device (draw, name, describe)</li>
                    <li className="flex gap-3"><span className="font-black text-orange-400 shrink-0">2.</span> Teacher picks one character to feature on the main screen</li>
                    <li className="flex gap-3"><span className="font-black text-orange-400 shrink-0">3.</span> Everyone composes a short motif that fits that character</li>
                    <li className="flex gap-3"><span className="font-black text-orange-400 shrink-0">4.</span> A few motifs play anonymously — class votes on the best match</li>
                    <li className="flex gap-3"><span className="font-black text-orange-400 shrink-0">5.</span> Voting with the majority = +1 point. Winning composer = +2 points</li>
                    <li className="flex gap-3"><span className="font-black text-orange-400 shrink-0">6.</span> Repeat with new characters!</li>
                  </ol>
                </div>

                <p className="text-white/40 text-sm mb-6">
                  {totalRounds} characters × {listenRoundsPerCharacter} rounds × {numCandidates} motifs = {totalRounds * listenRoundsPerCharacter * numCandidates} students featured
                </p>
                <button onClick={startGame}
                  className="px-10 py-4 bg-green-600 hover:bg-green-700 rounded-2xl text-2xl font-bold transition-colors">
                  Start Game
                </button>
              </div>
            )}

            {/* ── SUBMIT ── */}
            {gamePhase === 'submit' && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">✏️</div>
                <h2 className="text-3xl font-bold mb-2">Create Your Character!</h2>
                <p className="text-xl text-white/60 mb-6">Draw and describe a character on your device</p>
                <CountdownDisplay startTime={phaseStartTime} duration={60} label="Time:" />
                <div className="mt-6 bg-white/10 px-8 py-4 rounded-2xl">
                  <span className="text-2xl font-bold text-green-400">{characterSubmissions.length}</span>
                  <span className="text-xl text-white/60 ml-2">/ {students.length} submitted</span>
                </div>
                <button onClick={() => { setGamePhase('picking'); updateGame({ phase: 'picking' }); }}
                  disabled={characterSubmissions.length === 0}
                  className={`mt-6 px-8 py-3 rounded-xl text-lg font-bold transition-colors flex items-center gap-2 ${
                    characterSubmissions.length > 0 ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}>
                  Pick a Character <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* ── PICKING ── */}
            {gamePhase === 'picking' && (
              <div className="flex-1 flex flex-col min-h-0">
                <h2 className="text-2xl font-bold mb-3 flex-shrink-0">Pick a Character to Feature</h2>
                <div className="flex-1 overflow-auto">
                  <div className="grid grid-cols-3 gap-3">
                    {characterSubmissions.map(s => (
                      <button key={s.id} onClick={() => pickCharacter(s.id)}
                        className="bg-white/5 hover:bg-white/10 rounded-xl p-3 text-left transition-colors border border-transparent hover:border-orange-500">
                        {s.character.drawingDataUrl && (
                          <img src={s.character.drawingDataUrl} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />
                        )}
                        <div className="text-sm font-bold text-white truncate">
                          {getTypeEmoji(s.character.type)} {s.character.name}
                        </div>
                        {s.character.description && (
                          <div className="text-xs text-white/50 truncate">{s.character.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── COMPOSING ── */}
            {gamePhase === 'composing' && featuredCharacter && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">Compose a Motif for This Character!</h2>
                {/* Featured character card */}
                <div className="bg-white/10 rounded-2xl p-6 mb-6 max-w-lg w-full flex gap-4 items-center">
                  {featuredCharacter.drawingDataUrl && (
                    <img src={featuredCharacter.drawingDataUrl} alt="" className="w-28 h-20 object-cover rounded-xl" />
                  )}
                  <div>
                    <div className="text-2xl font-bold">
                      {getTypeEmoji(featuredCharacter.type)} {featuredCharacter.name}
                    </div>
                    {featuredCharacter.description && (
                      <div className="text-white/60 mt-1">{featuredCharacter.description}</div>
                    )}
                  </div>
                </div>
                <CountdownDisplay startTime={phaseStartTime} duration={90} label="Time:" />
                <div className="mt-4 bg-white/10 px-8 py-4 rounded-2xl">
                  <span className="text-2xl font-bold text-green-400">{motifSubmissions.length}</span>
                  <span className="text-xl text-white/60 ml-2">/ {students.length} submitted</span>
                </div>
                <button onClick={selectCandidates}
                  disabled={motifSubmissions.length < 1}
                  className={`mt-4 px-8 py-3 rounded-xl text-lg font-bold transition-colors flex items-center gap-2 ${
                    motifSubmissions.length >= 1 ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}>
                  Listen to Motifs <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* ── LISTENING ── */}
            {gamePhase === 'listening' && (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h2 className="text-2xl font-bold">Listen — Which Motif Fits Best?</h2>
                  {listenRoundsPerCharacter > 1 && (
                    <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                      Listen {currentListenRound + 1} / {listenRoundsPerCharacter}
                    </span>
                  )}
                </div>
                {/* Featured character reminder */}
                {featuredCharacter && (
                  <div className="bg-white/5 rounded-xl p-3 mb-4 flex items-center gap-3 flex-shrink-0">
                    {featuredCharacter.drawingDataUrl && (
                      <img src={featuredCharacter.drawingDataUrl} alt="" className="w-12 h-8 object-cover rounded" />
                    )}
                    <span className="font-bold">{getTypeEmoji(featuredCharacter.type)} {featuredCharacter.name}</span>
                    {featuredCharacter.description && <span className="text-white/50 text-sm">— {featuredCharacter.description}</span>}
                  </div>
                )}
                {loadingAudio && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2" />
                    <p className="text-white/60">Rendering motifs...</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {candidates.map(c => (
                    <div key={c.label} className="bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center">
                      <div className="text-5xl font-black mb-4" style={{ color: VOTE_COLORS[c.label] }}>
                        {c.label}
                      </div>
                      <button
                        onClick={() => playingLabel === c.label ? stopAudio() : playCandidate(c.label)}
                        disabled={!candidateAudios[c.label]}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                          playingLabel === c.label
                            ? 'bg-green-600 text-white animate-pulse'
                            : candidateAudios[c.label]
                              ? 'bg-white/10 hover:bg-white/20 text-white'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}>
                        {playingLabel === c.label ? <><Pause size={20} /> Playing</> : <><Play size={20} /> Play</>}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4 self-center flex-shrink-0">
                  <button onClick={selectCandidates}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-bold transition-colors flex items-center gap-2">
                    🔀 Pick New Motifs
                  </button>
                  <button onClick={startVoting}
                    className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl text-lg font-bold transition-colors flex items-center gap-2">
                    Start Voting <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* ── VOTING ── */}
            {gamePhase === 'voting' && (
              <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Vote — Which Motif Fits Best?</h2>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {VOTE_LABELS.map(label => {
                    const count = voteCounts[label] || 0;
                    const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    return (
                      <div key={label} className="bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Vote bar background */}
                        <div className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                          style={{ height: `${pct}%`, backgroundColor: VOTE_COLORS[label], opacity: 0.15 }} />
                        <div className="text-5xl font-black mb-2 relative z-10" style={{ color: VOTE_COLORS[label] }}>{label}</div>
                        <div className="text-3xl font-bold text-white relative z-10">{count} votes</div>
                        {totalVotes > 0 && <div className="text-lg text-white/50 relative z-10">{pct}%</div>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 flex-shrink-0">
                  <div className="text-white/60">
                    {Object.values(voteCounts).reduce((a, b) => a + b, 0)} / {students.length} voted
                  </div>
                  <button onClick={reveal}
                    className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl text-lg font-bold transition-colors flex items-center gap-2">
                    <Eye size={20} /> Reveal Winner
                  </button>
                </div>
              </div>
            )}

            {/* ── REVEALED ── */}
            {gamePhase === 'revealed' && majorityLabel && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">The Crowd Chose...</h2>
                <div className="text-8xl font-black mb-2" style={{ color: VOTE_COLORS[majorityLabel] }}>
                  Motif {majorityLabel}
                </div>
                {winnerStudentId && (
                  <div className="text-2xl text-white/80 mb-6">
                    Composed by: <span className="font-bold text-yellow-400">
                      {candidates.find(c => c.studentId === winnerStudentId)?.studentName || 'Unknown'}
                    </span>
                    <span className="ml-2 text-yellow-400">+{SCORING.WINNING_COMPOSER} pts</span>
                  </div>
                )}
                <div className="bg-white/10 rounded-2xl p-4 mb-6 text-center">
                  <p className="text-white/60">Everyone who voted <span style={{ color: VOTE_COLORS[majorityLabel] }} className="font-bold">{majorityLabel}</span> gets +{SCORING.MAJORITY_VOTE} point</p>
                  <p className="text-lg font-bold text-green-400 mt-1">
                    {students.filter(s => s.vote === majorityLabel).length} students voted with the majority
                  </p>
                </div>
                <button onClick={nextRound}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl text-lg font-bold transition-colors flex items-center gap-2">
                  {currentListenRound + 1 < listenRoundsPerCharacter
                    ? 'Next Motifs (Same Character)'
                    : currentRound + 1 >= totalRounds
                      ? 'See Final Results'
                      : 'Next Character'
                  } <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* ── FINISHED ── */}
            {gamePhase === 'finished' && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-8xl mb-4">🏆</div>
                <h2 className="text-4xl font-bold mb-6">Final Results</h2>
                <div className="w-full max-w-lg">
                  {leaderboard.slice(0, 5).map((entry, idx) => {
                    const rankIcon = idx === 0 ? <Trophy size={24} className="text-yellow-400" /> :
                                     idx === 1 ? <Award size={24} className="text-gray-300" /> :
                                     idx === 2 ? <Medal size={24} className="text-amber-600" /> : null;
                    return (
                      <div key={entry.id}
                        className="flex items-center gap-4 px-6 py-3 rounded-2xl mb-2 bg-white/5">
                        <div className="w-8 text-center">
                          {rankIcon || <span className="text-lg font-bold text-white/50">{idx + 1}</span>}
                        </div>
                        <span className="text-2xl">{entry.playerEmoji}</span>
                        <div className="flex-1 text-lg font-bold text-white truncate">{entry.name}</div>
                        <div className="text-2xl font-black text-yellow-400">{entry.score}</div>
                      </div>
                    );
                  })}
                </div>
                {onComplete && (
                  <button onClick={onComplete}
                    className="mt-6 px-8 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-bold transition-colors">
                    Continue
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Leaderboard sidebar */}
          {gamePhase !== 'setup' && (
            <div className="col-span-1 bg-white/5 rounded-2xl p-4 overflow-auto">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" /> Leaderboard
              </h3>
              <div className="space-y-1">
                {leaderboard.map((entry, idx) => {
                  const change = scoreChanges[entry.id];
                  return (
                    <div key={entry.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                        change?.points > 0 && gamePhase === 'revealed' ? 'bg-green-500/20 ring-1 ring-green-500/50' : ''
                      }`}>
                      <span className="text-xs font-bold text-white/40 w-5 text-center">{idx + 1}</span>
                      <span className="text-sm">{entry.playerEmoji}</span>
                      <span className="flex-1 text-sm font-medium text-white truncate">{entry.name}</span>
                      <span className="text-sm font-black text-yellow-400">{entry.score}</span>
                      {change?.points > 0 && gamePhase === 'revealed' && (
                        <span className="text-xs font-bold text-green-400 ml-1">+{change.points}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreThisCharacterTeacher;
