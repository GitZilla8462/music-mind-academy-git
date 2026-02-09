// File: /src/lessons/film-music-project/lesson1/compositionServerUtils.js
// Dual-save system:
// 1. localStorage = Private auto-saves for each student (no bandwidth cost)
// 2. Firebase = Teacher submissions with share codes (existing system)

import { getDatabase, ref, set, get, remove } from 'firebase/database';

// ============================================================================
// LOCAL STORAGE FUNCTIONS (Private, per-student auto-saves)
// ============================================================================

const LOCAL_STORAGE_KEY = 'student-compositions-autosave';

/**
 * Auto-save composition to localStorage (private, no bandwidth)
 * @param {Object} compositionData - The composition data
 * @param {string} activityType - Type of activity
 * @param {string} studentName - Student's name for identification
 * @returns {Object} Success status
 */
export const autoSaveComposition = (compositionData, activityType, studentName) => {
  try {
    // Get existing saves
    const existingSaves = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    
    // Create unique key for this student + activity
    const saveKey = `${studentName}-${activityType}`;
    
    // Save with timestamp
    existingSaves[saveKey] = {
      composition: compositionData,
      activityType,
      studentName,
      lastSaved: new Date().toISOString(),
      autoSave: true
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingSaves));
    
    console.log(`Auto-saved locally for ${activityType}`);
    return { success: true, lastSaved: existingSaves[saveKey].lastSaved };
  } catch (error) {
    console.error('❌ Auto-save failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load student's saved composition from localStorage
 * @param {string} activityType - Type of activity
 * @param {string} studentName - Student's name
 * @returns {Object|null} Saved composition or null
 */
export const loadAutoSavedComposition = (activityType, studentName) => {
  try {
    const existingSaves = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    const saveKey = `${studentName}-${activityType}`;
    
    const saved = existingSaves[saveKey];
    if (saved) {
      console.log(`Loaded auto-save for ${activityType}`);
      return saved;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Failed to load auto-save:', error);
    return null;
  }
};

/**
 * Get all auto-saved compositions for a student
 * @param {string} studentName - Student's name
 * @returns {Array} Array of saved compositions
 */
export const getAllAutoSavesForStudent = (studentName) => {
  try {
    const existingSaves = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    
    // Filter saves for this student
    const studentSaves = Object.values(existingSaves).filter(
      save => save.studentName === studentName
    );
    
    return studentSaves;
  } catch (error) {
    console.error('❌ Failed to get auto-saves:', error);
    return [];
  }
};

/**
 * Delete an auto-saved composition
 * @param {string} activityType - Type of activity
 * @param {string} studentName - Student's name
 * @returns {boolean} Success status
 */
export const deleteAutoSave = (activityType, studentName) => {
  try {
    const existingSaves = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    const saveKey = `${studentName}-${activityType}`;
    
    delete existingSaves[saveKey];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingSaves));
    
    console.log(`Deleted auto-save for ${activityType}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to delete auto-save:', error);
    return false;
  }
};

// ============================================================================
// FIREBASE FUNCTIONS (Teacher submissions with share codes - UNCHANGED)
// ============================================================================

/**
 * Generate a unique share code for a composition
 */
export const generateShareCode = () => {
  return `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Submit composition to Firebase for teacher viewing
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
    
    console.log('✅ Composition submitted to Firebase for teacher:', shareCode);
    
    // Also save to localStorage as backup
    const localSaves = JSON.parse(localStorage.getItem('saved-compositions') || '[]');
    localSaves.push(submissionData);
    localStorage.setItem('saved-compositions', JSON.stringify(localSaves));
    
    return {
      success: true,
      shareCode,
      shareUrl: submissionData.shareUrl,
      message: 'Composition submitted to teacher successfully!'
    };
  } catch (error) {
    console.error('Error submitting composition to Firebase:', error);
    
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
 * Get all submitted compositions from Firebase (for teacher viewing)
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
 * Get a specific composition by share code (for viewing)
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
 * Delete a composition from Firebase
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