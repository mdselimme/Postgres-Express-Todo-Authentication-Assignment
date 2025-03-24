const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require("../middleswares/middlewares")


// Create User Registration 
router.post('/register', async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All feilds are required" });
  }
  try {
    // Check Email Duplicate 
    const checkEmail = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: "Already Have An Account" });
    };

    // Hashpassword method 
    const sugerLimit = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, sugerLimit);

    // User Registration method 
    const createUser = await db.query(
      `INSERT INTO users (name, email, password) VALUES($1, $2, $3) RETURNING id, name, email`, [name, email, hashPassword]
    )
    res.status(201).json({ message: "User Created Successfully", user: createUser.rows[0] });

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server Internal Error" });
  }
});

// Log In User 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    // Email Compare Check 
    const userEmailExits = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (userEmailExits.rows.length === 0) {
      return res.status(400).json({ message: "Invalid Email Or Password" });
    }

    // Password Compare 
    const passMathch = await bcrypt.compare(password, userEmailExits.rows[0].password);
    if (!passMathch) {
      return res.status(400).json({ message: "Invalid Email Or Password" });
    }

    // Generate Json Web Token 
    const webToken = jwt.sign(
      { id: userEmailExits.rows[0].id, email: userEmailExits.rows[0].email },
      process.env.JWT_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: "Login successful", data: { id: userEmailExits.rows[0].id, name: userEmailExits.rows[0].name, email: userEmailExits.rows[0].email }, webToken });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Internal Error" });
  };
});



// GET all todos
router.get("/", async (req, res) => {
  try {
    const sql = "SELECT * FROM todos ORDER BY created_at DESC";
    const result = await db.query(
      sql
    );
    if (result.rows.length == 0) {
      res.status(404).json(result.rows);
      return;
    }
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Get Specific user todos 
router.get("/user/:user_id", authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await db.query(`SELECT * FROM todos WHERE user_id = $1`, [user_id]);
    res.status(200).json(result.rows)
  } catch (error) {
    res.status(500).send(error, { message: "Internal server error" });
  }

})

//GET single todo
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const sql = "SELECT * FROM todos WHERE id  = $1 ORDER BY created_at DESC";
    const params = [id];
    const result = await db.query(sql, params);
    if (result.rows.length == 0) {
      res.status(404).json(result.rows[0]);
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

//POST one single todo
router.post("/", authenticateToken, async (req, res) => {
  const { user_id, title, completed } = req.body;
  const userExits = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id]);
  if (userExits.rows.length === 0) {
    return res.status(400).json({ message: "User not Found" });
  }
  try {
    if (!title || !user_id || !completed) {
      res.status(400).send({ message: "All fields are required." });
      return;
    }
    const sql = `INSERT INTO todos (user_id, title, completed) values($1,$2, $3)`
    const params = [user_id, title, completed];
    const result = await db.query(sql, params);
    console.log(result)
    res.status(201).json((result.rows, { message: "Task Submitted Successfully" })
    )
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

//DELETE one single todo
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const sql = "DELETE FROM todos WHERE id  = $1 returning *";
    const params = [id];
    const result = await db.query(sql, params);
    if (result.rows.length == 0) {
      res.status(404).json(result.rows[0]);
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

//Update one single todo
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, is_completed } = req.body;
    if (!title || !is_completed) {
      res.status(400).send("All fields Are Required");
      return;
    }
    const sql = "UPDATE todos SET title = $1, is_completed = $2 WHERE id = $3 RETURNING *";
    const params = [title, is_completed, id];
    const result = await db.query(sql, params);
    if (result.rows.length == 0) {
      res.status(404).json(result.rows[0]);
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});


module.exports = router; 