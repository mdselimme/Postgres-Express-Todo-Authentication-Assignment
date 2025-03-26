const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3000;
require("dotenv").config();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

app.use(express.static("public"));
app.use(cookieParser());

app.use(cors({
  credentials: true,
  origin: ["http://localhost:5173"]
}));




app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Routes Create
const todoRoutes = require("./routes/todos");
const authRoutes = require("./controller/authController");


// Routes
app.use("/api/todos", todoRoutes);
app.use("/api/user", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Todo API" });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
