const express = require('express');
const router = express.Router();
const { createAlert, getAlerts, deleteAlert } = require('../controllers/alertController');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, createAlert);
router.get('/', authenticateUser, getAlerts);
router.delete('/:id', authenticateUser, deleteAlert);

module.exports = router;
