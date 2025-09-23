// Loop data configuration for Film Music Score project
// Based on files in /public/projects/film-music-score/loops/

// Loop data configuration for Film Music Score project
// Based on files in /public/projects/film-music-score/loops/

export const audioLoops = [
  {
    id: 'academy-all',
    name: 'Academy All',
    file: '/projects/film-music-score/loops/AcademyAll.mp3',
    duration: 4,
    category: 'Orchestral',
    color: '#8b5cf6',
    tags: ['cinematic', 'dramatic', 'full'],
    tempo: 120
  },
  {
    id: 'accented-beat',
    name: 'Accented Beat',
    file: '/projects/film-music-score/loops/Accented Beat.mp3',
    duration: 2,
    category: 'Percussion',
    color: '#ef4444',
    tags: ['rhythm', 'accent', 'beat'],
    tempo: 120
  },
  {
    id: 'acoustic-layers-beat-02',
    name: 'Acoustic Layers Beat 02',
    file: '/projects/film-music-score/loops/Accoutic Layers Beat 02 .mp3',
    duration: 4,
    category: 'Percussion',
    color: '#ef4444',
    tags: ['acoustic', 'layered', 'rhythm'],
    tempo: 120
  }
];

export const categories = [
  { name: 'All', color: '#6b7280' },
  { name: 'Orchestral', color: '#8b5cf6' },
  { name: 'Percussion', color: '#ef4444' },
  { name: 'Strings', color: '#10b981' },
  { name: 'Brass', color: '#f59e0b' },
  { name: 'Woodwinds', color: '#3b82f6' },
  { name: 'Piano', color: '#6366f1' }
];

export const videoClips = [
  {
    id: 'mystery',
    title: 'Mystery Scene',
    videoPath: '/projects/film-music-score/film-clips/mystery.mp4',
    thumbnailTime: 10,
    duration: 60
  },
  {
    id: 'comedy',
    title: 'Comedy Scene',
    videoPath: '/projects/film-music-score/film-clips/comedy.mp4',
    thumbnailTime: 5,
    duration: 45
  },
  {
    id: 'peaceful',
    title: 'Peaceful Scene',
    videoPath: '/projects/film-music-score/film-clips/peaceful.mp4',
    thumbnailTime: 8,
    duration: 50
  }
];

export const getLoopsByCategory = (category) => {
  if (category === 'All') return audioLoops;
  return audioLoops.filter(loop => loop.category === category);
};

export const getVideoById = (videoId) => {
  return videoClips.find(video => video.id === videoId);
};