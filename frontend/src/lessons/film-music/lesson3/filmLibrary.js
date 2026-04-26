// Film library for Film Music Lesson 3-5 final project
// All films must be CC-BY licensed (allows commercial use, modification, redistribution with attribution)
// Videos hosted on R2 with audio stripped for student scoring

export const FILM_LIBRARY = [
  {
    id: 'wing-it',
    title: 'Wing It!',
    description: 'An uptight engineer gets an unwelcome visit from an enthusiastic wannabe-pilot, launching them both into an out-of-control space shuttle.',
    background: 'Made by Blender Studio in 2023. This 3D animated film combines comedy with action as two very different personalities are forced to work together in a life-or-death situation.',
    duration: 177, // 2:57
    thumbnail: 'https://media.musicmindacademy.com/videos/film-scoring/wing-it-thumb.jpg',
    videoUrl: 'https://media.musicmindacademy.com/videos/film-scoring/wing-it-silent.mp4',
    attribution: '(CC) Blender Foundation | studio.blender.org',
    license: 'CC-BY 4.0',
    characters: ['Engineer', 'Pilot'],
    moods: ['Calm', 'Chaotic', 'Funny', 'Tense'],
    tags: ['3D Animation', 'Comedy', 'Action', 'Sci-Fi'],
  },
  {
    id: 'caminandes-llamigos',
    title: 'Caminandes: Llamigos',
    description: 'It\'s winter in Patagonia and food is scarce. Koro the Llama battles Oti the pesky penguin in an epic fight over the last tasty berry.',
    background: 'Made by Blender Studio in 2016. Part of the Caminandes series set in the mountains of South America. This episode is a classic cartoon rivalry — two characters, one prize, lots of chaos.',
    duration: 150, // ~2:30
    thumbnail: 'https://media.musicmindacademy.com/videos/film-scoring/caminandes-llamigos-thumb.jpg',
    videoUrl: 'https://media.musicmindacademy.com/videos/film-scoring/caminandes-llamigos.mp4',
    attribution: '(CC) Blender Foundation | studio.blender.org',
    license: 'CC-BY 3.0',
    characters: ['Koro the Llama', 'Oti the Penguin'],
    moods: ['Funny', 'Tense', 'Epic', 'Sneaky'],
    tags: ['3D Animation', 'Comedy', 'Animals', 'Rivalry'],
  },
  {
    id: 'afternoon-class',
    title: 'Afternoon Class',
    description: 'A student desperately tries to stay awake during an afternoon class. The battle between sleep and consciousness gets increasingly surreal.',
    background: 'Award-winning 2D animated graduation film by Korean animator Seoro Oh (2014). Won multiple international animation festival awards including at Annecy and Stuttgart. Inspired by real experiences of fighting sleep in class.',
    duration: 230, // ~3:50
    thumbnail: 'https://media.musicmindacademy.com/videos/film-scoring/afternoon-class-thumb.jpg',
    videoUrl: 'https://media.musicmindacademy.com/videos/film-scoring/afternoon-class.mp4',
    attribution: '(CC) Seoro Oh',
    license: 'CC-BY',
    characters: ['Student', 'Teacher'],
    moods: ['Funny', 'Peaceful', 'Tense', 'Mysterious'],
    tags: ['2D Animation', 'Comedy', 'School', 'Surreal'],
  },
  {
    id: 'steamboat-willie',
    title: 'Steamboat Willie',
    description: 'Mickey Mouse whistles and makes music on a steamboat, turning everything around him into an instrument — including the animals.',
    background: 'The 1928 Disney cartoon that introduced Mickey Mouse to the world. One of the first cartoons with synchronized sound. Now in the public domain as of 2024. A piece of animation history.',
    duration: 180, // trimmed to ~3:00
    thumbnail: 'https://media.musicmindacademy.com/videos/film-scoring/steamboat-willie-thumb.jpg',
    videoUrl: 'https://media.musicmindacademy.com/videos/film-scoring/steamboat-willie.mp4',
    attribution: 'Public Domain (1928)',
    license: 'Public Domain',
    characters: ['Mickey Mouse', 'Minnie Mouse', 'Pete'],
    moods: ['Funny', 'Peaceful', 'Sneaky', 'Triumphant'],
    tags: ['Classic', 'Black & White', '1928', 'Comedy'],
  },
  {
    id: 'felix-sure-locked-homes',
    title: 'Felix the Cat: Sure-Locked Homes',
    description: 'Felix the Cat investigates mysterious things that go bump in the night in this spooky silent cartoon adventure.',
    background: 'A 1928 Felix the Cat cartoon by Pat Sullivan and Otto Messmer. Felix was one of the biggest cartoon stars of the silent film era — before Mickey Mouse existed. Public domain from the Internet Archive.',
    duration: 180, // trimmed to ~3:00
    thumbnail: 'https://media.musicmindacademy.com/videos/film-scoring/felix-sure-locked-homes-thumb.jpg',
    videoUrl: 'https://media.musicmindacademy.com/videos/film-scoring/felix-sure-locked-homes.mp4',
    attribution: 'Public Domain (1928)',
    license: 'Public Domain',
    characters: ['Felix the Cat'],
    moods: ['Scary', 'Mysterious', 'Funny', 'Sneaky'],
    tags: ['Classic', 'Black & White', '1928', 'Mystery'],
  },
];

// Mood options for scene planning
export const MOOD_OPTIONS = [
  { id: 'epic', label: 'Epic', color: '#EF4444', emoji: '⚔️' },
  { id: 'scary', label: 'Scary', color: '#7C2D12', emoji: '😱' },
  { id: 'mysterious', label: 'Mysterious', color: '#8B5CF6', emoji: '🔮' },
  { id: 'peaceful', label: 'Peaceful', color: '#10B981', emoji: '🌿' },
  { id: 'funny', label: 'Funny', color: '#F59E0B', emoji: '😂' },
  { id: 'tense', label: 'Tense', color: '#DC2626', emoji: '😰' },
  { id: 'sad', label: 'Sad', color: '#3B82F6', emoji: '😢' },
  { id: 'triumphant', label: 'Triumphant', color: '#F97316', emoji: '🏆' },
];

// Character type options (same as Lessons 1-2)
export const CHARACTER_TYPES = [
  { id: 'hero', label: 'Hero', emoji: '🦸' },
  { id: 'villain', label: 'Villain', emoji: '🦹' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
  { id: 'sneaky', label: 'Sneaky', emoji: '🕵️' },
  { id: 'funny', label: 'Funny', emoji: '🤡' },
  { id: 'other', label: 'Other', emoji: '✏️' },
];

// Instrument options (matches DAW instrument selector)
export const INSTRUMENT_OPTIONS = [
  { id: 'flute', label: 'Flute' },
  { id: 'clarinet', label: 'Clarinet' },
  { id: 'trumpet', label: 'Trumpet' },
  { id: 'brass', label: 'Low Brass' },
  { id: 'violin', label: 'Violin' },
  { id: 'cello', label: 'Cello' },
  { id: 'piano', label: 'Piano' },
  { id: 'synthPad', label: 'Synth Pad' },
  { id: 'bass', label: 'Bass' },
];

// Scene segment colors (cycle through for timeline visualization)
export const SCENE_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#10B981', '#EF4444', '#06B6D4', '#F97316',
];
