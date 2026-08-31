const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
  createStation, getStations, getStationById, updateStation, deleteStation
} = require('../controllers/stationController');

router.get('/', protect, getStations);
router.get('/:id', protect, getStationById);
router.post('/', protect, authorize('admin', 'scientist'), createStation);
router.put('/:id', protect, authorize('admin', 'scientist'), updateStation);
router.delete('/:id', protect, authorize('admin'), deleteStation);

module.exports = router;