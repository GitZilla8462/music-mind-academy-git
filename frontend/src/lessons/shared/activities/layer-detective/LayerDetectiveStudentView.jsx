// File: /src/lessons/shared/activities/layer-detective/LayerDetectiveStudentView.jsx
// Layer Detective - Student View (syncs with teacher's class game)
// Students answer on their devices, teacher controls the pace
// Simple: Just guess 1, 2, or 3 layers - then see what they were

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Check, Trophy } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { generatePlayerName, getPlayerColor } from './nameGenerator';

// Answer options (1, 2, 3)
const ANSWERS = [
  { id: '1', label: '1 Layer', color: '#3B82F6' },
  { id: '2', label: '2 Layers', color: '#8B5CF6' },
  { id: '3', label: '3 Layers', color: '#EC4899' }
];

// Scoring
const SCORING = {
  correct: 10,
  speedBonus: 5,
  speedThreshold: 5000 // 5 seconds for speed bonus
};

const LayerDetectiveStudentView = ({ onComplete, isSessionMode = true, forceFinished = false }) => {
  const { sessionCode, userId: contextUserId } = useSession();

  // Fallback: if context userId is null, try localStorage (fixes race condition on Chromebooks)
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  // Player info (no emoji)
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [score, setScore] = useState(0);

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, playing, guessing, revealed, finished
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [correctInstruments, setCorrectInstruments] = useState([]);
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

  // Audio refs (not used for playback, but for cleanup)
  const audioRefs = useRef([]);

  // Generate player name on mount (no emoji)
  useEffect(() => {
    if (userId) {
      const name = generatePlayerName(userId);
      const color = getPlayerColor(userId);

      setPlayerName(name);
      setPlayerColor(color);

      // Save to Firebase
      if (sessionCode) {
        const db = getDatabase();
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
          playerName: name,
          playerColor: color,
          layerDetectiveScore: 0
        });
      }
    }
  }, [userId, sessionCode]);

  // Listen for game state updates from teacher
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const gameRef = ref(db, `sessions/${sessionCode}/layerDetective`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Update game phase
      setGamePhase(data.phase || 'waiting');
      setCurrentQuestion(data.currentQuestion || 0);
      setTotalQuestions(data.totalQuestions || 10);

      // Handle phase changes
      if (data.phase === 'playing' || data.phase === 'guessing') {
        // New game starting - reset score when going back to question 0
        if (data.currentQuestion === 0 && currentQuestion !== 0) {
          setScore(0);
        }

        // New question - reset answers
        if (data.currentQuestion !== currentQuestion) {
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
          setWasCorrect(null);
          setEarnedPoints(0);
          setCorrectAnswer(null);
          setCorrectInstruments([]);
        }

        // When teacher plays audio, students can start answering
        if (data.isPlaying) {
          setPlayStartTime(data.playStartTime);
          setGamePhase('guessing');
        }
      }

      // Handle reveal
      if (data.phase === 'revealed' && data.correctAnswer) {
        setCorrectAnswer(data.correctAnswer);
        setCorrectInstruments(data.correctInstruments || []);

        // Calculate score if answered
        if (selectedAnswer && wasCorrect === null) {
          const isCorrect = selectedAnswer === data.correctAnswer;
          setWasCorrect(isCorrect);

          let points = 0;
          if (isCorrect) {
            points = SCORING.correct;
            const answerTime = Date.now() - playStartTime;
            if (answerTime < SCORING.speedThreshold) {
              points += SCORING.speedBonus;
            }
          }

          setEarnedPoints(points);
          const newScore = score + points;
          setScore(newScore);

          // Update Firebase - re-fetch userId from localStorage as extra safety for race condition
          const effectiveUserId = userId || localStorage.getItem('current-session-userId');
          if (sessionCode && effectiveUserId) {
            const db = getDatabase();
            update(ref(db, `sessions/${sessionCode}/studentsJoined/${effectiveUserId}`), {
              layerDetectiveScore: newScore
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [sessionCode, currentQuestion, selectedAnswer, score, playStartTime, wasCorrect, userId, contextUserId]);

  // Listen for leaderboard updates (for results display)
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName || 'Student',
        score: s.layerDetectiveScore || 0,
        playerColor: s.playerColor || '#3B82F6'
      }));

      // Sort by score descending
      const sorted = [...list].sort((a, b) => b.score - a.score);
      setLeaderboard(sorted);

      // Find my rank
      const myIndex = sorted.findIndex(s => s.id === userId);
      if (myIndex !== -1) {
        setMyRank(myIndex + 1);
      }
    });

    return () => unsubscribe();
  }, [sessionCode, userId]);

  // Submit answer
  const submitAnswer = (answerId) => {
    if (answerSubmitted || gamePhase !== 'guessing') return;

    setSelectedAnswer(answerId);
    setAnswerSubmitted(true);

    // Send to Firebase
    if (sessionCode && userId) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        layerDetectiveAnswer: answerId,
        layerDetectiveAnswerTime: Date.now()
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  // ============ WAITING PHASE ============
  if (gamePhase === 'waiting') {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Layer Detective</h1>
          <p className="text-xl text-purple-200 mb-8">Waiting for teacher to start...</p>

          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: playerColor }}
            >
              {playerName.charAt(0)}
            </div>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
        </div>
      </div>
    );
  }

  // ============ GAME FINISHED - Waiting for teacher to show results ============
  if (gamePhase === 'finished') {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-4">Game Complete!</h1>
          <div className="bg-white/10 rounded-2xl p-6 inline-block mb-4">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: playerColor }}
            >
              {playerName.charAt(0)}
            </div>
            <div className="text-xl font-bold" style={{ color: playerColor }}>{playerName}</div>
            <div className="text-3xl font-bold text-yellow-300 mt-2">{score} pts</div>
          </div>
          <p className="text-purple-200">Waiting for teacher to show results...</p>
        </div>
      </div>
    );
  }

  // ============ RESULTS PHASE (only shown on results slide) ============
  if (forceFinished) {
    const getRankEmoji = (rank) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };

    const totalStudents = leaderboard.length;

    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 overflow-auto">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">🏆</div>

          {/* Your Result - Prominent display */}
          <div
            className="inline-flex flex-col items-center px-8 py-4 rounded-2xl mb-4 shadow-lg"
            style={{ backgroundColor: playerColor }}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white mb-2">
              {playerName.charAt(0)}
            </div>
            <span className="text-2xl font-bold text-white">{playerName}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl">{getRankEmoji(myRank)}</span>
              {myRank && myRank <= 3 && (
                <span className="text-xl font-bold text-white">
                  {myRank === 1 ? '1st Place!' : myRank === 2 ? '2nd Place!' : '3rd Place!'}
                </span>
              )}
              {myRank && myRank > 3 && (
                <span className="text-xl font-bold text-white">of {totalStudents}</span>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Game Complete!</h1>

          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-4 mb-4 inline-block">
            <div className="text-4xl font-bold text-gray-900 mb-1">{score}</div>
            <div className="text-lg text-gray-800">Your Score</div>
          </div>

          {/* Mini Leaderboard - Top 5 */}
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
                    {student.name.charAt(0)}
                  </div>
                  <span className="flex-1 truncate text-sm text-white">{student.name}</span>
                  <span className="font-bold text-sm text-yellow-300">{student.score}</span>
                </div>
              ))}
            </div>
            {myRank && myRank > 5 && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/50 ring-2 ring-purple-300 rounded">
                  <span className="w-6 text-center font-bold text-sm text-white">#{myRank}</span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: playerColor }}
                  >
                    {playerName.charAt(0)}
                  </div>
                  <span className="flex-1 truncate text-sm text-white">{playerName}</span>
                  <span className="font-bold text-sm text-yellow-300">{score}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ PLAYING / GUESSING / REVEALED PHASES ============
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: playerColor }}
          >
            {playerName.charAt(0)}
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
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          How many layers do you hear?
        </h2>

        {/* Audio indicator - listen to teacher's screen */}
        <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-purple-500 to-pink-500">
          <Volume2 size={56} className="text-white" />
        </div>

        {/* Layer answer buttons */}
        {gamePhase === 'guessing' && !answerSubmitted && (
          <>
            <p className="text-purple-200 text-sm mb-4">Listen to the teacher's screen, then tap your answer:</p>
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
              {ANSWERS.map(answer => (
                <button
                  key={answer.id}
                  onClick={() => submitAnswer(answer.id)}
                  className="p-6 rounded-2xl text-center transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: answer.color }}
                >
                  <div className="text-4xl font-bold text-white mb-1">{answer.id}</div>
                  <div className="text-sm text-white/80">{answer.label}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Answer submitted - waiting for reveal */}
        {gamePhase === 'guessing' && answerSubmitted && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-8 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-xl text-white font-bold mb-2">Answer Submitted!</p>
              <p className="text-purple-200">You picked: <span className="font-bold text-white text-2xl">{selectedAnswer}</span> layer{selectedAnswer !== '1' ? 's' : ''}</p>
              <p className="text-sm text-purple-300 mt-4">Waiting for teacher to reveal...</p>
            </div>
          </div>
        )}

        {/* Revealed */}
        {gamePhase === 'revealed' && (
          <div className="text-center w-full max-w-md">
            {wasCorrect ? (
              <div className="bg-green-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-green-400 mb-2">Correct!</p>
                <p className="text-xl text-white">+{earnedPoints} points</p>
                {earnedPoints > SCORING.correct && (
                  <p className="text-sm text-yellow-300 mt-1">Speed bonus!</p>
                )}
              </div>
            ) : wasCorrect === false ? (
              <div className="bg-red-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-red-400 mb-2">Not quite!</p>
                <p className="text-xl text-white">
                  It was <span className="font-bold">{correctAnswer}</span> layer{correctAnswer !== '1' ? 's' : ''}
                </p>
              </div>
            ) : (
              <div className="bg-gray-500/30 rounded-2xl p-6 mb-4">
                <p className="text-2xl font-bold text-gray-300 mb-2">No answer</p>
                <p className="text-xl text-white">
                  It was <span className="font-bold">{correctAnswer}</span> layer{correctAnswer !== '1' ? 's' : ''}
                </p>
              </div>
            )}

            {/* Show what the layers were */}
            {correctInstruments.length > 0 && (
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-purple-200 text-sm mb-3">The layers were:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {correctInstruments.map(inst => (
                    <span
                      key={inst}
                      className="px-4 py-2 rounded-full text-white font-bold bg-purple-500"
                    >
                      {inst}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-purple-200 mt-6 text-sm">Waiting for next question...</p>
          </div>
        )}

        {/* Playing - waiting for audio */}
        {gamePhase === 'playing' && (
          <div className="text-center">
            <p className="text-xl text-purple-200">Get ready to listen...</p>
            <p className="text-sm text-purple-300 mt-2">Watch the teacher's screen</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayerDetectiveStudentView;
