const jwt = require('jsonwebtoken');
require("dotenv").config();



const authenticateToken = (req, res, next) => {

    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Access Denied: No token Provided" });

    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(verified)
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json(error, { message: "Invalid Token" });
    }
};

module.exports = authenticateToken;