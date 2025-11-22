// File: /src/lessons/shared/activities/layer-detective/LayerDetectivePartnerGame.jsx
// Layer Detective Partner Game - 2-3 player turn-based game
// ✅ OPTIMIZED for Chromebook screens (1366x768)

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw, Trophy, Users, Lightbulb, CheckCircle, Star, Clock, AlertCircle } from 'lucide-react';

const LayerDetectivePartnerGame = ({ onComplete, viewMode = false }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [numberOfPlayers, setNumberOfPlayers] = useState(null); // 2 or 3 players
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [guessResult, setGuessResult] = useState(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0, player3: 0 });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [roundsToPlay, setRoundsToPlay] = useState(10);
  const [gameComplete, setGameComplete] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [answerTime, setAnswerTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const audioRefs = useRef([]);

  // All possible loop combinations for questions
  const allLoops = [
    // Heroic loops
    { name: 'Heroic Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Heroic Drums 1.mp3', color: '#EF4444' },
    { name: 'Heroic Brass 2', category: 'Brass', file: '/projects/film-music-score/loops/Heroic Brass 2.mp3', color: '#F59E0B' },
    { name: 'Heroic Strings 1', category: 'Strings', file: '/projects/film-music-score/loops/Heroic Strings 1.mp3', color: '#10B981' },
    { name: 'Heroic Synth 1', category: 'Synth', file: '/projects/film-music-score/loops/Heroic Synth 1.mp3', color: '#8B5CF6' },
    { name: 'Heroic Choir 1', category: 'Choir', file: '/projects/film-music-score/loops/Heroic Choir 1.mp3', color: '#EC4899' },
    { name: 'Heroic Bass 1', category: 'Bass', file: '/projects/film-music-score/loops/Heroic Bass 1.mp3', color: '#3B82F6' },
    
    // Scary loops
    { name: 'Scary Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Scary Drums 1.mp3', color: '#EF4444' },
    { name: 'Scary Brass 1', category: 'Brass', file: '/projects/film-music-score/loops/Scary Brass 1.mp3', color: '#F59E0B' },
    { name: 'Scary Strings 2', category: 'Strings', file: '/projects/film-music-score/loops/Scary Strings 2.mp3', color: '#10B981' },
    { name: 'Scary Synth 2', category: 'Synth', file: '/projects/film-music-score/loops/Scary Synth 2.mp3', color: '#8B5CF6' },
    { name: 'Scary Choir 1', category: 'Choir', file: '/projects/film-music-score/loops/Scary Choir 1.mp3', color: '#EC4899' },
    { name: 'Scary Bass 1', category: 'Bass', file: '/projects/film-music-score/loops/Scary Bass 1.mp3', color: '#3B82F6' },
  ];

  // Voice reading function
  const speakText = (text) => {
    if (!voiceEnabled || !text) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang === 'en-US' && (
          voice.name.includes('Google US English') ||
          voice.name.includes('Microsoft David') ||
          voice.name.includes('Microsoft Mark') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Alex')
        )
      ) || voices.find(voice => voice.lang === 'en-US') || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Load voices when ready
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (startTime && !guessResult) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, guessResult]);

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

  // Generate a random question with 1-3 layers (A, B, or C)
  const generateQuestion = () => {
    // Randomly choose how many layers (1-3)
    const numLayers = Math.floor(Math.random() * 3) + 1;
    
    // Randomly select that many loops
    const shuffled = [...allLoops].sort(() => Math.random() - 0.5);
    const selectedLayers = shuffled.slice(0, numLayers);
    
    // Map number to letter: 1=A, 2=B, 3=C
    const letterMap = { 1: 'A', 2: 'B', 3: 'C' };
    
    return {
      layers: selectedLayers,
      correctAnswer: letterMap[numLayers]
    };
  };

  // Start a new round
  const startNewRound = () => {
    console.log('🎮 Starting new layer detective round...');
    
    const question = generateQuestion();
    console.log('🎵 Generated question:', question.layers.length, 'layers');
    
    setCurrentQuestion(question);
    setGuessResult(null);
    setShowHint(false);
    setHintUsed(false);
    setIsPlaying(false);
    setCurrentRound(prev => prev + 1);
    setStartTime(Date.now());
    setCurrentTime(0);
    setAnswerTime(0);
    
    console.log('✅ Round setup complete');
  };

  // Play all layers together
  const playLayers = () => {
    if (!currentQuestion) return;
    
    if (isPlaying) {
      // Stop all audio
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      setIsPlaying(false);
    } else {
      // Play all layers
      audioRefs.current.forEach((audio, index) => {
        if (audio && index < currentQuestion.layers.length) {
          audio.currentTime = 0;
          audio.play().catch(err => console.error('Failed to play:', err));
        }
      });
      setIsPlaying(true);
    }
  };

  // Handle audio end - loop it
  useEffect(() => {
    const handleEnded = (index) => {
      if (audioRefs.current[index] && isPlaying) {
        audioRefs.current[index].currentTime = 0;
        audioRefs.current[index].play();
      }
    };

    audioRefs.current.forEach((audio, index) => {
      if (audio) {
        audio.addEventListener('ended', () => handleEnded(index));
      }
    });

    return () => {
      audioRefs.current.forEach((audio, index) => {
        if (audio) {
          audio.removeEventListener('ended', () => handleEnded(index));
        }
      });
    };
  }, [isPlaying]);

  // Auto-play when new round starts
  useEffect(() => {
    if (!currentQuestion || guessResult) return;
    
    const timer = setTimeout(() => {
      if (currentQuestion && !isPlaying) {
        playLayers();
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [currentQuestion, guessResult]);

  // Handle guess
  const handleGuess = (guessedLetter) => {
    if (guessResult) return;
    
    const isCorrect = guessedLetter === currentQuestion.correctAnswer;
    const timeElapsed = Date.now() - startTime;
    setAnswerTime(timeElapsed);
    
    // Calculate points
    let points = 0;
    let speedBonus = 0;
    
    if (isCorrect) {
      const basePoints = hintUsed ? 5 : 10;
      
      if (!hintUsed) {
        speedBonus = calculateSpeedBonus(timeElapsed);
      }
      
      points = basePoints + speedBonus;
    }
    
    // Update score for current player
    setScores(prev => ({
      ...prev,
      [`player${currentPlayer}`]: prev[`player${currentPlayer}`] + points
    }));
    
    setGuessResult({ 
      isCorrect, 
      correctAnswer: currentQuestion.correctAnswer, 
      points,
      basePoints: isCorrect ? (hintUsed ? 5 : 10) : 0,
      speedBonus,
      timeElapsed 
    });
    
    // Stop playing
    audioRefs.current.forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setIsPlaying(false);
  };

  // Next round
  const handleNextRound = () => {
    if (currentRound >= roundsToPlay) {
      setGameComplete(true);
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      setIsPlaying(false);
    } else {
      // Switch players
      setCurrentPlayer(prev => {
        if (numberOfPlayers === 2) {
          return prev === 1 ? 2 : 1;
        } else {
          if (prev === 1) return 2;
          if (prev === 2) return 3;
          return 1;
        }
      });
      startNewRound();
    }
  };

  // Start game
  const handleStartGame = () => {
    setGameStarted(true);
    setCurrentRound(0);
    setScores({ player1: 0, player2: 0, player3: 0 });
    setCurrentPlayer(1);
    setGameComplete(false);
    startNewRound();
  };

  // Restart game
  const handleRestartGame = () => {
    setGameStarted(false);
    setNumberOfPlayers(null);
    setShowHowToPlay(false);
    setCurrentRound(0);
    setScores({ player1: 0, player2: 0, player3: 0 });
    setCurrentPlayer(1);
    setGameComplete(false);
    setCurrentQuestion(null);
    setGuessResult(null);
    setStartTime(null);
    setCurrentTime(0);
    audioRefs.current.forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setIsPlaying(false);
  };

  // Show hint
  const handleShowHint = () => {
    setShowHint(true);
    setHintUsed(true);
  };

  // Format time
  const formatTime = (ms) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  // PLAYER SELECTION SCREEN - ✅ OPTIMIZED HEIGHT
  if (!numberOfPlayers) {
    return (
      <div className="h-full bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center p-3">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full">
          <div className="mb-4">
            <h1 className="text-3xl font-black text-orange-600 mb-3 leading-tight">
              YOU ONLY USE<br/>ONE DEVICE<br/>FOR THIS GAME
            </h1>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              How many players?
            </h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setNumberOfPlayers(2);
                  speakText("Two players selected. You only use one device for this game. How to play: Sit together at one computer. Listen to the loops carefully. Count how many layers you hear. Answer fast for more points! Take turns and see who wins!");
                }}
                className="bg-gradient-to-br from-orange-500 to-red-700 text-white py-8 px-12 rounded-2xl font-black text-5xl hover:from-orange-600 hover:to-red-800 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                2
              </button>
              <button
                onClick={() => {
                  setNumberOfPlayers(3);
                  speakText("Three players selected. You only use one device for this game. How to play: Sit together at one computer. Listen to the loops carefully. Count how many layers you hear. Answer fast for more points! Take turns and see who wins!");
                }}
                className="bg-gradient-to-br from-red-500 to-pink-700 text-white py-8 px-12 rounded-2xl font-black text-5xl hover:from-red-600 hover:to-pink-800 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                3
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // HOW TO PLAY SCREEN - ✅ OPTIMIZED HEIGHT
  if (numberOfPlayers && !showHowToPlay) {
    return (
      <div className="h-full bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center p-3 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl p-4 max-w-3xl w-full my-3">
          <div className="text-center mb-3">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              🔍 How to Play Layer Detective
            </h1>
            <p className="text-base text-gray-700">
              {numberOfPlayers} Player Game
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 mb-3">
            <ol className="space-y-2 text-base text-gray-800">
              <li className="flex items-start">
                <span className="bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0">1</span>
                <span className="leading-relaxed pt-0.5">Sit together at one computer</span>
              </li>
              <li className="flex items-start">
                <span className="bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0">2</span>
                <span className="leading-relaxed pt-0.5">Listen to the loops carefully</span>
              </li>
              <li className="flex items-start">
                <span className="bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0">3</span>
                <span className="leading-relaxed pt-0.5">Count how many layers you hear (1, 2, or 3)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0">4</span>
                <span className="leading-relaxed pt-0.5">Answer fast for more points!</span>
              </li>
              <li className="flex items-start">
                <span className="bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0">5</span>
                <span className="leading-relaxed pt-0.5">Take turns & see who wins!</span>
              </li>
            </ol>
            
            <div className="mt-2 pt-2 border-t-2 border-orange-200">
              <p className="text-sm text-gray-700 flex items-center justify-center">
                <Lightbulb className="mr-1.5 text-yellow-600" size={18} />
                <span>Using a hint removes speed bonus</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowHowToPlay(true);
              speakText("Select the number of rounds to play");
            }}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
          >
            Continue to Game Setup →
          </button>
        </div>
      </div>
    );
  }

  // GAME SETUP SCREEN - ✅ OPTIMIZED HEIGHT
  if (!gameStarted) {
    return (
      <div className="h-full bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-5 max-w-xl w-full">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <span className="text-3xl">🔍</span>
              Layer Detective
            </h1>
            <p className="text-base text-gray-700 mt-1">{numberOfPlayers} Player Game</p>
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold text-gray-700 mb-2 text-center">
              Number of Rounds
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map(num => (
                <button
                  key={num}
                  onClick={() => setRoundsToPlay(num)}
                  className={`py-3 px-4 rounded-lg font-bold text-xl transition-colors ${
                    roundsToPlay === num
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <Play size={24} />
            <span>Start Game!</span>
          </button>
        </div>
      </div>
    );
  }

  // GAME COMPLETE SCREEN - ✅ OPTIMIZED HEIGHT
  if (gameComplete) {
    let winner = null;
    let highScore = Math.max(scores.player1, scores.player2, numberOfPlayers === 3 ? scores.player3 : 0);
    let winners = [];
    
    if (scores.player1 === highScore) winners.push(1);
    if (scores.player2 === highScore) winners.push(2);
    if (numberOfPlayers === 3 && scores.player3 === highScore) winners.push(3);
    
    winner = winners.length === 1 ? winners[0] : null;
    
    return (
      <div className="h-full bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-4 max-w-xl w-full">
          <div className="text-center mb-3">
            <Trophy className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Game Over!</h1>
            {winner ? (
              <p className="text-lg text-gray-600">Player {winner} Wins! 🎉</p>
            ) : (
              <p className="text-lg text-gray-600">It's a Tie! 🤝</p>
            )}
          </div>

          <div className={`grid ${numberOfPlayers === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-3`}>
            <div className={`rounded-lg p-3 text-center ${
              winner === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : 'bg-orange-50'
            }`}>
              <div className="text-xs font-semibold mb-1 opacity-80">Player 1</div>
              <div className="text-3xl font-bold mb-0.5">{scores.player1}</div>
              <div className="text-xs opacity-80">points</div>
              {winner === 1 && <Star className="w-5 h-5 mx-auto mt-1" fill="currentColor" />}
            </div>
            
            <div className={`rounded-lg p-3 text-center ${
              winner === 2 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : 'bg-red-50'
            }`}>
              <div className="text-xs font-semibold mb-1 opacity-80">Player 2</div>
              <div className="text-3xl font-bold mb-0.5">{scores.player2}</div>
              <div className="text-xs opacity-80">points</div>
              {winner === 2 && <Star className="w-5 h-5 mx-auto mt-1" fill="currentColor" />}
            </div>

            {numberOfPlayers === 3 && (
              <div className={`rounded-lg p-3 text-center ${
                winner === 3 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : 'bg-pink-50'
              }`}>
                <div className="text-xs font-semibold mb-1 opacity-80">Player 3</div>
                <div className="text-3xl font-bold mb-0.5">{scores.player3}</div>
                <div className="text-xs opacity-80">points</div>
                {winner === 3 && <Star className="w-5 h-5 mx-auto mt-1" fill="currentColor" />}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleRestartGame}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 rounded-lg font-bold text-base hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <RotateCcw size={18} />
              <span>Play Again</span>
            </button>
            
            {onComplete && (
              <button
                onClick={onComplete}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
              >
                Back to Composition
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // GAME PLAYING SCREEN - ✅ OPTIMIZED HEIGHT
  return (
    <div className="h-full bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center p-3">
      {/* Hidden audio elements for each layer */}
      {currentQuestion?.layers.map((layer, index) => (
        <audio
          key={index}
          ref={el => audioRefs.current[index] = el}
          src={layer.file}
        />
      ))}
      
      <div className="bg-white rounded-xl shadow-2xl p-3 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-gray-200">
          <div className="text-xs text-gray-600">
            Round <span className="font-bold text-base text-gray-900">{currentRound}</span> / {roundsToPlay}
          </div>
          
          <div className={`px-3 py-1 rounded-full font-bold text-sm ${
            currentPlayer === 1 
              ? 'bg-orange-100 text-orange-800' 
              : currentPlayer === 2
              ? 'bg-red-100 text-red-800'
              : 'bg-pink-100 text-pink-800'
          }`}>
            Player {currentPlayer}'s Turn
          </div>
          
          <button
            onClick={handleRestartGame}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Score Display */}
        <div className={`grid ${numberOfPlayers === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mb-3`}>
          <div className={`rounded-lg p-2 text-center transition-all ${
            currentPlayer === 1 
              ? 'bg-orange-100 border-2 border-orange-500' 
              : 'bg-gray-100'
          }`}>
            <div className="text-xs font-semibold text-gray-600">Player 1</div>
            <div className="text-xl font-bold text-gray-900">{scores.player1}</div>
          </div>
          
          <div className={`rounded-lg p-2 text-center transition-all ${
            currentPlayer === 2 
              ? 'bg-red-100 border-2 border-red-500' 
              : 'bg-gray-100'
          }`}>
            <div className="text-xs font-semibold text-gray-600">Player 2</div>
            <div className="text-xl font-bold text-gray-900">{scores.player2}</div>
          </div>

          {numberOfPlayers === 3 && (
            <div className={`rounded-lg p-2 text-center transition-all ${
              currentPlayer === 3 
                ? 'bg-pink-100 border-2 border-pink-500' 
                : 'bg-gray-100'
            }`}>
              <div className="text-xs font-semibold text-gray-600">Player 3</div>
              <div className="text-xl font-bold text-gray-900">{scores.player3}</div>
            </div>
          )}
        </div>

        {!guessResult ? (
          <>
            {/* Timer Display */}
            <div className="text-center mb-2">
              <div className="inline-flex items-center space-x-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                <Clock size={16} className="text-gray-600" />
                <span className="font-mono text-base font-bold text-gray-900">
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>

            {/* Play Button */}
            <div className="text-center mb-3">
              <div className="text-base font-bold text-gray-900 mb-1.5">
                🎧 How many layers do you hear?
              </div>
              <button
                onClick={playLayers}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center justify-center space-x-1.5 mx-auto"
              >
                {isPlaying ? (
                  <>
                    <Pause size={18} />
                    <span>Pause Loops</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>Play Loops</span>
                  </>
                )}
              </button>
            </div>

            {/* Hint Button */}
            {!showHint && (
              <div className="text-center mb-2">
                <button
                  onClick={handleShowHint}
                  className="text-orange-600 hover:text-orange-700 text-xs font-semibold flex items-center justify-center mx-auto space-x-1"
                >
                  <Lightbulb size={14} />
                  <span>Need a hint? (No speed bonus)</span>
                </button>
              </div>
            )}

            {/* Hint Display */}
            {showHint && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-2 mb-2">
                <div className="flex items-start space-x-1.5">
                  <Lightbulb className="text-yellow-600 mt-0.5 flex-shrink-0" size={16} />
                  <div className="text-xs">
                    <div className="font-semibold text-gray-900">Hint:</div>
                    <div className="text-gray-700">
                      Categories: <span className="font-bold">
                        {[...new Set(currentQuestion.layers.map(l => l.category))].join(', ')}
                      </span>
                      <div className="text-xs text-gray-600 mt-0.5">
                        (Speed bonus disabled)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Answer Options - 3 choices: A, B, C */}
            <div className="space-y-1.5">
              {[
                { letter: 'A', num: 1, label: '1 Layer' },
                { letter: 'B', num: 2, label: '2 Layers' },
                { letter: 'C', num: 3, label: '3 Layers' }
              ].map((option) => (
                <button
                  key={option.letter}
                  onClick={() => handleGuess(option.letter)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-left px-3 py-2 rounded-lg font-semibold text-sm transition-colors border-2 border-transparent hover:border-gray-300"
                >
                  <span className="text-gray-500 mr-2 font-bold">{option.letter})</span>
                  {option.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Result Screen */
          <div className="text-center">
            <div className={`text-4xl mb-2 ${guessResult.isCorrect ? 'animate-bounce' : ''}`}>
              {guessResult.isCorrect ? '✅' : '❌'}
            </div>
            
            <div className={`text-xl font-bold mb-2 ${
              guessResult.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {guessResult.isCorrect ? 'Correct!' : 'Wrong!'}
            </div>
            
            {guessResult.isCorrect ? (
              <div className="mb-3">
                <div className="text-lg font-bold text-gray-900 mb-1.5">
                  +{guessResult.points} points! 🎉
                </div>
                
                <div className="inline-block bg-gray-100 rounded-lg p-2 text-left">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between space-x-4">
                      <span className="text-gray-600">Answer time:</span>
                      <span className="font-bold text-gray-900">{formatTime(guessResult.timeElapsed)}</span>
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                      <span className="text-gray-600">Base points:</span>
                      <span className="font-bold text-orange-600">+{guessResult.basePoints}</span>
                    </div>
                    {guessResult.speedBonus > 0 && (
                      <div className="flex items-center justify-between space-x-4">
                        <span className="text-gray-600">Speed bonus:</span>
                        <span className="font-bold text-green-600">+{guessResult.speedBonus}</span>
                      </div>
                    )}
                    {hintUsed && (
                      <div className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-300">
                        Hint used - no speed bonus
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-base text-gray-700 mb-3">
                The correct answer was:<br />
                <span className="font-bold text-gray-900">{guessResult.correctAnswer} - {currentQuestion.layers.length} Layer{currentQuestion.layers.length > 1 ? 's' : ''}</span>
                <div className="text-xs text-gray-500 mt-0.5">
                  You answered in {formatTime(guessResult.timeElapsed)}
                </div>
              </div>
            )}
            
            <button
              onClick={handleNextRound}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-5 py-2 rounded-lg font-bold text-base hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
            >
              {currentRound >= roundsToPlay ? 'See Results' : 'Next Round →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayerDetectivePartnerGame;