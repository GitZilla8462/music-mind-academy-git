// Student document management for Firebase Auth students
// src/firebase/students.js
// Uses Realtime Database (same as sessions and users)

import { getDatabase, ref, get, set, update } from 'firebase/database';

// Get database reference
const database = getDatabase();

/**
 * Get or create a student document in Realtime Database
 * Called after successful Google Sign-In for students
 *
 * @param {Object} googleUser - Firebase Auth user object
 * @returns {Object} Student document data
 */
export const getOrCreateStudent = async (googleUser) => {
  const studentRef = ref(database, `students/${googleUser.uid}`);
  const snapshot = await get(studentRef);

  if (snapshot.exists()) {
    // Student exists - update lastLoginAt
    await update(studentRef, {
      lastLoginAt: Date.now()
    });

    console.log('Student logged in');
    return { ...snapshot.val(), uid: googleUser.uid };
  } else {
    // New student - create document
    const studentData = {
      uid: googleUser.uid,
      email: googleUser.email,
      displayName: googleUser.displayName,
      photoURL: googleUser.photoURL,
      authMethod: 'google',
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };

    await set(studentRef, studentData);
    console.log('New student created');

    return studentData;
  }
};

/**
 * Get a student document by UID
 *
 * @param {string} uid - Firebase Auth UID
 * @returns {Object|null} Student document data or null
 */
export const getStudentById = async (uid) => {
  if (!uid) return null;

  const studentRef = ref(database, `students/${uid}`);
  const snapshot = await get(studentRef);

  if (snapshot.exists()) {
    return { ...snapshot.val(), uid };
  }

  return null;
};

/**
 * Update student's last login timestamp
 *
 * @param {string} uid - Firebase Auth UID
 */
export const updateStudentLastLogin = async (uid) => {
  const studentRef = ref(database, `students/${uid}`);
  await update(studentRef, {
    lastLoginAt: Date.now()
  });
};

/**
 * Check if a user is a student (vs teacher)
 * Students are stored in 'students/' path, teachers in 'users/' path
 *
 * @param {string} uid - Firebase Auth UID
 * @returns {boolean} True if user is a student
 */
export const isStudent = async (uid) => {
  if (!uid) return false;

  const studentRef = ref(database, `students/${uid}`);
  const snapshot = await get(studentRef);
  return snapshot.exists();
};

/**
 * Check if a user is a teacher (vs student)
 * Teachers are stored in 'users/' path
 *
 * @param {string} uid - Firebase Auth UID
 * @returns {boolean} True if user is a teacher
 */
export const isTeacher = async (uid) => {
  if (!uid) return false;

  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.exists();
};

/**
 * Get student's enrolled classes
 *
 * @param {string} studentUid - Student's Firebase UID
 * @returns {Array} Array of enrollment objects
 */
export const getStudentEnrollments = async (studentUid) => {
  if (!studentUid) return [];

  const enrollmentsRef = ref(database, `studentEnrollments/${studentUid}`);
  const snapshot = await get(enrollmentsRef);

  if (!snapshot.exists()) return [];

  const enrollments = [];
  snapshot.forEach((childSnapshot) => {
    enrollments.push({
      classId: childSnapshot.key,
      ...childSnapshot.val()
    });
  });

  return enrollments;
};

/**
 * Update student profile
 *
 * @param {string} uid - Student's Firebase UID
 * @param {Object} updates - Fields to update
 */
export const updateStudentProfile = async (uid, updates) => {
  const studentRef = ref(database, `students/${uid}`);
  await update(studentRef, {
    ...updates,
    updatedAt: Date.now()
  });
};
