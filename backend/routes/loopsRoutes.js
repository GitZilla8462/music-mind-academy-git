const express = require('express');
const axios = require('axios');
const router = express.Router();

// Function to automatically detect loops from frontend
async function detectAvailableLoops() {
  try {
    // Get the base URL for your frontend
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.musicmindacademy.com'
      : 'http://localhost:5173';
    
    // Known audio extensions
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    
    // Since we can't list directory contents via HTTP, we'll try to access known files
    // and also provide a way to register new ones
    const potentialLoops = [
      'AnxiousPiano.mp3',
      'CalmGuitar1 .mp3',
      'CalmGuitar1.Drums .mp3',
      'CalmPiano1.mp3', 
      'CalmPiano2 .mp3',
      'CalmPiano2Soft .mp3',
      'UpbeatGuitar.Drums.mp3',
      'Upbeat Clarinet.wav'
    ];
    
    const availableLoops = [];
    
    // Check each potential loop file
    for (const filename of potentialLoops) {
      try {
        const response = await axios.head(`${frontendUrl}/projects/film-music-score/loops/${encodeURIComponent(filename)}`, {
          timeout: 2000
        });
        
        if (response.status === 200) {
          availableLoops.push(filename);
        }
      } catch (error) {
        // File doesn't exist or is inaccessible, skip it
        console.log(`Loop file not accessible: ${filename}`);
      }
    }
    
    return availableLoops;
  } catch (error) {
    console.error('Error detecting loops:', error);
    // Fall back to hardcoded list if detection fails
    return [
      'AnxiousPiano.mp3',
      'CalmGuitar1 .mp3', 
      'CalmGuitar1.Drums .mp3',
      'CalmPiano1.mp3',
      'CalmPiano2 .mp3',
      'CalmPiano2Soft .mp3',
      'UpbeatGuitar.Drums.mp3',
      'Upbeat Clarinet.wav'
    ];
  }
}

// Function to convert filename to loop object (supports multiple formats)
function createLoopObject(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '').trim();
  
  return {
    id: nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    name: nameWithoutExt,
    file: `/projects/film-music-score/loops/${filename}`,
    extension: extension,
    filename: filename
  };
}

// Cache for loops (refreshed every 5 minutes or on demand)
let loopsCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// GET /api/loops - Get all available loops automatically detected
router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    
    // Use cache if it's fresh, otherwise refresh
    if (!loopsCache || (now - lastCacheUpdate) > CACHE_DURATION) {
      console.log('Detecting available loops...');
      const detectedFiles = await detectAvailableLoops();
      loopsCache = detectedFiles.map(createLoopObject);
      lastCacheUpdate = now;
      console.log(`Detected ${loopsCache.length} loops`);
    }
    
    res.json(loopsCache);
  } catch (error) {
    console.error('Error returning loops:', error);
    res.status(500).json({ 
      error: 'Failed to get loops', 
      details: error.message 
    });
  }
});

// POST /api/loops/rescan - Force refresh of loops detection
router.post('/rescan', async (req, res) => {
  try {
    console.log('Force rescanning loops...');
    const detectedFiles = await detectAvailableLoops();
    loopsCache = detectedFiles.map(createLoopObject);
    lastCacheUpdate = Date.now();
    
    console.log(`Rescan complete: found ${loopsCache.length} loops`);
    res.json(loopsCache);
  } catch (error) {
    console.error('Error in rescan:', error);
    res.status(500).json({ 
      error: 'Failed to rescan loops', 
      details: error.message 
    });
  }
});

// POST /api/loops/register - Register new loop files (for when you add them)
router.post('/register', async (req, res) => {
  try {
    const { filenames } = req.body;
    
    if (!Array.isArray(filenames)) {
      return res.status(400).json({ error: 'filenames must be an array' });
    }
    
    // Force a rescan to pick up new files
    const detectedFiles = await detectAvailableLoops();
    loopsCache = detectedFiles.map(createLoopObject);
    lastCacheUpdate = Date.now();
    
    res.json({
      message: 'Loop registration completed',
      count: loopsCache.length,
      loops: loopsCache
    });
  } catch (error) {
    console.error('Error registering loops:', error);
    res.status(500).json({ 
      error: 'Failed to register loops', 
      details: error.message 
    });
  }
});

// GET /api/loops/:id - Get specific loop by ID
router.get('/:id', async (req, res) => {
  try {
    // Ensure we have fresh loop data
    if (!loopsCache) {
      const detectedFiles = await detectAvailableLoops();
      loopsCache = detectedFiles.map(createLoopObject);
      lastCacheUpdate = Date.now();
    }
    
    const loop = loopsCache.find(l => l.id === req.params.id);
    
    if (!loop) {
      return res.status(404).json({ 
        error: 'Loop not found',
        available: loopsCache.map(l => l.id)
      });
    }
    
    res.json(loop);
  } catch (error) {
    console.error('Error getting loop:', error);
    res.status(500).json({ 
      error: 'Failed to get loop', 
      details: error.message 
    });
  }
});

module.exports = router;