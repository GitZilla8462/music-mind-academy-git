// File: /lessons/shared/activities/string-detective/StringDetectiveActivity.jsx
// String Detective game - Students identify string instruments and dynamics
// Adapted from Layer Detective game mechanics
// Lesson 1: Strings & Dynamics (The Listening Lab)

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, Trophy, Clock, RefreshCw, Check, X } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, push, get, onValue } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';
import {
  STRING_INSTRUMENTS,
  DYNAMIC_LEVELS,
  generateQuestions,
  calculateSpeedBonus,
  getInstrumentById,
  getDynamicById,
  GAME_CONFIG,
  SCORING
} from './stringDetectiveConfig';

const StringDetectiveActivity = ({ onComplete, viewMode = false }) => {
  const { sessionCode, userId: contextUserId, userRole, currentStage } = useSession();

  // Fallback for userId
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [totalRounds] = useState(GAME_CONFIG.totalQuestions);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);

  // Two-part answer tracking
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedDynamic, setSelectedDynamic] = useState(null);
  const [guessResult, setGuessResult] = useState(null);

  // Teacher's class game state
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

  // Component mount/unmount with audio cleanup
  useEffect(() => {
    console.log('🎻 StringDetective mounted for student:', userId);

    return () => {
      console.log('🎻 StringDetective unmounting - stopping audio');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      }
    };
  }, []);

  // Error handler
  useEffect(() => {
    const errorHandler = (event) => {
      console.error('StringDetective error:', event.error);

      if (sessionCode && userId) {
        try {
          const db = getDatabase();
          push(ref(db, 'all-problems'), {
            data: {
              sessionCode,
              studentId: userId,
              studentName: playerName || 'Student',
              lessonId: 'listening-lab-lesson1',
              message: `String Detective error: ${event.error?.message || 'Unknown'}`,
              component: 'StringDetectiveActivity',
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
            },
            timestamp: Date.now(),
            type: 'error'
          });
        } catch (err) {
          console.error('Failed to log error:', err);
        }
      }
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, [sessionCode, userId, playerName]);

  // Heartbeat system
  useEffect(() => {
    if (!sessionCode || !userId || !gameStarted) return;

    const heartbeat = setInterval(() => {
      try {
        const db = getDatabase();
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
          lastActivity: Date.now(),
          lastUpdated: Date.now()
        }).catch(err => console.error('Heartbeat failed:', err));
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    }, 5000);

    return () => clearInterval(heartbeat);
  }, [sessionCode, userId, gameStarted]);

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
          } catch (err) {
            console.error('Error fetching existing names:', err);
            name = generateUniquePlayerName(userId, []);
          }
        } else {
          name = generateUniquePlayerName(userId, []);
        }

        setPlayerName(name);
        setPlayerColor(color);
        setPlayerEmoji(emoji);
      } catch (err) {
        console.error('Error generating player name:', err);
        setPlayerName('Student');
        setPlayerColor('#3B82F6');
        setPlayerEmoji('🎻');
      }
    };

    assignPlayerName();
  }, [userId, sessionCode]);

  // Listen for teacher's game state
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();

    const gameRef = ref(db, `sessions/${sessionCode}/stringDetective`);
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
        score: s.stringDetectiveScore || 0,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '🎻'
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

  // Shuffle questions on mount
  useEffect(() => {
    const shuffled = [...generateQuestions()].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, []);

  // Timer update
  useEffect(() => {
    if (!startTime || showAnswer) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, showAnswer]);

  const formatTime = (ms) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  // Play audio
  const playAudio = async () => {
    if (!currentQuestion) return;

    try {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      const now = Date.now();
      setStartTime(now);
      setIsPlaying(true);
      setHasPlayedAudio(true);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(currentQuestion.audioFile);
      audioRef.current = audio;

      audio.onerror = (e) => {
        console.error('Audio load failed:', currentQuestion.audioFile, e);
        setIsPlaying(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  // Submit answer
  const handleSubmit = () => {
    if (!selectedInstrument || !selectedDynamic) return;

    const timeElapsed = Date.now() - startTime;
    setAnswerTime(timeElapsed);

    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);

    const correctInstrument = selectedInstrument === currentQuestion.instrumentId;
    const correctDynamic = selectedDynamic === currentQuestion.dynamicId;

    let points = 0;
    let instrumentPoints = 0;
    let dynamicPoints = 0;
    let speedBonus = 0;

    if (correctInstrument) {
      instrumentPoints = SCORING.instrumentCorrect;
    }
    if (correctDynamic) {
      dynamicPoints = SCORING.dynamicCorrect;
    }

    // Bonus for getting both correct
    if (correctInstrument && correctDynamic) {
      points = SCORING.bothCorrect;
      speedBonus = calculateSpeedBonus(timeElapsed);
    } else {
      points = instrumentPoints + dynamicPoints;
    }

    points += speedBonus;
    setScore(prevScore => prevScore + points);

    setGuessResult({
      correctInstrument,
      correctDynamic,
      points,
      instrumentPoints,
      dynamicPoints,
      speedBonus,
      timeElapsed,
      actualInstrument: currentQuestion.instrumentId,
      actualDynamic: currentQuestion.dynamicId
    });

    setShowAnswer(true);
  };

  // Next round
  const handleNextRound = () => {
    if (currentRound >= totalRounds - 1) {
      setGameComplete(true);

      // Save score to Firebase
      if (sessionCode && userId && !viewMode && !isPracticeMode) {
        try {
          const db = getDatabase();
          update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
            stringDetectiveScore: score,
            lastUpdated: Date.now()
          });
          update(ref(db, `sessions/${sessionCode}/studentProgress/${userId}`), {
            'string-detective': 'completed'
          });
        } catch (err) {
          console.error('Failed to save score:', err);
        }
      }
    } else {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      setCurrentQuestion(shuffledQuestions[nextRound]);
      setShowAnswer(false);
      setGuessResult(null);
      setSelectedInstrument(null);
      setSelectedDynamic(null);
      setStartTime(null);
      setAnswerTime(0);
      setCurrentTime(0);
      setHasPlayedAudio(false);
    }
  };

  // Start game
  const startGame = () => {
    if (shuffledQuestions.length === 0) {
      alert('Error: Questions not loaded. Please refresh.');
      return;
    }

    setGameStarted(true);
    setCurrentQuestion(shuffledQuestions[0]);

    // Save player info to Firebase
    if (sessionCode && userId && playerName) {
      try {
        const db = getDatabase();
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
          playerName,
          playerColor,
          playerEmoji,
          activityStarted: 'string-detective',
          lastUpdated: Date.now()
        });
      } catch (err) {
        console.error('Failed to save player info:', err);
      }
    }
  };

  // Practice more
  const practiceMore = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const shuffled = [...generateQuestions()].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);

    setScore(0);
    setIsPracticeMode(true);
    setGameComplete(false);
    setCurrentRound(0);
    setCurrentQuestion(shuffled[0]);
    setShowAnswer(false);
    setGuessResult(null);
    setSelectedInstrument(null);
    setSelectedDynamic(null);
    setIsPlaying(false);
    setStartTime(null);
    setAnswerTime(0);
    setCurrentTime(0);
    setHasPlayedAudio(false);
    setGameStarted(true);
  };

  // Get rank emoji
  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Teacher results screen
  if (teacherGamePhase === 'finished' || currentStage === 'string-detective-results') {
    const myData = classLeaderboard.find(s => s.id === userId);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
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

            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 mb-4">
              <div className="text-4xl font-bold text-gray-900 mb-1">{myData?.score || score}</div>
              <div className="text-lg text-gray-700">Your Score</div>
            </div>

            {/* Mini Leaderboard */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Class Leaderboard</h3>
              <div className="space-y-1">
                {classLeaderboard.slice(0, 5).map((student, idx) => (
                  <div
                    key={student.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded ${
                      student.id === userId ? 'bg-blue-100 ring-2 ring-blue-400' : ''
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎻</div>

            <div
              className="inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-6 shadow-lg"
              style={{ backgroundColor: playerColor }}
            >
              <span className="text-3xl">{playerEmoji}</span>
              <span className="text-2xl font-bold text-white">{playerName}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Great Job!</h1>
            <p className="text-gray-600 mb-6">You completed {totalRounds} questions!</p>

            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6 mb-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">{score}</div>
              <div className="text-lg text-gray-700">Total Points</div>
            </div>

            <button
              onClick={practiceMore}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center space-x-2"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full">
          <div className="text-center">
            <div className="text-5xl mb-3">🎻</div>

            {playerName && (
              <div
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4 shadow-lg"
                style={{ backgroundColor: playerColor }}
              >
                <span className="text-2xl">{playerEmoji}</span>
                <span className="text-lg font-bold text-white">{playerName}</span>
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">String Detective</h1>
            <p className="text-lg text-gray-700 mb-4">
              Identify the instrument and dynamic!
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left">
              <h2 className="font-bold text-base text-gray-900 mb-2">How to Play:</h2>
              <ol className="space-y-1 text-sm text-gray-700">
                <li><strong>1.</strong> Press Play to hear a string instrument</li>
                <li><strong>2.</strong> Pick which instrument you hear</li>
                <li><strong>3.</strong> Pick the dynamic level (soft, medium, loud)</li>
                <li><strong>4.</strong> Submit your answer - speed matters!</li>
              </ol>
            </div>

            {/* Instrument preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h3 className="font-bold text-sm text-gray-700 mb-2">The String Family:</h3>
              <div className="grid grid-cols-4 gap-2">
                {STRING_INSTRUMENTS.map(inst => (
                  <div key={inst.id} className="text-center">
                    <div
                      className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white text-lg mb-1"
                      style={{ backgroundColor: inst.color }}
                    >
                      {inst.icon}
                    </div>
                    <div className="text-xs text-gray-600">{inst.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center space-x-2 text-purple-800">
                <Trophy size={20} />
                <span className="font-bold">{totalRounds} Questions</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  const currentInstrument = currentQuestion ? getInstrumentById(currentQuestion.instrumentId) : null;
  const currentDynamic = currentQuestion ? getDynamicById(currentQuestion.dynamicId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-4 max-w-md w-full">
        {/* Player Badge */}
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
            Question {currentRound + 1} of {totalRounds}
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentRound + 1) / totalRounds) * 100}%` }}
            />
          </div>
        </div>

        {!showAnswer ? (
          <>
            {/* Play Button */}
            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                What do you hear?
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
                onClick={playAudio}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-base hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center space-x-2 mx-auto"
              >
                {isPlaying ? (
                  <>
                    <Pause size={20} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    <span>Play Sound</span>
                  </>
                )}
              </button>
            </div>

            {/* Instrument Selection */}
            <div className="mb-3">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Which instrument?</h3>
              <div className="grid grid-cols-2 gap-2">
                {STRING_INSTRUMENTS.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => hasPlayedAudio && setSelectedInstrument(inst.id)}
                    disabled={!hasPlayedAudio}
                    className={`p-2 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                      !hasPlayedAudio
                        ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                        : selectedInstrument === inst.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: inst.color }}
                    >
                      {inst.icon}
                    </div>
                    <span className={`font-medium text-sm ${hasPlayedAudio ? 'text-gray-800' : 'text-gray-400'}`}>
                      {inst.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Selection */}
            <div className="mb-3">
              <h3 className="text-sm font-bold text-gray-700 mb-2">How loud?</h3>
              <div className="grid grid-cols-3 gap-2">
                {DYNAMIC_LEVELS.map(dyn => (
                  <button
                    key={dyn.id}
                    onClick={() => hasPlayedAudio && setSelectedDynamic(dyn.id)}
                    disabled={!hasPlayedAudio}
                    className={`p-2 rounded-lg border-2 transition-all text-center ${
                      !hasPlayedAudio
                        ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                        : selectedDynamic === dyn.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div
                      className="text-lg font-bold mb-1"
                      style={{ color: hasPlayedAudio ? dyn.color : '#9CA3AF' }}
                    >
                      {dyn.symbols.join('/')}
                    </div>
                    <div className={`text-xs ${hasPlayedAudio ? 'text-gray-600' : 'text-gray-400'}`}>
                      {dyn.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {!hasPlayedAudio && (
              <p className="text-center text-gray-500 text-xs mb-2">Press Play to hear the sound first!</p>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedInstrument || !selectedDynamic}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all shadow-lg ${
                selectedInstrument && selectedDynamic
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          </>
        ) : (
          /* Answer Revealed */
          <>
            <div className="text-center mb-3">
              <div className={`text-4xl mb-2 ${guessResult.correctInstrument && guessResult.correctDynamic ? 'animate-bounce' : ''}`}>
                {guessResult.correctInstrument && guessResult.correctDynamic ? '🎉' :
                 guessResult.correctInstrument || guessResult.correctDynamic ? '👍' : '😅'}
              </div>
              <div className={`text-xl font-bold mb-2 ${
                guessResult.correctInstrument && guessResult.correctDynamic ? 'text-green-600' :
                guessResult.correctInstrument || guessResult.correctDynamic ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {guessResult.correctInstrument && guessResult.correctDynamic ? 'Perfect!' :
                 guessResult.correctInstrument || guessResult.correctDynamic ? 'Partially Correct!' : 'Not Quite!'}
              </div>

              {guessResult.points > 0 && (
                <div className="text-lg font-bold text-gray-900 mb-2">
                  +{guessResult.points} points!
                </div>
              )}
            </div>

            {/* Results breakdown */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
              {/* Instrument result */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Instrument:</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold text-sm ${guessResult.correctInstrument ? 'text-green-600' : 'text-red-600'}`}>
                    {guessResult.correctInstrument ? <Check size={16} className="inline" /> : <X size={16} className="inline" />}
                  </span>
                  <span className="text-sm">
                    {currentInstrument?.name}
                    {!guessResult.correctInstrument && (
                      <span className="text-gray-400"> (you said {getInstrumentById(selectedInstrument)?.name})</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Dynamic result */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dynamic:</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold text-sm ${guessResult.correctDynamic ? 'text-green-600' : 'text-red-600'}`}>
                    {guessResult.correctDynamic ? <Check size={16} className="inline" /> : <X size={16} className="inline" />}
                  </span>
                  <span className="text-sm">
                    {currentDynamic?.name} ({currentDynamic?.symbols.join('/')})
                    {!guessResult.correctDynamic && (
                      <span className="text-gray-400"> (you said {getDynamicById(selectedDynamic)?.name})</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Time:</span>
                <span>{formatTime(guessResult.timeElapsed)}</span>
              </div>

              {guessResult.speedBonus > 0 && (
                <div className="flex items-center justify-between text-xs text-green-600">
                  <span>Speed Bonus:</span>
                  <span>+{guessResult.speedBonus}</span>
                </div>
              )}
            </div>

            {/* Instrument info */}
            {currentInstrument && (
              <div
                className="rounded-lg p-3 mb-3"
                style={{ backgroundColor: `${currentInstrument.color}15` }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: currentInstrument.color }}
                  >
                    {currentInstrument.icon}
                  </div>
                  <span className="font-bold text-gray-800">{currentInstrument.name}</span>
                </div>
                <p className="text-xs text-gray-600">{currentInstrument.description}</p>
              </div>
            )}

            <button
              onClick={handleNextRound}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-bold text-base hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              {currentRound >= totalRounds - 1 ? 'See Results' : 'Next Question'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StringDetectiveActivity;
