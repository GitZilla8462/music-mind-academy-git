// File: /src/lessons/shared/activities/dynamics-dash/DynamicsDashClassGame.jsx
// Dynamics Dash - Teacher Presentation View (Class Game)
// Students identify dynamics (pp, p, mp, mf, f, ff) in Vivaldi's Spring
//
// PHASES:
// 1. Setup - Show "Start Game"
// 2. Playing - Show question, "Play Audio" button
// 3. Guessing - Audio playing, students answering, show answer count
// 4. Revealed - Show correct answer
// 5. Next/Finished

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Users, Trophy, Eye, RotateCcw, ChevronRight } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { AUDIO_PATH, DYNAMICS, GRADUAL_DYNAMICS, QUESTIONS, TOTAL_QUESTIONS, getVolumeForDynamic } from './dynamicsDashConfig';

// Shuffle helper
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Student Activity Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#7c3aed', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const DynamicsDashClassGame = ({ sessionData, onComplete }) => {
  const sessionCode = sessionData?.sessionCode || new URLSearchParams(window.location.search).get('session');

  // Game state
  const [gamePhase, setGamePhase] = useState('setup'); // setup, playing, guessing, revealed, finished
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // Reveal state
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreChanges, setScoreChanges] = useState({});

  // Audio ref
  const audioRef = useRef(null);
  const playbackTimer = useRef(null);

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/dynamicsDash`), data);
  }, [sessionCode]);

  // Firebase: Subscribe to students
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
        answer: s.dynamicsDashAnswer,
        answerTime: s.dynamicsDashAnswerTime,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '🎵'
      }));

      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Stop audio helper
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playbackTimer.current) {
      clearTimeout(playbackTimer.current);
      playbackTimer.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Play audio for current question
  const playAudio = useCallback(() => {
    if (!shuffledQuestions[currentQuestion]) return;

    const question = shuffledQuestions[currentQuestion];

    // If already playing, pause
    if (isPlaying) {
      stopAudio();
      return;
    }

    // Create and play audio
    const audio = new Audio(AUDIO_PATH);
    audioRef.current = audio;
    audio.currentTime = question.startTime;
    // For gradual dynamics (crescendo/decrescendo), use natural volume so students hear the change
    // For level questions, use artificial scaling to exaggerate differences
    audio.volume = question.questionType === 'gradual' ? 0.7 : getVolumeForDynamic(question.correctAnswer);

    audio.play().catch(err => {
      console.error('Audio playback error:', err);
      setIsPlaying(false);
    });

    setIsPlaying(true);

    // Stop after duration
    const duration = (question.endTime - question.startTime) * 1000;
    playbackTimer.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }, duration);

    // Update phase to guessing and broadcast
    setGamePhase('guessing');
    updateGame({
      phase: 'guessing',
      currentQuestion,
      totalQuestions: shuffledQuestions.length,
      questionType: question.questionType || 'level',
      isPlaying: true,
      playStartTime: Date.now()
    });
  }, [shuffledQuestions, currentQuestion, isPlaying, stopAudio, updateGame]);

  // Start game
  const startGame = useCallback(() => {
    const shuffled = shuffleArray(QUESTIONS);
    setShuffledQuestions(shuffled);
    setCurrentQuestion(0);
    setGamePhase('playing');
    setScoreChanges({});
    setCorrectCount(0);

    // Reset student answers and scores
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          dynamicsDashAnswer: null,
          dynamicsDashScore: 0
        }).catch(err => console.error(`Failed to reset student ${s.id}:`, err));
      });
    }

    updateGame({
      phase: 'playing',
      currentQuestion: 0,
      totalQuestions: shuffled.length,
      questionType: shuffled[0]?.questionType || 'level'
    });
  }, [sessionCode, students, updateGame]);

  // Reveal answer
  const reveal = useCallback(() => {
    stopAudio();

    const question = shuffledQuestions[currentQuestion];
    if (!question) return;

    // Calculate who was correct
    const changes = {};
    let correct = 0;

    students.forEach(s => {
      if (s.answer) {
        const isCorrect = s.answer === question.correctAnswer;

        // Check for partial credit (within one level) - only for level questions, not gradual
        let isPartial = false;
        if (!isCorrect && question.questionType !== 'gradual') {
          const guessIndex = DYNAMICS.findIndex(d => d.symbol === s.answer);
          const correctIndex = DYNAMICS.findIndex(d => d.symbol === question.correctAnswer);
          isPartial = guessIndex >= 0 && correctIndex >= 0 && Math.abs(guessIndex - correctIndex) === 1;
        }

        if (isCorrect) {
          correct++;
          changes[s.id] = { isCorrect: true, isPartial: false };
        } else if (isPartial) {
          changes[s.id] = { isCorrect: false, isPartial: true };
        } else {
          changes[s.id] = { isCorrect: false, isPartial: false };
        }
      } else {
        changes[s.id] = { isCorrect: false, isPartial: false, noAnswer: true };
      }
    });

    setScoreChanges(changes);
    setCorrectCount(correct);
    setGamePhase('revealed');

    // Broadcast to students
    updateGame({
      phase: 'revealed',
      correctAnswer: question.correctAnswer
    });
  }, [stopAudio, shuffledQuestions, currentQuestion, students, updateGame]);

  // Next question
  const nextQuestion = useCallback(() => {
    stopAudio();

    // Clear student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          dynamicsDashAnswer: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    const nextIdx = currentQuestion + 1;
    if (nextIdx >= shuffledQuestions.length) {
      setGamePhase('finished');
      updateGame({ phase: 'finished' });
    } else {
      setCurrentQuestion(nextIdx);
      setGamePhase('playing');
      setScoreChanges({});
      setCorrectCount(0);
      updateGame({
        phase: 'playing',
        currentQuestion: nextIdx,
        questionType: shuffledQuestions[nextIdx]?.questionType || 'level'
      });
    }
  }, [sessionCode, students, currentQuestion, shuffledQuestions, updateGame, stopAudio]);

  // Cleanup on unmount
  useEffect(() => () => stopAudio(), [stopAudio]);

  const question = shuffledQuestions[currentQuestion];
  // Find the correct answer in either DYNAMICS or GRADUAL_DYNAMICS based on question type
  const correctDynamic = question
    ? (question.questionType === 'gradual'
        ? GRADUAL_DYNAMICS.find(d => d.symbol === question.correctAnswer)
        : DYNAMICS.find(d => d.symbol === question.correctAnswer))
    : null;

  // Render
  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white overflow-hidden">
      {/* Student Activity Banner */}
      <ActivityBanner />

      {/* Main content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎼</span>
            <h1 className="text-4xl font-bold">Dynamics Dash</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Q{currentQuestion + 1} / {shuffledQuestions.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Main content grid */}
        <div className={`grid ${gamePhase !== 'setup' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
          {/* Main area */}
          <div className={`${gamePhase !== 'setup' ? 'col-span-2' : ''} bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0`}>

            {/* Setup */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-9xl mb-6">🎼</div>
                <h2 className="text-5xl font-bold mb-4">Dynamics Dash</h2>
                <p className="text-2xl text-white/70 mb-8">Identify the dynamics in Vivaldi's Spring!</p>
                <button
                  onClick={startGame}
                  className="px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={40} /> Start Game
                </button>
              </div>
            )}

            {/* Playing - waiting for teacher to play audio */}
            {gamePhase === 'playing' && question && (
              <div className="text-center">
                <div className="text-6xl font-black mb-4">Question {currentQuestion + 1}</div>
                <p className="text-2xl text-purple-200 mb-4">"{question.description}"</p>
                <p className="text-xl text-white/70 mb-6">
                  {question.questionType === 'gradual'
                    ? 'Is this crescendo or decrescendo?'
                    : 'What is the dynamic level?'}
                </p>

                {/* Dynamic options preview - show different options based on question type */}
                {question.questionType === 'gradual' ? (
                  <div className="flex gap-6 justify-center mb-8">
                    {GRADUAL_DYNAMICS.map(d => (
                      <div
                        key={d.symbol}
                        className="p-6 rounded-xl text-center min-w-[200px]"
                        style={{ backgroundColor: `${d.color}40`, borderColor: d.color, borderWidth: '3px' }}
                      >
                        <div className="text-4xl font-bold text-white mb-2">{d.name}</div>
                        <div className="text-lg text-white/80">{d.meaning}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2 max-w-3xl mx-auto mb-8">
                    {DYNAMICS.map(d => (
                      <div
                        key={d.symbol}
                        className="p-3 rounded-xl text-center"
                        style={{ backgroundColor: `${d.color}40`, borderColor: d.color, borderWidth: '2px' }}
                      >
                        <div className="text-3xl font-bold text-white">{d.symbol}</div>
                        <div className="text-xs text-white/80">{d.meaning}</div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={playAudio}
                  className={`px-10 py-5 rounded-2xl text-3xl font-bold flex items-center gap-3 mx-auto hover:scale-105 transition-all ${
                    isPlaying
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}
                >
                  {isPlaying ? <><Pause size={40} /> Pause</> : <><Play size={40} /> Play Audio</>}
                </button>
              </div>
            )}

            {/* Guessing - audio playing, waiting for answers */}
            {gamePhase === 'guessing' && question && (
              <div className="text-center">
                <div className="text-5xl font-black mb-2">🎧 LISTEN!</div>
                <p className="text-2xl text-yellow-300 mb-4">"{question.description}"</p>
                <p className="text-xl text-white/70 mb-6">
                  {question.questionType === 'gradual'
                    ? 'Is this crescendo or decrescendo?'
                    : 'What dynamic level do you hear?'}
                </p>

                {/* Dynamic options - show different options based on question type */}
                {question.questionType === 'gradual' ? (
                  <div className="flex gap-6 justify-center mb-6">
                    {GRADUAL_DYNAMICS.map(d => (
                      <div
                        key={d.symbol}
                        className="p-6 rounded-xl text-center min-w-[200px]"
                        style={{ backgroundColor: `${d.color}40`, borderColor: d.color, borderWidth: '3px' }}
                      >
                        <div className="text-4xl font-bold text-white mb-2">{d.name}</div>
                        <div className="text-lg text-white/80">{d.meaning}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2 max-w-3xl mx-auto mb-6">
                    {DYNAMICS.map(d => (
                      <div
                        key={d.symbol}
                        className="p-3 rounded-xl text-center"
                        style={{ backgroundColor: `${d.color}40`, borderColor: d.color, borderWidth: '2px' }}
                      >
                        <div className="text-3xl font-bold text-white">{d.symbol}</div>
                        <div className="text-xs text-white/80">{d.meaning}</div>
                      </div>
                    ))}
                  </div>
                )}

                {isPlaying && (
                  <div className="text-xl text-green-400 animate-pulse mb-4">🔊 Playing...</div>
                )}

                {/* Answer count */}
                <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-6">
                  <span className="text-4xl font-black text-green-400">{lockedCount}</span>
                  <span className="text-xl text-white/70"> / {students.length} answered</span>
                </div>

                {/* Control buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={playAudio}
                    className={`px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 ${
                      isPlaying
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isPlaying ? <><Pause size={24} /> Pause</> : <><RotateCcw size={24} /> Replay</>}
                  </button>
                  <button
                    onClick={reveal}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Eye size={28} /> Reveal Answer
                  </button>
                </div>
              </div>
            )}

            {/* Revealed */}
            {gamePhase === 'revealed' && question && correctDynamic && (
              <div className="text-center">
                <div className="text-3xl text-white/80 mb-4">The answer is...</div>

                {/* Answer display - different layout for gradual vs level */}
                <div
                  className="rounded-3xl p-8 mb-6 max-w-md mx-auto"
                  style={{ backgroundColor: correctDynamic.color }}
                >
                  {question.questionType === 'gradual' ? (
                    <>
                      <div className="text-6xl font-black text-white mb-2">{correctDynamic.name}</div>
                      <div className="text-3xl text-white/80">{correctDynamic.meaning}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-8xl font-black text-white mb-2">{correctDynamic.symbol}</div>
                      <div className="text-3xl font-bold text-white/90">{correctDynamic.name}</div>
                      <div className="text-2xl text-white/80">{correctDynamic.meaning}</div>
                    </>
                  )}
                </div>

                <div className="text-xl text-white/70 mb-6">
                  {correctCount} of {students.length} students got it correct!
                </div>

                <button
                  onClick={nextQuestion}
                  className="px-10 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                >
                  {currentQuestion >= shuffledQuestions.length - 1 ? (
                    <>Finish <Trophy size={28} /></>
                  ) : (
                    <>Next Question <ChevronRight size={28} /></>
                  )}
                </button>
              </div>
            )}

            {/* Finished */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <div className="text-9xl mb-6">🏆</div>
                <h2 className="text-5xl font-black mb-4">Game Complete!</h2>
                <p className="text-2xl text-white/70 mb-8">Great job everyone!</p>
                <button
                  onClick={() => onComplete?.()}
                  className="px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Trophy size={28} />
                  Advance to See Results
                </button>
              </div>
            )}

          </div>

          {/* Leaderboard */}
          {gamePhase !== 'setup' && (
            <div className="bg-black/20 rounded-2xl p-4 flex flex-col min-h-0">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="text-yellow-400" size={32} />
                <h2 className="text-2xl font-bold">Leaderboard</h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {leaderboard.map((student, idx) => {
                  const change = scoreChanges[student.id];
                  const isRevealing = gamePhase === 'revealed';
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        idx === 0 ? 'bg-yellow-500/20' : 'bg-white/5'
                      } ${isRevealing && change?.isCorrect ? 'ring-2 ring-green-400' : ''} ${isRevealing && change?.isPartial ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      <span className="w-8 text-center font-bold text-xl">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: student.playerColor }}
                      >
                        {student.playerEmoji || student.name.charAt(0)}
                      </div>
                      <span className="flex-1 truncate text-lg font-medium">{student.name}</span>
                      {gamePhase === 'guessing' && student.answer && (
                        <span className="text-green-400 text-sm">✓</span>
                      )}
                      <span className="font-bold text-xl">
                        {student.score}
                      </span>
                      {isRevealing && change?.isCorrect && (
                        <span className="text-lg font-bold text-green-400">✓</span>
                      )}
                      {isRevealing && change?.isPartial && (
                        <span className="text-lg font-bold text-yellow-400">~</span>
                      )}
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <div className="text-center text-white/50 py-6 text-lg">Waiting for students...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicsDashClassGame;
