const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
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
  }
});

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://ride-sharing-tracker.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Photo upload route
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const photoUrl = `https://ride-sharing-tracker-backend.onrender.com/uploads/${req.file.filename}`;
  res.status(200).json({ photoUrl });
});

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