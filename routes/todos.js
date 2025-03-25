const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateToken = require("../controller/middlewares")


// GET all todos
router.get("/", async (req, res) => {
  try {
    const sql = "SELECT * FROM todos ORDER BY id ASC";
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
    const sql = "SELECT * FROM todos WHERE id  = $1";
    const params = [id];
    const result = await db.query(sql, params);
    console.log(result.rows)
    if (result.rows.length === 0) {
      res.status(404).json("No data found");
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
    if (!title || !user_id) {
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
    if (!title) {
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