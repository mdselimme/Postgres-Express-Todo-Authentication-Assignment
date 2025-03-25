const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const app = express();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3000;
require("dotenv").config();




app.use(cors({
  credentials: true
}))

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

const todoRoutes = require("./routes/todos");
const authRoutes = require("./controller/authController");


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TODO API',
      version: '1.0.0',
      description: 'API documentation for the TODO website',
      contact: {
        name: 'Md Selim',
        email: 'contact.mdselim.dev@gmail.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server'
      }
    ]
  },
  apis: ['*js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
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
