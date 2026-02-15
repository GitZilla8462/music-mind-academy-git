// File: NameThatElementTeacherGame.jsx
// Name That Element - Teacher Presentation View (Class Game)
// Teacher shows a term or description, students decide if it's DYNAMICS, TEMPO, or FORM
// 3 rounds of 4 questions = 12 total
//
// PHASES:
// 1. Setup - Show "Start Game"
// 2. Question - Prompt displayed, students answer on devices
// 3. Revealed - Show correct answer with explanation
// 4. Between-rounds - Round summary
// 5. Finished - Final leaderboard

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Users, Trophy, Eye, ChevronRight, CheckCircle, XCircle, Zap } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';

// ============================================================
// QUESTIONS DATA
// ============================================================
const QUESTIONS = [
  // Round 1 - Term Identification
  {
    id: 'q1',
    round: 1,
    prompt: 'Crescendo',
    type: 'dynamics',
    explanation: 'Getting louder \u2014 that\'s dynamics!'
  },
  {
    id: 'q2',
    round: 1,
    prompt: 'Allegro',
    type: 'tempo',
    explanation: 'Fast \u2014 that\'s tempo!'
  },
  {
    id: 'q3',
    round: 1,
    prompt: 'Rondo',
    type: 'form',
    explanation: 'ABACADA \u2014 that\'s form!'
  },
  {
    id: 'q4',
    round: 1,
    prompt: 'Pianissimo (pp)',
    type: 'dynamics',
    explanation: 'Very soft \u2014 that\'s dynamics!'
  },
  // Round 2 - Description
  {
    id: 'q5',
    round: 2,
    prompt: 'The music suddenly gets much louder',
    type: 'dynamics',
    explanation: 'A sudden change in volume is dynamics!'
  },
  {
    id: 'q6',
    round: 2,
    prompt: 'The A section comes back after B',
    type: 'form',
    explanation: 'Sections repeating = form (ABA)!'
  },
  {
    id: 'q7',
    round: 2,
    prompt: 'The beat slows down gradually',
    type: 'tempo',
    explanation: 'Slowing down = ritardando \u2014 that\'s tempo!'
  },
  {
    id: 'q8',
    round: 2,
    prompt: 'The music is organized A-B-A-C-A-D-A',
    type: 'form',
    explanation: 'That pattern is rondo form!'
  },
  // Round 3 - Expert
  {
    id: 'q9',
    round: 3,
    prompt: 'Decrescendo',
    type: 'dynamics',
    explanation: 'Getting softer \u2014 that\'s dynamics!'
  },
  {
    id: 'q10',
    round: 3,
    prompt: 'The orchestra races through the melody',
    type: 'tempo',
    explanation: 'Racing = presto \u2014 that\'s tempo!'
  },
  {
    id: 'q11',
    round: 3,
    prompt: 'Episode',
    type: 'form',
    explanation: 'An episode is a section in rondo form!'
  },
  {
    id: 'q12',
    round: 3,
    prompt: 'The music whispers, then SHOUTS',
    type: 'dynamics',
    explanation: 'p to ff \u2014 that\'s dynamics!'
  }
];

const ROUND_NAMES = {
  1: 'Term Identification',
  2: 'Description',
  3: 'Expert'
};

// Category definitions
const CATEGORIES = {
  dynamics: { label: 'Dynamics', color: '#EF4444', emoji: '\uD83D\uDCE2', bgClass: 'from-red-600 to-red-700' },
  tempo:    { label: 'Tempo',    color: '#8B5CF6', emoji: '\u23F1\uFE0F', bgClass: 'from-purple-600 to-purple-700' },
  form:     { label: 'Form',     color: '#3B82F6', emoji: '\uD83D\uDD24', bgClass: 'from-blue-600 to-blue-700' }
};

// Scoring
const SCORING = {
  CORRECT: 100,
  SPEED_BONUS_MAX: 50, // bonus for answering within first 5 seconds
  SPEED_BONUS_WINDOW: 5000 // ms
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
  const sessionCode = sessionData?.sessionCode || new URLSearchParams(window.location.search).get('session');

  // Game state
  const [gamePhase, setGamePhase] = useState('setup'); // setup, question, revealed, between-rounds, finished
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 0-3 within round
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // Reveal state
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreChanges, setScoreChanges] = useState({});

  // Round stats
  const [roundCorrectTotal, setRoundCorrectTotal] = useState(0);
  const [roundQuestionCount, setRoundQuestionCount] = useState(0);

  // Get current question
  const roundQuestions = QUESTIONS.filter(q => q.round === currentRound);
  const currentQuestion = roundQuestions[currentQuestionIndex] || null;

  // Live answer counts per category
  const [answerCounts, setAnswerCounts] = useState({ dynamics: 0, tempo: 0, form: 0 });

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/nameThatElement`), data);
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
        score: s.nteScore || 0,
        answer: s.nteAnswer,
        answerTime: s.nteAnswerTime,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '\uD83C\uDFB5'
      }));

      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));

      // Count answers per category
      const counts = { dynamics: 0, tempo: 0, form: 0 };
      list.forEach(s => {
        if (s.answer && Object.prototype.hasOwnProperty.call(counts, s.answer)) {
          counts[s.answer]++;
        }
      });
      setAnswerCounts(counts);
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Start game
  const startGame = useCallback(() => {
    setCurrentRound(1);
    setCurrentQuestionIndex(0);
    setGamePhase('question');
    setScoreChanges({});
    setCorrectCount(0);
    setRoundCorrectTotal(0);
    setRoundQuestionCount(0);

    const now = Date.now();
    setQuestionStartTime(now);

    // Reset student answers and scores
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          nteAnswer: null,
          nteAnswerTime: null,
          nteScore: 0
        }).catch(err => console.error(`Failed to reset student ${s.id}:`, err));
      });
    }

    const firstQuestion = QUESTIONS.filter(q => q.round === 1)[0];
    updateGame({
      phase: 'question',
      currentRound: 1,
      currentQuestion: 0,
      questionData: { prompt: firstQuestion.prompt, type: firstQuestion.type, id: firstQuestion.id },
      revealedAnswer: null,
      startedAt: now
    });
  }, [sessionCode, students, updateGame]);

  // Reveal answer
  const reveal = useCallback(() => {
    if (!currentQuestion) return;

    const changes = {};
    let correct = 0;

    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        if (s.answer) {
          const isCorrect = s.answer === currentQuestion.type;
          if (isCorrect) {
            correct++;
            const speedBonus = calculateSpeedBonus(s.answerTime, questionStartTime);
            const points = SCORING.CORRECT + speedBonus;
            const newScore = (s.score || 0) + points;
            changes[s.id] = { isCorrect: true, points, speedBonus };
            // Update score in Firebase
            update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
              nteScore: newScore
            }).catch(err => console.error(`Failed to update score for ${s.id}:`, err));
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
    setRoundCorrectTotal(prev => prev + correct);
    setRoundQuestionCount(prev => prev + 1);
    setGamePhase('revealed');

    updateGame({
      phase: 'revealed',
      revealedAnswer: currentQuestion.type
    });
  }, [currentQuestion, students, sessionCode, questionStartTime, updateGame]);

  // Next question
  const nextQuestion = useCallback(() => {
    // Clear student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          nteAnswer: null,
          nteAnswerTime: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx >= 4) {
      // End of round
      if (currentRound >= 3) {
        // Game over
        setGamePhase('finished');
        updateGame({ phase: 'finished', revealedAnswer: null });
      } else {
        // Show between-rounds screen
        setGamePhase('between-rounds');
        updateGame({ phase: 'between-rounds', revealedAnswer: null });
      }
    } else {
      // Next question in same round
      const now = Date.now();
      setCurrentQuestionIndex(nextIdx);
      setGamePhase('question');
      setScoreChanges({});
      setCorrectCount(0);
      setQuestionStartTime(now);

      const nextQ = roundQuestions[nextIdx];
      updateGame({
        phase: 'question',
        currentQuestion: nextIdx,
        questionData: { prompt: nextQ.prompt, type: nextQ.type, id: nextQ.id },
        revealedAnswer: null,
        startedAt: now
      });
    }
  }, [sessionCode, students, currentQuestionIndex, currentRound, roundQuestions, updateGame]);

  // Start next round
  const startNextRound = useCallback(() => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setCurrentQuestionIndex(0);
    setGamePhase('question');
    setScoreChanges({});
    setCorrectCount(0);
    setRoundCorrectTotal(0);
    setRoundQuestionCount(0);

    const now = Date.now();
    setQuestionStartTime(now);

    // Clear student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          nteAnswer: null,
          nteAnswerTime: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    const nextRoundQuestions = QUESTIONS.filter(q => q.round === nextRound);
    const firstQ = nextRoundQuestions[0];
    updateGame({
      phase: 'question',
      currentRound: nextRound,
      currentQuestion: 0,
      questionData: { prompt: firstQ.prompt, type: firstQ.type, id: firstQ.id },
      revealedAnswer: null,
      startedAt: now
    });
  }, [currentRound, sessionCode, students, updateGame]);

  const correctCategory = currentQuestion ? CATEGORIES[currentQuestion.type] : null;

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 text-white overflow-hidden">
      {/* Student Activity Banner */}
      <ActivityBanner />

      {/* Main content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{'\uD83C\uDFAF'}</span>
            <h1 className="text-4xl font-bold">Name That Element</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Round {currentRound} &middot; Q{currentQuestionIndex + 1}/4
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Round progress bar */}
        {gamePhase !== 'setup' && gamePhase !== 'finished' && (
          <div className="flex gap-1 mb-3 flex-shrink-0">
            {Array.from({ length: 12 }, (_, idx) => {
              const qRound = Math.floor(idx / 4) + 1;
              const qIdx = idx % 4;
              const isComplete = qRound < currentRound || (qRound === currentRound && qIdx < currentQuestionIndex) || (qRound === currentRound && qIdx === currentQuestionIndex && (gamePhase === 'revealed' || gamePhase === 'between-rounds'));
              const isCurrent = qRound === currentRound && qIdx === currentQuestionIndex && gamePhase === 'question';
              const q = QUESTIONS[idx];
              const catColor = isComplete ? CATEGORIES[q.type].color : 'rgba(255,255,255,0.1)';

              return (
                <div
                  key={idx}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-white scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: catColor,
                    opacity: isComplete ? 1 : isCurrent ? 0.7 : 0.3
                  }}
                >
                  {isComplete ? '\u2713' : idx + 1}
                </div>
              );
            })}
          </div>
        )}

        {/* Main content grid */}
        <div className={`grid ${gamePhase !== 'setup' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
          {/* Main area */}
          <div className={`${gamePhase !== 'setup' ? 'col-span-2' : ''} bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0`}>

            {/* ==================== SETUP ==================== */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-9xl mb-6">{'\uD83C\uDFAF'}</div>
                <h2 className="text-5xl font-bold mb-4">Name That Element</h2>
                <p className="text-2xl text-white/70 mb-6">Is it Dynamics, Tempo, or Form?</p>

                {/* Category preview */}
                <div className="flex gap-6 justify-center mb-8">
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <div
                      key={key}
                      className="px-8 py-4 rounded-2xl text-center"
                      style={{ backgroundColor: cat.color }}
                    >
                      <div className="text-4xl mb-1">{cat.emoji}</div>
                      <div className="text-2xl font-black">{cat.label}</div>
                    </div>
                  ))}
                </div>

                <p className="text-xl text-white/50 mb-8">3 rounds &middot; 4 questions each &middot; Speed bonus for fast answers!</p>

                <button
                  onClick={startGame}
                  className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={40} /> Start Game
                </button>
              </div>
            )}

            {/* ==================== QUESTION ==================== */}
            {gamePhase === 'question' && currentQuestion && (
              <div className="text-center w-full">
                <div className="text-lg text-white/50 mb-2 uppercase tracking-widest">
                  Round {currentRound}: {ROUND_NAMES[currentRound]}
                </div>

                {/* Question prompt - large and centered */}
                <div className="bg-white/10 rounded-3xl p-8 mb-6 max-w-2xl mx-auto border-2 border-white/20">
                  <div className="text-5xl font-black leading-tight">
                    {currentQuestion.prompt}
                  </div>
                </div>

                <p className="text-2xl text-teal-200 mb-6">Is this Dynamics, Tempo, or Form?</p>

                {/* Category buttons with live vote counts */}
                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                  {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const count = answerCounts[key] || 0;
                    return (
                      <div
                        key={key}
                        className="rounded-2xl p-5 text-center transition-all"
                        style={{
                          backgroundColor: `${cat.color}30`,
                          borderColor: cat.color,
                          borderWidth: '3px'
                        }}
                      >
                        <div className="text-4xl mb-1">{cat.emoji}</div>
                        <div className="text-2xl font-black text-white">{cat.label}</div>
                        <div className="mt-2 bg-black/30 rounded-xl px-3 py-1 inline-block">
                          <span className="text-2xl font-bold" style={{ color: cat.color }}>{count}</span>
                          <span className="text-sm text-white/60 ml-1">votes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Answer count */}
                <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-4">
                  <span className="text-4xl font-black text-green-400">{lockedCount}</span>
                  <span className="text-xl text-white/70"> / {students.length} answered</span>
                </div>

                {/* Reveal button */}
                <div className="flex justify-center">
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
            {gamePhase === 'revealed' && currentQuestion && correctCategory && (
              <div className="text-center">
                <div className="text-3xl text-white/80 mb-4">The answer is...</div>

                {/* Correct answer card */}
                <div
                  className="rounded-3xl p-8 mb-4 max-w-md mx-auto"
                  style={{ backgroundColor: correctCategory.color }}
                >
                  <div className="text-6xl mb-2">{correctCategory.emoji}</div>
                  <div className="text-6xl font-black text-white mb-2">{correctCategory.label}</div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle size={24} className="text-white/90" />
                    <div className="text-xl text-white/90">{currentQuestion.explanation}</div>
                  </div>
                </div>

                {/* Vote breakdown with correct/incorrect indicators */}
                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-4">
                  {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const count = answerCounts[key] || 0;
                    const isCorrect = key === currentQuestion.type;
                    return (
                      <div
                        key={key}
                        className={`rounded-xl p-3 text-center relative ${
                          isCorrect ? 'ring-4 ring-green-400' : 'opacity-50'
                        }`}
                        style={{ backgroundColor: `${cat.color}40` }}
                      >
                        {isCorrect && (
                          <CheckCircle size={24} className="text-green-400 absolute -top-2 -right-2" />
                        )}
                        <div className="text-xl font-bold">{cat.label}</div>
                        <div className="text-2xl font-black">{count}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xl text-white/70 mb-6">
                  {correctCount} of {students.length} got it correct!
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
                  {currentQuestionIndex >= 3 ? (
                    currentRound >= 3 ? (
                      <><Trophy size={28} /> See Final Results</>
                    ) : (
                      <>Round {currentRound} Complete <ChevronRight size={28} /></>
                    )
                  ) : (
                    <>Next Question <ChevronRight size={28} /></>
                  )}
                </button>
              </div>
            )}

            {/* ==================== BETWEEN ROUNDS ==================== */}
            {gamePhase === 'between-rounds' && (
              <div className="text-center">
                <div className="text-8xl mb-4">{'\u2B50'}</div>
                <h2 className="text-5xl font-black mb-2">Round {currentRound} Complete!</h2>
                <p className="text-2xl text-white/60 mb-2">{ROUND_NAMES[currentRound]}</p>

                <div className="bg-white/10 rounded-2xl p-6 max-w-md mx-auto mb-6">
                  <div className="text-lg text-white/60 mb-1">Class Accuracy</div>
                  <div className="text-5xl font-black text-green-400">
                    {roundQuestionCount > 0 ? Math.round((roundCorrectTotal / (roundQuestionCount * students.length)) * 100) : 0}%
                  </div>
                  <div className="text-lg text-white/50 mt-1">
                    {roundCorrectTotal} correct answers across {roundQuestionCount} questions
                  </div>
                </div>

                <div className="text-xl text-white/70 mb-6">
                  Up next: <span className="font-bold text-teal-300">Round {currentRound + 1} \u2014 {ROUND_NAMES[currentRound + 1]}</span>
                </div>

                <button
                  onClick={startNextRound}
                  className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Zap size={32} /> Start Round {currentRound + 1}
                </button>
              </div>
            )}

            {/* ==================== FINISHED ==================== */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <div className="text-9xl mb-4">{'\uD83C\uDFC6'}</div>
                <h2 className="text-5xl font-black mb-4">Game Complete!</h2>
                <p className="text-2xl text-white/70 mb-6">Great job everyone!</p>

                {/* Top 5 podium */}
                {leaderboard.length > 0 && (
                  <div className="max-w-lg mx-auto mb-8">
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
                          {idx === 0 ? '\uD83E\uDD47' : idx === 1 ? '\uD83E\uDD48' : idx === 2 ? '\uD83E\uDD49' : `#${idx + 1}`}
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

                <button
                  onClick={() => onComplete?.()}
                  className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Trophy size={28} />
                  Continue
                </button>
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
                        {idx === 0 ? '\uD83E\uDD47' : idx === 1 ? '\uD83E\uDD48' : idx === 2 ? '\uD83E\uDD49' : `#${idx + 1}`}
                      </span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: student.playerColor }}
                      >
                        {student.playerEmoji || student.name.charAt(0)}
                      </div>
                      <span className="flex-1 truncate text-lg font-medium">{student.name}</span>
                      {gamePhase === 'question' && student.answer && (
                        <span className="text-green-400 text-sm">{'\u2713'}</span>
                      )}
                      <span className="font-bold text-xl">
                        {student.score}
                      </span>
                      {isRevealing && change?.isCorrect && (
                        <span className="text-sm font-bold text-green-400">
                          +{change.points}
                        </span>
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
