// File: SectionSpotterTeacherGame.jsx
// Section Spotter - Teacher Presentation View (Class Game)
// Plays a piece section by section, students identify sections on their devices
// Supports multiple pieces via pieceId prop (defaults to Fur Elise)
//
// PHASES:
// 1. Setup - Show "Start Game"
// 2. Guessing - A section plays, students answer on devices
// 3. Revealed - Show correct answer
// 4. Finished - Final scores

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Pause, Users, Trophy, Eye, ChevronRight, Headphones } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { SCORING, generateQuestions, getSectionByLabel, calculateSpeedBonus, getPieceConfig } from './sectionSpotterConfig';

// Student Activity Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#d97706', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const SectionSpotterTeacherGame = ({ sessionData, onComplete, pieceId = 'fur-elise' }) => {
  const sessionCode = sessionData?.sessionCode || new URLSearchParams(window.location.search).get('session');

  // Get piece-specific config
  const pieceConfig = useMemo(() => getPieceConfig(pieceId), [pieceId]);
  const { sectionOptions, audioPath, title: pieceTitle, composer, form: pieceForm } = pieceConfig;

  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const clipEndTimer = useRef(null);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // Reveal state
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreChanges, setScoreChanges] = useState({});

  // Form timeline - track revealed sections
  const [revealedSections, setRevealedSections] = useState([]);

  // Web Audio API setup for volume control
  const ensureAudioContext = useCallback(() => {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.connect(ctx.destination);
    if (audioRef.current) {
      sourceNodeRef.current = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current.connect(gainNodeRef.current);
    }
  }, []);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (clipEndTimer.current) {
      clearTimeout(clipEndTimer.current);
      clipEndTimer.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopAudio(), [stopAudio]);

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/sectionSpotter`), data);
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
        score: s.sectionSpotterScore || 0,
        answer: s.sectionSpotterAnswer,
        answerTime: s.sectionSpotterAnswerTime,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '🎵'
      }));

      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Play a section of the audio
  const playSection = useCallback((question) => {
    if (!audioRef.current || !question) return;

    stopAudio();
    ensureAudioContext();

    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const currentSrc = audioRef.current.getAttribute('src');
    if (currentSrc !== audioPath) {
      audioRef.current.src = audioPath;
      audioRef.current.load();
    }

    audioRef.current.currentTime = question.startTime;
    audioRef.current.playbackRate = 1.0;
    audioRef.current.volume = 1.0;

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = 1.0;
    }

    audioRef.current.play().catch(err => console.error('Audio play error:', err));
    setIsPlaying(true);

    // Stop at section end
    const duration = (question.endTime - question.startTime) * 1000;
    clipEndTimer.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }, duration);
  }, [stopAudio, ensureAudioContext]);

  // Start game
  const startGame = useCallback(() => {
    const newQuestions = generateQuestions(pieceConfig.sections);
    setQuestions(newQuestions);
    setCurrentQuestion(0);
    setGamePhase('guessing');
    setScoreChanges({});
    setCorrectCount(0);
    setRevealedSections([]);

    // Reset student answers and scores
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          sectionSpotterAnswer: null,
          sectionSpotterScore: 0
        }).catch(err => console.error(`Failed to reset student ${s.id}:`, err));
      });
    }

    updateGame({
      phase: 'guessing',
      currentQuestion: 0,
      totalQuestions: newQuestions.length,
      correctAnswer: null,
      playStartTime: Date.now(),
      pieceId: pieceId
    });

    // Play the first section
    setTimeout(() => playSection(newQuestions[0]), 300);
  }, [sessionCode, students, updateGame, playSection, pieceConfig, pieceId]);

  // Replay section
  const replaySection = useCallback(() => {
    const question = questions[currentQuestion];
    if (question) {
      playSection(question);
    }
  }, [questions, currentQuestion, playSection]);

  // Reveal answer
  const reveal = useCallback(() => {
    stopAudio();
    const question = questions[currentQuestion];
    if (!question) return;

    const changes = {};
    let correct = 0;

    students.forEach(s => {
      if (s.answer) {
        const isCorrect = s.answer === question.correctAnswer;
        if (isCorrect) {
          correct++;
          changes[s.id] = { isCorrect: true };
        } else {
          changes[s.id] = { isCorrect: false };
        }
      } else {
        changes[s.id] = { isCorrect: false, noAnswer: true };
      }
    });

    setScoreChanges(changes);
    setCorrectCount(correct);
    setGamePhase('revealed');

    // Add to revealed sections timeline
    setRevealedSections(prev => [...prev, {
      section: question.correctAnswer,
      label: question.label
    }]);

    updateGame({
      phase: 'revealed',
      correctAnswer: question.correctAnswer
    });
  }, [stopAudio, questions, currentQuestion, students, updateGame]);

  // Next question
  const nextQuestion = useCallback(() => {
    // Clear student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          sectionSpotterAnswer: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    const nextIdx = currentQuestion + 1;
    if (nextIdx >= questions.length) {
      setGamePhase('finished');
      updateGame({ phase: 'finished' });
    } else {
      setCurrentQuestion(nextIdx);
      setGamePhase('guessing');
      setScoreChanges({});
      setCorrectCount(0);

      updateGame({
        phase: 'guessing',
        currentQuestion: nextIdx,
        correctAnswer: null,
        playStartTime: Date.now()
      });

      // Play the next section
      setTimeout(() => playSection(questions[nextIdx]), 300);
    }
  }, [sessionCode, students, currentQuestion, questions, updateGame, playSection]);

  const question = questions[currentQuestion];
  const correctSection = question ? getSectionByLabel(question.correctAnswer, sectionOptions) : null;

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 text-white overflow-hidden">
      {/* Student Activity Banner */}
      <ActivityBanner />

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto" />

      {/* Main content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🔤</span>
            <h1 className="text-4xl font-bold">Section Spotter</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Section {currentQuestion + 1} / {questions.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Form Timeline - shows revealed sections */}
        {gamePhase !== 'setup' && (
          <div className="flex gap-1 mb-3 flex-shrink-0">
            {questions.map((q, idx) => {
              const revealed = idx < revealedSections.length;
              const isCurrent = idx === currentQuestion;
              const sectionInfo = revealed ? getSectionByLabel(revealedSections[idx].section, sectionOptions) : null;

              return (
                <div
                  key={q.id}
                  className={`flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-white scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: revealed ? sectionInfo?.color : 'rgba(255,255,255,0.1)',
                    opacity: revealed ? 1 : 0.4
                  }}
                >
                  {revealed ? sectionInfo?.label : '?'}
                </div>
              );
            })}
          </div>
        )}

        {/* Main content grid */}
        <div className={`grid ${gamePhase !== 'setup' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
          {/* Main area */}
          <div className={`${gamePhase !== 'setup' ? 'col-span-2' : ''} bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0`}>

            {/* Setup */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-9xl mb-6">🔤</div>
                <h2 className="text-5xl font-bold mb-4">Section Spotter</h2>
                <p className="text-2xl text-white/70 mb-4">Listen to {pieceTitle} and identify each section!</p>
                <div className="flex gap-4 justify-center mb-8">
                  {sectionOptions.map(s => (
                    <div
                      key={s.label}
                      className="px-6 py-3 rounded-xl text-center"
                      style={{ backgroundColor: s.color }}
                    >
                      <div className="text-3xl font-black">{s.label}</div>
                      <div className="text-sm opacity-90">{s.description}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={startGame}
                  className="px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={40} /> Start Game
                </button>
              </div>
            )}

            {/* Guessing */}
            {gamePhase === 'guessing' && question && (
              <div className="text-center">
                <div className="text-5xl font-black mb-2">
                  <Headphones size={48} className="inline mr-3" />
                  LISTEN!
                </div>
                <p className="text-2xl text-amber-200 mb-2">Section {currentQuestion + 1} — Which section is this?</p>
                <p className="text-lg text-white/60 mb-4">{question.label}</p>

                {/* Section options preview */}
                <div className={`grid ${sectionOptions.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-4 max-w-xl mx-auto mb-4`}>
                  {sectionOptions.map(s => (
                    <div
                      key={s.label}
                      className="p-4 rounded-xl text-center"
                      style={{ backgroundColor: `${s.color}40`, borderColor: s.color, borderWidth: '2px' }}
                    >
                      <div className="text-3xl mb-1">{s.emoji}</div>
                      <div className="text-3xl font-black text-white">{s.label}</div>
                      <div className="text-sm text-white/80">{s.description}</div>
                    </div>
                  ))}
                </div>

                {/* Answer count */}
                <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-4">
                  <span className="text-4xl font-black text-green-400">{lockedCount}</span>
                  <span className="text-xl text-white/70"> / {students.length} answered</span>
                </div>

                {/* Controls */}
                <div className="flex gap-4 justify-center">
                  {isPlaying ? (
                    <button
                      onClick={stopAudio}
                      className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:scale-105 transition-all"
                    >
                      <Pause size={24} /> Stop
                    </button>
                  ) : (
                    <button
                      onClick={replaySection}
                      className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
                    >
                      <Play size={24} /> Replay Section
                    </button>
                  )}
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
            {gamePhase === 'revealed' && question && correctSection && (
              <div className="text-center">
                <div className="text-3xl text-white/80 mb-4">This section is...</div>

                <div
                  className="rounded-3xl p-8 mb-6 max-w-md mx-auto"
                  style={{ backgroundColor: correctSection.color }}
                >
                  <div className="text-6xl mb-2">{correctSection.emoji}</div>
                  <div className="text-8xl font-black text-white mb-2">{correctSection.label}</div>
                  <div className="text-2xl text-white/90">{correctSection.description}</div>
                  <div className="text-lg text-white/70 mt-2">{question.description}</div>
                </div>

                <div className="text-xl text-white/70 mb-6">
                  {correctCount} of {students.length} students got it correct!
                </div>

                <button
                  onClick={nextQuestion}
                  className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                >
                  {currentQuestion >= questions.length - 1 ? (
                    <>Finish <Trophy size={28} /></>
                  ) : (
                    <>Next Section <ChevronRight size={28} /></>
                  )}
                </button>
              </div>
            )}

            {/* Finished */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <div className="text-9xl mb-6">🏆</div>
                <h2 className="text-5xl font-black mb-4">Game Complete!</h2>
                <p className="text-2xl text-white/70 mb-4">The form of {pieceTitle} is:</p>

                {/* Show full form */}
                <div className="flex gap-2 justify-center mb-8">
                  {revealedSections.map((s, idx) => {
                    const info = getSectionByLabel(s.section, sectionOptions);
                    return (
                      <div
                        key={idx}
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black"
                        style={{ backgroundColor: info?.color }}
                      >
                        {s.section}
                      </div>
                    );
                  })}
                </div>
                <p className="text-3xl font-bold text-amber-300 mb-8">{pieceForm}</p>

                <button
                  onClick={() => onComplete?.()}
                  className="px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Trophy size={28} />
                  See Results
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
                  const isRevealing = gamePhase === 'revealed';
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
                        {student.playerEmoji || student.name.charAt(0)}
                      </div>
                      <span className="flex-1 truncate text-lg font-medium">{student.name}</span>
                      {gamePhase === 'guessing' && student.answer && (
                        <span className="text-green-400 text-sm">✓</span>
                      )}
                      <span className="font-bold text-xl">
                        {student.score}
                      </span>
                      {isRevealing && change?.isCorrect && (
                        <span className="text-lg font-bold text-green-400">✓</span>
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

export default SectionSpotterTeacherGame;
