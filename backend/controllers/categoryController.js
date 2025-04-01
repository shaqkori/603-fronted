const db = require("../config/db");

const getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute("SELECT * FROM categories");
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCategories,
};
