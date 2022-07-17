// modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// routes

//middleware

// config
const dbName = "nodejs-db";
const port = 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// mongodb configuration
mongoose.createConnection(
    'mongodb://localhost/{{dbName}}',
);

// express routes

app.get('/', (req, res) => {
    
    res.json({ message: "Route Test"});

});

app.listen(port, () => {
    console.log('Server listening on port', port);
});
