const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const SearchLog = require('../models/SearchLog');

// GET /api/medicines - Search medicines
exports.getMedicines = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { genericName: searchRegex },
        { strength: searchRegex },
        { category: searchRegex }
      ];
    }

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get availability count for each medicine
    const medicinesWithAvailability = await Promise.all(
      medicines.map(async (med) => {
        const availableCount = await Inventory.countDocuments({
          medicineId: med._id,
          quantity: { $gt: 0 }
        });
        return {
          ...med.toObject(),
          availablePharmacies: availableCount
        };
      })
    );

    // Log search
    if (search && req.user) {
      SearchLog.create({ query: search, userId: req.user._id }).catch(() => {});
    } else if (search) {
      SearchLog.create({ query: search }).catch(() => {});
    }

    res.json({
      success: true,
      data: medicinesWithAvailability,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/medicines/:id
exports.getMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const availableCount = await Inventory.countDocuments({
      medicineId: medicine._id,
      quantity: { $gt: 0 }
    });

    res.json({
      success: true,
      data: {
        ...medicine.toObject(),
        availablePharmacies: availableCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/medicines (admin)
exports.createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

// PUT /api/medicines/:id (admin)
exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/medicines/:id (admin)
exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    // Also remove related inventory
    await Inventory.deleteMany({ medicineId: req.params.id });
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (error) {
    next(error);
  }
};
