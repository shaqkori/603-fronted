require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

// Database credentials
const DB_HOST = process.env.DB_HOST || "your-aurora-endpoint";
const DB_USER = process.env.DB_USER || "your-db-user";
const DB_PASSWORD = process.env.DB_PASSWORD || "your-db-password";
const DB_NAME = process.env.DB_NAME || "your-db-name";

let connection;

// Function to establish a database connection
async function connectDB() {
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });
    console.log(" Connected to database");
  } catch (error) {
    console.error(" Database connection failed:", error);
    process.exit(1);
  }
}

// Function to create the table if it doesn't exist
async function createTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await connection.execute(createTableSQL);
  console.log(" Table 'items' is ready");
}

// Function to insert dummy data if the table is empty
async function insertDummyData() {
  const [rows] = await connection.execute(
    "SELECT COUNT(*) AS count FROM items"
  );
  if (rows[0].count === 0) {
    const insertSQL = `INSERT INTO items (name, description) VALUES (?, ?), (?, ?), (?, ?)`;
    await connection.execute(insertSQL, [
      "Item 1",
      "This is item 1",
      "Item 2",
      "This is item 2",
      "Item 3",
      "This is item 3",
    ]);
    console.log(" Dummy data inserted!");
  }
}

// Initialize Express app
const app = express();
app.use(express.json());

// GET all data
app.get("/prod/data", async (req, res) => {
  try {
    const [rows] = await connection.execute("SELECT * FROM items");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// POST new data
app.post("/prod/data", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    const insertSQL = `INSERT INTO items (name, description) VALUES (?, ?)`;
    await connection.execute(insertSQL, [name, description]);
    res.status(201).json({ success: true, message: "Item added!" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Start server and initialize database
const PORT = process.env.PORT || 80;
(async () => {
  await connectDB();
  await createTable();
  await insertDummyData();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
