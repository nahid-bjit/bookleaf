const express = require("express");
const ReviewController = require("../controller/ReviewController");
const routes = express.Router(); // Use express.Router() to create a router instance

//routes.get("/:productId", ReviewController.reviewById);
routes.post("/add/:bookId", ReviewController.createReview);
routes.patch("/edit/:reviewId", ReviewController.editReview);
routes.delete("/delete/:reviewId", ReviewController.deleteReview);


module.exports = routes;
