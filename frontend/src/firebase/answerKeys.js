// Answer Key Operations for Firebase
// src/firebase/answerKeys.js
// Teachers create answer keys by completing activities themselves.
// Keys are stored per-teacher so different teachers can have different keys.

import { getDatabase, ref, get, set, remove } from 'firebase/database';

const database = getDatabase();

/**
 * Save an answer key for an activity
 * @param {string} teacherUid - Teacher's Firebase UID
 * @param {string} lessonId - Lesson ID (e.g., 'll-lesson1')
 * @param {string} activityId - Activity ID (e.g., 'dynamics-listening-map')
 * @param {Object} workData - The activity data (same shape as student work)
 */
export const saveAnswerKey = async (teacherUid, lessonId, activityId, workData) => {
  const workKey = `${lessonId}-${activityId}`;
  const keyRef = ref(database, `answerKeys/${teacherUid}/${workKey}`);

  const record = {
    teacherUid,
    lessonId,
    activityId,
    workKey,
    data: workData,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await set(keyRef, record);
  return record;
};

/**
 * Load an answer key
 */
export const getAnswerKey = async (teacherUid, lessonId, activityId) => {
  const workKey = `${lessonId}-${activityId}`;
  const keyRef = ref(database, `answerKeys/${teacherUid}/${workKey}`);
  const snapshot = await get(keyRef);
  return snapshot.exists() ? snapshot.val() : null;
};

/**
 * Get all answer keys for a teacher (for showing which activities have keys)
 * @returns {Object} Map of workKey -> answer key data
 */
export const getAllAnswerKeys = async (teacherUid) => {
  const keysRef = ref(database, `answerKeys/${teacherUid}`);
  const snapshot = await get(keysRef);
  if (!snapshot.exists()) return {};
  return snapshot.val();
};

/**
 * Delete an answer key
 */
export const deleteAnswerKey = async (teacherUid, lessonId, activityId) => {
  const workKey = `${lessonId}-${activityId}`;
  await remove(ref(database, `answerKeys/${teacherUid}/${workKey}`));
};
