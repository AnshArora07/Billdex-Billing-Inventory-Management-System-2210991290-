const Product = require("../models/Product");

const addProduct = async (req, res) => {
  try {
    const { name, category, mrp, sellingPrice, quantity } = req.body;
    const normalizedName = name?.trim();
    const normalizedCategory = category?.trim() || "General";
    const incomingMrp = Number(mrp);
    const incomingSellingPrice = Number(sellingPrice);
    const incomingQty = Number(quantity || 0);

    if (!normalizedName || mrp === undefined || sellingPrice === undefined) {
      return res.status(400).json({ message: "Name, MRP, and selling price are required" });
    }

    if (Number.isNaN(incomingMrp) || Number.isNaN(incomingSellingPrice)) {
      return res.status(400).json({ message: "MRP and selling price must be valid numbers" });
    }

    if (incomingMrp < 0 || incomingSellingPrice < 0) {
      return res.status(400).json({ message: "MRP and selling price must be non-negative" });
    }

    if (Number.isNaN(incomingQty) || incomingQty < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative number" });
    }

    // Find products with same name (case-insensitive) for this user.
    const sameNameProducts = await Product.find({ user: req.user._id, name: normalizedName })
      .collation({ locale: "en", strength: 2 });

    // Restock only when name+category+mrp+sellingPrice all match.
    const matchingProduct = sameNameProducts.find((p) =>
      (p.category || "General").trim().toLowerCase() === normalizedCategory.toLowerCase() &&
      Number(p.mrp) === incomingMrp &&
      Number(p.sellingPrice) === incomingSellingPrice
    );

    if (matchingProduct) {
      matchingProduct.quantity += incomingQty;
      const product = await matchingProduct.save();
      return res.status(200).json({
        message: "Product already exists. Stock increased successfully",
        product,
      });
    }

    // Prevent accidental overwrite: same name exists but with different price/category.
    if (sameNameProducts.length > 0) {
      return res.status(409).json({
        message:
          "A product with this name already exists but with different category or pricing. Use Edit to update it, or keep same values to increase stock.",
      });
    }

    const product = await Product.create({
      name: normalizedName,
      category: normalizedCategory,
      mrp: incomingMrp,
      sellingPrice: incomingSellingPrice,
      quantity: incomingQty,
      user: req.user._id, // Associate product with logged-in user
    });

    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/products
// @desc    Get all products for the logged-in user
// @access  Private
const getProducts = async (req, res) => {
  try {
    // Only return products belonging to this user
    const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({ count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   PUT /api/products/:id
// @desc    Update a product (only if it belongs to logged-in user)
// @access  Private
const updateProduct = async (req, res) => {
  try {
    // Find product by ID and ensure it belongs to the logged-in user
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, category, mrp, sellingPrice, quantity } = req.body;

    // Update only the fields that were provided
    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (mrp !== undefined) product.mrp = mrp;
    if (sellingPrice !== undefined) product.sellingPrice = sellingPrice;
    if (quantity !== undefined) product.quantity = quantity;

    const updatedProduct = await product.save();

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete a product (only if it belongs to logged-in user)
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addProduct, getProducts, updateProduct, deleteProduct };
