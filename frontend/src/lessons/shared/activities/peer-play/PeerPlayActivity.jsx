// PeerPlayActivity.jsx
// Automatic peer matchmaking for Listening Journey game mode.
// Students get paired, load partner's journey from Firebase, play turn-by-turn,
// then auto-rejoin pool for a new match.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, Users, ArrowRight, Eye, Trophy, Loader } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getClassAuthInfo } from '../../../../utils/studentWorkStorage';
import { loadStudentWork as loadFromFirebase } from '../../../../firebase/studentWork';
import {
  joinPool,
  leavePool,
  tryMatch,
  tryObserve,
  completeTurn,
  subscribeToMyMatch,
  subscribeToMatch,
  subscribeToPool,
  checkExistingMatch
} from '../../../../firebase/peerPlay';

// Lazy-load ListeningJourney to avoid circular deps
let ListeningJourney = null;

const PeerPlayActivity = ({ pieceConfig, journeyExtras = {} }) => {
  const { sessionCode, userId, classCode: contextClassCode } = useSession();
  const urlClassCode = new URLSearchParams(window.location.search).get('classCode');
  const effectiveSessionCode = sessionCode || contextClassCode || urlClassCode;

  // Student identity — prefer real name from PIN session (even if expired)
  const authInfo = getClassAuthInfo();
  const pinDisplayName = (() => {
    try {
      const pin = JSON.parse(localStorage.getItem('student-pin-session') || 'null');
      return pin?.displayName || null;
    } catch { return null; }
  })();
  const studentId = authInfo?.uid || userId || 'anonymous';
  const studentName = pinDisplayName || authInfo?.displayName || localStorage.getItem('current-session-studentName') || 'Student';

  // State
  const [phase, setPhase] = useState('loading'); // loading | waiting | playing | watching | observing | done
  const [matchId, setMatchId] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [partnerJourney, setPartnerJourney] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [poolSize, setPoolSize] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [JourneyComponent, setJourneyComponent] = useState(null);

  // Refs for cleanup
  const matchUnsubRef = useRef(null);
  const myMatchUnsubRef = useRef(null);
  const poolUnsubRef = useRef(null);
  const matchingIntervalRef = useRef(null);
  const mountedRef = useRef(true);
  const phaseRef = useRef(phase);
  const currentTurnRef = useRef(null);
  const loadingJourneyForRef = useRef(null); // tracks which partner's journey we're loading
  phaseRef.current = phase;

  // Load ListeningJourney component
  useEffect(() => {
    if (ListeningJourney) {
      setJourneyComponent(() => ListeningJourney);
      return;
    }
    import('../listening-journey/ListeningJourney').then(mod => {
      ListeningJourney = mod.default;
      if (mountedRef.current) setJourneyComponent(() => mod.default);
    });
  }, []);

  // Determine my role in the current match
  const getMyRole = useCallback((match) => {
    if (!match) return null;
    if (match.studentA.id === studentId) return 'A';
    if (match.studentB.id === studentId) return 'B';
    return null;
  }, [studentId]);

  // Get partner info from match
  const getPartner = useCallback((match) => {
    if (!match) return null;
    const role = getMyRole(match);
    return role === 'A' ? match.studentB : match.studentA;
  }, [getMyRole]);

  // Determine if I'm the player or watcher this turn
  const amIPlaying = useCallback((match) => {
    if (!match) return false;
    const role = getMyRole(match);
    // Turn 1: A plays B's journey. Turn 2: B plays A's journey.
    return (match.turn === 1 && role === 'A') || (match.turn === 2 && role === 'B');
  }, [getMyRole]);

  // Load partner's journey data from Firebase
  const loadPartnerJourney = useCallback(async (partnerId) => {
    setPartnerJourney(null);
    setLoadError(null);
    try {
      // Journey is saved under ll-lesson5/listening-journey in Firebase
      const data = await loadFromFirebase(partnerId, 'll-lesson5', 'listening-journey');
      if (!data?.data) {
        // Try ll-lesson4 as fallback
        const data4 = await loadFromFirebase(partnerId, 'll-lesson4', 'listening-journey');
        if (!data4?.data) {
          setLoadError('Could not load partner\'s journey');
          return;
        }
        setPartnerJourney(data4.data);
        return;
      }
      setPartnerJourney(data.data);
    } catch (err) {
      console.error('Failed to load partner journey:', err);
      setLoadError('Failed to load partner\'s journey');
    }
  }, []);

  // Join pool and start matchmaking
  useEffect(() => {
    if (!effectiveSessionCode) return;
    mountedRef.current = true;

    const init = async () => {
      // Check if we already have a match (e.g., page refresh mid-game)
      const existingMatchId = await checkExistingMatch(effectiveSessionCode, studentId);
      if (existingMatchId) {
        // We're already in a match — don't rejoin pool, let subscribeToMyMatch handle it
        if (!mountedRef.current) return;
        setPhase('waiting'); // will quickly transition when match subscription fires
        return;
      }

      // Join the pool
      await joinPool(effectiveSessionCode, studentId, studentName);
      if (!mountedRef.current) return;
      setPhase('waiting');

      // Try to match immediately, then poll every 2 seconds
      // If alone in pool, try to observe an active match instead
      const attemptMatch = async () => {
        if (!mountedRef.current) return;
        try {
          const id = await tryMatch(effectiveSessionCode, studentId, studentName);
          if (id) {
            if (matchingIntervalRef.current) {
              clearInterval(matchingIntervalRef.current);
              matchingIntervalRef.current = null;
            }
            return;
          }
          // No match found — try to observe if alone in pool
          const obsId = await tryObserve(effectiveSessionCode, studentId, studentName);
          if (obsId && matchingIntervalRef.current) {
            clearInterval(matchingIntervalRef.current);
            matchingIntervalRef.current = null;
          }
        } catch (err) {
          console.log('Match attempt:', err.message);
        }
      };

      attemptMatch();
      matchingIntervalRef.current = setInterval(attemptMatch, 2000);
    };

    init();

    return () => {
      mountedRef.current = false;
      if (matchingIntervalRef.current) clearInterval(matchingIntervalRef.current);
      // Leave pool on unmount (no-op if not in pool)
      leavePool(effectiveSessionCode, studentId).catch(() => {});
    };
  }, [effectiveSessionCode, studentId, studentName]);

  // Subscribe to pool size
  useEffect(() => {
    if (!effectiveSessionCode) return;
    const unsub = subscribeToPool(effectiveSessionCode, (pool) => {
      setPoolSize(pool.length);
    });
    poolUnsubRef.current = unsub;
    return () => unsub();
  }, [effectiveSessionCode]);

  // Subscribe to my match pointer
  useEffect(() => {
    if (!effectiveSessionCode) return;
    const unsub = subscribeToMyMatch(effectiveSessionCode, studentId, (mId) => {
      setMatchId(mId);
      if (mId && matchingIntervalRef.current) {
        clearInterval(matchingIntervalRef.current);
        matchingIntervalRef.current = null;
      }
      if (!mId && phaseRef.current !== 'waiting' && phaseRef.current !== 'loading') {
        // Match ended, go back to waiting
        setPhase('waiting');
        setMatchData(null);
        setPartnerJourney(null);
        currentTurnRef.current = null;
        // Restart matchmaking
        const attemptMatch = async () => {
          try {
            await tryMatch(effectiveSessionCode, studentId, studentName);
          } catch { /* ok */ }
        };
        attemptMatch();
        matchingIntervalRef.current = setInterval(attemptMatch, 2000);
      }
    });
    myMatchUnsubRef.current = unsub;
    return () => unsub();
  }, [effectiveSessionCode, studentId, studentName]);

  // Subscribe to match data when we have a matchId
  useEffect(() => {
    if (!effectiveSessionCode || !matchId) {
      if (matchUnsubRef.current) matchUnsubRef.current();
      return;
    }

    const unsub = subscribeToMatch(effectiveSessionCode, matchId, (match) => {
      if (!match || !mountedRef.current) return;
      setMatchData(match);

      if (match.status === 'finished') {
        setGamesPlayed(g => g + 1);
        setPhase('done');
        currentTurnRef.current = null;
        return;
      }

      // Detect turn change — clear stale journey data from previous turn
      if (currentTurnRef.current !== null && currentTurnRef.current !== match.turn) {
        setPartnerJourney(null);
        setLoadError(null);
        loadingJourneyForRef.current = null;
      }
      currentTurnRef.current = match.turn;

      const role = getMyRole(match);
      const isObserver = !role && match.observer?.id === studentId;

      if (isObserver) {
        // I'm an observer — just watching this pair
        setPhase('observing');
        setPartnerJourney(null);
        loadingJourneyForRef.current = null;
        return;
      }

      const playing = amIPlaying(match);
      const partner = getPartner(match);

      if (playing) {
        // I'm the player this turn — need to load partner's journey
        setPhase('playing');
        // Only load once per partner per turn (avoid re-fetching on every Firebase update)
        if (loadingJourneyForRef.current !== partner.id) {
          loadingJourneyForRef.current = partner.id;
          loadPartnerJourney(partner.id);
        }
      } else {
        // I'm watching this turn
        setPhase('watching');
        setPartnerJourney(null); // clear any stale data from when I was playing
        loadingJourneyForRef.current = null;
      }
    });

    matchUnsubRef.current = unsub;
    return () => unsub();
  }, [effectiveSessionCode, matchId, amIPlaying, getPartner, loadPartnerJourney]);

  // Handle game completion (player finished a turn)
  const handleGameComplete = useCallback(() => {
    if (!effectiveSessionCode || !matchId) return;
    completeTurn(effectiveSessionCode, matchId, studentId);
  }, [effectiveSessionCode, matchId, studentId]);

  // ─── Render ────────────────────────────────────────────────────────

  // Waiting for match
  if (phase === 'loading' || phase === 'waiting') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
              <Users size={48} className="text-indigo-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold animate-bounce" style={{ left: '55%' }}>
              {poolSize}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black mb-2">Finding You a Partner...</h1>
            <p className="text-white/60 text-lg">
              {poolSize > 1
                ? 'Matching you now...'
                : poolSize === 1
                  ? 'You\'re in the pool — waiting for someone to finish their game'
                  : 'Joining the pool...'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-white/40">
            <Loader size={16} className="animate-spin" />
            <span className="text-sm">
              {gamesPlayed > 0 ? `${gamesPlayed} game${gamesPlayed !== 1 ? 's' : ''} played` : 'Peer Play active'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Matched — watching partner play my journey
  if (phase === 'watching' && matchData) {
    const partner = getPartner(matchData);
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
            <Eye size={48} className="text-purple-400" />
          </div>

          <div>
            <h1 className="text-3xl font-black mb-2">Watch {partner?.name} Play!</h1>
            <p className="text-white/60 text-lg">
              They're playing <span className="text-purple-300 font-bold">your journey</span> right now.
            </p>
            <p className="text-white/40 mt-2">
              Go sit with them and watch their reaction!
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-sm text-white/50 mb-1">Partner</div>
                <div className="text-xl font-bold text-purple-300">{partner?.name}</div>
              </div>
              <ArrowRight size={24} className="text-white/30" />
              <div className="text-center">
                <div className="text-sm text-white/50 mb-1">Playing</div>
                <div className="text-xl font-bold text-emerald-300">Your Journey</div>
              </div>
            </div>
          </div>

          <p className="text-white/30 text-sm">
            {matchData.turn === 1 ? 'After they finish, it\'s your turn to play their journey!' : 'Almost done — new match coming up next!'}
          </p>
        </div>
      </div>
    );
  }

  // Observing a pair
  if (phase === 'observing' && matchData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-amber-950 to-gray-900 text-white p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
            <Eye size={48} className="text-amber-400" />
          </div>

          <div>
            <h1 className="text-3xl font-black mb-2">You're Observing!</h1>
            <p className="text-white/60 text-lg">
              Go watch <span className="text-amber-300 font-bold">{matchData.studentA.name}</span> and <span className="text-amber-300 font-bold">{matchData.studentB.name}</span> play!
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{matchData.studentA.name}</div>
              </div>
              <span className="text-white/30 text-xl">↔</span>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{matchData.studentB.name}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-white/40">Turn {matchData.turn}/2</div>
          </div>

          <p className="text-white/30 text-sm">
            You'll be matched with a partner when they finish!
          </p>
        </div>
      </div>
    );
  }

  // Playing partner's journey
  if (phase === 'playing' && matchData) {
    const partner = getPartner(matchData);

    // Still loading journey data
    if (!partnerJourney && !loadError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
          <Loader size={48} className="animate-spin text-emerald-400 mb-4" />
          <p className="text-xl font-bold">Loading {partner?.name}'s Journey...</p>
        </div>
      );
    }

    // Error loading
    if (loadError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Couldn't Load Journey</h1>
          <p className="text-white/60 mb-4">{loadError}</p>
          <button
            onClick={handleGameComplete}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors"
          >
            Skip & Find New Partner
          </button>
        </div>
      );
    }

    // Render ListeningJourney in game mode with partner's saved data
    if (JourneyComponent && partnerJourney) {
      return (
        <div className="h-screen relative">
          {/* Partner name banner */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[100] bg-black/70 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/20">
            <Gamepad2 size={14} className="text-emerald-400" />
            <span className="text-white text-sm font-bold">{partner?.name}'s Journey</span>
          </div>
          <JourneyComponent
            key={`peer-${partner?.id}-turn-${matchData?.turn}`}
            onComplete={handleGameComplete}
            viewMode={false}
            isSessionMode={false}
            pieceConfig={pieceConfig}
            gameMode={true}
            skipSavedData={true}
            savedDataOverride={partnerJourney}
            {...journeyExtras}
          />
        </div>
      );
    }
  }

  // Brief "done" screen before auto-requeuing
  if (phase === 'done') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 text-white p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Trophy size={48} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black mb-2">Nice!</h1>
            <p className="text-white/60 text-lg">Finding you a new partner...</p>
          </div>
          <Loader size={24} className="animate-spin text-white/40 mx-auto" />
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <Loader size={32} className="animate-spin" />
    </div>
  );
};

export default PeerPlayActivity;
