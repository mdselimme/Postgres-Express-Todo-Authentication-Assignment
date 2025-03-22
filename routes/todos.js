const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require('bcrypt');



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
    const suger = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, suger);

    // User Registration method 
    const createUser = await db.query(
      `INSERT INTO users (name, email, password) VALUES($1, $2, $3) RETURNING id, name, email`, [name, email, hashPassword]
    )
    res.status(201).json({ message: "User Created Successfully", user: createUser.rows[0] });

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server Internal Error" });
  }

})

// GET all todos
router.get("/", async (req, res, next) => {
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

//GET single todo
router.get("/:id", async (req, res, next) => {
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
router.post("/", async (req, res, next) => {
  console.log(req.body);
  try {
    const { user_id, title, completed } = req.body;
    if (!title) {
      res.status(400).send({ message: "Title is required" });
      return;
    }
    const sql = `INSERT INTO todos (user_id, title, description) values($1,$2, $3)`
    const params = [user_id, title, completed];
    const result = db.query(sql, params);
    res.status(201).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

//DELETE one single todo
router.delete("/:id", async (req, res, next) => {
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
router.put("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, description, is_completed } = req.body;
    if (!title) {
      res.status(400).send("title is required");
      return;
    }
    if (!description) {
      res.status(400).send("description is required");
      return;
    }
    if (!is_completed) {
      res.status(400).send("is_completed is required");
      return;
    }
    const sql =
      "UPDATE todos SET title = $1, description = $2, is_completed = $3 WHERE id = $4 RETURNING *";
    const params = [title, description, is_completed, id];
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