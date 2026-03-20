// File: SourceOrNotGame.jsx
// Source or Not? News Credibility Challenge - Teacher Presentation View (Music Journalist Unit 3)
// Teacher shows a headline + source name. Students vote CREDIBLE or NOT CREDIBLE.
// Results reveal as class bar chart. 8 rounds.
//
// PHASES:
// 1. Setup - Show "Start Game" with student count
// 2. Showing - Display headline + source, live vote counts
// 3. Voting - Students voting (same as showing, but semantically distinct)
// 4. Revealed - Show correct answer with explanation and vote breakdown
// 5. Finished - Final leaderboard

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Users, Eye, ChevronRight, CheckCircle, XCircle, Trophy, Award, Medal } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';

// ============================================================
// ROUNDS DATA — 8 rounds
// ============================================================
const ROUNDS = [
  {
    id: 'r1',
    headline: 'Olivia Rodrigo Announces World Tour',
    source: 'NPR Music',
    answer: 'credible',
    explanation: 'NPR Music is a major credible news outlet.'
  },
  {
    id: 'r2',
    headline: 'Scientists Prove Listening to Mozart Makes You Smarter',
    source: 'musicfacts247.net',
    answer: 'not-credible',
    explanation: "This is a debunked myth, and 'musicfacts247.net' is a made-up site."
  },
  {
    id: 'r3',
    headline: 'Grammy Awards Nominees Announced for 2025',
    source: 'Grammy.com',
    answer: 'credible',
    explanation: 'Grammy.com is the official Grammy Awards website.'
  },
  {
    id: 'r4',
    headline: 'Taylor Swift Secretly Hates Her Own Music, Source Says',
    source: 'celebrity-gossip-now.com',
    answer: 'not-credible',
    explanation: 'Unnamed sources and gossip sites are not credible journalism.'
  },
  {
    id: 'r5',
    headline: 'Hip-Hop Now Accounts for Most Music Streams Globally',
    source: 'Rolling Stone',
    answer: 'credible',
    explanation: 'Rolling Stone is a respected, long-running music publication.'
  },
  {
    id: 'r6',
    headline: 'Listening to Heavy Metal Causes Aggression in Teenagers',
    source: 'parentingscared.net',
    answer: 'not-credible',
    explanation: 'No credible research supports this claim, and the site name signals bias.'
  },
  {
    id: 'r7',
    headline: 'Smithsonian Opens New Exhibition on the History of Jazz',
    source: 'Smithsonian.edu',
    answer: 'credible',
    explanation: 'The Smithsonian is a trusted educational institution.'
  },
  {
    id: 'r8',
    headline: 'This One Weird Trick Makes You a Better Singer Overnight',
    source: 'clickbait-health.com',
    answer: 'not-credible',
    explanation: 'Classic clickbait headline pattern from a fake site.'
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

const SourceOrNotGame = ({ sessionData, onComplete }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  // Students
  const [students, setStudents] = useState([]);
  const [votedCount, setVotedCount] = useState(0);

  // Vote counts
  const [credibleCount, setCredibleCount] = useState(0);
  const [notCredibleCount, setNotCredibleCount] = useState(0);

  // Scores (accumulated across all rounds)
  const [scores, setScores] = useState({});

  // Round show timestamp (for speed bonus)
  const roundShownAt = useRef(null);

  const currentRound = ROUNDS[currentRoundIndex] || null;

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}/sourceOrNot`), data);
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
          answer: s.sourceOrNotAnswer,
          score: s.sourceOrNotScore || 0,
          answerTime: s.sourceOrNotAnswerTime || null,
        }));

      setStudents(list);
      setVotedCount(list.filter(s => s.answer).length);

      // Count votes
      let cred = 0;
      let notCred = 0;
      list.forEach(s => {
        if (s.answer === 'credible') cred++;
        if (s.answer === 'not-credible') notCred++;
      });
      setCredibleCount(cred);
      setNotCredibleCount(notCred);

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
    setCurrentRoundIndex(0);
    setGamePhase('showing');
    roundShownAt.current = Date.now();

    // Reset student answers and scores
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          sourceOrNotAnswer: null,
          sourceOrNotScore: 0,
          sourceOrNotAnswerTime: null,
        }).catch(() => {});
      });
    }

    const firstRound = ROUNDS[0];
    updateGame({
      phase: 'showing',
      currentRound: 0,
      roundData: {
        headline: firstRound.headline,
        source: firstRound.source,
        id: firstRound.id,
      },
      revealedAnswer: null,
      shownAt: Date.now(),
    });
  }, [sessionCode, students, updateGame]);

  // Reveal answer
  const reveal = useCallback(() => {
    if (!currentRound) return;

    setGamePhase('revealed');

    // Calculate scores for each student
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        if (s.answer) {
          const isCorrect = s.answer === currentRound.answer;
          let points = 0;
          if (isCorrect) {
            points = 10;
            // Speed bonus: up to +5 if answered within 5 seconds
            if (s.answerTime && roundShownAt.current) {
              const elapsed = (s.answerTime - roundShownAt.current) / 1000;
              if (elapsed <= 5) {
                points += Math.round(5 * (1 - elapsed / 5));
              }
            }
          }
          const newScore = (s.score || 0) + points;
          update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
            sourceOrNotScore: newScore,
          }).catch(() => {});
        }
      });
    }

    updateGame({
      phase: 'revealed',
      revealedAnswer: currentRound.answer,
    });
  }, [currentRound, students, sessionCode, updateGame]);

  // Next round
  const nextRound = useCallback(() => {
    // Clear student answers (but keep scores)
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          sourceOrNotAnswer: null,
          sourceOrNotAnswerTime: null,
        }).catch(() => {});
      });
    }

    const nextIdx = currentRoundIndex + 1;

    if (nextIdx >= ROUNDS.length) {
      setGamePhase('finished');
      updateGame({ phase: 'finished', revealedAnswer: null });
    } else {
      setCurrentRoundIndex(nextIdx);
      setGamePhase('showing');
      roundShownAt.current = Date.now();

      const nextRd = ROUNDS[nextIdx];
      updateGame({
        phase: 'showing',
        currentRound: nextIdx,
        roundData: {
          headline: nextRd.headline,
          source: nextRd.source,
          id: nextRd.id,
        },
        revealedAnswer: null,
        shownAt: Date.now(),
      });
    }
  }, [sessionCode, students, currentRoundIndex, updateGame]);

  // Build sorted leaderboard
  const leaderboard = Object.entries(scores)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.score - a.score);

  const totalVoters = credibleCount + notCredibleCount;
  const crediblePercent = totalVoters > 0 ? Math.round((credibleCount / totalVoters) * 100) : 0;
  const notCrediblePercent = totalVoters > 0 ? Math.round((notCredibleCount / totalVoters) * 100) : 0;

  return (
    <div className="min-h-screen h-full flex flex-col bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
      <ActivityBanner />

      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{'\uD83D\uDD0D'}</span>
            <h1 className="text-4xl font-bold">Source or Not?</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                {currentRoundIndex + 1}/{ROUNDS.length}
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
            {ROUNDS.map((r, idx) => {
              const isComplete = idx < currentRoundIndex || (idx === currentRoundIndex && gamePhase === 'revealed');
              const isCurrent = idx === currentRoundIndex && gamePhase === 'showing';
              return (
                <div
                  key={r.id}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-white scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: isComplete
                      ? (r.answer === 'credible' ? '#22c55e' : '#ef4444')
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
                <div className="text-9xl mb-6">{'\uD83D\uDD0D'}</div>
                <h2 className="text-5xl font-bold mb-4">Source or Not?</h2>
                <p className="text-2xl text-white/70 mb-2">Read the headline. Is the source CREDIBLE or NOT CREDIBLE?</p>
                <p className="text-xl text-white/50 mb-6">Vote on your device. Be fast for bonus points!</p>

                <p className="text-xl text-white/50 mb-8">8 rounds &middot; +10 points for correct &middot; Speed bonus up to +5</p>

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
            {gamePhase === 'showing' && currentRound && (
              <div className="w-full h-full flex flex-col">
                {/* Headline + source card */}
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div className="w-full max-w-4xl">
                    {/* The headline + source */}
                    <div className="rounded-3xl p-10 mb-6 text-center" style={{ backgroundColor: '#1a2744', border: '3px solid rgba(240, 180, 41, 0.4)' }}>
                      <div className="text-lg text-white/50 mb-4 uppercase tracking-widest font-medium">Round #{currentRoundIndex + 1}</div>
                      <div className="text-4xl font-black leading-tight mb-6" style={{ color: '#f0b429' }}>
                        &ldquo;{currentRound.headline}&rdquo;
                      </div>
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xl font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)' }}>
                        <span className="text-white/60">Source:</span>
                        <span className="text-white">{currentRound.source}</span>
                      </div>
                    </div>

                    {/* Live vote bars */}
                    <div className="flex gap-4 mb-4">
                      {/* Credible bar */}
                      <div className="flex-1 bg-green-500/20 rounded-2xl p-4 text-center">
                        <div className="text-lg font-bold text-green-400 mb-1">CREDIBLE</div>
                        <div className="text-5xl font-black text-green-400">{credibleCount}</div>
                        <div className="text-sm text-white/50 mt-1">{credibleCount === 1 ? 'vote' : 'votes'}</div>
                      </div>
                      {/* Not Credible bar */}
                      <div className="flex-1 bg-red-500/20 rounded-2xl p-4 text-center">
                        <div className="text-lg font-bold text-red-400 mb-1">NOT CREDIBLE</div>
                        <div className="text-5xl font-black text-red-400">{notCredibleCount}</div>
                        <div className="text-sm text-white/50 mt-1">{notCredibleCount === 1 ? 'vote' : 'votes'}</div>
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
            {gamePhase === 'revealed' && currentRound && (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div className="w-full max-w-4xl">
                    {/* Answer badge */}
                    <div className="text-center mb-4">
                      <span
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-3xl font-black"
                        style={{
                          backgroundColor: currentRound.answer === 'credible' ? '#22c55e' : '#ef4444',
                          color: 'white'
                        }}
                      >
                        {currentRound.answer === 'credible' ? (
                          <><CheckCircle size={36} /> CREDIBLE</>
                        ) : (
                          <><XCircle size={36} /> NOT CREDIBLE</>
                        )}
                      </span>
                    </div>

                    {/* Headline + source (dimmed) */}
                    <div className="rounded-2xl p-6 mb-4 text-center" style={{ backgroundColor: '#1a2744', border: '2px solid rgba(255,255,255,0.1)' }}>
                      <div className="text-2xl font-bold text-white/70 leading-tight mb-3">
                        &ldquo;{currentRound.headline}&rdquo;
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-base" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <span className="text-white/40">Source:</span>
                        <span className="text-white/60 font-medium">{currentRound.source}</span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div
                      className="rounded-2xl p-6 mb-4 text-center"
                      style={{
                        backgroundColor: currentRound.answer === 'credible' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        border: `2px solid ${currentRound.answer === 'credible' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`
                      }}
                    >
                      <div className="text-xl font-medium text-white/90">{currentRound.explanation}</div>
                    </div>

                    {/* Vote breakdown */}
                    <div className="flex gap-4">
                      <div className={`flex-1 rounded-2xl p-4 text-center ${currentRound.answer === 'credible' ? 'ring-2 ring-green-400' : ''}`}
                        style={{ backgroundColor: 'rgba(34,197,94,0.2)' }}
                      >
                        <div className="text-lg font-bold text-green-400">CREDIBLE</div>
                        <div className="text-4xl font-black text-green-400">{crediblePercent}%</div>
                        <div className="text-sm text-white/50">{credibleCount} {credibleCount === 1 ? 'vote' : 'votes'}</div>
                        {currentRound.answer === 'credible' && (
                          <CheckCircle size={20} className="text-green-400 mx-auto mt-1" />
                        )}
                      </div>
                      <div className={`flex-1 rounded-2xl p-4 text-center ${currentRound.answer === 'not-credible' ? 'ring-2 ring-green-400' : ''}`}
                        style={{ backgroundColor: 'rgba(239,68,68,0.2)' }}
                      >
                        <div className="text-lg font-bold text-red-400">NOT CREDIBLE</div>
                        <div className="text-4xl font-black text-red-400">{notCrediblePercent}%</div>
                        <div className="text-sm text-white/50">{notCredibleCount} {notCredibleCount === 1 ? 'vote' : 'votes'}</div>
                        {currentRound.answer === 'not-credible' && (
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
                      const correctVotes = currentRound.answer === 'credible' ? credibleCount : notCredibleCount;
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
                    onClick={nextRound}
                    className="px-10 py-4 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2"
                    style={{ background: 'linear-gradient(to right, #f0b429, #d97706)' }}
                  >
                    {currentRoundIndex >= ROUNDS.length - 1 ? (
                      <>Finish Game <ChevronRight size={28} /></>
                    ) : (
                      <>Next Round <ChevronRight size={28} /></>
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

export default SourceOrNotGame;
