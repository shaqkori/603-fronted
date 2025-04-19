const express = require("express");

const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByCategory,
} = require("../controllers/transactionController"); // Import the transaction controller functions

const router = express.Router();

router.get("/", getTransactions);
router.get("/:id", getTransactionById);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);
router.get("/category", getTransactionsByCategory); // defines routes for getting all transactions, getting a transaction by ID, creating a new transaction, updating an existing transaction, deleting a transaction, and getting transactions by category
module.exports = router;
