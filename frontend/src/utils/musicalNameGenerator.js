// Musical Name Generator
// Generates fun, appropriate names for middle school students
// Pattern: [Instrument] + [Animal/Cool Word]

const instruments = [
  'Piano', 'Guitar', 'Drum', 'Flute', 'Trumpet', 
  'Violin', 'Sax', 'Clarinet', 'Trombone', 'Cello',
  'Harp', 'Oboe', 'Tuba', 'Cymbal', 'Banjo',
  'Ukulele', 'Accordion', 'Xylo', 'Tambourine', 'Kazoo'
];

const animals = [
  'Tiger', 'Eagle', 'Dolphin', 'Panda', 'Fox',
  'Wolf', 'Bear', 'Hawk', 'Owl', 'Lion',
  'Shark', 'Falcon', 'Dragon', 'Phoenix', 'Comet',
  'Thunder', 'Lightning', 'Star', 'Cloud', 'Rocket'
];

/**
 * Generate a random musical name
 * @returns {string} - e.g., "flutebird", "drumtiger", "pianophoenix"
 */
export const generateMusicalName = () => {
  const instrument = instruments[Math.floor(Math.random() * instruments.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  
  // Lowercase, no spaces
  return `${instrument.toLowerCase()}${animal.toLowerCase()}`;
};

/**
 * Generate a unique musical name (check against existing names)
 * @param {Array<string>} existingNames - Array of names already in use
 * @param {number} maxAttempts - Maximum attempts to find unique name
 * @returns {string} - Unique musical name
 */
export const generateUniqueMusicalName = (existingNames = [], maxAttempts = 50) => {
  let attempts = 0;
  let name = generateMusicalName();
  
  while (existingNames.includes(name) && attempts < maxAttempts) {
    name = generateMusicalName();
    attempts++;
  }
  
  // If we couldn't find a unique name after max attempts, append a number
  if (existingNames.includes(name)) {
    const randomNum = Math.floor(Math.random() * 999);
    name = `${name}${randomNum}`;
  }
  
  return name;
};

/**
 * Get display version of name (capitalize first letters)
 * @param {string} name - e.g., "flutebird"
 * @returns {string} - e.g., "FluteBird"
 */
export const getDisplayName = (name) => {
  if (!name) return '';
  
  // Find where the animal part starts (after the instrument)
  // This is a simple heuristic - find the second uppercase letter position
  const lowerName = name.toLowerCase();
  
  // For display, just capitalize first letter of each word
  // We'll split based on known instrument/animal boundaries
  for (const instrument of instruments) {
    if (lowerName.startsWith(instrument.toLowerCase())) {
      const animal = lowerName.substring(instrument.length);
      return instrument + animal.charAt(0).toUpperCase() + animal.slice(1);
    }
  }
  
  // Fallback: just capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export default {
  generateMusicalName,
  generateUniqueMusicalName,
  getDisplayName
};