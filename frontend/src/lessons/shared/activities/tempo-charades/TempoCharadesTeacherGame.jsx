// File: /src/lessons/shared/activities/tempo-charades/TempoCharadesTeacherGame.jsx
// Tempo Charades - Teacher Presentation View (Class Game)
// A volunteer acts out a tempo term, the class guesses which tempo it is
//
// PHASES:
// 1. Setup - Show "Start Game"
// 2. Showing - Teacher sees term + hint privately, main display says "actor is getting ready"
// 3. Guessing - Actor is performing, students answer on devices
// 4. Revealed - Show correct answer
// 5. Finished - Final scores

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Users, Trophy, Eye, RotateCcw, ChevronRight, EyeOff } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { TEMPO_TERMS, QUESTIONS, TOTAL_QUESTIONS, SCORING, shuffleArray, calculateSpeedBonus } from './tempoCharadesConfig';

// Student Activity Banner
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

const TempoCharadesTeacherGame = ({ sessionData, onComplete }) => {
  const sessionCode = sessionData?.sessionCode || new URLSearchParams(window.location.search).get('session');

  // Game state
  const [gamePhase, setGamePhase] = useState('setup'); // setup, showing, guessing, revealed, finished
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Teacher secret overlay
  const [showSecret, setShowSecret] = useState(false);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // Reveal state
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreChanges, setScoreChanges] = useState({});

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/tempoCharades`), data);
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
        score: s.tempoCharadesScore || 0,
        answer: s.tempoCharadesAnswer,
        answerTime: s.tempoCharadesAnswerTime,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '\u{1F3B5}'
      }));

      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Start game
  const startGame = useCallback(() => {
    const shuffled = shuffleArray(QUESTIONS);
    setShuffledQuestions(shuffled);
    setCurrentQuestion(0);
    setGamePhase('showing');
    setShowSecret(true);
    setScoreChanges({});
    setCorrectCount(0);

    // Reset student answers and scores
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          tempoCharadesAnswer: null,
          tempoCharadesScore: 0
        }).catch(err => console.error(`Failed to reset student ${s.id}:`, err));
      });
    }

    updateGame({
      phase: 'showing',
      currentQuestion: 0,
      totalQuestions: shuffled.length,
      correctAnswer: null,
      playStartTime: null
    });
  }, [sessionCode, students, updateGame]);

  // Teacher has shown the term to the volunteer, now start guessing
  const startGuessing = useCallback(() => {
    setShowSecret(false);
    setGamePhase('guessing');

    updateGame({
      phase: 'guessing',
      currentQuestion,
      totalQuestions: shuffledQuestions.length,
      playStartTime: Date.now()
    });
  }, [currentQuestion, shuffledQuestions, updateGame]);

  // Reveal answer
  const reveal = useCallback(() => {
    const question = shuffledQuestions[currentQuestion];
    if (!question) return;

    // Calculate who was correct
    const changes = {};
    let correct = 0;

    students.forEach(s => {
      if (s.answer) {
        const isCorrect = s.answer === question.correctAnswer;

        if (isCorrect) {
          correct++;
          changes[s.id] = { isCorrect: true };
        } else {
          changes[s.id] = { isCorrect: false };
        }
      } else {
        changes[s.id] = { isCorrect: false, noAnswer: true };
      }
    });

    setScoreChanges(changes);
    setCorrectCount(correct);
    setGamePhase('revealed');

    // Broadcast to students
    updateGame({
      phase: 'revealed',
      correctAnswer: question.correctAnswer
    });
  }, [shuffledQuestions, currentQuestion, students, updateGame]);

  // Next question
  const nextQuestion = useCallback(() => {
    // Clear student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          tempoCharadesAnswer: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    const nextIdx = currentQuestion + 1;
    if (nextIdx >= shuffledQuestions.length) {
      setGamePhase('finished');
      updateGame({ phase: 'finished' });
    } else {
      setCurrentQuestion(nextIdx);
      setGamePhase('showing');
      setShowSecret(true);
      setScoreChanges({});
      setCorrectCount(0);
      updateGame({
        phase: 'showing',
        currentQuestion: nextIdx,
        correctAnswer: null,
        playStartTime: null
      });
    }
  }, [sessionCode, students, currentQuestion, shuffledQuestions, updateGame]);

  const question = shuffledQuestions[currentQuestion];
  const correctTempo = question
    ? TEMPO_TERMS.find(t => t.symbol === question.correctAnswer)
    : null;

  // Render
  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white overflow-hidden">
      {/* Student Activity Banner */}
      <ActivityBanner />

      {/* Teacher Secret Overlay */}
      {showSecret && gamePhase === 'showing' && question && correctTempo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-8">
          <div className="bg-gray-900 rounded-3xl p-10 max-w-lg w-full text-center border-4 border-red-500">
            <div className="flex items-center justify-center gap-2 mb-6">
              <EyeOff size={28} className="text-red-400" />
              <span className="text-xl font-bold text-red-400 uppercase tracking-wide">
                Secret - Don't show the class!
              </span>
              <EyeOff size={28} className="text-red-400" />
            </div>

            <div className="text-lg text-white/60 mb-2">Round {currentQuestion + 1} of {shuffledQuestions.length}</div>

            <div
              className="text-7xl font-black mb-4"
              style={{ color: correctTempo.color }}
            >
              {correctTempo.emoji} {correctTempo.symbol}
            </div>

            <div className="text-2xl font-bold text-white mb-1">{correctTempo.name}</div>
            <div className="text-xl text-white/70 mb-6">{correctTempo.meaning}</div>

            <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-6 py-4 mb-8">
              <p className="text-sm font-bold text-yellow-300 uppercase mb-1">Acting Hint</p>
              <p className="text-xl text-yellow-100">{question.hint}</p>
            </div>

            <button
              onClick={startGuessing}
              className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
            >
              <Play size={32} /> Ready? Start Guessing!
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{'\u{1F3AD}'}</span>
            <h1 className="text-4xl font-bold">Tempo Charades</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Q{currentQuestion + 1} / {shuffledQuestions.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Main content grid */}
        <div className={`grid ${gamePhase !== 'setup' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
          {/* Main area */}
          <div className={`${gamePhase !== 'setup' ? 'col-span-2' : ''} bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0`}>

            {/* Setup */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-9xl mb-6">{'\u{1F3AD}'}</div>
                <h2 className="text-5xl font-bold mb-4">Tempo Charades</h2>
                <p className="text-2xl text-white/70 mb-8">A volunteer acts out a tempo - the class guesses!</p>
                <button
                  onClick={startGame}
                  className="px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={40} /> Start Game
                </button>
              </div>
            )}

            {/* Showing - waiting for teacher to show term to volunteer */}
            {gamePhase === 'showing' && question && (
              <div className="text-center">
                <div className="text-6xl font-black mb-4">Round {currentQuestion + 1}</div>
                <p className="text-2xl text-purple-200 mb-6">The actor is getting ready...</p>

                {/* Tempo options preview */}
                <div className="grid grid-cols-5 gap-2 max-w-3xl mx-auto mb-4">
                  {TEMPO_TERMS.filter(t => t.symbol !== 'accel.' && t.symbol !== 'rit.').map(t => (
                    <div
                      key={t.symbol}
                      className="p-3 rounded-xl text-center"
                      style={{ backgroundColor: `${t.color}40`, borderColor: t.color, borderWidth: '2px' }}
                    >
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="text-xl font-bold text-white">{t.symbol}</div>
                      <div className="text-xs text-white/80">{t.meaning}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 max-w-xl mx-auto mb-6 justify-center">
                  {TEMPO_TERMS.filter(t => t.symbol === 'accel.' || t.symbol === 'rit.').map(t => (
                    <div
                      key={t.symbol}
                      className="p-3 rounded-xl text-center min-w-[200px]"
                      style={{ backgroundColor: `${t.color}40`, borderColor: t.color, borderWidth: '2px' }}
                    >
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="text-xl font-bold text-white">{t.name}</div>
                      <div className="text-xs text-white/80">{t.meaning}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowSecret(true)}
                  className="px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <EyeOff size={40} /> Show Term to Actor
                </button>
              </div>
            )}

            {/* Guessing - actor is performing, students answering */}
            {gamePhase === 'guessing' && question && (
              <div className="text-center">
                <div className="text-5xl font-black mb-2">{'\u{1F3AD}'} WATCH!</div>
                <p className="text-2xl text-yellow-300 mb-4">What tempo is the actor performing?</p>
                <p className="text-xl text-white/70 mb-6">Students - submit your answer on your device!</p>

                {/* Tempo options */}
                <div className="grid grid-cols-5 gap-2 max-w-3xl mx-auto mb-4">
                  {TEMPO_TERMS.filter(t => t.symbol !== 'accel.' && t.symbol !== 'rit.').map(t => (
                    <div
                      key={t.symbol}
                      className="p-3 rounded-xl text-center"
                      style={{ backgroundColor: `${t.color}40`, borderColor: t.color, borderWidth: '2px' }}
                    >
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="text-xl font-bold text-white">{t.symbol}</div>
                      <div className="text-xs text-white/80">{t.meaning}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 max-w-xl mx-auto mb-6 justify-center">
                  {TEMPO_TERMS.filter(t => t.symbol === 'accel.' || t.symbol === 'rit.').map(t => (
                    <div
                      key={t.symbol}
                      className="p-3 rounded-xl text-center min-w-[200px]"
                      style={{ backgroundColor: `${t.color}40`, borderColor: t.color, borderWidth: '2px' }}
                    >
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="text-xl font-bold text-white">{t.name}</div>
                      <div className="text-xs text-white/80">{t.meaning}</div>
                    </div>
                  ))}
                </div>

                {/* Answer count */}
                <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-6">
                  <span className="text-4xl font-black text-green-400">{lockedCount}</span>
                  <span className="text-xl text-white/70"> / {students.length} answered</span>
                </div>

                {/* Control buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowSecret(true)}
                    className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
                  >
                    <EyeOff size={24} /> Show Hint Again
                  </button>
                  <button
                    onClick={reveal}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Eye size={28} /> Reveal Answer
                  </button>
                </div>
              </div>
            )}

            {/* Revealed */}
            {gamePhase === 'revealed' && question && correctTempo && (
              <div className="text-center">
                <div className="text-3xl text-white/80 mb-4">The answer is...</div>

                <div
                  className="rounded-3xl p-8 mb-6 max-w-md mx-auto"
                  style={{ backgroundColor: correctTempo.color }}
                >
                  <div className="text-6xl mb-2">{correctTempo.emoji}</div>
                  <div className="text-6xl font-black text-white mb-2">{correctTempo.symbol}</div>
                  <div className="text-3xl font-bold text-white/90">{correctTempo.name}</div>
                  <div className="text-2xl text-white/80">{correctTempo.meaning}</div>
                </div>

                <div className="text-xl text-white/70 mb-6">
                  {correctCount} of {students.length} students got it correct!
                </div>

                <button
                  onClick={nextQuestion}
                  className="px-10 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                >
                  {currentQuestion >= shuffledQuestions.length - 1 ? (
                    <>Finish <Trophy size={28} /></>
                  ) : (
                    <>Next Round <ChevronRight size={28} /></>
                  )}
                </button>
              </div>
            )}

            {/* Finished */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <div className="text-9xl mb-6">{'\u{1F3C6}'}</div>
                <h2 className="text-5xl font-black mb-4">Game Complete!</h2>
                <p className="text-2xl text-white/70 mb-8">Great job everyone!</p>
                <button
                  onClick={() => onComplete?.()}
                  className="px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Trophy size={28} />
                  Advance to See Results
                </button>
              </div>
            )}

          </div>

          {/* Leaderboard */}
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
                        {idx === 0 ? '\u{1F947}' : idx === 1 ? '\u{1F948}' : idx === 2 ? '\u{1F949}' : `#${idx + 1}`}
                      </span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: student.playerColor }}
                      >
                        {student.playerEmoji || student.name.charAt(0)}
                      </div>
                      <span className="flex-1 truncate text-lg font-medium">{student.name}</span>
                      {gamePhase === 'guessing' && student.answer && (
                        <span className="text-green-400 text-sm">{'\u2713'}</span>
                      )}
                      <span className="font-bold text-xl">
                        {student.score}
                      </span>
                      {isRevealing && change?.isCorrect && (
                        <span className="text-lg font-bold text-green-400">{'\u2713'}</span>
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

export default TempoCharadesTeacherGame;
