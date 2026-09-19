const express = require('express');
const router = express.Router();
const {
  getInventory,
  getPharmacyInventory,
  getMedicineAvailability,
  createInventory,
  updateInventory,
  deleteInventory
} = require('../controllers/inventoryController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.get('/', getInventory);
router.get('/pharmacy/:pharmacyId', getPharmacyInventory);
router.get('/medicine/:medicineId', getMedicineAvailability);
router.post('/', authenticateUser, authorizeRoles('staff', 'admin'), createInventory);
router.put('/:id', authenticateUser, authorizeRoles('staff', 'admin'), updateInventory);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteInventory);

module.exports = router;
