const Review = require('../model/Review');
const { sendResponse } = require("../util/common");
const Book = require("../model/Book");


// Define the sendResponse function

class ReviewController {
    static async createReview(req, res) {
        try {
            const { userId, rating, review } = req.body;
            const { bookId } = req.params;

            // Check if a review with the same userId and bookId exists
            const existingReview = await Review.findOne({ userId, bookId });

            if (existingReview) {
                // If a review already exists for this user and product, send an error response
                return sendResponse(res, 400, 'You have already reviewed this product');
            }

            const ReviewModel = new Review({ bookId, userId, rating, review });
            await ReviewModel.save();

            const bookForReview = await Book.findOne({ _id: bookId });
            bookForReview.reviews.push(ReviewModel._id);
            await bookForReview.save();

            sendResponse(res, 201, 'Review created successfully');
        } catch (error) {
            console.error("error", error);
            sendResponse(res, 500, 'Internal server error');
        }
    }


    static async editReview(req, res) {
        try {
            const { userId, rating, review } = req.body;
            const { bookId, reviewId } = req.params;

            // console.log("req.body: ", req.body);
            //  console.log("req.params: ", req.params);

            // Validate the rating and review as needed

            // Find the review to update
            const existingReview = await Review.findOne({ _id: reviewId });

            if (!existingReview) {
                // Use sendResponse to send an error response
                sendResponse(res, 404, 'Review not found');
                return;
            }

            // Update the review
            existingReview.rating = rating;
            existingReview.review = review;
            await existingReview.save();

            // Use sendResponse to send a success response
            sendResponse(res, 200, 'Review updated successfully');
        } catch (error) {
            console.error(error);
            // Use sendResponse to send an error response
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
