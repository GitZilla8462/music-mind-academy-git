// Rubric Template CRUD
// src/firebase/rubrics.js
// Teachers can save and load reusable rubric templates

import { getDatabase, ref, get, set, push, remove } from 'firebase/database';

const database = getDatabase();

/**
 * Save a new rubric template
 * @param {string} teacherUid
 * @param {{ name: string, categories: Array<{ name: string, maxScore: number }> }} rubric
 */
export const saveRubricTemplate = async (teacherUid, rubric) => {
  const rubricRef = push(ref(database, `rubrics/${teacherUid}`));
  const record = {
    name: rubric.name,
    categories: rubric.categories,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await set(rubricRef, record);
  return { id: rubricRef.key, ...record };
};

/**
 * Get all saved rubric templates for a teacher
 * @param {string} teacherUid
 * @returns {Array<{ id, name, categories, createdAt }>}
 */
export const getRubricTemplates = async (teacherUid) => {
  const snapshot = await get(ref(database, `rubrics/${teacherUid}`));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data).map(([id, rubric]) => ({ id, ...rubric }));
};

/**
 * Delete a rubric template
 * @param {string} teacherUid
 * @param {string} rubricId
 */
export const deleteRubricTemplate = async (teacherUid, rubricId) => {
  await remove(ref(database, `rubrics/${teacherUid}/${rubricId}`));
};
