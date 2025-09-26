const express = require('express');
const router = express.Router();

// Current loops - includes all your existing and new loop files
let CURRENT_LOOPS = [
  'AnxiousPiano.mp3',
  'CalmGuitar1 .mp3',
  'CalmGuitar1.Drums .mp3',
  'CalmPiano1.mp3',
  'CalmPiano2 .mp3',
  'CalmPiano2Soft .mp3',
  'UpbeatGuitar.Drums.mp3',
  'Upbeat Clarinet.wav',
  'Upbeat Acoustic Guitar.wav',
  'Upbeat Bells.wav',
  'Upbeat Drums 1.wav',
  'Upbeat Drums 2.wav',
  'Upbeat Electric Bass.wav',
  'Upbeat Electric Guitar.wav',
  'Upbeat Piano.wav',
  'Upbeat String Bass.wav',
  'Upbeat Strings.wav'
];

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

// GET /api/loops - Get all available loops
router.get('/', async (req, res) => {
  try {
    const loops = CURRENT_LOOPS.map(createLoopObject);
    console.log(`Returning ${loops.length} loops`);
    
    res.json(loops);
  } catch (error) {
    console.error('Error returning loops:', error);
    res.status(500).json({ 
      error: 'Failed to get loops', 
      details: error.message 
    });
  }
});

// POST /api/loops/rescan - Return current loops
router.post('/rescan', async (req, res) => {
  try {
    console.log('Rescan requested');
    const loops = CURRENT_LOOPS.map(createLoopObject);
    
    res.json(loops);
  } catch (error) {
    console.error('Error in rescan:', error);
    res.status(500).json({ 
      error: 'Failed to rescan loops', 
      details: error.message 
    });
  }
});

// GET /api/loops/:id - Get specific loop by ID
router.get('/:id', async (req, res) => {
  try {
    const loops = CURRENT_LOOPS.map(createLoopObject);
    const loop = loops.find(l => l.id === req.params.id);
    
    if (!loop) {
      return res.status(404).json({ 
        error: 'Loop not found',
        available: loops.map(l => l.id)
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