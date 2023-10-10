const express = require("express");
const routes = express();
const { userValidator, productValidator, cartValidator } = require("../middleware/validation");
const { isAuthenticated, isAdmin, isUser } = require("../middleware/auth");
const CartController = require("../controller/CartController");

routes.get("/:userId", isAuthenticated, CartController.getCart);
routes.post("/add-product",
    isAuthenticated, isUser,
    cartValidator.addRemoveItemCart,
    CartController.addBookToCart
);
routes.patch(
    "/remove-product",
    isAuthenticated,
    cartValidator.addRemoveItemCart,
    CartController.removeBookFromCart
);

module.exports = routes;
