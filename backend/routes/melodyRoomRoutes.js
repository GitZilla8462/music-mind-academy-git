const express = require('express');
const router = express.Router();
const MelodyRoom = require('../models/MelodyRoom');

// Generate a 4-character alphanumeric room code
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Create a new melody room
router.post('/', async (req, res) => {
  try {
    const { mode, concept, ending, melodies, status, creatorIndex, code: providedCode } = req.body;

    // Use provided code or generate unique code
    let code = providedCode;
    if (!code) {
      let attempts = 0;
      do {
        code = generateCode();
        const existing = await MelodyRoom.findOne({ code });
        if (!existing) break;
        attempts++;
      } while (attempts < 10);

      if (attempts >= 10) {
        return res.status(500).json({ error: 'Could not generate unique code' });
      }
    }

    const room = new MelodyRoom({
      code,
      mode: mode || 'solo',
      concept: concept || 'vanishing-composer',
      ending: ending || null,
      melodies: melodies || {},
      status: status || 'creating',
      creatorIndex: creatorIndex || 0,
      readyPlayers: [],
      activeScenes: {}
    });

    await room.save();
    console.log(`🎵 Melody Room created: ${code}`);
    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating melody room:', error);
    res.status(500).json({ error: 'Failed to create melody room' });
  }
});

// Get melody room by code
router.get('/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = await MelodyRoom.findOne({ code });

    if (!room) {
      return res.status(404).json({ error: 'Melody room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error fetching melody room:', error);
    res.status(500).json({ error: 'Failed to fetch melody room' });
  }
});

// Update melody room (general update)
router.put('/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const updates = req.body;

    const room = await MelodyRoom.findOneAndUpdate(
      { code },
      { $set: updates },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ error: 'Melody room not found' });
    }

    console.log(`🎵 Melody Room updated: ${code}`);
    res.json(room);
  } catch (error) {
    console.error('Error updating melody room:', error);
    res.status(500).json({ error: 'Failed to update melody room' });
  }
});

// Save a single scene's melody
router.patch('/:code/melody/:sceneIndex', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const sceneIndex = parseInt(req.params.sceneIndex);
    const { grid, device, playerIndex } = req.body;

    const room = await MelodyRoom.findOne({ code });
    if (!room) {
      return res.status(404).json({ error: 'Melody room not found' });
    }

    // Update the specific melody
    room.melodies = room.melodies || {};
    room.melodies[sceneIndex] = {
      grid,
      device,
      createdBy: playerIndex,
      completedAt: new Date()
    };

    // Clear active scene for this player since they saved
    if (room.activeScenes && room.activeScenes[playerIndex] === sceneIndex) {
      room.activeScenes[playerIndex] = null;
    }

    // Mark as modified for Mongoose mixed type
    room.markModified('melodies');
    room.markModified('activeScenes');
    await room.save();

    console.log(`🎵 Scene ${sceneIndex} melody saved in room ${code} by player ${playerIndex}`);
    res.json(room);
  } catch (error) {
    console.error('Error saving melody:', error);
    res.status(500).json({ error: 'Failed to save melody' });
  }
});

// Mark which scene a player is editing (for live status)
router.patch('/:code/active-scene', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { playerIndex, sceneIndex } = req.body; // sceneIndex = null if not editing

    const room = await MelodyRoom.findOne({ code });
    if (!room) {
      return res.status(404).json({ error: 'Melody room not found' });
    }

    room.activeScenes = room.activeScenes || {};
    room.activeScenes[playerIndex] = sceneIndex;

    room.markModified('activeScenes');
    await room.save();

    res.json(room);
  } catch (error) {
    console.error('Error updating active scene:', error);
    res.status(500).json({ error: 'Failed to update active scene' });
  }
});

// Mark player as ready
router.patch('/:code/ready', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { playerIndex } = req.body;

    const room = await MelodyRoom.findOne({ code });
    if (!room) {
      return res.status(404).json({ error: 'Melody room not found' });
    }

    room.readyPlayers = room.readyPlayers || [];
    if (!room.readyPlayers.includes(playerIndex)) {
      room.readyPlayers.push(playerIndex);
    }

    // Check if all players are ready
    const requiredPlayers = room.mode === 'trio' ? 3 : (room.mode === 'partner' ? 2 : 1);
    if (room.readyPlayers.length >= requiredPlayers) {
      room.status = 'ready';
    }

    await room.save();

    console.log(`🎵 Player ${playerIndex} ready in melody room ${code}. Status: ${room.status}`);
    res.json(room);
  } catch (error) {
    console.error('Error marking ready:', error);
    res.status(500).json({ error: 'Failed to mark ready' });
  }
});

// Add melodies to existing room (merge melodies) - legacy support
router.patch('/:code/melodies', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { melodies } = req.body;

    const room = await MelodyRoom.findOne({ code });
    if (!room) {
      return res.status(404).json({ error: 'Melody room not found' });
    }

    // Merge new melodies with existing
    room.melodies = { ...room.melodies, ...melodies };
    room.markModified('melodies');
    await room.save();

    console.log(`🎵 Melodies added to room: ${code}`);
    res.json(room);
  } catch (error) {
    console.error('Error updating melodies:', error);
    res.status(500).json({ error: 'Failed to update melodies' });
  }
});

// Delete melody room
router.delete('/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = await MelodyRoom.findOneAndDelete({ code });

    if (!room) {
      return res.status(404).json({ error: 'Melody room not found' });
    }

    console.log(`🎵 Melody Room deleted: ${code}`);
    res.json({ message: 'Melody room deleted successfully' });
  } catch (error) {
    console.error('Error deleting melody room:', error);
    res.status(500).json({ error: 'Failed to delete melody room' });
  }
});

module.exports = router;
