// File: NameThatElementTeacherGame.jsx
// Name That Element - Teacher Presentation View (Class Review Game)
// A/B/C/D multiple choice covering dynamics, tempo, instruments, and form
// 2 rounds of 11 questions each — different questions per round
//
// PHASES:
// 1. Setup - Show "Start Game"
// 2. Question - Audio plays, students answer A/B/C/D on devices
// 3. Revealed - Show correct answer with explanation
// 4. Finished - Final leaderboard + option to play Round 2

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Pause, Users, Trophy, Eye, ChevronRight, CheckCircle, XCircle, Volume2, RotateCcw } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { formatFirstNameLastInitial } from '../layer-detective/nameGenerator';
import { useSession } from '../../../../context/SessionContext';

// ============================================================
// AUDIO PATHS
// ============================================================
const VIVALDI_SPRING = '/lessons/film-music-project/lesson2/mp3/Classicals.de-Vivaldi-The-Four-Seasons-01-John-Harrison-with-the-Wichita-State-University-Chamber-Players-Spring-Mvt-1-Allegro.mp3';

// ============================================================
// QUESTIONS — Round 1
// Categories: dynamics, tempo, instruments, form
// Correct answers distributed: A=3, B=3, C=3, D=2
// ============================================================
const QUESTIONS = [
  {
    id: 'q1', category: 'dynamics',
    prompt: 'Listen! What dynamic level is this?',
    audio: { path: VIVALDI_SPRING, startTime: 0, endTime: 16, volume: 0.85 },
    answers: { A: 'Piano', B: 'Mezzo Forte', C: 'Forte', D: 'Fortissimo' },
    correct: 'C',
    explanation: 'That was forte — loud and strong, but not as extreme as fortissimo!'
  },
  {
    id: 'q2', category: 'dynamics',
    prompt: 'Listen! What dynamic level is this?',
    audio: { path: '/audio/classical/beethoven-moonlight-sonata-adagio.mp3', startTime: 4.5, endTime: 23.5, volume: 0.5 },
    answers: { A: 'Pianissimo', B: 'Piano', C: 'Mezzo Piano', D: 'Mezzo Forte' },
    correct: 'A',
    explanation: 'That was pianissimo — very soft! Even softer than piano.'
  },
  {
    id: 'q3', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/grieg-morning-mood.mp3', startTime: 0, endTime: 20, volume: 0.7 },
    answers: { A: 'Adagio', B: 'Andante', C: 'Allegro', D: 'Presto' },
    correct: 'B',
    explanation: 'That was Andante — walking speed! Adagio is slower, Allegro is faster.'
  },
  {
    id: 'q4', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/vivaldi-summer-presto-1.mp3', volume: 0.7 },
    answers: { A: 'Adagio', B: 'Allegro', C: 'Andante', D: 'Presto' },
    correct: 'D',
    explanation: 'That was Presto — very fast! Allegro is fast but Presto is even faster.'
  },
  {
    id: 'q5', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/beethoven-moonlight-sonata-adagio.mp3', startTime: 4.5, endTime: 23.5, volume: 0.7 },
    answers: { A: 'Adagio', B: 'Andante', C: 'Allegro', D: 'Presto' },
    correct: 'A',
    explanation: 'That was Adagio — slow and relaxed! Andante is a bit faster (walking speed).'
  },
  {
    id: 'q6', category: 'strings',
    prompt: 'Listen! What string instrument is this?',
    audio: { path: '/audio/orchestra-samples/strings/viola.mp3', volume: 0.8 },
    answers: { A: 'Violin', B: 'Viola', C: 'Cello', D: 'Double Bass' },
    correct: 'B',
    explanation: 'That was the viola! Slightly larger and deeper than the violin, but higher than the cello.'
  },
  {
    id: 'q7', category: 'woodwinds',
    prompt: 'Listen! What woodwind instrument is this?',
    audio: { path: '/audio/orchestra-samples/woodwinds/oboe.mp3', volume: 1.0 },
    answers: { A: 'Flute', B: 'Clarinet', C: 'Oboe', D: 'Bassoon' },
    correct: 'C',
    explanation: 'That was the oboe — nasal tone, uses a double reed, tunes the orchestra!'
  },
  {
    id: 'q8', category: 'brass',
    prompt: 'Listen! What brass instrument is this?',
    audio: { path: '/audio/orchestra-samples/brass/french-horn.mp3', volume: 1.0 },
    answers: { A: 'Trumpet', B: 'Trombone', C: 'Tuba', D: 'French Horn' },
    correct: 'D',
    explanation: 'That was the French horn — warm and mellow, with a huge coiled tube!'
  },
  {
    id: 'q9', category: 'percussion',
    prompt: 'Listen! What percussion instrument is this?',
    audio: { path: '/audio/orchestra-samples/percussion/timpani.mp3', volume: 1.0 },
    answers: { A: 'Snare Drum', B: 'Timpani', C: 'Xylophone', D: 'Bass Drum' },
    correct: 'B',
    explanation: 'Those were timpani — large copper drums that can play different pitches!'
  },
  {
    id: 'q10', category: 'form',
    prompt: 'What form is In the Hall of the Mountain King?',
    audio: null,
    answers: { A: 'Rondo (ABACADA)', B: 'Binary (AB)', C: 'Ternary (ABA)', D: 'Strophic (AAA)' },
    correct: 'C',
    explanation: 'Mountain King is ternary form (ABA) — the sneaky theme returns after the wild middle!'
  },
  {
    id: 'q11', category: 'dynamics',
    prompt: 'Listen! What\'s happening to the volume?',
    audio: { path: '/audio/classical/grieg-mountain-king.mp3', startTime: 0, endTime: 45, volume: 0.6 },
    answers: { A: 'Crescendo', B: 'Decrescendo', C: 'Staying at forte', D: 'Staying at piano' },
    correct: 'A',
    explanation: 'That was a crescendo — gradually getting louder! Mountain King builds from pp to ff.'
  }
];

// ============================================================
// QUESTIONS — Round 2 (different questions, different answers)
// Correct answers distributed: A=3, B=3, C=2, D=3
// ============================================================
const QUESTIONS_ROUND2 = [
  {
    id: 'r2-q1', category: 'dynamics',
    prompt: 'Listen! What dynamic level is this?',
    audio: { path: VIVALDI_SPRING, startTime: 0, endTime: 16, volume: 1.0 },
    answers: { A: 'Forte', B: 'Fortissimo', C: 'Mezzo Forte', D: 'Mezzo Piano' },
    correct: 'B',
    explanation: 'That was fortissimo — very loud! Even louder than forte.'
  },
  {
    id: 'r2-q2', category: 'dynamics',
    prompt: 'Listen! What dynamic level is this?',
    audio: { path: VIVALDI_SPRING, startTime: 36, endTime: 56, volume: 0.4 },
    answers: { A: 'Pianissimo', B: 'Piano', C: 'Mezzo Piano', D: 'Mezzo Forte' },
    correct: 'B',
    explanation: 'That was piano — soft! Pianissimo is even softer, and mezzo piano is medium-soft.'
  },
  {
    id: 'r2-q3', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: VIVALDI_SPRING, startTime: 0, endTime: 20, volume: 0.7 },
    answers: { A: 'Andante', B: 'Presto', C: 'Allegro', D: 'Adagio' },
    correct: 'C',
    explanation: 'That was Allegro — fast and lively! Not quite as fast as Presto.'
  },
  {
    id: 'r2-q4', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/grieg-mountain-king.mp3', startTime: 0, endTime: 24, volume: 0.6 },
    answers: { A: 'Andante', B: 'Adagio', C: 'Allegro', D: 'Presto' },
    correct: 'A',
    explanation: 'That was Andante — walking speed! The Mountain King starts slow before speeding up.'
  },
  {
    id: 'r2-q5', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/grieg-mountain-king.mp3', startTime: 130, endTime: 155, volume: 0.5 },
    answers: { A: 'Adagio', B: 'Andante', C: 'Allegro', D: 'Presto' },
    correct: 'D',
    explanation: 'That was Presto — the Mountain King ends in a wild frenzy!'
  },
  {
    id: 'r2-q6', category: 'strings',
    prompt: 'Listen! What string instrument is this?',
    audio: { path: '/audio/orchestra-samples/strings/cello.mp3', volume: 0.8 },
    answers: { A: 'Violin', B: 'Viola', C: 'Cello', D: 'Double Bass' },
    correct: 'C',
    explanation: 'That was the cello — warm and rich, played sitting down between your knees!'
  },
  {
    id: 'r2-q7', category: 'woodwinds',
    prompt: 'Listen! What woodwind instrument is this?',
    audio: { path: '/audio/orchestra-samples/woodwinds/clarinet.mp3', volume: 1.0 },
    answers: { A: 'Clarinet', B: 'Oboe', C: 'Bassoon', D: 'Flute' },
    correct: 'A',
    explanation: 'That was the clarinet — warm and versatile, uses a single reed!'
  },
  {
    id: 'r2-q8', category: 'brass',
    prompt: 'Listen! What brass instrument is this?',
    audio: { path: '/audio/orchestra-samples/brass/trombone.mp3', volume: 1.0 },
    answers: { A: 'Trumpet', B: 'French Horn', C: 'Tuba', D: 'Trombone' },
    correct: 'D',
    explanation: 'That was the trombone — uses a slide instead of valves to change pitch!'
  },
  {
    id: 'r2-q9', category: 'percussion',
    prompt: 'Listen! What percussion instrument is this?',
    audio: { path: '/audio/orchestra-samples/percussion/xylophone.mp3', volume: 1.0 },
    answers: { A: 'Xylophone', B: 'Timpani', C: 'Snare Drum', D: 'Glockenspiel' },
    correct: 'A',
    explanation: 'That was the xylophone — you strike wooden bars with mallets!'
  },
  {
    id: 'r2-q10', category: 'form',
    prompt: 'A piece that goes A-B-A-C-A-D-A is what form?',
    audio: null,
    answers: { A: 'Binary', B: 'Ternary', C: 'Strophic', D: 'Rondo' },
    correct: 'D',
    explanation: 'ABACADA is rondo form — the A section keeps coming back between new sections!'
  },
  {
    id: 'r2-q11', category: 'dynamics',
    prompt: 'Listen! What\'s happening to the volume?',
    audio: { path: VIVALDI_SPRING, startTime: 15, endTime: 45, volume: 0.7 },
    answers: { A: 'Crescendo', B: 'Decrescendo', C: 'Staying at forte', D: 'Staying at piano' },
    correct: 'B',
    explanation: 'That was a decrescendo — gradually getting softer!'
  }
];

const ALL_ROUNDS = [QUESTIONS, QUESTIONS_ROUND2];

// Answer corners — A/B/C/D with colors
const CORNERS = {
  A: { label: 'A', color: '#3B82F6', bgClass: 'from-blue-600 to-blue-800' },
  B: { label: 'B', color: '#EF4444', bgClass: 'from-red-600 to-red-800' },
  C: { label: 'C', color: '#10B981', bgClass: 'from-emerald-600 to-emerald-800' },
  D: { label: 'D', color: '#F59E0B', bgClass: 'from-amber-600 to-amber-800' }
};

// Scoring
const SCORING = {
  CORRECT: 100,
  SPEED_BONUS_MAX: 50,
  SPEED_BONUS_WINDOW: 5000
};

const calculateSpeedBonus = (answerTime, startedAt) => {
  if (!answerTime || !startedAt) return 0;
  const elapsed = answerTime - startedAt;
  if (elapsed <= 0 || elapsed > SCORING.SPEED_BONUS_WINDOW) return 0;
  const ratio = 1 - (elapsed / SCORING.SPEED_BONUS_WINDOW);
  return Math.round(SCORING.SPEED_BONUS_MAX * ratio);
};

// Student Activity Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#059669', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const NameThatElementTeacherGame = ({ sessionData, onComplete }) => {
  const { sessionCode: contextSessionCode, classId } = useSession();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = contextSessionCode || sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/nameThatElement`;
    if (sessionCode) return `sessions/${sessionCode}/nameThatElement`;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Audio
  const audioRef = useRef(null);
  const stopTimerRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // Reveal state
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreChanges, setScoreChanges] = useState({});

  // Answer counts per corner
  const [answerCounts, setAnswerCounts] = useState({ A: 0, B: 0, C: 0, D: 0 });

  // Current question
  const questions = ALL_ROUNDS[currentRound] || [];
  const currentQuestion = questions[currentQuestionIndex] || null;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      if (audioRef.current) {
        audioRef.current.onplay = null;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play audio with optional time range
  const playAudio = useCallback(() => {
    if (!currentQuestion?.audio) return;

    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (audioRef.current) {
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(currentQuestion.audio.path);
    audio.volume = Math.min(currentQuestion.audio.volume || 1.0, 1.0);
    audioRef.current = audio;

    const hasTimeRange = currentQuestion.audio.startTime !== undefined && currentQuestion.audio.endTime !== undefined;

    audio.addEventListener('canplaythrough', () => {
      if (hasTimeRange) {
        audio.currentTime = currentQuestion.audio.startTime;
      }
      audio.play().then(() => {
        setIsAudioPlaying(true);
        if (hasTimeRange) {
          const duration = (currentQuestion.audio.endTime - currentQuestion.audio.startTime) * 1000;
          stopTimerRef.current = setTimeout(() => {
            audio.pause();
            setIsAudioPlaying(false);
            setHasPlayedOnce(true);
          }, duration);
        }
      }).catch(() => setIsAudioPlaying(false));
    }, { once: true });

    audio.addEventListener('ended', () => { setIsAudioPlaying(false); setHasPlayedOnce(true); });
    audio.addEventListener('error', () => setIsAudioPlaying(false));
    audio.load();
  }, [currentQuestion]);

  const stopAudio = useCallback(() => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (audioRef.current) {
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsAudioPlaying(false);
  }, []);

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!gamePath) return;
    const db = getDatabase();
    update(ref(db, gamePath), data);
  }, [gamePath]);

  // Firebase: Subscribe to students
  useEffect(() => {
    if (!studentsPath) return;
    const db = getDatabase();
    const studentsRef = ref(db, studentsPath);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const rawList = Object.entries(data)
        .map(([id, s]) => ({
          id,
          name: formatFirstNameLastInitial(s.displayName || s.playerName || s.name),
          score: s.nteScore || 0,
          answer: s.nteAnswer,
          answerTime: s.nteAnswerTime,
          playerColor: s.playerColor || '#3B82F6',
          playerEmoji: s.playerEmoji || '🎵'
        }));
      // Deduplicate entries with the same display name (e.g. student reconnected
      // with a new UID). Keep the entry with the highest score, or if tied, the
      // one that answered (most recent activity).
      const byName = new Map();
      rawList.forEach(s => {
        const existing = byName.get(s.name);
        if (!existing || s.score > existing.score || (s.score === existing.score && s.answer && !existing.answer)) {
          byName.set(s.name, s);
        }
      });
      const list = [...byName.values()];

      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));

      const counts = { A: 0, B: 0, C: 0, D: 0 };
      list.forEach(s => {
        if (s.answer && counts[s.answer] !== undefined) {
          counts[s.answer]++;
        }
      });
      setAnswerCounts(counts);
    });

    return () => unsubscribe();
  }, [studentsPath]);

  // Start game
  const startGame = useCallback((round = 0) => {
    setCurrentRound(round);
    setCurrentQuestionIndex(0);
    setGamePhase('question');
    setScoreChanges({});
    setCorrectCount(0);
    setHasPlayedOnce(false);

    const now = Date.now();
    setQuestionStartTime(now);

    // Reset student answers and scores
    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsPath}/${s.id}`), {
          nteAnswer: null,
          nteAnswerTime: null,
          nteScore: round === 0 ? 0 : (s.score || 0)
        }).catch(err => console.error(`Failed to reset student ${s.id}:`, err));
      });
    }

    const firstQ = ALL_ROUNDS[round][0];
    updateGame({
      phase: 'question',
      currentRound: round,
      currentQuestion: 0,
      questionData: {
        id: firstQ.id,
        prompt: firstQ.prompt,
        answers: firstQ.answers,
        hasAudio: !!firstQ.audio
      },
      revealedAnswer: null,
      startedAt: now
    });
  }, [studentsPath, students, updateGame]);

  // Reveal answer
  const reveal = useCallback(() => {
    if (!currentQuestion) return;
    stopAudio();

    const changes = {};
    let correct = 0;

    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        if (s.answer) {
          const isCorrect = s.answer === currentQuestion.correct;
          if (isCorrect) {
            correct++;
            const speedBonus = calculateSpeedBonus(s.answerTime, questionStartTime);
            const points = SCORING.CORRECT + speedBonus;
            const newScore = (s.score || 0) + points;
            changes[s.id] = { isCorrect: true, points, speedBonus };
            update(ref(db, `${studentsPath}/${s.id}`), { nteScore: newScore })
              .catch(err => console.error(`Failed to update score for ${s.id}:`, err));
          } else {
            changes[s.id] = { isCorrect: false, points: 0 };
          }
        } else {
          changes[s.id] = { isCorrect: false, noAnswer: true, points: 0 };
        }
      });
    }

    setScoreChanges(changes);
    setCorrectCount(correct);
    setGamePhase('revealed');

    updateGame({
      phase: 'revealed',
      revealedAnswer: currentQuestion.correct
    });
  }, [currentQuestion, students, studentsPath, questionStartTime, stopAudio, updateGame]);

  // Next question
  const nextQuestion = useCallback(() => {
    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsPath}/${s.id}`), {
          nteAnswer: null,
          nteAnswerTime: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx >= questions.length) {
      setGamePhase('finished');
      updateGame({ phase: 'finished', revealedAnswer: null });
    } else {
      const now = Date.now();
      setCurrentQuestionIndex(nextIdx);
      setGamePhase('question');
      setScoreChanges({});
      setCorrectCount(0);
      setQuestionStartTime(now);
      setHasPlayedOnce(false);

      const nextQ = questions[nextIdx];
      updateGame({
        phase: 'question',
        currentQuestion: nextIdx,
        questionData: {
          id: nextQ.id,
          prompt: nextQ.prompt,
          answers: nextQ.answers,
          hasAudio: !!nextQ.audio
        },
        revealedAnswer: null,
        startedAt: now
      });
    }
  }, [studentsPath, students, currentQuestionIndex, questions, updateGame]);

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 text-white overflow-hidden">
      <ActivityBanner />

      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎯</span>
            <h1 className="text-4xl font-bold">Name That Element</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Round {currentRound + 1} &middot; Q{currentQuestionIndex + 1}/{questions.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        {gamePhase !== 'setup' && gamePhase !== 'finished' && (
          <div className="flex gap-1 mb-3 flex-shrink-0">
            {questions.map((_, idx) => {
              const isComplete = idx < currentQuestionIndex || (idx === currentQuestionIndex && gamePhase === 'revealed');
              const isCurrent = idx === currentQuestionIndex && gamePhase === 'question';
              return (
                <div
                  key={idx}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-white scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: isComplete ? '#10B981' : isCurrent ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                    opacity: isComplete ? 1 : isCurrent ? 0.7 : 0.3
                  }}
                >
                  {isComplete ? '✓' : idx + 1}
                </div>
              );
            })}
          </div>
        )}

        {/* Main content grid */}
        <div className={`grid ${gamePhase !== 'setup' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
          <div className={`${gamePhase !== 'setup' ? 'col-span-2' : ''} bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0`}>

            {/* ==================== SETUP ==================== */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-7xl mb-3">🎯</div>
                <h2 className="text-4xl font-bold mb-2">Name That Element</h2>
                <p className="text-xl text-white/70 mb-4">Dynamics, Tempo, Instruments, and Form — how much do you remember?</p>

                <div className="flex gap-4 justify-center mb-4">
                  {Object.entries(CORNERS).map(([key, corner]) => (
                    <div
                      key={key}
                      className="px-8 py-4 rounded-2xl text-center"
                      style={{ backgroundColor: corner.color }}
                    >
                      <div className="text-4xl font-black text-white">{key}</div>
                    </div>
                  ))}
                </div>

                <p className="text-lg text-white/50 mb-5">{QUESTIONS.length} questions &middot; Pick A, B, C, or D &middot; Speed bonus for fast answers!</p>

                <button
                  onClick={() => startGame(0)}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={32} /> Start Game
                </button>
              </div>
            )}

            {/* ==================== QUESTION ==================== */}
            {gamePhase === 'question' && currentQuestion && (
              <div className="text-center">
                {/* Question prompt */}
                <div className="text-5xl font-black mb-2">
                  <Volume2 size={48} className="inline mr-3" />
                  {currentQuestion.audio ? 'LISTEN!' : 'THINK!'}
                </div>
                <p className="text-2xl text-teal-200 mb-4">Q{currentQuestionIndex + 1} — {currentQuestion.prompt}</p>

                {/* Answer options — single horizontal row */}
                {(() => {
                  const answerKeys = Object.keys(currentQuestion.answers);
                  return (
                    <div className={`grid grid-cols-${answerKeys.length} gap-3 max-w-3xl mx-auto mb-4`} style={{ gridTemplateColumns: `repeat(${answerKeys.length}, minmax(0, 1fr))` }}>
                      {answerKeys.map(key => {
                        const corner = CORNERS[key];
                        const count = answerCounts[key] || 0;
                        return (
                          <div
                            key={key}
                            className="p-3 rounded-xl text-center"
                            style={{ backgroundColor: `${corner.color}40`, borderColor: corner.color, borderWidth: '2px' }}
                          >
                            <div className="text-2xl font-black mb-1" style={{ color: corner.color }}>{key}</div>
                            <div className="text-lg font-bold text-white">{currentQuestion.answers[key]}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Answer count */}
                <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-4">
                  <span className="text-4xl font-black text-green-400">{lockedCount}</span>
                  <span className="text-xl text-white/70"> / {students.length} answered</span>
                </div>

                {/* Controls — big buttons like Tempo Detective */}
                <div className="flex gap-4 justify-center">
                  {currentQuestion.audio ? (
                    <>
                      {isAudioPlaying ? (
                        <button
                          onClick={stopAudio}
                          className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:scale-105 transition-all"
                        >
                          <Pause size={24} /> Stop
                        </button>
                      ) : (
                        <button
                          onClick={playAudio}
                          className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 transition-all"
                        >
                          <Play size={24} /> {hasPlayedOnce ? 'Replay Clip' : 'Play Clip'}
                        </button>
                      )}
                      {hasPlayedOnce && (
                        <button
                          onClick={reveal}
                          disabled={isAudioPlaying}
                          className={`px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 transition-all ${
                            isAudioPlaying
                              ? 'opacity-40 cursor-not-allowed scale-95'
                              : 'hover:scale-105 active:scale-95'
                          }`}
                        >
                          <Eye size={28} /> Reveal Answer
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={reveal}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                    >
                      <Eye size={28} /> Reveal Answer
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ==================== REVEALED ==================== */}
            {gamePhase === 'revealed' && currentQuestion && (
              <div className="text-center">
                <div className="text-3xl text-white/80 mb-4">The answer is...</div>

                {/* Correct answer card */}
                <div
                  className="rounded-3xl p-8 mb-4 max-w-md mx-auto"
                  style={{ backgroundColor: CORNERS[currentQuestion.correct].color }}
                >
                  <div className="text-5xl font-black text-white mb-2">{currentQuestion.correct}</div>
                  <div className="text-3xl font-bold text-white mb-2">{currentQuestion.answers[currentQuestion.correct]}</div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={24} className="text-white/90" />
                    <div className="text-lg text-white/90">{currentQuestion.explanation}</div>
                  </div>
                </div>

                {/* Vote breakdown */}
                <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto mb-4">
                  {Object.entries(CORNERS).map(([key, corner]) => {
                    const count = answerCounts[key] || 0;
                    const isCorrect = key === currentQuestion.correct;
                    return (
                      <div
                        key={key}
                        className={`rounded-xl p-3 text-center relative ${
                          isCorrect ? 'ring-4 ring-green-400' : 'opacity-50'
                        }`}
                        style={{ backgroundColor: `${corner.color}40` }}
                      >
                        {isCorrect && (
                          <CheckCircle size={24} className="text-green-400 absolute -top-2 -right-2" />
                        )}
                        <div className="text-lg font-bold">{key}: {currentQuestion.answers[key]}</div>
                        <div className="text-2xl font-black">{count}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xl text-white/70 mb-6">
                  {correctCount} of {students.length} got it right!
                  {correctCount > 0 && students.length > 0 && (
                    <span className="ml-2 text-green-400">
                      ({Math.round((correctCount / students.length) * 100)}%)
                    </span>
                  )}
                </div>

                <button
                  onClick={nextQuestion}
                  className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                >
                  {currentQuestionIndex >= questions.length - 1 ? (
                    <><Trophy size={28} /> See Final Results</>
                  ) : (
                    <>Next Question <ChevronRight size={28} /></>
                  )}
                </button>
              </div>
            )}

            {/* ==================== FINISHED ==================== */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <div className="text-9xl mb-4">🏆</div>
                <h2 className="text-5xl font-black mb-2">Round {currentRound + 1} Complete!</h2>
                <p className="text-2xl text-white/70 mb-6">Great job everyone!</p>

                {leaderboard.length > 0 && (
                  <div className="max-w-lg mx-auto mb-6">
                    {leaderboard.slice(0, 5).map((student, idx) => (
                      <div
                        key={student.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl mb-2 ${
                          idx === 0 ? 'bg-yellow-500/30 ring-2 ring-yellow-400' :
                          idx === 1 ? 'bg-gray-300/20' :
                          idx === 2 ? 'bg-amber-700/20' :
                          'bg-white/5'
                        }`}
                      >
                        <span className="w-12 text-center font-bold text-3xl">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </span>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                          style={{ backgroundColor: student.playerColor }}
                        >
                          {student.playerEmoji || student.name.charAt(0)}
                        </div>
                        <span className="flex-1 text-2xl font-medium text-left truncate">{student.name}</span>
                        <span className="text-3xl font-black">{student.score}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  {currentRound < ALL_ROUNDS.length - 1 ? (
                    <button
                      onClick={() => startGame(currentRound + 1)}
                      className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3"
                    >
                      <Play size={28} /> Play Round {currentRound + 2}
                    </button>
                  ) : (
                    <button
                      onClick={() => startGame(0)}
                      className="px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3"
                    >
                      <Play size={28} /> Replay from Round 1
                    </button>
                  )}
                  <button
                    onClick={() => onComplete?.()}
                    className="px-10 py-5 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3"
                  >
                    <Trophy size={28} /> Continue
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ==================== LEADERBOARD SIDEBAR ==================== */}
          {gamePhase !== 'setup' && (
            <div className="bg-black/20 rounded-2xl p-4 flex flex-col min-h-0">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="text-yellow-400" size={32} />
                <h2 className="text-2xl font-bold">Leaderboard</h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {leaderboard.map((student, idx) => {
                  const change = scoreChanges[student.id];
                  const isRevealing = gamePhase === 'revealed';
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        idx === 0 ? 'bg-yellow-500/20' : 'bg-white/5'
                      } ${isRevealing && change?.isCorrect ? 'ring-2 ring-green-400' : ''}`}
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
                      {gamePhase === 'question' && student.answer && (
                        <span className="text-green-400 text-sm">✓</span>
                      )}
                      <span className="font-bold text-xl">{student.score}</span>
                      {isRevealing && change?.isCorrect && (
                        <span className="text-sm font-bold text-green-400">+{change.points}</span>
                      )}
                      {isRevealing && change && !change.isCorrect && !change.noAnswer && (
                        <XCircle size={18} className="text-red-400/60" />
                      )}
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

export default NameThatElementTeacherGame;
