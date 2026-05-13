const DraftBill = require("../models/DraftBill");
const Product = require("../models/Product");

// @route   GET /api/drafts
// @desc    Get all draft bills for logged-in user
// @access  Private
const getDrafts = async (req, res) => {
  try {
    const drafts = await DraftBill.find({ user: req.user._id })
      .populate("items.productId", "name");
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching drafts", error: error.message });
  }
};

// @route   GET /api/drafts/:id
// @desc    Get a specific draft bill
// @access  Private
const getDraft = async (req, res) => {
  try {
    const draft = await DraftBill.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("items.productId", "name price quantity");

    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }

    res.json(draft);
  } catch (error) {
    res.status(500).json({ message: "Error fetching draft", error: error.message });
  }
};

// @route   POST /api/drafts
// @desc    Create or get default draft bill
// @access  Private
const createOrGetDraft = async (req, res) => {
  try {
    const { customerName, items, discount = 0, gst = 0, notes = "" } = req.body;

    // If no specific draft requested, create/update default
    let draft = await DraftBill.findOne({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    if (!draft) {
      draft = new DraftBill({
        user: req.user._id,
        customerName: customerName || "",
        items: items || [],
        discount,
        gst,
        notes,
      });
    } else {
      // Update existing draft
      if (customerName !== undefined) draft.customerName = customerName;
      if (items !== undefined) draft.items = items;
      draft.discount = discount;
      draft.gst = gst;
      if (notes !== undefined) draft.notes = notes;
    }

    await draft.save();
    res.json(draft);
  } catch (error) {
    res.status(500).json({ message: "Error creating/updating draft", error: error.message });
  }
};

// @route   PUT /api/drafts/:id
// @desc    Update a draft bill
// @access  Private
const updateDraft = async (req, res) => {
  try {
    const { customerName, items, discount, gst, notes } = req.body;

    let draft = await DraftBill.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }

    if (customerName !== undefined) draft.customerName = customerName;
    if (items !== undefined) draft.items = items;
    if (discount !== undefined) draft.discount = discount;
    if (gst !== undefined) draft.gst = gst;
    if (notes !== undefined) draft.notes = notes;

    // Calculate subtotal
    let subtotal = 0;
    for (const item of draft.items) {
      subtotal += item.price * item.quantity;
    }
    draft.subtotal = subtotal;

    await draft.save();
    res.json(draft);
  } catch (error) {
    res.status(500).json({ message: "Error updating draft", error: error.message });
  }
};

// @route   DELETE /api/drafts/:id
// @desc    Delete a draft bill
// @access  Private
const deleteDraft = async (req, res) => {
  try {
    const draft = await DraftBill.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }

    res.json({ message: "Draft deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting draft", error: error.message });
  }
};

// @route   DELETE /api/drafts
// @desc    Clear all draft bills for logged-in user
// @access  Private
const clearAllDrafts = async (req, res) => {
  try {
    await DraftBill.deleteMany({ user: req.user._id });
    res.json({ message: "All drafts cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing drafts", error: error.message });
  }
};

module.exports = {
  getDrafts,
  getDraft,
  createOrGetDraft,
  updateDraft,
  deleteDraft,
  clearAllDrafts,
};
