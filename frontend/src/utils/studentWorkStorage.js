// File: /utils/studentWorkStorage.js
// Generic student work storage system for Music Mind Academy
// Any activity can save work that automatically appears on the Join page

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
 * 
 * @example
 * saveStudentWork('sports-composition', {
 *   title: 'Basketball Highlights',
 *   emoji: '🏀',
 *   viewRoute: '/lessons/film-music-project/lesson2?view=saved',
 *   subtitle: '2 loops • 1:29',
 *   category: 'Film Music Project',
 *   data: { placedLoops, videoDuration, videoId }
 * });
 */
export const saveStudentWork = (activityId, options, studentId = null) => {
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
  
  localStorage.setItem(key, JSON.stringify(saveData));
  console.log(`💾 Saved student work: ${key}`, saveData);
  
  return saveData;
};

/**
 * Load a specific saved work item
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
      console.log(`📂 Loaded student work: ${key}`, data);
      return data;
    } catch (error) {
      console.error(`Error loading student work: ${key}`, error);
      return null;
    }
  }
  return null;
};

/**
 * Delete a specific saved work item
 * 
 * @param {string} activityId - The activity ID to delete
 * @param {string} [studentId] - Optional student ID (uses current if not provided)
 */
export const deleteStudentWork = (activityId, studentId = null) => {
  const id = studentId || getStudentId();
  const key = `mma-saved-${id}-${activityId}`;
  localStorage.removeItem(key);
  console.log(`🗑️ Deleted student work: ${key}`);
};

/**
 * Get all saved work for the current student
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
  
  console.log(`📚 Found ${savedWork.length} saved work items for ${id}`);
  return savedWork;
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
        viewRoute: '/lessons/film-music-project/lesson3?view=saved',
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
        viewRoute: '/lessons/film-music-project/lesson2?view=saved',
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
        viewRoute: '/lessons/film-music-project/lesson4?view=saved',
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