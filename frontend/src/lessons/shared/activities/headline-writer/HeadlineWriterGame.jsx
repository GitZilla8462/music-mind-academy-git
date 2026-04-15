// File: HeadlineWriterGame.jsx
// Headline Writer - Teacher Presentation View (Music Journalist Unit 3)
// Teacher shows a 3-sentence music news summary. Students write headlines.
// All submissions display anonymously. Class votes on best headline. 5 rounds.
//
// PHASES:
// 1. Setup - Show "Start Game" with rules
// 2. Writing - Display summary, 90-second countdown, live submission count
// 3. Submissions Display - Show all headlines anonymously, "Start Voting" button
// 4. Voting - Same headlines, live vote counts, "Reveal Winner" button
// 5. Winner - Winning headline highlighted, "Next Round" button
// 6. Finished - Final results, all winning headlines

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Users, ChevronRight, Trophy, Award, Medal, PenLine, Vote, Crown, Timer } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { formatFirstNameLastInitial } from '../layer-detective/nameGenerator';
import { useSession } from '../../../../context/SessionContext';

// ============================================================
// SUMMARIES DATA — 5 rounds
// ============================================================
const SUMMARIES = [
  {
    id: 'r1',
    text: 'A teenager from Atlanta won a national songwriting competition last month, beating out more than 4,000 entries from across the country. She wrote and produced the winning song entirely in her bedroom using a laptop. She will perform it at the Kennedy Center in Washington, D.C. next spring.',
  },
  {
    id: 'r2',
    text: 'Scientists at a university in London studied 500 people who learned to play a musical instrument as children. They found that those students scored higher on memory tests as adults. The study did not find that one instrument was better than another.',
  },
  {
    id: 'r3',
    text: 'A hip-hop artist just announced that their upcoming album will feature only live instruments \u2014 no digital samples or synthesizers. This is unusual in hip-hop production. The artist said they wanted to challenge themselves and connect to older traditions of music-making.',
  },
  {
    id: 'r4',
    text: 'A famous concert venue that has hosted musicians for over 100 years announced it will close permanently next year. Artists from jazz, rock, classical, and country music have all performed there. Fans have started a petition to save the building.',
  },
  {
    id: 'r5',
    text: 'A middle school student in Ohio created an app that helps deaf students feel music through vibrations in a special chair. The app pairs with a phone and sends vibration patterns that match the rhythm and bass of any song. She won a national science fair with the invention.',
  },
];

const TIMER_DURATION = 90; // seconds

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

const HeadlineWriterGame = ({ sessionData, onComplete }) => {
  const { sessionCode: contextSessionCode, classId } = useSession();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = contextSessionCode || sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  // Compute Firebase paths based on session type
  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/headlineWriter`;
    if (sessionCode) return `sessions/${sessionCode}/headlineWriter`;
    return null;
  }, [classId, sessionCode]);

  const studentsPath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [currentRound, setCurrentRound] = useState(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef(null);

  // Students
  const [students, setStudents] = useState([]);
  const [submittedCount, setSubmittedCount] = useState(0);

  // Headlines for current round
  const [headlines, setHeadlines] = useState([]);

  // Vote counts
  const [voteCounts, setVoteCounts] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);

  // Round winners tracking
  const [roundWinners, setRoundWinners] = useState([]);

  // Winner animation
  const [showConfetti, setShowConfetti] = useState(false);

  const currentSummary = SUMMARIES[currentRound] || null;

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!gamePath) return;
    const db = getDatabase();
    update(ref(db, gamePath), data);
  }, [gamePath]);

  // Firebase: Subscribe to students
  useEffect(() => {
    if (!studentsPath) return;
    const db = getDatabase();
    const studentsRef = ref(db, studentsPath);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([, s]) => s.displayName || s.playerName || s.name)
        .map(([id, s]) => ({
          id,
          name: formatFirstNameLastInitial(s.displayName || s.playerName || s.name),
          headline: s.headlineWriterHeadline || null,
          vote: s.headlineWriterVote || null,
          wins: s.headlineWriterWins || 0,
          score: s.headlineWriterScore || 0,
        }));

      setStudents(list);

      // Count submissions
      const submitted = list.filter(s => s.headline && s.headline.trim().length > 0);
      setSubmittedCount(submitted.length);

      // Build headlines list
      const headlineList = submitted.map(s => ({
        uid: s.id,
        headline: s.headline,
        name: s.name,
      }));
      setHeadlines(headlineList);

      // Count votes
      const counts = {};
      let voteTotal = 0;
      list.forEach(s => {
        if (s.vote) {
          counts[s.vote] = (counts[s.vote] || 0) + 1;
          voteTotal++;
        }
      });
      setVoteCounts(counts);
      setTotalVotes(voteTotal);
    });

    return () => unsubscribe();
  }, [studentsPath]);

  // Timer effect
  useEffect(() => {
    if (gamePhase === 'writing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gamePhase, timeLeft]);

  // Clear student fields for new round
  const clearStudentFields = useCallback(() => {
    if (!studentsPath) return;
    const db = getDatabase();
    students.forEach(s => {
      update(ref(db, `${studentsPath}/${s.id}`), {
        headlineWriterHeadline: null,
        headlineWriterVote: null,
      }).catch(() => {});
    });
  }, [studentsPath, students]);

  // Start game
  const startGame = useCallback(() => {
    setCurrentRound(0);
    setRoundWinners([]);
    setGamePhase('writing');
    setTimeLeft(TIMER_DURATION);

    // Reset all student scores and fields
    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsPath}/${s.id}`), {
          headlineWriterHeadline: null,
          headlineWriterVote: null,
          headlineWriterWins: 0,
          headlineWriterScore: 0,
        }).catch(() => {});
      });
    }

    const firstSummary = SUMMARIES[0];
    updateGame({
      phase: 'writing',
      currentRound: 0,
      summary: firstSummary.text,
      summaryId: firstSummary.id,
      timerStart: Date.now(),
      timerDuration: TIMER_DURATION,
      winnerUid: null,
    });
  }, [studentsPath, students, updateGame]);

  // Show submissions
  const showSubmissions = useCallback(() => {
    setGamePhase('submissions-display');
    if (timerRef.current) clearInterval(timerRef.current);

    updateGame({
      phase: 'submissions-display',
    });
  }, [updateGame]);

  // Start voting
  const startVoting = useCallback(() => {
    setGamePhase('voting');

    updateGame({
      phase: 'voting',
    });
  }, [updateGame]);

  // Reveal winner
  const revealWinner = useCallback(() => {
    // Find the headline with most votes
    let maxVotes = 0;
    let winnerUid = null;

    Object.entries(voteCounts).forEach(([uid, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        winnerUid = uid;
      }
    });

    // Handle tie — pick first alphabetically
    if (!winnerUid && headlines.length > 0) {
      winnerUid = headlines[0].uid;
    }

    const winnerHeadline = headlines.find(h => h.uid === winnerUid);

    setGamePhase('winner');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    // Award scores
    if (sessionCode) {
      const db = getDatabase();
      // +10 for everyone who submitted
      headlines.forEach(h => {
        const student = students.find(s => s.id === h.uid);
        const currentScore = student?.score || 0;
        const isWinner = h.uid === winnerUid;
        const bonus = isWinner ? 20 : 0;
        const newScore = currentScore + 10 + bonus;
        const newWins = (student?.wins || 0) + (isWinner ? 1 : 0);

        update(ref(db, `${studentsPath}/${h.uid}`), {
          headlineWriterScore: newScore,
          headlineWriterWins: newWins,
        }).catch(() => {});
      });
    }

    // Track round winner
    if (winnerHeadline) {
      setRoundWinners(prev => [...prev, {
        round: currentRound + 1,
        headline: winnerHeadline.headline,
        name: winnerHeadline.name,
        votes: maxVotes,
      }]);
    }

    updateGame({
      phase: 'winner',
      winnerUid: winnerUid,
      winnerVotes: maxVotes,
    });
  }, [voteCounts, headlines, students, sessionCode, currentRound, updateGame]);

  // Next round
  const nextRound = useCallback(() => {
    clearStudentFields();

    const nextIdx = currentRound + 1;

    if (nextIdx >= SUMMARIES.length) {
      setGamePhase('finished');
      updateGame({ phase: 'finished', winnerUid: null });
    } else {
      setCurrentRound(nextIdx);
      setGamePhase('writing');
      setTimeLeft(TIMER_DURATION);

      const nextSummary = SUMMARIES[nextIdx];
      updateGame({
        phase: 'writing',
        currentRound: nextIdx,
        summary: nextSummary.text,
        summaryId: nextSummary.id,
        timerStart: Date.now(),
        timerDuration: TIMER_DURATION,
        winnerUid: null,
      });
    }
  }, [currentRound, clearStudentFields, updateGame]);

  // Build sorted leaderboard
  const leaderboard = students
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score || b.wins - a.wins);

  // Timer display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 30 ? '#f59e0b' : '#10b981';

  return (
    <div className="min-h-screen h-full flex flex-col text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <ActivityBanner />

      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{'\uD83D\uDCF0'}</span>
            <h1 className="text-2xl font-bold">Headline Writer</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Round {currentRound + 1}/{SUMMARIES.length}
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
            {SUMMARIES.map((s, idx) => {
              const isComplete = idx < currentRound || (idx === currentRound && (gamePhase === 'winner'));
              const isCurrent = idx === currentRound && gamePhase !== 'winner';
              return (
                <div
                  key={s.id}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-white scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: isComplete ? '#c9952b' : 'rgba(255,255,255,0.1)',
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
          <div className="rounded-2xl p-6 flex flex-col items-center justify-center min-h-0 h-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>

            {/* ==================== SETUP ==================== */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <div className="text-6xl mb-4">{'\uD83D\uDCF0'}</div>
                <h2 className="text-3xl font-bold mb-3">Headline Writer</h2>
                <p className="text-lg text-white/70 mb-2">Read the news summary. Write the best headline you can!</p>
                <p className="text-base text-white/50 mb-4">The class votes on the best headline each round.</p>

                <div className="flex flex-wrap gap-4 justify-center mb-8">
                  <div className="bg-white/10 px-6 py-3 rounded-xl text-lg">
                    <PenLine size={20} className="inline mr-2" />5 rounds
                  </div>
                  <div className="bg-white/10 px-6 py-3 rounded-xl text-lg">
                    <Timer size={20} className="inline mr-2" />90 seconds to write
                  </div>
                  <div className="bg-white/10 px-6 py-3 rounded-xl text-lg">
                    <Vote size={20} className="inline mr-2" />Class votes on best
                  </div>
                  <div className="bg-white/10 px-6 py-3 rounded-xl text-lg">
                    <Crown size={20} className="inline mr-2" />+10 submit, +20 win
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="px-10 py-5 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                  style={{ background: 'linear-gradient(to right, #c9952b, #a67c1a)' }}
                >
                  <Play size={40} /> Start Game
                </button>
              </div>
            )}

            {/* ==================== WRITING ==================== */}
            {gamePhase === 'writing' && currentSummary && (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                  <div className="w-full max-w-4xl">
                    {/* Timer */}
                    <div className="text-center mb-6">
                      <div
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-4xl font-black transition-colors"
                        style={{ backgroundColor: `${timerColor}20`, color: timerColor, border: `3px solid ${timerColor}40` }}
                      >
                        <Timer size={48} />
                        {minutes}:{seconds.toString().padStart(2, '0')}
                      </div>
                    </div>

                    {/* Summary card */}
                    <div className="rounded-3xl p-10 mb-6 text-center" style={{ backgroundColor: '#1a2744', border: '3px solid rgba(201, 149, 43, 0.4)' }}>
                      <div className="text-lg text-white/50 mb-4 uppercase tracking-widest font-medium">News Summary</div>
                      <div className="text-3xl font-bold leading-relaxed text-white/90">
                        {currentSummary.text}
                      </div>
                    </div>

                    {/* Submission count */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-3 bg-white/10 px-8 py-4 rounded-2xl">
                        <PenLine size={28} className="text-green-400" />
                        <span className="text-3xl font-black text-green-400">{submittedCount}</span>
                        <span className="text-xl text-white/70"> / {students.length} submitted</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-end mt-3 flex-shrink-0">
                  <button
                    onClick={showSubmissions}
                    className="px-8 py-4 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(to right, #c9952b, #a67c1a)' }}
                  >
                    Show Headlines <ChevronRight size={28} />
                  </button>
                </div>
              </div>
            )}

            {/* ==================== SUBMISSIONS DISPLAY ==================== */}
            {gamePhase === 'submissions-display' && (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 min-h-0 overflow-auto">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold mb-1">Headlines</h2>
                    <p className="text-lg text-white/50">{headlines.length} submitted</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-5xl mx-auto">
                    {headlines.map((h, idx) => (
                      <div
                        key={h.uid}
                        className="rounded-xl p-5 text-center"
                        style={{ backgroundColor: '#1a2744', border: '2px solid rgba(201, 149, 43, 0.3)' }}
                      >
                        <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Headline #{idx + 1}</div>
                        <div className="text-xl font-bold text-white leading-snug">{h.headline}</div>
                      </div>
                    ))}
                  </div>

                  {headlines.length === 0 && (
                    <div className="text-center text-white/50 text-xl mt-10">No headlines submitted yet.</div>
                  )}
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-end mt-3 flex-shrink-0">
                  <button
                    onClick={startVoting}
                    className="px-8 py-4 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(to right, #c9952b, #a67c1a)' }}
                  >
                    <Vote size={28} /> Start Voting
                  </button>
                </div>
              </div>
            )}

            {/* ==================== VOTING ==================== */}
            {gamePhase === 'voting' && (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 min-h-0 overflow-auto">
                  <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold mb-1">Vote for the Best Headline!</h2>
                    <p className="text-lg text-white/50">Students: tap your favorite on your device</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-5xl mx-auto">
                    {headlines.map((h, idx) => {
                      const voteCount = voteCounts[h.uid] || 0;
                      return (
                        <div
                          key={h.uid}
                          className="rounded-xl p-5 text-center relative"
                          style={{ backgroundColor: '#1a2744', border: '2px solid rgba(201, 149, 43, 0.3)' }}
                        >
                          <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Headline #{idx + 1}</div>
                          <div className="text-xl font-bold text-white leading-snug mb-3">{h.headline}</div>
                          {voteCount > 0 && (
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: 'rgba(201, 149, 43, 0.3)', color: '#c9952b' }}>
                              {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between mt-3 flex-shrink-0">
                  <div className="bg-white/10 rounded-2xl px-6 py-3">
                    <span className="text-3xl font-black text-green-400">{totalVotes}</span>
                    <span className="text-lg text-white/70"> / {students.length} voted</span>
                  </div>
                  <button
                    onClick={revealWinner}
                    className="px-8 py-4 rounded-2xl text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                    style={{ background: 'linear-gradient(to right, #c9952b, #a67c1a)' }}
                  >
                    <Crown size={28} /> Reveal Winner
                  </button>
                </div>
              </div>
            )}

            {/* ==================== WINNER ==================== */}
            {gamePhase === 'winner' && (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                {/* Confetti effect */}
                {showConfetti && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute animate-bounce"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          fontSize: `${16 + Math.random() * 20}px`,
                          animationDelay: `${Math.random() * 1}s`,
                          animationDuration: `${0.5 + Math.random() * 1}s`,
                          opacity: 0.8,
                        }}
                      >
                        {['\u2B50', '\uD83C\uDF1F', '\u2728', '\uD83C\uDFC6', '\uD83E\uDD47'][Math.floor(Math.random() * 5)]}
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center z-10">
                  <div className="text-5xl mb-3">{'\uD83C\uDFC6'}</div>
                  <h2 className="text-3xl font-bold mb-2">Round {currentRound + 1} Winner!</h2>

                  {/* Winning headline */}
                  {(() => {
                    // Find winner
                    let winnerUid = null;
                    let maxVotes = 0;
                    Object.entries(voteCounts).forEach(([uid, count]) => {
                      if (count > maxVotes) {
                        maxVotes = count;
                        winnerUid = uid;
                      }
                    });

                    const winnerH = headlines.find(h => h.uid === winnerUid);
                    if (!winnerH) return <p className="text-xl text-white/50">No votes cast</p>;

                    return (
                      <div className="max-w-3xl mx-auto">
                        <div
                          className="rounded-3xl p-8 mb-4"
                          style={{ backgroundColor: '#1a2744', border: '3px solid #c9952b', boxShadow: '0 0 40px rgba(201, 149, 43, 0.3)' }}
                        >
                          <div className="text-3xl font-black leading-snug mb-3" style={{ color: '#c9952b' }}>
                            &ldquo;{winnerH.headline}&rdquo;
                          </div>
                          <div className="text-lg text-white/50">{maxVotes} {maxVotes === 1 ? 'vote' : 'votes'}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Next round button */}
                <div className="mt-6 z-10">
                  <button
                    onClick={nextRound}
                    className="px-10 py-5 rounded-2xl text-3xl font-bold hover:scale-105 transition-all flex items-center gap-3"
                    style={{ background: 'linear-gradient(to right, #c9952b, #a67c1a)' }}
                  >
                    {currentRound >= SUMMARIES.length - 1 ? (
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
                  <div className="text-5xl mb-3">{'\uD83C\uDFC6'}</div>
                  <h2 className="text-3xl font-black mb-2">Game Complete!</h2>
                  <p className="text-lg text-white/70">Final Leaderboard</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl">
                  {/* Leaderboard */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white/70 mb-3 text-center">Top Scores</h3>
                    {leaderboard.length > 0 && (
                      <div className="w-full max-w-lg mx-auto">
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
                              <div className="text-sm text-white/50 mr-2">{entry.wins}W</div>
                              <div className="text-2xl font-black" style={{ color: '#c9952b' }}>{entry.score}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Winning headlines */}
                  {roundWinners.length > 0 && (
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white/70 mb-3 text-center">Winning Headlines</h3>
                      <div className="space-y-3">
                        {roundWinners.map((w, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl p-4"
                            style={{ backgroundColor: '#1a2744', border: '2px solid rgba(201, 149, 43, 0.3)' }}
                          >
                            <div className="text-xs text-white/40 mb-1">Round {w.round}</div>
                            <div className="text-lg font-bold" style={{ color: '#c9952b' }}>&ldquo;{w.headline}&rdquo;</div>
                            <div className="text-sm text-white/50 mt-1">{w.votes} {w.votes === 1 ? 'vote' : 'votes'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onComplete?.()}
                  className="mt-8 px-10 py-5 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3"
                  style={{ background: 'linear-gradient(to right, #c9952b, #a67c1a)' }}
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

export default HeadlineWriterGame;
