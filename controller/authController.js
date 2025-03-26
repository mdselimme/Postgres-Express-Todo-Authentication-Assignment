const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


require("dotenv").config();

const emails = [];

// Generate Access Token secret 
const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

// Generate Refresh Token secret 
const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30s" });
};

// login refresh token 
router.post('/login', async (req, res) => {

    // #swagger.tags = ['Authorization']
    const logInData = req.body;
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }


    // Log In Method Start
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

        const accessToken = generateAccessToken({ email });
        console.log("access token", accessToken);

        const refreshToken = generateRefreshToken({ email });
        console.log("refresh token", refreshToken);

        emails.push({ email, refreshToken });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" })
        console.log(logInData)

        // Users Data Send 
        const usersData = {
            id: userEmailExits.rows[0].id,
            name: userEmailExits.rows[0].name,
        };
        res.status(200).json({ message: "Login successful", data: usersData, accessToken });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Internal Error" });
    };
    // Log In Method end


});

// refresh router make 
router.post("/refresh", (req, res) => {
    // #swagger.tags = ['Authorization']
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401).json({ message: "Unauthorized" });
    console.log(refreshToken);

    const storeEmail = emails.find((email) => email.refreshToken === refreshToken);
    if (!storeEmail) return res.sendStatus(403).json({ message: "Refused Unauthorized" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, auth) => {
        if (err) return res.sendStatus(403).json({ message: "Unauthorized" });
        const accessToken = generateAccessToken({ email: auth.email });
        res.sendStatus(200).json({ accessToken });
    })

})

// LogOut System Refresh Cookie 
router.post("/logout", (req, res) => {
    // #swagger.tags = ['Authorization']
    res.clearCookie("refreshToken");
    res.sendStatus(204).statusMessage("Log Out Successful")
})



// Create User Registration 
router.post('/register', async (req, res) => {
    // #swagger.tags = ['Authorization']
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



module.exports = router; 