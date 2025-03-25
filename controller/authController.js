const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


require("dotenv").config();

// Generate Access Token secret 
const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

// Generate Refresh Token secret 
const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};



// Create User Registration 
router.post('/register', async (req, res) => {
    console.log(req.body);
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(401).json({ message: "All feilds are required" });
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
            return res.status(400).send({ message: "Invalid Email" });
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

module.exports = router; 