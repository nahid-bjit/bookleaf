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
}

module.exports = new BookController();
