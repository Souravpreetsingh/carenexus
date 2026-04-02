const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  roomId:  { type: String, unique: true },
  status:  { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
