const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://ride-sharing-tracker.vercel.app'],
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 10e6
});

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://ride-sharing-tracker.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

socketHandler(io);

app.get('/', (req, res) => {
  res.send('🚗 Ride Sharing Server is Running!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});