import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Trophy, Users, Lightbulb, CheckCircle, Star, Clock, AlertCircle } from 'lucide-react';
import { loopsData } from './loopData';

const NameThatLoopActivity = ({ onComplete, viewMode = false }) => {
  // Log loops data on component load
  useEffect(() => {
    console.log('✅ Loop data loaded:', loopsData?.length || 0, 'loops');
  }, []);
  const [gameStarted, setGameStarted] = useState(false);
  const [numberOfPlayers, setNumberOfPlayers] = useState(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentLoop, setCurrentLoop] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [guessResult, setGuessResult] = useState(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0, player3: 0 });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [roundsToPlay, setRoundsToPlay] = useState(10);
  const [guessOptions, setGuessOptions] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [answerTime, setAnswerTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const audioRef = useRef(null);

  // Detect if we're in an iframe (teacher preview) - audio auto-play won't work
  const isInIframe = window.self !== window.top;

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

  // Toggle voice and cancel any ongoing speech
  const toggleVoice = () => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  // Load voices when they're ready
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

  // Validate that we have loop data
  if (!loopsData || loopsData.length === 0) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Missing Loop Data</h1>
          <p className="text-gray-600 mb-4 text-sm">
            The game requires loop data to function. Please ensure loopData.js exists.
          </p>
          {onComplete && (
            <button
              onClick={onComplete}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Lesson
            </button>
          )}
        </div>
      </div>
    );
  }

  // Get all unique categories
  const categories = ['all', ...new Set(loopsData.map(loop => loop.category))];

  // Filter loops by category
  const getFilteredLoops = () => {
    if (selectedCategory === 'all') return loopsData;
    return loopsData.filter(loop => loop.category === selectedCategory);
  };

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

  // Get base name without trailing numbers
  const getBaseName = (name) => {
    return name.replace(/\s+\d+$/, '').trim();
  };

  // Check if two loop names are too similar
  const areSimilarNames = (name1, name2) => {
    return getBaseName(name1) === getBaseName(name2);
  };

  // Start a new round
  const startNewRound = () => {
    console.log('🎮 Starting new round...');
    const filteredLoops = getFilteredLoops();
    console.log('📊 Filtered loops:', filteredLoops?.length || 0);
    
    if (!filteredLoops || filteredLoops.length === 0) {
      console.error('❌ No loops available for selected category');
      return;
    }
    
    const randomLoop = filteredLoops[Math.floor(Math.random() * filteredLoops.length)];
    console.log('🎵 Selected loop:', randomLoop?.name);
    
    let options = [];
    
    if (filteredLoops.length >= 4) {
      const wrongAnswers = filteredLoops
        .filter(loop => loop.name !== randomLoop.name && !areSimilarNames(loop.name, randomLoop.name))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      if (wrongAnswers.length < 3) {
        const additionalAnswers = filteredLoops
          .filter(loop => loop.name !== randomLoop.name && !wrongAnswers.some(wa => wa.name === loop.name))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3 - wrongAnswers.length);
        wrongAnswers.push(...additionalAnswers);
      }
      
      options = [...wrongAnswers, randomLoop]
        .sort(() => Math.random() - 0.5)
        .map(loop => loop.name);
    } else {
      options = filteredLoops.map(loop => loop.name);
      while (options.length < 4) {
        options.push(`${options[options.length % filteredLoops.length]} (variation)`);
      }
      options = options.slice(0, 4);
      options.sort(() => Math.random() - 0.5);
    }
    
    setCurrentLoop(randomLoop);
    setGuessOptions(options);
    setGuessResult(null);
    setShowHint(false);
    setHintUsed(false);
    setIsPlaying(false);
    setCurrentRound(prev => prev + 1);
    setStartTime(Date.now());
    setCurrentTime(0);
    setAnswerTime(0);
  };

  // Play/pause loop
  const playLoop = () => {
    if (!currentLoop || !audioRef.current) return;

    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Ensure volume is set correctly (preview mode may have muted it before data attribute was set)
      audio.volume = 1;
      audio.muted = false;
      audio.currentTime = 0;
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Audio play failed:', err.message);
          setIsPlaying(false);
        });
    }
  };

  // Handle audio end - loop it
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play();
    };
    
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentLoop]);

  // Track if we've auto-played for this round
  const hasAutoPlayedRef = useRef(false);

  // Reset auto-play flag when new round starts
  useEffect(() => {
    hasAutoPlayedRef.current = false;
  }, [currentRound]);

  // Auto-play loop when audio is ready (wait for canplaythrough event)
  // Skip auto-play in iframe (teacher preview) - user must click Play button
  useEffect(() => {
    if (!currentLoop || !audioRef.current || guessResult) return;
    if (hasAutoPlayedRef.current) return;

    // Skip auto-play in iframe - browsers block it without user gesture inside iframe
    if (isInIframe) {
      return;
    }

    const audio = audioRef.current;

    const handleCanPlay = () => {
      if (hasAutoPlayedRef.current) return;
      hasAutoPlayedRef.current = true;
      audio.currentTime = 0;
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Failed to auto-play:', err);
        });
    };

    // If audio is already ready, play immediately
    if (audio.readyState >= 3) {
      handleCanPlay();
    } else {
      // Wait for audio to be ready
      audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
    }

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
    };
  }, [currentLoop, guessResult, isInIframe]);

  // Handle guess
  const handleGuess = (guessedName) => {
    if (guessResult) return;
    
    const isCorrect = guessedName === currentLoop.name;
    const timeElapsed = Date.now() - startTime;
    setAnswerTime(timeElapsed);
    
    let points = 0;
    let speedBonus = 0;
    
    if (isCorrect) {
      const basePoints = hintUsed ? 5 : 10;
      if (!hintUsed) {
        speedBonus = calculateSpeedBonus(timeElapsed);
      }
      points = basePoints + speedBonus;
    }
    
    setScores(prev => ({
      ...prev,
      [`player${currentPlayer}`]: prev[`player${currentPlayer}`] + points
    }));
    
    setGuessResult({ 
      isCorrect, 
      correctAnswer: currentLoop.name, 
      points,
      basePoints: isCorrect ? (hintUsed ? 5 : 10) : 0,
      speedBonus,
      timeElapsed 
    });
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Next round
  const handleNextRound = () => {
    if (currentRound >= roundsToPlay) {
      setGameComplete(true);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
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
    const filteredLoops = getFilteredLoops();
    if (!filteredLoops || filteredLoops.length === 0) {
      alert('No loops available for the selected category.');
      return;
    }
    
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
    setCurrentLoop(null);
    setGuessResult(null);
    setStartTime(null);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Show hint
  const handleShowHint = () => {
    setShowHint(true);
    setHintUsed(true);
  };

  // Format time display
  const formatTime = (ms) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  // Voice Toggle Button Component
  const VoiceToggleButton = () => (
    <button
      onClick={toggleVoice}
      className={`absolute top-3 right-3 p-2 rounded-lg transition-all ${
        voiceEnabled 
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
      }`}
      title={voiceEnabled ? 'Turn off voice' : 'Turn on voice'}
    >
      {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );

  // PLAYER SELECTION SCREEN - Compact for Chromebook
  if (!numberOfPlayers) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xl w-full text-center relative">
          <VoiceToggleButton />
          
          {/* Warning */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-blue-600 leading-tight">
              ONE DEVICE FOR THIS GAME
            </h1>
          </div>

          {/* Player Selection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How many players?
            </h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setNumberOfPlayers(2);
                  speakText("Two players. Sit together, listen to loops, pick from four options, answer fast for more points!");
                }}
                className="bg-gradient-to-br from-blue-500 to-blue-700 text-white py-8 px-12 rounded-2xl font-black text-5xl hover:from-blue-600 hover:to-blue-800 transition-all shadow-xl hover:scale-105"
              >
                2
              </button>
              <button
                onClick={() => {
                  setNumberOfPlayers(3);
                  speakText("Three players. Sit together, listen to loops, pick from four options, answer fast for more points!");
                }}
                className="bg-gradient-to-br from-purple-500 to-purple-700 text-white py-8 px-12 rounded-2xl font-black text-5xl hover:from-purple-600 hover:to-purple-800 transition-all shadow-xl hover:scale-105"
              >
                3
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // HOW TO PLAY SCREEN - Compact for Chromebook
  if (numberOfPlayers && !showHowToPlay) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-5 max-w-2xl w-full relative">
          <VoiceToggleButton />
          
          {/* Title */}
          <div className="text-center mb-3">
            <h1 className="text-2xl font-bold text-gray-900">
              🎵 How to Play
            </h1>
            <p className="text-base text-gray-600">
              {numberOfPlayers} Player Game
            </p>
          </div>

          {/* Instructions - Compact Grid */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Sit together at one computer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Listen to the loop carefully</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Pick from 4 options (A, B, C, D)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <span>Answer fast for bonus points!</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-center gap-2 text-sm text-gray-600">
              <Lightbulb size={16} className="text-yellow-600" />
              <span>Using a hint removes speed bonus</span>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => {
              setShowHowToPlay(true);
              speakText("Select the number of rounds");
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // GAME SETUP SCREEN - Compact for Chromebook
  if (!gameStarted) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-5 max-w-md w-full relative">
          <VoiceToggleButton />
          
          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <span>🎵</span> Name That Loop!
            </h1>
            <p className="text-base text-gray-600">{numberOfPlayers} Players</p>
          </div>

          {/* Number of Rounds */}
          <div className="mb-4">
            <label className="block text-base font-semibold text-gray-700 mb-2 text-center">
              Number of Rounds
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map(num => (
                <button
                  key={num}
                  onClick={() => setRoundsToPlay(num)}
                  className={`py-3 rounded-lg font-bold text-xl transition-colors ${
                    roundsToPlay === num
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Play size={24} />
            <span>Start Game!</span>
          </button>
        </div>
      </div>
    );
  }

  // GAME COMPLETE SCREEN - Compact for Chromebook
  if (gameComplete) {
    let highScore = Math.max(scores.player1, scores.player2, numberOfPlayers === 3 ? scores.player3 : 0);
    let winners = [];
    
    if (scores.player1 === highScore) winners.push(1);
    if (scores.player2 === highScore) winners.push(2);
    if (numberOfPlayers === 3 && scores.player3 === highScore) winners.push(3);
    
    const winner = winners.length === 1 ? winners[0] : null;
    
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-5 max-w-lg w-full">
          <div className="text-center mb-4">
            <Trophy className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
            <h1 className="text-2xl font-bold text-gray-900">Game Over!</h1>
            {winner ? (
              <p className="text-lg text-gray-600">Player {winner} Wins! 🎉</p>
            ) : (
              <p className="text-lg text-gray-600">It's a Tie! 🤝</p>
            )}
          </div>

          <div className={`grid ${numberOfPlayers === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-4`}>
            <div className={`rounded-lg p-3 text-center ${
              winner === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : 'bg-blue-50'
            }`}>
              <div className="text-xs font-semibold mb-1 opacity-80">Player 1</div>
              <div className="text-3xl font-bold">{scores.player1}</div>
              {winner === 1 && <Star className="w-5 h-5 mx-auto mt-1" fill="currentColor" />}
            </div>
            
            <div className={`rounded-lg p-3 text-center ${
              winner === 2 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : 'bg-purple-50'
            }`}>
              <div className="text-xs font-semibold mb-1 opacity-80">Player 2</div>
              <div className="text-3xl font-bold">{scores.player2}</div>
              {winner === 2 && <Star className="w-5 h-5 mx-auto mt-1" fill="currentColor" />}
            </div>

            {numberOfPlayers === 3 && (
              <div className={`rounded-lg p-3 text-center ${
                winner === 3 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : 'bg-green-50'
              }`}>
                <div className="text-xs font-semibold mb-1 opacity-80">Player 3</div>
                <div className="text-3xl font-bold">{scores.player3}</div>
                {winner === 3 && <Star className="w-5 h-5 mx-auto mt-1" fill="currentColor" />}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleRestartGame}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-bold text-base hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              <span>Play Again</span>
            </button>
            
            {onComplete && (
              <button
                onClick={onComplete}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
              >
                Return to Lesson
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // GAME PLAYING SCREEN - Compact for Chromebook
  return (
    <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-3">
      <audio ref={audioRef} src={currentLoop?.src} data-game-audio="true" />
      
      <div className="bg-white rounded-xl shadow-2xl p-4 max-w-2xl w-full relative">
        <VoiceToggleButton />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            Round <span className="font-bold text-lg text-gray-900">{currentRound}</span>/{roundsToPlay}
          </div>
          
          <div className={`px-3 py-1 rounded-full font-bold text-sm ${
            currentPlayer === 1 
              ? 'bg-blue-100 text-blue-800' 
              : currentPlayer === 2
              ? 'bg-purple-100 text-purple-800'
              : 'bg-green-100 text-green-800'
          }`}>
            Player {currentPlayer}'s Turn
          </div>
          
          <button
            onClick={handleRestartGame}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Score Display */}
        <div className={`grid ${numberOfPlayers === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mb-3`}>
          <div className={`rounded-lg p-2 text-center transition-all ${
            currentPlayer === 1 ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
          }`}>
            <div className="text-xs font-semibold text-gray-600">P1</div>
            <div className="text-xl font-bold text-gray-900">{scores.player1}</div>
          </div>
          
          <div className={`rounded-lg p-2 text-center transition-all ${
            currentPlayer === 2 ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-100'
          }`}>
            <div className="text-xs font-semibold text-gray-600">P2</div>
            <div className="text-xl font-bold text-gray-900">{scores.player2}</div>
          </div>

          {numberOfPlayers === 3 && (
            <div className={`rounded-lg p-2 text-center transition-all ${
              currentPlayer === 3 ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'
            }`}>
              <div className="text-xs font-semibold text-gray-600">P3</div>
              <div className="text-xl font-bold text-gray-900">{scores.player3}</div>
            </div>
          )}
        </div>

        {!guessResult ? (
          <>
            {/* Timer & Play */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                <Clock size={16} className="text-gray-600" />
                <span className="font-mono text-base font-bold text-gray-900">
                  {formatTime(currentTime)}
                </span>
              </div>
              
              <button
                onClick={playLoop}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            </div>

            {/* Hint */}
            {!showHint ? (
              <div className="text-center mb-2">
                <button
                  onClick={handleShowHint}
                  className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center justify-center mx-auto gap-1"
                >
                  <Lightbulb size={14} />
                  <span>Need a hint?</span>
                </button>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-2 mb-2 text-center">
                <span className="text-sm text-gray-700">
                  Category: <span className="font-bold">{currentLoop.category}</span>
                </span>
              </div>
            )}

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-2">
              {guessOptions.slice(0, 4).map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleGuess(option)}
                  className="bg-gray-100 hover:bg-gray-200 text-left px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors border-2 border-transparent hover:border-gray-300"
                >
                  <span className="text-gray-500 mr-1.5 font-bold">{String.fromCharCode(65 + index)})</span>
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Result Screen */
          <div className="text-center py-2">
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
                <div className="text-lg font-bold text-gray-900 mb-1">
                  +{guessResult.points} points! 🎉
                </div>
                <div className="text-xs text-gray-600">
                  Base: +{guessResult.basePoints} | Speed: +{guessResult.speedBonus} | Time: {formatTime(guessResult.timeElapsed)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 mb-3">
                Answer: <span className="font-bold">{guessResult.correctAnswer}</span>
              </div>
            )}
            
            <button
              onClick={handleNextRound}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-lg font-bold text-base hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              {currentRound >= roundsToPlay ? 'See Results' : 'Next Round →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameThatLoopActivity;