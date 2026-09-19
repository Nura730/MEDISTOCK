const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  query: {
    type: String,
    trim: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  searchedAt: {
    type: Date,
    default: Date.now
  }
});

searchLogSchema.index({ medicineId: 1 });
searchLogSchema.index({ searchedAt: -1 });

module.exports = mongoose.model('SearchLog', searchLogSchema);
