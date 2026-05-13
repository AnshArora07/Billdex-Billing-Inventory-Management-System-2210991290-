const Bill = require("../models/Bill");
const Product = require("../models/Product");

const getDateParts = (date = new Date()) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return { day, month, year };
};

const generateDailyBillNumber = async () => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const { day, month, year } = getDateParts(now);
  const prefix = `BILL-${day}${month}${year}`;

  // Daily count starts from 1 and increments for each bill created today.
  let sequence = (await Bill.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } })) + 1;

  // Guard against rare duplicate collisions.
  while (await Bill.exists({ billNumber: `${prefix}-${String(sequence).padStart(4, "0")}` })) {
    sequence += 1;
  }

  return `${prefix}-${String(sequence).padStart(4, "0")}`;
};

// @route   POST /api/bills
// @desc    Create a new bill, reduce stock automatically
// @access  Private
const createBill = async (req, res) => {
  try {
    const { items, customerName, paymentMode = "cash", discount = 0, gst = 0 } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    // Validate items array
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Bill must have at least one item" });
    }

    let totalAmount = 0;
    const billItems = [];

    // Loop through each item in the bill
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Each item needs a valid productId and quantity" });
      }

      // Find the product and make sure it belongs to the logged-in user
      const product = await Product.findOne({ _id: productId, user: req.user._id });

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${productId}` });
      }

      // Check if enough stock is available
      if (product.quantity < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
        });
      }

      // Add line item total to bill total
      totalAmount += product.sellingPrice * quantity;

      // Store snapshot of price at time of sale
      billItems.push({
        product: product._id,
        quantity,
        price: product.sellingPrice,
      });

      // Reduce stock quantity
      product.quantity -= quantity;
      await product.save();
    }

    // Apply discount: reduce totalAmount by discount %
    const discountAmount = (totalAmount * discount) / 100;
    const afterDiscount = totalAmount - discountAmount;

    // Apply GST on the discounted amount
    const gstAmount = (afterDiscount * gst) / 100;
    const finalAmount = afterDiscount + gstAmount;

    const billNumber = await generateDailyBillNumber();

    // Create and save the bill
    const bill = await Bill.create({
      user: req.user._id,
      customerName: customerName.trim(),
      billNumber,
      paymentMode,
      items: billItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      discount,
      gst,
      finalAmount: parseFloat(finalAmount.toFixed(2)),
    });

    // Populate product names for the response
    const populatedBill = await bill.populate("items.product", "name sellingPrice");

    res.status(201).json({ message: "Bill created successfully", bill: populatedBill });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/bills
// @desc    Get all bills for the logged-in user
// @access  Private
const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id })
      .populate("items.product", "name category") // Include product name and category
      .sort({ createdAt: -1 }); // Newest bills first

    res.status(200).json({ count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   DELETE /api/bills/:id
// @desc    Delete a bill and restore sold quantities back to stock
// @access  Private
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user._id });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Restore stock quantities for products in this bill.
    for (const item of bill.items) {
      const product = await Product.findOne({ _id: item.product, user: req.user._id });
      if (!product) continue;
      product.quantity += item.quantity;
      await product.save();
    }

    await bill.deleteOne();

    res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createBill, getBills, deleteBill };
