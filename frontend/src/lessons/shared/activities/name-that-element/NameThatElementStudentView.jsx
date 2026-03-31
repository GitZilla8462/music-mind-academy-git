// File: /src/lessons/shared/activities/name-that-element/NameThatElementStudentView.jsx
// Name That Element - Student View (syncs with teacher's class game)
// A/B/C/D answer buttons — single tap to answer
// No audio playback on student side — audio plays on teacher's projector

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { getPlayerColor, getPlayerEmoji, getStudentDisplayName, formatFirstNameLastInitial } from '../layer-detective/nameGenerator';

// A/B/C/D corners — must match teacher game
const CORNERS = [
  { id: 'A', color: '#3B82F6', bgClass: 'from-blue-500 to-blue-700' },
  { id: 'B', color: '#EF4444', bgClass: 'from-red-500 to-red-700' },
  { id: 'C', color: '#10B981', bgClass: 'from-emerald-500 to-emerald-700' },
  { id: 'D', color: '#F59E0B', bgClass: 'from-amber-500 to-amber-700' }
];

// Scoring
const SCORING = {
  correct: 100,
  speedBonus: 50,
  speedThreshold: 5000
};

const NameThatElementStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, classId, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

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

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [playerEmoji, setPlayerEmoji] = useState('🎵');
  const [score, setScore] = useState(0);

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionData, setQuestionData] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [playStartTime, setPlayStartTime] = useState(null);

  // Student's answer
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Results
  const [wasCorrect, setWasCorrect] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);

  // Track scored questions
  const scoredQuestionRef = useRef(-1);

  // Refs for stale closure avoidance
  const scoreRef = useRef(0);
  const currentQuestionRef = useRef(0);
  const selectedAnswerRef = useRef(null);
  const wasCorrectRef = useRef(null);
  const playStartTimeRef = useRef(null);

  // Get player name on mount
  useEffect(() => {
    if (!userId) return;
    const assignPlayerName = async () => {
      const color = getPlayerColor(userId);
      const emoji = getPlayerEmoji(userId);
      const name = await getStudentDisplayName(userId, null, studentsPath);
      setPlayerName(name);
      setPlayerColor(color);
      setPlayerEmoji(emoji);
      if (studentsPath) {
        const db = getDatabase();
        update(ref(db, `${studentsPath}/${userId}`), {
          displayName: name, playerColor: color, playerEmoji: emoji
        });
      }
    };
    assignPlayerName();
  }, [userId, studentsPath]);

  // Keep refs in sync
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
      if (!data) { setGamePhase('waiting'); return; }

      const phase = data.phase === 'question' ? 'guessing' : (data.phase || 'waiting');
      setGamePhase(phase);
      setCurrentQuestion(data.currentQuestion || 0);
      setQuestionData(data.questionData || null);

      if (phase === 'guessing') {
        // Reset score on new round start (question 0)
        if (data.currentQuestion === 0 && scoredQuestionRef.current === -1 && scoreRef.current > 0) {
          scoreRef.current = 0;
          setScore(0);
        }
        if (data.currentQuestion === 0 && currentQuestionRef.current !== 0) {
          scoreRef.current = 0;
          setScore(0);
          scoredQuestionRef.current = -1;
        }

        // New question — reset answer
        if (data.currentQuestion !== currentQuestionRef.current) {
          selectedAnswerRef.current = null;
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
          wasCorrectRef.current = null;
          setWasCorrect(null);
          setEarnedPoints(0);
          setCorrectAnswer(null);
        }

        playStartTimeRef.current = data.startedAt || Date.now();
        setPlayStartTime(data.startedAt || Date.now());
      }

      // Restore score from Firebase if component remounted
      if (phase === 'finished') {
        const effectiveUserId = userId || localStorage.getItem('current-session-userId');
        if (effectiveUserId && scoreRef.current === 0 && studentsPath) {
          get(ref(db, `${studentsPath}/${effectiveUserId}/nteScore`))
            .then(snap => {
              const fbScore = snap.val() || 0;
              if (fbScore > 0) { scoreRef.current = fbScore; setScore(fbScore); }
            })
            .catch(() => {});
        }
      }

      // Handle reveal
      if (phase === 'revealed' && data.revealedAnswer) {
        setCorrectAnswer(data.revealedAnswer);
        const questionNum = data.currentQuestion || 0;

        if (selectedAnswerRef.current && wasCorrectRef.current === null && scoredQuestionRef.current !== questionNum) {
          scoredQuestionRef.current = questionNum;
          const isCorrect = selectedAnswerRef.current === data.revealedAnswer;
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

          const effectiveUserId = userId || localStorage.getItem('current-session-userId');
          if (studentsPath && effectiveUserId) {
            update(ref(db, `${studentsPath}/${effectiveUserId}`), { nteScore: newScore });
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
    const unsubscribe = onValue(ref(db, studentsPath), (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([, s]) => s.displayName || s.playerName || s.name)
        .map(([id, s]) => ({
          id,
          name: formatFirstNameLastInitial(s.displayName || s.playerName || s.name),
          score: s.nteScore || 0,
          playerColor: s.playerColor || '#3B82F6',
          playerEmoji: s.playerEmoji || '🎵'
        }));
      const sorted = [...list].sort((a, b) => b.score - a.score);
      setLeaderboard(sorted);
      const myIndex = sorted.findIndex(s => s.id === userId);
      if (myIndex !== -1) setMyRank(myIndex + 1);
    });
    return () => unsubscribe();
  }, [studentsPath, userId]);

  // Submit answer
  const submitAnswer = (cornerId) => {
    if (answerSubmitted || gamePhase !== 'guessing') return;
    selectedAnswerRef.current = cornerId;
    setSelectedAnswer(cornerId);
    setAnswerSubmitted(true);

    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        nteAnswer: cornerId,
        nteAnswerTime: Date.now()
      });
    }
  };

  const getCornerInfo = (id) => CORNERS.find(c => c.id === id);

  // ============ FINISHED ============
  if (gamePhase === 'finished') {
    const myEntry = leaderboard.find(s => s.id === userId);
    const displayScore = score > 0 ? score : (myEntry?.score ?? score);
    const getRankEmoji = (rank) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 overflow-auto">
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

          <h1 className="text-2xl font-bold text-white mb-2">Round Complete!</h1>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-4 mb-4 inline-block">
            <div className="text-4xl font-bold text-gray-900 mb-1">{displayScore}</div>
            <div className="text-lg text-gray-800">points</div>
          </div>

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

  // ============ WAITING ============
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

  // ============ GUESSING / REVEALED ============
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
          </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl">
          <div className="text-2xl font-bold text-yellow-300">{score}</div>
          <div className="text-xs text-purple-200">points</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Pick A/B/C/D */}
        {gamePhase === 'guessing' && !answerSubmitted && questionData && (
          <>
            <h2 className="text-xl font-bold text-white mb-1 text-center">
              {questionData.prompt || 'Pick your answer!'}
            </h2>
            <p className="text-purple-200 text-sm mb-4">
              {questionData.hasAudio ? 'Listen to the main screen, then tap your answer:' : 'Read the question and tap your answer:'}
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {CORNERS.map(corner => (
                <button
                  key={corner.id}
                  onClick={() => submitAnswer(corner.id)}
                  className={`w-full py-5 px-4 rounded-2xl text-center transition-all hover:scale-[1.03] active:scale-95 text-white bg-gradient-to-r ${corner.bgClass} shadow-lg`}
                  style={{ minHeight: '90px' }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-black opacity-70">{corner.id}</span>
                    <span className="text-xl font-bold">{questionData.answers?.[corner.id] || corner.id}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Answer submitted — waiting */}
        {gamePhase === 'guessing' && answerSubmitted && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-6 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-3" />
              <p className="text-xl text-white font-bold mb-3">Answer Submitted!</p>
              <div
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-white font-bold text-xl"
                style={{ backgroundColor: getCornerInfo(selectedAnswer)?.color }}
              >
                <span className="font-black">{selectedAnswer}:</span>
                {questionData?.answers?.[selectedAnswer]}
              </div>
              <p className="text-sm text-purple-300 mt-4">Waiting for teacher to reveal...</p>
            </div>
          </div>
        )}

        {/* Revealed */}
        {gamePhase === 'revealed' && correctAnswer && (
          <div className="text-center w-full max-w-md">
            {wasCorrect ? (
              <div className="bg-green-500/30 rounded-2xl p-4 mb-3">
                <p className="text-2xl font-bold text-green-400 mb-1">Correct!</p>
                <p className="text-xl text-white">
                  +{earnedPoints} points{earnedPoints > SCORING.correct ? ' (speed bonus!)' : ''}
                </p>
              </div>
            ) : wasCorrect === false ? (
              <div className="bg-red-500/30 rounded-2xl p-4 mb-3">
                <p className="text-2xl font-bold text-red-400 mb-1">Not quite!</p>
                {selectedAnswer && (
                  <p className="text-sm text-white/70">
                    You said {selectedAnswer}: {questionData?.answers?.[selectedAnswer]}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-500/30 rounded-2xl p-4 mb-3">
                <p className="text-2xl font-bold text-gray-300">No answer</p>
              </div>
            )}

            <div
              className="rounded-2xl p-5 text-white"
              style={{ backgroundColor: getCornerInfo(correctAnswer)?.color }}
            >
              <div className="text-2xl font-black mb-1">{correctAnswer}</div>
              <div className="text-3xl font-bold">{questionData?.answers?.[correctAnswer]}</div>
            </div>

            <p className="text-purple-200 mt-3 text-sm">Waiting for next question...</p>
          </div>
        )}

        {/* Between rounds */}
        {(gamePhase === 'playing' || gamePhase === 'between-rounds') && (
          <div className="text-center">
            <p className="text-xl text-purple-200">Get ready for the next round...</p>
            <p className="text-sm text-purple-300 mt-2">Watch the main screen</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameThatElementStudentView;
