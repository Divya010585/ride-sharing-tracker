const express = require('express');
const router = express.Router();
const { createTrip, joinTrip, getTrip, endTrip, getTripHistory } = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, createTrip);
router.post('/join', authMiddleware, joinTrip);
router.get('/history', authMiddleware, getTripHistory);
router.get('/:roomCode', authMiddleware, getTrip);
router.put('/end', authMiddleware, endTrip);

module.exports = router;