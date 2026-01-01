// File: /src/lessons/shared/activities/layer-detective/LayerDetectiveClassGame.jsx
// Layer Detective - Teacher Presentation View (Class Game)
//
// PHASES:
// 1. Setup - Show "Start Game"
// 2. Playing - Show question, "Play Audio" button
// 3. Guessing - Audio playing, students answering, show answer count
// 4. Revealed - Show correct answer and what the layers were
// 5. Next/Finished

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Users, Trophy, Eye, RotateCcw, ChevronRight } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';

// ============ QUESTIONS DATA ============
const QUESTIONS = [
  {
    id: 1,
    correctAnswer: '1',
    instruments: ['Drums'],
    layers: [
      { name: 'Heroic Drums 1', file: '/projects/film-music-score/loops/Heroic Drums 1.mp3', color: '#EF4444' }
    ]
  },
  {
    id: 2,
    correctAnswer: '2',
    instruments: ['Drums', 'Brass'],
    layers: [
      { name: 'Heroic Drums 1', file: '/projects/film-music-score/loops/Heroic Drums 1.mp3', color: '#EF4444' },
      { name: 'Heroic Brass 2', file: '/projects/film-music-score/loops/Heroic Brass 2.mp3', color: '#F59E0B' }
    ]
  },
  {
    id: 3,
    correctAnswer: '3',
    instruments: ['Drums', 'Brass', 'Strings'],
    layers: [
      { name: 'Heroic Drums 1', file: '/projects/film-music-score/loops/Heroic Drums 1.mp3', color: '#EF4444' },
      { name: 'Heroic Brass 2', file: '/projects/film-music-score/loops/Heroic Brass 2.mp3', color: '#F59E0B' },
      { name: 'Heroic Strings 1', file: '/projects/film-music-score/loops/Heroic Strings 1.mp3', color: '#10B981' }
    ]
  },
  {
    id: 4,
    correctAnswer: '1',
    instruments: ['Piano'],
    layers: [
      { name: 'Upbeat Piano', file: '/projects/film-music-score/loops/Upbeat Piano.mp3', color: '#3B82F6' }
    ]
  },
  {
    id: 5,
    correctAnswer: '2',
    instruments: ['Drums', 'Bass'],
    layers: [
      { name: 'Upbeat Drums 1', file: '/projects/film-music-score/loops/Upbeat Drums 1.mp3', color: '#DC2626' },
      { name: 'Upbeat Electric Bass', file: '/projects/film-music-score/loops/Upbeat Electric Bass.mp3', color: '#059669' }
    ]
  },
  {
    id: 6,
    correctAnswer: '3',
    instruments: ['Bass', 'Strings', 'Synth'],
    layers: [
      { name: 'Mysterious Bass 1', file: '/projects/film-music-score/loops/Mysterious Bass 1.mp3', color: '#6366F1' },
      { name: 'Mysterious Strings', file: '/projects/film-music-score/loops/Mysterious Strings.mp3', color: '#8B5CF6' },
      { name: 'Mysterious Synth 1', file: '/projects/film-music-score/loops/Mysterious Synth 1.mp3', color: '#A855F7' }
    ]
  },
  {
    id: 7,
    correctAnswer: '2',
    instruments: ['Bass', 'Strings'],
    layers: [
      { name: 'Scary Bass 1', file: '/projects/film-music-score/loops/Scary Bass 1.mp3', color: '#991B1B' },
      { name: 'Scary Strings 1', file: '/projects/film-music-score/loops/Scary Strings 1.mp3', color: '#7F1D1D' }
    ]
  },
  {
    id: 8,
    correctAnswer: '1',
    instruments: ['Synth'],
    layers: [
      { name: 'Heroic Synth 1', file: '/projects/film-music-score/loops/Heroic Synth 1.mp3', color: '#7C3AED' }
    ]
  },
  {
    id: 9,
    correctAnswer: '3',
    instruments: ['Drums', 'Piano', 'Strings'],
    layers: [
      { name: 'Upbeat Drums 2', file: '/projects/film-music-score/loops/Upbeat Drums 2.mp3', color: '#DC2626' },
      { name: 'Upbeat Piano', file: '/projects/film-music-score/loops/Upbeat Piano.mp3', color: '#3B82F6' },
      { name: 'Upbeat Strings', file: '/projects/film-music-score/loops/Upbeat Strings.mp3', color: '#10B981' }
    ]
  },
  {
    id: 10,
    correctAnswer: '2',
    instruments: ['Drums', 'Strings'],
    layers: [
      { name: 'Heroic Drums 2', file: '/projects/film-music-score/loops/Heroic Drums 2.mp3', color: '#EF4444' },
      { name: 'Heroic Strings 2', file: '/projects/film-music-score/loops/Heroic Strings 2.mp3', color: '#10B981' }
    ]
  }
];

// Answer options
const ANSWERS = [
  { id: '1', label: '1 Layer', color: '#3B82F6' },
  { id: '2', label: '2 Layers', color: '#8B5CF6' },
  { id: '3', label: '3 Layers', color: '#EC4899' }
];

// Shuffle helper
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Instrument emoji helper
const getInstrumentEmoji = (instrument) => {
  const emojiMap = {
    'Drums': '🥁',
    'Bass': '🎸',
    'Brass': '🎺',
    'Strings': '🎻',
    'Piano': '🎹',
    'Synth': '🎛️'
  };
  return emojiMap[instrument] || '🎵';
};

// Student Activity Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#0d9488', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const LayerDetectiveClassGame = ({ sessionData, onComplete }) => {
  const sessionCode = sessionData?.sessionCode || new URLSearchParams(window.location.search).get('session');

  // Game state
  const [gamePhase, setGamePhase] = useState('setup'); // setup, playing, guessing, revealed, finished
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // Reveal state
  const [revealStep, setRevealStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreChanges, setScoreChanges] = useState({});

  // Audio refs
  const audioRefs = useRef([]);

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/layerDetective`), data);
  }, [sessionCode]);

  // Firebase: Subscribe to students
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName || 'Student',
        score: s.layerDetectiveScore || 0,
        answer: s.layerDetectiveAnswer,
        answerTime: s.layerDetectiveAnswerTime,
        playerColor: s.playerColor || '#3B82F6'
      }));

      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // ============ AUDIO PLAYBACK ============
  const stopAudio = useCallback(() => {
    audioRefs.current.forEach(a => { a.pause(); a.currentTime = 0; });
    audioRefs.current = [];
    setIsPlaying(false);
  }, []);

  // Play audio only (no phase change) - used during reveal
  const playAudioOnly = useCallback(() => {
    if (!shuffledQuestions[currentQuestion]) return;
    const question = shuffledQuestions[currentQuestion];

    // Stop existing audio
    stopAudio();

    // Create all audio elements
    const audios = question.layers.map(layer => {
      const audio = new Audio(layer.file);
      audio.volume = 0.7;
      audio.loop = false;
      return audio;
    });
    audioRefs.current = audios;

    // Play all at once (synchronized)
    setTimeout(() => {
      audios.forEach(a => a.play().catch(console.error));
      setIsPlaying(true);
    }, 50);

    // Track when audio ends
    let finishedCount = 0;
    audios.forEach(a => {
      a.onended = () => {
        finishedCount++;
        if (finishedCount >= audios.length) {
          setIsPlaying(false);
        }
      };
    });
  }, [shuffledQuestions, currentQuestion, stopAudio]);

  const playAudio = useCallback(() => {
    if (!shuffledQuestions[currentQuestion]) return;

    // Play the audio
    playAudioOnly();

    // Update phase to guessing and broadcast
    setGamePhase('guessing');
    updateGame({
      phase: 'guessing',
      currentQuestion,
      totalQuestions: shuffledQuestions.length,
      isPlaying: true,
      playStartTime: Date.now(),
      questionData: { layers: shuffledQuestions[currentQuestion].layers }
    });
  }, [shuffledQuestions, currentQuestion, playAudioOnly, updateGame]);

  // ============ GAME FLOW ============
  const startGame = useCallback(() => {
    const shuffled = shuffleArray(QUESTIONS);
    setShuffledQuestions(shuffled);
    setCurrentQuestion(0);
    setGamePhase('playing');
    setRevealStep(0);
    setScoreChanges({});
    setCorrectCount(0);

    // Reset student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          layerDetectiveAnswer: null,
          layerDetectiveScore: 0
        });
      });
    }

    updateGame({
      phase: 'playing',
      currentQuestion: 0,
      totalQuestions: shuffled.length
    });
  }, [sessionCode, students, updateGame]);

  const reveal = useCallback(() => {
    stopAudio();

    const question = shuffledQuestions[currentQuestion];
    if (!question) return;

    // Find who answered correctly first
    const correctStudents = students
      .filter(s => s.answer === question.correctAnswer && s.answerTime)
      .sort((a, b) => a.answerTime - b.answerTime);

    const firstCorrectId = correctStudents[0]?.id;

    // Calculate scores
    const changes = {};
    let correct = 0;

    students.forEach(s => {
      const isCorrect = s.answer === question.correctAnswer;
      if (s.answer) {
        if (isCorrect) {
          correct++;
          // Base 10 points + 5 bonus for answering first
          const firstBonus = (s.id === firstCorrectId) ? 5 : 0;
          changes[s.id] = { delta: 10 + firstBonus, isCorrect: true, wasFirst: s.id === firstCorrectId };
        } else {
          changes[s.id] = { delta: 0, isCorrect: false };
        }
      } else {
        changes[s.id] = { delta: 0, isCorrect: false, noAnswer: true };
      }
    });

    setScoreChanges(changes);
    setCorrectCount(correct);

    // Update game phase - batch state updates
    setGamePhase('revealed');
    setRevealStep(4); // Show everything immediately

    // Broadcast to students
    updateGame({
      phase: 'revealed',
      correctAnswer: question.correctAnswer,
      correctInstruments: question.instruments
    });

    // Update scores in Firebase (single batch)
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        const change = changes[s.id];
        if (change && change.delta > 0) {
          update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
            layerDetectiveScore: (s.score || 0) + change.delta
          });
        }
      });
    }

    // Play the audio so students can hear the correct answer
    setTimeout(() => {
      playAudioOnly();
    }, 300);
  }, [stopAudio, shuffledQuestions, currentQuestion, students, sessionCode, updateGame, playAudioOnly]);

  const nextQuestion = useCallback(() => {
    // Stop any playing audio
    stopAudio();

    // Clear student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          layerDetectiveAnswer: null
        });
      });
    }

    const nextIdx = currentQuestion + 1;
    if (nextIdx >= shuffledQuestions.length) {
      // Game finished - go to results slide
      updateGame({ phase: 'finished' });
      if (onComplete) onComplete();
    } else {
      setCurrentQuestion(nextIdx);
      setGamePhase('playing');
      setRevealStep(0);
      setScoreChanges({});
      setCorrectCount(0);
      updateGame({
        phase: 'playing',
        currentQuestion: nextIdx
      });

      // Auto-play the next question's audio after a brief delay
      setTimeout(() => {
        // Play audio for next question (need to use the new index directly)
        const nextQuestion = shuffledQuestions[nextIdx];
        if (nextQuestion) {
          const audios = nextQuestion.layers.map(layer => {
            const audio = new Audio(layer.file);
            audio.volume = 0.7;
            audio.loop = false;
            return audio;
          });
          audioRefs.current = audios;

          audios.forEach(a => a.play().catch(console.error));
          setIsPlaying(true);

          let finishedCount = 0;
          audios.forEach(a => {
            a.onended = () => {
              finishedCount++;
              if (finishedCount >= audios.length) {
                setIsPlaying(false);
              }
            };
          });

          // Update to guessing phase
          setGamePhase('guessing');
          updateGame({
            phase: 'guessing',
            currentQuestion: nextIdx,
            totalQuestions: shuffledQuestions.length,
            isPlaying: true,
            playStartTime: Date.now(),
            questionData: { layers: nextQuestion.layers }
          });
        }
      }, 800);
    }
  }, [sessionCode, students, currentQuestion, shuffledQuestions, updateGame, onComplete, stopAudio]);

  // Cleanup on unmount
  useEffect(() => () => stopAudio(), [stopAudio]);

  const question = shuffledQuestions[currentQuestion];

  // ============ RENDER ============
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Student Activity Banner */}
      <ActivityBanner />

      {/* Main content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎧</span>
            <h1 className="text-4xl font-bold">Layer Detective</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Q{currentQuestion + 1} / {shuffledQuestions.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Main content grid */}
        <div className={`grid ${gamePhase !== 'setup' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
          {/* Main area */}
          <div className={`${gamePhase !== 'setup' ? 'col-span-2' : ''} bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0`}>

            {/* Setup */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-9xl mb-6">🎧</div>
                <h2 className="text-5xl font-bold mb-4">Layer Detective</h2>
                <p className="text-2xl text-white/70 mb-8">Listen and count the layers!</p>
                <button
                  onClick={startGame}
                  className="px-10 py-5 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={40} /> Start Game
                </button>
              </div>
            )}

            {/* Playing - waiting for teacher to play audio */}
            {gamePhase === 'playing' && question && (
              <div className="text-center">
                <div className="text-6xl font-black mb-4">Question {currentQuestion + 1}</div>
                <p className="text-2xl text-purple-200 mb-6">How many layers will you hear?</p>

                {/* Answer options preview */}
                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
                  {ANSWERS.map(answer => (
                    <div
                      key={answer.id}
                      className="p-6 rounded-2xl text-center"
                      style={{ backgroundColor: `${answer.color}40`, borderColor: answer.color, borderWidth: '3px' }}
                    >
                      <div className="text-5xl font-bold text-white mb-2">{answer.id}</div>
                      <div className="text-lg text-white/80">{answer.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={playAudio}
                  className="px-10 py-5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-3xl font-bold flex items-center gap-3 mx-auto hover:scale-105 transition-all"
                >
                  <Play size={40} /> Play Audio
                </button>
              </div>
            )}

            {/* Guessing - audio playing, waiting for answers */}
            {gamePhase === 'guessing' && question && (
              <div className="text-center">
                <div className="text-5xl font-black mb-2">🎧 LISTEN!</div>
                <p className="text-2xl text-yellow-300 mb-6">How many layers do you hear?</p>

                {/* Answer options */}
                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-6">
                  {ANSWERS.map(answer => (
                    <div
                      key={answer.id}
                      className="p-6 rounded-2xl text-center"
                      style={{ backgroundColor: `${answer.color}40`, borderColor: answer.color, borderWidth: '3px' }}
                    >
                      <div className="text-5xl font-bold text-white mb-2">{answer.id}</div>
                      <div className="text-lg text-white/80">{answer.label}</div>
                    </div>
                  ))}
                </div>

                {isPlaying && (
                  <div className="text-xl text-green-400 animate-pulse mb-4">🔊 Playing...</div>
                )}

                {/* Answer count */}
                <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-6">
                  <span className="text-4xl font-black text-green-400">{lockedCount}</span>
                  <span className="text-xl text-white/70"> / {students.length} answered</span>
                </div>

                {/* Control buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={playAudio}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-xl font-bold flex items-center gap-2"
                  >
                    <RotateCcw size={24} /> Replay
                  </button>
                  <button
                    onClick={reveal}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Eye size={28} /> Reveal Answer
                  </button>
                </div>
              </div>
            )}

            {/* Revealed */}
            {gamePhase === 'revealed' && question && (
              <div className="text-center">
                <div className="text-3xl text-white/80 mb-4">The answer is...</div>

                {/* Stacked Tracks Visual */}
                <div className="bg-black/30 rounded-2xl p-5 mb-6 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl">🎧</span>
                    <p className="text-xl text-white font-semibold">
                      {question.layers.length} {question.layers.length === 1 ? 'Layer' : 'Layers'} Playing Together
                    </p>
                    {isPlaying && <span className="text-green-400 animate-pulse">🔊</span>}
                  </div>

                  {/* Stacked timeline tracks */}
                  <div className="space-y-2">
                    {question.layers.map((layer, i) => (
                      <div
                        key={`${question.id}-${i}`}
                        className="flex items-center gap-3 bg-black/40 rounded-xl overflow-hidden"
                      >
                        {/* Instrument icon */}
                        <div
                          className="w-16 h-14 flex items-center justify-center text-2xl shrink-0"
                          style={{ backgroundColor: layer.color }}
                        >
                          {getInstrumentEmoji(question.instruments[i])}
                        </div>

                        {/* Track bar */}
                        <div className="flex-1 py-3 pr-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-bold text-lg">
                              {question.instruments[i]}
                            </span>
                          </div>
                          {/* Loop visualization bar */}
                          <div
                            className="h-4 rounded-full relative overflow-hidden"
                            style={{ backgroundColor: `${layer.color}40` }}
                          >
                            <div
                              className={`absolute inset-0 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
                              style={{
                                backgroundColor: layer.color,
                                opacity: isPlaying ? 0.9 : 0.7
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={nextQuestion}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                >
                  {currentQuestion >= shuffledQuestions.length - 1 ? (
                    <>Finish <Trophy size={28} /></>
                  ) : (
                    <>Next Question <ChevronRight size={28} /></>
                  )}
                </button>
              </div>
            )}

          </div>

          {/* Leaderboard */}
          {gamePhase !== 'setup' && (
            <div className="bg-black/20 rounded-2xl p-4 flex flex-col min-h-0">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="text-yellow-400" size={32} />
                <h2 className="text-2xl font-bold">Leaderboard</h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {leaderboard.map((student, idx) => {
                  const change = scoreChanges[student.id];
                  const isRevealing = gamePhase === 'revealed' && revealStep >= 3;
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        idx === 0 ? 'bg-yellow-500/20' : 'bg-white/5'
                      } ${isRevealing && change?.isCorrect ? 'ring-2 ring-green-400' : ''}`}
                    >
                      <span className="w-8 text-center font-bold text-xl">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: student.playerColor }}
                      >
                        {student.name.charAt(0)}
                      </div>
                      <span className="flex-1 truncate text-lg font-medium">{student.name}</span>
                      {gamePhase === 'guessing' && student.answer && (
                        <span className="text-green-400 text-sm">✓</span>
                      )}
                      <span className="font-bold text-xl">
                        {student.score + (isRevealing ? (change?.delta || 0) : 0)}
                      </span>
                      {isRevealing && change?.wasFirst && (
                        <span className="text-yellow-400 text-sm font-bold">⚡1st</span>
                      )}
                      {isRevealing && change && change.delta > 0 && (
                        <span className="text-lg font-bold text-green-400">+{change.delta}</span>
                      )}
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <div className="text-center text-white/50 py-6 text-lg">Waiting for students...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayerDetectiveClassGame;
