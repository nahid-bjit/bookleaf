const express = require("express");
const routes = express();
const { userValidator, bookValidator } = require("../middleware/validation");
const BookController = require("../controller/BookController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");


routes.get("/all", BookController.getAll);
//routes.post("/addBook", isAuthenticated, isAdmin, bookValidator.add, BookController.create);
routes.post("/add", isAuthenticated, isAdmin, BookController.create);
routes.delete("/delete/:id", isAuthenticated, isAdmin, BookController.deleteById)
routes.patch("/update/:id", BookController.updateById)


module.exports = routes;