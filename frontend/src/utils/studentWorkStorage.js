// File: /utils/studentWorkStorage.js
// Generic student work storage system for Music Mind Academy
// Any activity can save work that automatically appears on the Join page
// Supports both localStorage (anonymous) and Firebase (authenticated students)

import {
  saveStudentWork as saveToFirebase,
  submitStudentWork as submitToFirebase,
  loadStudentWork as loadFromFirebase,
  getAllStudentWork as getAllFromFirebase,
  deleteStudentWork as deleteFromFirebase
} from '../firebase/studentWork';
import { getActivityToLessonMap } from '../config/curriculumConfig';

const PIN_SESSION_KEY = 'student-pin-session';

/**
 * Get the current student ID (creates one if needed)
 */
export const getStudentId = () => {
  let id = localStorage.getItem('anonymous-student-id');
  if (!id) {
    id = `Student-${Math.floor(100000 + Math.random() * 900000)}`;
    localStorage.setItem('anonymous-student-id', id);
  }
  return id;
};

/**
 * Auto-detect class auth info from PIN session in localStorage.
 * Returns { uid, classId } if student is in an active class session, null otherwise.
 */
const getClassAuthInfo = () => {
  try {
    const saved = localStorage.getItem(PIN_SESSION_KEY);
    if (!saved) return null;

    const session = JSON.parse(saved);

    // Check if session is expired
    if (session.expiresAt && session.expiresAt < Date.now()) return null;

    if (!session.classId || session.seatNumber == null) return null;

    return {
      uid: `seat-${session.seatNumber}`,
      classId: session.classId,
      displayName: session.displayName || `Seat ${session.seatNumber}`
    };
  } catch {
    return null;
  }
};

/**
 * Parse activity ID into lesson and activity components
 * e.g., 'lesson2-sports-composition' -> { lessonId: 'lesson2', activityId: 'sports-composition' }
 */
const parseActivityId = (activityId) => {
  // Check for lesson prefix patterns
  const lessonMatch = activityId.match(/^(lesson\d+)-(.+)$/);
  if (lessonMatch) {
    return { lessonId: lessonMatch[1], activityId: lessonMatch[2] };
  }

  // Dynamic activity-to-lesson mapping from curriculum config
  const activityLessonMap = getActivityToLessonMap();
  const lessonId = activityLessonMap[activityId] || 'unknown';
  return { lessonId, activityId };
};

/**
 * Save student work that will appear on the Join page
 *
 * @param {string} activityId - Unique identifier for this activity (e.g., 'sports-composition', 'listening-map-1')
 * @param {object} options - Save options
 * @param {string} options.title - Display title (e.g., 'Basketball Highlights')
 * @param {string} options.emoji - Display emoji (e.g., '🏀')
 * @param {string} options.viewRoute - Route to view saved work (e.g., '/lessons/film-music-project/lesson2?view=saved')
 * @param {string} [options.subtitle] - Optional subtitle (e.g., '2 loops • 1:29')
 * @param {string} [options.category] - Optional category for grouping (e.g., 'Film Music Project', 'Listening Maps')
 * @param {object} options.data - The actual saved data (composition, answers, etc.)
 * @param {string} [studentId] - Optional student ID (uses current if not provided)
 * @param {object} [authInfo] - Optional auth info for Firebase sync { uid, classId }
 *
 * @example
 * saveStudentWork('sports-composition', {
 *   title: 'Basketball Highlights',
 *   emoji: '🏀',
 *   viewRoute: '/lessons/film-music-project/lesson2?view=saved',
 *   subtitle: '2 loops • 1:29',
 *   category: 'Film Music Project',
 *   data: { placedLoops, videoDuration, videoId }
 * }, null, { uid: 'firebase-uid', classId: 'class123' });
 */
export const saveStudentWork = (activityId, options, studentId = null, authInfo = null) => {
  const id = studentId || getStudentId();
  const key = `mma-saved-${id}-${activityId}`;

  const saveData = {
    activityId,
    title: options.title,
    emoji: options.emoji || '📁',
    viewRoute: options.viewRoute,
    subtitle: options.subtitle || null,
    category: options.category || null,
    lastSaved: new Date().toISOString(),
    data: options.data
  };

  // Always save to localStorage as backup
  localStorage.setItem(key, JSON.stringify(saveData));
  console.log(`💾 Saved student work to localStorage: ${key}`, saveData);

  // Auto-detect class auth if not explicitly provided
  const effectiveAuth = authInfo || getClassAuthInfo();

  // If authenticated (explicitly or via PIN session), sync to Firebase
  if (effectiveAuth?.uid) {
    const { lessonId, activityId: parsedActivityId } = parseActivityId(activityId);
    saveToFirebase(effectiveAuth.uid, effectiveAuth.classId || 'unassigned', lessonId, parsedActivityId, {
      type: options.type || 'composition',
      title: options.title,
      emoji: options.emoji || '📁',
      data: options.data
    }).then(async () => {
      console.log(`☁️ Synced to Firebase: ${activityId}`);

      // Auto-submit to teacher if in a class session
      if (effectiveAuth.classId) {
        try {
          await submitToFirebase(effectiveAuth.uid, lessonId, parsedActivityId, effectiveAuth.classId);
          console.log(`📤 Auto-submitted to teacher: ${activityId}`);
        } catch (err) {
          console.error(`❌ Auto-submit failed for ${activityId}:`, err);
        }
      }
    }).catch((err) => {
      console.error(`❌ Firebase sync failed for ${activityId}:`, err);
    });
  }

  return saveData;
};

/**
 * Load a specific saved work item from localStorage
 *
 * @param {string} activityId - The activity ID to load
 * @param {string} [studentId] - Optional student ID (uses current if not provided)
 * @returns {object|null} The saved data or null if not found
 */
export const loadStudentWork = (activityId, studentId = null) => {
  const id = studentId || getStudentId();
  const key = `mma-saved-${id}-${activityId}`;

  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      console.log(`📂 Loaded student work from localStorage: ${key}`, data);
      return data;
    } catch (error) {
      console.error(`Error loading student work: ${key}`, error);
      return null;
    }
  }
  return null;
};

/**
 * Load a specific saved work item - tries Firebase first if authenticated, falls back to localStorage
 *
 * @param {string} activityId - The activity ID to load
 * @param {object} [authInfo] - Optional auth info for Firebase { uid }
 * @param {string} [studentId] - Optional student ID (uses current if not provided)
 * @returns {Promise<object|null>} The saved data or null if not found
 */
export const loadStudentWorkAsync = async (activityId, authInfo = null, studentId = null) => {
  // If authenticated, try Firebase first
  if (authInfo?.uid) {
    try {
      const { lessonId, activityId: parsedActivityId } = parseActivityId(activityId);
      const firebaseData = await loadFromFirebase(authInfo.uid, lessonId, parsedActivityId);
      if (firebaseData) {
        console.log(`☁️ Loaded from Firebase: ${activityId}`, firebaseData);
        // Return in the same format as localStorage data
        return {
          activityId,
          title: firebaseData.title,
          emoji: firebaseData.emoji,
          viewRoute: null,
          subtitle: null,
          category: null,
          lastSaved: new Date(firebaseData.updatedAt).toISOString(),
          data: firebaseData.data,
          status: firebaseData.status,
          submittedAt: firebaseData.submittedAt
        };
      }
    } catch (err) {
      console.error(`❌ Firebase load failed for ${activityId}:`, err);
    }
  }

  // Fall back to localStorage
  return loadStudentWork(activityId, studentId);
};

/**
 * Delete a specific saved work item
 *
 * @param {string} activityId - The activity ID to delete
 * @param {string} [studentId] - Optional student ID (uses current if not provided)
 * @param {object} [authInfo] - Optional auth info for Firebase { uid }
 */
export const deleteStudentWork = (activityId, studentId = null, authInfo = null) => {
  const id = studentId || getStudentId();
  const key = `mma-saved-${id}-${activityId}`;
  localStorage.removeItem(key);
  console.log(`🗑️ Deleted student work from localStorage: ${key}`);

  // If authenticated, also delete from Firebase
  if (authInfo?.uid) {
    const { lessonId, activityId: parsedActivityId } = parseActivityId(activityId);
    deleteFromFirebase(authInfo.uid, lessonId, parsedActivityId)
      .then(() => {
        console.log(`☁️ Deleted from Firebase: ${activityId}`);
      })
      .catch((err) => {
        console.error(`❌ Firebase delete failed for ${activityId}:`, err);
      });
  }
};

/**
 * Get all saved work for the current student from localStorage
 * Used by JoinWithCode to display all saved items
 *
 * @param {string} [studentId] - Optional student ID (uses current if not provided)
 * @returns {Array} Array of saved work items, sorted by lastSaved (newest first)
 */
export const getAllStudentWork = (studentId = null) => {
  const id = studentId || getStudentId();
  const prefix = `mma-saved-${id}-`;
  const savedWork = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        savedWork.push(data);
      } catch (error) {
        console.error(`Error parsing saved work: ${key}`, error);
      }
    }
  }

  // Sort by lastSaved (newest first)
  savedWork.sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));

  console.log(`📚 Found ${savedWork.length} saved work items in localStorage for ${id}`);
  return savedWork;
};

/**
 * Get all saved work for an authenticated student (merges Firebase and localStorage)
 * Firebase takes priority for items that exist in both
 *
 * @param {object} authInfo - Auth info for Firebase { uid }
 * @param {string} [studentId] - Optional student ID for localStorage (uses current if not provided)
 * @returns {Promise<Array>} Array of saved work items, sorted by lastSaved (newest first)
 */
export const getAllStudentWorkAsync = async (authInfo, studentId = null) => {
  const workMap = new Map();

  // First, get localStorage items
  const localWork = getAllStudentWork(studentId);
  for (const item of localWork) {
    workMap.set(item.activityId, { ...item, source: 'local' });
  }

  // If authenticated, get Firebase items (which take priority)
  if (authInfo?.uid) {
    try {
      const firebaseWork = await getAllFromFirebase(authInfo.uid);
      for (const item of firebaseWork) {
        const activityId = `${item.lessonId}-${item.activityId}`;
        workMap.set(activityId, {
          activityId,
          title: item.title,
          emoji: item.emoji,
          viewRoute: null,
          subtitle: null,
          category: null,
          lastSaved: new Date(item.updatedAt).toISOString(),
          data: item.data,
          status: item.status,
          submittedAt: item.submittedAt,
          source: 'firebase'
        });
      }
      console.log(`☁️ Fetched ${firebaseWork.length} items from Firebase`);
    } catch (err) {
      console.error('❌ Failed to fetch Firebase work:', err);
    }
  }

  // Convert map to array and sort
  const allWork = Array.from(workMap.values());
  allWork.sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));

  console.log(`📚 Total work items: ${allWork.length} (merged from Firebase and localStorage)`);
  return allWork;
};

/**
 * Check if saved work exists for an activity
 * 
 * @param {string} activityId - The activity ID to check
 * @param {string} [studentId] - Optional student ID (uses current if not provided)
 * @returns {boolean} True if saved work exists
 */
export const hasStudentWork = (activityId, studentId = null) => {
  const id = studentId || getStudentId();
  const key = `mma-saved-${id}-${activityId}`;
  return localStorage.getItem(key) !== null;
};

/**
 * Migrate old save formats to the new system
 * Call this once on app startup to migrate existing saves
 * 
 * @param {string} [studentId] - Optional student ID (uses current if not provided)
 */
export const migrateOldSaves = (studentId = null) => {
  const id = studentId || getStudentId();
  let migratedCount = 0;
  
  // Migration map: oldKey -> { activityId, title, emoji, viewRoute, getSubtitle }
  const migrations = [
    {
      oldKey: `city-composition-${id}`,
      activityId: 'city-composition',
      getMetadata: (data) => ({
        title: data.composition?.videoTitle || 'City Soundscape',
        emoji: data.composition?.videoEmoji || '🏙️',
        viewRoute: '/lessons/film-music-project/lesson2?view=saved',
        subtitle: `${data.composition?.placedLoops?.length || 0} loops`,
        category: 'Film Music Project'
      })
    },
    {
      oldKey: `school-beneath-${id}`,
      activityId: 'school-beneath',
      getMetadata: (data) => ({
        title: 'The School Beneath',
        emoji: '🏫',
        viewRoute: '/lessons/film-music-project/lesson1?view=saved',
        subtitle: `${data.composition?.placedLoops?.length || 0} loops`,
        category: 'Film Music Project'
      })
    },
    {
      oldKey: `sports-composition-${id}`,
      activityId: 'sports-composition',
      getMetadata: (data) => ({
        title: data.composition?.videoTitle || 'Sports Highlights',
        emoji: data.composition?.videoEmoji || '🏀',
        viewRoute: '/lessons/film-music-project/lesson4?view=saved',
        subtitle: `${data.composition?.placedLoops?.length || 0} loops`,
        category: 'Film Music Project'
      })
    },
    {
      oldKey: `epic-wildlife-composition-${id}`,
      activityId: 'epic-wildlife-composition',
      getMetadata: (data) => ({
        title: data.composition?.videoTitle || 'Epic Wildlife',
        emoji: data.composition?.videoEmoji || '🌍',
        viewRoute: '/lessons/film-music-project/lesson3?view=saved',
        subtitle: `${data.composition?.placedLoops?.length || 0} loops`,
        category: 'Film Music Project'
      })
    }
  ];
  
  for (const migration of migrations) {
    const oldData = localStorage.getItem(migration.oldKey);
    if (oldData) {
      try {
        const parsed = JSON.parse(oldData);
        const newKey = `mma-saved-${id}-${migration.activityId}`;
        
        // Only migrate if new key doesn't exist
        if (!localStorage.getItem(newKey)) {
          const metadata = migration.getMetadata(parsed);
          
          saveStudentWork(migration.activityId, {
            ...metadata,
            data: parsed.composition || parsed
          }, id);
          
          migratedCount++;
          console.log(`✅ Migrated: ${migration.oldKey} -> ${newKey}`);
        }
      } catch (error) {
        console.error(`Error migrating ${migration.oldKey}:`, error);
      }
    }
  }
  
  if (migratedCount > 0) {
    console.log(`🔄 Migration complete: ${migratedCount} items migrated`);
  }

  return migratedCount;
};

/**
 * Clear ALL localStorage saves for a specific activity and student.
 * This handles all the different key patterns that have been used across the codebase.
 * Use this in reset buttons to ensure a complete clean slate.
 *
 * @param {string} activityId - The activity ID (e.g., 'school-beneath', 'sports-composition')
 * @param {string} [studentId] - Optional student ID (uses current if not provided)
 * @param {object} [authInfo] - Optional auth info for Firebase { uid }
 */
export const clearAllCompositionSaves = (activityId, studentId = null, authInfo = null) => {
  const id = studentId || getStudentId();

  // Pattern 1: New format - mma-saved-{studentId}-{activityId}
  localStorage.removeItem(`mma-saved-${id}-${activityId}`);

  // Pattern 2: Alternate order - mma-saved-{activityId}-{studentId}
  localStorage.removeItem(`mma-saved-${activityId}-${id}`);

  // Pattern 3: Legacy format - {activityId}-{studentId}
  localStorage.removeItem(`${activityId}-${id}`);

  // Pattern 4: Autosave format - autosave-{studentId}-{activityId}
  localStorage.removeItem(`autosave-${id}-${activityId}`);

  // Pattern 5: MusicComposer internal save - composition-{activityId}
  localStorage.removeItem(`composition-${activityId}`);

  // Pattern 6: Clear from centralized auto-save object (student-compositions-autosave)
  try {
    const autoSaveKey = 'student-compositions-autosave';
    const existingSaves = JSON.parse(localStorage.getItem(autoSaveKey) || '{}');
    const saveKey = `${id}-${activityId}`;

    if (existingSaves[saveKey]) {
      delete existingSaves[saveKey];
      localStorage.setItem(autoSaveKey, JSON.stringify(existingSaves));
    }
  } catch (error) {
    console.error('Error clearing centralized auto-save:', error);
  }

  // If authenticated, also delete from Firebase
  if (authInfo?.uid) {
    const { lessonId, activityId: parsedActivityId } = parseActivityId(activityId);
    deleteFromFirebase(authInfo.uid, lessonId, parsedActivityId)
      .then(() => {
        console.log(`☁️ Cleared from Firebase: ${activityId}`);
      })
      .catch((err) => {
        console.error(`❌ Firebase clear failed for ${activityId}:`, err);
      });
  }

  console.log(`🗑️ Cleared all saves for ${activityId} (student: ${id})`);
};

/**
 * Submit work to the teacher (only for authenticated students)
 *
 * @param {string} activityId - The activity ID to submit
 * @param {object} authInfo - Auth info { uid, classId }
 * @returns {Promise<void>}
 */
export const submitWorkToTeacher = async (activityId, authInfo) => {
  if (!authInfo?.uid || !authInfo?.classId) {
    throw new Error('Must be logged in to submit work');
  }

  const { lessonId, activityId: parsedActivityId } = parseActivityId(activityId);

  // Import the submit function dynamically to avoid circular dependencies
  const { submitStudentWork } = await import('../firebase/studentWork');
  await submitStudentWork(authInfo.uid, lessonId, parsedActivityId, authInfo.classId);

  console.log(`📤 Submitted work to teacher: ${activityId}`);
};