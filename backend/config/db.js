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
  connectionLimit: 10, // Maximum number of connections
  queueLimit: 0, // No limit on request queue
});

// Function to test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to database");
    connection.release(); // Release connection back to pool
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();

module.exports = pool;
