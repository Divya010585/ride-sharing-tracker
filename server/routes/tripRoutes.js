const express = require('express');
const router = express.Router();
const { createTrip, joinTrip, getTrip } = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, createTrip);
router.post('/join', authMiddleware, joinTrip);
router.get('/:roomCode', authMiddleware, getTrip);

module.exports = router;