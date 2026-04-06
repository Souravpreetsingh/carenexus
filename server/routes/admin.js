const router = require('express').Router();
const User = require('../models/User');
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require auth + admin role
router.use(auth, admin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort('-createdAt');
    res.json({ users });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Toggle user approved status (for mentors)
router.patch('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isApproved = !user.isApproved;
    await user.save();
    res.json({ user: { id: user._id, username: user.username, isApproved: user.isApproved } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('user', 'username')
      .populate('mentor', 'username')
      .sort('-createdAt');
    res.json({ sessions });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete a session
router.delete('/sessions/:id', async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Stats overview
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalMentors, totalSessions, activeSessions] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'mentor' }),
      Session.countDocuments(),
      Session.countDocuments({ status: 'active' })
    ]);
    res.json({ totalUsers, totalMentors, totalSessions, activeSessions });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
