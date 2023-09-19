const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const CartModel = require("../model/Cart");
const BookModel = require("../model/Book");
const UserModel = require("../model/User");
const { sendResponse } = require("../util/common");

class CartController {
    async getCart(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserModel.findById({ _id: userId });
            if (!user) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User does not exist");
            }
            const cart = await CartModel.findOne({ user: userId }).populate("books.book");
            if (!cart) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Cart does not exist for user");
            }
            return sendResponse(res, HTTP_STATUS.OK, "Successfully got cart for user", cart);
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    async addBookToCart(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the book", validation);
            }

            const { userId, bookId, amount } = req.body;

            const user = await UserModel.findById({ _id: userId });

            if (!user) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User does not exist");
            }

            const cart = await CartModel.findOne({ user: userId });
            const book = await BookModel.findById({ _id: bookId });

            if (!book) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book with ID was not found");
            }

            if (book.stock < amount) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Not enough books are in stock");
            }

            // Check if the book has a valid discount
            if (book.discountPercentage > 0) {
                const currentDate = new Date();
                if (currentDate <= new Date(book.discountEndDate)) {
                    // Apply the discount to the book's price
                    book.price -= (book.price * book.discountPercentage) / 100;
                }
            }

            if (!cart) {
                const newCart = await CartModel.create({
                    user: userId,
                    books: [{ book: bookId, quantity: amount }],
                    total: book.price * amount,
                });

                if (newCart) {
                    return sendResponse(res, HTTP_STATUS.OK, "Added item to existing cart", newCart);
                }
            }

            const bookIndex = cart.books.findIndex((element) => String(element.book) === bookId);
            if (bookIndex !== -1) {
                if (book.stock < cart.books[bookIndex].quantity + amount) {
                    return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Not enough books are in stock");
                }
                cart.books[bookIndex].quantity += amount;
            } else {
                cart.books.push({ book: bookId, quantity: amount });
            }
            cart.total = cart.total + book.price * amount;

            await cart.save();
            return sendResponse(res, HTTP_STATUS.CREATED, "Added item to existing cart", cart);
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    // ## working code without the discount avail part ##
    // async addBookToCart(req, res) {
    //     try {
    //         const validation = validationResult(req).array();
    //         if (validation.length > 0) {
    //             return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the book", validation);
    //         }

    //         const { userId, bookId, amount } = req.body;

    //         const user = await UserModel.findById({ _id: userId });

    //         if (!user) {
    //             return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User does not exist");
    //         }

    //         const cart = await CartModel.findOne({ user: userId });
    //         const book = await BookModel.findById({ _id: bookId });

    //         if (!book) {
    //             return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book with ID was not found");
    //         }

    //         if (book.stock < amount) {
    //             return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Not enough books are in stock");
    //         }

    //         if (!cart) {
    //             const newCart = await CartModel.create({
    //                 user: userId,
    //                 books: [{ book: bookId, quantity: amount }],
    //                 total: book.price * amount,
    //             });

    //             if (newCart) {
    //                 return sendResponse(res, HTTP_STATUS.OK, "Added item to existing cart", newCart);
    //             }
    //         }

    //         const bookIndex = cart.books.findIndex((element) => String(element.book) === bookId);
    //         if (bookIndex !== -1) {
    //             if (book.stock < cart.books[bookIndex].quantity + amount) {
    //                 return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Not enough books are in stock");
    //             }
    //             cart.books[bookIndex].quantity += amount;
    //         } else {
    //             cart.books.push({ book: bookId, quantity: amount });
    //         }
    //         cart.total = cart.total + book.price * amount;

    //         await cart.save();
    //         return sendResponse(res, HTTP_STATUS.CREATED, "Added item to existing cart", cart);
    //     } catch (error) {
    //         console.log(error);
    //         return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
    //     }
    // }

    async removeBookFromCart(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to remove the book", validation);
            }

            const { userId, bookId, amount } = req.body;

            const user = await UserModel.findById({ _id: userId });

            if (!user) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User does not exist");
            }

            const cart = await CartModel.findOne({ user: userId });

            if (!cart) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Cart was not found for this user");
            }

            const book = await BookModel.findById({ _id: bookId });

            if (!book) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book with ID was not found");
            }

            const bookExistIntex = cart.books.findIndex((element) => String(element.book) === bookId);
            if (bookExistIntex === -1) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Book was not found in cart");
            }

            if (cart.books[bookExistIntex].quantity < amount) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    "Book does not exist in the cart enough times"
                );
            }

            if (cart.books[bookExistIntex].quantity === amount) {
                cart.books.splice(bookExistIntex, 1);
                cart.total = cart.total - amount * book.price;
                await cart.save();
                return sendResponse(res, HTTP_STATUS.OK, "book removed from cart", cart);
            }

            if (cart.books[bookExistIntex].quantity > amount) {
                cart.books[bookExistIntex].quantity -= amount;
                cart.total = cart.total - amount * book.price;
                await cart.save();
                return sendResponse(res, HTTP_STATUS.OK, "book reduced in cart", cart);
            }
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}

module.exports = new CartController();
