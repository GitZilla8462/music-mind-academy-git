// filmLibraryData.js
// Film metadata for the Film Music DAW film selection
// Films organized by mood/genre for student selection
// Using existing Loop Lab videos for testing

export const FILM_MOODS = [
  { id: 'all', name: 'All Films', color: '#6B7280' },
  { id: 'adventure', name: 'Adventure', color: '#EF4444' },
  { id: 'drama', name: 'Drama', color: '#8B5CF6' },
  { id: 'nature', name: 'Nature', color: '#10B981' },
  { id: 'comedy', name: 'Comedy', color: '#F59E0B' },
  { id: 'mystery', name: 'Mystery', color: '#3B82F6' },
];

export const films = [
  {
    id: 'school-beneath',
    title: 'The School Beneath',
    mood: 'mystery',
    description: 'Strange things lurk beneath an ordinary school. What secrets do the hallways hold?',
    videoPath: '/lessons/videos/film-music-loop-project/SchoolMystery.mp4',
    thumbnailPath: '/lessons/videos/film-music-loop-project/SchoolMystery-thumb.jpg',
    duration: 120,
  },
  {
    id: 'basketball',
    title: 'Basketball Highlights',
    mood: 'adventure',
    description: 'High-flying dunks, clutch shots, and fast breaks. Score the action!',
    videoPath: '/lessons/film-music-project/lesson4/BasketballHighlightReel.mp4',
    thumbnailPath: '/lessons/film-music-project/lesson2/basketball-thumb.jpg',
    duration: 90,
  },
  {
    id: 'skateboarding',
    title: 'Skateboarding Tricks',
    mood: 'adventure',
    description: 'Kickflips, grinds, and big air. What does this skater sound like?',
    videoPath: '/lessons/film-music-project/lesson4/SkateboardHighlighReel.mp4',
    thumbnailPath: '/lessons/film-music-project/lesson2/skateboard-thumb.jpg',
    duration: 90,
  },
  {
    id: 'football',
    title: 'Football Action',
    mood: 'drama',
    description: 'Tackles, goals, and celebration. Create the soundtrack to the beautiful game.',
    videoPath: '/lessons/film-music-project/lesson4/SoccerHighlightReel.mp4',
    thumbnailPath: '/lessons/film-music-project/lesson2/football-thumb.jpg',
    duration: 90,
  },
];

export const getFilmsByMood = (mood) => {
  if (mood === 'all') return films;
  return films.filter(f => f.mood === mood);
};

export const getFilmById = (id) => {
  return films.find(f => f.id === id);
};

export const getAvailableFilms = () => {
  return films.filter(f => !f.placeholder);
};
