const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatverse';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Message schema
const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

app.use(cors());
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server Running');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send last 50 messages on connect
  Message.find().sort({ createdAt: 1 }).limit(50).then(history => {
    history.forEach(msg => socket.emit('message', msg));
  });

  socket.on('message', async (msg) => {
    const saved = await Message.create(msg);
    io.emit('message', saved);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});