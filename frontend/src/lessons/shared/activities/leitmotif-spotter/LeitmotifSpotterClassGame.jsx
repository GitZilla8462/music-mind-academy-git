// Leitmotif Spotter - Teacher Presentation View (Class Game)
// Teacher plays pre-recorded motifs, students identify Mode, Instrument, Register
// Follows Dynamics Dash pattern: setup → playing → guessing → revealed → finished

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, Users, Trophy, Eye, RotateCcw, ChevronRight } from 'lucide-react';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';
import { formatFirstNameLastInitial } from '../layer-detective/nameGenerator';
import {
  ROUNDS, TOTAL_ROUNDS, CHARACTER_TYPES, INSTRUMENT_FAMILIES, MODES, REGISTERS, SCORING,
  shuffleArray, formatInstrument
} from './leitmotifSpotterConfig';

const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#7c3aed', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const LeitmotifSpotterClassGame = ({ sessionData, onComplete }) => {
  const { sessionCode: contextSessionCode, classId } = useSession();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = contextSessionCode || sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/leitmotifSpotter`;
    if (sessionCode) return `sessions/${sessionCode}/leitmotifSpotter`;
    return null;
  }, [classId, sessionCode]);

  const studentsPath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [shuffledRounds, setShuffledRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // Reveal state
  const [roundResults, setRoundResults] = useState(null);

  // Audio
  const audioRef = useRef(null);

  const updateGame = useCallback((data) => {
    if (!gamePath) return;
    const db = getDatabase();
    update(ref(db, gamePath), data);
  }, [gamePath]);

  // Subscribe to students
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
          score: s.leitmotifSpotterScore || 0,
          answer: s.leitmotifSpotterAnswer,
          answerTime: s.leitmotifSpotterAnswerTime,
          playerColor: s.playerColor || '#3B82F6',
          playerEmoji: s.playerEmoji || '🎵'
        }));
      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));
    });
    return () => unsubscribe();
  }, [studentsPath]);

  const round = shuffledRounds[currentRound];

  // Start game
  const startGame = async () => {
    const shuffled = shuffleArray([...ROUNDS]);
    setShuffledRounds(shuffled);
    setCurrentRound(0);
    setGamePhase('playing');
    setRoundResults(null);

    // Reset student answers/scores
    if (studentsPath) {
      const db = getDatabase();
      const snap = await get(ref(db, studentsPath));
      const data = snap.val() || {};
      const resets = {};
      Object.keys(data).forEach(id => {
        resets[`${id}/leitmotifSpotterAnswer`] = null;
        resets[`${id}/leitmotifSpotterAnswerTime`] = null;
        resets[`${id}/leitmotifSpotterScore`] = null;
      });
      if (Object.keys(resets).length > 0) {
        await update(ref(db, studentsPath), resets);
      }
    }

    updateGame({
      phase: 'playing',
      currentRound: 0,
      totalRounds: TOTAL_ROUNDS,
      isPlaying: false,
      correctAnswer: null,
    });
  };

  // Play audio
  const playAudio = () => {
    if (!round) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(round.audioPath);
    audioRef.current = audio;
    audio.play().catch(() => {});
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);

    setGamePhase('guessing');
    updateGame({
      phase: 'guessing',
      isPlaying: true,
      playStartTime: Date.now(),
    });
  };

  // Replay audio
  const replayAudio = () => {
    if (!round || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  // Reveal answers
  const reveal = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Calculate results
    let correctAllFour = 0;
    let correctCharacter = 0;
    let correctMode = 0;
    let correctInstrument = 0;
    let correctRegister = 0;

    students.forEach(s => {
      if (!s.answer) return;
      const a = typeof s.answer === 'string' ? JSON.parse(s.answer) : s.answer;
      const charOk = a.character === round.correctCharacter;
      const modeOk = a.mode === round.correctMode;
      const instOk = a.instrument === round.correctInstrument;
      const regOk = a.register === round.correctRegister;
      if (charOk) correctCharacter++;
      if (modeOk) correctMode++;
      if (instOk) correctInstrument++;
      if (regOk) correctRegister++;
      if (charOk && modeOk && instOk && regOk) correctAllFour++;
    });

    setRoundResults({ correctAllFour, correctCharacter, correctMode, correctInstrument, correctRegister });
    setGamePhase('revealed');

    updateGame({
      phase: 'revealed',
      correctAnswer: JSON.stringify({
        character: round.correctCharacter,
        mode: round.correctMode,
        instrument: round.correctInstrument,
        instrumentDetail: round.instrumentDetail,
        register: round.correctRegister,
      }),
    });
  };

  // Next round
  const nextRound = async () => {
    const next = currentRound + 1;

    // Clear student answers
    if (studentsPath) {
      const db = getDatabase();
      const snap = await get(ref(db, studentsPath));
      const data = snap.val() || {};
      const resets = {};
      Object.keys(data).forEach(id => {
        resets[`${id}/leitmotifSpotterAnswer`] = null;
        resets[`${id}/leitmotifSpotterAnswerTime`] = null;
      });
      if (Object.keys(resets).length > 0) {
        await update(ref(db, studentsPath), resets);
      }
    }

    if (next >= TOTAL_ROUNDS) {
      setGamePhase('finished');
      updateGame({ phase: 'finished', currentRound: next });
    } else {
      setCurrentRound(next);
      setGamePhase('playing');
      setRoundResults(null);
      updateGame({
        phase: 'playing',
        currentRound: next,
        isPlaying: false,
        correctAnswer: null,
      });
    }
  };

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const answeredStudents = students.filter(s => s.answer);
  const totalStudents = students.length;

  // ============ SETUP ============
  if (gamePhase === 'setup') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
        <ActivityBanner />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-5xl font-black text-white mb-3">Mystery Motif</h1>
            <p className="text-2xl text-purple-200 mb-2">Can you identify the motif?</p>
            <p className="text-lg text-purple-300 mb-8">
              {totalStudents} student{totalStudents !== 1 ? 's' : ''} connected
            </p>
            <button
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-2xl font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ FINISHED ============
  if (gamePhase === 'finished') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
        <ActivityBanner />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-4">🏆</div>
            <h1 className="text-5xl font-black text-white mb-4">Game Complete!</h1>
            <p className="text-2xl text-purple-200 mb-8">{TOTAL_ROUNDS} motifs identified</p>
            <button
              onClick={onComplete}
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xl font-bold rounded-2xl transition-all hover:scale-105"
            >
              Advance to See Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ PLAYING / GUESSING / REVEALED ============
  const charInfo = CHARACTER_TYPES.find(c => c.id === round?.correctCharacter);
  const modeInfo = MODES.find(m => m.id === round?.correctMode);
  const instInfo = INSTRUMENT_FAMILIES.find(f => f.id === round?.correctInstrument);
  const regInfo = REGISTERS.find(r => r.id === round?.correctRegister);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
      <ActivityBanner />

      <div className="flex-1 flex">
        {/* Main content - 2/3 width */}
        <div className="flex-1 flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🔍</span>
              <div>
                <h1 className="text-3xl font-black text-white">Motif {currentRound + 1} of {TOTAL_ROUNDS}</h1>
                <p className="text-purple-300">{round?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Users size={20} className="text-purple-300" />
              <span className="text-xl font-bold text-white">{lockedCount}/{totalStudents}</span>
              <span className="text-purple-300 text-sm">answered</span>
            </div>
          </div>

          {/* Main area */}
          <div className="flex-1 flex items-center justify-center">
            {gamePhase === 'playing' && (
              <div className="text-center">
                <p className="text-2xl text-purple-200 mb-6">Play the motif for students to identify</p>
                <div className="flex gap-4 justify-center mb-6">
                  <div className="bg-white/10 rounded-xl px-6 py-3 text-center">
                    <div className="text-sm text-purple-300 mb-1">Character</div>
                    <div className="text-lg font-bold text-white">Hero, Villain, Romantic, or Sneaky?</div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-6 py-3 text-center">
                    <div className="text-sm text-purple-300 mb-1">Mode</div>
                    <div className="text-lg font-bold text-white">Bright or Dark?</div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-6 py-3 text-center">
                    <div className="text-sm text-purple-300 mb-1">Instrument Family</div>
                    <div className="text-lg font-bold text-white">What family?</div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-6 py-3 text-center">
                    <div className="text-sm text-purple-300 mb-1">Register</div>
                    <div className="text-lg font-bold text-white">Low, Mid, or High?</div>
                  </div>
                </div>
                <button
                  onClick={playAudio}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-2xl font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-3 mx-auto"
                >
                  <Play size={28} /> Play Motif
                </button>
              </div>
            )}

            {gamePhase === 'guessing' && (
              <div className="text-center">
                <p className="text-xl text-purple-200 mb-6">
                  {lockedCount} of {totalStudents} students answered
                </p>
                <div className="flex gap-4 justify-center mb-6">
                  <div className="bg-white/10 rounded-xl px-6 py-3 text-center">
                    <div className="text-sm text-purple-300 mb-1">Character</div>
                    <div className="text-lg font-bold text-white">Hero, Villain, Romantic, or Sneaky?</div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-6 py-3 text-center">
                    <div className="text-sm text-purple-300 mb-1">Mode</div>
                    <div className="text-lg font-bold text-white">Bright or Dark?</div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-6 py-3 text-center">
                    <div className="text-sm text-purple-300 mb-1">Instrument Family</div>
                    <div className="text-lg font-bold text-white">What family?</div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-6 py-3 text-center">
                    <div className="text-sm text-purple-300 mb-1">Register</div>
                    <div className="text-lg font-bold text-white">Low, Mid, or High?</div>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={replayAudio}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw size={20} /> Replay
                  </button>
                  <button
                    onClick={reveal}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Eye size={20} /> Reveal Answer
                  </button>
                </div>
              </div>
            )}

            {gamePhase === 'revealed' && (
              <div className="text-center w-full max-w-2xl">
                <h2 className="text-3xl font-black text-white mb-6">The Answer Is...</h2>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {/* Character */}
                  <div className="rounded-2xl p-5 text-white" style={{ backgroundColor: charInfo?.color || '#666' }}>
                    <div className="text-sm opacity-80 mb-1">Character</div>
                    <div className="text-3xl font-black">{charInfo?.emoji}</div>
                    <div className="text-lg font-bold">{charInfo?.label}</div>
                    {roundResults && (
                      <div className="mt-2 text-sm font-bold bg-black/20 rounded-lg px-2 py-1">
                        {roundResults.correctCharacter}/{answeredStudents.length} correct
                      </div>
                    )}
                  </div>

                  {/* Mode */}
                  <div className="rounded-2xl p-5 text-white" style={{ backgroundColor: modeInfo?.color || '#666' }}>
                    <div className="text-sm opacity-80 mb-1">Mode</div>
                    <div className="text-3xl font-black">{modeInfo?.label}</div>
                    <div className="text-sm opacity-80">{modeInfo?.description}</div>
                    {roundResults && (
                      <div className="mt-2 text-sm font-bold bg-black/20 rounded-lg px-2 py-1">
                        {roundResults.correctMode}/{answeredStudents.length} correct
                      </div>
                    )}
                  </div>

                  {/* Instrument */}
                  <div className="rounded-2xl p-5 text-white" style={{ backgroundColor: instInfo?.color || '#666' }}>
                    <div className="text-sm opacity-80 mb-1">Instrument Family</div>
                    <div className="text-3xl font-black">{instInfo?.emoji}</div>
                    <div className="text-lg font-bold">
                      {formatInstrument(round.correctInstrument, round.instrumentDetail)}
                    </div>
                    {roundResults && (
                      <div className="mt-2 text-sm font-bold bg-black/20 rounded-lg px-2 py-1">
                        {roundResults.correctInstrument}/{answeredStudents.length} correct
                      </div>
                    )}
                  </div>

                  {/* Register */}
                  <div className="rounded-2xl p-5 text-white" style={{ backgroundColor: regInfo?.color || '#666' }}>
                    <div className="text-sm opacity-80 mb-1">Register</div>
                    <div className="text-3xl font-black">{regInfo?.label}</div>
                    <div className="text-sm opacity-80">{regInfo?.description}</div>
                    {roundResults && (
                      <div className="mt-2 text-sm font-bold bg-black/20 rounded-lg px-2 py-1">
                        {roundResults.correctRegister}/{answeredStudents.length} correct
                      </div>
                    )}
                  </div>
                </div>

                {roundResults && (
                  <p className="text-xl text-purple-200 mb-6">
                    {roundResults.correctAllFour} of {answeredStudents.length} got all 4 correct!
                  </p>
                )}

                <button
                  onClick={nextRound}
                  className="px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xl font-bold rounded-2xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  {currentRound + 1 >= TOTAL_ROUNDS ? (
                    <><Trophy size={24} /> Finish Game</>
                  ) : (
                    <><ChevronRight size={24} /> Next Motif</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard sidebar - 1/3 width */}
        {gamePhase !== 'setup' && (
          <div className="w-80 bg-black/20 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={20} className="text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Leaderboard</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {leaderboard.map((student, idx) => {
                const hasAnswered = !!student.answer;
                return (
                  <div
                    key={student.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                      hasAnswered && gamePhase === 'guessing' ? 'bg-green-500/20' : 'bg-white/5'
                    }`}
                  >
                    <span className="w-6 text-center font-bold text-sm text-white/70">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: student.playerColor }}
                    >
                      {student.playerEmoji}
                    </div>
                    <span className="flex-1 truncate text-sm text-white">{student.name}</span>
                    <span className="font-bold text-sm text-yellow-300">{student.score}</span>
                    {hasAnswered && gamePhase === 'guessing' && (
                      <span className="text-green-400 text-xs">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeitmotifSpotterClassGame;
