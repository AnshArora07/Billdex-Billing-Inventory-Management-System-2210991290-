const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Bill     = require("../models/Bill");

// @route   GET /api/dashboard/stats
// @desc    Summary numbers for the logged-in user's dashboard
// @access  Private
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalProducts,
      totalBills,
      revenueResult,
      lowStockProducts,
      recentBills,
    ] = await Promise.all([
      Product.countDocuments({ user: userId }),

      Bill.countDocuments({ user: userId }),

      // aggregate needs an actual ObjectId, not a string
      Bill.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]),

      // Products at or below 5 units — sorted lowest first
      Product.find({ user: userId, quantity: { $lte: 5 } })
        .select("name quantity")
        .sort({ quantity: 1 })
        .limit(5),

      // Last 5 bills
      Bill.find({ user: userId })
        .select("billNumber customerName finalAmount createdAt paymentMode")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      totalProducts,
      totalBills,
      totalRevenue:    parseFloat((revenueResult[0]?.total || 0).toFixed(2)),
      lowStockProducts,
      recentBills,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getStats };
