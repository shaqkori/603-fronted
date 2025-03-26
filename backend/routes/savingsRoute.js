const express = require("express");
const router = express.Router();
const {
  getSavings,
  getSavingsById,
  createSavings,
  updateSavings,
  deleteSavings,
} = require("../controllers/savingsController");

// Define savings routes
router.get("/", getSavings);
router.get("/:id", getSavingsById);
router.post("/", createSavings);
router.put("/:id", updateSavings);
router.delete("/:id", deleteSavings);

module.exports = router;
