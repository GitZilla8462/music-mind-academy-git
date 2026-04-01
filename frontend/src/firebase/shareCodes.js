// Share Codes for Listening Journey Peer Play
// Generates 5-digit codes so students can play each other's games
// Stores codes on the student's work record (studentWork/{uid}/{workKey}/shareCode)
// Lookup: scans classmates' work records to find matching code
// Falls back to localStorage if Firebase unavailable

import { getDatabase, ref, get, update } from 'firebase/database';
import safeStorage from '../utils/safeStorage';

/**
 * Generate a random 5-digit code (10000-99999)
 */
const generateCode = () => {
  return String(Math.floor(10000 + Math.random() * 90000));
};

/**
 * Get or create a share code for a student's listening journey.
 * Stores the code on the student's existing work record (no new Firebase paths needed).
 * Falls back to localStorage if Firebase permissions fail.
 *
 * @param {string} studentUid - e.g., "seat-classId-3"
 * @param {string} workKey - e.g., "ll-lesson5-listening-journey"
 * @param {string} displayName - e.g., "Julia"
 * @returns {Promise<string>} The 5-digit share code
 */
export const getOrCreateShareCode = async (studentUid, workKey, displayName) => {
  const localKey = `share-code-${studentUid}-${workKey}`;
  const db = getDatabase();

  try {
    // Check if this student already has a code on their work record
    const workRef = ref(db, `studentWork/${studentUid}/${workKey}`);
    const workSnap = await get(workRef);

    if (workSnap.exists()) {
      const work = workSnap.val();
      if (work.shareCode) {
        // Save to localStorage for fast access
        try { safeStorage.setItem(localKey, work.shareCode); } catch {}
        return work.shareCode;
      }
    }

    // Generate a new code
    const code = generateCode();

    // Store on the work record using update() (merge, not overwrite)
    await update(ref(db, `studentWork/${studentUid}/${workKey}`), {
      shareCode: code,
      shareCodeName: displayName || 'Student'
    });

    try { safeStorage.setItem(localKey, code); } catch {}
    return code;
  } catch (err) {
    // Firebase failed — use localStorage fallback
    console.warn('Share code Firebase error, using localStorage:', err.message);
    let localCode = null;
    try { localCode = safeStorage.getItem(localKey); } catch {}
    if (!localCode) {
      localCode = generateCode();
      try { safeStorage.setItem(localKey, localCode); } catch {}
    }
    return localCode;
  }
};

/**
 * Look up a journey by share code.
 * Scans classmates' work records to find matching code.
 *
 * @param {string} code - 5-digit share code
 * @param {string} classId - Class ID to search within
 * @param {string} workKey - Work key to search (e.g., "ll-lesson5-listening-journey")
 * @returns {Promise<{ data: object, displayName: string, workKey: string, studentUid: string } | null>}
 */
export const loadJourneyByShareCode = async (code, classId, workKey) => {
  const db = getDatabase();

  // Get all students in this class session
  const studentsRef = ref(db, `classes/${classId}/currentSession/studentsJoined`);
  const studentsSnap = await get(studentsRef);
  if (!studentsSnap.exists()) return null;

  const students = studentsSnap.val();
  const studentIds = Object.keys(students);

  // Check each student's work record for matching share code
  for (const sid of studentIds) {
    try {
      const workRef = ref(db, `studentWork/${sid}/${workKey}`);
      const workSnap = await get(workRef);
      if (!workSnap.exists()) continue;

      const work = workSnap.val();
      if (work.shareCode === code) {
        if (!work.data?.sections?.length) return null; // game not built yet

        return {
          data: work.data,
          displayName: work.shareCodeName || students[sid]?.name || 'Student',
          workKey,
          studentUid: sid
        };
      }
    } catch {
      continue;
    }
  }

  return null;
};

/**
 * Save a peer play score to the creator's journey record.
 * Stored at studentWork/{creatorUid}/{workKey}/peerPlays/{playerUid}
 *
 * @param {string} creatorUid - The student who created the journey
 * @param {string} workKey - The work key
 * @param {string} playerUid - The student who played it
 * @param {string} playerName - Display name of the player
 * @param {number} score - The score achieved
 */
export const savePeerPlayScore = async (creatorUid, workKey, playerUid, playerName, score) => {
  const db = getDatabase();
  await update(ref(db, `studentWork/${creatorUid}/${workKey}/peerPlays/${playerUid}`), {
    playerName: playerName || 'Student',
    score,
    playedAt: Date.now()
  });
};

/**
 * Load all peer play scores for a journey.
 *
 * @param {string} studentUid - The creator's UID
 * @param {string} workKey - The work key
 * @returns {Promise<Array<{ playerName: string, score: number, playedAt: number }>>}
 */
export const loadPeerPlayScores = async (studentUid, workKey) => {
  const db = getDatabase();
  const playsRef = ref(db, `studentWork/${studentUid}/${workKey}/peerPlays`);
  const snap = await get(playsRef);
  if (!snap.exists()) return [];

  const data = snap.val();
  return Object.values(data).sort((a, b) => b.score - a.score);
};
