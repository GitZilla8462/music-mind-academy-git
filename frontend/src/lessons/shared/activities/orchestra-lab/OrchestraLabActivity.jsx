// File: /src/lessons/shared/activities/orchestra-lab/OrchestraLabActivity.jsx
// Orchestra Lab - Partner game for identifying orchestra instruments
// Player 1 picks an instrument, Player 2 guesses (then swap)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Play, Pause, RotateCcw, Trophy, Users, ArrowRight, Music, Eye, EyeOff } from 'lucide-react';
import {
  INSTRUMENTS,
  FAMILIES,
  LEVEL_INFO
} from '../guess-that-instrument/guessThatInstrumentConfig';

// Get all instruments as array
const ALL_INSTRUMENTS = Object.values(INSTRUMENTS);

// Group instruments by family
const INSTRUMENTS_BY_FAMILY = {
  strings: ALL_INSTRUMENTS.filter(i => i.family === 'strings'),
  woodwinds: ALL_INSTRUMENTS.filter(i => i.family === 'woodwinds'),
  brass: ALL_INSTRUMENTS.filter(i => i.family === 'brass'),
  percussion: ALL_INSTRUMENTS.filter(i => i.family === 'percussion')
};

const OrchestraLabActivity = ({ onComplete }) => {
  // Game state
  const [phase, setPhase] = useState('setup'); // setup, handoff, selector, guesser, reveal, gameover
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [currentSelector, setCurrentSelector] = useState(1); // 1 or 2
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(8);
  const [difficulty, setDifficulty] = useState(2); // 1=easy, 2=medium, 3=hard

  // Scores
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  // Round state
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [choices, setChoices] = useState([]);
  const [guess, setGuess] = useState(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Get current player names
  const selectorName = currentSelector === 1 ? player1Name : player2Name;
  const guesserName = currentSelector === 1 ? player2Name : player1Name;

  // Stop audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  // Play instrument audio
  const playAudio = useCallback(() => {
    if (!selectedInstrument) return;

    stopAudio();

    const audio = new Audio(selectedInstrument.audioFile);
    audio.volume = 0.8;
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);

    audio.play().catch(err => {
      console.error('Audio play failed:', err);
      setIsPlaying(false);
    });

    setHasPlayed(true);
  }, [selectedInstrument, stopAudio]);

  // Generate choices based on difficulty
  const generateChoices = useCallback((correctInstrument) => {
    let choicePool = [];

    if (difficulty === 1) {
      // Easy: One from each family
      Object.values(INSTRUMENTS_BY_FAMILY).forEach(familyInstruments => {
        const randomInst = familyInstruments[Math.floor(Math.random() * familyInstruments.length)];
        choicePool.push(randomInst);
      });
    } else if (difficulty === 2) {
      // Medium: Mix of instruments from different families
      const allInsts = [...ALL_INSTRUMENTS];
      while (choicePool.length < 4 && allInsts.length > 0) {
        const idx = Math.floor(Math.random() * allInsts.length);
        choicePool.push(allInsts.splice(idx, 1)[0]);
      }
    } else {
      // Hard: Instruments from the same family
      const sameFamily = INSTRUMENTS_BY_FAMILY[correctInstrument.family];
      choicePool = [...sameFamily];
    }

    // Ensure correct answer is in choices
    if (!choicePool.find(c => c.id === correctInstrument.id)) {
      choicePool[Math.floor(Math.random() * choicePool.length)] = correctInstrument;
    }

    // Shuffle
    return choicePool.sort(() => Math.random() - 0.5);
  }, [difficulty]);

  // Start game
  const startGame = () => {
    if (!player1Name.trim() || !player2Name.trim()) return;
    setPhase('handoff');
  };

  // Confirm handoff (selector is ready)
  const confirmHandoff = () => {
    setPhase('selector');
  };

  // Select an instrument
  const selectInstrument = (instrument) => {
    setSelectedInstrument(instrument);
    setChoices(generateChoices(instrument));
    setGuess(null);
    setHasPlayed(false);
    stopAudio();
    setPhase('handoff-to-guesser');
  };

  // Guesser ready
  const guesserReady = () => {
    setPhase('guesser');
  };

  // Make a guess
  const makeGuess = (instrument) => {
    if (!hasPlayed) return;
    setGuess(instrument);
    stopAudio();
    setPhase('reveal');

    // Update score
    if (instrument.id === selectedInstrument.id) {
      if (currentSelector === 1) {
        setPlayer2Score(prev => prev + 10);
      } else {
        setPlayer1Score(prev => prev + 10);
      }
    }
  };

  // Next round
  const nextRound = () => {
    if (round >= totalRounds) {
      setPhase('gameover');
      return;
    }

    setRound(prev => prev + 1);
    setCurrentSelector(prev => prev === 1 ? 2 : 1);
    setSelectedInstrument(null);
    setChoices([]);
    setGuess(null);
    setHasPlayed(false);
    setPhase('handoff');
  };

  // Play again
  const playAgain = () => {
    setPhase('setup');
    setRound(1);
    setCurrentSelector(1);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setSelectedInstrument(null);
    setChoices([]);
    setGuess(null);
    setHasPlayed(false);
  };

  // ========================================
  // SETUP SCREEN
  // ========================================
  if (phase === 'setup') {
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
        <div className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 p-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-2">Orchestra Lab</h1>
            <p className="text-xl text-purple-200">Partner Challenge</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Users size={48} className="text-purple-400" />
              <div className="text-xl text-gray-300">2 Players</div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Player 1 Name</label>
                <input
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter name..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Player 2 Name</label>
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter name..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((level) => {
                    const info = LEVEL_INFO[level];
                    return (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          difficulty === level
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-sm font-semibold">{info.difficulty}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={startGame}
                disabled={!player1Name.trim() || !player2Name.trim()}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-lg font-semibold transition-colors"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // HANDOFF SCREEN (Pass to selector)
  // ========================================
  if (phase === 'handoff') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <EyeOff size={80} className="text-purple-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Pass to {selectorName}</h1>
        <p className="text-xl text-gray-400 mb-8">
          {guesserName}, look away! {selectorName} will pick an instrument.
        </p>
        <div className="text-lg text-gray-500 mb-8">Round {round} of {totalRounds}</div>
        <button
          onClick={confirmHandoff}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold flex items-center gap-2"
        >
          I'm {selectorName} - Ready
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  // ========================================
  // SELECTOR SCREEN
  // ========================================
  if (phase === 'selector') {
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
        <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-lg font-semibold text-purple-400">{selectorName}'s Turn to Pick</div>
            <div className="text-gray-400">Round {round} of {totalRounds}</div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Pick an Instrument</h2>
            <p className="text-center text-gray-400 mb-8">
              Choose an instrument for {guesserName} to guess
            </p>

            {/* Instruments grouped by family */}
            {Object.entries(INSTRUMENTS_BY_FAMILY).map(([familyId, instruments]) => {
              const family = FAMILIES[familyId];
              return (
                <div key={familyId} className="mb-6">
                  <div
                    className="text-lg font-semibold mb-3 flex items-center gap-2"
                    style={{ color: family.color }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: family.color }} />
                    {family.name}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {instruments.map((instrument) => (
                      <button
                        key={instrument.id}
                        onClick={() => selectInstrument(instrument)}
                        className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl text-left transition-all"
                      >
                        <div className="font-semibold">{instrument.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // HANDOFF TO GUESSER
  // ========================================
  if (phase === 'handoff-to-guesser') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <Eye size={80} className="text-green-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Pass to {guesserName}</h1>
        <p className="text-xl text-gray-400 mb-2">
          {selectorName} picked an instrument!
        </p>
        <p className="text-lg text-gray-500 mb-8">
          {guesserName}, listen carefully and try to guess what it is.
        </p>
        <button
          onClick={guesserReady}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-semibold flex items-center gap-2"
        >
          I'm {guesserName} - Ready
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  // ========================================
  // GUESSER SCREEN
  // ========================================
  if (phase === 'guesser') {
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
        <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-lg font-semibold text-green-400">{guesserName}'s Turn to Guess</div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                <span className="text-purple-400">{player1Name}</span>: {player1Score} |{' '}
                <span className="text-green-400">{player2Name}</span>: {player2Score}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Play button */}
          <button
            onClick={isPlaying ? stopAudio : playAudio}
            className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 transition-all transform hover:scale-105 ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isPlaying ? (
              <Pause size={44} />
            ) : (
              <Play size={44} className="ml-2" />
            )}
          </button>

          <p className="text-gray-400 mb-8">
            {!hasPlayed ? 'Press play to hear the sound' : 'Now pick your answer!'}
          </p>

          {/* Choice buttons */}
          <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
            {choices.map((instrument) => {
              const family = FAMILIES[instrument.family];
              return (
                <button
                  key={instrument.id}
                  onClick={() => makeGuess(instrument)}
                  disabled={!hasPlayed}
                  className={`p-5 rounded-xl border-2 text-lg font-semibold transition-all ${
                    !hasPlayed
                      ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                      : 'bg-gray-800 border-gray-600 hover:border-purple-500 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: family.color }}
                    />
                    <span>{instrument.name}</span>
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
  // REVEAL SCREEN
  // ========================================
  if (phase === 'reveal') {
    const isCorrect = guess?.id === selectedInstrument?.id;

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <div className={`text-8xl mb-6 ${isCorrect ? 'animate-bounce' : ''}`}>
          {isCorrect ? '🎉' : '😅'}
        </div>
        <h1 className={`text-4xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {isCorrect ? 'Correct!' : 'Not quite!'}
        </h1>
        <p className="text-2xl text-gray-300 mb-2">
          The answer was: <span className="font-bold text-purple-400">{selectedInstrument?.name}</span>
        </p>
        {isCorrect && (
          <p className="text-xl text-green-400 mb-6">
            {guesserName} earns 10 points!
          </p>
        )}

        <div className="flex items-center gap-8 text-xl mb-8">
          <div className="text-center">
            <div className="text-purple-400 font-semibold">{player1Name}</div>
            <div className="text-3xl font-bold">{player1Score}</div>
          </div>
          <div className="text-gray-500">vs</div>
          <div className="text-center">
            <div className="text-green-400 font-semibold">{player2Name}</div>
            <div className="text-3xl font-bold">{player2Score}</div>
          </div>
        </div>

        <button
          onClick={nextRound}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold flex items-center gap-2"
        >
          {round >= totalRounds ? 'See Final Results' : 'Next Round'}
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  // ========================================
  // GAME OVER SCREEN
  // ========================================
  if (phase === 'gameover') {
    const winner = player1Score > player2Score ? player1Name :
                   player2Score > player1Score ? player2Name :
                   null;

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <Trophy size={80} className="text-yellow-400 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Game Over!</h1>

        {winner ? (
          <p className="text-2xl text-purple-400 mb-8">
            🎉 {winner} wins!
          </p>
        ) : (
          <p className="text-2xl text-purple-400 mb-8">
            It's a tie!
          </p>
        )}

        <div className="flex items-center gap-12 text-xl mb-8">
          <div className="text-center">
            <div className={`font-semibold ${player1Score >= player2Score ? 'text-yellow-400' : 'text-gray-400'}`}>
              {player1Name}
            </div>
            <div className="text-4xl font-bold">{player1Score}</div>
          </div>
          <div className="text-gray-500">vs</div>
          <div className="text-center">
            <div className={`font-semibold ${player2Score >= player1Score ? 'text-yellow-400' : 'text-gray-400'}`}>
              {player2Name}
            </div>
            <div className="text-4xl font-bold">{player2Score}</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={playAgain}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-lg font-semibold flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Play Again
          </button>
          {onComplete && (
            <button
              onClick={onComplete}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default OrchestraLabActivity;
