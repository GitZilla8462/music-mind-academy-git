// Peer Play Matchmaking for Listening Journey
// Firebase Realtime Database functions for automatic student pairing
//
// Path: sessions/{sessionCode}/peerPlay/
//   pool/{visitorId}: { id, name, joinedAt }
//   matches/{matchId}: { studentA: {...}, studentB: {...}, turn, status }
//
// Flow:
// 1. Student joins pool
// 2. Server-side: when 2+ students in pool, pop two and create a match
//    (done client-side via transaction to avoid race conditions)
// 3. Match has two turns: turn 1 = A plays B's journey while B watches,
//    turn 2 = B plays A's journey while A watches
// 4. When both turns done, both auto-rejoin pool

import { getDatabase, ref, set, get, remove, onValue, push, runTransaction, update } from 'firebase/database';

const db = getDatabase();

// ─── Helpers ────────────────────────────────────────────────────────

const peerPlayRef = (sessionCode) => ref(db, `sessions/${sessionCode}/peerPlay`);
const poolRef = (sessionCode) => ref(db, `sessions/${sessionCode}/peerPlay/pool`);
const matchesRef = (sessionCode) => ref(db, `sessions/${sessionCode}/peerPlay/matches`);
const studentMatchRef = (sessionCode, studentId) => ref(db, `sessions/${sessionCode}/peerPlay/studentMatch/${studentId}`);

// ─── Pool Management ────────────────────────────────────────────────

/**
 * Add student to the matchmaking pool.
 * If another student is already waiting, atomically create a match.
 */
export const joinPool = async (sessionCode, studentId, studentName) => {
  const myPoolSlot = ref(db, `sessions/${sessionCode}/peerPlay/pool/${studentId}`);
  await set(myPoolSlot, {
    id: studentId,
    name: studentName,
    joinedAt: Date.now()
  });
};

/**
 * Remove student from pool (e.g., on unmount or when matched).
 */
export const leavePool = async (sessionCode, studentId) => {
  const myPoolSlot = ref(db, `sessions/${sessionCode}/peerPlay/pool/${studentId}`);
  await remove(myPoolSlot);
};

/**
 * Check if student is already in a match (e.g., after page refresh).
 * Returns matchId or null.
 */
export const checkExistingMatch = async (sessionCode, studentId) => {
  const snap = await get(studentMatchRef(sessionCode, studentId));
  return snap.exists() ? snap.val() : null;
};

// ─── Matchmaking (client-side with transaction) ─────────────────────

/**
 * Try to find a partner in the pool and create a match.
 * Uses a Firebase transaction on the pool to prevent race conditions —
 * two students calling tryMatch simultaneously won't both claim the same partner.
 * Returns the matchId if a match was created, null otherwise.
 */
export const tryMatch = async (sessionCode, myId, myName) => {
  const poolReference = poolRef(sessionCode);
  let partner = null;

  // Atomically remove ourselves and one partner from the pool
  const { committed } = await runTransaction(poolReference, (currentPool) => {
    if (!currentPool) return currentPool;

    // Find candidates (not me)
    const candidates = Object.entries(currentPool)
      .filter(([key, s]) => s && s.id !== myId)
      .map(([key, s]) => s);

    if (candidates.length === 0) return; // abort — no one to match with

    // Also confirm I'm still in the pool
    const meInPool = Object.values(currentPool).find(s => s && s.id === myId);
    if (!meInPool) return; // abort — I was already matched by someone else

    // Pick the student who has waited the longest
    candidates.sort((a, b) => a.joinedAt - b.joinedAt);
    partner = candidates[0];

    // Remove both from pool atomically
    const updatedPool = { ...currentPool };
    // Remove by key (key = id)
    delete updatedPool[myId];
    delete updatedPool[partner.id];

    return updatedPool;
  });

  if (!committed || !partner) return null;

  // Create match (outside transaction — pool is already claimed)
  const matchRef = push(matchesRef(sessionCode));
  const matchId = matchRef.key;
  const matchData = {
    id: matchId,
    studentA: { id: myId, name: myName, turnDone: false },
    studentB: { id: partner.id, name: partner.name, turnDone: false },
    turn: 1, // turn 1: A plays B's journey, B watches
    status: 'playing', // playing | finished
    createdAt: Date.now(),
    gamesPlayed: 0
  };

  await set(matchRef, matchData);

  // Point both students to this match
  await set(studentMatchRef(sessionCode, myId), matchId);
  await set(studentMatchRef(sessionCode, partner.id), matchId);

  return matchId;
};

/**
 * Try to join an active match as an observer.
 * Called when a student is alone in the pool with no one to match with.
 * Atomically removes self from pool and attaches to an active match.
 * Returns matchId if assigned, null otherwise.
 */
export const tryObserve = async (sessionCode, myId, myName) => {
  // First check: am I actually alone in the pool?
  const poolSnap = await get(poolRef(sessionCode));
  if (!poolSnap.exists()) return null;
  const pool = poolSnap.val();
  const others = Object.values(pool).filter(s => s && s.id !== myId);
  if (others.length > 0) return null; // not alone — tryMatch should work instead

  // Find an active match that doesn't already have an observer
  const matchesSnap = await get(matchesRef(sessionCode));
  if (!matchesSnap.exists()) return null;
  const matches = matchesSnap.val();
  const candidates = Object.values(matches).filter(m => m.status === 'playing' && !m.observer);
  if (candidates.length === 0) return null;

  // Pick a random match to observe
  const match = candidates[Math.floor(Math.random() * candidates.length)];

  // Remove self from pool
  await remove(ref(db, `sessions/${sessionCode}/peerPlay/pool/${myId}`));

  // Attach as observer
  const matchRef = ref(db, `sessions/${sessionCode}/peerPlay/matches/${match.id}`);
  await update(matchRef, {
    observer: { id: myId, name: myName }
  });

  // Point student to this match
  await set(studentMatchRef(sessionCode, myId), match.id);

  return match.id;
};

// ─── Match State Updates ────────────────────────────────────────────

/**
 * Mark current turn as done. If turn 1, advance to turn 2.
 * If turn 2, mark match as finished and return both to pool.
 */
export const completeTurn = async (sessionCode, matchId, studentId) => {
  const matchRef = ref(db, `sessions/${sessionCode}/peerPlay/matches/${matchId}`);
  const snap = await get(matchRef);
  if (!snap.exists()) return;

  const match = snap.val();
  const isA = match.studentA.id === studentId;

  // Validate: only the current player can complete the turn
  // Turn 1: A plays, Turn 2: B plays
  if (match.turn === 1 && !isA) return;
  if (match.turn === 2 && isA) return;

  if (match.turn === 1) {
    // Turn 1 done (A finished playing B's journey) → advance to turn 2
    await update(matchRef, {
      turn: 2,
      'studentA/turnDone': false,
      'studentB/turnDone': false,
      gamesPlayed: (match.gamesPlayed || 0) + 1
    });
  } else if (match.turn === 2) {
    // Turn 2 done (B finished playing A's journey) → match complete
    await update(matchRef, {
      status: 'finished',
      gamesPlayed: (match.gamesPlayed || 0) + 1,
      finishedAt: Date.now()
    });

    // Clear student match pointers
    await remove(studentMatchRef(sessionCode, match.studentA.id));
    await remove(studentMatchRef(sessionCode, match.studentB.id));

    // Release observer if present
    if (match.observer?.id) {
      await remove(studentMatchRef(sessionCode, match.observer.id));
      await joinPool(sessionCode, match.observer.id, match.observer.name);
    }

    // Auto-rejoin pool
    await joinPool(sessionCode, match.studentA.id, match.studentA.name);
    await joinPool(sessionCode, match.studentB.id, match.studentB.name);
  }
};

// ─── Subscriptions ──────────────────────────────────────────────────

/**
 * Subscribe to the student's current match pointer.
 * Returns unsubscribe function.
 * callback receives matchId or null.
 */
export const subscribeToMyMatch = (sessionCode, studentId, callback) => {
  const myMatchRef = studentMatchRef(sessionCode, studentId);
  return onValue(myMatchRef, (snap) => {
    callback(snap.val());
  });
};

/**
 * Subscribe to a specific match's data.
 * Returns unsubscribe function.
 */
export const subscribeToMatch = (sessionCode, matchId, callback) => {
  const matchRef = ref(db, `sessions/${sessionCode}/peerPlay/matches/${matchId}`);
  return onValue(matchRef, (snap) => {
    callback(snap.val());
  });
};

/**
 * Subscribe to the pool (for matchmaking polling).
 * Returns unsubscribe function.
 */
export const subscribeToPool = (sessionCode, callback) => {
  return onValue(poolRef(sessionCode), (snap) => {
    const pool = snap.val();
    callback(pool ? Object.values(pool) : []);
  });
};

/**
 * Subscribe to all matches (for teacher board).
 * Returns unsubscribe function.
 */
export const subscribeToAllMatches = (sessionCode, callback) => {
  return onValue(matchesRef(sessionCode), (snap) => {
    const matches = snap.val();
    callback(matches ? Object.values(matches) : []);
  });
};

/**
 * Subscribe to entire peerPlay node (for teacher board overview).
 * Returns { pool: [...], matches: [...] }
 */
export const subscribeToPeerPlay = (sessionCode, callback) => {
  return onValue(peerPlayRef(sessionCode), (snap) => {
    const data = snap.val();
    if (!data) {
      callback({ pool: [], matches: [] });
      return;
    }
    const pool = data.pool ? Object.values(data.pool) : [];
    const matches = data.matches ? Object.values(data.matches) : [];
    callback({ pool, matches });
  });
};

/**
 * Activate peer play for a session (teacher action).
 * Sets a flag so students know to start joining the pool.
 */
export const activatePeerPlay = async (sessionCode) => {
  await set(ref(db, `sessions/${sessionCode}/peerPlay/active`), true);
};

/**
 * Deactivate peer play.
 */
export const deactivatePeerPlay = async (sessionCode) => {
  await set(ref(db, `sessions/${sessionCode}/peerPlay/active`), false);
};

/**
 * Subscribe to peer play active state.
 */
export const subscribeToActive = (sessionCode, callback) => {
  return onValue(ref(db, `sessions/${sessionCode}/peerPlay/active`), (snap) => {
    callback(snap.val() === true);
  });
};
