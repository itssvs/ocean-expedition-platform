const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
  createVessel, getVessels, getVesselById, updateVessel, deleteVessel
} = require('../controllers/vesselController');

router.get('/', protect, getVessels);
router.get('/:id', protect, getVesselById);
router.post('/', protect, authorize('admin'), createVessel);
router.put('/:id', protect, authorize('admin'), updateVessel);
router.delete('/:id', protect, authorize('admin'), deleteVessel);

module.exports = router;