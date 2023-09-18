const { sendResponse } = require("../util/common");
const BookModel = require("../model/Book");
const HTTP_STATUS = require("../constants/statusCodes");

class BookController {
    async getAll(req, res) {
        try {
            const books = await BookModel.find({});
            if (books.length > 0) {
                const response = {
                    result: books,
                    total: books.length
                };
                sendResponse(res, HTTP_STATUS.OK, "Successfully received all the books", response);
            } else {
                sendResponse(res, HTTP_STATUS.OK, "No products were found");
            }
        } catch (error) {
            sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    async getOneById(req, res) {
        try {
            const { id } = req.params;
            const user = await BookModel.findOne({ _id: id });

            if (user) {
                // Use sendResponse to send a success response
                sendResponse(res, HTTP_STATUS.OK, "Successfully received the user", user);
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
        try {
            // const validation = validationResult(req).array();
            // if (validation.length > 0) {
            //     // Use sendResponse to send an error response
            //     return sendResponse(res, HTTP_STATUS.OK, "Failed to add the product", validation);
            // }
            const { title, description, price, stock, brand } = req.body;

            const existingProduct = await BookModel.findOne({ title: title });

            if (existingProduct) {
                // Use sendResponse to send an error response
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book with same title already exists");
            }

            const newBook = await BookModel.create({
                title: title,
                description: description,
                price: price,
                stock: stock,
                brand: brand,
            });

            if (newBook) {
                // Use sendResponse to send a success response
                return sendResponse(res, HTTP_STATUS.OK, "Successfully added product", newBook);
            }
        } catch (error) {
            console.log(error);
            // Use sendResponse to send an error response
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

            // Attempt to update the document
            const result = await BookModel.updateOne({ _id: id }, { $set: updatedData });
            sendResponse(res, HTTP_STATUS.OK, "Successfully updated the product");

        } catch (error) {
            console.log("error: ", error);
            // Use sendResponse to send an error response
            sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }










}

module.exports = new BookController();
