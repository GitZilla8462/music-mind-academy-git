// File: DynamicsDashActivity.jsx
// Dynamics identification game - 9 questions from Vivaldi's Spring
// Students identify the dynamic level (pp, p, mp, mf, f, ff)
// Pattern based on LayerDetectiveActivity

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Trophy, Clock, RefreshCw } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, push, get, onValue } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';
import { AUDIO_PATH, DYNAMICS, QUESTIONS, calculateSpeedBonus, BASE_POINTS, TOTAL_QUESTIONS, getVolumeForDynamic } from './dynamicsDashConfig';

const DynamicsDashActivity = ({ onComplete, viewMode = false }) => {
  const { sessionCode, userId: contextUserId, currentStage } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [guessResult, setGuessResult] = useState(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  // Teacher game state
  const [teacherGamePhase, setTeacherGamePhase] = useState(null);
  const [classLeaderboard, setClassLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);

  // Timer states
  const [startTime, setStartTime] = useState(null);
  const [answerTime, setAnswerTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('');
  const [playerEmoji, setPlayerEmoji] = useState('');

  const audioRef = useRef(null);
  const playbackTimer = useRef(null);

  const currentQuestion = shuffledQuestions[currentRound];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (playbackTimer.current) {
        clearTimeout(playbackTimer.current);
      }
    };
  }, []);

  // Shuffle questions on mount
  useEffect(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, []);

  // Generate player name
  useEffect(() => {
    if (!userId) return;

    const assignPlayerName = async () => {
      try {
        const db = getDatabase();
        const color = getPlayerColor(userId);
        const emoji = getPlayerEmoji(userId);
        let name;

        if (sessionCode) {
          try {
            const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);
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
      } catch {
        setPlayerName('Student');
        setPlayerColor('#3B82F6');
        setPlayerEmoji('🎵');
      }
    };

    assignPlayerName();
  }, [userId, sessionCode]);

  // Listen for teacher game phase
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();

    const gameRef = ref(db, `sessions/${sessionCode}/dynamicsDash`);
    const unsubGame = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.phase) {
        setTeacherGamePhase(data.phase);
      }
    });

    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);
    const unsubStudents = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName || 'Student',
        score: s.dynamicsDashScore || 0,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '🎵'
      }));

      const sorted = [...list].sort((a, b) => b.score - a.score);
      setClassLeaderboard(sorted);

      const myIndex = sorted.findIndex(s => s.id === userId);
      if (myIndex !== -1) {
        setMyRank(myIndex + 1);
      }
    });

    return () => {
      unsubGame();
      unsubStudents();
    };
  }, [sessionCode, userId]);

  // Timer update
  useEffect(() => {
    if (!startTime || showAnswer) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, showAnswer]);

  // Heartbeat
  useEffect(() => {
    if (!sessionCode || !userId || !gameStarted) return;

    const heartbeat = setInterval(() => {
      try {
        const db = getDatabase();
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
          lastActivity: Date.now(),
          lastUpdated: Date.now()
        }).catch(() => {});
      } catch {}
    }, 5000);

    return () => clearInterval(heartbeat);
  }, [sessionCode, userId, gameStarted]);

  const formatTime = (ms) => `${(ms / 1000).toFixed(1)}s`;

  const playExcerpt = useCallback(() => {
    if (!currentQuestion) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (playbackTimer.current) {
        clearTimeout(playbackTimer.current);
      }
      setIsPlaying(false);
      return;
    }

    // Start timer
    setStartTime(Date.now());
    setIsPlaying(true);
    setHasPlayedAudio(true);

    // Create and play audio
    const audio = new Audio(AUDIO_PATH);
    audioRef.current = audio;

    audio.currentTime = currentQuestion.startTime;
    audio.volume = getVolumeForDynamic(currentQuestion.correctAnswer);
    audio.play().catch(err => {
      console.error('Audio playback error:', err);
      setIsPlaying(false);
    });

    // Stop after 6 seconds (endTime - startTime)
    const duration = (currentQuestion.endTime - currentQuestion.startTime) * 1000;
    playbackTimer.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }, duration);
  }, [currentQuestion, isPlaying]);

  const handleGuess = (dynamicSymbol) => {
    const timeElapsed = Date.now() - startTime;
    setAnswerTime(timeElapsed);

    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (playbackTimer.current) {
      clearTimeout(playbackTimer.current);
    }
    setIsPlaying(false);

    const isCorrect = dynamicSymbol === currentQuestion.correctAnswer;

    // Check if within one dynamic level for partial credit
    const guessIndex = DYNAMICS.findIndex(d => d.symbol === dynamicSymbol);
    const correctIndex = DYNAMICS.findIndex(d => d.symbol === currentQuestion.correctAnswer);
    const difference = Math.abs(guessIndex - correctIndex);
    const isPartialCredit = !isCorrect && difference === 1;

    let points = 0;
    let basePoints = 0;
    let speedBonus = 0;

    if (isCorrect) {
      basePoints = BASE_POINTS;
      speedBonus = calculateSpeedBonus(timeElapsed);
      points = basePoints + speedBonus;
    } else if (isPartialCredit) {
      // Half points for being within one dynamic level
      basePoints = Math.floor(BASE_POINTS / 2);
      speedBonus = Math.floor(calculateSpeedBonus(timeElapsed) / 2);
      points = basePoints + speedBonus;
    }

    // Calculate new score
    const newScore = score + points;
    if (points > 0) {
      setScore(newScore);
    }

    // Save answer and score to Firebase in real-time (so teacher can track progress)
    if (sessionCode && userId && !viewMode && !isPracticeMode) {
      try {
        const db = getDatabase();
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
          dynamicsDashScore: newScore,
          dynamicsDashAnswer: dynamicSymbol,
          dynamicsDashAnswerTime: timeElapsed
        });
      } catch (err) {
        console.error('Failed to save answer:', err);
      }
    }

    setGuessResult({
      isCorrect,
      isPartialCredit,
      guessedAnswer: dynamicSymbol,
      points,
      basePoints,
      speedBonus,
      timeElapsed,
      correctAnswer: currentQuestion.correctAnswer
    });

    setShowAnswer(true);
  };

  const handleNextRound = () => {
    if (currentRound >= TOTAL_QUESTIONS - 1) {
      setGameComplete(true);

      // Save score to Firebase (not in practice mode)
      if (sessionCode && userId && !viewMode && !isPracticeMode) {
        try {
          const db = getDatabase();
          update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
            dynamicsDashScore: score
          });
          update(ref(db, `sessions/${sessionCode}/studentProgress/${userId}`), {
            'dynamics-dash': 'completed'
          });
        } catch (err) {
          console.error('Failed to save score:', err);
        }
      }
    } else {
      setCurrentRound(prev => prev + 1);
      setShowAnswer(false);
      setGuessResult(null);
      setStartTime(null);
      setAnswerTime(0);
      setCurrentTime(0);
      setHasPlayedAudio(false);
    }
  };

  const startGame = () => {
    if (shuffledQuestions.length === 0) return;

    setGameStarted(true);

    if (sessionCode && userId && playerName) {
      try {
        const db = getDatabase();
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
          playerName,
          playerColor,
          playerEmoji,
          activityStarted: 'dynamics-dash',
          lastUpdated: Date.now()
        });
      } catch {}
    }
  };

  const practiceMore = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (playbackTimer.current) {
      clearTimeout(playbackTimer.current);
    }

    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);

    setScore(0);
    setIsPracticeMode(true);
    setGameComplete(false);
    setCurrentRound(0);
    setShowAnswer(false);
    setGuessResult(null);
    setIsPlaying(false);
    setStartTime(null);
    setAnswerTime(0);
    setCurrentTime(0);
    setHasPlayedAudio(false);
    setGameStarted(true);
  };

  const getDynamicInfo = (symbol) => DYNAMICS.find(d => d.symbol === symbol);
  const correctDynamic = currentQuestion ? getDynamicInfo(currentQuestion.correctAnswer) : null;

  // Results screen (teacher broadcast or results stage)
  if (teacherGamePhase === 'finished' || currentStage === 'dynamics-dash-results') {
    const myData = classLeaderboard.find(s => s.id === userId);
    const getRankEmoji = (rank) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>

            <div
              className="inline-flex flex-col items-center px-8 py-4 rounded-2xl mb-4 shadow-lg"
              style={{ backgroundColor: myData?.playerColor || playerColor }}
            >
              <span className="text-4xl mb-1">{myData?.playerEmoji || playerEmoji}</span>
              <span className="text-2xl font-bold text-white">{myData?.name || playerName}</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-3xl">{getRankEmoji(myRank)}</span>
                {myRank && myRank <= 3 && (
                  <span className="text-xl font-bold text-white">
                    {myRank === 1 ? '1st Place!' : myRank === 2 ? '2nd Place!' : '3rd Place!'}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Complete!</h1>

            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 mb-4">
              <div className="text-4xl font-bold text-gray-900 mb-1">{myData?.score || 0}</div>
              <div className="text-lg text-gray-700">Your Score</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Class Leaderboard</h3>
              <div className="space-y-1">
                {classLeaderboard.slice(0, 5).map((student, idx) => (
                  <div
                    key={student.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded ${
                      student.id === userId ? 'bg-purple-100 ring-2 ring-purple-400' : ''
                    }`}
                  >
                    <span className="w-6 text-center font-bold text-sm">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: student.playerColor }}
                    >
                      {student.name.charAt(0)}
                    </div>
                    <span className="flex-1 truncate text-sm">{student.name}</span>
                    <span className="font-bold text-sm">{student.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-gray-500 text-sm">Look at the main screen!</p>
          </div>
        </div>
      </div>
    );
  }

  // Completion screen
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>

            <div
              className="inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-6 shadow-lg"
              style={{ backgroundColor: playerColor }}
            >
              <span className="text-3xl">{playerEmoji}</span>
              <span className="text-2xl font-bold text-white">{playerName}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Great Job!</h1>
            <p className="text-gray-600 mb-6">You completed {TOTAL_QUESTIONS} questions!</p>

            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">{score}</div>
              <div className="text-lg text-gray-700">Total Points</div>
            </div>

            <button
              onClick={practiceMore}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <RefreshCw size={20} />
              <span>Practice More</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Start screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full">
          <div className="text-center">
            <div className="text-5xl mb-3">🎼</div>

            {playerName && (
              <div
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4 shadow-lg"
                style={{ backgroundColor: playerColor }}
              >
                <span className="text-2xl">{playerEmoji}</span>
                <span className="text-lg font-bold text-white">{playerName}</span>
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dynamics Dash</h1>
            <p className="text-lg text-gray-700 mb-4">
              Identify the dynamics in Vivaldi's Spring!
            </p>

            <div className="bg-purple-50 rounded-lg p-4 mb-4 text-left">
              <h2 className="font-bold text-base text-gray-900 mb-2">How to Play:</h2>
              <ol className="space-y-1 text-sm text-gray-700">
                <li><strong>1.</strong> Press Play to hear a 6-second clip</li>
                <li><strong>2.</strong> Listen for how loud or soft it is</li>
                <li><strong>3.</strong> Choose the correct dynamic (pp to ff)</li>
                <li><strong>4.</strong> Answer fast for bonus points!</li>
              </ol>
            </div>

            {/* Dynamic levels preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h3 className="font-bold text-sm text-gray-700 mb-2">Dynamic Levels:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {DYNAMICS.map(d => (
                  <div
                    key={d.symbol}
                    className="px-3 py-1 rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: d.color }}
                  >
                    {d.symbol}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">pp = very soft → ff = very loud</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center space-x-2 text-blue-800">
                <Trophy size={20} />
                <span className="font-bold">{TOTAL_QUESTIONS} Questions</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold text-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-4 max-w-md w-full">
        {/* Player badge */}
        <div
          className="flex items-center justify-between mb-2 px-3 py-1.5 rounded-full shadow-md"
          style={{ backgroundColor: playerColor }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">{playerEmoji}</span>
            <span className="text-sm font-bold text-white">{playerName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy size={16} className="text-yellow-300" />
            <span className="text-sm font-bold text-white">{score}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="text-center mb-2">
          <div className="text-xs font-semibold text-gray-600">
            Question {currentRound + 1} of {TOTAL_QUESTIONS}
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentRound + 1) / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {!showAnswer ? (
            <>
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  What is the dynamic level?
                </h2>

                {startTime && (
                  <div className="inline-flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full mb-2">
                    <Clock size={14} className="text-gray-600" />
                    <span className="font-mono text-sm font-bold text-gray-900">
                      {formatTime(currentTime)}
                    </span>
                  </div>
                )}

                <button
                  onClick={playExcerpt}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-bold text-base hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2 mx-auto"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={20} />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      <span>Play Clip</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic buttons - symbol, term, meaning */}
              <div className="grid grid-cols-3 gap-2">
                {DYNAMICS.map(d => (
                  <button
                    key={d.symbol}
                    onClick={() => handleGuess(d.symbol)}
                    disabled={!hasPlayedAudio}
                    className={`py-3 px-2 rounded-lg font-bold transition-all border-2 ${
                      hasPlayedAudio
                        ? 'hover:scale-105 border-transparent hover:border-gray-400'
                        : 'opacity-50 cursor-not-allowed border-transparent'
                    }`}
                    style={{
                      backgroundColor: hasPlayedAudio ? d.color : '#E5E7EB',
                      color: hasPlayedAudio ? 'white' : '#9CA3AF'
                    }}
                  >
                    <div className="text-2xl font-bold">{d.symbol}</div>
                    <div className="text-sm">{d.name}</div>
                    <div className="text-xs opacity-90">({d.meaning.toLowerCase()})</div>
                  </button>
                ))}
              </div>

              {!hasPlayedAudio && (
                <p className="text-center text-gray-500 text-xs mt-1">
                  Press Play to hear the audio first!
                </p>
              )}
            </>
          ) : (
            <>
              {/* Answer revealed */}
              <div className="text-center mb-2">
                <div className={`text-3xl mb-1 ${guessResult.isCorrect ? 'animate-bounce' : guessResult.isPartialCredit ? 'animate-pulse' : ''}`}>
                  {guessResult.isCorrect ? '✅' : guessResult.isPartialCredit ? '🎯' : '❌'}
                </div>
                <div className={`text-xl font-bold mb-1 ${
                  guessResult.isCorrect ? 'text-green-600' : guessResult.isPartialCredit ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {guessResult.isCorrect ? 'Correct!' : guessResult.isPartialCredit ? 'Close!' : 'Not Quite!'}
                </div>

                {(guessResult.isCorrect || guessResult.isPartialCredit) && guessResult.points ? (
                  <div className="mb-2">
                    <div className="text-lg font-bold text-gray-900">
                      +{guessResult.points} points{guessResult.isPartialCredit ? ' (partial credit)' : ''}!
                    </div>
                    <div className="inline-block bg-gray-100 rounded-lg p-2 mt-1 text-left">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center justify-between space-x-3">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-bold text-gray-900">{formatTime(guessResult.timeElapsed)}</span>
                        </div>
                        <div className="flex items-center justify-between space-x-3">
                          <span className="text-gray-600">Base:</span>
                          <span className="font-bold text-blue-600">+{guessResult.basePoints}</span>
                        </div>
                        {guessResult.speedBonus > 0 && (
                          <div className="flex items-center justify-between space-x-3">
                            <span className="text-gray-600">Speed:</span>
                            <span className="font-bold text-green-600">+{guessResult.speedBonus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {guessResult.isPartialCredit && (
                      <div className="text-sm text-gray-700 mt-2">
                        You said{' '}
                        <span
                          className="font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: getDynamicInfo(guessResult.guessedAnswer)?.color }}
                        >
                          {guessResult.guessedAnswer}
                        </span>
                        {' '}— just one level off!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 mb-2">
                    The answer was{' '}
                    <span
                      className="font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: correctDynamic?.color }}
                    >
                      {correctDynamic?.symbol}
                    </span>{' '}
                    ({correctDynamic?.meaning})
                  </div>
                )}
              </div>

              {/* Correct answer display */}
              <div
                className="rounded-lg p-4 mb-2 text-center text-white"
                style={{ backgroundColor: correctDynamic?.color }}
              >
                <div className="text-4xl font-bold mb-1">{correctDynamic?.symbol}</div>
                <div className="text-lg font-semibold">{correctDynamic?.name}</div>
                <div className="text-sm opacity-90">{correctDynamic?.meaning}</div>
              </div>

              <button
                onClick={handleNextRound}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-bold text-base hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                {currentRound >= TOTAL_QUESTIONS - 1 ? 'See Results' : 'Next Question'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicsDashActivity;
