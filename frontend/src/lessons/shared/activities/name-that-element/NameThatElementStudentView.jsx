// File: /src/lessons/shared/activities/name-that-element/NameThatElementStudentView.jsx
// Name That Element - Student View (syncs with teacher's class game)
// Students see a question on the main screen, then tap DYNAMICS, TEMPO, or FORM on their Chromebook
// No audio playback on student side - just 3 large answer buttons

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';

// Answer options
const ANSWERS = [
  { id: 'dynamics', label: 'DYNAMICS', emoji: '\uD83D\uDCE2', color: '#EF4444', bgClass: 'from-red-500 to-red-700' },
  { id: 'tempo', label: 'TEMPO', emoji: '\u23F1\uFE0F', color: '#8B5CF6', bgClass: 'from-purple-500 to-purple-700' },
  { id: 'form', label: 'FORM', emoji: '\uD83D\uDD24', color: '#3B82F6', bgClass: 'from-blue-500 to-blue-700' }
];

// Scoring
const SCORING = {
  correct: 10,
  speedBonus: 5,
  speedThreshold: 5000 // 5 seconds for speed bonus
};

const TOTAL_QUESTIONS = 12;

const NameThatElementStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, classId, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  // Compute Firebase paths based on session type
  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/nameThatelement`;
    if (sessionCode) return `sessions/${sessionCode}/nameThatelement`;
    return null;
  }, [classId, sessionCode]);

  const studentsPath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [playerEmoji, setPlayerEmoji] = useState('\uD83C\uDFB5');
  const [score, setScore] = useState(0);

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, playing, guessing, revealed, finished
  const [currentRound, setCurrentRound] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(TOTAL_QUESTIONS);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [playStartTime, setPlayStartTime] = useState(null);

  // Student's answer
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Results
  const [wasCorrect, setWasCorrect] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Leaderboard for results
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);

  // Track which question we've already scored
  const scoredQuestionRef = useRef(-1);

  // Refs to avoid stale closures in Firebase onValue callback
  const scoreRef = useRef(0);
  const currentQuestionRef = useRef(0);
  const selectedAnswerRef = useRef(null);
  const wasCorrectRef = useRef(null);
  const playStartTimeRef = useRef(null);

  // Generate player name on mount
  useEffect(() => {
    if (!userId) return;

    const assignPlayerName = async () => {
      const db = getDatabase();
      const color = getPlayerColor(userId);
      const emoji = getPlayerEmoji(userId);
      let name;

      if (studentsPath) {
        try {
          const studentsRef = ref(db, studentsPath);
          const snapshot = await get(studentsRef);
          const studentsData = snapshot.val() || {};
          const existingNames = Object.entries(studentsData)
            .filter(([id]) => id !== userId)
            .map(([, data]) => data.playerName)
            .filter(Boolean);
          name = generateUniquePlayerName(userId, existingNames);
        } catch {
          name = generateUniquePlayerName(userId, []);
        }
      } else {
        name = generateUniquePlayerName(userId, []);
      }

      setPlayerName(name);
      setPlayerColor(color);
      setPlayerEmoji(emoji);

      // Save player info to Firebase
      if (studentsPath) {
        update(ref(db, `${studentsPath}/${userId}`), {
          playerName: name,
          playerColor: color,
          playerEmoji: emoji
        });
      }
    };

    assignPlayerName();
  }, [userId, studentsPath]);

  // Keep refs in sync with state
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { selectedAnswerRef.current = selectedAnswer; }, [selectedAnswer]);
  useEffect(() => { wasCorrectRef.current = wasCorrect; }, [wasCorrect]);
  useEffect(() => { playStartTimeRef.current = playStartTime; }, [playStartTime]);

  // Listen for game state updates from teacher
  useEffect(() => {
    if (!gamePath) return;

    const db = getDatabase();
    const gameRef = ref(db, gamePath);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setGamePhase('waiting');
        return;
      }

      setGamePhase(data.phase || 'waiting');
      setCurrentRound(data.currentRound || 0);
      setCurrentQuestion(data.currentQuestion || 0);
      setTotalQuestions(data.totalQuestions || TOTAL_QUESTIONS);

      // Handle phase changes
      if (data.phase === 'playing' || data.phase === 'guessing') {
        // New game starting - reset score when on question 0
        if (data.currentQuestion === 0 && scoredQuestionRef.current === -1 && scoreRef.current > 0) {
          scoreRef.current = 0;
          setScore(0);
        }
        // Also reset when going back to Q0 from a later question (teacher restart)
        if (data.currentQuestion === 0 && currentQuestionRef.current !== 0) {
          scoreRef.current = 0;
          setScore(0);
          scoredQuestionRef.current = -1;
        }

        // New question - reset answers
        if (data.currentQuestion !== currentQuestionRef.current) {
          selectedAnswerRef.current = null;
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
          wasCorrectRef.current = null;
          setWasCorrect(null);
          setEarnedPoints(0);
          setCorrectAnswer(null);
        }

        // When teacher shows the question, students can start answering
        if (data.phase === 'guessing') {
          playStartTimeRef.current = data.startedAt || data.playStartTime || Date.now();
          setPlayStartTime(data.startedAt || data.playStartTime || Date.now());
        }
      }

      // Handle finished - restore score from Firebase if component remounted
      if (data.phase === 'finished') {
        const effectiveUserId = userId || localStorage.getItem('current-session-userId');
        if (effectiveUserId && scoreRef.current === 0 && studentsPath) {
          get(ref(db, `${studentsPath}/${effectiveUserId}/nteScore`))
            .then(snap => {
              const fbScore = snap.val() || 0;
              if (fbScore > 0) {
                scoreRef.current = fbScore;
                setScore(fbScore);
              }
            })
            .catch(() => {});
        }
      }

      // Handle reveal
      if (data.phase === 'revealed' && data.revealedAnswer) {
        setCorrectAnswer(data.revealedAnswer);

        const questionNum = data.currentQuestion || 0;

        if (selectedAnswerRef.current && wasCorrectRef.current === null && scoredQuestionRef.current !== questionNum) {
          scoredQuestionRef.current = questionNum;

          const answer = selectedAnswerRef.current;
          const isCorrect = answer === data.revealedAnswer;

          wasCorrectRef.current = isCorrect;
          setWasCorrect(isCorrect);

          let points = 0;
          if (isCorrect) {
            points = SCORING.correct;
            const answerTime = Date.now() - (playStartTimeRef.current || Date.now());
            if (answerTime < SCORING.speedThreshold) {
              points += SCORING.speedBonus;
            }
          }

          setEarnedPoints(points);
          const newScore = scoreRef.current + points;
          scoreRef.current = newScore;
          setScore(newScore);

          // Update Firebase
          const effectiveUserId = userId || localStorage.getItem('current-session-userId');
          if (studentsPath && effectiveUserId) {
            update(ref(db, `${studentsPath}/${effectiveUserId}`), {
              nteScore: newScore
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [gamePath, studentsPath, userId]);

  // Listen for leaderboard
  useEffect(() => {
    if (!studentsPath) return;

    const db = getDatabase();
    const studentsRef = ref(db, studentsPath);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName || 'Student',
        score: s.nteScore || 0,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '\uD83C\uDFB5'
      }));

      const sorted = [...list].sort((a, b) => b.score - a.score);
      setLeaderboard(sorted);

      const myIndex = sorted.findIndex(s => s.id === userId);
      if (myIndex !== -1) {
        setMyRank(myIndex + 1);
      }
    });

    return () => unsubscribe();
  }, [studentsPath, userId]);

  // Submit answer
  const submitAnswer = (answerId) => {
    if (answerSubmitted || gamePhase !== 'guessing') return;

    selectedAnswerRef.current = answerId;
    setSelectedAnswer(answerId);
    setAnswerSubmitted(true);

    // Send to Firebase so teacher can track responses
    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        nteAnswer: {
          answer: answerId,
          answeredAt: Date.now(),
          questionId: currentQuestion
        }
      });
    }
  };

  const getAnswerInfo = (id) => ANSWERS.find(a => a.id === id);

  // ============ FINISHED PHASE ============
  if (gamePhase === 'finished') {
    const myLeaderboardEntry = leaderboard.find(s => s.id === userId);
    const displayScore = score > 0 ? score : (myLeaderboardEntry?.score ?? score);

    const getRankEmoji = (rank) => {
      if (rank === 1) return '\uD83E\uDD47';
      if (rank === 2) return '\uD83E\uDD48';
      if (rank === 3) return '\uD83E\uDD49';
      return `#${rank}`;
    };

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 overflow-auto">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">{'\uD83C\uDFC6'}</div>

          <div
            className="inline-flex flex-col items-center px-8 py-4 rounded-2xl mb-4 shadow-lg"
            style={{ backgroundColor: playerColor }}
          >
            <span className="text-4xl mb-1">{playerEmoji}</span>
            <span className="text-2xl font-bold text-white">{playerName}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl">{getRankEmoji(myRank)}</span>
              {myRank && myRank <= 3 && (
                <span className="text-xl font-bold text-white">
                  {myRank === 1 ? '1st Place!' : myRank === 2 ? '2nd Place!' : '3rd Place!'}
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Game Complete!</h1>

          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-4 mb-4 inline-block">
            <div className="text-4xl font-bold text-gray-900 mb-1">{displayScore}</div>
            <div className="text-lg text-gray-800">
              {displayScore}/{totalQuestions * SCORING.correct} possible
            </div>
          </div>

          {/* Mini Leaderboard */}
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <h3 className="text-sm font-bold text-white/70 mb-2">Class Leaderboard</h3>
            <div className="space-y-1">
              {leaderboard.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-2 px-2 py-1 rounded ${
                    student.id === userId ? 'bg-purple-500/50 ring-2 ring-purple-300' : ''
                  }`}
                >
                  <span className="w-6 text-center font-bold text-sm text-white">
                    {idx === 0 ? '\uD83E\uDD47' : idx === 1 ? '\uD83E\uDD48' : idx === 2 ? '\uD83E\uDD49' : `#${idx + 1}`}
                  </span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: student.playerColor }}
                  >
                    {student.playerEmoji || student.name.charAt(0)}
                  </div>
                  <span className="flex-1 truncate text-sm text-white">{student.name}</span>
                  <span className="font-bold text-sm text-yellow-300">{student.score}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-purple-200 text-sm">Look at the main screen!</p>
        </div>
      </div>
    );
  }

  // ============ WAITING PHASE ============
  if (gamePhase === 'waiting' || gamePhase === 'setup') {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Name That Element</h1>
          <p className="text-xl text-purple-200 mb-8">Waiting for teacher to start...</p>

          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <span className="text-4xl mb-2 block">{playerEmoji}</span>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
        </div>
      </div>
    );
  }

  // ============ PLAYING / GUESSING / REVEALED PHASES ============
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: playerColor }}
          >
            {playerEmoji}
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: playerColor }}>{playerName}</div>
            <div className="text-sm text-purple-200">Q{currentQuestion + 1}/{totalQuestions}</div>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl">
          <div className="text-2xl font-bold text-yellow-300">{score}</div>
          <div className="text-xs text-purple-200">points</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Guessing - show 3 large answer buttons */}
        {gamePhase === 'guessing' && !answerSubmitted && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Is it Dynamics, Tempo, or Form?
            </h2>
            <p className="text-purple-200 text-sm mb-6">Listen to the main screen, then tap your answer:</p>

            <div className="flex flex-col gap-4 w-full max-w-md">
              {ANSWERS.map(answer => (
                <button
                  key={answer.id}
                  onClick={() => submitAnswer(answer.id)}
                  className={`w-full py-6 px-6 rounded-2xl text-center transition-all hover:scale-[1.03] active:scale-95 text-white bg-gradient-to-r ${answer.bgClass} shadow-lg`}
                  style={{ minHeight: '80px' }}
                >
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-4xl">{answer.emoji}</span>
                    <span className="text-3xl font-black tracking-wide">{answer.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Answer submitted - waiting for reveal */}
        {gamePhase === 'guessing' && answerSubmitted && selectedAnswer && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-8 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-xl text-white font-bold mb-3">Answer Submitted!</p>
              <div
                className="inline-flex items-center gap-3 px-8 py-3 rounded-full text-white font-bold text-2xl"
                style={{ backgroundColor: getAnswerInfo(selectedAnswer)?.color }}
              >
                <span className="text-3xl">{getAnswerInfo(selectedAnswer)?.emoji}</span>
                {getAnswerInfo(selectedAnswer)?.label}
              </div>
              <p className="text-sm text-purple-300 mt-4">Waiting for teacher to reveal...</p>
            </div>
          </div>
        )}

        {/* Revealed */}
        {gamePhase === 'revealed' && correctAnswer && (
          <div className="text-center w-full max-w-md">
            {wasCorrect ? (
              <div className="bg-green-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-green-400 mb-2">Correct!</p>
                <p className="text-xl text-white">
                  +{earnedPoints} points{earnedPoints > SCORING.correct ? ' (speed bonus!)' : ''}
                </p>
              </div>
            ) : wasCorrect === false ? (
              <div className="bg-red-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-red-400 mb-2">Not quite!</p>
              </div>
            ) : (
              <div className="bg-gray-500/30 rounded-2xl p-6 mb-4">
                <p className="text-2xl font-bold text-gray-300 mb-2">No answer</p>
              </div>
            )}

            {/* Show correct answer */}
            {(() => {
              const correctInfo = getAnswerInfo(correctAnswer);
              if (!correctInfo) return null;
              return (
                <div
                  className="rounded-2xl p-6 text-white"
                  style={{ backgroundColor: correctInfo.color }}
                >
                  <div className="text-5xl mb-2">{correctInfo.emoji}</div>
                  <div className="text-4xl font-black">{correctInfo.label}</div>
                </div>
              );
            })()}

            <p className="text-purple-200 mt-4 text-sm">Waiting for next question...</p>
          </div>
        )}

        {/* Playing - waiting for question to appear */}
        {gamePhase === 'playing' && (
          <div className="text-center">
            <p className="text-xl text-purple-200">Get ready...</p>
            <p className="text-sm text-purple-300 mt-2">Watch the main screen</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameThatElementStudentView;
