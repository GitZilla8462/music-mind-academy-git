// File: HeadlineWriterStudentView.jsx
// Headline Writer - Student View (syncs with teacher's class game)
// Students read a summary, write a headline, then vote on the best one.
// Follows exact same Firebase pattern as FactOpinionStudentView

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, Trophy, Award, Medal, PenLine, Timer } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { getPlayerColor, getPlayerEmoji, getStudentDisplayName, formatFirstNameLastInitial } from '../layer-detective/nameGenerator';

const HEADLINE_MAX_LENGTH = 100;

const HeadlineWriterStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, classId, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

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

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [playerEmoji, setPlayerEmoji] = useState('\uD83C\uDFB5');

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [summary, setSummary] = useState('');
  const [timerStart, setTimerStart] = useState(null);
  const [timerDuration, setTimerDuration] = useState(90);
  const [winnerUid, setWinnerUid] = useState(null);
  const [winnerVotes, setWinnerVotes] = useState(0);

  // Timer display
  const [timeLeft, setTimeLeft] = useState(90);

  // Student's headline
  const [headline, setHeadline] = useState('');
  const [headlineSubmitted, setHeadlineSubmitted] = useState(false);

  // Voting
  const [allHeadlines, setAllHeadlines] = useState([]);
  const [selectedVote, setSelectedVote] = useState(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  // Results
  const [myScore, setMyScore] = useState(0);
  const [myWins, setMyWins] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Leaderboard for finished screen
  const [leaderboard, setLeaderboard] = useState([]);

  // Refs for stale closure prevention
  const currentRoundRef = useRef(0);
  const myScoreRef = useRef(0);
  const gamePhaseRef = useRef('waiting');

  // Get player name on mount - use real name (first name last initial)
  useEffect(() => {
    if (!userId) return;

    const assignPlayerName = async () => {
      const color = getPlayerColor(userId);
      const emoji = getPlayerEmoji(userId);
      const name = await getStudentDisplayName(userId, null, studentsPath);

      setPlayerName(name);
      setPlayerColor(color);
      setPlayerEmoji(emoji);

      if (studentsPath) {
        const { getDatabase, ref, update } = await import('firebase/database');
        const db = getDatabase();
        update(ref(db, `${studentsPath}/${userId}`), {
          displayName: name,
          playerColor: color,
          playerEmoji: emoji
        });
      }
    };

    assignPlayerName();
  }, [userId, studentsPath]);

  // Keep refs in sync
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { myScoreRef.current = myScore; }, [myScore]);
  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);

  // Listen for game state updates from teacher
  useEffect(() => {
    if (!gamePath) return;

    const db = getDatabase();
    const gameRef = ref(db, gamePath);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setGamePhase('waiting');
        return;
      }

      const newPhase = data.phase || 'waiting';
      const newRound = data.currentRound || 0;

      setGamePhase(newPhase);
      setCurrentRound(newRound);
      setSummary(data.summary || '');
      setTimerStart(data.timerStart || null);
      setTimerDuration(data.timerDuration || 90);
      setWinnerUid(data.winnerUid || null);
      setWinnerVotes(data.winnerVotes || 0);

      // New round — reset student state
      if (newPhase === 'writing' && newRound !== currentRoundRef.current) {
        setHeadline('');
        setHeadlineSubmitted(false);
        setSelectedVote(null);
        setVoteSubmitted(false);
        setAllHeadlines([]);
        setPointsEarned(0);
      }

      // Submissions display or voting — load all headlines
      if (newPhase === 'submissions-display' || newPhase === 'voting') {
        // Load headlines from other students
        if (studentsPath) {
          const studentsRef = ref(db, studentsPath);
          get(studentsRef).then(snap => {
            const studentsData = snap.val() || {};
            const hList = Object.entries(studentsData)
              .filter(([, s]) => s.headlineWriterHeadline && s.headlineWriterHeadline.trim().length > 0)
              .map(([id, s]) => ({
                uid: id,
                headline: s.headlineWriterHeadline,
                isOwn: id === userId,
              }));
            setAllHeadlines(hList);
          }).catch(() => {});
        }
      }
    });

    return () => unsubscribe();
  }, [gamePath, studentsPath, userId]);

  // Timer countdown
  useEffect(() => {
    if (gamePhase !== 'writing' || !timerStart) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
      const remaining = Math.max(0, timerDuration - elapsed);
      setTimeLeft(remaining);
    }, 500);

    return () => clearInterval(interval);
  }, [gamePhase, timerStart, timerDuration]);

  // Listen for own score updates
  useEffect(() => {
    if (!studentsPath || !userId) return;

    const db = getDatabase();
    const myRef = ref(db, `${studentsPath}/${userId}`);

    const unsubscribe = onValue(myRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const newScore = data.headlineWriterScore || 0;
      const newWins = data.headlineWriterWins || 0;
      if (newScore > myScoreRef.current) {
        setPointsEarned(newScore - myScoreRef.current);
      }
      setMyScore(newScore);
      setMyWins(newWins);
    });

    return () => unsubscribe();
  }, [studentsPath, userId]);

  // Build leaderboard when finished
  useEffect(() => {
    if (gamePhase !== 'finished' || !studentsPath) return;

    const db = getDatabase();
    const studentsRef = ref(db, studentsPath);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const board = Object.entries(data)
        .filter(([, s]) => s.displayName || s.playerName || s.name)
        .map(([id, s]) => ({
          id,
          name: formatFirstNameLastInitial(s.displayName || s.playerName || s.name),
          score: s.headlineWriterScore || 0,
          wins: s.headlineWriterWins || 0,
          isMe: id === userId,
        }))
        .sort((a, b) => b.score - a.score || b.wins - a.wins);
      setLeaderboard(board);
    });

    return () => unsubscribe();
  }, [gamePhase, studentsPath, userId]);

  // Submit headline
  const submitHeadline = () => {
    if (headlineSubmitted || !headline.trim() || gamePhase !== 'writing') return;

    setHeadlineSubmitted(true);

    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        headlineWriterHeadline: headline.trim(),
      });
    }
  };

  // Submit vote
  const submitVote = (targetUid) => {
    if (voteSubmitted || targetUid === userId || gamePhase !== 'voting') return;

    setSelectedVote(targetUid);
    setVoteSubmitted(true);

    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        headlineWriterVote: targetUid,
      });
    }
  };

  // Timer display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 30 ? '#f59e0b' : '#10b981';

  // ============ FINISHED ============
  if (gamePhase === 'finished') {
    const myRank = leaderboard.findIndex(e => e.isMe) + 1;

    return (
      <div className="h-screen flex flex-col items-center justify-center p-4 overflow-auto" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="text-center mb-4">
          <div className="text-7xl mb-3">{'\uD83C\uDFC6'}</div>
          <h1 className="text-3xl font-bold text-white mb-1">Game Complete!</h1>
          <p className="text-lg text-white/70">Your Score: <span className="font-black text-2xl" style={{ color: '#c9952b' }}>{myScore}</span></p>
          <p className="text-sm text-white/50">Rounds Won: {myWins}</p>
          {myRank > 0 && (
            <p className="text-sm text-white/50">Rank: #{myRank} of {leaderboard.length}</p>
          )}
        </div>

        {/* Mini leaderboard */}
        <div className="w-full max-w-sm">
          {leaderboard.slice(0, 5).map((entry, idx) => {
            const rankIcon = idx === 0 ? <Trophy size={18} className="text-yellow-400" /> :
                             idx === 1 ? <Award size={18} className="text-gray-300" /> :
                             idx === 2 ? <Medal size={18} className="text-amber-600" /> : null;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl mb-1 ${
                  entry.isMe ? 'bg-yellow-500/20 ring-2 ring-yellow-400' : 'bg-white/5'
                }`}
              >
                <div className="w-6 text-center">
                  {rankIcon || <span className="text-sm font-bold text-white/50">{idx + 1}</span>}
                </div>
                <div className="flex-1 text-sm font-bold truncate text-white">{entry.name} {entry.isMe ? '(you)' : ''}</div>
                <div className="text-sm text-white/50 mr-1">{entry.wins}W</div>
                <div className="text-lg font-black" style={{ color: '#c9952b' }}>{entry.score}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ============ WAITING ============
  if (gamePhase === 'waiting' || gamePhase === 'setup') {
    return (
      <div className="h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Headline Writer</h1>
          <p className="text-xl text-indigo-200 mb-8">Waiting for teacher to start...</p>

          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <span className="text-4xl mb-2 block">{playerEmoji}</span>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
        </div>
      </div>
    );
  }

  // ============ WRITING ============
  if (gamePhase === 'writing') {
    return (
      <div className="h-screen flex flex-col p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: playerColor }}
            >
              {playerEmoji}
            </div>
            <div className="text-lg font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-3 py-1 rounded-xl">
              <span className="text-sm text-white/70">Score: </span>
              <span className="text-lg font-black" style={{ color: '#c9952b' }}>{myScore}</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl">
              <div className="text-sm text-indigo-200">Round {currentRound + 1}/5</div>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-3">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-3xl font-black"
            style={{ backgroundColor: `${timerColor}20`, color: timerColor, border: `2px solid ${timerColor}40` }}
          >
            <Timer size={24} />
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl p-4 mb-3 text-center" style={{ backgroundColor: '#1a2744', border: '2px solid rgba(201, 149, 43, 0.3)' }}>
          <div className="text-xs text-white/40 uppercase tracking-wider mb-2">News Summary</div>
          <div className="text-base font-medium text-white/90 leading-relaxed">
            {summary}
          </div>
        </div>

        {/* Headline input or submitted confirmation */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {!headlineSubmitted ? (
            <div className="w-full max-w-md">
              <label className="block text-sm text-white/60 mb-2 text-center">Write your headline:</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value.slice(0, HEADLINE_MAX_LENGTH))}
                placeholder="Type your headline here..."
                className="w-full px-5 py-4 rounded-xl text-lg font-bold text-white placeholder-white/30 outline-none focus:ring-2"
                style={{ backgroundColor: '#1a2744', border: '2px solid rgba(201, 149, 43, 0.4)', focusRingColor: '#c9952b' }}
                maxLength={HEADLINE_MAX_LENGTH}
              />
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-sm text-white/40">{headline.length}/{HEADLINE_MAX_LENGTH}</span>
                <span className="text-sm text-white/40">{HEADLINE_MAX_LENGTH - headline.length} left</span>
              </div>
              <button
                onClick={submitHeadline}
                disabled={!headline.trim()}
                className="w-full mt-4 py-4 rounded-xl text-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                style={{ background: headline.trim() ? 'linear-gradient(to right, #c9952b, #a67c1a)' : '#374151' }}
              >
                <PenLine size={20} className="inline mr-2" />
                Submit Headline
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-white/20 rounded-2xl p-8 inline-block">
                <Check size={48} className="mx-auto text-green-400 mb-4" />
                <p className="text-xl text-white font-bold mb-3">Headline Submitted!</p>
                <div
                  className="inline-block px-6 py-3 rounded-xl text-white font-bold text-lg max-w-sm"
                  style={{ backgroundColor: '#1a2744', border: '2px solid rgba(201, 149, 43, 0.4)' }}
                >
                  &ldquo;{headline}&rdquo;
                </div>
                <p className="text-sm text-indigo-300 mt-4">Waiting for others...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ SUBMISSIONS DISPLAY ============
  if (gamePhase === 'submissions-display') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">{'\uD83D\uDCF0'}</div>
          <h1 className="text-3xl font-bold text-white mb-2">Headlines Are In!</h1>
          <p className="text-xl text-indigo-200">Watch the main screen to see all headlines</p>
          <p className="text-lg text-white/50 mt-2">Voting starts soon...</p>
        </div>
      </div>
    );
  }

  // ============ VOTING ============
  if (gamePhase === 'voting') {
    return (
      <div className="h-screen flex flex-col p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: playerColor }}
            >
              {playerEmoji}
            </div>
            <div className="text-lg font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-xl">
            <span className="text-sm text-white/70">Score: </span>
            <span className="text-lg font-black" style={{ color: '#c9952b' }}>{myScore}</span>
          </div>
        </div>

        {!voteSubmitted ? (
          <>
            <div className="text-center mb-3">
              <h2 className="text-2xl font-bold text-white">Tap your favorite headline!</h2>
              <p className="text-sm text-white/50">You cannot vote for your own</p>
            </div>

            <div className="flex-1 overflow-auto space-y-3 min-h-0">
              {allHeadlines.map((h, idx) => {
                if (h.isOwn) return null;
                return (
                  <button
                    key={h.uid}
                    onClick={() => submitVote(h.uid)}
                    className="w-full rounded-xl p-5 text-left transition-all hover:scale-[1.02] active:scale-95"
                    style={{ backgroundColor: '#1a2744', border: '2px solid rgba(201, 149, 43, 0.3)' }}
                  >
                    <div className="text-xs text-white/40 mb-1 uppercase tracking-wider">Headline #{idx + 1}</div>
                    <div className="text-lg font-bold text-white leading-snug">{h.headline}</div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white/20 rounded-2xl p-8 inline-block">
                <Check size={48} className="mx-auto text-green-400 mb-4" />
                <p className="text-xl text-white font-bold mb-2">Vote Submitted!</p>
                <p className="text-sm text-indigo-300">Waiting for results...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============ WINNER ============
  if (gamePhase === 'winner') {
    const iWon = winnerUid === userId;
    const winnerHeadline = allHeadlines.find(h => h.uid === winnerUid);

    return (
      <div className="h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="text-center">
          {iWon ? (
            <>
              <div className="text-8xl mb-4">{'\uD83C\uDFC6'}</div>
              <h1 className="text-4xl font-bold text-white mb-2">Your Headline Won!</h1>
              <div
                className="rounded-2xl p-6 mb-4 max-w-sm mx-auto"
                style={{ backgroundColor: '#1a2744', border: '3px solid #c9952b', boxShadow: '0 0 30px rgba(201, 149, 43, 0.3)' }}
              >
                <div className="text-xl font-bold leading-snug" style={{ color: '#c9952b' }}>
                  &ldquo;{headline}&rdquo;
                </div>
              </div>
              {pointsEarned > 0 && (
                <p className="text-xl font-bold" style={{ color: '#c9952b' }}>+{pointsEarned} points</p>
              )}
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">{'\uD83D\uDCF0'}</div>
              <h1 className="text-3xl font-bold text-white mb-2">Round {currentRound + 1} Winner</h1>
              {winnerHeadline && (
                <div
                  className="rounded-2xl p-6 mb-4 max-w-sm mx-auto"
                  style={{ backgroundColor: '#1a2744', border: '3px solid #c9952b' }}
                >
                  <div className="text-xl font-bold leading-snug" style={{ color: '#c9952b' }}>
                    &ldquo;{winnerHeadline.headline}&rdquo;
                  </div>
                  <div className="text-sm text-white/50 mt-2">{winnerVotes} {winnerVotes === 1 ? 'vote' : 'votes'}</div>
                </div>
              )}
              {pointsEarned > 0 && (
                <p className="text-lg font-bold" style={{ color: '#c9952b' }}>+{pointsEarned} points (submitted)</p>
              )}
            </>
          )}
          <p className="text-sm text-indigo-300 mt-4">Next round coming...</p>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Headline Writer</h1>
        <p className="text-xl text-indigo-200">Loading...</p>
      </div>
    </div>
  );
};

export default HeadlineWriterStudentView;
