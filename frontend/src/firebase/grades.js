// Grading Operations for Firebase
// src/firebase/grades.js
// Handles teacher grading, feedback, and grade retrieval

import { getDatabase, ref, get, set, update, remove } from 'firebase/database';

const database = getDatabase();

/**
 * Grade a student's submission
 *
 * @param {string} classId - Class ID
 * @param {string} studentUid - Student's Firebase UID or PIN-based ID
 * @param {string} lessonId - Lesson ID
 * @param {Object} gradeData - Grade data
 * @param {string} gradeData.grade - Letter grade (A, B, C, D, F) or numeric grade
 * @param {string} gradeData.feedback - Teacher feedback
 * @param {string} teacherUid - Teacher's UID who is grading
 * @returns {Object} The grade record
 */
export const gradeSubmission = async (classId, studentUid, lessonId, gradeData, teacherUid) => {
  const gradeRef = ref(database, `grades/${classId}/${studentUid}/${lessonId}`);
  const now = Date.now();

  // Store all grade fields (type, points, maxPoints, rubricCategories, quickFeedback, etc.)
  const gradeRecord = {
    ...gradeData,
    gradedAt: now,
    gradedBy: teacherUid,
    updatedAt: now
  };

  await set(gradeRef, gradeRecord);

  // Build a display-friendly grade value for the submission record
  const gradeDisplay = gradeData.grade || null;

  // Update submission record — try new path first (with activityId), fall back to old path
  const actId = gradeData.activityId;
  const newRef = actId ? ref(database, `submissions/${classId}/${lessonId}/${actId}/${studentUid}`) : null;
  const oldRef = ref(database, `submissions/${classId}/${lessonId}/${studentUid}`);

  // Check new path first, then old path
  let submissionRef = oldRef;
  if (newRef) {
    const newSnap = await get(newRef);
    if (newSnap.exists()) {
      submissionRef = newRef;
    }
  }

  await update(submissionRef, {
    status: 'graded',
    grade: gradeDisplay,
    feedback: gradeData.feedback || null,
    gradedAt: now
  });

  console.log(`Graded: ${studentUid} lesson ${lessonId} = ${gradeDisplay}`);
  return gradeRecord;
};

/**
 * Get a specific grade
 *
 * @param {string} classId - Class ID
 * @param {string} studentUid - Student's UID
 * @param {string} lessonId - Lesson ID
 * @returns {Object|null} Grade data or null
 */
export const getGrade = async (classId, studentUid, lessonId) => {
  const gradeRef = ref(database, `grades/${classId}/${studentUid}/${lessonId}`);
  const snapshot = await get(gradeRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

/**
 * Get all grades for a student in a class
 *
 * @param {string} classId - Class ID
 * @param {string} studentUid - Student's UID
 * @returns {Object} Map of lessonId -> grade data
 */
export const getStudentGrades = async (classId, studentUid) => {
  const gradesRef = ref(database, `grades/${classId}/${studentUid}`);
  const snapshot = await get(gradesRef);

  if (!snapshot.exists()) return {};

  return snapshot.val();
};

/**
 * Get all grades for a class (for gradebook view)
 *
 * @param {string} classId - Class ID
 * @returns {Object} Nested map of studentUid -> lessonId -> grade data
 */
export const getClassGrades = async (classId) => {
  const gradesRef = ref(database, `grades/${classId}`);
  const snapshot = await get(gradesRef);

  if (!snapshot.exists()) return {};

  return snapshot.val();
};

/**
 * Update feedback for a grade
 *
 * @param {string} classId - Class ID
 * @param {string} studentUid - Student's UID
 * @param {string} lessonId - Lesson ID
 * @param {string} feedback - New feedback text
 */
export const updateFeedback = async (classId, studentUid, lessonId, feedback) => {
  const gradeRef = ref(database, `grades/${classId}/${studentUid}/${lessonId}`);
  await update(gradeRef, {
    feedback,
    updatedAt: Date.now()
  });

  // Also update the submission record
  const submissionRef = ref(database, `submissions/${classId}/${lessonId}/${studentUid}`);
  await update(submissionRef, {
    feedback
  });
};

/**
 * Delete a grade
 *
 * @param {string} classId - Class ID
 * @param {string} studentUid - Student's UID
 * @param {string} lessonId - Lesson ID
 */
export const deleteGrade = async (classId, studentUid, lessonId) => {
  await remove(ref(database, `grades/${classId}/${studentUid}/${lessonId}`));

  // Reset submission status
  const submissionRef = ref(database, `submissions/${classId}/${lessonId}/${studentUid}`);
  await update(submissionRef, {
    status: 'pending',
    grade: null,
    feedback: null,
    gradedAt: null
  });
};

/**
 * Get grade statistics for a class lesson
 *
 * @param {string} classId - Class ID
 * @param {string} lessonId - Lesson ID
 * @returns {Object} Statistics { count, average, distribution }
 */
export const getLessonGradeStats = async (classId, lessonId) => {
  const classGrades = await getClassGrades(classId);

  const gradeValues = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  let total = 0;
  let count = 0;

  for (const studentUid of Object.keys(classGrades)) {
    const studentGrades = classGrades[studentUid];
    if (studentGrades[lessonId]) {
      const grade = studentGrades[lessonId].grade;
      if (gradeValues[grade] !== undefined) {
        distribution[grade]++;
        total += gradeValues[grade];
        count++;
      }
    }
  }

  return {
    count,
    average: count > 0 ? (total / count).toFixed(2) : null,
    distribution
  };
};

/**
 * Get all submissions for a class (pending and graded)
 *
 * @param {string} classId - Class ID
 * @returns {Array} Array of all submissions across all lessons
 */
export const getAllClassSubmissions = async (classId) => {
  const submissionsRef = ref(database, `submissions/${classId}`);
  const snapshot = await get(submissionsRef);

  if (!snapshot.exists()) return [];

  const submissions = [];
  const data = snapshot.val();

  // Iterate through lessons
  for (const lessonId of Object.keys(data)) {
    const lessonData = data[lessonId];

    for (const key of Object.keys(lessonData)) {
      const val = lessonData[key];
      if (val && val.submittedAt) {
        // Old format: key is studentUid directly
        submissions.push({ ...val, lessonId, studentUid: key });
      } else if (val && typeof val === 'object') {
        // New format: key is activityId, children are studentUids
        for (const studentUid of Object.keys(val)) {
          const subData = val[studentUid];
          if (subData && subData.submittedAt) {
            submissions.push({ ...subData, lessonId, studentUid, activityId: key });
          }
        }
      }
    }
  }

  // Sort by submission time (newest first)
  submissions.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

  return submissions;
};

/**
 * Delete all submissions and grades for a specific activity in a class
 *
 * @param {string} classId - Class ID
 * @param {string} lessonId - Lesson ID
 * @param {string} activityId - Activity ID
 * @returns {number} Number of submissions deleted
 */
export const deleteActivitySubmissions = async (classId, lessonId, activityId) => {
  const submissionsRef = ref(database, `submissions/${classId}/${lessonId}`);
  const snapshot = await get(submissionsRef);

  if (!snapshot.exists()) return 0;

  let deleted = 0;
  const data = snapshot.val();

  for (const studentUid of Object.keys(data)) {
    const sub = data[studentUid];
    if (sub.activityId === activityId) {
      await remove(ref(database, `submissions/${classId}/${lessonId}/${studentUid}`));
      await remove(ref(database, `grades/${classId}/${studentUid}/${lessonId}`));
      deleted++;
    }
  }

  return deleted;
};

/**
 * Get pending submissions count for a class
 *
 * @param {string} classId - Class ID
 * @returns {number} Count of pending submissions
 */
export const getPendingSubmissionsCount = async (classId) => {
  const submissions = await getAllClassSubmissions(classId);
  return submissions.filter(s => s.status === 'pending').length;
};

/**
 * Get all submissions for a specific student in a class
 * Teachers read the whole class; students read only their own entries.
 *
 * @param {string} classId - Class ID
 * @param {string} studentUid - Student's UID
 * @returns {Array} Array of student's submissions
 */
export const getStudentSubmissions = async (classId, studentUid) => {
  const submissions = [];

  try {
    // Try class-level read first (works for teachers who have class-level permission)
    const submissionsRef = ref(database, `submissions/${classId}`);
    const snapshot = await get(submissionsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();

      for (const lessonId of Object.keys(data)) {
        const lessonData = data[lessonId];

        for (const key of Object.keys(lessonData)) {
          const val = lessonData[key];
          if (key === studentUid && val && val.submittedAt) {
            // Old format: key is studentUid directly
            submissions.push({ ...val, lessonId, studentUid });
          } else if (val && typeof val === 'object' && val[studentUid]?.submittedAt) {
            // New format: key is activityId, check for studentUid underneath
            submissions.push({ ...val[studentUid], lessonId, activityId: key, studentUid });
          }
        }
      }
    }
  } catch {
    // Class-level read failed (permission denied for students) — use per-activity reads
    // Iterate over all known activities from curriculum config and try each specific path
    const { CURRICULUM } = await import('../config/curriculumConfig');

    for (const unit of CURRICULUM) {
      for (const lesson of unit.lessons) {
        if (!lesson.route) continue; // skip unbuilt lessons

        for (const activity of lesson.activities) {
          try {
            // New format: submissions/{classId}/{lessonId}/{activityId}/{studentUid}
            const subRef = ref(database, `submissions/${classId}/${lesson.id}/${activity.id}/${studentUid}`);
            const subSnap = await get(subRef);
            if (subSnap.exists()) {
              submissions.push({
                ...subSnap.val(),
                lessonId: lesson.id,
                activityId: activity.id,
                studentUid
              });
            }
          } catch {
            // Skip paths we can't access
          }
        }

        // Also try old format: submissions/{classId}/{lessonId}/{studentUid}
        try {
          const oldRef = ref(database, `submissions/${classId}/${lesson.id}/${studentUid}`);
          const oldSnap = await get(oldRef);
          if (oldSnap.exists()) {
            const val = oldSnap.val();
            if (val?.submittedAt) {
              submissions.push({ ...val, lessonId: lesson.id, studentUid });
            }
          }
        } catch {
          // Skip
        }
      }
    }
  }

  submissions.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
  return submissions;
};
