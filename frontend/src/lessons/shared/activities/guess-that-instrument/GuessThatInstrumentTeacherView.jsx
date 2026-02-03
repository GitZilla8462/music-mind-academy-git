// File: /src/lessons/shared/activities/guess-that-instrument/GuessThatInstrumentTeacherView.jsx
// Teacher presentation view for Guess That Instrument game
// Displays on the main screen while students play on their devices

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Play, Pause, RotateCcw, Trophy, ChevronRight, Music, Users } from 'lucide-react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import {
  INSTRUMENTS,
  FAMILIES,
  getQuestionsForLevel,
  shuffleArray,
  INSTRUMENT_EXPLANATIONS,
  LEVEL_INFO
} from './guessThatInstrumentConfig';

const GuessThatInstrumentTeacherView = ({ sessionCode, sessionData, onAdvanceLesson }) => {
  // Game state
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [totalRounds] = useState(9);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [classResponses, setClassResponses] = useState({});

  const audioRef = useRef(null);

  // Listen for class responses from Firebase
  useEffect(() => {
    if (!sessionCode || !gameStarted) return;

    const db = getDatabase();
    const responsesRef = ref(db, `sessions/${sessionCode}/guessInstrumentResponses`);

    const unsubscribe = onValue(responsesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setClassResponses(data);
      }
    });

    return () => unsubscribe();
  }, [sessionCode, gameStarted]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Sync game state to Firebase for students
  const syncGameState = useCallback((state) => {
    if (!sessionCode) return;

    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}`), {
      guessInstrumentState: state
    });
  }, [sessionCode]);

  // Start game with selected level
  const handleStartGame = (level) => {
    setSelectedLevel(level);
    const questions = getQuestionsForLevel(level);
    const shuffled = shuffleArray([...questions]);
    setShuffledQuestions(shuffled);
    setCurrentQuestion(shuffled[0]);
    setGameStarted(true);
    setCurrentRound(0);
    setClassResponses({});

    // Sync to Firebase
    syncGameState({
      level,
      round: 0,
      phase: 'playing',
      questionId: shuffled[0].id
    });
  };

  // Play instrument audio
  const playAudio = useCallback(() => {
    if (!currentQuestion) return;

    const instrument = INSTRUMENTS[currentQuestion.instrumentId];
    if (!instrument) {
      console.error('Instrument not found:', currentQuestion.instrumentId);
      return;
    }

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create new audio
    const audio = new Audio(instrument.audioFile);
    audio.volume = 0.8;
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = (e) => {
      console.error('Audio failed to load:', instrument.audioFile, e);
      setIsPlaying(false);
    };

    audio.play().catch(err => {
      console.error('Audio play failed:', err);
      setIsPlaying(false);
    });
  }, [currentQuestion]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  // Reveal the answer
  const handleRevealAnswer = () => {
    stopAudio();
    setShowAnswer(true);

    // Sync reveal state
    syncGameState({
      level: selectedLevel,
      round: currentRound,
      phase: 'revealed',
      questionId: currentQuestion.id,
      correctAnswer: currentQuestion.correctAnswer
    });
  };

  // Move to next round
  const handleNextRound = () => {
    const nextRound = currentRound + 1;

    if (nextRound >= totalRounds) {
      setGameComplete(true);
      syncGameState({ phase: 'complete', level: selectedLevel });
      return;
    }

    setCurrentRound(nextRound);
    setCurrentQuestion(shuffledQuestions[nextRound]);
    setShowAnswer(false);
    setClassResponses({});

    // Sync next round
    syncGameState({
      level: selectedLevel,
      round: nextRound,
      phase: 'playing',
      questionId: shuffledQuestions[nextRound].id
    });
  };

  // Reset game
  const handleResetGame = () => {
    setSelectedLevel(null);
    setGameStarted(false);
    setCurrentRound(0);
    setGameComplete(false);
    setShuffledQuestions([]);
    setCurrentQuestion(null);
    setShowAnswer(false);
    setClassResponses({});
    stopAudio();

    syncGameState({ phase: 'idle' });
  };

  // Get display name for answer
  const getDisplayName = (answerId) => {
    if (selectedLevel === 1) {
      return FAMILIES[answerId]?.name || answerId;
    }
    return INSTRUMENTS[answerId]?.name || answerId;
  };

  // Get color for answer
  const getAnswerColor = (answerId) => {
    if (selectedLevel === 1) {
      return FAMILIES[answerId]?.color || '#6B7280';
    }
    const instrument = INSTRUMENTS[answerId];
    if (instrument) {
      return FAMILIES[instrument.family]?.color || '#6B7280';
    }
    return '#6B7280';
  };

  // Calculate class statistics
  const getClassStats = () => {
    const total = Object.keys(classResponses).length;
    if (total === 0) return { total: 0, correct: 0, percentage: 0 };

    const correct = Object.values(classResponses).filter(
      r => r.answer === currentQuestion?.correctAnswer
    ).length;

    return {
      total,
      correct,
      percentage: Math.round((correct / total) * 100)
    };
  };

  // ========================================
  // LEVEL SELECTION SCREEN
  // ========================================
  if (!gameStarted) {
    return (
      <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white">
        {/* Header */}
        <div className="flex-shrink-0 p-8 text-center">
          <h1 className="text-6xl font-bold mb-4">Guess That Instrument</h1>
          <p className="text-2xl text-purple-200">Teacher: Choose a difficulty level</p>
        </div>

        {/* Level Cards */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="grid grid-cols-3 gap-8 max-w-6xl">
            {[1, 2, 3].map((level) => {
              const info = LEVEL_INFO[level];
              return (
                <button
                  key={level}
                  onClick={() => handleStartGame(level)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 rounded-3xl p-10 text-left transition-all transform hover:scale-105"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold"
                      style={{ backgroundColor: info.color }}
                    >
                      {level}
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{info.name.split(': ')[1]}</div>
                      <div className="text-xl" style={{ color: info.color }}>{info.difficulty}</div>
                    </div>
                  </div>
                  <p className="text-xl text-purple-200 mb-6">{info.description}</p>
                  <div className="text-lg text-purple-300">9 rounds</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // GAME COMPLETE SCREEN
  // ========================================
  if (gameComplete) {
    const levelInfo = LEVEL_INFO[selectedLevel];

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white p-8">
        <Trophy className="w-32 h-32 mb-8 text-yellow-400" />
        <h1 className="text-6xl font-bold mb-4">Level Complete!</h1>
        <p className="text-3xl text-purple-200 mb-8">{levelInfo.name}</p>

        <div className="flex gap-6 mt-8">
          <button
            onClick={handleResetGame}
            className="px-10 py-5 bg-white/20 hover:bg-white/30 rounded-2xl text-2xl font-semibold flex items-center gap-3"
          >
            <RotateCcw size={28} />
            Try Another Level
          </button>
          <button
            onClick={() => handleStartGame(selectedLevel)}
            className="px-10 py-5 bg-purple-600 hover:bg-purple-700 rounded-2xl text-2xl font-semibold"
          >
            Play Again
          </button>
          {onAdvanceLesson && (
            <button
              onClick={onAdvanceLesson}
              className="px-10 py-5 bg-green-600 hover:bg-green-700 rounded-2xl text-2xl font-semibold flex items-center gap-3"
            >
              Continue Lesson
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN GAME SCREEN
  // ========================================
  const instrument = currentQuestion ? INSTRUMENTS[currentQuestion.instrumentId] : null;
  const levelInfo = LEVEL_INFO[selectedLevel];
  const stats = getClassStats();

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 text-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-black/30 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className="px-6 py-3 rounded-xl text-xl font-semibold"
              style={{ backgroundColor: levelInfo.color }}
            >
              {levelInfo.name}
            </div>
            <div className="text-2xl text-gray-300">
              Round {currentRound + 1} of {totalRounds}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Users size={28} className="text-gray-400" />
            <span className="text-2xl">{stats.total} responses</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Question */}
        <h2 className="text-5xl font-bold mb-8 text-center">
          {selectedLevel === 1 ? 'Which instrument family is this?' : 'Which instrument is this?'}
        </h2>

        {/* Play Button */}
        <button
          onClick={isPlaying ? stopAudio : playAudio}
          disabled={showAnswer}
          className={`w-48 h-48 rounded-full flex items-center justify-center mb-12 transition-all transform hover:scale-105 ${
            showAnswer
              ? 'bg-gray-700 cursor-not-allowed'
              : isPlaying
              ? 'bg-red-600 hover:bg-red-700 animate-pulse'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isPlaying ? (
            <Pause size={80} />
          ) : (
            <Play size={80} className="ml-4" />
          )}
        </button>

        {/* Answer Choices */}
        {!showAnswer && (
          <div className="grid grid-cols-4 gap-6 max-w-5xl w-full mb-8">
            {currentQuestion?.choices.map((choiceId) => {
              const displayName = getDisplayName(choiceId);
              const color = getAnswerColor(choiceId);

              return (
                <div
                  key={choiceId}
                  className="p-6 rounded-2xl bg-white/10 border-2 border-white/20 text-center"
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-3"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-2xl font-semibold">{displayName}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Reveal Button */}
        {!showAnswer && (
          <button
            onClick={handleRevealAnswer}
            className="px-12 py-5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-2xl text-2xl font-bold"
          >
            Reveal Answer
          </button>
        )}

        {/* Answer Reveal */}
        {showAnswer && (
          <div className="text-center max-w-4xl">
            <div className="text-4xl font-bold text-green-400 mb-4">
              Answer: {getDisplayName(currentQuestion.correctAnswer)}
            </div>

            {/* Class Stats */}
            {stats.total > 0 && (
              <div className="bg-white/10 rounded-2xl p-6 mb-6">
                <div className="text-2xl mb-2">
                  Class Results: {stats.correct}/{stats.total} correct ({stats.percentage}%)
                </div>
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Explanation */}
            <p className="text-2xl text-gray-300 mb-8">
              {INSTRUMENT_EXPLANATIONS[currentQuestion.instrumentId]}
            </p>

            <button
              onClick={handleNextRound}
              className="px-12 py-5 bg-purple-600 hover:bg-purple-700 rounded-2xl text-2xl font-semibold flex items-center gap-3 mx-auto"
            >
              {currentRound + 1 >= totalRounds ? 'See Results' : 'Next Question'}
              <ChevronRight size={28} />
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex-shrink-0 bg-black/30 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${((currentRound + 1) / totalRounds) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuessThatInstrumentTeacherView;
