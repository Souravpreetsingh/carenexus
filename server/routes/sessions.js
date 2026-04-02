const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// User: request a support session
router.post('/request', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ message: 'Only users can request sessions' });
    const existing = await Session.findOne({ user: req.user.id, status: { $in: ['pending', 'active'] } });
    if (existing) return res.json({ session: existing });

    const session = await Session.create({ user: req.user.id, roomId: uuidv4() });
    res.status(201).json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mentor: get all pending sessions
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Mentors only' });
    const sessions = await Session.find({ status: 'pending' }).populate('user', 'username');
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mentor: accept a session
router.post('/:id/accept', auth, async (req, res) => {
  try {
    if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Mentors only' });
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { mentor: req.user.id, status: 'active' },
      { new: true }
    ).populate('user', 'username');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my active session (user or mentor)
router.get('/my', auth, async (req, res) => {
  try {
    const query = req.user.role === 'user'
      ? { user: req.user.id, status: { $in: ['pending', 'active'] } }
      : { mentor: req.user.id, status: 'active' };
    const session = await Session.findOne(query).populate('user', 'username').populate('mentor', 'username');
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Complete a session
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const isOwner = session.user.toString() === req.user.id || (session.mentor && session.mentor.toString() === req.user.id);
    if (!isOwner) return res.status(403).json({ message: 'Not authorized' });
    session.status = 'completed';
    await session.save();
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get chat history for a room
router.get('/:roomId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'username role')
      .sort('createdAt');
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
