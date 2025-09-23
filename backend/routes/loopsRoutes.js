const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// GET /api/loops - Get all loops from the filesystem
router.get('/', async (req, res) => {
  try {
    // Path to your loops folder - adjust this path based on your actual structure
    const loopsDir = path.join(__dirname, '../../vite-project/public/projects/film-music-score/loops');
    
    console.log('Scanning loops directory:', loopsDir);
    
    const files = await fs.readdir(loopsDir);
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
    
    const loops = [];
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (audioExtensions.includes(ext)) {
        const filePath = path.join(loopsDir, file);
        const stats = await fs.stat(filePath);
        
        loops.push({
          id: path.parse(file).name.toLowerCase().replace(/\s+/g, '-'),
          name: path.parse(file).name,
          file: `/projects/film-music-score/loops/${file}`,
          extension: ext.substring(1),
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
    }
    
    // Sort by name
    loops.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Found ${loops.length} audio loops`);
    res.json(loops);
  } catch (error) {
    console.error('Error reading loops directory:', error);
    res.status(500).json({ 
      error: 'Failed to read loops directory', 
      details: error.message 
    });
  }
});

// POST /api/loops/rescan - Force rescan of loops directory
router.post('/rescan', async (req, res) => {
  try {
    // This endpoint can be called to force a rescan
    // For now, it just returns the same as GET /
    const loopsDir = path.join(__dirname, '../../vite-project/public/projects/film-music-score/loops');
    
    const files = await fs.readdir(loopsDir);
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
    
    const loops = [];
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (audioExtensions.includes(ext)) {
        const filePath = path.join(loopsDir, file);
        const stats = await fs.stat(filePath);
        
        loops.push({
          id: path.parse(file).name.toLowerCase().replace(/\s+/g, '-'),
          name: path.parse(file).name,
          file: `/projects/film-music-score/loops/${file}`,
          extension: ext.substring(1),
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
    }
    
    loops.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({ 
      message: 'Rescan completed', 
      count: loops.length, 
      loops 
    });
  } catch (error) {
    console.error('Error rescanning loops directory:', error);
    res.status(500).json({ 
      error: 'Failed to rescan loops directory', 
      details: error.message 
    });
  }
});

module.exports = router;