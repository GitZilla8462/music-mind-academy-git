const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Generate a 4-digit room code
const generateCode = () => {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

// Create a new room
router.post('/', async (req, res) => {
  try {
    const { mode, theme, patterns, status, creatorIndex } = req.body;

    // Generate unique code
    let code;
    let attempts = 0;
    do {
      code = generateCode();
      const existing = await Room.findOne({ code });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return res.status(500).json({ error: 'Could not generate unique code' });
    }

    const room = new Room({
      code,
      mode: mode || 'solo',
      theme: theme || null,
      patterns: patterns || {},
      status: status || 'creating',
      creatorIndex: creatorIndex || 0,
      readyPlayers: [],
      activeLocks: {}
    });

    await room.save();
    console.log(`🎮 Room created: ${code}`);
    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room by code
router.get('/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = await Room.findOne({ code });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Update room (general update) - whitelist allowed fields for security
router.put('/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();

    // Only allow specific fields to be updated (prevents field injection)
    const allowedFields = ['mode', 'theme', 'patterns', 'status', 'readyPlayers', 'activeLocks', 'creatorIndex'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const room = await Room.findOneAndUpdate(
      { code },
      { $set: updates },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    console.log(`🎮 Room updated: ${code}`);
    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// Save a single lock's pattern
router.patch('/:code/pattern/:lockNumber', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const lockNumber = parseInt(req.params.lockNumber);
    const { grid, playerIndex } = req.body;

    const room = await Room.findOne({ code });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Update the specific pattern
    room.patterns = room.patterns || {};
    room.patterns[lockNumber] = {
      grid,
      createdBy: playerIndex,
      completedAt: new Date()
    };

    // Clear active lock for this player since they saved
    if (room.activeLocks && room.activeLocks[playerIndex] === lockNumber) {
      room.activeLocks[playerIndex] = null;
    }

    // Mark as modified for Mongoose mixed type
    room.markModified('patterns');
    room.markModified('activeLocks');
    await room.save();

    console.log(`🎮 Lock ${lockNumber} saved in room ${code} by player ${playerIndex}`);
    res.json(room);
  } catch (error) {
    console.error('Error saving pattern:', error);
    res.status(500).json({ error: 'Failed to save pattern' });
  }
});

// Mark which lock a player is editing (for live status)
router.patch('/:code/active-lock', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { playerIndex, lockNumber } = req.body; // lockNumber = null if not editing

    const room = await Room.findOne({ code });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    room.activeLocks = room.activeLocks || {};
    room.activeLocks[playerIndex] = lockNumber;

    room.markModified('activeLocks');
    await room.save();

    res.json(room);
  } catch (error) {
    console.error('Error updating active lock:', error);
    res.status(500).json({ error: 'Failed to update active lock' });
  }
});

// Mark player as ready
router.patch('/:code/ready', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { playerIndex } = req.body;

    const room = await Room.findOne({ code });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
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

    console.log(`🎮 Player ${playerIndex} ready in room ${code}. Status: ${room.status}`);
    res.json(room);
  } catch (error) {
    console.error('Error marking ready:', error);
    res.status(500).json({ error: 'Failed to mark ready' });
  }
});

// Add patterns to existing room (merge patterns) - legacy support
router.patch('/:code/patterns', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const { patterns } = req.body;

    const room = await Room.findOne({ code });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Merge new patterns with existing
    room.patterns = { ...room.patterns, ...patterns };
    room.markModified('patterns');
    await room.save();

    console.log(`🎮 Patterns added to room: ${code}`);
    res.json(room);
  } catch (error) {
    console.error('Error updating patterns:', error);
    res.status(500).json({ error: 'Failed to update patterns' });
  }
});

// Delete room
router.delete('/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = await Room.findOneAndDelete({ code });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    console.log(`🎮 Room deleted: ${code}`);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

module.exports = router;
