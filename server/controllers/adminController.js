const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const SearchLog = require('../models/SearchLog');
const User = require('../models/User');

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalPharmacies,
      totalMedicines,
      totalUsers,
      inventoryStats
    ] = await Promise.all([
      Pharmacy.countDocuments({ isActive: true }),
      Medicine.countDocuments(),
      User.countDocuments({ role: 'citizen' }),
      Inventory.aggregate([
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            inStock: {
              $sum: {
                $cond: [{ $gt: ['$quantity', '$lowStockThreshold'] }, 1, 0]
              }
            },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$quantity', 0] },
                      { $lte: ['$quantity', '$lowStockThreshold'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            outOfStock: {
              $sum: {
                $cond: [{ $eq: ['$quantity', 0] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const stats = inventoryStats[0] || { totalRecords: 0, inStock: 0, lowStock: 0, outOfStock: 0 };

    res.json({
      success: true,
      data: {
        totalPharmacies,
        totalMedicines,
        totalUsers,
        totalInventoryRecords: stats.totalRecords,
        inStock: stats.inStock,
        lowStock: stats.lowStock,
        outOfStock: stats.outOfStock
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/shortages
exports.getShortages = async (req, res, next) => {
  try {
    const shortages = await Inventory.aggregate([
      { $match: { quantity: 0 } },
      {
        $group: {
          _id: '$medicineId',
          pharmaciesAffected: { $sum: 1 },
          pharmacyIds: { $push: '$pharmacyId' }
        }
      },
      { $sort: { pharmaciesAffected: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: '$medicine' }
    ]);

    const lowStockMedicines = await Inventory.aggregate([
      {
        $match: {
          quantity: { $gt: 0 },
          $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
        }
      },
      {
        $group: {
          _id: '$medicineId',
          pharmaciesAffected: { $sum: 1 }
        }
      },
      { $sort: { pharmaciesAffected: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: '$medicine' }
    ]);

    res.json({
      success: true,
      data: { outOfStock: shortages, lowStock: lowStockMedicines }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/search-trends
exports.getSearchTrends = async (req, res, next) => {
  try {
    const trends = await SearchLog.aggregate([
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
          lastSearched: { $max: '$searchedAt' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    res.json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/pharmacy-stats
exports.getPharmacyStats = async (req, res, next) => {
  try {
    const pharmacyStats = await Inventory.aggregate([
      {
        $group: {
          _id: '$pharmacyId',
          totalMedicines: { $sum: 1 },
          inStock: {
            $sum: { $cond: [{ $gt: ['$quantity', '$lowStockThreshold'] }, 1, 0] }
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$lowStockThreshold'] }] },
                1, 0
              ]
            }
          },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'pharmacies',
          localField: '_id',
          foreignField: '_id',
          as: 'pharmacy'
        }
      },
      { $unwind: '$pharmacy' },
      { $sort: { outOfStock: -1 } }
    ]);

    res.json({ success: true, data: pharmacyStats });
  } catch (error) {
    next(error);
  }
};
