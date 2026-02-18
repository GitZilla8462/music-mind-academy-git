// Student Work Storage in Firebase
// src/firebase/studentWork.js
// Handles saving, loading, and submitting student compositions, reflections, etc.

import { getDatabase, ref, get, set, update, remove, push } from 'firebase/database';

const database = getDatabase();

/**
 * Save student work to Firebase
 *
 * @param {string} studentUid - Student's Firebase UID (for Google auth) or null for PIN
 * @param {string} classId - Class ID
 * @param {string} lessonId - Lesson ID (e.g., 'lesson1', 'lesson2')
 * @param {string} activityId - Activity ID (e.g., 'sports-composition')
 * @param {Object} workData - The work data to save
 * @returns {Object} Saved work with workId
 */
export const saveStudentWork = async (studentUid, classId, lessonId, activityId, workData) => {
  const workKey = `${lessonId}-${activityId}`;
  const workRef = ref(database, `studentWork/${studentUid}/${workKey}`);

  const fullWorkData = {
    workId: workKey,
    studentUid,
    classId,
    lessonId,
    activityId,
    type: workData.type || 'composition',
    status: 'draft',
    data: workData.data || workData,
    title: workData.title || activityId,
    emoji: workData.emoji || '🎵',
    createdAt: workData.createdAt || Date.now(),
    updatedAt: Date.now(),
    submittedAt: null
  };

  await set(workRef, fullWorkData);
  console.log(`Saved work: ${workKey} for student ${studentUid}`);

  return fullWorkData;
};

/**
 * Load student work from Firebase
 *
 * @param {string} studentUid - Student's Firebase UID
 * @param {string} lessonId - Lesson ID
 * @param {string} activityId - Activity ID
 * @returns {Object|null} Work data or null
 */
export const loadStudentWork = async (studentUid, lessonId, activityId) => {
  const workKey = `${lessonId}-${activityId}`;
  const workRef = ref(database, `studentWork/${studentUid}/${workKey}`);
  const snapshot = await get(workRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

/**
 * Get all work for a student
 *
 * @param {string} studentUid - Student's Firebase UID
 * @returns {Array} Array of work items
 */
export const getAllStudentWork = async (studentUid) => {
  const workRef = ref(database, `studentWork/${studentUid}`);
  const snapshot = await get(workRef);

  if (!snapshot.exists()) return [];

  const works = [];
  snapshot.forEach((child) => {
    works.push(child.val());
  });

  // Sort by updatedAt descending
  works.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return works;
};

/**
 * Submit work to teacher (changes status from draft to submitted)
 *
 * @param {string} studentUid - Student's Firebase UID
 * @param {string} lessonId - Lesson ID
 * @param {string} activityId - Activity ID
 * @param {string} classId - Class ID
 */
export const submitStudentWork = async (studentUid, lessonId, activityId, classId) => {
  const workKey = `${lessonId}-${activityId}`;
  const workRef = ref(database, `studentWork/${studentUid}/${workKey}`);

  // Get the current work
  const snapshot = await get(workRef);
  if (!snapshot.exists()) {
    throw new Error('Work not found. Save your work first.');
  }

  const workData = snapshot.val();
  const now = Date.now();

  // Update work status
  await update(workRef, {
    status: 'submitted',
    submittedAt: now
  });

  // Path: submissions/{classId}/{lessonId}/{activityId}/{studentUid}
  // Each activity gets its own submission slot per student
  const submissionRef = ref(database, `submissions/${classId}/${lessonId}/${activityId}/${studentUid}`);
  const existingSnap = await get(submissionRef);
  const existing = existingSnap.exists() ? existingSnap.val() : null;
  const isResubmission = existing && (existing.status === 'graded' || existing.resubmittedAt);

  if (isResubmission) {
    // Resubmission — preserve history, mark as resubmitted
    const resubmitCount = (existing.resubmitCount || 0) + 1;
    await update(submissionRef, {
      status: 'pending',
      submittedAt: now,
      resubmittedAt: now,
      resubmitCount
    });
    console.log(`Resubmitted work: ${workKey} for student ${studentUid} (attempt ${resubmitCount + 1})`);
  } else {
    // First submission
    await set(submissionRef, {
      studentUid,
      lessonId,
      activityId,
      workKey,
      title: workData.title,
      submittedAt: now,
      status: 'pending',
      grade: null,
      feedback: null
    });
    console.log(`Submitted work: ${workKey} for student ${studentUid}`);
  }
};

/**
 * Resubmit student work (after teacher has graded and student edits)
 * Updates submission status back to pending so teacher knows to re-review
 *
 * @param {string} studentUid - Student's Firebase UID
 * @param {string} lessonId - Lesson ID
 * @param {string} activityId - Activity ID
 * @param {string} classId - Class ID
 */
export const resubmitStudentWork = async (studentUid, lessonId, activityId, classId) => {
  const workKey = `${lessonId}-${activityId}`;
  const workRef = ref(database, `studentWork/${studentUid}/${workKey}`);
  const now = Date.now();

  // Update work status
  await update(workRef, {
    status: 'submitted',
    submittedAt: now,
    updatedAt: now
  });

  // Update submission record — set back to pending, track resubmission
  const submissionRef = ref(database, `submissions/${classId}/${lessonId}/${activityId}/${studentUid}`);
  const snapshot = await get(submissionRef);
  const existing = snapshot.exists() ? snapshot.val() : {};
  const resubmitCount = (existing.resubmitCount || 0) + 1;

  await update(submissionRef, {
    status: 'pending',
    submittedAt: now,
    resubmittedAt: now,
    resubmitCount
  });

  console.log(`Resubmitted work: ${workKey} for student ${studentUid} (attempt ${resubmitCount + 1})`);
};

/**
 * Get all submissions for a class and lesson (for teachers)
 *
 * @param {string} classId - Class ID
 * @param {string} lessonId - Lesson ID
 * @returns {Array} Array of submissions
 */
export const getClassSubmissions = async (classId, lessonId) => {
  const submissionsRef = ref(database, `submissions/${classId}/${lessonId}`);
  const snapshot = await get(submissionsRef);

  if (!snapshot.exists()) return [];

  const submissions = [];
  snapshot.forEach((child) => {
    const val = child.val();
    if (val && val.submittedAt) {
      // Old format: key is studentUid directly
      submissions.push({ studentUid: child.key, ...val });
    } else if (val && typeof val === 'object') {
      // New format: key is activityId, children are studentUids
      const activityId = child.key;
      Object.entries(val).forEach(([studentUid, subData]) => {
        if (subData && subData.submittedAt) {
          submissions.push({ studentUid, activityId, ...subData });
        }
      });
    }
  });

  // Sort by submission time
  submissions.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

  return submissions;
};

/**
 * Get a specific student's work (for teacher viewing)
 *
 * @param {string} studentUid - Student's Firebase UID
 * @param {string} workKey - Work key (lessonId-activityId)
 * @returns {Object|null} Work data
 */
export const getStudentWorkForTeacher = async (studentUid, workKey) => {
  const workRef = ref(database, `studentWork/${studentUid}/${workKey}`);
  const snapshot = await get(workRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

/**
 * Delete student work
 *
 * @param {string} studentUid - Student's Firebase UID
 * @param {string} lessonId - Lesson ID
 * @param {string} activityId - Activity ID
 */
export const deleteStudentWork = async (studentUid, lessonId, activityId) => {
  const workKey = `${lessonId}-${activityId}`;
  await remove(ref(database, `studentWork/${studentUid}/${workKey}`));
  console.log(`Deleted work: ${workKey} for student ${studentUid}`);
};
