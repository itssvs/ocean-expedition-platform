const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');
const {
  createExpedition, getExpeditions, getExpeditionById, updateExpedition, deleteExpedition
} = require('../controllers/expeditionController');

router.get('/', protect, getExpeditions);
router.get('/:id', protect, getExpeditionById);
router.post('/', protect, authorize('admin', 'scientist'), createExpedition);
router.put('/:id', protect, authorize('admin', 'scientist'), updateExpedition);
router.delete('/:id', protect, authorize('admin'), deleteExpedition);

module.exports = router;