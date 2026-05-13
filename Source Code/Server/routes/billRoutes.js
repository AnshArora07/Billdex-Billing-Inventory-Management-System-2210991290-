const express = require("express");
const router = express.Router();
const { createBill, getBills, deleteBill } = require("../controllers/billController");
const { protect } = require("../middleware/authMiddleware");

// All bill routes are protected — require valid JWT
router.post("/", protect, createBill);
router.get("/", protect, getBills);
router.delete("/:id", protect, deleteBill);

module.exports = router;
