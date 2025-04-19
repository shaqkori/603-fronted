const express = require("express");

const { getCategories } = require("../controllers/categoryController");

const router = express.Router(); // creates a new router instance

router.get("/", getCategories); // defines the route for getting all categories

module.exports = router;
