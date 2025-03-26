const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3000;
require("dotenv").config();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./public/swagger-output.json');
// const swaggerUiAssetPath = require("swagger-ui-dist").getAbsoluteFSPath()

app.use(express.static("public"));
app.use(cookieParser());

app.use(cors({
  credentials: true,
  origin: ["http://localhost:5173"]
}));

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
  customCssUrl: CSS_URL
}));
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
