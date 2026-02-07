// File: /src/lessons/shared/activities/tempo-charades/TempoCharadesSmallGroup.jsx
// Tempo Charades - Small Group Game (student-run, no teacher needed)
// Students form groups with 4-digit codes, take turns acting out tempo terms
// Other group members guess on their Chromebooks

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Trophy, Play, Check, X, RotateCcw, Crown, Eye, EyeOff } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get, set, push } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';
import { TEMPO_TERMS, shuffleArray, calculateSpeedBonus } from './tempoCharadesConfig';

const TOTAL_ROUNDS = 14;
const AUTO_ADVANCE_DELAY = 3000;
const TRANSITION_DELAY = 2000;
const GUESS_TIMEOUT = 15000;

const TempoCharadesSmallGroup = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, userId: contextUserId } = useSession();
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
  const [gamePhase, setGamePhase] = useState('lobby');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentActorId, setCurrentActorId] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);
  const [memberOrder, setMemberOrder] = useState([]);
  const [answers, setAnswers] = useState({});
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [myScore, setMyScore] = useState(0);

  // Local state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [error, setError] = useState('');
  const [guessedCount, setGuessedCount] = useState(0);

  // Refs for cleanup and timeout tracking
  const listenersRef = useRef([]);
  const autoAdvanceTimerRef = useRef(null);
  const guessTimeoutRef = useRef(null);
  const membersRef = useRef({});
  const memberOrderRef = useRef([]);
  const currentRoundRef = useRef(0);
  const gamePhaseRef = useRef('lobby');

  // Keep refs in sync
  useEffect(() => { membersRef.current = members; }, [members]);
  useEffect(() => { memberOrderRef.current = memberOrder; }, [memberOrder]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);

  // Generate player identity on mount
  useEffect(() => {
    if (!userId) return;
    const name = generateUniquePlayerName(userId, []);
    const color = getPlayerColor(userId);
    const emoji = getPlayerEmoji(userId);
    setPlayerName(name);
    setPlayerColor(color);
    setPlayerEmoji(emoji);
  }, [userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      listenersRef.current.forEach(unsub => unsub());
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (guessTimeoutRef.current) clearTimeout(guessTimeoutRef.current);
    };
  }, []);

  // Helper: get Firebase group path
  const getGroupPath = useCallback((code) => {
    return `sessions/${sessionCode}/tempoCharadesGroups/${code}`;
  }, [sessionCode]);

  // Helper: check if current user is the "host" (first in memberOrder)
  const isHost = useCallback(() => {
    return memberOrder.length > 0 && memberOrder[0] === userId;
  }, [memberOrder, userId]);

  const isActor = currentActorId === userId;

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
    if (!sessionCode || !userId) return;
    setError('');

    try {
      const db = getDatabase();
      const code = await generateGroupCode();

      await set(ref(db, getGroupPath(code)), {
        members: {
          [userId]: {
            name: playerName,
            color: playerColor,
            emoji: playerEmoji,
            score: 0,
            joinedAt: Date.now()
          }
        },
        game: {
          phase: 'lobby',
          currentRound: 0,
          totalRounds: TOTAL_ROUNDS
        }
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
    if (!sessionCode || !userId || !groupCodeInput) return;
    setError('');

    const code = groupCodeInput.trim();
    if (code.length !== 4 || isNaN(code)) {
      setError('Enter a 4-digit group code.');
      return;
    }

    try {
      const db = getDatabase();
      const snapshot = await get(ref(db, getGroupPath(code)));

      if (!snapshot.exists()) {
        setError('Group not found. Check the code.');
        return;
      }

      const groupData = snapshot.val();
      if (groupData.game?.phase !== 'lobby') {
        setError('Game already in progress.');
        return;
      }

      // Get existing names to avoid collisions
      const existingNames = groupData.members
        ? Object.values(groupData.members).map(m => m.name)
        : [];
      const uniqueName = generateUniquePlayerName(userId, existingNames);
      setPlayerName(uniqueName);

      await update(ref(db, `${getGroupPath(code)}/members/${userId}`), {
        name: uniqueName,
        color: playerColor,
        emoji: playerEmoji,
        score: 0,
        joinedAt: Date.now()
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

    // Listen to members
    const membersUnsub = onValue(ref(db, `${getGroupPath(code)}/members`), (snap) => {
      const data = snap.val() || {};
      setMembers(data);

      // Update own score
      if (data[userId]) {
        setMyScore(data[userId].score || 0);
      }
    });

    // Listen to game state
    const gameUnsub = onValue(ref(db, `${getGroupPath(code)}/game`), (snap) => {
      const data = snap.val();
      if (!data) return;

      const prevPhase = gamePhaseRef.current;
      const prevRound = currentRoundRef.current;

      setGamePhase(data.phase || 'lobby');
      setCurrentRound(data.currentRound || 0);
      setCurrentActorId(data.currentActorId || null);
      setCurrentTerm(data.currentTerm || null);
      setMemberOrder(data.memberOrder || []);
      setAnswers(data.answers || {});
      setRoundStartTime(data.roundStartTime || null);

      // Count how many non-actor members have guessed
      if (data.answers && data.memberOrder) {
        const nonActorMembers = data.memberOrder.filter(id => id !== data.currentActorId);
        const guessed = nonActorMembers.filter(id => data.answers[id]).length;
        setGuessedCount(guessed);
      } else {
        setGuessedCount(0);
      }

      // Reset local answer state on new round
      if (data.currentRound !== prevRound || (data.phase === 'acting' && prevPhase !== 'acting')) {
        setSelectedAnswer(null);
        setAnswerLocked(false);
      }
    });

    listenersRef.current.push(membersUnsub, gameUnsub);
  }, [getGroupPath, userId]);

  // ============ AUTO-REVEAL LOGIC ============
  // When all non-actor members have answered, or after timeout, advance to revealed

  useEffect(() => {
    if (gamePhase !== 'guessing' || !isHost()) return;

    const nonActorMembers = memberOrder.filter(id => id !== currentActorId);
    const allAnswered = nonActorMembers.length > 0 && nonActorMembers.every(id => answers[id]);

    if (allAnswered) {
      // Small delay to let UI update, then reveal
      const timer = setTimeout(() => {
        if (gamePhaseRef.current === 'guessing') {
          revealAnswer();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, answers, memberOrder, currentActorId]);

  // Guess timeout (15 seconds from round start)
  useEffect(() => {
    if (gamePhase !== 'guessing' || !isHost() || !roundStartTime) return;

    if (guessTimeoutRef.current) clearTimeout(guessTimeoutRef.current);

    const elapsed = Date.now() - roundStartTime;
    const remaining = Math.max(0, GUESS_TIMEOUT - elapsed);

    guessTimeoutRef.current = setTimeout(() => {
      if (gamePhaseRef.current === 'guessing') {
        revealAnswer();
      }
    }, remaining);

    return () => {
      if (guessTimeoutRef.current) clearTimeout(guessTimeoutRef.current);
    };
  }, [gamePhase, roundStartTime]);

  // ============ GAME CONTROL FUNCTIONS ============

  const startGame = async () => {
    const db = getDatabase();
    const memberIds = Object.keys(members);
    if (memberIds.length < 2) return;

    // Generate 14 rounds: shuffle TEMPO_TERMS twice
    const questions = [...shuffleArray(TEMPO_TERMS), ...shuffleArray(TEMPO_TERMS)];
    const order = shuffleArray(memberIds);

    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'acting',
      currentRound: 0,
      totalRounds: TOTAL_ROUNDS,
      memberOrder: order,
      currentActorId: order[0],
      currentTerm: questions[0],
      questions: questions,
      answers: null,
      roundStartTime: null
    });
  };

  const startGuessing = async () => {
    // Actor taps "ready" to let guessers start
    const db = getDatabase();
    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'guessing',
      roundStartTime: Date.now(),
      answers: null
    });
  };

  const submitGuess = async (termName) => {
    if (answerLocked || isActor || gamePhase !== 'guessing') return;

    setSelectedAnswer(termName);
    setAnswerLocked(true);

    const db = getDatabase();
    const isCorrect = termName === currentTerm?.name;

    await update(ref(db, `${getGroupPath(groupCode)}/game/answers/${userId}`), {
      answer: termName,
      time: Date.now(),
      correct: isCorrect
    });
  };

  const revealAnswer = async () => {
    const db = getDatabase();

    // Calculate scores
    const currentAnswers = (await get(ref(db, `${getGroupPath(groupCode)}/game/answers`))).val() || {};
    const currentMembers = (await get(ref(db, `${getGroupPath(groupCode)}/members`))).val() || {};
    const rStartTime = (await get(ref(db, `${getGroupPath(groupCode)}/game/roundStartTime`))).val() || Date.now();
    const term = (await get(ref(db, `${getGroupPath(groupCode)}/game/currentTerm`))).val();
    const order = memberOrderRef.current;
    const actorId = order[currentRoundRef.current % order.length];

    const nonActorIds = order.filter(id => id !== actorId);
    let correctCount = 0;
    const scoreUpdates = {};

    nonActorIds.forEach(id => {
      const ans = currentAnswers[id];
      if (ans && ans.correct) {
        correctCount++;
        const timeTaken = ans.time - rStartTime;
        const bonus = calculateSpeedBonus(timeTaken);
        const points = 10 + bonus;
        const oldScore = currentMembers[id]?.score || 0;
        scoreUpdates[`members/${id}/score`] = oldScore + points;
      }
    });

    // Actor gets 5 points if at least half guessed correctly
    if (nonActorIds.length > 0 && correctCount >= Math.ceil(nonActorIds.length / 2)) {
      const actorOldScore = currentMembers[actorId]?.score || 0;
      scoreUpdates[`members/${actorId}/score`] = actorOldScore + 5;
    }

    // Write score updates and set phase to revealed
    const updates = {
      'game/phase': 'revealed',
      ...scoreUpdates
    };

    await update(ref(db, getGroupPath(groupCode)), updates);

    // Also update session leaderboard
    if (sessionCode) {
      const allMembers = (await get(ref(db, `${getGroupPath(groupCode)}/members`))).val() || {};
      for (const [memberId, memberData] of Object.entries(allMembers)) {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${memberId}`), {
          tempoCharadesScore: memberData.score || 0
        }).catch(() => {});
      }
    }

    // Auto-advance after delay
    autoAdvanceTimerRef.current = setTimeout(() => {
      advanceRound();
    }, AUTO_ADVANCE_DELAY);
  };

  const advanceRound = async () => {
    const db = getDatabase();
    const nextRound = currentRoundRef.current + 1;

    if (nextRound >= TOTAL_ROUNDS) {
      await update(ref(db, `${getGroupPath(groupCode)}/game`), {
        phase: 'finished',
        currentRound: nextRound
      });
      return;
    }

    const order = memberOrderRef.current;
    const nextActorId = order[nextRound % order.length];
    const questions = (await get(ref(db, `${getGroupPath(groupCode)}/game/questions`))).val() || [];

    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'nextRound',
      currentRound: nextRound,
      currentActorId: nextActorId,
      currentTerm: questions[nextRound] || null,
      answers: null,
      roundStartTime: null
    });

    // Brief transition then go to acting
    setTimeout(async () => {
      await update(ref(db, `${getGroupPath(groupCode)}/game`), {
        phase: 'acting'
      });
    }, TRANSITION_DELAY);
  };

  const playAgain = async () => {
    const db = getDatabase();
    const memberIds = Object.keys(membersRef.current);
    const questions = [...shuffleArray(TEMPO_TERMS), ...shuffleArray(TEMPO_TERMS)];
    const order = shuffleArray(memberIds);

    // Reset scores
    const scoreResets = {};
    memberIds.forEach(id => {
      scoreResets[`members/${id}/score`] = 0;
    });

    await update(ref(db, getGroupPath(groupCode)), {
      'game/phase': 'acting',
      'game/currentRound': 0,
      'game/totalRounds': TOTAL_ROUNDS,
      'game/memberOrder': order,
      'game/currentActorId': order[0],
      'game/currentTerm': questions[0],
      'game/questions': questions,
      'game/answers': null,
      'game/roundStartTime': null,
      ...scoreResets
    });
  };

  // Helper: get member display info
  const getMember = (id) => members[id] || { name: 'Player', color: '#666', emoji: '' };

  // ============ RENDER: LOBBY ============

  if (!hasJoinedGroup) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <Users size={48} className="mx-auto text-purple-300 mb-3" />
            <h1 className="text-3xl font-bold text-white mb-2">Tempo Charades</h1>
            <p className="text-purple-200">Small Group Game</p>
          </div>

          {/* Player identity preview */}
          <div className="bg-white/10 rounded-xl p-4 mb-6 text-center">
            <span className="text-3xl">{playerEmoji}</span>
            <div className="text-lg font-bold mt-1" style={{ color: playerColor }}>{playerName}</div>
          </div>

          {/* Create group */}
          <button
            onClick={createGroup}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-4 rounded-xl font-bold text-lg mb-4 transition-all"
          >
            Create New Group
          </button>

          {/* Join group */}
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm text-purple-200 mb-2 font-semibold">Or join an existing group:</p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit code"
                value={groupCodeInput}
                onChange={(e) => setGroupCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-xl font-mono tracking-widest placeholder-white/30 focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={joinGroup}
                disabled={groupCodeInput.length !== 4}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition-all"
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

  // ============ RENDER: LOBBY (joined) ============

  if (gamePhase === 'lobby') {
    const memberList = Object.entries(members);
    const canStart = isCreator && memberList.length >= 2;

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        {/* Group code display */}
        <div className="bg-white/10 rounded-2xl px-8 py-4 mb-6 text-center border border-white/20">
          <p className="text-sm text-purple-300 font-semibold mb-1">Group Code</p>
          <p className="text-5xl font-mono font-bold text-white tracking-[0.3em]">{groupCode}</p>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">
          <Users size={20} className="inline mr-2" />
          {memberList.length} Member{memberList.length !== 1 ? 's' : ''}
        </h2>

        {/* Members list */}
        <div className="w-full max-w-sm space-y-2 mb-6">
          {memberList.map(([id, member]) => (
            <div
              key={id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                id === userId ? 'bg-purple-500/30 ring-2 ring-purple-400' : 'bg-white/10'
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: member.color }}
              >
                {member.emoji}
              </div>
              <span className="flex-1 text-white font-semibold truncate">{member.name}</span>
              {id === userId && (
                <span className="text-xs bg-purple-500/50 text-purple-200 px-2 py-1 rounded-full">You</span>
              )}
              {memberList[0]?.[0] === id && (
                <Crown size={16} className="text-yellow-400" />
              )}
            </div>
          ))}
        </div>

        {canStart ? (
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all flex items-center gap-2"
          >
            <Play size={24} />
            Start Game
          </button>
        ) : isCreator ? (
          <p className="text-purple-300 text-lg">Need at least 2 members to start</p>
        ) : (
          <p className="text-purple-300 text-lg">Waiting for group creator to start...</p>
        )}
      </div>
    );
  }

  // ============ RENDER: ACTING PHASE ============

  if (gamePhase === 'acting') {
    const actorMember = getMember(currentActorId);

    if (isActor) {
      // Actor's screen: show the secret term
      return (
        <div className="h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-red-950 flex flex-col items-center justify-center p-4">
          <div className="border-4 border-amber-400/60 rounded-3xl p-6 max-w-md w-full text-center bg-black/30">
            {/* Group code */}
            <div className="text-xs text-amber-300/70 font-mono mb-2">Group {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>

            <Crown size={40} className="mx-auto text-amber-400 mb-2" />
            <h1 className="text-2xl font-bold text-amber-300 mb-4">YOU ARE THE ACTOR!</h1>

            {/* Secret term */}
            <div className="bg-white/10 rounded-2xl p-6 mb-4 border border-white/20">
              <div className="text-5xl mb-2">{currentTerm?.emoji}</div>
              <div className="text-4xl font-black mb-1" style={{ color: currentTerm?.color }}>
                {currentTerm?.name}
              </div>
              <div className="text-lg text-white/80 mb-3">{currentTerm?.meaning}</div>
              <div className="bg-amber-500/20 rounded-lg p-3 border border-amber-400/30">
                <p className="text-sm text-amber-200 font-semibold">
                  <Eye size={14} className="inline mr-1" />
                  Hint: {currentTerm?.hint}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-red-300 text-sm mb-4">
              <EyeOff size={16} />
              <span>Don't show anyone your screen!</span>
            </div>

            <button
              onClick={startGuessing}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-2"
            >
              <Play size={24} />
              Ready - Start Acting!
            </button>
          </div>
        </div>
      );
    }

    // Non-actor: waiting for actor to start
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-xs text-purple-300/70 font-mono mb-4">Group {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>

        <div className="text-6xl mb-4">{actorMember.emoji}</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Watch <span style={{ color: actorMember.color }}>{actorMember.name}</span>!
        </h2>
        <p className="text-lg text-purple-200 mb-6">Get ready to guess...</p>

        <div className="bg-white/10 rounded-xl px-6 py-3">
          <p className="text-purple-300 text-sm">Waiting for actor to begin...</p>
        </div>
      </div>
    );
  }

  // ============ RENDER: GUESSING PHASE ============

  if (gamePhase === 'guessing') {
    const actorMember = getMember(currentActorId);
    const nonActorCount = memberOrder.filter(id => id !== currentActorId).length;

    if (isActor) {
      // Actor: show how many have guessed
      return (
        <div className="h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-red-950 flex flex-col items-center justify-center p-4">
          <div className="border-4 border-amber-400/60 rounded-3xl p-6 max-w-md w-full text-center bg-black/30">
            <div className="text-xs text-amber-300/70 font-mono mb-2">Group {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>

            <Crown size={36} className="mx-auto text-amber-400 mb-3" />
            <h2 className="text-2xl font-bold text-amber-300 mb-2">Keep Acting!</h2>

            <div className="text-6xl mb-3">{currentTerm?.emoji}</div>
            <div className="text-3xl font-black mb-4" style={{ color: currentTerm?.color }}>
              {currentTerm?.name}
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-lg text-white">
                <span className="text-3xl font-bold text-amber-400">{guessedCount}</span>
                <span className="text-white/70"> / {nonActorCount} players guessed</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Guesser view
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-purple-300/70 font-mono">Group {groupCode} | R{currentRound + 1}/{TOTAL_ROUNDS}</div>
          <div className="bg-white/10 px-3 py-1 rounded-lg">
            <span className="text-yellow-300 font-bold">{myScore}</span>
            <span className="text-purple-300 text-xs ml-1">pts</span>
          </div>
        </div>

        <div className="text-center mb-3">
          <p className="text-lg text-white font-semibold">
            What tempo is <span style={{ color: actorMember.color }}>{actorMember.name}</span> acting?
          </p>
        </div>

        {/* Answer locked state */}
        {answerLocked && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white/10 rounded-2xl p-8">
              <Check size={48} className="mx-auto text-green-400 mb-3" />
              <p className="text-xl font-bold text-white mb-2">Answer Locked!</p>
              <div
                className="inline-block px-6 py-2 rounded-full text-white font-bold text-lg"
                style={{ backgroundColor: TEMPO_TERMS.find(t => t.name === selectedAnswer)?.color || '#666' }}
              >
                {TEMPO_TERMS.find(t => t.name === selectedAnswer)?.emoji} {selectedAnswer}
              </div>
              <p className="text-sm text-purple-300 mt-3">Waiting for everyone...</p>
            </div>
          </div>
        )}

        {/* Answer buttons */}
        {!answerLocked && (
          <div className="flex-1 flex flex-col justify-center gap-2">
            {/* Top row: 5 steady tempos */}
            <div className="grid grid-cols-5 gap-2">
              {TEMPO_TERMS.slice(0, 5).map((term) => (
                <button
                  key={term.name}
                  onClick={() => submitGuess(term.name)}
                  className="py-4 px-2 rounded-xl text-white font-bold transition-all hover:scale-105 active:scale-95 text-center"
                  style={{ backgroundColor: term.color + 'CC', minHeight: '80px' }}
                >
                  <div className="text-2xl mb-1">{term.emoji}</div>
                  <div className="text-sm leading-tight">{term.name}</div>
                </button>
              ))}
            </div>

            {/* Bottom row: 2 changing tempos */}
            <div className="grid grid-cols-2 gap-2">
              {TEMPO_TERMS.slice(5, 7).map((term) => (
                <button
                  key={term.name}
                  onClick={() => submitGuess(term.name)}
                  className="py-4 px-4 rounded-xl text-white font-bold transition-all hover:scale-105 active:scale-95 text-center"
                  style={{ backgroundColor: term.color + 'CC', minHeight: '70px' }}
                >
                  <div className="text-2xl mb-1">{term.emoji}</div>
                  <div className="text-base">{term.name}</div>
                  <div className="text-xs opacity-80">{term.meaning}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============ RENDER: REVEALED PHASE ============

  if (gamePhase === 'revealed') {
    const nonActorIds = memberOrder.filter(id => id !== currentActorId);

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-xs text-purple-300/70 font-mono mb-3">Group {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>

          {/* Correct answer */}
          <div className="bg-white/10 rounded-2xl p-6 mb-4 border border-white/20">
            <p className="text-sm text-purple-300 mb-2 font-semibold">The answer was:</p>
            <div className="text-5xl mb-2">{currentTerm?.emoji}</div>
            <div className="text-3xl font-black mb-1" style={{ color: currentTerm?.color }}>
              {currentTerm?.name}
            </div>
            <div className="text-lg text-white/70">{currentTerm?.meaning}</div>
          </div>

          {/* Who got it right */}
          <div className="space-y-2 mb-4">
            {nonActorIds.map(id => {
              const member = getMember(id);
              const ans = answers[id];
              const gotIt = ans?.correct;

              return (
                <div
                  key={id}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl ${
                    gotIt ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.emoji}
                  </div>
                  <span className="flex-1 text-white text-sm font-semibold truncate">{member.name}</span>
                  {gotIt ? (
                    <Check size={20} className="text-green-400" />
                  ) : (
                    <X size={20} className="text-red-400" />
                  )}
                  <span className="text-xs text-white/60">{ans?.answer || 'No answer'}</span>
                </div>
              );
            })}
          </div>

          {/* Actor bonus */}
          {(() => {
            const correctCount = nonActorIds.filter(id => answers[id]?.correct).length;
            const gotBonus = nonActorIds.length > 0 && correctCount >= Math.ceil(nonActorIds.length / 2);
            if (isActor && gotBonus) {
              return <p className="text-amber-300 font-semibold text-sm mb-2">Actor bonus: +5 points!</p>;
            }
            return null;
          })()}

          <p className="text-purple-300 text-sm">Next round coming up...</p>
        </div>
      </div>
    );
  }

  // ============ RENDER: NEXT ROUND TRANSITION ============

  if (gamePhase === 'nextRound') {
    const nextActor = getMember(currentActorId);

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">{nextActor.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-2">Next Up:</h2>
          <p className="text-xl mb-4">
            <span className="font-bold" style={{ color: nextActor.color }}>{nextActor.name}</span>
            <span className="text-purple-200"> is the actor!</span>
          </p>
          {currentActorId === userId && (
            <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl px-6 py-3">
              <p className="text-amber-200 font-semibold">That's you! Get ready!</p>
            </div>
          )}
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

    const getRankDisplay = (idx) => {
      if (idx === 0) return { emoji: '', bg: 'from-yellow-400 to-amber-500' };
      if (idx === 1) return { emoji: '', bg: 'from-gray-300 to-gray-400' };
      if (idx === 2) return { emoji: '', bg: 'from-orange-400 to-orange-500' };
      return { emoji: '', bg: 'from-purple-400 to-purple-500' };
    };

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <Trophy size={56} className="mx-auto text-yellow-400 mb-3" />
          <h1 className="text-3xl font-bold text-white mb-1">Game Over!</h1>
          <p className="text-purple-300 mb-6">Group {groupCode} | {TOTAL_ROUNDS} Rounds</p>

          {/* Leaderboard */}
          <div className="space-y-2 mb-6">
            {sortedMembers.map((member, idx) => {
              const rank = getRankDisplay(idx);
              const isTopScorer = member.score === topScore && topScore > 0;

              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    member.id === userId ? 'ring-2 ring-purple-400' : ''
                  } ${isTopScorer && idx === 0 ? 'bg-gradient-to-r ' + rank.bg + ' text-gray-900' : 'bg-white/10'}`}
                >
                  <span className="text-xl font-bold w-8 text-center">
                    {idx === 0 ? '\u{1F947}' : idx === 1 ? '\u{1F948}' : idx === 2 ? '\u{1F949}' : `#${idx + 1}`}
                  </span>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.emoji}
                  </div>
                  <span className={`flex-1 font-semibold truncate text-left ${
                    isTopScorer && idx === 0 ? 'text-gray-900' : 'text-white'
                  }`}>
                    {member.name}
                  </span>
                  <span className={`text-xl font-bold ${
                    isTopScorer && idx === 0 ? 'text-gray-900' : 'text-yellow-300'
                  }`}>
                    {member.score || 0}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Play again (any member can trigger) */}
          <button
            onClick={playAgain}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCcw size={20} />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center">
      <p className="text-white text-lg">Loading...</p>
    </div>
  );
};

export default TempoCharadesSmallGroup;
