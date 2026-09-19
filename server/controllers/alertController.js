const AvailabilityAlert = require('../models/AvailabilityAlert');

// POST /api/alerts
exports.createAlert = async (req, res, next) => {
  try {
    const { medicineId, pharmacyId, email } = req.body;

    if (!medicineId || !pharmacyId) {
      return res.status(400).json({ success: false, message: 'Medicine and pharmacy are required' });
    }

    // Check if alert already exists
    const existing = await AvailabilityAlert.findOne({
      userId: req.user._id,
      medicineId,
      pharmacyId,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active alert for this medicine at this pharmacy' });
    }

    const alert = await AvailabilityAlert.create({
      userId: req.user._id,
      medicineId,
      pharmacyId,
      email: email || req.user.email
    });

    const populated = await AvailabilityAlert.findById(alert._id)
      .populate('medicineId')
      .populate('pharmacyId');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/alerts
exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await AvailabilityAlert.find({ userId: req.user._id })
      .populate('medicineId')
      .populate('pharmacyId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/alerts/:id
exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await AvailabilityAlert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, message: 'Alert cancelled' });
  } catch (error) {
    next(error);
  }
};
