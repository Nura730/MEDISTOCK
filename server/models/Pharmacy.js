const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  state: {
    type: String,
    default: 'Kerala',
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  openingTime: {
    type: String,
    default: '09:00 AM'
  },
  closingTime: {
    type: String,
    default: '06:00 PM'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

pharmacySchema.index({ city: 1 });
pharmacySchema.index({ district: 1 });
pharmacySchema.index({ isActive: 1 });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
