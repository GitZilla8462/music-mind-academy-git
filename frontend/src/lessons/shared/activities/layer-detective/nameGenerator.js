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
  'Raven', 'Owl', 'Falcon', 'Condor', 'Vulture',
  'Fox', 'Coyote', 'Badger', 'Otter', 'Raccoon',
  'Cobra', 'Python', 'Viper', 'Anaconda', 'Mamba',
  'Pegasus', 'Unicorn', 'Griffin', 'Sphinx', 'Kraken'
];

/**
 * Generate a unique fun name for a student
 * @param {string} userId - The user's ID (for consistency)
 * @returns {string} - Generated name like "Blazing Dragon"
 */
export const generatePlayerName = (userId) => {
  // Use userId as seed for consistent names per user
  const seed = hashCode(userId);
  const adjectiveIndex = Math.abs(seed) % adjectives.length;
  const animalIndex = Math.abs(seed * 2) % animals.length;
  
  return `${adjectives[adjectiveIndex]} ${animals[animalIndex]}`;
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
  
  const seed = hashCode(userId);
  return colors[Math.abs(seed) % colors.length];
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
  
  const seed = hashCode(userId);
  return emojis[Math.abs(seed) % emojis.length];
};