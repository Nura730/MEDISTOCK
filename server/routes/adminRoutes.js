const express = require('express');
const router = express.Router();
const { getStats, getShortages, getSearchTrends, getPharmacyStats } = require('../controllers/adminController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser, authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/shortages', getShortages);
router.get('/search-trends', getSearchTrends);
router.get('/pharmacy-stats', getPharmacyStats);

module.exports = router;
