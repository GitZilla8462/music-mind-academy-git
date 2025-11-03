// File: /src/lessons/film-music-project/lesson1/compositionServerUtils.js
// Firebase-based utility for saving and retrieving compositions
// No separate backend needed!

import { getDatabase, ref, set, get, remove, query, orderByChild } from 'firebase/database';

/**
 * Generate a unique share code for a composition
 */
export const generateShareCode = () => {
  return `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Save composition to Firebase
 * @param {Object} compositionData - The composition data to save
 * @param {string} activityType - Type of activity ('school-beneath' or 'sound-effects')
 * @returns {Promise<Object>} Response with shareCode and success status
 */
export const saveCompositionToServer = async (compositionData, activityType) => {
  try {
    const db = getDatabase();
    const shareCode = generateShareCode();
    const timestamp = new Date().toISOString();
    
    const submissionData = {
      shareCode,
      activityType,
      timestamp,
      studentName: compositionData.studentName || 'Anonymous Student',
      composition: compositionData,
      shareUrl: `${window.location.origin}/join?code=${shareCode}`
    };

    // Save to Firebase at /compositions/{shareCode}
    const compositionRef = ref(db, `compositions/${shareCode}`);
    await set(compositionRef, submissionData);
    
    console.log('✅ Composition saved to Firebase:', shareCode);
    
    // Also save to localStorage as backup
    const localSaves = JSON.parse(localStorage.getItem('saved-compositions') || '[]');
    localSaves.push(submissionData);
    localStorage.setItem('saved-compositions', JSON.stringify(localSaves));
    
    return {
      success: true,
      shareCode,
      shareUrl: submissionData.shareUrl,
      message: 'Composition saved successfully!'
    };
  } catch (error) {
    console.error('Error saving composition to Firebase:', error);
    
    // Fallback: save to localStorage only
    const shareCode = generateShareCode();
    const submissionData = {
      shareCode,
      activityType,
      timestamp: new Date().toISOString(),
      studentName: compositionData.studentName || 'Anonymous Student',
      composition: compositionData,
      shareUrl: `${window.location.origin}/join?code=${shareCode}`
    };
    
    const localSaves = JSON.parse(localStorage.getItem('saved-compositions') || '[]');
    localSaves.push(submissionData);
    localStorage.setItem('saved-compositions', JSON.stringify(localSaves));
    
    return {
      success: true,
      shareCode,
      shareUrl: submissionData.shareUrl,
      message: 'Composition saved locally (Firebase unavailable)',
      localOnly: true
    };
  }
};

/**
 * Get all saved compositions from Firebase
 * @returns {Promise<Array>} Array of saved compositions
 */
export const getAllCompositions = async () => {
  try {
    const db = getDatabase();
    const compositionsRef = ref(db, 'compositions');
    const snapshot = await get(compositionsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const data = snapshot.val();
    const compositions = Object.values(data);
    
    console.log(`✅ Fetched ${compositions.length} compositions from Firebase`);
    return compositions;
  } catch (error) {
    console.error('Error fetching compositions from Firebase:', error);
    
    // Fallback to localStorage
    const localSaves = JSON.parse(localStorage.getItem('saved-compositions') || '[]');
    return localSaves;
  }
};

/**
 * Get a specific composition by share code
 * @param {string} shareCode - The share code to look up
 * @returns {Promise<Object|null>} The composition data or null if not found
 */
export const getCompositionByCode = async (shareCode) => {
  try {
    const db = getDatabase();
    const compositionRef = ref(db, `compositions/${shareCode}`);
    const snapshot = await get(compositionRef);
    
    if (!snapshot.exists()) {
      throw new Error('Composition not found');
    }
    
    console.log(`✅ Found composition: ${shareCode}`);
    return snapshot.val();
  } catch (error) {
    console.error('Error fetching composition:', error);
    
    // Fallback to localStorage
    const localSaves = JSON.parse(localStorage.getItem('saved-compositions') || '[]');
    const found = localSaves.find(comp => comp.shareCode === shareCode);
    return found || null;
  }
};

/**
 * Delete a composition
 * @param {string} shareCode - The share code of the composition to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteComposition = async (shareCode) => {
  try {
    const db = getDatabase();
    const compositionRef = ref(db, `compositions/${shareCode}`);
    await remove(compositionRef);
    
    console.log(`✅ Deleted composition: ${shareCode}`);
    
    // Also delete from localStorage
    const localSaves = JSON.parse(localStorage.getItem('saved-compositions') || '[]');
    const filtered = localSaves.filter(comp => comp.shareCode !== shareCode);
    localStorage.setItem('saved-compositions', JSON.stringify(filtered));
    
    return true;
  } catch (error) {
    console.error('Error deleting composition from Firebase:', error);
    
    // Fallback: delete from localStorage only
    const localSaves = JSON.parse(localStorage.getItem('saved-compositions') || '[]');
    const filtered = localSaves.filter(comp => comp.shareCode !== shareCode);
    localStorage.setItem('saved-compositions', JSON.stringify(filtered));
    
    return true;
  }
};