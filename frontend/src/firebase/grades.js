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

  // Also update the submission record to mark it as graded
  const submissionRef = ref(database, `submissions/${classId}/${lessonId}/${studentUid}`);
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
    const lessonSubmissions = data[lessonId];

    // Iterate through students
    for (const studentUid of Object.keys(lessonSubmissions)) {
      submissions.push({
        ...lessonSubmissions[studentUid],
        lessonId,
        studentUid
      });
    }
  }

  // Sort by submission time (newest first)
  submissions.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

  return submissions;
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
 *
 * @param {string} classId - Class ID
 * @param {string} studentUid - Student's UID
 * @returns {Array} Array of student's submissions
 */
export const getStudentSubmissions = async (classId, studentUid) => {
  const submissionsRef = ref(database, `submissions/${classId}`);
  const snapshot = await get(submissionsRef);

  if (!snapshot.exists()) return [];

  const submissions = [];
  const data = snapshot.val();

  // Iterate through lessons
  for (const lessonId of Object.keys(data)) {
    const lessonSubmissions = data[lessonId];

    // Check if this student has a submission for this lesson
    if (lessonSubmissions[studentUid]) {
      submissions.push({
        ...lessonSubmissions[studentUid],
        lessonId,
        studentUid
      });
    }
  }

  // Sort by submission time (newest first)
  submissions.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

  return submissions;
};
