let savings = [
  {
    id: 1,
    name: "Emergency Fund",
    targetAmount: 1000,
    currentAmount: 200,
    dateCreated: "2024-03-01",
  },
  {
    id: 2,
    name: "Vacation",
    targetAmount: 2000,
    currentAmount: 500,
    dateCreated: "2024-03-02",
  },
];

const getSavings = (req, res) => {
  res.json(savings);
};

const getSavingsById = (req, res) => {
  const savingsId = parseInt(req.params.id);
  console.log(`Fetching savings with ID: ${savingsId}`);
  const saving = savings.find((s) => s.id === savingsId);

  if (!saving) {
    console.log(`Savings with ID: ${savingsId} not found`);
    return res.status(404).json({ message: "Savings not found" });
  }

  res.json(saving);
};

const createSavings = (req, res) => {
  const { name, targetAmount, currentAmount, dateCreated } = req.body;

  savings.push({
    id: savings.length + 1,
    name,
    targetAmount,
    currentAmount,
    dateCreated,
  });

  res.status(201).json({ message: "Savings goal created" });
};

const updateSavings = (req, res) => {
  const { name, targetAmount, currentAmount, dateCreated } = req.body;
  const saving = savings.find((s) => s.id === parseInt(req.params.id));

  if (!saving)
    return res.status(404).json({ message: "Savings goal not found" });

  saving.name = name;
  saving.targetAmount = targetAmount;
  saving.currentAmount = currentAmount;
  saving.dateCreated = dateCreated;

  res.json(saving);
};

const deleteSavings = (req, res) => {
  const savingsId = parseInt(req.params.id);
  const index = savings.findIndex((s) => s.id === savingsId);

  if (index === -1)
    return res.status(404).json({ message: "Savings goal not found" });

  savings.splice(index, 1);
  res.json({ message: "Savings goal deleted" });
};

module.exports = {
  getSavings,
  getSavingsById,
  createSavings,
  updateSavings,
  deleteSavings,
};
