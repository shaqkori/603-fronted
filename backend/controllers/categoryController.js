const categories = [
  { id: 1, name: "Groceries" },
  { id: 2, name: "Subscription" },
  { id: 3, name: "Transportation" },
  { id: 4, name: "Food & Drink" },
  { id: 5, name: "Utilities" },
  { id: 6, name: "Entertainment" },
  { id: 7, name: "Healthcare" },
  { id: 8, name: "Miscellaneous" },
];

const getCategories = (req, res) => {
  res.json(categories);
};

module.exports = {
  categories,
  getCategories,
};
