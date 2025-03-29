const { categories } = require("../controllers/categoryController");

const transactions = [
  {
    id: 1,
    description: "Grocery Store",
    amount: 50.25,
    date: "2024-03-01",
    category: "Groceries",
    type: "expense",
  },
  {
    id: 2,
    description: "Netflix",
    amount: 15.99,
    date: "2024-03-02",
    category: "Subscription",
    type: "expense",
  },
  {
    id: 3,
    description: "Freelance Payment",
    amount: 500.0,
    date: "2024-03-03",
    category: "Income",
    type: "income",
  },
  {
    id: 4,
    description: "Gas Station",
    amount: 40.0,
    date: "2024-03-03",
    category: "Transportation",
    type: "expense",
  },
];

const getTransactions = (req, res) => {
  res.json(transactions);
};

const getTransactionById = (req, res) => {
  const transactionId = parseInt(req.params.id);
  console.log(`Fetching transaction with ID: ${transactionId}`);
  const transaction = transactions.find((t) => t.id === transactionId);

  if (!transaction) {
    console.log(`Transaction with ID: ${transactionId} not found`);
    return res.status(404).json({ message: "Transaction not found" });
  }

  res.json(transaction);
};

const createTransaction = (req, res) => {
  console.log("Categories:", categories); // Debugging log

  const { description, amount, date, category, type } = req.body;

  // Validate required fields
  if (!description || !amount || !category || !type) {
    return res.status(400).json({
      message:
        "Missing required fields: description, amount, category, and type are required.",
    });
  }

  // Validate type (must be either 'income' or 'expense')
  if (type !== "income" && type !== "expense") {
    return res.status(400).json({
      message: "Invalid type. Must be either 'income' or 'expense'.",
    });
  }

  // Validate amount (must be a number greater than 0)
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      message: "Invalid amount. Must be a number greater than 0.",
    });
  }

  // Validate category
  const isValidCategory = categories.some((c) => c.name === category);
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
    amount: parseFloat(amount),
    date: date || new Date().toISOString().split("T")[0],
    category,
    type,
  };

  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
};

const updateTransaction = (req, res) => {
  const transactionId = parseInt(req.params.id);
  const { description, amount, date, category, type } = req.body;

  const transaction = transactions.find((t) => t.id === transactionId);
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  if (description) transaction.description = description;
  if (amount) {
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount. Must be a number greater than 0.",
      });
    }
    transaction.amount = parseFloat(amount);
  }
  if (date) transaction.date = date;
  if (category) {
    const isValidCategory = categories.some((c) => c.name === category);
    if (!isValidCategory) {
      return res.status(400).json({
        message: `Invalid category. Choose from: ${categories
          .map((c) => c.name)
          .join(", ")}`,
      });
    }
    transaction.category = category;
  }
  if (type) {
    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        message: "Invalid type. Must be either 'income' or 'expense'.",
      });
    }
    transaction.type = type;
  }

  res.json(transaction);
};

const deleteTransaction = (req, res) => {
  const transactionId = parseInt(req.params.id);
  const transactionIndex = transactions.findIndex(
    (t) => t.id === transactionId
  );
  if (transactionIndex < 0) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  transactions.splice(transactionIndex, 1);
  res.json({ message: "Transaction deleted successfully" });
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
