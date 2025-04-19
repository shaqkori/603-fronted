const express = require("express");
const router = express.Router();
const {
  getSavings,
  getSavingsById,
  createSavings,
  updateSavings,
  deleteSavings,
} = require("../controllers/savingsController"); // Import the savings controller functions

// Define savings routes
router.get("/", getSavings);
router.get("/:id", getSavingsById);
router.post("/", createSavings);
router.put("/:id", updateSavings);
router.delete("/:id", deleteSavings); //defines routes for getting all savings, getting a savings goal by ID, creating a new savings goal, updating an existing savings goal, and deleting a savings goal

module.exports = router; // exports the router to be used in other files
