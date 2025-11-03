// File: /src/lessons/film-music-project/lesson1/reflectionServerUtils.js
// Firebase utilities for saving and retrieving student reflections

import database from '../../../firebase/config';
import { ref, set, get, remove } from 'firebase/database';

/**
 * Generate a unique share code for a reflection
 */
const generateShareCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Save a student's reflection to Firebase
 * @param {string} studentName - Name of the student
 * @param {object} reflectionData - The reflection data with star1, star2, wish
 * @param {string} activityType - Type of activity (e.g., 'two-stars-wish')
 * @returns {object} Share code and URL
 */
export const saveReflection = async (studentName, reflectionData, activityType = 'two-stars-wish') => {
  try {
    const shareCode = generateShareCode();
    const timestamp = new Date().toISOString();
    
    const reflectionRecord = {
      shareCode,
      studentName,
      activityType,
      reflection: reflectionData,
      timestamp,
      shareUrl: `${window.location.origin}/view-reflection/${shareCode}?type=${activityType}`
    };

    const reflectionRef = ref(database, `reflections/${shareCode}`);
    await set(reflectionRef, reflectionRecord);

    console.log('✅ Reflection saved to Firebase:', shareCode);
    
    return {
      shareCode,
      shareUrl: reflectionRecord.shareUrl
    };
  } catch (error) {
    console.error('❌ Error saving reflection to Firebase:', error);
    throw error;
  }
};

/**
 * Get a reflection by its share code
 * @param {string} shareCode - The share code to look up
 * @returns {object|null} The reflection record or null if not found
 */
export const getReflectionByCode = async (shareCode) => {
  try {
    const reflectionRef = ref(database, `reflections/${shareCode}`);
    const snapshot = await get(reflectionRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('Reflection not found:', shareCode);
      return null;
    }
  } catch (error) {
    console.error('Error fetching reflection:', error);
    throw error;
  }
};

/**
 * Get all reflections from Firebase
 * @returns {array} Array of all reflections
 */
export const getAllReflections = async () => {
  try {
    const reflectionsRef = ref(database, 'reflections');
    const snapshot = await get(reflectionsRef);
    
    if (snapshot.exists()) {
      const reflectionsObj = snapshot.val();
      return Object.values(reflectionsObj);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching all reflections:', error);
    return [];
  }
};

/**
 * Delete a reflection by its share code
 * @param {string} shareCode - The share code of the reflection to delete
 */
export const deleteReflection = async (shareCode) => {
  try {
    const reflectionRef = ref(database, `reflections/${shareCode}`);
    await remove(reflectionRef);
    console.log('✅ Reflection deleted:', shareCode);
  } catch (error) {
    console.error('❌ Error deleting reflection:', error);
    throw error;
  }
};