// File: FourCornersStudentView.jsx
// Four Corners - Student View (syncs with teacher's class game)
// Students see 4 large colored corner buttons, tap their answer
// No audio — purely visual, matches the teacher screen quadrants

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';

// Corner definitions matching teacher screen
const CORNERS = [
  { id: 'A', label: 'Front Left', color: '#3B82F6', bgClass: 'from-blue-500 to-blue-700' },
  { id: 'B', label: 'Front Right', color: '#EF4444', bgClass: 'from-red-500 to-red-700' },
  { id: 'C', label: 'Back Left', color: '#10B981', bgClass: 'from-emerald-500 to-emerald-700' },
  { id: 'D', label: 'Back Right', color: '#F59E0B', bgClass: 'from-yellow-400 to-amber-600' }
];

const FourCornersStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, classId, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/fourCorners`;
    if (sessionCode) return `sessions/${sessionCode}/fourCorners`;
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

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionData, setQuestionData] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);

  // Student's answer
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Results
  const [wasCorrect, setWasCorrect] = useState(null);

  // Refs for stale closure prevention
  const currentQuestionRef = useRef(0);
  const selectedAnswerRef = useRef(null);
  const wasCorrectRef = useRef(null);

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

  // Keep refs in sync
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { selectedAnswerRef.current = selectedAnswer; }, [selectedAnswer]);
  useEffect(() => { wasCorrectRef.current = wasCorrect; }, [wasCorrect]);

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
      setCurrentQuestion(data.currentQuestion || 0);
      setQuestionData(data.questionData || null);

      // Handle question phase
      if (data.phase === 'question') {
        // New question — reset
        if (data.currentQuestion !== currentQuestionRef.current) {
          selectedAnswerRef.current = null;
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
          wasCorrectRef.current = null;
          setWasCorrect(null);
          setCorrectAnswer(null);
        }
      }

      // Handle reveal
      if (data.phase === 'revealed' && data.revealedAnswer) {
        setCorrectAnswer(data.revealedAnswer);

        if (selectedAnswerRef.current && wasCorrectRef.current === null) {
          const isCorrect = selectedAnswerRef.current === data.revealedAnswer;
          wasCorrectRef.current = isCorrect;
          setWasCorrect(isCorrect);
        }
      }
    });

    return () => unsubscribe();
  }, [gamePath, studentsPath, userId]);

  // Submit answer
  const submitAnswer = (cornerId) => {
    if (answerSubmitted || gamePhase !== 'question') return;

    selectedAnswerRef.current = cornerId;
    setSelectedAnswer(cornerId);
    setAnswerSubmitted(true);

    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        fcAnswer: cornerId,
      });
    }
  };

  const getCornerInfo = (id) => CORNERS.find(c => c.id === id);

  // ============ FINISHED ============
  if (gamePhase === 'finished') {
    return (
      <div className="h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-6">{'\uD83C\uDF89'}</div>
          <h1 className="text-3xl font-bold text-white mb-4">Game Complete!</h1>
          <p className="text-xl text-purple-200">Great job! Look at the main screen.</p>
        </div>
      </div>
    );
  }

  // ============ WAITING ============
  if (gamePhase === 'waiting' || gamePhase === 'setup') {
    return (
      <div className="h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Four Corners</h1>
          <p className="text-xl text-purple-200 mb-8">Waiting for teacher to start...</p>

          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <span className="text-4xl mb-2 block">{playerEmoji}</span>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
        </div>
      </div>
    );
  }

  // ============ QUESTION / REVEALED ============
  return (
    <div className="h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: playerColor }}
          >
            {playerEmoji}
          </div>
          <div className="text-lg font-bold" style={{ color: playerColor }}>{playerName}</div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl">
          <div className="text-sm text-purple-200">Q{currentQuestion + 1}/12</div>
        </div>
      </div>

      {/* Question text */}
      {questionData && (
        <div className="bg-white/10 rounded-2xl p-4 mb-3 text-center">
          <div className="text-xl font-bold text-white">{questionData.prompt}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Question phase — show 4 corner buttons */}
        {gamePhase === 'question' && !answerSubmitted && questionData && (
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {CORNERS.map(corner => (
              <button
                key={corner.id}
                onClick={() => submitAnswer(corner.id)}
                className={`py-6 px-4 rounded-2xl text-center transition-all hover:scale-[1.03] active:scale-95 text-white bg-gradient-to-br ${corner.bgClass} shadow-lg`}
                style={{ minHeight: '100px' }}
              >
                <div className="text-xs font-medium opacity-70 mb-1">{corner.label}</div>
                <div className="text-2xl font-black">
                  {questionData.answers?.[corner.id] || corner.id}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Answer submitted — waiting for reveal */}
        {gamePhase === 'question' && answerSubmitted && selectedAnswer && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-8 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-xl text-white font-bold mb-3">Answer Submitted!</p>
              <div
                className="inline-flex items-center gap-3 px-8 py-3 rounded-full text-white font-bold text-2xl"
                style={{ backgroundColor: getCornerInfo(selectedAnswer)?.color }}
              >
                {getCornerInfo(selectedAnswer)?.label}: {questionData?.answers?.[selectedAnswer]}
              </div>
              <p className="text-sm text-purple-300 mt-4">Move to your corner! Waiting for reveal...</p>
            </div>
          </div>
        )}

        {/* Revealed */}
        {gamePhase === 'revealed' && correctAnswer && (
          <div className="text-center w-full max-w-md">
            {wasCorrect ? (
              <div className="bg-green-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-green-400">Correct!</p>
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

            {/* Show correct corner */}
            {(() => {
              const correctInfo = getCornerInfo(correctAnswer);
              if (!correctInfo) return null;
              return (
                <div
                  className="rounded-2xl p-6 text-white"
                  style={{ backgroundColor: correctInfo.color }}
                >
                  <div className="text-lg opacity-80">{correctInfo.label}</div>
                  <div className="text-4xl font-black">
                    {questionData?.answers?.[correctAnswer] || correctAnswer}
                  </div>
                </div>
              );
            })()}

            <p className="text-purple-200 mt-4 text-sm">Waiting for next question...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FourCornersStudentView;
