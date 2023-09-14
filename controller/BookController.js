
const { success, failure } = require("../util/common");
const BookModel = require("../model/Book");
const HTTP_STATUS = require("../constants/statusCodes")



class BookController {
    async getAll(req, res) {
        try {
            const books = await BookModel.find({});
            if (books.length > 0) {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(success("Successfully received all the books", { result: books, total: books.length }));
            }
            else return res.status(HTTP_STATUS.OK).send(success("No products were found"))
        } catch (error) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(failure("Internal server error"));
        }
    }
}

module.exports = new BookController();