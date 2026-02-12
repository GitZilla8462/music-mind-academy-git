// File: TempoCharadesSmallGroup.jsx
// Tempo Detective - Small Group Game (student-run, no teacher needed)
// Students form groups with 4-digit codes
// One player is the Picker (selects a tempo), audio plays on all devices, others guess
// Picker role rotates each round

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Trophy, Play, Pause, Check, X, RotateCcw, Crown, Headphones } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get, set } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';
import { TEMPO_OPTIONS, AUDIO_CLIPS, CLIP_DURATION, shuffleArray, calculateSpeedBonus, getTempoBySymbol } from './tempoCharadesConfig';

const TOTAL_ROUNDS = 10;
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
  const [currentPickerId, setCurrentPickerId] = useState(null);
  const [selectedTempo, setSelectedTempo] = useState(null);
  const [memberOrder, setMemberOrder] = useState([]);
  const [answers, setAnswers] = useState({});
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [myScore, setMyScore] = useState(0);

  // Audio state from Firebase
  const [clipInfo, setClipInfo] = useState(null); // { clipIndex, playbackRate }

  // Local state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [error, setError] = useState('');
  const [guessedCount, setGuessedCount] = useState(0);

  // Audio
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const clipEndTimer = useRef(null);

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

  // Web Audio API setup
  const ensureAudioContext = useCallback(() => {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.connect(ctx.destination);
    if (audioRef.current) {
      sourceNodeRef.current = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current.connect(gainNodeRef.current);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (clipEndTimer.current) {
      clearTimeout(clipEndTimer.current);
      clipEndTimer.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingAudio(false);
  }, []);

  // Play clip from Firebase clip info
  const playClipFromInfo = useCallback((info) => {
    if (!audioRef.current || !info) return;

    stopAudio();
    ensureAudioContext();

    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const clip = AUDIO_CLIPS[info.clipIndex];
    if (!clip) return;

    const currentSrc = audioRef.current.getAttribute('src');
    if (currentSrc !== clip.audio) {
      audioRef.current.src = clip.audio;
      audioRef.current.load();
    }

    audioRef.current.currentTime = clip.startTime;
    audioRef.current.playbackRate = info.playbackRate;
    audioRef.current.volume = 1.0;

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clip.volume ?? 0.7;
    }

    audioRef.current.play().catch(err => console.error('Audio play error:', err));
    setIsPlayingAudio(true);

    clipEndTimer.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAudio(false);
    }, CLIP_DURATION * 1000);
  }, [stopAudio, ensureAudioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      listenersRef.current.forEach(unsub => unsub());
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (guessTimeoutRef.current) clearTimeout(guessTimeoutRef.current);
      stopAudio();
    };
  }, [stopAudio]);

  // Helper: get Firebase group path
  const getGroupPath = useCallback((code) => {
    return `sessions/${sessionCode}/tempoCharadesGroups/${code}`;
  }, [sessionCode]);

  // Helper: check if current user is the host
  const isHost = useCallback(() => {
    return memberOrder.length > 0 && memberOrder[0] === userId;
  }, [memberOrder, userId]);

  const isPicker = currentPickerId === userId;

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

    const membersUnsub = onValue(ref(db, `${getGroupPath(code)}/members`), (snap) => {
      const data = snap.val() || {};
      setMembers(data);
      if (data[userId]) {
        setMyScore(data[userId].score || 0);
      }
    });

    const gameUnsub = onValue(ref(db, `${getGroupPath(code)}/game`), (snap) => {
      const data = snap.val();
      if (!data) return;

      const prevPhase = gamePhaseRef.current;
      const prevRound = currentRoundRef.current;

      setGamePhase(data.phase || 'lobby');
      setCurrentRound(data.currentRound || 0);
      setCurrentPickerId(data.currentPickerId || null);
      setSelectedTempo(data.selectedTempo || null);
      setMemberOrder(data.memberOrder || []);
      setAnswers(data.answers || {});
      setRoundStartTime(data.roundStartTime || null);

      // Store clip info for audio playback
      if (data.clipIndex !== undefined && data.playbackRate !== undefined) {
        setClipInfo({ clipIndex: data.clipIndex, playbackRate: data.playbackRate });
      }

      // Count guesses
      if (data.answers && data.memberOrder) {
        const nonPickerMembers = data.memberOrder.filter(id => id !== data.currentPickerId);
        const guessed = nonPickerMembers.filter(id => data.answers[id]).length;
        setGuessedCount(guessed);
      } else {
        setGuessedCount(0);
      }

      // Reset local state on new round
      if (data.currentRound !== prevRound || (data.phase === 'picking' && prevPhase !== 'picking')) {
        setSelectedAnswer(null);
        setAnswerLocked(false);
      }
    });

    listenersRef.current.push(membersUnsub, gameUnsub);
  }, [getGroupPath, userId]);

  // ============ AUTO-PLAY AUDIO ON LISTENING PHASE ============

  useEffect(() => {
    if (gamePhase === 'listening' && clipInfo && !isPicker) {
      // Small delay for Firebase sync, then play
      const timer = setTimeout(() => {
        playClipFromInfo(clipInfo);
      }, 500);
      return () => clearTimeout(timer);
    }
    if (gamePhase !== 'listening') {
      stopAudio();
    }
  }, [gamePhase, clipInfo, isPicker, playClipFromInfo, stopAudio]);

  // ============ AUTO-REVEAL LOGIC ============

  useEffect(() => {
    if (gamePhase !== 'guessing' || !isHost()) return;

    const nonPickerMembers = memberOrder.filter(id => id !== currentPickerId);
    const allAnswered = nonPickerMembers.length > 0 && nonPickerMembers.every(id => answers[id]);

    if (allAnswered) {
      const timer = setTimeout(() => {
        if (gamePhaseRef.current === 'guessing') {
          revealAnswer();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, answers, memberOrder, currentPickerId]);

  // Guess timeout
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

    const order = shuffleArray(memberIds);

    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'picking',
      currentRound: 0,
      totalRounds: TOTAL_ROUNDS,
      memberOrder: order,
      currentPickerId: order[0],
      selectedTempo: null,
      clipIndex: null,
      playbackRate: null,
      answers: null,
      roundStartTime: null
    });
  };

  const submitPick = async (tempoSymbol) => {
    const db = getDatabase();
    const tempo = getTempoBySymbol(tempoSymbol);
    if (!tempo) return;

    // Pick a random clip
    const clipIndex = Math.floor(Math.random() * AUDIO_CLIPS.length);
    const clip = AUDIO_CLIPS[clipIndex];
    const playbackRate = tempo.bpm / clip.naturalBpm;

    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'listening',
      selectedTempo: tempoSymbol,
      clipIndex,
      playbackRate,
      answers: null,
      roundStartTime: null
    });
  };

  const openGuessing = async () => {
    const db = getDatabase();
    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'guessing',
      roundStartTime: Date.now(),
      answers: null
    });
  };

  const submitGuess = async (tempoSymbol) => {
    if (answerLocked || isPicker || gamePhase !== 'guessing') return;

    setSelectedAnswer(tempoSymbol);
    setAnswerLocked(true);

    const db = getDatabase();
    const isCorrect = tempoSymbol === selectedTempo;

    await update(ref(db, `${getGroupPath(groupCode)}/game/answers/${userId}`), {
      answer: tempoSymbol,
      time: Date.now(),
      correct: isCorrect
    });
  };

  const revealAnswer = async () => {
    stopAudio();
    const db = getDatabase();

    const currentAnswers = (await get(ref(db, `${getGroupPath(groupCode)}/game/answers`))).val() || {};
    const currentMembers = (await get(ref(db, `${getGroupPath(groupCode)}/members`))).val() || {};
    const rStartTime = (await get(ref(db, `${getGroupPath(groupCode)}/game/roundStartTime`))).val() || Date.now();
    const order = memberOrderRef.current;
    const pickerId = order[currentRoundRef.current % order.length];

    const nonPickerIds = order.filter(id => id !== pickerId);
    let correctCount = 0;
    const scoreUpdates = {};

    nonPickerIds.forEach(id => {
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

    // Picker gets 5 points if at least half guessed correctly
    if (nonPickerIds.length > 0 && correctCount >= Math.ceil(nonPickerIds.length / 2)) {
      const pickerOldScore = currentMembers[pickerId]?.score || 0;
      scoreUpdates[`members/${pickerId}/score`] = pickerOldScore + 5;
    }

    const updates = {
      'game/phase': 'revealed',
      ...scoreUpdates
    };

    await update(ref(db, getGroupPath(groupCode)), updates);

    // Update session leaderboard
    if (sessionCode) {
      const allMembers = (await get(ref(db, `${getGroupPath(groupCode)}/members`))).val() || {};
      for (const [memberId, memberData] of Object.entries(allMembers)) {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${memberId}`), {
          tempoCharadesScore: memberData.score || 0
        }).catch(() => {});
      }
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      advanceRound();
    }, AUTO_ADVANCE_DELAY);
  };

  const advanceRound = async () => {
    stopAudio();
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
    const nextPickerId = order[nextRound % order.length];

    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'nextRound',
      currentRound: nextRound,
      currentPickerId: nextPickerId,
      selectedTempo: null,
      clipIndex: null,
      playbackRate: null,
      answers: null,
      roundStartTime: null
    });

    setTimeout(async () => {
      await update(ref(db, `${getGroupPath(groupCode)}/game`), {
        phase: 'picking'
      });
    }, TRANSITION_DELAY);
  };

  const playAgain = async () => {
    stopAudio();
    const db = getDatabase();
    const memberIds = Object.keys(membersRef.current);
    const order = shuffleArray(memberIds);

    const scoreResets = {};
    memberIds.forEach(id => {
      scoreResets[`members/${id}/score`] = 0;
    });

    await update(ref(db, getGroupPath(groupCode)), {
      'game/phase': 'picking',
      'game/currentRound': 0,
      'game/totalRounds': TOTAL_ROUNDS,
      'game/memberOrder': order,
      'game/currentPickerId': order[0],
      'game/selectedTempo': null,
      'game/clipIndex': null,
      'game/playbackRate': null,
      'game/answers': null,
      'game/roundStartTime': null,
      ...scoreResets
    });
  };

  const getMember = (id) => members[id] || { name: 'Player', color: '#666', emoji: '' };

  // ============ RENDER: JOIN SCREEN ============

  if (!hasJoinedGroup) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <audio ref={audioRef} preload="auto" />
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <span className="text-5xl block mb-3">{'\u{1F50D}'}</span>
            <h1 className="text-3xl font-bold text-white mb-2">Tempo Detective</h1>
            <p className="text-purple-200">Small Group Game</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 mb-6 text-center">
            <span className="text-3xl">{playerEmoji}</span>
            <div className="text-lg font-bold mt-1" style={{ color: playerColor }}>{playerName}</div>
          </div>

          <button
            onClick={createGroup}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-4 rounded-xl font-bold text-lg mb-4 transition-all"
          >
            Create New Group
          </button>

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

  // ============ RENDER: LOBBY ============

  if (gamePhase === 'lobby') {
    const memberList = Object.entries(members);
    const canStart = isCreator && memberList.length >= 2;

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <audio ref={audioRef} preload="auto" />

        <div className="bg-white/10 rounded-2xl px-8 py-4 mb-6 text-center border border-white/20">
          <p className="text-sm text-purple-300 font-semibold mb-1">Group Code</p>
          <p className="text-5xl font-mono font-bold text-white tracking-[0.3em]">{groupCode}</p>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">
          <Users size={20} className="inline mr-2" />
          {memberList.length} Member{memberList.length !== 1 ? 's' : ''}
        </h2>

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

  // ============ RENDER: PICKING PHASE ============

  if (gamePhase === 'picking') {
    if (isPicker) {
      return (
        <div className="h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-red-950 flex flex-col items-center justify-center p-4">
          <audio ref={audioRef} preload="auto" />
          <div className="max-w-md w-full text-center">
            <div className="text-xs text-amber-300/70 font-mono mb-2">Group {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>

            <Crown size={40} className="mx-auto text-amber-400 mb-2" />
            <h1 className="text-2xl font-bold text-amber-300 mb-4">YOU ARE THE PICKER!</h1>
            <p className="text-lg text-white/80 mb-6">Pick a tempo — your group will hear a clip at that speed and guess!</p>

            <div className="grid grid-cols-1 gap-3">
              {TEMPO_OPTIONS.map(t => (
                <button
                  key={t.symbol}
                  onClick={() => submitPick(t.symbol)}
                  className="flex items-center gap-4 px-6 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: t.color }}
                >
                  <span className="text-3xl">{t.emoji}</span>
                  <span className="flex-1 text-left">{t.symbol}</span>
                  <span className="text-white/80">{t.bpm} BPM</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const pickerMember = getMember(currentPickerId);
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <audio ref={audioRef} preload="auto" />
        <div className="text-xs text-purple-300/70 font-mono mb-4">Group {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>

        <div className="text-6xl mb-4">{pickerMember.emoji}</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          <span style={{ color: pickerMember.color }}>{pickerMember.name}</span> is picking...
        </h2>
        <p className="text-lg text-purple-200 mb-6">Get ready to listen!</p>

        <div className="bg-white/10 rounded-xl px-6 py-3">
          <p className="text-purple-300 text-sm">A clip will play at a tempo — guess which one!</p>
        </div>
      </div>
    );
  }

  // ============ RENDER: LISTENING PHASE ============

  if (gamePhase === 'listening') {
    if (isPicker) {
      const pickedTempo = selectedTempo ? getTempoBySymbol(selectedTempo) : null;
      return (
        <div className="h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-red-950 flex flex-col items-center justify-center p-4">
          <audio ref={audioRef} preload="auto" />
          <div className="max-w-md w-full text-center">
            <div className="text-xs text-amber-300/70 font-mono mb-2">Group {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>

            <Headphones size={48} className="mx-auto text-amber-400 mb-3" />
            <h2 className="text-2xl font-bold text-amber-300 mb-4">Your group is listening...</h2>

            {pickedTempo && (
              <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                <p className="text-sm text-amber-200 mb-2">You picked:</p>
                <div className="text-4xl mb-1">{pickedTempo.emoji}</div>
                <div className="text-2xl font-black" style={{ color: pickedTempo.color }}>
                  {pickedTempo.symbol} — {pickedTempo.bpm} BPM
                </div>
              </div>
            )}

            <button
              onClick={openGuessing}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-2"
            >
              Open Guessing
            </button>
          </div>
        </div>
      );
    }

    // Guesser: listening to audio
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <audio ref={audioRef} preload="auto" />
        <div className="text-xs text-purple-300/70 font-mono mb-4">Group {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>

        <Headphones size={64} className="text-purple-400 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Listen!</h2>
        <p className="text-lg text-purple-200 mb-6">What tempo is this clip?</p>

        {isPlayingAudio && (
          <div className="bg-purple-500/30 rounded-xl px-6 py-3 mb-4">
            <p className="text-purple-200 font-semibold">Playing...</p>
          </div>
        )}

        {!isPlayingAudio && clipInfo && (
          <button
            onClick={() => playClipFromInfo(clipInfo)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mb-4"
          >
            <Play size={20} /> Replay
          </button>
        )}

        <p className="text-purple-300 text-sm">Guessing will open soon...</p>
      </div>
    );
  }

  // ============ RENDER: GUESSING PHASE ============

  if (gamePhase === 'guessing') {
    const nonPickerCount = memberOrder.filter(id => id !== currentPickerId).length;

    if (isPicker) {
      const pickedTempo = selectedTempo ? getTempoBySymbol(selectedTempo) : null;
      return (
        <div className="h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-red-950 flex flex-col items-center justify-center p-4">
          <audio ref={audioRef} preload="auto" />
          <div className="max-w-md w-full text-center">
            <div className="text-xs text-amber-300/70 font-mono mb-2">Group {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>

            <Crown size={36} className="mx-auto text-amber-400 mb-3" />
            <h2 className="text-2xl font-bold text-amber-300 mb-2">They're guessing!</h2>

            {pickedTempo && (
              <div className="mb-4">
                <div className="text-4xl mb-1">{pickedTempo.emoji}</div>
                <div className="text-2xl font-black" style={{ color: pickedTempo.color }}>
                  {pickedTempo.symbol} — {pickedTempo.bpm} BPM
                </div>
              </div>
            )}

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-lg text-white">
                <span className="text-3xl font-bold text-amber-400">{guessedCount}</span>
                <span className="text-white/70"> / {nonPickerCount} guessed</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Guesser view
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col p-4">
        <audio ref={audioRef} preload="auto" />

        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-purple-300/70 font-mono">Group {groupCode} | R{currentRound + 1}/{TOTAL_ROUNDS}</div>
          <div className="bg-white/10 px-3 py-1 rounded-lg">
            <span className="text-yellow-300 font-bold">{myScore}</span>
            <span className="text-purple-300 text-xs ml-1">pts</span>
          </div>
        </div>

        <div className="text-center mb-3">
          <p className="text-lg text-white font-semibold">What tempo was that?</p>
        </div>

        {answerLocked && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white/10 rounded-2xl p-8">
              <Check size={48} className="mx-auto text-green-400 mb-3" />
              <p className="text-xl font-bold text-white mb-2">Answer Locked!</p>
              <div
                className="inline-block px-6 py-2 rounded-full text-white font-bold text-lg"
                style={{ backgroundColor: getTempoBySymbol(selectedAnswer)?.color || '#666' }}
              >
                {getTempoBySymbol(selectedAnswer)?.emoji} {selectedAnswer} — {getTempoBySymbol(selectedAnswer)?.bpm} BPM
              </div>
              <p className="text-sm text-purple-300 mt-3">Waiting for everyone...</p>
            </div>
          </div>
        )}

        {!answerLocked && (
          <div className="flex-1 flex flex-col justify-center gap-3">
            {/* Replay button */}
            {clipInfo && (
              <div className="text-center mb-2">
                <button
                  onClick={() => playClipFromInfo(clipInfo)}
                  className="bg-purple-500/50 hover:bg-purple-500/70 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 mx-auto"
                >
                  {isPlayingAudio ? <Pause size={16} /> : <Play size={16} />}
                  {isPlayingAudio ? 'Playing...' : 'Replay Clip'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto w-full">
              {TEMPO_OPTIONS.map((term) => (
                <button
                  key={term.symbol}
                  onClick={() => submitGuess(term.symbol)}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl text-white font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: term.color + 'CC' }}
                >
                  <span className="text-2xl">{term.emoji}</span>
                  <span className="flex-1 text-left">{term.symbol}</span>
                  <span className="text-white/80 text-sm">{term.bpm} BPM</span>
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
    const nonPickerIds = memberOrder.filter(id => id !== currentPickerId);
    const correctTempo = selectedTempo ? getTempoBySymbol(selectedTempo) : null;

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <audio ref={audioRef} preload="auto" />
        <div className="max-w-md w-full text-center">
          <div className="text-xs text-purple-300/70 font-mono mb-3">Group {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>

          {correctTempo && (
            <div className="bg-white/10 rounded-2xl p-6 mb-4 border border-white/20">
              <p className="text-sm text-purple-300 mb-2 font-semibold">The answer was:</p>
              <div className="text-5xl mb-2">{correctTempo.emoji}</div>
              <div className="text-3xl font-black mb-1" style={{ color: correctTempo.color }}>
                {correctTempo.symbol} — {correctTempo.bpm} BPM
              </div>
              <div className="text-lg text-white/70">{correctTempo.meaning}</div>
            </div>
          )}

          <div className="space-y-2 mb-4">
            {nonPickerIds.map(id => {
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

          {(() => {
            const correctCount = nonPickerIds.filter(id => answers[id]?.correct).length;
            const gotBonus = nonPickerIds.length > 0 && correctCount >= Math.ceil(nonPickerIds.length / 2);
            if (isPicker && gotBonus) {
              return <p className="text-amber-300 font-semibold text-sm mb-2">Picker bonus: +5 points!</p>;
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
    const nextPicker = getMember(currentPickerId);

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <audio ref={audioRef} preload="auto" />
        <div className="text-center">
          <div className="text-6xl mb-4">{nextPicker.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-2">Next Up:</h2>
          <p className="text-xl mb-4">
            <span className="font-bold" style={{ color: nextPicker.color }}>{nextPicker.name}</span>
            <span className="text-purple-200"> is the picker!</span>
          </p>
          {currentPickerId === userId && (
            <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl px-6 py-3">
              <p className="text-amber-200 font-semibold">That's you! Pick a tempo!</p>
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
      if (idx === 0) return { bg: 'from-yellow-400 to-amber-500' };
      if (idx === 1) return { bg: 'from-gray-300 to-gray-400' };
      if (idx === 2) return { bg: 'from-orange-400 to-orange-500' };
      return { bg: 'from-purple-400 to-purple-500' };
    };

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <audio ref={audioRef} preload="auto" />
        <div className="max-w-md w-full text-center">
          <Trophy size={56} className="mx-auto text-yellow-400 mb-3" />
          <h1 className="text-3xl font-bold text-white mb-1">Game Over!</h1>
          <p className="text-purple-300 mb-6">Group {groupCode} | {TOTAL_ROUNDS} Rounds</p>

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
      <audio ref={audioRef} preload="auto" />
      <p className="text-white text-lg">Loading...</p>
    </div>
  );
};

export default TempoCharadesSmallGroup;
