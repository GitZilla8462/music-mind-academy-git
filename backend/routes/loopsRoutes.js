const express = require('express');
const router = express.Router();

// Maintain your current loops - update this array when you add new loops
let CURRENT_LOOPS = [
  'AnxiousPiano.mp3',
  'CalmGuitar1 .mp3',
  'CalmGuitar1.Drums .mp3', 
  'CalmPiano1.mp3',
  'CalmPiano2 .mp3',
  'CalmPiano2Soft .mp3',
  'UpbeatGuitar.Drums.mp3'
];

// Function to convert filename to loop object
function createLoopObject(filename) {
  const nameWithoutExt = filename.replace(/\.mp3$/, '').trim();
  return {
    id: nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    name: nameWithoutExt,
    file: `/projects/film-music-score/loops/${filename}`,
    extension: 'mp3',
    filename: filename
  };
}

// GET /api/loops - Get all available loops (returns array directly)
router.get('/', async (req, res) => {
  try {
    const loops = CURRENT_LOOPS.map(createLoopObject);
    console.log(`Returning ${loops.length} loops`);
    
    // Return array directly for frontend compatibility
    res.json(loops);
  } catch (error) {
    console.error('Error returning loops:', error);
    res.status(500).json({ 
      error: 'Failed to get loops', 
      details: error.message 
    });
  }
});

// POST /api/loops/rescan - Return current loops (returns array directly)
router.post('/rescan', async (req, res) => {
  try {
    console.log('Rescan requested');
    const loops = CURRENT_LOOPS.map(createLoopObject);
    
    // Return array directly for frontend compatibility
    res.json(loops);
  } catch (error) {
    console.error('Error in rescan:', error);
    res.status(500).json({ 
      error: 'Failed to rescan loops', 
      details: error.message 
    });
  }
});

// POST /api/loops/update - Update the loops list (for when you add new files)
router.post('/update', async (req, res) => {
  try {
    const { loops } = req.body;
    
    if (!Array.isArray(loops)) {
      return res.status(400).json({ error: 'loops must be an array of filenames' });
    }
    
    CURRENT_LOOPS = loops.filter(filename => filename.endsWith('.mp3'));
    
    console.log(`Updated loops list with ${CURRENT_LOOPS.length} files`);
    
    const loopObjects = CURRENT_LOOPS.map(createLoopObject);
    
    res.json({
      message: 'Loops list updated successfully',
      count: CURRENT_LOOPS.length,
      loops: loopObjects
    });
  } catch (error) {
    console.error('Error updating loops:', error);
    res.status(500).json({ 
      error: 'Failed to update loops', 
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