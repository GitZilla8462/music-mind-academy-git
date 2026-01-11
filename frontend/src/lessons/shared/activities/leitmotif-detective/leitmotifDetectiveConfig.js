// File: /src/lessons/shared/activities/leitmotif-detective/leitmotifDetectiveConfig.js
// Configuration for Leitmotif Detective game

// Character types for the game
export const CHARACTER_TYPES = [
  {
    id: 'hero',
    name: 'Hero',
    description: 'Brave, powerful, triumphant',
    color: '#EF4444', // red
    characteristics: 'Rising melody, major key, brass/strings'
  },
  {
    id: 'villain',
    name: 'Villain',
    description: 'Dark, menacing, dangerous',
    color: '#7C3AED', // purple
    characteristics: 'Low register, minor key, dissonance'
  },
  {
    id: 'love-interest',
    name: 'Love Interest',
    description: 'Romantic, tender, emotional',
    color: '#EC4899', // pink
    characteristics: 'Lyrical melody, soft dynamics, strings'
  },
  {
    id: 'comic-relief',
    name: 'Comic Relief',
    description: 'Playful, silly, lighthearted',
    color: '#F59E0B', // amber
    characteristics: 'Quirky rhythm, staccato, woodwinds'
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    description: 'Unknown, intriguing, enigmatic',
    color: '#3B82F6', // blue
    characteristics: 'Ambiguous harmony, sparse, atmospheric'
  },
  {
    id: 'innocent',
    name: 'Innocent',
    description: 'Pure, childlike, gentle',
    color: '#10B981', // green
    characteristics: 'Simple melody, high register, music box/celesta'
  }
];

// Themes for the detective game
// Each theme should be a short audio clip (8-15 seconds)
// For now, we'll use placeholder paths - these will need actual audio files
export const DETECTIVE_THEMES = [
  {
    id: 'theme-1',
    name: 'Theme 1',
    file: '/lessons/film-music/lesson1/audio/theme-hero.mp3',
    correctType: 'hero',
    explanation: 'This is a HERO theme! Notice the rising melody that sounds triumphant and powerful.',
    musicalClues: 'Rising contour, major key, brass fanfare sound'
  },
  {
    id: 'theme-2',
    name: 'Theme 2',
    file: '/lessons/film-music/lesson1/audio/theme-villain.mp3',
    correctType: 'villain',
    explanation: 'This is a VILLAIN theme! The low, dark sounds and dissonant notes create a menacing feel.',
    musicalClues: 'Low register, minor key, dissonant intervals'
  },
  {
    id: 'theme-3',
    name: 'Theme 3',
    file: '/lessons/film-music/lesson1/audio/theme-love.mp3',
    correctType: 'love-interest',
    explanation: 'This is a LOVE INTEREST theme! The gentle, lyrical melody expresses tender emotions.',
    musicalClues: 'Smooth legato, strings, expressive dynamics'
  },
  {
    id: 'theme-4',
    name: 'Theme 4',
    file: '/lessons/film-music/lesson1/audio/theme-comic.mp3',
    correctType: 'comic-relief',
    explanation: 'This is a COMIC RELIEF theme! The playful, quirky rhythm makes us smile.',
    musicalClues: 'Bouncy staccato, unexpected notes, woodwind sounds'
  },
  {
    id: 'theme-5',
    name: 'Theme 5',
    file: '/lessons/film-music/lesson1/audio/theme-mysterious.mp3',
    correctType: 'mysterious',
    explanation: 'This is a MYSTERIOUS theme! The ambiguous harmonies keep us guessing.',
    musicalClues: 'Sparse texture, atmospheric sounds, unresolved harmony'
  },
  {
    id: 'theme-6',
    name: 'Theme 6',
    file: '/lessons/film-music/lesson1/audio/theme-innocent.mp3',
    correctType: 'innocent',
    explanation: 'This is an INNOCENT theme! The simple, high melody sounds pure and childlike.',
    musicalClues: 'High register, simple melody, music box or celesta sound'
  },
  {
    id: 'theme-7',
    name: 'Theme 7',
    file: '/lessons/film-music/lesson1/audio/theme-hero-2.mp3',
    correctType: 'hero',
    explanation: 'Another HERO theme! This one builds with powerful brass and drums.',
    musicalClues: 'Bold brass, strong rhythm, ascending phrases'
  },
  {
    id: 'theme-8',
    name: 'Theme 8',
    file: '/lessons/film-music/lesson1/audio/theme-villain-2.mp3',
    correctType: 'villain',
    explanation: 'Another VILLAIN theme! The ominous bass and tension create fear.',
    musicalClues: 'Deep bass notes, building tension, dark timbre'
  }
];
