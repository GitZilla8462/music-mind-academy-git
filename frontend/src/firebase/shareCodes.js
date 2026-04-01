// Share Codes for Listening Journey Peer Play
// Generates 5-digit codes so students can play each other's games
// Path: shareCodes/{code} → { studentUid, workKey, displayName, createdAt }
// Path: studentWork/{studentUid}/{workKey}/shareCode → code

import { getDatabase, ref, get, set, runTransaction } from 'firebase/database';

/**
 * Generate a random 5-digit code (10000-99999)
 */
const generateCode = () => {
  return String(Math.floor(10000 + Math.random() * 90000));
};

/**
 * Get or create a share code for a student's listening journey.
 * If one already exists (stored on the work record), returns it.
 * Otherwise generates a new unique code and stores the mapping.
 *
 * @param {string} studentUid - e.g., "seat-classId-3"
 * @param {string} workKey - e.g., "ll-lesson4-listening-journey"
 * @param {string} displayName - e.g., "Julia"
 * @returns {Promise<string>} The 5-digit share code
 */
export const getOrCreateShareCode = async (studentUid, workKey, displayName) => {
  const db = getDatabase();

  // Check if this student already has a code for this work
  const existingCodeRef = ref(db, `studentWork/${studentUid}/${workKey}/shareCode`);
  const existingSnap = await get(existingCodeRef);
  if (existingSnap.exists()) {
    return existingSnap.val();
  }

  // Generate a unique code (retry if collision)
  let code;
  let attempts = 0;
  while (attempts < 10) {
    code = generateCode();
    const codeRef = ref(db, `shareCodes/${code}`);
    const codeSnap = await get(codeRef);
    if (!codeSnap.exists()) {
      // Claim this code
      await set(codeRef, {
        studentUid,
        workKey,
        displayName: displayName || 'Student',
        createdAt: Date.now()
      });
      // Store code on the work record for fast lookup next time
      await set(existingCodeRef, code);
      return code;
    }
    attempts++;
  }

  throw new Error('Could not generate unique share code');
};

/**
 * Look up a journey by share code.
 * Returns the full saved journey data ready for savedDataOverride.
 *
 * @param {string} code - 5-digit share code
 * @returns {Promise<{ data: object, displayName: string, workKey: string } | null>}
 */
export const loadJourneyByShareCode = async (code) => {
  const db = getDatabase();

  // Look up code → studentUid + workKey
  const codeRef = ref(db, `shareCodes/${code}`);
  const codeSnap = await get(codeRef);
  if (!codeSnap.exists()) return null;

  const { studentUid, workKey, displayName } = codeSnap.val();

  // Load the student's work
  const workRef = ref(db, `studentWork/${studentUid}/${workKey}`);
  const workSnap = await get(workRef);
  if (!workSnap.exists()) return null;

  const work = workSnap.val();
  if (!work.data?.sections?.length) return null; // no journey built yet

  return {
    data: work.data,
    displayName,
    workKey,
    studentUid
  };
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
  const playRef = ref(db, `studentWork/${creatorUid}/${workKey}/peerPlays/${playerUid}`);
  await set(playRef, {
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
