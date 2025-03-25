const { categories } = require("../controllers/categoryController");

const transactions = [
  {
    id: 1,
    description: "Grocery Store",
    amount: 50.25,
    date: "2024-03-01",
    category: "Groceries",
  },
  {
    id: 2,
    description: "Netflix",
    amount: 15.99,
    date: "2024-03-02",
    category: "Subscription",
  },
  {
    id: 3,
    description: "Gas Station",
    amount: 40.0,
    date: "2024-03-03",
    category: "Transportation",
  },
  {
    id: 4,
    description: "Coffee",
    amount: 5.5,
    date: "2024-03-04",
    category: "Food & Drink",
  },
];

const getTransactions = (req, res) => {
  res.json(transactions);
};

const getTransactionById = (req, res) => {
  const transactionId = parseInt(req.params.id); // Ensure ID is parsed as an integer
  console.log(`Fetching transaction with ID: ${transactionId}`); // Add logging
  const transaction = transactions.find((t) => t.id === transactionId);

  if (!transaction) {
    // Return a 404 if the transaction doesn't exist
    console.log(`Transaction with ID: ${transactionId} not found`); // Add logging
    return res.status(404).json({ message: "Transaction not found" });
  }

  res.json(transaction);
};

const createTransaction = (req, res) => {
  console.log("Categories:", categories); // Debugging log

  const { description, amount, date, category } = req.body;

  const isValidCategory = categories.some((c) => c.name === category);
  console.log("Is valid category:", isValidCategory); // Debugging log

  if (!isValidCategory) {
    return res.status(400).json({
      message: `Invalid category. Choose from: ${categories
        .map((c) => c.name)
        .join(", ")}`,
    });
  }

  const newTransaction = {
    id: transactions.length + 1,
    description,
    amount,
    date: date || new Date().toISOString().split("T")[0],
    category,
  };

  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
};

const updateTransaction = (req, res) => {
  const { description, amount, date, category } = req.body;
  const transaction = transactions.find(
    (t) => t.id === parseInt(req.params.id)
  );

  if (!transaction)
    return res.status(404).json({ message: "Transaction not found" });

  if (description) transaction.description = description;
  if (amount) transaction.amount = amount;
  if (date) transaction.date = date;
  if (category) transaction.category = category;

  res.json(transaction);
};

const deleteTransaction = (req, res) => {
  const { id } = req.params;
  const transactionIndex = transactions.findIndex((t) => t.id === parseInt(id));
  if (transactionIndex < 0) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  transactions.splice(transactionIndex, 1);
  res.json({ message: "Transaction deleted" });
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
