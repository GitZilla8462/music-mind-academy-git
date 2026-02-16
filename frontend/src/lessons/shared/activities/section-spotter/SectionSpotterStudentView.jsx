// File: SectionSpotterStudentView.jsx
// Section Spotter - Student View (Q&A format)
// Syncs with teacher's game. Students answer questions about dynamics, instruments, and tempo.
// 3 rounds (Section A, B, A'), 3 questions per round.
// No audio on student side — teacher plays audio on main screen.

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, Trophy } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';
import { QA_SCORING, calculateQASpeedBonus } from './sectionSpotterConfig';

const SectionSpotterStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [playerEmoji, setPlayerEmoji] = useState('\uD83C\uDFB5');
  const [score, setScore] = useState(0);

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionData, setQuestionData] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Student's answer
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Results
  const [wasCorrect, setWasCorrect] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [revealedAnswer, setRevealedAnswer] = useState(null);
  const [revealedLabel, setRevealedLabel] = useState(null);
  const [revealedExplanation, setRevealedExplanation] = useState(null);

  // Leaderboard for finished phase
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);

  // Track scored questions to avoid double-scoring
  const scoredKeyRef = useRef('');

  // Refs to avoid stale closures
  const scoreRef = useRef(0);
  const selectedAnswerRef = useRef(null);
  const wasCorrectRef = useRef(null);
  const questionStartTimeRef = useRef(null);

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
  useEffect(() => { selectedAnswerRef.current = selectedAnswer; }, [selectedAnswer]);
  useEffect(() => { wasCorrectRef.current = wasCorrect; }, [wasCorrect]);
  useEffect(() => { questionStartTimeRef.current = questionStartTime; }, [questionStartTime]);

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

      const phase = data.phase || 'waiting';
      const round = data.currentRound || 0;
      const qIdx = data.currentQuestion || 0;

      setGamePhase(phase);
      setCurrentRound(round);
      setCurrentQuestion(qIdx);

      // Question phase — receive question data
      if (phase === 'question') {
        const qKey = `${round}-${qIdx}`;

        // New question — reset answer state
        if (data.questionData && scoredKeyRef.current !== qKey) {
          // Only reset if this is a genuinely new question
          if (selectedAnswerRef.current !== null || wasCorrectRef.current !== null) {
            // We had a previous answer — this means a new question arrived
          }
          setQuestionData(data.questionData);
          setSelectedAnswer(null);
          selectedAnswerRef.current = null;
          setAnswerSubmitted(false);
          setWasCorrect(null);
          wasCorrectRef.current = null;
          setEarnedPoints(0);
          setRevealedAnswer(null);
          setRevealedLabel(null);
          setRevealedExplanation(null);

          if (data.questionStartTime) {
            questionStartTimeRef.current = data.questionStartTime;
            setQuestionStartTime(data.questionStartTime);
          }
        }
      }

      // Listening phase — students watch main screen
      if (phase === 'listening') {
        setQuestionData(null);
        setSelectedAnswer(null);
        selectedAnswerRef.current = null;
        setAnswerSubmitted(false);
        setWasCorrect(null);
        wasCorrectRef.current = null;
        setEarnedPoints(0);
        setRevealedAnswer(null);

        // Reset score when new game starts (round 0, question 0)
        if (round === 0 && qIdx === 0 && scoreRef.current > 0) {
          scoreRef.current = 0;
          setScore(0);
          scoredKeyRef.current = '';
        }
      }

      // Between-rounds — just wait
      if (phase === 'between-rounds') {
        setQuestionData(null);
      }

      // Revealed — score the answer
      if (phase === 'revealed' && data.revealedAnswer) {
        setRevealedAnswer(data.revealedAnswer);
        setRevealedLabel(data.revealedLabel || null);
        setRevealedExplanation(data.revealedExplanation || null);

        const qKey = `${round}-${qIdx}`;
        if (selectedAnswerRef.current && wasCorrectRef.current === null && scoredKeyRef.current !== qKey) {
          scoredKeyRef.current = qKey;

          const answer = selectedAnswerRef.current;
          const isCorrect = answer === data.revealedAnswer;

          wasCorrectRef.current = isCorrect;
          setWasCorrect(isCorrect);

          let points = 0;
          if (isCorrect) {
            points = QA_SCORING.correct;
            points += calculateQASpeedBonus(Date.now(), questionStartTimeRef.current || Date.now());
          }

          setEarnedPoints(points);
          const newScore = scoreRef.current + points;
          scoreRef.current = newScore;
          setScore(newScore);

          // Update Firebase
          const effectiveUserId = userId || localStorage.getItem('current-session-userId');
          if (sessionCode && effectiveUserId) {
            update(ref(db, `sessions/${sessionCode}/studentsJoined/${effectiveUserId}`), {
              sectionSpotterScore: newScore
            });
          }
        } else if (!selectedAnswerRef.current && wasCorrectRef.current === null && scoredKeyRef.current !== qKey) {
          // No answer submitted
          scoredKeyRef.current = qKey;
          setWasCorrect(false);
        }
      }

      // Finished — restore score if remounted
      if (phase === 'finished') {
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
  }, [sessionCode, userId]);

  // Submit answer
  const submitAnswer = (optionId) => {
    if (answerSubmitted || gamePhase !== 'question') return;

    selectedAnswerRef.current = optionId;
    setSelectedAnswer(optionId);
    setAnswerSubmitted(true);

    if (sessionCode && userId) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        sectionSpotterAnswer: optionId,
        sectionSpotterAnswerTime: Date.now()
      });
    }
  };

  // Get selected option label
  const getOptionLabel = (optionId) => {
    if (!questionData?.options) return optionId;
    const opt = questionData.options.find(o => o.id === optionId);
    return opt?.label || optionId;
  };

  // Round labels
  const roundLabels = ['Section A', 'Section B', "Section A'"];

  const getRankEmoji = (rank) => {
    if (rank === 1) return '\uD83E\uDD47';
    if (rank === 2) return '\uD83E\uDD48';
    if (rank === 3) return '\uD83E\uDD49';
    return `#${rank}`;
  };

  // ============ FINISHED PHASE ============
  if (gamePhase === 'finished') {
    const myLeaderboardEntry = leaderboard.find(s => s.id === userId);
    const displayScore = score > 0 ? score : (myLeaderboardEntry?.score ?? score);

    return (
      <div className="h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 flex items-center justify-center p-4 overflow-auto">
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

          <p className="text-amber-200 text-sm">Look at the main screen!</p>
        </div>
      </div>
    );
  }

  // ============ WAITING / SETUP / LISTENING / BETWEEN-ROUNDS ============
  if (gamePhase === 'waiting' || gamePhase === 'setup' || gamePhase === 'listening' || gamePhase === 'between-rounds') {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            {'\uD83D\uDD0D'} Section Spotter
          </h1>

          {gamePhase === 'listening' ? (
            <>
              <p className="text-2xl text-amber-200 mb-2">{roundLabels[currentRound]}</p>
              <p className="text-xl text-white/70 mb-8">{'\uD83C\uDFA7'} Listen to the main screen...</p>
            </>
          ) : gamePhase === 'between-rounds' ? (
            <p className="text-xl text-amber-200 mb-8">Getting ready for the next section...</p>
          ) : (
            <p className="text-xl text-amber-200 mb-8">Waiting for teacher to start...</p>
          )}

          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <span className="text-4xl mb-2 block">{playerEmoji}</span>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
            {score > 0 && (
              <div className="text-lg text-yellow-300 mt-2">{score} points</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ QUESTION / REVEALED PHASES ============
  return (
    <div className="h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 flex flex-col p-4">
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
            <div className="text-sm text-amber-200">{roundLabels[currentRound]} — Q{currentQuestion + 1}/3</div>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl">
          <div className="text-2xl font-bold text-yellow-300">{score}</div>
          <div className="text-xs text-amber-200">points</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">

        {/* QUESTION — show answer buttons */}
        {gamePhase === 'question' && questionData && !answerSubmitted && (
          <>
            {/* Category badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-lg font-bold mb-3"
              style={{ backgroundColor: questionData.categoryColor }}
            >
              <span className="text-xl">{questionData.categoryEmoji}</span>
              {questionData.category}
            </div>

            <h2 className="text-2xl font-bold text-white mb-4 text-center px-2">
              {questionData.question}
            </h2>

            <p className="text-amber-200 text-sm mb-4">Tap your answer:</p>

            <div className={`grid ${questionData.options.length <= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 w-full max-w-lg`}>
              {questionData.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => submitAnswer(opt.id)}
                  className="py-5 px-4 rounded-2xl text-center transition-all hover:scale-105 active:scale-95 text-white bg-white/15 border-2 border-white/30 hover:bg-white/25"
                  style={{ minHeight: '70px' }}
                >
                  <div className="text-xl font-bold">{opt.label}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Answer submitted — waiting for reveal */}
        {gamePhase === 'question' && answerSubmitted && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-8 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-xl text-white font-bold mb-2">Answer Submitted!</p>
              <div className="inline-block px-6 py-2 rounded-full text-white font-bold text-2xl mb-2 bg-white/20">
                {getOptionLabel(selectedAnswer)}
              </div>
              <p className="text-sm text-amber-300 mt-4">Waiting for teacher to reveal...</p>
            </div>
          </div>
        )}

        {/* REVEALED — show result */}
        {gamePhase === 'revealed' && (
          <div className="text-center w-full max-w-md">
            {wasCorrect === true ? (
              <div className="bg-green-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-green-400 mb-2">Correct!</p>
                <p className="text-xl text-white">
                  +{earnedPoints} points
                  {earnedPoints > QA_SCORING.correct ? ' (speed bonus!)' : ''}
                </p>
              </div>
            ) : wasCorrect === false && selectedAnswer ? (
              <div className="bg-red-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-red-400 mb-2">Not quite!</p>
                <p className="text-lg text-white/80">You answered: {getOptionLabel(selectedAnswer)}</p>
              </div>
            ) : (
              <div className="bg-gray-500/30 rounded-2xl p-6 mb-4">
                <p className="text-2xl font-bold text-gray-300 mb-2">No answer</p>
              </div>
            )}

            {/* Show correct answer */}
            {revealedLabel && (
              <div
                className="rounded-2xl p-5 text-white mb-2"
                style={{ backgroundColor: questionData?.categoryColor || '#3B82F6' }}
              >
                <div className="text-2xl font-black mb-1">{revealedLabel}</div>
                {revealedExplanation && (
                  <div className="text-base text-white/90">{revealedExplanation}</div>
                )}
              </div>
            )}

            <p className="text-amber-200 mt-4 text-sm">Waiting for next question...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionSpotterStudentView;
