const Review = require('../model/Review');
const { sendResponse } = require("../util/common");
const Book = require("../model/Book");
const { validationResult } = require("express-validator");



// Define the sendResponse function

class ReviewController {

    static async createReview(req, res) {
        try {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                // Use the validationErrors to send a response
                return sendResponse(res, 400, "Validation failed", validationErrors.array());
            }

            const { rating, review } = req.body;
            const { bookId } = req.params;

            // Retrieve the userId from req.user (assuming it's available in the JWT payload)
            const userId = req.user;

            // Check if a review with the same userId and bookId exists
            const existingReview = await Review.findOne({ bookId, userId });

            if (existingReview) {
                // If a review already exists for this user and product, send an error response
                return sendResponse(res, 400, 'You have already reviewed this product');
            }

            // Set userId explicitly when creating the review
            const ReviewModel = new Review({ bookId, userId, rating, review });
            await ReviewModel.save();

            const bookForReview = await Book.findOne({ _id: bookId });

            // Add the new review to the book's reviews
            bookForReview.reviews.push(ReviewModel._id);

            // Calculate the average rating for the book
            let totalRatings = 0;

            for (const reviewId of bookForReview.reviews) {
                const review = await Review.findOne({ _id: reviewId });
                totalRatings += review.rating;
            }

            const averageRating = totalRatings / bookForReview.reviews.length;

            // Update the book's average rating
            bookForReview.averageRating = averageRating;

            await bookForReview.save();

            sendResponse(res, 201, 'Review created successfully', bookForReview);
        } catch (error) {
            console.error("error", error);
            sendResponse(res, 500, 'Internal server error');
        }
    }


    static async editReview(req, res) {
        try {
            const { rating, review } = req.body;
            const { reviewId } = req.params;

            // Find the review to update
            const existingReview = await Review.findOne({ _id: reviewId });

            if (!existingReview) {
                // Use sendResponse to send an error response
                return sendResponse(res, 404, 'Review not found');
            }

            // Ensure that the user ID in the JWT matches the user ID associated with the review
            if (existingReview.userId.toString() !== req.user) {
                // Use sendResponse to send an error response
                return sendResponse(res, 403, 'You do not have permission to edit this review');
            }

            // Update the review if the fields are provided
            if (rating !== undefined) {
                existingReview.rating = rating;
            }

            if (review !== undefined) {
                existingReview.review = review;
            }

            // Validate the updated review
            const validationErrors = existingReview.validateSync();
            if (validationErrors) {
                const errorMessages = Object.values(validationErrors.errors).map(err => err.message);
                return sendResponse(res, 400, 'Validation failed', errorMessages);
            }

            // Save the updated review
            await existingReview.save();

            // Use sendResponse to send a success response
            sendResponse(res, 200, 'Review updated successfully');
        } catch (error) {
            console.error(error);
            sendResponse(res, 500, 'Internal server error');
        }
    }


    static async deleteReview(req, res) {
        try {
            const { reviewId } = req.params; // Extract reviewId from URL parameters

            // Find the review by its ID and remove it
            const deletedReview = await Review.findByIdAndRemove(reviewId);

            if (!deletedReview) {
                // If the review was not found, send an error response
                return sendResponse(res, 404, 'Review not found');
            }

            // Find the book associated with the deleted review
            const bookForReview = await Book.findOne({ reviews: reviewId });

            if (bookForReview) {
                // Remove the review ID from the book's reviews array
                bookForReview.reviews.pull(reviewId);
                await bookForReview.save();
            }

            // Use sendResponse to send a success response
            sendResponse(res, 200, 'Review deleted successfully');
        } catch (error) {
            console.error("error", error);
            // Use sendResponse to send an error response
            sendResponse(res, 500, 'Internal server error');
        }
    }

}

module.exports = ReviewController;
