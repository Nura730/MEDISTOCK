const Inventory = require('../models/Inventory');
const AvailabilityAlert = require('../models/AvailabilityAlert');

// GET /api/inventory
exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find()
      .populate('pharmacyId')
      .populate('medicineId')
      .sort({ lastUpdated: -1 });

    res.json({ success: true, data: inventory });
  } catch (error) {
    next(error);
  }
};

// GET /api/inventory/pharmacy/:pharmacyId
exports.getPharmacyInventory = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { pharmacyId: req.params.pharmacyId };

    let inventory = await Inventory.find(query)
      .populate('medicineId')
      .sort({ lastUpdated: -1 });

    // Filter by medicine name if search provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      inventory = inventory.filter(item =>
        item.medicineId &&
        (searchRegex.test(item.medicineId.name) || searchRegex.test(item.medicineId.genericName))
      );
    }

    res.json({ success: true, data: inventory });
  } catch (error) {
    next(error);
  }
};

// GET /api/inventory/medicine/:medicineId - pharmacies carrying a medicine
exports.getMedicineAvailability = async (req, res, next) => {
  try {
    const inventory = await Inventory.find({ medicineId: req.params.medicineId })
      .populate('pharmacyId')
      .sort({ quantity: -1 });

    const availability = inventory
      .filter(item => item.pharmacyId && item.pharmacyId.isActive)
      .map(item => ({
        _id: item._id,
        pharmacy: item.pharmacyId,
        quantity: item.quantity,
        lowStockThreshold: item.lowStockThreshold,
        status: item.status,
        lastUpdated: item.lastUpdated
      }));

    res.json({ success: true, data: availability });
  } catch (error) {
    next(error);
  }
};

// POST /api/inventory (staff/admin)
exports.createInventory = async (req, res, next) => {
  try {
    const { pharmacyId, medicineId, quantity, lowStockThreshold } = req.body;

    // Check if inventory already exists
    const existing = await Inventory.findOne({ pharmacyId, medicineId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Inventory record already exists for this medicine at this pharmacy'
      });
    }

    const inventory = await Inventory.create({
      pharmacyId,
      medicineId,
      quantity: quantity || 0,
      lowStockThreshold: lowStockThreshold || 10,
      lastUpdated: new Date()
    });

    const populated = await Inventory.findById(inventory._id)
      .populate('pharmacyId')
      .populate('medicineId');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('inventory:updated', {
        inventory: populated,
        pharmacyId: populated.pharmacyId._id,
        medicineId: populated.medicineId._id
      });
      io.emit('dashboard:statsUpdated');
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// PUT /api/inventory/:id (staff/admin)
exports.updateInventory = async (req, res, next) => {
  try {
    const oldInventory = await Inventory.findById(req.params.id);
    if (!oldInventory) {
      return res.status(404).json({ success: false, message: 'Inventory record not found' });
    }

    const oldQuantity = oldInventory.quantity;
    const updateData = {
      ...req.body,
      lastUpdated: new Date()
    };

    const inventory = await Inventory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('pharmacyId').populate('medicineId');

    const newQuantity = inventory.quantity;

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      io.emit('inventory:updated', {
        inventory: inventory,
        pharmacyId: inventory.pharmacyId._id,
        medicineId: inventory.medicineId._id,
        oldQuantity,
        newQuantity
      });

      // If medicine went from out of stock to in stock, notify alerts
      if (oldQuantity === 0 && newQuantity > 0) {
        io.emit('medicine:availabilityChanged', {
          medicineId: inventory.medicineId._id,
          medicineName: inventory.medicineId.name,
          pharmacyId: inventory.pharmacyId._id,
          pharmacyName: inventory.pharmacyId.name,
          status: 'In Stock',
          quantity: newQuantity
        });

        // Update pending alerts
        const alerts = await AvailabilityAlert.find({
          medicineId: inventory.medicineId._id,
          pharmacyId: inventory.pharmacyId._id,
          status: 'pending'
        });

        if (alerts.length > 0) {
          await AvailabilityAlert.updateMany(
            {
              medicineId: inventory.medicineId._id,
              pharmacyId: inventory.pharmacyId._id,
              status: 'pending'
            },
            { status: 'notified', notifiedAt: new Date() }
          );

          // Emit alert notifications for each user
          for (const alert of alerts) {
            io.emit(`alert:available:${alert.userId}`, {
              alertId: alert._id,
              medicineName: inventory.medicineId.name,
              pharmacyName: inventory.pharmacyId.name,
              medicineId: inventory.medicineId._id,
              pharmacyId: inventory.pharmacyId._id
            });
          }
        }
      }

      io.emit('dashboard:statsUpdated');
    }

    res.json({ success: true, data: inventory });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/inventory/:id (admin)
exports.deleteInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory record not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('inventory:updated', { deleted: true, inventoryId: req.params.id });
      io.emit('dashboard:statsUpdated');
    }

    res.json({ success: true, message: 'Inventory record deleted' });
  } catch (error) {
    next(error);
  }
};
