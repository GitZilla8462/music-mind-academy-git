// File: RondoFormGameTeacher.jsx
// Rondo Form Game - Teacher Presentation View
//
// FLOW:
// 1. Guided Listening — full piece plays with section info highlighting
// 2. Round 1: Arrange the Form — students drag A,A,A,A,B,C,D into 7 slots
// 3. Round 2: Name That Section — teacher plays clips, students label A/B/C/D
// 4. Round 3: Full Puzzle — students hear clips + arrange in order
// 5. Results — leaderboard with replay option

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Pause, Users, Trophy, Eye, ChevronRight, Headphones, RotateCcw, Music } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import {
  PIECE, GUIDED_SECTIONS, CORRECT_FORM, SECTION_OPTIONS, SECTIONS_DATA,
  SCORING, calculateRound2SpeedBonus
} from './rondoFormGameConfig';

const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#d97706', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

// Section color block
const SectionBlock = ({ section, size = 'md', revealed = true, isCurrent = false }) => {
  const opt = SECTION_OPTIONS.find(s => s.label === section);
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl'
  };
  return (
    <div
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center font-black text-white transition-all ${
        isCurrent ? 'ring-3 ring-white scale-110' : ''
      }`}
      style={{ backgroundColor: revealed ? (opt?.color || '#6B7280') : 'rgba(255,255,255,0.1)' }}
    >
      {revealed ? section : '?'}
    </div>
  );
};

const RondoFormGameTeacher = ({ sessionData, onComplete }) => {
  const sessionCode = sessionData?.sessionCode || new URLSearchParams(window.location.search).get('session');

  // Game phases: guided-listening | round1 | round2 | round3 | finished
  const [gamePhase, setGamePhase] = useState('setup');
  const [roundPhase, setRoundPhase] = useState('waiting'); // waiting | playing | guessing | revealed

  // Guided listening state
  const [currentGuidedSection, setCurrentGuidedSection] = useState(-1);
  const [guidedFinished, setGuidedFinished] = useState(false);
  const guidedTimerRef = useRef(null);

  // Round 2 state (teacher-paced)
  const [r2CurrentQuestion, setR2CurrentQuestion] = useState(0);
  const [r2LockedCount, setR2LockedCount] = useState(0);
  const [r2CorrectCount, setR2CorrectCount] = useState(0);
  const [r2RevealedSections, setR2RevealedSections] = useState([]);
  const [r2ScoreChanges, setR2ScoreChanges] = useState({});

  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const clipEndTimer = useRef(null);
  const guidedAnimFrame = useRef(null);

  // Students
  const [students, setStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Round completion tracking
  const [round1Submitted, setRound1Submitted] = useState(0);
  const [round3Submitted, setRound3Submitted] = useState(0);

  // Web Audio API setup
  const ensureAudioContext = useCallback(() => {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.connect(ctx.destination);
    if (audioRef.current) {
      sourceNodeRef.current = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current.connect(gainNodeRef.current);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (clipEndTimer.current) {
      clearTimeout(clipEndTimer.current);
      clipEndTimer.current = null;
    }
    if (guidedTimerRef.current) {
      clearInterval(guidedTimerRef.current);
      guidedTimerRef.current = null;
    }
    if (guidedAnimFrame.current) {
      cancelAnimationFrame(guidedAnimFrame.current);
      guidedAnimFrame.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/rondoFormGame`), data);
  }, [sessionCode]);

  // Firebase: Subscribe to students
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName || 'Student',
        score: s.rondoGameScore || 0,
        r2Answer: s.rondoR2Answer,
        r2AnswerTime: s.rondoR2AnswerTime,
        r1Submitted: s.rondoR1Submitted || false,
        r3Submitted: s.rondoR3Submitted || false,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '🎵'
      }));

      setStudents(list);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));
      setR2LockedCount(list.filter(s => s.r2Answer).length);
      setRound1Submitted(list.filter(s => s.r1Submitted).length);
      setRound3Submitted(list.filter(s => s.r3Submitted).length);
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Play a section of audio
  const playSection = useCallback((startTime, endTime) => {
    if (!audioRef.current) return;
    stopAudio();
    ensureAudioContext();

    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const currentSrc = audioRef.current.getAttribute('src');
    if (currentSrc !== PIECE.audioPath) {
      audioRef.current.src = PIECE.audioPath;
      audioRef.current.load();
    }

    audioRef.current.currentTime = startTime;
    audioRef.current.volume = 1.0;
    if (gainNodeRef.current) gainNodeRef.current.gain.value = 1.0;

    audioRef.current.play().catch(err => console.error('Audio play error:', err));
    setIsPlaying(true);

    const duration = (endTime - startTime) * 1000;
    clipEndTimer.current = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    }, duration);
  }, [stopAudio, ensureAudioContext]);

  // ========================================
  // GUIDED LISTENING
  // ========================================
  const startGuidedListening = useCallback(() => {
    setGamePhase('guided-listening');
    setCurrentGuidedSection(0);
    setGuidedFinished(false);
    ensureAudioContext();

    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const currentSrc = audioRef.current?.getAttribute('src');
    if (currentSrc !== PIECE.audioPath) {
      audioRef.current.src = PIECE.audioPath;
      audioRef.current.load();
    }

    audioRef.current.currentTime = 0;
    audioRef.current.volume = 1.0;
    if (gainNodeRef.current) gainNodeRef.current.gain.value = 1.0;

    audioRef.current.play().catch(err => console.error('Audio play error:', err));
    setIsPlaying(true);

    updateGame({ phase: 'guided-listening' });

    // Track current section based on audio time
    const trackSection = () => {
      if (!audioRef.current || audioRef.current.paused) return;
      const t = audioRef.current.currentTime;
      const idx = GUIDED_SECTIONS.findIndex(s => t >= s.startTime && t < s.endTime);
      if (idx >= 0) setCurrentGuidedSection(idx);
      if (t >= GUIDED_SECTIONS[GUIDED_SECTIONS.length - 1].endTime) {
        setGuidedFinished(true);
        setIsPlaying(false);
        return;
      }
      guidedAnimFrame.current = requestAnimationFrame(trackSection);
    };
    guidedAnimFrame.current = requestAnimationFrame(trackSection);
  }, [ensureAudioContext, updateGame]);

  // ========================================
  // ROUND 1: Arrange the Form
  // ========================================
  const startRound1 = useCallback(() => {
    stopAudio();
    setGamePhase('round1');
    setRoundPhase('playing');

    // Reset student round 1 data
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          rondoR1Answer: null,
          rondoR1Submitted: false,
          rondoR1Score: null,
          rondoR1Time: null
        }).catch(() => {});
      });
    }

    updateGame({
      phase: 'round1',
      roundPhase: 'playing',
      roundStartTime: Date.now()
    });
  }, [stopAudio, sessionCode, students, updateGame]);

  const revealRound1 = useCallback(() => {
    setRoundPhase('revealed');

    // Score each student's round 1
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        const studentRef = ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`);
        // Reading is done on student side — they self-score and write to Firebase
      });
    }

    updateGame({ roundPhase: 'revealed' });
  }, [sessionCode, students, updateGame]);

  // ========================================
  // ROUND 2: Name That Section (teacher-paced)
  // ========================================
  const startRound2 = useCallback(() => {
    stopAudio();
    setGamePhase('round2');
    setRoundPhase('guessing');
    setR2CurrentQuestion(0);
    setR2RevealedSections([]);
    setR2ScoreChanges({});
    setR2CorrectCount(0);

    // Clear student r2 answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          rondoR2Answer: null,
          rondoR2AnswerTime: null
        }).catch(() => {});
      });
    }

    updateGame({
      phase: 'round2',
      roundPhase: 'guessing',
      r2CurrentQuestion: 0,
      r2TotalQuestions: SECTIONS_DATA.length,
      r2CorrectAnswer: null,
      r2PlayStartTime: Date.now()
    });

    // Play first 10 seconds of first section
    const first = SECTIONS_DATA[0];
    setTimeout(() => playSection(first.startTime, Math.min(first.endTime, first.startTime + 10)), 300);
  }, [stopAudio, sessionCode, students, updateGame, playSection]);

  const replayR2Section = useCallback(() => {
    const q = SECTIONS_DATA[r2CurrentQuestion];
    if (q) playSection(q.startTime, Math.min(q.endTime, q.startTime + 10));
  }, [r2CurrentQuestion, playSection]);

  const revealR2 = useCallback(() => {
    stopAudio();
    const question = SECTIONS_DATA[r2CurrentQuestion];
    if (!question) return;

    const changes = {};
    let correct = 0;

    students.forEach(s => {
      if (s.r2Answer) {
        const isCorrect = s.r2Answer === question.section;
        if (isCorrect) correct++;
        changes[s.id] = { isCorrect };
      } else {
        changes[s.id] = { isCorrect: false, noAnswer: true };
      }
    });

    setR2ScoreChanges(changes);
    setR2CorrectCount(correct);
    setRoundPhase('revealed');
    setR2RevealedSections(prev => [...prev, { section: question.section, label: question.label }]);

    updateGame({
      roundPhase: 'revealed',
      r2CorrectAnswer: question.section
    });
  }, [stopAudio, r2CurrentQuestion, students, updateGame]);

  const nextR2Question = useCallback(() => {
    // Clear student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          rondoR2Answer: null,
          rondoR2AnswerTime: null
        }).catch(() => {});
      });
    }

    const nextIdx = r2CurrentQuestion + 1;
    if (nextIdx >= SECTIONS_DATA.length) {
      // Round 2 done
      setRoundPhase('round-complete');
      updateGame({ roundPhase: 'round-complete' });
    } else {
      setR2CurrentQuestion(nextIdx);
      setRoundPhase('guessing');
      setR2ScoreChanges({});
      setR2CorrectCount(0);

      updateGame({
        roundPhase: 'guessing',
        r2CurrentQuestion: nextIdx,
        r2CorrectAnswer: null,
        r2PlayStartTime: Date.now()
      });

      setTimeout(() => {
        const q = SECTIONS_DATA[nextIdx];
        playSection(q.startTime, Math.min(q.endTime, q.startTime + 10));
      }, 300);
    }
  }, [sessionCode, students, r2CurrentQuestion, updateGame, playSection]);

  // ========================================
  // ROUND 3: Full Puzzle
  // ========================================
  const startRound3 = useCallback(() => {
    stopAudio();
    setGamePhase('round3');
    setRoundPhase('playing');

    // Reset student round 3 data
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          rondoR3Answer: null,
          rondoR3Submitted: false,
          rondoR3Score: null,
          rondoR3Time: null
        }).catch(() => {});
      });
    }

    updateGame({
      phase: 'round3',
      roundPhase: 'playing',
      roundStartTime: Date.now()
    });
  }, [stopAudio, sessionCode, students, updateGame]);

  const revealRound3 = useCallback(() => {
    setRoundPhase('revealed');
    updateGame({ roundPhase: 'revealed' });
  }, [updateGame]);

  // ========================================
  // FINISH & REPLAY
  // ========================================
  const finishGame = useCallback(() => {
    setGamePhase('finished');
    updateGame({ phase: 'finished' });
  }, [updateGame]);

  const replayRound = useCallback((round) => {
    if (round === 1) startRound1();
    else if (round === 2) startRound2();
    else if (round === 3) startRound3();
  }, [startRound1, startRound2, startRound3]);

  // Current guided section data
  const guidedSection = currentGuidedSection >= 0 ? GUIDED_SECTIONS[currentGuidedSection] : null;
  const r2Question = SECTIONS_DATA[r2CurrentQuestion];
  const r2CorrectSection = r2Question ? SECTION_OPTIONS.find(s => s.label === r2Question.section) : null;

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 text-white overflow-hidden">
      <ActivityBanner />
      <audio ref={audioRef} preload="auto" />

      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎵</span>
            <div>
              <h1 className="text-3xl font-bold">Rondo Form Game</h1>
              {gamePhase !== 'setup' && gamePhase !== 'guided-listening' && gamePhase !== 'finished' && (
                <span className="text-lg text-purple-200">
                  {gamePhase === 'round1' ? 'Round 1: Arrange the Form' :
                   gamePhase === 'round2' ? 'Round 2: Name That Section' :
                   'Round 3: Full Puzzle'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Main content grid */}
        <div className={`grid ${gamePhase !== 'setup' && gamePhase !== 'guided-listening' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
          {/* Main area */}
          <div className={`${gamePhase !== 'setup' && gamePhase !== 'guided-listening' ? 'col-span-2' : ''} bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0 overflow-auto`}>

            {/* ======== SETUP ======== */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-9xl mb-6">🎵</div>
                <h2 className="text-5xl font-bold mb-2">Rondo Form Game</h2>
                <p className="text-2xl text-purple-200 mb-2">{PIECE.title}</p>
                <p className="text-xl text-purple-300 mb-8">{PIECE.composer} ({PIECE.year})</p>

                <div className="flex gap-3 justify-center mb-8">
                  {SECTION_OPTIONS.map(s => (
                    <div key={s.label} className="px-5 py-3 rounded-xl text-center" style={{ backgroundColor: s.color }}>
                      <div className="text-3xl font-black">{s.label}</div>
                      <div className="text-sm opacity-90">{s.description}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startGuidedListening}
                  className="px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Headphones size={40} /> Start Guided Listening
                </button>
              </div>
            )}

            {/* ======== GUIDED LISTENING ======== */}
            {gamePhase === 'guided-listening' && (
              <div className="w-full max-w-4xl">
                <h2 className="text-3xl font-bold text-center mb-2">
                  <Headphones size={32} className="inline mr-2" />
                  Guided Listening
                </h2>
                <p className="text-center text-purple-200 mb-4">{PIECE.title} — {PIECE.composer} ({PIECE.year})</p>

                {/* Section timeline */}
                <div className="flex gap-1 mb-6">
                  {GUIDED_SECTIONS.map((s, idx) => (
                    <div
                      key={s.id}
                      className={`flex-1 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all cursor-default ${
                        idx === currentGuidedSection ? 'ring-3 ring-white scale-105 shadow-lg' : ''
                      } ${idx <= currentGuidedSection ? '' : 'opacity-30'}`}
                      style={{ backgroundColor: idx <= currentGuidedSection ? s.color : 'rgba(255,255,255,0.1)' }}
                    >
                      {idx <= currentGuidedSection ? s.section : '?'}
                    </div>
                  ))}
                </div>

                {/* Current section info card */}
                {guidedSection && !guidedFinished && (
                  <div
                    className="rounded-2xl p-6 mb-4 transition-all"
                    style={{ backgroundColor: guidedSection.color + '30', borderColor: guidedSection.color, borderWidth: '3px' }}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div
                        className="w-20 h-20 rounded-xl flex items-center justify-center text-5xl font-black text-white"
                        style={{ backgroundColor: guidedSection.color }}
                      >
                        {guidedSection.section}
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{guidedSection.label}</div>
                        <div className="text-lg text-purple-200">{guidedSection.description}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-black/20 rounded-xl p-3 text-center">
                        <div className="text-sm text-purple-300 mb-1">Instruments</div>
                        <div className="text-lg font-bold">{guidedSection.instruments}</div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3 text-center">
                        <div className="text-sm text-purple-300 mb-1">Dynamics</div>
                        <div className="text-lg font-bold">{guidedSection.dynamics}</div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3 text-center">
                        <div className="text-sm text-purple-300 mb-1">Tempo</div>
                        <div className="text-lg font-bold">{guidedSection.tempo}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Guided listening finished */}
                {guidedFinished && (
                  <div className="text-center mt-4">
                    <p className="text-2xl text-purple-200 mb-2">The form is:</p>
                    <div className="flex gap-2 justify-center mb-6">
                      {CORRECT_FORM.map((letter, idx) => (
                        <SectionBlock key={idx} section={letter} size="lg" />
                      ))}
                    </div>
                    <p className="text-3xl font-bold text-purple-300 mb-6">{PIECE.form} — Rondo Form</p>
                    <button
                      onClick={startRound1}
                      className="px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                    >
                      <Play size={36} /> Start Round 1
                    </button>
                  </div>
                )}

                {/* Playing controls */}
                {!guidedFinished && (
                  <div className="flex justify-center gap-4 mt-4">
                    {isPlaying ? (
                      <button
                        onClick={stopAudio}
                        className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:scale-105 transition-all"
                      >
                        <Pause size={24} /> Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          ensureAudioContext();
                          if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
                          audioRef.current.play().catch(() => {});
                          setIsPlaying(true);
                          const trackSection = () => {
                            if (!audioRef.current || audioRef.current.paused) return;
                            const t = audioRef.current.currentTime;
                            const idx = GUIDED_SECTIONS.findIndex(s => t >= s.startTime && t < s.endTime);
                            if (idx >= 0) setCurrentGuidedSection(idx);
                            if (t >= GUIDED_SECTIONS[GUIDED_SECTIONS.length - 1].endTime) {
                              setGuidedFinished(true);
                              setIsPlaying(false);
                              return;
                            }
                            guidedAnimFrame.current = requestAnimationFrame(trackSection);
                          };
                          guidedAnimFrame.current = requestAnimationFrame(trackSection);
                        }}
                        className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:scale-105 transition-all"
                      >
                        <Play size={24} /> Resume
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setGuidedFinished(true);
                        stopAudio();
                      }}
                      className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-white/10 hover:bg-white/20"
                    >
                      Skip to Game <ChevronRight size={24} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ======== ROUND 1: Arrange the Form ======== */}
            {gamePhase === 'round1' && (
              <div className="text-center w-full">
                <h2 className="text-4xl font-bold mb-2">Round 1: Arrange the Form</h2>
                <p className="text-xl text-purple-200 mb-6">Students: drag the letters into the correct rondo order!</p>

                {/* Show correct form (hidden during play, revealed after) */}
                {roundPhase === 'revealed' && (
                  <div className="mb-6">
                    <p className="text-2xl text-purple-200 mb-3">Correct Answer:</p>
                    <div className="flex gap-2 justify-center mb-4">
                      {CORRECT_FORM.map((letter, idx) => (
                        <SectionBlock key={idx} section={letter} size="lg" />
                      ))}
                    </div>
                  </div>
                )}

                {roundPhase === 'playing' && (
                  <>
                    {/* Mystery boxes placeholder */}
                    <div className="flex gap-2 justify-center mb-8">
                      {CORRECT_FORM.map((_, idx) => (
                        <div
                          key={idx}
                          className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center text-4xl font-black text-white/30"
                        >
                          ?
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-6">
                      <span className="text-4xl font-black text-green-400">{round1Submitted}</span>
                      <span className="text-xl text-white/70"> / {students.length} submitted</span>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={revealRound1}
                        className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                      >
                        <Eye size={28} /> Reveal Answers
                      </button>
                    </div>
                  </>
                )}

                {roundPhase === 'revealed' && (
                  <button
                    onClick={startRound2}
                    className="px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto mt-4"
                  >
                    <ChevronRight size={36} /> Start Round 2
                  </button>
                )}
              </div>
            )}

            {/* ======== ROUND 2: Name That Section ======== */}
            {gamePhase === 'round2' && (
              <div className="text-center w-full">
                <h2 className="text-3xl font-bold mb-2">Round 2: Name That Section</h2>

                {/* Form timeline */}
                <div className="flex gap-1 mb-4">
                  {SECTIONS_DATA.map((q, idx) => {
                    const revealed = idx < r2RevealedSections.length;
                    const isCurrent = idx === r2CurrentQuestion;
                    const sectionInfo = revealed ? SECTION_OPTIONS.find(s => s.label === r2RevealedSections[idx].section) : null;
                    return (
                      <div
                        key={q.id}
                        className={`flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                          isCurrent ? 'ring-2 ring-white scale-105' : ''
                        }`}
                        style={{
                          backgroundColor: revealed ? sectionInfo?.color : 'rgba(255,255,255,0.1)',
                          opacity: revealed ? 1 : 0.4
                        }}
                      >
                        {revealed ? sectionInfo?.label : '?'}
                      </div>
                    );
                  })}
                </div>

                {/* Guessing */}
                {roundPhase === 'guessing' && r2Question && (
                  <>
                    <div className="text-4xl font-black mb-2">
                      <Headphones size={40} className="inline mr-3" />
                      LISTEN!
                    </div>
                    <p className="text-xl text-purple-200 mb-2">Section {r2CurrentQuestion + 1} of {SECTIONS_DATA.length}</p>

                    <div className="grid grid-cols-4 gap-3 max-w-xl mx-auto mb-4">
                      {SECTION_OPTIONS.map(s => (
                        <div
                          key={s.label}
                          className="p-3 rounded-xl text-center"
                          style={{ backgroundColor: `${s.color}40`, borderColor: s.color, borderWidth: '2px' }}
                        >
                          <div className="text-2xl mb-1">{s.emoji}</div>
                          <div className="text-2xl font-black">{s.label}</div>
                          <div className="text-xs text-white/80">{s.description}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-4">
                      <span className="text-4xl font-black text-green-400">{r2LockedCount}</span>
                      <span className="text-xl text-white/70"> / {students.length} answered</span>
                    </div>

                    <div className="flex gap-4 justify-center">
                      {isPlaying ? (
                        <button onClick={stopAudio} className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:scale-105 transition-all">
                          <Pause size={24} /> Stop
                        </button>
                      ) : (
                        <button onClick={replayR2Section} className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gray-600 hover:bg-gray-700">
                          <Play size={24} /> Replay
                        </button>
                      )}
                      <button onClick={revealR2} className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                        <Eye size={28} /> Reveal
                      </button>
                    </div>
                  </>
                )}

                {/* Revealed */}
                {roundPhase === 'revealed' && r2CorrectSection && (
                  <>
                    <div className="text-2xl text-white/80 mb-3">This section is...</div>
                    <div className="rounded-3xl p-6 mb-4 max-w-md mx-auto" style={{ backgroundColor: r2CorrectSection.color }}>
                      <div className="text-4xl mb-1">{r2CorrectSection.emoji}</div>
                      <div className="text-7xl font-black mb-1">{r2CorrectSection.label}</div>
                      <div className="text-xl text-white/90">{r2CorrectSection.description}</div>
                    </div>
                    <div className="text-lg text-white/70 mb-4">
                      {r2CorrectCount} of {students.length} got it right!
                    </div>
                    <button
                      onClick={nextR2Question}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                    >
                      {r2CurrentQuestion >= SECTIONS_DATA.length - 1 ? (
                        <>Finish Round 2 <Trophy size={28} /></>
                      ) : (
                        <>Next Section <ChevronRight size={28} /></>
                      )}
                    </button>
                  </>
                )}

                {/* Round complete */}
                {roundPhase === 'round-complete' && (
                  <div className="mt-4">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-3xl font-bold mb-2">Round 2 Complete!</h3>
                    <div className="flex gap-2 justify-center mb-6">
                      {CORRECT_FORM.map((letter, idx) => (
                        <SectionBlock key={idx} section={letter} size="md" />
                      ))}
                    </div>
                    <button
                      onClick={startRound3}
                      className="px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                    >
                      <ChevronRight size={36} /> Start Round 3
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ======== ROUND 3: Full Puzzle ======== */}
            {gamePhase === 'round3' && (
              <div className="text-center w-full">
                <h2 className="text-4xl font-bold mb-2">Round 3: Full Puzzle</h2>
                <p className="text-xl text-purple-200 mb-6">Students: listen to clips and arrange them in the correct order!</p>

                {roundPhase === 'revealed' && (
                  <div className="mb-6">
                    <p className="text-2xl text-purple-200 mb-3">Correct Answer:</p>
                    <div className="flex gap-2 justify-center mb-4">
                      {CORRECT_FORM.map((letter, idx) => (
                        <SectionBlock key={idx} section={letter} size="lg" />
                      ))}
                    </div>
                  </div>
                )}

                {roundPhase === 'playing' && (
                  <>
                    <div className="flex gap-2 justify-center mb-8">
                      {CORRECT_FORM.map((_, idx) => (
                        <div
                          key={idx}
                          className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center text-4xl font-black text-white/30"
                        >
                          ?
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-6">
                      <span className="text-4xl font-black text-green-400">{round3Submitted}</span>
                      <span className="text-xl text-white/70"> / {students.length} submitted</span>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={revealRound3}
                        className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                      >
                        <Eye size={28} /> Reveal Answers
                      </button>
                    </div>
                  </>
                )}

                {roundPhase === 'revealed' && (
                  <button
                    onClick={finishGame}
                    className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto mt-4"
                  >
                    <Trophy size={36} /> See Final Results
                  </button>
                )}
              </div>
            )}

            {/* ======== FINISHED ======== */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <div className="text-9xl mb-4">🏆</div>
                <h2 className="text-5xl font-black mb-4">Game Complete!</h2>
                <div className="flex gap-2 justify-center mb-6">
                  {CORRECT_FORM.map((letter, idx) => (
                    <SectionBlock key={idx} section={letter} size="md" />
                  ))}
                </div>
                <p className="text-2xl text-purple-300 mb-8">{PIECE.form} — Rondo Form</p>

                {/* Replay buttons */}
                <div className="flex gap-3 justify-center mb-6">
                  <button
                    onClick={() => replayRound(1)}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-bold flex items-center gap-2"
                  >
                    <RotateCcw size={20} /> Replay Round 1
                  </button>
                  <button
                    onClick={() => replayRound(2)}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-bold flex items-center gap-2"
                  >
                    <RotateCcw size={20} /> Replay Round 2
                  </button>
                  <button
                    onClick={() => replayRound(3)}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-bold flex items-center gap-2"
                  >
                    <RotateCcw size={20} /> Replay Round 3
                  </button>
                </div>

                <button
                  onClick={() => onComplete?.()}
                  className="px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  Continue <ChevronRight size={28} />
                </button>
              </div>
            )}

          </div>

          {/* Leaderboard */}
          {gamePhase !== 'setup' && gamePhase !== 'guided-listening' && (
            <div className="bg-black/20 rounded-2xl p-4 flex flex-col min-h-0">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="text-yellow-400" size={32} />
                <h2 className="text-2xl font-bold">Leaderboard</h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {leaderboard.map((student, idx) => {
                  const r2Change = r2ScoreChanges[student.id];
                  const isRevealing = gamePhase === 'round2' && roundPhase === 'revealed';
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        idx === 0 ? 'bg-yellow-500/20' : 'bg-white/5'
                      } ${isRevealing && r2Change?.isCorrect ? 'ring-2 ring-green-400' : ''}`}
                    >
                      <span className="w-8 text-center font-bold text-xl">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: student.playerColor }}
                      >
                        {student.playerEmoji || student.name.charAt(0)}
                      </div>
                      <span className="flex-1 truncate text-lg font-medium">{student.name}</span>
                      {gamePhase === 'round2' && roundPhase === 'guessing' && student.r2Answer && (
                        <span className="text-green-400 text-sm">✓</span>
                      )}
                      {(gamePhase === 'round1' || gamePhase === 'round3') && roundPhase === 'playing' && (
                        <>
                          {gamePhase === 'round1' && student.r1Submitted && <span className="text-green-400 text-sm">✓</span>}
                          {gamePhase === 'round3' && student.r3Submitted && <span className="text-green-400 text-sm">✓</span>}
                        </>
                      )}
                      <span className="font-bold text-xl">{student.score}</span>
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <div className="text-center text-white/50 py-6 text-lg">Waiting for students...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RondoFormGameTeacher;
