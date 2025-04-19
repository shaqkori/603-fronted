const express = require("express"); // Importing express
const cors = require("cors");

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(cors());

app.use("/prod/transactions", require("./routes/transactionRoute")); // Route for transactions
app.use("/prod/categories", require("./routes/categoryRoute")); // Route for categories
app.use("/prod/savings", require("./routes/savingsRoute")); // Route for savings

const PORT = process.env.PORT || 80; // port to be exposed to run the backend server
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
