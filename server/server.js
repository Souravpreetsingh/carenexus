require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const Message = require('./models/Message');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.IO real-time chat
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send-message', async ({ roomId, senderId, senderRole, text }) => {
    try {
      const msg = await Message.create({ roomId, sender: senderId, senderRole, text });
      io.to(roomId).emit('receive-message', {
        _id: msg._id,
        text: msg.text,
        senderRole: msg.senderRole,
        createdAt: msg.createdAt
      });
    } catch (err) {
      console.error('Message save error:', err.message);
    }
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
  });

  // WebRTC call signaling
  socket.on('call-offer',  ({ roomId, offer, callType }) => socket.to(roomId).emit('call-offer',  { offer, callType }));
  socket.on('call-answer', ({ roomId, answer })          => socket.to(roomId).emit('call-answer', { answer }));
  socket.on('call-ice',    ({ roomId, candidate })       => socket.to(roomId).emit('call-ice',    { candidate }));
  socket.on('call-ended',  ({ roomId })                  => socket.to(roomId).emit('call-ended'));
});

// Connect DB and start server
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/emotional_support')
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
