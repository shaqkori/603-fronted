const express = require("express");
const transactionRoutes = require("./routes/transactionRoute");

const app = express();
app.use(express.json()); // Middleware to parse JSON

app.use("/transactions", transactionRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
