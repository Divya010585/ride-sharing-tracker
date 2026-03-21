const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
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

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://ride-sharing-tracker.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/upload', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const fileName = `${Date.now()}-${req.file.originalname || 'file'}`;
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) return res.status(500).json({ message: error.message });

    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName);

    res.status(200).json({ photoUrl: urlData.publicUrl });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
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