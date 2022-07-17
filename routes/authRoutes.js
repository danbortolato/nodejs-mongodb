const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

// User Resgistration
router.post("/register", async (req, res) => {

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;

    // fields check
    if (name == null || email == null || password == null || confirmpassword == null) {
        return res.status(400).json({ error: "Name and email are required" })
    }

    // passwordconfirmed check
    if (password != confirmpassword) {
        return res.status(400).json({ error: "Passwords do not match" })
    }

    // check user exists
    const emailExists = await User.findOne({ email: email });

    if(emailExists) {
        return res.status(400).json({ error: "User already exists" });
    }

    // create password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
        name: name,
        email: email,
        password: passwordHash
    });
    try {
        const newUser = await user.save();

        // Token create
        const token = jwt.sign(
            //payload 
            {
                name: newUser.name,
                id: newUser._id,
            },
            "secret"
        );
        // Token return
        res.json({ error: null, msg: "Registration Successful", token: token, userId: newUser._id });
    } catch (error) {
    res.status(400).json({ error });
    }
});

// Login user
router.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // check user exists
    const user = await User.findOne({ email: email });

    if(!user) {
        return res.status(400).json({ error: "User not exists"});
    }
    //check password
    const checkPassword = await bcrypt.compare(password, user.password);

    if(!checkPassword) {
        return res.status(400).json({ error: "Login or Password Invalid" });
    }
    // Token create
    const token = jwt.sign(
        //payload 
        {
            name: User.name,
            id: User._id,
        },
        "secret"
    );
    // Token return
    res.json({ error: null, msg: "Authentication Successful", token: token, userId: user._id });
});

module.exports = router;