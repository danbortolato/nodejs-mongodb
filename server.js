// modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// routes
const authRouter = require("./routes/authRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const blogRouter = require("./routes/blogRoutes.js");
//middleware

// config
const dbName = "nodejs-db";
const port = 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/blog", blogRouter);

// mongodb configuration
mongoose.connect(
    'mongodb://localhost/nodejs-db',
);

// express routes
app.get('/', (req, res) => {
    
    res.json({ message: "Route Test"});

});

app.listen(port, () => {
    console.log('Server listening on port', port);
});
