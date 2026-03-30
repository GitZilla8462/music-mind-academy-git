// File: GenreMatchStudentView.jsx
// Genre Match - Student View (syncs with teacher's class game)
// Teacher plays a Bandcamp clip, students identify the genre
// Follows exact same Firebase pattern as FactOpinionStudentView

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, Trophy, Award, Medal, Music } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { getPlayerColor, getPlayerEmoji, getStudentDisplayName, formatFirstNameLastInitial } from '../layer-detective/nameGenerator';

const GENRE_COLORS = {
  'Pop': '#ec4899',
  'Hip-Hop': '#8b5cf6',
  'Rock': '#ef4444',
  'Country': '#f97316',
  'Jazz': '#3b82f6',
  'Soundtrack': '#14b8a6',
  'Electronic': '#06b6d4',
};

const getGenreColor = (genre) => GENRE_COLORS[genre] || '#6b7280';

const GenreMatchStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, classId, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/genreMatch`;
    if (sessionCode) return `sessions/${sessionCode}/genreMatch`;
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
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(8);
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [artistName, setArtistName] = useState('');

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
  const currentRoundRef = useRef(0);
  const selectedAnswerRef = useRef(null);
  const wasCorrectRef = useRef(null);
  const myScoreRef = useRef(0);

  // Get player name on mount - use real name (first name last initial)
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
        const { getDatabase, ref, update } = await import('firebase/database');
        const db = getDatabase();
        update(ref(db, `${studentsPath}/${userId}`), {
          displayName: name,
          playerColor: color,
          playerEmoji: emoji
        });
      }
    };

    assignPlayerName();
  }, [userId, studentsPath]);

  // Keep refs in sync
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
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
      setTotalRounds(data.totalRounds || 8);
      setOptions(data.options || []);

      // Handle playing phase (new round)
      if (data.phase === 'playing') {
        if (data.currentRound !== currentRoundRef.current) {
          selectedAnswerRef.current = null;
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
          wasCorrectRef.current = null;
          setWasCorrect(null);
          setCorrectAnswer(null);
          setArtistName('');
          setPointsEarned(0);
        }
        setCurrentRound(data.currentRound || 0);
      }

      // Handle revealed phase
      if (data.phase === 'revealed') {
        setCurrentRound(data.currentRound || 0);
        setCorrectAnswer(data.correctAnswer || null);
        setArtistName(data.artistName || '');

        if (selectedAnswerRef.current && wasCorrectRef.current === null) {
          const isCorrect = selectedAnswerRef.current === data.correctAnswer;
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

      const newScore = data.genreMatchScore || 0;
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
        .filter(([, s]) => s.displayName || s.playerName || s.name)
        .map(([id, s]) => ({
          id,
          name: formatFirstNameLastInitial(s.displayName || s.playerName || s.name),
          score: s.genreMatchScore || 0,
          isMe: id === userId,
        }))
        .sort((a, b) => b.score - a.score);
      setLeaderboard(board);
    });

    return () => unsubscribe();
  }, [gamePhase, studentsPath, userId]);

  // Submit answer
  const submitAnswer = (genre) => {
    if (answerSubmitted || gamePhase !== 'playing') return;

    selectedAnswerRef.current = genre;
    setSelectedAnswer(genre);
    setAnswerSubmitted(true);

    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        genreMatchAnswer: genre,
        genreMatchAnswerTime: Date.now(),
      });
    }
  };

  // ============ FINISHED ============
  if (gamePhase === 'finished') {
    const myRank = leaderboard.findIndex(e => e.isMe) + 1;

    return (
      <div className="h-screen bg-[#0f1419] flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="text-center mb-4">
          <div className="text-7xl mb-3">{'\uD83C\uDFC6'}</div>
          <h1 className="text-3xl font-bold text-white mb-1">Game Complete!</h1>
          <p className="text-lg text-white/70">Your Score: <span className="font-black text-2xl" style={{ color: '#f0b429' }}>{myScore}</span> / {totalRounds}</p>
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
                <div className="flex-1 text-sm font-bold text-white truncate">{entry.name} {entry.isMe ? '(you)' : ''}</div>
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
      <div className="h-screen bg-[#0f1419] flex items-center justify-center p-6">
        <div className="text-center">
          <Music size={48} className="mx-auto text-cyan-400 mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Genre Match</h1>
          <p className="text-xl text-gray-400 mb-8">Get Ready!</p>

          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <span className="text-4xl mb-2 block">{playerEmoji}</span>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
        </div>
      </div>
    );
  }

  // ============ PLAYING (voting) / REVEALED ============
  return (
    <div className="h-screen bg-[#0f1419] flex flex-col p-4">
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
            <div className="text-sm text-gray-400">{currentRound + 1}/{totalRounds}</div>
          </div>
        </div>
      </div>

      {/* Prompt */}
      <div className="rounded-2xl p-4 mb-4 text-center" style={{ backgroundColor: '#1a2332', border: '2px solid rgba(6, 182, 212, 0.3)' }}>
        <Music size={24} className="mx-auto text-cyan-400 mb-2" />
        <div className="text-lg font-bold text-white">
          {gamePhase === 'playing' && !answerSubmitted && 'What genre is this?'}
          {gamePhase === 'playing' && answerSubmitted && 'Answer locked!'}
          {gamePhase === 'revealed' && (wasCorrect ? 'Correct!' : wasCorrect === false ? 'Not quite!' : 'No answer')}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Playing phase -- genre buttons */}
        {gamePhase === 'playing' && !answerSubmitted && (
          <div className="w-full max-w-md grid grid-cols-2 gap-3">
            {options.map((genre) => (
              <button
                key={genre}
                onClick={() => submitAnswer(genre)}
                className="py-6 rounded-2xl text-center transition-all hover:scale-[1.03] active:scale-95 text-white font-bold text-lg shadow-lg"
                style={{
                  backgroundColor: getGenreColor(genre),
                  minHeight: '72px',
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        )}

        {/* Answer submitted -- waiting for reveal */}
        {gamePhase === 'playing' && answerSubmitted && selectedAnswer && (
          <div className="text-center">
            <div className="bg-white/10 rounded-2xl p-8 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-xl text-white font-bold mb-3">Answer Locked!</p>
              <div
                className="inline-flex items-center gap-3 px-8 py-3 rounded-full text-white font-bold text-xl"
                style={{ backgroundColor: getGenreColor(selectedAnswer) }}
              >
                {selectedAnswer}
              </div>
              <p className="text-sm text-gray-400 mt-4">Waiting for reveal...</p>
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
                <p className="text-lg text-white/70">
                  You picked: <span style={{ color: getGenreColor(selectedAnswer) }}>{selectedAnswer}</span>
                </p>
              </div>
            ) : (
              <div className="bg-gray-500/30 rounded-2xl p-6 mb-4">
                <p className="text-2xl font-bold text-gray-300 mb-2">No answer</p>
              </div>
            )}

            {/* Show correct answer */}
            <div
              className="rounded-2xl p-6 text-white"
              style={{ backgroundColor: getGenreColor(correctAnswer) }}
            >
              <div className="text-lg opacity-80 mb-1">The answer is...</div>
              <div className="text-4xl font-black mb-2">{correctAnswer}</div>
              {artistName && (
                <div className="text-sm opacity-70">Artist: {artistName}</div>
              )}
            </div>

            <p className="text-gray-400 mt-4 text-sm">Waiting for next round...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenreMatchStudentView;
