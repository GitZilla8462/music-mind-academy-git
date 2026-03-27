// File: /src/lessons/shared/activities/name-that-element/NameThatElementStudentView.jsx
// Name That Element - Student View (syncs with teacher's class game)
// Two-step answer: 1) Pick instrument family, 2) Bonus: pick specific instrument
// No audio playback on student side - audio plays on teacher's projector

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, Star } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';

// Answer options — instrument families
const ANSWERS = [
  { id: 'strings', label: 'STRINGS', emoji: '🎻', color: '#3B82F6', bgClass: 'from-blue-500 to-blue-700' },
  { id: 'woodwinds', label: 'WOODWINDS', emoji: '🎵', color: '#10B981', bgClass: 'from-emerald-500 to-emerald-700' },
  { id: 'brass', label: 'BRASS', emoji: '🎺', color: '#F59E0B', bgClass: 'from-amber-500 to-amber-700' },
  { id: 'percussion', label: 'PERCUSSION', emoji: '🥁', color: '#EF4444', bgClass: 'from-red-500 to-red-700' }
];

// Instruments per family — these are the ones taught in the unit
const FAMILY_INSTRUMENTS = {
  strings: ['Violin', 'Viola', 'Cello', 'Bass'],
  woodwinds: ['Flute', 'Oboe', 'Clarinet', 'Bassoon'],
  brass: ['Trumpet', 'French Horn', 'Trombone', 'Tuba'],
  percussion: ['Snare Drum', 'Timpani', 'Xylophone']
};

// Scoring
const SCORING = {
  correct: 10,
  instrumentBonus: 5,
  speedBonus: 5,
  speedThreshold: 5000 // 5 seconds for speed bonus
};

const TOTAL_QUESTIONS = 12;

const NameThatElementStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, classId, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  // Compute Firebase paths based on session type
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
  const [playerEmoji, setPlayerEmoji] = useState('\uD83C\uDFB5');
  const [score, setScore] = useState(0);

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(TOTAL_QUESTIONS);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [correctInstrument, setCorrectInstrument] = useState(null);
  const [playStartTime, setPlayStartTime] = useState(null);

  // Student's answers (two-step)
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [instrumentSubmitted, setInstrumentSubmitted] = useState(false);

  // Results
  const [wasCorrect, setWasCorrect] = useState(null);
  const [wasInstrumentCorrect, setWasInstrumentCorrect] = useState(null);
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
  const selectedInstrumentRef = useRef(null);
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
  useEffect(() => { selectedInstrumentRef.current = selectedInstrument; }, [selectedInstrument]);
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

      // Map teacher phases to student phases
      const phase = data.phase === 'question' ? 'guessing' : (data.phase || 'waiting');
      setGamePhase(phase);
      setCurrentRound(data.currentRound || 0);
      setCurrentQuestion(data.currentQuestion || 0);
      setTotalQuestions(data.totalQuestions || TOTAL_QUESTIONS);

      // Handle phase changes
      if (phase === 'guessing') {
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
          selectedInstrumentRef.current = null;
          setSelectedInstrument(null);
          setInstrumentSubmitted(false);
          wasCorrectRef.current = null;
          setWasCorrect(null);
          setWasInstrumentCorrect(null);
          setEarnedPoints(0);
          setCorrectAnswer(null);
          setCorrectInstrument(null);
        }

        // Students can start answering
        playStartTimeRef.current = data.startedAt || data.playStartTime || Date.now();
        setPlayStartTime(data.startedAt || data.playStartTime || Date.now());
      }

      // Handle finished - restore score from Firebase if component remounted
      if (phase === 'finished') {
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
      if (phase === 'revealed' && data.revealedAnswer) {
        setCorrectAnswer(data.revealedAnswer);
        setCorrectInstrument(data.revealedInstrument || null);

        const questionNum = data.currentQuestion || 0;

        if (selectedAnswerRef.current && wasCorrectRef.current === null && scoredQuestionRef.current !== questionNum) {
          scoredQuestionRef.current = questionNum;

          const answer = selectedAnswerRef.current;
          const familyCorrect = answer === data.revealedAnswer;
          const instrumentCorrect = familyCorrect && selectedInstrumentRef.current === data.revealedInstrument;

          wasCorrectRef.current = familyCorrect;
          setWasCorrect(familyCorrect);
          setWasInstrumentCorrect(instrumentCorrect);

          let points = 0;
          if (familyCorrect) {
            points = SCORING.correct;
            const answerTime = Date.now() - (playStartTimeRef.current || Date.now());
            if (answerTime < SCORING.speedThreshold) {
              points += SCORING.speedBonus;
            }
            if (instrumentCorrect) {
              points += SCORING.instrumentBonus;
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
      const list = Object.entries(data)
        .filter(([, s]) => s.playerName || s.displayName)
        .map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName,
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

  // Submit family answer (step 1)
  const submitAnswer = (answerId) => {
    if (answerSubmitted || gamePhase !== 'guessing') return;

    selectedAnswerRef.current = answerId;
    setSelectedAnswer(answerId);
    setAnswerSubmitted(true);

    // Send to Firebase so teacher can track responses
    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        nteAnswer: answerId,
        nteAnswerTime: Date.now()
      });
    }
  };

  // Submit instrument answer (step 2 - bonus)
  const submitInstrument = (instrumentName) => {
    if (instrumentSubmitted || gamePhase !== 'guessing') return;

    selectedInstrumentRef.current = instrumentName;
    setSelectedInstrument(instrumentName);
    setInstrumentSubmitted(true);

    // Send to Firebase
    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        nteInstrumentAnswer: instrumentName
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
            <div className="text-lg text-gray-800">points</div>
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
          <h1 className="text-4xl font-bold text-white mb-4">Name That Instrument</h1>
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
        {/* Step 1: Pick instrument family */}
        {gamePhase === 'guessing' && !answerSubmitted && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Which instrument family?
            </h2>
            <p className="text-purple-200 text-sm mb-6">Listen to the main screen, then tap your answer:</p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {ANSWERS.map(answer => (
                <button
                  key={answer.id}
                  onClick={() => submitAnswer(answer.id)}
                  className={`w-full py-5 px-4 rounded-2xl text-center transition-all hover:scale-[1.03] active:scale-95 text-white bg-gradient-to-r ${answer.bgClass} shadow-lg`}
                  style={{ minHeight: '90px' }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">{answer.emoji}</span>
                    <span className="text-xl font-black tracking-wide">{answer.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Bonus — pick specific instrument from the family they chose */}
        {gamePhase === 'guessing' && answerSubmitted && !instrumentSubmitted && selectedAnswer && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Star size={24} className="text-yellow-400" />
              <h2 className="text-2xl font-bold text-yellow-300 text-center">
                Bonus: Which instrument?
              </h2>
              <Star size={24} className="text-yellow-400" />
            </div>
            <p className="text-purple-200 text-sm mb-4">
              You said <span className="font-bold" style={{ color: getAnswerInfo(selectedAnswer)?.color }}>{getAnswerInfo(selectedAnswer)?.label}</span> — now pick the exact instrument!
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {(FAMILY_INSTRUMENTS[selectedAnswer] || []).map(instrument => (
                <button
                  key={instrument}
                  onClick={() => submitInstrument(instrument)}
                  className="w-full py-4 px-4 rounded-2xl text-center transition-all hover:scale-[1.03] active:scale-95 text-white bg-white/15 hover:bg-white/25 border-2 border-white/20 shadow-lg"
                  style={{ minHeight: '70px' }}
                >
                  <span className="text-xl font-black tracking-wide">{instrument}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Both answers submitted — waiting for reveal */}
        {gamePhase === 'guessing' && answerSubmitted && (instrumentSubmitted || !selectedAnswer) && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-6 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-3" />
              <p className="text-xl text-white font-bold mb-3">Answers Submitted!</p>
              <div
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full text-white font-bold text-xl mb-2"
                style={{ backgroundColor: getAnswerInfo(selectedAnswer)?.color }}
              >
                <span className="text-2xl">{getAnswerInfo(selectedAnswer)?.emoji}</span>
                {getAnswerInfo(selectedAnswer)?.label}
              </div>
              {selectedInstrument && (
                <div className="text-lg text-yellow-300 font-bold mt-1">
                  + {selectedInstrument}
                </div>
              )}
              <p className="text-sm text-purple-300 mt-3">Waiting for teacher to reveal...</p>
            </div>
          </div>
        )}

        {/* Revealed — show both family and instrument results */}
        {gamePhase === 'revealed' && correctAnswer && (
          <div className="text-center w-full max-w-md">
            {wasCorrect ? (
              <div className="bg-green-500/30 rounded-2xl p-4 mb-3">
                <p className="text-2xl font-bold text-green-400 mb-1">Family Correct!</p>
                {wasInstrumentCorrect ? (
                  <p className="text-lg text-yellow-300 font-bold">
                    + Nailed the instrument! (+{SCORING.instrumentBonus} bonus)
                  </p>
                ) : correctInstrument && selectedInstrument ? (
                  <p className="text-sm text-white/70">
                    Instrument: you said {selectedInstrument}, it was {correctInstrument}
                  </p>
                ) : null}
                <p className="text-xl text-white mt-1">
                  +{earnedPoints} points{earnedPoints > SCORING.correct + SCORING.instrumentBonus ? ' (speed bonus!)' : ''}
                </p>
              </div>
            ) : wasCorrect === false ? (
              <div className="bg-red-500/30 rounded-2xl p-4 mb-3">
                <p className="text-2xl font-bold text-red-400 mb-1">Not quite!</p>
              </div>
            ) : (
              <div className="bg-gray-500/30 rounded-2xl p-4 mb-3">
                <p className="text-2xl font-bold text-gray-300">No answer</p>
              </div>
            )}

            {/* Show correct answer — family + instrument */}
            {(() => {
              const correctInfo = getAnswerInfo(correctAnswer);
              if (!correctInfo) return null;
              return (
                <div
                  className="rounded-2xl p-5 text-white"
                  style={{ backgroundColor: correctInfo.color }}
                >
                  <div className="text-4xl mb-1">{correctInfo.emoji}</div>
                  {correctInstrument && (
                    <div className="text-3xl font-black mb-1">{correctInstrument}</div>
                  )}
                  <div className="text-xl font-bold text-white/80">{correctInfo.label}</div>
                </div>
              );
            })()}

            <p className="text-purple-200 mt-3 text-sm">Waiting for next question...</p>
          </div>
        )}

        {/* Between rounds or other waiting states */}
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
