const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine
} = require('../controllers/medicineController');
const { authenticateUser, authorizeRoles, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getMedicines);
router.get('/:id', getMedicine);
router.post('/', authenticateUser, authorizeRoles('admin'), createMedicine);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateMedicine);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteMedicine);

module.exports = router;
