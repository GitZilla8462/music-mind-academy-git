// File: SectionSpotterStudentView.jsx
// Section Spotter - Student View (syncs with teacher's class game)
// Students listen to audio on teacher's speakers, then tap A, B, or C on their device

import React, { useState, useEffect, useRef } from 'react';
import { Check, Trophy } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';
import { SCORING, calculateSpeedBonus, getSectionByLabel, getPieceConfig } from './sectionSpotterConfig';

const SectionSpotterStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [playerEmoji, setPlayerEmoji] = useState('🎵');
  const [score, setScore] = useState(0);

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(6);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [playStartTime, setPlayStartTime] = useState(null);
  const [gamePieceId, setGamePieceId] = useState('fur-elise');

  // Derive section options from the piece the teacher selected
  const sectionOptions = getPieceConfig(gamePieceId).sectionOptions;

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

  // Refs to avoid stale closures
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

  // Keep refs in sync
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { selectedAnswerRef.current = selectedAnswer; }, [selectedAnswer]);
  useEffect(() => { wasCorrectRef.current = wasCorrect; }, [wasCorrect]);
  useEffect(() => { playStartTimeRef.current = playStartTime; }, [playStartTime]);

  // Listen for game state updates from teacher
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const gameRef = ref(db, `sessions/${sessionCode}/sectionSpotter`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setGamePhase('waiting');
        return;
      }

      setGamePhase(data.phase || 'waiting');
      setCurrentQuestion(data.currentQuestion || 0);
      setTotalQuestions(data.totalQuestions || 6);
      if (data.pieceId) setGamePieceId(data.pieceId);

      if (data.phase === 'playing' || data.phase === 'guessing') {
        // Reset score when new game starts
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
          setEarnedPoints(0);
          setCorrectAnswer(null);
        }

        if (data.phase === 'guessing' && data.playStartTime) {
          playStartTimeRef.current = data.playStartTime;
          setPlayStartTime(data.playStartTime);
        }
      }

      // Restore score from Firebase if remounted
      if (data.phase === 'finished') {
        const effectiveUserId = userId || localStorage.getItem('current-session-userId');
        if (effectiveUserId && scoreRef.current === 0) {
          get(ref(db, `sessions/${sessionCode}/studentsJoined/${effectiveUserId}/sectionSpotterScore`))
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

          wasCorrectRef.current = isCorrect;
          setWasCorrect(isCorrect);

          let points = 0;
          if (isCorrect) {
            points = SCORING.correct;
            const answerTime = Date.now() - (playStartTimeRef.current || Date.now());
            points += calculateSpeedBonus(answerTime);
          }

          setEarnedPoints(points);
          const newScore = scoreRef.current + points;
          scoreRef.current = newScore;
          setScore(newScore);

          const effectiveUserId = userId || localStorage.getItem('current-session-userId');
          if (sessionCode && effectiveUserId) {
            update(ref(db, `sessions/${sessionCode}/studentsJoined/${effectiveUserId}`), {
              sectionSpotterScore: newScore
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
        score: s.sectionSpotterScore || 0,
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
  const submitAnswer = (sectionLabel) => {
    if (answerSubmitted || gamePhase !== 'guessing') return;

    selectedAnswerRef.current = sectionLabel;
    setSelectedAnswer(sectionLabel);
    setAnswerSubmitted(true);

    if (sessionCode && userId) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        sectionSpotterAnswer: sectionLabel,
        sectionSpotterAnswerTime: Date.now()
      });
    }
  };

  const correctSection = correctAnswer ? getSectionByLabel(correctAnswer, sectionOptions) : null;
  const selectedSection = selectedAnswer ? getSectionByLabel(selectedAnswer, sectionOptions) : null;

  // ============ FINISHED PHASE ============
  if (gamePhase === 'finished') {
    const myLeaderboardEntry = leaderboard.find(s => s.id === userId);
    const displayScore = score > 0 ? score : (myLeaderboardEntry?.score ?? score);

    const getRankEmoji = (rank) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };

    return (
      <div className="h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 flex items-center justify-center p-4 overflow-auto">
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
                    student.id === userId ? 'bg-amber-500/50 ring-2 ring-amber-300' : ''
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

          <p className="text-amber-200 text-sm">Look at the main screen!</p>
        </div>
      </div>
    );
  }

  // ============ WAITING / SETUP PHASE ============
  if (gamePhase === 'waiting' || gamePhase === 'setup') {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔤 Section Spotter
          </h1>
          <p className="text-xl text-amber-200 mb-8">
            Waiting for teacher to start...
          </p>

          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <span className="text-4xl mb-2 block">{playerEmoji}</span>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
        </div>
      </div>
    );
  }

  // ============ GUESSING / REVEALED PHASES ============
  return (
    <div className="h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 flex flex-col p-4">
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
            <div className="text-sm text-amber-200">Section {currentQuestion + 1}/{totalQuestions}</div>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl">
          <div className="text-2xl font-bold text-yellow-300">{score}</div>
          <div className="text-xs text-amber-200">points</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Which section is this?
        </h2>

        {/* Listen icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-orange-500 to-amber-500">
          <span className="text-4xl">🔤</span>
        </div>

        {/* Section answer buttons - 3 large options */}
        {gamePhase === 'guessing' && !answerSubmitted && (
          <>
            <p className="text-amber-200 text-sm mb-4">Tap your answer:</p>
            <div className={`grid ${sectionOptions.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-4 w-full max-w-lg`}>
              {sectionOptions.map(s => (
                <button
                  key={s.label}
                  onClick={() => submitAnswer(s.label)}
                  className="py-6 px-4 rounded-2xl text-center transition-all hover:scale-105 active:scale-95 text-white"
                  style={{ backgroundColor: s.color, minHeight: '120px' }}
                >
                  <div className="text-5xl font-black mb-2">{s.label}</div>
                  <div className="text-sm font-bold opacity-90">{s.description}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Answer submitted - waiting for reveal */}
        {gamePhase === 'guessing' && answerSubmitted && selectedSection && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-8 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-xl text-white font-bold mb-2">Answer Submitted!</p>
              <div
                className="inline-block px-8 py-3 rounded-full text-white font-bold text-3xl mb-2"
                style={{ backgroundColor: selectedSection.color }}
              >
                {selectedSection.emoji} Section {selectedSection.label}
              </div>
              <p className="text-sm text-amber-300 mt-4">Waiting for teacher to reveal...</p>
            </div>
          </div>
        )}

        {/* Revealed */}
        {gamePhase === 'revealed' && correctSection && (
          <div className="text-center w-full max-w-md">
            {wasCorrect ? (
              <div className="bg-green-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-green-400 mb-2">Correct!</p>
                <p className="text-xl text-white">+{earnedPoints} points{earnedPoints > SCORING.correct ? ' (speed bonus!)' : ''}</p>
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
              style={{ backgroundColor: correctSection.color }}
            >
              <div className="text-6xl font-black mb-1">{correctSection.label}</div>
              <div className="text-2xl font-bold">{correctSection.description}</div>
            </div>

            <p className="text-amber-200 mt-4 text-sm">Waiting for next section...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionSpotterStudentView;
