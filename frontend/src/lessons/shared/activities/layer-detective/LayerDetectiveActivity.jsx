// File: /src/lessons/shared/activities/layer-detective/LayerDetectiveActivity.jsx
// Visual layer counting game - 20 RANDOMIZED questions
// ✅ COMPLETE WITH SCORING: Timer, speed bonus, Firebase score updates
// ✅ WITH NAME GENERATION: Auto-generated player names with badges

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Trophy, Clock } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { updateStudentScore } from '../../../../firebase/config';
import { getDatabase, ref, update } from 'firebase/database';
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

  // Generate player name on mount
  useEffect(() => {
    if (userId) {
      const name = generatePlayerName(userId);
      const color = getPlayerColor(userId);
      const emoji = getPlayerEmoji(userId);
      
      setPlayerName(name);
      setPlayerColor(color);
      setPlayerEmoji(emoji);
      
      console.log('🎮 Player assigned name:', name);
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
        { name: 'Upbeat Strings', category: 'Strings', file: '/projects/film-music-score/loops/Upbeat Strings.mp3', color: '#059669' }
      ]
    },
    {
      id: 14,
      correctAnswer: 'D',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 1.mp3', color: '#DC2626' },
        { name: 'Upbeat Electric Guitar', category: 'Guitar', file: '/projects/film-music-score/loops/Upbeat Electric Guitar.mp3', color: '#EA580C' },
        { name: 'Upbeat Strings', category: 'Strings', file: '/projects/film-music-score/loops/Upbeat Strings.mp3', color: '#059669' },
        { name: 'Upbeat Piano', category: 'Piano', file: '/projects/film-music-score/loops/Upbeat Piano.mp3', color: '#7C3AED' }
      ]
    },
    {
      id: 15,
      correctAnswer: 'C',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 2', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 2.mp3', color: '#B91C1C' },
        { name: 'Upbeat Electric Bass', category: 'Bass', file: '/projects/film-music-score/loops/Upbeat Electric Bass.mp3', color: '#C2410C' },
        { name: 'Upbeat Piano', category: 'Piano', file: '/projects/film-music-score/loops/Upbeat Piano.mp3', color: '#7C3AED' }
      ]
    },
    {
      id: 16,
      correctAnswer: 'B',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat String Bass', category: 'Bass', file: '/projects/film-music-score/loops/Upbeat String Bass.mp3', color: '#C2410C' },
        { name: 'Upbeat Bells', category: 'Bells', file: '/projects/film-music-score/loops/Upbeat Bells.mp3', color: '#CA8A04' }
      ]
    },
    {
      id: 17,
      correctAnswer: 'A',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Clarinet', category: 'Clarinet', file: '/projects/film-music-score/loops/Upbeat Clarinet.mp3', color: '#65A30D' }
      ]
    },
    {
      id: 18,
      correctAnswer: 'D',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 2', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 2.mp3', color: '#B91C1C' },
        { name: 'Upbeat String Bass', category: 'Bass', file: '/projects/film-music-score/loops/Upbeat String Bass.mp3', color: '#C2410C' },
        { name: 'Upbeat Piano', category: 'Piano', file: '/projects/film-music-score/loops/Upbeat Piano.mp3', color: '#7C3AED' },
        { name: 'Upbeat Bells', category: 'Bells', file: '/projects/film-music-score/loops/Upbeat Bells.mp3', color: '#CA8A04' }
      ]
    },
    {
      id: 19,
      correctAnswer: 'C',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 1', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 1.mp3', color: '#DC2626' },
        { name: 'Upbeat Electric Guitar', category: 'Guitar', file: '/projects/film-music-score/loops/Upbeat Electric Guitar.mp3', color: '#EA580C' },
        { name: 'Upbeat Electric Bass', category: 'Bass', file: '/projects/film-music-score/loops/Upbeat Electric Bass.mp3', color: '#C2410C' }
      ]
    },
    {
      id: 20,
      correctAnswer: 'B',
      mood: 'Upbeat',
      layers: [
        { name: 'Upbeat Drums 2', category: 'Drums', file: '/projects/film-music-score/loops/Upbeat Drums 2.mp3', color: '#B91C1C' },
        { name: 'Upbeat Clarinet', category: 'Clarinet', file: '/projects/film-music-score/loops/Upbeat Clarinet.mp3', color: '#65A30D' }
      ]
    }
  ];

  // Timer effect - updates current time
  useEffect(() => {
    if (startTime && !showAnswer) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [startTime, showAnswer]);

  const handleStartGame = async () => {
    console.log('🎮 START GAME CLICKED');
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    console.log('🎲 Shuffled questions:', shuffled.length, 'questions');
    console.log('🎲 First question:', shuffled[0]);
    
    setShuffledQuestions(shuffled);
    setGameStarted(true);
    setCurrentRound(0);
    setScore(0);
    setGameComplete(false);
    
    // Save player name to Firebase
    if (sessionCode && userId && playerName) {
      try {
        const db = getDatabase();
        const studentRef = ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`);
        await update(studentRef, {
          displayName: playerName,
          playerColor: playerColor,
          playerEmoji: playerEmoji,
          lastActivity: Date.now()
        });
        console.log('✅ Player name saved to Firebase:', playerName);
      } catch (error) {
        console.error('❌ Error saving player name:', error);
      }
    }
  };

  // Load first question when shuffledQuestions is set
  useEffect(() => {
    if (shuffledQuestions.length > 0 && gameStarted && currentRound === 0 && !currentQuestion) {
      console.log('📝 Loading first question from useEffect');
      loadQuestion(0);
    }
  }, [shuffledQuestions, gameStarted]);

  const loadQuestion = (roundIndex) => {
    console.log('📖 Loading question', roundIndex);
    const question = shuffledQuestions[roundIndex];
    console.log('❓ Question data:', question);
    
    // CRITICAL: Stop and clear ALL audio before loading new question
    console.log('🛑 Stopping all audio from previous question');
    audioRefs.current.forEach((audio, index) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        console.log(`  - Stopped audio ${index}`);
      }
    });
    
    // Clear the audio refs array
    audioRefs.current = [];
    console.log('🗑️ Cleared all audio references');
    
    setCurrentQuestion(question);
    setShowAnswer(false);
    setGuessResult(null);
    setIsPlaying(false);
    setStartTime(null);
    setAnswerTime(0);
    setCurrentTime(0);
    
    console.log('✅ Question loaded. Current question:', question);
    console.log('🎼 Layers in question:', question?.layers);
  };

  const playLayers = () => {
    if (!currentQuestion) {
      console.error('❌ Cannot play - currentQuestion is null/undefined');
      return;
    }
    
    console.log('🎵 Play button clicked');
    console.log('📁 Current question:', currentQuestion);
    console.log('🎼 Layers to play:', currentQuestion.layers.map(l => ({ name: l.name, file: l.file })));
    
    // Start timer on first play
    if (!startTime) {
      setStartTime(Date.now());
    }
    
    if (isPlaying) {
      // Pause all layers
      console.log('⏸️ Pausing audio');
      audioRefs.current.forEach(audio => {
        if (audio) audio.pause();
      });
      setIsPlaying(false);
    } else {
      // Create and prepare ALL audio objects first
      const audioPromises = [];
      
      currentQuestion.layers.forEach((layer, index) => {
        if (!audioRefs.current[index]) {
          console.log(`🎵 Creating new Audio object for layer ${index}:`, layer.file);
          const audio = new Audio(layer.file);
          audio.loop = true;
          audio.volume = 0.7; // Set volume to 70% to prevent clipping when mixing
          audioRefs.current[index] = audio;
          
          // Add error handling
          audio.addEventListener('error', (e) => {
            console.error(`❌ Error loading audio file ${layer.file}:`, e);
            console.error('Error details:', audio.error);
          });
          
          // Create promise that resolves when audio is ready
          const readyPromise = new Promise((resolve) => {
            audio.addEventListener('canplaythrough', () => {
              console.log(`✅ Audio file ${index} ready:`, layer.file);
              resolve();
            }, { once: true });
          });
          
          audioPromises.push(readyPromise);
        } else {
          // Audio already exists, reset to beginning
          audioRefs.current[index].currentTime = 0;
          audioRefs.current[index].volume = 0.7;
        }
      });
      
      // Wait for all audio to be ready, then play simultaneously
      if (audioPromises.length > 0) {
        console.log('⏳ Waiting for all audio files to load...');
        Promise.all(audioPromises).then(() => {
          console.log('✅ All audio ready, playing simultaneously!');
          playAllLayers();
        }).catch(error => {
          console.error('❌ Error loading audio:', error);
        });
      } else {
        // Audio already loaded, play immediately
        playAllLayers();
      }
    }
  };
  
  // Helper function to play all layers at exactly the same time
  const playAllLayers = () => {
    console.log(`▶️ Playing ${currentQuestion.layers.length} layers simultaneously`);
    
    // Play all at once to ensure synchronization
    currentQuestion.layers.forEach((layer, index) => {
      if (audioRefs.current[index]) {
        audioRefs.current[index].play()
          .then(() => {
            console.log(`✅ Successfully playing layer ${index}:`, layer.name);
          })
          .catch(error => {
            console.error(`❌ Failed to play layer ${index}:`, layer.name, error);
          });
      }
    });
    
    setIsPlaying(true);
  };

  const handleGuess = async (answer) => {
    if (!currentQuestion) {
      console.error('❌ Cannot guess - currentQuestion is null/undefined');
      return;
    }
    
    const timeElapsed = Date.now() - startTime;
    setAnswerTime(timeElapsed);
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    let points = 0;
    let basePoints = 0;
    let speedBonus = 0;
    
    if (isCorrect) {
      basePoints = 10;
      speedBonus = calculateSpeedBonus(timeElapsed);
      points = basePoints + speedBonus;
      
      const newScore = score + points;
      setScore(newScore);
      
      // Update Firebase
      if (sessionCode && userId) {
        try {
          await updateStudentScore(sessionCode, userId, newScore);
          console.log(`✅ Awarded ${points} points (${basePoints} base + ${speedBonus} speed)`);
        } catch (error) {
          console.error('❌ Error updating score:', error);
        }
      }
    }
    
    setGuessResult({
      isCorrect,
      points,
      basePoints,
      speedBonus,
      timeElapsed
    });
    setShowAnswer(true);
    
    // Stop audio
    audioRefs.current.forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setIsPlaying(false);
  };

  const handleNextRound = () => {
    const nextRound = currentRound + 1;
    
    if (nextRound >= totalRounds) {
      setGameComplete(true);
      if (onComplete) {
        onComplete(score);
      }
    } else {
      setCurrentRound(nextRound);
      loadQuestion(nextRound);
    }
  };

  const handleRestart = () => {
    setGameStarted(false);
    setCurrentRound(0);
    setScore(0);
    setGameComplete(false);
    setCurrentQuestion(null);
    audioRefs.current = [];
  };

  // Player Name Badge Component - Compact for Chromebooks
  const PlayerNameBadge = () => (
    <div 
      className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-2 py-1.5 z-50 border-2"
      style={{ borderColor: playerColor }}
    >
      <div className="flex items-center space-x-1.5">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: `${playerColor}20` }}
        >
          {playerEmoji}
        </div>
        <div>
          <div className="text-xs text-gray-500 font-medium leading-tight">Your Name</div>
          <div 
            className="text-sm font-bold leading-tight"
            style={{ color: playerColor }}
          >
            {playerName}
          </div>
        </div>
      </div>
    </div>
  );

  // START SCREEN
  if (!gameStarted) {
    return (
      <div className="h-full bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎵</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Layer Detective</h1>
          <p className="text-base text-gray-700 mb-4">
            Listen carefully and count how many layers you hear!
          </p>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-bold text-lg mb-3 text-gray-900">How to Play:</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-orange-600 mr-2">1.</span>
                <span>Press <strong>Play</strong> to hear the music</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-orange-600 mr-2">2.</span>
                <span>Count how many different instrument layers are playing</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-orange-600 mr-2">3.</span>
                <span>Choose your answer: <strong>A, B, C, or D</strong></span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-orange-600 mr-2">4.</span>
                <span>Answer faster to earn bonus points!</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-orange-600 mr-2">5.</span>
                <span><strong>20 questions total</strong> - earn <strong>10 points</strong> per correct answer plus speed bonus!</span>
              </li>
            </ol>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Start Game!
          </button>
        </div>
      </div>
    );
  }

  // GAME COMPLETE SCREEN
  if (gameComplete) {
    const percentage = Math.round((score / (totalRounds * 10)) * 100);
    
    return (
      <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">Game Complete!</h1>
          
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-8">
            <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
              {score}
            </div>
            <div className="text-2xl text-gray-700">Total Points</div>
            <div className="text-lg text-gray-600 mt-2">
              ({percentage}% accuracy)
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRestart}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <RotateCcw size={24} />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GAME SCREEN
  const numLayers = currentQuestion?.layers.length || 0;

  console.log('🎬 GAME SCREEN RENDER');
  console.log('  - gameStarted:', gameStarted);
  console.log('  - currentQuestion:', currentQuestion);
  if (currentQuestion) {
    console.log('  - Question ID:', currentQuestion.id);
    console.log('  - Correct Answer:', currentQuestion.correctAnswer);
    console.log('  - Mood:', currentQuestion.mood);
    console.log('  - Layer names:', currentQuestion.layers.map(l => l.name));
  }
  console.log('  - numLayers:', numLayers);
  console.log('  - currentRound:', currentRound);
  console.log('  - isPlaying:', isPlaying);

  return (
    <div className="h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-2 overflow-hidden">
      {/* Player Name Badge - TOP LEFT - More Compact */}
      {playerName && <PlayerNameBadge />}
      
      {/* Voice toggle button - TOP RIGHT - More Compact */}
      <div className="absolute top-2 right-2 z-50">
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all"
          title={voiceEnabled ? 'Mute' : 'Unmute'}
        >
          {voiceEnabled ? (
            <Volume2 size={20} className="text-gray-700" />
          ) : (
            <VolumeX size={20} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Game Content - Centered and Very Compact for Chromebooks */}
      <div className="h-full flex items-center justify-center py-2">
        <div className="bg-white rounded-xl shadow-2xl p-3 w-full max-w-md max-h-[calc(100vh-16px)] overflow-y-auto">
          {/* Header with Round and Score - Very Compact */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-center">
              <div className="text-xs text-gray-500 font-medium">Round</div>
              <div className="text-lg font-bold text-gray-900">
                {currentRound + 1}/{totalRounds}
              </div>
            </div>
            
            <div className="text-3xl">🎵</div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 font-medium">Score</div>
              <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                {score}
              </div>
            </div>
          </div>

          <div className="w-full h-1 bg-gray-200 rounded-full mb-2">
            <div 
              className="h-full bg-gradient-to-r from-orange-600 to-red-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentRound + 1) / totalRounds) * 100}%` }}
            ></div>
          </div>

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