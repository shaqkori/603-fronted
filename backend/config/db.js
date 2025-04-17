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
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table 'users' is ready");

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table 'categories' is ready");

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category_id INT,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX (user_id),
        INDEX (category_id)
      )
    `);
    console.log("Table 'transactions' is ready");

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS savings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        goal_name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(10,2) NOT NULL,
        current_amount DECIMAL(10,2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX (user_id)
      )
    `);
    console.log("Table 'savings' is ready");

    console.log("All tables are ready");
  } catch (error) {
    console.error("Error creating tables:", error);
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
      "Income",
    ];

    for (const category of categories) {
      await connection.execute(
        `INSERT IGNORE INTO categories (name) VALUES (?)`,
        [category]
      );
    }

    console.log("Default categories inserted (if not already present)");
  } catch (error) {
    console.error("Error inserting categories:", error);
    process.exit(1);
  }
}

testConnection();

module.exports = pool;

//tables create like this only to showcase the functionality idealy the schema is initiated when the workflow is deployed once rarher than
// any time  the contain is spin up
