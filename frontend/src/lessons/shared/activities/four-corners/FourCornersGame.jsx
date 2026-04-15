// File: FourCornersGame.jsx
// Four Corners - Teacher Presentation View (Bonus Class Game)
// Physical classroom game: teacher shows question, students move to a corner
// Screen shows 4 colored quadrants matching room corners
// 12 AUDIO-BASED review questions: dynamics, tempo, woodwinds, brass
//
// PHASES:
// 1. Setup - Show "Start Game"
// 2. Question - Audio plays, students move to corners, tap answer on device
// 3. Revealed - Show correct corner
// 4. Finished - Final leaderboard

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Eye, ChevronRight, CheckCircle, Volume2, RotateCcw } from 'lucide-react';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';

// ============================================================
// AUDIO PATHS
// ============================================================
const VIVALDI_SPRING = '/lessons/film-music-project/lesson2/mp3/Classicals.de-Vivaldi-The-Four-Seasons-01-John-Harrison-with-the-Wichita-State-University-Chamber-Players-Spring-Mvt-1-Allegro.mp3';

// ============================================================
// QUESTIONS DATA — 12 questions
// Categories: dynamics, tempo, instruments (strings/woodwinds/brass), form
// No definitions in answers — students should know the terms by Lesson 3
// Audio for instruments extracted from the showcase videos they already heard
// Correct answers distributed evenly: A=3, B=3, C=3, D=3
// ============================================================
const QUESTIONS = [
  // --- Q1: Dynamics — Forte (close distractors: all medium-to-loud markings) ---
  {
    id: 'q1', category: 'dynamics',
    prompt: 'Listen! What dynamic level is this?',
    audio: { path: VIVALDI_SPRING, startTime: 0, endTime: 8, volume: 0.85 },
    answers: { A: 'Mezzo Piano', B: 'Mezzo Forte', C: 'Forte', D: 'Fortissimo' },
    correct: 'C',
    explanation: 'That was forte — loud and strong, but not as extreme as fortissimo!'
  },
  // --- Q2: Dynamics — Piano (close distractors: all soft-to-medium markings) ---
  {
    id: 'q2', category: 'dynamics',
    prompt: 'Listen! What dynamic level is this?',
    audio: { path: VIVALDI_SPRING, startTime: 36, endTime: 46, volume: 0.4 },
    answers: { A: 'Pianissimo', B: 'Piano', C: 'Mezzo Piano', D: 'Mezzo Forte' },
    correct: 'B',
    explanation: 'That was piano — soft! Pianissimo is even softer, and mezzo piano is medium-soft.'
  },
  // --- Q3: Tempo — Andante (close distractors: all tempo markings) ---
  {
    id: 'q3', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/grieg-morning-mood.mp3', startTime: 0, endTime: 10, volume: 0.7 },
    answers: { A: 'Adagio', B: 'Andante', C: 'Allegro', D: 'Presto' },
    correct: 'B',
    explanation: 'That was Andante — walking speed! Adagio is slower, Allegro is faster.'
  },
  // --- Q4: Tempo — Presto (close distractors: all tempo markings) ---
  {
    id: 'q4', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/vivaldi-summer-presto-1.mp3', volume: 0.7 },
    answers: { A: 'Adagio', B: 'Allegro', C: 'Andante', D: 'Presto' },
    correct: 'D',
    explanation: 'That was Presto — very fast! Allegro is fast but Presto is even faster.'
  },
  // --- Q5: Strings — Cello (all string distractors) ---
  {
    id: 'q5', category: 'strings',
    prompt: 'Listen! What string instrument is this?',
    audio: { path: '/audio/orchestra-samples/strings/cello.mp3', volume: 0.7 },
    answers: { A: 'Violin', B: 'Viola', C: 'Cello', D: 'Double Bass' },
    correct: 'C',
    explanation: 'That was the cello! The viola is higher, the double bass is lower. All four are in the string family.'
  },
  // --- Q6: Woodwinds — Bassoon (all woodwind distractors) ---
  {
    id: 'q6', category: 'woodwinds',
    prompt: 'Listen! What woodwind instrument is this?',
    audio: { path: '/audio/orchestra-samples/woodwinds/bassoon.mp3', volume: 1.0 },
    answers: { A: 'Clarinet', B: 'Bassoon', C: 'Oboe', D: 'Flute' },
    correct: 'B',
    explanation: 'That was the bassoon — the deepest woodwind! The clarinet and oboe are higher.'
  },
  // --- Q7: Woodwinds — Flute (all woodwind distractors) ---
  {
    id: 'q7', category: 'woodwinds',
    prompt: 'Listen! What woodwind instrument is this?',
    audio: { path: '/audio/orchestra-samples/woodwinds/flute.mp3', volume: 1.0 },
    answers: { A: 'Oboe', B: 'Clarinet', C: 'Bassoon', D: 'Flute' },
    correct: 'D',
    explanation: 'That was the flute — bright and airy! The oboe has a nasal, reedy sound. The clarinet is warmer and darker.'
  },
  // --- Q8: Brass — Tuba (all brass distractors) ---
  {
    id: 'q8', category: 'brass',
    prompt: 'Listen! What brass instrument is this?',
    audio: { path: '/audio/orchestra-samples/brass/tuba.mp3', volume: 1.0 },
    answers: { A: 'Trombone', B: 'French Horn', C: 'Trumpet', D: 'Tuba' },
    correct: 'D',
    explanation: 'That was the tuba — the lowest and deepest brass instrument!'
  },
  // --- Q9: Brass — Trumpet (all brass distractors) ---
  {
    id: 'q9', category: 'brass',
    prompt: 'Listen! What brass instrument is this?',
    audio: { path: '/audio/orchestra-samples/brass/trumpet.mp3', volume: 1.0 },
    answers: { A: 'French Horn', B: 'Trumpet', C: 'Trombone', D: 'Tuba' },
    correct: 'B',
    explanation: 'That was the trumpet — the brightest brass instrument! The French horn is mellower, the trombone is lower.'
  },
  // --- Q10: Form — Ternary (In the Hall of the Mountain King) ---
  {
    id: 'q10', category: 'form',
    prompt: 'What form is In the Hall of the Mountain King?',
    audio: null,
    answers: { A: 'Rondo', B: 'Binary', C: 'Ternary', D: 'Strophic' },
    correct: 'C',
    explanation: 'In the Hall of the Mountain King is ternary form (ABA) — the soft sneaking theme returns after the wild middle section!'
  },
  // --- Q11: Tempo — Adagio (close distractors: all tempo markings) ---
  {
    id: 'q11', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/beethoven-moonlight-sonata-adagio.mp3', startTime: 4.5, endTime: 14, volume: 0.7 },
    answers: { A: 'Adagio', B: 'Andante', C: 'Allegro', D: 'Presto' },
    correct: 'A',
    explanation: 'That was Adagio — slow and relaxed! Andante is a bit faster (walking speed).'
  }
];

// Round 2: Same categories, different correct answers and audio clips
const QUESTIONS_ROUND2 = [
  // --- Dynamics — Fortissimo ---
  {
    id: 'r2-q1', category: 'dynamics',
    prompt: 'Listen! What dynamic level is this?',
    audio: { path: VIVALDI_SPRING, startTime: 0, endTime: 8, volume: 1.0 },
    answers: { A: 'Forte', B: 'Fortissimo', C: 'Mezzo Forte', D: 'Mezzo Piano' },
    correct: 'B',
    explanation: 'That was fortissimo — very loud! Even louder than forte.'
  },
  // --- Dynamics — Mezzo Forte ---
  {
    id: 'r2-q2', category: 'dynamics',
    prompt: 'Listen! What dynamic level is this?',
    audio: { path: VIVALDI_SPRING, startTime: 20, endTime: 30, volume: 0.6 },
    answers: { A: 'Piano', B: 'Pianissimo', C: 'Mezzo Forte', D: 'Forte' },
    correct: 'C',
    explanation: 'That was mezzo forte — medium loud! Not as strong as forte, not as soft as piano.'
  },
  // --- Tempo — Allegro ---
  {
    id: 'r2-q3', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: VIVALDI_SPRING, startTime: 0, endTime: 10, volume: 0.7 },
    answers: { A: 'Andante', B: 'Presto', C: 'Allegro', D: 'Adagio' },
    correct: 'C',
    explanation: 'That was Allegro — fast and lively! Not quite as fast as Presto.'
  },
  // --- Tempo — Largo ---
  {
    id: 'r2-q4', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/handel-xerxes-largo-showcase.mp3', startTime: 0, endTime: 10, volume: 0.7 },
    answers: { A: 'Largo', B: 'Adagio', C: 'Andante', D: 'Allegro' },
    correct: 'A',
    explanation: 'That was Largo — very slow! Even slower than Adagio.'
  },
  // --- Strings — Violin ---
  {
    id: 'r2-q5', category: 'strings',
    prompt: 'Listen! What string instrument is this?',
    audio: { path: '/audio/orchestra-samples/strings/violin.mp3', volume: 0.7 },
    answers: { A: 'Violin', B: 'Viola', C: 'Cello', D: 'Double Bass' },
    correct: 'A',
    explanation: 'That was the violin — the highest and brightest string instrument!'
  },
  // --- Woodwinds — Clarinet ---
  {
    id: 'r2-q6', category: 'woodwinds',
    prompt: 'Listen! What woodwind instrument is this?',
    audio: { path: '/audio/orchestra-samples/woodwinds/clarinet.mp3', volume: 1.0 },
    answers: { A: 'Flute', B: 'Oboe', C: 'Clarinet', D: 'Bassoon' },
    correct: 'C',
    explanation: 'That was the clarinet — warm and smooth with a wide range!'
  },
  // --- Woodwinds — Oboe ---
  {
    id: 'r2-q7', category: 'woodwinds',
    prompt: 'Listen! What woodwind instrument is this?',
    audio: { path: '/audio/orchestra-samples/woodwinds/oboe.mp3', volume: 1.0 },
    answers: { A: 'Oboe', B: 'Flute', C: 'Clarinet', D: 'Bassoon' },
    correct: 'A',
    explanation: 'That was the oboe — nasal and reedy! The orchestra tunes to the oboe.'
  },
  // --- Brass — French Horn ---
  {
    id: 'r2-q8', category: 'brass',
    prompt: 'Listen! What brass instrument is this?',
    audio: { path: '/audio/orchestra-samples/brass/french-horn.mp3', volume: 1.0 },
    answers: { A: 'Trumpet', B: 'Trombone', C: 'Tuba', D: 'French Horn' },
    correct: 'D',
    explanation: 'That was the French horn — warm and mellow! It has a big bell that faces backward.'
  },
  // --- Brass — Trombone ---
  {
    id: 'r2-q9', category: 'brass',
    prompt: 'Listen! What brass instrument is this?',
    audio: { path: '/audio/orchestra-samples/brass/trombone.mp3', volume: 1.0 },
    answers: { A: 'Tuba', B: 'French Horn', C: 'Trombone', D: 'Trumpet' },
    correct: 'C',
    explanation: 'That was the trombone — it uses a slide instead of valves!'
  },
  // --- Form — Mountain King again ---
  {
    id: 'r2-q10', category: 'form',
    prompt: 'In the Hall of the Mountain King has an A section, then B, then A again. What is this called?',
    audio: null,
    answers: { A: 'Binary', B: 'Strophic', C: 'Through-composed', D: 'Ternary' },
    correct: 'D',
    explanation: 'ABA = ternary form! The A section returns at the end.'
  },
  // --- Tempo — Andante (different audio) ---
  {
    id: 'r2-q11', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/grieg-morning-mood.mp3', startTime: 10, endTime: 20, volume: 0.7 },
    answers: { A: 'Presto', B: 'Largo', C: 'Andante', D: 'Allegro' },
    correct: 'C',
    explanation: 'That was Andante — walking speed! Like a comfortable stroll.'
  }
];

const ALL_ROUNDS = [QUESTIONS, QUESTIONS_ROUND2];

// Corner definitions matching physical room layout
const CORNERS = {
  A: { label: 'Front Left', color: '#3B82F6', bgClass: 'from-blue-600 to-blue-800', position: 'top-left' },
  B: { label: 'Front Right', color: '#EF4444', bgClass: 'from-red-600 to-red-800', position: 'top-right' },
  C: { label: 'Back Left', color: '#10B981', bgClass: 'from-emerald-600 to-emerald-800', position: 'bottom-left' },
  D: { label: 'Back Right', color: '#F59E0B', bgClass: 'from-yellow-500 to-amber-600', position: 'bottom-right' }
};

const CATEGORY_EMOJI = {
  dynamics: '\uD83D\uDCE2',
  tempo: '\u23F1\uFE0F',
  strings: '\uD83C\uDFBB',
  woodwinds: '\uD83C\uDFB5',
  brass: '\uD83C\uDFBA',
  form: '\uD83C\uDFDB\uFE0F'
};

// Student Activity Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#7C3AED', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const FourCornersGame = ({ sessionData, onComplete }) => {
  const { sessionCode: contextSessionCode, classId } = useSession();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = contextSessionCode || sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  // Compute Firebase paths based on session type
  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/fourCorners`;
    if (sessionCode) return `sessions/${sessionCode}/fourCorners`;
    return null;
  }, [classId, sessionCode]);

  const studentsPath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);

  // Reveal state
  const [correctCount, setCorrectCount] = useState(0);

  // Live answer counts per corner
  const [cornerCounts, setCornerCounts] = useState({ A: 0, B: 0, C: 0, D: 0 });

  // Audio state
  const audioRef = useRef(null);
  const stopTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentQuestions = ALL_ROUNDS[currentRound] || QUESTIONS;
  const currentQuestion = currentQuestions[currentQuestionIndex] || null;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
      }
    };
  }, []);

  // Play audio for a question
  const playAudio = useCallback((question) => {
    if (!question?.audio) return;

    // Stop any existing playback
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    const audio = new Audio(question.audio.path);
    audio.volume = Math.min(question.audio.volume || 1.0, 1.0);
    audioRef.current = audio;

    const hasTimeRange = question.audio.startTime !== undefined && question.audio.endTime !== undefined;

    audio.addEventListener('canplaythrough', () => {
      if (hasTimeRange) {
        audio.currentTime = question.audio.startTime;
      }
      audio.play().then(() => {
        setIsPlaying(true);

        if (hasTimeRange) {
          const duration = (question.audio.endTime - question.audio.startTime) * 1000;
          stopTimerRef.current = setTimeout(() => {
            audio.pause();
            setIsPlaying(false);
          }, duration);
        }
      }).catch(() => setIsPlaying(false));
    }, { once: true });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    audio.load();
  }, []);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    setIsPlaying(false);
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
      const list = Object.entries(data)
        .filter(([, s]) => s.playerName || s.displayName)
        .map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName,
        answer: s.fcAnswer,
      }));

      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);

      // Count answers per corner
      const counts = { A: 0, B: 0, C: 0, D: 0 };
      list.forEach(s => {
        if (s.answer && Object.prototype.hasOwnProperty.call(counts, s.answer)) {
          counts[s.answer]++;
        }
      });
      setCornerCounts(counts);
    });

    return () => unsubscribe();
  }, [studentsPath]);

  // Start game
  const startGame = useCallback(async (round = currentRound) => {
    const questions = ALL_ROUNDS[round] || QUESTIONS;
    setCurrentQuestionIndex(0);
    setGamePhase('question');
    setCorrectCount(0);

    // Reset ALL students (including ghosts from previous sessions)
    if (studentsPath) {
      const db = getDatabase();
      try {
        const snap = await get(ref(db, studentsPath));
        if (snap.exists()) {
          const allStudents = snap.val();
          const updates = {};
          Object.keys(allStudents).forEach(id => {
            updates[`${id}/fcAnswer`] = null;
          });
          await update(ref(db, studentsPath), updates);
        }
      } catch (err) {
        console.error('❌ Failed to reset all students:', err);
      }
    }

    const firstQ = questions[0];
    updateGame({
      phase: 'question',
      currentQuestion: 0,
      questionData: {
        prompt: firstQ.prompt,
        answers: firstQ.answers,
        id: firstQ.id
      },
      revealedAnswer: null,
    });

    // Play audio for the first question
    playAudio(firstQ);
  }, [currentRound, studentsPath, students, updateGame, playAudio]);

  // Reveal answer
  const reveal = useCallback(() => {
    if (!currentQuestion) return;

    // Stop audio
    stopAudio();

    let correct = 0;
    students.forEach(s => {
      if (s.answer === currentQuestion.correct) correct++;
    });

    setCorrectCount(correct);
    setGamePhase('revealed');

    updateGame({
      phase: 'revealed',
      revealedAnswer: currentQuestion.correct
    });
  }, [currentQuestion, students, updateGame, stopAudio]);

  // Next question
  const nextQuestion = useCallback(() => {
    // Stop audio
    stopAudio();

    // Clear student answers
    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsPath}/${s.id}`), {
          fcAnswer: null,
        }).catch(() => {});
      });
    }

    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx >= currentQuestions.length) {
      setGamePhase('finished');
      updateGame({ phase: 'finished', revealedAnswer: null });
    } else {
      setCurrentQuestionIndex(nextIdx);
      setGamePhase('question');
      setCorrectCount(0);

      const nextQ = currentQuestions[nextIdx];
      updateGame({
        phase: 'question',
        currentQuestion: nextIdx,
        questionData: {
          prompt: nextQ.prompt,
          answers: nextQ.answers,
          id: nextQ.id
        },
        revealedAnswer: null,
      });

      // Play audio for next question
      playAudio(nextQ);
    }
  }, [studentsPath, students, currentQuestionIndex, updateGame, stopAudio, playAudio]);

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      <ActivityBanner />

      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{'\uD83D\uDDFA\uFE0F'}</span>
            <h1 className="text-4xl font-bold">Four Corners</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Q{currentQuestionIndex + 1}/{currentQuestions.length}
                {currentQuestion && (
                  <span className="ml-2 opacity-70">{CATEGORY_EMOJI[currentQuestion.category]}</span>
                )}
              </span>
            )}
          </div>
          {currentRound > 0 && (
            <span className="bg-white/10 px-4 py-2 rounded-full text-xl">Round {currentRound + 1}</span>
          )}
        </div>

        {/* Progress bar */}
        {gamePhase !== 'setup' && gamePhase !== 'finished' && (
          <div className="flex gap-1 mb-3 flex-shrink-0">
            {currentQuestions.map((q, idx) => {
              const isComplete = idx < currentQuestionIndex || (idx === currentQuestionIndex && gamePhase === 'revealed');
              const isCurrent = idx === currentQuestionIndex && gamePhase === 'question';
              return (
                <div
                  key={q.id}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-white scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: isComplete ? CORNERS[q.correct].color : 'rgba(255,255,255,0.1)',
                    opacity: isComplete ? 1 : isCurrent ? 0.7 : 0.3
                  }}
                >
                  {isComplete ? '\u2713' : idx + 1}
                </div>
              );
            })}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-h-0">
          <div className="bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0 h-full">

            {/* ==================== SETUP ==================== */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-9xl mb-6">{'\uD83D\uDDFA\uFE0F'}</div>
                <h2 className="text-5xl font-bold mb-4">Four Corners</h2>
                <p className="text-2xl text-white/70 mb-2">Listen to the sound, then move to the corner with the right answer!</p>
                <p className="text-xl text-white/50 mb-6">Each question plays a sound clip</p>

                <p className="text-xl text-white/50 mb-8">12 questions &middot; Dynamics, Tempo, Instruments & Form</p>

                <button
                  onClick={startGame}
                  className="px-10 py-5 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={40} /> Start Game
                </button>
              </div>
            )}

            {/* ==================== QUESTION ==================== */}
            {gamePhase === 'question' && currentQuestion && (
              <div className="w-full h-full flex flex-col">
                {/* Category badge */}
                <div className="text-center mb-2">
                  <span className="bg-white/10 px-4 py-1 rounded-full text-lg capitalize">
                    {CATEGORY_EMOJI[currentQuestion.category]} {currentQuestion.category}
                  </span>
                </div>

                {/* 4 corners grid with question/audio in center */}
                <div className="flex-1 relative min-h-0">
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3">
                    {Object.entries(CORNERS).map(([key, corner]) => {
                      const count = cornerCounts[key] || 0;
                      return (
                        <div
                          key={key}
                          className={`rounded-2xl bg-gradient-to-br ${corner.bgClass} flex flex-col items-center justify-center p-4 relative`}
                        >
                          <div className="text-lg font-medium opacity-70 mb-1">{corner.label}</div>
                          <div className="text-4xl font-black leading-tight text-center">
                            {currentQuestion.answers[key]}
                          </div>
                          {/* Vote count */}
                          <div className="absolute bottom-3 right-3 bg-black/40 rounded-full px-3 py-1">
                            <span className="text-xl font-bold">{count}</span>
                            <span className="text-xs opacity-70 ml-1">{count === 1 ? 'vote' : 'votes'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Center overlay: question + audio controls */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-gray-900/95 border-2 border-white/30 rounded-3xl px-8 py-5 max-w-md shadow-2xl pointer-events-auto">
                      <div className="text-2xl font-black text-center leading-tight mb-3">
                        {currentQuestion.prompt}
                      </div>
                      {/* Audio play/replay button — only for questions with audio */}
                      {currentQuestion.audio && (
                        <div className="flex items-center justify-center gap-3">
                          {isPlaying ? (
                            <div className="flex items-center gap-2 text-purple-300 text-lg">
                              <Volume2 size={28} className="animate-pulse" />
                              <span className="font-medium">Playing...</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => playAudio(currentQuestion)}
                              className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-2xl text-lg font-bold transition-all hover:scale-105"
                            >
                              <RotateCcw size={22} /> Play Again
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom bar: answer count + reveal button */}
                <div className="flex items-center justify-between mt-3 flex-shrink-0">
                  <div className="bg-white/10 rounded-2xl px-6 py-3">
                    <span className="text-3xl font-black text-green-400">{lockedCount}</span>
                    <span className="text-lg text-white/70"> / {students.length} answered</span>
                  </div>
                  <button
                    onClick={reveal}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Eye size={28} /> Reveal Answer
                  </button>
                </div>
              </div>
            )}

            {/* ==================== REVEALED ==================== */}
            {gamePhase === 'revealed' && currentQuestion && (
              <div className="w-full h-full flex flex-col">
                <div className="text-center mb-2">
                  <div className="text-2xl text-white/80">The answer is...</div>
                </div>

                {/* 4 corners grid — correct highlighted, others dimmed */}
                <div className="flex-1 relative min-h-0">
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3">
                    {Object.entries(CORNERS).map(([key, corner]) => {
                      const isCorrect = key === currentQuestion.correct;
                      const count = cornerCounts[key] || 0;
                      return (
                        <div
                          key={key}
                          className={`rounded-2xl bg-gradient-to-br ${corner.bgClass} flex flex-col items-center justify-center p-4 relative transition-all ${
                            isCorrect ? 'ring-4 ring-green-400 scale-[1.02]' : 'opacity-30'
                          }`}
                        >
                          {isCorrect && (
                            <CheckCircle size={32} className="text-green-400 absolute top-3 right-3" />
                          )}
                          <div className="text-lg font-medium opacity-70 mb-1">{corner.label}</div>
                          <div className="text-4xl font-black leading-tight text-center">
                            {currentQuestion.answers[key]}
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/40 rounded-full px-3 py-1">
                            <span className="text-xl font-bold">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-gray-900/95 border-2 border-green-400/50 rounded-3xl px-8 py-5 max-w-md shadow-2xl">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle size={24} className="text-green-400" />
                        <span className="text-xl text-green-400 font-bold">Correct!</span>
                      </div>
                      <div className="text-2xl font-bold text-center">{currentQuestion.explanation}</div>
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between mt-3 flex-shrink-0">
                  <div className="text-xl text-white/70">
                    {correctCount} of {students.length} got it right!
                    {correctCount > 0 && students.length > 0 && (
                      <span className="ml-2 text-green-400">
                        ({Math.round((correctCount / students.length) * 100)}%)
                      </span>
                    )}
                  </div>
                  <button
                    onClick={nextQuestion}
                    className="px-10 py-4 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2"
                  >
                    {currentQuestionIndex >= currentQuestions.length - 1 ? (
                      <>Finish Game <ChevronRight size={28} /></>
                    ) : (
                      <>Next Question <ChevronRight size={28} /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ==================== FINISHED ==================== */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <div className="text-9xl mb-6">{'\uD83C\uDF89'}</div>
                <h2 className="text-5xl font-black mb-4">Round {currentRound + 1} Complete!</h2>
                <p className="text-2xl text-white/70 mb-8">Great job everyone!</p>

                {currentRound < ALL_ROUNDS.length - 1 ? (
                  <button
                    onClick={() => {
                      const nextRound = currentRound + 1;
                      setCurrentRound(nextRound);
                      startGame(nextRound);
                    }}
                    className="px-10 py-5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                  >
                    <RotateCcw size={28} /> Play Round {currentRound + 2}
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-xl text-white/50">All rounds complete!</p>
                    <button
                      onClick={() => {
                        setCurrentRound(0);
                        startGame(0);
                      }}
                      className="px-10 py-5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                    >
                      <RotateCcw size={28} /> Replay from Round 1
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default FourCornersGame;
