// const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const databaseConnection = require("./config/database");
const BookRouter = require("./routes/Book");
const UserRouter = require("./routes/User");
const AuthRouter = require("./routes/Auth");
const CartRouter = require("./routes/Cart");
const TransactionRouter = require("./routes/Transaction");
const ReviewRouter = require("./routes/Review");


// morgan LogFile configuration
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flags: "a" }
);


dotenv.config();

app.use(cors({ origin: "*" }));
app.use(express.json()); // Parses data as JSON
app.use(express.text()); // Parses data as text
app.use(express.urlencoded({ extended: true })); // Parses data as urlencoded

app.use(morgan("combined", { stream: accessLogStream }));
app.use("/books", BookRouter);
app.use("/users", UserRouter);
app.use("/auth", AuthRouter);
app.use("/cart", CartRouter);
app.use("/transactions", TransactionRouter);
app.use("/reviews", ReviewRouter);




databaseConnection(() => {
    app.listen(8000, () => {
        // console.log(process.env.TEST_DB);
        console.log("Server is running on port 8000");
    });
})