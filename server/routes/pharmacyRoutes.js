const express = require('express');
const router = express.Router();
const {
  getPharmacies,
  getPharmacy,
  createPharmacy,
  updatePharmacy,
  deletePharmacy
} = require('../controllers/pharmacyController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.get('/', getPharmacies);
router.get('/:id', getPharmacy);
router.post('/', authenticateUser, authorizeRoles('admin'), createPharmacy);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updatePharmacy);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deletePharmacy);

module.exports = router;
