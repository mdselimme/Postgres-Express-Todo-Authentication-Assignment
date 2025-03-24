const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();

app.use(cors())

const todoRoutes = require("./routes/todos");



// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/todos", todoRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Todo API" });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
