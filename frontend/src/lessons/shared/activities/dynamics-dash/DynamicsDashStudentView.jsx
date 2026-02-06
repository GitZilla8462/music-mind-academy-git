// File: /src/lessons/shared/activities/dynamics-dash/DynamicsDashStudentView.jsx
// Dynamics Dash - Student View (syncs with teacher's class game)
// Students answer on their devices, teacher controls the pace and plays audio
// No audio playback on student side - just 6 dynamic buttons

import React, { useState, useEffect, useRef } from 'react';
import { Check, Trophy, Volume2 } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';
import { DYNAMICS, GRADUAL_DYNAMICS } from './dynamicsDashConfig';

// Scoring
const SCORING = {
  correct: 10,
  partialCredit: 5,
  speedBonus: 5,
  speedThreshold: 5000 // 5 seconds for speed bonus
};

const DynamicsDashStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [playerEmoji, setPlayerEmoji] = useState('🎵');
  const [score, setScore] = useState(0);

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, playing, guessing, revealed, finished
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(9);
  const [questionType, setQuestionType] = useState('level'); // 'level' or 'gradual'
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [playStartTime, setPlayStartTime] = useState(null);

  // Student's answer
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Results
  const [wasCorrect, setWasCorrect] = useState(null);
  const [wasPartial, setWasPartial] = useState(false);
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

      if (sessionCode) {
        try {
          const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);
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
      if (sessionCode) {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
          playerName: name,
          playerColor: color,
          playerEmoji: emoji
        });
      }
    };

    assignPlayerName();
  }, [userId, sessionCode]);

  // Keep refs in sync with state
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { selectedAnswerRef.current = selectedAnswer; }, [selectedAnswer]);
  useEffect(() => { wasCorrectRef.current = wasCorrect; }, [wasCorrect]);
  useEffect(() => { playStartTimeRef.current = playStartTime; }, [playStartTime]);

  // Listen for game state updates from teacher
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const gameRef = ref(db, `sessions/${sessionCode}/dynamicsDash`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        // No game data yet - stay in waiting
        setGamePhase('waiting');
        return;
      }

      setGamePhase(data.phase || 'waiting');
      setCurrentQuestion(data.currentQuestion || 0);
      setTotalQuestions(data.totalQuestions || 9);
      setQuestionType(data.questionType || 'level');

      // Handle phase changes
      if (data.phase === 'playing' || data.phase === 'guessing') {
        // New game starting - reset score when on question 0
        if (data.currentQuestion === 0 && scoredQuestionRef.current === -1 && scoreRef.current > 0) {
          scoreRef.current = 0;
          setScore(0);
        }
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
          setWasPartial(false);
          setEarnedPoints(0);
          setCorrectAnswer(null);
        }

        // When teacher plays audio, students can start answering
        if (data.isPlaying) {
          playStartTimeRef.current = data.playStartTime;
          setPlayStartTime(data.playStartTime);
          setGamePhase('guessing');
        }
      }

      // Handle finished - restore score from Firebase if component remounted
      if (data.phase === 'finished') {
        const effectiveUserId = userId || localStorage.getItem('current-session-userId');
        if (effectiveUserId && scoreRef.current === 0) {
          get(ref(db, `sessions/${sessionCode}/studentsJoined/${effectiveUserId}/dynamicsDashScore`))
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
      if (data.phase === 'revealed' && data.correctAnswer) {
        setCorrectAnswer(data.correctAnswer);

        const questionNum = data.currentQuestion || 0;

        if (selectedAnswerRef.current && wasCorrectRef.current === null && scoredQuestionRef.current !== questionNum) {
          scoredQuestionRef.current = questionNum;

          const answer = selectedAnswerRef.current;
          const isCorrect = answer === data.correctAnswer;
          // Check partial credit - only for level questions, not gradual
          let isPartial = false;
          if (!isCorrect && data.questionType !== 'gradual') {
            const guessIdx = DYNAMICS.findIndex(d => d.symbol === answer);
            const correctIdx = DYNAMICS.findIndex(d => d.symbol === data.correctAnswer);
            isPartial = guessIdx >= 0 && correctIdx >= 0 && Math.abs(guessIdx - correctIdx) === 1;
          }

          wasCorrectRef.current = isCorrect;
          setWasCorrect(isCorrect);
          setWasPartial(isPartial);

          let points = 0;
          if (isCorrect) {
            points = SCORING.correct;
            const answerTime = Date.now() - (playStartTimeRef.current || Date.now());
            if (answerTime < SCORING.speedThreshold) {
              points += SCORING.speedBonus;
            }
          } else if (isPartial) {
            points = SCORING.partialCredit;
          }

          setEarnedPoints(points);
          const newScore = scoreRef.current + points;
          scoreRef.current = newScore;
          setScore(newScore);

          // Update Firebase
          const effectiveUserId = userId || localStorage.getItem('current-session-userId');
          if (sessionCode && effectiveUserId) {
            update(ref(db, `sessions/${sessionCode}/studentsJoined/${effectiveUserId}`), {
              dynamicsDashScore: newScore
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [sessionCode, userId]);

  // Listen for leaderboard
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName || 'Student',
        score: s.dynamicsDashScore || 0,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '🎵'
      }));

      const sorted = [...list].sort((a, b) => b.score - a.score);
      setLeaderboard(sorted);

      const myIndex = sorted.findIndex(s => s.id === userId);
      if (myIndex !== -1) {
        setMyRank(myIndex + 1);
      }
    });

    return () => unsubscribe();
  }, [sessionCode, userId]);

  // Submit answer
  const submitAnswer = (dynamicSymbol) => {
    if (answerSubmitted || gamePhase !== 'guessing') return;

    selectedAnswerRef.current = dynamicSymbol;
    setSelectedAnswer(dynamicSymbol);
    setAnswerSubmitted(true);

    // Send to Firebase so teacher can track
    if (sessionCode && userId) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        dynamicsDashAnswer: dynamicSymbol,
        dynamicsDashAnswerTime: Date.now()
      });
    }
  };

  const getDynamicInfo = (symbol) => {
    return DYNAMICS.find(d => d.symbol === symbol) || GRADUAL_DYNAMICS.find(d => d.symbol === symbol);
  };
  const correctDynamic = correctAnswer ? getDynamicInfo(correctAnswer) : null;
  const selectedDynamic = selectedAnswer ? getDynamicInfo(selectedAnswer) : null;

  // ============ FINISHED PHASE ============
  if (gamePhase === 'finished') {
    // Use Firebase-sourced score from leaderboard as fallback if local state was reset
    const myLeaderboardEntry = leaderboard.find(s => s.id === userId);
    const displayScore = score > 0 ? score : (myLeaderboardEntry?.score ?? score);

    const getRankEmoji = (rank) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };

    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4 overflow-auto">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">🏆</div>

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
            <div className="text-lg text-gray-800">Your Score</div>
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
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
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

  // ============ WAITING PHASE (includes 'setup' - before teacher starts game) ============
  if (gamePhase === 'waiting' || gamePhase === 'setup') {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Dynamics Dash</h1>
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
    <div className="h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
        {/* Question */}
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {questionType === 'gradual'
            ? 'Crescendo or Decrescendo?'
            : 'What is the dynamic level?'}
        </h2>

        {/* Audio indicator - listen to teacher's screen */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-purple-500 to-blue-500">
          <Volume2 size={40} className="text-white" />
        </div>

        {/* Dynamic answer buttons - different options based on question type */}
        {gamePhase === 'guessing' && !answerSubmitted && (
          <>
            <p className="text-purple-200 text-sm mb-4">Listen to the main screen, then tap your answer:</p>
            {questionType === 'gradual' ? (
              <div className="flex gap-4 w-full max-w-md justify-center">
                {GRADUAL_DYNAMICS.map(d => (
                  <button
                    key={d.symbol}
                    onClick={() => submitAnswer(d.symbol)}
                    className="flex-1 p-6 rounded-2xl text-center transition-all hover:scale-105 active:scale-95 text-white"
                    style={{ backgroundColor: d.color }}
                  >
                    <div className="text-2xl font-bold">{d.name}</div>
                    <div className="text-sm opacity-90">{d.meaning}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {DYNAMICS.map(d => (
                  <button
                    key={d.symbol}
                    onClick={() => submitAnswer(d.symbol)}
                    className="p-4 rounded-2xl text-center transition-all hover:scale-105 active:scale-95 text-white"
                    style={{ backgroundColor: d.color }}
                  >
                    <div className="text-3xl font-bold">{d.symbol}</div>
                    <div className="text-sm">{d.name}</div>
                    <div className="text-xs opacity-90">({d.meaning.toLowerCase()})</div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Answer submitted - waiting for reveal */}
        {gamePhase === 'guessing' && answerSubmitted && selectedDynamic && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-8 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-xl text-white font-bold mb-2">Answer Submitted!</p>
              <div
                className="inline-block px-6 py-2 rounded-full text-white font-bold text-2xl mb-2"
                style={{ backgroundColor: selectedDynamic.color }}
              >
                {questionType === 'gradual' ? selectedDynamic.name : selectedDynamic.symbol}
              </div>
              <p className="text-purple-200 text-sm">
                {questionType === 'gradual'
                  ? selectedDynamic.meaning
                  : `${selectedDynamic.name} (${selectedDynamic.meaning.toLowerCase()})`}
              </p>
              <p className="text-sm text-purple-300 mt-4">Waiting for teacher to reveal...</p>
            </div>
          </div>
        )}

        {/* Revealed */}
        {gamePhase === 'revealed' && correctDynamic && (
          <div className="text-center w-full max-w-md">
            {wasCorrect ? (
              <div className="bg-green-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-green-400 mb-2">Correct!</p>
                <p className="text-xl text-white">+{earnedPoints} points{earnedPoints > SCORING.correct ? ' (speed bonus!)' : ''}</p>
              </div>
            ) : wasPartial ? (
              <div className="bg-yellow-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-yellow-400 mb-2">Close!</p>
                <p className="text-xl text-white">+{earnedPoints} points (partial credit)</p>
                <p className="text-sm text-white/80 mt-1">Just one level off!</p>
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
            <div
              className="rounded-2xl p-6 text-white"
              style={{ backgroundColor: correctDynamic.color }}
            >
              {questionType === 'gradual' ? (
                <>
                  <div className="text-4xl font-black mb-1">{correctDynamic.name}</div>
                  <div className="text-xl opacity-90">{correctDynamic.meaning}</div>
                </>
              ) : (
                <>
                  <div className="text-5xl font-black mb-1">{correctDynamic.symbol}</div>
                  <div className="text-xl font-bold">{correctDynamic.name}</div>
                  <div className="text-lg opacity-90">{correctDynamic.meaning}</div>
                </>
              )}
            </div>

            <p className="text-purple-200 mt-4 text-sm">Waiting for next question...</p>
          </div>
        )}

        {/* Playing - waiting for audio */}
        {gamePhase === 'playing' && (
          <div className="text-center">
            <p className="text-xl text-purple-200">Get ready to listen...</p>
            <p className="text-sm text-purple-300 mt-2">Watch the main screen</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicsDashStudentView;
