require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Room = require('./models/Room');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const executeRoutes = require('./routes/execute');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('PairUp API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/execute', executeRoutes);


io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);

    // Broadcast the updated live count to everyone in the room, including the new joiner
    const count = io.sockets.adapter.rooms.get(roomId)?.size || 1;
    io.in(roomId).emit('participant-count', count);
  });

  socket.on('code-change', async ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', code);

    try {
      await Room.findOneAndUpdate({ roomId }, { code });
    } catch (err) {
      console.error('Failed to save code:', err.message);
    }
  });

  socket.on('chat-message', ({ roomId, message, sender }) => {
    socket.to(roomId).emit('chat-message', { message, sender });
  });

  socket.on('timer-set', ({ roomId, seconds }) => {
    socket.to(roomId).emit('timer-set', { seconds });
  });

  
  socket.on('timer-update', ({ roomId, secondsLeft, timerRunning }) => {
    socket.to(roomId).emit('timer-update', { secondsLeft, timerRunning });
  });

  // Fires BEFORE the socket actually leaves its rooms, so we can still see room membership here
  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((roomId) => {
      const currentCount = io.sockets.adapter.rooms.get(roomId)?.size || 1;
      const countAfterLeaving = currentCount - 1;
      socket.to(roomId).emit('participant-count', countAfterLeaving);
    });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });