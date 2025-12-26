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
// Point-and-click adventure: Each location has hotspots, devices, and typed answers
// Hotspots use percentage coordinates (x, y, width, height as % of image dimensions)
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
          {
            id: 1,
            name: 'Studio',
            nameSlug: 'studio',
            deviceName: 'radio',
            deviceType: 'radio',
            scenePrompt: 'Search the studio for a hidden signal device...',
            devicePrompt: 'An old radio with a glowing dial. It\'s transmitting!',
            clue: 'His bag is gone. Check his APARTMENT',
            answer: 'APARTMENT',
            acceptedAnswers: ['apartment', 'the apartment', 'his apartment'],
            // SVG coordinates in pixels (image is 800x450) - NEEDS scene-1-hotspots.png for accuracy
            selectableDevices: [
              { id: 'radio', name: 'Shelf Radio', letter: 'a', x: 48, y: 63, w: 120, h: 90 },
              { id: 'microphone', name: 'Microphone', letter: 'b', x: 256, y: 14, w: 96, h: 225 },
              { id: 'recordplayer', name: 'Record Player', letter: 'c', x: 440, y: 144, w: 128, h: 90 },
              { id: 'reeltoreel', name: 'Tape Machine', letter: 'd', x: 656, y: 117, w: 144, h: 203 },
              { id: 'amplifier', name: 'Amplifier', letter: 'e', x: 432, y: 329, w: 120, h: 99 },
            ],
            // Background hotspots in pixels (800x450)
            hotspots: [
              { id: 'piano', x: 40, y: 113, w: 192, h: 270, message: "An upright piano. Sheet music still on the stand." },
              { id: 'coatrack', x: 0, y: 45, w: 48, h: 203, message: "His coat is still here. He left in a hurry." },
              { id: 'window', x: 280, y: 23, w: 240, h: 189, message: "Rain. Dark city outside." },
              { id: 'desklamp', x: 496, y: 81, w: 96, h: 135, message: "Desk lamp. Still warm." }
            ]
          },
          {
            id: 2,
            name: 'Apartment',
            nameSlug: 'apartment',
            deviceName: 'phone',
            deviceType: 'phone',
            scenePrompt: 'Search the apartment for clues...',
            devicePrompt: 'A flip phone with a blinking light. Someone left a message!',
            clue: 'Passport missing. Head to the BUS STATION',
            answer: 'BUS STATION',
            acceptedAnswers: ['bus station', 'the bus station', 'busstation'],
            // SVG coordinates in pixels (image is 800x450)
            selectableDevices: [
              { id: 'headphones', name: 'Headphones', letter: 'a', x: 74, y: 259, w: 102, h: 115 },
              { id: 'recordplayer', name: 'Record Player', letter: 'b', x: 204, y: 206, w: 138, h: 90 },
              { id: 'radiocabinet', name: 'Radio Cabinet', letter: 'c', x: 345, y: 101, w: 184, h: 207 },
              { id: 'metronome', name: 'Metronome', letter: 'd', x: 574, y: 106, w: 65, h: 72 },
              { id: 'speaker', name: 'Speaker', letter: 'e', x: 659, y: 118, w: 80, h: 72 },
            ],
            // Background hotspots in pixels (800x450)
            hotspots: [
              { id: 'floorlamp', x: 24, y: 45, w: 96, h: 248, message: "The lamp is still on. Left in a hurry." },
              { id: 'armchair', x: 80, y: 135, w: 176, h: 248, message: "Still warm. He was just here..." },
              { id: 'bookshelf', x: 496, y: 180, w: 280, h: 225, message: "Books and records. Nothing useful." },
              { id: 'window', x: 576, y: 0, w: 224, h: 203, message: "Rain. Dark city outside." }
            ]
          },
          {
            id: 3,
            name: 'Bus Station',
            nameSlug: 'busstation',
            deviceName: 'walkie-talkie',
            deviceType: 'walkietalkie',
            scenePrompt: 'Look around the bus station...',
            devicePrompt: 'A walkie-talkie hidden under the bench. Still receiving!',
            clue: 'Ticket bought for the coast. Try the DOCKS',
            answer: 'DOCKS',
            acceptedAnswers: ['docks', 'the docks', 'dock'],
            selectableDevices: [
              { id: 'jukebox', name: 'Jukebox', letter: 'a', x: 65, y: 18, w: 143, h: 242 },
              { id: 'walkman', name: 'Walkman', letter: 'b', x: 0, y: 181, w: 61, h: 121 },
              { id: 'portableradio', name: 'Portable Radio', letter: 'c', x: 487, y: 232, w: 128, h: 81 },
              { id: 'cuberadio', name: 'Cube Speaker', letter: 'd', x: 474, y: 374, w: 153, h: 76 },
              { id: 'payphone', name: 'Payphone', letter: 'e', x: 728, y: 24, w: 72, h: 112 },
            ],
            hotspots: [
              { id: 'windowleft', x: 0, y: 5, w: 12, h: 40, message: "Rain. Dark street outside." },
              { id: 'trashcan', x: 35, y: 35, w: 10, h: 28, message: "Empty trash can. Nothing useful." },
              { id: 'bench', x: 40, y: 50, w: 30, h: 35, message: "A wooden bench. Someone was sitting here recently." },
              { id: 'vending', x: 68, y: 8, w: 20, h: 58, message: "Vending machine. Snacks and sodas." }
            ]
          },
          {
            id: 4,
            name: 'Docks',
            nameSlug: 'docks',
            deviceName: 'ship radio',
            deviceType: 'shipradio',
            scenePrompt: 'Search the docks for a signal...',
            devicePrompt: 'A marine radio mounted on a post. Picking up a frequency!',
            clue: 'A boat left this morning. Ask at the LIGHTHOUSE',
            answer: 'LIGHTHOUSE',
            acceptedAnswers: ['lighthouse', 'the lighthouse', 'light house'],
            selectableDevices: [
              { id: 'boombox', name: 'Boombox', letter: 'a', x: 420, y: 83, w: 177, h: 109 },
              { id: 'gramophone', name: 'Gramophone', letter: 'b', x: 614, y: 247, w: 150, h: 193 },
              { id: 'walkietalkie', name: 'Walkie-Talkie', letter: 'c', x: 401, y: 310, w: 53, h: 62 },
              { id: 'lantern', name: 'Lantern', letter: 'd', x: 623, y: 22, w: 105, h: 104 },
            ],
            hotspots: [
              { id: 'boat', x: 0, y: 35, w: 26, h: 50, message: "Empty rowboat. Rocking gently in the waves." },
              { id: 'seagull', x: 18, y: 25, w: 10, h: 18, message: "A seagull watches you suspiciously." },
              { id: 'lighthouse', x: 8, y: 18, w: 8, h: 30, message: "The lighthouse in the distance. Still operational." },
              { id: 'crates', x: 35, y: 45, w: 25, h: 30, message: "Shipping crates. Nothing inside." },
              { id: 'rope', x: 52, y: 55, w: 15, h: 18, message: "Nautical rope coiled neatly." }
            ]
          },
          {
            id: 5,
            name: 'Lighthouse',
            nameSlug: 'lighthouse',
            deviceName: 'tape recorder',
            deviceType: 'taperecorder',
            scenePrompt: 'Explore the lighthouse keeper\'s room...',
            devicePrompt: 'A vintage tape recorder. The reels are still spinning!',
            clue: 'Keeper saw him head to the BEACH',
            answer: 'BEACH',
            acceptedAnswers: ['beach', 'the beach'],
            selectableDevices: [
              { id: 'speaker', name: 'Speaker', letter: 'a', x: 0, y: 255, w: 120, h: 100 },
              { id: 'gramophone', name: 'Gramophone', letter: 'b', x: 475, y: 109, w: 128, h: 162 },
              { id: 'tuberadio', name: 'Tube Radio', letter: 'c', x: 588, y: 1, w: 114, h: 46 },
              { id: 'taperecorder', name: 'Tape Recorder', letter: 'd', x: 353, y: 382, w: 113, h: 61 },
              { id: 'musicbox', name: 'Music Box', letter: 'e', x: 739, y: 268, w: 61, h: 78 },
            ],
            hotspots: [
              { id: 'windows', x: 5, y: 5, w: 50, h: 70, message: "Arched windows. Dark ocean and rain outside." },
              { id: 'telescope', x: 15, y: 45, w: 18, h: 45, message: "An old telescope. Points toward the shore." },
              { id: 'desk', x: 32, y: 48, w: 30, h: 38, message: "A wooden desk. Papers scattered about." },
              { id: 'globe', x: 40, y: 48, w: 12, h: 18, message: "A globe. The coast is marked." },
              { id: 'armchair', x: 68, y: 48, w: 20, h: 45, message: "A leather armchair. Still warm." },
              { id: 'records', x: 38, y: 75, w: 14, h: 20, message: "Vinyl records on the floor." }
            ]
          },
          {
            id: 6,
            name: 'Beach',
            nameSlug: 'beach',
            deviceName: 'portable radio',
            deviceType: 'radio',
            scenePrompt: 'Search the beach for the final clue...',
            devicePrompt: 'A transistor radio half-buried in sand. The final signal!',
            clue: 'Footprints lead to a CABIN',
            answer: 'CABIN',
            acceptedAnswers: ['cabin', 'the cabin', 'a cabin'],
            selectableDevices: [
              { id: 'boombox', name: 'Boombox', letter: 'a', x: 40, y: 162, w: 147, h: 112 },
              { id: 'megaphone', name: 'Megaphone', letter: 'b', x: 357, y: 204, w: 149, h: 99 },
              { id: 'speaker', name: 'Speaker', letter: 'c', x: 324, y: 308, w: 102, h: 90 },
              { id: 'portableradio', name: 'Portable Radio', letter: 'd', x: 136, y: 355, w: 109, h: 62 },
              { id: 'cassetteplayer', name: 'Cassette Player', letter: 'e', x: 634, y: 301, w: 82, h: 73 },
            ],
            hotspots: [
              { id: 'driftwood', x: 5, y: 50, w: 20, h: 25, message: "Old driftwood. Nothing here." },
              { id: 'rocks', x: 75, y: 40, w: 20, h: 30, message: "Tide pools. No clues." },
              { id: 'boat', x: 55, y: 55, w: 20, h: 25, message: "Recently used. Sand still wet inside." },
              { id: 'footprints', x: 40, y: 45, w: 20, h: 20, message: "Leading toward the cabin in the dunes..." }
            ]
          },
        ],
        finalAnswer: 'CABIN',
        acceptedFinalAnswers: ['cabin', 'the cabin', 'a cabin'],
        resolution: 'You found him! He needed a break from the spotlight and escaped to a quiet cabin by the sea.',
      },
      kidnapped: {
        id: 'kidnapped',
        name: 'He Was Kidnapped',
        icon: '🚐',
        locations: [
          {
            id: 1,
            name: 'Studio',
            nameSlug: 'studio',
            deviceName: 'keyboard',
            deviceType: 'radio',
            scenePrompt: 'The studio is in disarray. Signs of a struggle...',
            devicePrompt: 'The keyboard was knocked over. But it\'s still recording!',
            clue: 'Signs of struggle. Check the ALLEY',
            answer: 'ALLEY',
            acceptedAnswers: ['alley', 'the alley'],
            hotspots: [
              { id: 'piano', x: 10, y: 40, w: 30, h: 35, message: "Knocked over. Signs of a struggle." },
              { id: 'papers', x: 45, y: 50, w: 25, h: 25, message: "Scattered sheet music everywhere." },
              { id: 'window', x: 70, y: 20, w: 20, h: 35, message: "Broken window. Someone was dragged out." },
              { id: 'device', x: 30, y: 50, w: 25, h: 25, isDevice: true }
            ]
          },
          {
            id: 2,
            name: 'Alley',
            nameSlug: 'apartment',
            deviceName: 'walkie-talkie',
            deviceType: 'phone',
            scenePrompt: 'Dark alley behind the studio. Tire tracks...',
            devicePrompt: 'A dropped walkie-talkie. The kidnappers\' frequency!',
            clue: 'Van tracks head toward the HIGHWAY',
            answer: 'HIGHWAY',
            acceptedAnswers: ['highway', 'the highway'],
            hotspots: [
              { id: 'dumpster', x: 10, y: 35, w: 25, h: 40, message: "Overturned trash. Something happened here." },
              { id: 'tracks', x: 40, y: 60, w: 30, h: 20, message: "Fresh tire tracks. A van." },
              { id: 'device', x: 55, y: 60, w: 20, h: 20, isDevice: true }
            ]
          },
          {
            id: 3,
            name: 'Highway',
            nameSlug: 'busstation',
            deviceName: 'emergency speaker',
            deviceType: 'walkietalkie',
            scenePrompt: 'Highway rest stop. A witness saw something...',
            devicePrompt: 'Emergency broadcast speaker with an encoded message.',
            clue: 'Witness saw van exit at the FACTORY',
            answer: 'FACTORY',
            acceptedAnswers: ['factory', 'the factory'],
            hotspots: [
              { id: 'booth', x: 20, y: 30, w: 25, h: 35, message: "Closed. No one around." },
              { id: 'sign', x: 60, y: 15, w: 25, h: 25, message: "Exit signs. One to the industrial district." },
              { id: 'device', x: 40, y: 20, w: 25, h: 18, isDevice: true }
            ]
          },
          {
            id: 4,
            name: 'Factory',
            nameSlug: 'docks',
            deviceName: 'PA system',
            deviceType: 'shipradio',
            scenePrompt: 'Abandoned factory. Echoes in the darkness...',
            devicePrompt: 'Industrial PA system still connected to power.',
            clue: 'Empty but note says check the BRIDGE',
            answer: 'BRIDGE',
            acceptedAnswers: ['bridge', 'the bridge'],
            hotspots: [
              { id: 'machinery', x: 10, y: 30, w: 35, h: 45, message: "Rusted machinery. Hasn't run in years." },
              { id: 'office', x: 60, y: 25, w: 25, h: 30, message: "Abandoned office. Dust everywhere." },
              { id: 'device', x: 65, y: 35, w: 25, h: 28, isDevice: true }
            ]
          },
          {
            id: 5,
            name: 'Bridge',
            nameSlug: 'lighthouse',
            deviceName: 'construction radio',
            deviceType: 'taperecorder',
            scenePrompt: 'Old bridge over the river. Wind howls...',
            devicePrompt: 'Construction radio left behind. Picking up signals!',
            clue: 'Another note points to the WAREHOUSE',
            answer: 'WAREHOUSE',
            acceptedAnswers: ['warehouse', 'the warehouse'],
            hotspots: [
              { id: 'railing', x: 5, y: 35, w: 20, h: 40, message: "Rusted railing. Don't lean too hard." },
              { id: 'pylons', x: 60, y: 40, w: 25, h: 35, message: "Bridge supports. Nothing here." },
              { id: 'device', x: 20, y: 45, w: 22, h: 22, isDevice: true }
            ]
          },
          {
            id: 6,
            name: 'Warehouse',
            nameSlug: 'beach',
            deviceName: 'portable keyboard',
            deviceType: 'radio',
            scenePrompt: 'The warehouse. You hear faint music below...',
            devicePrompt: 'The composer\'s portable keyboard! He left a message!',
            clue: 'You hear music from the BASEMENT',
            answer: 'BASEMENT',
            acceptedAnswers: ['basement', 'the basement'],
            hotspots: [
              { id: 'crates', x: 15, y: 40, w: 30, h: 35, message: "Stacked crates. Recently moved." },
              { id: 'stairs', x: 65, y: 50, w: 20, h: 30, message: "Stairs leading down. You hear music..." },
              { id: 'device', x: 45, y: 55, w: 30, h: 25, isDevice: true }
            ]
          },
        ],
        finalAnswer: 'BASEMENT',
        acceptedFinalAnswers: ['basement', 'the basement'],
        resolution: 'You rescued him! A rival composer had kidnapped him to steal his new symphony.',
      },
      arrested: {
        id: 'arrested',
        name: 'He Was Arrested',
        icon: '🚔',
        locations: [
          {
            id: 1,
            name: 'Studio',
            nameSlug: 'studio',
            deviceName: 'police scanner',
            deviceType: 'radio',
            scenePrompt: 'Police tape everywhere. What happened here?',
            devicePrompt: 'Police scanner left behind. Officers are talking!',
            clue: 'Police tape everywhere. Head to the STATION',
            answer: 'STATION',
            acceptedAnswers: ['station', 'the station', 'police station'],
            hotspots: [
              { id: 'tape', x: 5, y: 20, w: 20, h: 60, message: "Police tape. Crime scene." },
              { id: 'evidence', x: 40, y: 45, w: 25, h: 30, message: "Evidence markers. What happened?" },
              { id: 'device', x: 40, y: 40, w: 25, h: 22, isDevice: true }
            ]
          },
          {
            id: 2,
            name: 'Station',
            nameSlug: 'apartment',
            deviceName: 'intercom',
            deviceType: 'phone',
            scenePrompt: 'Busy police station. Find the records...',
            devicePrompt: 'Intercom system. Someone\'s broadcasting case info.',
            clue: 'Records say transferred to COUNTY JAIL',
            answer: 'COUNTY JAIL',
            acceptedAnswers: ['county jail', 'jail', 'the jail', 'countyjail'],
            hotspots: [
              { id: 'desk', x: 20, y: 40, w: 30, h: 35, message: "Busy desk sergeant. No time to talk." },
              { id: 'files', x: 60, y: 30, w: 25, h: 40, message: "Case files. Need authorization." },
              { id: 'device', x: 70, y: 25, w: 20, h: 18, isDevice: true }
            ]
          },
          {
            id: 3,
            name: 'County Jail',
            nameSlug: 'busstation',
            deviceName: 'terminal',
            deviceType: 'walkietalkie',
            scenePrompt: 'Cold concrete walls. The composer isn\'t here...',
            devicePrompt: 'Prison communication terminal. Lawyer left a message.',
            clue: 'Lawyer says check the COURTHOUSE',
            answer: 'COURTHOUSE',
            acceptedAnswers: ['courthouse', 'the courthouse', 'court house', 'court'],
            hotspots: [
              { id: 'cells', x: 10, y: 30, w: 30, h: 50, message: "Empty cells. He's been moved." },
              { id: 'guard', x: 70, y: 35, w: 20, h: 40, message: "Guard won't talk without authorization." },
              { id: 'device', x: 35, y: 50, w: 28, h: 25, isDevice: true }
            ]
          },
          {
            id: 4,
            name: 'Courthouse',
            nameSlug: 'docks',
            deviceName: 'stenographer keyboard',
            deviceType: 'shipradio',
            scenePrompt: 'Grand courthouse. Evidence room somewhere...',
            devicePrompt: 'Court stenographer\'s keyboard. Recorded testimony!',
            clue: 'Case file mentions the BANK',
            answer: 'BANK',
            acceptedAnswers: ['bank', 'the bank'],
            hotspots: [
              { id: 'bench', x: 30, y: 35, w: 35, h: 30, message: "Empty judge's bench. Court not in session." },
              { id: 'gallery', x: 10, y: 50, w: 25, h: 30, message: "Empty gallery seats." },
              { id: 'device', x: 55, y: 45, w: 25, h: 22, isDevice: true }
            ]
          },
          {
            id: 5,
            name: 'Bank',
            nameSlug: 'lighthouse',
            deviceName: 'security radio',
            deviceType: 'taperecorder',
            scenePrompt: 'The bank vault. Security footage...',
            devicePrompt: 'Security radio intercept. Someone\'s communicating!',
            clue: 'Security footage points to the HOTEL',
            answer: 'HOTEL',
            acceptedAnswers: ['hotel', 'the hotel'],
            hotspots: [
              { id: 'vault', x: 50, y: 30, w: 35, h: 45, message: "Massive vault door. Recently opened." },
              { id: 'cameras', x: 10, y: 20, w: 20, h: 25, message: "Security cameras. Recording everything." },
              { id: 'device', x: 25, y: 40, w: 22, h: 25, isDevice: true }
            ]
          },
          {
            id: 6,
            name: 'Hotel',
            nameSlug: 'beach',
            deviceName: 'walkman',
            deviceType: 'radio',
            scenePrompt: 'Fancy hotel lobby. The real culprit is here...',
            devicePrompt: 'Dropped walkman in the hall. Final clue!',
            clue: 'The real culprit is in ROOM 404',
            answer: 'ROOM 404',
            acceptedAnswers: ['room 404', '404', 'room404'],
            hotspots: [
              { id: 'lobby', x: 20, y: 35, w: 35, h: 40, message: "Luxurious lobby. Rich guests everywhere." },
              { id: 'elevator', x: 70, y: 30, w: 20, h: 45, message: "Elevator to the rooms. Need a key." },
              { id: 'device', x: 60, y: 60, w: 20, h: 20, isDevice: true }
            ]
          },
        ],
        finalAnswer: 'ROOM 404',
        acceptedFinalAnswers: ['room 404', '404', 'room404'],
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
    decoderFrame: `${basePath}/decoder-frame.png`,
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

// Get scene image for point-and-click adventure
// Path: /concepts/{conceptId}/scene-{locationId}-{locationSlug}.png
// All scenes are in the root vanishing-composer folder
export const getSceneImage = (conceptId, locationId, locationSlug) => {
  const basePath = `${ASSET_BASE_PATH}/${conceptId}`;
  return `${basePath}/scene-${locationId}-${locationSlug}.png`;
};

// Get device close-up image for point-and-click adventure
// Path: /concepts/{conceptId}/device-{sceneNumber}{letter}-{deviceId}.png
// Example: device-1a-radio.png, device-1b-microphone.png
export const getDeviceImage = (conceptId, sceneNumber, deviceLetter, deviceId) => {
  const basePath = `${ASSET_BASE_PATH}/${conceptId}`;
  return `${basePath}/device-${sceneNumber}${deviceLetter}-${deviceId}.png`;
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
