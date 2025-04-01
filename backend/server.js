const express = require("express");
const transactionRoutes = require("./routes/transactionRoute");
const cors = require("cors");

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(cors());

app.use("/prod/transactions", transactionRoutes);
app.use("/prod/categories", require("./routes/categoryRoute"));
app.use("/prod/savings", require("./routes/savingsRoute"));

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
