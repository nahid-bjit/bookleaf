const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const CartModel = require("../model/Cart");
const BookModel = require("../model/Book");
const UserModel = require("../model/User");
const { sendResponse } = require("../util/common");
const Cart = require("../model/Cart");

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
            console.log("meow 1")
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                console.log("meow 2")
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Failed to add the book", validation);
            }

            // Retrieve the user ID from the JWT token
            const userId = req.user;
            console.log("user Id: ", userId)

            const user = await UserModel.findById(userId);
            console.log("user id: ", user)

            if (!user) {
                console.log("meow 3")
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User does not exist");
            }

            const { bookId, amount } = req.body;

            console.log("request body: ", bookId, amount)

            const cart = await CartModel.findOne({ user: userId });
            console.log("cart", cart)
            const book = await BookModel.findById(bookId);

            if (!book) {
                console.log("Book with ID was not found")
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book with ID was not found");
            }

            if (book.stock < amount) {
                console.log("Not enough books are in stock")
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
                    console.log("item added")
                    return sendResponse(res, HTTP_STATUS.OK, "Added item to existing cart", newCart);
                }
            }

            const bookIndex = cart.books.findIndex((element) => String(element.book) === bookId);
            if (bookIndex !== -1) {
                if (book.stock < cart.books[bookIndex].quantity + amount) {
                    console.log("Not enough books")
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
            // Handle the specific error
            if (error instanceof mongoose.Error.CastError) {
                // Handle the invalid ObjectId error
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, 'Invalid bookId', 'BookId must be a valid ObjectId');
            } else {
                // Handle other errors
                console.error(error); // Log the error for debugging
                return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal server error');
            }
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

            // Retrieve the user ID from the JWT token
            const userId = req.user;

            const user = await UserModel.findById(userId);

            if (!user) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "User does not exist");
            }

            const { bookId, amount } = req.body;

            const cart = await CartModel.findOne({ user: userId });

            if (!cart) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Cart was not found for this user");
            }

            const book = await BookModel.findById(bookId);

            if (!book) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Book with ID was not found");
            }

            const bookExistIndex = cart.books.findIndex((element) => String(element.book) === bookId);

            if (bookExistIndex === -1) {
                return sendResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, "Book was not found in cart");
            }

            if (cart.books[bookExistIndex].quantity < amount) {
                return sendResponse(
                    res,
                    HTTP_STATUS.UNPROCESSABLE_ENTITY,
                    "Book does not exist in the cart enough times"
                );
            }

            if (cart.books[bookExistIndex].quantity === amount) {
                cart.books.splice(bookExistIndex, 1);
                cart.total = cart.total - amount * book.price;
                await cart.save();
                return sendResponse(res, HTTP_STATUS.OK, "Book removed from cart", cart);
            }

            if (cart.books[bookExistIndex].quantity > amount) {
                cart.books[bookExistIndex].quantity -= amount;
                cart.total = cart.total - amount * book.price;
                await cart.save();
                return sendResponse(res, HTTP_STATUS.OK, "Book reduced in cart", cart);
            }
        } catch (error) {
            console.log(error);
            return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

}

module.exports = new CartController();
