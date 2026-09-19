const mongoose = require('mongoose');

const availabilityAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'notified', 'cancelled'],
    default: 'pending'
  },
  notifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

availabilityAlertSchema.index({ userId: 1 });
availabilityAlertSchema.index({ medicineId: 1, pharmacyId: 1, status: 1 });

module.exports = mongoose.model('AvailabilityAlert', availabilityAlertSchema);
