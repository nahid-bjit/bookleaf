const { sendResponse } = require("../util/common");
const TransactionModel = require("../model/Transaction");
const CartModel = require("../model/Cart");
const BookModel = require("../model/Book");
const HTTP_STATUS = require("../constants/statusCodes");
const UserModel = require("../model/User");

class TransactionController {
    async getAll(req, res) {
        try {
            const { detail } = req.query;
            let transactions;
            if (detail && detail != "1") {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Invalid parameter sent");
            }

            if (detail === "1") {
                transactions = await TransactionModel.find({})
                    .populate("user", "name email")
                    .populate("books.book", "title description price rating brand")
                    .select("-__v");
            } else {
                transactions = await TransactionModel.find({});
            }
            if (transactions.length > 0) {
                return sendResponse(res, HTTP_STATUS.OK, "Successfully received all transactions", {
                    result: transactions,
                    total: transactions.length,
                });
            }
            return sendResponse(res, HTTP_STATUS.OK, "No transactions were found");
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
    async getById(req, res) {
        try {

            const { detail } = req.query;
            let transactions;
            if (detail && detail != "1") {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Invalid parameter sent");
            }
            const user_id = req.user;
            console.log("user: ", user_id)
            if (detail === "1") {
                transactions = await TransactionModel.find({ _id: user_id })
                    .populate("user", "name email")
                    .populate("books.book", "title description price rating brand")
                    .select("-__v");
            } else {
                transactions = await TransactionModel.find({});
            }
            if (transactions.length > 0) {
                return sendResponse(res, HTTP_STATUS.OK, "Successfully received all transactions", {
                    result: transactions,
                    total: transactions.length,
                });
            }
            return sendResponse(res, HTTP_STATUS.OK, "No transactions were found");
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    async create(req, res) {
        try {
            // Retrieve the user's ID from the JWT token
            const userId = req.user;
            const { cartId } = req.body;

            // Retrieve the user's cart
            const cart = await CartModel.findOne({ _id: cartId, user: userId });

            if (!cart) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Cart was not found for this user");
            }

            if (cart.books.length === 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Please add books to the cart first");
            }

            // Calculate the total transaction amount
            const totalTransactionAmount = cart.total;

            // Find the user by their ID
            const user = await UserModel.findById(userId);

            if (!user) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User not found");
            }

            // Check if the user has sufficient balance
            if (user.balance >= totalTransactionAmount) {
                // Deduct the balance
                user.balance -= totalTransactionAmount;

                // Save the updated user
                await user.save();

                // Create a new transaction record
                const newTransaction = await TransactionModel.create({
                    books: cart.books,
                    user: userId,
                    total: totalTransactionAmount,
                });

                // Reduce the book stock for each book in the cart
                for (const cartItem of cart.books) {
                    const book = await BookModel.findById(cartItem.book);
                    if (book) {
                        book.stock -= cartItem.quantity;
                        await book.save();
                    }
                }

                // Reset the user's cart
                cart.books = [];
                cart.total = 0;
                await cart.save();

                return sendResponse(res, HTTP_STATUS.OK, "Transaction successful", newTransaction);
            } else {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Insufficient balance");
            }
        } catch (error) {
            console.error(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }




    // ## previous working code without the balance thing ##
    // async create(req, res) {
    //     try {
    //         const { userId, cartId } = req.body;
    //         const cart = await CartModel.findOne({ _id: cartId, user: userId });

    //         if (!cart) {
    //             return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Cart was not found for this user");
    //         }

    //         if (cart.books.length === 0) {
    //             return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Please add books to cart first");
    //         }

    //         const booksList = cart.books.map((element) => {
    //             return element.book;
    //         });

    //         const booksInCart = await BookModel.find({
    //             _id: {
    //                 $in: booksList,
    //             },
    //         });

    //         if (booksList.length !== booksInCart.length) {
    //             return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "All books in cart do not exist");
    //         }

    //         booksInCart.forEach((book) => {
    //             const bookFound = cart.books.findIndex(
    //                 (cartItem) => String(cartItem.book._id) === String(book._id)
    //             );
    //             if (book.stock < cart.books[bookFound].quantity) {
    //                 return sendResponse(
    //                     res,
    //                     HTTP_STATUS.NOT_FOUND,
    //                     "Unable to check out at this time, book does not exist"
    //                 );
    //             }
    //             book.stock -= cart.books[bookFound].quantity;
    //         });

    //         const bulk = [];
    //         booksInCart.map((element) => {
    //             bulk.push({
    //                 updateOne: {
    //                     filter: { _id: element },
    //                     update: { $set: { stock: element.stock } },
    //                 },
    //             });
    //         });

    //         const stockSave = await BookModel.bulkWrite(bulk);
    //         const newTransaction = await TransactionModel.create({
    //             books: cart.books,
    //             user: userId,
    //             total: cart.total,
    //         });

    //         cart.books = [];
    //         cart.total = 0;
    //         const cartSave = await cart.save();

    //         if (cartSave && stockSave && newTransaction) {
    //             return sendResponse(res, HTTP_STATUS.OK, "Successfully checked out!", newTransaction);
    //         }

    //         return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Something went wrong");
    //     } catch (error) {
    //         console.log(error);
    //         return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
    //     }
    // }
}

module.exports = new TransactionController();
