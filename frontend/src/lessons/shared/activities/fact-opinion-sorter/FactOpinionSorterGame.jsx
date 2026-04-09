// File: FactOpinionSorterGame.jsx
// Fact or Opinion Sorter - Teacher Presentation View (Music Journalist Unit 3)
// Teacher shows 10 statements about music one at a time.
// Students vote FACT or OPINION on their devices. Teacher reveals the answer.
//
// PHASES:
// 1. Setup - Show "Start Game" with student count
// 2. Showing - Display statement, live vote counts
// 3. Voting - Students voting (same as showing, but semantically distinct)
// 4. Revealed - Show correct answer with explanation and vote breakdown
// 5. Finished - Final leaderboard

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Users, Eye, ChevronRight, CheckCircle, XCircle, Trophy, Award, Medal } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { formatFirstNameLastInitial } from '../layer-detective/nameGenerator';

// ============================================================
// STATEMENTS DATA — 12 statements across 3 question types
// Each has: questionType, options (labels + colors), answer, explanation
// ============================================================
const QUESTION_TYPES = {
  'fact-opinion': {
    label: 'Fact or Opinion?',
    options: [
      { value: 'fact', label: 'FACT', color: '#3B82F6' },
      { value: 'opinion', label: 'OPINION', color: '#8B5CF6' },
    ],
  },
  'strong-weak': {
    label: 'Strong or Weak Evidence?',
    options: [
      { value: 'strong', label: 'STRONG', color: '#059669' },
      { value: 'weak', label: 'WEAK', color: '#DC2626' },
    ],
  },
  'which-point': {
    label: 'Which of the 4 Points?',
    options: [
      { value: 'unique-sound', label: 'Unique Sound', color: '#F59E0B' },
      { value: 'compelling-story', label: 'Compelling Story', color: '#3B82F6' },
      { value: 'signs-of-growth', label: 'Signs of Growth', color: '#10B981' },
      { value: 'gut-feeling', label: 'Gut Feeling', color: '#8B5CF6' },
    ],
  },
};

const STATEMENTS = [
  // --- Fact or Opinion (4 questions) ---
  {
    id: 's1', questionType: 'fact-opinion',
    text: "This artist has released 3 EPs in the last two years.",
    answer: 'fact',
    explanation: "This is a FACT — specific number of releases + specific timeframe. You could look this up."
  },
  {
    id: 's2', questionType: 'fact-opinion',
    text: "This artist is going to be huge someday.",
    answer: 'opinion',
    explanation: "This is an OPINION — predicting the future is a personal belief, not a provable fact."
  },
  {
    id: 's3', questionType: 'fact-opinion',
    text: "Their song has 47,000 streams on Bandcamp.",
    answer: 'fact',
    explanation: "This is a FACT — a specific number from a named source. Verifiable."
  },
  {
    id: 's4', questionType: 'fact-opinion',
    text: "This artist makes the most emotional music I've ever heard.",
    answer: 'opinion',
    explanation: "This is an OPINION — 'most emotional' is a personal judgment. Someone else might feel differently."
  },
  // --- Strong or Weak Evidence (4 questions) ---
  {
    id: 's5', questionType: 'strong-weak',
    text: "Their sound is really unique.",
    answer: 'weak',
    explanation: "WEAK — 'really unique' is vague. HOW is it unique? What specifically makes it different?"
  },
  {
    id: 's6', questionType: 'strong-weak',
    text: "They released their first album at 16 and have toured in 4 states.",
    answer: 'strong',
    explanation: "STRONG — specific age, specific number of states. Concrete details you could verify."
  },
  {
    id: 's7', questionType: 'strong-weak',
    text: "Something about their vibe just feels different.",
    answer: 'weak',
    explanation: "WEAK — 'something' and 'feels different' are vague. What specifically feels different?"
  },
  {
    id: 's8', questionType: 'strong-weak',
    text: "Their fanbase grew from 200 to 2,000 followers in six months.",
    answer: 'strong',
    explanation: "STRONG — specific numbers + specific timeframe = measurable growth."
  },
  // --- Which of the 4 Points (4 questions) ---
  {
    id: 's9', questionType: 'which-point',
    text: "They went from playing coffee shops to selling out a 300-seat venue.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — going from small to bigger venues shows momentum and increasing audience."
  },
  {
    id: 's10', questionType: 'which-point',
    text: "No other artist in our library sounds quite like this.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — if nobody else sounds like them, that's what makes their sound stand out."
  },
  {
    id: 's11', questionType: 'which-point',
    text: "They started writing music after losing a family member.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — a personal experience that drives their music makes you care about the artist."
  },
  {
    id: 's12', questionType: 'which-point',
    text: "I don't know why, but I keep replaying this track.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — you can't explain it, but something about them pulls you back. That's instinct."
  },
];

// Student Activity Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#16a34a', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const FactOpinionSorterGame = ({ sessionData, onComplete }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [currentStatementIndex, setCurrentStatementIndex] = useState(0);

  // Students
  const [students, setStudents] = useState([]);
  const [votedCount, setVotedCount] = useState(0);

  // Vote counts (dynamic — keyed by answer value)
  const [voteCounts, setVoteCounts] = useState({});

  // Scores (accumulated across all statements)
  const [scores, setScores] = useState({});

  // Statement show timestamp (for speed bonus)
  const statementShownAt = useRef(null);

  const currentStatement = STATEMENTS[currentStatementIndex] || null;

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/factOpinionSorter`), data);
  }, [sessionCode]);

  // Firebase: Subscribe to students
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([, s]) => s.displayName || s.playerName || s.name)
        .map(([id, s]) => ({
          id,
          name: formatFirstNameLastInitial(s.displayName || s.playerName || s.name),
          answer: s.factOpinionAnswer,
          score: s.factOpinionScore || 0,
          answerTime: s.factOpinionAnswerTime || null,
        }));

      setStudents(list);
      setVotedCount(list.filter(s => s.answer).length);

      // Count votes per option (dynamic based on question type)
      const counts = {};
      list.forEach(s => {
        if (s.answer) {
          counts[s.answer] = (counts[s.answer] || 0) + 1;
        }
      });
      setVoteCounts(counts);

      // Track scores
      const scoreMap = {};
      list.forEach(s => {
        scoreMap[s.id] = { name: s.name, score: s.score };
      });
      setScores(scoreMap);
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Start game
  const startGame = useCallback(() => {
    setCurrentStatementIndex(0);
    setGamePhase('showing');
    statementShownAt.current = Date.now();

    // Reset student answers and scores
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          factOpinionAnswer: null,
          factOpinionScore: 0,
          factOpinionAnswerTime: null,
        }).catch(() => {});
      });
    }

    const firstStatement = STATEMENTS[0];
    const qType = QUESTION_TYPES[firstStatement.questionType];
    updateGame({
      phase: 'showing',
      currentStatement: 0,
      statementData: {
        text: firstStatement.text,
        id: firstStatement.id,
        questionType: firstStatement.questionType,
        questionLabel: qType.label,
        options: qType.options,
      },
      revealedAnswer: null,
      shownAt: Date.now(),
    });
  }, [sessionCode, students, updateGame]);

  // Reveal answer
  const reveal = useCallback(() => {
    if (!currentStatement) return;

    setGamePhase('revealed');

    // Calculate scores for each student
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        if (s.answer) {
          const isCorrect = s.answer === currentStatement.answer;
          let points = 0;
          if (isCorrect) {
            points = 10;
            // Speed bonus: up to +5 if answered within 5 seconds
            if (s.answerTime && statementShownAt.current) {
              const elapsed = (s.answerTime - statementShownAt.current) / 1000;
              if (elapsed <= 5) {
                points += Math.round(5 * (1 - elapsed / 5));
              }
            }
          }
          const newScore = (s.score || 0) + points;
          update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
            factOpinionScore: newScore,
          }).catch(() => {});
        }
      });
    }

    updateGame({
      phase: 'revealed',
      revealedAnswer: currentStatement.answer,
    });
  }, [currentStatement, students, sessionCode, updateGame]);

  // Next statement
  const nextStatement = useCallback(() => {
    // Clear student answers (but keep scores)
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          factOpinionAnswer: null,
          factOpinionAnswerTime: null,
        }).catch(() => {});
      });
    }

    const nextIdx = currentStatementIndex + 1;

    if (nextIdx >= STATEMENTS.length) {
      setGamePhase('finished');
      updateGame({ phase: 'finished', revealedAnswer: null });
    } else {
      setCurrentStatementIndex(nextIdx);
      setGamePhase('showing');
      statementShownAt.current = Date.now();

      const nextSt = STATEMENTS[nextIdx];
      const qType = QUESTION_TYPES[nextSt.questionType];
      updateGame({
        phase: 'showing',
        currentStatement: nextIdx,
        statementData: {
          text: nextSt.text,
          id: nextSt.id,
          questionType: nextSt.questionType,
          questionLabel: qType.label,
          options: qType.options,
        },
        revealedAnswer: null,
        shownAt: Date.now(),
      });
    }
  }, [sessionCode, students, currentStatementIndex, updateGame]);

  // Build sorted leaderboard
  const leaderboard = Object.entries(scores)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.score - a.score);

  const totalVoters = Object.values(voteCounts).reduce((a, b) => a + b, 0);
  const currentQType = currentStatement ? QUESTION_TYPES[currentStatement.questionType] : null;
  const currentOptions = currentQType?.options || [];

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
      <ActivityBanner />

      <div className="flex-1 p-4 lg:p-6 2xl:p-8 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 lg:mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-3xl lg:text-4xl 2xl:text-5xl">{'\u2696\uFE0F'}</span>
            <h1 className="text-2xl lg:text-3xl 2xl:text-4xl font-bold">Fact or Opinion?</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl lg:text-2xl 2xl:text-3xl">
                {currentStatementIndex + 1}/{STATEMENTS.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl lg:text-3xl 2xl:text-4xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        {gamePhase !== 'setup' && gamePhase !== 'finished' && (
          <div className="flex gap-1 mb-3 lg:mb-4 flex-shrink-0">
            {STATEMENTS.map((s, idx) => {
              const isComplete = idx < currentStatementIndex || (idx === currentStatementIndex && gamePhase === 'revealed');
              const isCurrent = idx === currentStatementIndex && gamePhase === 'showing';
              return (
                <div
                  key={s.id}
                  className={`flex-1 h-8 lg:h-10 2xl:h-12 rounded-lg flex items-center justify-center text-xs lg:text-sm 2xl:text-base font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-white scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: isComplete
                      ? (QUESTION_TYPES[s.questionType]?.options.find(o => o.value === s.answer)?.color || '#3B82F6')
                      : 'rgba(255,255,255,0.1)',
                    opacity: isComplete ? 1 : isCurrent ? 0.7 : 0.3
                  }}
                >
                  {isComplete ? '\u2713' : idx + 1}
                </div>
              );
            })}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-h-0">
          <div className="bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0 h-full">

            {/* ==================== SETUP ==================== */}
            {gamePhase === 'setup' && (
              <div className="text-center max-w-5xl mx-auto px-8">
                <div className="text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl mb-4 lg:mb-6">{'\u2696\uFE0F'}</div>
                <h2 className="text-3xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 lg:mb-6">Fact or Opinion?</h2>
                <p className="text-lg lg:text-2xl xl:text-3xl 2xl:text-4xl text-white/80 mb-4 lg:mb-6 2xl:mb-8 leading-relaxed">As a music agent, you can&rsquo;t just say &ldquo;this artist is good.&rdquo; You need to back it up with <strong className="text-amber-400">real evidence</strong> — facts, numbers, and specifics that prove your artist is worth signing.</p>
                <p className="text-base lg:text-xl xl:text-2xl 2xl:text-3xl text-white/60 mb-4 lg:mb-6">Can you tell the difference between a strong fact and a vague opinion?</p>
                <div className="flex flex-wrap justify-center gap-3 lg:gap-4 2xl:gap-5 mb-4 lg:mb-6 2xl:mb-8 mt-4">
                  <span className="px-4 py-2 lg:px-5 lg:py-2.5 2xl:px-6 2xl:py-3 rounded-full text-sm lg:text-lg xl:text-xl 2xl:text-2xl font-medium bg-blue-500/20 text-blue-300">Fact or Opinion</span>
                  <span className="px-4 py-2 lg:px-5 lg:py-2.5 2xl:px-6 2xl:py-3 rounded-full text-sm lg:text-lg xl:text-xl 2xl:text-2xl font-medium bg-emerald-500/20 text-emerald-300">Strong or Weak</span>
                  <span className="px-4 py-2 lg:px-5 lg:py-2.5 2xl:px-6 2xl:py-3 rounded-full text-sm lg:text-lg xl:text-xl 2xl:text-2xl font-medium bg-amber-500/20 text-amber-300">Which of the 4 Points</span>
                </div>
                <p className="text-sm lg:text-base xl:text-lg 2xl:text-xl text-white/40 mb-4 lg:mb-6">{STATEMENTS.length} questions &middot; +10 points for correct &middot; Speed bonus up to +5</p>

                <button
                  onClick={startGame}
                  className="px-5 py-2.5 rounded-xl text-base font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                  style={{ background: 'linear-gradient(to right, #f0b429, #d97706)' }}
                >
                  <Play size={20} /> Start Game
                </button>
              </div>
            )}

            {/* ==================== SHOWING (voting) ==================== */}
            {gamePhase === 'showing' && currentStatement && (
              <div className="w-full h-full flex flex-col">
                {/* Statement card */}
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div className="w-full max-w-5xl 2xl:max-w-6xl">
                    {/* Question type label */}
                    <div className="text-center mb-3 lg:mb-4">
                      <span className="inline-block px-4 py-1.5 lg:px-6 lg:py-2 2xl:px-8 2xl:py-3 rounded-full text-sm lg:text-lg xl:text-xl 2xl:text-2xl font-bold bg-white/10 text-white/70 uppercase tracking-wider">
                        {currentQType?.label || 'Question'}
                      </span>
                    </div>
                    {/* The statement */}
                    <div className="rounded-3xl p-6 lg:p-8 2xl:p-10 mb-4 lg:mb-6 text-center" style={{ backgroundColor: '#1a2744', border: '3px solid rgba(240, 180, 41, 0.4)' }}>
                      <div className="text-base lg:text-lg 2xl:text-xl text-white/50 mb-3 uppercase tracking-widest font-medium">#{currentStatementIndex + 1} of {STATEMENTS.length}</div>
                      <div className="text-2xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black leading-tight" style={{ color: '#f0b429' }}>
                        &ldquo;{currentStatement.text}&rdquo;
                      </div>
                    </div>

                    {/* Live vote bars — dynamic based on question type */}
                    <div className={`grid gap-3 lg:gap-4 2xl:gap-5 mb-4 ${currentOptions.length <= 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                      {currentOptions.map(opt => {
                        const count = voteCounts[opt.value] || 0;
                        return (
                          <div key={opt.value} className="rounded-2xl p-4 lg:p-5 2xl:p-6 text-center" style={{ backgroundColor: `${opt.color}20` }}>
                            <div className="text-sm lg:text-xl 2xl:text-2xl font-bold mb-1" style={{ color: opt.color }}>{opt.label}</div>
                            <div className="text-3xl lg:text-5xl 2xl:text-6xl font-black" style={{ color: opt.color }}>{count}</div>
                            <div className="text-xs lg:text-base 2xl:text-lg text-white/50 mt-1">{count === 1 ? 'vote' : 'votes'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom bar: vote count + reveal button */}
                <div className="flex items-center justify-between mt-3 flex-shrink-0">
                  <div className="bg-white/10 rounded-2xl px-6 py-3 lg:px-8 lg:py-4">
                    <span className="text-3xl lg:text-4xl 2xl:text-5xl font-black text-green-400">{votedCount}</span>
                    <span className="text-lg lg:text-xl 2xl:text-2xl text-white/70"> / {students.length} voted</span>
                  </div>
                  <button
                    onClick={reveal}
                    className="px-6 py-3 lg:px-8 lg:py-4 rounded-2xl text-lg lg:text-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(to right, #f0b429, #d97706)' }}
                  >
                    <Eye size={24} /> Reveal Answer
                  </button>
                </div>
              </div>
            )}

            {/* ==================== REVEALED ==================== */}
            {gamePhase === 'revealed' && currentStatement && (() => {
              const correctOpt = currentOptions.find(o => o.value === currentStatement.answer);
              return (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div className="w-full max-w-5xl 2xl:max-w-6xl">
                    {/* Answer badge */}
                    <div className="text-center mb-4 lg:mb-5">
                      <span
                        className="inline-flex items-center gap-3 px-8 py-4 lg:px-10 lg:py-5 rounded-full text-3xl lg:text-4xl 2xl:text-5xl font-black text-white"
                        style={{ backgroundColor: correctOpt?.color || '#3B82F6' }}
                      >
                        <CheckCircle size={36} className="lg:w-10 lg:h-10 2xl:w-12 2xl:h-12" />
                        {correctOpt?.label || currentStatement.answer}
                      </span>
                    </div>

                    {/* Statement (dimmed) */}
                    <div className="rounded-2xl p-6 lg:p-8 2xl:p-10 mb-4 lg:mb-5 text-center" style={{ backgroundColor: '#1a2744', border: '2px solid rgba(255,255,255,0.1)' }}>
                      <div className="text-2xl lg:text-3xl 2xl:text-4xl font-bold text-white/70 leading-tight">
                        &ldquo;{currentStatement.text}&rdquo;
                      </div>
                    </div>

                    {/* Explanation */}
                    <div
                      className="rounded-2xl p-6 lg:p-8 mb-4 lg:mb-5 text-center"
                      style={{
                        backgroundColor: `${correctOpt?.color || '#3B82F6'}15`,
                        border: `2px solid ${correctOpt?.color || '#3B82F6'}40`
                      }}
                    >
                      <div className="text-xl lg:text-2xl 2xl:text-3xl font-medium text-white/90">{currentStatement.explanation}</div>
                    </div>

                    {/* Vote breakdown — dynamic */}
                    <div className={`grid gap-3 lg:gap-4 ${currentOptions.length <= 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                      {currentOptions.map(opt => {
                        const count = voteCounts[opt.value] || 0;
                        const pct = totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0;
                        const isCorrect = opt.value === currentStatement.answer;
                        return (
                          <div key={opt.value} className={`rounded-2xl p-4 lg:p-5 2xl:p-6 text-center ${isCorrect ? 'ring-2 ring-green-400' : ''}`}
                            style={{ backgroundColor: `${opt.color}20` }}>
                            <div className="text-sm lg:text-lg 2xl:text-xl font-bold" style={{ color: opt.color }}>{opt.label}</div>
                            <div className="text-2xl lg:text-4xl 2xl:text-5xl font-black" style={{ color: opt.color }}>{pct}%</div>
                            <div className="text-xs lg:text-sm 2xl:text-base text-white/50">{count} {count === 1 ? 'vote' : 'votes'}</div>
                            {isCorrect && <CheckCircle size={18} className="text-green-400 mx-auto mt-1" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between mt-3 flex-shrink-0">
                  <div className="text-xl lg:text-2xl 2xl:text-3xl text-white/70">
                    {(() => {
                      const correctVotes = voteCounts[currentStatement.answer] || 0;
                      return (
                        <>
                          {correctVotes} of {totalVoters} got it right!
                          {correctVotes > 0 && totalVoters > 0 && (
                            <span className="ml-2 text-green-400">
                              ({Math.round((correctVotes / totalVoters) * 100)}%)
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <button
                    onClick={nextStatement}
                    className="px-6 py-3 lg:px-8 lg:py-4 rounded-2xl text-lg lg:text-xl font-bold hover:scale-105 transition-all flex items-center gap-2"
                    style={{ background: 'linear-gradient(to right, #f0b429, #d97706)' }}
                  >
                    {currentStatementIndex >= STATEMENTS.length - 1 ? (
                      <>Finish Game <ChevronRight size={28} /></>
                    ) : (
                      <>Next Statement <ChevronRight size={28} /></>
                    )}
                  </button>
                </div>
              </div>
            ); })()}

            {/* ==================== FINISHED ==================== */}
            {gamePhase === 'finished' && (
              <div className="w-full h-full flex flex-col items-center justify-center overflow-auto">
                <div className="text-center mb-6 lg:mb-8">
                  <div className="text-5xl lg:text-6xl 2xl:text-7xl mb-3">{'\uD83C\uDFC6'}</div>
                  <h2 className="text-3xl lg:text-5xl 2xl:text-6xl font-black mb-2">Game Complete!</h2>
                  <p className="text-lg lg:text-2xl 2xl:text-3xl text-white/70">Final Leaderboard</p>
                </div>

                {/* Leaderboard */}
                {leaderboard.length > 0 && (
                  <div className="w-full max-w-lg lg:max-w-2xl 2xl:max-w-3xl">
                    {leaderboard.slice(0, 10).map((entry, idx) => {
                      const rankIcon = idx === 0 ? <Trophy size={28} className="text-yellow-400" /> :
                                       idx === 1 ? <Award size={28} className="text-gray-300" /> :
                                       idx === 2 ? <Medal size={28} className="text-amber-600" /> : null;
                      return (
                        <div
                          key={entry.id}
                          className={`flex items-center gap-4 lg:gap-5 px-6 py-3 lg:px-8 lg:py-4 2xl:px-10 2xl:py-5 rounded-xl mb-2 lg:mb-3 ${
                            idx === 0 ? 'bg-yellow-500/20 ring-2 ring-yellow-400' :
                            idx === 1 ? 'bg-gray-400/10 ring-1 ring-gray-400' :
                            idx === 2 ? 'bg-amber-600/10 ring-1 ring-amber-600' :
                            'bg-white/5'
                          }`}
                        >
                          <div className="w-8 lg:w-10 text-center">
                            {rankIcon || <span className="text-lg lg:text-xl 2xl:text-2xl font-bold text-white/50">{idx + 1}</span>}
                          </div>
                          <div className="flex-1 text-lg lg:text-2xl 2xl:text-3xl font-bold truncate">{entry.name}</div>
                          <div className="text-2xl lg:text-3xl 2xl:text-4xl font-black" style={{ color: '#f0b429' }}>{entry.score}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => onComplete?.()}
                  className="mt-8 px-10 py-5 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3"
                  style={{ background: 'linear-gradient(to right, #f0b429, #d97706)' }}
                >
                  Continue <ChevronRight size={28} />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default FactOpinionSorterGame;
