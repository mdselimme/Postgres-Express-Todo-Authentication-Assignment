# 📜 Assignment: Implement Authentication and User-Specific Todo Management in Node.js 🚀

## **🎯 Objective:**
Modify the existing `todo-app-backend` project to support authentication, user-specific todo management, and follow the MVC pattern. The database should be migrated to PostgreSQL hosted on Supabase, and the project should be deployed using Vercel or Render.

---

## **✅ Checkpoints & Requirements**

### **1️⃣ Database Modification (10 Marks) 📂**
- Modify the current database schema to include a `users` table.
- Add a `user_id` field in the `todos` table to associate todos with users.
- Ensure proper indexing for efficient queries.
- Example table schema:
  
  ```sql
  CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL
  );

  CREATE TABLE todos (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE
  );
  ```

---

### **2️⃣ Database Hosting on Supabase (10 Marks) 🛢️**
- Set up a PostgreSQL database on Supabase.
- Secure database access using environment variables.
- Connect the Node.js backend to Supabase.

---

### **3️⃣ Implement MVC Pattern (10 Marks) 🎭**
- Follow the Model-View-Controller (MVC) pattern for better code organization.
- **Model:** Handles database operations.
- **View:** Not applicable for APIs but can be represented by JSON responses.
- **Controller:** Contains business logic and interacts with the model.
- Example folder structure:
  
  ```
  /models
      userModel.js
      todoModel.js
  /controllers
      authController.js
      todoController.js
  /routes
      authRoutes.js
      todoRoutes.js
  ```
  
- Example model for `users`:
  
  ```javascript
  const db = require("../db");
  async function createUser(name, email, hashedPassword) {
      return db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [name, email, hashedPassword]);
  }
  ```

---

### **4️⃣ User-Specific Todo Operations (15 Marks) ✅**
- Ensure a user can only view, update, or delete their own todos.
- Example implementation in the controller:
  
  ```javascript
  async function getTodos(req, res) {
      const userId = req.user.id;
      const todos = await db.query("SELECT * FROM todos WHERE user_id = $1", [userId]);
      res.json(todos.rows);
  }
  ```

---

### **5️⃣ Introduce Authentication Middleware (15 Marks) 🔐**
- Implement JWT-based authentication.
- Protect todo routes using middleware.
- Example middleware:
  
  ```javascript
  function authMiddleware(req, res, next) {
      const token = req.header("Authorization");
      if (!token) return res.status(401).json({ error: "Access denied" });
      
      try {
          const verified = jwt.verify(token, process.env.JWT_SECRET);
          req.user = verified;
          next();
      } catch (err) {
          res.status(400).json({ error: "Invalid token" });
      }
  }
  ```

---

### **6️⃣ Implement User Authentication Routes (20 Marks) 🛠️**
- Implement the following routes:
  - `POST /register` → Register a new user
  - `POST /login` → Authenticate user and return JWT
  - `POST /logout` → Invalidate user session
  
- Implement **password hashing** before storing passwords using bcrypt.
  
  ```javascript
  const bcrypt = require("bcrypt");
  
  router.post("/register", async (req, res) => {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [name, email, hashedPassword]);
      res.json({ message: "User registered successfully" });
  });
  ```

---

### **7️⃣ Implement API Documentation (10 Marks) 📜**
- Set up **Swagger API Docs** for your backend.
- Ensure all routes are well documented.
- Host Swagger UI and submit the link along with your deployed project.

---

### **8️⃣ Bonus: Implement Refresh Token System (5 Marks) 🔄**
- Store refresh tokens securely.
- Implement token rotation.
- **Definition:**
  - **Access Token:** A short-lived token used for authentication.
  - **Refresh Token:** A long-lived token used to obtain a new access token without requiring re-login.

---

### **9️⃣ Deploy on Vercel or Render (10 Marks) 🚀**
- Ensure proper `.env` configuration.
- Enable continuous deployment from GitHub.

---

### **🔟 Bonus: Manual Deployment on a Server (5 Marks) 🖥️**
- If students manually deploy on a Linux server, provide a deployment guide.

---

## **📊 Marking Distribution:**
| Task | Marks |
|------|-------|
| Database Modification | 10 |
| Database Hosting | 10 |
| Implement MVC Pattern | 10 |
| User-Specific Todo Operations | 15 |
| Authentication Middleware | 15 |
| Authentication Routes | 20 |
| API Documentation (Swagger) | 10 |
| Deployment | 10 |
| Bonus: Refresh Token | 5 |
| Bonus: Manual Deployment | 5 |
| **Total** | **100 (+10 Bonus)** |

---

## **📤 Submission Guidelines:**
- Submit a GitHub repository link.
- Provide a README with setup instructions.
- Include a `.env.example` file with required environment variables.
- Ensure the project follows the MVC pattern.
- Submit the **deployed API link** along with the **Swagger API documentation link**.

---

## **📌 Notes for Students:**
- Follow best practices for security and performance.
- Properly structure your controllers, models, and routes.
- Comment your code for better understanding.

---

**🔥 Good Luck! Happy Coding! 🚀**
