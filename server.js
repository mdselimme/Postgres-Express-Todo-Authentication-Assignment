const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const app = express();
const swaggerUi = require('swagger-ui-express');
const cookieParser = require("cookie-parser");
const YAML = require("yamljs");
const PORT = process.env.PORT || 3000;
require("dotenv").config();


app.use(express.static("public"));

app.use(cors({
  credentials: true,
  origin: ["http://localhost:5173"]
}))

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());


const todoRoutes = require("./routes/todos");
const authRoutes = require("./controller/authController");



const swaggerDocs = YAML.load("swagger.yaml");


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


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
