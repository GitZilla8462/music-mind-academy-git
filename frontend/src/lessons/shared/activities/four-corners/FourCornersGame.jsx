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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Users, Eye, ChevronRight, CheckCircle, Volume2, RotateCcw } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';

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
  // --- Q1: Dynamics — Forte ---
  {
    id: 'q1', category: 'dynamics',
    prompt: 'Listen! What dynamic level is this?',
    audio: { path: VIVALDI_SPRING, startTime: 0, endTime: 8, volume: 0.85 },
    answers: { A: 'Piano', B: 'Forte', C: 'Pianissimo', D: 'Mezzo Piano' },
    correct: 'B',
    explanation: 'That was forte — loud and strong!'
  },
  // --- Q2: Dynamics — Crescendo ---
  {
    id: 'q2', category: 'dynamics',
    prompt: 'Listen! What is happening to the dynamics?',
    audio: { path: VIVALDI_SPRING, startTime: 60, endTime: 72, volume: 0.7 },
    answers: { A: 'Decrescendo', B: 'Staying the same', C: 'Crescendo', D: 'Sforzando' },
    correct: 'C',
    explanation: 'That was a crescendo — getting louder!'
  },
  // --- Q3: Tempo — Accelerando ---
  {
    id: 'q3', category: 'tempo',
    prompt: 'Listen! What is happening to the tempo?',
    audio: { path: '/audio/classical/grieg-mountain-king.mp3', volume: 0.7 },
    answers: { A: 'Ritardando', B: 'Accelerando', C: 'Staying the same', D: 'Fermata' },
    correct: 'B',
    explanation: 'That was accelerando — gradually speeding up!'
  },
  // --- Q4: Tempo — Presto ---
  {
    id: 'q4', category: 'tempo',
    prompt: 'Listen! What tempo is this?',
    audio: { path: '/audio/classical/vivaldi-summer-presto-1.mp3', volume: 0.7 },
    answers: { A: 'Andante', B: 'Largo', C: 'Presto', D: 'Adagio' },
    correct: 'C',
    explanation: 'That was Presto — very fast!'
  },
  // --- Q5: Strings — Cello ---
  {
    id: 'q5', category: 'strings',
    prompt: 'Listen! What string instrument is this?',
    audio: { path: '/audio/orchestra-samples/strings/cello.mp3', volume: 0.7 },
    answers: { A: 'Violin', B: 'Viola', C: 'Double Bass', D: 'Cello' },
    correct: 'D',
    explanation: 'That was the cello — rich and warm, like a singing voice!'
  },
  // --- Q6: Woodwinds — Bassoon ---
  {
    id: 'q6', category: 'woodwinds',
    prompt: 'Listen! What woodwind instrument is this?',
    audio: { path: '/audio/orchestra-samples/woodwinds/bassoon.mp3', volume: 1.0 },
    answers: { A: 'Bassoon', B: 'Clarinet', C: 'Oboe', D: 'Flute' },
    correct: 'A',
    explanation: 'That was the bassoon — the deepest woodwind!'
  },
  // --- Q7: Woodwinds — Flute ---
  {
    id: 'q7', category: 'woodwinds',
    prompt: 'Listen! What woodwind instrument is this?',
    audio: { path: '/audio/orchestra-samples/woodwinds/flute.mp3', volume: 1.0 },
    answers: { A: 'Oboe', B: 'Bassoon', C: 'Clarinet', D: 'Flute' },
    correct: 'D',
    explanation: 'That was the flute — bright and airy!'
  },
  // --- Q8: Brass — Tuba ---
  {
    id: 'q8', category: 'brass',
    prompt: 'Listen! What brass instrument is this?',
    audio: { path: '/audio/orchestra-samples/brass/tuba.mp3', volume: 1.0 },
    answers: { A: 'Trombone', B: 'French Horn', C: 'Trumpet', D: 'Tuba' },
    correct: 'D',
    explanation: 'That was the tuba — deep and powerful!'
  },
  // --- Q9: Brass — Trumpet ---
  {
    id: 'q9', category: 'brass',
    prompt: 'Listen! What brass instrument is this?',
    audio: { path: '/audio/orchestra-samples/brass/trumpet.mp3', volume: 1.0 },
    answers: { A: 'French Horn', B: 'Tuba', C: 'Trumpet', D: 'Trombone' },
    correct: 'C',
    explanation: 'That was the trumpet — bright and bold!'
  },
  // --- Q10: Form — Rondo ---
  {
    id: 'q10', category: 'form',
    prompt: 'A piece goes A-B-A-C-A. What form is this?',
    audio: null,
    answers: { A: 'Rondo', B: 'Binary', C: 'Ternary', D: 'Theme & Variations' },
    correct: 'A',
    explanation: 'ABACA is rondo form — the A section keeps returning!'
  },
  // --- Q11: Form — Ternary ---
  {
    id: 'q11', category: 'form',
    prompt: 'A piece has three sections: the first and last sound the same. What form is this?',
    audio: null,
    answers: { A: 'Rondo', B: 'Ternary', C: 'Through-composed', D: 'Binary' },
    correct: 'B',
    explanation: 'ABA is ternary form — it returns to the opening section!'
  },
  // --- Q12: Form — Ritardando vs Decrescendo ---
  {
    id: 'q12', category: 'form',
    prompt: 'The music is getting slower. What is the Italian term for this?',
    audio: null,
    answers: { A: 'Decrescendo', B: 'Crescendo', C: 'Ritardando', D: 'Accelerando' },
    correct: 'C',
    explanation: 'Ritardando means gradually slowing down. Decrescendo means getting softer — that\'s dynamics, not tempo!'
  }
];

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
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  const currentQuestion = QUESTIONS[currentQuestionIndex] || null;

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
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/fourCorners`), data);
  }, [sessionCode]);

  // Firebase: Subscribe to students
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);

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
  }, [sessionCode]);

  // Start game
  const startGame = useCallback(() => {
    setCurrentQuestionIndex(0);
    setGamePhase('question');
    setCorrectCount(0);

    // Reset student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          fcAnswer: null,
        }).catch(() => {});
      });
    }

    const firstQ = QUESTIONS[0];
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
  }, [sessionCode, students, updateGame, playAudio]);

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
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          fcAnswer: null,
        }).catch(() => {});
      });
    }

    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx >= QUESTIONS.length) {
      setGamePhase('finished');
      updateGame({ phase: 'finished', revealedAnswer: null });
    } else {
      setCurrentQuestionIndex(nextIdx);
      setGamePhase('question');
      setCorrectCount(0);

      const nextQ = QUESTIONS[nextIdx];
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
  }, [sessionCode, students, currentQuestionIndex, updateGame, stopAudio, playAudio]);

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
                Q{currentQuestionIndex + 1}/{QUESTIONS.length}
                {currentQuestion && (
                  <span className="ml-2 opacity-70">{CATEGORY_EMOJI[currentQuestion.category]}</span>
                )}
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
            {QUESTIONS.map((q, idx) => {
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
                      {/* Audio play/replay button */}
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
                    {currentQuestionIndex >= QUESTIONS.length - 1 ? (
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
                <h2 className="text-5xl font-black mb-4">Game Complete!</h2>
                <p className="text-2xl text-white/70 mb-8">Great job everyone!</p>

                <button
                  onClick={() => onComplete?.()}
                  className="px-10 py-5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  Continue <ChevronRight size={28} />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default FourCornersGame;
