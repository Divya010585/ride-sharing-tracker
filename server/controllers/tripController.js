const db = require('../config/db');
const crypto = require('crypto');

// Create Trip
const createTrip = (req, res) => {
  const userId = req.user.id;
  const roomCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  db.query('INSERT INTO trips (room_code, created_by) VALUES (?, ?)',
    [roomCode, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      db.query('INSERT INTO trip_participants (trip_id, user_id) VALUES (?, ?)',
        [result.insertId, userId],
        (err) => {
          if (err) return res.status(500).json({ message: 'Database error' });
          res.status(201).json({ message: '✅ Trip created!', roomCode });
        }
      );
    }
  );
};

// Join Trip
const joinTrip = (req, res) => {
  const { roomCode } = req.body;
  const userId = req.user.id;

  db.query('SELECT * FROM trips WHERE room_code = ?', [roomCode], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Trip not found' });

    const trip = results[0];
    db.query('INSERT INTO trip_participants (trip_id, user_id) VALUES (?, ?)',
      [trip.id, userId],
      (err) => {
        if (err) return res.status(500).json({ message: 'Already joined' });
        res.status(200).json({ message: '✅ Joined trip!', roomCode });
      }
    );
  });
};

// Get Trip
const getTrip = (req, res) => {
  const { roomCode } = req.params;
  db.query('SELECT * FROM trips WHERE room_code = ?', [roomCode], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Trip not found' });
    res.status(200).json({ trip: results[0] });
  });
};

// End Trip
const endTrip = (req, res) => {
  const { roomCode } = req.body;
  const userId = req.user.id;

  db.query('UPDATE trips SET status = ? WHERE room_code = ? AND created_by = ?',
    ['completed', roomCode, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(403).json({ message: 'Only trip creator can end the trip!' });
      res.status(200).json({ message: '✅ Trip ended!' });
    }
  );
};

// Get Trip History
const getTripHistory = (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT trips.* FROM trips 
     INNER JOIN trip_participants ON trips.id = trip_participants.trip_id 
     WHERE trip_participants.user_id = ? 
     ORDER BY trips.created_at DESC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(200).json({ trips: results });
    }
  );
};

module.exports = { createTrip, joinTrip, getTrip, endTrip, getTripHistory };