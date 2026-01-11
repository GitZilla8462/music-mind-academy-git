// File: /src/lessons/shared/activities/leitmotif-detective/LeitmotifDetectiveActivity.jsx
// Leitmotif Detective - Students listen to themes and identify character types
// Responsive for 1920x1080 (teacher) and 1366x768 (Chromebook student)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Check, X, ChevronRight, Trophy, Volume2, RotateCcw } from 'lucide-react';
import { CHARACTER_TYPES } from './leitmotifDetectiveConfig';
import { DETECTIVE_THEMES } from './leitmotifDetectiveConfig';
import { saveDetectiveScore } from '../../../film-music/lesson1/lesson1StorageUtils';

const LeitmotifDetectiveActivity = ({ onComplete, isSessionMode = false, demoMode = false, viewMode = false }) => {
  // Game state
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [responses, setResponses] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const audioRef = useRef(null);
  const currentTheme = DETECTIVE_THEMES[currentThemeIndex];
  const totalThemes = DETECTIVE_THEMES.length;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when theme changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [currentThemeIndex]);

  const playTheme = useCallback(() => {
    if (!currentTheme) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(currentTheme.file);
    audioRef.current.loop = true;
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(err => console.error('Error playing audio:', err));
  }, [currentTheme]);

  const stopTheme = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSelectType = (typeId) => {
    if (hasAnswered) return;
    setSelectedType(typeId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedType || hasAnswered) return;

    const correct = selectedType === currentTheme.correctType;
    setIsCorrect(correct);
    setHasAnswered(true);
    setShowExplanation(true);
    stopTheme();

    // Update score
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // Record response
    setResponses(prev => [...prev, {
      themeId: currentTheme.id,
      themeName: currentTheme.name,
      selectedType,
      correctType: currentTheme.correctType,
      isCorrect: correct
    }]);
  };

  const handleNextTheme = () => {
    if (currentThemeIndex < totalThemes - 1) {
      setCurrentThemeIndex(prev => prev + 1);
      setSelectedType(null);
      setHasAnswered(false);
      setIsCorrect(false);
      setShowExplanation(false);
    } else {
      // Game complete
      setGameComplete(true);

      // Save score
      const finalScore = {
        correct: score.correct + (isCorrect ? 0 : 0), // Already updated
        total: score.total
      };
      saveDetectiveScore(finalScore.correct, finalScore.total, responses);
    }
  };

  const handlePlayAgain = () => {
    setCurrentThemeIndex(0);
    setSelectedType(null);
    setHasAnswered(false);
    setIsCorrect(false);
    setScore({ correct: 0, total: 0 });
    setResponses([]);
    setGameComplete(false);
    setShowExplanation(false);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Game Complete Screen
  if (gameComplete) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const message = percentage >= 80 ? "Detective Master!" :
                    percentage >= 60 ? "Great Work!" :
                    "Keep Practicing!";

    return (
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Trophy className="text-yellow-400" size={32} />
              Leitmotif Detective - Results
            </h1>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? "🏆" : percentage >= 60 ? "⭐" : "🎵"}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{message}</h2>
            <p className="text-5xl font-bold text-orange-400 mb-4">
              {score.correct}/{score.total}
            </p>
            <p className="text-xl text-gray-400 mb-6">
              {percentage}% Correct
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handlePlayAgain}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                <RotateCcw size={20} />
                Play Again
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Continue
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-700 p-4 md:p-6">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🔍</span>
            Leitmotif Detective
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-lg text-gray-400">
              Theme {currentThemeIndex + 1} of {totalThemes}
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <span className="text-orange-400 font-bold">{score.correct}</span>
              <span className="text-gray-500"> / {score.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Theme Card */}
          <div className="bg-gray-800 rounded-2xl p-6 md:p-8 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl text-gray-300 mb-2">
                Listen to this theme and identify the character type:
              </h2>
              <p className="text-lg text-gray-500">
                {currentTheme?.name || 'Mystery Theme'}
              </p>
            </div>

            {/* Play Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={isPlaying ? stopTheme : playTheme}
                disabled={hasAnswered}
                className={`flex items-center gap-3 px-8 py-4 rounded-full text-xl font-semibold transition-all ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                } ${hasAnswered ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isPlaying ? (
                  <>
                    <Pause size={28} />
                    Stop Theme
                  </>
                ) : (
                  <>
                    <Play size={28} fill="currentColor" />
                    Play Theme
                  </>
                )}
              </button>
            </div>

            {/* Character Type Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {CHARACTER_TYPES.map((type) => {
                const isSelected = selectedType === type.id;
                const isCorrectAnswer = hasAnswered && type.id === currentTheme?.correctType;
                const isWrongAnswer = hasAnswered && isSelected && !isCorrect;

                return (
                  <button
                    key={type.id}
                    onClick={() => handleSelectType(type.id)}
                    disabled={hasAnswered}
                    className={`p-4 md:p-5 rounded-xl border-2 transition-all text-left ${
                      isCorrectAnswer
                        ? 'border-green-500 bg-green-500/20'
                        : isWrongAnswer
                        ? 'border-red-500 bg-red-500/20'
                        : isSelected
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    } ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className="text-2xl md:text-3xl font-bold"
                        style={{ color: type.color }}
                      >
                        {type.name}
                      </span>
                      {isCorrectAnswer && (
                        <Check className="text-green-400" size={24} />
                      )}
                      {isWrongAnswer && (
                        <X className="text-red-400" size={24} />
                      )}
                    </div>
                    <p className="text-sm md:text-base text-gray-400">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation (shown after answering) */}
          {showExplanation && currentTheme && (
            <div className={`rounded-xl p-6 mb-6 ${
              isCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-orange-900/30 border border-orange-700'
            }`}>
              <h3 className={`text-xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-orange-400'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Not quite!'}
              </h3>
              <p className="text-gray-300 text-lg">
                {currentTheme.explanation}
              </p>
              <p className="text-gray-400 mt-2">
                <span className="font-semibold">Musical clues:</span> {currentTheme.musicalClues}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-700 p-4 md:p-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="text-gray-400">
            {!hasAnswered && selectedType && (
              <span className="text-orange-400">Click "Check Answer" when ready</span>
            )}
            {hasAnswered && (
              <span>{isCorrect ? 'Great job!' : 'Keep listening carefully!'}</span>
            )}
          </div>
          <div className="flex gap-4">
            {!hasAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedType}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  selectedType
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check size={20} />
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNextTheme}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                {currentThemeIndex < totalThemes - 1 ? (
                  <>
                    Next Theme
                    <ChevronRight size={20} />
                  </>
                ) : (
                  <>
                    See Results
                    <Trophy size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeitmotifDetectiveActivity;
