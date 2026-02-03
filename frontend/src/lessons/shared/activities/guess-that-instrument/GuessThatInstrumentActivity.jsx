// File: /src/lessons/shared/activities/guess-that-instrument/GuessThatInstrumentActivity.jsx
// Guess That Instrument - Class game for identifying orchestra instruments
// Three difficulty levels: Families, Distinct Instruments, Similar Instruments

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Play, Pause, RotateCcw, Trophy, Clock, ChevronRight, Music } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import {
  INSTRUMENTS,
  FAMILIES,
  getQuestionsForLevel,
  shuffleArray,
  INSTRUMENT_EXPLANATIONS,
  LEVEL_INFO
} from './guessThatInstrumentConfig';

const GuessThatInstrumentActivity = ({ onComplete, viewMode = false }) => {
  const { sessionCode, userId: contextUserId, userRole } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  // Game state
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [guessResult, setGuessResult] = useState(null);
  const [score, setScore] = useState(0);
  const [totalRounds] = useState(9);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  // Timer states
  const [startTime, setStartTime] = useState(null);
  const [answerTime, setAnswerTime] = useState(0);

  // Player info
  const [playerName, setPlayerName] = useState('');

  const audioRef = useRef(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Calculate speed bonus
  const calculateSpeedBonus = (timeInMs) => {
    const seconds = timeInMs / 1000;
    if (seconds < 2) return 10;
    if (seconds < 4) return 8;
    if (seconds < 6) return 6;
    if (seconds < 8) return 4;
    if (seconds < 10) return 2;
    return 0;
  };

  // Format time display
  const formatTime = (ms) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  // Start game with selected level
  const handleStartGame = (level) => {
    setSelectedLevel(level);
    const questions = getQuestionsForLevel(level);
    const shuffled = shuffleArray([...questions]);
    setShuffledQuestions(shuffled);
    setCurrentQuestion(shuffled[0]);
    setGameStarted(true);
    setCurrentRound(0);
    setScore(0);
    setHasPlayedAudio(false);
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

    audio.onplay = () => {
      setIsPlaying(true);
      if (!hasPlayedAudio) {
        setStartTime(Date.now());
        setHasPlayedAudio(true);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.onerror = (e) => {
      console.error('Audio failed to load:', instrument.audioFile, e);
      setIsPlaying(false);
    };

    audio.play().catch(err => {
      console.error('Audio play failed:', err);
      setIsPlaying(false);
    });
  }, [currentQuestion, hasPlayedAudio]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  // Handle answer selection
  const handleAnswer = (answerId) => {
    if (showAnswer || !hasPlayedAudio) return;

    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    setAnswerTime(timeTaken);

    stopAudio();

    const isCorrect = answerId === currentQuestion.correctAnswer;
    setGuessResult(isCorrect);
    setShowAnswer(true);

    if (isCorrect) {
      const basePoints = 10;
      const speedBonus = calculateSpeedBonus(timeTaken);
      const points = basePoints + speedBonus;
      setScore(prev => prev + points);

      // Update score in Firebase
      if (sessionCode && userId) {
        try {
          const db = getDatabase();
          update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
            guessInstrumentScore: score + points,
            lastUpdated: Date.now()
          });
        } catch (err) {
          console.error('Failed to update score:', err);
        }
      }
    }
  };

  // Move to next round
  const handleNextRound = () => {
    const nextRound = currentRound + 1;

    if (nextRound >= totalRounds) {
      setGameComplete(true);
      if (onComplete) onComplete();
      return;
    }

    setCurrentRound(nextRound);
    setCurrentQuestion(shuffledQuestions[nextRound]);
    setShowAnswer(false);
    setGuessResult(null);
    setHasPlayedAudio(false);
    setStartTime(null);
  };

  // Reset game
  const handleResetGame = () => {
    setSelectedLevel(null);
    setGameStarted(false);
    setCurrentRound(0);
    setScore(0);
    setGameComplete(false);
    setShuffledQuestions([]);
    setCurrentQuestion(null);
    setShowAnswer(false);
    setGuessResult(null);
    setHasPlayedAudio(false);
    stopAudio();
  };

  // Get display name for answer (family or instrument)
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

  // ========================================
  // LEVEL SELECTION SCREEN
  // ========================================
  if (!gameStarted) {
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 p-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-2">Guess That Instrument</h1>
            <p className="text-xl text-purple-200">Choose your difficulty level</p>
          </div>
        </div>

        {/* Level Cards */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {[1, 2, 3].map((level) => {
              const info = LEVEL_INFO[level];
              return (
                <button
                  key={level}
                  onClick={() => handleStartGame(level)}
                  className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-purple-500 rounded-2xl p-8 text-left transition-all transform hover:scale-105"
                  style={{ borderColor: info.color }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ backgroundColor: info.color }}
                    >
                      {level}
                    </div>
                    <div>
                      <div className="text-xl font-bold">{info.name.split(': ')[1]}</div>
                      <div className="text-sm" style={{ color: info.color }}>{info.difficulty}</div>
                    </div>
                  </div>
                  <p className="text-gray-400">{info.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-purple-400">
                    <span>Start Level</span>
                    <ChevronRight size={20} />
                  </div>
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
    const percentage = Math.round((score / (totalRounds * 20)) * 100);
    const levelInfo = LEVEL_INFO[selectedLevel];

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <Trophy className="w-24 h-24 mb-6 text-yellow-400" />
        <h1 className="text-4xl font-bold mb-4">Level Complete!</h1>
        <p className="text-2xl text-gray-400 mb-2">{levelInfo.name}</p>
        <div className="text-6xl font-bold text-purple-400 mb-4">{score} points</div>
        <p className="text-xl text-gray-400 mb-8">
          {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Great job!' : 'Keep practicing!'}
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleResetGame}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-lg font-semibold flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Try Another Level
          </button>
          <button
            onClick={() => handleStartGame(selectedLevel)}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN GAME SCREEN
  // ========================================
  const instrument = currentQuestion ? INSTRUMENTS[currentQuestion.instrumentId] : null;
  const levelInfo = LEVEL_INFO[selectedLevel];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header with score and progress */}
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: levelInfo.color }}
            >
              {levelInfo.name}
            </div>
            <div className="text-gray-400">
              Round {currentRound + 1} of {totalRounds}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              <span className="text-xl font-bold">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Question prompt */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {selectedLevel === 1 ? 'Which instrument family is this?' : 'Which instrument is this?'}
          </h2>
          <p className="text-gray-400">
            {!hasPlayedAudio ? 'Press play to hear the sound' : 'Select your answer below'}
          </p>
        </div>

        {/* Play button */}
        <button
          onClick={isPlaying ? stopAudio : playAudio}
          disabled={showAnswer}
          className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all transform hover:scale-105 ${
            showAnswer
              ? 'bg-gray-700 cursor-not-allowed'
              : isPlaying
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isPlaying ? (
            <Pause size={48} />
          ) : (
            <Play size={48} className="ml-2" />
          )}
        </button>

        {/* Answer choices */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl w-full mb-8">
          {currentQuestion?.choices.map((choiceId) => {
            const isCorrect = choiceId === currentQuestion.correctAnswer;
            const isSelected = showAnswer && guessResult !== null;
            const displayName = getDisplayName(choiceId);
            const color = getAnswerColor(choiceId);

            let buttonStyle = 'bg-gray-800 hover:bg-gray-700 border-gray-600';
            if (showAnswer) {
              if (isCorrect) {
                buttonStyle = 'bg-green-600 border-green-500';
              } else if (!guessResult && choiceId === currentQuestion.correctAnswer) {
                buttonStyle = 'bg-green-600 border-green-500';
              }
            }

            return (
              <button
                key={choiceId}
                onClick={() => handleAnswer(choiceId)}
                disabled={showAnswer || !hasPlayedAudio}
                className={`p-6 rounded-xl border-2 text-xl font-semibold transition-all ${buttonStyle} ${
                  !hasPlayedAudio ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span>{displayName}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Answer feedback */}
        {showAnswer && (
          <div className="text-center max-w-2xl">
            <div className={`text-2xl font-bold mb-2 ${guessResult ? 'text-green-400' : 'text-red-400'}`}>
              {guessResult ? '✓ Correct!' : '✗ Not quite!'}
            </div>
            {guessResult && (
              <div className="text-lg text-gray-400 mb-2">
                +10 points + {calculateSpeedBonus(answerTime)} speed bonus ({formatTime(answerTime)})
              </div>
            )}
            <p className="text-gray-400 mb-6">
              {INSTRUMENT_EXPLANATIONS[currentQuestion.instrumentId]}
            </p>
            <button
              onClick={handleNextRound}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold flex items-center gap-2 mx-auto"
            >
              {currentRound + 1 >= totalRounds ? 'See Results' : 'Next Question'}
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex-shrink-0 bg-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
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

export default GuessThatInstrumentActivity;
