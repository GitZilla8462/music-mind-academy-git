// File: FactOpinionStudentView.jsx
// Fact or Opinion Sorter - Student View (syncs with teacher's class game)
// Students see the statement and vote FACT or OPINION
// Follows exact same Firebase pattern as FourCornersStudentView

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, Trophy, Award, Medal } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';

const FactOpinionStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, classId, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/factOpinionSorter`;
    if (sessionCode) return `sessions/${sessionCode}/factOpinionSorter`;
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
  const [currentStatement, setCurrentStatement] = useState(0);
  const [statementData, setStatementData] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [shownAt, setShownAt] = useState(null);

  // Student's answer
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Results
  const [wasCorrect, setWasCorrect] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Leaderboard for finished screen
  const [leaderboard, setLeaderboard] = useState([]);

  // Refs for stale closure prevention
  const currentStatementRef = useRef(0);
  const selectedAnswerRef = useRef(null);
  const wasCorrectRef = useRef(null);
  const myScoreRef = useRef(0);

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
  useEffect(() => { currentStatementRef.current = currentStatement; }, [currentStatement]);
  useEffect(() => { selectedAnswerRef.current = selectedAnswer; }, [selectedAnswer]);
  useEffect(() => { wasCorrectRef.current = wasCorrect; }, [wasCorrect]);
  useEffect(() => { myScoreRef.current = myScore; }, [myScore]);

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
      setCurrentStatement(data.currentStatement || 0);
      setStatementData(data.statementData || null);
      setShownAt(data.shownAt || null);

      // Handle showing phase (new statement)
      if (data.phase === 'showing') {
        if (data.currentStatement !== currentStatementRef.current) {
          selectedAnswerRef.current = null;
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
          wasCorrectRef.current = null;
          setWasCorrect(null);
          setCorrectAnswer(null);
          setPointsEarned(0);
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
  }, [gamePath]);

  // Listen for own score updates
  useEffect(() => {
    if (!studentsPath || !userId) return;

    const db = getDatabase();
    const myRef = ref(db, `${studentsPath}/${userId}`);

    const unsubscribe = onValue(myRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const newScore = data.factOpinionScore || 0;
      if (newScore > myScoreRef.current) {
        setPointsEarned(newScore - myScoreRef.current);
      }
      setMyScore(newScore);
    });

    return () => unsubscribe();
  }, [studentsPath, userId]);

  // Build leaderboard when finished
  useEffect(() => {
    if (gamePhase !== 'finished' || !studentsPath) return;

    const db = getDatabase();
    const studentsRef = ref(db, studentsPath);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const board = Object.entries(data)
        .filter(([, s]) => s.playerName || s.displayName)
        .map(([id, s]) => ({
          id,
          name: s.playerName || s.displayName,
          score: s.factOpinionScore || 0,
          isMe: id === userId,
        }))
        .sort((a, b) => b.score - a.score);
      setLeaderboard(board);
    });

    return () => unsubscribe();
  }, [gamePhase, studentsPath, userId]);

  // Submit answer
  const submitAnswer = (choice) => {
    if (answerSubmitted || gamePhase !== 'showing') return;

    selectedAnswerRef.current = choice;
    setSelectedAnswer(choice);
    setAnswerSubmitted(true);

    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        factOpinionAnswer: choice,
        factOpinionAnswerTime: Date.now(),
      });
    }
  };

  // ============ FINISHED ============
  if (gamePhase === 'finished') {
    const myRank = leaderboard.findIndex(e => e.isMe) + 1;

    return (
      <div className="h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="text-center mb-4">
          <div className="text-7xl mb-3">{'\uD83C\uDFC6'}</div>
          <h1 className="text-3xl font-bold text-white mb-1">Game Complete!</h1>
          <p className="text-lg text-white/70">Your Score: <span className="font-black text-2xl" style={{ color: '#f0b429' }}>{myScore}</span></p>
          {myRank > 0 && (
            <p className="text-sm text-white/50">Rank: #{myRank} of {leaderboard.length}</p>
          )}
        </div>

        {/* Mini leaderboard */}
        <div className="w-full max-w-sm">
          {leaderboard.slice(0, 5).map((entry, idx) => {
            const rankIcon = idx === 0 ? <Trophy size={18} className="text-yellow-400" /> :
                             idx === 1 ? <Award size={18} className="text-gray-300" /> :
                             idx === 2 ? <Medal size={18} className="text-amber-600" /> : null;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl mb-1 ${
                  entry.isMe ? 'bg-yellow-500/20 ring-2 ring-yellow-400' : 'bg-white/5'
                }`}
              >
                <div className="w-6 text-center">
                  {rankIcon || <span className="text-sm font-bold text-white/50">{idx + 1}</span>}
                </div>
                <div className="flex-1 text-sm font-bold truncate">{entry.name} {entry.isMe ? '(you)' : ''}</div>
                <div className="text-lg font-black" style={{ color: '#f0b429' }}>{entry.score}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ============ WAITING ============
  if (gamePhase === 'waiting' || gamePhase === 'setup') {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Fact or Opinion?</h1>
          <p className="text-xl text-indigo-200 mb-8">Waiting for teacher to start...</p>

          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <span className="text-4xl mb-2 block">{playerEmoji}</span>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
        </div>
      </div>
    );
  }

  // ============ SHOWING (voting) / REVEALED ============
  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col p-4">
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
        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-3 py-1 rounded-xl">
            <span className="text-sm text-white/70">Score: </span>
            <span className="text-lg font-black" style={{ color: '#f0b429' }}>{myScore}</span>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl">
            <div className="text-sm text-indigo-200">{currentStatement + 1}/10</div>
          </div>
        </div>
      </div>

      {/* Statement text */}
      {statementData && (
        <div className="rounded-2xl p-5 mb-4 text-center" style={{ backgroundColor: '#1a2744', border: '2px solid rgba(240, 180, 41, 0.3)' }}>
          <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Statement #{currentStatement + 1}</div>
          <div className="text-xl font-bold text-white leading-tight">
            &ldquo;{statementData.text}&rdquo;
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Showing phase — vote buttons */}
        {gamePhase === 'showing' && !answerSubmitted && (
          <div className="w-full max-w-md space-y-4">
            <button
              onClick={() => submitAnswer('fact')}
              className="w-full py-8 rounded-2xl text-center transition-all hover:scale-[1.03] active:scale-95 text-white font-black text-3xl shadow-lg"
              style={{ backgroundColor: '#3B82F6', minHeight: '80px' }}
            >
              FACT
            </button>
            <button
              onClick={() => submitAnswer('opinion')}
              className="w-full py-8 rounded-2xl text-center transition-all hover:scale-[1.03] active:scale-95 text-white font-black text-3xl shadow-lg"
              style={{ backgroundColor: '#8B5CF6', minHeight: '80px' }}
            >
              OPINION
            </button>
          </div>
        )}

        {/* Answer submitted — waiting for reveal */}
        {gamePhase === 'showing' && answerSubmitted && selectedAnswer && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-8 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-xl text-white font-bold mb-3">Answer Locked!</p>
              <div
                className="inline-flex items-center gap-3 px-8 py-3 rounded-full text-white font-bold text-2xl"
                style={{ backgroundColor: selectedAnswer === 'fact' ? '#3B82F6' : '#8B5CF6' }}
              >
                {selectedAnswer === 'fact' ? 'FACT' : 'OPINION'}
              </div>
              <p className="text-sm text-indigo-300 mt-4">Waiting for reveal...</p>
            </div>
          </div>
        )}

        {/* Revealed */}
        {gamePhase === 'revealed' && correctAnswer && (
          <div className="text-center w-full max-w-md">
            {wasCorrect ? (
              <div className="bg-green-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-green-400 mb-1">Correct!</p>
                {pointsEarned > 0 && (
                  <p className="text-xl font-bold" style={{ color: '#f0b429' }}>+{pointsEarned} points</p>
                )}
              </div>
            ) : wasCorrect === false ? (
              <div className="bg-red-500/30 rounded-2xl p-6 mb-4">
                <p className="text-3xl font-bold text-red-400 mb-2">Not quite!</p>
                <p className="text-lg text-white/70">+0 points</p>
              </div>
            ) : (
              <div className="bg-gray-500/30 rounded-2xl p-6 mb-4">
                <p className="text-2xl font-bold text-gray-300 mb-2">No answer</p>
              </div>
            )}

            {/* Show correct answer */}
            <div
              className="rounded-2xl p-6 text-white"
              style={{ backgroundColor: correctAnswer === 'fact' ? '#3B82F6' : '#8B5CF6' }}
            >
              <div className="text-lg opacity-80 mb-1">The answer is...</div>
              <div className="text-4xl font-black">
                {correctAnswer === 'fact' ? 'FACT' : 'OPINION'}
              </div>
            </div>

            <p className="text-indigo-200 mt-4 text-sm">Waiting for next statement...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactOpinionStudentView;
