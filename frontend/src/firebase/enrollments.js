// Class roster and enrollment management
// src/firebase/enrollments.js
// Handles student seats, passwords, and enrollments for Student Accounts mode
// SECURITY: Passwords are hashed with bcrypt for verification

import { getDatabase, ref, get, set, update, remove } from 'firebase/database';
import bcrypt from 'bcryptjs';
import { updateClassStudentCount } from './classes';

const database = getDatabase();

// bcrypt cost factor (10 is recommended minimum)
const BCRYPT_ROUNDS = 10;

// Rate limiting constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Musical instruments for username generation
const MUSICAL_INSTRUMENTS = [
  'tuba', 'flute', 'drum', 'piano', 'guitar', 'violin', 'trumpet', 'cello',
  'harp', 'banjo', 'bass', 'oboe', 'viola', 'horn', 'bell',
  'cymbal', 'snare', 'bongo', 'clef', 'chord', 'note', 'beat', 'tempo',
  'brass', 'reed', 'string', 'keys'
];

// Word lists for password generation (simple, phonetic, easy to spell)
const PASSWORD_ADJECTIVES = [
  'bold', 'bright', 'calm', 'cool', 'dark', 'deep', 'epic', 'fast',
  'gold', 'grand', 'loud', 'quick', 'sharp', 'slow', 'soft', 'swift',
  'tall', 'warm', 'wild', 'brave'
];

const PASSWORD_NOUNS = [
  'beat', 'bell', 'boom', 'clap', 'crash', 'drum', 'echo', 'flame',
  'grove', 'lake', 'loop', 'moon', 'note', 'peak', 'rain', 'rock',
  'snap', 'solo', 'star', 'storm', 'sun', 'wave', 'wind'
];

/**
 * Generate a two-word password (e.g., "epicdrum")
 * Displayed as one word, no spaces or hyphens
 */
export const generatePassword = () => {
  const adj = PASSWORD_ADJECTIVES[Math.floor(Math.random() * PASSWORD_ADJECTIVES.length)];
  const noun = PASSWORD_NOUNS[Math.floor(Math.random() * PASSWORD_NOUNS.length)];
  return adj + noun;
};

/**
 * Normalize password input for comparison
 * Strips spaces, lowercases — so "Epic Drum", "epic drum", "epicdrum" all match
 */
export const normalizePassword = (input) => {
  return input.replace(/\s+/g, '').toLowerCase();
};

/**
 * Check if a username is taken globally (across all classes)
 *
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} True if taken
 */
export const isUsernameTaken = async (username) => {
  const usernameRef = ref(database, `usernames/${username.toLowerCase()}`);
  const snapshot = await get(usernameRef);
  return snapshot.exists();
};

/**
 * Register a username in the global index
 *
 * @param {string} username - Username to register
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 */
export const registerUsername = async (username, classId, seatNumber) => {
  await set(ref(database, `usernames/${username.toLowerCase()}`), {
    classId,
    seatNumber,
    createdAt: Date.now()
  });
};

/**
 * Remove a username from the global index
 *
 * @param {string} username - Username to remove
 */
export const unregisterUsername = async (username) => {
  if (username) {
    await remove(ref(database, `usernames/${username.toLowerCase()}`));
  }
};

/**
 * Look up a student globally by username
 *
 * @param {string} username - Username to look up
 * @returns {Promise<Object|null>} { classId, seatNumber } or null
 */
export const lookupUsername = async (username) => {
  const usernameRef = ref(database, `usernames/${username.toLowerCase()}`);
  const snapshot = await get(usernameRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

/**
 * Generate a unique musical username (globally unique across all classes)
 * Format: {instrument}{3-digits} e.g., "tuba123", "flute456"
 *
 * @param {string} classId - Class ID (for local set check)
 * @param {Set} existingUsernames - Set of usernames already in use (optional)
 * @returns {Promise<string>} Unique username
 */
export const generateMusicalUsername = async (classId, existingUsernames = new Set()) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const instrument = MUSICAL_INSTRUMENTS[Math.floor(Math.random() * MUSICAL_INSTRUMENTS.length)];
    const number = Math.floor(100 + Math.random() * 900); // 100-999
    const username = `${instrument}${number}`;

    // Check local set first (fast)
    if (!existingUsernames.has(username)) {
      // Check global index
      const taken = await isUsernameTaken(username);
      if (!taken) {
        return username;
      }
    }

    attempts++;
  }

  // Fallback: use timestamp-based username
  return `music${Date.now().toString().slice(-6)}`;
};

/**
 * Look up a seat by username
 *
 * @param {string} classId - Class ID
 * @param {string} username - Username to look up
 * @returns {Object|null} Seat data or null
 */
export const getSeatByUsername = async (classId, username) => {
  const roster = await getClassRoster(classId);
  const normalizedUsername = username.toLowerCase().trim();

  const seat = roster.find(s =>
    s.username && s.username.toLowerCase() === normalizedUsername
  );

  return seat || null;
};

/**
 * Hash a password using bcrypt
 * @param {string} password - The plaintext password
 * @returns {Promise<string>} The hashed password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

/**
 * Add a seat to a class roster (Student Accounts mode)
 *
 * @param {string} classId - Class ID
 * @param {Object} seatData - Seat data
 * @param {number} seatData.seatNumber - Seat number (1-40)
 * @param {string} seatData.displayName - Display name (e.g., "Seat 1" or "John D.")
 * @param {string} seatData.username - Optional username (will be generated if not provided)
 * @returns {Object} Created seat data with generated PIN and username
 */
export const addSeatToRoster = async (classId, seatData) => {
  const { seatNumber, displayName = `Seat ${seatNumber}`, username: providedUsername } = seatData;

  // Check if seat already exists
  const seatRef = ref(database, `classRosters/${classId}/${seatNumber}`);
  const existingSnapshot = await get(seatRef);

  if (existingSnapshot.exists()) {
    throw new Error(`Seat ${seatNumber} already exists in this class`);
  }

  // Generate password and hash it
  const password = generatePassword();
  const hashedPassword = await hashPassword(password);

  // Generate username if not provided
  const username = providedUsername || await generateMusicalUsername(classId);

  const fullSeatData = {
    seatNumber,
    displayName,
    username, // Musical username for student login (e.g., "tuba123")
    pin: password, // Plaintext stored in roster (protected, teacher-only access)
    studentUid: null, // Will be set when a Google account is linked
    status: 'active',
    addedAt: Date.now()
  };

  // Store seat in roster, hashed password, and register username globally
  await Promise.all([
    set(seatRef, fullSeatData),
    set(ref(database, `pinHashes/${classId}/${seatNumber}`), {
      hash: hashedPassword,
      updatedAt: Date.now()
    }),
    registerUsername(username, classId, seatNumber)
  ]);

  // Update student count
  const roster = await getClassRoster(classId);
  await updateClassStudentCount(classId, roster.length);

  console.log(`Added seat ${seatNumber} to class`);
  return fullSeatData;
};

/**
 * Add multiple seats to a class roster (bulk add)
 *
 * @param {string} classId - Class ID
 * @param {number} count - Number of seats to add
 * @param {number} startFrom - Starting seat number (default 1)
 * @param {Array} displayNames - Optional array of display names to use
 * @returns {Array} Array of created seat data
 */
export const bulkAddSeats = async (classId, count, startFrom = 1, displayNames = []) => {
  // Get existing roster to find the next available seat number and existing usernames
  const existingRoster = await getClassRoster(classId);
  const existingNumbers = new Set(existingRoster.map(s => s.seatNumber));
  const existingUsernames = new Set(existingRoster.map(s => s.username).filter(Boolean));

  let nextSeat = startFrom;
  const createdSeats = [];
  const rosterUpdates = {};
  const pinHashUpdates = {};

  for (let i = 0; i < count; i++) {
    // Find next available seat number
    while (existingNumbers.has(nextSeat)) {
      nextSeat++;
    }

    const password = generatePassword();
    const hashedPassword = await hashPassword(password);

    // Generate unique username
    const username = await generateMusicalUsername(classId, existingUsernames);
    existingUsernames.add(username);

    // Use provided display name or default
    const displayName = displayNames[i] || `Seat ${nextSeat}`;

    const seatData = {
      seatNumber: nextSeat,
      displayName,
      username, // Musical username for student login
      pin: password, // Plaintext for teacher
      studentUid: null,
      status: 'active',
      addedAt: Date.now()
    };

    rosterUpdates[`classRosters/${classId}/${nextSeat}`] = seatData;
    pinHashUpdates[`pinHashes/${classId}/${nextSeat}`] = {
      hash: hashedPassword,
      updatedAt: Date.now()
    };

    createdSeats.push(seatData);
    existingNumbers.add(nextSeat);
    nextSeat++;
  }

  // Batch write all seats
  const updates = { ...rosterUpdates, ...pinHashUpdates };

  // Write each seat individually (Firebase doesn't support multi-path updates at root level easily)
  for (const [path, data] of Object.entries(updates)) {
    await set(ref(database, path), data);
  }

  // Register all usernames globally
  for (const seat of createdSeats) {
    await registerUsername(seat.username, classId, seat.seatNumber);
  }

  // Update student count
  await updateClassStudentCount(classId, existingRoster.length + count);

  console.log(`Bulk added ${count} seats to class ${classId}`);
  return createdSeats;
};

/**
 * Get all seats in a class roster
 *
 * @param {string} classId - Class ID
 * @returns {Array} Array of seat objects, sorted by seat number
 */
export const getClassRoster = async (classId) => {
  const rosterRef = ref(database, `classRosters/${classId}`);
  const snapshot = await get(rosterRef);

  if (!snapshot.exists()) return [];

  const seats = [];
  snapshot.forEach((child) => {
    seats.push(child.val());
  });

  // Sort by seat number
  seats.sort((a, b) => a.seatNumber - b.seatNumber);

  return seats;
};

/**
 * Get a specific seat from a class roster
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 * @returns {Object|null} Seat data or null
 */
export const getSeat = async (classId, seatNumber) => {
  const seatRef = ref(database, `classRosters/${classId}/${seatNumber}`);
  const snapshot = await get(seatRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

/**
 * Update a seat in the roster
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 * @param {Object} updates - Fields to update
 */
export const updateSeat = async (classId, seatNumber, updates) => {
  const seatRef = ref(database, `classRosters/${classId}/${seatNumber}`);
  await update(seatRef, {
    ...updates,
    updatedAt: Date.now()
  });
};

/**
 * Regenerate username for a seat (for seats created before username feature)
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 * @returns {string} New username
 */
export const regenerateUsername = async (classId, seatNumber) => {
  // Get old username to unregister
  const seat = await getSeat(classId, seatNumber);
  if (seat?.username) {
    await unregisterUsername(seat.username);
  }

  const newUsername = await generateMusicalUsername(classId);

  await Promise.all([
    update(ref(database, `classRosters/${classId}/${seatNumber}`), {
      username: newUsername,
      updatedAt: Date.now()
    }),
    registerUsername(newUsername, classId, seatNumber)
  ]);

  console.log(`Regenerated username for seat ${seatNumber}`);
  return newUsername;
};

/**
 * Generate usernames for all seats in a class that don't have them
 *
 * @param {string} classId - Class ID
 * @returns {number} Number of usernames generated
 */
export const generateMissingUsernames = async (classId) => {
  const roster = await getClassRoster(classId);
  const existingUsernames = new Set(roster.map(s => s.username).filter(Boolean));
  let count = 0;

  for (const seat of roster) {
    if (!seat.username) {
      const username = await generateMusicalUsername(classId, existingUsernames);
      existingUsernames.add(username);
      await update(ref(database, `classRosters/${classId}/${seat.seatNumber}`), {
        username,
        updatedAt: Date.now()
      });
      count++;
    }
  }

  console.log(`Generated ${count} missing usernames for class ${classId}`);
  return count;
};

/**
 * Reset a seat's password
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 * @returns {string} New password
 */
export const resetSeatPassword = async (classId, seatNumber) => {
  const newPassword = generatePassword();
  const hashedPassword = await hashPassword(newPassword);

  // Update both roster (plaintext for teacher) and pinHashes (for verification)
  await Promise.all([
    update(ref(database, `classRosters/${classId}/${seatNumber}`), {
      pin: newPassword,
      updatedAt: Date.now()
    }),
    set(ref(database, `pinHashes/${classId}/${seatNumber}`), {
      hash: hashedPassword,
      updatedAt: Date.now()
    }),
    // Clear any rate limiting lockout when password is reset
    remove(ref(database, `pinLoginAttempts/${classId}/${seatNumber}`))
  ]);

  return newPassword;
};

/**
 * Remove a seat from the roster
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 */
export const removeSeat = async (classId, seatNumber) => {
  // Get seat data first to unregister username
  const seat = await getSeat(classId, seatNumber);

  await Promise.all([
    remove(ref(database, `classRosters/${classId}/${seatNumber}`)),
    remove(ref(database, `pinHashes/${classId}/${seatNumber}`)),
    remove(ref(database, `pinLoginAttempts/${classId}/${seatNumber}`)),
    seat?.username ? unregisterUsername(seat.username) : Promise.resolve()
  ]);

  // Update student count
  const roster = await getClassRoster(classId);
  await updateClassStudentCount(classId, roster.length);

  console.log(`Removed seat ${seatNumber} from class ${classId}`);
};

/**
 * Link a Google account to a seat
 * Called when a student signs in with Google and joins a class
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 * @param {string} studentUid - Student's Firebase UID
 */
export const linkStudentToSeat = async (classId, seatNumber, studentUid) => {
  await update(ref(database, `classRosters/${classId}/${seatNumber}`), {
    studentUid,
    linkedAt: Date.now()
  });

  // Also create enrollment record for the student
  await set(ref(database, `studentEnrollments/${studentUid}/${classId}`), {
    classId,
    seatNumber,
    enrolledAt: Date.now(),
    role: 'student'
  });

  console.log(`Linked student to seat ${seatNumber}`);
};

/**
 * Unlink a student from a seat
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 */
export const unlinkStudentFromSeat = async (classId, seatNumber) => {
  const seat = await getSeat(classId, seatNumber);
  if (!seat || !seat.studentUid) return;

  const studentUid = seat.studentUid;

  // Remove the link
  await update(ref(database, `classRosters/${classId}/${seatNumber}`), {
    studentUid: null,
    linkedAt: null
  });

  // Remove enrollment record
  await remove(ref(database, `studentEnrollments/${studentUid}/${classId}`));

  console.log(`Unlinked student from seat ${seatNumber} in class ${classId}`);
};

/**
 * Check rate limiting status for PIN login
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 * @returns {Object} { isLocked, remainingAttempts, lockoutEndsAt }
 */
export const checkRateLimitStatus = async (classId, seatNumber) => {
  const attemptsRef = ref(database, `pinLoginAttempts/${classId}/${seatNumber}`);
  const snapshot = await get(attemptsRef);

  if (!snapshot.exists()) {
    return { isLocked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS, lockoutEndsAt: null };
  }

  const data = snapshot.val();
  const now = Date.now();

  // Check if lockout has expired
  if (data.lockedUntil && data.lockedUntil > now) {
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutEndsAt: data.lockedUntil,
      minutesRemaining: Math.ceil((data.lockedUntil - now) / 60000)
    };
  }

  // If lockout expired, reset the counter
  if (data.lockedUntil && data.lockedUntil <= now) {
    await remove(attemptsRef);
    return { isLocked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS, lockoutEndsAt: null };
  }

  const remainingAttempts = MAX_LOGIN_ATTEMPTS - (data.failedAttempts || 0);
  return {
    isLocked: false,
    remainingAttempts: Math.max(0, remainingAttempts),
    lockoutEndsAt: null
  };
};

/**
 * Record a failed PIN attempt
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 * @returns {Object} Updated rate limit status
 */
export const recordFailedPinAttempt = async (classId, seatNumber) => {
  const attemptsRef = ref(database, `pinLoginAttempts/${classId}/${seatNumber}`);
  const snapshot = await get(attemptsRef);

  let failedAttempts = 1;
  if (snapshot.exists()) {
    failedAttempts = (snapshot.val().failedAttempts || 0) + 1;
  }

  const updateData = {
    failedAttempts,
    lastAttempt: Date.now()
  };

  // Lock out if too many attempts
  if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
    updateData.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    console.log(`Seat ${seatNumber} in class ${classId} locked due to too many failed PIN attempts`);
  }

  await set(attemptsRef, updateData);

  return checkRateLimitStatus(classId, seatNumber);
};

/**
 * Clear failed attempts on successful login
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 */
export const clearFailedAttempts = async (classId, seatNumber) => {
  await remove(ref(database, `pinLoginAttempts/${classId}/${seatNumber}`));
};

/**
 * Verify password for a seat
 * Uses bcrypt to compare against hashed password
 * Normalizes input (strips spaces, lowercases) for flexibility
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 * @param {string} password - Password to verify
 * @returns {Object} { valid, error, rateLimitStatus }
 */
export const verifyPin = async (classId, seatNumber, password) => {
  // Check rate limiting first
  const rateLimitStatus = await checkRateLimitStatus(classId, seatNumber);

  if (rateLimitStatus.isLocked) {
    return {
      valid: false,
      error: `Too many failed attempts. Please wait ${rateLimitStatus.minutesRemaining} minutes and try again, or ask your teacher to reset your password.`,
      rateLimitStatus
    };
  }

  // Get the hashed password from the pinHashes path
  const pinHashRef = ref(database, `pinHashes/${classId}/${seatNumber}`);
  const snapshot = await get(pinHashRef);

  if (!snapshot.exists()) {
    const newStatus = await recordFailedPinAttempt(classId, seatNumber);
    return {
      valid: false,
      error: 'Invalid seat number.',
      rateLimitStatus: newStatus
    };
  }

  const { hash } = snapshot.val();

  // Normalize input (strip spaces, lowercase) then compare with bcrypt
  const normalized = normalizePassword(password);
  const isValid = await bcrypt.compare(normalized, hash);

  if (!isValid) {
    const newStatus = await recordFailedPinAttempt(classId, seatNumber);
    const attemptsLeft = newStatus.remainingAttempts;

    let error = 'Wrong password. Try again.';
    if (attemptsLeft <= 2 && attemptsLeft > 0) {
      error = `Wrong password. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`;
    } else if (attemptsLeft === 0) {
      error = `Too many failed attempts. Please wait ${newStatus.minutesRemaining} minutes or ask your teacher to reset your password.`;
    }

    return {
      valid: false,
      error,
      rateLimitStatus: newStatus
    };
  }

  // Clear failed attempts on success
  await clearFailedAttempts(classId, seatNumber);

  return {
    valid: true,
    error: null,
    rateLimitStatus: { isLocked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS }
  };
};

/**
 * Verify student password and return student info for joining a session
 *
 * @param {string} classId - Class ID
 * @param {number} seatNumber - Seat number
 * @param {string} password - Password to verify
 * @returns {Object} { success, error, seatId, studentName }
 */
export const verifyStudentPin = async (classId, seatNumber, password) => {
  const verifyResult = await verifyPin(classId, seatNumber, password);

  if (!verifyResult.valid) {
    return {
      success: false,
      error: verifyResult.error
    };
  }

  // Get the seat data for student info
  const seat = await getSeat(classId, seatNumber);

  if (!seat) {
    return {
      success: false,
      error: 'Seat not found'
    };
  }

  return {
    success: true,
    seatId: `seat-${seatNumber}`,
    seatNumber: seat.seatNumber,
    username: seat.username,
    studentName: seat.displayName || `Seat ${seatNumber}`,
    studentUid: seat.studentUid // May be null if no Google account linked
  };
};

/**
 * Verify student PIN by username and return student info for joining a session
 * Used by the join page when a student enters class code + username + PIN
 *
 * @param {string} classId - Class ID
 * @param {string} username - Student's username (e.g., "tuba123")
 * @param {string} pin - PIN to verify
 * @returns {Object} { success, error, seatId, seatNumber, username, studentName }
 */
export const verifyStudentPinByUsername = async (classId, username, pin) => {
  // Look up the seat by username
  const seat = await getSeatByUsername(classId, username);

  if (!seat) {
    return {
      success: false,
      error: 'Username not found. Check your login card and try again.'
    };
  }

  // Use the existing verifyPin function with the seat number
  const verifyResult = await verifyPin(classId, seat.seatNumber, pin);

  if (!verifyResult.valid) {
    return {
      success: false,
      error: verifyResult.error
    };
  }

  return {
    success: true,
    seatId: `seat-${seat.seatNumber}`,
    seatNumber: seat.seatNumber,
    username: seat.username,
    studentName: seat.displayName || seat.username,
    studentUid: seat.studentUid // May be null if no Google account linked
  };
};

/**
 * Get printable roster (for teachers to hand out to students)
 *
 * @param {string} classId - Class ID
 * @returns {Array} Array of {seatNumber, displayName, username, pin} for active seats
 */
export const getPrintableRoster = async (classId) => {
  const roster = await getClassRoster(classId);

  return roster
    .filter(seat => seat.status === 'active')
    .map(seat => ({
      seatNumber: seat.seatNumber,
      displayName: seat.displayName,
      username: seat.username,
      pin: seat.pin // Plaintext password for teacher to print
    }));
};

/**
 * Migrate existing unhashed PINs to hashed format
 * Run this once if you have existing seats with plaintext PINs
 *
 * @param {string} classId - Class ID
 */
export const migrateUnhashedPins = async (classId) => {
  const roster = await getClassRoster(classId);

  for (const seat of roster) {
    if (seat.pin) {
      // Check if pinHash already exists
      const hashRef = ref(database, `pinHashes/${classId}/${seat.seatNumber}`);
      const existingHash = await get(hashRef);

      if (!existingHash.exists()) {
        // Hash the existing password and store it
        const hashed = await hashPassword(seat.pin);
        await set(hashRef, {
          hash: hashed,
          updatedAt: Date.now(),
          migratedAt: Date.now()
        });
        console.log(`Migrated PIN hash for seat ${seat.seatNumber} in class ${classId}`);
      }
    }
  }

  console.log(`PIN migration complete for class ${classId}`);
};

/**
 * Verify a student by username + password (global lookup, no class code needed)
 *
 * @param {string} username - Student's username (e.g., "tuba123")
 * @param {string} password - Password to verify
 * @returns {Object} { success, error, classId, seatNumber, username, studentName, classCode, className }
 */
export const verifyStudentGlobal = async (username, password) => {
  // Look up username in global index
  const usernameData = await lookupUsername(username);

  if (!usernameData) {
    return {
      success: false,
      error: 'Username not found. Check your login card and try again.'
    };
  }

  const { classId, seatNumber } = usernameData;

  // Verify the password
  const verifyResult = await verifyPin(classId, seatNumber, password);

  if (!verifyResult.valid) {
    return {
      success: false,
      error: verifyResult.error
    };
  }

  // Get seat and class info
  const seat = await getSeat(classId, seatNumber);
  const classRef = ref(database, `classes/${classId}`);
  const classSnapshot = await get(classRef);
  const classData = classSnapshot.exists() ? classSnapshot.val() : null;

  return {
    success: true,
    classId,
    seatId: `seat-${seatNumber}`,
    seatNumber,
    username: seat?.username || username,
    studentName: seat?.displayName || seat?.username || username,
    studentUid: seat?.studentUid,
    classCode: classData?.classCode,
    className: classData?.name,
    teacherUid: classData?.teacherUid
  };
};

/**
 * Register usernames for an existing class that was created before global usernames.
 * Run this once per class to backfill the global index.
 *
 * @param {string} classId - Class ID
 * @returns {number} Number of usernames registered
 */
export const backfillUsernameIndex = async (classId) => {
  const roster = await getClassRoster(classId);
  let count = 0;

  for (const seat of roster) {
    if (seat.username) {
      const existing = await lookupUsername(seat.username);
      if (!existing) {
        await registerUsername(seat.username, classId, seat.seatNumber);
        count++;
      }
    }
  }

  console.log(`Backfilled ${count} usernames for class ${classId}`);
  return count;
};
