// File: NameThatElementTeacherGame.jsx
// Name That Element - Teacher Presentation View (Class Game)
// Teacher plays a 10-second instrument clip, students identify the family
// 3 rounds of 4 questions = 12 total
//
// PHASES:
// 1. Setup - Show "Start Game"
// 2. Question - Audio plays, students answer on devices
// 3. Revealed - Show correct answer with explanation
// 4. Between-rounds - Round summary
// 5. Finished - Final leaderboard

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Users, Trophy, Eye, ChevronRight, CheckCircle, XCircle, Zap, Volume2 } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';

// ============================================================
// QUESTIONS DATA — each plays an instrument audio clip
// ============================================================
const QUESTIONS = [
  // Round 1 - Warm Up (one from each family, easier/more recognizable)
  {
    id: 'q1', round: 1,
    instrument: 'Trumpet',
    family: 'brass',
    audioPath: '/audio/orchestra-samples/brass/trumpet.mp3',
    explanation: 'The trumpet is a brass instrument — bright, loud, and played with valves!'
  },
  {
    id: 'q2', round: 1,
    instrument: 'Violin',
    family: 'strings',
    audioPath: '/audio/orchestra-samples/strings/violin.mp3',
    explanation: 'The violin is a string instrument — highest pitched in the string family!'
  },
  {
    id: 'q3', round: 1,
    instrument: 'Flute',
    family: 'woodwinds',
    audioPath: '/audio/orchestra-samples/woodwinds/flute.mp3',
    explanation: 'The flute is a woodwind — even though it\'s metal, it uses air across an edge!'
  },
  {
    id: 'q4', round: 1,
    instrument: 'Snare Drum',
    family: 'percussion',
    audioPath: '/audio/orchestra-samples/percussion/snare-drum.mp3',
    explanation: 'The snare drum is percussion — you strike it to make sound!'
  },
  // Round 2 - Think About It (less obvious instruments)
  {
    id: 'q5', round: 2,
    instrument: 'Cello',
    family: 'strings',
    audioPath: '/audio/orchestra-samples/strings/cello.mp3',
    explanation: 'The cello is a string instrument — warm, rich tone, played sitting down!'
  },
  {
    id: 'q6', round: 2,
    instrument: 'Bassoon',
    family: 'woodwinds',
    audioPath: '/audio/orchestra-samples/woodwinds/bassoon.mp3',
    explanation: 'The bassoon is a woodwind — deep and buzzy, uses a double reed!'
  },
  {
    id: 'q7', round: 2,
    instrument: 'Tuba',
    family: 'brass',
    audioPath: '/audio/orchestra-samples/brass/tuba.mp3',
    explanation: 'The tuba is brass — the lowest and largest brass instrument!'
  },
  {
    id: 'q8', round: 2,
    instrument: 'Xylophone',
    family: 'percussion',
    audioPath: '/audio/orchestra-samples/percussion/xylophone.mp3',
    explanation: 'The xylophone is percussion — you strike wooden bars with mallets!'
  },
  // Round 3 - Expert Challenge (trickier to distinguish)
  {
    id: 'q9', round: 3,
    instrument: 'French Horn',
    family: 'brass',
    audioPath: '/audio/orchestra-samples/brass/french-horn.mp3',
    explanation: 'The French horn is brass — warm and mellow, with a huge coiled tube!'
  },
  {
    id: 'q10', round: 3,
    instrument: 'Oboe',
    family: 'woodwinds',
    audioPath: '/audio/orchestra-samples/woodwinds/oboe.mp3',
    explanation: 'The oboe is a woodwind — nasal tone, uses a double reed, tunes the orchestra!'
  },
  {
    id: 'q11', round: 3,
    instrument: 'Viola',
    family: 'strings',
    audioPath: '/audio/orchestra-samples/strings/viola.mp3',
    explanation: 'The viola is a string instrument — slightly larger and deeper than the violin!'
  },
  {
    id: 'q12', round: 3,
    instrument: 'Timpani',
    family: 'percussion',
    audioPath: '/audio/orchestra-samples/percussion/timpani.mp3',
    explanation: 'Timpani are percussion — large copper drums that can play different pitches!'
  }
];

const ROUND_NAMES = {
  1: 'Warm Up',
  2: 'Think About It',
  3: 'Expert Challenge'
};

// Category definitions
const CATEGORIES = {
  strings:    { label: 'Strings',    color: '#3B82F6', emoji: '🎻', bgClass: 'from-blue-600 to-blue-700' },
  woodwinds:  { label: 'Woodwinds',  color: '#10B981', emoji: '🎵', bgClass: 'from-emerald-600 to-emerald-700' },
  brass:      { label: 'Brass',      color: '#F59E0B', emoji: '🎺', bgClass: 'from-amber-600 to-amber-700' },
  percussion: { label: 'Percussion', color: '#EF4444', emoji: '🥁', bgClass: 'from-red-600 to-red-700' }
};

// Scoring
const SCORING = {
  CORRECT: 100,
  SPEED_BONUS_MAX: 50,
  SPEED_BONUS_WINDOW: 5000
};

const calculateSpeedBonus = (answerTime, startedAt) => {
  if (!answerTime || !startedAt) return 0;
  const elapsed = answerTime - startedAt;
  if (elapsed <= 0 || elapsed > SCORING.SPEED_BONUS_WINDOW) return 0;
  const ratio = 1 - (elapsed / SCORING.SPEED_BONUS_WINDOW);
  return Math.round(SCORING.SPEED_BONUS_MAX * ratio);
};

// Student Activity Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#059669', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const NameThatElementTeacherGame = ({ sessionData, onComplete }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Audio
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // Reveal state
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreChanges, setScoreChanges] = useState({});

  // Round stats
  const [roundCorrectTotal, setRoundCorrectTotal] = useState(0);
  const [roundQuestionCount, setRoundQuestionCount] = useState(0);

  // Get current question
  const roundQuestions = QUESTIONS.filter(q => q.round === currentRound);
  const currentQuestion = roundQuestions[currentQuestionIndex] || null;

  // Live answer counts per category
  const [answerCounts, setAnswerCounts] = useState({ strings: 0, woodwinds: 0, brass: 0, percussion: 0 });

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play/pause audio clip
  const playAudio = useCallback(() => {
    if (!currentQuestion) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(currentQuestion.audioPath);
    audio.volume = 0.8;
    audioRef.current = audio;
    setIsAudioPlaying(true);
    audio.play().catch(() => {});
    audio.onended = () => setIsAudioPlaying(false);
    audio.onpause = () => setIsAudioPlaying(false);
  }, [currentQuestion]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  }, []);

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/nameThatElement`), data);
  }, [sessionCode]);

  // Firebase: Subscribe to students
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([, s]) => s.playerName || s.displayName)
        .map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName,
        score: s.nteScore || 0,
        answer: s.nteAnswer,
        answerTime: s.nteAnswerTime,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '🎵'
      }));

      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));

      // Count answers per category
      const counts = { strings: 0, woodwinds: 0, brass: 0, percussion: 0 };
      list.forEach(s => {
        if (s.answer && Object.prototype.hasOwnProperty.call(counts, s.answer)) {
          counts[s.answer]++;
        }
      });
      setAnswerCounts(counts);
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Start game
  const startGame = useCallback(() => {
    setCurrentRound(1);
    setCurrentQuestionIndex(0);
    setGamePhase('question');
    setScoreChanges({});
    setCorrectCount(0);
    setRoundCorrectTotal(0);
    setRoundQuestionCount(0);

    const now = Date.now();
    setQuestionStartTime(now);

    // Reset student answers and scores
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          nteAnswer: null,
          nteAnswerTime: null,
          nteScore: 0
        }).catch(err => console.error(`Failed to reset student ${s.id}:`, err));
      });
    }

    const firstQuestion = QUESTIONS.filter(q => q.round === 1)[0];
    updateGame({
      phase: 'question',
      currentRound: 1,
      currentQuestion: 0,
      questionData: { instrument: firstQuestion.instrument, family: firstQuestion.family, id: firstQuestion.id },
      revealedAnswer: null,
      startedAt: now
    });
  }, [sessionCode, students, updateGame]);

  // Reveal answer
  const reveal = useCallback(() => {
    if (!currentQuestion) return;
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsAudioPlaying(false);
    }

    const changes = {};
    let correct = 0;

    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        if (s.answer) {
          const isCorrect = s.answer === currentQuestion.family;
          if (isCorrect) {
            correct++;
            const speedBonus = calculateSpeedBonus(s.answerTime, questionStartTime);
            const points = SCORING.CORRECT + speedBonus;
            const newScore = (s.score || 0) + points;
            changes[s.id] = { isCorrect: true, points, speedBonus };
            update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
              nteScore: newScore
            }).catch(err => console.error(`Failed to update score for ${s.id}:`, err));
          } else {
            changes[s.id] = { isCorrect: false, points: 0 };
          }
        } else {
          changes[s.id] = { isCorrect: false, noAnswer: true, points: 0 };
        }
      });
    }

    setScoreChanges(changes);
    setCorrectCount(correct);
    setRoundCorrectTotal(prev => prev + correct);
    setRoundQuestionCount(prev => prev + 1);
    setGamePhase('revealed');

    updateGame({
      phase: 'revealed',
      revealedAnswer: currentQuestion.family
    });
  }, [currentQuestion, students, sessionCode, questionStartTime, updateGame]);

  // Next question
  const nextQuestion = useCallback(() => {
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          nteAnswer: null,
          nteAnswerTime: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx >= 4) {
      if (currentRound >= 3) {
        setGamePhase('finished');
        updateGame({ phase: 'finished', revealedAnswer: null });
      } else {
        setGamePhase('between-rounds');
        updateGame({ phase: 'between-rounds', revealedAnswer: null });
      }
    } else {
      const now = Date.now();
      setCurrentQuestionIndex(nextIdx);
      setGamePhase('question');
      setScoreChanges({});
      setCorrectCount(0);
      setQuestionStartTime(now);

      const nextQ = roundQuestions[nextIdx];
      updateGame({
        phase: 'question',
        currentQuestion: nextIdx,
        questionData: { instrument: nextQ.instrument, family: nextQ.family, id: nextQ.id },
        revealedAnswer: null,
        startedAt: now
      });
    }
  }, [sessionCode, students, currentQuestionIndex, currentRound, roundQuestions, updateGame]);

  // Start next round
  const startNextRound = useCallback(() => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setCurrentQuestionIndex(0);
    setGamePhase('question');
    setScoreChanges({});
    setCorrectCount(0);
    setRoundCorrectTotal(0);
    setRoundQuestionCount(0);

    const now = Date.now();
    setQuestionStartTime(now);

    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          nteAnswer: null,
          nteAnswerTime: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    const nextRoundQuestions = QUESTIONS.filter(q => q.round === nextRound);
    const firstQ = nextRoundQuestions[0];
    updateGame({
      phase: 'question',
      currentRound: nextRound,
      currentQuestion: 0,
      questionData: { instrument: firstQ.instrument, family: firstQ.family, id: firstQ.id },
      revealedAnswer: null,
      startedAt: now
    });
  }, [currentRound, sessionCode, students, updateGame]);

  const correctCategory = currentQuestion ? CATEGORIES[currentQuestion.family] : null;

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 text-white overflow-hidden">
      {/* Student Activity Banner */}
      <ActivityBanner />

      {/* Main content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎯</span>
            <h1 className="text-4xl font-bold">Name That Instrument</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Round {currentRound} &middot; Q{currentQuestionIndex + 1}/4
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Round progress bar */}
        {gamePhase !== 'setup' && gamePhase !== 'finished' && (
          <div className="flex gap-1 mb-3 flex-shrink-0">
            {Array.from({ length: 12 }, (_, idx) => {
              const qRound = Math.floor(idx / 4) + 1;
              const qIdx = idx % 4;
              const isComplete = qRound < currentRound || (qRound === currentRound && qIdx < currentQuestionIndex) || (qRound === currentRound && qIdx === currentQuestionIndex && (gamePhase === 'revealed' || gamePhase === 'between-rounds'));
              const isCurrent = qRound === currentRound && qIdx === currentQuestionIndex && gamePhase === 'question';
              const q = QUESTIONS[idx];
              const catColor = isComplete ? CATEGORIES[q.family].color : 'rgba(255,255,255,0.1)';

              return (
                <div
                  key={idx}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-white scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: catColor,
                    opacity: isComplete ? 1 : isCurrent ? 0.7 : 0.3
                  }}
                >
                  {isComplete ? '✓' : idx + 1}
                </div>
              );
            })}
          </div>
        )}

        {/* Main content grid */}
        <div className={`grid ${gamePhase !== 'setup' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
          {/* Main area */}
          <div className={`${gamePhase !== 'setup' ? 'col-span-2' : ''} bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0`}>

            {/* ==================== SETUP ==================== */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-7xl mb-3">🎯</div>
                <h2 className="text-4xl font-bold mb-2">Name That Instrument</h2>
                <p className="text-xl text-white/70 mb-4">Listen to the clip — which family does it belong to?</p>

                {/* Category preview */}
                <div className="flex gap-4 justify-center mb-4">
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <div
                      key={key}
                      className="px-6 py-3 rounded-2xl text-center"
                      style={{ backgroundColor: cat.color }}
                    >
                      <div className="text-3xl mb-1">{cat.emoji}</div>
                      <div className="text-xl font-black">{cat.label}</div>
                    </div>
                  ))}
                </div>

                <p className="text-lg text-white/50 mb-5">3 rounds &middot; 4 questions each &middot; Speed bonus for fast answers!</p>

                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={32} /> Start Game
                </button>
              </div>
            )}

            {/* ==================== QUESTION ==================== */}
            {gamePhase === 'question' && currentQuestion && (
              <div className="text-center w-full">
                <div className="text-lg text-white/50 mb-2 uppercase tracking-widest">
                  Round {currentRound}: {ROUND_NAMES[currentRound]}
                </div>

                {/* Audio player — large play button */}
                <div className="bg-white/10 rounded-3xl p-8 mb-6 max-w-2xl mx-auto border-2 border-white/20">
                  <div className="text-white/50 text-xl mb-4 uppercase tracking-wider font-bold">Listen carefully...</div>
                  <button
                    onClick={isAudioPlaying ? pauseAudio : playAudio}
                    className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all hover:scale-105 ${
                      isAudioPlaying
                        ? 'bg-gradient-to-br from-orange-500 to-red-500 animate-pulse shadow-lg shadow-orange-500/30'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                    }`}
                  >
                    {isAudioPlaying ? (
                      <Pause size={56} className="text-white" />
                    ) : (
                      <Volume2 size={56} className="text-white" />
                    )}
                  </button>
                  <div className="text-white/40 text-sm mt-3">
                    {isAudioPlaying ? 'Playing...' : 'Tap to play'}
                  </div>
                </div>

                <p className="text-2xl text-teal-200 mb-6">Which instrument family is this?</p>

                {/* Category buttons with live vote counts */}
                <div className="grid grid-cols-4 gap-3 max-w-3xl mx-auto mb-6">
                  {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const count = answerCounts[key] || 0;
                    return (
                      <div
                        key={key}
                        className="rounded-2xl p-4 text-center transition-all"
                        style={{
                          backgroundColor: `${cat.color}30`,
                          borderColor: cat.color,
                          borderWidth: '3px'
                        }}
                      >
                        <div className="text-3xl mb-1">{cat.emoji}</div>
                        <div className="text-lg font-black text-white">{cat.label}</div>
                        <div className="mt-2 bg-black/30 rounded-xl px-3 py-1 inline-block">
                          <span className="text-2xl font-bold" style={{ color: cat.color }}>{count}</span>
                          <span className="text-sm text-white/60 ml-1">votes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Answer count */}
                <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-4">
                  <span className="text-4xl font-black text-green-400">{lockedCount}</span>
                  <span className="text-xl text-white/70"> / {students.length} answered</span>
                </div>

                {/* Reveal button */}
                <div className="flex justify-center">
                  <button
                    onClick={reveal}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Eye size={28} /> Reveal Answer
                  </button>
                </div>
              </div>
            )}

            {/* ==================== REVEALED ==================== */}
            {gamePhase === 'revealed' && currentQuestion && correctCategory && (
              <div className="text-center">
                <div className="text-3xl text-white/80 mb-4">The answer is...</div>

                {/* Correct answer card */}
                <div
                  className="rounded-3xl p-8 mb-4 max-w-md mx-auto"
                  style={{ backgroundColor: correctCategory.color }}
                >
                  <div className="text-6xl mb-2">{correctCategory.emoji}</div>
                  <div className="text-5xl font-black text-white mb-1">{currentQuestion.instrument}</div>
                  <div className="text-3xl font-bold text-white/80 mb-2">{correctCategory.label}</div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={24} className="text-white/90" />
                    <div className="text-lg text-white/90">{currentQuestion.explanation}</div>
                  </div>
                </div>

                {/* Vote breakdown */}
                <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto mb-4">
                  {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const count = answerCounts[key] || 0;
                    const isCorrect = key === currentQuestion.family;
                    return (
                      <div
                        key={key}
                        className={`rounded-xl p-3 text-center relative ${
                          isCorrect ? 'ring-4 ring-green-400' : 'opacity-50'
                        }`}
                        style={{ backgroundColor: `${cat.color}40` }}
                      >
                        {isCorrect && (
                          <CheckCircle size={24} className="text-green-400 absolute -top-2 -right-2" />
                        )}
                        <div className="text-lg font-bold">{cat.label}</div>
                        <div className="text-2xl font-black">{count}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xl text-white/70 mb-6">
                  {correctCount} of {students.length} got it correct!
                  {correctCount > 0 && students.length > 0 && (
                    <span className="ml-2 text-green-400">
                      ({Math.round((correctCount / students.length) * 100)}%)
                    </span>
                  )}
                </div>

                <button
                  onClick={nextQuestion}
                  className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                >
                  {currentQuestionIndex >= 3 ? (
                    currentRound >= 3 ? (
                      <><Trophy size={28} /> See Final Results</>
                    ) : (
                      <>Round {currentRound} Complete <ChevronRight size={28} /></>
                    )
                  ) : (
                    <>Next Question <ChevronRight size={28} /></>
                  )}
                </button>
              </div>
            )}

            {/* ==================== BETWEEN ROUNDS ==================== */}
            {gamePhase === 'between-rounds' && (
              <div className="text-center">
                <div className="text-8xl mb-4">⭐</div>
                <h2 className="text-5xl font-black mb-2">Round {currentRound} Complete!</h2>
                <p className="text-2xl text-white/60 mb-2">{ROUND_NAMES[currentRound]}</p>

                <div className="bg-white/10 rounded-2xl p-6 max-w-md mx-auto mb-6">
                  <div className="text-lg text-white/60 mb-1">Class Accuracy</div>
                  <div className="text-5xl font-black text-green-400">
                    {roundQuestionCount > 0 ? Math.round((roundCorrectTotal / (roundQuestionCount * students.length)) * 100) : 0}%
                  </div>
                  <div className="text-lg text-white/50 mt-1">
                    {roundCorrectTotal} correct answers across {roundQuestionCount} questions
                  </div>
                </div>

                <div className="text-xl text-white/70 mb-6">
                  Up next: <span className="font-bold text-teal-300">Round {currentRound + 1} — {ROUND_NAMES[currentRound + 1]}</span>
                </div>

                <button
                  onClick={startNextRound}
                  className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Zap size={32} /> Start Round {currentRound + 1}
                </button>
              </div>
            )}

            {/* ==================== FINISHED ==================== */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <div className="text-9xl mb-4">🏆</div>
                <h2 className="text-5xl font-black mb-4">Game Complete!</h2>
                <p className="text-2xl text-white/70 mb-6">Great job everyone!</p>

                {leaderboard.length > 0 && (
                  <div className="max-w-lg mx-auto mb-8">
                    {leaderboard.slice(0, 5).map((student, idx) => (
                      <div
                        key={student.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl mb-2 ${
                          idx === 0 ? 'bg-yellow-500/30 ring-2 ring-yellow-400' :
                          idx === 1 ? 'bg-gray-300/20' :
                          idx === 2 ? 'bg-amber-700/20' :
                          'bg-white/5'
                        }`}
                      >
                        <span className="w-12 text-center font-bold text-3xl">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </span>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                          style={{ backgroundColor: student.playerColor }}
                        >
                          {student.playerEmoji || student.name.charAt(0)}
                        </div>
                        <span className="flex-1 text-2xl font-medium text-left truncate">{student.name}</span>
                        <span className="text-3xl font-black">{student.score}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => onComplete?.()}
                  className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Trophy size={28} />
                  Continue
                </button>
              </div>
            )}

          </div>

          {/* ==================== LEADERBOARD SIDEBAR ==================== */}
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
                      {gamePhase === 'question' && student.answer && (
                        <span className="text-green-400 text-sm">✓</span>
                      )}
                      <span className="font-bold text-xl">
                        {student.score}
                      </span>
                      {isRevealing && change?.isCorrect && (
                        <span className="text-sm font-bold text-green-400">
                          +{change.points}
                        </span>
                      )}
                      {isRevealing && change && !change.isCorrect && !change.noAnswer && (
                        <XCircle size={18} className="text-red-400/60" />
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

export default NameThatElementTeacherGame;
