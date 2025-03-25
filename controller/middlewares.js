const jwt = require('jsonwebtoken');
require("dotenv").config();



const authenticateToken = (req, res, next) => {

    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
        console.log(verified)
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json(error, { message: "Invalid Token" });
    }
};

module.exports = authenticateToken;