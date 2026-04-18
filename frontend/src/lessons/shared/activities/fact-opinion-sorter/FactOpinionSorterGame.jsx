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
    label: 'Artists Worth Signing',
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
  // --- Fact or Opinion (3 questions) ---
  {
    id: 's1', questionType: 'fact-opinion',
    text: "Most people agree this is the best album of the year.",
    answer: 'opinion',
    explanation: "OPINION — 'best album' is a personal judgment, even if 'most people' agree. Popularity doesn't make something a fact."
  },
  {
    id: 's2', questionType: 'fact-opinion',
    text: "Their debut single was featured on Spotify's 'New Music Friday' playlist on March 8th.",
    answer: 'fact',
    explanation: "FACT — specific playlist, specific date. You could verify this even if it sounds impressive."
  },
  {
    id: 's3', questionType: 'fact-opinion',
    text: "They blend jazz chords with trap beats in a way nobody has done before.",
    answer: 'opinion',
    explanation: "OPINION — 'nobody has done before' is a claim you can't prove. Other artists may have blended these styles."
  },
  // --- Strong or Weak Evidence (5 questions) ---
  {
    id: 's4', questionType: 'strong-weak',
    text: "A lot of people on social media are talking about them.",
    answer: 'weak',
    explanation: "WEAK — 'a lot of people' is vague. How many? Which platform? Without specifics, this could mean 5 people or 5,000."
  },
  {
    id: 's5', questionType: 'strong-weak',
    text: "They were nominated for 'Best New Artist' at the BET Awards in 2024.",
    answer: 'strong',
    explanation: "STRONG — specific award name, specific year. This is concrete, verifiable, and impressive."
  },
  {
    id: 's6', questionType: 'strong-weak',
    text: "I played their song for my friends and everyone loved it.",
    answer: 'weak',
    explanation: "WEAK — your friend group isn't a representative sample. 'Everyone loved it' is vague — how many friends? What did they actually say?"
  },
  {
    id: 's7', questionType: 'strong-weak',
    text: "They've gained 12,000 new monthly listeners since their song went viral on TikTok in September.",
    answer: 'strong',
    explanation: "STRONG — specific number, specific platform, specific timeframe. Measurable and verifiable."
  },
  {
    id: 's8', questionType: 'strong-weak',
    text: "Their production quality is way better than it was on their first album.",
    answer: 'weak',
    explanation: "WEAK — 'way better' is a vague comparison. Better how? Cleaner mix? More instruments? Without specifics, this is just a feeling."
  },
  // --- Which of the 4 Points (5 questions) ---
  {
    id: 's9', questionType: 'which-point',
    text: "She taught herself to produce beats using free software while living in a homeless shelter at 15.",
    answer: 'compelling-story',
    explanation: "COMPELLING STORY — this is about her personal background and what she overcame. It makes you care about the person behind the music."
  },
  {
    id: 's10', questionType: 'which-point',
    text: "Their first EP got 500 plays. Their second got 15,000. Their third just hit 120,000.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — the numbers show a clear upward trend. Each release is reaching more people — that's momentum."
  },
  {
    id: 's11', questionType: 'which-point',
    text: "They mix traditional West African kora with electronic bass music — I've never heard anything like it.",
    answer: 'unique-sound',
    explanation: "UNIQUE SOUND — the specific combination of kora + electronic bass describes what makes their sound different from everyone else."
  },
  {
    id: 's12', questionType: 'which-point',
    text: "Every time I listen to this artist, I find something new in the track I didn't notice before.",
    answer: 'gut-feeling',
    explanation: "GUT FEELING — this is about your personal, instinctive reaction. You can't point to data — something just keeps pulling you back."
  },
  {
    id: 's13', questionType: 'which-point',
    text: "They went from 200 Instagram followers to being reposted by Chance the Rapper in under a year.",
    answer: 'signs-of-growth',
    explanation: "SIGNS OF GROWTH — going from unknown to getting a major co-sign shows rapid momentum. The specific timeline and numbers prove they're on the rise."
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
  const classId = urlParams.get('classId');

  // Firebase paths — class sessions use classes/{classId}/currentSession/..., quick sessions use sessions/{code}/...
  const gamePath = classId
    ? `classes/${classId}/currentSession/factOpinionSorter`
    : `sessions/${sessionCode}/factOpinionSorter`;
  const studentsBasePath = classId
    ? `classes/${classId}/currentSession/studentsJoined`
    : `sessions/${sessionCode}/studentsJoined`;

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

  // Cooldown to prevent accidental double-click advancing
  const [buttonCooldown, setButtonCooldown] = useState(false);
  const startCooldown = useCallback((ms = 1500) => {
    setButtonCooldown(true);
    setTimeout(() => setButtonCooldown(false), ms);
  }, []);

  const currentStatement = STATEMENTS[currentStatementIndex] || null;

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode && !classId) return;
    const db = getDatabase();
    update(ref(db, gamePath), data);
  }, [sessionCode, classId, gamePath]);

  // Firebase: Subscribe to students
  useEffect(() => {
    if (!sessionCode && !classId) return;
    const db = getDatabase();
    const studentsRef = ref(db, studentsBasePath);

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

      // Deduplicate by name — keep the entry with the most data
      const byName = {};
      list.forEach(s => {
        const existing = byName[s.name];
        if (!existing || s.score > existing.score || (s.answer && !existing.answer)) {
          byName[s.name] = s;
        }
      });
      const dedupedList = Object.values(byName);

      setStudents(dedupedList);
      setVotedCount(dedupedList.filter(s => s.answer).length);

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
  }, [sessionCode, classId, studentsBasePath]);

  // Start game
  const startGame = useCallback(() => {
    if (buttonCooldown) return;
    startCooldown();
    setCurrentStatementIndex(0);
    setGamePhase('showing');
    statementShownAt.current = Date.now();

    // Reset student answers and scores
    if (sessionCode || classId) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsBasePath}/${s.id}`), {
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
  }, [sessionCode, classId, students, updateGame, studentsBasePath, buttonCooldown, startCooldown]);

  // Reveal answer
  const reveal = useCallback(() => {
    if (!currentStatement || buttonCooldown) return;
    startCooldown();

    setGamePhase('revealed');

    // Calculate scores for each student
    if (sessionCode || classId) {
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
          update(ref(db, `${studentsBasePath}/${s.id}`), {
            factOpinionScore: newScore,
          }).catch(() => {});
        }
      });
    }

    updateGame({
      phase: 'revealed',
      revealedAnswer: currentStatement.answer,
    });
  }, [currentStatement, students, sessionCode, classId, updateGame, studentsBasePath, buttonCooldown, startCooldown]);

  // Next statement
  const nextStatement = useCallback(() => {
    if (buttonCooldown) return;
    startCooldown();
    // Clear student answers (but keep scores)
    if (sessionCode || classId) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsBasePath}/${s.id}`), {
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
  }, [sessionCode, classId, students, currentStatementIndex, updateGame, studentsBasePath, buttonCooldown, startCooldown]);

  // Build sorted leaderboard (deduplicate by name — keep highest score)
  const leaderboard = (() => {
    const byName = {};
    Object.entries(scores).forEach(([id, data]) => {
      const existing = byName[data.name];
      if (!existing || data.score > existing.score) {
        byName[data.name] = { id, ...data };
      }
    });
    return Object.values(byName).sort((a, b) => b.score - a.score);
  })();

  const currentQType = currentStatement ? QUESTION_TYPES[currentStatement.questionType] : null;
  const currentOptions = currentQType?.options || [];

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
      <ActivityBanner />

      <div className="flex-1 p-4 lg:p-6 2xl:p-8 overflow-hidden flex min-h-0">
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 lg:mb-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-3xl lg:text-4xl">{'\u2696\uFE0F'}</span>
              <h1 className="text-2xl lg:text-3xl font-bold">Artists Worth Signing</h1>
              {gamePhase !== 'setup' && gamePhase !== 'finished' && (
                <span className="bg-white/10 px-4 py-2 rounded-full text-xl lg:text-2xl">
                  Q{currentStatementIndex + 1}/{STATEMENTS.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-2xl">
              <Users size={24} />
              <span>{students.length}</span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-h-0">
            <div className="bg-black/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0 h-full">

              {/* ==================== SETUP ==================== */}
              {gamePhase === 'setup' && (
                <div className="text-center max-w-4xl mx-auto px-8">
                  <div className="text-5xl lg:text-7xl mb-4">{'\u2696\uFE0F'}</div>
                  <h2 className="text-3xl lg:text-5xl font-bold mb-4">Artists Worth Signing</h2>
                  <p className="text-lg lg:text-2xl text-white/80 mb-6 leading-relaxed">You know the 4-Point Checklist. Now prove you can use it. <strong className="text-amber-400">Spot facts vs. opinions</strong>, judge <strong className="text-amber-400">strong vs. weak evidence</strong>, and match statements to the right checklist point.</p>
                  <p className="text-sm lg:text-base text-white/40 mb-6">{STATEMENTS.length} questions &middot; 3 question types &middot; +10 points correct &middot; Speed bonus up to +5</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 rounded-xl text-lg font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                    style={{ background: 'linear-gradient(to right, #f0b429, #d97706)' }}
                  >
                    <Play size={20} /> Start Game
                  </button>
                </div>
              )}

              {/* ==================== SHOWING (voting) ==================== */}
              {gamePhase === 'showing' && currentStatement && (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <div className="w-full max-w-4xl">
                      <div className="text-center mb-3">
                        <span className="inline-block px-5 py-2 rounded-full text-lg font-bold bg-white/10 text-white/70 uppercase tracking-wider">
                          {currentQType?.label || 'Question'}
                        </span>
                      </div>
                      <div className="rounded-3xl p-8 mb-6 text-center" style={{ backgroundColor: '#1a2744', border: '3px solid rgba(240, 180, 41, 0.4)' }}>
                        <div className="text-3xl lg:text-5xl font-black leading-tight" style={{ color: '#f0b429' }}>
                          &ldquo;{currentStatement.text}&rdquo;
                        </div>
                      </div>
                      {/* Answered count */}
                      <div className="text-center">
                        <span className="text-2xl font-black text-green-400">{votedCount}</span>
                        <span className="text-lg text-white/70"> / {students.length} answered</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3 flex-shrink-0">
                    <button
                      onClick={reveal}
                      disabled={buttonCooldown}
                      className={`px-6 py-3 rounded-2xl text-lg font-bold flex items-center gap-2 transition-all ${buttonCooldown ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
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
                    <div className="w-full max-w-4xl">
                      <div className="text-center mb-4">
                        <span
                          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-3xl lg:text-4xl font-black text-white"
                          style={{ backgroundColor: correctOpt?.color || '#3B82F6' }}
                        >
                          <CheckCircle size={36} />
                          {correctOpt?.label || currentStatement.answer}
                        </span>
                      </div>
                      <div className="rounded-2xl p-6 mb-4 text-center" style={{ backgroundColor: '#1a2744', border: '2px solid rgba(255,255,255,0.1)' }}>
                        <div className="text-2xl lg:text-3xl font-bold text-white/70 leading-tight">
                          &ldquo;{currentStatement.text}&rdquo;
                        </div>
                      </div>
                      <div
                        className="rounded-2xl p-6 text-center"
                        style={{
                          backgroundColor: `${correctOpt?.color || '#3B82F6'}15`,
                          border: `2px solid ${correctOpt?.color || '#3B82F6'}40`
                        }}
                      >
                        <div className="text-xl lg:text-2xl font-medium text-white/90">{currentStatement.explanation}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3 flex-shrink-0">
                    <button
                      onClick={nextStatement}
                      disabled={buttonCooldown}
                      className={`px-6 py-3 rounded-2xl text-lg font-bold flex items-center gap-2 transition-all ${buttonCooldown ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                      style={{ background: 'linear-gradient(to right, #f0b429, #d97706)' }}
                    >
                      {currentStatementIndex >= STATEMENTS.length - 1 ? (
                        <>Finish Game <ChevronRight size={28} /></>
                      ) : (
                        <>Next Question <ChevronRight size={28} /></>
                      )}
                    </button>
                  </div>
                </div>
              ); })()}

              {/* ==================== FINISHED ==================== */}
              {gamePhase === 'finished' && (
                <div className="w-full h-full flex flex-col items-center justify-center overflow-auto">
                  <div className="text-center mb-6">
                    <div className="text-5xl lg:text-6xl mb-3">{'\uD83C\uDFC6'}</div>
                    <h2 className="text-3xl lg:text-5xl font-black mb-2">Game Complete!</h2>
                    <p className="text-lg lg:text-2xl text-white/70">Final Leaderboard</p>
                  </div>
                  {leaderboard.length > 0 && (
                    <div className="w-full max-w-lg lg:max-w-2xl">
                      {leaderboard.slice(0, 10).map((entry, idx) => {
                        const rankIcon = idx === 0 ? <Trophy size={28} className="text-yellow-400" /> :
                                         idx === 1 ? <Award size={28} className="text-gray-300" /> :
                                         idx === 2 ? <Medal size={28} className="text-amber-600" /> : null;
                        return (
                          <div
                            key={entry.id}
                            className={`flex items-center gap-4 px-6 py-3 rounded-xl mb-2 ${
                              idx === 0 ? 'bg-yellow-500/20 ring-2 ring-yellow-400' :
                              idx === 1 ? 'bg-gray-400/10 ring-1 ring-gray-400' :
                              idx === 2 ? 'bg-amber-600/10 ring-1 ring-amber-600' :
                              'bg-white/5'
                            }`}
                          >
                            <div className="w-8 text-center">
                              {rankIcon || <span className="text-lg font-bold text-white/50">{idx + 1}</span>}
                            </div>
                            <div className="flex-1 text-lg lg:text-2xl font-bold truncate">{entry.name}</div>
                            <div className="text-2xl lg:text-3xl font-black" style={{ color: '#f0b429' }}>{entry.score}</div>
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

        {/* Right sidebar — Scoreboard (visible during gameplay) */}
        {gamePhase !== 'setup' && gamePhase !== 'finished' && (
          <div className="w-64 ml-4 bg-black/20 rounded-2xl p-4 flex flex-col min-h-0 flex-shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="text-yellow-400" size={24} />
              <h2 className="text-xl font-bold">Scoreboard</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    idx === 0 ? 'bg-yellow-500/20' : 'bg-white/5'
                  }`}
                >
                  <span className="w-6 text-center font-bold text-sm text-white/50">
                    {idx === 0 ? '\uD83E\uDD47' : idx === 1 ? '\uD83E\uDD48' : idx === 2 ? '\uD83E\uDD49' : `${idx + 1}`}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{entry.name}</span>
                  <span className="text-sm font-black" style={{ color: '#f0b429' }}>{entry.score}</span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-sm text-white/30 text-center mt-4">Waiting for answers...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactOpinionSorterGame;
