// User document management for Firebase Auth teachers
// src/firebase/users.js
// Uses Realtime Database (same as sessions)

import { getDatabase, ref, get, set, update } from 'firebase/database';

// Get database reference
const database = getDatabase();

/**
 * Get or create a user document in Realtime Database
 * Called after successful Google Sign-In
 *
 * @param {Object} googleUser - Firebase Auth user object
 * @returns {Object} User document data
 */
export const getOrCreateUser = async (googleUser) => {
  const userRef = ref(database, `users/${googleUser.uid}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    // User exists - update lastLoginAt
    await update(userRef, {
      lastLoginAt: Date.now()
    });

    console.log('✅ Existing user logged in:', googleUser.email);
    return { ...snapshot.val(), uid: googleUser.uid };
  } else {
    // New user - create document
    const userData = {
      uid: googleUser.uid,
      email: googleUser.email,
      displayName: googleUser.displayName,
      photoURL: googleUser.photoURL,
      isPilot: false,
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };

    await set(userRef, userData);
    console.log('✅ New user created:', googleUser.email);

    return userData;
  }
};

/**
 * Get a user document by UID
 *
 * @param {string} uid - Firebase Auth UID
 * @returns {Object|null} User document data or null
 */
export const getUserById = async (uid) => {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    return { ...snapshot.val(), uid };
  }

  return null;
};

/**
 * Update user's last login timestamp
 *
 * @param {string} uid - Firebase Auth UID
 */
export const updateLastLogin = async (uid) => {
  const userRef = ref(database, `users/${uid}`);
  await update(userRef, {
    lastLoginAt: Date.now()
  });
};
