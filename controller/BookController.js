const { validationResult } = require("express-validator");
const { sendResponse } = require("../util/common");
const BookModel = require("../model/Book");
//const Review = require('../model/Review');
const HTTP_STATUS = require("../constants/statusCodes");

class BookController {

    async getAll(req, res) {
        try {
            const {
                page = 1,
                limit,
                sortParam,
                sortOrder,
                search,
                author
            } = req.query;

            // Pagination
            const parsedPage = parseInt(page) || 1;
            const parsedLimit = parseInt(limit) || 20;

            if (parsedPage < 1 || parsedLimit < 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Page and limit values must be at least 1");
            }

            // Order - Asc and Desc part
            const validSortOrders = ['asc', 'desc'];
            if (sortOrder && !validSortOrders.includes(sortOrder)) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, "Invalid input parameter for sortOrder");
            }

            // Sort
            let sortObj = {};
            if (sortParam === 'price') {
                sortObj = { price: sortOrder === 'asc' ? 1 : -1 };
            } else if (sortParam === 'stock') {
                sortObj = { stock: sortOrder === 'asc' ? 1 : -1 };
            }

            // Search
            const searchQuery = search && {
                $or: [
                    { title: { $regex: new RegExp(search, 'i') } },
                    { author: { $regex: new RegExp(search, 'i') } },
                    { description: { $regex: new RegExp(search, 'i') } }
                ]
            };

            // Combine sorting and search queries
            const query = {
                ...searchQuery
            };

            const totalCount = await BookModel.countDocuments();
            const skipCount = (parsedPage - 1) * parsedLimit;
            const adjustedLimit = totalCount < parsedLimit ? totalCount : parsedLimit;

            // The combined query
            const books = await BookModel.find(query)
                // .skip(skipCount)
                // .limit(adjustedLimit)
                .sort(sortObj)
                .populate('reviews'); // Populate the 'reviews' field

            if (books.length === 0) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "No books were found");
            }

            return sendResponse(res, HTTP_STATUS.OK, "Successfully received all the books", {
                total: totalCount,
                countPerPage: books.length,
                books: books,
            });
        } catch (error) {
            console.error(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }


    async getOneById(req, res) {
        try {
            const { id } = req.params;
            const book = await BookModel.findOne({ _id: id })
                .populate('reviews')
                .select('-reviews._id'); // Exclude review IDs

            if (book) {
                // Calculate the average rating
                let totalRatings = 0;
                if (book.reviews && book.reviews.length > 0) {
                    for (const review of book.reviews) {
                        totalRatings += review.rating;
                    }
                    book.averageRating = totalRatings / book.reviews.length;
                    await book.save();
                } else {
                    // If there are no reviews, set the average rating to 0 or any default value.
                    book.averageRating = 0;
                }

                // Use sendResponse to send a success response with the book including average rating
                sendResponse(res, HTTP_STATUS.OK, "Successfully received the book", book);
            } else {
                // Use sendResponse to send an error response
                sendResponse(res, HTTP_STATUS.OK, "Book does not exist", null);
            }
        } catch (error) {
            console.log(error);
            // Use sendResponse to send an error response
            sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error", null);
        }
    }


    async create(req, res) {
        console.log("request body: ", req.file)
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                // Use sendResponse to send an error response with BAD_REQUEST status code
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, "Failed to add the product", validation);
            }
            const { title, description, price, stock, author } = req.body;

            const existingProduct = await BookModel.findOne({ title: title });

            if (existingProduct) {
                // Use sendResponse to send an error response with NOT_FOUND status code
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book with the same title already exists");
            }

            const newBook = await BookModel.create({
                title: title,
                description: description,
                price: price,
                stock: stock,
                author: author,
            });

            if (newBook) {
                // Use sendResponse to send a success response
                return sendResponse(res, HTTP_STATUS.OK, "Successfully added product", newBook);
            }
        } catch (error) {
            console.log(error);
            // Use sendResponse to send an error response with INTERNAL_SERVER_ERROR status code
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }


    async deleteById(req, res) {
        try {
            const { id } = req.params;
            const result = await BookModel.deleteOne({ _id: id });

            if (result.deletedCount > 0) {
                // Use sendResponse to send a success response
                sendResponse(res, 200, "Successfully deleted the product");
            } else {
                // Use sendResponse to send an error response
                sendResponse(res, 400, "Data not found");
            }
        } catch (error) {
            // Use sendResponse to send an error response
            sendResponse(res, 500, "Internal server error");
        }
    }

    async updateById(req, res) {
        try {
            const { id } = req.params;
            const updatedData = req.body;

            // Check if the document exists before updating
            const existingDocument = await BookModel.findOne({ _id: id });

            if (!existingDocument) {
                // Use sendResponse to send an error response
                sendResponse(res, HTTP_STATUS.BAD_REQUEST, "Document not found");
                return; // Return early to avoid further processing
            }

            // Attempt to update the document and retrieve the updated object
            const updatedBook = await BookModel.findOneAndUpdate({ _id: id }, { $set: updatedData }, { new: true });

            if (updatedBook) {
                // Include the updated book object in the response JSON
                const response = {
                    message: "Successfully updated the product",
                    updatedBook // Include the updated book object here
                };

                sendResponse(res, HTTP_STATUS.OK, response);
            } else {
                sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to update the product");
            }
        } catch (error) {
            console.log("error: ", error);
            // Use sendResponse to send an error response
            sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }


    // Controller to give a discount to one or multiple books
    async giveDiscount(req, res) {
        try {
            const { bookIds } = req.body;
            const { discountedPrice, discountPercentage, discountEndDate } = req.body;

            // Find the books by their IDs
            const books = await BookModel.find({ _id: { $in: bookIds } });

            if (books.length === 0) {
                return sendResponse(res, 404, 'No books found with the provided IDs');
            }

            // Check if any of the selected books already have a discount
            const booksWithDiscount = books.filter(book => book.discountPercentage > 0 || book.discountedPrice > 0);

            if (booksWithDiscount.length > 0) {
                // Include the books with discounts in the response
                const response = {
                    message: 'Some of the selected books already have a discount applied',
                    discountedBooks: booksWithDiscount
                };
                return sendResponse(res, 400, response);
            }

            // Update the discount information for each book
            books.forEach(async (book) => {
                book.discountedPrice = discountedPrice;
                book.discountPercentage = discountPercentage;
                book.discountEndDate = discountEndDate;

                // Save the updated book
                await book.save();
            });

            return sendResponse(res, 200, 'Discount applied successfully to selected books');
        } catch (error) {
            console.error(error);
            return sendResponse(res, 500, 'Internal server error');
        }
    }



    async updateDiscount(req, res) {
        try {
            const { bookIds } = req.body;
            const { discountedPrice, discountPercentage, discountEndDate } = req.body;

            // Find the books by their IDs
            const books = await BookModel.find({ _id: { $in: bookIds } });

            if (books.length === 0) {
                return sendResponse(res, 404, 'No books found with the provided IDs');
            }

            // Update the discount information for each book
            const updatedBooks = [];

            for (const book of books) {
                book.discountedPrice = discountedPrice;
                book.discountPercentage = discountPercentage;
                book.discountEndDate = discountEndDate;

                // Save the updated book and add it to the updatedBooks array
                const updatedBook = await book.save();
                updatedBooks.push(updatedBook);
            }

            const response = {
                message: 'Discount applied successfully to selected books',
                updatedBooks
            };

            return sendResponse(res, 200, response);
        } catch (error) {
            console.error(error);
            return sendResponse(res, 500, 'Internal server error');
        }
    }




}

module.exports = new BookController();
