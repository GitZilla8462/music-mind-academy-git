import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw, Trophy, Users, Lightbulb, CheckCircle, Star, Clock, AlertCircle } from 'lucide-react';
import { loopsData } from './loopData';

const NameThatLoopActivity = ({ onComplete, viewMode = false }) => {
  // Log loops data on component load
  useEffect(() => {
    console.log('✅ Loop data loaded:', loopsData?.length || 0, 'loops');
  }, []);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentLoop, setCurrentLoop] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [guessResult, setGuessResult] = useState(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [roundsToPlay, setRoundsToPlay] = useState(10);
  const [guessOptions, setGuessOptions] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [answerTime, setAnswerTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef(null);

  // Validate that we have loop data
  if (!loopsData || loopsData.length === 0) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Missing Loop Data</h1>
          <p className="text-gray-600 mb-4">
            The game requires loop data to function. Please ensure loopData.js exists and contains loop definitions.
          </p>
          {onComplete && (
            <button
              onClick={onComplete}
              className="bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
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

  // Timer effect - updates current time every 100ms
  useEffect(() => {
    if (startTime && !guessResult) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, guessResult]);

  // Calculate speed bonus (max 10 points for <2 seconds, decreasing to 0 at 10+ seconds)
  const calculateSpeedBonus = (timeInMs) => {
    const seconds = timeInMs / 1000;
    if (seconds < 2) return 10;
    if (seconds < 4) return 8;
    if (seconds < 6) return 6;
    if (seconds < 8) return 4;
    if (seconds < 10) return 2;
    return 0;
  };

  // Get base name without trailing numbers (e.g., "Scary Synth 1" -> "Scary Synth")
  const getBaseName = (name) => {
    return name.replace(/\s+\d+$/, '').trim();
  };

  // Check if two loop names are too similar (same base name)
  const areSimilarNames = (name1, name2) => {
    return getBaseName(name1) === getBaseName(name2);
  };

  // Start a new round
  const startNewRound = () => {
    console.log('🎮 Starting new round...');
    const filteredLoops = getFilteredLoops();
    console.log('📊 Filtered loops:', filteredLoops?.length || 0);
    
    // Safety check
    if (!filteredLoops || filteredLoops.length === 0) {
      console.error('❌ No loops available for selected category');
      return;
    }
    
    const randomLoop = filteredLoops[Math.floor(Math.random() * filteredLoops.length)];
    console.log('🎵 Selected loop:', randomLoop?.name);
    
    // Generate answer options
    let options = [];
    
    if (filteredLoops.length >= 4) {
      // We have enough loops to generate 3 unique wrong answers
      // Filter out loops with the same exact name OR similar names (e.g., "Scary Synth 1" vs "Scary Synth 2")
      const wrongAnswers = filteredLoops
        .filter(loop => loop.name !== randomLoop.name && !areSimilarNames(loop.name, randomLoop.name))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // If we don't have enough distinctly different loops, relax the similarity filter
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
      // Not enough unique loops - use what we have and add variations
      options = filteredLoops.map(loop => loop.name);
      
      // Ensure we have exactly 4 options by padding if needed
      while (options.length < 4) {
        options.push(`${options[options.length % filteredLoops.length]} (variation)`);
      }
      options = options.slice(0, 4);
      options.sort(() => Math.random() - 0.5);
    }
    
    console.log('📝 Generated options:', options);
    
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
    
    console.log('✅ Round setup complete');
    
    // Auto-play the loop after a brief delay
    setTimeout(() => {
      playLoop();
    }, 500);
  };

  // Play/pause loop
  const playLoop = () => {
    if (!currentLoop || !audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
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

  // Handle guess
  const handleGuess = (guessedName) => {
    if (guessResult) return; // Already guessed this round
    
    const isCorrect = guessedName === currentLoop.name;
    const timeElapsed = Date.now() - startTime;
    setAnswerTime(timeElapsed);
    
    // Calculate points
    let points = 0;
    let speedBonus = 0;
    
    if (isCorrect) {
      // Base points (reduced if hint was used)
      const basePoints = hintUsed ? 5 : 10;
      
      // Speed bonus (only if no hint was used)
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
      correctAnswer: currentLoop.name, 
      points,
      basePoints: isCorrect ? (hintUsed ? 5 : 10) : 0,
      speedBonus,
      timeElapsed 
    });
    
    // Stop playing
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Next round
  const handleNextRound = () => {
    if (currentRound >= roundsToPlay) {
      // Game over
      setGameComplete(true);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      // Switch players and start new round
      setCurrentPlayer(prev => prev === 1 ? 2 : 1);
      startNewRound();
    }
  };

  // Start game
  const handleStartGame = () => {
    const filteredLoops = getFilteredLoops();
    if (!filteredLoops || filteredLoops.length === 0) {
      alert('No loops available for the selected category. Please choose a different category.');
      return;
    }
    
    setGameStarted(true);
    setCurrentRound(0);
    setScores({ player1: 0, player2: 0 });
    setCurrentPlayer(1);
    setGameComplete(false);
    startNewRound();
  };

  // Restart game
  const handleRestartGame = () => {
    setGameStarted(false);
    setCurrentRound(0);
    setScores({ player1: 0, player2: 0 });
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

  // Game Setup Screen
  if (!gameStarted) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎵</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Name That Loop!</h1>
            <p className="text-lg text-gray-600">Partner Listening Game</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <Users className="mr-2 text-blue-600" />
              How to Play
            </h2>
            <ol className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">1</span>
                <span>Sit together with your partner at one computer</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">2</span>
                <span>A loop will play - listen carefully!</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">3</span>
                <span>The current player picks from 4 options (A, B, C, D)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">4</span>
                <span>Answer faster for bonus points! (Up to +10 for speed)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">5</span>
                <span>Using a hint reduces your score and removes speed bonus</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">6</span>
                <span>Take turns and see who gets the highest score!</span>
              </li>
            </ol>
          </div>

          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center">
              <Clock className="mr-2 text-green-600" size={20} />
              Speed Bonus Points
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div>&lt;2s: <span className="font-bold text-green-600">+10 points</span></div>
              <div>2-4s: <span className="font-bold text-green-600">+8 points</span></div>
              <div>4-6s: <span className="font-bold text-blue-600">+6 points</span></div>
              <div>6-8s: <span className="font-bold text-blue-600">+4 points</span></div>
              <div>8-10s: <span className="font-bold text-yellow-600">+2 points</span></div>
              <div>&gt;10s: <span className="font-bold text-gray-600">+0 points</span></div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Rounds
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map(num => (
                <button
                  key={num}
                  onClick={() => setRoundsToPlay(num)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    roundsToPlay === num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Loop Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <Play size={24} />
            <span>Start Game!</span>
          </button>
        </div>
      </div>
    );
  }

  // Game Complete Screen
  if (gameComplete) {
    const winner = scores.player1 > scores.player2 ? 1 : scores.player2 > scores.player1 ? 2 : null;
    
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <Trophy className="w-24 h-24 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Game Over!</h1>
            {winner ? (
              <p className="text-2xl text-gray-600">Player {winner} Wins! 🎉</p>
            ) : (
              <p className="text-2xl text-gray-600">It's a Tie! 🤝</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={`rounded-xl p-6 text-center ${
              winner === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : 'bg-blue-50'
            }`}>
              <div className="text-sm font-semibold mb-2 opacity-80">Player 1</div>
              <div className="text-5xl font-bold mb-1">{scores.player1}</div>
              <div className="text-sm opacity-80">points</div>
              {winner === 1 && <Star className="w-8 h-8 mx-auto mt-2" fill="currentColor" />}
            </div>
            
            <div className={`rounded-xl p-6 text-center ${
              winner === 2 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : 'bg-purple-50'
            }`}>
              <div className="text-sm font-semibold mb-2 opacity-80">Player 2</div>
              <div className="text-5xl font-bold mb-1">{scores.player2}</div>
              <div className="text-sm opacity-80">points</div>
              {winner === 2 && <Star className="w-8 h-8 mx-auto mt-2" fill="currentColor" />}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRestartGame}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <RotateCcw size={24} />
              <span>Play Again</span>
            </button>
            
            {onComplete && (
              <button
                onClick={onComplete}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Return to Lesson
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game Playing Screen
  return (
    <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
      <audio ref={audioRef} src={currentLoop?.src} />
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
          <div className="text-sm text-gray-600">
            Round <span className="font-bold text-2xl text-gray-900">{currentRound}</span> / {roundsToPlay}
          </div>
          
          <div className={`px-6 py-2 rounded-full font-bold text-lg ${
            currentPlayer === 1 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            Player {currentPlayer}'s Turn
          </div>
          
          <button
            onClick={handleRestartGame}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`rounded-lg p-4 text-center transition-all ${
            currentPlayer === 1 
              ? 'bg-blue-100 border-2 border-blue-500' 
              : 'bg-gray-100'
          }`}>
            <div className="text-sm font-semibold text-gray-600 mb-1">Player 1</div>
            <div className="text-3xl font-bold text-gray-900">{scores.player1}</div>
          </div>
          
          <div className={`rounded-lg p-4 text-center transition-all ${
            currentPlayer === 2 
              ? 'bg-purple-100 border-2 border-purple-500' 
              : 'bg-gray-100'
          }`}>
            <div className="text-sm font-semibold text-gray-600 mb-1">Player 2</div>
            <div className="text-3xl font-bold text-gray-900">{scores.player2}</div>
          </div>
        </div>

        {!guessResult ? (
          <>
            {/* Timer Display */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                <Clock size={20} className="text-gray-600" />
                <span className="font-mono text-xl font-bold text-gray-900">
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>

            {/* Play Button */}
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-gray-900 mb-4">
                🎧 Listen carefully and guess the loop!
              </div>
              <button
                onClick={playLoop}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 mx-auto"
              >
                {isPlaying ? (
                  <>
                    <Pause size={24} />
                    <span>Pause Loop</span>
                  </>
                ) : (
                  <>
                    <Play size={24} />
                    <span>Play Loop</span>
                  </>
                )}
              </button>
            </div>

            {/* Hint Button */}
            {!showHint && (
              <div className="text-center mb-6">
                <button
                  onClick={handleShowHint}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center mx-auto space-x-2"
                >
                  <Lightbulb size={20} />
                  <span>Need a hint? (No speed bonus)</span>
                </button>
              </div>
            )}

            {/* Hint Display */}
            {showHint && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <div className="font-semibold text-gray-900">Hint:</div>
                    <div className="text-gray-700">
                      Category: <span className="font-bold">{currentLoop.category}</span>
                      <div className="text-sm text-gray-600 mt-1">
                        (Speed bonus disabled)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Answer Options - Always 4 choices (A, B, C, D) */}
            <div className="space-y-3">
              {guessOptions.slice(0, 4).map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleGuess(option)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-left px-6 py-4 rounded-xl font-semibold text-lg transition-colors border-2 border-transparent hover:border-gray-300"
                >
                  <span className="text-gray-500 mr-3 font-bold">{String.fromCharCode(65 + index)})</span>
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Result Screen */
          <div className="text-center">
            <div className={`text-6xl mb-4 ${guessResult.isCorrect ? 'animate-bounce' : ''}`}>
              {guessResult.isCorrect ? '✅' : '❌'}
            </div>
            
            <div className={`text-3xl font-bold mb-3 ${
              guessResult.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {guessResult.isCorrect ? 'Correct!' : 'Wrong!'}
            </div>
            
            {guessResult.isCorrect ? (
              <div className="mb-6">
                <div className="text-2xl font-bold text-gray-900 mb-3">
                  +{guessResult.points} points! 🎉
                </div>
                
                {/* Points Breakdown */}
                <div className="inline-block bg-gray-100 rounded-lg p-4 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between space-x-8">
                      <span className="text-gray-600">Answer time:</span>
                      <span className="font-bold text-gray-900">{formatTime(guessResult.timeElapsed)}</span>
                    </div>
                    <div className="flex items-center justify-between space-x-8">
                      <span className="text-gray-600">Base points:</span>
                      <span className="font-bold text-blue-600">+{guessResult.basePoints}</span>
                    </div>
                    {guessResult.speedBonus > 0 && (
                      <div className="flex items-center justify-between space-x-8">
                        <span className="text-gray-600">Speed bonus:</span>
                        <span className="font-bold text-green-600">+{guessResult.speedBonus}</span>
                      </div>
                    )}
                    {hintUsed && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-300">
                        Hint used - no speed bonus
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xl text-gray-700 mb-6">
                The correct answer was:<br />
                <span className="font-bold text-gray-900">{guessResult.correctAnswer}</span>
                <div className="text-sm text-gray-500 mt-2">
                  You answered in {formatTime(guessResult.timeElapsed)}
                </div>
              </div>
            )}
            
            <button
              onClick={handleNextRound}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
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