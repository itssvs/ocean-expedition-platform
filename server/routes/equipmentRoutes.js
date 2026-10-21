     const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
  createEquipment, getEquipment, getEquipmentById, updateEquipment, deleteEquipment
} = require('../controllers/equipmentController');

router.get('/', protect, getEquipment);
router.get('/:id', protect, getEquipmentById);
router.post('/', protect, authorize('admin'), createEquipment);
router.put('/:id', protect, authorize('admin', 'scientist'), updateEquipment);
router.delete('/:id', protect, authorize('admin'), deleteEquipment);

module.exports = router;