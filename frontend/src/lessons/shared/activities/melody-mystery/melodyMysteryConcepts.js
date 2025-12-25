// Melody Mystery Concepts & Storylines
// 4 story concepts (1 available, 3 "coming soon"), storyline data, asset paths

const ASSET_BASE_PATH = '/lessons/film-music-project/lesson5/concepts';

// ========================================
// CONCEPTS (Story Themes)
// ========================================

export const CONCEPTS = {
  'vanishing-composer': {
    id: 'vanishing-composer',
    name: 'The Vanishing Composer',
    description: 'Track down a missing composer!',
    available: true,  // Only this one is playable
    icon: '🎼',
    colors: {
      primary: '#8b5cf6',
      secondary: '#d4a574',
      accent: '#fbbf24',
      background: '#1e1b4b',
    },
    font: {
      family: "'Cinzel', serif",
      import: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap",
    },
    endings: ['ranaway', 'kidnapped', 'arrested'],
  },
  'time-traveler': {
    id: 'time-traveler',
    name: 'The Time Traveler',
    description: 'Decode melodies across eras!',
    available: false, // COMING SOON
    icon: '⏰',
    colors: {
      primary: '#06b6d4',
      secondary: '#3b82f6',
      accent: '#ffffff',
      background: '#0f172a',
    },
  },
  'alien-signal': {
    id: 'alien-signal',
    name: 'Alien Signal',
    description: 'Communicate through melody!',
    available: false, // COMING SOON
    icon: '👽',
    colors: {
      primary: '#22c55e',
      secondary: '#84cc16',
      accent: '#ffffff',
      background: '#052e16',
    },
  },
  'dream-detective': {
    id: 'dream-detective',
    name: 'Dream Detective',
    description: 'Solve mysteries in dreams!',
    available: false, // COMING SOON
    icon: '🌙',
    colors: {
      primary: '#ec4899',
      secondary: '#a855f7',
      accent: '#fdf4ff',
      background: '#1e1b2e',
    },
  },
};

// ========================================
// STORYLINES (Location-based clues)
// ========================================

export const STORYLINES = {
  'vanishing-composer': {
    intro: "A famous composer has vanished! Work with your partner to track down where he went by decoding melody signals at each location.",
    endings: {
      ranaway: {
        id: 'ranaway',
        name: 'He Ran Away',
        icon: '🏃',
        locations: [
          { id: 1, name: 'Studio', clue: 'His bag is gone. Check his APARTMENT' },
          { id: 2, name: 'Apartment', clue: 'Passport missing. Head to the BUS STATION' },
          { id: 3, name: 'Bus Station', clue: 'Ticket bought for the coast. Try the DOCKS' },
          { id: 4, name: 'Docks', clue: 'A boat left this morning. Ask at the LIGHTHOUSE' },
          { id: 5, name: 'Lighthouse', clue: 'Keeper saw him head to the BEACH' },
          { id: 6, name: 'Beach', clue: 'Footprints lead to a CABIN' },
        ],
        finalAnswer: 'CABIN',
        resolution: 'You found him! He needed a break from the spotlight and escaped to a quiet cabin by the sea.',
      },
      kidnapped: {
        id: 'kidnapped',
        name: 'He Was Kidnapped',
        icon: '🚐',
        locations: [
          { id: 1, name: 'Studio', clue: 'Signs of struggle. Check the ALLEY' },
          { id: 2, name: 'Alley', clue: 'Van tracks head toward the HIGHWAY' },
          { id: 3, name: 'Highway', clue: 'Witness saw van exit at the FACTORY' },
          { id: 4, name: 'Factory', clue: 'Empty but note says check the BRIDGE' },
          { id: 5, name: 'Bridge', clue: 'Another note points to the WAREHOUSE' },
          { id: 6, name: 'Warehouse', clue: 'You hear music from the BASEMENT' },
        ],
        finalAnswer: 'BASEMENT',
        resolution: 'You rescued him! A rival composer had kidnapped him to steal his new symphony.',
      },
      arrested: {
        id: 'arrested',
        name: 'He Was Arrested',
        icon: '🚔',
        locations: [
          { id: 1, name: 'Studio', clue: 'Police tape everywhere. Head to the STATION' },
          { id: 2, name: 'Station', clue: 'Records say transferred to COUNTY JAIL' },
          { id: 3, name: 'County Jail', clue: 'Lawyer says check the COURTHOUSE' },
          { id: 4, name: 'Courthouse', clue: 'Case file mentions the BANK' },
          { id: 5, name: 'Bank', clue: 'Security footage points to the HOTEL' },
          { id: 6, name: 'Hotel', clue: 'The real culprit is in ROOM 404' },
        ],
        finalAnswer: 'ROOM 404',
        resolution: 'Case closed! You proved his innocence by finding the real thief.',
      },
    },
  },
};

// ========================================
// ASSET HELPER FUNCTIONS
// ========================================

// Get concept assets (setup, share, results, create screens)
export const getConceptAssets = (conceptId) => {
  const basePath = `${ASSET_BASE_PATH}/${conceptId}`;
  return {
    bgSetup: `${basePath}/bg-setup.png`,
    bgShare: `${basePath}/bg-share.png`,
    bgResults: `${basePath}/bg-results.png`,
    bgCreate: `${basePath}/bg-create.png`,
  };
};

// Get location background based on which melody (1-6)
// Melodies 1-2 use bg-location-1, 3-4 use bg-location-2, 5-6 use bg-location-3
export const getLocationBackground = (conceptId, melodyNumber) => {
  const basePath = `${ASSET_BASE_PATH}/${conceptId}`;
  if (melodyNumber <= 2) return `${basePath}/bg-location-1.png`;
  if (melodyNumber <= 4) return `${basePath}/bg-location-2.png`;
  return `${basePath}/bg-location-3.png`;
};

// Get room background based on progress (like Beat Escape Room)
export const getRoomBackground = (conceptId, currentMelody, totalMelodies) => {
  return getLocationBackground(conceptId, currentMelody);
};

// Get results/victory background
export const getResultsBackground = (conceptId) => {
  return getConceptAssets(conceptId).bgResults;
};

// ========================================
// CONCEPT HELPER FUNCTIONS
// ========================================

// Get only available concepts (for main selection)
export const getAvailableConcepts = () => {
  return Object.values(CONCEPTS).filter(c => c.available);
};

// Get all concepts (for showing "coming soon")
export const getAllConcepts = () => {
  return Object.values(CONCEPTS);
};

// Get concept by ID
export const getConcept = (conceptId) => {
  return CONCEPTS[conceptId] || CONCEPTS['vanishing-composer'];
};

// Get storyline for a concept
export const getStoryline = (conceptId) => {
  return STORYLINES[conceptId] || null;
};

// Get ending data
export const getEnding = (conceptId, endingId) => {
  const storyline = getStoryline(conceptId);
  return storyline?.endings?.[endingId] || null;
};

// Get location data for a specific melody number
export const getLocation = (conceptId, endingId, melodyNumber) => {
  const ending = getEnding(conceptId, endingId);
  return ending?.locations?.find(loc => loc.id === melodyNumber) || null;
};
