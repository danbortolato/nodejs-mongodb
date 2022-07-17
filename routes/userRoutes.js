const router = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

// middlewares
const verifyToken = require('../helpers/check-token');

// helpers
const getUserByToken = require('../helpers/get-user-by-token');

//get user
router.get("/:id", verifyToken, async (req, res) => {
    const id = req.params.id;

    // verify  user
    try {
        const user = await User.findOne({ _id: id}, { password: 0});
        res.json({ error: null, user });
    } catch (err) {
        return res.status(400).json({ error: "User not exists"});
    }
});

// User update
router.put("/", verifyToken, async (req, res) => {

    const token = req.header("auth-token");
    const user = await getUserByToken(token);
    const userReqId = req.body.id;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    const userId = user._id.toString();

    // check if user id is equal token id
    if(userId != userReqId) {
        res.status(401).json({ error: "Invalid Token" });
    }

    // create user object
    const updateData = {
        name: req.body.name,
        email: req.body.email,
    };

    // check password match
    if(password != confirmpassword) {
        res.status(401).json({ error: "Password does not match" });
    // change password
    } else if(password == confirmpassword && password != null) {
        // create password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // update password
        updateData.password = passwordHash;

    }

    try {

        // Return update data
        const updatedUser = await User.findOneAndUpdate({ _id: userId}, { $set: updateData }, {new: true});
        res.json({error: null, msg: "Updated user successfully"});
    } catch(error) {
        res.status(400).json({ err });
    }

});

module.exports = router;