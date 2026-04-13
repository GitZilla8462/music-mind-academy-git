// File: SignOrPassSmallGroup.jsx
// Sign or Pass — Small Group Game
// 3 mystery artists auto-play 10s clips from the middle on ALL devices
// Students rank 1–3 using tap-to-assign buttons
// Score points for matching rankings with groupmates
// Groups of 3–5, join with 4-digit codes

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Trophy, Play, Pause, Crown, Star, Music, MessageCircle, Check, ChevronRight, Volume2 } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get, set } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji, formatFirstNameLastInitial } from '../layer-detective/nameGenerator';
import { TOTAL_ROUNDS, PREVIEW_DURATION, AUTO_ADVANCE_DELAY, TRANSITION_DELAY, RANKING_TIME, shuffleArray, pickRoundArtists, calculateRoundScores } from './signOrPassConfig';
import DirectionsModal, { DirectionsReopenButton } from '../../components/DirectionsModal';

// Time between clips during auto-play
const BETWEEN_CLIP_DELAY = 3000; // 3s transition between clips

// Capitalize first letter of each word in a song title
const capitalizeTitle = (title) => title?.replace(/\b\w/g, c => c.toUpperCase()) || '';

const SignOrPassSmallGroup = ({ onComplete, isSessionMode = true }) => {
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
  const [gamePhase, setGamePhase] = useState('lobby');
  const [currentRound, setCurrentRound] = useState(0);
  const [memberOrder, setMemberOrder] = useState([]);
  const [artists, setArtists] = useState([]);
  const [rankings, setRankings] = useState({});
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [usedArtistIds, setUsedArtistIds] = useState([]);
  const [myScore, setMyScore] = useState(0);

  // Auto-play state (synced from Firebase)
  const [autoPlayIndex, setAutoPlayIndex] = useState(-1); // which clip is playing (0,1,2) or -1
  const [autoPlayStartedAt, setAutoPlayStartedAt] = useState(null);
  const [autoPlayFinishedAll, setAutoPlayFinishedAll] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [betweenClips, setBetweenClips] = useState(false); // transitioning between clips

  // Revealed phase state (synced from Firebase)
  const [roundScores, setRoundScores] = useState({}); // { oderId: pointsThisRound }
  const [readyForNext, setReadyForNext] = useState({}); // { oderId: true }
  const [imReady, setImReady] = useState(false);

  // Local ranking state — tap-to-assign
  const [rankAssignments, setRankAssignments] = useState({}); // { artistId: rank }
  const [rankingLocked, setRankingLocked] = useState(false);
  const [rankedCount, setRankedCount] = useState(0);

  // Audio state
  const audioRef = useRef(null);
  const progressAnimRef = useRef(null);
  const autoAdvanceTimer = useRef(null);
  const clipStopTimer = useRef(null);
  const revealInProgressRef = useRef(false);
  const previewAudioRef = useRef(null);
  const previewTimerRef = useRef(null);
  const [previewingArtistId, setPreviewingArtistId] = useState(null);

  // UI state
  const [error, setError] = useState('');
  const [showDirections, setShowDirections] = useState(true);
  const [countdown, setCountdown] = useState(null);

  // Refs for cleanup
  const listenersRef = useRef([]);
  const autoAdvanceTimerRef = useRef(null);
  const rankingTimeoutRef = useRef(null);
  const membersRef = useRef({});
  const memberOrderRef = useRef([]);
  const currentRoundRef = useRef(0);
  const gamePhaseRef = useRef('lobby');

  // Keep refs in sync
  useEffect(() => { membersRef.current = members; }, [members]);
  useEffect(() => { memberOrderRef.current = memberOrder; }, [memberOrder]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);

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
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (rankingTimeoutRef.current) clearTimeout(rankingTimeoutRef.current);
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      if (clipStopTimer?.current) clearTimeout(clipStopTimer.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current.src = ''; }
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  // ============ MINI PREVIEW PLAYBACK (ranking phase) ============
  const togglePreview = useCallback((artist) => {
    // If already previewing this artist, stop
    if (previewingArtistId === artist.id) {
      if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current.src = ''; }
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      setPreviewingArtistId(null);
      return;
    }
    // Stop any existing preview
    if (previewAudioRef.current) { previewAudioRef.current.pause(); previewAudioRef.current.src = ''; }
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);

    const audio = new Audio(artist.audioUrl);
    audio.preload = 'auto';
    previewAudioRef.current = audio;
    setPreviewingArtistId(artist.id);

    const startFrom = artist.clipStart || 0;
    const onReady = () => {
      audio.currentTime = startFrom;
      audio.play().catch(() => {});
    };
    if (audio.readyState >= 2) onReady();
    else audio.addEventListener('loadeddata', onReady, { once: true });

    // Stop after 10s
    previewTimerRef.current = setTimeout(() => {
      audio.pause();
      audio.src = '';
      setPreviewingArtistId(null);
    }, 10000);
  }, [previewingArtistId]);

  // ============ AUTO-PLAY AUDIO ENGINE ============
  // Split into two effects so membership changes don't kill audio playback.

  // Effect 1: Audio playback — only re-runs when clip index or startedAt changes
  // Uses refs for host detection and artist data to avoid unnecessary re-runs
  const artistsRef = useRef([]);
  useEffect(() => { artistsRef.current = artists; }, [artists]);

  useEffect(() => {
    if (autoPlayIndex < 0 || !autoPlayStartedAt) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      if (clipStopTimer.current) { clearTimeout(clipStopTimer.current); clipStopTimer.current = null; }
      return;
    }

    const artist = artistsRef.current[autoPlayIndex];
    if (!artist) return;

    const startFrom = artist.clipStart || 0;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    const audio = new Audio(artist.audioUrl);
    audio.preload = 'auto';
    audioRef.current = audio;

    const startPlayback = () => {
      audio.currentTime = startFrom;
      audio.play().catch(() => {});
    };
    if (audio.readyState >= 2) startPlayback();
    else audio.addEventListener('loadeddata', startPlayback, { once: true });

    clipStopTimer.current = setTimeout(() => { audio.pause(); }, PREVIEW_DURATION * 1000);

    return () => {
      audio.pause();
      audio.src = '';
      if (clipStopTimer.current) { clearTimeout(clipStopTimer.current); clipStopTimer.current = null; }
    };
    // Only re-run when the clip actually changes — NOT when artists array ref changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayIndex, autoPlayStartedAt, userId]);

  // Effect 2: Countdown timer — all devices, only depends on clip timing
  useEffect(() => {
    if (autoPlayIndex < 0 || !autoPlayStartedAt) {
      setPlayProgress(0);
      setBetweenClips(false);
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      return;
    }

    const tick = () => {
      const elapsed = (Date.now() - autoPlayStartedAt) / 1000;
      const remaining = Math.max(0, Math.ceil(PREVIEW_DURATION - elapsed));
      setPlayProgress(remaining);
      if (elapsed < PREVIEW_DURATION) {
        progressAnimRef.current = requestAnimationFrame(tick);
      }
    };
    progressAnimRef.current = requestAnimationFrame(tick);

    return () => {
      if (progressAnimRef.current) { cancelAnimationFrame(progressAnimRef.current); progressAnimRef.current = null; }
    };
  }, [autoPlayIndex, autoPlayStartedAt]);

  // Auto-advance clips — any client can trigger (staggered to avoid doubles)
  useEffect(() => {
    if (gamePhase !== 'listening' || autoPlayIndex < 0 || !autoPlayStartedAt) return;
    if (memberOrder.length === 0) return;

    const nextIndex = autoPlayIndex + 1;
    const isLastClip = nextIndex >= artists.length;
    const totalDelay = (PREVIEW_DURATION * 1000) + BETWEEN_CLIP_DELAY;

    // Stagger by position in member order (first member tries first, others as fallback)
    const myIndex = memberOrder.indexOf(userId);
    const stagger = Math.max(0, myIndex) * 2000;

    const betweenTimer = setTimeout(() => {
      setBetweenClips(true);
    }, PREVIEW_DURATION * 1000);

    autoAdvanceTimer.current = setTimeout(async () => {
      setBetweenClips(false);
      const db = getDatabase();
      const gamePath = `sessions/${effectiveSessionCode}/signOrPassGroups/${groupCode}/game`;

      // Check if still in listening phase (another client may have already advanced)
      const currentPhase = (await get(ref(db, `${gamePath}/phase`))).val();
      if (currentPhase !== 'listening') return;
      const currentIdx = (await get(ref(db, `${gamePath}/autoPlay/currentIndex`))).val();
      if (currentIdx !== autoPlayIndex) return;

      if (isLastClip) {
        await update(ref(db, gamePath), {
          autoPlay: null,
          phase: 'ranking',
          roundStartTime: Date.now()
        });
      } else {
        await update(ref(db, gamePath), {
          'autoPlay/currentIndex': nextIndex,
          'autoPlay/startedAt': Date.now()
        });
      }
    }, totalDelay + stagger);

    return () => {
      clearTimeout(betweenTimer);
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, [gamePhase, autoPlayIndex, autoPlayStartedAt, memberOrder, userId, artists, groupCode, effectiveSessionCode]);

  // Helper: get Firebase group path
  const getGroupPath = useCallback((code) => {
    return `sessions/${effectiveSessionCode}/signOrPassGroups/${code}`;
  }, [effectiveSessionCode]);

  const isHost = useCallback(() => {
    return memberOrder.length > 0 && memberOrder[0] === userId;
  }, [memberOrder, userId]);

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
      if (memberCount >= 5) { setError('Group is full (max 5 players).'); return; }
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
      setArtists(data.artists || []);
      setRankings(data.rankings || {});
      setRoundStartTime(data.roundStartTime || null);
      setUsedArtistIds(data.usedArtistIds || []);

      // Auto-play state
      if (data.autoPlay) {
        setAutoPlayIndex(data.autoPlay.currentIndex ?? -1);
        setAutoPlayStartedAt(data.autoPlay.startedAt || null);
        setAutoPlayFinishedAll(false);
      } else {
        setAutoPlayIndex(-1);
        setAutoPlayStartedAt(null);
        if (data.phase === 'ranking' || data.phase === 'revealed' || data.phase === 'finished') {
          setAutoPlayFinishedAll(true);
        }
      }

      // Round scores and ready state
      setRoundScores(data.roundScores || {});
      setReadyForNext(data.readyForNext || {});

      if (data.rankings && data.memberOrder) {
        setRankedCount(data.memberOrder.filter(id => data.rankings[id]).length);
      } else {
        setRankedCount(0);
      }

      if (data.phase === 'ranking') {
        if (!data.rankings?.[userId]) setRankingLocked(false);
        setImReady(false);
      }
    });
    listenersRef.current.push(membersUnsub, gameUnsub);
  }, [getGroupPath, userId]);

  // Stop audio when leaving listening/ranking
  useEffect(() => {
    if (gamePhase !== 'listening') {
      if (audioRef.current) { audioRef.current.pause(); }
    }
  }, [gamePhase]);

  // ============ COUNTDOWN TIMER ============

  useEffect(() => {
    if (gamePhase !== 'ranking' || !roundStartTime) { setCountdown(null); return; }
    const tick = () => {
      const elapsed = Date.now() - roundStartTime;
      setCountdown(Math.max(0, Math.ceil((RANKING_TIME - elapsed) / 1000)));
    };
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [gamePhase, roundStartTime]);

  // ============ AUTO-REVEAL WHEN ALL RANKED ============

  // Reveal function — any member can call it, lock prevents double-fire
  const doReveal = useCallback(async () => {
    if (gamePhaseRef.current !== 'ranking') return;
    if (revealInProgressRef.current) return;
    revealInProgressRef.current = true;

    try {
      const db = getDatabase();
      const groupPath = `sessions/${effectiveSessionCode}/signOrPassGroups/${groupCode}`;

      // Check Firebase directly to see if already revealed (another client beat us)
      const currentPhase = (await get(ref(db, `${groupPath}/game/phase`))).val();
      if (currentPhase !== 'ranking') {
        revealInProgressRef.current = false;
        return;
      }

      const currentRankings = (await get(ref(db, `${groupPath}/game/rankings`))).val() || {};
      const currentMembers = (await get(ref(db, `${groupPath}/members`))).val() || {};
      const order = memberOrderRef.current;

      const scores = calculateRoundScores(currentRankings, order);
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

      if (effectiveSessionCode) {
        const allMembers = (await get(ref(db, `${groupPath}/members`))).val() || {};
        for (const [memberId, memberData] of Object.entries(allMembers)) {
          update(ref(db, `sessions/${effectiveSessionCode}/studentsJoined/${memberId}`), {
            signOrPassScore: memberData.score || 0
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('[SignOrPass] doReveal error:', err);
    } finally {
      revealInProgressRef.current = false;
    }
  }, [effectiveSessionCode, groupCode]);

  // When all members have submitted rankings, trigger reveal
  // Every client checks — doReveal has a lock + Firebase phase check to prevent doubles
  useEffect(() => {
    if (gamePhase !== 'ranking' || memberOrder.length === 0) return;

    const allRanked = memberOrder.every(id => rankings[id] && rankings[id].rank1);
    if (!allRanked) return;

    // Stagger by position in member order to reduce race conditions
    const myIndex = memberOrder.indexOf(userId);
    const delay = 500 + (Math.max(0, myIndex) * 1500);

    const timer = setTimeout(() => {
      if (gamePhaseRef.current === 'ranking') doReveal();
    }, delay);
    return () => clearTimeout(timer);
  }, [gamePhase, rankings, memberOrder, userId, doReveal]);

  // Ranking timeout — force reveal after RANKING_TIME even if not everyone submitted
  useEffect(() => {
    if (gamePhase !== 'ranking' || !roundStartTime || memberOrder.length === 0) return;

    // Every client sets this timer; doReveal's lock prevents double-writes
    if (rankingTimeoutRef.current) clearTimeout(rankingTimeoutRef.current);
    const elapsed = Date.now() - roundStartTime;
    const remaining = Math.max(0, RANKING_TIME - elapsed);
    rankingTimeoutRef.current = setTimeout(() => {
      if (gamePhaseRef.current === 'ranking') doReveal();
    }, remaining);
    return () => { if (rankingTimeoutRef.current) clearTimeout(rankingTimeoutRef.current); };
  }, [gamePhase, roundStartTime, memberOrder, doReveal]);

  // ============ AUTO-ADVANCE AFTER REVEAL (10s timer) ============

  const [revealCountdown, setRevealCountdown] = useState(null);

  useEffect(() => {
    if (gamePhase !== 'revealed') { setRevealCountdown(null); return; }

    setRevealCountdown(10);
    const interval = setInterval(() => {
      setRevealCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Host auto-advances after 10s
    const amHost = memberOrder.length > 0 && memberOrder[0] === userId;
    let advanceTimer;
    if (amHost) {
      advanceTimer = setTimeout(() => advanceRound(), 10000);
    }

    return () => {
      clearInterval(interval);
      if (advanceTimer) clearTimeout(advanceTimer);
    };
  }, [gamePhase, memberOrder, userId]);

  // ============ GAME CONTROL FUNCTIONS ============

  const startGame = async () => {
    const db = getDatabase();
    const memberIds = Object.keys(members);
    if (memberIds.length < 3) return;

    const order = shuffleArray(memberIds);
    const roundArtists = pickRoundArtists([]);

    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'listening',
      currentRound: 0,
      totalRounds: TOTAL_ROUNDS,
      memberOrder: order,
      artists: roundArtists,
      rankings: null,
      roundStartTime: null,
      usedArtistIds: roundArtists.length > 0 ? [roundArtists[0].artistId] : [],
      autoPlay: { currentIndex: 0, startedAt: Date.now() }
    });

    resetLocalRanking();
  };

  const resetLocalRanking = () => {
    setRankAssignments({});
    setRankingLocked(false);
  };

  // ── Tap-to-assign ranking ──

  const assignRank = (artistId, rank) => {
    if (rankingLocked) return;
    setRankAssignments(prev => {
      const next = { ...prev };
      // Remove this rank from any artist that currently has it
      Object.keys(next).forEach(id => {
        if (next[id] === rank) delete next[id];
      });
      // If this artist already has THIS rank, clear it (toggle off)
      if (prev[artistId] === rank) {
        delete next[artistId];
      } else {
        // Assign rank to this artist (replaces any existing rank on this artist)
        next[artistId] = rank;
      }
      return next;
    });
  };

  const getRankForArtist = (artistId) => rankAssignments[artistId] || null;

  const isRankTaken = (rank) => Object.values(rankAssignments).includes(rank);

  const allRanksAssigned = [1, 2, 3].every(r => isRankTaken(r));

  const submitRanking = async () => {
    if (rankingLocked || !allRanksAssigned) return;
    setRankingLocked(true);

    try {
      const rank1 = Object.keys(rankAssignments).find(id => rankAssignments[id] === 1);
      const rank2 = Object.keys(rankAssignments).find(id => rankAssignments[id] === 2);
      const rank3 = Object.keys(rankAssignments).find(id => rankAssignments[id] === 3);

      const db = getDatabase();
      await update(ref(db, `${getGroupPath(groupCode)}/game/rankings/${userId}`), {
        rank1, rank2, rank3, reason: ''
      });
    } catch (err) {
      console.error('[SignOrPass] submitRanking error:', err);
      setRankingLocked(false);
    }
  };

  const advanceRound = async () => {
    if (audioRef.current) audioRef.current.pause();
    const db = getDatabase();
    const nextRound = currentRoundRef.current + 1;

    if (nextRound >= TOTAL_ROUNDS) {
      await update(ref(db, `${getGroupPath(groupCode)}/game`), { phase: 'finished', currentRound: nextRound });
      return;
    }

    const currentUsed = (await get(ref(db, `${getGroupPath(groupCode)}/game/usedArtistIds`))).val() || [];
    const roundArtists = pickRoundArtists(currentUsed);
    const newArtistId = roundArtists.length > 0 ? roundArtists[0].artistId : null;
    const newUsed = newArtistId ? [...currentUsed, newArtistId] : currentUsed;

    await update(ref(db, `${getGroupPath(groupCode)}/game`), {
      phase: 'listening',
      currentRound: nextRound,
      artists: roundArtists,
      rankings: null,
      roundStartTime: null,
      usedArtistIds: newUsed,
      readyForNext: null,
      roundScores: null,
      autoPlay: { currentIndex: 0, startedAt: Date.now() }
    });

    resetLocalRanking();
    setImReady(false);
    revealInProgressRef.current = false;
  };

  const playAgain = async () => {
    if (audioRef.current) audioRef.current.pause();
    const db = getDatabase();
    const memberIds = Object.keys(membersRef.current);
    const order = shuffleArray(memberIds);
    const scoreResets = {};
    memberIds.forEach(id => { scoreResets[`members/${id}/score`] = 0; });
    const roundArtists = pickRoundArtists([]);

    await update(ref(db, getGroupPath(groupCode)), {
      'game/phase': 'listening',
      'game/currentRound': 0,
      'game/totalRounds': TOTAL_ROUNDS,
      'game/memberOrder': order,
      'game/artists': roundArtists,
      'game/rankings': null,
      'game/roundStartTime': null,
      'game/usedArtistIds': roundArtists.length > 0 ? [roundArtists[0].artistId] : [],
      'game/autoPlay': { currentIndex: 0, startedAt: Date.now() },
      ...scoreResets
    });

    resetLocalRanking();
  };

  const leaveGroup = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    listenersRef.current.forEach(unsub => unsub());
    listenersRef.current = [];
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (rankingTimeoutRef.current) clearTimeout(rankingTimeoutRef.current);
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setHasJoinedGroup(false);
    setGroupCode('');
    setGroupCodeInput('');
    setIsCreator(false);
    setGamePhase('lobby');
    setMembers({});
    setMyScore(0);
    setArtists([]);
    setRankings({});
    resetLocalRanking();
  };

  const getMember = (id) => members[id] || { name: 'Player', color: '#666', emoji: '' };

  // ============ RANK LABELS ============

  const RANK_LABELS = {
    1: { emoji: '\u{1F947}', label: 'Sign', bgActive: 'bg-yellow-400', textActive: 'text-gray-900', border: 'border-yellow-400' },
    2: { emoji: '\u{1F948}', label: 'Shelf', bgActive: 'bg-gray-300', textActive: 'text-gray-900', border: 'border-gray-300' },
    3: { emoji: '\u{1F949}', label: 'Cut', bgActive: 'bg-orange-500', textActive: 'text-white', border: 'border-orange-500' },
  };

  // ============ RENDER: JOIN SCREEN ============

  if (!hasJoinedGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
        <audio ref={audioRef} preload="auto" />
        {!showDirections && <DirectionsReopenButton onClick={() => setShowDirections(true)} />}
        <DirectionsModal
          title="Sign or Pass"
          isOpen={showDirections}
          onClose={() => setShowDirections(false)}
          pages={[
            {
              title: 'The Scenario',
              items: [
                <>You just signed an artist to your label. Congrats!</>,
                <>But the big meeting is <strong>tomorrow</strong> — you need to pick their <strong>best track</strong> to play for the executives.</>,
                <>You'll hear 3 of their songs. Pick the one that'll <strong>blow the room away</strong>.</>,
                <>The catch? Your whole team has to agree. Score points when your picks <strong>match!</strong></>
              ]
            },
            {
              title: 'How to Play',
              items: [
                <>Get into groups of <strong>3–5</strong></>,
                <>One person creates a group and shares the <strong>4-digit code</strong></>,
                <>Listen to <strong>3 tracks</strong> from the same artist</>,
                <>Rank them <strong>1st, 2nd, 3rd</strong> — which track would you bring to the meeting?</>,
                <>Score points when your rankings <strong>match your group!</strong></>
              ]
            }
          ]}
        />
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <span className="text-5xl block mb-3">{'\u{1F3B5}'}</span>
            <h1 className="text-3xl font-bold text-white mb-2">Sign or Pass</h1>
            <p className="text-blue-200">Would you sign this artist?</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 mb-6 text-center">
            <span className="text-3xl">{playerEmoji}</span>
            <div className="text-lg font-bold mt-1" style={{ color: playerColor }}>{playerName}</div>
          </div>

          <button
            onClick={createGroup}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-4 rounded-xl font-bold text-lg mb-4 transition-all"
          >
            Create New Group
          </button>

          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm text-blue-200 mb-2 font-semibold">Or join an existing group:</p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit code"
                value={groupCodeInput}
                onChange={(e) => setGroupCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-xl font-mono tracking-widest placeholder-white/30 focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={joinGroup}
                disabled={groupCodeInput.length !== 4}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition-all"
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
    const canStart = isCreator && memberList.length >= 3;

    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col items-center justify-center p-4">
        <audio ref={audioRef} preload="auto" />

        <div className="bg-white/10 rounded-2xl px-8 py-4 mb-6 text-center border border-white/20">
          <p className="text-sm text-blue-300 font-semibold mb-1">Group Code</p>
          <p className="text-5xl font-mono font-bold text-white tracking-[0.3em]">{groupCode}</p>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">
          <Users size={20} className="inline mr-2" />
          {memberList.length} Member{memberList.length !== 1 ? 's' : ''} {memberList.length >= 5 && <span className="text-blue-300 text-sm">(Full)</span>}
        </h2>

        <div className="w-full max-w-sm space-y-2 mb-6">
          {memberList.map(([id, member]) => (
            <div
              key={id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                id === userId ? 'bg-blue-500/30 ring-2 ring-blue-400' : 'bg-white/10'
              }`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: member.color }}>
                {member.emoji}
              </div>
              <span className="flex-1 text-white font-semibold truncate">{member.name}</span>
              {id === userId && <span className="text-xs bg-blue-500/50 text-blue-200 px-2 py-1 rounded-full">You</span>}
              {memberList[0]?.[0] === id && <Crown size={16} className="text-yellow-400" />}
            </div>
          ))}
        </div>

        {canStart ? (
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all flex items-center gap-2"
          >
            <Play size={24} /> Start Game
          </button>
        ) : isCreator ? (
          <p className="text-blue-300 text-lg">Need at least 3 members to start</p>
        ) : (
          <p className="text-blue-300 text-lg">Waiting for group creator to start...</p>
        )}

        <button onClick={leaveGroup} className="mt-6 text-blue-300 hover:text-white text-sm py-2 transition-colors">
          Leave Group
        </button>
      </div>
    );
  }

  // ============ RENDER: LISTENING PHASE (AUTO-PLAY) ============

  if (gamePhase === 'listening') {
    const currentArtist = artists[autoPlayIndex] || null;
    const timeLeft = autoPlayStartedAt
      ? Math.max(0, Math.ceil(PREVIEW_DURATION - (Date.now() - autoPlayStartedAt) / 1000))
      : PREVIEW_DURATION;

    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col p-3 overflow-hidden">
        <audio ref={audioRef} preload="auto" />

        {/* Top bar: group code + round */}
        <div className="flex items-center justify-between mb-1 shrink-0">
          <div className="text-xs text-blue-300/70 font-mono">Code: {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>
          <div className="bg-white/10 px-2 py-1 rounded-lg shrink-0">
            <span className="text-yellow-300 font-bold text-sm">{myScore}</span>
            <span className="text-blue-300 text-[10px] ml-1">pts</span>
          </div>
        </div>

        {/* Artist photo + name */}
        <div className="flex items-center gap-3 mb-2 shrink-0">
          {artists[0]?.imageUrl && (
            <img src={artists[0].imageUrl} alt={artists[0].name} className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{artists[0]?.name || 'Loading...'}</h1>
            <p className="text-blue-200 text-xs">Which song is the best? Listen to all 3.</p>
          </div>
        </div>

        {/* Song cards */}
        <div className="flex-1 flex flex-col justify-center gap-2 max-w-lg mx-auto w-full min-h-0">
          {artists.map((artist, idx) => {
            const isCurrentlyPlaying = idx === autoPlayIndex && autoPlayStartedAt;
            const isPlayed = idx < autoPlayIndex || (idx === autoPlayIndex && playProgress <= 0);

            return (
              <div
                key={artist.id}
                className={`rounded-xl transition-all duration-500 shrink-0 ${
                  isCurrentlyPlaying ? 'ring-2 ring-green-400 shadow-lg shadow-green-500/20' :
                  isPlayed ? 'opacity-50' :
                  'opacity-30'
                }`}
                style={{ backgroundColor: '#1e293b' }}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-black shrink-0 ${
                    isCurrentlyPlaying ? 'bg-green-500 text-white' :
                    isPlayed ? 'bg-white/15 text-white/50' :
                    'bg-white/10 text-white/20'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base ${isCurrentlyPlaying ? 'text-white' : isPlayed ? 'text-white/60' : 'text-white/30'}`}>
                      Song {idx + 1}{(isPlayed || isCurrentlyPlaying) ? `: ${capitalizeTitle(artist.trackTitle)}` : ''}
                    </p>
                  </div>
                  {isCurrentlyPlaying && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Volume2 size={14} className="text-green-400 animate-pulse" />
                      <span className="text-green-300 text-sm font-mono font-bold">{playProgress}s</span>
                    </div>
                  )}
                  {isPlayed && !isCurrentlyPlaying && (
                    <Check size={14} className="text-white/30 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom status */}
        <div className="shrink-0 pt-2">
          <p className="text-blue-300/60 text-xs text-center">
            {autoPlayIndex >= 0 && autoPlayIndex < artists.length
              ? `Playing song ${autoPlayIndex + 1} of ${artists.length}...`
              : 'Get ready to rank!'}
          </p>
        </div>
      </div>
    );
  }

  // ============ RENDER: RANKING PHASE (TAP-TO-ASSIGN) ============

  if (gamePhase === 'ranking') {
    const totalMembers = memberOrder.length;

    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col p-3 overflow-hidden">
        <audio ref={audioRef} preload="auto" />

        {!rankingLocked ? (
          <>
            {/* Top bar: group code + round + timer */}
            <div className="flex items-center justify-between mb-1 shrink-0">
              <div className="text-xs text-blue-300/70 font-mono">Code: {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>
              <div className="flex items-center gap-2">
                {countdown !== null && (
                  <span className={`text-sm font-bold ${countdown <= 10 ? 'text-red-400' : 'text-blue-300'}`}>
                    {countdown}s
                  </span>
                )}
                <div className="bg-white/10 px-2 py-1 rounded-lg">
                  <span className="text-yellow-300 font-bold text-sm">{myScore}</span>
                  <span className="text-blue-300 text-[10px] ml-1">pts</span>
                </div>
              </div>
            </div>

            {/* Secret banner */}
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-2 py-1 mb-1 text-center shrink-0">
              <p className="text-red-300 text-xs font-bold">Hide your screen from fellow agents!</p>
            </div>

            <div className="text-center mb-2 shrink-0">
              <h1 className="text-lg font-bold text-white">Rank the Songs</h1>
              <p className="text-blue-200 text-xs">Which {artists[0]?.name || ''} song is the best?</p>
            </div>

            {/* Song cards */}
            <div className="flex-1 flex flex-col justify-center gap-2 max-w-lg mx-auto w-full min-h-0">
              {artists.map((artist, idx) => {
                const myRank = getRankForArtist(artist.id);
                const rankInfo = myRank ? RANK_LABELS[myRank] : null;

                return (
                  <div
                    key={artist.id}
                    className={`rounded-xl overflow-hidden transition-all shrink-0 ${
                      myRank ? `ring-2 ${rankInfo.border}` : ''
                    }`}
                    style={{ backgroundColor: '#1e293b' }}
                  >
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      {/* Replay button */}
                      <button
                        onClick={() => togglePreview(artist)}
                        className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
                          previewingArtistId === artist.id
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {previewingArtistId === artist.id
                          ? <Pause size={16} />
                          : <Play size={16} className="ml-0.5" />}
                      </button>

                      {/* Song info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">Song {idx + 1}: {capitalizeTitle(artist.trackTitle)}</p>
                      </div>

                      {/* 1st / 2nd / 3rd buttons */}
                      <div className="flex gap-1 shrink-0">
                        {[1, 2, 3].map(rank => {
                          const rl = RANK_LABELS[rank];
                          const ordinal = rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd';
                          const isAssignedHere = myRank === rank;
                          const isTakenElsewhere = !isAssignedHere && isRankTaken(rank);

                          return (
                            <button
                              key={rank}
                              onClick={() => assignRank(artist.id, rank)}
                              className={`px-2.5 py-2 rounded-lg font-bold text-xs transition-all min-h-[44px] ${
                                isAssignedHere
                                  ? `${rl.bgActive} ${rl.textActive} scale-105 shadow-lg`
                                  : isTakenElsewhere
                                    ? 'bg-white/[0.06] text-white/20 hover:bg-white/10'
                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                              }`}
                            >
                              {ordinal}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lock In button — always visible at bottom */}
            <div className="shrink-0 pt-2 max-w-lg mx-auto w-full">
              {allRanksAssigned ? (
                <button
                  onClick={submitRanking}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Lock In Rankings
                </button>
              ) : (
                <p className="text-blue-300/40 text-xs text-center py-2">
                  Assign 1st, 2nd, and 3rd to lock in
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-2">
                <Check size={24} className="text-white" />
              </div>
              <p className="text-lg font-bold text-white mb-1">Locked In!</p>
              <p className="text-blue-300 text-sm mb-3">
                {rankedCount}/{totalMembers} have submitted
              </p>
              <div className="space-y-1.5">
                {[1, 2, 3].map(rank => {
                  const artistId = Object.keys(rankAssignments).find(id => rankAssignments[id] === rank);
                  const artist = artists.find(a => a.id === artistId);
                  const rl = RANK_LABELS[rank];
                  if (!artist) return null;
                  return (
                    <div key={rank} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                      <span className={`w-7 h-7 rounded-full ${rl.bgActive} ${rl.textActive} flex items-center justify-center font-bold text-xs`}>
                        {rank}
                      </span>
                      <span className="text-white text-sm font-semibold">"{capitalizeTitle(artist.trackTitle)}"</span>
                      <span className="text-gray-500 text-xs ml-auto">{rl.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============ RENDER: REVEALED PHASE ============

  if (gamePhase === 'revealed') {
    const myRanking = rankings[userId] || {};
    const getArtistLabel = (artistId) => {
      const a = artists.find(x => x.id === artistId);
      return a ? `"${capitalizeTitle(a.trackTitle)}"` : '?';
    };

    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col p-3 overflow-hidden">
        <audio ref={audioRef} preload="auto" />
        <div className="flex-1 min-h-0 overflow-y-auto max-w-lg mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-blue-300/70 font-mono">Code: {groupCode} | Round {currentRound + 1}/{TOTAL_ROUNDS}</div>
          </div>
          <h1 className="text-lg font-bold text-white text-center mb-2">The Reveal!</h1>

          {/* Everyone's Picks — green = matched you, red = didn't */}
          <div className="bg-white/5 rounded-xl p-2.5 mb-3">
            <p className="text-[10px] text-gray-400 font-semibold mb-1.5 uppercase tracking-wider">Everyone's Picks</p>
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <div className="w-20" />
              <div className="flex-1 text-center text-xs text-gray-500 font-bold">1st Choice</div>
              <div className="flex-1 text-center text-xs text-gray-500 font-bold">2nd Choice</div>
              <div className="flex-1 text-center text-xs text-gray-500 font-bold">3rd Choice</div>
            </div>
            {/* Player rows */}
            {memberOrder.map(id => {
              const m = getMember(id);
              const r = rankings[id] || {};
              const isMe = id === userId;

              return (
                <div key={id} className={`flex items-center gap-1.5 px-1 py-1.5 rounded-lg ${isMe ? 'bg-blue-500/15' : ''}`}>
                  <div className="w-20 flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: m.color }}>
                      {m.emoji}
                    </div>
                    <span className={`text-xs font-semibold truncate ${isMe ? 'text-yellow-300' : 'text-white/70'}`}>
                      {isMe ? 'You' : m.name}
                    </span>
                  </div>
                  {['rank1', 'rank2', 'rank3'].map((key, idx) => {
                    const artistId = r[key];
                    const myKey = `rank${idx + 1}`;
                    // For your own row, check if anyone else matched you at this position
                    // For other rows, check if their pick matches yours at the same position
                    const matched = isMe
                      ? memberOrder.some(otherId => otherId !== userId && rankings[otherId]?.[myKey] === artistId)
                      : myRanking[myKey] === artistId;
                    return (
                      <div
                        key={key}
                        className={`flex-1 text-center text-xs font-medium py-1.5 rounded ${
                          matched
                            ? 'bg-green-500/25 text-green-300 border border-green-400/30'
                            : 'bg-red-500/15 text-red-300/70 border border-red-400/20'
                        }`}
                      >
                        {getArtistLabel(artistId)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Total Score */}
          <div className="bg-white/5 rounded-xl p-2.5 mb-2">
            <p className="text-[10px] text-gray-400 font-semibold mb-1.5 uppercase tracking-wider">Total Score</p>
            <div className="space-y-1.5">
              {memberOrder
                .map(id => ({ id, ...getMember(id), roundPts: roundScores[id] || 0 }))
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((member, idx) => (
                  <div key={member.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${member.id === userId ? 'bg-blue-500/20' : ''}`}>
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

        </div>

        {/* Countdown bar — always visible at bottom */}
        <div className="shrink-0 pt-2 max-w-lg mx-auto w-full">
          <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-300 font-semibold text-sm mb-1.5">
              <ChevronRight size={14} />
              Next round in {revealCountdown ?? 0}s...
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-1000"
                style={{ width: `${((revealCountdown ?? 0) / 10) * 100}%` }}
              />
            </div>
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
      <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex flex-col items-center justify-center p-4">
        <audio ref={audioRef} preload="auto" />
        <div className="max-w-md w-full text-center">
          <Trophy size={56} className="mx-auto text-yellow-400 mb-3" />
          <h1 className="text-3xl font-bold text-white mb-1">Game Over!</h1>
          <p className="text-blue-300 mb-6">Group {groupCode} | {TOTAL_ROUNDS} Rounds</p>

          <div className="space-y-2 mb-6">
            {sortedMembers.map((member, idx) => {
              const isTopScorer = member.score === topScore && topScore > 0;
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    member.id === userId ? 'ring-2 ring-blue-400' : ''
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
            <button onClick={playAgain} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
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
    <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center">
      <audio ref={audioRef} preload="auto" />
      <p className="text-white text-lg">Loading...</p>
    </div>
  );
};

export default SignOrPassSmallGroup;
