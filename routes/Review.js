const express = require("express");
const ReviewController = require("../controller/ReviewController");
const { reviewValidator } = require("../middleware/validation");
const { isAuthenticated, isUser } = require("../middleware/auth");
const routes = express.Router(); // Use express.Router() to create a router instance

//routes.get("/:productId", ReviewController.reviewById);
routes.post("/add/:bookId", isAuthenticated, isUser, reviewValidator.addReview, ReviewController.createReview);
routes.patch("/edit/:reviewId", isAuthenticated, isUser, reviewValidator.editReview, ReviewController.editReview);
routes.delete("/delete/:reviewId", isAuthenticated, isUser, ReviewController.deleteReview);


module.exports = routes;
