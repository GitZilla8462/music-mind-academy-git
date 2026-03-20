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

// ============================================================
// STATEMENTS DATA — 10 statements
// ============================================================
const STATEMENTS = [
  {
    id: 's1',
    text: "Michael Jackson's Thriller was released in 1982.",
    answer: 'fact',
    explanation: "This is a FACT. Thriller was released on November 30, 1982 — it's the best-selling album of all time."
  },
  {
    id: 's2',
    text: 'Thriller is the greatest album ever made.',
    answer: 'opinion',
    explanation: "This is an OPINION. While Thriller is incredibly popular, 'greatest' is a personal judgment — not everyone agrees."
  },
  {
    id: 's3',
    text: "Beyonce has won more Grammy Awards than any other artist.",
    answer: 'fact',
    explanation: "This is a FACT. As of 2024, Beyonce holds the record for most Grammy wins by any artist — 32 total."
  },
  {
    id: 's4',
    text: "Billie Eilish's music is too dark for middle schoolers.",
    answer: 'opinion',
    explanation: "This is an OPINION. 'Too dark' is a personal judgment. Some people love her style, others don't — that's what makes it an opinion."
  },
  {
    id: 's5',
    text: 'The Beatles broke up in 1970.',
    answer: 'fact',
    explanation: "This is a FACT. Paul McCartney announced his departure on April 10, 1970, officially ending the band."
  },
  {
    id: 's6',
    text: 'Rock music is more important than hip-hop.',
    answer: 'opinion',
    explanation: "This is an OPINION. 'More important' is a value judgment. Both genres have had massive cultural impact — importance is subjective."
  },
  {
    id: 's7',
    text: 'Kendrick Lamar won the Pulitzer Prize for Music in 2018.',
    answer: 'fact',
    explanation: "This is a FACT. Kendrick Lamar won for his album DAMN. — he was the first non-classical, non-jazz artist to win."
  },
  {
    id: 's8',
    text: 'Country music is boring.',
    answer: 'opinion',
    explanation: "This is an OPINION. 'Boring' is a personal feeling. Millions of fans would strongly disagree!"
  },
  {
    id: 's9',
    text: 'Mozart started composing music at age five.',
    answer: 'fact',
    explanation: "This is a FACT. Wolfgang Amadeus Mozart composed his first pieces at age 5 in 1761."
  },
  {
    id: 's10',
    text: 'Classical music helps you study better than any other genre.',
    answer: 'opinion',
    explanation: "This is an OPINION. While some studies suggest classical music can help focus, saying it's better than 'any other genre' is not proven — it depends on the person."
  }
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

  // Vote counts
  const [factCount, setFactCount] = useState(0);
  const [opinionCount, setOpinionCount] = useState(0);

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
        .filter(([, s]) => s.playerName || s.displayName)
        .map(([id, s]) => ({
          id,
          name: s.playerName || s.displayName,
          answer: s.factOpinionAnswer,
          score: s.factOpinionScore || 0,
          answerTime: s.factOpinionAnswerTime || null,
        }));

      setStudents(list);
      setVotedCount(list.filter(s => s.answer).length);

      // Count votes
      let facts = 0;
      let opinions = 0;
      list.forEach(s => {
        if (s.answer === 'fact') facts++;
        if (s.answer === 'opinion') opinions++;
      });
      setFactCount(facts);
      setOpinionCount(opinions);

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
    updateGame({
      phase: 'showing',
      currentStatement: 0,
      statementData: {
        text: firstStatement.text,
        id: firstStatement.id,
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
      updateGame({
        phase: 'showing',
        currentStatement: nextIdx,
        statementData: {
          text: nextSt.text,
          id: nextSt.id,
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

  const totalVoters = factCount + opinionCount;
  const factPercent = totalVoters > 0 ? Math.round((factCount / totalVoters) * 100) : 0;
  const opinionPercent = totalVoters > 0 ? Math.round((opinionCount / totalVoters) * 100) : 0;

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
      <ActivityBanner />

      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{'\u2696\uFE0F'}</span>
            <h1 className="text-4xl font-bold">Fact or Opinion?</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                {currentStatementIndex + 1}/{STATEMENTS.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        {gamePhase !== 'setup' && gamePhase !== 'finished' && (
          <div className="flex gap-1 mb-3 flex-shrink-0">
            {STATEMENTS.map((s, idx) => {
              const isComplete = idx < currentStatementIndex || (idx === currentStatementIndex && gamePhase === 'revealed');
              const isCurrent = idx === currentStatementIndex && gamePhase === 'showing';
              return (
                <div
                  key={s.id}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-white scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: isComplete
                      ? (s.answer === 'fact' ? '#3B82F6' : '#8B5CF6')
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
              <div className="text-center">
                <div className="text-9xl mb-6">{'\u2696\uFE0F'}</div>
                <h2 className="text-5xl font-bold mb-4">Fact or Opinion?</h2>
                <p className="text-2xl text-white/70 mb-2">Read the statement. Is it a FACT or an OPINION?</p>
                <p className="text-xl text-white/50 mb-6">Vote on your device. Be fast for bonus points!</p>

                <p className="text-xl text-white/50 mb-8">10 statements &middot; +10 points for correct &middot; Speed bonus up to +5</p>

                <button
                  onClick={startGame}
                  className="px-10 py-5 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                  style={{ background: 'linear-gradient(to right, #f0b429, #d97706)' }}
                >
                  <Play size={40} /> Start Game
                </button>
              </div>
            )}

            {/* ==================== SHOWING (voting) ==================== */}
            {gamePhase === 'showing' && currentStatement && (
              <div className="w-full h-full flex flex-col">
                {/* Statement card */}
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div className="w-full max-w-4xl">
                    {/* The statement */}
                    <div className="rounded-3xl p-10 mb-6 text-center" style={{ backgroundColor: '#1a2744', border: '3px solid rgba(240, 180, 41, 0.4)' }}>
                      <div className="text-lg text-white/50 mb-4 uppercase tracking-widest font-medium">Statement #{currentStatementIndex + 1}</div>
                      <div className="text-4xl font-black leading-tight" style={{ color: '#f0b429' }}>
                        &ldquo;{currentStatement.text}&rdquo;
                      </div>
                    </div>

                    {/* Live vote bars */}
                    <div className="flex gap-4 mb-4">
                      {/* Fact bar */}
                      <div className="flex-1 bg-blue-500/20 rounded-2xl p-4 text-center">
                        <div className="text-lg font-bold text-blue-400 mb-1">FACT</div>
                        <div className="text-5xl font-black text-blue-400">{factCount}</div>
                        <div className="text-sm text-white/50 mt-1">{factCount === 1 ? 'vote' : 'votes'}</div>
                      </div>
                      {/* Opinion bar */}
                      <div className="flex-1 bg-purple-500/20 rounded-2xl p-4 text-center">
                        <div className="text-lg font-bold text-purple-400 mb-1">OPINION</div>
                        <div className="text-5xl font-black text-purple-400">{opinionCount}</div>
                        <div className="text-sm text-white/50 mt-1">{opinionCount === 1 ? 'vote' : 'votes'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom bar: vote count + reveal button */}
                <div className="flex items-center justify-between mt-3 flex-shrink-0">
                  <div className="bg-white/10 rounded-2xl px-6 py-3">
                    <span className="text-3xl font-black text-green-400">{votedCount}</span>
                    <span className="text-lg text-white/70"> / {students.length} voted</span>
                  </div>
                  <button
                    onClick={reveal}
                    className="px-8 py-4 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(to right, #f0b429, #d97706)' }}
                  >
                    <Eye size={28} /> Reveal Answer
                  </button>
                </div>
              </div>
            )}

            {/* ==================== REVEALED ==================== */}
            {gamePhase === 'revealed' && currentStatement && (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div className="w-full max-w-4xl">
                    {/* Answer badge */}
                    <div className="text-center mb-4">
                      <span
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-3xl font-black"
                        style={{
                          backgroundColor: currentStatement.answer === 'fact' ? '#3B82F6' : '#8B5CF6',
                          color: 'white'
                        }}
                      >
                        <CheckCircle size={36} />
                        {currentStatement.answer === 'fact' ? 'FACT' : 'OPINION'}
                      </span>
                    </div>

                    {/* Statement (dimmed) */}
                    <div className="rounded-2xl p-6 mb-4 text-center" style={{ backgroundColor: '#1a2744', border: '2px solid rgba(255,255,255,0.1)' }}>
                      <div className="text-2xl font-bold text-white/70 leading-tight">
                        &ldquo;{currentStatement.text}&rdquo;
                      </div>
                    </div>

                    {/* Explanation */}
                    <div
                      className="rounded-2xl p-6 mb-4 text-center"
                      style={{
                        backgroundColor: currentStatement.answer === 'fact' ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)',
                        border: `2px solid ${currentStatement.answer === 'fact' ? 'rgba(59,130,246,0.4)' : 'rgba(139,92,246,0.4)'}`
                      }}
                    >
                      <div className="text-xl font-medium text-white/90">{currentStatement.explanation}</div>
                    </div>

                    {/* Vote breakdown */}
                    <div className="flex gap-4">
                      <div className={`flex-1 rounded-2xl p-4 text-center ${currentStatement.answer === 'fact' ? 'ring-2 ring-green-400' : ''}`}
                        style={{ backgroundColor: 'rgba(59,130,246,0.2)' }}
                      >
                        <div className="text-lg font-bold text-blue-400">FACT</div>
                        <div className="text-4xl font-black text-blue-400">{factPercent}%</div>
                        <div className="text-sm text-white/50">{factCount} {factCount === 1 ? 'vote' : 'votes'}</div>
                        {currentStatement.answer === 'fact' && (
                          <CheckCircle size={20} className="text-green-400 mx-auto mt-1" />
                        )}
                      </div>
                      <div className={`flex-1 rounded-2xl p-4 text-center ${currentStatement.answer === 'opinion' ? 'ring-2 ring-green-400' : ''}`}
                        style={{ backgroundColor: 'rgba(139,92,246,0.2)' }}
                      >
                        <div className="text-lg font-bold text-purple-400">OPINION</div>
                        <div className="text-4xl font-black text-purple-400">{opinionPercent}%</div>
                        <div className="text-sm text-white/50">{opinionCount} {opinionCount === 1 ? 'vote' : 'votes'}</div>
                        {currentStatement.answer === 'opinion' && (
                          <CheckCircle size={20} className="text-green-400 mx-auto mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between mt-3 flex-shrink-0">
                  <div className="text-xl text-white/70">
                    {(() => {
                      const correctVotes = currentStatement.answer === 'fact' ? factCount : opinionCount;
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
                    className="px-10 py-4 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2"
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
            )}

            {/* ==================== FINISHED ==================== */}
            {gamePhase === 'finished' && (
              <div className="w-full h-full flex flex-col items-center justify-center overflow-auto">
                <div className="text-center mb-6">
                  <div className="text-8xl mb-4">{'\uD83C\uDFC6'}</div>
                  <h2 className="text-5xl font-black mb-2">Game Complete!</h2>
                  <p className="text-2xl text-white/70">Final Leaderboard</p>
                </div>

                {/* Leaderboard */}
                {leaderboard.length > 0 && (
                  <div className="w-full max-w-lg">
                    {leaderboard.slice(0, 10).map((entry, idx) => {
                      const rankIcon = idx === 0 ? <Trophy size={24} className="text-yellow-400" /> :
                                       idx === 1 ? <Award size={24} className="text-gray-300" /> :
                                       idx === 2 ? <Medal size={24} className="text-amber-600" /> : null;
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
                          <div className="flex-1 text-lg font-bold truncate">{entry.name}</div>
                          <div className="text-2xl font-black" style={{ color: '#f0b429' }}>{entry.score}</div>
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
