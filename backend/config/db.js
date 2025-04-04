const mysql = require("mysql2/promise");

// Database credentials
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// Create a connection pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to database");

    await createTables(connection); // Create tables
    await insertCategories(connection); // Insert default categories

    connection.release(); // Release connection back to pool
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

// Function to create tables
async function createTables(connection) {
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        category_id INT,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS savings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(10,2) NOT NULL,
        current_amount DECIMAL(10,2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Tables are ready");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  }
}

// Function to insert default categories
async function insertCategories(connection) {
  try {
    const categories = [
      "Food",
      "Rent",
      "Entertainment",
      "Utilities",
      "Savings",
      "income",
    ];

    for (const category of categories) {
      await connection.execute(
        `INSERT IGNORE INTO categories (name) VALUES (?)`,
        [category]
      );
    }

    console.log("✅ Default categories inserted (if not already present)");
  } catch (error) {
    console.error("❌ Error inserting categories:", error);
    process.exit(1);
  }
}

testConnection();

module.exports = pool;
