const Pharmacy = require('../models/Pharmacy');
const Inventory = require('../models/Inventory');

// GET /api/pharmacies
exports.getPharmacies = async (req, res, next) => {
  try {
    const { search, city, active } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }
    if (city) query.city = new RegExp(city, 'i');
    if (active !== undefined) query.isActive = active === 'true';

    const pharmacies = await Pharmacy.find(query).sort({ name: 1 });

    res.json({ success: true, data: pharmacies });
  } catch (error) {
    next(error);
  }
};

// GET /api/pharmacies/:id
exports.getPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }

    // Get inventory for this pharmacy
    const inventory = await Inventory.find({ pharmacyId: pharmacy._id })
      .populate('medicineId')
      .sort({ lastUpdated: -1 });

    const inventoryData = inventory.map(item => ({
      _id: item._id,
      medicine: item.medicineId,
      quantity: item.quantity,
      lowStockThreshold: item.lowStockThreshold,
      status: item.status,
      lastUpdated: item.lastUpdated
    }));

    res.json({
      success: true,
      data: {
        ...pharmacy.toObject(),
        inventory: inventoryData
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/pharmacies (admin)
exports.createPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.create(req.body);
    res.status(201).json({ success: true, data: pharmacy });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pharmacies/:id (admin)
exports.updatePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }
    res.json({ success: true, data: pharmacy });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/pharmacies/:id (admin)
exports.deletePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }
    await Inventory.deleteMany({ pharmacyId: req.params.id });
    res.json({ success: true, message: 'Pharmacy deleted' });
  } catch (error) {
    next(error);
  }
};
