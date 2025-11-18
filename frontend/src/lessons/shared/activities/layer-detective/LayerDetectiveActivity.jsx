// File: /src/lessons/shared/activities/layer-detective/LayerDetectiveActivity.jsx
// Visual layer counting game - 20 RANDOMIZED questions
// ✅ COMPLETE WITH SCORING: Timer, speed bonus, Firebase score updates
// ✅ WITH NAME GENERATION: Auto-generated player names with badges
// ✅ FIXED: Added error logging, audio failure detection, heartbeat monitoring

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Trophy, Clock } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { updateStudentScore } from '../../../../firebase/config';
import { getDatabase, ref, update, push, set } from 'firebase/database'; // ✅ FIXED: Added push and set
import { generatePlayerName, getPlayerColor, getPlayerEmoji } from './nameGenerator';

const LayerDetectiveActivity = ({ onComplete, viewMode = false }) => {
  const { sessionCode, userId, userRole } = useSession();
  
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [guessResult, setGuessResult] = useState(null);
  const [score, setScore] = useState(0);
  const [totalRounds] = useState(20); // 20 questions
  const [gameComplete, setGameComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  
  // Timer states for scoring
  const [startTime, setStartTime] = useState(null);
  const [answerTime, setAnswerTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Player name states
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('');
  const [playerEmoji, setPlayerEmoji] = useState('');
  
  const audioRefs = useRef([]);

  // ✅ NEW: Component mount logging
  useEffect(() => {
    console.log('🎮 LayerDetective mounted for student:', userId);
    console.log('📍 Session code:', sessionCode);
    
    return () => {
      console.log('🎮 LayerDetective unmounting');
    };
  }, []);

  // ✅ NEW: Global error handler for this component
  useEffect(() => {
    const errorHandler = (event) => {
      console.error('❌ Unhandled error in LayerDetective:', event.error);
      
      if (sessionCode && userId) {
        try {
          const db = getDatabase();
          push(ref(db, 'all-problems'), {
            data: {
              sessionCode,
              studentId: userId,
              studentName: playerName || 'Student',
              lessonId: 'music-loops-lesson2',
              message: `Unhandled error: ${event.error?.message || 'Unknown error'}`,
              stack: event.error?.stack || 'No stack trace',
              component: 'LayerDetectiveActivity',
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              siteMode: 'edu',
            },
            timestamp: Date.now(),
            resolved: false,
            type: 'error'
          });
        } catch (err) {
          console.error('Failed to log error to Firebase:', err);
        }
      }
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, [sessionCode, userId, playerName]);

  // ✅ NEW: Heartbeat system - detect frozen/crashed students
  useEffect(() => {
    if (!sessionCode || !userId || !gameStarted) return;
    
    console.log('💓 Starting heartbeat for student:', userId);
    
    // Send heartbeat every 5 seconds while game is active
    const heartbeat = setInterval(() => {
      try {
        const db = getDatabase();
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
          lastActivity: Date.now(),
          lastUpdated: Date.now()
        }).catch(err => {
          console.error('Heartbeat failed:', err);
        });
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    }, 5000);
    
    return () => {
      console.log('💓 Stopping heartbeat for student:', userId);
      clearInterval(heartbeat);
    };
  }, [sessionCode, userId, gameStarted]);

  // Generate player name on mount
  useEffect(() => {
    if (userId) {
      try {
        const name = generatePlayerName(userId);
        const color = getPlayerColor(userId);
        const emoji = getPlayerEmoji(userId);
        
        setPlayerName(name);
        setPlayerColor(color);
        setPlayerEmoji(emoji);
        
        console.log('🎮 Player assigned name:', name);
      } catch (err) {
        console.error('❌ Error generating player name:', err);
        setPlayerName('Student');
        setPlayerColor('#3B82F6');
        setPlayerEmoji('🎵');
      }
    }
  }, [userId]);

  // Calculate speed bonus (same as Name That Loop)
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

  // ALL 20 QUESTIONS - Will be shuffled
  // ✅ RULE: Each question uses loops from ONLY ONE MOOD (all Heroic OR all Upbeat)
  const allQuestions = [
    // HEROIC MOOD - Questions 1-10 (all Heroic loops only)
    {
      id: 1,
      correctAnswer: 'A',
      mood: 'Heroic',
      layers: [
        { name: 'Heroic Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Heroic Drums 1.mp3', color: '#EF4444' }
      ]
    },
    {
      id: 2,
      correctAnswer: 'B',
      mood: 'Heroic',
      layers: [
        { name: 'Heroic Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Heroic Drums 1.mp3', color: '#EF4444' },
        { name: 'Heroic Brass 2', category: 'Brass', file: '/projects/film-music-score/loops/Heroic Brass 2.mp3', color: '#F59E0B' }
      ]
    },
    {
      id: 3,
      correctAnswer: 'C',
      mood: 'Heroic',
      layers: [
        { name: 'Heroic Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Heroic Drums 1.mp3', color: '#EF4444' },
        { name: 'Heroic Brass 2', category: 'Brass', file: '/projects/film-music-score/loops/Heroic Brass 2.mp3', color: '#F59E0B' },
        { name: 'Heroic Strings 1', category: 'Strings', file: '/projects/film-music-score/loops/Heroic Strings 1.mp3', color: '#10B981' }
      ]
    },
    {
      id: 4,
      correctAnswer: 'D',
      mood: 'Heroic',
      layers: [
        { name: 'Heroic Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Heroic Drums 1.mp3', color: '#EF4444' },
        { name: 'Heroic Brass 2', category: 'Brass', file: '/projects/film-music-score/loops/Heroic Brass 2.mp3', color: '#F59E0B' },
        { name: 'Heroic Strings 1', category: 'Strings', file: '/projects/film-music-score/loops/Heroic Strings 1.mp3', color: '#10B981' },
        { name: 'Heroic Synth 1', category: 'Synth', file: '/projects/film-music-score/loops/Heroic Synth 1.mp3', color: '#8B5CF6' }
      ]
    },
    {
      id: 5,
      correctAnswer: 'B',
      mood: 'Heroic',
      layers: [
        { name: 'Heroic Drums 2', category: 'Drums', file: '/projects/film-music-score/loops/Heroic Drums 2.mp3', color: '#DC2626' },
        { name: 'Heroic Brass 1', category: 'Brass', file: '/projects/film-music-score/loops/Heroic Brass 1.mp3', color: '#EA580C' }
      ]
    },
    {
      id: 6,
      correctAnswer: 'C',
      mood: 'Heroic',
      layers: [
        { name: 'Heroic Drums 2', category: 'Drums', file: '/projects/film-music-score/loops/Heroic Drums 2.mp3', color: '#DC2626' },
        { name: 'Heroic Brass 1', category: 'Brass', file: '/projects/film-music-score/loops/Heroic Brass 1.mp3', color: '#EA580C' },
        { name: 'Heroic Synth 2', category: 'Synth', file: '/projects/film-music-score/loops/Heroic Synth 2.mp3', color: '#7C3AED' }
      ]
    },
    {
      id: 7,
      correctAnswer: 'A',
      mood: 'Heroic',
      layers: [
        { name: 'Heroic Brass 2', category: 'Brass', file: '/projects/film-music-score/loops/Heroic Brass 2.mp3', color: '#F59E0B' }
      ]
    },
    {
      id: 8,
      correctAnswer: 'D',
      mood: 'Heroic',
      layers: [
        { name: 'Heroic Drums 2', category: 'Drums', file: '/projects/film-music-score/loops/Heroic Drums 2.mp3', color: '#DC2626' },
        { name: 'Heroic Brass 1', category: 'Brass', file: '/projects/film-music-score/loops/Heroic Brass 1.mp3', color: '#EA580C' },
        { name: 'Heroic Strings 1', category: 'Strings', file: '/projects/film-music-score/loops/Heroic Strings 1.mp3', color: '#10B981' },
        { name: 'Heroic Synth 2', category: 'Synth', file: '/projects/film-music-score/loops/Heroic Synth 2.mp3', color: '#7C3AED' }
      ]
    },
    {
      id: 9,
      correctAnswer: 'C',
      mood: 'Heroic',
      layers: [
        { name: 'Heroic Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Heroic Drums 1.mp3', color: '#EF4444' },
        { name: 'Heroic Synth 1', category: 'Synth', file: '/projects/film-music-score/loops/Heroic Synth 1.mp3', color: '#8B5CF6' },
        { name: 'Heroic Brass 2', category: 'Brass', file: '/projects/film-music-score/loops/Heroic Brass 2.mp3', color: '#F59E0B' }
      ]
    },
    {
      id: 10,
      correctAnswer: 'A',
      mood: 'Heroic',
      layers: [
        { name: 'Heroic Strings 1', category: 'Strings', file: '/projects/film-music-score/loops/Heroic Strings 1.mp3', color: '#10B981' }
      ]
    },

    // UPBEAT MOOD - Questions 11-20 (all Upbeat loops only)
    {
      id: 11,
      correctAnswer: 'A',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 1.mp3', color: '#DC2626' }
      ]
    },
    {
      id: 12,
      correctAnswer: 'B',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 1.mp3', color: '#DC2626' },
        { name: 'Upbeat Electric Guitar', category: 'Guitar', file: '/projects/film-music-score/loops/Upbeat Electric Guitar.mp3', color: '#EA580C' }
      ]
    },
    {
      id: 13,
      correctAnswer: 'C',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 1.mp3', color: '#DC2626' },
        { name: 'Upbeat Electric Guitar', category: 'Guitar', file: '/projects/film-music-score/loops/Upbeat Electric Guitar.mp3', color: '#EA580C' },
        { name: 'Upbeat Piano', category: 'Piano', file: '/projects/film-music-score/loops/Upbeat Piano.mp3', color: '#10B981' }
      ]
    },
    {
      id: 14,
      correctAnswer: 'D',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 1.mp3', color: '#DC2626' },
        { name: 'Upbeat Electric Guitar', category: 'Guitar', file: '/projects/film-music-score/loops/Upbeat Electric Guitar.mp3', color: '#EA580C' },
        { name: 'Upbeat Piano', category: 'Piano', file: '/projects/film-music-score/loops/Upbeat Piano.mp3', color: '#10B981' },
        { name: 'Upbeat Synth', category: 'Synth', file: '/projects/film-music-score/loops/Upbeat Synth.mp3', color: '#8B5CF6' }
      ]
    },
    {
      id: 15,
      correctAnswer: 'B',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 2', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 2.mp3', color: '#EF4444' },
        { name: 'Upbeat Bass', category: 'Bass', file: '/projects/film-music-score/loops/Upbeat Bass.mp3', color: '#F59E0B' }
      ]
    },
    {
      id: 16,
      correctAnswer: 'C',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 2', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 2.mp3', color: '#EF4444' },
        { name: 'Upbeat Bass', category: 'Bass', file: '/projects/film-music-score/loops/Upbeat Bass.mp3', color: '#F59E0B' },
        { name: 'Upbeat Synth', category: 'Synth', file: '/projects/film-music-score/loops/Upbeat Synth.mp3', color: '#8B5CF6' }
      ]
    },
    {
      id: 17,
      correctAnswer: 'A',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Electric Guitar', category: 'Guitar', file: '/projects/film-music-score/loops/Upbeat Electric Guitar.mp3', color: '#EA580C' }
      ]
    },
    {
      id: 18,
      correctAnswer: 'D',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 2', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 2.mp3', color: '#EF4444' },
        { name: 'Upbeat Bass', category: 'Bass', file: '/projects/film-music-score/loops/Upbeat Bass.mp3', color: '#F59E0B' },
        { name: 'Upbeat Piano', category: 'Piano', file: '/projects/film-music-score/loops/Upbeat Piano.mp3', color: '#10B981' },
        { name: 'Upbeat Synth', category: 'Synth', file: '/projects/film-music-score/loops/Upbeat Synth.mp3', color: '#8B5CF6' }
      ]
    },
    {
      id: 19,
      correctAnswer: 'C',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 1.mp3', color: '#DC2626' },
        { name: 'Upbeat Synth', category: 'Synth', file: '/projects/film-music-score/loops/Upbeat Synth.mp3', color: '#8B5CF6' },
        { name: 'Upbeat Electric Guitar', category: 'Guitar', file: '/projects/film-music-score/loops/Upbeat Electric Guitar.mp3', color: '#EA580C' }
      ]
    },
    {
      id: 20,
      correctAnswer: 'A',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Piano', category: 'Piano', file: '/projects/film-music-score/loops/Upbeat Piano.mp3', color: '#10B981' }
      ]
    }
  ];

  // Shuffle questions on component mount
  useEffect(() => {
    try {
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
      console.log('✅ Questions shuffled successfully');
    } catch (err) {
      console.error('❌ Error shuffling questions:', err);
      setShuffledQuestions(allQuestions); // Fallback to unshuffled
    }
  }, []);

  // Timer update
  useEffect(() => {
    if (!startTime || showAnswer) return;
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now() - startTime);
    }, 100);
    
    return () => clearInterval(interval);
  }, [startTime, showAnswer]);

  // ✅ IMPROVED: Play layers with comprehensive error handling
  const playLayers = async () => {
    if (!currentQuestion) {
      console.warn('⚠️ No current question available');
      return;
    }
    
    try {
      if (isPlaying) {
        // Stop all audio
        console.log('⏸️ Stopping audio playback');
        audioRefs.current.forEach(audio => {
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
        setIsPlaying(false);
        return;
      }

      console.log('▶️ Starting audio playback for question:', currentQuestion.id);

      // Start timer
      const now = Date.now();
      setStartTime(now);
      setIsPlaying(true);

      // Clear previous refs
      audioRefs.current = [];

      // Create and play all layer audios WITH ERROR HANDLING
      const loadPromises = currentQuestion.layers.map((layer, index) => {
        return new Promise((resolve, reject) => {
          console.log(`🎵 Loading audio ${index + 1}:`, layer.file);
          
          const audio = new Audio();
          
          // ✅ Audio load error handler
          audio.onerror = (e) => {
            console.error(`❌ Audio load failed: ${layer.file}`, e);
            
            // Log to Firebase so you can see it!
            if (sessionCode && userId) {
              try {
                const db = getDatabase();
                push(ref(db, 'all-problems'), {
                  data: {
                    sessionCode,
                    studentId: userId,
                    studentName: playerName || 'Student',
                    lessonId: 'music-loops-lesson2',
                    message: `Audio file failed to load: ${layer.name}`,
                    audioFile: layer.file,
                    layerName: layer.name,
                    questionId: currentQuestion.id,
                    errorType: 'audio-load-failure',
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    siteMode: 'edu',
                  },
                  timestamp: Date.now(),
                  resolved: false,
                  type: 'error'
                });
              } catch (firebaseErr) {
                console.error('Failed to log audio error to Firebase:', firebaseErr);
              }
            }
            
            reject(new Error(`Failed to load ${layer.file}`));
          };
          
          // Audio loaded successfully
          audio.onloadeddata = () => {
            console.log(`✅ Audio loaded: ${layer.file}`);
            resolve();
          };
          
          audio.src = layer.file;
          audio.load();
          audioRefs.current[index] = audio;
        });
      });

      // Wait for all audio files to load (or timeout after 5 seconds)
      await Promise.race([
        Promise.all(loadPromises),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Audio load timeout')), 5000))
      ]);

      console.log('✅ All audio files loaded, starting playback');

      // Play all layers simultaneously
      audioRefs.current.forEach((audio, index) => {
        if (audio && audio.readyState >= 2) { // HAVE_CURRENT_DATA
          audio.play().catch(err => {
            console.error(`Playback error for audio ${index}:`, err);
          });
        }
      });

    } catch (error) {
      console.error('❌ Error in playLayers:', error);
      setIsPlaying(false);
      
      // Log the crash to Firebase
      if (sessionCode && userId) {
        try {
          const db = getDatabase();
          push(ref(db, 'all-problems'), {
            data: {
              sessionCode,
              studentId: userId,
              studentName: playerName || 'Student',
              lessonId: 'music-loops-lesson2',
              message: `LayerDetective playLayers crashed: ${error.message}`,
              stack: error.stack || 'No stack trace',
              questionId: currentQuestion?.id,
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              siteMode: 'edu',
            },
            timestamp: Date.now(),
            resolved: false,
            type: 'error'
          });
        } catch (firebaseErr) {
          console.error('Failed to log playLayers error to Firebase:', firebaseErr);
        }
      }
      
      // Show user-friendly error
      alert('Oops! Some audio files failed to load. Please refresh and try again.');
    }
  };

  const handleGuess = (letter) => {
    try {
      // Stop timer
      const timeElapsed = Date.now() - startTime;
      setAnswerTime(timeElapsed);
      
      // Stop audio
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      setIsPlaying(false);

      const isCorrect = letter === currentQuestion.correctAnswer;

      let points = 0;
      let basePoints = 0;
      let speedBonus = 0;

      if (isCorrect) {
        basePoints = 10; // Base points for correct answer
        speedBonus = calculateSpeedBonus(timeElapsed);
        points = basePoints + speedBonus;
        setScore(prevScore => prevScore + points);
      }

      setGuessResult({
        isCorrect,
        points,
        basePoints,
        speedBonus,
        timeElapsed
      });

      setShowAnswer(true);

      console.log('✅ Answer submitted:', { letter, isCorrect, points, timeElapsed });
    } catch (error) {
      console.error('❌ Error in handleGuess:', error);
      
      // Log error to Firebase
      if (sessionCode && userId) {
        try {
          const db = getDatabase();
          push(ref(db, 'all-problems'), {
            data: {
              sessionCode,
              studentId: userId,
              message: `handleGuess error: ${error.message}`,
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
            },
            timestamp: Date.now(),
            type: 'error'
          });
        } catch (firebaseErr) {
          console.error('Failed to log handleGuess error:', firebaseErr);
        }
      }
    }
  };

  const handleNextRound = () => {
    try {
      if (currentRound >= totalRounds - 1) {
        // Game complete
        setGameComplete(true);
        console.log('🎉 Game complete! Final score:', score);
        
        // Update Firebase score
        if (sessionCode && userId && !viewMode) {
          try {
            updateStudentScore(sessionCode, userId, score);
            
            const db = getDatabase();
            update(ref(db, `sessions/${sessionCode}/studentProgress/${userId}`), {
              'layer-detective': 'completed'
            });
            
            console.log('✅ Score saved to Firebase:', score);
          } catch (firebaseErr) {
            console.error('❌ Failed to save score to Firebase:', firebaseErr);
          }
        }
      } else {
        // Next round
        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        setCurrentQuestion(shuffledQuestions[nextRound]);
        setShowAnswer(false);
        setGuessResult(null);
        setStartTime(null);
        setAnswerTime(0);
        setCurrentTime(0);
        
        console.log('➡️ Moving to next round:', nextRound + 1);
      }
    } catch (error) {
      console.error('❌ Error in handleNextRound:', error);
    }
  };

  const startGame = () => {
    try {
      if (shuffledQuestions.length === 0) {
        console.error('❌ No questions available!');
        alert('Error: Questions not loaded. Please refresh the page.');
        return;
      }
      
      setGameStarted(true);
      setCurrentQuestion(shuffledQuestions[0]);
      console.log('🎮 Game started!');
    } catch (error) {
      console.error('❌ Error starting game:', error);
    }
  };

  const restartGame = () => {
    try {
      // Stop any playing audio
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      
      // Reshuffle questions
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
      
      // Reset all states
      setGameStarted(false);
      setCurrentRound(0);
      setScore(0);
      setGameComplete(false);
      setCurrentQuestion(null);
      setShowAnswer(false);
      setGuessResult(null);
      setIsPlaying(false);
      setStartTime(null);
      setAnswerTime(0);
      setCurrentTime(0);
      
      console.log('🔄 Game restarted');
    } catch (error) {
      console.error('❌ Error restarting game:', error);
    }
  };

  const numLayers = currentQuestion?.layers.length || 0;

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            
            {/* Player Badge */}
            <div 
              className="inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-6 shadow-lg"
              style={{ backgroundColor: playerColor }}
            >
              <span className="text-3xl">{playerEmoji}</span>
              <span className="text-2xl font-bold text-white">{playerName}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Complete!</h1>
            <p className="text-gray-600 mb-6">You're a Layer Detective Master!</p>
            
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-6 mb-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">{score}</div>
              <div className="text-lg text-gray-700">Total Points</div>
              <div className="text-sm text-gray-600 mt-2">
                {totalRounds} questions answered
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={restartGame}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <RotateCcw size={20} />
                <span>Play Again</span>
              </button>
              
              {!viewMode && (
                <button
                  onClick={onComplete}
                  className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-700 transition-all"
                >
                  Continue to Next Activity
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">🎵</div>
            
            {/* Player Badge */}
            {playerName && (
              <div 
                className="inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-6 shadow-lg"
                style={{ backgroundColor: playerColor }}
              >
                <span className="text-3xl">{playerEmoji}</span>
                <span className="text-2xl font-bold text-white">{playerName}</span>
              </div>
            )}
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Layer Detective</h1>
            <p className="text-xl text-gray-700 mb-8">
              Listen carefully and count how many layers you hear!
            </p>
            
            <div className="bg-orange-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-bold text-lg text-gray-900 mb-3">How to Play:</h2>
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Press <strong>Play</strong> to hear the loops</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Count how many layers you hear (1-4)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Choose your answer: A, B, C, or D</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span>Answer fast for bonus points!</span>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-2 text-blue-800">
                <Trophy size={24} />
                <span className="font-bold text-lg">{totalRounds} Questions</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg font-bold text-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-4 max-w-md w-full">
        {/* Player Badge - Very Compact */}
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

        {/* Question Counter - Very Compact */}
        <div className="text-center mb-2">
          <div className="text-xs font-semibold text-gray-600">
            Question {currentRound + 1} of {totalRounds}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-red-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentRound + 1) / totalRounds) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2">
          {!showAnswer ? (
            <>
              {/* Play Button - Very Compact */}
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  How many layers?
                </h2>

                {/* Timer Display - Compact */}
                {startTime && (
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                      <Clock size={14} className="text-gray-600" />
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {formatTime(currentTime)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={playLayers}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full font-bold text-base hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center justify-center space-x-2 mx-auto"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={18} />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>

              {/* Visual Placeholder - Very Compact */}
              <div className="bg-gray-50 rounded-lg p-2 mb-2 border-2 border-gray-300">
                <div className="space-y-1">
                  {[1, 2, 3, 4].map((row) => (
                    <div
                      key={row}
                      className="h-8 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs font-semibold"
                    >
                      Layer {row}
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer Buttons - Compact */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { letter: 'A', num: 1, label: '1 Layer' },
                  { letter: 'B', num: 2, label: '2 Layers' },
                  { letter: 'C', num: 3, label: '3 Layers' },
                  { letter: 'D', num: 4, label: '4 Layers' }
                ].map(option => (
                  <button
                    key={option.letter}
                    onClick={() => handleGuess(option.letter)}
                    className="bg-gray-100 hover:bg-gray-200 py-3 px-3 rounded-lg font-bold text-lg transition-all border-2 border-transparent hover:border-orange-500"
                  >
                    <div className="text-orange-600">{option.letter}</div>
                    <div className="text-gray-800 text-xs">{option.label}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* ANSWER REVEALED - Very Compact for Chromebooks */
            <>
              {/* Result with Points - Compact */}
              <div className="text-center mb-2">
                <div className={`text-3xl mb-1 ${guessResult.isCorrect ? 'animate-bounce' : ''}`}>
                  {guessResult.isCorrect ? '✅' : '❌'}
                </div>
                <div className={`text-xl font-bold mb-1 ${
                  guessResult.isCorrect ? 'text-green-600' : 'text-red-600'
                }`}>
                  {guessResult.isCorrect ? 'Correct!' : 'Not Quite!'}
                </div>
                
                {guessResult.isCorrect && guessResult.points ? (
                  <div className="mb-2">
                    <div className="text-lg font-bold text-gray-900">
                      +{guessResult.points} points!
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
                  </div>
                ) : (
                  <div className="text-sm text-gray-700">
                    Answer: <span className="font-bold">{currentQuestion.correctAnswer}</span> - <span className="font-bold">{numLayers} {numLayers === 1 ? 'Layer' : 'Layers'}</span>
                    {guessResult.timeElapsed && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Time: {formatTime(guessResult.timeElapsed)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Visual Answer - Very Compact */}
              <div className="bg-blue-50 rounded-lg p-2 mb-2 border-2 border-blue-300">
                <h3 className="text-sm font-bold text-gray-900 mb-1 text-center">
                  The loops:
                </h3>
                <div className="space-y-1">
                  {currentQuestion.layers.map((layer, index) => (
                    <div
                      key={index}
                      className="h-8 rounded-md flex items-center px-2 text-white font-bold text-xs shadow-lg transition-all animate-fadeIn"
                      style={{ 
                        backgroundColor: layer.color,
                        animationDelay: `${index * 0.2}s`
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{layer.name}</span>
                        <span className="text-xs opacity-90 ml-2">{layer.category}</span>
                      </div>
                    </div>
                  ))}
                  
                  {[...Array(4 - numLayers)].map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="h-8 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs font-semibold opacity-30"
                    >
                      (No loop)
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Button - Compact */}
              <button
                onClick={handleNextRound}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 rounded-lg font-bold text-base hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
              >
                {currentRound >= totalRounds - 1 ? 'See Results' : 'Next Question'}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default LayerDetectiveActivity;