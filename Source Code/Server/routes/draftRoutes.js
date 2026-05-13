const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getDrafts,
  getDraft,
  createOrGetDraft,
  updateDraft,
  deleteDraft,
  clearAllDrafts,
} = require("../controllers/draftController");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all drafts
router.get("/", getDrafts);

// Get specific draft
router.get("/:id", getDraft);

// Create or get default draft
router.post("/", createOrGetDraft);

// Update draft
router.put("/:id", updateDraft);

// Delete specific draft
router.delete("/:id", deleteDraft);

// Clear all drafts
router.delete("/", clearAllDrafts);

module.exports = router;
