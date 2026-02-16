// File: SectionSpotterTeacherGame.jsx
// Section Spotter - Teacher Q&A Game (Class Game)
// 3 rounds (Section A, B, A') — each round: listen to section, then 3 questions
// Questions review dynamics, instruments, tempo from Lessons 1-3
//
// PHASES:
// 1. Setup - Show "Start Game"
// 2. Listening - Playing the section audio
// 3. Question - Show question, students answer on devices
// 4. Revealed - Show correct answer + explanation
// 5. Between-rounds - Show round summary, transition to next section
// 6. Finished - Final scores + ABA' summary

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Pause, Users, Trophy, Eye, ChevronRight, Headphones, StopCircle, Music } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import {
  MOUNTAIN_KING_SECTIONS,
  MOUNTAIN_KING_SECTION_OPTIONS,
  MOUNTAIN_KING_AUDIO_PATH,
  MOUNTAIN_KING_QUESTIONS,
  QA_SCORING,
  calculateQASpeedBonus,
  getSectionByLabel
} from './sectionSpotterConfig';

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

// ABA' Tracker — always visible at top
const FormTracker = ({ currentRound, totalRounds, roundLabels }) => (
  <div className="flex gap-2 mb-3 flex-shrink-0">
    {roundLabels.map((label, idx) => {
      const isComplete = idx < currentRound;
      const isCurrent = idx === currentRound;
      const sectionInfo = getSectionByLabel(label.section, MOUNTAIN_KING_SECTION_OPTIONS);
      return (
        <div
          key={idx}
          className={`flex-1 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
            isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-105' : ''
          }`}
          style={{
            backgroundColor: isComplete || isCurrent ? sectionInfo?.color || '#3B82F6' : 'rgba(255,255,255,0.1)',
            opacity: isComplete ? 0.6 : isCurrent ? 1 : 0.3
          }}
        >
          {label.label}
          {isComplete && ' \u2713'}
        </div>
      );
    })}
  </div>
);

const SectionSpotterTeacherGame = ({ sessionData, onComplete, pieceId = 'mountain-king' }) => {
  const sessionCode = sessionData?.sessionCode || new URLSearchParams(window.location.search).get('session');

  // Round labels for the ABA' tracker
  const roundLabels = useMemo(() => [
    { section: 'A', label: 'Section A' },
    { section: 'B', label: 'Section B' },
    { section: 'A', label: "Section A'" }
  ], []);

  // Game state
  const [gamePhase, setGamePhase] = useState('setup'); // setup, listening, question, revealed, between-rounds, finished
  const [currentRound, setCurrentRound] = useState(0); // 0, 1, 2
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0); // 0, 1, 2 within each round

  // Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const clipEndTimer = useRef(null);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // Reveal state
  const [correctCount, setCorrectCount] = useState(0);

  // Round scores for between-rounds summary
  const [roundCorrectCounts, setRoundCorrectCounts] = useState([0, 0, 0]);

  // Get current round's questions and section data
  const currentRoundQuestions = MOUNTAIN_KING_QUESTIONS[currentRound] || [];
  const currentQuestion = currentRoundQuestions[currentQuestionIdx] || null;
  const currentSection = MOUNTAIN_KING_SECTIONS[currentRound] || null;

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
        playerEmoji: s.playerEmoji || '\uD83C\uDFB5'
      }));

      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Play current section audio
  const playSection = useCallback(() => {
    if (!audioRef.current || !currentSection) return;

    stopAudio();

    const audio = audioRef.current;
    audio.currentTime = currentSection.startTime;
    audio.volume = 0.5;
    audio.play().catch(err => console.error('Audio play error:', err));
    setIsPlaying(true);

    // Auto-stop at section end
    const duration = (currentSection.endTime - currentSection.startTime) * 1000;
    clipEndTimer.current = setTimeout(() => {
      audio.pause();
      setIsPlaying(false);
    }, duration);
  }, [currentSection, stopAudio]);

  // Start game
  const startGame = useCallback(() => {
    setCurrentRound(0);
    setCurrentQuestionIdx(0);
    setGamePhase('listening');
    setCorrectCount(0);
    setRoundCorrectCounts([0, 0, 0]);

    // Reset student answers and scores
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          sectionSpotterAnswer: null,
          sectionSpotterScore: 0,
          sectionSpotterAnswerTime: null
        }).catch(err => console.error(`Failed to reset student ${s.id}:`, err));
      });
    }

    updateGame({
      phase: 'listening',
      currentRound: 0,
      currentQuestion: 0,
      questionData: null,
      revealedAnswer: null,
      questionStartTime: null,
      pieceId: pieceId
    });

    // Play section A after a short delay
    setTimeout(() => {
      if (audioRef.current) {
        const section = MOUNTAIN_KING_SECTIONS[0];
        audioRef.current.currentTime = section.startTime;
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(err => console.error('Audio play error:', err));
        setIsPlaying(true);

        const duration = (section.endTime - section.startTime) * 1000;
        clipEndTimer.current = setTimeout(() => {
          audioRef.current?.pause();
          setIsPlaying(false);
        }, duration);
      }
    }, 500);
  }, [sessionCode, students, updateGame, pieceId]);

  // Stop audio and move to questions
  const stopAndAsk = useCallback(() => {
    stopAudio();
    setCurrentQuestionIdx(0);
    setGamePhase('question');
    setCorrectCount(0);

    const q = MOUNTAIN_KING_QUESTIONS[currentRound]?.[0];
    if (!q) return;

    // Clear student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          sectionSpotterAnswer: null,
          sectionSpotterAnswerTime: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    // Send question data to Firebase (WITHOUT correctAnswer)
    updateGame({
      phase: 'question',
      currentRound,
      currentQuestion: 0,
      questionData: {
        id: q.id,
        category: q.category,
        categoryEmoji: q.categoryEmoji,
        categoryColor: q.categoryColor,
        question: q.question,
        options: q.options
      },
      revealedAnswer: null,
      questionStartTime: Date.now()
    });
  }, [stopAudio, currentRound, sessionCode, students, updateGame]);

  // Reveal answer
  const revealAnswer = useCallback(() => {
    if (!currentQuestion) return;

    let correct = 0;
    students.forEach(s => {
      if (s.answer === currentQuestion.correctAnswer) {
        correct++;
      }
    });
    setCorrectCount(correct);
    setGamePhase('revealed');

    // Update round correct counts
    setRoundCorrectCounts(prev => {
      const updated = [...prev];
      updated[currentRound] = updated[currentRound] + correct;
      return updated;
    });

    // Send revealed answer to Firebase — students will score themselves
    updateGame({
      phase: 'revealed',
      revealedAnswer: currentQuestion.correctAnswer,
      revealedLabel: currentQuestion.correctLabel,
      revealedExplanation: currentQuestion.explanation
    });
  }, [currentQuestion, students, currentRound, updateGame]);

  // Next question (within a round) or next round
  const nextStep = useCallback(() => {
    const nextQIdx = currentQuestionIdx + 1;

    // Clear student answers
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          sectionSpotterAnswer: null,
          sectionSpotterAnswerTime: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    if (nextQIdx < currentRoundQuestions.length) {
      // More questions in this round
      setCurrentQuestionIdx(nextQIdx);
      setGamePhase('question');
      setCorrectCount(0);

      const q = currentRoundQuestions[nextQIdx];
      updateGame({
        phase: 'question',
        currentQuestion: nextQIdx,
        questionData: {
          id: q.id,
          category: q.category,
          categoryEmoji: q.categoryEmoji,
          categoryColor: q.categoryColor,
          question: q.question,
          options: q.options
        },
        revealedAnswer: null,
        questionStartTime: Date.now()
      });
    } else {
      // Round is complete
      const nextRound = currentRound + 1;
      if (nextRound < MOUNTAIN_KING_QUESTIONS.length) {
        // Between rounds
        setGamePhase('between-rounds');
        updateGame({
          phase: 'between-rounds',
          questionData: null,
          revealedAnswer: null
        });
      } else {
        // Game finished
        setGamePhase('finished');
        updateGame({ phase: 'finished', questionData: null, revealedAnswer: null });
      }
    }
  }, [currentQuestionIdx, currentRoundQuestions, currentRound, sessionCode, students, updateGame]);

  // Start next round (from between-rounds)
  const startNextRound = useCallback(() => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setCurrentQuestionIdx(0);
    setGamePhase('listening');
    setCorrectCount(0);

    updateGame({
      phase: 'listening',
      currentRound: nextRound,
      currentQuestion: 0,
      questionData: null,
      revealedAnswer: null,
      questionStartTime: null
    });

    // Play the next section
    setTimeout(() => {
      if (audioRef.current) {
        const section = MOUNTAIN_KING_SECTIONS[nextRound];
        if (section) {
          audioRef.current.currentTime = section.startTime;
          audioRef.current.volume = 0.3;
          audioRef.current.play().catch(err => console.error('Audio play error:', err));
          setIsPlaying(true);

          const duration = (section.endTime - section.startTime) * 1000;
          clipEndTimer.current = setTimeout(() => {
            audioRef.current?.pause();
            setIsPlaying(false);
          }, duration);
        }
      }
    }, 500);
  }, [currentRound, updateGame]);

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 text-white overflow-hidden">
      {/* Student Activity Banner */}
      <ActivityBanner />

      {/* Hidden audio element */}
      <audio ref={audioRef} src={MOUNTAIN_KING_AUDIO_PATH} preload="auto" />

      {/* Main content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{'\uD83D\uDD0D'}</span>
            <h1 className="text-4xl font-bold">Section Spotter</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Round {currentRound + 1} / {MOUNTAIN_KING_QUESTIONS.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* ABA' Form Tracker */}
        {gamePhase !== 'setup' && (
          <FormTracker
            currentRound={currentRound}
            totalRounds={MOUNTAIN_KING_QUESTIONS.length}
            roundLabels={roundLabels}
          />
        )}

        {/* Main content grid */}
        <div className={`grid ${gamePhase !== 'setup' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
          {/* Main area */}
          <div className={`${gamePhase !== 'setup' ? 'col-span-2' : ''} bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0`}>

            {/* ============ SETUP ============ */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-9xl mb-6">{'\uD83D\uDD0D'}</div>
                <h2 className="text-5xl font-bold mb-4">Section Spotter</h2>
                <p className="text-2xl text-white/70 mb-2">In the Hall of the Mountain King</p>
                <p className="text-xl text-amber-300 mb-6">Listen to each section, then answer questions!</p>

                {/* ABA' preview */}
                <div className="flex gap-3 justify-center mb-8">
                  {roundLabels.map((label, idx) => {
                    const info = getSectionByLabel(label.section, MOUNTAIN_KING_SECTION_OPTIONS);
                    return (
                      <div
                        key={idx}
                        className="px-6 py-3 rounded-xl text-center"
                        style={{ backgroundColor: info?.color || '#3B82F6' }}
                      >
                        <div className="text-3xl font-black">{label.label}</div>
                        <div className="text-sm opacity-90">3 questions</div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-lg text-white/60 mb-6">9 questions total — Dynamics, Instruments & Tempo</div>

                <button
                  onClick={startGame}
                  className="px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={40} /> Start Game
                </button>
              </div>
            )}

            {/* ============ LISTENING ============ */}
            {gamePhase === 'listening' && currentSection && (
              <div className="text-center">
                <div className="text-6xl mb-4">{'\uD83C\uDFA7'}</div>
                <h2 className="text-5xl font-black mb-2">
                  {roundLabels[currentRound]?.label}
                </h2>
                <p className="text-2xl text-amber-200 mb-2">{currentSection.label}</p>
                <p className="text-lg text-white/60 mb-6">{currentSection.description}</p>

                {isPlaying && (
                  <div className="text-2xl text-green-400 animate-pulse mb-6">
                    <Music className="inline mr-2" size={28} />
                    Playing...
                  </div>
                )}

                {!isPlaying && (
                  <p className="text-xl text-white/50 mb-6">Audio finished</p>
                )}

                <div className="flex gap-4 justify-center">
                  {isPlaying ? (
                    <button
                      onClick={stopAudio}
                      className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:scale-105 transition-all"
                    >
                      <Pause size={24} /> Stop
                    </button>
                  ) : (
                    <button
                      onClick={playSection}
                      className="px-6 py-3 rounded-2xl text-xl font-bold flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
                    >
                      <Play size={24} /> Replay Section
                    </button>
                  )}
                  <button
                    onClick={stopAndAsk}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <StopCircle size={28} /> Ask Questions
                  </button>
                </div>

                <p className="text-sm text-white/40 mt-4">Students are watching the main screen</p>
              </div>
            )}

            {/* ============ QUESTION ============ */}
            {gamePhase === 'question' && currentQuestion && (
              <div className="text-center w-full max-w-2xl mx-auto">
                {/* Category badge */}
                <div
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xl font-bold mb-4"
                  style={{ backgroundColor: currentQuestion.categoryColor }}
                >
                  <span className="text-2xl">{currentQuestion.categoryEmoji}</span>
                  {currentQuestion.category}
                </div>

                {/* Question number within round */}
                <div className="text-sm text-white/50 mb-2">
                  {roundLabels[currentRound]?.label} — Question {currentQuestionIdx + 1} of {currentRoundQuestions.length}
                </div>

                {/* Question */}
                <h2 className="text-3xl font-black mb-6">{currentQuestion.question}</h2>

                {/* Answer options preview */}
                <div className={`grid ${currentQuestion.options.length <= 3 ? 'grid-cols-3' : currentQuestion.options.length <= 4 ? 'grid-cols-4' : 'grid-cols-5'} gap-3 mb-6`}>
                  {currentQuestion.options.map(opt => (
                    <div
                      key={opt.id}
                      className="p-4 rounded-xl text-center bg-white/10 border-2 border-white/20"
                    >
                      <div className="text-xl font-bold text-white">{opt.label}</div>
                    </div>
                  ))}
                </div>

                {/* Answer count */}
                <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-6">
                  <span className="text-4xl font-black text-green-400">{lockedCount}</span>
                  <span className="text-xl text-white/70"> / {students.length} answered</span>
                </div>

                {/* Reveal button */}
                <div className="flex justify-center">
                  <button
                    onClick={revealAnswer}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Eye size={28} /> Reveal Answer
                  </button>
                </div>
              </div>
            )}

            {/* ============ REVEALED ============ */}
            {gamePhase === 'revealed' && currentQuestion && (
              <div className="text-center w-full max-w-2xl mx-auto">
                {/* Category badge */}
                <div
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xl font-bold mb-3"
                  style={{ backgroundColor: currentQuestion.categoryColor }}
                >
                  <span className="text-2xl">{currentQuestion.categoryEmoji}</span>
                  {currentQuestion.category}
                </div>

                <p className="text-lg text-white/60 mb-2">{currentQuestion.question}</p>

                {/* Correct answer */}
                <div
                  className="rounded-3xl p-6 mb-4 max-w-md mx-auto"
                  style={{ backgroundColor: currentQuestion.categoryColor }}
                >
                  <div className="text-4xl font-black text-white mb-2">
                    {currentQuestion.correctLabel}
                  </div>
                  <div className="text-lg text-white/90">
                    {currentQuestion.explanation}
                  </div>
                </div>

                <div className="text-xl text-white/70 mb-6">
                  {correctCount} of {students.length} got it right!
                </div>

                {/* Next button */}
                <button
                  onClick={nextStep}
                  className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                >
                  {currentQuestionIdx < currentRoundQuestions.length - 1 ? (
                    <>Next Question <ChevronRight size={28} /></>
                  ) : currentRound < MOUNTAIN_KING_QUESTIONS.length - 1 ? (
                    <>Next Section <ChevronRight size={28} /></>
                  ) : (
                    <>Finish <Trophy size={28} /></>
                  )}
                </button>
              </div>
            )}

            {/* ============ BETWEEN ROUNDS ============ */}
            {gamePhase === 'between-rounds' && (
              <div className="text-center">
                <div className="text-6xl mb-4">{'\u2705'}</div>
                <h2 className="text-4xl font-black mb-2">
                  {roundLabels[currentRound]?.label} Complete!
                </h2>
                <p className="text-xl text-white/70 mb-6">
                  {roundCorrectCounts[currentRound]} correct answers across 3 questions
                </p>

                <div className="text-2xl text-amber-200 mb-6">
                  Up next: <strong>{roundLabels[currentRound + 1]?.label}</strong>
                </div>

                <p className="text-lg text-white/50 mb-6">
                  {currentRound === 0 && "How will Section B sound different from Section A?"}
                  {currentRound === 1 && "The A section returns \u2014 but will it sound the same?"}
                </p>

                <button
                  onClick={startNextRound}
                  className="px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Headphones size={36} /> Listen to {roundLabels[currentRound + 1]?.label}
                </button>
              </div>
            )}

            {/* ============ FINISHED ============ */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <div className="text-8xl mb-4">{'\uD83C\uDFC6'}</div>
                <h2 className="text-5xl font-black mb-4">Game Complete!</h2>

                <p className="text-2xl text-white/70 mb-4">The form of Mountain King is:</p>

                {/* ABA' summary */}
                <div className="flex gap-3 justify-center mb-6">
                  {roundLabels.map((label, idx) => {
                    const info = getSectionByLabel(label.section, MOUNTAIN_KING_SECTION_OPTIONS);
                    return (
                      <div
                        key={idx}
                        className="w-20 h-20 rounded-xl flex items-center justify-center text-center"
                        style={{ backgroundColor: info?.color || '#3B82F6' }}
                      >
                        <div>
                          <div className="text-3xl font-black">{label.section}</div>
                          <div className="text-xs opacity-80">{idx === 2 ? "(A')" : ''}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-3xl font-bold text-amber-300 mb-8">Ternary Form (ABA)</p>

                <button
                  onClick={() => onComplete?.()}
                  className="px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Trophy size={28} />
                  Continue
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
                {leaderboard.map((student, idx) => (
                  <div
                    key={student.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      idx === 0 ? 'bg-yellow-500/20' : 'bg-white/5'
                    }`}
                  >
                    <span className="w-8 text-center font-bold text-xl">
                      {idx === 0 ? '\uD83E\uDD47' : idx === 1 ? '\uD83E\uDD48' : idx === 2 ? '\uD83E\uDD49' : `#${idx + 1}`}
                    </span>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                      style={{ backgroundColor: student.playerColor }}
                    >
                      {student.playerEmoji || student.name.charAt(0)}
                    </div>
                    <span className="flex-1 truncate text-lg font-medium">{student.name}</span>
                    {gamePhase === 'question' && student.answer && (
                      <span className="text-green-400 text-sm">{'\u2713'}</span>
                    )}
                    <span className="font-bold text-xl">
                      {student.score}
                    </span>
                  </div>
                ))}
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
