// Dev tools - only active in development mode
// Usage: Type `devTools.clearAll()` in browser console

import { getDatabase, ref, get, remove } from 'firebase/database';

const isDev = import.meta.env.DEV;

const devTools = {
  // Clear all localStorage
  clearAll: () => {
    const count = localStorage.length;
    localStorage.clear();
    console.log(`🧹 Cleared ${count} localStorage items`);
    return `Cleared ${count} items. Refresh the page to see changes.`;
  },

  // Clear only lesson-related data (preserves auth/settings)
  clearLessons: () => {
    const lessonKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('lesson') ||
        key.includes('composition') ||
        key.includes('reflection') ||
        key.includes('listening-map') ||
        key.includes('loop-lab') ||
        key.includes('monster-melody') ||
        key.includes('sectional-loop') ||
        key.includes('layer-detective') ||
        key.includes('city-') ||
        key.includes('wildlife-') ||
        key.includes('school-beneath') ||
        key.includes('epic-') ||
        key.includes('sound-garden')
      )) {
        lessonKeys.push(key);
      }
    }
    lessonKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Cleared ${lessonKeys.length} lesson items:`, lessonKeys);
    return `Cleared ${lessonKeys.length} lesson items. Refresh to see changes.`;
  },

  // List all localStorage keys
  list: () => {
    const items = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        items[key] = value ? value.substring(0, 100) + (value.length > 100 ? '...' : '') : null;
      }
    }
    console.table(items);
    return items;
  },

  // Clear a specific key pattern
  clearPattern: (pattern) => {
    const regex = new RegExp(pattern, 'i');
    const cleared = [];
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    keys.forEach(key => {
      if (regex.test(key)) {
        localStorage.removeItem(key);
        cleared.push(key);
      }
    });
    console.log(`🧹 Cleared ${cleared.length} items matching "${pattern}":`, cleared);
    return `Cleared: ${cleared.join(', ') || 'none'}`;
  },

  // Quick refresh after clearing
  clearAndRefresh: () => {
    localStorage.clear();
    window.location.reload();
  },

  // Clean orphaned submissions for a class
  cleanSubmissions: async (classId) => {
    if (!classId) {
      console.log('Usage: devTools.cleanSubmissions("classId")');
      return;
    }
    const db = getDatabase();
    const subsRef = ref(db, `submissions/${classId}`);
    const snapshot = await get(subsRef);
    if (!snapshot.exists()) {
      console.log('No submissions found for this class.');
      return;
    }
    const data = snapshot.val();
    let cleaned = 0;
    for (const lessonId of Object.keys(data)) {
      const lessonSubs = data[lessonId];
      for (const studentUid of Object.keys(lessonSubs)) {
        const sub = lessonSubs[studentUid];
        console.log(`  📋 ${lessonId}/${studentUid}: status=${sub.status}, activity=${sub.activityId}`);
      }
      if (lessonId === 'unknown') {
        await remove(ref(db, `submissions/${classId}/unknown`));
        cleaned += Object.keys(lessonSubs).length;
        console.log(`  🗑️ Removed ${Object.keys(lessonSubs).length} orphaned submissions under "unknown"`);
      }
    }
    if (cleaned === 0) {
      console.log('No orphaned submissions found. Listed all above.');
    } else {
      console.log(`✅ Cleaned ${cleaned} orphaned submissions. Refresh the page.`);
    }
  },

  // Help
  help: () => {
    const help = `
🛠️ Dev Tools Commands:
  devTools.clearAll()              - Clear all localStorage
  devTools.clearLessons()          - Clear only lesson data (keeps auth)
  devTools.clearAndRefresh()       - Clear all and reload page
  devTools.list()                  - List all localStorage items
  devTools.clearPattern('x')       - Clear items matching pattern
  devTools.cleanSubmissions('id')  - Clean orphaned Firebase submissions
  devTools.help()                  - Show this help
    `;
    console.log(help);
    return help;
  }
};

// Only expose in development
export const initDevTools = () => {
  if (isDev) {
    window.devTools = devTools;
    // Lazy-load fake data generator
    import('./generateFakeStudentData.js').catch(() => {});
    console.log('🛠️ Dev tools loaded. Type devTools.help() for commands.');
  }
};

export default devTools;
