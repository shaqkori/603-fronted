const db = require("../config/db");

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM transactions");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a transaction by ID
const getTransactionById = async (req, res) => {
  const transactionId = parseInt(req.params.id);
  try {
    const [rows] = await db.execute("SELECT * FROM transactions WHERE id = ?", [
      transactionId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// filters transactions by category
const getTransactionsByCategory = async (req, res) => {
  const categoryId = parseInt(req.query.categoryId);

  if (isNaN(categoryId)) {
    // checks if the category ID is a number
    return res.status(400).json({ message: "Invalid category ID" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT * FROM transactions WHERE category_id = ?", // selects all transactions from the transaction table where the category ID matches the one provided
      [categoryId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for this category" }); // checks if there are any transactions for the category ID provided
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching transactions by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new transaction
const createTransaction = async (req, res) => {
  const { description, amount, date, category_id, type } = req.body; // gets the data from the request body

  if (!description || !amount || !category_id || !type) {
    return res.status(400).json({ message: "Missing required fields" }); // checks if all required fields are present
  }

  if (type !== "income" && type !== "expense") {
    return res
      .status(400)
      .json({ message: "Invalid type. Must be 'income' or 'expense'" }); // checks if the type is either income or expense
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO transactions (description, amount, date, category_id, type) VALUES (?, ?, ?, ?, ?)", // inserts into theh transaction table
      [
        description,
        amount,
        date || new Date().toISOString().split("T")[0],
        category_id,
        type,
      ]
    );

    res.status(201).json({
      // sends a 201 status code to indicate that the transaction was created successfully
      id: result.insertId,
      description,
      amount,
      date,
      category_id,
      type,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a transaction
const updateTransaction = async (req, res) => {
  const transactionId = parseInt(req.params.id);
  const { description, amount, date, category_id, type } = req.body; // gets the data from the request body

  try {
    const [result] = await db.execute(
      "SELECT * FROM transactions WHERE id = ?", // selects the transaction by ID
      [transactionId]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await db.execute(
      "UPDATE transactions SET description = ?, amount = ?, date = ?, category_id = ?, type = ? WHERE id = ?", // updates the transaction table
      [
        // sets the values to be updated
        description || result[0].description,
        amount || result[0].amount,
        date || result[0].date,
        category_id || result[0].category_id,
        type || result[0].type,
        transactionId,
      ]
    );

    res.json({
      id: transactionId,
      description,
      amount,
      date,
      category_id,
      type,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  const transactionId = parseInt(req.params.id);

  try {
    const [result] = await db.execute("DELETE FROM transactions WHERE id = ?", [
      transactionId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  getTransactionsByCategory,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
// expots the functions to be used in other files
