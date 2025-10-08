const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Path to your loops directory - adjust based on where backend is located
// If backend is at /backend and frontend is at /frontend, use:
const LOOPS_DIR = path.join(__dirname, '../../frontend/public/projects/film-music-score/loops');

// Supported audio file extensions
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

/**
 * Scan the loops directory and return all audio files
 */
async function scanLoopsDirectory() {
  try {
    console.log(`Scanning loops directory: ${LOOPS_DIR}`);
    
    // Check if directory exists
    try {
      await fs.access(LOOPS_DIR);
    } catch (err) {
      console.error(`❌ Loops directory not found: ${LOOPS_DIR}`);
      console.error('Error:', err.message);
      return [];
    }

    // Read all files in the directory
    const files = await fs.readdir(LOOPS_DIR);
    console.log(`Found ${files.length} total files in directory`);
    
    // Filter for audio files only
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return AUDIO_EXTENSIONS.includes(ext);
    });

    console.log(`✅ Found ${audioFiles.length} audio files:`);
    audioFiles.forEach(file => console.log(`  - ${file}`));
    
    return audioFiles;
  } catch (error) {
    console.error('❌ Error scanning loops directory:', error);
    return [];
  }
}

/**
 * Convert filename to loop object with metadata
 */
function createLoopObject(filename) {
  const extension = path.extname(filename).toLowerCase().substring(1);
  const nameWithoutExt = path.basename(filename, path.extname(filename)).trim();
  
  // Parse mood/category from filename
  const nameLower = nameWithoutExt.toLowerCase();
  let mood = 'neutral';
  if (nameLower.includes('sad')) mood = 'sad';
  else if (nameLower.includes('upbeat')) mood = 'upbeat';
  else if (nameLower.includes('calm')) mood = 'calm';
  else if (nameLower.includes('anxious')) mood = 'anxious';
  else if (nameLower.includes('peaceful')) mood = 'peaceful';
  else if (nameLower.includes('mystery')) mood = 'mystery';

  // Parse instrument type
  let instrument = 'other';
  if (nameLower.includes('bass')) instrument = 'bass';
  else if (nameLower.includes('drum')) instrument = 'drums';
  else if (nameLower.includes('guitar')) instrument = 'guitar';
  else if (nameLower.includes('piano') || nameLower.includes('keys')) instrument = 'piano';
  else if (nameLower.includes('string')) instrument = 'strings';
  else if (nameLower.includes('synth')) instrument = 'synth';
  else if (nameLower.includes('bell')) instrument = 'bells';
  else if (nameLower.includes('clarinet')) instrument = 'clarinet';

  return {
    id: nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    name: nameWithoutExt,
    file: `/projects/film-music-score/loops/${filename}`,
    extension: extension,
    filename: filename,
    mood: mood,
    instrument: instrument
  };
}

// GET /api/loops - Get all available loops
router.get('/', async (req, res) => {
  try {
    const files = await scanLoopsDirectory();
    const loops = files.map(createLoopObject);
    
    console.log(`\n📦 Returning ${loops.length} loops to client`);
    
    res.json(loops);
  } catch (error) {
    console.error('❌ Error returning loops:', error);
    res.status(500).json({ 
      error: 'Failed to get loops', 
      details: error.message,
      loopsDir: LOOPS_DIR
    });
  }
});

// POST /api/loops/rescan
router.post('/rescan', async (req, res) => {
  try {
    console.log('\n🔄 Rescan requested');
    const files = await scanLoopsDirectory();
    const loops = files.map(createLoopObject);
    
    console.log(`✅ Rescan complete: ${loops.length} loops`);
    
    res.json(loops);
  } catch (error) {
    console.error('❌ Error in rescan:', error);
    res.status(500).json({ 
      error: 'Failed to rescan loops', 
      details: error.message 
    });
  }
});

// GET /api/loops/by-mood/:mood
router.get('/by-mood/:mood', async (req, res) => {
  try {
    const files = await scanLoopsDirectory();
    const loops = files.map(createLoopObject);
    const filtered = loops.filter(l => l.mood === req.params.mood.toLowerCase());
    
    res.json(filtered);
  } catch (error) {
    console.error('❌ Error filtering loops by mood:', error);
    res.status(500).json({ 
      error: 'Failed to filter loops', 
      details: error.message 
    });
  }
});

// GET /api/loops/by-instrument/:instrument
router.get('/by-instrument/:instrument', async (req, res) => {
  try {
    const files = await scanLoopsDirectory();
    const loops = files.map(createLoopObject);
    const filtered = loops.filter(l => l.instrument === req.params.instrument.toLowerCase());
    
    res.json(filtered);
  } catch (error) {
    console.error('❌ Error filtering loops by instrument:', error);
    res.status(500).json({ 
      error: 'Failed to filter loops', 
      details: error.message 
    });
  }
});

// GET /api/loops/:id - Get specific loop by ID
router.get('/:id', async (req, res) => {
  try {
    const files = await scanLoopsDirectory();
    const loops = files.map(createLoopObject);
    const loop = loops.find(l => l.id === req.params.id);
    
    if (!loop) {
      return res.status(404).json({ 
        error: 'Loop not found',
        requestedId: req.params.id,
        available: loops.map(l => l.id)
      });
    }
    
    res.json(loop);
  } catch (error) {
    console.error('❌ Error getting loop:', error);
    res.status(500).json({ 
      error: 'Failed to get loop', 
      details: error.message 
    });
  }
});

module.exports = router;