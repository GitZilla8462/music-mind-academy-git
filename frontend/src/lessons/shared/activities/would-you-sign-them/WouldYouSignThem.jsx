// File: WouldYouSignThem.jsx
// Would You Sign Them? — Small Group Game
// 8 evidence statements — players identify which of the 4 checklist points each supports
// Groups of 2–3, join with 4-digit codes, speed bonus scoring
// Teacher view === student view (like Sign or Pass)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Trophy, Crown, Check, Star } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get, set } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji, formatFirstNameLastInitial } from '../layer-detective/nameGenerator';
import { TOTAL_ROUNDS, ANSWER_TIME, CHECKLIST_OPTIONS, STATEMENTS, shuffleArray, calculateScore } from './wouldYouSignThemConfig';
import DirectionsModal, { DirectionsReopenButton } from '../../components/DirectionsModal';

const WouldYouSignThem = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, userId: contextUserId } = useSession();
  const classCode = new URLSearchParams(window.location.search).get('classCode');
  const effectiveSessionCode = sessionCode || classCode;
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [playerEmoji, setPlayerEmoji] = useState('');

  // Group state
  const [groupCode, setGroupCode] = useState('');
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [hasJoinedGroup, setHasJoinedGroup] = useState(false);
  const [members, setMembers] = useState({});
  const [isCreator, setIsCreator] = useState(false);

  // Game state (synced from Firebase)
  const [gamePhase, setGamePhase] = useState('lobby'); // lobby, answering, revealed, finished
  const [currentRound, setCurrentRound] = useState(0);
  const [memberOrder, setMemberOrder] = useState([]);
  const [currentStatement, setCurrentStatement] = useState(null);
  const [answers, setAnswers] = useState({}); // { userId: { answer, answeredAt } }
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [statementOrder, setStatementOrder] = useState([]); // shuffled statement IDs
  const [roundScores, setRoundScores] = useState({}); // { oderId: pointsThisRound }
  const [readyForNext, setReadyForNext] = useState({});
  const [myScore, setMyScore] = useState(0);

  // Local state
  const [myAnswer, setMyAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [imReady, setImReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  // UI state
  const [error, setError] = useState('');
  const [showDirections, setShowDirections] = useState(true);

  // Refs
  const listenersRef = useRef([]);
  const revealInProgressRef = useRef(false);
  const memberOrderRef = useRef([]);
  const gamePhaseRef = useRef('lobby');
  const roundStartTimeRef = useRef(null);
  const currentRoundRef = useRef(0);
  const statementOrderRef = useRef([]);

  // Keep refs in sync
  useEffect(() => { memberOrderRef.current = memberOrder; }, [memberOrder]);
  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);
  useEffect(() => { roundStartTimeRef.current = roundStartTime; }, [roundStartTime]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { statementOrderRef.current = statementOrder; }, [statementOrder]);

  // Get player identity on mount
  useEffect(() => {
    if (!userId) return;
    const assignPlayerName = async () => {
      const color = getPlayerColor(userId);
      const emoji = getPlayerEmoji(userId);
      let name;
      if (effectiveSessionCode) {
        try {
          const db = getDatabase();
          const studentRef = ref(db, `sessions/${effectiveSessionCode}/studentsJoined/${userId}/name`);
          const snapshot = await get(studentRef);
          if (snapshot.exists()) name = snapshot.val();
        } catch { /* fallback */ }
      }
      if (!name) name = localStorage.getItem('current-session-studentName');
      const displayName = name ? formatFirstNameLastInitial(name) : generateUniquePlayerName(userId, []);
      setPlayerName(displayName);
      setPlayerColor(color);
      setPlayerEmoji(emoji);
    };
    assignPlayerName();
  }, [userId, effectiveSessionCode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      listenersRef.current.forEach(unsub => unsub());
    };
  }, []);

  // Helper: get Firebase group path
  const getGroupPath = useCallback((code) => {
    return `sessions/${effectiveSessionCode}/wouldYouSignThemGroups/${code}`;
  }, [effectiveSessionCode]);

  // ============ GROUP CREATION / JOINING ============

  const generateGroupCode = async () => {
    const db = getDatabase();
    let code;
    let attempts = 0;
    do {
      code = String(Math.floor(1000 + Math.random() * 9000));
      const snapshot = await get(ref(db, getGroupPath(code)));
      if (!snapshot.exists()) break;
      attempts++;
    } while (attempts < 10);
    return code;
  };

  const createGroup = async () => {
    if (!effectiveSessionCode || !userId) return;
    setError('');
    try {
      const db = getDatabase();
      const code = await generateGroupCode();
      await set(ref(db, getGroupPath(code)), {
        members: {
          [userId]: { name: playerName, color: playerColor, emoji: playerEmoji, score: 0, joinedAt: Date.now() }
        },
        game: { phase: 'lobby', currentRound: 0, totalRounds: TOTAL_ROUNDS }
      });
      setGroupCode(code);
      setHasJoinedGroup(true);
      setIsCreator(true);
      subscribeToGroup(code);
    } catch (err) {
      setError('Failed to create group. Try again.');
      console.error('Create group error:', err);
    }
  };

  const joinGroup = async () => {
    if (!effectiveSessionCode || !userId || !groupCodeInput) return;
    setError('');
    const code = groupCodeInput.trim();
    if (code.length !== 4 || isNaN(code)) { setError('Enter a 4-digit group code.'); return; }
    try {
      const db = getDatabase();
      const snapshot = await get(ref(db, getGroupPath(code)));
      if (!snapshot.exists()) { setError('Group not found. Check the code.'); return; }
      const groupData = snapshot.val();
      if (groupData.game?.phase === 'finished') { setError('Game is over. Ask the host to start a new one.'); return; }
      const memberCount = groupData.members ? Object.keys(groupData.members).length : 0;
      if (memberCount >= 3) { setError('Group is full (max 3 players).'); return; }
      await update(ref(db, `${getGroupPath(code)}/members/${userId}`), {
        name: playerName, color: playerColor, emoji: playerEmoji, score: 0, joinedAt: Date.now()
      });
      setGroupCode(code);
      setHasJoinedGroup(true);
      subscribeToGroup(code);
    } catch (err) {
      setError('Failed to join group. Try again.');
      console.error('Join group error:', err);
    }
  };

  // ============ FIREBASE SUBSCRIPTION ============

  const subscribeToGroup = useCallback((code) => {
    const db = getDatabase();
    const membersUnsub = onValue(ref(db, `${getGroupPath(code)}/members`), (snap) => {
      const data = snap.val() || {};
      setMembers(data);
      if (data[userId]) setMyScore(data[userId].score || 0);
    });
    const gameUnsub = onValue(ref(db, `${getGroupPath(code)}/game`), (snap) => {
      const data = snap.val();
      if (!data) return;
      setGamePhase(data.phase || 'lobby');
      setCurrentRound(data.currentRound || 0);
      setMemberOrder(data.memberOrder || []);
      setStatementOrder(data.statementOrder || []);
      setRoundStartTime(data.roundStartTime || null);
      setRoundScores(data.roundScores || {});
      setReadyForNext(data.readyForNext || {});

      // Current statement
      if (data.currentStatement) {
        setCurrentStatement(data.currentStatement);
      }

      // Answers
      const ans = data.answers || {};
      setAnswers(ans);
      setAnsweredCount(Object.keys(ans).length);

      // Reset local answer state on new round
      if (data.phase === 'answering' && !ans[userId]) {
        setMyAnswer(null);
        setAnswerLocked(false);
      }

      if (data.phase === 'answering' || data.phase === 'lobby') {
        setImReady(false);
      }
    });
    listenersRef.current.push(membersUnsub, gameUnsub);
  }, [getGroupPath, userId]);

  // ============ COUNTDOWN TIMER ============

  useEffect(() => {
    if (gamePhase !== 'answering' || !roundStartTime) { setCountdown(null); return; }
    const tick = () => {
      const elapsed = Date.now() - roundStartTime;
      setCountdown(Math.max(0, Math.ceil((ANSWER_TIME - elapsed) / 1000)));
    };
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [gamePhase, roundStartTime]);

  // ============ AUTO-REVEAL WHEN ALL ANSWERED OR TIME UP ============

  const doReveal = useCallback(async () => {
    if (gamePhaseRef.current !== 'answering') return;
    if (revealInProgressRef.current) return;
    revealInProgressRef.current = true;

    try {
      const db = getDatabase();
      const groupPath = `sessions/${effectiveSessionCode}/wouldYouSignThemGroups/${groupCode}`;

      const currentPhase = (await get(ref(db, `${groupPath}/game/phase`))).val();
      if (currentPhase !== 'answering') {
        revealInProgressRef.current = false;
        return;
      }

      const currentAnswers = (await get(ref(db, `${groupPath}/game/answers`))).val() || {};
      const currentMembers = (await get(ref(db, `${groupPath}/members`))).val() || {};
      const currentStmt = (await get(ref(db, `${groupPath}/game/currentStatement`))).val();
      const startTime = (await get(ref(db, `${groupPath}/game/roundStartTime`))).val();
      const order = memberOrderRef.current;

      // Calculate scores
      const scores = {};
      order.forEach(id => {
        const ans = currentAnswers[id];
        if (ans) {
          const isCorrect = ans.answer === currentStmt.answer;
          const elapsed = ans.answeredAt - startTime;
          scores[id] = calculateScore(isCorrect, elapsed);
        } else {
          scores[id] = 0;
        }
      });

      // Update member scores
      const scoreUpdates = {};
      order.forEach(id => {
        scoreUpdates[`members/${id}/score`] = (currentMembers[id]?.score || 0) + (scores[id] || 0);
      });

      await update(ref(db, groupPath), {
        'game/phase': 'revealed',
        'game/roundScores': scores,
        'game/readyForNext': null,
        ...scoreUpdates
      });
    } catch (err) {
      console.error('[WouldYouSignThem] doReveal error:', err);
    } finally {
      revealInProgressRef.current = false;
    }
  }, [effectiveSessionCode, groupCode]);

  // When all members have answered, trigger reveal
  useEffect(() => {
    if (gamePhase !== 'answering' || memberOrder.length === 0) return;
    const allAnswered = memberOrder.every(id => answers[id]);
    if (!allAnswered) return;

    const myIndex = memberOrder.indexOf(userId);
    const delay = 500 + (Math.max(0, myIndex) * 1500);
    const timer = setTimeout(() => {
      if (gamePhaseRef.current === 'answering') doReveal();
    }, delay);
    return () => clearTimeout(timer);
  }, [gamePhase, answers, memberOrder, userId, doReveal]);

  // Time-up auto-reveal
  useEffect(() => {
    if (gamePhase !== 'answering' || !roundStartTime || memberOrder.length === 0) return;
    const elapsed = Date.now() - roundStartTime;
    const remaining = Math.max(0, ANSWER_TIME - elapsed);
    const timer = setTimeout(() => {
      if (gamePhaseRef.current === 'answering') doReveal();
    }, remaining);
    return () => clearTimeout(timer);
  }, [gamePhase, roundStartTime, memberOrder, doReveal]);

  // ============ ANSWER SUBMISSION ============

  const submitAnswer = async (answerValue) => {
    if (answerLocked || gamePhase !== 'answering') return;
    setMyAnswer(answerValue);
    setAnswerLocked(true);

    try {
      const db = getDatabase();
      await update(ref(db, `${getGroupPath(groupCode)}/game/answers/${userId}`), {
        answer: answerValue,
        answeredAt: Date.now()
      });
    } catch (err) {
      console.error('[WouldYouSignThem] submitAnswer error:', err);
      setAnswerLocked(false);
      setMyAnswer(null);
    }
  };

  // ============ READY FOR NEXT ROUND ============

  const markReady = async () => {
    if (imReady) return;
    setImReady(true);
    const db = getDatabase();
    await update(ref(db, `${getGroupPath(groupCode)}/game/readyForNext`), { [userId]: true });
  };

  // Host advances when all members are ready
  useEffect(() => {
    if (gamePhase !== 'revealed') return;
    const amHost = memberOrder.length > 0 && memberOrder[0] === userId;
    if (!amHost) return;

    const allReady = memberOrder.length > 0 && memberOrder.every(id => readyForNext[id]);
    if (allReady) {
      const timer = setTimeout(() => advanceRound(), 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, readyForNext, memberOrder, userId]);

  // ============ GAME CONTROL FUNCTIONS ============

  const startGame = async () => {
    const db = getDatabase();
    const memberIds = Object.keys(members);
    if (memberIds.length < 2) return;

    const order = shuffleArray(memberIds);
    const stmtOrder = shuffleArray(STATEMENTS.map(s => s.id)).slice(0, TOTAL_ROUNDS);
    const firstStmt = STATEMENTS.find(s => s.id === stmtOrder[0]);

    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'answering',
      currentRound: 0,
      totalRounds: TOTAL_ROUNDS,
      memberOrder: order,
      statementOrder: stmtOrder,
      currentStatement: firstStmt,
      answers: null,
      roundStartTime: Date.now(),
      roundScores: null,
      readyForNext: null,
    });

    setMyAnswer(null);
    setAnswerLocked(false);
    setImReady(false);
    revealInProgressRef.current = false;
  };

  const advanceRound = async () => {
    const db = getDatabase();
    const nextRound = currentRoundRef.current + 1;

    if (nextRound >= TOTAL_ROUNDS) {
      await update(ref(db, `${getGroupPath(groupCode)}/game`), {
        phase: 'finished',
        currentRound: nextRound,
        answers: null,
        roundScores: null,
        readyForNext: null,
      });
      return;
    }

    const nextStmtId = statementOrderRef.current[nextRound];
    const nextStmt = STATEMENTS.find(s => s.id === nextStmtId);

    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'answering',
      currentRound: nextRound,
      currentStatement: nextStmt,
      answers: null,
      roundStartTime: Date.now(),
      roundScores: null,
      readyForNext: null,
    });

    setMyAnswer(null);
    setAnswerLocked(false);
    setImReady(false);
    revealInProgressRef.current = false;
  };

  const playAgain = async () => {
    const db = getDatabase();
    const memberIds = Object.keys(members);
    const order = shuffleArray(memberIds);
    const stmtOrder = shuffleArray(STATEMENTS.map(s => s.id)).slice(0, TOTAL_ROUNDS);
    const firstStmt = STATEMENTS.find(s => s.id === stmtOrder[0]);

    const scoreResets = {};
    memberIds.forEach(id => { scoreResets[`members/${id}/score`] = 0; });

    await update(ref(db, getGroupPath(groupCode)), {
      'game/phase': 'answering',
      'game/currentRound': 0,
      'game/totalRounds': TOTAL_ROUNDS,
      'game/memberOrder': order,
      'game/statementOrder': stmtOrder,
      'game/currentStatement': firstStmt,
      'game/answers': null,
      'game/roundStartTime': Date.now(),
      'game/roundScores': null,
      'game/readyForNext': null,
      ...scoreResets,
    });

    setMyAnswer(null);
    setAnswerLocked(false);
    setImReady(false);
    revealInProgressRef.current = false;
  };

  const leaveGroup = () => {
    listenersRef.current.forEach(unsub => unsub());
    listenersRef.current = [];
    setHasJoinedGroup(false);
    setGroupCode('');
    setGroupCodeInput('');
    setIsCreator(false);
    setGamePhase('lobby');
    setMembers({});
    setMyScore(0);
    setMyAnswer(null);
    setAnswerLocked(false);
  };

  const getMember = (id) => members[id] || { name: 'Player', color: '#666', emoji: '' };

  // ============ RENDER: JOIN SCREEN ============

  if (!hasJoinedGroup) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950 flex items-center justify-center p-4 overflow-y-auto">
        {!showDirections && <DirectionsReopenButton onClick={() => setShowDirections(true)} />}
        <DirectionsModal
          title="Would You Sign Them?"
          isOpen={showDirections}
          onClose={() => setShowDirections(false)}
          pages={[
            {
              title: 'The Scenario',
              items: [
                <>You're a talent agent reviewing evidence about new artists.</>,
                <>Your job: figure out <strong>which of the 4 checklist points</strong> each piece of evidence supports.</>,
                <>The faster you answer correctly, the more points you earn!</>,
                <>Can you and your group prove you know what to look for?</>
              ]
            },
            {
              title: 'How to Play',
              items: [
                <>Get into groups of <strong>2–3</strong></>,
                <>One person creates a group and shares the <strong>4-digit code</strong></>,
                <>Read the evidence statement and pick the right <strong>checklist point</strong></>,
                <>Score points for correct answers — <strong>speed matters!</strong></>
              ]
            }
          ]}
        />
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <span className="text-5xl block mb-3">{'\u{1F58A}\u{FE0F}'}</span>
            <h1 className="text-3xl font-bold text-white mb-2">Would You Sign Them?</h1>
            <p className="text-amber-200">Match the evidence to the checklist</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 mb-6 text-center">
            <span className="text-3xl">{playerEmoji}</span>
            <div className="text-lg font-bold mt-1" style={{ color: playerColor }}>{playerName}</div>
          </div>

          <button
            onClick={createGroup}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg mb-4 transition-all"
          >
            Create New Group
          </button>

          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm text-amber-200 mb-2 font-semibold">Or join an existing group:</p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit code"
                value={groupCodeInput}
                onChange={(e) => setGroupCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-xl font-mono tracking-widest placeholder-white/30 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={joinGroup}
                disabled={groupCodeInput.length !== 4}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Join
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-400/40 rounded-lg p-3 text-center">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ RENDER: LOBBY ============

  if (gamePhase === 'lobby') {
    const memberList = Object.entries(members);
    const canStart = isCreator && memberList.length >= 2;

    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white/10 rounded-2xl px-8 py-4 mb-6 text-center border border-white/20">
          <p className="text-sm text-amber-300 font-semibold mb-1">Group Code</p>
          <p className="text-5xl font-mono font-bold text-white tracking-[0.3em]">{groupCode}</p>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">
          <Users size={20} className="inline mr-2" />
          {memberList.length} Member{memberList.length !== 1 ? 's' : ''} {memberList.length >= 3 && <span className="text-amber-300 text-sm">(Full)</span>}
        </h2>

        <div className="w-full max-w-sm space-y-2 mb-6">
          {memberList.map(([id, member]) => (
            <div
              key={id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                id === userId ? 'bg-amber-500/30 ring-2 ring-amber-400' : 'bg-white/10'
              }`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: member.color }}>
                {member.emoji}
              </div>
              <span className="flex-1 text-white font-semibold truncate">{member.name}</span>
              {id === userId && <span className="text-xs bg-amber-500/50 text-amber-200 px-2 py-1 rounded-full">You</span>}
              {memberList[0]?.[0] === id && <Crown size={16} className="text-yellow-400" />}
            </div>
          ))}
        </div>

        {canStart ? (
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all flex items-center gap-2"
          >
            <Star size={24} /> Start Game
          </button>
        ) : isCreator ? (
          <p className="text-amber-300 text-lg">Need at least 2 members to start</p>
        ) : (
          <p className="text-amber-300 text-lg">Waiting for group creator to start...</p>
        )}

        <button onClick={leaveGroup} className="mt-6 text-amber-300 hover:text-white text-sm py-2 transition-colors">
          Leave Group
        </button>
      </div>
    );
  }

  // ============ RENDER: ANSWERING PHASE ============

  if (gamePhase === 'answering' && currentStatement) {
    const totalMembers = memberOrder.length;

    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950 flex flex-col p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-amber-300/70 font-mono">Group {groupCode} | Q{currentRound + 1}/{TOTAL_ROUNDS}</div>
          <div className="flex items-center gap-3">
            {countdown !== null && !answerLocked && (
              <span className={`text-sm font-bold ${countdown <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
                {countdown}s
              </span>
            )}
            <div className="bg-white/10 px-3 py-1 rounded-lg">
              <span className="text-yellow-300 font-bold">{myScore}</span>
              <span className="text-amber-300 text-xs ml-1">pts</span>
            </div>
          </div>
        </div>

        {/* Hide screen banner */}
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2 mb-2 text-center">
          <p className="text-red-300 text-sm font-bold">Don't show your screen to your group!</p>
        </div>

        {/* Question label */}
        <div className="text-center mb-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Which of the 4 Points?</span>
        </div>

        {/* Statement card */}
        <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 mb-3">
          <p className="text-white text-lg font-medium text-center leading-relaxed">
            "{currentStatement.text}"
          </p>
        </div>

        {!answerLocked ? (
          <>
            {/* 4 answer buttons */}
            <div className="flex-1 flex flex-col justify-center gap-2.5 max-w-lg mx-auto w-full">
              {CHECKLIST_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => submitAnswer(option.value)}
                  className="w-full py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                  style={{
                    backgroundColor: `${option.color}33`,
                    border: `2px solid ${option.color}66`,
                    color: 'white',
                  }}
                >
                  <span className="text-xl">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white/10 rounded-2xl p-8">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
                <Check size={32} className="text-white" />
              </div>
              <p className="text-xl font-bold text-white mb-2">Locked In!</p>
              <p className="text-amber-300 text-sm mb-3">
                You picked: {CHECKLIST_OPTIONS.find(o => o.value === myAnswer)?.label}
              </p>
              <p className="text-white/50 text-sm">
                {answeredCount}/{totalMembers} have answered
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============ RENDER: REVEALED PHASE ============

  if (gamePhase === 'revealed' && currentStatement) {
    const readyCount = Object.keys(readyForNext).length;
    const totalMembers = memberOrder.length;
    const correctOption = CHECKLIST_OPTIONS.find(o => o.value === currentStatement.answer);

    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950 flex flex-col p-4 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full">
          <div className="text-xs text-amber-300/70 font-mono mb-3 text-center">
            Group {groupCode} | Q{currentRound + 1}/{TOTAL_ROUNDS}
          </div>

          {/* Statement reminder */}
          <div className="bg-white/5 rounded-xl p-3 mb-3">
            <p className="text-white/70 text-sm text-center">"{currentStatement.text}"</p>
          </div>

          {/* Correct answer */}
          <div
            className="rounded-2xl p-4 mb-4 text-center border-2"
            style={{ backgroundColor: `${correctOption.color}22`, borderColor: `${correctOption.color}88` }}
          >
            <span className="text-3xl block mb-1">{correctOption.emoji}</span>
            <p className="text-white text-xl font-bold">{correctOption.label}</p>
            <p className="text-white/70 text-sm mt-2">{currentStatement.explanation}</p>
          </div>

          {/* Everyone's picks */}
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">Everyone's Picks</p>
            <div className="space-y-1.5">
              {memberOrder.map(id => {
                const m = getMember(id);
                const ans = answers[id];
                const isMe = id === userId;
                const isCorrect = ans?.answer === currentStatement.answer;
                const pickedOption = ans ? CHECKLIST_OPTIONS.find(o => o.value === ans.answer) : null;
                const pts = roundScores[id] || 0;

                return (
                  <div key={id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isMe ? 'bg-amber-500/15' : ''}`}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: m.color }}>
                      {m.emoji}
                    </div>
                    <span className={`text-sm font-semibold truncate ${isMe ? 'text-yellow-300' : 'text-white/70'}`}>
                      {isMe ? 'You' : m.name}
                    </span>
                    <span className="flex-1" />
                    {pickedOption ? (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          isCorrect ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
                        }`}
                      >
                        {isCorrect ? '\u2713' : '\u2717'} {pickedOption.label}
                      </span>
                    ) : (
                      <span className="text-xs text-white/30">No answer</span>
                    )}
                    {pts > 0 && (
                      <span className="text-green-400 text-xs font-bold ml-1">+{pts}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Score */}
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">Total Score</p>
            <div className="space-y-1.5">
              {memberOrder
                .map(id => ({ id, ...getMember(id), roundPts: roundScores[id] || 0 }))
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((member, idx) => (
                  <div key={member.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${member.id === userId ? 'bg-amber-500/20' : ''}`}>
                    <span className="text-sm w-6 text-center">
                      {idx === 0 ? '\u{1F947}' : idx === 1 ? '\u{1F948}' : idx === 2 ? '\u{1F949}' : `#${idx + 1}`}
                    </span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: member.color }}>
                      {member.emoji}
                    </div>
                    <span className="flex-1 text-white text-sm font-semibold truncate">
                      {member.id === userId ? 'You' : member.name}
                    </span>
                    <span className={`text-xs font-bold mr-2 ${member.roundPts > 0 ? 'text-green-400' : 'text-white/20'}`}>
                      +{member.roundPts}
                    </span>
                    <span className="text-yellow-300 text-lg font-bold">{member.score || 0}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="h-20 flex-shrink-0" />
        </div>

        {/* Sticky OK button */}
        <div className="sticky bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-6">
          <div className="max-w-lg mx-auto">
            {!imReady ? (
              <button
                onClick={markReady}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                <Check size={20} /> {currentRound + 1 >= TOTAL_ROUNDS ? 'OK — See Results' : 'OK — Next Question'}
              </button>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2.5 rounded-xl font-semibold text-sm">
                  <Check size={16} /> Waiting for others... ({readyCount}/{totalMembers})
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ RENDER: FINISHED ============

  if (gamePhase === 'finished') {
    const sortedMembers = Object.entries(members)
      .map(([id, m]) => ({ id, ...m }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
    const topScore = sortedMembers[0]?.score || 0;

    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <Trophy size={56} className="mx-auto text-yellow-400 mb-3" />
          <h1 className="text-3xl font-bold text-white mb-1">Game Over!</h1>
          <p className="text-amber-300 mb-6">Group {groupCode} | {TOTAL_ROUNDS} Questions</p>

          <div className="space-y-2 mb-6">
            {sortedMembers.map((member, idx) => {
              const isTopScorer = member.score === topScore && topScore > 0;
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    member.id === userId ? 'ring-2 ring-amber-400' : ''
                  } ${isTopScorer && idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900' : 'bg-white/10'}`}
                >
                  <span className="text-xl font-bold w-8 text-center">
                    {idx === 0 ? '\u{1F947}' : idx === 1 ? '\u{1F948}' : idx === 2 ? '\u{1F949}' : `#${idx + 1}`}
                  </span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: member.color }}>
                    {member.emoji}
                  </div>
                  <span className={`flex-1 font-semibold truncate text-left ${isTopScorer && idx === 0 ? 'text-gray-900' : 'text-white'}`}>
                    {member.name}
                  </span>
                  <span className={`text-xl font-bold ${isTopScorer && idx === 0 ? 'text-gray-900' : 'text-yellow-300'}`}>
                    {member.score || 0}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button onClick={playAgain} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              Play Again
            </button>
            <button onClick={leaveGroup} className="w-full bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2">
              <Users size={18} /> Join New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-amber-950 to-orange-950 flex items-center justify-center">
      <p className="text-white text-lg">Loading...</p>
    </div>
  );
};

export default WouldYouSignThem;
