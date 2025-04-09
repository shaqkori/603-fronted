const db = require("../config/db"); // Import MySQL connection

// Get all savings goals
const getSavings = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM savings");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching savings goals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a savings goal by ID
const getSavingsById = async (req, res) => {
  const savingsId = parseInt(req.params.id);
  try {
    const [rows] = await db.execute("SELECT * FROM savings WHERE id = ?", [
      savingsId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Savings goal not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching savings goal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new savings goal
const createSavings = async (req, res) => {
  const { name, targetAmount, currentAmount, dateCreated } = req.body;

  if (!name || !targetAmount || currentAmount === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO savings (name, targetAmount, currentAmount, dateCreated) VALUES (?, ?, ?, ?)",
      [
        name,
        targetAmount,
        currentAmount,
        dateCreated || new Date().toISOString().split("T")[0],
      ]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      targetAmount,
      currentAmount,
      dateCreated,
    });
  } catch (error) {
    console.error("Error creating savings goal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a savings goal
const updateSavings = async (req, res) => {
  const savingsId = parseInt(req.params.id);
  const { name, targetAmount, currentAmount, dateCreated } = req.body;

  try {
    const [existing] = await db.execute("SELECT * FROM savings WHERE id = ?", [
      savingsId,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Savings goal not found" });
    }

    await db.execute(
      "UPDATE savings SET name = ?, targetAmount = ?, currentAmount = ?, dateCreated = ? WHERE id = ?",
      [
        name || existing[0].name,
        targetAmount || existing[0].targetAmount,
        currentAmount !== undefined ? currentAmount : existing[0].currentAmount,
        dateCreated || existing[0].dateCreated,
        savingsId,
      ]
    );

    res.json({ id: savingsId, name, targetAmount, currentAmount, dateCreated });
  } catch (error) {
    console.error("Error updating savings goal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a savings goal
const deleteSavings = async (req, res) => {
  const savingsId = parseInt(req.params.id);
  try {
    const [result] = await db.execute("DELETE FROM savings WHERE id = ?", [
      savingsId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Savings goal not found" });
    }
    res.json({ message: "Savings goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting savings goal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getSavings,
  getSavingsById,
  createSavings,
  updateSavings,
  deleteSavings,
};
