const mongoose = require("mongoose");

// Schema for each line item in a bill
const billItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true, // Price at time of sale (snapshot)
    min: 0,
  },
});

const billSchema = new mongoose.Schema(
  {
    // Each bill belongs to one user (shop owner)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },

    billNumber: {
      type: String,
      required: true,
      unique: true,
    },

    paymentMode: {
      type: String,
      default: "cash",
    },

    // Array of products sold in this bill
    items: [billItemSchema],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Optional discount in percentage (e.g., 10 means 10%)
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Optional GST in percentage (e.g., 18 means 18%)
    gst: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
