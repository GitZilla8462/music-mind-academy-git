// Firebase configuration for Music Mind Academy
// UPDATED: Added debug logging to createSession
// UPDATED: Added Auth for teacher accounts (uses Realtime DB for data)
// src/firebase/config.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, remove, push, get } from 'firebase/database';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAv0tH8VmKizydKhdHfFFgKES9Ir-PfXtA",
  authDomain: "music-mind-academy.firebaseapp.com",
  databaseURL: "https://music-mind-academy-default-rtdb.firebaseio.com",
  projectId: "music-mind-academy",
  storageBucket: "music-mind-academy.firebasestorage.app",
  messagingSenderId: "236372079268",
  appId: "1:236372079268:web:d943daec694d1f40342c31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Initialize Firebase Auth with Google and Microsoft Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');

// ==========================================
// SESSION FUNCTIONS
// ==========================================

/**
 * Generate a random 4-digit session code
 */
export const generateSessionCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Create a new classroom session
 * @param {string} teacherId - Teacher's ID
 * @param {string} lessonId - Lesson identifier (e.g., 'music-loops-lesson1')
 * @param {string} lessonRoute - Route to lesson (e.g., '/lessons/film-music-project/lesson2')
 * @param {Object} options - Optional settings
 * @param {string} options.classMode - 'guest' (no accounts) or 'accounts' (require sign-in)
 * @param {string} options.classId - Class ID if using accounts mode
 * @returns {Promise<string>} Session code
 */
export const createSession = async (teacherId, lessonId, lessonRoute, options = {}) => {
  // ✅ DEBUG CODE ADDED HERE
  console.trace('🔍 CREATE SESSION CALLED FROM:');
  console.log('📍 Parameters received:', { teacherId, lessonId, lessonRoute, options });

  // If lessonRoute is missing or wrong, log a warning
  if (!lessonRoute || lessonRoute.includes('lesson1')) {
    console.warn('⚠️ WARNING: Creating session without Lesson 2 route!');
  }

  const sessionCode = generateSessionCode();
  const sessionRef = ref(database, `sessions/${sessionCode}`);

  // Default to guest mode for backwards compatibility
  const { classMode = 'guest', classId = null } = options;

  const sessionData = {
    teacherId,
    lessonId,
    lessonRoute,
    classMode,        // 'guest' or 'accounts'
    classId,          // null for guest mode, class ID for accounts mode
    currentStage: 'join-code',
    createdAt: Date.now(),
    studentsJoined: {},
    studentProgress: {},
    timestamp: Date.now()
  };
  
  console.log('📝 Creating session with data:', sessionData);
  
  try {
    await set(sessionRef, sessionData);
    console.log(`✅ Session created: ${sessionCode} for ${lessonId} at ${lessonRoute}`);
    
    const snapshot = await get(sessionRef);
    if (snapshot.exists()) {
      console.log('✅ Verified session exists in Firebase:', snapshot.val());
    } else {
      console.error('❌ WARNING: Session was NOT found immediately after creation!');
    }
    
    return sessionCode;
  } catch (error) {
    console.error('❌ Error creating session:', error);
    throw error;
  }
};

/**
 * Check if a session code exists
 */
export const sessionExists = async (sessionCode) => {
  try {
    const sessionRef = ref(database, `sessions/${sessionCode}`);
    const snapshot = await get(sessionRef);
    const exists = snapshot.exists();
    console.log(`🔍 Session ${sessionCode} exists:`, exists);
    return exists;
  } catch (error) {
    console.error('❌ Error checking session existence:', error);
    return false;
  }
};

/**
 * Get session data including lesson route
 */
export const getSessionData = async (sessionCode) => {
  try {
    const sessionRef = ref(database, `sessions/${sessionCode}`);
    const snapshot = await get(sessionRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log(`📦 Got session data for ${sessionCode}:`, data);
      return data;
    }
    
    console.warn(`⚠️ No session data found for ${sessionCode}`);
    return null;
  } catch (error) {
    console.error('❌ Error getting session data:', error);
    return null;
  }
};

/**
 * Student joins a session
 * ✅ UPDATED: Now includes score initialization
 */
export const joinSession = async (sessionCode, studentId, studentName) => {
  try {
    const studentRef = ref(database, `sessions/${sessionCode}/studentsJoined/${studentId}`);
    
    await set(studentRef, {
      id: studentId,
      name: studentName,
      joinedAt: Date.now(),
      score: 0 // ✅ Initialize score at 0
    });
    
    console.log('Student joined session');
  } catch (error) {
    console.error('❌ Error joining session:', error);
    throw error;
  }
};

/**
 * Update the current stage of the lesson
 */
export const updateSessionStage = async (sessionCode, stage) => {
  try {
    const sessionRef = ref(database, `sessions/${sessionCode}`);
    
    await update(sessionRef, {
      currentStage: stage,
      timestamp: Date.now(),
      countdownTime: null,
      timerActive: null
    });
    
    console.log(`✅ Updated session ${sessionCode} to stage: ${stage}`);
  } catch (error) {
    console.error('❌ Error updating session stage:', error);
    throw error;
  }
};

/**
 * Listen to session changes
 */
export const subscribeToSession = (sessionCode, callback) => {
  const sessionRef = ref(database, `sessions/${sessionCode}`);
  
  console.log(`👂 Subscribing to session: ${sessionCode}`);
  
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data === null) {
      console.warn(`⚠️ Session ${sessionCode} data is NULL - session may have been deleted`);
    } else {
      console.log(`📡 Session ${sessionCode} update:`, data.currentStage);
    }
    
    callback(data);
  });
  
  return unsubscribe;
};

/**
 * Update student progress on an activity
 */
export const updateStudentProgress = async (sessionCode, studentId, activityId, status) => {
  const progressRef = ref(database, `sessions/${sessionCode}/studentProgress/${studentId}/${activityId}`);
  await set(progressRef, status);
};

/**
 * End a session
 */
export const endSession = async (sessionCode) => {
  const sessionRef = ref(database, `sessions/${sessionCode}`);
  
  await update(sessionRef, {
    endedAt: Date.now(),
    currentStage: 'ended'
  });
  
  console.log(`🔚 Session ${sessionCode} ended`);
};

/**
 * Get all students in a session
 */
export const getSessionStudents = async (sessionCode) => {
  return new Promise((resolve) => {
    const studentsRef = ref(database, `sessions/${sessionCode}/studentsJoined`);
    onValue(studentsRef, (snapshot) => {
      const students = snapshot.val();
      resolve(students ? Object.values(students) : []);
    }, { onlyOnce: true });
  });
};

// ==========================================
// ✅ SCORE TRACKING FUNCTIONS (NEW)
// ==========================================

/**
 * Update a student's score (add points)
 * @param {string} sessionCode - Session code
 * @param {string} studentId - Student ID
 * @param {number} pointsToAdd - Points to add to current score
 */
export const updateStudentScore = async (sessionCode, studentId, pointsToAdd) => {
  try {
    const studentRef = ref(database, `sessions/${sessionCode}/studentsJoined/${studentId}`);
    
    // Get current score
    const snapshot = await get(studentRef);
    const currentScore = snapshot.val()?.score || 0;
    
    // Update score
    await update(studentRef, {
      score: currentScore + pointsToAdd,
      lastUpdated: Date.now()
    });
    
    console.log(`✅ Updated ${studentId} score: +${pointsToAdd} (total: ${currentScore + pointsToAdd})`);
  } catch (error) {
    console.error('❌ Error updating student score:', error);
    throw error;
  }
};

/**
 * Set a student's score directly (overwrite)
 */
export const setStudentScore = async (sessionCode, studentId, newScore) => {
  try {
    const studentRef = ref(database, `sessions/${sessionCode}/studentsJoined/${studentId}`);
    
    await update(studentRef, {
      score: newScore,
      lastUpdated: Date.now()
    });
    
    console.log(`✅ Set ${studentId} score to ${newScore}`);
  } catch (error) {
    console.error('❌ Error setting student score:', error);
    throw error;
  }
};

/**
 * Award bonus points
 */
export const awardBonusPoints = async (sessionCode, studentId, bonusPoints, reason = '') => {
  try {
    await updateStudentScore(sessionCode, studentId, bonusPoints);
    console.log(`🎁 Awarded ${bonusPoints} bonus points to ${studentId}${reason ? ` for: ${reason}` : ''}`);
  } catch (error) {
    console.error('❌ Error awarding bonus points:', error);
    throw error;
  }
};

/**
 * Get leaderboard (sorted by score)
 */
export const getLeaderboard = async (sessionCode, limit = 10) => {
  try {
    const sessionRef = ref(database, `sessions/${sessionCode}/studentsJoined`);
    
    const snapshot = await get(sessionRef);
    if (!snapshot.exists()) return [];
    
    const students = snapshot.val();
    const leaderboard = Object.entries(students)
      .map(([id, data]) => ({
        id,
        name: data.name || id,
        score: data.score || 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return leaderboard;
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    return [];
  }
};

/**
 * Reset all scores in a session
 */
export const resetAllScores = async (sessionCode) => {
  try {
    const sessionRef = ref(database, `sessions/${sessionCode}/studentsJoined`);
    
    const snapshot = await get(sessionRef);
    if (!snapshot.exists()) return;
    
    const students = snapshot.val();
    const updates = {};
    
    Object.keys(students).forEach(studentId => {
      updates[`${studentId}/score`] = 0;
    });
    
    await update(sessionRef, updates);
    console.log('🔄 All scores reset to 0');
  } catch (error) {
    console.error('❌ Error resetting scores:', error);
    throw error;
  }
};

// ==========================================
// LOGGING FUNCTIONS
// ==========================================

export const logError = async (sessionCode, studentId, message, data = {}) => {
  try {
    const logRef = ref(database, `session-logs/${sessionCode}/${studentId}`);
    await push(logRef, {
      type: 'error',
      message,
      timestamp: Date.now(),
      data,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    });
  } catch (error) {
    console.error('Failed to log error to Firebase:', error);
  }
};

export const logKick = async (sessionCode, studentId, reason, data = {}) => {
  try {
    const logRef = ref(database, `session-logs/${sessionCode}/${studentId}`);
    await push(logRef, {
      type: 'kick',
      reason,
      timestamp: Date.now(),
      data,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    });
    
    const problemsRef = ref(database, 'all-problems');
    await push(problemsRef, {
      type: 'kick',
      message: reason,
      sessionCode,
      studentId,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      data,
      resolved: false
    });
  } catch (error) {
    console.error('Failed to log kick to Firebase:', error);
  }
};

export const logWarning = async (sessionCode, studentId, message, data = {}) => {
  try {
    const logRef = ref(database, `session-logs/${sessionCode}/${studentId}`);
    await push(logRef, {
      type: 'warning',
      message,
      timestamp: Date.now(),
      data
    });
  } catch (error) {
    console.error('Failed to log warning to Firebase:', error);
  }
};

// ==========================================
// MOOD MATCH VOTING FUNCTIONS
// ==========================================

/**
 * Set the current loop index for the Mood Match Game
 * Teacher controls which loop students are voting on
 */
export const setMoodMatchCurrentLoop = async (sessionCode, loopIndex, showResults = false) => {
  try {
    const moodMatchRef = ref(database, `sessions/${sessionCode}/moodMatch`);

    await update(moodMatchRef, {
      currentLoopIndex: loopIndex,
      showResults: showResults,
      updatedAt: Date.now()
    });

    console.log(`✅ Set mood match loop to ${loopIndex}, showResults: ${showResults}`);
  } catch (error) {
    console.error('❌ Error setting mood match loop:', error);
    throw error;
  }
};

/**
 * Toggle showing results for the current loop
 */
export const toggleMoodMatchResults = async (sessionCode, showResults) => {
  try {
    const moodMatchRef = ref(database, `sessions/${sessionCode}/moodMatch`);

    await update(moodMatchRef, {
      showResults: showResults,
      updatedAt: Date.now()
    });

    console.log(`✅ Set showResults to ${showResults}`);
  } catch (error) {
    console.error('❌ Error toggling mood match results:', error);
    throw error;
  }
};

/**
 * Record a student's vote for a loop
 */
export const recordMoodMatchVote = async (sessionCode, loopId, studentId, moodId) => {
  try {
    const voteRef = ref(database, `sessions/${sessionCode}/moodMatchVotes/${loopId}/${studentId}`);

    await set(voteRef, {
      moodId,
      timestamp: Date.now()
    });

    console.log(`✅ Recorded vote: ${studentId} voted ${moodId} for loop ${loopId}`);
  } catch (error) {
    console.error('❌ Error recording mood match vote:', error);
    throw error;
  }
};

/**
 * Subscribe to mood match state (current loop, showResults)
 */
export const subscribeToMoodMatchState = (sessionCode, callback) => {
  const moodMatchRef = ref(database, `sessions/${sessionCode}/moodMatch`);

  console.log(`👂 Subscribing to mood match state for session: ${sessionCode}`);

  const unsubscribe = onValue(moodMatchRef, (snapshot) => {
    const data = snapshot.val() || { currentLoopIndex: 0, showResults: false };
    callback(data);
  });

  return unsubscribe;
};

/**
 * Subscribe to votes for a specific loop
 */
export const subscribeToLoopVotes = (sessionCode, loopId, callback) => {
  const votesRef = ref(database, `sessions/${sessionCode}/moodMatchVotes/${loopId}`);

  const unsubscribe = onValue(votesRef, (snapshot) => {
    const votes = snapshot.val() || {};
    callback(votes);
  });

  return unsubscribe;
};

/**
 * Subscribe to all mood match votes
 */
export const subscribeToAllMoodMatchVotes = (sessionCode, callback) => {
  const votesRef = ref(database, `sessions/${sessionCode}/moodMatchVotes`);

  const unsubscribe = onValue(votesRef, (snapshot) => {
    const votes = snapshot.val() || {};
    callback(votes);
  });

  return unsubscribe;
};

/**
 * Get vote tally for a specific loop
 */
export const getLoopVoteTally = (votes) => {
  const tally = {};

  Object.values(votes).forEach(vote => {
    const moodId = vote.moodId;
    tally[moodId] = (tally[moodId] || 0) + 1;
  });

  return tally;
};

/**
 * Clear all votes for mood match (reset for new game)
 */
export const clearMoodMatchVotes = async (sessionCode) => {
  try {
    const votesRef = ref(database, `sessions/${sessionCode}/moodMatchVotes`);
    await remove(votesRef);

    const stateRef = ref(database, `sessions/${sessionCode}/moodMatch`);
    await set(stateRef, {
      currentLoopIndex: 0,
      showResults: false,
      updatedAt: Date.now()
    });

    console.log('🔄 Cleared all mood match votes');
  } catch (error) {
    console.error('❌ Error clearing mood match votes:', error);
    throw error;
  }
};

/**
 * Check if student has already voted for a loop
 */
export const hasStudentVoted = async (sessionCode, loopId, studentId) => {
  try {
    const voteRef = ref(database, `sessions/${sessionCode}/moodMatchVotes/${loopId}/${studentId}`);
    const snapshot = await get(voteRef);
    return snapshot.exists();
  } catch (error) {
    console.error('❌ Error checking if student voted:', error);
    return false;
  }
};

export default database;