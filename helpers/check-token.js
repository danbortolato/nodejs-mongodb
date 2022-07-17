const jwt = require('jsonwebtoken');

// middleware token validators
const checkToken = (req, res, next) => {
    const token = req.header("auth-token");

    if(!token) {
        return res.status(400).json({ error: "Authentication failed"});
    }
    try {
        const verified = jwt.verify(token, "secret");
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid token"});
    }
};

module.exports = checkToken;