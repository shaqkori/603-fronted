const express = require("express");

const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByCategory,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/", getTransactions);
router.get("/:id", getTransactionById);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);
router.get("/category", getTransactionsByCategory);

module.exports = router;
