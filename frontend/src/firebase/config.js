// Firebase configuration for Music Mind Academy
// UPDATED: Added logging utility functions
// src/firebase/config.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, remove, push } from 'firebase/database';

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
 * @param {string} lessonId - Lesson identifier
 * @returns {Promise<string>} Session code
 */
export const createSession = async (teacherId, lessonId) => {
  const sessionCode = generateSessionCode();
  const sessionRef = ref(database, `sessions/${sessionCode}`);
  
  await set(sessionRef, {
    teacherId,
    lessonId,
    currentStage: 'locked',
    createdAt: Date.now(),
    studentsJoined: {},
    studentProgress: {}
  });
  
  return sessionCode;
};

/**
 * Check if a session code exists
 * @param {string} sessionCode - 4-digit code
 * @returns {Promise<boolean>}
 */
export const sessionExists = async (sessionCode) => {
  return new Promise((resolve) => {
    const sessionRef = ref(database, `sessions/${sessionCode}`);
    onValue(sessionRef, (snapshot) => {
      resolve(snapshot.exists());
    }, { onlyOnce: true });
  });
};

/**
 * Student joins a session
 * @param {string} sessionCode - Session to join
 * @param {string} studentId - Student's ID
 * @param {string} studentName - Student's name
 */
export const joinSession = async (sessionCode, studentId, studentName) => {
  const studentRef = ref(database, `sessions/${sessionCode}/studentsJoined/${studentId}`);
  
  await set(studentRef, {
    id: studentId,
    name: studentName,
    joinedAt: Date.now()
  });
};

/**
 * Update the current stage of the lesson
 * @param {string} sessionCode - Session code
 * @param {string} stage - New stage ('locked', 'activity1-unlocked', etc.)
 * 
 * ✅ FIXED: Now clears timer data when changing stages to prevent glitching
 */
export const updateSessionStage = async (sessionCode, stage) => {
  const sessionRef = ref(database, `sessions/${sessionCode}`);
  
  // When changing stages, also clear any existing timer data
  // This prevents old timer data from interfering with the new stage
  await update(sessionRef, {
    currentStage: stage,
    timestamp: Date.now(),
    // Clear timer data when changing stages
    countdownTime: null,
    timerActive: null
  });
};

/**
 * Listen to session changes (for both teacher and students)
 * @param {string} sessionCode - Session code
 * @param {Function} callback - Called when session data changes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToSession = (sessionCode, callback) => {
  const sessionRef = ref(database, `sessions/${sessionCode}`);
  
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
  
  return unsubscribe;
};

/**
 * Update student progress on an activity
 * @param {string} sessionCode - Session code
 * @param {string} studentId - Student's ID
 * @param {string} activityId - Activity identifier
 * @param {string} status - 'working' | 'completed' | 'bonus-completed'
 */
export const updateStudentProgress = async (sessionCode, studentId, activityId, status) => {
  const progressRef = ref(database, `sessions/${sessionCode}/studentProgress/${studentId}/${activityId}`);
  await set(progressRef, status);
};

/**
 * End a session (cleanup)
 * @param {string} sessionCode - Session to end
 */
export const endSession = async (sessionCode) => {
  const sessionRef = ref(database, `sessions/${sessionCode}`);
  
  // Mark as ended instead of deleting (so teacher can review)
  await update(sessionRef, {
    endedAt: Date.now(),
    currentStage: 'ended'
  });
  
  // Optional: Delete after 24 hours
  // setTimeout(() => remove(sessionRef), 24 * 60 * 60 * 1000);
};

/**
 * Get all students in a session
 * @param {string} sessionCode - Session code
 * @returns {Promise<Array>} Array of student objects
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
// LOGGING FUNCTIONS (NEW)
// ==========================================

/**
 * Log an error to Firebase for admin monitoring
 * @param {string} sessionCode - Session code where error occurred
 * @param {string} studentId - Student who experienced the error
 * @param {string} message - Error message
 * @param {object} data - Additional error data
 */
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

/**
 * Log when a student gets kicked from a session
 * @param {string} sessionCode - Session code
 * @param {string} studentId - Student who was kicked
 * @param {string} reason - Reason for kick
 * @param {object} data - Additional context
 */
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
    
    // Also add to centralized problems list
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

/**
 * Log a warning to Firebase
 * @param {string} sessionCode - Session code
 * @param {string} studentId - Student ID
 * @param {string} message - Warning message
 * @param {object} data - Additional data
 */
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

export default database;