// const mongoose = require('mongoose');
const { sendResponse } = require("./util/common")
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
const MailRouter = require("./routes/Mail");
const FileRouter = require("./routes/File");
const multer = require("multer");

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
app.use("/mail", MailRouter);
app.use("/files", FileRouter);

app.use((err, req, res, next) => {
    console.log(err);
    if (err instanceof multer.MulterError) {
        return sendResponse(res, 404, err.message);
    } else {
        next(err);
    }
});


// Define your routes and middleware above this catch-all route.

// Custom error handling middleware
app.use((err, req, res, next) => {
    // Check if the error is a 404 (Not Found) error
    if (err.status === 404) {
        return sendResponse(res, 404, 'Not Found', 'The requested URL was not found on this server');
    }

    // Handle other errors with a 500 (Internal Server Error) status
    sendResponse(res, 500, 'Internal Server Error', 'Something went wrong on the server');

    // Log the error for debugging (optional)
    console.error(err);
});

// Catch-all route handler for undefined routes
app.all('*', (req, res) => {
    sendResponse(res, 404, 'Not Found', 'The requested URL was not found on this server');
});

databaseConnection(() => {
    app.listen(8000, () => {
        // console.log(process.env.TEST_DB);
        console.log("Server is running on port 8000");
    });
})

