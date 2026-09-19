const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

inventorySchema.virtual('status').get(function() {
  if (this.quantity === 0) return 'Out of Stock';
  if (this.quantity <= this.lowStockThreshold) return 'Low Stock';
  return 'In Stock';
});

inventorySchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });
inventorySchema.index({ medicineId: 1 });
inventorySchema.index({ pharmacyId: 1 });
inventorySchema.index({ quantity: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
