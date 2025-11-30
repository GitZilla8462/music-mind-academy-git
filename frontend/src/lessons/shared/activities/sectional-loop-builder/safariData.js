// File: /src/lessons/shared/activities/sectional-loop-builder/safariData.js
// Safari mechanic - Animals, codes, and helper functions
// Each student gets a random animal + 4-digit code that shuffles each Safari round

// Wildlife-themed safari animals
export const safariAnimals = [
  { id: 'lion', emoji: '🦁', name: 'Lion' },
  { id: 'elephant', emoji: '🐘', name: 'Elephant' },
  { id: 'giraffe', emoji: '🦒', name: 'Giraffe' },
  { id: 'zebra', emoji: '🦓', name: 'Zebra' },
  { id: 'leopard', emoji: '🐆', name: 'Leopard' },
  { id: 'rhino', emoji: '🦏', name: 'Rhino' },
  { id: 'crocodile', emoji: '🐊', name: 'Crocodile' },
  { id: 'flamingo', emoji: '🦩', name: 'Flamingo' },
  { id: 'parrot', emoji: '🦜', name: 'Parrot' },
  { id: 'turtle', emoji: '🐢', name: 'Turtle' },
  { id: 'dolphin', emoji: '🐬', name: 'Dolphin' },
  { id: 'shark', emoji: '🦈', name: 'Shark' },
  { id: 'gorilla', emoji: '🦍', name: 'Gorilla' },
  { id: 'hippo', emoji: '🦛', name: 'Hippo' },
  { id: 'kangaroo', emoji: '🦘', name: 'Kangaroo' },
  { id: 'eagle', emoji: '🦅', name: 'Eagle' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin' },
  { id: 'tiger', emoji: '🐅', name: 'Tiger' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
];

/**
 * Generate a random 4-digit code
 * @returns {string} - 4-digit code like "4729"
 */
export const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Get a random animal from the list
 * @param {string[]} excludeIds - Array of animal IDs to exclude (already assigned)
 * @returns {object} - Animal object { id, emoji, name }
 */
export const getRandomAnimal = (excludeIds = []) => {
  const available = safariAnimals.filter(a => !excludeIds.includes(a.id));
  if (available.length === 0) {
    // If all animals used, reset and pick from full list
    return safariAnimals[Math.floor(Math.random() * safariAnimals.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
};

/**
 * Assign animals and codes to all students
 * @param {string[]} studentIds - Array of student IDs
 * @returns {object} - Map of studentId -> { animal, code }
 */
export const assignSafariData = (studentIds) => {
  const assignments = {};
  const usedAnimals = [];
  
  studentIds.forEach(studentId => {
    const animal = getRandomAnimal(usedAnimals);
    usedAnimals.push(animal.id);
    
    // Reset used animals if we've used them all
    if (usedAnimals.length >= safariAnimals.length) {
      usedAnimals.length = 0;
    }
    
    assignments[studentId] = {
      animal,
      code: generateCode()
    };
  });
  
  return assignments;
};

/**
 * Pick 2 random students for Safari (excluding those currently on safari or recently went)
 * @param {string[]} allStudentIds - All student IDs
 * @param {string[]} excludeIds - Students to exclude (currently on safari or recently went)
 * @returns {string[]} - Array of 2 student IDs
 */
export const pickSafariStudents = (allStudentIds, excludeIds = []) => {
  const available = allStudentIds.filter(id => !excludeIds.includes(id));
  
  if (available.length < 2) {
    // If not enough available, reset exclusions and pick from all
    const shuffled = [...allStudentIds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }
  
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
};

/**
 * Pick a random animal for a student to find (different from their own)
 * @param {object} safariAssignments - Current safari assignments
 * @param {string} studentId - The student who needs to find an animal
 * @returns {object} - { targetStudentId, animal, code }
 */
export const pickTargetAnimal = (safariAssignments, studentId) => {
  const otherStudents = Object.entries(safariAssignments)
    .filter(([id]) => id !== studentId);
  
  if (otherStudents.length === 0) return null;
  
  const [targetId, targetData] = otherStudents[Math.floor(Math.random() * otherStudents.length)];
  
  return {
    targetStudentId: targetId,
    animal: targetData.animal,
    code: targetData.code
  };
};

// Safari timing constants
export const SAFARI_CONFIG = {
  START_DELAY: 30000,      // 30 seconds before first safari starts
  ROUND_DURATION: 60000,   // 60 seconds per safari round
  BONUS_POINTS: 50,        // Points for successful safari
  STUDENTS_PER_ROUND: 2    // Number of students on safari at once
};