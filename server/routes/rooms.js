const express = require('express');
const { nanoid } = require('nanoid');
const Room = require('../models/Room');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/rooms/create — creates a new room, current user becomes host
router.post('/create', requireAuth, async (req, res) => {
  try {
    const roomId = nanoid(8); // short, unique, URL-friendly id

    const room = await Room.create({
      roomId,
      host: req.userId,
      participants: [req.userId],
    });

    res.status(201).json({ roomId: room.roomId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating room' });
  }
});
// GET /api/rooms/my/history — rooms the current user has participated in
router.get('/my/history', requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find({ participants: req.userId })
      .sort({ updatedAt: -1 })
      .limit(10);
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

// GET /api/rooms/:roomId — fetch a room, add current user as a participant if not already
router.get('/:roomId', requireAuth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.participants.includes(req.userId)) {
      room.participants.push(req.userId);
      await room.save();
    }

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching room' });
  }
});

module.exports = router;