// Loop data configuration for Film Music Score project
// Loops are dynamically loaded from backend API in useLoopManager.jsx

// Category configuration with colors
export const categories = [
  { name: 'All', color: '#6b7280' },
  { name: 'Strings', color: '#10b981' },
  { name: 'Bass', color: '#14b8a6' },
  { name: 'Guitar', color: '#f59e0b' },
  { name: 'Percussion', color: '#ef4444' },
  { name: 'Piano', color: '#6366f1' },
  { name: 'Woodwinds', color: '#3b82f6' },
  { name: 'Synth', color: '#a855f7' },
  { name: 'Ambience', color: '#6b7280' }
];

// Video clips with dynamic duration detection
export const videoClips = [
  {
    id: 'school-mystery',
    title: 'School Mystery',
    videoPath: '/lessons/videos/film-music-loop-project/SchoolMystery.mp4',
    thumbnailTime: 10,
    duration: null, // Will be set dynamically
    description: 'A mysterious scene in a school hallway'
  }
];

// Cache for video durations
const videoDurationCache = {};

// Helper function to get video duration dynamically
export const getVideoDuration = async (videoPath) => {
  // Return cached duration if available
  if (videoDurationCache[videoPath]) {
    return videoDurationCache[videoPath];
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    const timeout = setTimeout(() => {
      video.src = '';
      reject(new Error('Video duration load timeout'));
    }, 5000);

    video.addEventListener('loadedmetadata', () => {
      clearTimeout(timeout);
      const duration = video.duration;
      videoDurationCache[videoPath] = duration;
      video.src = ''; // Clean up
      console.log(`Video duration detected: ${duration}s for ${videoPath}`);
      resolve(duration);
    });

    video.addEventListener('error', (e) => {
      clearTimeout(timeout);
      video.src = '';
      reject(new Error(`Failed to load video: ${e.message}`));
    });

    video.src = videoPath;
  });
};

// Get video by ID with dynamic duration
export const getVideoById = async (videoId) => {
  const video = videoClips.find(v => v.id === videoId);
  if (!video) return null;

  // If duration is already set, return immediately
  if (video.duration !== null) {
    return video;
  }

  // Otherwise, load the duration dynamically
  try {
    const duration = await getVideoDuration(video.videoPath);
    return {
      ...video,
      duration
    };
  } catch (error) {
    console.error(`Failed to get duration for ${videoId}:`, error);
    // Return with fallback duration of 30 seconds
    return {
      ...video,
      duration: 30
    };
  }
};

// Initialize all video durations (call this on app startup)
export const initializeVideoDurations = async () => {
  const promises = videoClips.map(async (video) => {
    try {
      const duration = await getVideoDuration(video.videoPath);
      video.duration = duration;
      console.log(`Initialized ${video.id}: ${duration}s`);
    } catch (error) {
      console.error(`Failed to initialize duration for ${video.id}:`, error);
      video.duration = 30; // Fallback
    }
  });

  await Promise.all(promises);
  console.log('All video durations initialized:', videoClips);
};

// Helper function to fetch loops from backend API
export const fetchLoops = async () => {
  try {
    const response = await fetch('/api/loops');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const loops = await response.json();
    
    // Enhance loops with category colors and additional metadata
    return loops.map(loop => ({
      ...loop,
      category: mapInstrumentToCategory(loop.instrument),
      color: getCategoryColor(loop.instrument),
      duration: 4, // Default, will be updated when audio loads
      volume: 1,
      tags: generateTags(loop)
    }));
  } catch (error) {
    console.error('Failed to fetch loops from API:', error);
    return [];
  }
};

// Map backend instrument types to frontend categories
const mapInstrumentToCategory = (instrument) => {
  const mapping = {
    'bass': 'Bass',
    'drums': 'Percussion',
    'guitar': 'Guitar',
    'piano': 'Piano',
    'strings': 'Strings',
    'synth': 'Synth',
    'bells': 'Percussion',
    'clarinet': 'Woodwinds'
  };
  return mapping[instrument] || 'Other';
};

// Get color for category
const getCategoryColor = (instrument) => {
  const category = mapInstrumentToCategory(instrument);
  const categoryObj = categories.find(c => c.name === category);
  return categoryObj?.color || '#6b7280';
};

// Generate tags from loop data
const generateTags = (loop) => {
  const tags = [];
  if (loop.mood) tags.push(loop.mood);
  if (loop.instrument) tags.push(loop.instrument);
  if (loop.name.toLowerCase().includes('upbeat')) tags.push('upbeat');
  if (loop.name.toLowerCase().includes('mysterious')) tags.push('mysterious');
  return tags;
};

// Get loops by category
export const getLoopsByCategory = (loops, category) => {
  if (category === 'All') return loops;
  return loops.filter(loop => loop.category === category);
};

// Rescan loops from filesystem
export const rescanLoops = async () => {
  try {
    const response = await fetch('/api/loops/rescan', { method: 'POST' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const loops = await response.json();
    return loops.map(loop => ({
      ...loop,
      category: mapInstrumentToCategory(loop.instrument),
      color: getCategoryColor(loop.instrument),
      duration: 4,
      volume: 1,
      tags: generateTags(loop)
    }));
  } catch (error) {
    console.error('Failed to rescan loops:', error);
    throw error;
  }
};