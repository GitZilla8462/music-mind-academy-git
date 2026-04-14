// Layer Detective Name Generator
// Generates fun animal + adjective names for students
// src/lessons/shared/activities/layer-detective/nameGenerator.js

const adjectives = [
  'Blazing', 'Swift', 'Mighty', 'Clever', 'Brave',
  'Epic', 'Cosmic', 'Thunder', 'Lightning', 'Stellar',
  'Turbo', 'Super', 'Ultra', 'Mega', 'Hyper',
  'Golden', 'Silver', 'Diamond', 'Crystal', 'Jade',
  'Sonic', 'Rocket', 'Laser', 'Neon', 'Quantum',
  'Shadow', 'Storm', 'Blaze', 'Frost', 'Ember',
  'Noble', 'Royal', 'Supreme', 'Elite', 'Prime',
  'Radiant', 'Shining', 'Glowing', 'Bright', 'Dazzling'
];

const animals = [
  'Dragon', 'Phoenix', 'Tiger', 'Eagle', 'Falcon',
  'Wolf', 'Bear', 'Lion', 'Panther', 'Hawk',
  'Dolphin', 'Shark', 'Whale', 'Orca', 'Manta',
  'Cheetah', 'Leopard', 'Jaguar', 'Puma', 'Lynx',
  'Raven', 'Owl', 'Mustang', 'Condor', 'Vulture',
  'Fox', 'Coyote', 'Badger', 'Otter', 'Raccoon',
  'Cobra', 'Python', 'Viper', 'Anaconda', 'Mamba',
  'Pegasus', 'Unicorn', 'Griffin', 'Sphinx', 'Kraken'
];

/**
 * Generate a fun name for a student based on userId
 * @param {string} userId - The user's ID (for consistency)
 * @param {number} attempt - Attempt number for collision resolution (default 0)
 * @returns {string} - Generated name like "Blazing Dragon"
 */
export const generatePlayerName = (userId, attempt = 0) => {
  // Extract numeric part from userId (e.g., "Student-902285" -> 902285)
  // This gives much better distribution than hashing the full string
  const numMatch = userId.match(/\d+/);
  let num = numMatch ? parseInt(numMatch[0], 10) : hashCode(userId);

  // Add attempt offset to get different name on collision
  // Using a prime multiplier ensures good distribution across attempts
  num = num + (attempt * 127);

  // Use prime multipliers to get independent indices for adjective and animal
  // This ensures different digits affect each index differently
  const adjectiveIndex = Math.abs(num) % adjectives.length;
  const animalIndex = Math.abs(Math.floor(num / adjectives.length)) % animals.length;

  return `${adjectives[adjectiveIndex]} ${animals[animalIndex]}`;
};

/**
 * Generate a unique fun name that doesn't collide with existing names
 * @param {string} userId - The user's ID
 * @param {Array<string>} existingNames - Names already in use
 * @param {number} maxAttempts - Maximum attempts before adding number suffix
 * @returns {string} - Unique generated name
 */
export const generateUniquePlayerName = (userId, existingNames = [], maxAttempts = 50) => {
  let attempt = 0;
  let name = generatePlayerName(userId, attempt);

  // Try different names until we find a unique one
  while (existingNames.includes(name) && attempt < maxAttempts) {
    attempt++;
    name = generatePlayerName(userId, attempt);
  }

  // If still colliding after max attempts, add a number suffix
  if (existingNames.includes(name)) {
    const randomNum = Math.floor(Math.random() * 99) + 1;
    name = `${name} ${randomNum}`;
  }

  return name;
};

/**
 * Simple hash function to convert string to number
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Get a random color for player avatar
 */
export const getPlayerColor = (userId) => {
  const colors = [
    '#EF4444', // Red
    '#F59E0B', // Orange
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Deep Orange
  ];

  const numMatch = userId.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0], 10) : hashCode(userId);
  return colors[num % colors.length];
};

/**
 * Get player emoji icon
 */
export const getPlayerEmoji = (userId) => {
  const emojis = [
    '🎸', '🎹', '🎺', '🎷', '🎻',
    '🥁', '🎤', '🎧', '🎵', '🎶',
    '⭐', '🌟', '✨', '💫', '🔥',
    '🎯', '🏆', '🎪', '🎨', '🎭'
  ];

  const numMatch = userId.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0], 10) : hashCode(userId);
  return emojis[Math.floor(num / 8) % emojis.length]; // Offset by color count for variety
};

/**
 * Format a full name as "FirstName L." (first name + last initial)
 * @param {string} fullName - e.g. "Charles Taube"
 * @returns {string} - e.g. "Charles T."
 */
export const formatFirstNameLastInitial = (fullName) => {
  if (!fullName) return 'Student';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
};

/**
 * Get the student's real display name from Firebase session data or localStorage,
 * formatted as "FirstName L." Falls back to generated animal name.
 * @param {string} userId
 * @param {string|null} sessionCode - effective session code
 * @param {string|null} studentsPath - Firebase path to studentsJoined (for class-based sessions)
 * @returns {Promise<string>}
 */
export const getStudentDisplayName = async (userId, sessionCode, studentsPath) => {
  const { getDatabase, ref, get } = await import('firebase/database');
  const db = getDatabase();
  let name = null;

  // Try Firebase session data first (the name set when student joined)
  const path = studentsPath || (sessionCode ? `sessions/${sessionCode}/studentsJoined/${userId}/name` : null);
  if (path) {
    try {
      const namePath = studentsPath ? `${studentsPath}/${userId}/name` : path;
      const snapshot = await get(ref(db, namePath));
      if (snapshot.exists()) {
        const val = snapshot.val();
        // Skip fallback names like "Seat 5" or "Student"
        if (val && !val.startsWith('Seat ') && val !== 'Student') {
          name = val;
        }
      }
    } catch {
      // Fall through
    }
  }

  // Try localStorage (set during joinSession)
  if (!name) {
    const stored = localStorage.getItem('current-session-studentName');
    if (stored && !stored.startsWith('Seat ') && stored !== 'Student') {
      name = stored;
    }
  }

  // Try URL username param (always set for class-based sessions from StudentHome)
  if (!name) {
    try {
      const urlName = new URLSearchParams(window.location.search).get('username');
      if (urlName && !urlName.startsWith('seat')) {
        name = urlName;
      }
    } catch {
      // Fall through
    }
  }

  // Try classroom-username from localStorage
  if (!name) {
    const classroomName = localStorage.getItem('classroom-username');
    if (classroomName) {
      name = classroomName;
    }
  }

  // Format as "FirstName L." or fall back to generated name
  return name ? formatFirstNameLastInitial(name) : generateUniquePlayerName(userId, []);
};