const db = require("../config/db");

//gets the connection to the database

const getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute("SELECT * FROM categories"); // Fetch all categories from db 
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error); // error handling
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCategories,
};
