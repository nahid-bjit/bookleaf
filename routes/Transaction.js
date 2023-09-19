const express = require("express");
const routes = express();
const { userValidator } = require("../middleware/validation");
const TransactionController = require("../controller/TransactionController");
const { isAuthenticated, isAdmin, isUser } = require("../middleware/auth");

routes.get("/all", isAuthenticated, isAdmin, TransactionController.getAll);
routes.get("/my-transaction", isAuthenticated, isUser, TransactionController.getById);
routes.post("/checkout", isAuthenticated, isUser, TransactionController.create);

module.exports = routes;
