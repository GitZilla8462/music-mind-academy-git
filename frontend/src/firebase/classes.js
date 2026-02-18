// Class management for Firebase
// src/firebase/classes.js
// Supports both Classroom Mode (anonymous) and Student Accounts Mode (persistent)

import { getDatabase, ref, get, set, update, remove, push, onValue } from 'firebase/database';

const database = getDatabase();

/**
 * Generate a unique 6-character class code
 * Format: 2 letters + 4 numbers (e.g., "AB1234")
 */
const generateClassCode = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding I and O to avoid confusion
  const numbers = '0123456789';

  let code = '';
  for (let i = 0; i < 2; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return code;
};

/**
 * Create a new class
 *
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {Object} classData - Class data
 * @param {string} classData.name - Class name (e.g., "3rd Period Music")
 * @param {string} classData.mode - 'classroom' | 'accounts'
 * @param {string} classData.description - Optional description
 * @param {Object} classData.settings - Class settings
 * @returns {Object} Created class data with id
 */
export const createClass = async (teacherUid, classData) => {
  const { name, mode = 'classroom', description = '', settings = {} } = classData;

  // Generate unique class code
  let classCode = generateClassCode();
  let attempts = 0;
  const maxAttempts = 10;

  // Check for code collision
  while (attempts < maxAttempts) {
    const existingRef = ref(database, `classCodes/${classCode}`);
    const existingSnapshot = await get(existingRef);
    if (!existingSnapshot.exists()) break;
    classCode = generateClassCode();
    attempts++;
  }

  // Generate class ID
  const classesRef = ref(database, `classes`);
  const newClassRef = push(classesRef);
  const classId = newClassRef.key;

  // Class data to store
  const fullClassData = {
    id: classId,
    teacherUid,
    name,
    mode,
    description,
    classCode,
    settings: {
      allowGoogleSignIn: true,
      ...settings
    },
    studentCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // Store in multiple locations for easy querying
  await Promise.all([
    // Main classes collection
    set(ref(database, `classes/${classId}`), fullClassData),
    // Teacher's classes list (for quick lookup)
    set(ref(database, `teacherClasses/${teacherUid}/${classId}`), {
      id: classId,
      name,
      mode,
      classCode,
      studentCount: 0,
      createdAt: Date.now()
    }),
    // Class code lookup (to prevent duplicates and enable code-based joins)
    set(ref(database, `classCodes/${classCode}`), classId)
  ]);

  console.log('Class created:', name, '| Code:', classCode, '| Mode:', mode);
  return fullClassData;
};

/**
 * Get a class by ID
 *
 * @param {string} classId - Class ID
 * @returns {Object|null} Class data or null
 */
export const getClassById = async (classId) => {
  const classRef = ref(database, `classes/${classId}`);
  const snapshot = await get(classRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

/**
 * Get a class by class code
 *
 * @param {string} classCode - 6-character class code
 * @returns {Object|null} Class data or null
 */
export const getClassByCode = async (classCode) => {
  // First get the class ID from the code lookup
  const codeRef = ref(database, `classCodes/${classCode.toUpperCase()}`);
  const codeSnapshot = await get(codeRef);

  if (!codeSnapshot.exists()) return null;

  const classId = codeSnapshot.val();
  return getClassById(classId);
};

/**
 * Get all classes for a teacher
 *
 * @param {string} teacherUid - Teacher's Firebase UID
 * @returns {Array} Array of class objects
 */
export const getTeacherClasses = async (teacherUid) => {
  const classesRef = ref(database, `teacherClasses/${teacherUid}`);
  const snapshot = await get(classesRef);

  if (!snapshot.exists()) return [];

  const classes = [];
  snapshot.forEach((child) => {
    classes.push(child.val());
  });

  // Sort by creation date (newest first)
  classes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return classes;
};

/**
 * Update a class
 *
 * @param {string} classId - Class ID
 * @param {Object} updates - Fields to update
 */
export const updateClass = async (classId, updates) => {
  const classData = await getClassById(classId);
  if (!classData) throw new Error('Class not found');

  const updatedData = {
    ...updates,
    updatedAt: Date.now()
  };

  await Promise.all([
    update(ref(database, `classes/${classId}`), updatedData),
    update(ref(database, `teacherClasses/${classData.teacherUid}/${classId}`), {
      name: updates.name || classData.name,
      mode: updates.mode || classData.mode,
      updatedAt: Date.now()
    })
  ]);
};

/**
 * Delete a class and all associated data
 *
 * @param {string} classId - Class ID
 */
export const deleteClass = async (classId) => {
  const classData = await getClassById(classId);
  if (!classData) throw new Error('Class not found');

  // Get roster to clean up global username index
  const { getClassRoster, unregisterUsername } = await import('./enrollments');
  const roster = await getClassRoster(classId);

  // Remove usernames from global index
  await Promise.all(
    roster.filter(s => s.username).map(s => unregisterUsername(s.username))
  );

  // IMPORTANT: Delete roster, grades, and submissions FIRST
  // because their Firebase rules check that the class exists to verify teacher ownership
  await Promise.all([
    remove(ref(database, `classRosters/${classId}`)),
    remove(ref(database, `pinHashes/${classId}`)),
    remove(ref(database, `pinLoginAttempts/${classId}`)),
    remove(ref(database, `grades/${classId}`)),
    remove(ref(database, `submissions/${classId}`))
  ]);

  // THEN delete the class itself and related lookups
  await Promise.all([
    remove(ref(database, `classes/${classId}`)),
    remove(ref(database, `teacherClasses/${classData.teacherUid}/${classId}`)),
    remove(ref(database, `classCodes/${classData.classCode}`))
  ]);

  console.log('Class deleted:', classData.name);
};

/**
 * Update student count for a class
 *
 * @param {string} classId - Class ID
 * @param {number} count - New student count
 */
export const updateClassStudentCount = async (classId, count) => {
  const classData = await getClassById(classId);
  if (!classData) return;

  await Promise.all([
    update(ref(database, `classes/${classId}`), { studentCount: count }),
    update(ref(database, `teacherClasses/${classData.teacherUid}/${classId}`), { studentCount: count })
  ]);
};

/**
 * Check if a class code exists
 *
 * @param {string} classCode - 6-character class code
 * @returns {boolean}
 */
export const classCodeExists = async (classCode) => {
  const codeRef = ref(database, `classCodes/${classCode.toUpperCase()}`);
  const snapshot = await get(codeRef);
  return snapshot.exists();
};

// ==========================================
// CLASS SESSION MANAGEMENT
// Sessions are stored on the class record, not as separate entities
// ==========================================

/**
 * Start a live session for a class
 * Stores session data directly on the class record
 *
 * @param {string} classId - Class ID
 * @param {Object} sessionData - Session details
 * @param {string} sessionData.lessonId - Lesson identifier
 * @param {string} sessionData.lessonRoute - Route to the lesson
 * @returns {Object} The class data with active session
 */
export const startClassSession = async (classId, sessionData) => {
  const classData = await getClassById(classId);
  if (!classData) throw new Error('Class not found');

  const { lessonId, lessonRoute } = sessionData;

  const currentSession = {
    active: true,
    lessonId,
    lessonRoute,
    currentStage: 'join-code',
    startedAt: Date.now(),
    studentsJoined: {},
    studentProgress: {},
    timestamp: Date.now()
  };

  await update(ref(database, `classes/${classId}`), {
    currentSession,
    updatedAt: Date.now()
  });

  // Record this lesson as "conducted" for the class (used to filter classwork)
  // Non-blocking — don't let this fail the session start
  try {
    await set(ref(database, `conductedLessons/${classId}/${lessonId}`), {
      firstConductedAt: Date.now(),
      lessonRoute
    });
    console.log(`✅ conductedLessons written: ${classId}/${lessonId}`);
  } catch (err) {
    console.warn('❌ Could not record conducted lesson:', err.message);
  }

  console.log(`✅ Started session for class ${classData.name} | Lesson: ${lessonId}`);

  return {
    ...classData,
    currentSession,
    classCode: classData.classCode
  };
};

/**
 * End the current session for a class
 *
 * @param {string} classId - Class ID
 */
export const endClassSession = async (classId) => {
  const classData = await getClassById(classId);
  if (!classData) throw new Error('Class not found');

  await update(ref(database, `classes/${classId}`), {
    currentSession: {
      active: false,
      endedAt: Date.now()
    },
    updatedAt: Date.now()
  });

  console.log(`🔚 Ended session for class ${classData.name}`);
};

/**
 * Update the current stage of a class session
 *
 * @param {string} classId - Class ID
 * @param {string} stage - New stage ID
 */
export const updateClassSessionStage = async (classId, stage) => {
  await update(ref(database, `classes/${classId}/currentSession`), {
    currentStage: stage,
    timestamp: Date.now(),
    countdownTime: null,
    timerActive: null
  });

  console.log(`✅ Updated class ${classId} to stage: ${stage}`);
};

/**
 * Add a student to the class session
 *
 * @param {string} classId - Class ID
 * @param {string} seatId - Student's seat ID
 * @param {Object} studentInfo - Student info
 */
export const joinClassSession = async (classId, seatId, studentInfo) => {
  const studentRef = ref(database, `classes/${classId}/currentSession/studentsJoined/${seatId}`);

  await set(studentRef, {
    id: seatId,
    seatNumber: studentInfo.seatNumber,
    name: studentInfo.name || `Seat ${studentInfo.seatNumber}`,
    joinedAt: Date.now(),
    score: 0
  });

  console.log(`✅ Student seat ${studentInfo.seatNumber} joined class session`);
};

/**
 * Get class data including current session by class code
 *
 * @param {string} classCode - 6-character class code
 * @returns {Object|null} Class data with current session
 */
export const getClassSessionByCode = async (classCode) => {
  const classData = await getClassByCode(classCode);
  if (!classData) return null;

  return classData;
};

/**
 * Subscribe to class session changes (for real-time sync)
 *
 * @param {string} classId - Class ID
 * @param {Function} callback - Called with session data on each change
 * @returns {Function} Unsubscribe function
 */
export const subscribeToClassSession = (classId, callback) => {
  const sessionRef = ref(database, `classes/${classId}/currentSession`);

  console.log(`👂 Subscribing to class session: ${classId}`);

  const unsubscribe = onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();

    if (data === null) {
      console.warn(`⚠️ No active session for class ${classId}`);
    } else {
      console.log(`📡 Class ${classId} session update:`, data.currentStage);
    }

    callback(data);
  });

  return unsubscribe;
};

/**
 * Get the set of lesson IDs that have been conducted for a class.
 * Used to filter classwork/grades to only show lessons that actually happened.
 *
 * @param {string} classId - Class ID
 * @returns {Set<string>} Set of lesson IDs
 */
export const getConductedLessons = async (classId) => {
  let snapshot;
  try {
    snapshot = await get(ref(database, `conductedLessons/${classId}`));
  } catch (err) {
    console.warn('Could not read conducted lessons (deploy Firebase rules):', err.message);
    return new Set();
  }
  if (!snapshot.exists()) return new Set();
  return new Set(Object.keys(snapshot.val()));
};
